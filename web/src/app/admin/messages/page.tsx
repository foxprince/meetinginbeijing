'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminLogoutButton } from '@/components/admin/logout-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContactMessage, ContactMessageStatus } from '@/types/contact-message';

interface ContactMessagesResponse {
  messages: ContactMessage[];
}

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: '新留言',
  processing: '处理中',
  resolved: '已解决',
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMessages = async () => {
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('status', statusFilter);
      if (keyword.trim()) {
        params.set('keyword', keyword.trim());
      }

      const res = await fetch(`/api/admin/contact-messages?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || '加载留言失败');
      }

      const data = (await res.json()) as ContactMessagesResponse;
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load contact messages:', error);
      setErrorMessage(error instanceof Error ? error.message : '加载留言失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredMessages = useMemo(() => {
    if (!keyword.trim()) {
      return messages;
    }

    const lowerKeyword = keyword.toLowerCase();
    return messages.filter((item) => {
      return (
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.contact.toLowerCase().includes(lowerKeyword) ||
        item.message.toLowerCase().includes(lowerKeyword)
      );
    });
  }, [messages, keyword]);

  const updateMessage = async (
    id: number,
    payload: { status?: ContactMessageStatus; admin_note?: string }
  ) => {
    setSavingId(id);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || '更新留言失败');
      }

      const data = (await res.json()) as { message: ContactMessage };
      setMessages((prev) =>
        prev.map((item) => (item.id === id ? data.message : item))
      );
    } catch (error) {
      console.error('Failed to update message:', error);
      setErrorMessage(error instanceof Error ? error.message : '更新留言失败');
    } finally {
      setSavingId(null);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!window.confirm('确认删除这条留言吗？')) {
      return;
    }

    setSavingId(id);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || '删除留言失败');
      }

      setMessages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
      setErrorMessage(error instanceof Error ? error.message : '删除留言失败');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-slate-900">
              MeetingInBeijing
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Admin</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-900">留言管理</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/blog">
              <Button variant="outline" size="sm">
                Blog
              </Button>
            </Link>
            <Link href="/admin/cms">
              <Button variant="outline" size="sm">
                CMS
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                查看前台
              </Button>
            </Link>
            <AdminLogoutButton variant="outline" size="sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索姓名、联系方式、留言内容"
              className="max-w-md"
            />
            <Button type="button" variant="outline" onClick={fetchMessages}>
              刷新
            </Button>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: 'all' | ContactMessageStatus) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="按状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="new">新留言</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="resolved">已解决</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>服务需求</TableHead>
                <TableHead>留言内容</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>管理员备注</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                    暂无留言
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      <div>{item.name}</div>
                      {item.country && (
                        <div className="text-xs text-slate-500">{item.country}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{item.contact}</TableCell>
                    <TableCell className="max-w-[180px] text-sm text-slate-700">
                      <div>{item.service_type || '-'}</div>
                      <div className="text-xs text-slate-500">
                        期望日期：{item.preferred_date || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-slate-700">
                      {item.message}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value: ContactMessageStatus) =>
                          void updateMessage(item.id, { status: value })
                        }
                        disabled={savingId === item.id}
                      >
                        <SelectTrigger className="w-32 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">新留言</SelectItem>
                          <SelectItem value="processing">处理中</SelectItem>
                          <SelectItem value="resolved">已解决</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1 text-xs text-slate-500">
                        {STATUS_LABELS[item.status]}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[220px]">
                      <Textarea
                        value={item.admin_note || ''}
                        onChange={(event) => {
                          const nextNote = event.target.value;
                          setMessages((prev) =>
                            prev.map((message) =>
                              message.id === item.id
                                ? { ...message, admin_note: nextNote }
                                : message
                            )
                          );
                        }}
                        rows={3}
                        placeholder="填写跟进记录..."
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        disabled={savingId === item.id}
                        onClick={() =>
                          void updateMessage(item.id, {
                            admin_note: item.admin_note || '',
                          })
                        }
                      >
                        保存备注
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={savingId === item.id}
                        onClick={() => void deleteMessage(item.id)}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
