"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { useCmsSection } from "@/hooks/use-cms-section";
import { EditableSection } from "@/components/cms/editable-section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CheckCircle2, MessageSquare, Mail } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 md:px-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-bold text-xl text-white">MeetingInBeijing</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            {t.hero.subtitle}
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">{t.nav.services}</h4>
          <ul className="space-y-3 text-sm">
            {t.services.items.slice(0, 4).map((item, i) => (
              <li key={i}><a href="#services" className="hover:text-accent transition-colors">{item.title}</a></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">{t.nav.contact}</h4>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-accent" />
              <span>{t.contact?.email || "wowangww@vip.163.com"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-accent" />
              <span>WeChat: {t.contact?.wechat || "jane-cnba"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-accent">📍</span>
              <span>{t.contact?.location || "Beijing, China"}</span>
            </div>
            <div className="pt-4">
              <p className="text-xs uppercase tracking-wide text-accent mb-2">
                {t.contact?.wechat || "WeChat"}
              </p>
              <div className="w-32 h-32 bg-white rounded-lg p-2">
                <Image
                  src="/images/微信二维码-220x300.jpg"
                  alt="WeChat QR"
                  width={220}
                  height={300}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 MeetingInBeijing. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export function FAQ() {
  const { lang, t } = useLanguage();
  const cmsFallback = {
    title: t.faq.title,
    items: t.faq.items,
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("faq", lang, cmsFallback);

  React.useEffect(() => {
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  
  const itemsRaw = cmsContent.items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.filter((item): item is { q: string; a: string } => 
        typeof item === "object" && item !== null && "q" in item && "a" in item
      )
    : t.faq.items;

  return (
    <SectionWrapper id="faq">
      <EditableSection
        sectionKey="faq"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 FAQ"
      >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="text-slate-600">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      </EditableSection>
    </SectionWrapper>
  );
}

export function FinalCTA() {
  const { lang, t } = useLanguage();
  const cmsFallback = {
    title: t.finalCTA.title,
    subtitle: t.finalCTA.subtitle,
    primary: t.finalCTA.primary,
    secondary: t.finalCTA.secondary,
  };
  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const fetchedContent = useCmsSection("final_cta", lang, cmsFallback);

  React.useEffect(() => {
    setCmsContent(fetchedContent);
  }, [fetchedContent]);

  const title = typeof cmsContent.title === "string" ? cmsContent.title : cmsFallback.title;
  const subtitle = typeof cmsContent.subtitle === "string" ? cmsContent.subtitle : cmsFallback.subtitle;
  const primary = typeof cmsContent.primary === "string" ? cmsContent.primary : cmsFallback.primary;
  const secondary = typeof cmsContent.secondary === "string" ? cmsContent.secondary : cmsFallback.secondary;

  return (
    <SectionWrapper className="bg-primary text-white text-center py-20">
      <EditableSection
        sectionKey="final_cta"
        locale={lang}
        currentContent={cmsContent}
        onSave={() => setCmsContent(fetchedContent)}
        editLabel="编辑 Final CTA"
      >
      <h2 className="text-3xl md:text-5xl font-bold mb-6">{title}</h2>
      <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">{subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-7 text-lg rounded-full">
          {primary}
        </Button>
        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-lg rounded-full">
          {secondary}
        </Button>
      </div>
      </EditableSection>
    </SectionWrapper>
  );
}
