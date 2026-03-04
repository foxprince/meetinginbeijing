export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalPageContent {
  title: string;
  effective_date: string;
  sections: LegalSection[];
  back_to_home: string;
}

export const PRIVACY_POLICY_DEFAULTS: Record<"en" | "zh", LegalPageContent> = {
  en: {
    title: "Privacy Policy",
    effective_date: "Effective Date: 2026-03-04",
    sections: [
      {
        title: "Information We Collect",
        paragraphs: [
          "When you contact us via the website form, phone, WeChat, or email, we may collect your name, contact details, country/region, service requirements (such as interpretation, business assistance, and medical assistance), and other information you voluntarily provide.",
        ],
      },
      {
        title: "How We Use Information",
        paragraphs: [
          "Your information is used to respond to inquiries, communicate service details, provide quotes, arrange and deliver services, provide after-service follow-up, and improve service quality.",
        ],
      },
      {
        title: "Information Sharing",
        paragraphs: [
          "We do not sell your personal information. We only share the minimum necessary information when required to deliver services or when required by applicable law.",
        ],
      },
      {
        title: "Data Security and Retention",
        paragraphs: [
          "We apply reasonable technical and organizational measures to protect your data, and retain it only as long as necessary for the purposes described in this policy or as required by law.",
        ],
      },
      {
        title: "Your Rights",
        paragraphs: [
          "Subject to applicable law, you may request access, correction, or deletion of your personal information, or withdraw consent.",
        ],
      },
      {
        title: "Contact Us",
        paragraphs: [
          "For privacy-related questions, please contact us.",
          "Phone: 86-19910329598",
          "Email: wowangww@vip.163.com",
          "WeChat: jane-cnba",
        ],
      },
    ],
    back_to_home: "← Back to Home",
  },
  zh: {
    title: "隐私政策",
    effective_date: "生效日期：2026-03-04",
    sections: [
      {
        title: "信息收集",
        paragraphs: [
          "当您通过网站表单、电话、微信、邮箱等方式联系我们时，我们可能收集姓名、联系方式、国家/地区、服务需求（如翻译、商务陪同、就医陪同）及您主动提供的其他信息。",
        ],
      },
      {
        title: "用途说明",
        paragraphs: [
          "您的信息用于回应咨询、沟通服务细节、报价、安排及交付服务，并用于必要的售后跟进和服务质量改进。",
        ],
      },
      {
        title: "信息共享",
        paragraphs: [
          "我们不会出售您的个人信息。仅在提供服务所必需或法律法规要求的情况下，才会向必要合作方或有权机关披露最少必要信息。",
        ],
      },
      {
        title: "数据安全与保留",
        paragraphs: [
          "我们采取合理的技术和管理措施保护信息安全，并在实现本政策所述目的所需期限内保存数据，或按法律要求保留。",
        ],
      },
      {
        title: "您的权利",
        paragraphs: [
          "在适用法律允许范围内，您可请求访问、更正、删除您的个人信息，或撤回同意。",
        ],
      },
      {
        title: "联系我们",
        paragraphs: [
          "如有隐私相关问题，请联系我们。",
          "电话：86-19910329598",
          "邮箱：wowangww@vip.163.com",
          "微信：jane-cnba",
        ],
      },
    ],
    back_to_home: "← 返回首页",
  },
};

export const TERMS_OF_SERVICE_DEFAULTS: Record<"en" | "zh", LegalPageContent> = {
  en: {
    title: "Terms of Service",
    effective_date: "Effective Date: 2026-03-04",
    sections: [
      {
        title: "Services",
        paragraphs: [
          "We provide local assistance services in Beijing, including but not limited to business assistance, interpretation support, medical visit assistance, and itinerary support. Final scope is subject to mutual confirmation.",
        ],
      },
      {
        title: "Booking and Communication",
        paragraphs: [
          "Clients should provide accurate and complete information, including name, contact details, service requirements, and schedule. Incomplete or unreachable information may affect service arrangements.",
        ],
      },
      {
        title: "Pricing and Payment",
        paragraphs: [
          "We confirm pricing and payment arrangements before or during service.",
          "Accepted payment methods: Cash in USD, Cash in CNY, Wise, Avosend, WeChat Pay, AliPay, and RMB bank transfer.",
          "If a client can only pay via PayPal or any unsupported payment method, we reserve the right to decline the order.",
        ],
      },
      {
        title: "Cancellation and Rescheduling",
        paragraphs: [
          "If cancellation or rescheduling is needed, please notify us as early as possible. If actual costs have already been incurred, we may charge a reasonable fee.",
        ],
      },
      {
        title: "Limitation of Liability",
        paragraphs: [
          "We provide services with reasonable professional care. For delays, changes, or losses caused by force majeure or third-party factors, liability is limited to the extent permitted by law. To the extent allowed by law, our total liability shall not exceed the service fee paid for the relevant service.",
        ],
      },
      {
        title: "Governing Law and Dispute Resolution",
        paragraphs: [
          "These Terms are governed by the laws of the PRC. Disputes should first be resolved through friendly consultation, and failing that, submitted to the competent court at our principal place of business.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "For questions about orders, payment, or service scope, please contact us using the details below.",
          "Phone: 86-19910329598",
          "Email: wowangww@vip.163.com",
          "WeChat: jane-cnba",
        ],
      },
    ],
    back_to_home: "← Back to Home",
  },
  zh: {
    title: "服务条款",
    effective_date: "生效日期：2026-03-04",
    sections: [
      {
        title: "服务内容",
        paragraphs: [
          "我们提供北京本地协助服务，包括但不限于商务陪同、翻译沟通支持、就医陪同、行程与生活协助。具体服务范围以双方确认内容为准。",
        ],
      },
      {
        title: "预约与沟通",
        paragraphs: [
          "客户需提供真实、准确、完整的信息（姓名、联系方式、需求与时间安排）。信息不完整或无法联系可能影响服务安排。",
        ],
      },
      {
        title: "费用与付款",
        paragraphs: [
          "我们会在服务前或服务中明确报价及付款安排。",
          "支持付款方式：美元现金、人民币现金、Wise、Avosend、微信支付、支付宝、人民币银行转账。",
          "如客户仅提供 PayPal 等未列出的方式，我们有权拒绝接单。",
        ],
      },
      {
        title: "取消与改期",
        paragraphs: [
          "如需取消或改期，请尽早通知。如已产生实际成本（已预订资源、交通、排期占用等），我们有权收取合理费用。",
        ],
      },
      {
        title: "责任限制",
        paragraphs: [
          "我们将以合理专业标准提供服务。因不可抗力或第三方原因导致的延误、变更或损失，我们在法律允许范围内承担责任。若法律允许，我们的总责任以客户已支付的相关服务费用为上限。",
        ],
      },
      {
        title: "适用法律与争议解决",
        paragraphs: [
          "本条款适用中华人民共和国法律。争议应先友好协商，协商不成提交我们主要经营地有管辖权的人民法院。",
        ],
      },
      {
        title: "联系方式",
        paragraphs: [
          "如有订单、付款或服务范围问题，请通过以下方式联系我们。",
          "电话：86-19910329598",
          "邮箱：wowangww@vip.163.com",
          "微信：jane-cnba",
        ],
      },
    ],
    back_to_home: "← 返回首页",
  },
};
