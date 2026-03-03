"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { useCmsSection } from "@/hooks/use-cms-section";
import { EditableSection } from "@/components/cms/editable-section";
import { CheckCircle2 } from "lucide-react";

export function WhyChooseMe() {
  const { lang, t } = useLanguage();
  const cmsFallback = {
    title: t.whyChooseMe.title,
    items: t.whyChooseMe.items,
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("why_choose_me", lang, cmsFallback);

  React.useEffect(() => {
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  
  const itemsRaw = cmsContent.items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.filter((item): item is string => typeof item === "string")
    : t.whyChooseMe.items;

  return (
    <SectionWrapper id="why-choose-me">
      <EditableSection
        sectionKey="why_choose_me"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 Why Choose Me"
      >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
            {title}
          </h2>
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-1 bg-secondary p-1 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg text-slate-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-100 rounded-3xl aspect-video md:aspect-square flex items-center justify-center text-slate-400 border-4 border-white shadow-xl">
          [ Professional Beijing Context Image ]
        </div>
      </div>
      </EditableSection>
    </SectionWrapper>
  );
}

export function Testimonials() {
  const { lang, t } = useLanguage();
  const cmsFallback = {
    title: t.testimonials.title,
    items: t.testimonials.items,
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("testimonials", lang, cmsFallback);

  React.useEffect(() => {
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  
  const itemsRaw = cmsContent.items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.filter((item): item is { text: string; author: string; country: string } => 
        typeof item === "object" && item !== null && "text" in item && "author" in item && "country" in item
      )
    : t.testimonials.items;

  return (
    <SectionWrapper id="testimonials" dark>
      <EditableSection
        sectionKey="testimonials"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 Testimonials"
      >
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
            <div className="text-4xl text-secondary absolute top-4 left-4 font-serif">"</div>
            <p className="text-lg text-slate-700 italic mb-6 relative z-10 leading-relaxed">
              {item.text}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                {item.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{item.author}</p>
                <p className="text-sm text-slate-500">{item.country}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </EditableSection>
    </SectionWrapper>
  );
}
