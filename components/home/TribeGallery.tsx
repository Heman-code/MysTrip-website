"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const photos = [
  { src: "/trips/gallery-saan-helping-hands.jpg",     label: "Saan Valley",      size: "tall" },
  { src: "/trips/gallery-banki-ridge-line.jpg",       label: "Ban ki Ghati",     size: "square" },
  { src: "/trips/gallery-udaipur-friends.jpg",        label: "Udaipur",          size: "square" },
  { src: "/trips/gallery-jaisalmer-group.jpg",        label: "Jaisalmer",        size: "wide" },
  { src: "/trips/gallery-kedarkantha-peaks-2.jpg",      label: "Kedarkantha Trek", size: "square" },
  { src: "/trips/gallery-sumel-campfire.jpg",         label: "Mount Sumel",      size: "tall" },
  { src: "/trips/gallery-banki-circle-aerial.jpg",    label: "Ban ki Ghati",     size: "wide" },
  { src: "/trips/gallery-kedarkantha-boots.jpg",      label: "Kedarkantha Trek", size: "square" },
  { src: "/trips/gallery-raghunath-smile.jpg",        label: "Raghunath Fort",   size: "square" },
  { src: "/trips/gallery-jaisalmer-fort-interior.jpg",label: "Jaisalmer Fort",   size: "square" },
  { src: "/trips/gallery-saan-forest-walk.jpg",       label: "Saan Valley",      size: "tall" },
  { src: "/trips/gallery-sumel-girls-breakfast.jpg",  label: "Mount Sumel",      size: "square" },
];

export default function TribeGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeadingVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 sm:py-20 lg:py-24 overflow-hidden" style={{ background: "#0B1210" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div
          ref={headingRef}
          className="mb-6 sm:mb-12 transition-all duration-700"
          style={{ opacity: headingVisible ? 1 : 0, transform: headingVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: "#FF6016" }}>
            The Tribe in Action
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-20">
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}
            >
              These aren&apos;t stock photos.
              <br />
              <span style={{ color: "#FF6016" }}>This is your future.</span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed lg:mb-1 max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Every photo is from a real MysTrip experience.
              Real students. Real moments. No filters on the memories.
            </p>
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
          {photos.map((photo, i) => (
            <GalleryPhoto key={photo.src} photo={photo} delay={i * 60} />
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-6 sm:mt-10 text-center">
          <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            Kedarkantha · Jaisalmer · Udaipur · Saan Valley · Ban ki Ghati · Women&apos;s Day Trek · and 11 more
          </p>
        </div>
      </div>
    </section>
  );
}

function GalleryPhoto({ photo, delay }: { photo: { src: string; label: string; size: string }; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const aspectClass = photo.size === "tall" ? "aspect-[3/4]" : photo.size === "wide" ? "aspect-[4/3]" : "aspect-square";

  return (
    <div
      ref={ref}
      className={`relative ${aspectClass} rounded-2xl overflow-hidden mb-2 sm:mb-3 group cursor-pointer break-inside-avoid transition-all duration-700`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Image
        src={photo.src}
        alt={photo.label}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-sm font-bold" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {photo.label}
        </p>
      </div>
    </div>
  );
}
