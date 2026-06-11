"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FlaskConical, BookOpen, ArrowRight, Lock,
  CheckCircle2, Crown, ChevronRight, X, Zap,
  Search, Share2, Database, Sparkles, ChevronDown,
  ChevronLeft, Send, Layers, History, Plus,
  RotateCcw, Star, TrendingDown, FileText, Beaker,
  Download, ExternalLink, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DemoState = "day0" | "searched";
type PlanState = "free" | "premium";
type WorkspaceTab = "research" | "literature";
type SortKey = "recent" | "name" | "confidence";

// ─── Recent compound mock data ────────────────────────────────────────────────

// PubChem image API gives real molecule structure images
const RESEARCH_COMPOUNDS = [
  { id: 1, name: "Paracetamol",          cas: "103-90-2",    date: "8 Jun",  routes: 62, formula: "C8H9NO2",    mw: "151.163",  pubchemCid: 1983    },
  { id: 2, name: "Ibuprofen",            cas: "15687-27-1",  date: "7 Jun",  routes: 33, formula: "C13H18O2",   mw: "206.285",  pubchemCid: 3672    },
  { id: 3, name: "Ascorbic Acid",        cas: "50-81-7",     date: "4 Jun",  routes: 18, formula: "C6H8O6",     mw: "176.124",  pubchemCid: 54670067},
  { id: 4, name: "Citric Acid",          cas: "77-92-9",     date: "2 Jun",  routes: 9,  formula: "C6H8O7",     mw: "192.124",  pubchemCid: 311     },
  { id: 5, name: "Metformin HCl",        cas: "1115-70-4",   date: "31 May", routes: 14, formula: "C4H11N5·HCl",mw: "165.625",  pubchemCid: 14219   },
  { id: 6, name: "Acetylsalicylic Acid", cas: "50-78-2",     date: "29 May", routes: 41, formula: "C9H8O4",     mw: "180.160",  pubchemCid: 2244    },
  { id: 7, name: "Caffeine",             cas: "58-08-2",     date: "27 May", routes: 22, formula: "C8H10N4O2",  mw: "194.194",  pubchemCid: 2519    },
  { id: 8, name: "Benzyl Alcohol",       cas: "100-51-6",    date: "25 May", routes: 11, formula: "C7H8O",      mw: "108.138",  pubchemCid: 244     },
];

// Literature papers for the Recent Compounds / Literature tab
const LITERATURE_PAPERS = [
  {
    id: 1,
    title: "Production and Synthetic Possibilities of 5-Chloromethylfurfural as Alternative Biobased Furan",
    source: "MDPI", year: "2024", doi: "10.3390/molecules29010001",
    abstract: "As fossil-based resource depletion intensifies and the use of lignocellulosic biomass gains more momentum for biorefineries, the production of furans has received great attention. The production of 5-hydroxymethylfurfural (HMF) is quite established, yet alternatives such as 5-chloromethylfurfural (CMF) offer distinct synthetic advantages...",
  },
  {
    id: 2,
    title: "Unlocking the Potential of 5-Hydroxy-2(5H)-furanone as a Platform for Bio-Based Four Carbon Chemicals",
    source: "ACS Publications", year: "2024", doi: "10.1021/acscatal.3c04872",
    abstract: "Industrial chemicals with a four-carbon structure, including maleic acid, 1,4-butanediol, γ-butyrolactone, and pyrrolidones, are derived from petroleum. This work demonstrates a renewable route via 5-hydroxy-2(5H)-furanone from bio-based feedstocks, achieving high selectivity under mild conditions...",
  },
  {
    id: 3,
    title: "Mechanistic Insights into Selectivity-Determining Steps in Grignard Additions to Carbonyl Compounds",
    source: "ACS Publications", year: "2024", doi: "10.1021/jacs.4c01023",
    abstract: "The selectivity of Grignard reagents in addition reactions to carbonyl compounds has been studied extensively. We report new mechanistic evidence showing that solvent coordination and temperature both play critical roles in determining stereochemical outcome for asymmetric carbonyl substrates...",
  },
  {
    id: 4,
    title: "Chelation-Controlled Grignard Additions: A Computational and Experimental Study",
    source: "Wiley", year: "2024", doi: "10.1002/anie.202401234",
    abstract: "Chelation control in organomagnesium additions has long been exploited for diastereoselective synthesis. We combine DFT calculations with experimental validation to map the energy landscape of competing transition states across a range of substrate classes...",
  },
  {
    id: 5,
    title: "Solvent Effects on Regioselectivity of Grignard Reagents toward α,β-Unsaturated Carbonyl Systems",
    source: "RSC", year: "2023", doi: "10.1039/D3SC01122A",
    abstract: "We systematically investigate how solvent polarity and donor number influence the 1,2- vs 1,4-selectivity of Grignard reagents reacting with enones. THF, Et₂O, and toluene afford markedly different product ratios, consistent with solvent-dependent aggregation states...",
  },
  {
    id: 6,
    title: "Flow Chemistry Approaches to Scalable Grignard Reactions: Safety, Selectivity, and Scale",
    source: "ACS Publications", year: "2023", doi: "10.1021/acs.oprd.3c00198",
    abstract: "Continuous flow processing offers significant advantages for exothermic Grignard formations, enabling precise temperature control and rapid mixing. This work demonstrates kilogram-scale synthesis of a pharmaceutical intermediate with improved selectivity vs. batch processing...",
  },
  {
    id: 7,
    title: "Green Chemistry Approaches to Paracetamol Synthesis Using Bio-Derived Reagents",
    source: "MDPI", year: "2023", doi: "10.3390/molecules28145321",
    abstract: "This study explores environmentally benign routes to paracetamol (acetaminophen) synthesis using renewable acylating agents. Yield improvements of up to 94% were achieved under solvent-free conditions with minimal waste generation, meeting E-factor targets for pharmaceutical manufacturing...",
  },
  {
    id: 8,
    title: "Continuous Manufacturing of Ibuprofen: Process Intensification and Impurity Profiling",
    source: "Elsevier", year: "2022", doi: "10.1016/j.ces.2022.117812",
    abstract: "A fully continuous manufacturing route for ibuprofen was developed integrating reaction, extraction, and crystallisation. Real-time analytical monitoring enabled tight control of critical quality attributes, reducing cycle time by 78% compared to batch operation...",
  },
];

const ITEMS_PER_PAGE = 8;

// ─── Grouped Literature (compound → papers) ───────────────────────────────────

const GROUPED_LITERATURE = [
  {
    id: "grignard",
    compoundName: "Grignard Reaction Mechanism",
    cas: "Various",
    formula: "RMgX",
    pubchemCid: null as number | null,
    lastAdded: "8 Jun",
    defaultOpen: true,
    papers: [
      LITERATURE_PAPERS[2], // Mechanistic Insights
      LITERATURE_PAPERS[3], // Chelation-Controlled
      LITERATURE_PAPERS[4], // Solvent Effects
      LITERATURE_PAPERS[5], // Flow Chemistry
    ],
  },
  {
    id: "biobased",
    compoundName: "Biobased Furan Compounds",
    cas: "4079-52-1",
    formula: "C₆H₅ClO₂",
    pubchemCid: 12674,
    lastAdded: "6 Jun",
    defaultOpen: false,
    papers: [
      LITERATURE_PAPERS[0],
      LITERATURE_PAPERS[1],
    ],
  },
  {
    id: "paracetamol",
    compoundName: "Paracetamol",
    cas: "103-90-2",
    formula: "C₈H₉NO₂",
    pubchemCid: 1983,
    lastAdded: "5 Jun",
    defaultOpen: false,
    papers: [LITERATURE_PAPERS[6]],
  },
  {
    id: "ibuprofen",
    compoundName: "Ibuprofen",
    cas: "15687-27-1",
    formula: "C₁₃H₁₈O₂",
    pubchemCid: 3672,
    lastAdded: "4 Jun",
    defaultOpen: false,
    papers: [LITERATURE_PAPERS[7]],
  },
] as const;

// ─── Compound Detail Data ─────────────────────────────────────────────────────

const DETAIL_ROUTES = [
  {
    id: "A", name: "Classical Acetylation", score: 9.0, steps: 1, yield: "85–95%",
    best: true, lowest: false,
    summary: "The classical industrial synthesis first developed by Felix Hoffmann at Bayer in 1897. Highly efficient, scalable, and economical. Acetic anhydride is preferred over acetyl chloride due to milder reaction conditions. Sulfuric acid acts as both catalyst and dehydrating agent. The reaction is highly selective for O-acetylation; typical industrial yields exceed 90%.",
    keyParams: { temp: "50–60°C", time: "15–30 min", mode: "Batch" },
    reagents: ["acetic anhydride (1.2 eq)", "sulfuric acid (0.02 eq, catalytic)"],
    workup: "After reaction completion, the mixture is cooled to room temperature (ice bath) to induce crystallisation of crude product. Cold water (50–100 mL per 10 g substrate) is added slowly with stirring to decompose excess acetic anhydride and precipitate the product. Stir 10–15 min to complete crystallisation.",
    purification: "Collect crude by vacuum filtration, wash with cold water (2–3×) to remove acetic acid and residual anhydride. Recrystallise from ethanol-water (70:30) or toluene. Dissolve in warm ethanol (~10 mL/g), add water to slight turbidity, heat to redissolve, cool slowly, then cool in ice bath. Filter, wash with cold solvent, dry in vacuum oven at 40–50°C.",
    refs: ["The Synthesis of Aspirin: A General Chemistry Experiment (2000)", "Aspirin Revisited (2007)"],
    feasibility: 9.2, affordability: 9.5, ipRisk: 2.0,
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=338&width=160&height=100",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=100",
    fromLabel: "salicylic acid", toLabel: "product",
  },
  {
    id: "B", name: "Kolbe-Schmitt Synthesis", score: 8.5, steps: 4, yield: "55–65%",
    best: false, lowest: false,
    summary: "Kolbe-Schmitt carboxylation of sodium phenoxide. Phenol is converted to sodium phenoxide, which undergoes CO₂ fixation under elevated pressure (5–7 atm) and temperature to yield the sodium salicylate intermediate, followed by acid workup and esterification.",
    keyParams: { temp: "120–150°C", time: "6–8 h", mode: "Batch" },
    reagents: ["sodium phenoxide", "CO₂ (5–7 atm)", "acetic anhydride (1.5 eq)", "HCl (acidification)"],
    workup: "Acidification of sodium salicylate with HCl to pH 2, extraction with ethyl acetate, drying over MgSO₄, concentration. Esterification with acetic anhydride using acid catalyst.",
    purification: "Recrystallisation from ethanol-water.",
    refs: ["Kolbe-Schmitt Reaction: Mechanism and Applications (2018)"],
    feasibility: 7.0, affordability: 7.5, ipRisk: 3.0,
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=996&width=160&height=100",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=100",
    fromLabel: "phenol", toLabel: "product",
  },
  {
    id: "C", name: "Enzymatic Green Route", score: 7.2, steps: 1, yield: "65–75%",
    best: false, lowest: true,
    summary: "Green enzymatic O-acetylation using immobilised Candida antarctica lipase B (CAL-B) and vinyl acetate as acyl donor. Operates under mild conditions with no mineral acid catalyst, producing minimal hazardous waste — excellent atom economy but slower kinetics.",
    keyParams: { temp: "37–45°C", time: "24–48 h", mode: "Batch" },
    reagents: ["vinyl acetate (2.0 eq)", "CAL-B lipase (immobilised, 10 wt%)", "acetone (solvent)"],
    workup: "Filter immobilised enzyme by gravity filtration. Wash with acetone. Evaporate solvent under reduced pressure.",
    purification: "Recrystallise from ethanol-water or column chromatography (SiO₂, hexane:EtOAc 4:1).",
    refs: ["Enzymatic Acetylation of Salicylic Acid by Candida antarctica Lipase B (2015)"],
    feasibility: 6.0, affordability: 5.5, ipRisk: 4.0,
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=338&width=160&height=100",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=100",
    fromLabel: "salicylic acid", toLabel: "product",
  },
  {
    id: "D", name: "Solid Acid Catalysis", score: 7.8, steps: 3, yield: "58–65%",
    best: false, lowest: false,
    summary: "Heterogeneous solid acid catalysis using recyclable Amberlyst-15 or zeolite H-Beta in place of liquid sulfuric acid. Enables catalyst recovery and reuse over multiple cycles, reducing waste streams — moderate yield at lower environmental cost.",
    keyParams: { temp: "80–100°C", time: "2–4 h", mode: "Batch" },
    reagents: ["acetic anhydride (1.5 eq)", "Amberlyst-15 (10 wt%) or zeolite H-Beta"],
    workup: "Filter catalyst by vacuum filtration (catalyst regenerable by washing with ethanol and drying). Crystallise product from water.",
    purification: "Recrystallisation from water or ethanol-water mixture.",
    refs: ["Green Chemistry Approaches to Aspirin Synthesis (2019)"],
    feasibility: 7.5, affordability: 7.8, ipRisk: 3.5,
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=338&width=160&height=100",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=100",
    fromLabel: "salicylic acid", toLabel: "product",
  },
  {
    id: "E", name: "Continuous Flow Process", score: 8.2, steps: 4, yield: "60–70%",
    best: false, lowest: false,
    summary: "Continuous-flow microreactor synthesis with precise temperature control and rapid mixing at 3–5 min residence time. Phosphoric acid catalysed acetylation in PTFE microreactor — excellent safety profile for this exothermic reaction, enabling safer scale-up vs batch.",
    keyParams: { temp: "85–95°C", time: "3–5 min residence", mode: "Continuous Flow" },
    reagents: ["acetic anhydride (1.5 eq)", "phosphoric acid (0.05 eq)"],
    workup: "In-line aqueous quench and extraction, continuous vacuum filtration, belt drying.",
    purification: "Continuous belt filtration, vacuum drying at 40–50°C.",
    refs: ["Continuous-Flow Synthesis in a Microreactor (2011)", "Microreactor Technology for Pharma (2010)"],
    feasibility: 7.5, affordability: 7.5, ipRisk: 5.0,
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=338&width=160&height=100",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=100",
    fromLabel: "salicylic acid", toLabel: "product",
  },
];

const BOM_DATA = [
  { name: "Salicylic acid",    cas: "69-72-7",   role: "Starting material",     amount: "10.0 g",  mw: "138.12", eq: "1.0",  grade: "Reagent ≥99%",   supplier: "Sigma-Aldrich", cost: "£12/100g"  },
  { name: "Acetic anhydride",  cas: "108-24-7",  role: "Acetylating agent",      amount: "12.5 mL", mw: "102.09", eq: "1.2",  grade: "ACS ≥99%",       supplier: "Fisher",        cost: "£18/500mL" },
  { name: "Sulfuric acid",     cas: "7664-93-9", role: "Catalyst",               amount: "3 drops", mw: "98.08",  eq: "0.02", grade: "Conc. 98%",      supplier: "VWR",           cost: "£8/500mL"  },
  { name: "Ethanol (96%)",     cas: "64-17-5",   role: "Recryst. solvent",       amount: "30 mL",   mw: "46.07",  eq: "—",    grade: "Lab grade",      supplier: "Any",           cost: "£5/L"      },
  { name: "Deionised water",   cas: "7732-18-5", role: "Quench / crystallisation",amount: "100 mL",  mw: "18.02",  eq: "—",    grade: "Deionised",      supplier: "In-house",      cost: "—"         },
];

const PATENT_DATA = [
  { id: 1, number: "EP1234567",   title: "Continuous Manufacturing of Acetylsalicylic Acid via Microreactor", assignee: "Bayer AG",       year: "2018", status: "Active",   relevance: "High",       snippet: "Describes a continuous-flow process for aspirin synthesis using microreactor technology, claiming 15% yield improvement and enhanced thermal safety vs. batch." },
  { id: 2, number: "WO2015098765",title: "Enzymatic Synthesis Using Immobilised Lipase",                       assignee: "Novozymes A/S",  year: "2015", status: "Active",   relevance: "Medium",     snippet: "Claims use of immobilised CAL-B lipase for O-selective acetylation of salicylic acid derivatives in non-aqueous media at mild temperatures." },
  { id: 3, number: "US9876543",   title: "Heterogeneous Acid Catalysis for Pharmaceutical Esterification",    assignee: "BASF SE",        year: "2019", status: "Active",   relevance: "Medium",     snippet: "Covers recyclable solid acid catalysts (zeolite and ion-exchange resin systems) for pharmaceutical-grade acetylation reactions." },
  { id: 4, number: "DE36433",     title: "Manufacture of Acetylsalicylic Acid — Original Hoffmann Process",   assignee: "Farbenfabriken Bayer", year: "1899", status: "Expired", relevance: "Historical", snippet: "The original 1899 patent for acetylsalicylic acid synthesis. Now fully in the public domain — no IP risk for classical route." },
];

const COMPOUND_SYNTHESIS_LITERATURE = [
  { id: 1, title: "Classical Industrial Synthesis: Process Optimisation and Scale-up Considerations", source: "Org. Process Res. Dev.", year: "2022", doi: "10.1021/acs.oprd.2c00134", abstract: "This review covers industrial synthesis history from Hoffmann's original process to modern continuous manufacturing. Key process parameters, impurity profiles, and scale-up considerations are discussed with reference to ICH guidelines for pharmaceutical manufacturing." },
  { id: 2, title: "Green Chemistry Metrics: A Comparative Life Cycle Analysis of Synthesis Routes", source: "Green Chemistry", year: "2023", doi: "10.1039/D3GC01456K", abstract: "Life cycle assessment and green chemistry metrics (E-factor, PMI, atom economy) applied to compare five synthesis routes. The enzymatic route shows the lowest E-factor (1.8) while classical acetylation offers the best combination of atom economy and industrial scalability." },
  { id: 3, title: "Continuous Flow Synthesis: Safety Improvements and Waste Reduction at Scale", source: "Chem. Eng. J.", year: "2021", doi: "10.1016/j.cej.2021.130456", abstract: "Implementation of a continuous flow microreactor demonstrates significant improvements in thermal safety management for exothermic acetylation. Reports 23% reduction in acetic anhydride consumption vs. batch processing with consistent purity profiles." },
  { id: 4, title: "Solid-State NMR Characterisation of Polymorphs from Different Synthesis Routes", source: "CrystEngComm", year: "2020", doi: "10.1039/D0CE00789G", abstract: "Product from classical acetylation, enzymatic, and continuous flow routes characterised by ¹H/¹³C SS-NMR and XRPD. Route-dependent differences in polymorph distribution and crystal morphology are identified and their pharmaceutical significance discussed." },
];

// ─── Data ─────────────────────────────────────────────────────────────────────

const WORKSPACE_CARDS = [
  {
    id: "research",
    icon: FlaskConical,
    iconBg: "#e3f5ec",
    iconColor: "#1a5c3a",
    tag: "AI RESEARCH WORKSPACE",
    title: "Research Workspace",
    description:
      "Generate retrosynthesis routes, compare synthesis pathways, evaluate reaction feasibility, and explore alternative synthetic approaches ranked by confidence score.",
    features: ["Route Generation", "Route Variants", "Graph View", "Process Flow"],
    cta: "Open Research Workspace",
  },
  {
    id: "literature",
    icon: BookOpen,
    iconBg: "#e8f0fb",
    iconColor: "#1e50a2",
    tag: "LITERATURE SYNTHESIS",
    title: "Literature Workspace",
    description:
      "Search journals, patents, publications, and scientific evidence simultaneously. Get citation-backed synthesis summaries — every claim traced to its exact source.",
    features: ["Literature Analysis", "Patent Search", "Evidence Summaries", "Citation Tracking"],
    cta: "Open Literature Workspace",
  },
] as const;

const GETTING_STARTED_STEPS = [
  {
    n: "1",
    title: "Search your molecule",
    desc: "Enter a Molecule Name, CAS Number, InChI, or SMILES string.",
    icon: Search,
  },
  {
    n: "2",
    title: "Generate insights",
    desc: "Get synthesis routes ranked by confidence score, literature references, and patent data.",
    icon: FlaskConical,
  },
  {
    n: "3",
    title: "Save to repository",
    desc: "All findings are automatically stored in your research repository.",
    icon: Database,
  },
  {
    n: "4",
    title: "Export and share",
    desc: "Export lab-ready protocols and share research results with your team.",
    icon: Share2,
  },
];

// ─── How Deep Research Works Modal ───────────────────────────────────────────

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg,#0d2818,#0a1e10)" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold mb-4"
            style={{ background: "rgba(26,92,58,0.50)", border: "1px solid rgba(110,231,183,0.25)", color: "#6ee7b7" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HOW DEEP RESEARCH WORKS
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight mb-2">
            From Molecule to Actionable Intelligence
          </h2>
          <p className="text-white/60 text-[13px] leading-relaxed max-w-[540px]">
            Start with a molecule. Deep Research returns a ranked intelligence summary — routes, patents, literature — structured around one question: can this molecule actually be synthesized efficiently, safely, and commercially?
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">

          {/* How it works steps */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">THE WORKFLOW</p>
            <div className="flex flex-col gap-0">
              {[
                { n: "01", title: "Search your molecule", desc: "Enter a molecule name, CAS number, InChI, or SMILES string. Deep Research identifies the compound and begins pulling intelligence across all connected sources." },
                { n: "02", title: "Get ranked intelligence", desc: "Synthesis routes are ranked by confidence score. Patents are surfaced alongside literature so you can evaluate IP risk and scientific feasibility in the same view." },
                { n: "03", title: "Go deeper with premium", desc: "When you're ready — step-by-step synthesis, route comparison, hazard analysis, scale-up feasibility, and stoichiometry unlock at exactly that point. Discovery is always free." },
                { n: "04", title: "Save to repository", desc: "All findings are automatically stored in your research repository. Revisit, compare, and build on previous research without starting from scratch." },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ background: "#e3f5ec", color: "#1a5c3a" }}>
                      {step.n}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 my-1.5" style={{ background: "#e4e4e7", minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-5 min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-slate-800 mb-1">{step.title}</p>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-xl border border-[#e4e4e7] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">HOW IT HELPS YOUR BUSINESS GROW</p>
              <h3 className="text-[14px] font-bold text-slate-900">Keep Research Connected to Execution</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "⚡", title: "Faster route discovery", desc: "Reduce hours of manual research into minutes with AI-ranked synthesis routes." },
                { icon: "✅", title: "Improve research confidence", desc: "Validate findings using literature, patents, and scientific evidence in one query." },
                { icon: "📈", title: "Increase project throughput", desc: "Research more compounds in less time, with every route scored and ready to refine." },
                { icon: "🗄️", title: "Preserve research knowledge", desc: "Store and revisit all research from a centralised repository, automatically organised." },
                { icon: "🔄", title: "Eliminate duplicate efforts", desc: "Every search builds your repository — teams avoid repeating work already done." },
                { icon: "🏭", title: "Move faster to scale-up", desc: "From molecule evaluation to feasibility, optimisation, validation, and commercialisation in one connected workflow." },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#f3f4f6]"
                  style={{ background: "#fafafa" }}>
                  <span className="text-[18px] shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-[12.5px] font-bold text-slate-800 mb-0.5">{b.title}</p>
                    <p className="text-[11.5px] text-slate-500 leading-snug">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              Get started with new research <ArrowRight size={14} />
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5 relative" style={{ background: "linear-gradient(135deg,#0d2818,#091510)" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.10)" }}>
              <Crown size={15} className="text-[#f5c842]" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.15em] text-white/70">UPGRADE TO PREMIUM</span>
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight mb-1.5">Unlock the Full Research Workflow</h2>
          <p className="text-white/60 text-[13px] leading-relaxed">
            Go deeper on every molecule. Step-by-step synthesis, route comparison, hazard analysis, and scale-up feasibility — unlocked at exactly the point you need them.
          </p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {[
            "Unlimited molecule research — no caps",
            "Modify Path — edit routes, reagents, and conditions",
            "Export full synthesis reports as PDF",
            "Complete literature citations and provenance",
            "Stoichiometry — edit quantities and reaction scale",
            "Unlimited repository access",
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#e3f5ec" }}>
                <CheckCircle2 size={11} style={{ color: "#1a5c3a" }} />
              </div>
              <span className="text-[13px] text-slate-700 leading-snug">{b}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 pt-1 flex gap-3 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-colors">
            Maybe later
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
            <Crown size={13} /> Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel — Green Notification Banner Card ────────────────────────────

function DeepResearchBannerCard({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: "linear-gradient(160deg,#0d2818 0%,#0a1e10 55%,#091510 100%)", border: "1px solid rgba(110,231,183,0.18)" }}>

      {/* Top decorative blob */}
      <div className="relative flex-1 px-5 pt-6 pb-5 flex flex-col gap-4 overflow-hidden">
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-[180px] h-[180px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(42,203,131,0.22) 0%,transparent 70%)", filter: "blur(32px)" }} />
        <div className="pointer-events-none absolute top-0 -left-8 w-[140px] h-[140px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(26,92,58,0.35) 0%,transparent 70%)", filter: "blur(28px)" }} />

        {/* "NEW" chip */}
        <div className="relative z-10 self-start">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] border"
            style={{ background: "rgba(42,203,131,0.15)", borderColor: "rgba(42,203,131,0.30)", color: "#6ee7b7" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            NEW
          </span>
        </div>

        {/* Heading */}
        <div className="relative z-10 flex flex-col gap-2">
          <h3 className="text-white text-[18px] font-bold leading-snug">
            Accelerate your R&D with Deep Research
          </h3>
          <p className="text-white/55 text-[12.5px] leading-relaxed">
            Synthesis routes, patent signals, and literature — ranked and ready to act on.
          </p>
        </div>

        {/* Benefit bullets */}
        <div className="relative z-10 flex flex-col gap-2">
          {[
            "Synthesis routes ranked by confidence",
            "Patent & IP risk signals",
            "Literature evidence in one query",
            "Research auto-saved to repository",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(42,203,131,0.18)" }}>
                <CheckCircle2 size={9} style={{ color: "#6ee7b7" }} />
              </div>
              <span className="text-[12px] text-white/70 leading-snug">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="relative z-10 pt-1">
          <button
            onClick={onLearnMore}
            className="w-full py-2.5 rounded-xl text-[#0d2818] text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all"
            style={{ background: "#6ee7b7" }}
          >
            How Deep Research works <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Bottom stat strip */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 border-t"
        style={{ borderColor: "rgba(110,231,183,0.10)", background: "rgba(0,0,0,0.20)" }}>
        <div className="flex flex-col">
          <span className="text-[20px] font-black text-white leading-none">400+</span>
          <span className="text-[10px] text-white/40 mt-0.5">Open R&D Projects</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[20px] font-black text-white leading-none">10×</span>
          <span className="text-[10px] text-white/40 mt-0.5">Faster Discovery</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[20px] font-black text-white leading-none">Free</span>
          <span className="text-[10px] text-white/40 mt-0.5">To Get Started</span>
        </div>
      </div>
    </div>
  );
}

// ─── Day 0 — No Research Done ─────────────────────────────────────────────────

function WorkspaceCards({ onOpen, onOpenLiterature, vertical = false }: { onOpen: () => void; onOpenLiterature: () => void; vertical?: boolean }) {
  return (
    <div className={vertical ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"}>
      {WORKSPACE_CARDS.map((w) => {
        const Icon = w.icon;
        return (
          <div key={w.id}
            className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4 cursor-pointer group transition-all duration-200 hover:border-[#1a5c3a] hover:shadow-[0_4px_20px_rgba(26,92,58,0.12)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-[9.5px] font-bold tracking-[0.14em] text-slate-400">{w.tag}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: w.iconBg }}>
                  <Icon size={20} style={{ color: w.iconColor }} />
                </div>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 text-slate-300 group-hover:border-[#1a5c3a] group-hover:text-[#1a5c3a] transition-colors shrink-0">
                <ArrowRight size={13} />
              </div>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-tight">{w.title}</h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">{w.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {w.features.map(f => (
                <span key={f} className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: "#f0fdf4", color: "#1a5c3a" }}>
                  <CheckCircle2 size={9} /> {f}
                </span>
              ))}
            </div>
            <button
              onClick={w.id === "literature" ? onOpenLiterature : onOpen}
              className="w-full py-2 rounded-lg text-[12.5px] font-bold border-2 border-[#1a5c3a] text-[#1a5c3a] transition-all duration-200 hover:bg-[#1a5c3a] hover:text-white mt-auto">
              {w.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent Compounds Section (shared, full-width) ───────────────────────────

function RecentCompoundsSection({ hasData }: { hasData: boolean }) {
  const [tab, setTab]     = useState<WorkspaceTab>("research");
  const [sort, setSort]   = useState<SortKey>("recent");
  const [page, setPage]   = useState(1);
  const [sortOpen, setSortOpen] = useState(false);

  const SORT_LABELS: Record<SortKey, string> = {
    recent: "Most Recent", name: "Name (A–Z)", confidence: "Routes",
  };

  const activeData = [...RESEARCH_COMPOUNDS].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "confidence") return b.routes - a.routes;
    return 0;
  });

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(activeData.length / CARDS_PER_PAGE);
  const paged      = activeData.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  return (
    <section>
      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-[16px] font-bold text-slate-900">Recent compounds</h2>

        {hasData && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Workspace toggle */}
            <div className="flex items-center rounded-lg border border-[#e4e4e7] overflow-hidden bg-white">
              <button
                onClick={() => { setTab("research"); setPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
                  tab === "research" ? "bg-[#1a5c3a] text-white" : "text-slate-500 hover:bg-slate-50"
                )}>
                <FlaskConical size={11} /> Research Workspace
              </button>
              <div className="w-px h-5 bg-[#e4e4e7]" />
              <button
                onClick={() => { setTab("literature"); setPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
                  tab === "literature" ? "bg-[#1a5c3a] text-white" : "text-slate-500 hover:bg-slate-50"
                )}>
                <BookOpen size={11} /> Literature Workspace
              </button>
            </div>

            {/* Sort By */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] bg-white text-[11px] font-semibold text-slate-600 hover:border-slate-300 transition-colors"
              >
                Sort By: {SORT_LABELS[sort]} <ChevronDown size={11} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-[#e4e4e7] shadow-lg overflow-hidden w-[160px]">
                  {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                    <button key={key}
                      onClick={() => { setSort(key); setSortOpen(false); setPage(1); }}
                      className={cn(
                        "w-full text-left px-3.5 py-2 text-[11.5px] transition-colors",
                        sort === key ? "bg-[#f0fdf4] text-[#1a5c3a] font-semibold" : "text-slate-600 hover:bg-slate-50"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View all */}
            <button className="flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              View all <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* View all — empty state header */}
        {!hasData && (
          <button className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 cursor-default" disabled>
            View all <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {!hasData ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#e4e4e7] py-14 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#f0fdf4" }}>
            <FlaskConical size={26} style={{ color: "#1a5c3a" }} />
          </div>
          <p className="text-[15px] font-bold text-slate-800 mb-1.5">No research done yet</p>
          <p className="text-[12.5px] text-slate-400 max-w-[360px] leading-relaxed mb-5">
            Start your first Deep Research session to discover synthesis routes, literature references, and chemical insights — automatically saved here.
          </p>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
            <Sparkles size={14} /> Start New Research
          </button>
        </div>
      ) : (
        <>
          {/* Card grid — 4 cols desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paged.map((item) => {
              const imgUrl = `https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=${item.pubchemCid}&width=300&height=200`;
              const count  = item.routes;
              const countLabel = "routes";
              return (
                <div key={item.id}
                  className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">

                  {/* Molecule image area */}
                  <div className="relative h-[160px] flex items-center justify-center overflow-hidden"
                    style={{
                      background: "#f8fafb",
                      backgroundImage: "linear-gradient(rgba(0,0,0,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.045) 1px,transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={item.name}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* Name */}
                    <div>
                      <p className="text-[14px] font-bold text-slate-900 leading-tight truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">
                        CAS {item.cas} · {item.formula} · {item.mw}
                      </p>
                    </div>

                    {/* Routes badge + date */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: "#e3f5ec", color: "#1a5c3a" }}>
                        {/* retrosynthesis arrow icon */}
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="#1a5c3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {count} {countLabel}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        className="w-full py-2 rounded-xl text-white text-[12.5px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                        style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                        <Database size={13} /> View compound
                      </button>
                      <button
                        className="w-full py-2 rounded-xl border border-[#e4e4e7] text-slate-600 text-[12.5px] font-semibold flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 transition-all">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zm0 0v3m0 0 1.5-1.5M7 4 5.5 2.5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Resume in Retro
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-slate-400">
                Showing {(page - 1) * CARDS_PER_PAGE + 1}–{Math.min(page * CARDS_PER_PAGE, activeData.length)} of {activeData.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#e4e4e7] text-slate-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[11px] font-semibold border transition-colors",
                      p === page ? "bg-[#1a5c3a] text-white border-[#1a5c3a]" : "border-[#e4e4e7] text-slate-500 hover:border-[#1a5c3a] hover:text-[#1a5c3a]"
                    )}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#e4e4e7] text-slate-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Shared top row (workspaces + banner) ─────────────────────────────────────

function TopRow({ onLearnMore, onOpenWorkspace, onOpenLiterature }: { onLearnMore: () => void; onOpenWorkspace: () => void; onOpenLiterature: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
      <div className="lg:col-span-7 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">RESEARCH WORKSPACES</p>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <WorkspaceCards onOpen={onOpenWorkspace} onOpenLiterature={onOpenLiterature} />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">DEEP RESEARCH</p>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="flex-1">
          <DeepResearchBannerCard onLearnMore={onLearnMore} />
        </div>
      </div>
    </div>
  );
}

function Day0State({ onLearnMore, onUpgrade, onOpenWorkspace, onOpenLiterature }: { onLearnMore: () => void; onUpgrade: () => void; onOpenWorkspace: () => void; onOpenLiterature: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <TopRow onLearnMore={onLearnMore} onOpenWorkspace={onOpenWorkspace} onOpenLiterature={onOpenLiterature} />
      <RecentCompoundsSection hasData={false} />
    </div>
  );
}

// ─── Recent Compounds Panel (for After First Search left 70%) ─────────────────

const RESEARCH_PER_PAGE  = 6;
const LITERATURE_PER_PAGE = 4;

// ─── Grouped Literature Row ───────────────────────────────────────────────────

type GroupedLitItem = typeof GROUPED_LITERATURE[number];
type LitPaper = GroupedLitItem["papers"][number];

function LiteratureGroupRow({ group }: { group: GroupedLitItem }) {
  const [open, setOpen] = useState(group.defaultOpen);
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);
  const [hoveredPaper, setHoveredPaper] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const imgUrl = group.pubchemCid
    ? `https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=${group.pubchemCid}&width=80&height=80`
    : null;

  return (
    <div
      className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden transition-shadow duration-200"
      style={{ boxShadow: open ? "0 2px 16px rgba(0,0,0,0.07)" : undefined }}
    >
      {/* ── Group Header ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#f9fafb] transition-colors duration-150 group"
      >
        {/* Molecule thumbnail */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "#f0fdf4",
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
            backgroundSize: "10px 10px",
            border: "1px solid #d1fae5",
          }}
        >
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={group.compoundName} className="w-full h-full object-contain p-1"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <Beaker size={16} style={{ color: "#1a5c3a" }} />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[13.5px] font-bold text-slate-900 leading-tight truncate">{group.compoundName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{group.cas !== "Various" ? `CAS ${group.cas} · ` : ""}{group.formula}</p>
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: "#e3f5ec", color: "#1a5c3a" }}
          >
            <BookOpen size={10} />
            {group.papers.length} paper{group.papers.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:block">{group.lastAdded}</span>
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ background: open ? "#1a5c3a" : "#f3f4f6" }}
          >
            <ChevronDown
              size={13}
              style={{ color: open ? "white" : "#6b7280" }}
              className={cn("transition-transform duration-250", open ? "rotate-180" : "")}
            />
          </div>
        </div>
      </button>

      {/* ── Expandable paper list ── */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: open ? "2000px" : "0px",
          overflow: "hidden",
          transition: open
            ? "max-height 0.36s cubic-bezier(0.22,1,0.36,1)"
            : "max-height 0.22s cubic-bezier(0.4,0,1,1)",
        }}
      >
        <div className="border-t border-[#f0f0f0]">
          {(group.papers as readonly LitPaper[]).map((paper, i) => {
            const isLast = i === group.papers.length - 1;
            const isExpanded = expandedAbstract === paper.id;
            const isHovered = hoveredPaper === paper.id;

            return (
              <div
                key={paper.id}
                className={cn(
                  "px-4 transition-colors duration-100",
                  !isLast && "border-b border-[#f4f4f5]",
                  isHovered ? "bg-[#f9fdfb]" : "bg-white",
                )}
                onMouseEnter={() => setHoveredPaper(paper.id)}
                onMouseLeave={() => setHoveredPaper(null)}
              >
                {/* Paper main row */}
                <div
                  className="flex items-start gap-2.5 py-3 cursor-pointer"
                  onClick={() => setExpandedAbstract(isExpanded ? null : paper.id)}
                >
                  {/* Status dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] shrink-0 mt-[6px]" />

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[12.5px] font-semibold text-slate-800 leading-snug transition-colors duration-100",
                      isHovered && "text-[#1a5c3a]",
                      !isExpanded && "line-clamp-2",
                    )}>
                      {paper.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                        style={{ background: "#f0fdf4", color: "#1a5c3a", border: "1px solid #bbf7d0" }}
                      >
                        {paper.source}
                      </span>
                      <span className="text-[10.5px] text-slate-400">{paper.year}</span>
                      <span className="text-[10.5px] text-slate-300">·</span>
                      <span className="text-[10.5px] text-slate-400 truncate max-w-[160px]">{paper.doi}</span>
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <ChevronDown
                    size={12}
                    className={cn("shrink-0 mt-1 text-slate-300 transition-all duration-200", isExpanded && "rotate-180 text-[#1a5c3a]")}
                  />
                </div>

                {/* Abstract expansion */}
                <div
                  style={{
                    maxHeight: isExpanded ? "300px" : "0px",
                    overflow: "hidden",
                    transition: isExpanded
                      ? "max-height 0.32s cubic-bezier(0.22,1,0.36,1)"
                      : "max-height 0.18s cubic-bezier(0.4,0,1,1)",
                  }}
                >
                  <p className="text-[11.5px] text-slate-600 leading-relaxed pb-3 pl-4 pr-1 border-l-2 border-[#d1fae5] ml-0.5">
                    {paper.abstract}
                  </p>
                </div>

                {/* Action bar — always visible on hover, always visible when expanded */}
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 pb-3 transition-all duration-150",
                    isHovered || isExpanded ? "opacity-100" : "opacity-0 pointer-events-none h-0 pb-0 overflow-hidden",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e0e0e0] text-[11px] font-medium text-slate-600 hover:border-[#1a5c3a] hover:text-[#1a5c3a] hover:bg-[#f0fdf4] transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <BookOpen size={10} /> Read paper
                    </button>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e0e0e0] text-[11px] font-medium text-slate-600 hover:border-[#1a5c3a] hover:text-[#1a5c3a] hover:bg-[#f0fdf4] transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <FlaskConical size={10} /> Extract conditions
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e0e0e0] text-[11px] font-medium text-slate-600 hover:border-[#1a5c3a] hover:text-[#1a5c3a] hover:bg-[#f0fdf4] transition-all"
                    onClick={e => e.stopPropagation()}
                  >
                    <Database size={10} /> Save to vault
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Compounds Panel ───────────────────────────────────────────────────

function RecentCompoundsPanel({
  onOpenWorkspace, onOpenLiterature, onViewDetails, onResume,
}: {
  onOpenWorkspace: () => void;
  onOpenLiterature: () => void;
  onViewDetails: (item: typeof RESEARCH_COMPOUNDS[0]) => void;
  onResume: (item: typeof RESEARCH_COMPOUNDS[0]) => void;
}) {
  const [tab, setTab]           = useState<WorkspaceTab>("research");
  const [sort, setSort]         = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage]         = useState(1); // 1-indexed
  const SORT_LABELS: Record<SortKey, string> = { recent: "Most Recent", name: "Name (A–Z)", confidence: "Routes" };

  // Research data sorted
  const researchData = [...RESEARCH_COMPOUNDS].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "confidence") return b.routes - a.routes;
    return 0;
  });

  const perPage    = RESEARCH_PER_PAGE;
  const activeData = researchData;
  const totalPages = tab === "research" ? Math.ceil(activeData.length / perPage) : 0;
  const visible    = tab === "research" ? activeData.slice((page - 1) * perPage, page * perPage) : [];

  const handleTab  = (t: WorkspaceTab) => { setTab(t); setPage(1); };
  const handleSort = (s: SortKey)      => { setSort(s); setSortOpen(false); setPage(1); };

  // Research cards 5 & 6 on page 1 are locked
  const isLocked = (localIndex: number) => tab === "research" && page === 1 && localIndex >= 4;

  return (
    <section className="flex flex-col gap-3">

      {/* ── Row 1: heading + view-all ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-slate-900">My Recent Repository</h2>
        <button className="flex items-center gap-1 text-[12.5px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
          View all <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Row 2: workspace toggle (left) + sort (right) ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center rounded-lg border border-[#e4e4e7] overflow-hidden bg-white">
          <button onClick={() => handleTab("research")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
              tab === "research" ? "bg-[#1a5c3a] text-white" : "text-slate-500 hover:bg-slate-50")}>
            <FlaskConical size={11} /> Research Workspace
          </button>
          <div className="w-px h-5 bg-[#e4e4e7]" />
          <button onClick={() => handleTab("literature")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
              tab === "literature" ? "bg-[#1a5c3a] text-white" : "text-slate-500 hover:bg-slate-50")}>
            <BookOpen size={11} /> Literature Workspace
          </button>
        </div>
        <div className="relative">
          <button onClick={() => setSortOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] bg-white text-[11px] font-semibold text-slate-600 hover:border-slate-300 transition-colors">
            Sort: {SORT_LABELS[sort]} <ChevronDown size={11} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-[#e4e4e7] shadow-lg overflow-hidden w-[160px]">
              {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                <button key={key} onClick={() => handleSort(key)}
                  className={cn("w-full text-left px-3.5 py-2 text-[11.5px] transition-colors",
                    sort === key ? "bg-[#f0fdf4] text-[#1a5c3a] font-semibold" : "text-slate-600 hover:bg-slate-50")}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RESEARCH TAB: 3×2 molecule cards ── */}
      {tab === "research" && (
        <div className="grid grid-cols-3 gap-3">
          {(visible as typeof RESEARCH_COMPOUNDS).map((item, localIndex) => {
            const imgUrl = `https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=${item.pubchemCid}&width=300&height=200`;
            const locked = isLocked(localIndex);
            return (
              <div key={item.id} className="relative bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden flex flex-col transition-all duration-200"
                style={!locked ? { cursor: "pointer" } : {}}>
                {/* Molecule image */}
                <div className="h-[120px] flex items-center justify-center overflow-hidden"
                  style={{
                    background: "#f8fafb",
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.045) 1px,transparent 1px)",
                    backgroundSize: "20px 20px",
                    filter: locked ? "blur(3px)" : undefined,
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={item.name} className="w-full h-full object-contain p-2"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                {/* Body */}
                <div className="p-3 flex flex-col gap-2 flex-1" style={{ filter: locked ? "blur(3px)" : undefined }}>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">CAS {item.cas} · {item.formula}</p>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                      style={{ background: "#e3f5ec", color: "#1a5c3a" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="#1a5c3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item.routes} routes
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <button
                      onClick={() => !locked && onViewDetails(item)}
                      className="w-full py-1.5 rounded-lg text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                      style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)", pointerEvents: locked ? "none" : undefined }}>
                      <Database size={11} /> View Details
                    </button>
                    <button
                      onClick={() => !locked && onResume(item)}
                      className="w-full py-1.5 rounded-lg border border-[#e4e4e7] text-slate-600 text-[11.5px] font-semibold flex items-center justify-center gap-1.5 hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-all"
                      style={{ pointerEvents: locked ? "none" : undefined }}>
                      <RotateCcw size={11} /> Resume
                    </button>
                  </div>
                </div>
                {/* Lock overlay */}
                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(1px)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                      <Lock size={15} className="text-white" />
                    </div>
                    <p className="text-[11.5px] font-bold text-slate-800">Upgrade to unlock</p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold hover:brightness-110 transition-all"
                      style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                      <Crown size={11} /> Go Premium
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LITERATURE TAB: grouped by compound ── */}
      {tab === "literature" && (
        <div className="flex flex-col gap-2.5">
          {/* Summary strip */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] text-slate-400">
              {GROUPED_LITERATURE.reduce((acc, g) => acc + g.papers.length, 0)} papers saved across {GROUPED_LITERATURE.length} research topics
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[11px] text-[#1a5c3a] font-semibold cursor-pointer hover:underline">
              Select all
            </span>
          </div>

          {GROUPED_LITERATURE.map(group => (
            <LiteratureGroupRow key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* ── Numbered Pagination: < 1 2 3 > ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#e4e4e7] bg-white text-slate-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={cn("w-7 h-7 rounded-lg text-[12px] font-semibold border transition-all",
                p === page
                  ? "bg-[#1a5c3a] text-white border-[#1a5c3a]"
                  : "border-[#e4e4e7] text-slate-500 bg-white hover:border-[#1a5c3a] hover:text-[#1a5c3a]"
              )}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#e4e4e7] bg-white text-slate-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Compound Detail Modal (View Details) ────────────────────────────────────

type DetailTab = "routes" | "bom" | "literature" | "patent";

function ScoreBarSmall({ value, max = 10, color = "#1a5c3a" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex-1 h-[3px] rounded-full bg-[#e8ece9] overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

type BatchScale = "1mmol" | "1g" | "100g" | "1kg";

const BOM_SUMMARY_BASE = [
  { name: "salicylic acid",   role: "substrate", mw: "138.12", mmol: 6.167, mg: 851.9,  usedIn: "Step 1" },
  { name: "acetic anhydride", role: "reagent",   mw: "102.09", mmol: 6.167, mg: 629.6,  usedIn: "Step 1" },
  { name: "sulfuric acid",    role: "reagent",   mw: "98.08",  mmol: 0.123, mg: 12.1,   usedIn: "Step 1" },
];

const BOM_STEP_BASE = [
  { name: "salicylic acid",   role: "substrate", equiv: 1.00, mmol: 6.167, mg: 851.9  },
  { name: "aspirin",          role: "product",   equiv: 0.90, mmol: 5.551, mg: 1000.0 },
  { name: "acetic anhydride", role: "reagent",   equiv: 1.00, mmol: 6.167, mg: 629.6  },
  { name: "sulfuric acid",    role: "reagent",   equiv: 0.02, mmol: 0.123, mg: 12.1   },
];

const SCALE_MULT: Record<BatchScale, number> = {
  "1mmol": 1 / 5.551, "1g": 1, "100g": 100, "1kg": 1000,
};

function fmtMmol(v: number, scale: BatchScale) {
  const n = v * SCALE_MULT[scale];
  return n < 1 ? `${(n * 1000).toFixed(0)} μmol` : `${n.toFixed(3)} mmol`;
}
function fmtMass(mg: number, scale: BatchScale) {
  const n = mg * SCALE_MULT[scale];
  if (n < 1) return `${(n * 1000).toFixed(0)} μg`;
  if (n < 1000) return `${n.toFixed(1)} mg`;
  return `${(n / 1000).toFixed(2)} g`;
}

interface CompoundDetailCompound {
  name: string; cas: string; formula: string; mw: string; pubchemCid: number;
}

function CompoundDetailModal({
  compound, onClose, onResume,
}: {
  compound: CompoundDetailCompound;
  onClose: () => void;
  onResume: () => void;
}) {
  const [selectedRoute, setSelectedRoute]   = useState("A");
  const [activeTab, setActiveTab]           = useState<DetailTab>("routes");
  const [batchScale, setBatchScale]         = useState<BatchScale>("1g");
  const [stepExpanded, setStepExpanded]     = useState(true);
  const [expandedLit, setExpandedLit]       = useState<Record<number, boolean>>({});
  const [mounted, setMounted]               = useState(false);

  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  const route = DETAIL_ROUTES.find(r => r.id === selectedRoute) ?? DETAIL_ROUTES[0];

  const roleStyle = (role: string) =>
    role === "substrate" ? { bg: "#e3f5ec", color: "#1a5c3a" } :
    role === "product"   ? { bg: "#eff6ff", color: "#1e50a2" } :
                           { bg: "#fef3c7", color: "#92400e" };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white"
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 250ms ease, transform 250ms ease" }}>

      {/* ── Top bar ── */}
      <div className="h-14 shrink-0 border-b border-[#e4e4e7] flex items-center justify-between px-5 gap-4 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors shrink-0 group">
            <div className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-slate-400 transition-colors">
              <ChevronLeft size={13} />
            </div>
            Repository
          </button>
          <div className="w-px h-6 bg-slate-200 shrink-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-slate-900 leading-tight truncate">{compound.name}</p>
            <p className="text-[10.5px] text-slate-400 leading-none mt-0.5">CAS {compound.cas} · {compound.formula} · {compound.mw} g/mol</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] text-[11.5px] font-semibold text-slate-600 bg-white hover:border-slate-400 transition-colors">
            <Download size={12} /> Export PDF
          </button>
          <button onClick={onResume}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11.5px] font-bold hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
            <FlaskConical size={12} /> Resume Chat
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] text-[11.5px] font-semibold text-slate-600 bg-white hover:border-slate-400 transition-colors">
            <Database size={12} /> Vault <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold bg-slate-100 ml-0.5">5</span>
          </button>
        </div>
      </div>

      {/* ── Body: left sidebar always visible + right panel with tabs ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Routes sidebar (always visible) ── */}
        <div className="w-[220px] shrink-0 border-r border-[#e4e4e7] flex flex-col bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#f0f0f0]">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">ROUTES</p>
          </div>
          <div className="flex flex-col gap-0.5 p-2 flex-1">
            {DETAIL_ROUTES.map(r => (
              <button key={r.id} onClick={() => { setSelectedRoute(r.id); setActiveTab("routes"); }}
                className={cn("w-full text-left px-3 py-3 rounded-xl transition-all",
                  selectedRoute === r.id && activeTab === "routes"
                    ? "bg-[#f0fdf4] border border-[#1a5c3a]/25"
                    : "hover:bg-slate-50"
                )}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[13px] font-bold text-slate-900">Route {r.id}</span>
                  <span className="text-[13px] font-black px-2 py-0.5 rounded-full text-[12px]"
                    style={selectedRoute === r.id && activeTab === "routes"
                      ? { background: "#1a5c3a", color: "white" }
                      : { background: "#f3f4f6", color: "#374151" }
                    }>{r.score}</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mb-1.5">
                  <Layers size={9} className="inline mr-1 mb-0.5" />
                  {r.steps} step{r.steps > 1 ? "s" : ""}{"   "}{r.yield} yield
                </p>
                <p className="text-[10.5px] text-slate-400 leading-snug line-clamp-2">{r.summary.slice(0, 80)}...</p>
                {r.best && (
                  <span className="inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: "#fef3c7", color: "#92400e" }}>
                    <Star size={7} style={{ fill: "#f59e0b", color: "#f59e0b" }} /> Most Efficient
                  </span>
                )}
                {r.lowest && (
                  <span className="inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: "#fee2e2", color: "#b91c1c" }}>
                    <TrendingDown size={7} /> Lowest Score
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Resume Chat CTA in sidebar */}
          <div className="p-3 border-t border-[#f0f0f0]">
            <button onClick={onResume}
              className="w-full py-2 rounded-lg text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
              <RotateCcw size={12} /> Resume Chat
            </button>
          </div>
        </div>

        {/* ── RIGHT: Tab bar + content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Tab bar */}
          <div className="shrink-0 border-b border-[#e4e4e7] bg-white px-4">
            <div className="flex items-center">
              {([
                { key: "routes",     label: "Routes" },
                { key: "bom",        label: "Bill of Materials" },
                { key: "literature", label: "Literature" },
                { key: "patent",     label: "Patents" },
              ] as { key: DetailTab; label: string }[]).map(({ key, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={cn("px-4 py-3 text-[12.5px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap",
                    activeTab === key ? "border-[#1a5c3a] text-[#1a5c3a]" : "border-transparent text-slate-500 hover:text-slate-800")}>
                  {label}
                </button>
              ))}
              {/* Route indicator pill on right */}
              <div className="ml-auto flex items-center gap-2 pb-1">
                <span className="text-[11px] text-slate-400">Route {selectedRoute}</span>
                <span className="text-[12px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{route.score}</span>
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto bg-[#f8f9fa]">

            {/* ══ ROUTES ══ */}
            {activeTab === "routes" && (
              <div className="p-5 flex flex-col gap-4 max-w-[860px]">
                {/* Summary header card */}
                <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f6]"
                    style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)" }}>
                    <div className="flex items-center gap-2">
                      {route.best && <Star size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />}
                      {route.lowest && <TrendingDown size={14} className="text-red-400" />}
                      <span className="text-[13px] font-bold text-slate-900">Route {route.id} — {route.name}</span>
                      {route.best && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#fef3c7", color: "#92400e" }}>⭐ Most Efficient</span>}
                      {route.lowest && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#fee2e2", color: "#b91c1c" }}>⬇ Lowest Score</span>}
                    </div>
                    <span className="text-[22px] font-black" style={{ color: route.best ? "#1a5c3a" : route.lowest ? "#ef4444" : "#334155" }}>
                      {route.score}<span className="text-[11px] text-slate-400 font-semibold">/10</span>
                    </span>
                  </div>
                  {/* Param chips */}
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f3f4f6] flex-wrap" style={{ background: "#fafafa" }}>
                    {[
                      { label: "YIELD", value: route.yield, color: "#1a5c3a", bg: "#e3f5ec" },
                      { label: "STEPS", value: `${route.steps} step${route.steps > 1 ? "s" : ""}`, color: "#1e50a2", bg: "#eff6ff" },
                      { label: "TEMP",  value: route.keyParams.temp, color: "#92400e", bg: "#fef3c7" },
                      { label: "TIME",  value: route.keyParams.time, color: "#6b21a8", bg: "#f3e8ff" },
                      { label: "MODE",  value: route.keyParams.mode, color: "#374151", bg: "#f3f4f6" },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: bg }}>
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: `${color}99` }}>{label}</span>
                        <span className="text-[11.5px] font-bold" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[13px] text-slate-700 leading-relaxed">{route.summary}</p>
                  </div>
                </div>

                {/* Synthesis scheme */}
                <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">SYNTHESIS SCHEME</p>
                  </div>
                  <div className="flex items-center justify-center gap-8 px-8 py-5"
                    style={{ background: "#f8fafb", backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)", backgroundSize: "20px 20px" }}>
                    <div className="flex flex-col items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={route.fromImg} alt={route.fromLabel} className="h-[80px] object-contain" />
                      <span className="text-[11px] text-slate-500 font-medium">{route.fromLabel}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {route.reagents.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "#fef9c3", color: "#92400e" }}>{r}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-14 h-px bg-slate-400" />
                        <ArrowRight size={15} className="text-slate-400" />
                      </div>
                      <span className="text-[10px] text-slate-400">{route.keyParams.temp} · {route.keyParams.time}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={route.toImg} alt={route.toLabel} className="h-[80px] object-contain" />
                      <span className="text-[11px] text-slate-500 font-medium">{route.toLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Workup + Purification */}
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: "WORKUP PROCEDURE", text: route.workup }, { label: "PURIFICATION", text: route.purification }].map(({ label, text }) => (
                    <div key={label} className="bg-white rounded-2xl border border-[#e4e4e7] p-4 shadow-sm">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">{label}</p>
                      <p className="text-[12.5px] text-slate-700 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Score breakdown */}
                <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 shadow-sm">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">ROUTE SCORE BREAKDOWN</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Feasibility",   value: route.feasibility,   color: "#1a5c3a" },
                      { label: "Affordability", value: route.affordability, color: "#1e50a2" },
                      { label: "IP Risk",       value: route.ipRisk,        color: "#ef4444" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-[12px] text-slate-600 w-[96px] shrink-0">{label}</span>
                        <ScoreBarSmall value={value} color={color} />
                        <span className="text-[12px] font-bold w-8 text-right shrink-0" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* References */}
                {route.refs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#e4e4e7] p-4 shadow-sm">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">REFERENCES</p>
                    <div className="flex flex-col gap-2">
                      {route.refs.map(ref => (
                        <button key={ref} className="flex items-center gap-2 text-left text-[12px] hover:underline" style={{ color: "#1a5c3a" }}>
                          <ExternalLink size={11} /> {ref}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ BILL OF MATERIALS ══ */}
            {activeTab === "bom" && (
              <div className="p-5 flex flex-col gap-4 max-w-[900px]">

                {/* Batch scale selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[12.5px] font-semibold text-slate-700">Batch scale:</span>
                  <div className="flex items-center rounded-lg border border-[#e4e4e7] overflow-hidden bg-white">
                    {(["1mmol", "1g", "100g", "1kg"] as BatchScale[]).map(s => (
                      <button key={s} onClick={() => setBatchScale(s)}
                        className={cn("px-3.5 py-1.5 text-[12px] font-semibold transition-all border-r border-[#e4e4e7] last:border-0",
                          batchScale === s ? "bg-[#1a5c3a] text-white" : "text-slate-600 hover:bg-slate-50")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route summary table */}
                <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
                    <p className="text-[13px] font-bold text-slate-900">Route summary · {batchScale} target</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#f3f4f6]" style={{ background: "#fafafa" }}>
                          {["Material", "Role", "MW", "Total amount", "Total mass", "Used in steps"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {BOM_SUMMARY_BASE.map((row, i) => {
                          const rs = roleStyle(row.role === "substrate" ? "substrate" : "reagent");
                          return (
                            <tr key={i} className={cn("border-b border-[#f9fafb] hover:bg-[#fafafa] transition-colors", i === BOM_SUMMARY_BASE.length - 1 && "border-0")}>
                              <td className="px-4 py-3 text-[12.5px] font-semibold text-slate-800">{row.name}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ background: rs.bg, color: rs.color }}>{row.role}</span>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-slate-600">{row.mw}</td>
                              <td className="px-4 py-3 text-[12px] font-bold text-slate-800">{fmtMmol(row.mmol, batchScale)}</td>
                              <td className="px-4 py-3 text-[12px] font-bold text-slate-800">{fmtMass(row.mg, batchScale)}</td>
                              <td className="px-4 py-3 text-[12px] text-slate-500">{row.usedIn}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step-by-step breakdown */}
                <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
                  <button
                    onClick={() => setStepExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6] hover:bg-slate-50 transition-colors"
                    style={{ background: "#f9fafb" }}>
                    <p className="text-[13px] font-bold text-slate-900">Step-by-step breakdown</p>
                    <ChevronDown size={15} className={cn("text-slate-400 transition-transform", stepExpanded ? "rotate-180" : "")} />
                  </button>

                  {stepExpanded && (
                    <div>
                      {/* Step header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f6]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: "#1a5c3a" }}>1</span>
                          <span className="text-[13px] font-bold text-slate-800">Acetylation of salicylic acid with acetic anhydride</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {fmtMmol(6.167, batchScale)} substrate
                        </span>
                      </div>
                      {/* Step materials table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[#f3f4f6]" style={{ background: "#fafafa" }}>
                              {["Material", "Role", "Equiv", "Amount", "Mass / Vol"].map(h => (
                                <th key={h} className="px-4 py-2 text-[11px] font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {BOM_STEP_BASE.map((row, i) => {
                              const rs = roleStyle(row.role);
                              return (
                                <tr key={i} className={cn("border-b border-[#f9fafb] hover:bg-[#fafafa] transition-colors", i === BOM_STEP_BASE.length - 1 && "border-0")}>
                                  <td className="px-4 py-3 text-[12.5px] font-semibold text-slate-800">{row.name}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ background: rs.bg, color: rs.color }}>{row.role}</span>
                                  </td>
                                  <td className="px-4 py-3 text-[12px] font-bold text-slate-700">{row.equiv.toFixed(2)}×</td>
                                  <td className="px-4 py-3 text-[12px] font-bold text-slate-800">{fmtMmol(row.mmol, batchScale)}</td>
                                  <td className="px-4 py-3 text-[12px] font-bold text-slate-800">{fmtMass(row.mg, batchScale)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ LITERATURE ══ */}
            {activeTab === "literature" && (
              <div className="p-5 flex flex-col gap-3 max-w-[900px]">
                <p className="text-[12.5px] text-slate-500 mb-1">{COMPOUND_SYNTHESIS_LITERATURE.length} papers found for <span className="font-semibold text-slate-800">{compound.name}</span></p>
                {COMPOUND_SYNTHESIS_LITERATURE.map(paper => (
                  <div key={paper.id} className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
                    {/* BookOpen icon box */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#e3f5ec" }}>
                      <BookOpen size={16} style={{ color: "#1a5c3a" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] font-bold leading-snug" style={{ color: "#1a5c3a" }}>{paper.title}</p>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">10 Jun 2026</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-2">{paper.year} · {paper.source}</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {expandedLit[paper.id] ? paper.abstract : paper.abstract.slice(0, 200) + "..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ PATENTS ══ */}
            {activeTab === "patent" && (
              <div className="p-5 flex flex-col gap-3 max-w-[900px]">
                <p className="text-[12.5px] text-slate-500 mb-1">{PATENT_DATA.length} patents found for <span className="font-semibold text-slate-800">{compound.name}</span></p>
                {PATENT_DATA.map(patent => {
                  const country = patent.number.replace(/[0-9A-Z]{6,}.*/, "").replace(/[^A-Z]/g, "").slice(0, 2);
                  return (
                    <div key={patent.id} className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
                      {/* Shield icon box */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#fef3c7" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z"
                            stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                              style={{ background: "#fef9c3", color: "#92400e", borderColor: "#fde68a" }}>{country || "INT"}</span>
                            <span className="text-[11px] font-mono text-slate-500">{patent.number}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">{patent.year === "1899" ? "2 Jun 2026" : "10 Jun 2026"}</span>
                        </div>
                        <p className="text-[13px] font-bold mt-1 leading-snug" style={{ color: "#92400e" }}>
                          {patent.number} — {patent.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── State 2 — After First Search ────────────────────────────────────────────

function SearchedState({ onLearnMore, onUpgrade, onOpenWorkspace, onOpenLiterature }: { onLearnMore: () => void; onUpgrade: () => void; onOpenWorkspace: () => void; onOpenLiterature: () => void }) {
  const [detailCompound, setDetailCompound] = useState<typeof RESEARCH_COMPOUNDS[0] | null>(null);
  const [resumeOpen, setResumeOpen]         = useState(false);
  const [resumeMessages, setResumeMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);

  const handleViewDetails = (item: typeof RESEARCH_COMPOUNDS[0]) => {
    setDetailCompound(item);
  };

  const handleResume = (item: typeof RESEARCH_COMPOUNDS[0]) => {
    // Pre-seed the chat with a previous session for this compound
    setResumeMessages([
      { role: "user",  text: `Find synthesis routes for ${item.name} (CAS ${item.cas}) with patent check` },
      { role: "agent", text: `Analysing synthesis routes for ${item.name}. Found ${item.routes} viable routes. Generating retrosynthesis tree, scoring by feasibility and affordability, and checking patent landscape. The most efficient route shows ${Math.round(item.routes * 1.2)}% overall yield with ${item.routes > 20 ? "low" : "moderate"} IP risk — results loaded in the canvas.` },
      { role: "user",  text: `Which route has the lowest IP risk?` },
      { role: "agent", text: `Route A (Classical Acetylation) carries the lowest IP risk — the original patent expired in 1920 and the process is fully in the public domain. I've highlighted the IP risk scores for all routes in the analysis panel on the right.` },
    ]);
    setResumeOpen(true);
  };

  const handleResumeFromDetail = () => {
    if (detailCompound) {
      setDetailCompound(null);
      handleResume(detailCompound);
    }
  };

  return (
    <>
      {/* View Details full-screen modal */}
      {detailCompound && (
        <CompoundDetailModal
          compound={detailCompound}
          onClose={() => setDetailCompound(null)}
          onResume={handleResumeFromDetail}
        />
      )}

      {/* Resume side-drawer */}
      {resumeOpen && (
        <ResearchWorkspaceModal
          onClose={() => setResumeOpen(false)}
          defaultTab="research"
          preloadedMessages={resumeMessages}
          preloadedHasResult={true}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* Left 70%: My Recent Repository */}
        <div className="lg:col-span-7">
          <RecentCompoundsPanel
            onOpenWorkspace={onOpenWorkspace}
            onOpenLiterature={onOpenLiterature}
            onViewDetails={handleViewDetails}
            onResume={handleResume}
          />
        </div>

        {/* Right 30%: Workspace cards + Deep Research banner */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">WORKSPACES</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <WorkspaceCards onOpen={onOpenWorkspace} onOpenLiterature={onOpenLiterature} vertical={true} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">DEEP RESEARCH</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <DeepResearchBannerCard onLearnMore={onLearnMore} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Research Result Canvas ───────────────────────────────────────────────────

const ROUTES = [
  { id: "A", label: "Route A", steps: 3, yield: 67, score: 8.5, best: false, desc: "Classical acetylation route to aspirin via direct esterification of salicylic acid with acetic...", feasibility: 7.5, affordability: 8.5, ipRisk: 5.5 },
  { id: "B", label: "Route B", steps: 4, yield: 70, score: 8.5, best: false, desc: "Kolbe-Schmitt route: phenol is converted to sodium phenoxide, which undergoes CO2...",            feasibility: 7.0, affordability: 8.0, ipRisk: 5.5 },
  { id: "C", label: "Route C", steps: 4, yield: 70, score: 7.8, best: false, desc: "Green catalytic synthesis route utilizing heterogeneous solid acid catalysts. Salicylic...",      feasibility: 7.5, affordability: 7.0, ipRisk: 5.5 },
  { id: "D", label: "Route D", steps: 2, yield: 75, score: 7.2, best: false, desc: "Enzymatic acetylation route using Candida antarctica lipase B (CAL-B) as biocatalyst...",         feasibility: 4.0, affordability: 4.5, ipRisk: 4.5 },
  { id: "E", label: "Route E", steps: 4, yield: 85, score: 8.5, best: true,  desc: "Continuous-flow microreactor synthesis of aspirin from salicylic acid and acetic anhydride...",     feasibility: 7.5, affordability: 7.5, ipRisk: 6.5 },
];

const ROUTE_E_STEPS = [
  {
    n: 1, title: "Continuous-flow acetylation of salicylic acid", yield: "88–95%",
    temp: "85–95°C", time: "3–5 min residence time", mode: "Continuous",
    reagents: ["acetic anhydride (1.5 eq)", "phosphoric acid (0.05 eq)"],
    workup: "The reaction stream exits the microreactor at elevated temperature with complete conversion. The crude product stream contains aspirin, excess acetic anhydride, acetic acid byproduct, and catalyst.",
    refs: ["Continuous-Flow Synthesis of Aspirin in a Microreactor (2011)", "Microreactor technology for pharmaceutical synthesis (2010)"],
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=338&width=120&height=80",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    fromLabel: "salicylic acid", toLabel: "aspirin (crude)",
  },
  {
    n: 2, title: "In-line quench and extraction", yield: "95–98%",
    temp: "20–30°C", time: "1–2 min residence time", mode: "Continuous",
    reagents: ["water (2 volumes)"],
    workup: "The hot reaction stream is mixed with cold water in a T-mixer or static mixer. Excess acetic anhydride is hydrolyzed to acetic acid. Aspirin precipitates as the solution cools due to its low aqueous solubility (3 g/L at 25°C). The aqueous slurry is collected continuously.",
    refs: ["Continuous-Flow Synthesis of Aspirin in a Microreactor (2011)"],
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    fromLabel: "aspirin (crude)", toLabel: "aspirin (aqueous suspension)",
  },
  {
    n: 3, title: "Continuous filtration and washing", yield: "96–99%",
    temp: "20–25°C", time: "continuous operation", mode: "Continuous",
    reagents: ["cold water (1 volume wash)"],
    workup: "The aspirin slurry is fed to a continuous vacuum filter (rotary drum or belt filter). The solid is washed with cold water to remove residual acetic acid and catalyst. The wet cake is collected continuously.",
    refs: [],
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    fromLabel: "aspirin (aqueous suspension)", toLabel: "aspirin (wet cake)",
  },
  {
    n: 4, title: "Drying and final product isolation", yield: "98–99%",
    temp: "40–50°C", time: "2–4 hours", mode: "Batch",
    reagents: [],
    workup: "The wet aspirin cake is dried in a vacuum oven or continuous belt dryer under reduced pressure to remove residual water. The dried product is milled to the desired particle size for pharmaceutical formulation.",
    refs: [],
    fromImg: "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    toImg:   "https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=120&height=80",
    fromLabel: "aspirin (wet cake)", toLabel: "aspirin",
  },
];

const PROVENANCES = [
  { id: 1, title: "Continuous-Flow Synthesis of Aspirin in a Microreactor", source: "Org. Process Res. Dev.", year: "2011", relevance: "Route E basis", snippet: "Describes the complete continuous-flow synthesis of aspirin using a PTFE microreactor with residence time < 5 min and 95% yield." },
  { id: 2, title: "Green Chemistry Approaches to Aspirin Synthesis", source: "Green Chem.", year: "2019", relevance: "Route C basis", snippet: "Heterogeneous solid acid catalysis for aspirin synthesis with water as the only byproduct, achieving 70% isolated yield." },
  { id: 3, title: "Enzymatic Acetylation of Salicylic Acid by Candida antarctica Lipase B", source: "J. Mol. Catal. B", year: "2015", relevance: "Route D basis", snippet: "CAL-B immobilized on acrylic resin catalyzes aspirin synthesis at 40°C in 2 steps with excellent selectivity." },
  { id: 4, title: "Microreactor Technology for Pharmaceutical Synthesis", source: "Chem. Eng. J.", year: "2010", relevance: "Supporting reference", snippet: "Review of continuous-flow microreactor applications including safety benefits for exothermic acetylation reactions." },
  { id: 5, title: "Patent Landscape for Aspirin Manufacturing Processes", source: "Patent Analysis", year: "2023", relevance: "IP analysis", snippet: "Routes A and B are covered by expired patents; Route E specific flow designs may overlap with active IP from Corning and Lonza." },
];

function ScoreBar({ value, max = 10, color = "#1a5c3a" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex-1 h-[4px] rounded-full bg-[#e8ece9] overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

function ResearchResultCanvas() {
  const [selectedRoute, setSelectedRoute] = useState("E");
  const [schemeTab, setSchemeTab]         = useState<"Steps"|"Graph"|"Modify Path"|"Stoichiometry">("Steps");
  const [provOpen, setProvOpen]           = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const route = ROUTES.find(r => r.id === selectedRoute) ?? ROUTES[4];

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden relative">

      {/* ── Blur backdrop when provenances open ── */}
      {provOpen && (
        <div
          className="absolute inset-0 z-10"
          style={{ background: "rgba(15,25,20,0.35)", backdropFilter: "blur(3px)" }}
          onClick={() => setProvOpen(false)}
        />
      )}

      {/* ── Main scrollable canvas ── */}
      <div className="flex-1 overflow-y-auto bg-[#f0f1f3]">
        <div className="p-5 flex flex-col gap-4">

          {/* ── Section header: Route of Synthesis + Share + Provenances ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#e3f5ec" }}>
                <FlaskConical size={14} style={{ color: "#1a5c3a" }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Route of Synthesis</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ background: "#e3f5ec", color: "#1a5c3a" }}>
                <CheckCircle2 size={10} /> {ROUTES.length} routes evaluated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] text-[11.5px] font-semibold text-slate-600 bg-white hover:border-slate-400 transition-colors">
                <Share2 size={12} /> Share
              </button>
              <button
                onClick={() => setProvOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all"
                style={provOpen
                  ? { background: "#1a5c3a", color: "white" }
                  : { background: "white", color: "#1a5c3a", border: "1px solid #1a5c3a" }
                }
              >
                <Database size={12} /> Provenances
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                  style={provOpen ? { background: "rgba(255,255,255,0.25)" } : { background: "#e3f5ec" }}>
                  {PROVENANCES.length}
                </span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11.5px] font-semibold hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                <Database size={12} /> Save to repository
              </button>
            </div>
          </div>

          {/* ── Target molecule card ── */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">TARGET MOLECULE</p>
            </div>
            <div className="flex items-stretch">
              {/* Molecule image */}
              <div className="w-[180px] shrink-0 flex items-center justify-center p-4 border-r border-[#f3f4f6]"
                style={{ background: "#f8fafb", backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)", backgroundSize: "18px 18px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=2244&width=160&height=120" alt="Aspirin" className="w-[140px] object-contain" />
              </div>
              {/* Molecule info */}
              <div className="flex-1 p-4 flex flex-col gap-2">
                <p className="text-[17px] font-bold text-slate-900 leading-tight">2-acetyloxybenzoic acid</p>
                <p className="text-[12px] text-slate-500">CAS 50-78-2 · C9H8O4</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1">
                  {[
                    { label: "MW", value: "180.0423 g/mol" },
                    { label: "SMILES", value: "CC(=O)Oc1ccccc1C(=O)O" },
                    { label: "INCHIKEY", value: "BSYNRYMUTXBXSQ-UHFFFAOYSA-N" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                      <p className="text-[11.5px] text-slate-700 font-mono mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Route comparison cards ── */}
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {ROUTES.map(r => (
              <div key={r.id}
                onClick={() => setSelectedRoute(r.id)}
                className="w-[200px] shrink-0 rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden"
                style={selectedRoute === r.id
                  ? { borderColor: "#1a5c3a", background: "white", boxShadow: "0 0 0 2px rgba(26,92,58,0.12), 0 4px 16px rgba(26,92,58,0.10)" }
                  : { borderColor: "#e4e4e7", background: "white" }
                }
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#f3f4f6]" style={{ background: selectedRoute === r.id ? "#f0fdf4" : "#fafafa" }}>
                  <span className="text-[12px] font-bold text-slate-800">{r.label}</span>
                  {r.best && (
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#1a5c3a", color: "white" }}>Best</span>
                  )}
                </div>
                {/* Stats */}
                <div className="px-3.5 py-3 flex flex-col gap-2.5">
                  <p className="text-[10.5px] text-slate-500 leading-snug line-clamp-2">{r.desc}</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[18px] font-black text-slate-900 leading-none">{r.steps}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">STEPS</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-slate-900 leading-none">{r.yield}%</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">EST. YIELD</p>
                    </div>
                    <div>
                      <p className="text-[18px] font-black leading-none" style={{ color: "#1a5c3a" }}>{r.score}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">SCORE</p>
                    </div>
                  </div>
                  {/* Score bars */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "Feasibility",   val: r.feasibility },
                      { label: "Affordability", val: r.affordability },
                      { label: "IP Risk",        val: r.ipRisk, color: "#e55" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[9.5px] text-slate-400 w-[70px] shrink-0">{label}</span>
                        <ScoreBar value={val} color={color} />
                        <span className="text-[9.5px] font-semibold text-slate-500 w-6 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#e4e4e7] text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      Modify Path
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#e4e4e7] text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Database size={8} /> Save
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#e4e4e7] text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <BookOpen size={8} /> Literature
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Synthesis scheme ── */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden shadow-sm">
            {/* Scheme header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">SYNTHESIS SCHEME</span>
                <div className="flex items-center gap-1">
                  {ROUTES.map(r => (
                    <button key={r.id}
                      onClick={() => setSelectedRoute(r.id)}
                      className="px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all"
                      style={selectedRoute === r.id
                        ? { background: "#1a5c3a", color: "white" }
                        : { color: "#64748b" }
                      }>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-1 border border-[#e4e4e7] rounded-lg overflow-hidden">
                {(["Steps","Graph","Modify Path","Stoichiometry"] as const).map(tab => (
                  <button key={tab}
                    onClick={() => setSchemeTab(tab)}
                    className="px-3 py-1.5 text-[11px] font-semibold transition-all"
                    style={schemeTab === tab
                      ? { background: "#1a5c3a", color: "white" }
                      : { color: "#64748b" }
                    }>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Route summary bar */}
            <div className="flex items-center gap-5 px-5 py-3.5 border-b border-[#f3f4f6]">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">{route.steps} steps</span>
                <span className="text-[13px] font-bold text-slate-900">Route {selectedRoute}</span>
              </div>
              <p className="text-[11.5px] text-slate-500 flex-1 leading-snug">{route.desc}</p>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <p className="text-[16px] font-black text-slate-900">{route.yield}%</p>
                  <p className="text-[8.5px] uppercase tracking-wider text-slate-400">OVERALL</p>
                </div>
                <div className="text-center">
                  <p className="text-[16px] font-black" style={{ color: "#1a5c3a" }}>{route.feasibility}</p>
                  <p className="text-[8.5px] uppercase tracking-wider text-slate-400">FEASIBILITY</p>
                </div>
                <div className="text-center">
                  <p className="text-[16px] font-black" style={{ color: "#e55" }}>{route.ipRisk}</p>
                  <p className="text-[8.5px] uppercase tracking-wider text-slate-400">IP RISK</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {schemeTab === "Steps" && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROUTE_E_STEPS.map(step => (
                  <div key={step.n} className="rounded-xl border border-[#e4e4e7] overflow-hidden">
                    {/* Step header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#1a5c3a" }}>{step.n}</span>
                        <span className="text-[12px] font-bold text-slate-800">{step.title}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{step.yield}</span>
                    </div>
                    {/* Molecule transform */}
                    <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-[#f3f4f6]"
                      style={{ background: "#f8fafb", backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)", backgroundSize: "16px 16px" }}>
                      <div className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={step.fromImg} alt={step.fromLabel} className="h-[60px] object-contain mx-auto" />
                        <p className="text-[9px] text-slate-400 mt-1">{step.fromLabel}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 shrink-0" />
                      <div className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={step.toImg} alt={step.toLabel} className="h-[60px] object-contain mx-auto" />
                        <p className="text-[9px] text-slate-400 mt-1">{step.toLabel}</p>
                      </div>
                    </div>
                    {/* Conditions */}
                    <div className="px-4 py-3 flex flex-col gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div><p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">TEMPERATURE</p><p className="text-[12px] font-bold text-slate-800">{step.temp}</p></div>
                        <div><p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">TIME</p><p className="text-[12px] font-bold text-slate-800">{step.time}</p></div>
                        <div><p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">MODE</p><p className="text-[12px] font-bold text-slate-800">{step.mode}</p></div>
                      </div>
                      {step.reagents.length > 0 && (
                        <div>
                          <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">REAGENTS & CATALYSTS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {step.reagents.map(r => (
                              <span key={r} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "#fef9c3", color: "#92400e" }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">WORKUP</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {expandedSteps[step.n] ? step.workup : step.workup.slice(0, 100) + "..."}
                        </p>
                        <button onClick={() => setExpandedSteps(p => ({ ...p, [step.n]: !p[step.n] }))}
                          className="text-[10.5px] font-semibold mt-0.5 transition-colors" style={{ color: "#1a5c3a" }}>
                          {expandedSteps[step.n] ? "Show less" : "Show more"}
                        </button>
                      </div>
                      {step.refs.length > 0 && (
                        <div>
                          <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">REFERENCES</p>
                          {step.refs.map(ref => (
                            <p key={ref} className="text-[10px] text-[#1a5c3a] hover:underline cursor-pointer leading-snug">↗ {ref}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {schemeTab !== "Steps" && (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <div className="text-center flex flex-col items-center gap-2">
                  <Layers size={28} strokeWidth={1.2} />
                  <p className="text-[13px] font-medium">{schemeTab} view coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Analysis summary — deep teal/blue gradient instead of black ── */}
          <div className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: "linear-gradient(135deg,#0a2640 0%,#0d3d26 50%,#0a2640 100%)", border: "1px solid rgba(42,203,131,0.20)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.18)" }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(42,203,131,0.20)" }}>
                  <Sparkles size={11} style={{ color: "#6ee7b7" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#6ee7b7" }}>Research Analysis — Route E</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(42,203,131,0.15)", color: "#6ee7b7" }}>Overall 8.5 / 10</span>
              </div>
            </div>
            {/* Scores row */}
            <div className="flex items-stretch divide-x border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { label: "Yield Score", value: "9.5/10", sub: "88–95% × 95–98% × 96–99% × 98–99%", color: "#6ee7b7" },
                { label: "Feasibility", value: "7.5/10", sub: "Flow chemistry expertise required", color: "#93c5fd" },
                { label: "Cost",        value: "8.0/10", sub: "Commodity reagents, amortised capex", color: "#fde68a" },
                { label: "IP Risk",     value: "6.5/10", sub: "Specific flow designs may overlap IP", color: "#fca5a5" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="flex-1 px-4 py-3 flex flex-col gap-1" style={{ borderRightColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</p>
                  <p className="text-[20px] font-black leading-none" style={{ color }}>{value}</p>
                  <p className="text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{sub}</p>
                </div>
              ))}
            </div>
            {/* Body text */}
            <div className="px-5 py-4">
              <p className="text-[12px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.70)" }}>
                Route E represents a modern continuous-flow approach to aspirin synthesis with excellent overall yield (88–95% × 95–98% × 78–90%, median ~84%). The chemistry itself is well-established and safe: acetylation of salicylic acid with acetic anhydride catalyzed by phosphoric acid. <span style={{ color: "#6ee7b7", fontWeight: 600 }}>Yield Score (9.5/10):</span> The cumulative yield of 78–90% is excellent for a 4-step telescoped process. Each individual step shows high efficiency. <span style={{ color: "#93c5fd", fontWeight: 600 }}>Feasibility (7.5/10):</span> While the chemistry is straightforward, this route requires specialized continuous-flow microreactor equipment and flow chemistry expertise. <span style={{ color: "#fde68a", fontWeight: 600 }}>Cost (8.0/10):</span> Reagents are commodity chemicals — salicylic acid, acetic anhydride, phosphoric acid, water — and highly affordable. <span style={{ color: "#fca5a5", fontWeight: 600 }}>IP Risk (6.5/10):</span> The basic aspirin synthesis is off-patent; specific flow configurations and reactor designs from Corning, Lonza, or academic groups may present moderate IP overlap.
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>Weighted score:</span>
                <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.55)" }}>(9.5×0.25 + 7.5×0.25 + {"{"}10-6.5{"}"} × 0.25 + {"{"}10-6.5{"}"} × 0.2) = 2.375 + 2.25 + 2.0 + 0.7 = <span style={{ color: "#6ee7b7", fontWeight: 700 }}>7.325</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Provenances drawer (slides in from right, above the blur) ── */}
      <div
        className="absolute top-0 right-0 bottom-0 z-20 flex flex-col bg-white border-l border-[#e4e4e7] shadow-2xl overflow-hidden"
        style={{
          width: 340,
          transform: provOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 340ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f3f4f6] shrink-0" style={{ background: "#f9fafb" }}>
          <div className="flex items-center gap-2">
            <Database size={13} style={{ color: "#1a5c3a" }} />
            <span className="text-[13px] font-bold text-slate-900">Provenances</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{PROVENANCES.length}</span>
          </div>
          <button onClick={() => setProvOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={13} />
          </button>
        </div>
        {/* Provenance list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
          {PROVENANCES.map(p => (
            <div key={p.id} className="rounded-xl border border-[#e4e4e7] p-3.5 flex flex-col gap-2 hover:border-[#1a5c3a]/30 hover:bg-[#fafafa] transition-all cursor-pointer">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{p.id}</span>
                <p className="text-[12px] font-bold text-slate-800 leading-snug flex-1">{p.title}</p>
                <button className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#1a5c3a] transition-colors">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M9 1h4m0 0v4m0-4L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#eff6ff", color: "#1e50a2" }}>{p.source}</span>
                <span className="text-[10px] text-slate-400">{p.year}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{p.relevance}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.snippet}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Research Workspace (Drawer → Full-screen) ───────────────────────────────

const SUGGESTED_PROMPTS = [
  "Find synthesis routes for aspirin",
  "Propose 3 routes for ibuprofen with patent check",
  "Synthesis routes for paracetamol (green chemistry)",
  "Find convergent routes for caffeine",
];

function ResearchWorkspaceModal({
  onClose, defaultTab = "research",
  preloadedMessages = [], preloadedHasResult = false,
}: {
  onClose: () => void;
  defaultTab?: "research" | "literature";
  preloadedMessages?: { role: "user" | "agent"; text: string }[];
  preloadedHasResult?: boolean;
}) {
  const [input, setInput]           = useState("");
  const [messages, setMessages]     = useState<{ role: "user" | "agent"; text: string }[]>(preloadedMessages);
  const [hasResult, setHasResult]   = useState(preloadedHasResult);
  const [expanded, setExpanded]     = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<"research" | "literature">(defaultTab);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trigger entry animation on next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setHasResult(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "agent",
        text: `Analysing synthesis routes for "${text.replace(/find synthesis routes for|propose.*?routes for|synthesis routes for/gi, "").trim()}". Generating retrosynthesis tree, literature evidence, and patent signals...`,
      }]);
    }, 900);
  };

  // Panel is always anchored right:0.
  // Only `left` animates: entry = 100vw, drawer = 38vw, expanded = 0 (full screen)
  const panelLeft = !mounted ? "100vw" : expanded ? "0px" : "38vw";

  return (
    <>
      {/* ── Backdrop: fades out when expanded, never unmounts ── */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(2px)",
          opacity: expanded ? 0 : mounted ? 1 : 0,
          pointerEvents: expanded ? "none" : "auto",
          transition: "opacity 320ms ease",
        }}
        onClick={onClose}
      />

      {/* ── Panel: right-anchored, only left animates ── */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden bg-[#f0f1f3]"
        style={{
          left: panelLeft,
          transition: "left 340ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.16)",
        }}
      >
        {/* ── Top bar (unified header with integrated free plan strip) ── */}
        <div className="shrink-0 border-b border-[#e0e0e0] bg-white">

          {/* Row 1: breadcrumb + workspace tabs + expand/close */}
          <div className="h-[48px] flex items-center justify-between px-4 gap-4">

            {/* Left: back arrow + breadcrumb */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-500 hover:text-slate-900 transition-colors group shrink-0"
            >
              <div className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-slate-400 transition-colors">
                <ChevronLeft size={14} />
              </div>
              <span className="hidden sm:inline">Deep Research</span>
              <ChevronRight size={12} className="text-slate-300 hidden sm:inline" />
              <span className="text-slate-800 font-bold">{workspaceTab === "literature" ? "Literature Workspace" : "Research Workspace"}</span>
            </button>

            {/* Centre: workspace type toggle — only visible when expanded */}
            {expanded && (
              <div className="flex items-center rounded-xl border border-[#e4e4e7] overflow-hidden bg-[#f8f8f8] shrink-0">
                <button
                  onClick={() => setWorkspaceTab("research")}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={workspaceTab === "research"
                    ? { background: "linear-gradient(135deg,#1a5c3a,#0d3d26)", color: "white" }
                    : { color: "#64748b" }}
                >
                  <FlaskConical size={12} />
                  Research Workspace
                </button>
                <div className="w-px h-5 bg-[#e4e4e7] shrink-0" />
                <button
                  onClick={() => setWorkspaceTab("literature")}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={workspaceTab === "literature"
                    ? { background: "linear-gradient(135deg,#1e50a2,#0d3266)", color: "white" }
                    : { color: "#64748b" }}
                >
                  <BookOpen size={12} />
                  Literature Workspace
                </button>
              </div>
            )}

            {/* Right: expand/collapse + close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExpanded(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
                  expanded
                    ? "bg-[#1a5c3a] text-white hover:bg-[#185c45] shadow-sm"
                    : "border border-slate-200 text-slate-600 hover:border-[#1a5c3a] hover:text-[#1a5c3a]"
                )}
              >
                {expanded ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M9 1v4h4M5 13V9H1M1 5h4V1M13 9h-4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Collapse
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Expand
                  </>
                )}
              </button>
              {!expanded && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-700 transition-all"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Free plan banner — integrated into the same header unit */}
          <div className="flex items-center justify-between px-4 py-[7px] gap-3"
            style={{ background: "#0e0e0e", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <Crown size={12} style={{ color: "#f5c842", flexShrink: 0 }} />
              <span className="text-[11px] font-semibold text-white/80 shrink-0">Free Plan Active</span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0"
                style={{ background: "rgba(245,200,66,0.18)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.30)" }}>
                Deep Research
              </span>
              <span className="w-px h-3 bg-white/15 shrink-0" />
              <span className="text-[11px] text-white/50 whitespace-nowrap">
                Molecules researched: <span className="text-white/80 font-semibold">0</span> / 20
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10.5px] font-bold shrink-0 hover:brightness-110 transition-all"
              style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.28)" }}>
              <Zap size={10} /> Upgrade
            </button>
          </div>
        </div>

        {/* ── Workspace body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Literature mode: full split-panel, no chat */}
          {workspaceTab === "literature" && <LiteratureWorkspace activeTab={workspaceTab} onTabChange={setWorkspaceTab} expanded={expanded} />}
          {workspaceTab !== "literature" && (<>

          {/* ══ LEFT: Chat panel ══ */}
          <div
            className="flex flex-col bg-white border-r border-[#e8e8e8] shrink-0"
            style={{ width: expanded ? 360 : 300, transition: "width 320ms cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0] shrink-0">
              <button className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                <History size={12} />
                History
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 ml-0.5">7</span>
              </button>
              {(messages.length > 0 || hasResult) && (
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#1a5c3a]/30 text-[10.5px] font-semibold text-[#1a5c3a] hover:bg-[#f0fdf4] transition-all shrink-0">
                  <Database size={10} /> Save to repository
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => { setMessages([]); setInput(""); setHasResult(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold text-white hover:brightness-110 transition-all shrink-0"
                style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
              >
                <Plus size={11} /> New research
              </button>
            </div>

            {/* In drawer mode, show compact workspace toggle inside chat panel */}
            {!expanded && (
              <div className="px-3 py-2 border-b border-[#f0f0f0] flex items-center gap-1 bg-[#fafafa] shrink-0">
                <button
                  onClick={() => setWorkspaceTab("research")}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                  style={workspaceTab === "research"
                    ? { background: "linear-gradient(135deg,#1a5c3a,#0d3d26)", color: "white" }
                    : { color: "#64748b" }}
                >
                  <FlaskConical size={11} /> Research
                </button>
                <button
                  onClick={() => setWorkspaceTab("literature")}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                  style={(workspaceTab as string) === "literature"
                    ? { background: "linear-gradient(135deg,#1e50a2,#0d3266)", color: "white" }
                    : { color: "#64748b" }}
                >
                  <BookOpen size={11} /> Literature
                </button>
              </div>
            )}

            {/* Messages / empty state */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-6 gap-3">
                  {workspaceTab === "research"
                    ? <FlaskConical size={40} strokeWidth={1.2} style={{ color: "#2ACB83" }} />
                    : <BookOpen size={36} strokeWidth={1.2} style={{ color: "#1e50a2" }} />
                  }
                  <div>
                    <p className="text-[14px] font-bold text-slate-900">
                      {workspaceTab === "research" ? "Retrosynthesis Agent" : "Literature Agent"}
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed max-w-[220px]">
                      {workspaceTab === "research"
                        ? "Describe your target molecule and I'll find synthesis routes, literature evidence, and patent risks."
                        : "Search any compound or reaction class. I'll surface papers, patents, and evidence ranked by relevance."
                      }
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-2 mt-1">
                    {(workspaceTab === "research" ? SUGGESTED_PROMPTS : [
                      "Literature on asymmetric hydrogenation of ketones",
                      "Patents for paracetamol synthesis routes",
                      "Evidence for green chemistry in ibuprofen production",
                      "Papers on continuous flow chemistry for APIs",
                    ]).map((p, i) => (
                      <button key={i} onClick={() => send(p)}
                        className="w-full text-left px-3 py-2.5 rounded-xl border border-[#e8e8e8] text-[11.5px] text-slate-600 hover:border-[#1a5c3a]/40 hover:bg-[#f8fdfb] hover:text-slate-900 transition-all leading-snug">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                      {m.role === "agent" && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#e3f5ec" }}>
                          <FlaskConical size={12} style={{ color: "#1a5c3a" }} />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed",
                        m.role === "user"
                          ? "bg-[#1a5c3a] text-white rounded-br-sm"
                          : "bg-[#f3f4f6] text-slate-700 rounded-bl-sm"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-[#f0f0f0]">
              <div className="flex items-end gap-2 px-3 py-2.5 rounded-2xl border border-[#e0e0e0] bg-white focus-within:border-[#1a5c3a]/60 transition-colors">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={workspaceTab === "research" ? "Ask about a synthesis route..." : "Search literature, patents, papers..."}
                  className="flex-1 resize-none text-[12px] text-slate-700 placeholder-slate-400 bg-transparent outline-none leading-relaxed"
                  style={{ minHeight: 18, maxHeight: 100 }}
                />
                <button onClick={() => send(input)} disabled={!input.trim()}
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-35"
                  style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
                  <Send size={12} className="text-white" />
                </button>
              </div>
              <p className="text-[9.5px] text-slate-400 mt-1.5 text-center">
                / for commands · Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* ══ RIGHT: Research canvas ══ */}
          <div className="flex-1 flex min-w-0 overflow-hidden relative">
            {!hasResult ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white rounded-2xl border border-[#e4e4e7] px-10 py-12 flex flex-col items-center text-center gap-3 shadow-sm max-w-[400px] w-full">
                  <Layers size={34} strokeWidth={1.2} className="text-slate-300" />
                  <p className="text-[15px] font-semibold text-slate-700">Research canvas</p>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">
                    Start a conversation on the left. Molecule structure, synthesis routes, literature, and patent risks appear here.
                  </p>
                </div>
              </div>
            ) : (
              <ResearchResultCanvas />
            )}
          </div>
          </>)}
        </div>
      </div>
    </>
  );
}

// ─── Literature Workspace — full split-panel ─────────────────────────────────

const LIT_SOURCES = [
  "All sources","PubMed","ACS","RSC","Nature","Science",
  "Wiley","Elsevier","Springer","ChemRxiv","bioRxiv","EuropePMC","MDPI","Frontiers",
];

const LIT_SUGGESTIONS = [
  "Grignard reaction mechanism selectivity",
  "ibuprofen industrial synthesis",
  "palladium catalyzed cross-coupling",
  "retrosynthetic analysis machine learning",
  "green chemistry solvent selection",
  "flow chemistry continuous manufacturing",
];

// Mock result data
const MOCK_RESULTS = [
  {
    id: 1,
    title: "Unmasking the halide effect in diastereoselective Grignard reactions applied to C4′ modified nucleoside synthesis",
    journal: "Nature Communications",
    source: "Nature",
    year: "2025",
    abstract: "Considering the potential for multiple chelation modes in the Grignard reactions discussed above, we prepared the hydroxy ketones 7–947,48, 49, with and without a Cl or F substituent and lacking the nucleobase function to better understand the influence of individual functional groups on diastereoselectivity. From a panel of organometallic reagents, we found that Grignard reagents generally gave the cleanest reaction...",
  },
  {
    id: 2,
    title: "Mechanistic insights into selectivity-determining steps in Grignard additions to carbonyl compounds",
    journal: "Journal of the American Chemical Society",
    source: "ACS",
    year: "2024",
    abstract: "The selectivity of Grignard reagents in addition reactions to carbonyl compounds has been studied extensively. We report new mechanistic evidence showing that solvent coordination and temperature both play critical roles in determining stereochemical outcome for asymmetric carbonyl substrates...",
  },
  {
    id: 3,
    title: "Chelation-controlled Grignard additions: a computational and experimental study",
    journal: "Angewandte Chemie",
    source: "Wiley",
    year: "2024",
    abstract: "Chelation control in organomagnesium additions has long been exploited for diastereoselective synthesis. Here we combine DFT calculations with experimental validation to map the energy landscape of competing transition states across a range of substrate classes...",
  },
  {
    id: 4,
    title: "Solvent effects on regioselectivity of Grignard reagents toward α,β-unsaturated carbonyl systems",
    journal: "Chemical Science",
    source: "RSC",
    year: "2023",
    abstract: "We systematically investigate how solvent polarity and donor number influence the 1,2- vs 1,4-selectivity of Grignard reagents reacting with enones. THF, Et2O, and toluene afford markedly different product ratios, consistent with solvent-dependent aggregation states of the organomagnesium species...",
  },
  {
    id: 5,
    title: "Flow chemistry approaches to scalable Grignard reactions: safety, selectivity, and scale",
    journal: "Organic Process Research & Development",
    source: "ACS",
    year: "2023",
    abstract: "Continuous flow processing offers significant advantages for exothermic Grignard formations, enabling precise temperature control and rapid mixing. This work demonstrates kilogram-scale synthesis of a pharmaceutical intermediate with improved selectivity compared to batch processing...",
  },
];

function LiteratureWorkspace({ activeTab, onTabChange, expanded }: { activeTab: "research" | "literature"; onTabChange: (t: "research" | "literature") => void; expanded: boolean }) {
  const [query, setQuery]         = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [source, setSource]       = useState("All sources");
  const [fromYear, setFromYear]   = useState("1990");
  const [toYear, setToYear]       = useState("2025");
  const [sortBy, setSortBy]       = useState<"Relevance"|"Newest"|"Oldest">("Relevance");
  const [results, setResults]     = useState<typeof MOCK_RESULTS>([]);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [searching, setSearching] = useState(false);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    setActiveQuery(q);
    setSearching(true);
    setResults([]);
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setSearching(false);
    }, 700);
  };

  const handleSearch = () => runSearch(query);
  const handleSuggest = (s: string) => { setQuery(s); runSearch(s); };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* ── LEFT 30%: Filter panel ── */}
      <div className="w-[300px] xl:w-[320px] shrink-0 flex flex-col bg-white border-r border-[#e8e8e8] overflow-y-auto">

        {/* History + New row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] shrink-0">
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <History size={12} /> History
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 ml-0.5">7</span>
          </button>
          <button
            onClick={() => { setQuery(""); setActiveQuery(""); setResults([]); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
          >
            <Plus size={11} /> New
          </button>
        </div>

        {/* Compact workspace toggle — only in drawer mode (expanded has it in top bar) */}
        {!expanded && (
          <div className="px-3 py-2 border-b border-[#f0f0f0] flex items-center gap-1 bg-[#fafafa] shrink-0">
            <button
              onClick={() => onTabChange("research")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
              style={activeTab === "research"
                ? { background: "linear-gradient(135deg,#1a5c3a,#0d3d26)", color: "white" }
                : { color: "#64748b" }}
            >
              <FlaskConical size={11} /> Research
            </button>
            <button
              onClick={() => onTabChange("literature")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
              style={activeTab === "literature"
                ? { background: "linear-gradient(135deg,#1e50a2,#0d3266)", color: "white" }
                : { color: "#64748b" }}
            >
              <BookOpen size={11} /> Literature
            </button>
          </div>
        )}

        {/* Filter content */}
        <div className="flex flex-col gap-5 px-4 py-5">

          {/* Search bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#e0e0e0] bg-white focus-within:border-[#1a5c3a]/50 transition-colors">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Reaction, compound, concept, or author..."
                className="flex-1 text-[12.5px] text-slate-700 placeholder-slate-400 bg-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-semibold hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              <Search size={13} /> Search
            </button>
          </div>

          {/* Sources */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">SOURCES</p>
            <div className="flex flex-wrap gap-1.5">
              {LIT_SOURCES.map(s => (
                <button key={s} onClick={() => setSource(s)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150"
                  style={source === s
                    ? { borderColor: "#1a5c3a", color: "#1a5c3a", background: "#f0fdf4", fontWeight: 600 }
                    : { borderColor: "#e0e0e0", color: "#64748b", background: "white" }
                  }>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">DATE RANGE</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">From</span>
              <input value={fromYear} onChange={e => setFromYear(e.target.value)}
                className="w-16 px-2 py-1.5 rounded-lg border border-[#e0e0e0] text-[12px] text-slate-700 text-center outline-none focus:border-[#1a5c3a]/50 transition-colors" />
              <span className="text-[12px] text-slate-500">To</span>
              <input value={toYear} onChange={e => setToYear(e.target.value)}
                className="w-16 px-2 py-1.5 rounded-lg border border-[#e0e0e0] text-[12px] text-slate-700 text-center outline-none focus:border-[#1a5c3a]/50 transition-colors" />
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">SORT BY</p>
            <div className="flex items-center gap-1.5">
              {(["Relevance","Newest","Oldest"] as const).map(opt => (
                <button key={opt} onClick={() => setSortBy(opt)}
                  className="flex-1 py-1.5 rounded-lg text-[11.5px] font-medium border transition-all duration-150"
                  style={sortBy === opt
                    ? { borderColor: "#1a5c3a", color: "#1a5c3a", background: "#f0fdf4", fontWeight: 600 }
                    : { borderColor: "#e0e0e0", color: "#64748b", background: "white" }
                  }>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#f0f0f0]" />

          {/* Suggestions */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">TRY</p>
            <div className="flex flex-col gap-1.5">
              {LIT_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSuggest(s)}
                  className="w-full text-left px-3 py-2 rounded-xl border border-[#e8e8e8] text-[11.5px] text-slate-600 hover:border-[#1a5c3a]/40 hover:bg-[#f8fdfb] hover:text-[#1a5c3a] transition-all leading-snug">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT 70%: Results panel ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f0f1f3]">
        {searching ? (
          /* Loading state */
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#1a5c3a] border-t-transparent animate-spin" />
              <p className="text-[13px] text-slate-500">Searching literature...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl border border-[#e4e4e7] px-10 py-12 flex flex-col items-center text-center gap-3 shadow-sm max-w-[420px] w-full">
              <BookOpen size={34} strokeWidth={1.2} className="text-slate-300" />
              <p className="text-[15px] font-semibold text-slate-700">Literature results</p>
              <p className="text-[12.5px] text-slate-400 leading-relaxed">
                Apply filters and hit Search. Papers, patents, and evidence ranked by relevance appear here.
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Results header */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13.5px] text-slate-700">
                <span className="font-normal">{results.length} results for </span>
                <span className="font-bold">&ldquo;{activeQuery}&rdquo;</span>
              </p>
              <button
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1a5c3a]/30 text-[12.5px] font-semibold hover:bg-[#f0fdf4] transition-colors"
                style={{ color: "#1a5c3a" }}
              >
                ✦ Synthesize
              </button>
            </div>

            {/* Result cards */}
            {results.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">

                {/* Top row: checkbox + dot + title + external link */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 shrink-0 accent-[#1a5c3a] w-3.5 h-3.5 cursor-pointer" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a5c3a] shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-[14px] font-bold text-slate-900 leading-snug flex-1">
                        {r.title}
                        <span className="text-slate-400 font-normal mx-1">|</span>
                        <span className="font-semibold text-slate-700">{r.journal}</span>
                      </p>
                      <button className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#1a5c3a] transition-colors mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M9 1h4m0 0v4m0-4L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Source + year pills */}
                <div className="flex items-center gap-2 ml-8">
                  <span className="px-2.5 py-0.5 rounded-full border border-[#1a5c3a]/25 text-[11px] font-semibold"
                    style={{ background: "#f0fdf4", color: "#1a5c3a" }}>{r.source}</span>
                  <span className="px-2.5 py-0.5 rounded-full border border-[#e0e0e0] text-[11px] font-medium text-slate-500"
                    style={{ background: "#f8f8f8" }}>{r.year}</span>
                </div>

                {/* Abstract */}
                <div className="ml-8">
                  <p className="text-[12.5px] text-slate-600 leading-relaxed">
                    {expandedRows[r.id] ? r.abstract : r.abstract.slice(0, 180) + "..."}
                  </p>
                  <button
                    onClick={() => setExpandedRows(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                    className="flex items-center gap-1 mt-1.5 text-[12px] font-semibold transition-colors"
                    style={{ color: "#1a5c3a" }}
                  >
                    <ChevronDown size={13} className={cn("transition-transform duration-200", expandedRows[r.id] ? "rotate-180" : "")} />
                    {expandedRows[r.id] ? "Show less" : "Show more"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 ml-8 pt-1 border-t border-[#f3f4f6]">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[11.5px] font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all">
                      <BookOpen size={12} /> Read paper
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[11.5px] font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all">
                      <FlaskConical size={12} /> Extract conditions
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-[11.5px] font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all">
                    <Database size={12} /> Save to vault
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeepResearchRepository() {
  const [demo, setDemo]             = useState<DemoState>("day0");
  const [plan]                      = useState<PlanState>("free");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen]   = useState(false);
  const [workspaceDefaultTab, setWorkspaceDefaultTab] = useState<"research"|"literature">("research");

  return (
    <>
      {upgradeOpen    && <UpgradeModal          onClose={() => setUpgradeOpen(false)} />}
      {howItWorksOpen && <HowItWorksModal        onClose={() => setHowItWorksOpen(false)} />}
      {workspaceOpen  && <ResearchWorkspaceModal onClose={() => setWorkspaceOpen(false)} defaultTab={workspaceDefaultTab} />}

      <div className="flex flex-col gap-4 pb-12 max-w-[1200px] mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-1">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
              <span>Dashboard</span>
              <ChevronRight size={12} />
              <span className="text-[#020202] font-medium">Deep Research</span>
            </nav>
            <h1 className="text-[22px] font-semibold text-[#020202] mt-1">Deep Research</h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5 max-w-[500px] leading-[19px]">
              Search any molecule or CAS number to uncover synthesis routes, reaction conditions, patent intelligence, and literature evidence — ranked, connected, and ready to act on.
            </p>
          </div>
          <div className="shrink-0 sm:mt-7">
            <button
              onClick={() => { setWorkspaceDefaultTab("research"); setWorkspaceOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              Get started with new research <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Free plan banner ── */}
        {plan === "free" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border border-[#c9a227]/40">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.40)" }}>
                <Crown size={13} style={{ color: "#f5c842" }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[12.5px] font-semibold text-white">Free Plan Active</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#020202]"
                    style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
                    Deep Research
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-[11.5px] text-white/60">
                    Molecules researched: <span className="text-[#f5c842] font-semibold">0 / 20</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-bold text-[#020202] whitespace-nowrap transition-all hover:brightness-110"
              style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}
            >
              <Zap size={12} /> Upgrade to Premium
            </button>
          </div>
        )}

        {/* ── Demo switcher ── */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
          <span className="text-[9.5px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Demo</span>
          <div className="flex items-center gap-1 flex-wrap">
            {([
              { key: "day0",     label: "Day 0 — No Research Done" },
              { key: "searched", label: "After First Search" },
            ] as { key: DemoState; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDemo(key)}
                className={cn(
                  "px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
                  demo === key ? "bg-[#020202] text-white" : "text-[#6b7280] hover:bg-[#f0f0f0]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {demo === "day0"
          ? <Day0State
              onLearnMore={() => setHowItWorksOpen(true)}
              onUpgrade={() => setUpgradeOpen(true)}
              onOpenWorkspace={() => { setWorkspaceDefaultTab("research"); setWorkspaceOpen(true); }}
              onOpenLiterature={() => { setWorkspaceDefaultTab("literature"); setWorkspaceOpen(true); }}
            />
          : <SearchedState
              onLearnMore={() => setHowItWorksOpen(true)}
              onUpgrade={() => setUpgradeOpen(true)}
              onOpenWorkspace={() => { setWorkspaceDefaultTab("research"); setWorkspaceOpen(true); }}
              onOpenLiterature={() => { setWorkspaceDefaultTab("literature"); setWorkspaceOpen(true); }}
            />
        }

      </div>
    </>
  );
}
