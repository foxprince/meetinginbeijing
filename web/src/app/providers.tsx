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

function getPreferredLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLang = window.localStorage.getItem("lang") as Language | null;
  if (savedLang === "en" || savedLang === "zh") {
    return savedLang;
  }

  return window.navigator.language.startsWith("zh") ? "zh" : "en";
}

function LanguageProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [lang, setLang] = useState<Language>(() => getPreferredLanguage());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedLang = window.localStorage.getItem("lang") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "zh") && savedLang !== lang) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(savedLang);
    }
  }, [lang]);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "zh" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = content[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
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
  return <LanguageProvider>{children}</LanguageProvider>;
}
