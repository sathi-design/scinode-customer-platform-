// ─── Independent CRO Profile — Types ─────────────────────────────────────────

export interface CROCompany {
  ownerName: string;
  companyName: string;
  logoFile: string | null;
  labImageFiles: string[];
  description: string;
  companyIdNumber: string;
  yearEstablished: string;
  modelType: string;
  numberOfEmployees: string;
  gstVat: string;
  address: string;
  stateCountry: string;
  industries: string[];
  industryOther: string;
  uniqueCapabilities: string[];
  automation: boolean | null;
  autoType: string;
  autoPct: string;
  pilotPlant: boolean | null;
  analyticalLab: boolean | null;
}

export interface CROProduct {
  id: string;
  name: string;
  casNumber: string;
  industry: string;
  grade: string;
  purity: string;
  moq: string;
  moqUnit: string;
  inventoryStatus: string;
  availableQty: string;
  availableUnit: string;
  availableLocation: string;
  crackedChemistry: boolean;
  workedOnProduct: boolean;
}

export interface CROCertification {
  id: string;
  name: string;
  category: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  attachmentName?: string;
  imageFile?: string;
  documentFile?: string;
}

export interface CROServices {
  researchChemistry: string[];
  researchBiology: string[];
  analyticalChemistry: string[];
  analyticalBiology: string[];
  scaleUpChemistry: string[];
  scaleUpBiology: string[];
  regulatoryChemistry: string[];
  regulatoryBiology: string[];
}

export interface CROLabEquip {
  id: string;
  equipType: string;
  equipOther: string;
  count: string;
  make: string;
  isRare: boolean;
}

export interface CRODistillation {
  id: string;
  distType: string;
  distTypeOther: string;
  moc: string;
  colDiameter: string;
  colHeight: string;
  capacity: string;
  count: string;
  packingType: string;
  packingMake: string;
  packingRandom: string;
  tempRange: string;
  pressureRange: string;
}

export interface CROFilterDryer {
  id: string;
  category: "Filter" | "Dryer";
  equipType: string;
  capacity: string;
  moc: string;
  dryingMedia: string;
}

export interface CROOtherEquip {
  id: string;
  equipName: string;
  subType: string;
  moc: string;
  capacity: string;
  count: string;
  notes: string;
  isRare: boolean;
}

export interface CROETPCard {
  id: string;
  isZLD: boolean | null;
  infra: string;
  infraOther: string;
  capacity: string;
}

export interface CROCleanRoomCard {
  id: string;
  numberOfLines: string;
}

export interface CROFireCard {
  id: string;
  storageType: string;
  capacity: string;
}

export interface CROPowerCard {
  id: string;
  powerType: string;
  count: string;
  capacityKva: string;
}

export interface CROUtility {
  id: string;
  category: string;
  // heating
  heatingType: string;
  heatingFuel: string;
  heatingFuelOther: string;
  heatingCapacity: string;
  heatingPressure: string;
  heatingCount: string;
  heatingNotes: string;
  // cooling
  coolingType: string;
  coolingCapacity: string;
  coolingMedia: string;
  coolingTemp: string;
  coolingCount: string;
  coolingNotes: string;
  // vacuum
  vacuumType: string;
  vacuumLevel: string;
  vacuumCount: string;
  vacuumNotes: string;
  // liquid nitrogen
  lnAvailability: boolean | null;
  lnSource: string;
  lnStorageCapacity: string;
  lnStorageType: string;
  lnCount: string;
  lnNotes: string;
  // cold storage
  csStorageType: string;
  csArea: string;
  csTemp: string;
  csCount: string;
  csNotes: string;
  // other utilities
  ouType: string;
  ouCapacity: string;
  ouMoc: string;
  ouBufferCapacity: string;
  ouCount: string;
  ouNotes: string;
  // hvac
  hvacType: string;
  hvacCount: string;
  hvacNotes: string;
}

export interface CROTerms {
  agreed: boolean;
  signName: string;
  signDate: string;
  submitted: boolean;
}

// ─── Step completion helper — returns boolean[8] for 8 tabs ──────────────────
export function getCROStepCompletions(store: {
  company?: CROCompany;
  products?: CROProduct[];
  certifications?: CROCertification[];
  services?: CROServices;
  labEquipments?: CROLabEquip[];
  terms?: CROTerms;
}): boolean[] {
  const c = store.company;
  const products      = store.products      ?? [];
  const services      = store.services      ?? {} as CROServices;
  const labEquipments = store.labEquipments ?? [];
  const terms         = store.terms         ?? { agreed: false, signName: "", signDate: "", submitted: false };
  return [
    // Tab 1 - Company
    !!(c && c.ownerName && c.companyName && c.companyIdNumber && c.yearEstablished && c.numberOfEmployees && c.address && c.stateCountry && c.pilotPlant !== null && c.analyticalLab !== null),
    // Tab 2 - Products
    products.length > 0,
    // Tab 3 - Certs (optional, always passes)
    true,
    // Tab 4 - Services
    Object.values(services).some((arr) => Array.isArray(arr) && arr.length > 0),
    // Tab 5 - Equipment
    labEquipments.length > 0,
    // Tab 6 - Facility (optional)
    true,
    // Tab 7 - Utility (optional)
    true,
    // Tab 8 - Terms
    terms.agreed && !!terms.signName,
  ];
}

export function getCROProfileProgress(store: Parameters<typeof getCROStepCompletions>[0] & { terms?: CROTerms }): number {
  if (store.terms?.submitted) return 99;
  const comps = getCROStepCompletions(store);
  const done  = comps.filter(Boolean).length;
  return Math.min(Math.round((done / 8) * 99), 99);
}
