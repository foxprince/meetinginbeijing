"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export function Pricing() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="pricing" dark>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t.pricing.title}
        </h2>
        <p className="text-slate-500 italic">
          {t.pricing.disclaimer}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {t.pricing.items.map((item: { title: string; price: string; note: string }, index: number) => (
          <Card key={index} className="border-2 border-slate-100 shadow-sm hover:border-primary transition-colors">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-slate-700">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary mb-4">
                {item.price}
              </div>
              <p className="text-slate-600 text-sm mb-6">
                {item.note}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
                <Check className="h-4 w-4" />
                <span>Transparent & No hidden fees</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
