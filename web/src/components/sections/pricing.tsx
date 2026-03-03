"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCmsSection } from "@/hooks/use-cms-section";
import { Check } from "lucide-react";

export function Pricing() {
  const { lang, t } = useLanguage();
  const fallbackItems = t.pricing.items as {
    title: string;
    price: string;
    note: string;
  }[];

  const cmsFallback = {
    title: t.pricing.title,
    disclaimer: t.pricing.disclaimer,
    items: fallbackItems,
    transparent_text:
      lang === "zh" ? "透明收费，无隐藏费用" : "Transparent & No hidden fees",
  };

  const cmsContent = useCmsSection("pricing", lang, cmsFallback);
  const cmsItemsRaw = cmsContent.items;
  const cmsItems = Array.isArray(cmsItemsRaw)
    ? cmsItemsRaw
        .filter((item) => !!item && typeof item === "object")
        .map((item) => item as { title?: string; price?: string; note?: string })
    : [];

  const title =
    typeof cmsContent.title === "string"
      ? cmsContent.title
      : cmsFallback.title;
  const disclaimer =
    typeof cmsContent.disclaimer === "string"
      ? cmsContent.disclaimer
      : cmsFallback.disclaimer;
  const transparentText =
    typeof cmsContent.transparent_text === "string"
      ? cmsContent.transparent_text
      : cmsFallback.transparent_text;

  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => ({
          title:
            typeof item.title === "string" && item.title.trim().length > 0
              ? item.title
              : fallbackItems[index]?.title || "",
          price:
            typeof item.price === "string" && item.price.trim().length > 0
              ? item.price
              : fallbackItems[index]?.price || "",
          note:
            typeof item.note === "string" && item.note.trim().length > 0
              ? item.note
              : fallbackItems[index]?.note || "",
        }))
      : fallbackItems;

  return (
    <SectionWrapper id="pricing" dark>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
        <p className="text-slate-500 italic">
          {disclaimer}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {items.map((item, index: number) => (
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
                <span>{transparentText}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
