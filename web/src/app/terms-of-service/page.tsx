import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

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
      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
        <h1 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
          Terms of Service / 服务条款
        </h1>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 md:p-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">付款方式 / Payment Methods</h2>
            <p>
              我们接受的付款方式有：美元现金、人民币现金、Wise、Avosend、微信支付、
              支付宝、人民币银行转账。
            </p>
            <p>
              Payment methods accepted: Cash in USD, Cash in CNY, Wise,
              Avosend, WeChat Pay, AliPay, and RMB bank transfer.
            </p>
            <p className="font-medium text-slate-900">
              如客户仅提供 PayPal 等未列出的方式，我们有权拒绝接单。
            </p>
            <p className="font-medium text-slate-900">
              If a client can only pay via PayPal or any unsupported payment
              method, we reserve the right to decline the order.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">联系方式 / Contact</h2>
            <p>电话：86-19910329598</p>
            <p>Phone: 86-19910329598</p>
            <p>
              如有订单、付款或服务范围相关问题，请通过以上电话、邮箱或微信联系我们。
            </p>
            <p>
              For questions about orders, payment, or service scope, please
              contact us via phone, email, or WeChat.
            </p>
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
