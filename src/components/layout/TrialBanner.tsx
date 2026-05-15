"use client";

import { useState } from "react";
import { X, ChevronRight, Crown } from "lucide-react";
import { useTrial } from "@/hooks/useTrial";
import { PricingModal } from "./PricingModal";

const BANNER_BG     = "#0a0a0a";
const GOLD_GRADIENT = "linear-gradient(90deg, #b8860b 0%, #f5c842 40%, #ffd700 60%, #c8960c 100%)";

// ─── Animated countdown digit ─────────────────────────────────────────────────
function FlipUnit({ value, unit, gold = false }: { value: number; unit: string; gold?: boolean }) {
  const display = String(value).padStart(2, "0");
  return (
    <span className="flex items-end gap-[3px]">
      <span
        key={value}
        className="tabular-nums text-[13px] font-bold inline-block"
        style={{
          minWidth: "1.6ch",
          textAlign: "right",
          animation: "trialDigitDrop 0.28s cubic-bezier(0.22,1,0.36,1) both",
          ...(gold
            ? { background: GOLD_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
            : { color: "#ffffff" }
          ),
        }}
      >
        {display}
      </span>
      <span className="text-[10px] pb-[1px]" style={{ color: "rgba(255,255,255,0.38)" }}>
        {unit}
      </span>
    </span>
  );
}

export function TrialBanner() {
  const trial = useTrial();
  const [modalOpen, setModalOpen] = useState(false);

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (trial.dismissed) {
    return (
      <>
        <button
          onClick={trial.expand}
          className="fixed top-3 right-4 z-[9996] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(245,200,66,0.45)",
            boxShadow: "0 0 12px rgba(245,200,66,0.18)",
          }}
        >
          <span className="text-[13px]">👑</span>
          <span style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {trial.isExpired ? "Trial Expired" : `${trial.daysLeft}d Left`}
          </span>
          <ChevronRight size={11} style={{ color: "#f5c842" }} />
        </button>
        {modalOpen && (
          <PricingModal onClose={() => setModalOpen(false)} daysLeft={trial.daysLeft} />
        )}
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

          {/* Premium badge */}
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
              {trial.isExpired ? "TRIAL EXPIRED" : "FREE TRIAL ACTIVE"}
            </span>
          </div>

          {/* Copy */}
          <div className="hidden sm:flex items-center gap-2.5 min-w-0">
            <p className="text-white text-[13px] font-semibold leading-none whitespace-nowrap">
              {trial.isExpired
                ? "Your trial has ended."
                : `Your free trial ends in ${trial.daysLeft} day${trial.daysLeft !== 1 ? "s" : ""}.`}
            </p>
            <span className="text-white/25 text-[13px] hidden md:block select-none">·</span>
            <p className="text-white/55 text-[12px] leading-none hidden md:block truncate">
              {trial.isExpired
                ? "Upgrade to continue accessing Exclusive Projects and Market Pulse."
                : "Explore Exclusive Projects and Market Pulse before access is locked."}
            </p>
          </div>
        </div>

        {/* ── CENTER — live countdown with flip animation ── */}
        {!trial.isExpired && (
          <div
            className="relative z-10 flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-[7px] rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(245,200,66,0.22)",
            }}
          >
            <FlipUnit value={trial.daysLeft}    unit="d" />
            <span className="text-[11px] font-bold pb-[1px]" style={{ color: "rgba(255,255,255,0.20)" }}>:</span>
            <FlipUnit value={trial.hoursLeft}   unit="h" />
            <span className="text-[11px] font-bold pb-[1px]" style={{ color: "rgba(255,255,255,0.20)" }}>:</span>
            <FlipUnit value={trial.minutesLeft} unit="m" />
            <span className="text-[11px] font-bold pb-[1px]" style={{ color: "rgba(255,255,255,0.20)" }}>:</span>
            <FlipUnit value={trial.secondsLeft} unit="s" gold />
            <span className="text-[10px] ml-1" style={{ color: "rgba(255,255,255,0.28)" }}>left</span>
          </div>
        )}

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
            {trial.isExpired ? "Unlock Access" : "Upgrade Now"}
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>

          <button
            onClick={trial.dismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/08"
            style={{ color: "rgba(255,255,255,0.35)" }}
            aria-label="Minimize banner"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <PricingModal onClose={() => setModalOpen(false)} daysLeft={trial.daysLeft} />
      )}
    </>
  );
}
