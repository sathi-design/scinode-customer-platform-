"use client";

/**
 * DemandDiscoverySection — shared across Day 0 and Day 1 dashboards.
 *
 * Exports:
 *   DemandDiscoveryDay0  — blurred/locked preview cards (aspiration)
 *   DemandDiscoveryDay1  — live signal cards with sparklines (activation)
 *
 * Day 10 variant lives in Day10Dashboard.tsx (DemandDiscoverySection).
 */

import { ArrowRight } from "lucide-react";
import { useState }   from "react";

type ProfileType = "researcher" | "cro";

// ─── Shared: mini sparkline ───────────────────────────────────────────────────

function Sparkline({
  points, color, uid,
}: { points: number[]; color: string; uid: string }) {
  const W = 72, H = 28;
  const min   = Math.min(...points), max = Math.max(...points);
  const range = (max - min) || 1;
  const xs    = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys    = points.map(p => H - 4 - ((p - min) / range) * (H - 8));
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;
  const gid   = `dds-${uid}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gid})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill={color}/>
    </svg>
  );
}

// ─── Shared: carousel chevrons / dots ────────────────────────────────────────

function CarouselNav({
  canPrev, canNext, primaryColor, dotsCount, activeIndex,
  onPrev, onNext, onDot,
}: {
  canPrev: boolean; canNext: boolean; primaryColor: string;
  dotsCount: number; activeIndex: number;
  onPrev: () => void; onNext: () => void; onDot: (i: number) => void;
}) {
  return (
    <>
      {canPrev && (
        <button onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10">
          <svg width="13" height="13" viewBox="0 0 13 13">
            <path d="M8 2L3 6.5L8 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      )}
      {canNext && (
        <button onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10">
          <svg width="13" height="13" viewBox="0 0 13 13">
            <path d="M5 2L10 6.5L5 11" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      )}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: dotsCount }).map((_, i) => (
          <button key={i} onClick={() => onDot(i)}
            className="rounded-full transition-all duration-250"
            style={{ width: activeIndex === i ? 18 : 6, height: 6, background: activeIndex === i ? primaryColor : "#cbd5e1" }}
          />
        ))}
      </div>
    </>
  );
}

// ─── Shared: right insight panel ─────────────────────────────────────────────

function InsightPanel({
  primaryColor, heading, stat, statLabel, insight, ctaLabel,
  extraContent,
}: {
  primaryColor: string; heading: string;
  stat: string | number; statLabel: string;
  insight: string; ctaLabel: string;
  extraContent?: React.ReactNode;
}) {
  return (
    <div className="flex-[35] lg:min-w-[240px] lg:max-w-[320px]">
      <div
        className="h-full rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden border"
        style={{ background: `linear-gradient(140deg,${primaryColor}14 0%,${primaryColor}06 100%)`, borderColor: `${primaryColor}22` }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 rounded-full opacity-[0.18]"
          style={{ background: `radial-gradient(circle,${primaryColor} 0%,transparent 70%)`, filter: "blur(38px)" }}/>

        <p className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: primaryColor + "aa" }}>
          {heading}
        </p>

        {/* Stat badge */}
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
          style={{ background: `${primaryColor}12`, border: `1px solid ${primaryColor}22` }}>
          <span className="text-[28px] font-black leading-none" style={{ color: primaryColor, fontFamily: "Poppins,sans-serif" }}>
            {stat}
          </span>
          <span className="text-[10px] text-slate-500 leading-snug">{statLabel}</span>
        </div>

        {/* Insight box */}
        <div className="flex items-start gap-2 p-3 rounded-xl flex-1"
          style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.85)" }}>
          <span className="text-[15px] shrink-0 mt-0.5">💡</span>
          <p className="text-[10.5px] text-[#1e293b] font-medium leading-relaxed">{insight}</p>
        </div>

        {extraContent}

        {/* CTA */}
        <button
          className="w-full py-2.5 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
          style={{ background: primaryColor, color: "white", boxShadow: `0 2px 14px ${primaryColor}40` }}
        >
          {ctaLabel} <ArrowRight size={12} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAY 0  — blurred / locked preview
// ═══════════════════════════════════════════════════════════════════════════════

const D0_CRO_PRODUCTS = [
  { name: "Lithium Sulfite",          status: "Discovery inactive"                  },
  { name: "Vitamin D3 Intermediate",  status: "Awaiting listing"                   },
  { name: "KSM Intermediate",         status: "Signal locked"                      },
];

const D0_RESEARCHER_PRODUCTS = [
  { name: "Lithium Sulfite",          status: "Potential collaboration visibility"  },
  { name: "Novel Catalyst Scaffold",  status: "Awaiting profile activation"        },
  { name: "Peptide Intermediate",     status: "Discovery signals locked"           },
];

function LockedProductCard({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">

      {/* Name + blurred sparkline placeholder */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12.5px] font-bold text-[#1e293b] leading-snug">{name}</p>
          <span className="text-[10px] text-slate-400">No active signals yet</span>
        </div>
        {/* Blurred ghost sparkline */}
        <div className="w-[72px] h-[28px] rounded-lg overflow-hidden relative shrink-0">
          <div className="absolute inset-0 bg-slate-100 rounded-lg"/>
          <svg width="72" height="28" viewBox="0 0 72 28" className="absolute inset-0 opacity-40" style={{ filter: "blur(2px)" }}>
            <path d="M0,22 L12,18 L24,20 L36,14 L48,16 L60,10 L72,8"
              fill="none" stroke="#94a3b8" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="h-px bg-slate-100"/>

      {/* Blurred stats */}
      <div className="flex items-stretch gap-0">
        {[{ lbl: "enquiries" }, { lbl: "RFQs" }, { lbl: "conversion" }].map(({ lbl }, idx) => (
          <div key={lbl} className={`flex flex-col gap-0.5 flex-1 ${idx > 0 ? "pl-3 border-l border-slate-100 ml-3" : ""}`}>
            <div className="h-5 w-8 rounded bg-slate-200" style={{ filter: "blur(3px)" }}/>
            <span className="text-[8.5px] text-slate-400">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Status + mini CTA */}
      <div className="flex items-center justify-between mt-auto">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-medium bg-slate-100 text-slate-400 leading-none">
          🔒 {status}
        </span>
        <button className="flex items-center gap-1 text-[10px] font-semibold text-[#1a6b4f]">
          Add product <ArrowRight size={10} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

export function DemandDiscoveryDay0({ profileType }: { profileType: ProfileType }) {
  const [carouselStart, setCarouselStart] = useState(0);
  const isCRO        = profileType === "cro";
  const primaryColor = isCRO ? "#2F66D0" : "#5B3BA8";
  const products     = isCRO ? D0_CRO_PRODUCTS : D0_RESEARCHER_PRODUCTS;
  const VISIBLE      = 2;
  const canPrev      = carouselStart > 0;
  const canNext      = carouselStart + VISIBLE < products.length;
  const visible      = products.slice(carouselStart, carouselStart + VISIBLE);

  const sectionLabel   = isCRO ? "CATALOGUE DISCOVERY"         : "RESEARCH PRODUCT SIGNALS";
  const sectionTitle   = isCRO
    ? "Buyers Search For Capabilities Through Product Discovery"
    : "Industry Discovery Begins With Your Product Listings";
  const sectionSubtext = isCRO
    ? "List technology-ready and commercially available products to receive qualified procurement enquiries."
    : "List your research-ready products and compounds to unlock visibility across active collaboration searches.";

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* LEFT 65% */}
      <div className="flex-[65] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{sectionLabel}</p>
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              {sectionTitle}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-lg">{sectionSubtext}</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-semibold shrink-0 hover:opacity-75 transition-opacity" style={{ color: primaryColor }}>
            Add Products <ArrowRight size={11} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="px-5 sm:px-6 pt-4 pb-5 relative">
          <div className="flex gap-4">
            {visible.map((p, i) => (
              <LockedProductCard key={carouselStart + i} name={p.name} status={p.status}/>
            ))}
          </div>
          <CarouselNav
            canPrev={canPrev} canNext={canNext} primaryColor={primaryColor}
            dotsCount={products.length - VISIBLE + 1} activeIndex={carouselStart}
            onPrev={() => setCarouselStart(s => Math.max(s - 1, 0))}
            onNext={() => setCarouselStart(s => Math.min(s + 1, products.length - VISIBLE))}
            onDot={i => setCarouselStart(i)}
          />
        </div>
      </div>

      {/* RIGHT 35% */}
      <InsightPanel
        primaryColor={primaryColor}
        heading="Visibility Unlocks After Listing"
        stat={isCRO ? "3×" : "42%"}
        statLabel={isCRO ? "more procurement visibility" : "more discovery interactions"}
        insight={
          isCRO
            ? "CROs with active catalogues receive 3× more procurement visibility from qualified buyers."
            : "Researchers with listed products receive 42% more discovery interactions across platforms."
        }
        ctaLabel="Add Products"
        extraContent={
          <p className="text-[9.5px] text-slate-500 leading-snug -mt-1">
            List technology-ready, in-stock, and collaboration-ready products to increase visibility across industry searches.
          </p>
        }
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAY 1  — live signal cards with sparklines
// ═══════════════════════════════════════════════════════════════════════════════

interface D1Product {
  id:         string;
  name:       string;
  spark:      number[];
  trendPct:   number;
  enquiries:  number;
  badge:      string;
  badgeColor: string;
}

const D1_CRO_PRODUCTS: D1Product[] = [
  { id:"d1-ls-cro",  name:"Lithium Sulfite",         spark:[5,8,9,10,9,11,12,12], trendPct:21, enquiries:12, badge:"High Buyer Interest", badgeColor:"#1a6b4f" },
  { id:"d1-ksm-cro", name:"KSM-47 Intermediate",     spark:[2,3,3,5,4,6,7,7],     trendPct:9,  enquiries:7,  badge:"Active Discovery",    badgeColor:"#2F66D0" },
  { id:"d1-vd3-cro", name:"Vitamin D3 Intermediate", spark:[1,2,2,3,3,4,4,5],     trendPct:5,  enquiries:5,  badge:"Emerging",            badgeColor:"#5B3BA8" },
];

const D1_RESEARCHER_PRODUCTS: D1Product[] = [
  { id:"d1-ls-res",  name:"Lithium Sulfite",      spark:[4,7,6,9,10,11,11,12], trendPct:18, enquiries:12, badge:"Growing Interest", badgeColor:"#1a6b4f" },
  { id:"d1-cat-res", name:"Catalyst Intermediate", spark:[2,3,4,5,5,6,7,8],    trendPct:11, enquiries:8,  badge:"Emerging Demand",  badgeColor:"#2F66D0" },
  { id:"d1-pep-res", name:"Peptide Intermediate",  spark:[1,1,2,2,3,3,3,4],    trendPct:5,  enquiries:4,  badge:"Early Signal",     badgeColor:"#5B3BA8" },
];

function Day1SignalCard({ product, primaryColor }: { product: D1Product; primaryColor: string }) {
  const bbg = product.badgeColor + "18";
  const bbr = product.badgeColor + "33";
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12.5px] font-bold text-[#1e293b] leading-snug">{product.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold" style={{ color: product.badgeColor }}>↗ +{product.trendPct}%</span>
            <span className="text-[9px] text-slate-400">this week</span>
          </div>
        </div>
        <Sparkline points={product.spark} color={product.badgeColor} uid={product.id}/>
      </div>

      <div className="h-px bg-slate-100"/>

      <div className="flex flex-col gap-0.5">
        <span className="text-[22px] font-black text-[#1e293b] leading-none">{product.enquiries}</span>
        <span className="text-[8.5px] text-slate-400">enquiries this week</span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="px-2.5 py-1 rounded-full text-[9.5px] font-semibold leading-none"
          style={{ background: bbg, border: `1px solid ${bbr}`, color: product.badgeColor }}>
          {product.badge}
        </span>
        <button className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: primaryColor }}>
          View Enquiries <ArrowRight size={10} strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

export function DemandDiscoveryDay1({ profileType }: { profileType: ProfileType }) {
  const [carouselStart, setCarouselStart] = useState(0);
  const isCRO        = profileType === "cro";
  const primaryColor = isCRO ? "#2F66D0" : "#5B3BA8";
  const products     = isCRO ? D1_CRO_PRODUCTS : D1_RESEARCHER_PRODUCTS;
  const VISIBLE      = 2;
  const canPrev      = carouselStart > 0;
  const canNext      = carouselStart + VISIBLE < products.length;
  const visible      = products.slice(carouselStart, carouselStart + VISIBLE);

  const sectionLabel   = isCRO ? "CATALOGUE DISCOVERY SIGNALS"  : "RESEARCH DEMAND SIGNALS";
  const sectionTitle   = isCRO
    ? "Buyers Are Actively Discovering Products From Your Catalogue"
    : "Industry Interest Is Building Around Your Listed Products";
  const sectionSubtext = isCRO
    ? "Procurement teams are exploring listed products aligned to current sourcing demand."
    : "Early-stage collaboration signals are emerging across your listed research assets.";
  const rightHeading   = isCRO ? "Buyer Activity Snapshot"      : "Research Visibility Snapshot";
  const totalEvents    = isCRO ? 48                             : 32;
  const eventsLabel    = isCRO ? "product discovery events this week" : "discovery events this week";
  const rightInsight   = isCRO
    ? "Pharma intermediates are seeing accelerated sourcing demand from procurement teams."
    : "Specialty chemistry products are receiving increased collaboration interest.";
  const rightCTA       = isCRO ? "Manage Catalogue"             : "Optimise Listings";

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* LEFT 65% */}
      <div className="flex-[65] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{sectionLabel}</p>
            <h2 className="text-[17px] sm:text-[19px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              {sectionTitle}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-lg">{sectionSubtext}</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-semibold shrink-0 hover:opacity-75 transition-opacity" style={{ color: primaryColor }}>
            See all <ArrowRight size={11} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="px-5 sm:px-6 pt-4 pb-5 relative">
          <div className="flex gap-4">
            {visible.map((product, i) => (
              <Day1SignalCard key={carouselStart + i} product={product} primaryColor={primaryColor}/>
            ))}
          </div>
          <CarouselNav
            canPrev={canPrev} canNext={canNext} primaryColor={primaryColor}
            dotsCount={products.length - VISIBLE + 1} activeIndex={carouselStart}
            onPrev={() => setCarouselStart(s => Math.max(s - 1, 0))}
            onNext={() => setCarouselStart(s => Math.min(s + 1, products.length - VISIBLE))}
            onDot={i => setCarouselStart(i)}
          />
        </div>
      </div>

      {/* RIGHT 35% */}
      <InsightPanel
        primaryColor={primaryColor}
        heading={rightHeading}
        stat={totalEvents}
        statLabel={eventsLabel}
        insight={rightInsight}
        ctaLabel={rightCTA}
      />
    </div>
  );
}
