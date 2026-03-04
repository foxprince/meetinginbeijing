import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { LegalPageContentView } from "@/components/legal/legal-page-content";
import { PRIVACY_POLICY_DEFAULTS } from "@/lib/legal-content";

export const metadata = {
  title: "Privacy Policy | MeetingInBeijing",
  description: "Privacy policy for MeetingInBeijing.",
};

export default function PrivacyPolicyPage() {
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
        sectionKey="privacy_policy"
        fallback={PRIVACY_POLICY_DEFAULTS}
      />
    </main>
  );
}
