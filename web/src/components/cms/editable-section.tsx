'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminSession } from '@/hooks/use-admin-session';
import { CmsSectionKey } from '@/types/cms';

interface EditableSectionProps {
  sectionKey: CmsSectionKey;
  locale: 'en' | 'zh';
  currentContent: Record<string, unknown>;
  onSave: () => void;
  children: React.ReactNode;
  editLabel?: string;
}

export function EditableSection({
  sectionKey,
  locale,
  currentContent,
  onSave,
  children,
  editLabel = '编辑区块',
}: EditableSectionProps) {
  const isAdmin = useAdminSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>(currentContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: sectionKey,
          locale,
          content: formData,
        }),
      });

      if (!res.ok) {
        throw new Error('保存失败');
      }

      const publishRes = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: sectionKey }),
      });

      if (!publishRes.ok) {
        throw new Error('发布失败');
      }

      setIsEditing(false);
      onSave();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key: string, value: unknown) => {
    if (typeof value === 'string') {
      const isLongText = value.length > 100;
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{key}</Label>
          {isLongText ? (
            <Textarea
              id={key}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              rows={4}
            />
          ) : (
            <Input
              id={key}
              value={value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="space-y-2">
          <Label>{key} (列表)</Label>
          <div className="space-y-4 border rounded-lg p-4">
            {value.map((item, index) => {
              if (typeof item === 'object' && item !== null) {
                return (
                  <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
                    <div className="font-medium text-sm text-slate-600">项目 {index + 1}</div>
                    {Object.entries(item as Record<string, unknown>).map(([subKey, subValue]) => {
                      if (typeof subValue === 'string') {
                        return (
                          <div key={subKey} className="space-y-1">
                            <Label className="text-xs">{subKey}</Label>
                            <Input
                              value={subValue}
                              onChange={(e) => {
                                const newItems = [...value];
                                newItems[index] = {
                                  ...(newItems[index] as Record<string, unknown>),
                                  [subKey]: e.target.value,
                                };
                                setFormData((prev) => ({ ...prev, [key]: newItems }));
                              }}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFormData(currentContent);
          setIsEditing(true);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
      >
        <Pencil className="w-4 h-4 mr-2" />
        {editLabel}
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(formData).map(([key, value]) => renderField(key, value))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存并发布'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
