"use client";

import { useLanguage } from "@/hooks/use-language";
import { SectionWrapper } from "@/components/section-wrapper";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t.howItWorks.title}
        </h2>
      </div>

      <div className="relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {t.howItWorks.steps.map((step, index) => (
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
    </SectionWrapper>
  );
}
