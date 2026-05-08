"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface UpcomingClass {
  id: number;
  className: string;
  date: string;
  startTime: string;
  location: string | null;
  durationMinutes: number | null;
  icon: string | null;
}

const CARD_IMAGES = [
  "/hero-1.webp",
  "/hero-2.webp",
  "/hero-3.webp",
  "/hero-4.webp",
  "/hero-5.webp",
  "/hero-6.webp",
];

function formatDate(dateStr: string, lang: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(lang, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${suffix}`;
}

export default function Hero() {
  const { t, lang } = useI18n();
  const [classes, setClasses] = useState<UpcomingClass[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const h = (t as any).hero ?? {};
  const primaryCta = h.primary ?? h.cta1 ?? "Book your first class";

  useEffect(() => {
    fetch("/api/upcoming")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClasses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prev = () => setActiveIndex((i) => (i === 0 ? classes.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === classes.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-fb-paper pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 rounded-[28px] bg-fb-green-mist/40 animate-pulse"
              />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-fb-mute text-lg mb-6">
              No upcoming classes scheduled yet. Check back soon!
            </p>
            <Link
              href="/book"
              className="inline-flex items-center bg-fb-green text-fb-paper rounded-full px-6 py-3.5 text-base font-semibold transition-colors hover:opacity-90"
            >
              {primaryCta}
              <span className="ml-1.5" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop: 3 cards side by side */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {classes.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  image={CARD_IMAGES[i % CARD_IMAGES.length]}
                  lang={lang}
                />
              ))}
            </div>

            {/* Mobile: single card with arrows */}
            <div className="md:hidden">
              <ClassCard
                cls={classes[activeIndex]}
                image={CARD_IMAGES[activeIndex % CARD_IMAGES.length]}
                lang={lang}
              />
              {classes.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={prev}
                    aria-label="Previous class"
                    className="p-2 rounded-full border border-fb-green/20 text-fb-green hover:bg-fb-green-mist transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-fb-mute text-sm font-medium">
                    {activeIndex + 1} / {classes.length}
                  </span>
                  <button
                    onClick={next}
                    aria-label="Next class"
                    className="p-2 rounded-full border border-fb-green/20 text-fb-green hover:bg-fb-green-mist transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* CTA below banners */}
            <div className="flex justify-center mt-8">
              <Link
                href="/book"
                className="inline-flex items-center bg-fb-green text-fb-paper rounded-full px-6 py-3.5 text-base font-semibold transition-colors hover:opacity-90"
              >
                {primaryCta}
                <span className="ml-1.5" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ClassCard({
  cls,
  image,
  lang,
}: {
  cls: UpcomingClass;
  image: string;
  lang: string;
}) {
  return (
    <Link
      href="/book"
      className="block rounded-[28px] overflow-hidden relative transition-transform hover:scale-[1.02] hover:shadow-lg"
      style={{ minHeight: 220 }}
    >
      {/* Background image */}
      <img
        src={image}
        alt={cls.className}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-7 flex flex-col justify-end h-full text-fb-paper" style={{ minHeight: 220 }}>
        <h2 className="text-2xl font-semibold mb-3 leading-tight drop-shadow-sm">
          {cls.className}
        </h2>

        <div className="flex items-center gap-2 mb-1.5 opacity-90">
          <Calendar size={16} />
          <span className="text-sm font-medium capitalize">
            {formatDate(cls.date, lang)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1.5 opacity-90">
          <Clock size={16} />
          <span className="text-sm font-medium">
            {formatTime(cls.startTime)}
            {cls.durationMinutes ? ` (${cls.durationMinutes} min)` : ""}
          </span>
        </div>

        {cls.location && (
          <div className="flex items-center gap-2 opacity-90">
            <MapPin size={16} />
            <span className="text-sm font-medium">{cls.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
