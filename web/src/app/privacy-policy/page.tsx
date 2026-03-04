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

        <p className="mb-6 text-sm text-slate-500">
          生效日期 / Effective Date: 2026-03-04
        </p>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 md:p-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              信息收集 / Information We Collect
            </h2>
            <p>
              当您通过网站表单、电话、微信、邮箱等方式联系我们时，我们可能收集姓名、
              联系方式、国家/地区、服务需求（如翻译、商务陪同、就医陪同）及您主动提供
              的其他信息。
            </p>
            <p>
              When you contact us via the website form, phone, WeChat, or
              email, we may collect your name, contact details, country/region,
              service requirements (such as interpretation, business assistance,
              and medical assistance), and other information you voluntarily
              provide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              用途说明 / How We Use Information
            </h2>
            <p>
              您的信息用于回应咨询、沟通服务细节、报价、安排及交付服务，并用于必要的
              售后跟进和服务质量改进。
            </p>
            <p>
              Your information is used to respond to inquiries, communicate
              service details, provide quotes, arrange and deliver services,
              provide after-service follow-up, and improve service quality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              信息共享 / Information Sharing
            </h2>
            <p>
              我们不会出售您的个人信息。仅在提供服务所必需或法律法规要求的情况下，才会
              向必要合作方或有权机关披露最少必要信息。
            </p>
            <p>
              We do not sell your personal information. We only share the
              minimum necessary information when required to deliver services or
              when required by applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              数据安全与保留 / Data Security and Retention
            </h2>
            <p>
              我们采取合理的技术和管理措施保护信息安全，并在实现本政策所述目的所需期限
              内保存数据，或按法律要求保留。
            </p>
            <p>
              We apply reasonable technical and organizational measures to
              protect your data, and retain it only as long as necessary for the
              purposes described in this policy or as required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              您的权利 / Your Rights
            </h2>
            <p>
              在适用法律允许范围内，您可请求访问、更正、删除您的个人信息，或撤回同意。
            </p>
            <p>
              Subject to applicable law, you may request access, correction, or
              deletion of your personal information, or withdraw consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              联系我们 / Contact Us
            </h2>
            <p>如有隐私相关问题，请联系我们。</p>
            <p>For privacy-related questions, please contact us.</p>
            <p>电话 / Phone: 86-19910329598</p>
            <p>邮箱 / Email: wowangww@vip.163.com</p>
            <p>微信 / WeChat: jane-cnba</p>
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
