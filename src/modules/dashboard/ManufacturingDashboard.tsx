"use client";

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  FileText,
  Plus,
  Layers,
  Users,
  MessageSquare,
  Factory,
  Building2,
  Award,
  Wrench,
  Zap,
  FileCheck,
  Globe,
  Info,
  Eye,
  X,
  Lock,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { SUPPLIER_IMAGES } from "@/lib/supplierImages";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useMounted(delay = 300) {
  const [m, setM] = useState(false);
  useEffect(() => { const t = setTimeout(() => setM(true), delay); return () => clearTimeout(t); }, [delay]);
  return m;
}

// ─── InfoTip (portal-based tooltip) ──────────────────────────────────────────
function InfoTip({ text, dir = "up" }: { text: string; dir?: "up" | "down" }) {
  const [show, setShow]     = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: dir === "down" ? r.bottom + 6 : r.top - 6, left: r.left + r.width / 2 });
    }
    setShow(true);
  };

  const tooltip = show ? (
    <div style={{
      position: "fixed",
      top:      dir === "down" ? coords.top : "auto",
      bottom:   dir === "up"   ? window.innerHeight - coords.top : "auto",
      left:     coords.left,
      transform: "translateX(-50%)",
      zIndex: 99999, width: 180, pointerEvents: "none",
    }}>
      <div className="bg-[#1e293b] text-white text-[10px] leading-snug rounded-lg px-2.5 py-2 shadow-xl border border-white/10 text-center">
        {text}
        {dir === "down"
          ? <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#1e293b]" />
          : <div className="absolute top-full  left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1e293b]" />}
      </div>
    </div>
  ) : null;

  return (
    <div className="inline-flex items-center">
      <button ref={btnRef} type="button"
        onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors">
        <Info size={11} />
      </button>
      {typeof document !== "undefined" && tooltip ? createPortal(tooltip, document.body) : null}
    </div>
  );
}

// ─── LocationPin ──────────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const BUYER_SIGNALS = [
  { flag: "🇪🇬", city: "Cairo",     country: "Egypt",       role: "PROCUREMENT MANAGER",         quote: "Hello, we're looking to purchase Bismuth Citrate. Could you please share your price for 115 kg CIF by air? Also, kindly provide the COA and ISO certificate for our review." },
  { flag: "🇨🇳", city: "Shanghai",  country: "China",       role: "SUPPLY CHAIN DIRECTOR",       quote: "Hello, we're interested in 800 kg of Azacyclonol (CAS: 115-46-8). Please advise your shortest lead time and share the latest batch COA and MSDS for quality evaluation." },
  { flag: "🇮🇩", city: "Jakarta",   country: "Indonesia",   role: "TECHNICAL PURCHASING ENGINEER",quote: "Hi, we're sourcing Titanium Phosphate (CAS: 13765-94-1) for use as a surface conditioning agent in a zinc phosphating process. Do you currently have stock? Could you quote for around 200 kg delivered to Jakarta?" },
  { flag: "🇧🇷", city: "São Paulo", country: "Brazil",      role: "HEAD OF STRATEGIC SOURCING",  quote: "Hello, we're looking for reliable suppliers of SLES 70% who can support regular monthly container shipments. Please let us know your availability and terms." },
  { flag: "🇫🇷", city: "Lyon",      country: "France",      role: "R&D MANAGER",                 quote: "Hello, we're interested in Methyl Benzoate (CAS: 93-58-3), technical grade. Could you share the MSDS and technical datasheet? Would it be possible to receive a 1 kg sample for testing?" },
  { flag: "🇮🇳", city: "Mumbai",    country: "India",       role: "FOUNDER & TECHNICAL LEAD",   quote: "Hi, we have a specialty chemical product for semiconductor/electronics applications and are looking to get it manufactured with a partner that offers strong R&D support. Could you help evaluate this?" },
];

const MAP_PINS = [
  { id: "IN", country: "India",          region: "Mumbai, Western India",   flag: "🇮🇳", left: "67%", top: "48%", tier: "high",     rfqs: 18, contractMfg: 9,  cdmo: 6, catalogueLeads: 43 },
  { id: "DE", country: "Germany",        region: "Bavaria",                 flag: "🇩🇪", left: "49%", top: "26%", tier: "rising",   rfqs: 11, contractMfg: 5,  cdmo: 4, catalogueLeads: 22 },
  { id: "US", country: "United States",  region: "New Jersey, East Coast",  flag: "🇺🇸", left: "18%", top: "37%", tier: "rising",   rfqs: 9,  contractMfg: 4,  cdmo: 3, catalogueLeads: 19 },
  { id: "JP", country: "Japan",          region: "Osaka Prefecture",        flag: "🇯🇵", left: "79%", top: "36%", tier: "emerging", rfqs: 5,  contractMfg: 2,  cdmo: 2, catalogueLeads: 11 },
  { id: "BR", country: "Brazil",         region: "São Paulo State",         flag: "🇧🇷", left: "28%", top: "66%", tier: "emerging", rfqs: 4,  contractMfg: 2,  cdmo: 1, catalogueLeads: 9  },
  { id: "GB", country: "United Kingdom", region: "Greater London",          flag: "🇬🇧", left: "45%", top: "23%", tier: "emerging", rfqs: 3,  contractMfg: 1,  cdmo: 1, catalogueLeads: 7  },
  { id: "CN", country: "China",          region: "Jiangsu Province",        flag: "🇨🇳", left: "74%", top: "40%", tier: "rising",   rfqs: 7,  contractMfg: 4,  cdmo: 3, catalogueLeads: 16 },
  { id: "AU", country: "Australia",      region: "New South Wales",         flag: "🇦🇺", left: "80%", top: "67%", tier: "emerging", rfqs: 2,  contractMfg: 1,  cdmo: 1, catalogueLeads: 5  },
];

const TIER_CONFIG: Record<string, { label: string; color: string; tooltip: string }> = {
  high:     { label: "High Demand",     color: "#f59e0b", tooltip: "Regions generating the highest volume of relevant demand and opportunities" },
  rising:   { label: "Rising Demand",   color: "#8b5cf6", tooltip: "Regions showing increasing activity and engagement" },
  emerging: { label: "Emerging Demand", color: "#3b82f6", tooltip: "Regions with newly identified opportunities and expanding market interest" },
};

const MARKET_PULSE_WHAT_YOU_GET = [
  { icon: "📈", label: "Demand Trends",       sub: "Buyer demand signals matched to your product category"  },
  { icon: "🔄", label: "Trade Activity",       sub: "Active import/export route data & flow patterns"        },
  { icon: "💰", label: "Pricing Signals",      sub: "Live pricing intelligence across global trade lanes"    },
  { icon: "🏭", label: "Competitor Landscape", sub: "Anonymous benchmarking against similar manufacturers"   },
  { icon: "⚠️", label: "Regulatory Risks",     sub: "Compliance alerts impacting your product segments"      },
];

// Profile sections — Day 0 state: only company is done
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
    scoreImpact: "+25%", scoreValue: 25, completed: false, group: "core",
    description: "Your full product listings with CAS numbers, purity specifications, available quantities, packaging options, and application data — the primary surface buyers use to discover you.",
    buyerRationale: "Buyers search by product first, not by company. Your catalogue is your primary discovery surface — incomplete listings reduce match accuracy and reduce your RFQ volume significantly.",
    unlocks: ["Product-level RFQ matching with active buyer demand", "Enquiry notifications for each listed product", "Catalogue indexed in global buyer search"],
    ctaLabel: "Add Products to Catalogue →",
  },
  {
    id: "terms", label: "Terms & Activation", emoji: "🚀",
    scoreImpact: "+35%", scoreValue: 35, completed: false, group: "core",
    description: "Acceptance of platform participation terms activates your account for full buyer engagement — receiving RFQs, reading buyer messages, and submitting project proposals.",
    buyerRationale: "Activated accounts are trusted, verified participants in the sourcing ecosystem. Buyers can only initiate contact with fully activated suppliers.",
    unlocks: ["Live RFQ delivery to your dashboard", "Read and respond to direct buyer messages", "Submit proposals on open manufacturing projects"],
    ctaLabel: "Review & Accept Terms →",
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
    unlocks: ["Capability-based project matching for CMO/CDMO tenders", "Reactor-specific RFQ routing (glass-lined, SS, HDPE)", "Eligible for high-value multi-batch manufacturing contracts"],
    ctaLabel: "Add Reactor Details →",
  },
  {
    id: "equipment", label: "Equipments & Infrastructure", emoji: "🏭",
    scoreImpact: "+78%", scoreValue: 78, completed: false, group: "advanced",
    description: "List your process equipment — distillation columns, dryers, centrifuges, filtration units, spray dryers, and specialty process systems used in your manufacturing.",
    buyerRationale: "Detailed infrastructure data signals execution capability for complex chemistry. Buyers use this to assess whether a supplier can handle their specific synthesis pathway.",
    unlocks: ["Custom synthesis project matching based on process fit", "Complex multi-step chemistry and specialty RFQs", "Higher proposal conversion on technical project briefs"],
    ctaLabel: "Add Equipment Details →",
  },
  {
    id: "ehs", label: "EHS Facility Details", emoji: "🛡️",
    scoreImpact: "+90%", scoreValue: 90, completed: false, group: "advanced",
    description: "Highlight your ETP systems, fire safety certifications, solvent recovery infrastructure, hazardous material handling, and environmental compliance records.",
    buyerRationale: "International buyers increasingly require EHS compliance as a non-negotiable sourcing criterion, especially for regulated markets in the EU, US, and Japan.",
    unlocks: ["Export-grade project access for EU, US, and regulated markets", "International compliance-required tenders", "ESG-conscious buyer matching in premium sourcing programs"],
    ctaLabel: "Add Facility Details →",
  },
  {
    id: "utilities", label: "Utilities & Plant Readiness", emoji: "🔥",
    scoreImpact: "+100%", scoreValue: 100, completed: false, group: "advanced",
    description: "Document your chilling plants, boilers, HVAC systems, nitrogen lines, compressed air, steam supply, power reliability, and water treatment systems.",
    buyerRationale: "Utility infrastructure determines your ability to handle large-scale, continuous production runs. Buyers assess this for scale-up partnerships and volume manufacturing projects.",
    unlocks: ["Large-scale manufacturing contract eligibility", "Scale-up partnership opportunities with global buyers", "Full Discovery Score — maximum platform visibility"],
    ctaLabel: "Add Utility Details →",
  },
];

const SECTION_TO_PROFILE_TAB: Record<string, string> = {
  company: "company", products: "products", terms: "terms",
  certifications: "licences", reactors: "reactors",
  equipment: "equipments", ehs: "ehs", utilities: "utilities",
};

const ONBOARDING_STEPS = [
  { Icon: Building2, label: "COMPANY PROFILE",          desc: "Add basic details about your plant profile",                                                      done: true,  action: "Done",              iconBg: "#eff6ff", iconColor: "#2563eb" },
  { Icon: Package,   label: "PRODUCTS",                  desc: "Upload or add your product catalogue",                                                             done: false, action: "Add Details →",     iconBg: "#dff3ee", iconColor: "#1f6f54" },
  { Icon: Award,     label: "LICENCES & CERTIFICATIONS", desc: "Upload one of success like ISO, GMP, or audits",                                                   done: false, action: "Add Details →",     iconBg: "#fffbeb", iconColor: "#d97706" },
  { Icon: Factory,   label: "REACTIONS",                 desc: "Upload your reactors and their capacities",                                                         done: false, action: "Add Details →",     iconBg: "#f3f0ff", iconColor: "#7c3aed" },
  { Icon: Wrench,    label: "EQUIPMENTS",                desc: "Tell buyers about your equipment, and its capacity",                                                done: false, action: "Add Details →",     iconBg: "#eff6ff", iconColor: "#2563eb" },
  { Icon: Zap,       label: "EHS & FACILITY",            desc: "You can add details about your fire fighting capability or if you have an ETP facility",            done: false, action: "Add Details →",     iconBg: "#fffbeb", iconColor: "#d97706" },
  { Icon: Zap,       label: "UTILITIES",                 desc: "Add details like chilling plant, boilers, etc",                                                     done: false, action: "Add Details →",     iconBg: "#f3f0ff", iconColor: "#7c3aed" },
  { Icon: FileCheck, label: "TERMS & CONDITION",         desc: "Review and accept platform terms to activate your account",                                         done: false, action: "Review & Accept →",  iconBg: "#dff3ee", iconColor: "#1f6f54" },
];

const PLATFORM_STATS = [
  { num: 500,  suffix: "+",  label: "MANUFACTURERS\nALREADY ONBOARDED",        thousands: false, decimal: false },
  { num: 120,  suffix: "+",  label: "UNIQUE PROJECTS\nSUCCESSFULLY COMPLETED", thousands: false, decimal: false },
  { num: 2400, suffix: "+",  label: "SUPPLIER REQUIREMENTS\nSHARED",            thousands: true,  decimal: false },
  { num: 130,  suffix: "+",  label: "COUNTRIES\nREQUESTING",                    thousands: false, decimal: false },
  { num: 4.8,  suffix: "/5", label: "SUPPLIER\nSATISFACTION",                   thousands: false, decimal: true  },
];

type DashBadgeType = "Exclusive" | "CMO" | "RFQ" | "Tech Transfer" | "Open";
const DASH_BADGE_CONFIG: Record<DashBadgeType, { bg: string; text: string }> = {
  Exclusive:       { bg: "#020202", text: "white" },
  CMO:             { bg: "#1F6F54", text: "white" },
  RFQ:             { bg: "#0077CC", text: "white" },
  "Tech Transfer": { bg: "#7C3AED", text: "white" },
  Open:            { bg: "#D97706", text: "white" },
};

const MATCHED_PROJECTS: Array<{
  id: number; image: string; badge: DashBadgeType | null;
  matchType: "Capability-Based" | "Product Catalogue-Based";
  industry: string; title: string;
  country: string; countryFlag: string; quantity: string; postedDate: string;
}> = [
  { id: 1, image: SUPPLIER_IMAGES.agro[0],       badge: "Exclusive",     matchType: "Product Catalogue-Based", industry: "Agro Chemical",        title: "Reactive ingredient for acrylate polymer synthesis",            country: "Germany",        countryFlag: "🇩🇪", quantity: "500 kg/month",  postedDate: "2 days ago" },
  { id: 2, image: SUPPLIER_IMAGES.agro[1],       badge: "CMO",           matchType: "Capability-Based",        industry: "Industrial Chemicals", title: "Large-scale production of specialty surfactant series",          country: "United States",  countryFlag: "🇺🇸", quantity: "200 kg/batch",  postedDate: "5 days ago" },
  { id: 3, image: SUPPLIER_IMAGES.agro[2],       badge: "RFQ",           matchType: "Product Catalogue-Based", industry: "Agro Chemical",        title: "Technical grade herbicide formulation development and scale-up", country: "France",         countryFlag: "🇫🇷", quantity: "100 kg pilot",  postedDate: "1 week ago" },
  { id: 4, image: SUPPLIER_IMAGES.pharma[0],     badge: "CMO",           matchType: "Capability-Based",        industry: "Pharmaceutical",       title: "Custom synthesis of novel kinase inhibitor scaffold",            country: "Japan",          countryFlag: "🇯🇵", quantity: "50 g multi-gram", postedDate: "3 days ago" },
  { id: 5, image: SUPPLIER_IMAGES.pharma[1],     badge: "Tech Transfer", matchType: "Capability-Based",        industry: "Pharmaceutical",       title: "API impurity profiling and forced degradation study",            country: "United Kingdom", countryFlag: "🇬🇧", quantity: "10 kg scale",   postedDate: "2 weeks ago" },
  { id: 6, image: SUPPLIER_IMAGES.industrial[0], badge: "Open",          matchType: "Product Catalogue-Based", industry: "Metallurgy Chemicals", title: "Development of low-VOC metal surface treatment solution",        country: "India",          countryFlag: "🇮🇳", quantity: "1,000 L/run",  postedDate: "4 days ago" },
];

const BUYERS = [
  { id: 1, image: SUPPLIER_IMAGES.industrial[2], badges: ["RFQ"],   text: "Looking for high-pressure hydrogenation capability (up to 90 bar) for a 5-ton batch.",                category: "Industrial Chemicals" },
  { id: 2, image: SUPPLIER_IMAGES.agro[1],        badges: ["CDMO"],  text: "Seeking CDMO partner for scale-up of pesticide intermediate (pilot to commercial).",                category: "Agrochemicals" },
  { id: 3, image: SUPPLIER_IMAGES.pharma[0],      badges: ["RFQ"],   text: "Requirement for solvent recovery and purification at 10 KL scale.",                                 category: "Pharma" },
  { id: 4, image: SUPPLIER_IMAGES.industrial[1],  badges: ["CMO"],   text: "Urgent requirement for custom catalyst synthesis for polymer production. Immediate start preferred.", category: "Industrial Chemicals" },
  { id: 5, image: SUPPLIER_IMAGES.specialty[0],   badges: ["RFQ"],   text: "Looking for cryogenic reaction capability (−78°C) for specialty intermediate synthesis.",            category: "Specialty Chemicals" },
  { id: 6, image: SUPPLIER_IMAGES.agro[0],        badges: ["CDMO"],  text: "Seeking partner for novel herbicide formulation scale-up. Pilot plant scale (100 kg).",              category: "Agrochemicals" },
  { id: 7, image: SUPPLIER_IMAGES.specialty[1],   badges: ["CMO"],   text: "Bulk production of specialty coating additives. ISO 9001 certification required.",                   category: "Polymers" },
  { id: 8, image: SUPPLIER_IMAGES.pharma[2],      badges: ["RFQ"],   text: "High-purity solvent purification project. Distillation & Fractional Crystallization.",              category: "Industrial Chemicals" },
];

// ─── STAR_ICON ────────────────────────────────────────────────────────────────
const STAR_ICON = "https://www.figma.com/api/mcp/asset/8749bfbf-c143-471d-b88f-25e83b75af4c";

// ─── Main export ──────────────────────────────────────────────────────────────
export function ManufacturingDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [catalogDemoState, setCatalogDemoState] = useState<0 | 1 | 2>(0);

  return (
    <div className="space-y-5 pb-12 max-w-[1200px] mx-auto px-4 sm:px-0">

      {/* 1. Hero banner — dark green */}
      <WelcomeBanner />

      {/* 2. 70/30: Profile Performance + Market Pulse (equal height) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
        <div className="lg:col-span-7 flex">
          <ProfilePerformanceCard onOpenProfile={() => setProfileOpen(true)} />
        </div>
        <div className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "#f0fdf6", border: "1px solid rgba(42,203,131,0.25)" }}>
          <MarketPulsePanel />
        </div>
      </div>


      {/* 4. 70/30: Product showcase + Demand Catalyst side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
        <div className="lg:col-span-7"><ProductShowcase demoState={catalogDemoState} setDemoState={setCatalogDemoState} /></div>
        <div className="lg:col-span-3 flex">
          <DemandCatalystSidePanel demoState={catalogDemoState} setDemoState={setCatalogDemoState} />
        </div>
      </div>

      {/* 5. Full width: Global Opportunity Map */}
      <GlobalOpportunityMap />

      {/* 6. Full width: Projects Matched */}
      <ProjectsMatched />

      {/* 7. Full width: Platform Stats */}
      <PlatformStatsSection />

      {/* 8. Full width: Buyers Already Looking */}
      <BuyersLooking />

      {/* 9. Full width: Expert CTA */}
      <ExpertCTA />

      {/* Portals */}
      <FloatingProfileCapsule onClick={() => setProfileOpen(true)} />
      <ProfileCompletionModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PROFILE PERFORMANCE CARD (replaces hero + signup banner + checklist)
// ═══════════════════════════════════════════════════════════════════════════════
function ProfilePerformanceCard({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [enrichOpen, setEnrichOpen] = useState(false);
  const mounted = useMounted(350);
  const router  = useRouter();

  const coreItems = PROFILE_SECTIONS.filter(s => s.group === "core");
  const advItems  = PROFILE_SECTIONS.filter(s => s.group === "advanced");
  const coreDone  = coreItems.filter(s => s.completed).length;
  const SCORE     = 6;

  // Half-pie gauge
  const arcLen    = Math.PI * 80; // semicircle arc for r=80
  const filledArc = mounted ? (SCORE / 100) * arcLen : 0;

  // Buyer-impact context per core section
  const CORE_META: Record<string, { metric: string; unit: string; color: string }> = {
    company:  { metric: "2,400+", unit: "buyers can discover your profile",   color: "#1F6F54" },
    products: { metric: "96",     unit: "buyers searched your category / week", color: "#0077CC" },
    terms:    { metric: "50+",    unit: "live RFQs waiting for activated suppliers", color: "#6237C7" },
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full h-full flex flex-col">
      {/* Gradient accent line */}
      <div className="h-[3px] shrink-0"
        style={{ background: "linear-gradient(90deg,#2ACB83 0%,#1F6F54 30%,#0077CC 60%,#D4AF37 100%)" }} />

      <div className="p-5 sm:p-6 flex flex-col flex-1">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">Profile Activation</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete onboarding to activate proposal submissions and make your profile visible to customers.
            </p>
          </div>
        </div>

        {/* ── Stepper Timeline ─────────────────────────────────────── */}
        <div className="mb-5">
          {/* Full-width line with pills sitting on top */}
          <div className="relative mb-2">
            {/* Full background line — edge to edge */}
            <div className="absolute inset-x-0 top-[13px] h-[2px]" style={{ background: "#e5e7eb" }} />
            {/* Green completed portion */}
            <div className="absolute top-[13px] left-0 h-[2px] transition-all duration-700"
              style={{
                background: "#2ACB83",
                width: coreDone === 0 ? "0%"
                     : coreDone === coreItems.length ? "100%"
                     : `${((2 * coreDone - 1) / (2 * coreItems.length)) * 100}%`,
              }} />
            {/* Pills — centered in equal columns */}
            <div className="grid" style={{ gridTemplateColumns: `repeat(${coreItems.length}, 1fr)` }}>
              {coreItems.map((sec, i) => (
                <div key={sec.id} className="flex justify-center">
                  <div className="relative z-10 flex items-center gap-1 px-3 py-[3px] rounded-full text-[9.5px] font-bold"
                    style={{
                      background:  sec.completed ? "#2ACB83" : "white",
                      color:       sec.completed ? "white"   : "#6b7280",
                      border:      `1.5px solid ${sec.completed ? "#2ACB83" : "#d1d5db"}`,
                    }}>
                    {sec.completed && <Check size={9} strokeWidth={3} />}
                    <span>{sec.completed ? "Done" : `Step ${i + 1}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labels + earned/unlock — plain, no boxes */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${coreItems.length}, 1fr)` }}>
            {coreItems.map(sec => (
              <button key={sec.id}
                onClick={!sec.completed ? onOpenProfile : undefined}
                className="flex flex-col items-center gap-1 py-2 text-center transition-opacity hover:opacity-75">
                <span className="text-[11px] font-bold leading-tight"
                  style={{ color: sec.completed ? "#1F6F54" : "#374151" }}>
                  {sec.label}
                </span>
                <span className="text-[9.5px] font-semibold"
                  style={{ color: sec.completed ? "#2ACB83" : "#9ca3af" }}>
                  {sec.completed ? "✓ Earned" : `Unlock ${sec.scoreImpact}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main two-column layout ───────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT: Score panel — neutral white */}
          <div className="lg:w-[210px] xl:w-[225px] shrink-0 flex flex-col items-center gap-4 px-5 py-5 rounded-2xl"
            style={{ background: "#ffffff", border: "1px solid #E5E7EB" }}>

            {/* Half-pie gauge */}
            <div className="flex flex-col items-center w-full">
              {/* viewBox crops just below the arc endpoints so text sits snugly */}
              <svg width="160" height="76" viewBox="0 0 200 102" style={{ overflow: "visible" }}>
                {/* Track arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="14" strokeLinecap="round" />
                {/* Filled arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none" stroke="#2ACB83" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${filledArc} ${arcLen}`}
                  style={{
                    transition: "stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)",
                    filter: "drop-shadow(0 0 6px rgba(42,203,131,0.50))",
                  }} />
              </svg>
              <div className="flex flex-col items-center -mt-2">
                <span className="text-[32px] font-black tabular-nums leading-none" style={{ color: "#020202" }}>{SCORE}%</span>
                <span className="text-[8px] font-bold tracking-[0.12em] mt-1" style={{ color: "#2ACB83" }}>
                  DISCOVERY SCORE
                </span>
              </div>
            </div>

            <span className="text-[9px] font-bold px-3 py-[4px] rounded-full"
              style={{ background: "#FEF3C7", color: "#92400e" }}>
              GETTING STARTED
            </span>

            {/* KPI list */}
            <div className="w-full flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              {/* Score Impact table header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[9px] font-bold uppercase tracking-[0.10em]" style={{ color: "#6B7280" }}>Profile Section</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.10em]" style={{ color: "#6B7280" }}>Score Impact</span>
              </div>
              {[
                { label: "Company Profile",   value: "+10%", done: true  },
                { label: "Product Catalogue", value: "+25%", done: false },
                { label: "Terms & Activation",value: "+35%", done: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium" style={{ color: row.done ? "#1F6F54" : "#374151" }}>
                    {row.label}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums"
                    style={{ color: row.done ? "#2ACB83" : "#9CA3AF" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT: Section rows */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">

            {/* Group label */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: "rgba(42,203,131,0.06)", border: "1px solid rgba(42,203,131,0.14)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[12px]">📋</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.11em]" style={{ color: "#1F6F54" }}>
                  Onboarding — Required to Activate
                </span>
              </div>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#fef3c7", color: "#92400e" }}>
                {coreDone} / {coreItems.length}
              </span>
            </div>

            {/* Core section rows */}
            {coreItems.map(sec => {
              const meta = CORE_META[sec.id];
              return (
                <div key={sec.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group"
                  style={{
                    background:  sec.completed ? "rgba(42,203,131,0.04)" : "white",
                    borderColor: sec.completed ? "rgba(42,203,131,0.26)" : "#e8ecf0",
                  }}
                  onClick={!sec.completed ? onOpenProfile : undefined}>

                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[17px]"
                    style={{ background: sec.completed ? "#f0fdf4" : "#f8fafc" }}>
                    {sec.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-semibold"
                        style={{ color: sec.completed ? "#1F6F54" : "#1e293b" }}>
                        {sec.label}
                      </span>
                      <span className="text-[8.5px] font-bold px-1.5 py-[2px] rounded tabular-nums shrink-0"
                        style={{
                          background: sec.completed ? "rgba(42,203,131,0.14)" : "#eff7ff",
                          color:      sec.completed ? "#1F6F54"               : "#0077CC",
                        }}>
                        {sec.completed ? "✓ Earned" : `Unlock ${sec.scoreImpact}`}
                      </span>
                    </div>
                    {/* Solid progress bar */}
                    <div className="w-full h-[3px] rounded-full mb-1.5 overflow-hidden" style={{ background: "#e9ecef" }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: mounted && sec.completed ? "100%" : "0%", background: "#2ACB83" }} />
                    </div>
                    {meta && (
                      <p className="text-[10px]" style={{ color: "#9ca3af" }}>
                        <span className="font-bold" style={{ color: meta.color }}>{meta.metric}</span>
                        {" "}{meta.unit}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {sec.completed ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{ background: "rgba(42,203,131,0.12)", color: "#1F6F54" }}>
                        <Check size={11} />
                        <span className="text-[10px] font-bold">Done</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/profile?tab=${SECTION_TO_PROFILE_TAB[sec.id]}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[10px] font-bold transition-all hover:brightness-110 whitespace-nowrap"
                        style={{ background: "#1F6F54" }}>
                        Add <ArrowRight size={9} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING JOURNEY PANEL — compact right 30% panel
// ═══════════════════════════════════════════════════════════════════════════════
const JOURNEY_COMPACT = [
  {
    icon: "✅", status: "ACTIVE",
    statusBg: "rgba(42,203,131,0.15)", statusText: "#1F6F54",
    title: "You're Signed Up",
    subtitle: "Available right now — free",
    color: "#1F6F54", bg: "#f0fdf4", border: "rgba(42,203,131,0.28)",
    features: [
      "Listed in the Scinode supplier directory",
      "Company profile visible to buyers",
    ],
    planActivation: null,
    cta: null,
  },
  {
    icon: "🚀", status: "PENDING",
    statusBg: "#fef3c7", statusText: "#92400e",
    title: "After Onboarding",
    subtitle: "Complete 3 steps to activate",
    color: "#0077CC", bg: "#eff7ff", border: "rgba(0,119,204,0.22)",
    features: [
      "Live RFQ enquiries to your dashboard",
      "Read & respond to buyer messages",
      "Catalogue indexed in buyer search",
    ],
    planActivation: { label: "Free Plan Activated", status: "PENDING" },
    cta: { label: "Start Onboarding →", color: "#0077CC" },
  },
  {
    icon: "👑", status: "PRO",
    statusBg: "rgba(212,175,55,0.15)", statusText: "#B8962E",
    title: "Scinode Pro",
    subtitle: "Upgrade to unlock all features",
    color: "#D4AF37", bg: "#0F0F0A", border: "rgba(212,175,55,0.30)",
    features: [
      "Unlimited RFQ & enquiry delivery",
      "Exclusive project access",
      "Priority placement in buyer search",
    ],
    planActivation: null,
    cta: { label: "Upgrade to Pro", color: "#D4AF37" },
  },
] as const;

function OnboardingJourneyPanel({ onStartOnboarding }: { onStartOnboarding?: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col w-full h-full overflow-hidden">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Your Access Level</h3>
        <p className="text-xs text-slate-400 mt-0.5">Complete onboarding to unlock more</p>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">

        {/* ── TIER 1: Current plan — Starter ───────────────── */}
        <div className="rounded-xl border p-3 flex flex-col gap-2"
          style={{ background: "#f0fdf4", borderColor: "rgba(42,203,131,0.30)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "#2ACB83" }} />
              <span className="text-xs font-bold" style={{ color: "#1F6F54" }}>Scinode Starter</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-[3px] rounded-full"
              style={{ background: "rgba(42,203,131,0.15)", color: "#1F6F54" }}>ACTIVE</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-0.5">
            {["View all Open Projects", "Explore Market Pulse & modules"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check size={11} strokeWidth={3} style={{ color: "#2ACB83" }} />
                <span className="text-[11px]" style={{ color: "#374151" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIER 2: Unlock after onboarding ──────────────── */}
        <div className="rounded-xl border p-3 flex flex-col gap-2"
          style={{ background: "#f5faff", borderColor: "rgba(0,119,204,0.22)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock size={11} style={{ color: "#93c5fd" }} />
              <span className="text-xs font-bold text-slate-700">After Onboarding</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-[3px] rounded-full"
              style={{ background: "#fef3c7", color: "#92400e" }}>PENDING</span>
          </div>
          <p className="text-[11px] text-slate-400">Free. Complete your profile to activate.</p>
          <div className="flex flex-col gap-1.5">
            {[
              "Send proposals to Open Projects",
              "Activate Market Pulse reports",
              "Get discovered by buyers",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Lock size={10} style={{ color: "#93c5fd" }} className="shrink-0" />
                <span className="text-[11px] leading-snug text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Opportunity Value — informative, onboarding emphasis ── */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "#0d1117", border: "1px solid rgba(245,200,66,0.22)" }}>

          {/* Top urgency bar */}
          <div className="flex items-center gap-2 px-3.5 py-2 border-b"
            style={{ borderColor: "rgba(245,200,66,0.14)", background: "rgba(245,200,66,0.05)" }}>
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                style={{ background: "#f5c842" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#f5c842" }} />
            </span>
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase"
              style={{ color: "#c9a227" }}>Onboarding Required</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-[2px] rounded-full"
              style={{ background: "rgba(245,200,66,0.12)", color: "#c9a227" }}>2 steps left</span>
          </div>

          {/* Body */}
          <div className="px-3.5 py-3 flex flex-col gap-1.5">
            <p className="text-[9px] font-bold tracking-[0.10em]" style={{ color: "#4b5563" }}>OPPORTUNITY VALUE</p>
            <p className="text-[28px] font-black leading-none" style={{ color: "#ffffff" }}>
              $50,000<span className="text-[12px] font-semibold ml-0.5" style={{ color: "#6b7280" }}>/mo</span>
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#9ca3af" }}>
              Manufacturers who skip onboarding miss this much in verified buyer demand every month.
              <span className="font-semibold" style={{ color: "#e5e7eb" }}> Complete all 3 onboarding steps</span> to unlock your full earning potential.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING UNLOCK PREVIEW — full-width version (kept for reference)
// ═══════════════════════════════════════════════════════════════════════════════
const JOURNEY_STAGES = [
  {
    icon: "✅", status: "ACTIVE NOW",
    statusBg: "rgba(42,203,131,0.15)", statusText: "#1F6F54",
    title: "You're Signed Up",
    subtitle: "Available right now — free",
    color: "#1F6F54", bg: "#f0fdf4", border: "rgba(42,203,131,0.28)", labelColor: "#4b7a62",
    features: [
      "Listed in the Scinode supplier directory",
      "Company profile visible to buyers",
      "Browse open projects & industry RFQs",
      "Access the Global Opportunity Map",
      "View live buyer demand signals",
    ],
    cta: null,
  },
  {
    icon: "🚀", status: "PENDING",
    statusBg: "#fef3c7", statusText: "#92400e",
    title: "After Onboarding",
    subtitle: "Free — complete 3 steps to activate",
    color: "#0077CC", bg: "#eff7ff", border: "rgba(0,119,204,0.22)", labelColor: "#0c3460",
    features: [
      "Live RFQ enquiries delivered to your dashboard",
      "Read & respond to direct buyer messages",
      "Submit proposals on matched projects",
      "Product catalogue indexed in buyer search",
      "Market Pulse — 5 snapshots per week",
      "Enquiry analytics & match reports",
    ],
    cta: { label: "Start Onboarding →", color: "#0077CC" },
  },
  {
    icon: "👑", status: "PRO",
    statusBg: "rgba(212,175,55,0.15)", statusText: "#B8962E",
    title: "Scinode Pro",
    subtitle: "Premium — unlock the full platform",
    color: "#D4AF37", bg: "#0F0F0A", border: "rgba(212,175,55,0.30)", labelColor: "#B8962E",
    features: [
      "Unlimited RFQ & enquiry delivery",
      "Exclusive & restricted project access",
      "Full Market Pulse with detailed reports",
      "Priority placement in buyer search results",
      "Dedicated account manager & BD support",
      "Export market compliance & EHS insights",
    ],
    cta: { label: "Upgrade to Pro", color: "#D4AF37" },
  },
] as const;

function OnboardingUnlockPreview({ onStartOnboarding }: { onStartOnboarding?: () => void }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <p className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-0.5">YOUR GROWTH JOURNEY</p>
          <h2 className="text-base font-bold text-slate-900">What You Unlock at Each Stage</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold shrink-0"
          style={{ background: "#fef3c7", borderColor: "rgba(234,179,8,0.30)", color: "#92400e" }}>
          <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: "#f59e0b" }} />
          Stage 1 of 3 — Signed Up
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {JOURNEY_STAGES.map((stage, idx) => (
          <div key={idx} className="rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden"
            style={{ background: stage.bg, borderColor: stage.border }}>

            {/* watermark number */}
            <div className="absolute top-3 right-3 text-[44px] font-black leading-none pointer-events-none select-none tabular-nums"
              style={{ color: `${stage.color}0E` }}>{idx + 1}</div>

            {/* Stage header */}
            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[22px] leading-none">{stage.icon}</span>
                <div>
                  <h3 className="text-[13px] font-bold leading-snug" style={{ color: stage.color }}>{stage.title}</h3>
                  <p className="text-[9px] text-slate-400 mt-[1px]">{stage.subtitle}</p>
                </div>
              </div>
              <span className="text-[8px] font-bold px-2 py-[3px] rounded-full shrink-0 whitespace-nowrap"
                style={{ background: stage.statusBg, color: stage.statusText }}>{stage.status}</span>
            </div>

            {/* Feature list */}
            <div className="relative z-10 flex flex-col gap-1.5 flex-1">
              {stage.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[9px] shrink-0 mt-[3px]" style={{ color: idx === 2 ? "#c4b5fd" : stage.color }}>
                    {idx === 2 ? "🔒" : "✓"}
                  </span>
                  <span className="text-[11px] leading-snug" style={{ color: stage.labelColor }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {stage.cta && (
              <button
                onClick={idx === 1 ? onStartOnboarding : undefined}
                className="relative z-10 mt-1 w-full py-2 rounded-xl text-white text-[11px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: stage.cta.color }}>
                {stage.cta.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function WelcomeBanner() {
  const [tipVisible,      setTipVisible]      = useState(false);
  const [cardIdx,         setCardIdx]         = useState(0);
  const [progressMounted, setProgressMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCardIdx(i => (i + 1) % BUYER_SIGNALS.length), 4000);
  }, []);

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [resetTimer]);
  useEffect(() => { const t = setTimeout(() => setProgressMounted(true), 300); return () => clearTimeout(t); }, []);

  const goTo = (i: number) => { setCardIdx(i); resetTimer(); };

  return (
    <>
      <style>{`
        @keyframes mfg-badgeShimmer { 0%,100%{background-position:-200% center} 50%{background-position:200% center} }
        @keyframes mfg-grid { 0%,100%{opacity:0.025} 50%{opacity:0.045} }
        @keyframes mfg-cardFade { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <section className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(125deg, #003A1B 0%, #001C08 55%, #000d04 100%)" }}>

        <div className="pointer-events-none absolute -top-28 left-[28%] w-[420px] h-[420px] rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, #1db877 0%, transparent 68%)", filter: "blur(72px)" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-[0.09]"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(48px)" }} />
        <div className="pointer-events-none absolute top-0 right-0 w-72 h-full rounded-r-2xl opacity-[0.22]"
          style={{ background: "radial-gradient(ellipse at top right, #0a3d1e 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23ffffff' stroke-width='0.4'/%3E%3Ccircle cx='24' cy='24' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundSize: "48px 48px", animation: "mfg-grid 7s ease-in-out infinite",
        }} />

        <div className="relative z-10 grid grid-cols-12">

          {/* LEFT 70% */}
          <div className="col-span-12 lg:col-span-8 px-6 pt-6 pb-6 sm:px-8 sm:pt-7 sm:pb-7 flex flex-col justify-between gap-5">
            {/* Badge */}
            <div className="relative inline-block self-start">
              <button type="button"
                className="relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-200/90 border border-emerald-400/20 hover:border-emerald-400/50 hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-200"
                style={{ background: "rgba(20,55,30,0.90)" }}
                onMouseEnter={() => setTipVisible(true)}
                onMouseLeave={() => setTipVisible(false)}>
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.11) 50%, transparent 70%)",
                  backgroundSize: "200% 100%", animation: "mfg-badgeShimmer 3.5s ease-in-out infinite",
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
              <h1 className="font-bold text-white leading-[1.1] tracking-[-0.02em] mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}>
                <span className="block text-[52px] sm:text-[64px] md:text-[72px] font-black"
                  style={{ color: "#2ACB83" }}>
                  50+
                </span>
                <span className="block text-[22px] sm:text-[28px] md:text-[32px] font-bold text-white">
                  Live Opportunities Are Waiting for You
                </span>
              </h1>
              <p className="text-[#8faabb] text-[13px] sm:text-[14px] leading-relaxed max-w-[520px]">
                Manufacturers with completed profiles receive 3X more aligned buyer inquiries within their first 30 days.
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex flex-col gap-1.5 max-w-[520px]">
              <div className="w-full h-[8px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
                <div className="h-full rounded-full" style={{
                  width: progressMounted ? "6%" : "0%",
                  transition: "width 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
                  background: "linear-gradient(90deg, #4ade80 0%, #34d399 100%)",
                  boxShadow: "0 0 12px rgba(74,222,128,0.50)",
                }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold" style={{ color: "#4ade80" }}>6% Complete</span>
                <span className="text-[11px] text-white/35 font-medium">Profile Setup In Progress</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#002d14] text-[13px] font-bold rounded-lg hover:bg-emerald-50 hover:shadow-[0_0_16px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-200 shadow-sm">
                Set Up Plant Profile <ArrowRight size={14} strokeWidth={2.5} />
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 border border-white/30 text-[13px] font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200" style={{ color: "rgba(255,255,255,0.90)" }}>
                Explore Projects <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* RIGHT 30%: Buyer Signal Carousel */}
          <div className="col-span-12 lg:col-span-4 flex overflow-hidden">
            <div className="hidden lg:block w-px self-stretch bg-white/[0.07] shrink-0" />
            <div className="flex-1 flex flex-col px-5 pt-6 pb-5 sm:px-6 justify-between gap-4"
              style={{ background: "rgba(0,0,0,0.22)" }}>
              <h3 className="text-white text-[15px] font-bold leading-snug shrink-0" style={{ fontFamily: "Poppins, sans-serif" }}>
                What Buyers are Looking For?
              </h3>
              {(() => {
                const s = BUYER_SIGNALS[cardIdx];
                return (
                  <div key={cardIdx} className="flex flex-col gap-2.5 flex-1" style={{ animation: "mfg-cardFade 0.38s ease both" }}>
                    <span className="text-[44px] leading-none">{s.flag}</span>
                    <p className="text-white text-[17px] font-bold leading-snug">{s.city}, {s.country}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-emerald-400/25 w-fit"
                      style={{ background: "rgba(52,211,153,0.08)" }}>
                      <span className="relative flex h-[6px] w-[6px] shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-emerald-400" />
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 tracking-[0.14em]">SCINODE VERIFIED</span>
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.15em]" style={{ color: "rgba(52,211,153,0.80)" }}>{s.role}</p>
                    <p className="text-[13px] leading-[1.7] italic flex-1" style={{ color: "rgba(255,255,255,0.60)", wordBreak: "break-word", overflow: "hidden" }}>
                      &ldquo;{s.quote}&rdquo;
                    </p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Updated just now</p>
                  </div>
                );
              })()}
              <div className="flex items-center gap-1.5 shrink-0">
                {BUYER_SIGNALS.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} aria-label={`Signal ${i + 1}`}
                    className="h-[5px] rounded-full transition-all duration-300"
                    style={{ width: i === cardIdx ? 20 : 5, background: i === cardIdx ? "#4ade80" : "rgba(255,255,255,0.22)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2A. OPPORTUNITY SECTION (50+)
// ═══════════════════════════════════════════════════════════════════════════════
function OpportunitySection({ onStartOnboarding }: { onStartOnboarding?: () => void }) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border-2 border-[#1F6F54] bg-white p-6 flex flex-col shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(1,99,88,0.28) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="pointer-events-none absolute bottom-0 right-0 w-60 h-60 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(15,144,198,0.22) 0%, transparent 70%)", filter: "blur(36px)" }} />

      <div className="relative z-10 font-black text-[#1f6f54] leading-none transition-transform duration-300 group-hover:scale-[1.02] origin-left"
        style={{ fontSize: "clamp(64px, 8vw, 88px)" }}>
        50+
      </div>
      <h2 className="relative z-10 mt-3 font-bold text-[#171717] leading-tight"
        style={{ fontSize: "clamp(22px, 2.8vw, 34px)" }}>
        Opportunities waiting for you
      </h2>
      <p className="relative z-10 mt-2 text-[#6b7280] text-sm leading-relaxed">
        Start onboarding, get verified, and get matched. Your next big partnership is just a few clicks away.
      </p>

      <button onClick={onStartOnboarding}
        className="relative z-10 mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1f6f54] hover:bg-[#185c45] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
        <Plus size={16} /> Start Onboarding Now
      </button>

      <div className="relative z-10 mt-4 rounded-2xl border border-[#cfd8dc] bg-white/80 backdrop-blur-sm p-4 flex items-start gap-3 transition-all duration-300 hover:shadow-md">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#e8f5f2] flex items-center justify-center">
          <Layers size={20} className="text-[#1f6f54]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#171717] leading-snug">
            Get leads right away for your matched products
          </p>
          <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
            Start aligning your ready-to-sell products and crack your first deal.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f6f54] text-[#1f6f54] text-xs font-semibold hover:bg-[#1f6f54] hover:text-white transition-all duration-200">
            Browse Buyer Requirements <ArrowRight size={11} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#d7f9f2] flex-1">
          <FileText size={15} className="text-[#1f6f54] shrink-0" />
          <div>
            <span className="text-sm font-black text-[#1f6f54]">350+</span>
            <span className="ml-1 text-[11px] font-medium text-[#1f6f54]/80">Open RFQs</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#eaf1ff] flex-1">
          <Users size={15} className="text-[#3b5bdb] shrink-0" />
          <div>
            <span className="text-sm font-black text-[#3b5bdb]">120+</span>
            <span className="ml-1 text-[11px] font-medium text-[#3b5bdb]/80">Active Buyers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2B. ONBOARDING CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════════
function OnboardingChecklist({ onOpenProfile }: { onOpenProfile?: () => void }) {
  // Map to logical groups: Company(0), Products(1), Terms(7) → core; rest → advanced
  const coreSteps     = [ONBOARDING_STEPS[0], ONBOARDING_STEPS[1], ONBOARDING_STEPS[7]];
  const advancedSteps = ONBOARDING_STEPS.slice(2, 7);
  const doneCount     = ONBOARDING_STEPS.filter(s => s.done).length;
  const coreDone      = coreSteps.filter(s => s.done).length;
  const pct           = Math.round((doneCount / ONBOARDING_STEPS.length) * 100);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex-1 min-h-0 flex flex-col shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-tight">Onboarding Checklist</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Complete all steps to activate your account</p>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-semibold shrink-0">
          {doneCount}/{ONBOARDING_STEPS.length} done
        </span>
      </div>

      {/* Discovery Score progress */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-slate-500 font-medium">Discovery Score</span>
        <span className="text-[11px] font-bold" style={{ color: "#1F6F54" }}>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2ACB83,#1F6F54)" }} />
      </div>

      {/* Two-group scrollable list */}
      <div className={[
        "overflow-y-auto pr-0.5 flex flex-col gap-0.5 flex-1",
        "[&::-webkit-scrollbar]:w-[3px]",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-slate-200",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
      ].join(" ")} style={{ maxHeight: 360 }}>

        {/* ── Onboarding group ───────────────────────── */}
        <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg mb-1"
          style={{ background: "rgba(42,203,131,0.07)" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px]">📋</span>
            <span className="text-[8.5px] font-bold tracking-[0.13em] uppercase" style={{ color: "#1F6F54" }}>
              Onboarding — Required
            </span>
          </div>
          <span className="text-[9px] font-semibold" style={{ color: "#1F6F54" }}>
            {coreDone} / {coreSteps.length}
          </span>
        </div>

        {coreSteps.map(step => (
          <div key={step.label}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors cursor-pointer ${step.done ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={step.done ? { background: "#1F6F54" } : { background: step.iconBg }}>
              {step.done
                ? <Check className="w-3.5 h-3.5 text-white" />
                : <step.Icon className="w-3 h-3" style={{ color: step.iconColor }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide leading-snug">{step.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{step.desc}</p>
              {step.done
                ? <span className="text-[10px] font-semibold" style={{ color: "#1F6F54" }}>Done</span>
                : <button onClick={onOpenProfile} className="text-[10px] font-semibold hover:underline mt-0.5 transition-colors" style={{ color: "#0077CC" }}>
                    {step.action}
                  </button>}
            </div>
          </div>
        ))}

        {/* ── Enrichment group ───────────────────────── */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mt-3 mb-1"
          style={{ background: "rgba(251,191,36,0.09)" }}>
          <span className="text-[9px]">✨</span>
          <span className="text-[8.5px] font-bold tracking-[0.13em] uppercase text-amber-700">
            Profile Enrichment — optional
          </span>
        </div>

        {advancedSteps.map(step => (
          <div key={step.label}
            className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: step.iconBg }}>
              <step.Icon className="w-3 h-3" style={{ color: step.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide leading-snug">{step.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{step.desc}</p>
              <button onClick={onOpenProfile} className="text-[10px] font-semibold hover:underline mt-0.5 transition-colors" style={{ color: "#0077CC" }}>
                {step.action}
              </button>
            </div>
          </div>
        ))}

        {/* ── Plan upgrade nudge ─────────────────────── */}
        <div className="mt-3 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border"
          style={{ background: "#0F0F0A", borderColor: "rgba(212,175,55,0.28)" }}>
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold" style={{ color: "#D4AF37" }}>👑 Upgrade to Scinode Pro</p>
            <p className="text-[9.5px] mt-[1px] leading-snug" style={{ color: "rgba(212,175,55,0.55)" }}>
              Unlock unlimited RFQs, exclusive projects & more
            </p>
          </div>
          <button className="text-[9.5px] font-bold px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#B8962E 0%,#D4AF37 100%)", color: "#0F0F0A" }}>
            Upgrade →
          </button>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3A. PRODUCT SHOWCASE (left 70%)
// ═══════════════════════════════════════════════════════════════════════════════
const ACTIVE_SEARCHES = [
  { label: "Specialty Chemicals",  count: 34 },
  { label: "Industrial Chemicals", count: 28 },
  { label: "Agrochemicals",        count: 19 },
  { label: "Pharmaceutical APIs",  count: 15 },
];

const DEMO_PRODUCTS = [
  { name: "Triethyl Orthoformate", cas: "122-51-0", views: 48, interest: "High",   interestColor: "#0F7614", interestBg: "#B2F3B7", enquiries: 3    },
  { name: "Methyl Benzoate",       cas: "93-58-3",  views: 12, interest: "Low",    interestColor: "#4B5563", interestBg: "#F3F4F6", enquiries: null  },
  { name: "Sodium Lauryl Sulfate", cas: "151-21-3", views: 31, interest: "Medium", interestColor: "#9C5022", interestBg: "#FBF0C5", enquiries: 1    },
  { name: "Benzyl Alcohol",        cas: "100-51-6", views: 19, interest: "Low",    interestColor: "#4B5563", interestBg: "#F3F4F6", enquiries: null  },
  { name: "Ethyl Acetate",         cas: "141-78-6", views: 27, interest: "Medium", interestColor: "#9C5022", interestBg: "#FBF0C5", enquiries: 2    },
];

function ProductShowcase({ demoState, setDemoState }: { demoState: 0 | 1 | 2; setDemoState: (s: 0 | 1 | 2) => void }) {
  const router = useRouter();

  const DEMO_TABS: Array<{ label: string; bg: string; color: string; border: string }> = [
    { label: "0 Listed",        bg: "#FEF0EB", color: "#FD4923", border: "rgba(253,73,35,0.30)" },
    { label: "Catalogue Added", bg: "#E8FBF2", color: "#1F6F54", border: "rgba(42,203,131,0.35)" },
    { label: "Full Intel",      bg: "#E6F3FB", color: "#0077CC", border: "rgba(0,119,204,0.30)" },
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col gap-4 h-full">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-0.5">CATALOGUE SIGNALS</p>
          <h2 className="text-[15px] sm:text-base font-bold text-slate-900 leading-tight">
            {demoState === 2 ? "How Your Products Are Performing" : "Showcase Your Products to Get Noticed"}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            {demoState === 0 && "Add your product catalogue to unlock the right demand."}
            {demoState === 1 && "Your catalogue is indexed — performance intel coming within 24–48 hrs."}
            {demoState === 2 && "Buyer activity across your listed products this week."}
          </p>
        </div>
        {/* Demo state switcher tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {DEMO_TABS.map((tab, i) => (
            <button key={i} onClick={() => setDemoState(i as 0 | 1 | 2)}
              className="text-[9px] font-bold px-2.5 py-[4px] rounded-full transition-all whitespace-nowrap"
              style={{
                background:  demoState === i ? tab.bg      : "#f9fafb",
                color:       demoState === i ? tab.color   : "#9ca3af",
                border:      `1px solid ${demoState === i ? tab.border : "#e5e7eb"}`,
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ STATE 0 — Zero products listed ══════════════════════════ */}
      {demoState === 0 && (
        <>
          {/* Benefit strip */}
          <div className="rounded-xl p-3.5" style={{ background: "rgba(42,203,131,0.05)", border: "1px solid rgba(42,203,131,0.18)" }}>
            <p className="text-[10px] font-bold text-[#1F6F54] mb-2.5">📦 Why your product catalogue matters</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { metric: "3×",  label: "more RFQ matches with a complete catalogue"                    },
                { metric: "96",  label: "buyers searched your category this week"                         },
                { metric: "65%", label: "of matched opportunities rely on product-level information"      },
              ].map((b, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-[22px] font-black leading-none" style={{ color: "#1F6F54" }}>{b.metric}</span>
                  <span className="text-[9.5px] text-slate-400 leading-snug">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live buyer searches */}
          <div className="rounded-xl border border-slate-100 p-3.5" style={{ background: "#fafafa" }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Live Demand Activity In Your Industry – This Week
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVE_SEARCHES.map(s => (
                <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                  style={{ background: "#1F6F54", color: "#ffffff" }}>
                  <span>{s.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: "rgba(255,255,255,0.20)" }}>{s.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-2.5 leading-snug">
              <span className="font-semibold text-[#1F6F54]">96 buyers</span> searched your industry this week.
              List your products to appear in their results.
            </p>
          </div>

          {/* Empty state CTA */}
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-6 px-4 relative overflow-hidden">
            {/* Ghost blurred rows */}
            <div className="absolute inset-x-0 top-0 px-4 pt-3 select-none pointer-events-none"
              style={{ filter: "blur(4px)", opacity: 0.20 }}>
              {DEMO_PRODUCTS.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.cas}</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{p.views} views</span>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: "#dff3ee" }}>
                <Package size={22} style={{ color: "#1f6f54" }} />
              </div>
              <p className="text-[13px] font-bold text-slate-700 mb-1">No products listed yet</p>
              <p className="text-[11px] text-slate-400 mb-2 max-w-[240px] leading-snug">
                Add your product catalogue to unlock relevant projects and demand visibility.
              </p>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full mb-4 inline-block"
                style={{ background: "#fef3c7", color: "#92400e" }}>
                ⚡ Add min. 1 product to complete onboarding
              </span>
              <button className="flex items-center gap-2 px-5 py-2.5 text-white text-[13px] font-bold rounded-xl transition-all hover:brightness-110"
                style={{ background: "#1F6F54" }}>
                <Plus size={15} /> Add Your Products
              </button>
            </div>
          </div>

        </>
      )}

      {/* ══ STATE 1 — Products added, indexing in progress ══════════ */}
      {demoState === 1 && (
        <div className="relative flex-1 flex flex-col gap-1.5 overflow-hidden">
          {/* Product table — visible underneath overlay */}
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.10em] text-slate-400">Your Products</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#E8FBF2", color: "#1F6F54" }}>5 Listed</span>
          </div>
          <div className="grid grid-cols-12 px-3 py-2 rounded-lg text-[8.5px] font-bold uppercase tracking-wide text-slate-400"
            style={{ background: "#f9fafb" }}>
            <span className="col-span-6">Product</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-center">Views</span>
            <span className="col-span-2 text-center">Enquiries</span>
          </div>
          {DEMO_PRODUCTS.map((p, i) => (
            <div key={i} className="grid grid-cols-12 px-3 py-2.5 rounded-xl border border-slate-100 items-center">
              <div className="col-span-6 min-w-0">
                <p className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-[9px] font-mono text-slate-400">CAS {p.cas}</p>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="text-[8px] font-bold px-2 py-[3px] rounded-full"
                  style={{ background: "#fef3c7", color: "#92400e" }}>Indexing</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-[12px] font-bold text-slate-200">—</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-[12px] font-bold text-slate-200">—</span>
              </div>
            </div>
          ))}

          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(3px)" }} />

          {/* Info block centred over overlay */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl p-5 shadow-lg"
              style={{ background: "#FBF0C5", border: "1px solid rgba(156,80,34,0.25)", boxShadow: "0 4px 24px rgba(156,80,34,0.12)" }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(156,80,34,0.12)" }}>
                  <span className="text-[17px]">⏳</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold mb-1" style={{ color: "#9C5022" }}>Catalogue indexing in progress</p>
                  <p className="text-[11px] leading-snug" style={{ color: "#92400e" }}>
                    Our team is reviewing your products. Buyer matching and performance intel will be live within <span className="font-semibold">24–48 hrs</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ STATE 2 — Catalogue indexed, onboarding incomplete ═══════ */}
      {/* ══ STATE 2 — Full intel ═════════════════════════════════════ */}
      {demoState === 2 && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: "⭐", label: "STAR PRODUCT",      value: "Triethyl Orthoformate", sub: "Boost Product Demand →", subColor: "#1F6F54", big: false, accent: true,  tooltip: "Product receiving the highest buyer demand and platform traffic" },
              { icon: "📊", label: "PRODUCTS LISTED",   value: "5",  sub: "Active catalogue",   subColor: "#6b7280", big: true,  accent: false, tooltip: "Total products indexed and visible to buyers in the Scinode catalogue" },
              { icon: "💬", label: "PRODUCT ENQUIRIES", value: "6",  sub: "Requests received",  subColor: "#6b7280", big: true,  accent: false, tooltip: "Direct buyer enquiries received for your listed products this month" },
              { icon: "⚡", label: "BUYER SIGNALS",     value: "91", sub: "Views with intent",  subColor: "#6b7280", big: true,  accent: false, tooltip: "Buyer profile views, saves, and category searches matched to your products" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1 p-2.5 rounded-xl border"
                style={{ borderColor: s.accent ? "rgba(42,203,131,0.30)" : "#e8ecf0", background: s.accent ? "rgba(42,203,131,0.04)" : "white" }}>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{s.icon}</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-slate-400 leading-tight">{s.label}</span>
                  <span className="ml-auto shrink-0"><InfoTip text={s.tooltip} dir="down" /></span>
                </div>
                {s.big
                  ? <p className="text-[22px] font-black leading-tight text-slate-900">{s.value}</p>
                  : <p className="text-[11px] font-bold text-slate-800 leading-tight">{s.value}</p>}
                <p className="text-[9px] font-semibold cursor-pointer" style={{ color: s.subColor }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Product performance table */}
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-12 px-3 py-2 rounded-lg mb-1 text-[8.5px] font-bold uppercase tracking-wide text-slate-400"
              style={{ background: "#f9fafb" }}>
              <span className="col-span-8">Product</span>
              <span className="col-span-4 text-center">Views</span>
            </div>
            {DEMO_PRODUCTS.map((p, i) => (
              <div key={i} className="grid grid-cols-12 px-3 py-2.5 border-b border-slate-50 items-center hover:bg-slate-50/60 transition-all cursor-pointer"
                style={{ borderLeft: i === 0 ? "3px solid #2ACB83" : "3px solid transparent" }}>
                <div className="col-span-8 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[9px] font-mono text-slate-400">CAS {p.cas}</p>
                </div>
                <div className="col-span-4 flex items-center justify-center">
                  <span className="text-[13px] font-black text-slate-700">{p.views}</span>
                </div>
              </div>
            ))}
          </div>

        </>
      )}

    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DC SIDE PANEL — 3 states tied to ProductShowcase demoState
// ═══════════════════════════════════════════════════════════════════════════════
// Timeline stages in order: index = progress position (0=earliest, 3=latest)
const DC_TIMELINE_STAGES = ["Set for Demand", "Demand Generation", "Execution Planning", "Opportunities Pipeline"] as const;
type DcStage = typeof DC_TIMELINE_STAGES[number];

const DC_CAMPAIGN_PRODUCTS: Array<{ name: string; opps: number; stage: DcStage }> = [
  { name: "Triethyl Orthoformate", opps: 12, stage: "Opportunities Pipeline" },
  { name: "Benzyl Chloride",       opps: 5,  stage: "Execution Planning"     },
  { name: "Diethyl Carbonate",     opps: 0,  stage: "Demand Generation"      },
  { name: "Ethyl Acetate",         opps: 0,  stage: "Set for Demand"         },
  { name: "Acetic Anhydride",      opps: 8,  stage: "Opportunities Pipeline" },
];

const STAGE_COLORS: Record<DcStage, { bg: string; text: string; dot: string }> = {
  "Set for Demand":         { bg: "rgba(100,116,139,0.10)", text: "#64748b", dot: "#cbd5e1" },
  "Demand Generation":      { bg: "rgba(0,119,204,0.10)",  text: "#0077CC", dot: "#93c5fd" },
  "Execution Planning":     { bg: "rgba(98,55,199,0.10)",  text: "#6237C7", dot: "#a78bfa" },
  "Opportunities Pipeline": { bg: "rgba(31,111,84,0.10)",  text: "#1F6F54", dot: "#4ade80" },
};

const DC_DEMO_TABS = [
  { label: "0 Listed",        bg: "#FEF0EB", color: "#FD4923", border: "rgba(253,73,35,0.30)" },
  { label: "Catalogue Added", bg: "#E8FBF2", color: "#1F6F54", border: "rgba(42,203,131,0.35)" },
  { label: "Full Intel",      bg: "#E6F3FB", color: "#0077CC", border: "rgba(0,119,204,0.30)" },
];

function DemandCatalystSidePanel({ demoState, setDemoState }: { demoState: 0 | 1 | 2; setDemoState: (s: 0 | 1 | 2) => void }) {
  const router = useRouter();
  const goToDC = () => router.push("/dashboard/demand-catalyst");
  const goToProfile = () => router.push("/dashboard/profile");

  return (
    <div className="flex flex-col w-full overflow-hidden gap-2">
      {/* Demo tabs */}
      <div className="flex items-center gap-1.5">
        {DC_DEMO_TABS.map((tab, i) => (
          <button key={i} onClick={() => setDemoState(i as 0 | 1 | 2)}
            className="text-[9px] font-bold px-2.5 py-[4px] rounded-full transition-all whitespace-nowrap"
            style={{
              background:  demoState === i ? tab.bg      : "#f9fafb",
              color:       demoState === i ? tab.color   : "#9ca3af",
              border:      `1px solid ${demoState === i ? tab.border : "#e5e7eb"}`,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden" style={demoState === 0 ? { borderRadius: "16px" } : { background: "#fff", borderRadius: "16px", border: "1px solid #e4e4e7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

      {/* State 0 — Dark green promo card (no products) */}
      {demoState === 0 && (
        <div className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(125deg, #003A1B 0%, #001C08 55%, #000d04 100%)" }}>
          {/* Hero-identical overlay layers */}
          <div className="relative overflow-hidden flex-1 flex flex-col">
            {/* Green radial glow — top centre */}
            <div className="pointer-events-none absolute -top-16 left-[20%] w-56 h-56 rounded-full opacity-[0.18]"
              style={{ background: "radial-gradient(circle, #1db877 0%, transparent 68%)", filter: "blur(52px)" }} />
            {/* Blue radial glow — bottom left */}
            <div className="pointer-events-none absolute bottom-10 left-0 w-40 h-40 rounded-full opacity-[0.09]"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(38px)" }} />
            {/* Dark ellipse vignette — top right */}
            <div className="pointer-events-none absolute top-0 right-0 w-40 h-full rounded-r-2xl opacity-[0.22]"
              style={{ background: "radial-gradient(ellipse at top right, #0a3d1e 0%, transparent 70%)" }} />
            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23ffffff' stroke-width='0.4'/%3E%3Ccircle cx='24' cy='24' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`, backgroundSize: "48px 48px" }} />

            <div className="relative z-10 flex flex-col justify-between flex-1 px-5 pt-5 pb-5">
              {/* Top section */}
              <div>
                {/* Logo row */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    <Rocket size={20} color="#fff" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-white leading-tight">Demand Catalyst</p>
                    <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>by Scinode</p>
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-[30px] font-black text-white leading-[1.15] mb-5">
                  Generate Demand<br />For Your Products
                </h3>

                {/* Feature list */}
                <div className="flex flex-col gap-3 mb-5">
                  {[
                    "Targeted buyer & distributor outreach",
                    "Star product demand campaigns",
                    "Sales reach, meetings & follow-ups",
                    "Exclusive opportunity pipeline",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[16px] font-black shrink-0" style={{ color: "#4ade80" }}>+</span>
                      <span className="text-[13.5px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                  {[
                    { value: "3×",   label: "More RFQ matches" },
                    { value: "96",   label: "Buyers this week" },
                    { value: "65%",  label: "Rely on catalogue" },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-0.5">
                      <span className="text-[20px] font-black leading-none" style={{ color: "#4ade80" }}>{s.value}</span>
                      <span className="text-[9.5px] font-medium leading-snug" style={{ color: "rgba(255,255,255,0.50)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={goToProfile}
                className="w-full py-3.5 rounded-xl text-[14px] font-black transition-all hover:brightness-110 mt-5"
                style={{ background: "#4ade80", color: "#0d3d2a" }}>
                Add Your Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 1 — Products uploaded, no campaign */}
      {demoState === 1 && (
        <div className="flex flex-col gap-2.5 px-4 py-3.5">
          <div className="pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Rocket size={11} style={{ color: "#1F6F54" }} />
              <p className="text-[9.5px] font-bold tracking-[0.15em] text-slate-400 uppercase">Demand Catalyst</p>
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 leading-tight">Launch Your First Campaign</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Your catalogue is indexed and ready for demand generation.</p>
          </div>

          {/* Product count badge — compact horizontal layout */}
          <div className="flex items-center gap-3 rounded-xl px-3.5 py-3"
            style={{ background: "linear-gradient(125deg, #003A1B 0%, #001C08 55%, #000d04 100%)" }}>
            <span className="text-[32px] font-black leading-none tabular-nums text-white shrink-0">5</span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.50)" }}>Products</p>
              <p className="text-[10.5px] font-medium leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                Select up to <span className="font-bold text-white">5 ★ stars</span> to launch
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">How It Works</p>
            {[
              { step: "1", text: "Pick your highest-potential products as ★ stars", sub: "Choose up to 5 products to spotlight" },
              { step: "2", text: "We build a demand brief for each star product",  sub: "Our team crafts targeted outreach content" },
              { step: "3", text: "Buyers, distributors & agents are reached out",   sub: "Direct connections to relevant buyers" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-2.5 px-3 py-2 rounded-xl border border-slate-100"
                style={{ background: "rgba(31,111,84,0.02)" }}>
                <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(31,111,84,0.12)", color: "#1F6F54" }}>{s.step}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-700 leading-snug">{s.text}</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* T&Cs banner */}
          <div className="rounded-xl px-3 py-2.5" style={{ background: "#FBF0C5", border: "1px solid rgba(156,80,34,0.22)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] shrink-0">📋</span>
              <p className="text-[10px] leading-snug flex-1" style={{ color: "#92400e" }}>
                <span className="font-bold" style={{ color: "#9C5022" }}>One more step: </span>
                Sign the <span className="font-semibold">Platform T&Cs</span> to go live.
              </p>
              <button onClick={() => goToProfile()}
                className="shrink-0 text-[10px] font-bold underline underline-offset-2 whitespace-nowrap transition-opacity hover:opacity-70"
                style={{ color: "#9C5022" }}>
                Go to T&Cs →
              </button>
            </div>
          </div>

          <button onClick={goToDC}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110"
            style={{ background: "#1F6F54" }}>
            Start Selecting Products <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* State 2 — Campaign running */}
      {demoState === 2 && (
        <div className="flex flex-col gap-2.5 px-4 py-4 h-full">
          <div className="pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Rocket size={11} style={{ color: "#1F6F54" }} />
              <p className="text-[9.5px] font-bold tracking-[0.15em] text-slate-400 uppercase">Demand Catalyst</p>
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 leading-tight">Active Campaign Overview</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Live opportunity pipeline across your star products.</p>
          </div>
          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Opportunities", value: "25", color: "#1F6F54" },
              { label: "Demand Setup",  value: "2",  color: "#0077CC" },
              { label: "Execution",     value: "1",  color: "#6237C7" },
            ].map(c => (
              <div key={c.label} className="flex flex-col items-center py-2 rounded-xl border border-slate-100 bg-slate-50/60">
                <span className="text-[22px] font-black leading-none tabular-nums" style={{ color: c.color }}>{c.value}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mt-0.5 text-center leading-tight">{c.label}</span>
              </div>
            ))}
          </div>
          {/* Per-product timeline */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-400">★ Star Products</p>
              <div className="flex items-center gap-2">
                {DC_TIMELINE_STAGES.map(s => (
                  <span key={s} className="text-[7.5px] font-medium text-slate-300 truncate max-w-[40px] text-center leading-tight">{s.split(" ")[0]}</span>
                ))}
              </div>
            </div>
            {DC_CAMPAIGN_PRODUCTS.map((p, i) => {
              const sc = STAGE_COLORS[p.stage];
              const activeIdx = DC_TIMELINE_STAGES.indexOf(p.stage);
              return (
                <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-semibold text-slate-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8.5px] font-semibold px-1.5 py-[2px] rounded-full" style={{ background: sc.bg, color: sc.text }}>{p.stage}</span>
                      {p.opps > 0 && (
                        <span className="text-[8.5px] font-bold tabular-nums" style={{ color: "#1F6F54" }}>{p.opps} opp{p.opps !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  {/* Timeline dots */}
                  <div className="flex items-center gap-[5px] shrink-0">
                    {DC_TIMELINE_STAGES.map((s, si) => {
                      const done = si <= activeIdx;
                      const active = si === activeIdx;
                      return (
                        <div key={s} className="flex items-center gap-[5px]">
                          <div className="w-2 h-2 rounded-full transition-all"
                            style={{ background: done ? sc.dot : "#e2e8f0", boxShadow: active ? `0 0 0 2px white, 0 0 0 3px ${sc.dot}` : "none" }} />
                          {si < DC_TIMELINE_STAGES.length - 1 && (
                            <div className="w-3 h-[1.5px]" style={{ background: done && si < activeIdx ? sc.dot : "#e2e8f0" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex-1" />
          <button onClick={goToDC}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110"
            style={{ background: "#1F6F54" }}>
            Open Demand Catalyst <ArrowRight size={13} />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3B. MARKET PULSE PANEL (right 30%)
// ═══════════════════════════════════════════════════════════════════════════════
function MarketPulsePanel() {
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-2.5 pb-2.5" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <h3 className="text-[14px] font-bold text-[#0e3d24] mb-0.5" style={{ fontFamily: "Poppins,sans-serif" }}>
          Market Pulse 🚀
        </h3>
        <p className="text-[10.5px] leading-snug" style={{ color: "#2d6a4f" }}>
          Identify relevant demand, pricing movement, activity trends, and export signals for your product.
        </p>
      </div>

      {/* What You'll Get */}
      <div className="px-4 py-2.5 flex-1 flex flex-col" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#2d6a4f" }}>
          WHAT YOU&apos;LL GET
        </p>
        <div className="flex flex-col justify-between flex-1">
          {MARKET_PULSE_WHAT_YOU_GET.map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <span className="text-[13px] shrink-0 mt-[1px] leading-none">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold leading-tight" style={{ color: "#0e3d24" }}>{item.label}</p>
                <p className="text-[9px] leading-snug mt-[1px]" style={{ color: "#4b7a62" }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week Usage */}
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(42,203,131,0.18)" }}>
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#2d6a4f" }}>
          THIS WEEK ON MARKET PULSE
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            { icon: "📸", label: "Snapshots Generated", used: 0, total: 5 },
            { icon: "📄", label: "Detailed Reports",    used: 0, total: 1 },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{ background: i === 0 ? "rgba(42,203,131,0.08)" : "rgba(0,119,204,0.06)", border: `1px solid ${i === 0 ? "rgba(42,203,131,0.22)" : "rgba(0,119,204,0.18)"}` }}>
              <span className="text-[15px] shrink-0">{row.icon}</span>
              <p className="flex-1 text-[11px] font-semibold" style={{ color: i === 0 ? "#0e3d24" : "#0c3460" }}>{row.label}</p>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: i === 0 ? "#1F6F54" : "#0077CC" }}>{row.used} / {row.total}</span>
              <span className="text-[8.5px] font-bold px-1.5 py-[2px] rounded-full"
                style={{ background: "rgba(42,203,131,0.15)", color: "#1F6F54" }}>FREE</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-2.5">
        <button className="w-full py-2 rounded-xl text-[10.5px] font-bold tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#2ACB83", color: "#020202" }}>
          GENERATE MARKET SNAPSHOT
        </button>
        <p className="text-center text-[8.5px] mt-1" style={{ color: "#4b7a62" }}>5 snapshots remaining this week</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. GLOBAL OPPORTUNITY MAP
// ═══════════════════════════════════════════════════════════════════════════════
function GlobalOpportunityMap() {
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [filter,    setFilter]    = useState<"capability" | "catalogue">("capability");
  const [mapState,  setMapState]  = useState<"no-products" | "mapping" | "active">("no-products");
  const mounted = useMounted(200);
  const router  = useRouter();

  const getVal    = (pin: typeof MAP_PINS[0]) => filter === "capability" ? pin.rfqs + pin.contractMfg + pin.cdmo : pin.catalogueLeads;
  const sortedPins = [...MAP_PINS].sort((a, b) => getVal(b) - getVal(a));
  const maxVal     = Math.max(...MAP_PINS.map(getVal));

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes d0PinGlow { 0%,100%{opacity:0.28;transform:scale(0.80)} 50%{opacity:0.60;transform:scale(1.22)} }
        @keyframes d0TooltipFade { from{opacity:0;transform:translateY(4px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 mb-0.5">GLOBAL INTELLIGENCE</p>
          <h3 className="text-[16px] font-bold text-slate-900 leading-snug">Your Global Opportunity Map</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {mapState === "no-products" && "Add products to unlock your global opportunity map and start tracking where demand is emerging for your offerings."}
            {mapState === "mapping"     && "Identifying and routing relevant demand signals for your products. Your opportunity map will update as activity starts flowing. ⏳"}
            {mapState === "active"      && "Global buyers are actively sourcing from manufacturers in your category."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Demo state switcher */}
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(["no-products", "mapping", "active"] as const).map(s => (
              <button key={s} onClick={() => setMapState(s)}
                className={cn("px-2.5 py-1.5 rounded-md text-[9.5px] font-semibold transition-all whitespace-nowrap",
                  mapState === s ? "bg-white shadow-sm text-[#1e293b]" : "text-slate-500 hover:text-slate-700")}>
                {s === "no-products" ? "No Products" : s === "mapping" ? "Mapping" : "Active"}
              </button>
            ))}
          </div>
          {mapState === "active" && (
            <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {(["capability", "catalogue"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                    filter === f ? "bg-white shadow-sm text-[#1e293b]" : "text-slate-500 hover:text-slate-700")}>
                  {f === "capability" ? "Capability Based" : "Catalogue Based"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── State 1: No products — blurred map + CTA overlay ── */}
      {mapState === "no-products" && (
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          {/* Map (blurred) */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #eef2f8 0%, #e8edf5 60%, #eaf0f7 100%)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/world-map.svg" alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.55, filter: "brightness(0.68) saturate(0) blur(6px)", objectPosition: "center 40%" }} />
          {/* Frost overlay */}
          <div className="absolute inset-0" style={{ backdropFilter: "blur(8px)", background: "rgba(241,245,249,0.65)" }} />
          {/* CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#dff3ee" }}>
              <Globe size={24} style={{ color: "#1F6F54" }} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 mb-1">No Products Added Yet</p>
              <p className="text-[11px] text-slate-500 max-w-[340px] leading-relaxed">
                Add products to unlock your global opportunity map and start tracking where demand is emerging for your offerings.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/profile?tab=products")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all hover:brightness-110"
              style={{ background: "#1F6F54" }}>
              <Plus size={14} /> Add Products
            </button>
          </div>
        </div>
      )}

      {/* ── State 2: Mapping in progress — soft blur + skeleton ── */}
      {mapState === "mapping" && (
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #eef2f8 0%, #e8edf5 60%, #eaf0f7 100%)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/world-map.svg" alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.55, filter: "brightness(0.68) saturate(0)", objectPosition: "center 40%" }} />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(3px)", background: "rgba(241,245,249,0.45)" }} />
          {/* Skeleton demand indicators */}
          {[{ left: "67%", top: "48%" }, { left: "49%", top: "26%" }, { left: "18%", top: "37%" }, { left: "74%", top: "40%" }].map((pos, i) => (
            <div key={i} className="absolute" style={{ left: pos.left, top: pos.top, transform: "translate(-50%,-50%)" }}>
              <div className="w-5 h-5 rounded-full animate-pulse" style={{ background: "rgba(148,163,184,0.45)", border: "2px solid rgba(148,163,184,0.30)" }} />
            </div>
          ))}
          {/* Status badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-center px-6">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ background: "#FBF0C5", border: "1px solid rgba(156,80,34,0.30)", backdropFilter: "blur(8px)" }}>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#9C5022" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#9C5022" }} />
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "#9C5022" }}>Demand mapping in progress…</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed bg-white/80 px-3 py-1.5 rounded-lg">
              Identifying and routing demand signals for your products. Map updates as activity flows in.
            </p>
          </div>
        </div>
      )}

      {/* ── State 3: Active — full live map ── */}
      {mapState === "active" && (
      <div className="flex">
        {/* Map */}
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
            const cfg   = TIER_CONFIG[pin.tier];
            const color = cfg.color;
            const isHov = hovered  === pin.id;
            const isSel = selected === pin.id;
            const active = isHov || isSel;
            return (
              <div key={pin.id} className="absolute cursor-pointer"
                style={{ left: pin.left, top: pin.top, transform: "translate(-50%,-100%)", zIndex: active ? 30 : 10 }}
                onMouseEnter={() => setHovered(pin.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s => s === pin.id ? null : pin.id)}>

                <div className="absolute rounded-full pointer-events-none" style={{
                  width: 36, height: 36, top: "40%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle,${color}45 0%,transparent 70%)`,
                  animation: `d0PinGlow ${3.8 + idx * 0.35}s ease-in-out infinite`,
                  animationDelay: `${idx * 0.22}s`,
                }} />
                <LocationPin color={color} active={active} />

                {isHov && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52"
                    style={{ animation: "d0TooltipFade 0.16s ease both", zIndex: 40 }}>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                      style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)" }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ background: `${color}12`, borderBottom: `1px solid ${color}22` }}>
                        <svg width="8" height="11" viewBox="0 0 16 22" fill="none" className="shrink-0">
                          <path d="M8 0.5C4.41 0.5 1.5 3.41 1.5 7c0 5.46 6.5 14.5 6.5 14.5S14.5 12.46 14.5 7C14.5 3.41 11.59 0.5 8 0.5z" fill={color} />
                        </svg>
                        <span className="text-[11px] font-bold" style={{ color }}>{cfg.label} Region</span>
                      </div>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[13px]">{pin.flag}</span>
                          <span className="text-[12px] font-semibold text-slate-800">{pin.country}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 pl-0.5">{pin.region}</p>
                      </div>
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
                            <span className="text-[10px] text-slate-500">Potential catalogue leads</span>
                            <span className="text-[12px] font-bold" style={{ color }}>{pin.catalogueLeads}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
              const isActiveTier = hovered ? MAP_PINS.find(p => p.id === hovered)?.tier === tier : false;
              return (
                <div key={tier} className="flex items-center gap-1 transition-opacity duration-200"
                  style={{ opacity: hovered && !isActiveTier ? 0.35 : 1 }}>
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

        {/* Sidebar */}
        <div className="w-52 shrink-0 border-l border-slate-100 bg-slate-50/40 flex flex-col">
          <div className="px-3 pt-3 pb-2 flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400">TOP MARKETS</p>
              <p className="text-[9px] text-slate-400">{filter === "capability" ? "Projects" : "Leads"}</p>
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
                        style={{ width: mounted ? `${(val / maxVal) * 100}%` : "0%", background: isHov ? cfg.color : "#cbd5e1", transitionDelay: `${i * 50}ms` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2">
            <p className="text-[9px] text-slate-400 mb-1.5">
              {filter === "capability" ? "Based on RFQs, contract & CDMO projects" : "Based on catalogue views and buyer interest"}
            </p>
            <button className="w-full py-1.5 rounded-xl border border-[#1F6F54] text-[#1F6F54] text-[11px] font-semibold hover:bg-[#1F6F54] hover:text-white transition-all">
              <Globe size={11} className="inline mr-1" /> Get Detailed Demand Insights
            </button>
          </div>
        </div>
      </div>
      )} {/* end mapState === "active" */}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PROJECTS MATCHED
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsMatched() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      carouselRef.current.scrollTo({ left: scrollLeft + (dir === "left" ? -clientWidth / 2 : clientWidth / 2), behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <style>{`@keyframes dashGradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }`}</style>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Projects Matched for your Industry</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Based on your profile, here are projects you may be a good fit for — complete your profile to apply.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 sm:ml-4">
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#1F6F54] transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="overflow-hidden -mx-[4px] -my-[4px]">
        <div ref={carouselRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory mt-4 py-[4px] px-[4px]"
          style={{ scrollBehavior: "smooth" }}>
          {MATCHED_PROJECTS.map(p => {
            const isExclusive = p.badge === "Exclusive";
            return (
              <div key={p.id} className="w-[230px] flex-shrink-0 snap-start group relative cursor-pointer h-full">
                <div className={cn(
                  "relative bg-white rounded-[12px] p-[10px] flex flex-col overflow-hidden h-full",
                  "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
                  "ring-1 ring-transparent group-hover:ring-[#1F6F54] group-hover:shadow-[0px_8px_24px_rgba(40,71,26,0.12)]",
                  "transition-[box-shadow,ring-color] duration-200 ease-in-out",
                )}>
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-[10px] h-[148px] bg-[#cfd8dc] flex-shrink-0 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.07]" />
                    <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, transparent 100%)" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Badge pill */}
                    <div className="absolute top-[8px] left-[9px]">
                      {isExclusive ? (
                        <div className="flex items-center gap-[4px] px-2 py-[3px] rounded-full text-[9px] font-bold"
                          style={{ background: "linear-gradient(135deg,#111111 0%,#1a1400 100%)", color: "#f5c842", border: "1px solid #c9a22766", backdropFilter: "blur(4px)", letterSpacing: "0.02em" }}>
                          <span style={{ fontSize: 9, lineHeight: 1 }}>⭐</span>
                          Exclusive
                        </div>
                      ) : (
                        <div className="px-2 py-[3px] rounded-full text-[9px] font-semibold text-white"
                          style={{ background: p.matchType === "Capability-Based" ? "rgba(14,111,92,0.88)" : "rgba(99,55,199,0.88)", backdropFilter: "blur(4px)" }}>
                          {p.matchType === "Capability-Based" ? "Capability" : "Catalogue"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Industry pill */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-[9px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[11.5px] font-medium leading-[22px]">
                      {p.industry}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-[14.5px] leading-snug text-black line-clamp-2 mb-2">
                    {p.title}
                  </h3>

                  {/* Meta rows + hover arrow */}
                  <div className="flex items-end justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] leading-none">{p.countryFlag}</span>
                        <span className="text-[11.5px] text-[#353535] font-medium">{p.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">📦</span>
                        <span className="text-[11.5px] text-[#353535]">{p.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">🗓</span>
                        <span className="text-[11px] text-slate-400">Posted {p.postedDate}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                      "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                      "transition-all duration-200 ease-out",
                    )} style={{ background: "#1F6F54" }}>
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PLATFORM STATS
// ═══════════════════════════════════════════════════════════════════════════════
function PlatformStatsSection() {
  const [counts, setCounts] = useState(PLATFORM_STATS.map(() => 0));
  const animatingRef = useRef(false);
  const rafRef       = useRef<number | undefined>(undefined);

  const startAnimation = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const duration = 1400, start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(PLATFORM_STATS.map(s => s.decimal ? Math.round(s.num * eased * 10) / 10 : Math.floor(s.num * eased)));
      if (progress < 1) { rafRef.current = requestAnimationFrame(tick); } else { animatingRef.current = false; }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const fmt = (count: number, s: typeof PLATFORM_STATS[0]) => {
    if (s.decimal) return count.toFixed(1) + s.suffix;
    if (s.thousands && count >= 1000) return Math.floor(count / 1000) + "," + String(count % 1000).padStart(3, "0") + s.suffix;
    return String(count) + s.suffix;
  };

  return (
    <section className="bg-[#0d1117] rounded-2xl px-4 py-6 sm:px-8 sm:py-8" onMouseEnter={startAnimation}>
      <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.25em] mb-8">
        What&apos;s Happening on the Platform
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
        {PLATFORM_STATS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tabular-nums leading-none">{fmt(counts[i], s)}</span>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider leading-[1.6] whitespace-pre-line">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. BUYERS LOOKING
// ═══════════════════════════════════════════════════════════════════════════════
function BuyersLooking() {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const total   = Math.ceil(BUYERS.length / perPage);
  const current = BUYERS.slice(page * perPage, (page + 1) * perPage);

  const badgeStyles: Record<string, string> = {
    RFQ:  "bg-[#e3f4ff] text-[#0077CC]",
    CMO:  "bg-[#f0faf5] text-[#1F6F54]",
    CDMO: "bg-[#f3f0ff] text-[#7C3AED]",
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Buyers Are Already Looking for You</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 tabular-nums">{page + 1} / {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => (p - 1 + total) % total)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1F6F54] transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setPage(p => (p + 1) % total)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#1F6F54] transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {current.map(b => (
          <div key={b.id}
            className="bg-white rounded-2xl border border-slate-100 flex overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-pointer group h-[120px]">
            <div className="relative w-1/3 overflow-hidden shrink-0">
              <img src={b.image} alt="Buyer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {b.badges.map(badge => (
                    <span key={badge} className={`inline-flex items-center px-[10px] py-[2px] rounded-full text-[11px] font-medium leading-[20px] ${badgeStyles[badge] ?? "bg-slate-100 text-slate-600"}`}>
                      {badge}
                    </span>
                  ))}
                </div>
                <p className="text-[#020202] text-[13px] font-normal leading-[20px] line-clamp-3">&quot;{b.text}&quot;</p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[11px] font-medium leading-[20px]">{b.category}</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#1F6F54] group-hover:text-white transition-all duration-300">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. EXPERT CTA
// ═══════════════════════════════════════════════════════════════════════════════
function ExpertContainerIcon() {
  return (
    <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="mfg0-expert-mask" fill="white">
        <path d="M0 96C0 42.9807 42.9807 0 96 0C149.019 0 192 42.9807 192 96C192 149.019 149.019 192 96 192C42.9807 192 0 149.019 0 96Z"/>
      </mask>
      <path d="M0 96C0 42.9807 42.9807 0 96 0C149.019 0 192 42.9807 192 96C192 149.019 149.019 192 96 192C42.9807 192 0 149.019 0 96Z" fill="url(#mfg0-expert-grad)"/>
      <path d="M109.333 126V119.333C109.333 115.797 107.929 112.406 105.428 109.905C102.928 107.405 99.5362 106 96 106H76C72.4637 106 69.0724 107.405 66.5719 109.905C64.0714 112.406 62.6666 115.797 62.6666 119.333V126" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M109.333 66.4268C112.193 67.168 114.725 68.8376 116.532 71.1736C118.34 73.5096 119.321 76.3797 119.321 79.3334C119.321 82.2871 118.34 85.1572 116.532 87.4932C114.725 89.8292 112.193 91.4989 109.333 92.2401" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M129.333 126V119.334C129.331 116.379 128.348 113.51 126.538 111.175C124.728 108.84 122.194 107.172 119.333 106.434" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M86 92.6667C93.3638 92.6667 99.3333 86.6971 99.3333 79.3333C99.3333 71.9695 93.3638 66 86 66C78.6362 66 72.6666 71.9695 72.6666 79.3333C72.6666 86.6971 78.6362 92.6667 86 92.6667Z" stroke="white" strokeOpacity="0.2" strokeWidth="6.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="mfg0-expert-grad" x1="37.5" y1="40" x2="155" y2="165.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0172E7" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#2DD17C" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ExpertCTA() {
  return (
    <section className="relative overflow-hidden rounded-[16px] px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10"
      style={{ background: "linear-gradient(135deg, #003A1B 0%, #001C08 100%)" }}>
      <div className="pointer-events-none absolute right-[200px] top-[60px] w-[256px] h-[256px] rounded-full bg-[rgba(42,203,131,0.10)] blur-[64px]" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative shrink-0 w-[45px] h-[45px]">
              <div className="absolute inset-0 rounded-[8px] shadow-[0px_3.5px_5.5px_0px_rgba(0,0,0,0.02)]"
                style={{ background: "linear-gradient(135deg, rgba(247,254,231,0.50) 0%, rgba(247,254,231,0.10) 100%)" }} />
              <div className="absolute top-[10px] left-[10px] w-6 h-6 text-white/80">
                <MessageSquare size={22} />
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-[20px] font-semibold leading-[28px] tracking-[-0.005em] whitespace-nowrap" style={{ fontFamily: "Poppins, sans-serif" }}>
                Talk to a Manufacturing Expert
              </h3>
              <p className="text-[#94a3b8] text-[16px] font-normal leading-[24px]">
                Get expert guidance on setting up your capabilities.
              </p>
            </div>
          </div>
          <p className="text-[#cbd5e1] text-[16px] font-normal leading-[24px] mb-6 max-w-[700px]">
            Not sure how to get started or increase enquiries? Our team can guide you on setting up your profile,
            improving visibility, and connecting with the right opportunities.
          </p>
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 bg-[#1f6f54] hover:bg-[#185C45] transition-colors px-4 py-2 rounded-[6px] text-white text-sm font-medium leading-[24px] shrink-0">
              <Plus size={16} /> Schedule a call
            </button>
            <div className="flex items-center gap-[10px]">
              <span className="relative flex h-[10px] w-[10px] shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[#10b981]" />
              </span>
              <span className="text-[#94a3b8] text-[14px] font-normal leading-[20px] whitespace-nowrap">Available now</span>
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
// FLOATING PROFILE CAPSULE
// ═══════════════════════════════════════════════════════════════════════════════
function FloatingProfileCapsule({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 800); return () => clearTimeout(t); }, []);

  const pct       = 6;
  const r         = 15;
  const circ      = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50" style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? "translateY(0)" : "translateY(16px)",
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
        <div className="flex flex-col items-start leading-none">
          <span className="text-[8px] font-bold tracking-[0.14em] uppercase mb-[3px]" style={{ color: "rgba(42,203,131,0.65)" }}>Discovery Score</span>
          <span className="text-[12px] font-bold text-white">Complete Profile <span style={{ color: "#2ACB83" }}>›</span></span>
        </div>
      </button>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE COMPLETION MODAL (Day 0 version)
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileCompletionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router  = useRouter();
  const [animIn,   setAnimIn]   = useState(false);
  const [selected, setSelected] = useState("products"); // first action item for Day 0

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

  const sec        = PROFILE_SECTIONS.find(s => s.id === selected) ?? PROFILE_SECTIONS[0];
  const SCORE      = 6;
  const progressPct = SCORE; // 6% — just signup data

  if (!open || typeof document === "undefined") return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(2,2,2,0.60)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="relative bg-white w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 980, maxHeight: "90vh", borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)",
          opacity:   animIn ? 1 : 0,
          transform: animIn ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#f0fdf4", border: "1px solid rgba(42,203,131,0.30)" }}>
              <span className="text-[17px]">🚀</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 leading-tight" style={{ fontFamily: "Poppins,sans-serif" }}>
                Complete Your Profile
              </h2>
              <p className="text-[11px] text-slate-400 mt-[2px]">
                Build your industrial footprint to unlock buyer matchmaking, RFQs, and project opportunities.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button onClick={() => navigateToProfile()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Eye size={12} /> View how buyers see your profile
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* LEFT: Progress tracker */}
          <div className="w-[290px] shrink-0 border-r border-slate-100 overflow-y-auto bg-slate-50/50 p-4 flex flex-col gap-3">

            {/* Score card */}
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-[8px] font-bold tracking-[0.20em] text-slate-400 uppercase mb-2">Discovery Score</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[38px] font-black leading-none tabular-nums" style={{ color: "#0d2e1a" }}>{SCORE}%</span>
                <span className="mb-1.5 text-[9px] font-bold px-2 py-[3px] rounded-full"
                  style={{ background: "#fef3c7", color: "#92400e", border: "1px solid rgba(234,179,8,0.30)" }}>
                  GETTING STARTED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-snug">Complete your profile to increase buyer visibility.</p>
              <div className="w-full h-[7px] bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#2ACB83,#1F6F54)", transition: "width 1s ease" }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">Current: 6%</span>
                <span className="text-[9px] text-slate-400">Goal: 100%</span>
              </div>
            </div>

            {/* Sections list */}
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[7.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">Profile Section</span>
                <span className="text-[7.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">Score Impact</span>
              </div>

              {/* Onboarding group */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100"
                style={{ background: "rgba(42,203,131,0.06)" }}>
                <span className="text-[9px]">📋</span>
                <span className="text-[7.5px] font-bold tracking-[0.14em] uppercase" style={{ color: "#1F6F54" }}>
                  Onboarding (1 / 3)
                </span>
              </div>
              {PROFILE_SECTIONS.filter(s => s.group === "core").map(s => {
                const isSel = selected === s.id;
                return (
                  <button key={s.id} onClick={() => setSelected(s.id)}
                    className="w-full flex items-center justify-between px-3 py-[9px] border-b border-slate-100 text-left transition-all hover:bg-green-50/50"
                    style={{ background: isSel ? "#f0fdf4" : "white", borderLeft: isSel ? "3px solid #2ACB83" : "3px solid transparent" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] shrink-0" style={{ color: s.completed ? "#2ACB83" : "#cbd5e1" }}>
                        {s.completed ? "✓" : "○"}
                      </span>
                      <span className={cn("text-[11px] font-medium truncate", s.completed ? "text-slate-700" : "text-slate-500")}>
                        {s.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold shrink-0 ml-2" style={{ color: s.completed ? "#1F6F54" : "#94a3b8" }}>
                      {s.scoreImpact}
                    </span>
                  </button>
                );
              })}

              {/* Enrichment group */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 border-t border-slate-100 mt-1"
                style={{ background: "rgba(251,191,36,0.07)" }}>
                <span className="text-[9px]">✨</span>
                <span className="text-[7.5px] font-bold tracking-[0.14em] uppercase text-amber-700">
                  Profile Enrichment (0 / 5)
                </span>
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

          {/* RIGHT: Context panel */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-w-0">
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

            <p className="text-[13px] text-slate-600 leading-relaxed -mt-2">{sec.description}</p>

            <div className="rounded-xl p-4" style={{ background: "#f0fdf4", border: "1px solid rgba(42,203,131,0.22)" }}>
              <p className="text-[8px] font-bold tracking-[0.18em] uppercase mb-1.5" style={{ color: "#1F6F54" }}>
                {sec.completed ? "WHY BUYERS VALUED THIS" : "WHY BUYERS NEED THIS"}
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#1a5c3a" }}>{sec.buyerRationale}</p>
            </div>

            <div>
              <p className="text-[8px] font-bold tracking-[0.18em] text-slate-400 uppercase mb-3">
                {sec.completed ? "WHAT YOU'VE UNLOCKED" : "WHAT YOU'LL UNLOCK"}
              </p>
              <div className="flex flex-col gap-2.5">
                {sec.unlocks.map((u, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-[1px]"
                      style={{ background: sec.completed ? "#f0fdf4" : "#f8fafc", border: `1px solid ${sec.completed ? "rgba(42,203,131,0.40)" : "#e2e8f0"}` }}>
                      {sec.completed
                        ? <span className="text-[9px] font-bold" style={{ color: "#2ACB83" }}>✓</span>
                        : <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>}
                    </div>
                    <p className="text-[12.5px] text-slate-700 leading-snug flex-1">{u}</p>
                  </div>
                ))}
              </div>
            </div>

            {sec.completed ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mt-auto"
                style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid rgba(42,203,131,0.28)" }}>
                <span className="text-[20px]">✅</span>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: "#1F6F54" }}>Already Completed</p>
                  <p className="text-[10px]" style={{ color: "#4a9868" }}>These capabilities are active on your profile right now.</p>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3">
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
                <button onClick={() => navigateToProfile(sec.id)}
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
