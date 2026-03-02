"use client";

import { LanguageProvider } from "@/hooks/use-language";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
