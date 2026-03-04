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

        <p className="mb-6 text-sm text-slate-500">
          生效日期 / Effective Date: 2026-03-04
        </p>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 md:p-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              服务内容 / Services
            </h2>
            <p>
              我们提供北京本地协助服务，包括但不限于商务陪同、翻译沟通支持、就医陪同、
              行程与生活协助。具体服务范围以双方确认内容为准。
            </p>
            <p>
              We provide local assistance services in Beijing, including but
              not limited to business assistance, interpretation support,
              medical visit assistance, and itinerary support. Final scope is
              subject to mutual confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              预约与沟通 / Booking and Communication
            </h2>
            <p>
              客户需提供真实、准确、完整的信息（姓名、联系方式、需求与时间安排）。
              信息不完整或无法联系可能影响服务安排。
            </p>
            <p>
              Clients should provide accurate and complete information,
              including name, contact details, service requirements, and
              schedule. Incomplete or unreachable information may affect
              service arrangements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              费用与付款 / Pricing and Payment
            </h2>
            <p>
              我们会在服务前或服务中明确报价及付款安排。
            </p>
            <p>
              We confirm pricing and payment arrangements before or during
              service.
            </p>
            <p>
              支持付款方式：美元现金、人民币现金、Wise、Avosend、微信支付、支付宝、
              人民币银行转账。
            </p>
            <p>
              Accepted payment methods: Cash in USD, Cash in CNY, Wise,
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
            <h2 className="text-xl font-semibold text-slate-900">
              取消与改期 / Cancellation and Rescheduling
            </h2>
            <p>
              如需取消或改期，请尽早通知。如已产生实际成本（已预订资源、交通、排期占用
              等），我们有权收取合理费用。
            </p>
            <p>
              If cancellation or rescheduling is needed, please notify us as
              early as possible. If actual costs have already been incurred, we
              may charge a reasonable fee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              责任限制 / Limitation of Liability
            </h2>
            <p>
              我们将以合理专业标准提供服务。因不可抗力或第三方原因导致的延误、变更或损失，
              我们在法律允许范围内承担责任。若法律允许，我们的总责任以客户已支付的相关
              服务费用为上限。
            </p>
            <p>
              We provide services with reasonable professional care. For
              delays, changes, or losses caused by force majeure or third-party
              factors, liability is limited to the extent permitted by law. To
              the extent allowed by law, our total liability shall not exceed
              the service fee paid for the relevant service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              适用法律与争议解决 / Governing Law and Dispute Resolution
            </h2>
            <p>
              本条款适用中华人民共和国法律。争议应先友好协商，协商不成提交我们主要经营地
              有管辖权的人民法院。
            </p>
            <p>
              These Terms are governed by the laws of the PRC. Disputes should
              first be resolved through friendly consultation, and failing that,
              submitted to the competent court at our principal place of
              business.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              联系方式 / Contact
            </h2>
            <p>电话 / Phone: 86-19910329598</p>
            <p>邮箱 / Email: wowangww@vip.163.com</p>
            <p>微信 / WeChat: jane-cnba</p>
            <p>如有订单、付款或服务范围问题，请通过以上方式联系我们。</p>
            <p>
              For questions about orders, payment, or service scope, please
              contact us using the details above.
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
