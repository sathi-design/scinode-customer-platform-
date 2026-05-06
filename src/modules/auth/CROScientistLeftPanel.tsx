"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Geist_Mono } from "next/font/google";

// ─── Font ─────────────────────────────────────────────────────────────────────

const geistMono = Geist_Mono({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  fallback: ["IBM Plex Mono", "Courier New", "monospace"],
});

// ─── Phrases (exact order, no numbering in UI) ────────────────────────────────

const PHRASES = [
  "Projects matched to your expertise — no noise, no false leads",
  "Own your IP. Protect your innovation.",
  "Build a global presence for your expertise and work",
  "Compliance. Documentation. Execution — all in one place",
  "Back every decision with evidence and intelligence",
  "Drive innovation through global projects with leading industry players",
  "One platform for everything — from Idea to Impact",
];

// ─── Timing constants (configurable) ─────────────────────────────────────────

const DISPLAY_MS    = 3500; // how long each message stays readable  (2.5s–4s)
const TRANSITION_MS = 550;  // slide animation duration              (400ms–700ms)

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    headline: "A Seamless Collaboration Experience",
    body: "We had a great experience collaborating on a client project through Scinode. The platform made it simple to manage timelines, share documentation, and stay aligned with client expectations. What used to take days of emails now happens in a single dashboard — a real efficiency upgrade for our team.",
    author: "Business Development Lead",
    org: "CRO",
    badge: "CRO",
  },
  {
    headline: "Outcomes That Speak for Themselves",
    body: "The collaboration has delivered strong outcomes so far. Scinode helped us connect with the right scientific expertise in weeks, not months. The structured proposal flow and milestone tracking gave us full visibility, and communication with our research partners has never been cleaner.",
    author: "Co-Founder & Director",
    org: "Specialty Chemicals Manufacturer",
    badge: "Manufacturer",
  },
  {
    headline: "A Step Change in Project Execution",
    body: "This collaboration has been a significant step forward in how we engage with pharma clients. Scinode gave us the infrastructure to present our capabilities professionally and manage complex multi-phase projects end-to-end. We've closed more projects this quarter than in the previous year combined.",
    author: "Director – Operations",
    org: "CRO",
    badge: "CRO",
  },
];

// ─── Slide phase ──────────────────────────────────────────────────────────────

type SlidePhase =
  | "showing"  // message fully visible, waiting before slide
  | "prepare"  // next element mounted off-screen right, transition not yet active
  | "sliding"; // both elements transitioning simultaneously

// ─── Component ────────────────────────────────────────────────────────────────

export function CROScientistLeftPanel() {

  // ── Slide state ──
  const [phase,  setPhase]  = useState<SlidePhase>("showing");
  const [curIdx, setCurIdx] = useState(0);
  const nextIdx = (curIdx + 1) % PHRASES.length;

  // ── Animation engine ──────────────────────────────────────────────────────
  //
  //  showing ──(DISPLAY_MS)──▶ prepare ──(2×rAF)──▶ sliding ──(TRANSITION_MS)──▶ showing
  //
  //  "prepare"  : next element renders at translateX(+108%), no transitions yet
  //  "sliding"  : CSS transitions fire — current exits left, next enters from right
  //  After slide: curIdx advances, next element unmounts, phase resets to "showing"
  //
  useEffect(() => {
    if (phase === "showing") {
      const t = setTimeout(() => setPhase("prepare"), DISPLAY_MS);
      return () => clearTimeout(t);
    }

    if (phase === "prepare") {
      // Two rAFs ensure the browser has painted the next element at its
      // starting position BEFORE we add the transition, preventing a flash.
      let raf1: number;
      let raf2: number;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase("sliding"));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    if (phase === "sliding") {
      // +50ms buffer beyond transition duration ensures CSS has fully settled
      const t = setTimeout(() => {
        setCurIdx((i) => (i + 1) % PHRASES.length);
        setPhase("showing");
      }, TRANSITION_MS + 50);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Testimonial state ──
  const [testIdx, setTestIdx] = useState(0);
  const [fading,  setFading]  = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => { setTestIdx(idx); setFading(false); }, 220);
  }, []);

  const changeTest = useCallback(
    (dir: 1 | -1) => goTo((testIdx + dir + TESTIMONIALS.length) % TESTIMONIALS.length),
    [testIdx, goTo],
  );

  const testimonial = TESTIMONIALS[testIdx];

  // ── Shared headline text style (identical to original) ──
  const headlineStyle: React.CSSProperties = {
    fontSize: 36,
    lineHeight: 1.32,
    color: "#ffffff",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  };

  // ── Per-slide transition style ──
  const slideTransition =
    phase === "sliding"
      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : "none";

  return (
    <div
      className="h-full rounded-[24px] overflow-hidden flex flex-col justify-between relative select-none"
      style={{ background: "linear-gradient(to bottom, #016358 0%, #182133 100%)" }}
    >
      {/* ── Subtract arc ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/subtract.svg"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ width: 912, height: 912, right: -240, bottom: -361 }}
      />

      {/* ── Bottom curve cuts (same as manufacturer) ── */}
      <div className="absolute bottom-26 left-6 w-5 h-5 overflow-hidden">
        <div className="w-full h-full rounded-bl-2xl border-l border-b border-[#00483f] shadow-[0_0_0_20px_black]" />
      </div>
      <div className="absolute bottom-6 left-41 w-5 h-5 overflow-hidden">
        <div className="w-full h-full rounded-bl-2xl border-l border-b border-[#00483f] shadow-[0_0_0_20px_black]" />
      </div>

      {/* ══ TOP: Badge + Sliding headline ══ */}
      <div className="relative z-10 px-12 pt-10">

        {/* ── Premium trust badge (unchanged) ── */}
        <div className="mb-5">
          <span
            className="group inline-flex items-center gap-2.5 px-4 py-[7px] rounded-full cursor-default
              transition-all duration-200 ease-out hover:scale-[1.02]"
            style={{
              background: "#018E7E",
              border: "1px solid #01a896",
            }}
          >
            <span
              className="flex-shrink-0 w-[6px] h-[6px] rounded-full"
              style={{
                background: "#2ACB83",
                boxShadow: "0 0 0 2px rgba(42,203,131,0.20), 0 0 8px 2px rgba(42,203,131,0.40)",
              }}
            />
            <span
              className="text-[12px] font-medium tracking-[0.01em] leading-[1.4]"
              style={{ color: "rgba(255,255,255,0.90)" }}
            >
              Trusted by leading CROs, labs, and scientific teams worldwide
            </span>
          </span>
        </div>

        {/* ── Sliding headline ─────────────────────────────────────────────────
            Container height is fixed so the card below never jumps.
            overflow:hidden clips slides that are outside the visible area.
            Two absolutely-positioned layers slide in parallel:
              • curIdx  : translateX(0)  → translateX(-108%)   [exits left]
              • nextIdx : translateX(108%) → translateX(0)     [enters right]
        ─────────────────────────────────────────────────────────────────────── */}
        <div style={{ minHeight: 200, position: "relative", overflow: "hidden" }}>

          {/* Current message — exits to the LEFT */}
          <div
            key={`cur-${curIdx}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: phase === "sliding" ? "translateX(-108%)" : "translateX(0%)",
              transition: slideTransition,
              willChange: "transform",
            }}
          >
            <p className={geistMono.className} style={headlineStyle}>
              {PHRASES[curIdx]}
            </p>
          </div>

          {/* Next message — enters from the RIGHT (only mounted during prepare + sliding) */}
          {phase !== "showing" && (
            <div
              key={`next-${nextIdx}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: phase === "sliding" ? "translateX(0%)" : "translateX(108%)",
                transition: slideTransition,
                willChange: "transform",
              }}
            >
              <p className={geistMono.className} style={headlineStyle}>
                {PHRASES[nextIdx]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM: Testimonials glass card (unchanged) ══ */}
      <div className="relative z-10 px-10 pb-8">

        {/* Dark scrim to improve card readability */}
        <div
          className="absolute inset-x-0 bottom-0 rounded-b-[24px] pointer-events-none"
          style={{
            height: 340,
            background: "linear-gradient(to top, rgba(0,0,0,0.52) 45%, transparent 100%)",
          }}
        />

        <div className="relative z-10">

          {/* Glass card */}
          <div
            className="rounded-[12px] overflow-hidden relative"
            style={{ border: "1px solid rgba(247,254,231,0.55)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(255,255,255,0.18)", mixBlendMode: "overlay" }}
            />
            <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.08)" }} />

            <div className="relative z-10 px-5 pt-5 pb-4 text-white">

              <p className="text-[13px] font-medium leading-5 mb-3 opacity-70">
                What our partners say
              </p>

              <div
                style={{
                  opacity: fading ? 0 : 1,
                  transition: "opacity 220ms ease-in-out",
                }}
              >
                <p
                  className="font-bold leading-[1.3] tracking-[-0.01em] mb-2.5"
                  style={{ fontSize: 18 }}
                >
                  {testimonial.headline}
                </p>

                <p className="text-[12px] font-normal leading-[19px] text-white/75 mb-3">
                  {testimonial.body}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[11px] leading-4" style={{ color: "rgba(255,255,255,0.50)" }}>
                    — {testimonial.author}, {testimonial.org}
                  </p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.62)",
                      border: "1px solid rgba(255,255,255,0.16)",
                    }}
                  >
                    {testimonial.badge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls row — arrows left, dots right */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeTest(-1)}
                aria-label="Previous testimonial"
                className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center shadow hover:bg-white/90 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#182133]" />
              </button>
              <button
                onClick={() => changeTest(1)}
                aria-label="Next testimonial"
                className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center shadow hover:bg-white/90 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#182133]" />
              </button>
            </div>

            <div className="flex items-center gap-[3px]">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === testIdx ? 22 : 9,
                    height: 9,
                    background:
                      i === testIdx
                        ? "rgba(255,255,255,0.75)"
                        : "rgba(255,255,255,0.22)",
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
