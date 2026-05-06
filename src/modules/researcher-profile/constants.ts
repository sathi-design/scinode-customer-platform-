// ─── Researcher / CRO Profile — Constants ────────────────────────────────────

// ── Institution dropdown ──────────────────────────────────────────────────────
export const INSTITUTION_OPTIONS = [
  // CSIR Labs
  "NCL (Pune)",
  "IICT (Hyderabad)",
  "NPL (New Delhi)",
  "CDRI (Lucknow)",
  "NIIST (Thiruvananthapuram)",
  // IIT Network
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Hyderabad",
  "IIT Guwahati",
  // IISER Network
  "IISER Pune",
  "IISER Kolkata",
  "IISER Bhopal",
  "IISER Mohali",
  "IISER TVM",
  // Premier Indian Institutes
  "IISc (Bengaluru)",
  "ICT (Mumbai)",
  "JNCASR (Bengaluru)",
  "TIFR (Mumbai)",
  "Bose Institute (Kolkata)",
  // NIPER Network
  "NIPER Mohali",
  "NIPER Hyderabad",
  // Research Centers
  "NCCS (Pune)",
  "DBT (Government of India)",
  // USA
  "MIT",
  "Stanford",
  "Harvard",
  "UC Berkeley",
  "Caltech",
  // UK
  "Oxford",
  "Cambridge",
  "Imperial College London",
  // Germany
  "Max Planck Society",
  "TUM",
  // Switzerland
  "ETH Zurich",
  // Singapore
  "NUS",
  "NTU",
  // Japan
  "University of Tokyo",
  "Kyoto University",
  // Other
  "Other (Type your institution)",
] as const;

// ── Execution Capabilities ────────────────────────────────────────────────────
export const EXECUTION_CAPABILITIES = [
  "Feasibility",
  "Proof of concept / early-stage validation",
  "Optimization",
  "Process improvement & yield enhancement",
  "Scale-up",
  "Lab to pilot / production scale",
  "Technology Transfer",
  "Ready for commercialization",
] as const;

// ── Industries ────────────────────────────────────────────────────────────────
export const INDUSTRIES = [
  "Agrochemicals",
  "Beauty & Personal Care",
  "Dyes and Pigments",
  "Elemental Derivatives",
  "Flame Retardants",
  "Flavors & Fragrances",
  "Food & Nutrition",
  "Industrial Chemicals",
  "Metallurgy Chemicals",
  "Oleochemicals",
  "Pharmaceutical",
] as const;

// ── Preferred Engagement ──────────────────────────────────────────────────────
export const PREFERRED_ENGAGEMENT = [
  "Advisory / Consulting",
  "Fixed Scope Projects",
  "Milestone-Based Projects",
  "Dedicated Monthly Collaboration",
  "Joint Development",
  "Technology Licensing",
] as const;

// ── TRL Levels (Technology Readiness Levels) ──────────────────────────────────
export const TRL_LEVELS = [
  "1 - Basic Research",
  "2 - Technology Concept",
  "3 - Experimental Proof",
  "4 - Technology Validation",
  "5 - Technology Development",
  "6 - Technology Demonstration",
  "7 - System Prototype",
  "8 - System Complete",
  "9 - Commercial Deployment",
] as const;

// ── Patent / IP status ────────────────────────────────────────────────────────
export const PATENT_STATUS_OPTIONS = [
  "None",
  "Filed",
  "Published",
  "Granted",
] as const;

export const IP_STATUS_OPTIONS = [
  "Published",
  "Filed",
  "Granted",
  "Pending",
] as const;

// ── Project types ─────────────────────────────────────────────────────────────
export const PROJECT_TYPES = ["DST-TSDP", "ONGOING", "COMPLETED"] as const;

// ── Patent domains ────────────────────────────────────────────────────────────
export const PATENT_DOMAINS = [
  "Chemical Sciences",
  "Materials",
  "Pharmaceutical",
  "Biotechnology",
  "Engineering",
  "Environmental",
  "Food & Agriculture",
  "Other",
] as const;

// ── TABS config for ResearcherProfileSetup ────────────────────────────────────
export const RESEARCHER_TABS = [
  {
    id: "profile",
    label: "Profile",
    step: "PROFILE",
    subtitle:
      "A complete profile builds trust and helps potential collaborators understand your expertise.",
  },
  {
    id: "capabilities",
    label: "Industrial Capabilities",
    step: "CAPABILITIES",
    subtitle:
      "Specify your R&D stages, industries, and engagement preferences to attract the right projects.",
  },
  {
    id: "track",
    label: "Track Record",
    step: "TRACK RECORD",
    subtitle:
      "Showcase your technologies, projects, patents, and publications to demonstrate real-world impact.",
  },
  {
    id: "compliance",
    label: "Compliance & Declaration",
    step: "COMPLIANCE",
    subtitle:
      "Review and accept the platform terms before submitting your profile for verification.",
  },
] as const;

export type ResearcherTabId = (typeof RESEARCHER_TABS)[number]["id"];

// ── Certification categories (matches Manufacturer module) ───────────────────
export const CERT_CATEGORIES = [
  {
    id: "basic-regulatory",
    label: "Basic Regulatory License",
    pills: [
      "CFE / CTE", "Factory License", "Fire NOC", "CFO / CTO",
      "EC", "Insurance", "Labour License", "ESI",
    ],
  },
  {
    id: "product-licenses",
    label: "Product Licenses",
    pills: ["CIB", "Drug Licence", "HALAL", "KOSHER", "REACH", "FSSAI", "DMF"],
  },
  {
    id: "reagent-hazardous",
    label: "Reagent & Hazardous Chemical Handling",
    pills: [
      "PESO (Class A Solvents)", "Chlorine Storage", "Ammonia Storage",
      "Carbon Disulphide Storage", "Hydrogen Storage", "Narcotics Handling",
      "Cyanide Storage", "Phosgene Storage", "Ethanol Storage",
      "NDPS", "Methanol Storage", "Explosive Licences",
    ],
  },
  {
    id: "factory-accreditation",
    label: "Factory / Process Accreditation",
    pills: [
      "ISO 9001", "ISO 14001", "ISO 45001", "ISO 50001",
      "WHO GMP", "STATE GMP", "STATE FDA", "UK GMP", "EU GMP",
      "USFDA", "CDSCO", "PMDA", "ANVISA", "COFEPRIS", "EDQM",
    ],
  },
  {
    id: "esg-accreditation",
    label: "ESG Accreditation",
    pills: [
      "EcoVadis - Gold Certification", "EcoVadis - Silver Certification",
      "EcoVadis - Bronze Certification", "Responsible Care Logo",
    ],
  },
] as const;
