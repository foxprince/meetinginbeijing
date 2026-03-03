"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { content } from "@/config/content";

type Language = keyof typeof content; // "en" | "zh"

type ContentMap = typeof content;

interface LanguageContextProps {
  lang: Language;
  toggleLanguage: () => void;
  t: ContentMap[Language];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLang = localStorage.getItem("lang");
  if (savedLang === "en" || savedLang === "zh") {
    return savedLang;
  }

  if (typeof navigator !== "undefined" && navigator.language?.startsWith("zh")) {
    return "zh";
  }

  return "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => getInitialLanguage());

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
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
