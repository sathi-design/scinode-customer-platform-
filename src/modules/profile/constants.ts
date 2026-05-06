// ─── Shared constants for Profile Setup — sourced from Excel ─────────────────

export const INDUSTRIES = [
  "Pharmaceutical","Flavors & Fragrances","Industrial Chemicals","Agrochemicals",
  "Beauty & Personal Care","Food & Nutrition","Dyes and Pigments","Oleochemicals",
  "Flame Retardants","Metallurgy Chemicals","Elemental Derivatives",
] as const;

export const REACTION_TYPES = [
  "Acetylation","Amination","Bromination","Chlorination","Condensation","Cyanation",
  "Diazotization","Esterification","Etherification","Fermentation","Fluorination",
  "Friedel-Crafts","Grignard","Hydrogenation","Hydroxylation","Methylation",
  "Nitration","Oxidation","Ozonolysis","Phosgenation","Phosphorylation","Reduction",
  "Saponification","Sulfonation","Vilsmeier-Haack",
] as const;

export const AUTOMATION_TYPES = ["PLC","DCS","No Automation"] as const;

export const MOC_OPTIONS = [
  "Mild Steel (MS)","Mild Steel Glass Lined (MSGL)","PP","HDPE","SS316","SS316L",
  "SS304","Hastelloy C-22","Hastelloy C-24","PP-FRP","MS-Rubber Lined","MS-Brick Lined",
  "Tefzel","Ceramic","PVDF","MS-PFA Lined","PVC","Carbon Steel (CS)","SS","MS-Charcoal",
] as const;

export const AGITATOR_TYPES = [
  "Anchor","Turbine","Propeller","Paddle","Helical Ribbon","Scraped Wall","Gate","Disc",
] as const;

export const JACKET_TYPES = ["Plain","Limpet","Double Limpet","Half Limpet"] as const;

export const CONTINUOUS_REACTOR_TYPES = ["Flow","Loop","Vapour Phase Reactor"] as const;

export const MOQ_UNITS  = ["kg","MT","g","L","mL"] as const;
export const INVENTORY_UNITS = ["kg","MT","L"] as const;

export const PRODUCT_GRADES = [
  "Pharmaceutical","Industrial","Food","Research","Technical","Reagent","Electronic",
] as const;

export const PRODUCT_TYPES = [
  "API","Intermediate","Specialty Chemical","Excipient","Catalyst","Reagent","Monomer","Polymer",
] as const;

// ─── Licences ─────────────────────────────────────────────────────────────────
export const CERT_CATEGORIES = [
  {
    label: "Basic Regulatory License",
    options: ["CFE / CTE","Factory License","Fire NOC","CFO/CTO","EC","Insurance","Labour License","ESI"],
  },
  {
    label: "Product Licences",
    options: ["CIB","Drug Licence","HALAL","KOSHER","REACH","FSSAI","DMF"],
  },
  {
    label: "Reagent & Hazardous Chemical Handling",
    options: [
      "PESO (Class A Solvents)","Chlorine Storage","Ammonia Storage","Carbon Disulphide Storage",
      "Hydrogen Storage","Narcotics Handling","Cyanide Storage","Phosgene Storage","Ethanol Storage",
      "NDPS (Narcotic Drugs and Psychotropic Substances)","Methanol Storage","Explosive Licences",
    ],
  },
  {
    label: "Factory / Process Accreditation",
    options: [
      "ISO 9001","ISO 14001","ISO 45001","ISO 50001","WHO GMP","STATE GMP","STATE FDA",
      "UK GMP","EU GMP","USFDA","CDSCO","PMDA","ANVISA","COFEPRIS","EDQM",
    ],
  },
  {
    label: "ESG Accreditation",
    options: [
      "EcoVadis – Gold Certification","EcoVadis – Silver Certification",
      "EcoVadis – Bronze Certification","Responsible Care Logo",
    ],
  },
] as const;

// ─── Equipments ───────────────────────────────────────────────────────────────
export const DISTILLATION_TYPES = ["Batch","Continuous","Other"] as const;
export const PACKING_TYPES      = ["Structured","Random"] as const;
export const RANDOM_PACKING_OPTIONS = ["Raschig","Pall","Saddle","Bubble Cap"] as const;

export const FILTER_TYPES = [
  "Plate Frame Filter","ANF","ANFD","Basket Centrifuge","Sparkler Filter","Candle Filter",
  "Ultra Filtration","Micro Filtration","Nano Filtration","Leaf Filter","Continuous Separator",
  "Bag Filter","Sintered Metal Catalyst Filter","Line Filter","Filter Press","Box Filter",
  "Cartridge Filter","Ceramic Filter","Membrane Filter","Nutsche Filter","Pressure Filter",
  "Pressure Nutsche Filter","Sintered Cartridge Candle Filter","Vacuum Filter","Vacuum Nutsche Filter",
] as const;

export const DRYER_TYPES = [
  "Continuous Fluidised Bed Dryer","Rotary Cone Vacuum Dryer","Rotary Vacuum Paddle Dryer",
  "Rotary Vacuum Dryer","Tray Dryer","Spray Fluid Dryer","Vacuum Tray Dryer","ATFD",
  "Drying Milling Equipment","Flask Freeze Dryer","Rotary Cone Dryer","Rotary Dryer",
  "Spin Flash Dryer","Spray Dryer","Vacuum Dryer",
] as const;

export const DRYING_MEDIA = ["Hot Air","Hot Water","Steam","Hot Oil"] as const;

export const LAB_EQUIPMENT_TYPES = [
  "GC (Gas Chromatography)","HPLC (High-performance liquid chromatography)",
  "NMR (Nuclear Magnetic Resonance)","IR (Infrared Spectroscopy)","GC Head Space",
  "Ultra Performance Liquid Chromatography","Automatic Karl Fischer Titrator",
  "Automatic Potentiometer Titrator","Oven","Particle Size Analyser (Malvern)",
  "UV Spectrophotometer","Potentiometry","UPLC","FTIR (Fourier Transform Infrared Spectrometer)",
  "Muffle Furnace","COD Digestor","Moisture Analyzer","Colony Counter",
  "TOC Analyzer (Total Organic Carbon)","LCMS","Bulk and Tapped Density Tester",
  "Conductivity and TDS Meter","Others",
] as const;

export const OTHER_EQUIPMENT_NAMES = [
  "Evaporators","Blenders","Extraction Columns","Adsorption Columns",
  "Size Reduction Equipments (Mills, Granulator, Crusher)","Settler / Clarifier",
] as const;

export const OTHER_EQUIPMENT_SUBTYPES: Record<string, readonly string[]> = {
  "Evaporators": [
    "Multiple Effect Evaporator","Agitated Thin Film Evaporator","Falling Film Evaporators",
    "Rising Film Evaporator","Plate Evaporator","Multiple Effect Evaporator with ATFD",
    "Rotary Evaporator","Wiped Film Evaporator",
  ],
  "Blenders": ["Ribbon","Octagonal","Double Cone","V-Blender","Paddle Mixer"],
  "Extraction Columns": [
    "Liquid-Liquid Exchange","Ion-exchange Column","Solid-Liquid Extraction Column",
  ],
  "Adsorption Columns": [
    "Fixed Bed","Moving Bed","Pressure Swing Adsorption","Gas/Liquid Adsorption","Fluidised Bed",
  ],
  "Size Reduction Equipments (Mills, Granulator, Crusher)": [
    "Multi Mill","Ball Mill","Hammer Mill","Jet Mill","Crusher","Colloid Mill",
    "Air Jet Mill","Pin Mill","Granulator",
  ],
  "Settler / Clarifier": [
    "Gravity Settler","Lamella Clarifier","Oil-Water Separator","Solid-Liquid Settler",
    "Overflow-Weir Settler","Phase Separator",
  ],
};

// ─── Facility & EHS ───────────────────────────────────────────────────────────
export const ETP_INFRA_OPTIONS = [
  "Primary Treatment","Secondary Treatment","MEE","ATFD","RO","Others",
] as const;

export const WATER_STORAGE_TYPES = [
  "Underground Storage Tank","Overhead Tank","Reservoir","Sump",
] as const;

export const POWER_BACKUP_TYPES = ["Diesel Generator","Captive Power Plant"] as const;

// ─── Utilities ────────────────────────────────────────────────────────────────
export const UTILITY_CATEGORIES = [
  "Heating","Cooling","Vacuum","Liquid Nitrogen (Cryogenic)","Cold Storage Unit",
  "Other Utilities","HVAC System",
] as const;

export const HEATING_TYPES  = ["Boiler","Thermic Fluid","Hot Water"] as const;
export const HEATING_FUELS  = ["Coal","Natural Gas","Bio-Mass","Wood","Furnace Oil","Others"] as const;
export const COOLING_TYPES  = ["Chilling Plant","Cooling Tower","Brine Plant"] as const;
export const VACUUM_TYPES   = [
  "Oil Ring Pump","Water Ring Pump","Dry Vacuum Pump","Steam Ejector",
  "Water Jet Ejector","Water + Steam Ejector",
] as const;
export const LN2_SOURCES        = ["In-House","Vendor Supply (tankers/cylinders)"] as const;
export const LN2_STORAGE_TYPES  = ["Cryogenic Tank","Cylinder Bank"] as const;
export const COLD_STORAGE_INFRA = ["Insulated Box","Freezer","Cold Room"] as const;
export const OTHER_UTILITY_TYPES = [
  "DM Water","Ultra Pure Water","Nitrogen","Instrument Air","Breathing Air",
] as const;
export const HVAC_TYPES = ["Air Handling Unit (AHU)","Dehumidifier"] as const;

export const TABS = [
  { id: "company",    label: "Company Profile",           icon: "Building2"   },
  { id: "products",   label: "Products",                  icon: "Package"     },
  { id: "licences",   label: "Licences & Certifications", icon: "Award"       },
  { id: "reactors",   label: "Reactors",                  icon: "FlaskConical"},
  { id: "equipments", label: "Equipments",                icon: "Wrench"      },
  { id: "ehs",        label: "EHS & Facility",            icon: "ShieldCheck" },
  { id: "utilities",  label: "Utilities",                 icon: "Zap"         },
  { id: "terms",      label: "Terms & Conditions",        icon: "FileText"    },
] as const;

export type TabId = (typeof TABS)[number]["id"];
