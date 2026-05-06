// ─── Independent CRO Profile — Constants ─────────────────────────────────────

// ── Engagement Models ─────────────────────────────────────────────────────────
export const CRO_MODEL_TYPES = [
  "Project-Based Engagements",
  "Fee-For-Service (FFS)",
  "Consultation",
  "Milestone-Based Collaborations",
  "Clinical Trial Program–Based Contracts",
  "Long-Term Research Partnerships",
  "Hybrid Engagement Models",
  "FTE (Full Time Equivalent)",
  "Custom Research Engagement",
] as const;

// ── Employee ranges ────────────────────────────────────────────────────────────
export const CRO_EMPLOYEE_RANGES = [
  "1–10",
  "11–25",
  "26–50",
  "51–100",
  "101–250",
  "251–500",
  "501–1000",
  "1000+",
] as const;

// ── Industries ────────────────────────────────────────────────────────────────
export const CRO_INDUSTRIES = [
  "Pharmaceutical",
  "Flavors & Fragrances",
  "Industrial Chemicals",
  "Agrochemicals",
  "Beauty & Personal Care",
  "Food & Nutrition",
  "Dyes and Pigments",
  "Oleochemicals",
  "Flame Retardants",
  "Metallurgy Chemicals",
  "Elemental Derivatives",
] as const;

// ── Product MOQ Units ─────────────────────────────────────────────────────────
export const CRO_MOQ_UNITS = ["g", "Kg", "MT", "L", "mL"] as const;

export const CRO_INVENTORY_STATUS = ["In Inventory", "Made to Order"] as const;

// ── GST / VAT ─────────────────────────────────────────────────────────────────
export const CRO_GST_OPTIONS = [
  "GST Registered",
  "VAT Registered",
  "GST + VAT",
  "Exempt",
  "Not Applicable",
] as const;

// ── MOC Options ───────────────────────────────────────────────────────────────
export const CRO_MOC_OPTIONS = [
  "Mild Steel (MS)",
  "Mild Steel Glass Lined (MSGL)",
  "PP",
  "HDPE",
  "SS316",
  "SS316L",
  "SS304",
  "Hastelloy C-22",
  "Hastelloy C-24",
  "PP-FRP",
  "MS-Rubber Lined",
  "MS-Brick Lined",
  "Tefzel",
  "Ceramic",
  "PVDF",
  "MS-PFA Lined",
  "PVC",
  "Carbon Steel (CS)",
  "SS",
  "MS-Charcoal",
] as const;

// ── Lab Equipment (full 80-item list) ─────────────────────────────────────────
export const CRO_LAB_EQUIPMENT_FULL = [
  "GC (Gas Chromatography)",
  "HPLC (High-Performance Liquid Chromatography)",
  "NMR (Nuclear Magnetic Resonance, e.g. 400 MHz)",
  "IR (Infrared Spectroscopy)",
  "GC Head Space",
  "Ultra Performance Liquid Chromatography",
  "Automatic Karl Fischer Titrator (Volumetric and Coulometric)",
  "Automatic Potentiometer Titrator",
  "Oven (Hot Air, Vacuum, or Drying)",
  "Particle Size Analyser (Malvern/Laser Diffraction)",
  "UV Spectrophotometer",
  "Potentiometry",
  "UPLC (Ultra-Performance Liquid Chromatography)",
  "FTIR (Fourier Transform Infrared Spectrometer)",
  "Muffle Furnace",
  "COD Digestor (Chemical Oxygen Demand)",
  "Moisture Analyzer",
  "Colony Counter (Automated)",
  "TOC Analyzer (Total Organic Carbon)",
  "LCMS (LC-MS/MS)",
  "Bulk and Tapped Density Tester",
  "Conductivity and TDS Meter",
  "GC-MS (GC-MS/MS)",
  "High-Resolution Mass Spectrometry (HRMS/LC-QTOF)",
  "Ion Chromatography (IC)",
  "Polarimeter (for Chiral Confirmation)",
  "Zeta Potential Analyzer",
  "Dissolution Testing Apparatus (USP Type I, II, III, and IV)",
  "Thermal Gravimetric Analysis (TGA)",
  "Differential Scanning Calorimetry (DSC)",
  "Autoclave (Steam Sterilizer)",
  "Incubator (CO2, BOD, Shaking, or Bacterial)",
  "Deep Freezer (-20°C, -40°C, and -80°C)",
  "Centrifuge (High Speed, Refrigerated, or Ultracentrifuge)",
  "Vortex Mixer",
  "ELISA Reader and Washer",
  "Laminar Flow Hood / Biosafety Cabinet (HEPA Filtered)",
  "pH Meter (Benchtop or Handheld)",
  "Homogenizer (Bead Mill, High Pressure, or High Shear)",
  "Magnetic Hot Plate Stirrer",
  "Water Bath (Digital or Circulating)",
  "Water Distillation Unit / Distilled Water Plant",
  "Analytical Balance (High Precision/Motorized)",
  "Bunsen Burner",
  "Microscope (Optical, Electron, Binocular, Confocal, or Fluorescence)",
  "RT-PCR / Thermocycler",
  "Franz Diffusion Cell (Vertical or Jacketed)",
  "Tablet Hardness Tester",
  "Friability Tester",
  "Tablet Disintegration Tester",
  "Melting Point Apparatus",
  "Osmometer",
  "Liquid Scintillation Counter (LSC)",
  "Radio-Detector for HPLC",
  "Quantitative Whole Body Autoradiography (QWBA)",
  "Flow Chemistry Reactor System",
  "Reaction Calorimeter",
  "High Shear Granulator",
  "Fluidized Bed Dryer",
  "Kjeldahl Digestor",
  "Rotary Evaporator",
  "Vacuum Pump",
  "Ultrasonic Bath / Sonicator",
  "Microwave Synthesizer / Digester",
  "Nitrogen Evaporator",
  "X-Ray Powder Diffraction (XRPD / XRD)",
  "Digital Refractometer",
  "Rheometer / Viscometer",
  "Colorimeter",
  "Fluorometer / Spectrofluorometer",
  "Discrete Analyzer",
  "Jar Test Equipment / Flocculation Tester",
  "Stability Chambers / Environmental Test Chambers",
  "Glove Box",
  "Inhalation Exposure System / Aerosol Inhalation Chamber",
  "Amino Acid Analysis System",
  "Hyperspectral Image Analysis System",
  "Automated Liquid Handler / Robotic Sample Processor",
  "Next-Generation Sequencer (NGS)",
  "Inoculating Loop",
  "Desiccator",
  "Heating Mantle",
  "Fume Hood",
  "Other",
] as const;

// ── Certifications (5 categories) ────────────────────────────────────────────
export const CRO_CERT_CATEGORIES = [
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

// ── Profile tabs ──────────────────────────────────────────────────────────────
export const CRO_TABS = [
  { id: "company",   label: "Company Profile",          step: "COMPANY"   },
  { id: "products",  label: "Products",                 step: "PRODUCTS"  },
  { id: "certs",     label: "License & Certifications", step: "CERTS"     },
  { id: "services",  label: "Services & Capabilities",  step: "SERVICES"  },
  { id: "equipment", label: "Equipments",               step: "EQUIPMENT" },
  { id: "facility",  label: "Facility & EHS",           step: "FACILITY"  },
  { id: "utility",   label: "Utility",                  step: "UTILITY"   },
  { id: "terms",     label: "Terms & Conditions",       step: "TERMS"     },
] as const;

export type CROTabId = (typeof CRO_TABS)[number]["id"];

// ── "Why Details Matter" per tab ──────────────────────────────────────────────
export const CRO_WHY_MATTERS: Record<CROTabId, { heading: string; body: string }> = {
  company:   { heading: "Why details matter?", body: "A complete profile builds trust and helps buyers understand who you are at a glance." },
  products:  { heading: "Why details matter?", body: "Adding your products boosts visibility and helps you attract more relevant leads." },
  certs:     { heading: "Why details matter?", body: "Showcasing your credentials builds credibility and reassures potential buyers." },
  services:  { heading: "Why details matter?", body: "Clearly defining your services enables better project matchmaking and increases the likelihood of high-quality inquiries." },
  equipment: { heading: "Why details matter?", body: "Highlighting your equipment improves your chances of being discovered by buyers worldwide." },
  facility:  { heading: "Why details matter?", body: "Sharing your safety and compliance practices builds buyer confidence and sets you apart." },
  utility:   { heading: "Why details matter?", body: "Detailing your utilities helps buyers understand your operational strength and readiness." },
  terms:     { heading: "Why details matter?", body: "Completing your agreement confirms your commitment and activates your profile." },
};
