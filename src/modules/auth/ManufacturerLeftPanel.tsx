"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    title: "Global Demand, Delivered",
    body: "Access verified, high-value projects matched to your capabilities and capacity. Keep your production lines running with a steady flow of orders.",
  },
  {
    id: 1,
    title: "Research & Technology Support",
    body: "Work with PhD-level experts on formulation, scale-up, and process optimization. Build new products without the overhead of in-house R&D.",
  },
  {
    id: 2,
    title: "Manufacturing Excellence",
    body: "Upgrade QA/QC systems and standardize processes to meet global standards. Prepare your facility for international audits and requirements.",
  },
  {
    id: 3,
    title: "Compliance & Regulatory",
    body: "Navigate certifications, filings, and audits with expert support. Stay ready for global markets with continuous compliance monitoring.",
  },
];

export function ManufacturerLeftPanel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback((dir: 1 | -1) => {
    setCurrent((prev) => (prev + dir + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => advance(1), 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, advance]);

  return (
    <div
      className="h-full rounded-[24px] overflow-hidden flex flex-col justify-between relative"
      style={{ background: "linear-gradient(to bottom, #016358 0%, #182133 100%)" }}
    >
      {/* Subtract arc */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/subtract.svg"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ width: 912, height: 912, right: -344, bottom: -361 }}
      />

      {/* Bottom curve cuts */}
      <div className="absolute bottom-26 left-6 w-5 h-5 overflow-hidden">
        <div className="w-full h-full rounded-bl-2xl border-l border-b border-[#00483f] shadow-[0_0_0_20px_black]" />
      </div>
      <div className="absolute bottom-6 left-41 w-5 h-5 overflow-hidden">
        <div className="w-full h-full rounded-bl-2xl border-l border-b border-[#00483f] shadow-[0_0_0_20px_black]" />
      </div>

      {/* Heading */}
      <div className="relative z-10 px-12 pt-10">
        <p className="text-white font-semibold" style={{ fontSize: 38, lineHeight: "46px" }}>
          From Demand to Delivery,
        </p>
        <p className="text-white font-light" style={{ fontSize: 38, lineHeight: "46px" }}>
          Everything Runs on One Platform
        </p>
      </div>

      {/* Glassmorphism card */}
      <div className="relative z-10 px-10 pb-8">
        {/* Dark overlay behind card */}
        <div
          className="absolute inset-x-0 bottom-0 rounded-b-[24px] pointer-events-none"
          style={{
            height: 260,
            background: "linear-gradient(to top, rgba(0,0,0,0.42) 40%, transparent 100%)",
          }}
        />

        <div className="relative z-10">
          <div
            className="rounded-[12px] overflow-hidden relative"
            style={{ border: "1px solid rgba(247,254,231,0.55)" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.18)", mixBlendMode: "overlay" }} />
            <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.08)" }} />

            <div className="relative z-10 px-5 pt-5 pb-4 text-white">
              <p className="text-[13px] font-medium leading-5 mb-3 opacity-75">
                What you unlock with Scinode
              </p>

              <div className="w-full overflow-hidden">
                <div
                  className="flex"
                  style={{
                    transform: `translateX(-${current * 100}%)`,
                    transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                    willChange: "transform",
                  }}
                >
                  {SLIDES.map((slide) => (
                    <div key={slide.id} className="flex-shrink-0 w-full">
                      <p
                        className="font-bold leading-[1.25] tracking-[-0.01em] mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22 }}
                      >
                        {slide.title}
                      </p>
                      <p className="text-[13px] font-normal leading-[20px] text-white/75">
                        {slide.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => advance(-1)}
                className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center shadow hover:bg-white/90 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#182133]" />
              </button>
              <button
                onClick={() => advance(1)}
                className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center shadow hover:bg-white/90 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#182133]" />
              </button>
            </div>

            <div className="flex items-center gap-[3px]">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 22 : 9,
                    height: 9,
                    background: i === current ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.22)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
