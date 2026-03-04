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
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    country: "",
    contact: "",
    service_type: "",
    preferred_date: "",
    message: "",
  });

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to submit message");
      }

      setSubmitSuccess(true);
      setFormData({
        name: "",
        country: "",
        contact: "",
        service_type: "",
        preferred_date: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit message"
      );
    } finally {
      setSubmitting(false);
    }
  };

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

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">{t.contactForm.fields.name}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleFieldChange}
              placeholder="John Doe"
              required
              className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">{t.contactForm.fields.country}</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={handleFieldChange}
              placeholder="United Kingdom"
              className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">{t.contactForm.fields.contact}</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={handleFieldChange}
              placeholder="Email or WeChat ID"
              required
              className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">{t.contactForm.fields.serviceType}</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={handleFieldChange}
              placeholder="Business Visit / Medical..."
              className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="preferred_date">{t.contactForm.fields.date}</Label>
            <Input
              id="preferred_date"
              type="date"
              value={formData.preferred_date}
              onChange={handleFieldChange}
              className="h-12 border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message">{t.contactForm.fields.message}</Label>
            <Textarea 
              id="message"
              value={formData.message}
              onChange={handleFieldChange}
              placeholder="How can I help you?" 
              required
              className="min-h-[150px] border-slate-200 focus:border-primary focus:ring-primary" 
            />
          </div>

          <div className="md:col-span-2 text-center mt-4">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white px-12 py-6 text-lg rounded-full"
            >
              {submitting ? "Submitting..." : t.contactForm.submit}
            </Button>
            {submitSuccess && (
              <p className="mt-4 text-sm text-green-600">{t.contactForm.success}</p>
            )}
            {submitError && (
              <p className="mt-4 text-sm text-red-600">{submitError}</p>
            )}
          </div>
        </form>
      </div>
    </SectionWrapper>
  );
}
