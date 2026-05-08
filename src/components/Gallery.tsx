"use client";

import { useI18n } from "@/lib/i18n/context";

const cellConfig = [
  { span: "col-span-4", aspect: "aspect-[4/5]", mt: "", img: "/gallery-1.webp" },
  { span: "col-span-4", aspect: "aspect-square", mt: "mt-10", img: "/gallery-2.webp" },
  { span: "col-span-4", aspect: "aspect-[3/4]", mt: "", img: "/gallery-3.webp" },
  { span: "col-span-3", aspect: "aspect-square", mt: "", img: "/gallery-4.webp" },
  { span: "col-span-6", aspect: "aspect-[16/10]", mt: "", img: "/gallery-5.webp" },
  { span: "col-span-3", aspect: "aspect-square", mt: "mt-5", img: "/gallery-6.webp" },
];

export default function Gallery() {
  const { t } = useI18n();
  const ti = t;

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
                className={`${cell.aspect} max-md:aspect-square rounded-[14px] overflow-hidden relative`}
              >
                <img
                  src={cell.img}
                  alt={labels[i] ?? ""}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-4 text-white/90 text-sm font-medium drop-shadow-sm">
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
