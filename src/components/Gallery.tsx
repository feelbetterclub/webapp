"use client";

import { useI18n } from "@/lib/i18n/context";

const cellConfig = [
  { span: "col-span-4", aspect: "aspect-[4/5]", mt: "", bg: "bg-fb-green-mist" },
  { span: "col-span-4", aspect: "aspect-square", mt: "mt-10", bg: "bg-fb-cream" },
  { span: "col-span-4", aspect: "aspect-[3/4]", mt: "", bg: "bg-fb-sand" },
  { span: "col-span-3", aspect: "aspect-square", mt: "", bg: "bg-fb-green-mist" },
  { span: "col-span-6", aspect: "aspect-[16/10]", mt: "", bg: "bg-fb-cream" },
  { span: "col-span-3", aspect: "aspect-square", mt: "mt-5", bg: "bg-fb-sand" },
];

export default function Gallery() {
  const { t } = useI18n();
  const ti = t as any;

  const eyebrow = ti.galleryEyebrow || "The club";
  const title = ti.galleryTitle || "Where the good hours happen.";
  const sub =
    ti.gallerySub ||
    "Classes on the sand, in the studio, between pines and wind.";
  const labels = ti.galleryLabels || [
    "Beach class · sunrise",
    "Studio interior",
    "Moni · coaching",
    "Playa Chica",
    "Fun Burn Friday",
    "Stretch session",
  ];

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

        {/* Masonry grid — 12 cols desktop, 6 cols tablet */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
          {cellConfig.map((cell, i) => (
            <div
              key={i}
              className={`${cell.span} max-md:col-span-3 ${cell.mt} max-md:mt-0`}
            >
              <div
                className={`${cell.bg} ${cell.aspect} max-md:aspect-square rounded-[14px] flex items-end justify-start p-4`}
              >
                <span className="text-fb-green/70 text-sm font-medium">
                  {labels[i] ?? ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
