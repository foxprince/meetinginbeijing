"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { useCmsSection } from "@/hooks/use-cms-section";
import { useAdminSession } from "@/hooks/use-admin-session";
import { EditableText } from "@/components/cms/editable-text";
import { Globe } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, toggleLanguage, t } = useLanguage();
  const isAdmin = useAdminSession();
  const isHomePage = pathname === '/';
  const cmsFallback = {
    brand_title: "MeetingInBeijing",
    brand_subtitle: "Your Beijing Companion",
    cta_text: t.nav.cta,
  };

  const [cmsContent, setCmsContent] = React.useState<Record<string, unknown>>(cmsFallback);
  const [mounted, setMounted] = React.useState(false);
  const fetchedContent = useCmsSection("navbar", lang, cmsFallback);

  React.useEffect(() => {
    setMounted(true);
    setCmsContent(fetchedContent);
  }, [fetchedContent]);
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

  const handleSave = async (field: string, value: string) => {
    const newContent = { ...cmsContent, [field]: value };

    const res = await fetch('/api/admin/cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section_key: 'navbar',
        locale: lang,
        content: newContent,
      }),
    });

    if (!res.ok) throw new Error('保存失败');

    const publishRes = await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_key: 'navbar' }),
    });

    if (!publishRes.ok) throw new Error('发布失败');

    setCmsContent(newContent);
  };

  const handleLanguageToggle = () => {
    const nextLang = lang === "en" ? "zh" : "en";
    toggleLanguage();

    if (pathname.startsWith("/blog")) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("lang", nextLang);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    } else {
      router.refresh();
    }
  };

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
            {isAdmin ? (
              <EditableText
                value={brandTitle}
                onSave={(v) => handleSave('brand_title', v)}
                as="span"
                className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900"
              />
            ) : (
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
                {brandTitle}
              </span>
            )}
            {isAdmin ? (
              <EditableText
                value={brandSubtitle}
                onSave={(v) => handleSave('brand_subtitle', v)}
                as="span"
                className="text-sm sm:text-base text-slate-500"
              />
            ) : (
              <span className="text-sm sm:text-base text-slate-500">
                {brandSubtitle}
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {mounted && (
            <>
              <Link href={isHomePage ? "#about" : "/#about"} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.about}
              </Link>
              <Link href={isHomePage ? "#services" : "/#services"} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.services}
              </Link>
              <Link href={isHomePage ? "#how-it-works" : "/#how-it-works"} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.howItWorks}
              </Link>
              <Link href={`/blog?lang=${lang}`} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.blog}
              </Link>
              <Link href={isHomePage ? "#contact" : "/#contact"} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.contact}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>{mounted ? (lang === "en" ? "中文" : "EN") : "中文"}</span>
          </Button>
          {mounted && (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white hidden sm:flex">
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
