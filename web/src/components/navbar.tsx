"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { useCmsSection } from "@/hooks/use-cms-section";
import { Globe } from "lucide-react";

export function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const cmsFallback = {
    brand_title: "MeetingInBeijing",
    brand_subtitle: "Your Beijing Companion",
    cta_text: t.nav.cta,
  };

  const cmsContent = useCmsSection("navbar", lang, cmsFallback);
  const brandTitle =
    typeof cmsContent.brand_title === "string"
      ? cmsContent.brand_title
      : cmsFallback.brand_title;
  const brandSubtitle =
    typeof cmsContent.brand_subtitle === "string"
      ? cmsContent.brand_subtitle
      : cmsFallback.brand_subtitle;
  const ctaText =
    typeof cmsContent.cta_text === "string"
      ? cmsContent.cta_text
      : cmsFallback.cta_text;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex h-28 items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <img
              src="/images/JaneInBeijing-logo.png"
              alt="Meeting In Beijing Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
              {brandTitle}
            </span>
            <span className="text-sm sm:text-base text-slate-500">
              {brandSubtitle}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
            {t.nav.about}
          </a>
          <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
            {t.nav.services}
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            {t.nav.howItWorks}
          </a>
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
            {t.nav.blog}
          </Link>
          <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
            {t.nav.contact}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === "en" ? "中文" : "EN"}</span>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white hidden sm:flex">
            {ctaText}
          </Button>
        </div>
      </div>
    </nav>
  );
}
