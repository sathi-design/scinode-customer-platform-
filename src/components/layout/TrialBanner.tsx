"use client";

import { useState } from "react";
import { X, ChevronRight, Crown, Lock } from "lucide-react";
import { PricingModal } from "./PricingModal";

const BANNER_BG     = "#0a0a0a";
const GOLD_GRADIENT = "linear-gradient(90deg, #b8860b 0%, #f5c842 40%, #ffd700 60%, #c8960c 100%)";

export function TrialBanner() {
  const [modalOpen,  setModalOpen]  = useState(false);
  const [dismissed,  setDismissed]  = useState(false);

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (dismissed) {
    return (
      <>
        <button
          onClick={() => setDismissed(false)}
          className="fixed top-3 right-4 z-[9996] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(245,200,66,0.45)",
            boxShadow: "0 0 12px rgba(245,200,66,0.18)",
          }}
        >
          <span className="text-[13px]">👑</span>
          <span style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Free Plan
          </span>
          <ChevronRight size={11} style={{ color: "#f5c842" }} />
        </button>
        {modalOpen && <PricingModal onClose={() => setModalOpen(false)} />}
      </>
    );
  }

  // ── Full banner ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes trialDigitDrop {
          0%   { transform: translateY(-55%) scaleY(0.5); opacity: 0;   }
          55%  { transform: translateY(4%)   scaleY(1.06); opacity: 1;  }
          75%  { transform: translateY(-2%)  scaleY(0.98); opacity: 1;  }
          100% { transform: translateY(0)    scaleY(1);    opacity: 1;  }
        }
      `}</style>

      <div
        className="relative flex-shrink-0 w-full flex items-center justify-between gap-3 px-5 md:px-8 overflow-hidden"
        style={{
          background: BANNER_BG,
          height: 56,
          borderBottom: "1px solid rgba(245,200,66,0.22)",
          boxShadow: "0 1px 0 rgba(245,200,66,0.10)",
        }}
      >
        {/* ── Premium diagonal line texture ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32L32 0' stroke='%23f5c842' stroke-width='0.4' stroke-opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gold shimmer sweep */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(245,200,66,0.06) 0%, transparent 30%, transparent 70%, rgba(245,200,66,0.06) 100%)",
          }}
        />
        {/* Left anchor glow */}
        <div
          className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-56 h-28 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,200,66,0.18) 0%, transparent 70%)", filter: "blur(14px)" }}
        />
        {/* Right anchor glow */}
        <div
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-40 h-28 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,200,66,0.10) 0%, transparent 70%)", filter: "blur(18px)" }}
        />

        {/* ── LEFT — badge + copy ── */}
        <div className="relative z-10 flex items-center gap-3 min-w-0">

          {/* Free Plan badge */}
          <div
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(245,200,66,0.10)",
              border: "1px solid rgba(245,200,66,0.35)",
            }}
          >
            <Crown size={11} style={{ color: "#f5c842" }} />
            <span
              className="text-[10px] font-bold tracking-[0.12em] whitespace-nowrap"
              style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              FREE PLAN
            </span>
          </div>

          {/* Copy */}
          <div className="hidden sm:flex items-center gap-2.5 min-w-0">
            <p className="text-white text-[13px] font-semibold leading-none whitespace-nowrap">
              2 proposals included in your free plan.
            </p>
            <span className="text-white/25 text-[13px] hidden md:block select-none">·</span>
            <div className="hidden md:flex items-center gap-1.5">
              <Lock size={11} className="shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
              <p className="text-white/55 text-[12px] leading-none truncate">
                Exclusive Projects and Market Pulse locked — upgrade to unlock.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT — CTA + dismiss ── */}
        <div className="relative z-10 flex-shrink-0 flex items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[12px] font-bold transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(245,200,66,0.40)] active:scale-[0.97]"
            style={{
              background: GOLD_GRADIENT,
              color: "#1a1200",
              boxShadow: "0 0 10px rgba(245,200,66,0.25)",
            }}
          >
            Upgrade Now
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/08"
            style={{ color: "rgba(255,255,255,0.35)" }}
            aria-label="Minimize banner"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {modalOpen && <PricingModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
