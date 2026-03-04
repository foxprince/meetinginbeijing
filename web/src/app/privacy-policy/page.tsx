import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

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

      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
          Privacy Policy / 隐私政策
        </h1>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 md:p-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">信息收集 / Information We Collect</h2>
            <p>
              我们收集包括姓名、联系方式在内的个人信息，用于处理订单及提供服务。
            </p>
            <p>
              We collect personal information including name and contact
              details to process orders and provide services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">用途说明 / How We Use Information</h2>
            <p>
              您提供的信息仅用于沟通、订单处理、服务交付及必要的售后支持。
            </p>
            <p>
              Your information is used only for communication, order
              processing, service delivery, and necessary after-sales support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">联系我们 / Contact Us</h2>
            <p>如有隐私相关问题，请与我们联系。</p>
            <p>For privacy questions, please contact us.</p>
            <p>电话 / Phone: 86-19910329598</p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
