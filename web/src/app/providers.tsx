"use client";

import { LanguageProvider } from "@/hooks/use-language";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }): React.JSX.Element {
  // @ts-ignore - TypeScript inference issue with LanguageProvider
  return <LanguageProvider>{children}</LanguageProvider>;
}
