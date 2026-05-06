"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  heroTagline?: string;
  heroSubtitle?: string;
  /** Show logo inside the right panel form area (signup uses this) */
  showLogoInForm?: boolean;
}

export function AuthLayout({
  children,
  heroTagline = "Get Expert Guidance",
  heroSubtitle = "Direct access to senior scientists and technical experts. Get answers to complex questions within minutes.",
  showLogoInForm = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT HERO PANEL ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[44%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, #011a17 0%, #012e2a 40%, #013d37 70%, #014d42 100%)" }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #1F6F54 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #2ACB83 0%, transparent 70%)" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }} />

        {/* No logo on left panel — logo lives on right panel only */}

        {/* Center: product mockup */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pb-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm">
            {/* Mock browser bar */}
            <div className="h-8 bg-white/5 border-b border-white/10 flex items-center gap-1.5 px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="ml-3 h-4 w-36 rounded bg-white/10" />
            </div>
            {/* Mock content */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Active Projects", val: "12", accent: "bg-[#1F6F54]/20" },
                  { label: "Proposals", val: "24", accent: "bg-[#2F66D0]/20" },
                  { label: "Completed", val: "8", accent: "bg-[#5B3BA8]/20" },
                ].map((c) => (
                  <div key={c.label} className={`${c.accent} rounded-lg p-2.5`}>
                    <p className="text-white/40 text-[9px] leading-none mb-1">{c.label}</p>
                    <p className="text-white font-semibold text-lg leading-none">{c.val}</p>
                  </div>
                ))}
              </div>
              {[75, 45, 85, 55, 65].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/10 flex-shrink-0" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#1F6F54]/60" style={{ width: `${w}%` }} />
                  </div>
                  <div className="w-8 h-1.5 rounded bg-white/10 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: tagline */}
        <div className="relative z-10 px-8 pb-10">
          <h2 className="text-3xl font-semibold text-white leading-tight mb-2 tracking-tight">
            {heroTagline}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            {heroSubtitle}
          </p>

          {/* Role pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { label: "Manufacturer", color: "bg-[#1F6F54]/20 text-[#2ACB83]" },
              { label: "CRO", color: "bg-[#2F66D0]/20 text-[#7EB3F7]" },
              { label: "Scientist", color: "bg-[#5B3BA8]/20 text-[#C4B5FD]" },
            ].map((pill) => (
              <span key={pill.label}
                className={`text-xs px-3 py-1 rounded-full font-medium ${pill.color}`}>
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center px-5 py-4 border-b border-[#E8E8E8]">
          <Link href="/"><Logo height={24} /></Link>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 md:p-10 lg:p-12">
          <div className="w-full max-w-[580px]">
            {/* Logo in form area (signup only) */}
            {showLogoInForm && (
              <div className="hidden lg:block mb-8">
                <Link href="/"><Logo height={35} /></Link>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
