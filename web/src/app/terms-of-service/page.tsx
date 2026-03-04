import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { LegalPageContentView } from "@/components/legal/legal-page-content";
import { TERMS_OF_SERVICE_DEFAULTS } from "@/lib/legal-content";

export const metadata = {
  title: "Terms of Service | MeetingInBeijing",
  description: "Terms of service for MeetingInBeijing.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-lg">
            <div className="h-28 w-full" />
          </nav>
        }
      >
        <Navbar />
      </Suspense>
      <LegalPageContentView
        sectionKey="terms_of_service"
        fallback={TERMS_OF_SERVICE_DEFAULTS}
      />
    </main>
  );
}
