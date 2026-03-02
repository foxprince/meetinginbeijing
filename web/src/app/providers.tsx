"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { content } from "@/config/content";

type Language = keyof typeof content;
type ContentMap = typeof content;

interface LanguageContextProps {
  lang: Language;
  toggleLanguage: () => void;
  t: ContentMap[Language];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

function LanguageProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "zh")) {
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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }): React.JSX.Element {
  return React.createElement(LanguageProvider, { children });
}
