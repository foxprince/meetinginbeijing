"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full">
              {t.hero.primaryCTA}
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 rounded-full">
              {t.hero.secondaryCTA}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            {t.hero.trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-500 font-medium">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg md:max-w-none">
          <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative border-8 border-white shadow-2xl">
            {/* Placeholder for professional photo */}
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium bg-gradient-to-br from-slate-100 to-slate-200">
               [ Professional Portrait Image ]
            </div>
            
            {/* Floating elements for visual interest */}
            <div className="absolute top-8 -right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.hero.badges.responseTime}</p>
                  <p className="text-[10px] text-slate-500">{t.hero.badges.fastReliable}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-60" />
          <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60" />
        </div>
      </div>
    </section>
  );
}
