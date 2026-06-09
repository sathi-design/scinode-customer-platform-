"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Globe, Search,
  Package, Activity, FileText, X,
  MessageSquare, Plus, Info, Zap, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared gradient ──────────────────────────────────────────────────────────
const HERO_BG = "linear-gradient(125deg, #003A1B 0%, #001C08 55%, #000d04 100%)";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return val;
}

// ─── Progress mount hook ──────────────────────────────────────────────────────
function useMounted(delay = 300) {
  const [m, setM] = useState(false);
  useEffect(() => { const t = setTimeout(() => setM(true), delay); return () => clearTimeout(t); }, [delay]);
  return m;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RFQ_CARDS = [
  { flag: "🇮🇳", country: "India",     role: "HEAD OF STRATEGIC SOURCING", product: "Bismuth Citrate",                   request: "Need 15 Kg CIP grade. Please share COA and ISO cert.",                                                     urgency: "Standard",  urgencyColor: "#f59e0b" },
  { flag: "🇩🇪", country: "Germany",   role: "PROCUREMENT MANAGER",       product: "High-Purity Solvents",              request: "Seeking 2-tonne monthly supply. ISO + COA required.",                                                     urgency: "Urgent",    urgencyColor: "#ef4444" },
  { flag: "🇧🇷", country: "Brazil",    role: "SUPPLY CHAIN DIRECTOR",      product: "SLES 70%",                          request: "Regular monthly container shipments. Please share availability and terms.",                               urgency: "Strategic", urgencyColor: "#3b82f6" },
  { flag: "🇯🇵", country: "Japan",     role: "R&D MANAGER",                product: "Methyl Benzoate (CAS: 93-58-3)",    request: "MSDS + TDS needed. 1 kg sample for testing requested.",                                                   urgency: "Standard",  urgencyColor: "#f59e0b" },
  { flag: "🇺🇸", country: "USA",       role: "TECHNICAL PURCHASING LEAD",  product: "Titanium Phosphate",                request: "Surface conditioning agent — quote 200 kg delivered.",                                                    urgency: "Urgent",    urgencyColor: "#ef4444" },
  { flag: "🇦🇺", country: "Australia", role: "FOUNDER & TECH LEAD",        product: "Specialty Semiconductor Chemical",  request: "Looking for manufacturing partner with R&D support for electronics applications.",                        urgency: "Strategic", urgencyColor: "#3b82f6" },
];

const PIPELINE_STAGES = [
  { shortLabel: "MATCHED",    label: "Overall Projects",      monthVal: 186, weekVal: 26, tooltip: "Total Manufacturing Projects Available"                                        },
  { shortLabel: "VIEWED",     label: "Viewed Projects",       monthVal: 62,  weekVal: 9,  tooltip: "Projects you opened and explored for potential interest"                       },
  { shortLabel: "SUBMITTED",  label: "Proposals Submitted",   monthVal: 31,  weekVal: 5,  tooltip: "Projects where you have submitted a proposal"                                  },
  { shortLabel: "DISCUSSING", label: "Active Discussions",    monthVal: 14,  weekVal: 2,  tooltip: "Projects under active discussion"                                              },
  { shortLabel: "ACTIVATED",  label: "Activated",             monthVal: 6,   weekVal: 1,  tooltip: "Projects successfully converted into confirmed manufacturing orders"            },
];

const PROFILE_CATEGORIES = [
  { label: "Company Profile",             pct: 100, color: "linear-gradient(90deg,#B7D77A,#1ABC9C)" },
  { label: "Product Catalogue",           pct: 65,  color: "linear-gradient(90deg,#1ABC9C,#2F66D0)" },
  { label: "Terms & Activation",          pct: 80,  color: "linear-gradient(90deg,#1ABC9C,#29a06a)" },
  { label: "Licenses & Certification",    pct: 38,  color: "linear-gradient(90deg,#2F66D0,#5B3BA8)" },
  { label: "Reactors",                    pct: 55,  color: "linear-gradient(90deg,#2F66D0,#4f46e5)" },
  { label: "Equipment & Infrastructure",  pct: 40,  color: "linear-gradient(90deg,#4f46e5,#5B3BA8)" },
  { label: "EHS Facility Details",        pct: 28,  color: "linear-gradient(90deg,#5B3BA8,#7c5cc4)" },
  { label: "Utilities",                   pct: 50,  color: "linear-gradient(90deg,#1ABC9C,#4f46e5)" },
];

// ─── Profile Sections — rich content for completion modal ────────────────────
type ProfileSectionData = {
  id: string; label: string; emoji: string;
  scoreImpact: string; scoreValue: number;
  completed: boolean; group: "core" | "advanced";
  description: string; buyerRationale: string;
  unlocks: string[]; ctaLabel: string | null;
};
const PROFILE_SECTIONS: ProfileSectionData[] = [
  {
    id: "company", label: "Company Profile", emoji: "🏢",
    scoreImpact: "+10%", scoreValue: 10, completed: true, group: "core",
    description: "Your company overview, manufacturing location, year of establishment, employee count, and key business details — visible to all buyers browsing the platform.",
    buyerRationale: "Buyers validate manufacturing credibility and geographic sourcing fit as their first step. A complete company profile is often the deciding factor for initial shortlisting.",
    unlocks: ["Basic discoverability by 2,400+ active buyers", "Listed in the manufacturing supplier index", "Eligible for general sourcing enquiries"],
    ctaLabel: null,
  },
  {
    id: "products", label: "Product Catalogue", emoji: "📦",
    scoreImpact: "+25%", scoreValue: 25, completed: true, group: "core",
    description: "Your full product listings with CAS numbers, purity specifications, available quantities, packaging options, and application data — the primary surface buyers use to discover you.",
    buyerRationale: "Buyers search by product first, not by company. Your catalogue is your primary discovery surface — incomplete listings reduce match accuracy and reduce your RFQ volume significantly.",
    unlocks: ["Product-level RFQ matching with active buyer demand", "Enquiry notifications for each listed product", "Catalogue indexed in global buyer search"],
    ctaLabel: null,
  },
  {
    id: "terms", label: "Terms & Activation", emoji: "🚀",
    scoreImpact: "+35%", scoreValue: 35, completed: true, group: "core",
    description: "Acceptance of platform participation terms activates your account for full buyer engagement — receiving RFQs, reading buyer messages, and submitting project proposals.",
    buyerRationale: "Activated accounts are trusted, verified participants in the sourcing ecosystem. Buyers can only initiate contact with fully activated suppliers.",
    unlocks: ["Live RFQ delivery to your dashboard", "Read and respond to direct buyer messages", "Submit proposals on open manufacturing projects"],
    ctaLabel: null,
  },
  {
    id: "certifications", label: "Licences & Certifications", emoji: "🏅",
    scoreImpact: "+50%", scoreValue: 50, completed: false, group: "advanced",
    description: "Upload ISO, GMP, FDA, REACH, or other audit certifications relevant to your manufacturing process — displayed as a verified trust signal to buyers across all categories.",
    buyerRationale: "Global buyers filter suppliers by certification readiness before shortlisting — especially for pharma, food-grade, and export-market projects. Missing certifications means missing these projects entirely.",
    unlocks: ["Access to regulated-industry buyers (pharma, nutraceutical, food-grade)", "Premium filter visibility in certification-required searches", "Eligible for export market sourcing projects", "Verified compliance badge on your profile"],
    ctaLabel: "Add Certifications →",
  },
  {
    id: "reactors", label: "Reactors & Capacities", emoji: "⚗️",
    scoreImpact: "+65%", scoreValue: 65, completed: false, group: "advanced",
    description: "Detail your reactor types (SS, glass-lined, HDPE), material of construction, vessel capacities in KL, working volumes, and maximum annual production output.",
    buyerRationale: "Buyers evaluate reactor compatibility and production scale alignment before shortlisting manufacturing partners — especially for multi-batch CMO and CDMO projects.",
    unlocks: ["Capability-based project matching for CMO/CDMO tenders", "Reactor-specific RFQ routing (glass-lined, SS, HDPE)", "Eligible for high-value multi-batch manufacturing contracts", "Scale compatibility matching with buyer volume requirements"],
    ctaLabel: "Add Reactor Details →",
  },
  {
    id: "equipment", label: "Equipments & Infrastructure", emoji: "🏭",
    scoreImpact: "+78%", scoreValue: 78, completed: false, group: "advanced",
    description: "List your process equipment — distillation columns, dryers, centrifuges, filtration units, spray dryers, and specialty process systems used in your manufacturing.",
    buyerRationale: "Detailed infrastructure data signals execution capability for complex chemistry. Buyers use this to assess whether a supplier can handle their specific synthesis pathway.",
    unlocks: ["Custom synthesis project matching based on process fit", "Complex multi-step chemistry and specialty RFQs", "Equipment-specific capability filtering by buyers", "Higher proposal conversion on technical project briefs"],
    ctaLabel: "Add Equipment Details →",
  },
  {
    id: "ehs", label: "EHS Facility Details", emoji: "🛡️",
    scoreImpact: "+90%", scoreValue: 90, completed: false, group: "advanced",
    description: "Highlight your ETP (Effluent Treatment Plant) systems, fire safety certifications, solvent recovery infrastructure, hazardous material handling, and environmental compliance records.",
    buyerRationale: "International buyers increasingly require EHS compliance as a non-negotiable sourcing criterion, especially for regulated markets in the EU, US, and Japan.",
    unlocks: ["Export-grade project access for EU, US, and regulated markets", "International compliance-required tenders", "ESG-conscious buyer matching in premium sourcing programs", "Preferred supplier status in sustainability-linked projects"],
    ctaLabel: "Add Facility Details →",
  },
  {
    id: "utilities", label: "Utilities & Plant Readiness", emoji: "🔥",
    scoreImpact: "+100%", scoreValue: 100, completed: false, group: "advanced",
    description: "Document your chilling plants, boilers, HVAC systems, nitrogen lines, compressed air availability, steam supply, power reliability (captive power, DG backup), and water treatment systems.",
    buyerRationale: "Utility infrastructure determines your ability to handle large-scale, continuous production runs. Buyers assess this for scale-up partnerships and volume manufacturing projects.",
    unlocks: ["Large-scale manufacturing contract eligibility", "Scale-up partnership opportunities with global buyers", "Capacity utilisation projects for production optimisation", "Full Discovery Score — maximum platform visibility"],
    ctaLabel: "Add Utility Details →",
  },
];

const VISIBILITY_SEGMENTS = [
  { label: "Pharma",         count: 48, color: "#1ABC9C" },
  { label: "Spec. Chem",    count: 31, color: "#2F66D0" },
  { label: "Nutraceutical",  count: 27, color: "#5B3BA8" },
  { label: "Other",          count: 18, color: "#B7D77A" },
];

const MAP_PINS = [
  { id: "IN", country: "India",          region: "Mumbai, Western India",   flag: "🇮🇳", left: "67%", top: "48%", tier: "high",     rfqs: 18, contractMfg: 9, cdmo: 6, catalogueLeads: 43 },
  { id: "DE", country: "Germany",        region: "Bavaria",                 flag: "🇩🇪", left: "49%", top: "26%", tier: "rising",   rfqs: 11, contractMfg: 5, cdmo: 4, catalogueLeads: 22 },
  { id: "US", country: "United States",  region: "New Jersey, East Coast",  flag: "🇺🇸", left: "18%", top: "37%", tier: "rising",   rfqs: 9,  contractMfg: 4, cdmo: 3, catalogueLeads: 19 },
  { id: "JP", country: "Japan",          region: "Osaka Prefecture",        flag: "🇯🇵", left: "79%", top: "36%", tier: "emerging", rfqs: 5,  contractMfg: 2, cdmo: 2, catalogueLeads: 11 },
  { id: "BR", country: "Brazil",         region: "São Paulo State",         flag: "🇧🇷", left: "28%", top: "66%", tier: "emerging", rfqs: 4,  contractMfg: 2, cdmo: 1, catalogueLeads: 9  },
  { id: "GB", country: "United Kingdom", region: "Greater London",          flag: "🇬🇧", left: "45%", top: "23%", tier: "emerging", rfqs: 3,  contractMfg: 1, cdmo: 1, catalogueLeads: 7  },
  { id: "CN", country: "China",          region: "Jiangsu Province",        flag: "🇨🇳", left: "74%", top: "40%", tier: "rising",   rfqs: 7,  contractMfg: 4, cdmo: 3, catalogueLeads: 16 },
  { id: "AU", country: "Australia",      region: "New South Wales",         flag: "🇦🇺", left: "80%", top: "67%", tier: "emerging", rfqs: 2,  contractMfg: 1, cdmo: 1, catalogueLeads: 5  },
];

const TIER_CONFIG: Record<string, { label: string; color: string; tooltip: string }> = {
  high:     { label: "High Demand",     color: "#f59e0b", tooltip: "Regions generating the highest volume of relevant demand and opportunities" },
  rising:   { label: "Rising Demand",   color: "#8b5cf6", tooltip: "Regions showing increasing activity and engagement" },
  emerging: { label: "Emerging Demand", color: "#3b82f6", tooltip: "Regions with newly identified opportunities and expanding market interest" },
};

const BUYER_CARDS_DATA = [
  {
    id: "b1",
    flag: "🇩🇪", country: "Germany",
    industry: "Pharma", industryBg: "#EDE8FB", industryColor: "#6237C7",
    title: "High-Purity Solvent Manufacturing Partner",
    demand: "Looking for a reliable high-purity solvent manufacturing partner for 2-tonne monthly supply with consistent batch quality and on-time delivery.",
    spec: ["ISO 9001", "COA Required", "EXW Terms"],
    volume: "2 T / month",
  },
  {
    id: "b2",
    flag: "🇯🇵", country: "Japan",
    industry: "Aroma Chemicals", industryBg: "#FCE8F0", industryColor: "#E36389",
    title: "Aroma Intermediate Supplier — Export Ready",
    demand: "Seeking ISO-certified aroma intermediate supplier with export-ready documentation and air freight capability for a sample-to-scale supply model.",
    spec: ["GMP Certified", "MSDS + TDS", "Air Freight"],
    volume: "50 kg → scale",
  },
  {
    id: "b3",
    flag: "🇧🇷", country: "Brazil",
    industry: "Specialty Chemicals", industryBg: "#E6F3FB", industryColor: "#0077CC",
    title: "Halogenation Chemistry Manufacturing Partner",
    demand: "Need halogenation chemistry manufacturing capability with REACH compliance for B2B surfactant supply chain supporting monthly container volumes.",
    spec: ["REACH Compliant", "Monthly Container", "FOB Terms"],
    volume: "1 container / mo",
  },
  {
    id: "b4",
    flag: "🇺🇸", country: "USA",
    industry: "Battery Materials", industryBg: "#FEF0EB", industryColor: "#FD4923",
    title: "Battery-Grade Lithium Salt Manufacturing Partner",
    demand: "Sourcing a reliable lithium salt manufacturer with battery-grade purity and validated quality systems for EV and energy storage supply chains.",
    spec: ["Battery Grade", "IATF 16949", "DDP Terms"],
    volume: "5 T / quarter",
  },
  {
    id: "b5",
    flag: "🇮🇳", country: "India",
    industry: "Agrochemicals", industryBg: "#E8FBF2", industryColor: "#0E6F5C",
    title: "Agrochemical Intermediate Supplier — Domestic & Export",
    demand: "Seeking manufacturer of agrochemical intermediates with local regulatory clearances and capacity for both domestic distribution and export documentation.",
    spec: ["CIBRC Approved", "SDS Supplied", "DAP Terms"],
    volume: "10 T / month",
  },
  {
    id: "b6",
    flag: "🇬🇧", country: "United Kingdom",
    industry: "Industrial Chemicals", industryBg: "#F3F4F6", industryColor: "#4B5563",
    title: "Custom Industrial Chemical Blending Partner",
    demand: "Looking for a manufacturing partner for custom-blending of industrial cleaning chemicals with COSHH-compliant formulation, labelling and UN packaging.",
    spec: ["COSHH Compliant", "UN Packaging", "FCA Terms"],
    volume: "500 L batches",
  },
];

type InterestState = "idle" | "animating" | "submitted";
type InterestLevel = "High" | "Medium" | "Low";
type MarketStatus  = "Strong Demand" | "Healthy" | "Needs Optimization" | "Early Visibility";

const COUNTRY_FLAGS: Record<string, string> = {
  Germany: "🇩🇪", India: "🇮🇳", Japan: "🇯🇵", Brazil: "🇧🇷",
  USA: "🇺🇸", "United Kingdom": "🇬🇧", China: "🇨🇳", Australia: "🇦🇺",
};

const INTEREST_CFG: Record<InterestLevel, { bg: string; color: string }> = {
  High:   { bg: "#E8FBF2", color: "#0E6F5C" },
  Medium: { bg: "#FBF0C5", color: "#9C5022" },
  Low:    { bg: "#F3F4F6", color: "#4B5563" },
};

const STATUS_CFG: Record<MarketStatus, { bg: string; color: string }> = {
  "Strong Demand":      { bg: "#E6F3FB", color: "#0077CC" },
  "Healthy":            { bg: "#E8FBF2", color: "#0E6F5C" },
  "Needs Optimization": { bg: "#FFEFEF", color: "#C30E1A" },
  "Early Visibility":   { bg: "#F3F4F6", color: "#4B5563" },
};

const PRODUCT_DATA: {
  id: string; name: string; cas: string;
  views: number; interest: InterestLevel; enquiries: number; status: MarketStatus;
  regions: string[]; searchFreq: string; optimization: string; matchedRFQs: string[];
}[] = [
  {
    id: "p1", name: "Triethyl Orthoformate", cas: "122-51-0",
    views: 48, interest: "High", enquiries: 3, status: "Strong Demand",
    regions: ["Germany", "India", "Japan"],
    searchFreq: "18 buyer searches this week",
    optimization: "Add purity grade and packaging variants to attract more RFQs.",
    matchedRFQs: ["Fine Chemicals", "Pharmaceutical Intermediates", "Custom Synthesis"],
  },
  {
    id: "p2", name: "Methyl Benzoate", cas: "93-58-3",
    views: 12, interest: "Low", enquiries: 0, status: "Needs Optimization",
    regions: ["Japan", "United Kingdom"],
    searchFreq: "3 buyer searches this week",
    optimization: "Upload COA and MSDS, specify purity ≥99% to improve shortlisting.",
    matchedRFQs: ["Aroma Chemicals", "Flavour & Fragrance"],
  },
  {
    id: "p3", name: "Sodium Lauryl Sulfate", cas: "151-21-3",
    views: 31, interest: "Medium", enquiries: 1, status: "Healthy",
    regions: ["Brazil", "USA", "India"],
    searchFreq: "9 buyer searches this week",
    optimization: "Upload GMP certificate to qualify for pharmaceutical sourcing.",
    matchedRFQs: ["Surfactants", "Personal Care", "Industrial Cleaning"],
  },
];

const ACTIVE_SEARCHES_D1 = [
  { label: "Specialty Chemicals",  count: 34 },
  { label: "Industrial Chemicals", count: 28 },
  { label: "Agrochemicals",        count: 19 },
  { label: "Pharmaceutical APIs",  count: 15 },
];

const WISDOM_SLIDES = [
  { tag: "Company Profile",          title: "Complete Company Details",    text: "Profiles with complete company details get up to 2.3× more visibility across manufacturing searches.",                                    cta: "Complete Basic Profile",    emoji: "🏭" },
  { tag: "Products",                 title: "List Your Products",          text: "Manufacturers who list their products see 41% higher enquiry activity.",                                                                   cta: "List New Products",         emoji: "📦" },
  { tag: "Licenses & Certifications",title: "Get Certified Faster",        text: "Profiles with ISO, GMP, and audit certificates are shortlisted 35% faster for regulated manufacturing requirements.",                    cta: "Upload Certificates",       emoji: "✅" },
  { tag: "Reactors",                 title: "Add Reactor Capacity",        text: "Manufacturers who added reactor capacities saw up to 32% surge on relevant manufacturing requests.",                                      cta: "Update Reactor Capacity",   emoji: "⚗️" },
  { tag: "Equipment",                title: "Show Your Equipment",         text: "Profiles with equipment details receive more technical-fit enquiries, especially for custom and scale-up projects.",                       cta: "Add Tech Equipment",        emoji: "⚙️" },
  { tag: "EHS Facility",             title: "Safety Infrastructure Wins",  text: "Companies showcasing ETP and fire safety infrastructure attract stronger interest from enterprise and export-focused projects.",           cta: "Add EHS Infrastructure",    emoji: "🔒" },
  { tag: "Utilities",                title: "Utility-Ready Profiles",      text: "Utility-ready profiles are viewed more often for high-volume and continuous production opportunities.",                                   cta: "Configure Utilities",       emoji: "⚡" },
];

const PLATFORM_STATS = [
  { num: 123,  suffix: "+",  label: "MANUFACTURERS\nALREADY ONBOARDED",        thousands: false, decimal: false },
  { num: 29,   suffix: "+",  label: "UNIQUE PROJECTS\nSUCCESSFULLY COMPLETED", thousands: false, decimal: false },
  { num: 591,  suffix: "+",  label: "SUPPLIER REQUIREMENTS\nSHARED",            thousands: false, decimal: false },
  { num: 32,   suffix: "+",  label: "COUNTRIES\nREQUESTING",                    thousands: false, decimal: false },
  { num: 1.2,  suffix: "/5", label: "SUPPLIER\nSATISFACTION",                   thousands: false, decimal: true  },
];

// ─── InfoTip tooltip (portal-based — escapes all overflow clipping) ──────────
function InfoTip({ text, dir = "up" }: { text: string; dir?: "up" | "down" }) {
  const [show, setShow]   = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({
        top:  dir === "down" ? r.bottom + 6 : r.top - 6,
        left: r.left + r.width / 2,
      });
    }
    setShow(true);
  };

  const tooltip = show ? (
    <div
      style={{
        position:  "fixed",
        top:       dir === "down" ? coords.top : "auto",
        bottom:    dir === "up"   ? window.innerHeight - coords.top : "auto",
        left:      coords.left,
        transform: "translateX(-50%)",
        zIndex:    99999,
        width:     180,
        pointerEvents: "none",
      }}
    >
      <div className="bg-[#1e293b] text-white text-[10px] leading-snug rounded-lg px-2.5 py-2 shadow-xl border border-white/10 text-center">
        {text}
        {dir === "down"
          ? <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#1e293b]" />
          : <div className="absolute top-full  left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1e293b]" />
        }
      </div>
    </div>
  ) : null;

  return (
    <div className="inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Info size={11} />
      </button>
      {typeof document !== "undefined" && tooltip
        ? createPortal(tooltip, document.body)
        : null}
    </div>
  );
}

// ─── Brand-gradient gauge ─────────────────────────────────────────────────────
function Gauge({ pct, mounted }: { pct: number; mounted: boolean }) {
  const r  = 68, cx = 105, cy = 100;
  const circumference = Math.PI * r;
  const dash = mounted ? (pct / 100) * circumference : 0;

  return (
    <svg width="100%" viewBox="0 0 210 118" style={{ maxWidth: 200 }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#B7D77A" />
          <stop offset="45%"  stopColor="#1ABC9C" />
          <stop offset="100%" stopColor="#5B3BA8" />
        </linearGradient>
        <linearGradient id="gaugeTextGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1ABC9C" />
          <stop offset="100%" stopColor="#5B3BA8" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s" }} />
      {mounted && (() => {
        const angle = -180 + (pct / 100) * 180;
        const rad   = (angle * Math.PI) / 180;
        const dx    = cx + r * Math.cos(rad);
        const dy    = cy + r * Math.sin(rad);
        return <circle cx={dx} cy={dy} r={6} fill="#5B3BA8" />;
      })()}
      <text x={cx} y={cy - 8}  textAnchor="middle" fontSize={30} fontWeight={800} fill="url(#gaugeTextGrad)">{pct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#94a3b8" letterSpacing={1}>DISCOVERY SCORE</text>
    </svg>
  );
}

// ─── Funnel bars ──────────────────────────────────────────────────────────────
function FunnelView({ mounted, hovIdx, setHovIdx }: { mounted: boolean; hovIdx: number | null; setHovIdx: (i: number | null) => void }) {
  const max = 186;

  const hoverGradients = [
    "linear-gradient(90deg,#1a6b4f,#29a06a)",
    "linear-gradient(90deg,#1a6b4f,#2F66D0)",
    "linear-gradient(90deg,#1ABC9C,#2F66D0)",
    "linear-gradient(90deg,#2F66D0,#4f46e5)",
    "linear-gradient(90deg,#4f46e5,#5B3BA8)",
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {PIPELINE_STAGES.map((s, i) => {
        const w     = mounted ? (s.monthVal / max) * 100 : 0;
        const isHov = hovIdx === i;
        return (
          <div key={i} className="flex items-center gap-3 cursor-pointer"
            onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)}>
            <div className={cn("shrink-0 w-[130px] text-[10.5px] text-right leading-snug transition-colors duration-200",
              isHov ? "font-bold text-[#171717]" : "font-medium text-[#64748b]")}>
              {s.label}
            </div>
            <div className="flex-1 relative h-[14px] rounded-full overflow-hidden" style={{ background: "#edf2f5" }}>
              <div className="absolute left-0 top-0 h-full rounded-full" style={{
                width:           w > 0 ? `${w}%` : "0%",
                opacity:         isHov ? 0 : 1,
                transition:      `width 620ms cubic-bezier(0.25,0.46,0.45,0.94) ${i * 80}ms, opacity 240ms ease`,
                backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)",
              }} />
              <div className="absolute left-0 top-0 h-full rounded-full" style={{
                width:      (isHov && mounted) ? `${w}%` : "0%",
                opacity:    isHov ? 1 : 0,
                transition: "width 350ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 200ms ease",
                background: hoverGradients[i],
              }} />
            </div>
            <div className={cn("shrink-0 w-8 text-right text-[12px] tabular-nums transition-colors duration-200",
              isHov ? "font-bold text-[#171717]" : "font-medium text-[#94a3b8]")}>
              {s.monthVal}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const [tipVisible,      setTipVisible]      = useState(false);
  const [progressMounted, setProgressMounted] = useState(false);
  const [cardIdx,         setCardIdx]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCardIdx(i => (i + 1) % RFQ_CARDS.length), 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  useEffect(() => {
    const t = setTimeout(() => setProgressMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const goTo = (i: number) => { setCardIdx(i); resetTimer(); };

  const metricA = useCountUp(124, 1000, 600);
  const metricB = useCountUp(8,   800,  750);
  const metricC = useCountUp(6,   600,  900);

  const rfq = RFQ_CARDS[cardIdx];

  return (
    <section className="relative overflow-hidden rounded-2xl" style={{ background: HERO_BG }}>
      <style>{`
        @keyframes mfg1-badgeShimmer {
          0%, 100% { background-position: -200% center; }
          50%       { background-position:  200% center; }
        }
        @keyframes mfg1-grid {
          0%, 100% { opacity: 0.025; }
          50%       { opacity: 0.045; }
        }
        @keyframes mfg1-cardFade {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes mfg1-pulse {
          0%,100% { transform:scale(1);opacity:1 }
          50%     { transform:scale(1.4);opacity:0.6 }
        }
      `}</style>

      <div className="pointer-events-none absolute -top-28 left-[28%] w-[420px] h-[420px] rounded-full opacity-[0.18]"
        style={{ background: "radial-gradient(circle,#1db877 0%,transparent 68%)", filter: "blur(72px)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-[0.09]"
        style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)", filter: "blur(48px)" }} />
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-full rounded-r-2xl opacity-[0.22]"
        style={{ background: "radial-gradient(ellipse at top right,#0a3d1e 0%,transparent 70%)" }} />

      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23ffffff' stroke-width='0.4'/%3E%3Ccircle cx='24' cy='24' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
        backgroundSize: "48px 48px",
        animation: "mfg1-grid 7s ease-in-out infinite",
      }} />

      <div className="relative z-10 grid grid-cols-12">

        {/* ══ LEFT 70% ══ */}
        <div className="col-span-12 lg:col-span-8 px-6 pt-4 pb-4 sm:px-8 sm:pt-5 sm:pb-5 flex flex-col justify-between gap-3">

          {/* SCINODE SECURE badge */}
          <div className="relative inline-block self-start">
            <button type="button"
              className="relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] transition-all duration-200"
              style={{ background: "rgba(20,55,30,0.90)" }}
              onMouseEnter={() => setTipVisible(true)}
              onMouseLeave={() => setTipVisible(false)}>
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.11) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "mfg1-badgeShimmer 3.5s ease-in-out infinite",
              }} />
              <span className="relative z-10">🔒</span>
              <span className="relative z-10 font-bold tracking-wide">Scinode Starter</span>
            </button>
            <div className="absolute left-0 top-full mt-2 z-20 w-[220px] pointer-events-none"
              style={{ opacity: tipVisible ? 1 : 0, transform: tipVisible ? "translateY(0)" : "translateY(-4px)", transition: "opacity 200ms ease, transform 200ms ease" }}>
              <div className="bg-[#1e293b] text-white text-[11px] leading-relaxed rounded-[10px] px-3.5 py-2.5 shadow-2xl border border-white/10">
                <div className="absolute bottom-full left-5 border-[5px] border-transparent border-b-[#1e293b]" />
                <p className="font-semibold mb-0.5">Scinode Starter</p>
                <p>You are on your free plan.</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-[20px] sm:text-[23px] md:text-[26px] font-black text-white leading-[1.15] tracking-[-0.02em] mb-1.5"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Turn Manufacturing Capacity Into{" "}
              <span style={{ background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Global Revenue
              </span>
            </h1>
            <p className="text-[12px] leading-relaxed max-w-[520px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              Manufacturers with completed profiles receive <strong className="text-emerald-400">3X more</strong> aligned buyer inquiries within their first 30 days.
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1 max-w-[520px]">
            <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
              <div className="h-full rounded-full" style={{
                width:      progressMounted ? "28%" : "0%",
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 100%)",
                boxShadow:  "0 0 10px rgba(74,222,128,0.50)",
              }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color: "#4ade80" }}>28% Complete — Profile Setup In Progress</span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#002d14] text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:shadow-[0_0_16px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-200 shadow-sm">
              Continue Setup — Add Capabilities <ArrowRight size={13} strokeWidth={2.5} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-white/30 text-[12px] font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.90)" }}>
              Explore Buyer Demand <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ══ RIGHT 30% — RFQ Carousel ══ */}
        <div className="col-span-12 lg:col-span-4 flex overflow-hidden">
          <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
          <div className="flex-1 flex flex-col px-5 pt-4 pb-4 sm:px-6 justify-between gap-3"
            style={{ background: "rgba(0,0,0,0.22)" }}>
            <h3 className="text-white text-[13px] font-bold leading-snug shrink-0" style={{ fontFamily: "Poppins, sans-serif" }}>
              Trending RFQs Matched to Your Category
            </h3>

            <div key={cardIdx} className="flex flex-col gap-1.5 flex-1"
              style={{ animation: "mfg1-cardFade 0.38s ease both" }}>
              <span className="text-[34px] leading-none">{rfq.flag}</span>
              <p className="text-white text-[15px] font-bold leading-snug">{rfq.country}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full border border-emerald-400/25 w-fit"
                style={{ background: "rgba(52,211,153,0.08)" }}>
                <span className="relative flex h-[5px] w-[5px] shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-emerald-400" />
                </span>
                <span className="text-[9px] font-bold text-emerald-300 tracking-[0.12em]">SCINODE VERIFIED</span>
              </div>
              <p className="text-[9px] font-bold tracking-[0.14em]" style={{ color: "rgba(52,211,153,0.80)" }}>{rfq.role}</p>
              <p className="text-white text-[12px] font-semibold">{rfq.product}</p>
              <p className="text-[12px] leading-[1.6] italic flex-1"
                style={{ color: "rgba(255,255,255,0.60)", wordBreak: "break-word", overflow: "hidden" }}>
                &ldquo;{rfq.request}&rdquo;
              </p>
              <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>Updated just now</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {RFQ_CARDS.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`RFQ ${i + 1}`}
                  className="h-[5px] rounded-full transition-all duration-300"
                  style={{ width: i === cardIdx ? 20 : 5, background: i === cardIdx ? "#4ade80" : "rgba(255,255,255,0.22)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 3-column metrics ── */}
      <div className="relative z-10 border-t border-white/[0.07] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 divide-white/[0.07] sm:divide-x sm:divide-white/[0.07]">
        {/* Card 1 */}
        <div className="px-5 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[9px] font-bold tracking-[0.14em] mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
              PROFILE COMPLETENESS
            </p>
            <p className="text-[28px] font-black text-white leading-none tabular-nums">{metricA}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Buyers discovered your manufacturing profile</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(42,203,131,0.18)", color: "#4ade80" }}>+18%</span>
        </div>
        {/* Card 2 */}
        <div className="px-5 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[9px] font-bold tracking-[0.14em] mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
              EXCLUSIVE PROJECT MATCHES
            </p>
            <p className="text-[28px] font-black text-white leading-none tabular-nums">{metricB}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Projects mapped based on your plant</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(98,55,199,0.22)", color: "#a78bfa" }}>MATCHED</span>
        </div>
        {/* Card 3 */}
        <div className="px-5 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[9px] font-bold tracking-[0.14em] mb-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
              CATALOGUE BUYER LEADS
            </p>
            <p className="text-[28px] font-black text-white leading-none tabular-nums">{metricC}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Qualified buyers interested in your catalogue</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(0,119,204,0.22)", color: "#60a5fa" }}>ACTIVE</span>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIPELINE SECTION (left column — no right panel)
// ═══════════════════════════════════════════════════════════════════════════════
function PipelineSection() {
  const [period,      setPeriod]      = useState<"week" | "month">("month");
  const [hoverIdx,    setHoverIdx]    = useState<number | null>(null);
  const [funnelHovIdx, setFunnelHovIdx] = useState<number | null>(null);
  const mounted = useMounted(500);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-slate-400 mb-0.5">OPPORTUNITY FLOW</p>
          <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
            Opportunity Pipeline
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Track proposal activity this month</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "linear-gradient(90deg,#1a6b4f,#2F66D0)" }} />
              <span className="text-[9.5px] text-slate-400 font-medium">Total pipeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)" }} />
              <span className="text-[9.5px] text-slate-400 font-medium">Hover to explore</span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
            {(["week", "month"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200",
                  period === p ? "bg-white text-[#1e293b] shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                This {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nudge banner */}
      <div className="mx-4 mt-2 flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl"
        style={{ background: "linear-gradient(90deg,#e8f5f0 0%,#f0faf5 100%)", border: "1px solid #b6e4d4" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
            style={{ animation: "mfg1-pulse 2.5s ease infinite" }} />
          <p className="text-[13px] font-semibold text-emerald-900 truncate">
            <strong>124 buyer projects</strong> are currently aligned to your manufacturing category.
          </p>
        </div>
        <button className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
          View Matches <ArrowRight size={11} />
        </button>
      </div>

      {/* Stage stat cards with InfoTip */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = period === "week" ? stage.weekVal : stage.monthVal;
            const isHov = hoverIdx === i;
            return (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-1 min-w-0">
                <div
                  className="flex-1 min-w-0 p-1.5 sm:p-2 rounded-xl border cursor-pointer transition-all duration-200 select-none"
                  style={{
                    background:  isHov ? "rgba(26,107,79,0.06)" : "#f8fafc",
                    borderColor: isHov ? "#1a6b4f" : "#e2e8f0",
                    boxShadow:   isHov ? "0 0 0 1px rgba(26,107,79,0.18)" : "none",
                  }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <div className="flex items-start justify-between mb-1 gap-1">
                    <p className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wide leading-snug transition-colors duration-200"
                      style={{ color: isHov ? "#1a6b4f" : "#94a3b8" }}>
                      {stage.label}
                    </p>
                    <InfoTip text={stage.tooltip} dir="down" />
                  </div>
                  <p className="text-[17px] sm:text-[19px] font-black leading-none tabular-nums transition-colors duration-200"
                    style={{ color: isHov ? "#1a6b4f" : "#334155", fontFamily: "Poppins,sans-serif" }}>
                    {count}
                  </p>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 14 14" className="shrink-0 text-slate-300">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel */}
      <div className="px-4 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">PROPOSAL CONVERSION FLOW</p>
        <FunnelView mounted={mounted} hovIdx={funnelHovIdx} setHovIdx={setFunnelHovIdx} />
      </div>

      {/* Pipeline indicator row */}
      <div className="px-4 pb-3 flex items-center justify-end gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ background: "linear-gradient(90deg,#1a6b4f,#2F66D0)" }} />
          <span className="text-[9.5px] font-medium text-slate-400">Total pipeline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundImage: "repeating-linear-gradient(-45deg,#b8c8d2 0px,#b8c8d2 2px,#d4dde3 2px,#d4dde3 8px)" }} />
          <span className="text-[9.5px] font-medium text-slate-400">Hover to explore</span>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="border-t border-slate-100 px-4 py-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[11px] font-bold text-[#1e293b]">Recent Proposals</p>
            <p className="text-[9.5px] text-slate-400 leading-snug">Most recent proposals submitted to active requirements</p>
          </div>
          <button className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-[#1F6F54] hover:opacity-75 transition-opacity">
            View all proposals <ArrowRight size={10} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2 flex flex-col gap-1 hover:border-amber-300 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[8px] border border-amber-300 rounded-full px-1.5 py-[2px] text-amber-700 font-medium leading-none">Draft</span>
                <span className="text-[8px] rounded-full px-1.5 py-[2px] text-white font-bold leading-none" style={{ background: "#0E6F5C" }}>CMO</span>
              </div>
              <span className="text-[8.5px] font-semibold flex items-center gap-1 leading-none text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 bg-amber-400 animate-pulse" />
                Incomplete · Buyer window closes in 18 hrs
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-[#1e293b] leading-snug truncate">
              Manufacturing of a Vitamin D3 Intermediate for Nutraceutical Applications
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[8.5px] text-slate-400 truncate">PRJ-2026-0603 · Vitamin D3 Intermediate VD-07 · Nutraceuticals</p>
              <button className="shrink-0 px-2 py-[3px] rounded-md text-[9px] font-bold text-white transition-colors"
                style={{ background: "#d97706" }}>Complete Now →</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 flex flex-col gap-1 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[8px] border border-slate-200 rounded-full px-1.5 py-[2px] text-slate-400 font-medium leading-none">Proposal</span>
                <span className="text-[8px] rounded-full px-1.5 py-[2px] text-white font-bold leading-none" style={{ background: "#2F66D0" }}>RFQ</span>
              </div>
              <span className="text-[8.5px] font-semibold flex items-center gap-1 leading-none text-slate-400">
                <span className="w-1 h-1 rounded-full inline-block shrink-0 bg-slate-400" />
                Proposals Submitted
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-slate-400 leading-snug truncate">
              Custom bromine derivative for flame retardant application
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[8.5px] text-slate-400 truncate">PRJ-2026-0054 · Tetrabromobisphenol A (TBBPA) · Elemental Derivatives</p>
              <button className="shrink-0 text-[9px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">View →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Location pin SVG ─────────────────────────────────────────────────────────
function LocationPin({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <svg width={active ? 20 : 16} height={active ? 27 : 22} viewBox="0 0 16 22" fill="none"
      style={{ filter: `drop-shadow(0 3px 6px ${color}70)`, transition: "width 200ms ease, height 200ms ease" }}>
      <path d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z"
        fill={color} stroke="rgba(255,255,255,0.50)" strokeWidth="0.8" />
      <circle cx="8" cy="7" r="2.6" fill="white" opacity="0.92" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUR GLOBAL OPPORTUNITY MAP
// ═══════════════════════════════════════════════════════════════════════════════
function WorldRFQMap() {
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"capability" | "catalogue">("capability");
  const mounted = useMounted(200);

  const getVal = (pin: typeof MAP_PINS[0]) =>
    filter === "capability" ? pin.rfqs + pin.contractMfg + pin.cdmo : pin.catalogueLeads;
  const sortedPins = [...MAP_PINS].sort((a, b) => getVal(b) - getVal(a));
  const maxVal     = Math.max(...MAP_PINS.map(getVal));
  const hoveredPin = hovered ? MAP_PINS.find(p => p.id === hovered) : null;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes rfqPinGlow {
          0%,100% { opacity: 0.28; transform: scale(0.80); }
          50%      { opacity: 0.60; transform: scale(1.22); }
        }
        @keyframes tooltipFade {
          from { opacity:0; transform:translateY(4px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1);    }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 mb-0.5">GLOBAL INTELLIGENCE</p>
          <h3 className="text-[16px] font-bold text-slate-900 leading-snug">Your Global Opportunity Map</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Track where your leads are coming from globally.</p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5 self-center">
          {(["capability", "catalogue"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                filter === f ? "bg-white shadow-sm text-[#1e293b]" : "text-slate-500 hover:text-slate-700"
              )}>
              {f === "capability" ? "Capability Based" : "Catalogue Based"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* ── MAP ── */}
        <div className="flex-1 relative" style={{ minHeight: 280 }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #eef2f8 0%, #e8edf5 60%, #eaf0f7 100%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/world-map.svg" alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.55, filter: "brightness(0.68) saturate(0)", objectPosition: "center 40%" }} />

          {/* Pins */}
          {MAP_PINS.map((pin, idx) => {
            const cfg    = TIER_CONFIG[pin.tier];
            const color  = cfg.color;
            const isHov  = hovered  === pin.id;
            const isSel  = selected === pin.id;
            const active = isHov || isSel;
            const tierLabel = `${cfg.label} Region`;

            return (
              <div key={pin.id} className="absolute cursor-pointer"
                style={{ left: pin.left, top: pin.top, transform: "translate(-50%,-100%)", zIndex: active ? 30 : 10 }}
                onMouseEnter={() => setHovered(pin.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s => s === pin.id ? null : pin.id)}>

                {/* Glow ring */}
                <div className="absolute rounded-full pointer-events-none" style={{
                  width: 36, height: 36, top: "40%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle,${color}45 0%,transparent 70%)`,
                  animation: `rfqPinGlow ${3.8 + idx * 0.35}s ease-in-out infinite`,
                  animationDelay: `${idx * 0.22}s`,
                }} />
                <LocationPin color={color} active={active} />

                {/* Tooltip */}
                {isHov && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52"
                    style={{ animation: "tooltipFade 0.16s ease both", zIndex: 40 }}>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                      style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)" }}>

                      {/* Tier header */}
                      <div className="px-3 py-2 flex items-center gap-2" style={{ background: `${color}12`, borderBottom: `1px solid ${color}22` }}>
                        <svg width="8" height="11" viewBox="0 0 16 22" fill="none" className="shrink-0">
                          <path d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z" fill={color} />
                        </svg>
                        <span className="text-[11px] font-bold" style={{ color }}>{tierLabel}</span>
                      </div>

                      {/* Location */}
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[13px]">{pin.flag}</span>
                          <span className="text-[12px] font-semibold text-slate-800">{pin.country}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 pl-0.5">{pin.region}</p>
                      </div>

                      {/* Metrics */}
                      <div className="px-3 py-2.5">
                        {filter === "capability" ? (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">RFQs</span>
                              <span className="text-[11px] font-bold text-slate-800">{pin.rfqs}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">Contract Manufacturing</span>
                              <span className="text-[11px] font-bold text-slate-800">{pin.contractMfg}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">CDMO Projects</span>
                              <span className="text-[11px] font-bold text-slate-800">{pin.cdmo}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Leads for your catalogue</span>
                            <span className="text-[12px] font-bold" style={{ color }}>{pin.catalogueLeads}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Caret */}
                    <div className="flex justify-center -mt-px">
                      <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid white", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2.5 flex-wrap px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(4px)", border: "1px solid rgba(0,0,0,0.07)" }}>
            {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
              const isActiveTier = hoveredPin?.tier === tier;
              return (
                <div key={tier} className="flex items-center gap-1 transition-opacity duration-200"
                  style={{ opacity: hoveredPin && !isActiveTier ? 0.35 : 1 }}>
                  <svg width="8" height="11" viewBox="0 0 16 22" fill="none">
                    <path d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z" fill={cfg.color} />
                  </svg>
                  <span className="text-[9px] font-medium" style={{ color: isActiveTier ? cfg.color : "#64748b" }}>{cfg.label}</span>
                  <InfoTip text={cfg.tooltip} dir="up" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="w-52 shrink-0 border-l border-slate-100 bg-slate-50/40 flex flex-col">
          <div className="px-3 pt-3 pb-2 flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400">TOP MARKETS</p>
              <p className="text-[9px] text-slate-400">
                {filter === "capability" ? "Projects" : "Leads"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {sortedPins.map((pin, i) => {
                const isHov = hovered === pin.id;
                const cfg   = TIER_CONFIG[pin.tier];
                const val   = getVal(pin);
                return (
                  <div key={pin.id} className="cursor-pointer rounded-lg px-2 py-1.5 transition-all duration-200"
                    style={{
                      background:  isHov ? "#fff" : "transparent",
                      borderLeft:  isHov ? `3px solid ${cfg.color}` : "3px solid transparent",
                      boxShadow:   isHov ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                    }}
                    onMouseEnter={() => setHovered(pin.id)}
                    onMouseLeave={() => setHovered(null)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[12px] shrink-0">{pin.flag}</span>
                        <span className="text-[11px] font-semibold text-slate-700 truncate">{pin.country}</span>
                        {i === 0 && (
                          <span className="text-[7px] font-bold px-1 py-[1px] rounded-full shrink-0"
                            style={{ background: `${cfg.color}18`, color: cfg.color }}>#1</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold shrink-0 ml-1" style={{ color: isHov ? cfg.color : "#64748b" }}>{val}</span>
                    </div>
                    <div className="w-full h-[4px] bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: mounted ? `${(val / maxVal) * 100}%` : "0%",
                          background: isHov ? cfg.color : "#cbd5e1",
                          transitionDelay: `${i * 50}ms`,
                        }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2">
            <p className="text-[9px] text-slate-400 mb-1.5">
              {filter === "capability"
                ? "Based on RFQs, contract & CDMO projects"
                : "Based on catalogue views and buyer interest"}
            </p>
            <button className="w-full py-1.5 rounded-xl border border-[#1F6F54] text-[#1F6F54] text-[11px] font-semibold hover:bg-[#1F6F54] hover:text-white transition-all">
              <Globe size={11} className="inline mr-1" /> Get Detailed Demand Insights
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUYER CAROUSEL (no right panel)
// ═══════════════════════════════════════════════════════════════════════════════
function BuyerCard({ buyer }: { buyer: (typeof BUYER_CARDS_DATA)[number] }) {
  const [hovered,  setHovered]  = useState(false);
  const [interest, setInterest] = useState<InterestState>("idle");
  const [showThumb, setShowThumb] = useState(false);

  const handleInterest = () => {
    if (interest !== "idle") return;
    setInterest("animating");
    setShowThumb(true);
    setTimeout(() => { setShowThumb(false); setInterest("submitted"); }, 900);
  };

  const submitted = interest === "submitted";

  return (
    <div className="relative flex flex-col bg-white rounded-2xl overflow-hidden"
      style={{
        border:     submitted ? "1px solid rgba(14,111,92,0.40)" : hovered ? "1px solid #0E6F5C" : "1px solid #E8EDF2",
        boxShadow:  hovered ? "0 8px 28px rgba(14,111,92,0.11),0 2px 8px rgba(0,0,0,0.05)" : submitted ? "0 2px 12px rgba(14,111,92,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform:  hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 220ms ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {submitted && <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: "linear-gradient(90deg,#2ACB83,#0E6F5C)" }} />}
      {showThumb && (
        <div className="absolute bottom-16 left-1/2 text-[28px] z-20 pointer-events-none select-none"
          style={{ animation: "d1-thumbUp 900ms cubic-bezier(0.22,1,0.36,1) forwards" }}>👍</div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[30px] leading-none mb-2">{buyer.flag}</span>
        <p className="text-[14px] font-bold text-[#1e293b] leading-tight">{buyer.country}</p>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2.5">Procurement Request</p>
        <span className="self-start text-[10px] font-semibold px-2.5 py-[4px] rounded-full mb-4"
          style={{ background: buyer.industryBg, color: buyer.industryColor }}>{buyer.industry}</span>
        <div className="flex-1">
          <h4 className="text-[12.5px] font-bold text-[#1e293b] leading-snug mb-2">{buyer.title}</h4>
          <p className="text-[11.5px] leading-relaxed text-slate-500"
            style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            &ldquo;{buyer.demand}&rdquo;
          </p>
        </div>
        <div className="flex flex-wrap gap-1 mt-4 mb-3">
          {buyer.spec.map((s, i) => (
            <span key={i} className="text-[9px] font-medium px-2 py-[3px] rounded-md" style={{ background: "#f1f5f9", color: "#64748b" }}>{s}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Volume Needed</p>
            <p className="text-[13px] font-bold text-[#1e293b] mt-0.5">{buyer.volume}</p>
          </div>
          {submitted && <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#E8FBF2", color: "#0E6F5C" }}>✓ Buyer notified</span>}
        </div>
        <button onClick={handleInterest} disabled={submitted}
          className="w-full py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200"
          style={{ background: submitted ? "linear-gradient(90deg,#2ACB83,#0E6F5C)" : hovered ? "#0d5c45" : "#0E6F5C", color: "#fff", cursor: submitted ? "default" : "pointer" }}>
          {submitted ? "Interest Submitted ✓" : "Show Interest"}
        </button>
      </div>
    </div>
  );
}

function BuyerCarousel() {
  const VISIBLE    = 3;
  const total      = BUYER_CARDS_DATA.length;
  const totalPages = Math.ceil(total / VISIBLE);
  const [page,    setPage]    = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const go = (dir: "prev" | "next") => {
    setPage(p => dir === "prev" ? Math.max(0, p - 1) : Math.min(totalPages - 1, p + 1));
    setAnimKey(k => k + 1);
  };

  const visibleCards = BUYER_CARDS_DATA.slice(page * VISIBLE, (page + 1) * VISIBLE);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <style>{`
        @keyframes d1-thumbUp {
          0%   { transform: translate(-50%, 0)     scale(0.7); opacity: 1; }
          55%  { transform: translate(-50%, -55px) scale(1.4); opacity: 1; }
          100% { transform: translate(-50%, -90px) scale(1);   opacity: 0; }
        }
        @keyframes d1-cardsIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div className="px-5 pt-3 pb-3 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-0.5">BUYER DISCOVERY</p>
          <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
            Buyers already looking for manufacturers like you
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified procurement requests matched to your manufacturing capabilities.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
            {page * VISIBLE + 1}–{Math.min((page + 1) * VISIBLE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => go("prev")} disabled={!canPrev}
              className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200"
              style={{ borderColor: canPrev ? "#e2e8f0" : "#f1f5f9", color: canPrev ? "#475569" : "#cbd5e1", background: canPrev ? "#fff" : "#fafafa" }}>
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <button onClick={() => go("next")} disabled={!canNext}
              className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200"
              style={{ borderColor: canNext ? "#0E6F5C" : "#f1f5f9", color: canNext ? "#0E6F5C" : "#cbd5e1", background: canNext ? "#E8FBF2" : "#fafafa" }}>
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <button className="flex items-center gap-1 text-[11px] font-semibold text-[#0E6F5C] hover:opacity-70 transition-opacity whitespace-nowrap">
            See all <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div key={animKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1"
          style={{ animation: "d1-cardsIn 280ms ease both" }}>
          {visibleCards.map(buyer => <BuyerCard key={buyer.id} buyer={buyer} />)}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => { setPage(i); setAnimKey(k => k + 1); }} aria-label={`Page ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ width: i === page ? 20 : 6, height: 6, background: i === page ? "#0E6F5C" : "#e2e8f0" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT INSIGHT DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function ProductInsightDrawer({ product, onClose }: { product: (typeof PRODUCT_DATA)[0]; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 16); return () => clearTimeout(t); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };
  const scfg = STATUS_CFG[product.status];
  const icfg = INTEREST_CFG[product.interest];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={close}
      style={{ background: visible ? "rgba(2,2,2,0.42)" : "rgba(2,2,2,0)", transition: "background 300ms ease" }}>
      <div className="relative h-full w-[380px] max-w-[92vw] bg-white flex flex-col" onClick={e => e.stopPropagation()}
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)", boxShadow: "-8px 0 48px rgba(0,0,0,0.14)" }}>
        <div className="h-[3px] shrink-0" style={{ background: `linear-gradient(90deg,${scfg.color},${scfg.color}55)` }} />
        <div className="px-5 pt-4 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[8.5px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-1">PRODUCT INTELLIGENCE</p>
            <h3 className="text-[14.5px] font-bold text-[#1e293b] leading-snug">{product.name}</h3>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">CAS {product.cas}</p>
          </div>
          <button onClick={close} className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors shrink-0">
            <X size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: scfg.bg, color: scfg.color }}>{product.status}</span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: icfg.bg, color: icfg.color }}>{product.interest} Interest</span>
          </div>
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">ACTIVE BUYER REGIONS</p>
            <div className="flex flex-col gap-1.5">
              {product.regions.map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: "#f8fafc" }}>
                  <span className="text-[17px] leading-none">{COUNTRY_FLAGS[r] ?? "🌐"}</span>
                  <span className="text-[12px] font-medium text-[#1e293b]">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">SEARCH FREQUENCY</p>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #edf2f7" }}>
              <Search size={14} className="text-slate-400 shrink-0" />
              <p className="text-[12px] font-semibold text-[#1e293b]">{product.searchFreq}</p>
            </div>
          </div>
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">SUGGESTED OPTIMIZATION</p>
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl" style={{ background: "#E6F3FB", borderLeft: "3px solid #0077CC" }}>
              <span className="text-[14px] shrink-0 mt-0.5">💡</span>
              <p className="text-[12px] text-[#1e293b] font-medium leading-snug">{product.optimization}</p>
            </div>
          </div>
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">MATCHING RFQ CATEGORIES</p>
            <div className="flex flex-wrap gap-1.5">
              {product.matchedRFQs.map((cat, i) => (
                <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-md" style={{ background: "#EDE8FB", color: "#6237C7" }}>{cat}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <button className="w-full py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(90deg,#1F6F54,#27915e)" }}>Optimize This Product →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT PERFORMANCE (no right panel)
// ═══════════════════════════════════════════════════════════════════════════════
function ProductPerformanceSection() {
  // Day 1 defaults to "Full Intel" — user is post-onboarding with products indexed
  const [demoState,   setDemoState]   = useState<0 | 1 | 2>(2);
  const [openProduct, setOpenProduct] = useState<(typeof PRODUCT_DATA)[0] | null>(null);
  const [hoveredRow,  setHoveredRow]  = useState<string | null>(null);
  const mounted = useMounted(400);

  const vListed   = useCountUp(3,  600, 200);
  const vEnq      = useCountUp(6,  700, 350);
  const vInterest = useCountUp(91, 900, 500);

  const maxViews    = Math.max(...PRODUCT_DATA.map(p => p.views));
  const starProduct = PRODUCT_DATA[0];

  const DEMO_TABS: Array<{ label: string; bg: string; color: string; border: string }> = [
    { label: "0 Listed",        bg: "#FEF0EB", color: "#FD4923", border: "rgba(253,73,35,0.30)"  },
    { label: "Catalogue Added", bg: "#E8FBF2", color: "#1F6F54", border: "rgba(42,203,131,0.35)" },
    { label: "Full Intel",      bg: "#E6F3FB", color: "#0077CC", border: "rgba(0,119,204,0.30)"  },
  ];

  // Day 0 demo products used for states 0 & 1
  const DEMO_PRODUCTS_D1 = [
    { name: "Triethyl Orthoformate", cas: "122-51-0", views: 48, interest: "High",   interestColor: "#0F7614", interestBg: "#B2F3B7", enquiries: 3    },
    { name: "Methyl Benzoate",       cas: "93-58-3",  views: 12, interest: "Low",    interestColor: "#4B5563", interestBg: "#F3F4F6", enquiries: null  },
    { name: "Sodium Lauryl Sulfate", cas: "151-21-3", views: 31, interest: "Medium", interestColor: "#9C5022", interestBg: "#FBF0C5", enquiries: 1    },
    { name: "Benzyl Alcohol",        cas: "100-51-6", views: 19, interest: "Low",    interestColor: "#4B5563", interestBg: "#F3F4F6", enquiries: null  },
    { name: "Ethyl Acetate",         cas: "141-78-6", views: 27, interest: "Medium", interestColor: "#9C5022", interestBg: "#FBF0C5", enquiries: 2    },
  ];

  return (
    <>
      {openProduct && <ProductInsightDrawer product={openProduct} onClose={() => setOpenProduct(null)} />}

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible flex flex-col">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-0.5">CATALOGUE SIGNALS</p>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1e293b]" style={{ fontFamily: "Poppins,sans-serif" }}>
              {demoState === 2 ? "How Your Products Are Performing" : "Showcase Your Products to Get Noticed"}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {demoState === 0 && "Add your product catalogue to unlock the right demand."}
              {demoState === 1 && "Your catalogue is indexed — performance intel coming within 24–48 hrs."}
              {demoState === 2 && "Buyer activity across your listed products this week. Add more catalogue depth to improve discovery."}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            {DEMO_TABS.map((tab, i) => (
              <button key={i} onClick={() => setDemoState(i as 0 | 1 | 2)}
                className="text-[9px] font-bold px-2.5 py-[4px] rounded-full transition-all whitespace-nowrap"
                style={{
                  background:  demoState === i ? tab.bg    : "#f9fafb",
                  color:       demoState === i ? tab.color : "#9ca3af",
                  border:      `1px solid ${demoState === i ? tab.border : "#e5e7eb"}`,
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ STATE 0 — Zero products ════════════════════════════════ */}
        {demoState === 0 && (
          <div className="p-5 flex flex-col gap-4">
            {/* Benefit strip */}
            <div className="rounded-xl p-3.5" style={{ background: "rgba(42,203,131,0.05)", border: "1px solid rgba(42,203,131,0.18)" }}>
              <p className="text-[10px] font-bold text-[#1F6F54] mb-2.5">📦 Why your product catalogue matters</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { metric: "3×",  label: "more RFQ matches with a complete catalogue"               },
                  { metric: "96",  label: "buyers searched your category this week"                  },
                  { metric: "65%", label: "of matched opportunities rely on product-level information"},
                ].map((b, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[22px] font-black leading-none" style={{ color: "#1F6F54" }}>{b.metric}</span>
                    <span className="text-[9.5px] text-slate-400 leading-snug">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Live searches */}
            <div className="rounded-xl border border-slate-100 p-3.5" style={{ background: "#fafafa" }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Live Demand Activity In Your Industry – This Week</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVE_SEARCHES_D1.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                    style={{ background: "#1F6F54", color: "#ffffff" }}>
                    <span>{s.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: "rgba(255,255,255,0.20)" }}>{s.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10.5px] text-slate-400 mt-2.5"><span className="font-semibold text-[#1F6F54]">96 buyers</span> searched your industry this week. List products to appear in their results.</p>
            </div>
            {/* Empty CTA */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-8 px-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 px-4 pt-3 select-none pointer-events-none" style={{ filter: "blur(4px)", opacity: 0.18 }}>
                {DEMO_PRODUCTS_D1.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.cas}</p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{p.views} views</span>
                  </div>
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: "#dff3ee" }}>
                  <Package size={22} style={{ color: "#1f6f54" }} />
                </div>
                <p className="text-[13px] font-bold text-slate-700 mb-1">No products listed yet</p>
                <p className="text-[11px] text-slate-400 mb-2 max-w-[240px] leading-snug">Add your product catalogue to unlock relevant projects and demand visibility.</p>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full mb-4 inline-block" style={{ background: "#fef3c7", color: "#92400e" }}>⚡ Add min. 1 product to complete onboarding</span>
                <button className="flex items-center gap-2 px-5 py-2.5 text-white text-[13px] font-bold rounded-xl hover:brightness-110 transition-all" style={{ background: "#1F6F54" }}>
                  <Plus size={15} /> Add Your Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STATE 1 — Catalogue added, indexing ════════════════════ */}
        {demoState === 1 && (
          <div className="p-5 flex flex-col gap-4">
            <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#FBF0C5", border: "1px solid rgba(156,80,34,0.25)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(156,80,34,0.12)" }}>
                <span className="text-[17px]">⏳</span>
              </div>
              <div>
                <p className="text-[12px] font-bold mb-0.5" style={{ color: "#9C5022" }}>Catalogue indexing in progress</p>
                <p className="text-[11px] leading-snug" style={{ color: "#92400e" }}>Our team is reviewing your products. Buyer matching and performance intel will be live within <span className="font-semibold">24–48 hrs</span>.</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.10em] text-slate-400">Your Products</p>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#E8FBF2", color: "#1F6F54" }}>5 Listed</span>
              </div>
              <div className="grid grid-cols-12 px-3 py-2 rounded-lg text-[8.5px] font-bold uppercase tracking-wide text-slate-400" style={{ background: "#f9fafb" }}>
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Status</span>
                <span className="col-span-2 text-center">Views</span>
                <span className="col-span-2 text-center">Enquiries</span>
              </div>
              {DEMO_PRODUCTS_D1.map((p, i) => (
                <div key={i} className="grid grid-cols-12 px-3 py-2.5 rounded-xl border border-slate-100 items-center hover:bg-slate-50 transition-all">
                  <div className="col-span-6 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[9px] font-mono text-slate-400">CAS {p.cas}</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="text-[8px] font-bold px-2 py-[3px] rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>Indexing</span>
                  </div>
                  <div className="col-span-2 text-center"><span className="text-[12px] font-bold text-slate-200">—</span></div>
                  <div className="col-span-2 text-center"><span className="text-[12px] font-bold text-slate-200">—</span></div>
                </div>
              ))}
              <p className="text-[10.5px] text-slate-400 mt-1">📊 Views, buyer interest, and enquiry data will appear once indexing is complete.</p>
            </div>
          </div>
        )}

        {/* ══ STATE 2 — Full Intel (Day 1 default) ═══════════════════ */}
        {demoState === 2 && (
          <div className="p-5 flex flex-col gap-4">
            {/* Compact stats cards — same as Day 0 */}
            <div className="grid grid-cols-4 gap-2">
              {/* Star Product */}
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border"
                style={{ borderColor: "rgba(42,203,131,0.30)", background: "rgba(42,203,131,0.04)" }}>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">⭐</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400 leading-tight">STAR PRODUCT</span>
                  <InfoTip text="Product receiving the highest buyer demand and platform traffic" dir="down" />
                </div>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">{starProduct.name}</p>
                <button className="self-start text-[9px] font-bold flex items-center gap-0.5 hover:opacity-70 transition-opacity"
                  style={{ color: "#0E6F5C" }}>
                  Boost Demand <ArrowRight size={8} strokeWidth={2.5} />
                </button>
              </div>
              {/* Products Listed */}
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">📊</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400">PRODUCTS LISTED</span>
                  <InfoTip text="Total products active in your catalogue" dir="down" />
                </div>
                <p className="text-[22px] font-black leading-tight text-slate-900 tabular-nums"
                  style={{ fontFamily: "Poppins,sans-serif" }}>{vListed}</p>
                <p className="text-[9px] text-slate-400">Active catalogue</p>
              </div>
              {/* Product Enquiries */}
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">💬</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400">PRODUCT ENQUIRIES</span>
                  <InfoTip text="Enquiries received across all listed products" dir="down" />
                </div>
                <p className="text-[22px] font-black leading-tight text-slate-900 tabular-nums"
                  style={{ fontFamily: "Poppins,sans-serif" }}>{vEnq}</p>
                <p className="text-[9px] text-slate-400">Requests received</p>
              </div>
              {/* Buyer Signals */}
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">⚡</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400">BUYER SIGNALS</span>
                  <InfoTip text="Combined product views and engagement from buyers" dir="down" />
                </div>
                <p className="text-[22px] font-black leading-tight text-slate-900 tabular-nums"
                  style={{ fontFamily: "Poppins,sans-serif" }}>{vInterest}</p>
                <p className="text-[9px] text-slate-400">Views with intent</p>
              </div>
            </div>

            {/* Product performance table */}
            <div className="flex flex-col">
              {/* Table header */}
              <div className="grid grid-cols-12 px-3 py-2 rounded-lg mb-1 text-[8.5px] font-bold uppercase tracking-wide text-slate-400"
                style={{ background: "#f9fafb" }}>
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Views</span>
                <span className="col-span-3 text-center">Buyer Interest</span>
                <span className="col-span-2 text-center">Enquiries</span>
              </div>
              {/* Table rows */}
              {PRODUCT_DATA.map((product, i) => {
                const icfg  = INTEREST_CFG[product.interest];
                const barW  = (product.views / maxViews) * 100;
                const isHov = hoveredRow === product.id;
                return (
                  <div key={product.id}
                    className="grid grid-cols-12 px-3 py-3 border-b border-slate-50 items-center cursor-pointer transition-all duration-200"
                    style={{
                      borderLeft:  `3px solid ${isHov ? "#2ACB83" : i === 0 ? "#2ACB83" : "transparent"}`,
                      background:  isHov ? "#f6fdf9" : "transparent",
                      paddingLeft: isHov || i === 0 ? "calc(0.75rem - 3px)" : "0.75rem",
                    }}
                    onMouseEnter={() => setHoveredRow(product.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => setOpenProduct(product)}>
                    <div className="col-span-5 min-w-0 pr-2">
                      <p className="text-[12px] font-semibold text-[#1e293b] leading-snug truncate">{product.name}</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">CAS {product.cas}</p>
                    </div>
                    <div className="col-span-2 flex flex-col items-center gap-1">
                      <span className="text-[13px] font-black text-slate-700 tabular-nums">{product.views}</span>
                      <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "#e9ecef" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: mounted ? `${barW}%` : "0%", background: "#2ACB83" }} />
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <span className="text-[9.5px] font-semibold px-2.5 py-[4px] rounded-full whitespace-nowrap"
                        style={{ background: icfg.bg, color: icfg.color }}>{product.interest}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[13px] font-black tabular-nums"
                        style={{ color: product.enquiries === 0 ? "#94a3b8" : "#1e293b" }}>
                        {product.enquiries === 0 ? "—" : product.enquiries}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <p className="text-[10.5px] text-slate-400 leading-snug">
                Complete listings drive <span className="font-bold text-slate-700">2.7× more</span> matched opportunities.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-3.5 py-1.5 rounded-xl border text-[10.5px] font-bold transition-all hover:bg-[#f0fdf4]"
                  style={{ borderColor: "#0E6F5C", color: "#0E6F5C" }}>
                  Optimize Catalogue
                </button>
                <button className="px-3.5 py-1.5 rounded-xl text-white text-[10.5px] font-bold transition-all hover:brightness-110"
                  style={{ background: "#0E6F5C" }}>
                  Add More Products
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM STATS
// ═══════════════════════════════════════════════════════════════════════════════
function PlatformStatsSection() {
  const [counts,     setCounts]     = useState(PLATFORM_STATS.map(() => 0));
  const animatingRef = useRef(false);
  const rafRef       = useRef<number | undefined>(undefined);

  const runAnimation = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const duration = 1400;
    const start    = performance.now();
    const tick     = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCounts(PLATFORM_STATS.map(s => s.decimal ? Math.round(s.num * eased * 10) / 10 : Math.floor(s.num * eased)));
      if (progress < 1) { rafRef.current = requestAnimationFrame(tick); } else { animatingRef.current = false; }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const t = setTimeout(runAnimation, 400);
    return () => { clearTimeout(t); if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current); };
  }, [runAnimation]);

  const fmt = (count: number, s: typeof PLATFORM_STATS[0]) => {
    if (s.decimal) return count.toFixed(1) + s.suffix;
    return String(count) + s.suffix;
  };

  return (
    <section className="bg-[#0d1117] rounded-2xl px-4 py-8 sm:px-8 sm:py-10" onMouseEnter={runAnimation}>
      <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.25em] mb-8">What&apos;s Happening on the Platform</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
        {PLATFORM_STATS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tabular-nums leading-none">{fmt(counts[i], s)}</span>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider leading-[1.6] whitespace-pre-line">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT CTA
// ═══════════════════════════════════════════════════════════════════════════════
function ExpertContainerIcon() {
  return (
    <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="mfg1-expert-mask" fill="white">
        <path d="M0 96C0 42.9807 42.9807 0 96 0C149.019 0 192 42.9807 192 96C192 149.019 149.019 192 96 192C42.9807 192 0 149.019 0 96Z"/>
      </mask>
      <path d="M0 96C0 42.9807 42.9807 0 96 0C149.019 0 192 42.9807 192 96C192 149.019 149.019 192 96 192C42.9807 192 0 149.019 0 96Z" fill="url(#mfg1-expert-grad)"/>
      <path d="M0 96M192 96M192 96M0 96M96 0M192 96M96 192M0 96M96 192V191C43.533 191 1 148.467 1 96H0H-1C-1 149.572 42.4284 193 96 193V192ZM192 96H191C191 148.467 148.467 191 96 191V192V193C149.572 193 193 149.572 193 96H192ZM96 0V1C148.467 1 191 43.533 191 96H192H193C193 42.4284 149.572 -1 96 -1V0ZM96 0V-1C42.4284 -1 -1 42.4284 -1 96H0H1C1 43.533 43.533 1 96 1V0Z" fill="white" fillOpacity="0.1" mask="url(#mfg1-expert-mask)"/>
      <path d="M109.333 126V119.333C109.333 115.797 107.929 112.406 105.428 109.905C102.928 107.405 99.5362 106 96 106H76C72.4637 106 69.0724 107.405 66.5719 109.905C64.0714 112.406 62.6666 115.797 62.6666 119.333V126" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M109.333 66.4268C112.193 67.168 114.725 68.8376 116.532 71.1736C118.34 73.5096 119.321 76.3797 119.321 79.3334C119.321 82.2871 118.34 85.1572 116.532 87.4932C114.725 89.8292 112.193 91.4989 109.333 92.2401" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M129.333 126V119.334C129.331 116.379 128.348 113.51 126.538 111.175C124.728 108.84 122.194 107.172 119.333 106.434" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M86 92.6667C93.3638 92.6667 99.3333 86.6971 99.3333 79.3333C99.3333 71.9695 93.3638 66 86 66C78.6362 66 72.6666 71.9695 72.6666 79.3333C72.6666 86.6971 78.6362 92.6667 86 92.6667Z" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="mfg1-expert-grad" x1="37.5" y1="40" x2="155" y2="165.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0172E7" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#2DD17C" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ExpertCTASection() {
  return (
    <section className="relative overflow-hidden rounded-[16px] px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10"
      style={{ background: "linear-gradient(135deg, #003A1B 0%, #001C08 100%)" }}>
      <div className="pointer-events-none absolute right-[200px] top-[60px] w-[256px] h-[256px] rounded-full"
        style={{ background: "rgba(42,203,131,0.10)", filter: "blur(64px)" }} />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative shrink-0 w-[45px] h-[45px]">
              <div className="absolute inset-0 rounded-[8px]"
                style={{ background: "linear-gradient(135deg, rgba(247,254,231,0.50) 0%, rgba(247,254,231,0.10) 100%)" }} />
              <div className="absolute top-[10px] left-[10px] text-white/80"><MessageSquare size={22} /></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-[20px] font-semibold leading-[28px] tracking-[-0.005em]" style={{ fontFamily: "Poppins, sans-serif" }}>
                Talk to a Manufacturing Expert
              </h3>
              <p className="text-slate-400 text-[15px] font-normal leading-[24px]">Get expert guidance on setting up your capabilities.</p>
            </div>
          </div>
          <p className="text-slate-300 text-[15px] font-normal leading-[24px] mb-6 max-w-[680px]">
            Not sure how to get started or increase enquiries? Our team can guide you on setting up your profile, improving visibility, and connecting with the right opportunities.
          </p>
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-white text-sm font-medium transition-colors"
              style={{ background: "#1f6f54" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#185C45")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#1f6f54")}>
              <Plus size={16} />
              Schedule a Call
            </button>
            <div className="flex items-center gap-[10px]">
              <span className="relative flex h-[10px] w-[10px] shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-emerald-400" />
              </span>
              <span className="text-slate-400 text-[14px]">Available now</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block shrink-0">
          <ExpertContainerIcon />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT SIDEBAR — CARD 1: PROFILE PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
function ProfilePerformanceCard({ onOpen }: { onOpen?: () => void }) {
  const router = useRouter();
  const mounted = useMounted(500);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
      <p className="text-[9px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-0.5">MANUFACTURING PROFILE SIGNAL</p>
      <h3 className="text-[15px] font-bold text-[#1e293b] mb-2" style={{ fontFamily: "Poppins,sans-serif" }}>Profile Performance</h3>

      {/* Discovery Score gauge */}
      <div className="flex justify-center mb-2">
        <Gauge pct={86} mounted={mounted} />
      </div>

      {/* 8 profile factor bars — flex-1 fills remaining height */}
      <div className="flex flex-col justify-between flex-1 gap-1.5">
        {PROFILE_CATEGORIES.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-slate-500 font-medium leading-tight">{c.label}</span>
              <span className="text-[10px] font-bold text-[#1e293b] tabular-nums">{c.pct}%</span>
            </div>
            <div className="w-full h-[5px] bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: mounted ? `${c.pct}%` : "0%",
                  background: c.color,
                  transitionDelay: `${i * 80 + 500}ms`,
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity value CTA */}
      <div className="mt-3 rounded-xl px-4 py-4" style={{ background: "#0d1117", border: "1px solid rgba(245,200,66,0.20)" }}>
        <p className="text-[9px] font-bold tracking-[0.10em] text-slate-400 mb-2.5">OPPORTUNITY VALUE</p>
        <p className="text-[11px] text-slate-300 leading-snug mb-2">Incomplete profile may be costing an estimated</p>
        <p className="text-[30px] font-black text-white leading-none mb-1">
          $50,000<span className="text-[13px] font-semibold text-slate-400">/mo</span>
        </p>
        <p className="text-[10px] text-slate-500">in missed buyer opportunities.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT SIDEBAR — CARD 2: MARKET PULSE
// ═══════════════════════════════════════════════════════════════════════════════
const MARKET_PULSE_WHAT_YOU_GET = [
  { icon: "📈", label: "Demand Trends",        sub: "Buyer demand signals matched to your product category"  },
  { icon: "🔄", label: "Trade Activity",        sub: "Active import/export route data & flow patterns"        },
  { icon: "💰", label: "Pricing Signals",       sub: "Live pricing intelligence across global trade lanes"    },
  { icon: "🏭", label: "Competitor Landscape",  sub: "Anonymous benchmarking against similar manufacturers"   },
  { icon: "⚠️", label: "Regulatory Risks",      sub: "Compliance alerts impacting your product segments"      },
];

function MarketPulseRightCard({ embedded = false }: { embedded?: boolean }) {
  const inner = (
    <div className="flex flex-col flex-1 h-full">

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <h3 className="text-[15px] font-bold text-[#0e3d24] mb-1" style={{ fontFamily: "Poppins,sans-serif" }}>
          Market Pulse 🚀
        </h3>
        <p className="text-[11px] leading-relaxed" style={{ color: "#2d6a4f" }}>
          Intelligence on buyer demand, pricing shifts, trade flows, and export opportunities — matched to your category.
        </p>
      </div>

      {/* ── What You'll Get — flex-1 absorbs extra height ── */}
      <div className="px-4 py-3 flex-1 flex flex-col" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] mb-2.5" style={{ color: "#2d6a4f" }}>
          WHAT YOU'LL GET
        </p>
        <div className="flex flex-col justify-between flex-1">
          {MARKET_PULSE_WHAT_YOU_GET.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5">
              <span className="text-[14px] shrink-0 mt-[1px] leading-none">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight" style={{ color: "#0e3d24" }}>{item.label}</p>
                <p className="text-[9.5px] leading-snug mt-[2px]" style={{ color: "#4b7a62" }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── This Week on Market Pulse — pills ── */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] mb-2.5" style={{ color: "#2d6a4f" }}>
          THIS WEEK ON MARKET PULSE
        </p>
        <div className="flex flex-col gap-2">

          {/* Snapshots pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-full"
            style={{ background: "rgba(42,203,131,0.1)", border: "1px solid rgba(42,203,131,0.25)" }}>
            <span className="text-[13px] shrink-0">📸</span>
            <span className="text-[10.5px] font-semibold flex-1 leading-tight" style={{ color: "#0e3d24" }}>Snapshots Generated</span>
            <span className="text-[11px] font-black tabular-nums shrink-0" style={{ color: "#0e3d24", fontFamily: "Poppins,sans-serif" }}>0 / 5</span>
            <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(42,203,131,0.2)", color: "#1F6F54" }}>FREE</span>
          </div>

          {/* Detailed Reports pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-full"
            style={{ background: "rgba(0,119,204,0.07)", border: "1px solid rgba(0,119,204,0.2)" }}>
            <span className="text-[13px] shrink-0">📄</span>
            <span className="text-[10.5px] font-semibold flex-1 leading-tight" style={{ color: "#0c3460" }}>Detailed Reports</span>
            <span className="text-[11px] font-black tabular-nums shrink-0" style={{ color: "#0c3460", fontFamily: "Poppins,sans-serif" }}>0 / 1</span>
            <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "rgba(0,119,204,0.12)", color: "#0077CC" }}>FREE</span>
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-4 py-3">
        <button className="w-full py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#2ACB83", color: "#020202" }}>
          GENERATE MARKET SNAPSHOT
        </button>
        <p className="text-center text-[9px] mt-1.5" style={{ color: "#4b7a62" }}>4 snapshots remaining this week</p>
      </div>

    </div>
  );

  if (embedded) return <div className="flex flex-col flex-1">{inner}</div>;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#f0fdf6", border: "1px solid rgba(42,203,131,0.25)" }}>
      {inner}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT SIDEBAR — CARD 3: SCINODE WISDOM
// ═══════════════════════════════════════════════════════════════════════════════
function ScimplifyWisdomCarousel() {
  const [slide,    setSlide]    = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [paused,   setPaused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const GREEN = "#2ACB83";

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(s => (s + 1) % WISDOM_SLIDES.length);
      setSlideKey(k => k + 1);
    }, 6000);
  }, []);

  useEffect(() => {
    if (!paused) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, startTimer]);

  const goTo = (i: number) => { setSlide(i); setSlideKey(k => k + 1); startTimer(); };
  const current = WISDOM_SLIDES[slide];

  // Staggered animation helper
  const fadeUp = (delay: number): React.CSSProperties => ({
    animation: `wisdom-up 420ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
  });

  return (
    <div className="flex flex-col h-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
      <style>{`
        @keyframes wisdom-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes wisdom-emoji-in {
          from { opacity: 0; transform: scale(0.80); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes wisdom-bar {
          from { width: 0; opacity: 0; }
          to   { width: 2rem; opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[8.5px] font-bold tracking-[0.24em] mb-0.5" style={{ color: GREEN }}>SCINODE WISDOM</p>
        <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.50)" }}>Expert insights of the day</p>
      </div>

      {/* ── Slide content — staggered entry per element ── */}
      <div key={slideKey} className="px-4 pt-4 pb-2 flex flex-col flex-1">

        {/* Counter + TAG */}
        <div className="flex items-center justify-between mb-3" style={fadeUp(0)}>
          <p className="text-[8px] font-bold tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>
            {String(slide + 1).padStart(2, "0")} / {String(WISDOM_SLIDES.length).padStart(2, "0")}
          </p>
          <span className="text-[8px] font-bold tracking-[0.10em] px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(42,203,131,0.13)", color: GREEN, border: "1px solid rgba(42,203,131,0.28)" }}>
            {current.tag.toUpperCase()}
          </span>
        </div>

        {/* Emoji — smooth scale-in, no bounce */}
        <span className="text-[40px] leading-none mb-3 block"
          style={{ animation: `wisdom-emoji-in 380ms cubic-bezier(0.22,1,0.36,1) 60ms both` }}>
          {current.emoji}
        </span>

        {/* Title */}
        <h3 className="text-[17px] font-black text-white leading-tight mb-2.5" style={{ ...fadeUp(120), fontFamily: "Poppins,sans-serif" }}>
          {current.title}
        </h3>

        {/* Quote — high contrast */}
        <p className="text-[13px] leading-[1.75] flex-1" style={{ ...fadeUp(190), color: "rgba(255,255,255,0.80)" }}>
          {current.text}
        </p>

        {/* Green bar + text link CTA */}
        <div style={fadeUp(270)}>
          <div className="h-[2px] rounded-full mt-4 mb-3"
            style={{ background: GREEN, animation: "wisdom-bar 500ms cubic-bezier(0.22,1,0.36,1) 270ms both", width: "2rem" }} />
          <button className="self-start flex items-center gap-1.5 text-[11px] font-bold transition-all duration-200 hover:opacity-75"
            style={{ color: GREEN }}>
            {current.cta} <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>

      </div>

      {/* ── AI Assistant — below slide content, above dots ── */}
      <div className="mx-3 mt-2 rounded-xl p-3 shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <p className="text-[8px] font-bold tracking-[0.16em] mb-1" style={{ color: "rgba(255,255,255,0.32)" }}>AI ASSISTANT</p>
        <p className="text-[12px] font-semibold mb-2.5" style={{ color: "rgba(255,255,255,0.85)" }}>
          Manufacturing Intelligence Advisor
        </p>
        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all hover:brightness-110"
          style={{ background: "rgba(42,203,131,0.14)", color: GREEN, border: "1px solid rgba(42,203,131,0.30)" }}>
          <Zap size={10} strokeWidth={2.5} />
          {current.cta}
        </button>
      </div>

      {/* ── Dots ── */}
      <div className="px-4 py-3 flex items-center gap-1.5 shrink-0">
        {WISDOM_SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} className="rounded-full transition-all duration-300"
            style={{ width: i === slide ? 18 : 5, height: 5, background: i === slide ? GREEN : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING PROFILE CAPSULE
// ═══════════════════════════════════════════════════════════════════════════════
function FloatingProfileCapsule({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  // Show after a brief mount delay so the page has time to settle
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const pct = 35;
  const r = 15;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 280ms ease, transform 280ms ease",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <button onClick={onClick}
        className="flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full hover:brightness-110 active:scale-[0.97] transition-all duration-200"
        style={{
          background: "linear-gradient(135deg,#0a2215 0%,#0d2e1a 100%)",
          border: "1px solid rgba(42,203,131,0.40)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(42,203,131,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
        {/* Ring */}
        <div className="relative w-10 h-10 shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="20" cy="20" r={r} fill="rgba(42,203,131,0.08)" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
            <circle cx="20" cy="20" r={r} fill="none" stroke="#2ACB83" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 4px rgba(42,203,131,0.5))" }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white tabular-nums leading-none">{pct}%</span>
          <span className="absolute top-0.5 right-0.5 w-[9px] h-[9px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-[9px] h-[9px] bg-emerald-400" />
          </span>
        </div>
        {/* Labels */}
        <div className="flex flex-col items-start leading-none">
          <span className="text-[8px] font-bold tracking-[0.14em] uppercase mb-[3px]" style={{ color: "rgba(42,203,131,0.65)" }}>Discovery Score</span>
          <span className="text-[12px] font-bold text-white">
            Complete Profile <span style={{ color: "#2ACB83" }}>›</span>
          </span>
        </div>
      </button>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE COMPLETION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
// Maps modal section IDs → profile module tab IDs
const SECTION_TO_PROFILE_TAB: Record<string, string> = {
  company:          "company",
  products:         "products",
  terms:            "terms",
  certifications:   "licences",
  reactors:         "reactors",
  equipment:        "equipments",
  ehs:              "ehs",
  utilities:        "utilities",
};

function ProfileCompletionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [animIn, setAnimIn] = useState(false);
  const [selected, setSelected] = useState("certifications");

  const navigateToProfile = (sectionId?: string) => {
    onClose();
    const tab = sectionId ? SECTION_TO_PROFILE_TAB[sectionId] : undefined;
    router.push(tab ? `/dashboard/profile?tab=${tab}` : "/dashboard/profile");
  };

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setTimeout(() => setAnimIn(true), 10));
      document.body.style.overflow = "hidden";
    } else {
      setAnimIn(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sec = PROFILE_SECTIONS.find(s => s.id === selected) ?? PROFILE_SECTIONS[0];
  const SCORE = 35;
  const progressPct = Math.round(((SCORE - 10) / (100 - 10)) * 100);

  if (!open || typeof document === "undefined") return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(2,2,2,0.60)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 980, maxHeight: "90vh",
          borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)",
          opacity: animIn ? 1 : 0,
          transform: animIn ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}>

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#f0fdf4", border: "1px solid rgba(42,203,131,0.30)" }}>
              <span className="text-[17px]">🛡️</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 leading-tight" style={{ fontFamily: "Poppins,sans-serif" }}>
                Profile Completion
              </h2>
              <p className="text-[11px] text-slate-400 mt-[2px]">
                Build your industrial footprint parameter strength to elevate active buyer matchmaking visibility.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => navigateToProfile()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Eye size={12} /> View how buyers see your profile
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* ─ LEFT: progress tracker ─ */}
          <div className="w-[290px] shrink-0 border-r border-slate-100 overflow-y-auto bg-slate-50/50 p-4 flex flex-col gap-3">

            {/* Score card */}
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-[8px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-2">Discovery Score</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[38px] font-black leading-none tabular-nums" style={{ color: "#0d2e1a" }}>{SCORE}%</span>
                <span className="mb-1.5 text-[9px] font-bold px-2 py-[3px] rounded-full"
                  style={{ background: "#f0fdf4", color: "#1F6F54", border: "1px solid rgba(42,203,131,0.30)" }}>PARTNER RANK</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-snug">Mapped dynamically based on overall sourcing credentials.</p>
              <div className="w-full h-[7px] bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#2ACB83,#1F6F54)", transition: "width 1s ease" }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">Start: 10%</span>
                <span className="text-[9px] text-slate-400">Goal: 100%</span>
              </div>
            </div>

            {/* Sections list */}
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[7.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">Profile Section</span>
                <span className="text-[7.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">Score Impact</span>
              </div>

              {/* Onboarding group */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100"
                style={{ background: "rgba(42,203,131,0.06)" }}>
                <span className="text-[9px]">✅</span>
                <span className="text-[7.5px] font-bold tracking-[0.14em] uppercase" style={{ color: "#1F6F54" }}>Onboarding</span>
              </div>
              {PROFILE_SECTIONS.filter(s => s.group === "core").map(s => {
                const isSel = selected === s.id;
                return (
                  <button key={s.id} onClick={() => setSelected(s.id)}
                    className="w-full flex items-center justify-between px-3 py-[9px] border-b border-slate-100 text-left transition-all hover:bg-green-50/50"
                    style={{ background: isSel ? "#f0fdf4" : "white", borderLeft: isSel ? "3px solid #2ACB83" : "3px solid transparent" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] shrink-0" style={{ color: "#2ACB83" }}>✓</span>
                      <span className="text-[11px] font-medium text-slate-700 truncate">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] font-bold" style={{ color: "#1F6F54" }}>{s.scoreImpact}</span>
                      {s.scoreValue === 35 && (
                        <span className="text-[6.5px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: "#f0fdf4", color: "#1F6F54", border: "1px solid rgba(42,203,131,0.35)" }}>CURRENT MAX</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Profile Enrichment group */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 border-t border-slate-100 mt-1"
                style={{ background: "rgba(251,191,36,0.07)" }}>
                <span className="text-[9px]">✨</span>
                <span className="text-[7.5px] font-bold tracking-[0.14em] uppercase text-amber-700">Profile Enrichment (0 / 5)</span>
              </div>
              {PROFILE_SECTIONS.filter(s => s.group === "advanced").map((s, idx, arr) => {
                const isSel = selected === s.id;
                return (
                  <button key={s.id} onClick={() => setSelected(s.id)}
                    className={cn("w-full flex items-center justify-between px-3 py-[9px] text-left transition-all hover:bg-green-50/50", idx < arr.length - 1 ? "border-b border-slate-100" : "")}
                    style={{ background: isSel ? "#f0fdf4" : "white", borderLeft: isSel ? "3px solid #2ACB83" : "3px solid transparent" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-slate-300 shrink-0">○</span>
                      <span className="text-[11px] font-medium text-slate-500 truncate">{s.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{s.scoreImpact}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─ RIGHT: context panel — changes per selection ─ */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-w-0">
            {/* Section heading */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[30px] leading-none shrink-0">{sec.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold tracking-[0.18em] text-slate-400 uppercase mb-0.5">
                    {sec.group === "core" ? "Onboarding" : "Profile Enrichment"}
                  </p>
                  <h3 className="text-[18px] font-bold text-slate-900 leading-tight" style={{ fontFamily: "Poppins,sans-serif" }}>
                    {sec.label}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 mt-0.5"
                style={sec.completed
                  ? { background: "#f0fdf4", color: "#1F6F54", border: "1px solid rgba(42,203,131,0.40)" }
                  : { background: "#fefce8", color: "#92400e", border: "1px solid rgba(234,179,8,0.40)" }}>
                {sec.completed ? "✓ Completed" : "Pending"}
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] text-slate-600 leading-relaxed -mt-2">{sec.description}</p>

            {/* Why buyers care */}
            <div className="rounded-xl p-4" style={{ background: "#f0fdf4", border: "1px solid rgba(42,203,131,0.22)" }}>
              <p className="text-[8px] font-bold tracking-[0.18em] uppercase mb-1.5" style={{ color: "#1F6F54" }}>
                {sec.completed ? "WHY BUYERS VALUED THIS" : "WHY BUYERS NEED THIS"}
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#1a5c3a" }}>{sec.buyerRationale}</p>
            </div>

            {/* Unlocks */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.18em] text-slate-400 uppercase mb-3">
                {sec.completed ? "WHAT YOU'VE UNLOCKED" : "WHAT YOU'LL UNLOCK"}
              </p>
              <div className="flex flex-col gap-2.5">
                {sec.unlocks.map((u, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-[1px]"
                      style={{
                        background: sec.completed ? "#f0fdf4" : "#f8fafc",
                        border: `1px solid ${sec.completed ? "rgba(42,203,131,0.40)" : "#e2e8f0"}`,
                      }}>
                      {sec.completed
                        ? <span className="text-[9px] font-bold" style={{ color: "#2ACB83" }}>✓</span>
                        : <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>}
                    </div>
                    <p className="text-[12.5px] text-slate-700 leading-snug flex-1">{u}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA or Unlocked state */}
            {sec.completed ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mt-auto"
                style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid rgba(42,203,131,0.28)" }}>
                <span className="text-[20px]">✅</span>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: "#1F6F54" }}>Already Unlocked</p>
                  <p className="text-[10px]" style={{ color: "#4a9868" }}>These capabilities are active on your profile right now.</p>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3">
                {/* Score unlock preview */}
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="text-center shrink-0">
                    <p className="text-[22px] font-black text-slate-900 leading-none tabular-nums">{sec.scoreImpact}</p>
                    <p className="text-[8.5px] text-slate-400 mt-0.5 tracking-wide">DISCOVERY SCORE</p>
                  </div>
                  <div className="w-px self-stretch bg-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="w-full h-[6px] bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${sec.scoreValue}%`, background: "linear-gradient(90deg,#2ACB83,#1F6F54)", transition: "width 0.8s ease" }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Your profile strength after completing this section</p>
                  </div>
                </div>
                <button
                  onClick={() => navigateToProfile(sec.id)}
                  className="w-full py-3 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110 active:scale-[0.99]"
                  style={{ background: "linear-gradient(90deg,#1F6F54,#2ACB83)" }}>
                  {sec.ctaLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — per-section 70/30 layout
// ═══════════════════════════════════════════════════════════════════════════════
export function ManufacturingDay1Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="space-y-4 pb-12 max-w-[1400px] mx-auto px-4 sm:px-0">

      {/* ── Full width: Hero ── */}
      <HeroSection />

      {/* ── 70/30: Opportunity Pipeline | Profile Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <PipelineSection />
        </div>
        <div className="lg:col-span-3">
          <ProfilePerformanceCard onOpen={() => setProfileOpen(true)} />
        </div>
      </div>

      {/* ── Full width: Global Buyer Activity ── */}
      <WorldRFQMap />

      {/* ── 70/30: Buyers Already Looking | Market Pulse ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <BuyerCarousel />
        </div>
        <div className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "#f0fdf6", border: "1px solid rgba(42,203,131,0.25)" }}>
          <MarketPulseRightCard embedded />
        </div>
      </div>

      {/* ── 70/30: Product Performance | Scinode Wisdom ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <ProductPerformanceSection />
        </div>
        <div className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ScimplifyWisdomCarousel />
        </div>
      </div>

      {/* ── Full width: Platform Stats ── */}
      <PlatformStatsSection />

      {/* ── Full width: Expert CTA ── */}
      <ExpertCTASection />

      {/* ── Floating profile capsule + modal (portal-rendered) ── */}
      <FloatingProfileCapsule onClick={() => setProfileOpen(true)} />
      <ProfileCompletionModal open={profileOpen} onClose={() => setProfileOpen(false)} />

    </div>
  );
}
