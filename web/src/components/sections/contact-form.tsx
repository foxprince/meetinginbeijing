"use client";

import React from "react";
import { useLanguage } from "@/app/providers";
import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="contact" className="bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.contactForm.title}
          </h2>
          <p className="text-lg text-slate-600">
            {t.contactForm.success}
          </p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t.contactForm.fields.name}</Label>
            <Input id="name" placeholder="John Doe" className="h-12 border-slate-200 focus:border-primary focus:ring-primary" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">{t.contactForm.fields.country}</Label>
            <Input id="country" placeholder="United Kingdom" className="h-12 border-slate-200 focus:border-primary focus:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">{t.contactForm.fields.contact}</Label>
            <Input id="contact" placeholder="Email or WeChat ID" className="h-12 border-slate-200 focus:border-primary focus:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">{t.contactForm.fields.serviceType}</Label>
            <Input id="service" placeholder="Business Visit / Medical..." className="h-12 border-slate-200 focus:border-primary focus:ring-primary" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="date">{t.contactForm.fields.date}</Label>
            <Input id="date" type="date" className="h-12 border-slate-200 focus:border-primary focus:ring-primary" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message">{t.contactForm.fields.message}</Label>
            <Textarea 
              id="message" 
              placeholder="How can I help you?" 
              className="min-h-[150px] border-slate-200 focus:border-primary focus:ring-primary" 
            />
          </div>

          <div className="md:col-span-2 text-center mt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-12 py-6 text-lg rounded-full">
              {t.contactForm.submit}
            </Button>
          </div>
        </form>
      </div>
    </SectionWrapper>
  );
}
