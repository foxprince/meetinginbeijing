"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { SectionWrapper } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building2, HeartPulse, ShoppingBag, Map, CalendarCheck } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Business Visit & Company Tour": <Building2 className="h-8 w-8 text-primary" />,
  "商务访问与公司考察": <Building2 className="h-8 w-8 text-primary" />,
  "Exhibition Assistance": <Briefcase className="h-8 w-8 text-primary" />,
  "展会协助": <Briefcase className="h-8 w-8 text-primary" />,
  "Medical Accompaniment": <HeartPulse className="h-8 w-8 text-primary" />,
  "医疗陪同": <HeartPulse className="h-8 w-8 text-primary" />,
  "Accompanied Local Tours": <Map className="h-8 w-8 text-primary" />,
  "本地陪同旅游": <Map className="h-8 w-8 text-primary" />,
  "Shopping & Purchasing Support": <ShoppingBag className="h-8 w-8 text-primary" />,
  "代购与购物支持": <ShoppingBag className="h-8 w-8 text-primary" />,
  "Concierge & Reservation": <CalendarCheck className="h-8 w-8 text-primary" />,
  "管家与预订服务": <CalendarCheck className="h-8 w-8 text-primary" />,
};

export function Services() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="services" dark>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t.services.title}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t.services.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {t.services.items.map((service, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <CardHeader className="pb-4">
              <div className="mb-4 transition-transform group-hover:scale-110 duration-300">
                {iconMap[service.title] || <Briefcase className="h-8 w-8 text-primary" />}
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                {service.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </CardContent>
            <div className="h-1 w-0 bg-primary transition-all group-hover:w-full duration-500" />
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
