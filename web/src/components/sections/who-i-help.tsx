"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { SectionWrapper } from "@/components/section-wrapper";
import { Users, Stethoscope, Home } from "lucide-react";

const helpIcons = [
  <Users key="business" className="h-10 w-10 text-primary" />,
  <Stethoscope key="medical" className="h-10 w-10 text-primary" />,
  <Home key="expat" className="h-10 w-10 text-primary" />,
];

export function WhoIHelp() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="about">
      <div className="flex flex-col items-center gap-10 mb-16">
        <div className="w-full overflow-auto">
          <img
            src="/images/JaneInBeijing-logo.png"
            alt="MeetingInBeijing logo"
            width={1024}
            height={1024}
            className="max-w-none"
          />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t.whoIHelp.title}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t.whoIHelp.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {t.whoIHelp.items.map((item: { title: string; description: string }, index: number) => (
          <div key={index} className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6 p-4 bg-secondary rounded-full">
              {helpIcons[index]}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
            <p className="text-slate-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
