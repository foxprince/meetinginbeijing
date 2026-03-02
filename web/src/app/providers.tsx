"use client";

import { LanguageProvider } from "@/hooks/use-language";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }): React.JSX.Element {
  return <LanguageProvider>{children}</LanguageProvider> as React.JSX.Element;
}
