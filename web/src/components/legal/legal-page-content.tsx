"use client";

import Link from "next/link";
import { useLanguage } from "@/app/providers";
import { useCmsSection } from "@/hooks/use-cms-section";
import { CmsSectionKey } from "@/types/cms";
import { LegalPageContent } from "@/lib/legal-content";

interface LegalPageContentProps {
  sectionKey: CmsSectionKey;
  fallback: Record<"en" | "zh", LegalPageContent>;
}

function normalizeLegalPageContent(
  value: Record<string, unknown>,
  fallback: LegalPageContent
): LegalPageContent {
  const title =
    typeof value.title === "string" && value.title.trim()
      ? value.title
      : fallback.title;
  const effectiveDate =
    typeof value.effective_date === "string" && value.effective_date.trim()
      ? value.effective_date
      : fallback.effective_date;
  const backToHome =
    typeof value.back_to_home === "string" && value.back_to_home.trim()
      ? value.back_to_home
      : fallback.back_to_home;

  const sections = Array.isArray(value.sections)
    ? value.sections
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const entry = item as Record<string, unknown>;
          const sectionTitle =
            typeof entry.title === "string" && entry.title.trim()
              ? entry.title
              : "";
          const paragraphs = Array.isArray(entry.paragraphs)
            ? entry.paragraphs.filter(
                (paragraph): paragraph is string =>
                  typeof paragraph === "string" && paragraph.trim().length > 0
              )
            : [];

          if (!sectionTitle || paragraphs.length === 0) {
            return null;
          }

          return {
            title: sectionTitle,
            paragraphs,
          };
        })
        .filter(
          (
            section
          ): section is {
            title: string;
            paragraphs: string[];
          } => Boolean(section)
        )
    : [];

  return {
    title,
    effective_date: effectiveDate,
    sections: sections.length > 0 ? sections : fallback.sections,
    back_to_home: backToHome,
  };
}

export function LegalPageContentView({
  sectionKey,
  fallback,
}: LegalPageContentProps) {
  const { lang } = useLanguage();
  const cmsContent = useCmsSection(
    sectionKey,
    lang,
    fallback[lang] as unknown as Record<string, unknown>
  );
  const pageContent = normalizeLegalPageContent(cmsContent, fallback[lang]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
        {pageContent.title}
      </h1>

      <p className="mb-6 text-sm text-slate-500">{pageContent.effective_date}</p>

      <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 md:p-8">
        {pageContent.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          {pageContent.back_to_home}
        </Link>
      </div>
    </section>
  );
}
