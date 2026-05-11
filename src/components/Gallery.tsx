"use client";

import { useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n/context";

const cellConfig = [
  { span: "col-span-4", aspect: "aspect-[4/3]", mt: "", img: "/gallery-1.webp" },    // -59 Moni lunge (horizontal)
  { span: "col-span-4", aspect: "aspect-[3/4]", mt: "mt-10", img: "/gallery-2.webp" }, // -122 Moni ayudando alumno (vertical)
  { span: "col-span-4", aspect: "aspect-[4/3]", mt: "", img: "/gallery-3.webp" },    // -152 Chicas charlando (horizontal)
  { span: "col-span-3", aspect: "aspect-[3/4]", mt: "", img: "/gallery-4.webp" },    // -140 Moni close-up (vertical)
  { span: "col-span-6", aspect: "aspect-[16/10]", mt: "", img: "/gallery-5.webp" },  // -168 Gente en el mar (horizontal)
  { span: "col-span-3", aspect: "aspect-[4/3]", mt: "mt-5", img: "/gallery-6.webp" }, // -50 Squats grupo (horizontal)
  { span: "col-span-4", aspect: "aspect-[3/4]", mt: "", img: "/gallery-7.webp" },    // -24 Vista aérea tenis+playa (vertical)
  { span: "col-span-4", aspect: "aspect-[4/3]", mt: "mt-6", img: "/gallery-8.webp" }, // -84 Grupo tumbado mar (horizontal)
  { span: "col-span-4", aspect: "aspect-[3/4]", mt: "", img: "/gallery-9.webp" },    // -95 Moni cobra/stretch (vertical)
];

export default function Gallery() {
  const { t } = useI18n();
  const ti = t;
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / cellConfig.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.min(idx, cellConfig.length - 1));
  }, []);

  const eyebrow = ti.galleryEyebrow || "The club";
  const title = ti.galleryTitle || "Where the good hours happen.";
  const sub =
    ti.gallerySub ||
    "Classes on the sand, in the studio, between pines and wind.";

  return (
    <section id="gallery" className="py-20 bg-fb-bone">
      <div className="mx-auto max-w-[1240px] px-5">
        {/* Header — 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div>
            <p className="text-fb-mute uppercase tracking-[0.18em] text-xs font-semibold mb-2">
              {eyebrow}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-fb-green leading-tight">
              {title}
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-fb-mute text-lg leading-relaxed">{sub}</p>
          </div>
        </div>

        {/* Desktop: masonry grid — 12 cols */}
        <div className="hidden md:grid md:grid-cols-12 gap-4">
          {cellConfig.map((cell, i) => (
            <div key={i} className={`${cell.span} ${cell.mt}`}>
              <div
                className={`${cell.aspect} rounded-[14px] overflow-hidden relative`}
              >
                <img
                  src={cell.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal swipe scroll — one photo at a time */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 scrollbar-hide"
        >
          {cellConfig.map((cell, i) => (
            <div key={i} className="snap-center shrink-0 w-[85vw]">
              <div className="aspect-[4/3] rounded-[14px] overflow-hidden relative">
                <img
                  src={cell.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
        {/* Dot indicators */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-3">
          {cellConfig.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all ${
                i === activeIdx ? "w-2.5 h-2.5 bg-fb-green" : "w-1.5 h-1.5 bg-fb-green/30"
              }`}
            />
          ))}
        </div>
        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </div>
    </section>
  );
}
