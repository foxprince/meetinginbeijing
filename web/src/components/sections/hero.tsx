"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { useCmsSection } from "@/hooks/use-cms-section";
import { EditableSection } from "@/components/cms/editable-section";
import { EditableImage } from "@/components/cms/editable-image";
import { CheckCircle2 } from "lucide-react";

export function Hero() {
  const { lang, t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);
  const cmsFallback = {
    title: t.hero.title,
    subtitle: t.hero.subtitle,
    trustPoints: t.hero.trustPoints,
    badges: t.hero.badges,
    imageUrl: '',
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("hero", lang, cmsFallback);

  React.useEffect(() => {
    setMounted(true);
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  const subtitle = typeof cmsContent.subtitle === "string" ? cmsContent.subtitle : cmsFallback.subtitle;
  
  const trustPointsRaw = cmsContent.trustPoints;
  const trustPoints = Array.isArray(trustPointsRaw) 
    ? trustPointsRaw.filter((p): p is string => typeof p === "string")
    : t.hero.trustPoints;

  const badgesRaw = cmsContent.badges;
  const badges = typeof badgesRaw === "object" && badgesRaw !== null
    ? badgesRaw as { responseTime?: string; fastReliable?: string }
    : t.hero.badges;

  const imageUrl = typeof cmsContent.imageUrl === "string" ? cmsContent.imageUrl : '';

  const handleImageSave = async (newImageUrl: string) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: 'hero',
          locale: lang,
          content: { ...cmsContent, imageUrl: newImageUrl },
        }),
      });

      if (!res.ok) throw new Error('保存失败');

      const publishRes = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: 'hero' }),
      });

      if (!publishRes.ok) throw new Error('发布失败');

      setCmsContent({ ...cmsContent, imageUrl: newImageUrl });
    } catch (error) {
      console.error('保存图片失败:', error);
      throw error;
    }
  };

  if (!mounted) {
    return <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-6 md:px-12"><div className="h-96" /></section>;
  }

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-6 md:px-12">
      <EditableSection
        sectionKey="hero"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 Hero 区块"
      >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            {subtitle}
          </p>
          
          <div className="mb-10" />

          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-500 font-medium">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg md:max-w-none">
          <div className="relative border-8 border-white shadow-2xl rounded-3xl overflow-hidden">
            <EditableImage
              currentImageUrl={imageUrl}
              onSave={handleImageSave}
              alt="Professional Portrait"
              aspectRatio="square"
            />
            
            {/* Floating elements for visual interest */}
            <div className="absolute top-8 -right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{badges.responseTime || t.hero.badges.responseTime}</p>
                  <p className="text-[10px] text-slate-500">{badges.fastReliable || t.hero.badges.fastReliable}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-60" />
          <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60" />
        </div>
      </div>
      </EditableSection>
    </section>
  );
}
