"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SectionHeader } from "./SectionHeader";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useI18n } from "@/lib/i18n/context";

const contactInfo = [
  { icon: MapPin, label: "Location", value: "Tarifa, ES" },
  { icon: Phone, label: "Phone", value: "+34 XXX XXX XXX" },
  { icon: Mail, label: "Email", value: "hello@feelbetterclub.com" },
  { icon: Clock, label: "Schedule", value: "Mon - Sat: 7:00 - 21:00" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const ritualOptions = [
    { value: "mobility", label: t.rituals.mobility.name },
    { value: "strength", label: t.rituals.strength.name },
    { value: "pilates", label: t.rituals.pilates.name },
    { value: "breathwork", label: t.rituals.breathwork.name },
    { value: "sound-healing", label: t.rituals.soundHealing.name },
    { value: "nutrition", label: t.rituals.nutrition.name },
    { value: "other", label: "Other" },
  ];

  return (
    <section id="contacto" className="py-24 bg-brand-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={t.contact.label} title={t.contact.title} description={t.contact.subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-6 border border-brand-sage/30">
                  <item.icon className="w-6 h-6 text-brand-teal mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-medium text-brand-deep">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-brand-teal to-brand-dark rounded-2xl p-8 text-brand-cream">
              <h3 className="font-heading text-2xl font-bold mb-3">{t.contact.trialTitle}</h3>
              <p className="text-brand-cream/80 mb-6">{t.contact.trialText}</p>
              <a href="/reservar" className="inline-block bg-brand-cream text-brand-deep px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors">
                {t.contact.trialCta}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-brand-sage/30">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-brand-teal" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-brand-deep mb-2">{t.contact.form.sent}</h3>
                <p className="text-muted-foreground">{t.contact.form.sentText}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input id="name" name="name" label={t.contact.form.name} required placeholder={t.contact.form.name} />
                <Input id="email" name="email" type="email" label={t.contact.form.email} required placeholder="you@email.com" />
                <Select id="interest" name="interest" label={t.contact.form.interest}>
                  <option value="">{t.contact.form.selectOption}</option>
                  {ritualOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Textarea id="message" name="message" label={t.contact.form.message} rows={4} placeholder={t.contact.form.messagePlaceholder} />
                <button type="submit" className="w-full bg-brand-teal text-brand-cream py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors">
                  {t.contact.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
