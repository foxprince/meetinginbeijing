"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { useCmsSection } from "@/hooks/use-cms-section";
import { EditableSection } from "@/components/cms/editable-section";

export function HowItWorks() {
  const { lang, t } = useLanguage();
  const cmsFallback = {
    title: t.howItWorks.title,
    steps: t.howItWorks.steps,
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("how_it_works", lang, cmsFallback);

  React.useEffect(() => {
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  
  const stepsRaw = cmsContent.steps;
  const steps = Array.isArray(stepsRaw)
    ? stepsRaw.filter((step): step is { title: string; description: string } => 
        typeof step === "object" && step !== null && "title" in step && "description" in step
      )
    : t.howItWorks.steps;

  return (
    <SectionWrapper id="how-it-works">
      <EditableSection
        sectionKey="how_it_works"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 How It Works"
      >
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
      </div>

      <div className="relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-primary/20">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-slate-600 text-center text-sm leading-relaxed px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      </EditableSection>
    </SectionWrapper>
  );
}
