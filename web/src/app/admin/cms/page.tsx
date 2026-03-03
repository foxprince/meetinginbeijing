'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CMS_SECTION_KEYS, CmsSectionKey, CmsSectionRow } from '@/types/cms';

interface CmsApiResponse {
  sections: CmsSectionRow[];
}

const SECTION_LABELS: Record<CmsSectionKey, string> = {
  navbar: '导航栏',
  who_i_help: 'Who I Help 区块',
  pricing: 'Pricing 区块',
};

function safeParseJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    throw new Error('JSON 格式不正确');
  }
}

function prettyJson(value: Record<string, unknown>): string {
  return JSON.stringify(value || {}, null, 2);
}

export default function AdminCmsPage() {
  const [sections, setSections] = useState<CmsSectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeSection, setActiveSection] = useState<CmsSectionKey>('navbar');
  const [draftEn, setDraftEn] = useState('{}');
  const [draftZh, setDraftZh] = useState('{}');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentSection = useMemo(
    () => sections.find((item) => item.section_key === activeSection),
    [sections, activeSection]
  );

  useEffect(() => {
    async function loadSections() {
      try {
        const res = await fetch('/api/admin/cms', {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('加载 CMS 数据失败');
        }

        const data = (await res.json()) as CmsApiResponse;
        setSections(data.sections || []);
      } catch (error) {
        console.error(error);
        setErrorMessage('加载 CMS 数据失败');
      } finally {
        setLoading(false);
      }
    }

    loadSections();
  }, []);

  useEffect(() => {
    if (!currentSection) {
      setDraftEn('{}');
      setDraftZh('{}');
      return;
    }

    setDraftEn(prettyJson(currentSection.draft_content_en));
    setDraftZh(prettyJson(currentSection.draft_content_zh));
  }, [currentSection]);

  const refreshSections = async () => {
    const res = await fetch('/api/admin/cms', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('刷新 CMS 数据失败');
    }

    const data = (await res.json()) as CmsApiResponse;
    setSections(data.sections || []);
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const contentEn = safeParseJson(draftEn);
      const contentZh = safeParseJson(draftZh);

      const enRes = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: activeSection,
          locale: 'en',
          content: contentEn,
        }),
      });

      if (!enRes.ok) {
        throw new Error('保存英文草稿失败');
      }

      const zhRes = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: activeSection,
          locale: 'zh',
          content: contentZh,
        }),
      });

      if (!zhRes.ok) {
        throw new Error('保存中文草稿失败');
      }

      await refreshSections();
      setSuccessMessage('草稿已保存');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : '保存草稿失败');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    try {
      setPublishing(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: activeSection }),
      });

      if (!res.ok) {
        throw new Error('发布失败');
      }

      await refreshSections();
      setSuccessMessage('已发布到前台');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-slate-900">
              MeetingInBeijing
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Admin</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-900">CMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/blog">
              <Button variant="outline" size="sm">
                Blog 管理
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                查看前台
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>可编辑区块</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CMS_SECTION_KEYS.map((sectionKey) => {
              const section = sections.find((item) => item.section_key === sectionKey);
              const isActive = activeSection === sectionKey;

              return (
                <button
                  key={sectionKey}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveSection(sectionKey)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">
                      {SECTION_LABELS[sectionKey]}
                    </span>
                    <span className="text-xs border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                      {section?.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {SECTION_LABELS[activeSection]}（JSON 编辑）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-slate-500">加载中...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cms-en">英文草稿（draft_content_en）</Label>
                  <Textarea
                    id="cms-en"
                    rows={14}
                    value={draftEn}
                    onChange={(event) => setDraftEn(event.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cms-zh">中文草稿（draft_content_zh）</Label>
                  <Textarea
                    id="cms-zh"
                    rows={14}
                    value={draftZh}
                    onChange={(event) => setDraftZh(event.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={saveDraft}
                    disabled={saving || publishing}
                  >
                    {saving ? '保存中...' : '保存草稿'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={publish}
                    disabled={saving || publishing}
                  >
                    {publishing ? '发布中...' : '发布到前台'}
                  </Button>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600">{successMessage}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
