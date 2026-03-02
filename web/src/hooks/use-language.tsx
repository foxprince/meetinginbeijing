"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { content } from "@/config/content";

type Language = keyof typeof content; // "en" | "zh"

type ContentMap = typeof content;

interface LanguageContextProps {
  lang: Language;
  toggleLanguage: () => void;
  t: ContentMap[Language];
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "zh")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(savedLang);
    } else if (navigator.language.startsWith("zh")) {
      setLang("zh");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "zh" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = content[lang];

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, toggleLanguage, t } },
    children
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
