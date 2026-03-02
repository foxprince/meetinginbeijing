import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}

export function SectionWrapper({ children, className, id, dark }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24 px-6 md:px-12",
        dark ? "bg-slate-50" : "bg-white",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
