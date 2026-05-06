// ─── Shared project data — used by listing AND detail pages ───────────────────
// Project 1 is the canonical Vitamin D3 project with exact content.
// Projects 2–20 follow the same schema with generated chemical/pharma data.

export type BadgeType = "Exclusive" | "CMO" | "RFQ" | "Tech Transfer" | "Open";

export interface ProjectDetail {
  id: number;
  // Card / listing fields
  image: string;
  badge: BadgeType | null;
  industry: string;
  title: string;
  description: string;
  // Header meta
  projectId: string;
  postedDate: string;
  status: string;
  // Specification
  targetMolecule: string;
  cas: string;
  specType: string;
  // Overview
  engagementType: string;
  timeline: string;
  quantity: string;
  purity: string;
  productForm: string;
  // Full description
  fullDescription: string;
  // Manufacturing scope
  scopeOfWork: string[];
  deliverables: string[];
  // Facility
  facilityCertifications: string[];
  requiredEquipment: string[];
  minBatchCapacity: string;
  // Documents
  documents: Array<{ name: string }>;
  // Right panel
  requirements: Array<{ label: string; value: string }>;
  attachedDocs: Array<{ name: string }>;
}

const PROJECT_IMAGES = Array.from({ length: 18 }, (_, i) => `/images/projects/project-${i + 1}.png`);

export const ALL_PROJECTS: ProjectDetail[] = [
  // ── 1: Vitamin D3 (canonical) ─────────────────────────────────────────────
  {
    id: 1,
    image: PROJECT_IMAGES[0],
    badge: "CMO",
    industry: "Nutraceuticals",
    title: "Manufacturing of a Vitamin D3 Intermediate for Nutraceutical Applications",
    description: "Technology transfer of an existing process for a Vitamin D3 intermediate used in nutraceutical formulations.",
    projectId: "PRJ-2026-0603",
    postedDate: "April 9, 2026",
    status: "Open for Proposal",
    targetMolecule: "Vitamin D3 Intermediate VD-07",
    cas: "67-97-0",
    specType: "Nutraceuticals",
    engagementType: "CMO Tech Transfer",
    timeline: "6–8 weeks",
    quantity: "25 kg (initial batch), followed by repeat orders based on performance",
    purity: "≥ 99%",
    productForm: "White to off-white powder",
    fullDescription:
      "Technology transfer of an existing process for a Vitamin D3 intermediate used in nutraceutical formulations. The selected CMO partner will be responsible for understanding the transferred process, executing pilot batches, and scaling up production while maintaining quality and consistency.",
    scopeOfWork: [
      "Pilot batch execution",
      "Process scale-up",
      "Quality testing as per specifications",
      "Commercial batch manufacturing",
    ],
    deliverables: [
      "Pilot batch report",
      "Batch Manufacturing Records (BMR)",
      "Certificate of Analysis (CoA)",
      "Final product meeting quality specs",
    ],
    facilityCertifications: ["GMP certified facility"],
    requiredEquipment: [
      "Reactors (50–200 L)",
      "Filtration and drying setup",
      "Basic analytical instruments (HPLC/GC)",
    ],
    minBatchCapacity: "10 kg",
    documents: [
      { name: "Process Document" },
      { name: "Analytical Method" },
      { name: "Safety Data Sheet (SDS)" },
    ],
    requirements: [
      { label: "Product Form", value: "White to off-white powder" },
      { label: "Purity", value: "≥ 99%" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 2: Kinase inhibitor scaffold ──────────────────────────────────────────
  {
    id: 2,
    image: PROJECT_IMAGES[1],
    badge: "CMO",
    industry: "Pharmaceutical",
    title: "Custom synthesis of novel kinase inhibitor scaffold",
    description: "Requires stereoselective hydrogenation at multi-gram scale with chiral HPLC analysis.",
    projectId: "PRJ-2026-0421",
    postedDate: "March 22, 2026",
    status: "Open for Proposal",
    targetMolecule: "Chiral Pyrrolopyrimidine Scaffold KI-14",
    cas: "1422955-31-4",
    specType: "Pharmaceutical Intermediate",
    engagementType: "CMO",
    timeline: "10–12 weeks",
    quantity: "50 g (pilot), scalable to 2 kg",
    purity: "≥ 98% ee",
    productForm: "Off-white solid",
    fullDescription:
      "Synthesis of a novel kinase inhibitor scaffold via stereoselective hydrogenation. The CMO partner must demonstrate capability in asymmetric synthesis and provide comprehensive chiral HPLC analysis at each synthetic step. The process must comply with ICH Q7 GMP guidelines.",
    scopeOfWork: [
      "Asymmetric synthesis route execution",
      "Chiral HPLC method development",
      "Pilot batch (50 g) with full documentation",
      "Scale-up feasibility report",
    ],
    deliverables: [
      "Synthetic route report",
      "Chiral HPLC analytical data",
      "CoA and impurity profile",
      "Scale-up recommendation",
    ],
    facilityCertifications: ["cGMP (ICH Q7)", "ISO 9001"],
    requiredEquipment: [
      "Chiral HPLC system",
      "High-pressure hydrogenation vessel (≥ 10 bar)",
      "Asymmetric synthesis glassware",
    ],
    minBatchCapacity: "50 g",
    documents: [
      { name: "Synthetic Route Document" },
      { name: "Chiral HPLC Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Enantiomeric Excess", value: "≥ 98% ee" },
      { label: "Product Form", value: "Off-white solid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 3: Specialty surfactant series ────────────────────────────────────────
  {
    id: 3,
    image: PROJECT_IMAGES[2],
    badge: "RFQ",
    industry: "Industrial Chemicals",
    title: "Large-scale production of specialty surfactant series",
    description: "Batch scale-up from 50 g to 200 kg with full regulatory support documentation.",
    projectId: "PRJ-2026-0389",
    postedDate: "March 10, 2026",
    status: "Open for Proposal",
    targetMolecule: "Alkyl Polyglucoside (APG C8-C10)",
    cas: "68515-73-1",
    specType: "Industrial Surfactant",
    engagementType: "RFQ – Scale-up",
    timeline: "4–6 weeks",
    quantity: "200 kg per batch, 3 batches initially",
    purity: "≥ 97%",
    productForm: "Clear viscous liquid",
    fullDescription:
      "Scale-up of a bio-based alkyl polyglucoside surfactant from laboratory scale (50 g) to commercial batch (200 kg). The supplier must provide full regulatory documentation including REACH registration support and Safety Data Sheets compliant with GHS standards.",
    scopeOfWork: [
      "Process transfer and optimisation at 200 kg scale",
      "Quality consistency testing across 3 batches",
      "REACH documentation preparation",
      "Packaging and logistics support",
    ],
    deliverables: [
      "Batch production records",
      "REACH technical dossier",
      "CoA for each batch",
      "GHS-compliant SDS",
    ],
    facilityCertifications: ["ISO 9001", "REACH Registered"],
    requiredEquipment: [
      "Reactor ≥ 500 L",
      "Vacuum distillation unit",
      "pH and viscosity analytical setup",
    ],
    minBatchCapacity: "200 kg",
    documents: [
      { name: "Process Specification" },
      { name: "REACH Pre-registration" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Purity", value: "≥ 97%" },
      { label: "Product Form", value: "Clear viscous liquid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 4: Fragrance intermediate tech transfer ───────────────────────────────
  {
    id: 4,
    image: PROJECT_IMAGES[3],
    badge: "Tech Transfer",
    industry: "Flavors & Fragrances",
    title: "Transfer of fragrance intermediate manufacturing process",
    description: "Established bench-scale process needs transfer to cGMP pilot plant with full validation.",
    projectId: "PRJ-2026-0312",
    postedDate: "February 28, 2026",
    status: "Open for Proposal",
    targetMolecule: "Hedione (Methyl Dihydrojasmonate)",
    cas: "24851-98-7",
    specType: "Fragrance Intermediate",
    engagementType: "Tech Transfer",
    timeline: "8–10 weeks",
    quantity: "10 kg (validation batch), 100 kg (commercial)",
    purity: "≥ 98%",
    productForm: "Colourless to pale yellow liquid",
    fullDescription:
      "An established bench-scale synthesis for Hedione (Methyl Dihydrojasmonate) requires technology transfer to a cGMP-compliant pilot plant. The CMO must validate the process, maintain the sensory profile of the fragrance material, and document all steps for regulatory submission.",
    scopeOfWork: [
      "Process understanding and gap analysis",
      "Pilot plant validation batch",
      "Sensory quality evaluation",
      "Regulatory documentation for IFRA compliance",
    ],
    deliverables: [
      "Process validation report",
      "Sensory evaluation data",
      "CoA with GC purity analysis",
      "IFRA compliance documentation",
    ],
    facilityCertifications: ["cGMP", "IFRA compliant"],
    requiredEquipment: [
      "Pilot reactor (100–500 L)",
      "GC-MS analytical instrument",
      "Distillation column",
    ],
    minBatchCapacity: "10 kg",
    documents: [
      { name: "Process Description" },
      { name: "GC-MS Method" },
      { name: "IFRA Certificate" },
    ],
    requirements: [
      { label: "Purity (GC)", value: "≥ 98%" },
      { label: "Product Form", value: "Colourless to pale yellow liquid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 5: Soybean epoxidation ────────────────────────────────────────────────
  {
    id: 5,
    image: PROJECT_IMAGES[4],
    badge: "Exclusive",
    industry: "Oleochemicals",
    title: "Epoxidation of soybean oil for bio-based plasticiser development",
    description: "Requires precise control of peracid concentration and temperature for high epoxide yield.",
    projectId: "PRJ-2026-0278",
    postedDate: "February 15, 2026",
    status: "Open for Proposal",
    targetMolecule: "Epoxidised Soybean Oil (ESBO)",
    cas: "8013-07-8",
    specType: "Bio-based Plasticiser",
    engagementType: "Exclusive Manufacturing",
    timeline: "6–8 weeks",
    quantity: "500 kg (pilot), 5 MT (commercial)",
    purity: "Oxirane oxygen ≥ 6.0%",
    productForm: "Pale yellow viscous oil",
    fullDescription:
      "Epoxidation of soybean oil using peracid chemistry to produce a high-purity bio-based plasticiser (ESBO). The process requires precise temperature control (30–50°C) and peracetic acid concentration management. The product must meet EU REACH and food-contact migration requirements.",
    scopeOfWork: [
      "Peracid epoxidation process optimisation",
      "Continuous oxirane oxygen monitoring",
      "Pilot batch (500 kg) execution",
      "REACH and food-contact compliance testing",
    ],
    deliverables: [
      "Optimisation report",
      "CoA (oxirane O, iodine value, colour)",
      "REACH compliance documentation",
      "Migration test report",
    ],
    facilityCertifications: ["ISO 9001", "REACH Registered", "Food-contact approved"],
    requiredEquipment: [
      "Jacketed reactor ≥ 1000 L with temp control",
      "Peracid dosing system",
      "Oxirane oxygen analyser",
    ],
    minBatchCapacity: "500 kg",
    documents: [
      { name: "Process Specification" },
      { name: "Oxirane Analysis Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Oxirane Oxygen", value: "≥ 6.0%" },
      { label: "Product Form", value: "Pale yellow viscous oil" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 6: Azo dye intermediates ──────────────────────────────────────────────
  {
    id: 6,
    image: PROJECT_IMAGES[5],
    badge: null,
    industry: "Dyes and Pigments",
    title: "Synthesis and characterisation of reactive azo dye intermediates",
    description: "Diazotisation and coupling reactions under controlled low-temperature conditions.",
    projectId: "PRJ-2026-0255",
    postedDate: "February 5, 2026",
    status: "Open for Proposal",
    targetMolecule: "4-Amino-3-nitrobenzenesulfonic Acid Intermediate",
    cas: "616-91-1",
    specType: "Dye Intermediate",
    engagementType: "RFQ",
    timeline: "5–7 weeks",
    quantity: "100 kg (initial batch)",
    purity: "≥ 96%",
    productForm: "Orange crystalline powder",
    fullDescription:
      "Synthesis of reactive azo dye intermediates via diazotisation and coupling reactions performed at controlled sub-zero temperatures (0–5°C). The supplier must have experience in handling diazonium salts safely and provide comprehensive characterisation data.",
    scopeOfWork: [
      "Low-temperature diazotisation reaction",
      "Azo coupling with controlled pH management",
      "HPLC and UV-Vis characterisation",
      "Batch documentation and quality release",
    ],
    deliverables: [
      "Reaction completion data",
      "HPLC purity profile",
      "UV-Vis absorption data",
      "CoA with full characterisation",
    ],
    facilityCertifications: ["ISO 9001", "REACH Registered"],
    requiredEquipment: [
      "Jacketed reactor with cryogenic cooling",
      "HPLC and UV-Vis instruments",
      "pH control system",
    ],
    minBatchCapacity: "100 kg",
    documents: [
      { name: "Synthesis Procedure" },
      { name: "HPLC Analytical Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Purity (HPLC)", value: "≥ 96%" },
      { label: "Product Form", value: "Orange crystalline powder" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 7: API impurity profiling ─────────────────────────────────────────────
  {
    id: 7,
    image: PROJECT_IMAGES[6],
    badge: "CMO",
    industry: "Pharmaceutical",
    title: "API impurity profiling and forced degradation study",
    description: "ICH Q1A compliant stress testing across thermal, photolytic and hydrolytic conditions.",
    projectId: "PRJ-2026-0211",
    postedDate: "January 28, 2026",
    status: "Open for Proposal",
    targetMolecule: "Metformin HCl API",
    cas: "1115-70-4",
    specType: "API Analytical Study",
    engagementType: "CMO – Analytical",
    timeline: "4–5 weeks",
    quantity: "Analytical quantities (100 g reference standard)",
    purity: "≥ 99.5% (reference standard)",
    productForm: "White crystalline powder",
    fullDescription:
      "Forced degradation study and impurity profiling for Metformin HCl API as per ICH Q1A guidelines. The CMO must conduct stress testing under acid, base, oxidative, thermal, and photolytic conditions, identify and characterise all degradation products, and provide a complete impurity profile.",
    scopeOfWork: [
      "Forced degradation under 5 ICH conditions",
      "Degradant identification by LC-MS/MS",
      "Quantification using validated HPLC method",
      "Impurity report compilation",
    ],
    deliverables: [
      "Forced degradation study report",
      "Impurity profile with structures",
      "Validated HPLC method",
      "CoA for reference standard",
    ],
    facilityCertifications: ["GMP (ICH Q7)", "ISO/IEC 17025 (analytical)"],
    requiredEquipment: [
      "HPLC / LC-MS system",
      "UV-Vis photostability chamber",
      "Thermostatic stability ovens",
    ],
    minBatchCapacity: "100 g (analytical)",
    documents: [
      { name: "ICH Q1A Protocol" },
      { name: "HPLC Analytical Method" },
      { name: "Reference Standard CoA" },
    ],
    requirements: [
      { label: "Reference Purity", value: "≥ 99.5%" },
      { label: "Product Form", value: "White crystalline powder" },
    ],
    attachedDocs: [{ name: "Study Protocol" }, { name: "NDA Template" }],
  },

  // ── 8: Herbicide formulation ──────────────────────────────────────────────
  {
    id: 8,
    image: PROJECT_IMAGES[7],
    badge: "RFQ",
    industry: "Agro Chemical",
    title: "Technical grade herbicide formulation development and scale-up",
    description: "EC and WP formulations to be developed with stability data at accelerated conditions.",
    projectId: "PRJ-2026-0188",
    postedDate: "January 18, 2026",
    status: "Open for Proposal",
    targetMolecule: "Pendimethalin 33% EC",
    cas: "40487-42-1",
    specType: "Agro Formulation",
    engagementType: "RFQ – Formulation",
    timeline: "8–10 weeks",
    quantity: "1 MT (pilot), 10 MT (commercial)",
    purity: "Active Ingredient ≥ 33% w/v",
    productForm: "Orange-yellow emulsifiable concentrate",
    fullDescription:
      "Development and scale-up of Pendimethalin 33% EC (Emulsifiable Concentrate) herbicide formulation. The manufacturer must ensure regulatory compliance with CIB registration requirements and provide 6-month accelerated stability data. Surfactant and co-solvent selection is part of the scope.",
    scopeOfWork: [
      "Emulsifiable concentrate formulation development",
      "Emulsion stability testing (54°C/2 weeks)",
      "6-month accelerated stability study",
      "CIB registration dossier preparation",
    ],
    deliverables: [
      "Formulation development report",
      "Stability study data",
      "CIB registration dossier",
      "CoA for pilot batch",
    ],
    facilityCertifications: ["CIB Registered", "ISO 9001"],
    requiredEquipment: [
      "High-shear mixer / homogeniser",
      "Stability chambers (54°C, 40°C/75%RH)",
      "GC for active ingredient quantification",
    ],
    minBatchCapacity: "1 MT",
    documents: [
      { name: "Formulation Specification" },
      { name: "Stability Protocol" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Active Content", value: "≥ 33% w/v" },
      { label: "Product Form", value: "Emulsifiable concentrate" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "CIB Guidelines" }],
  },

  // ── 9: Low-VOC metal surface treatment ───────────────────────────────────
  {
    id: 9,
    image: PROJECT_IMAGES[8],
    badge: "Open",
    industry: "Metallurgy Chemicals",
    title: "Development of low-VOC metal surface treatment solution",
    description: "Replacement of chromate-based passivation with RoHS-compliant alternative chemistry.",
    projectId: "PRJ-2026-0165",
    postedDate: "January 8, 2026",
    status: "Open for Proposal",
    targetMolecule: "Trivalent Chromium Passivation Complex",
    cas: "7738-94-5",
    specType: "Surface Treatment Chemical",
    engagementType: "Open – Development",
    timeline: "10–14 weeks",
    quantity: "50 kg (R&D batch), 500 kg (commercial)",
    purity: "Functional grade",
    productForm: "Clear aqueous solution",
    fullDescription:
      "Development of a trivalent chromium-based passivation solution as a direct replacement for hexavalent chromate systems. The solution must comply with RoHS Directive 2011/65/EU and EU REACH restrictions. Performance validation on steel and aluminium substrates is required.",
    scopeOfWork: [
      "Trivalent Cr formulation development",
      "Salt spray and humidity corrosion testing",
      "RoHS and REACH compliance testing",
      "Application trial on steel/aluminium",
    ],
    deliverables: [
      "Formulation report",
      "Salt spray test data (ASTM B117)",
      "RoHS compliance certificate",
      "Performance comparison vs hexavalent Cr",
    ],
    facilityCertifications: ["ISO 9001", "RoHS Compliant", "REACH Registered"],
    requiredEquipment: [
      "Salt spray chamber (ASTM B117)",
      "ICP-OES for metal analysis",
      "Application dip/spray equipment",
    ],
    minBatchCapacity: "50 kg",
    documents: [
      { name: "Formulation Specification" },
      { name: "ASTM B117 Test Protocol" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Compliance", value: "RoHS / REACH" },
      { label: "Product Form", value: "Clear aqueous solution" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 10: Omega-3 encapsulation transfer ────────────────────────────────────
  {
    id: 10,
    image: PROJECT_IMAGES[9],
    badge: "Tech Transfer",
    industry: "Food & Nutrition",
    title: "Transfer of encapsulated omega-3 fatty acid production",
    description: "Spray-drying microencapsulation process from lab to industrial scale production.",
    projectId: "PRJ-2026-0140",
    postedDate: "December 20, 2025",
    status: "Open for Proposal",
    targetMolecule: "Omega-3 (EPA/DHA) Microencapsulated Powder",
    cas: "10417-94-4",
    specType: "Nutraceutical Ingredient",
    engagementType: "Tech Transfer",
    timeline: "10–12 weeks",
    quantity: "50 kg (pilot), 500 kg (commercial)",
    purity: "EPA+DHA ≥ 35% of total fatty acids",
    productForm: "Free-flowing beige powder",
    fullDescription:
      "Technology transfer of a spray-drying microencapsulation process for omega-3 (EPA+DHA) fatty acids. The encapsulation system uses modified starch and maltodextrin as wall materials. The CMO must validate spray-drying parameters, oxidative stability of the encapsulated product, and shelf-life (18 months).",
    scopeOfWork: [
      "Spray-drying parameter validation",
      "Microencapsulation efficiency determination",
      "Oxidative stability testing (Rancimat)",
      "Shelf-life study design",
    ],
    deliverables: [
      "Process validation report",
      "Encapsulation efficiency data",
      "Oxidative stability report",
      "CoA with fatty acid profile",
    ],
    facilityCertifications: ["FSSAI", "GMP", "Halal/Kosher (optional)"],
    requiredEquipment: [
      "Industrial spray dryer (≥ 10 kg/hr evaporation)",
      "GC-FID for fatty acid profiling",
      "Rancimat oxidative stability analyser",
    ],
    minBatchCapacity: "50 kg",
    documents: [
      { name: "Process Description" },
      { name: "GC-FID Analytical Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "EPA+DHA Content", value: "≥ 35% of total fatty acids" },
      { label: "Product Form", value: "Free-flowing beige powder" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 11: SPF 50+ sunscreen emulsification ─────────────────────────────────
  {
    id: 11,
    image: PROJECT_IMAGES[10],
    badge: "Exclusive",
    industry: "Beauty & Personal Care",
    title: "Novel emulsification system for water-based colour cosmetics",
    description: "HLB-balanced emulsifier blend required for sprayable SPF 50+ sunscreen formulation.",
    projectId: "PRJ-2026-0118",
    postedDate: "December 10, 2025",
    status: "Open for Proposal",
    targetMolecule: "HLB-Balanced Emulsifier Blend (O/W)",
    cas: "9005-65-6",
    specType: "Cosmetic Ingredient",
    engagementType: "Exclusive – Formulation",
    timeline: "6–8 weeks",
    quantity: "20 kg (R&D), 200 kg (commercial)",
    purity: "Cosmetic grade",
    productForm: "White to off-white waxy solid",
    fullDescription:
      "Development of an HLB-balanced emulsifier blend for use in sprayable SPF 50+ sunscreen formulations. The blend must provide stable O/W emulsions with droplet size <1 μm, be compatible with UV filters (organic and inorganic), and meet EU Cosmetics Regulation (EC) 1223/2009 requirements.",
    scopeOfWork: [
      "HLB optimisation for SPF 50+ formula",
      "Droplet size analysis (laser diffraction)",
      "UV filter compatibility testing",
      "EU Cosmetics Regulation compliance review",
    ],
    deliverables: [
      "HLB optimisation data",
      "Emulsion stability report",
      "UV filter compatibility report",
      "Regulatory compliance summary",
    ],
    facilityCertifications: ["ISO 22716 (GMP Cosmetics)", "EU Cosmetics Reg compliant"],
    requiredEquipment: [
      "High-shear homogeniser",
      "Laser diffraction particle sizer",
      "UV-Vis spectrophotometer",
    ],
    minBatchCapacity: "20 kg",
    documents: [
      { name: "Formulation Specification" },
      { name: "Emulsion Stability Protocol" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Droplet Size", value: "< 1 μm" },
      { label: "Product Form", value: "White to off-white waxy solid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 12: Chlorinated paraffin ──────────────────────────────────────────────
  {
    id: 12,
    image: PROJECT_IMAGES[11],
    badge: "CMO",
    industry: "Industrial Chemicals",
    title: "Manufacture of chlorinated paraffin under regulatory compliance",
    description: "Short-chain production with REACH SVHC documentation and analytical certification.",
    projectId: "PRJ-2026-0097",
    postedDate: "November 28, 2025",
    status: "Open for Proposal",
    targetMolecule: "Medium-chain Chlorinated Paraffin (MCCP C14-C17)",
    cas: "85535-85-9",
    specType: "Industrial Plasticiser / FR",
    engagementType: "CMO",
    timeline: "8–10 weeks",
    quantity: "2 MT (pilot), 20 MT (commercial)",
    purity: "Chlorine content 40–52% w/w",
    productForm: "Pale yellow viscous liquid",
    fullDescription:
      "Manufacture of medium-chain chlorinated paraffins (MCCP) under strict REACH compliance. The producer must provide full SVHC documentation, demonstrate chlorination process control (Cl content 40–52%), and meet colour and viscosity specifications for use in flame retardant and plasticiser applications.",
    scopeOfWork: [
      "Chlorination process optimisation",
      "Chlorine content control (40–52%)",
      "REACH SVHC documentation",
      "Flame retardancy performance testing",
    ],
    deliverables: [
      "Process optimisation report",
      "REACH SVHC dossier",
      "CoA (Cl content, viscosity, colour)",
      "Flame retardancy test data",
    ],
    facilityCertifications: ["REACH Registered", "ISO 9001", "ECHA compliant"],
    requiredEquipment: [
      "Chlorination reactor with HCl scrubbing",
      "Titration system for Cl content",
      "Viscometer and colour meter",
    ],
    minBatchCapacity: "2 MT",
    documents: [
      { name: "Chlorination Process Spec" },
      { name: "REACH Dossier" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Chlorine Content", value: "40–52% w/w" },
      { label: "Product Form", value: "Pale yellow viscous liquid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "REACH Template" }],
  },

  // ── 13: Antiviral drug intermediate ──────────────────────────────────────
  {
    id: 13,
    image: PROJECT_IMAGES[12],
    badge: null,
    industry: "Pharmaceutical",
    title: "Synthesis of advanced intermediate for antiviral drug program",
    description: "Multi-step sequence involving Buchwald-Hartwig amination and Miyaura borylation.",
    projectId: "PRJ-2026-0076",
    postedDate: "November 15, 2025",
    status: "Open for Proposal",
    targetMolecule: "Biaryl Amine Intermediate AV-23",
    cas: "Proprietary",
    specType: "Pharmaceutical Intermediate",
    engagementType: "CMO – Development",
    timeline: "12–16 weeks",
    quantity: "10 g (initial), scalable to 500 g",
    purity: "≥ 97% (HPLC)",
    productForm: "White to cream powder",
    fullDescription:
      "Multi-step synthesis of a biaryl amine intermediate for an antiviral drug candidate. The route involves Buchwald-Hartwig amination (Pd catalysis) followed by Miyaura borylation. The CMO must demonstrate experience with Pd-catalysed cross-coupling reactions and provide rigorous palladium residue testing.",
    scopeOfWork: [
      "Buchwald-Hartwig amination optimisation",
      "Miyaura borylation step",
      "Pd residue testing (ICP-MS, <10 ppm)",
      "Multi-step process documentation",
    ],
    deliverables: [
      "Synthesis report with NMR data",
      "HPLC purity profile",
      "ICP-MS Pd residue report",
      "CoA and CoC",
    ],
    facilityCertifications: ["cGMP (ICH Q7)", "ISO 9001"],
    requiredEquipment: [
      "Inert atmosphere reactor (Schlenk/glove box)",
      "ICP-MS for metal analysis",
      "NMR and HPLC instruments",
    ],
    minBatchCapacity: "10 g",
    documents: [
      { name: "Synthetic Route Document" },
      { name: "NMR Analytical Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Purity (HPLC)", value: "≥ 97%" },
      { label: "Pd Residue", value: "< 10 ppm" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 14: Bromine derivative ────────────────────────────────────────────────
  {
    id: 14,
    image: PROJECT_IMAGES[13],
    badge: "RFQ",
    industry: "Elemental Derivatives",
    title: "Custom bromine derivative for flame retardant application",
    description: "Bromination of aromatic substrate with high regioselectivity under catalytic conditions.",
    projectId: "PRJ-2026-0054",
    postedDate: "November 2, 2025",
    status: "Open for Proposal",
    targetMolecule: "Tetrabromobisphenol A (TBBPA)",
    cas: "79-94-7",
    specType: "Flame Retardant",
    engagementType: "RFQ",
    timeline: "5–7 weeks",
    quantity: "500 kg (initial), 5 MT (commercial)",
    purity: "≥ 98.5% (HPLC)",
    productForm: "White to off-white powder",
    fullDescription:
      "Catalytic bromination of bisphenol A to produce Tetrabromobisphenol A (TBBPA) with high regioselectivity (≥ 98.5% purity). The process must use a Lewis acid catalyst under controlled temperature conditions (0–10°C) to minimise polybrominated by-products and meet RoHS compliance standards.",
    scopeOfWork: [
      "Lewis acid catalytic bromination",
      "Regioselectivity optimisation",
      "Bromine content verification (ICP-OES)",
      "RoHS compliance testing",
    ],
    deliverables: [
      "Bromination optimisation report",
      "HPLC purity profile",
      "ICP-OES bromine content data",
      "RoHS certificate",
    ],
    facilityCertifications: ["ISO 9001", "REACH Registered", "RoHS Compliant"],
    requiredEquipment: [
      "Jacketed bromination reactor with cryogenic cooling",
      "ICP-OES instrument",
      "HPLC for purity analysis",
    ],
    minBatchCapacity: "500 kg",
    documents: [
      { name: "Bromination Process Spec" },
      { name: "HPLC Analytical Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Purity (HPLC)", value: "≥ 98.5%" },
      { label: "Product Form", value: "White to off-white powder" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "RoHS Checklist" }],
  },

  // ── 15: Biopesticide fermentation ─────────────────────────────────────────
  {
    id: 15,
    image: PROJECT_IMAGES[14],
    badge: "Open",
    industry: "Agro Chemical",
    title: "Scale-up of novel biopesticide fermentation and extraction",
    description: "Solid-state fermentation with downstream extraction and formulation as wettable powder.",
    projectId: "PRJ-2026-0031",
    postedDate: "October 20, 2025",
    status: "Open for Proposal",
    targetMolecule: "Bacillus thuringiensis var. israelensis Endotoxin",
    cas: "68038-71-1",
    specType: "Biopesticide",
    engagementType: "Open – Scale-up",
    timeline: "10–14 weeks",
    quantity: "100 kg spore powder (initial)",
    purity: "Biological potency ≥ 3000 ITU/mg",
    productForm: "Tan wettable powder",
    fullDescription:
      "Scale-up of solid-state fermentation (SSF) for Bacillus thuringiensis var. israelensis (Bti) endotoxin production. The CMO must optimise fermentation parameters, downstream extraction, and formulation into a wettable powder with minimum potency of 3000 ITU/mg. CIB biological pesticide registration support is required.",
    scopeOfWork: [
      "SSF parameter optimisation",
      "Downstream extraction (centrifugation + spray drying)",
      "Biological potency assay (Aedes aegypti larvae)",
      "Wettable powder formulation",
    ],
    deliverables: [
      "Fermentation optimisation report",
      "Potency assay data",
      "Formulation stability report",
      "CIB biological registration dossier",
    ],
    facilityCertifications: ["CIB Registered", "GMP Biologics"],
    requiredEquipment: [
      "Solid-state fermenter (tray / bioreactor)",
      "Spray dryer",
      "Bioassay facility (mosquito larvae)",
    ],
    minBatchCapacity: "100 kg",
    documents: [
      { name: "Fermentation Protocol" },
      { name: "Bioassay Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Biological Potency", value: "≥ 3000 ITU/mg" },
      { label: "Product Form", value: "Tan wettable powder" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "CIB Guidelines" }],
  },

  // ── 16: Enzymatic resolution ──────────────────────────────────────────────
  {
    id: 16,
    image: PROJECT_IMAGES[15],
    badge: "Tech Transfer",
    industry: "Flavors & Fragrances",
    title: "Enzymatic resolution of racemic fragrance alcohol intermediate",
    description: "Lipase-catalysed transesterification process to be transferred to kilo-lab scale.",
    projectId: "PRJ-2025-0998",
    postedDate: "October 8, 2025",
    status: "Open for Proposal",
    targetMolecule: "(R)-Linalool Acetate",
    cas: "115-95-7",
    specType: "Chiral Fragrance Ingredient",
    engagementType: "Tech Transfer",
    timeline: "8–10 weeks",
    quantity: "1 kg (validation), 10 kg (commercial)",
    purity: "≥ 97% ee (chiral GC)",
    productForm: "Colourless oily liquid",
    fullDescription:
      "Enzymatic kinetic resolution of racemic linalool acetate using Candida antarctica Lipase B (CAL-B) immobilised on Novozym 435. The process achieves ≥ 97% ee for (R)-linalool acetate with selectivity factor E > 50. Technology transfer from lab (100 mL) to kilo-lab (10 L) requires solvent and enzyme loading optimisation.",
    scopeOfWork: [
      "CAL-B enzyme loading optimisation",
      "Kilo-lab reactor validation",
      "Chiral GC ee measurement",
      "Enzyme recycling study",
    ],
    deliverables: [
      "Process validation report",
      "Chiral GC data (ee ≥ 97%)",
      "Enzyme recycling data",
      "CoA with sensory evaluation",
    ],
    facilityCertifications: ["ISO 9001", "IFRA compliant"],
    requiredEquipment: [
      "Jacketed kilo-lab reactor (10 L)",
      "Chiral GC system",
      "Enzyme immobilisation setup",
    ],
    minBatchCapacity: "1 kg",
    documents: [
      { name: "Enzyme Resolution Protocol" },
      { name: "Chiral GC Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Enantiomeric Excess", value: "≥ 97% ee" },
      { label: "Product Form", value: "Colourless oily liquid" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 17: API polymorphic crystallisation ───────────────────────────────────
  {
    id: 17,
    image: PROJECT_IMAGES[16],
    badge: "Exclusive",
    industry: "Pharmaceutical",
    title: "Development of polymorphic form II API crystallisation process",
    description: "Seeded crystallisation from mixed solvent system with strict particle size control.",
    projectId: "PRJ-2025-0965",
    postedDate: "September 25, 2025",
    status: "Open for Proposal",
    targetMolecule: "Carbamazepine Form II",
    cas: "298-46-4",
    specType: "API Polymorphic Form",
    engagementType: "Exclusive – Development",
    timeline: "10–14 weeks",
    quantity: "100 g (validation), 1 kg (commercial)",
    purity: "≥ 99.5% (HPLC), Form II confirmed by PXRD",
    productForm: "White needle-shaped crystals",
    fullDescription:
      "Development of a seeded crystallisation process to selectively produce carbamazepine Form II from a mixed ethanol/water solvent system. Process must control particle size (D90 < 150 μm), ensure polymorph purity by PXRD, and be scalable to 1 kg. Dissolution profile comparison vs Form III is required.",
    scopeOfWork: [
      "Seeded crystallisation optimisation",
      "PXRD polymorph identification",
      "Particle size control (D90 < 150 μm)",
      "Dissolution profile comparison",
    ],
    deliverables: [
      "Crystallisation process report",
      "PXRD pattern confirmation",
      "PSD data (laser diffraction)",
      "Dissolution profile report",
    ],
    facilityCertifications: ["cGMP (ICH Q7)", "ISO 9001"],
    requiredEquipment: [
      "Jacketed crystalliser with temperature ramp control",
      "PXRD instrument",
      "Laser diffraction particle sizer",
    ],
    minBatchCapacity: "100 g",
    documents: [
      { name: "Crystallisation Protocol" },
      { name: "PXRD Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Polymorph", value: "Form II (PXRD confirmed)" },
      { label: "Particle Size", value: "D90 < 150 μm" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "NDA Template" }],
  },

  // ── 18: Citric acid derivatives ───────────────────────────────────────────
  {
    id: 18,
    image: PROJECT_IMAGES[17],
    badge: "CMO",
    industry: "Food & Nutrition",
    title: "Pilot-scale production of high-purity citric acid derivatives",
    description: "Enzymatic conversion with membrane filtration and spray crystallisation finishing.",
    projectId: "PRJ-2025-0932",
    postedDate: "September 12, 2025",
    status: "Open for Proposal",
    targetMolecule: "Triethyl Citrate (TEC)",
    cas: "77-93-0",
    specType: "Food-grade Plasticiser / Flavouring",
    engagementType: "CMO",
    timeline: "6–8 weeks",
    quantity: "100 kg (pilot), 1 MT (commercial)",
    purity: "≥ 99% (GC), food grade",
    productForm: "Colourless liquid, faint odour",
    fullDescription:
      "Pilot-scale production of triethyl citrate (TEC) via esterification of citric acid with ethanol using an immobilised lipase catalyst, followed by membrane filtration for catalyst removal and spray crystallisation for product finishing. All production must comply with FDA 21 CFR and EU food additive regulations (E1505).",
    scopeOfWork: [
      "Enzymatic esterification optimisation",
      "Membrane filtration for catalyst removal",
      "Spray crystallisation / evaporation",
      "Food-grade quality testing",
    ],
    deliverables: [
      "Process optimisation report",
      "GC purity profile",
      "FDA 21 CFR compliance summary",
      "CoA for pilot batch",
    ],
    facilityCertifications: ["FSSAI", "FDA registered", "FSSC 22000"],
    requiredEquipment: [
      "Enzymatic reactor with immobilised lipase",
      "Membrane filtration unit",
      "GC for product analysis",
    ],
    minBatchCapacity: "100 kg",
    documents: [
      { name: "Esterification Process Spec" },
      { name: "GC Analytical Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Purity (GC)", value: "≥ 99%" },
      { label: "Compliance", value: "FDA 21 CFR / EU E1505" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "FDA Guidelines" }],
  },

  // ── 19: Epoxy fatty acid methyl ester ─────────────────────────────────────
  {
    id: 19,
    image: PROJECT_IMAGES[0],
    badge: "RFQ",
    industry: "Oleochemicals",
    title: "Epoxy fatty acid methyl ester batch production and QA release",
    description: "Full QC package including iodine value, epoxide oxygen content and colour measurement.",
    projectId: "PRJ-2025-0904",
    postedDate: "August 30, 2025",
    status: "Open for Proposal",
    targetMolecule: "Epoxidised Methyl Soyate (EMS)",
    cas: "68081-81-2",
    specType: "Bio-based Solvent / Plasticiser",
    engagementType: "RFQ",
    timeline: "4–6 weeks",
    quantity: "1 MT (initial), 10 MT (commercial)",
    purity: "Oxirane oxygen ≥ 5.5%, iodine value ≤ 2.0",
    productForm: "Pale yellow low-viscosity liquid",
    fullDescription:
      "Production and QA release of epoxidised methyl soyate (EMS) as a bio-based solvent and plasticiser. The peracid epoxidation process must achieve oxirane oxygen ≥ 5.5% and iodine value ≤ 2.0 as key quality indicators. Full analytical release package required including colour (APHA), acid value, and specific gravity.",
    scopeOfWork: [
      "Peracid epoxidation of methyl soyate",
      "Oxirane oxygen and iodine value optimisation",
      "Full analytical QA release testing",
      "REACH documentation",
    ],
    deliverables: [
      "Batch production record",
      "Full CoA (oxirane O, IV, APHA colour, acid value)",
      "REACH compliance summary",
      "SDS (GHS-compliant)",
    ],
    facilityCertifications: ["ISO 9001", "REACH Registered"],
    requiredEquipment: [
      "Epoxidation reactor with peracid dosing",
      "Wijs method iodine value analyser",
      "APHA colour meter",
    ],
    minBatchCapacity: "1 MT",
    documents: [
      { name: "Epoxidation Process Spec" },
      { name: "QA Release Protocol" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Oxirane Oxygen", value: "≥ 5.5%" },
      { label: "Iodine Value", value: "≤ 2.0" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "REACH Template" }],
  },

  // ── 20: Vat dye leuco compound ────────────────────────────────────────────
  {
    id: 20,
    image: PROJECT_IMAGES[1],
    badge: null,
    industry: "Dyes and Pigments",
    title: "Vat dye leuco compound synthesis for textile application",
    description: "Reduction chemistry in alkaline medium with precise redox potential monitoring.",
    projectId: "PRJ-2025-0877",
    postedDate: "August 18, 2025",
    status: "Open for Proposal",
    targetMolecule: "Indigo Leuco (Leuco Indigo Sodium Salt)",
    cas: "482-89-3",
    specType: "Textile Dye Intermediate",
    engagementType: "CMO",
    timeline: "6–8 weeks",
    quantity: "200 kg (initial), 2 MT (commercial)",
    purity: "≥ 95% leuco content (redox titration)",
    productForm: "Yellow-green paste (30% aqueous)",
    fullDescription:
      "Synthesis of indigo leuco compound via sodium dithionite reduction in alkaline NaOH medium. The process requires precise control of reduction potential (ORP < −700 mV), temperature (50–60°C), and nitrogen atmosphere to prevent re-oxidation. The leuco paste must achieve ≥ 95% conversion and be stabilised for textile dyeing application.",
    scopeOfWork: [
      "Sodium dithionite reduction optimisation",
      "ORP monitoring and control (< −700 mV)",
      "Nitrogen atmosphere maintenance",
      "Leuco content determination by redox titration",
    ],
    deliverables: [
      "Reduction process report",
      "ORP monitoring data",
      "Leuco content CoA (redox titration)",
      "Dyeing performance test on cotton",
    ],
    facilityCertifications: ["ISO 9001", "GOTS (organic textile)"],
    requiredEquipment: [
      "Inerted reduction vessel with ORP probe",
      "Nitrogen blanketing system",
      "Redox titration setup",
    ],
    minBatchCapacity: "200 kg",
    documents: [
      { name: "Reduction Process Spec" },
      { name: "Redox Titration Method" },
      { name: "Safety Data Sheet" },
    ],
    requirements: [
      { label: "Leuco Content", value: "≥ 95% (redox titration)" },
      { label: "Product Form", value: "Yellow-green paste (30% aq.)" },
    ],
    attachedDocs: [{ name: "Project Brief" }, { name: "GOTS Certificate" }],
  },
];

/** Look up detail by project id — cycles through the 20 templates */
export function getProjectDetail(id: number): ProjectDetail {
  const idx = ((id - 1) % ALL_PROJECTS.length + ALL_PROJECTS.length) % ALL_PROJECTS.length;
  return { ...ALL_PROJECTS[idx], id };
}
