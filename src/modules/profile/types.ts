// ─── Shared Profile Types ─────────────────────────────────────────────────────

export interface ProfileCompany {
  // Section 1 — visible to customers
  companyDesc: string;
  address: string;
  stateCountry: string;
  industries: string[];
  otherIndustry: string;
  reactions: string[];
  otherReaction: string;
  uniqueCaps: string[];
  plantImage: string;
  // Section 2 — internal
  companyName: string;
  ownerName: string;
  logoFile: string;
  phone: string;
  cin: string;
  gst: string;
  automation: boolean | null;
  autoType: string;
  autoPct: string;
  pilotPlant: boolean | null;
}

export interface Product {
  id: string;
  name: string;
  casNo: string;
  industry: string;
  grade: string;
  purity: string;
  moq: string;
  moqUnit: string;
  inventoryStatus: "In inventory" | "Made to order";
  availableQty: string;
  availableUnit: string;
  availableLocation: string;
  crackedChemistry: boolean;
  workedOnProduct: boolean;
}

export interface Certificate {
  id: string;
  category: string;
  name: string;
  otherName: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  noExpiry: boolean;
  fileName: string;
  imageFile?: string;
  documentFile?: string;
}

export interface Reactor {
  id: string;
  category: string;
  moc: string;
  mocOther: string;
  capacityKL: string;
  count: string;
  agitatorType: string;
  jacketType: string;
  reactorType: string;
  reactorTypeOther: string;
}

export interface DistillationItem {
  id: string;
  type: string;
  typeOther: string;
  moc: string;
  mocOther: string;
  colDiameter: string;
  colHeight: string;
  totalCapacity: string;
  count: string;
  packingType: string;
  packingMake: string;
  packingRandom: string;
  tempRange: string;
  pressureRange: string;
}

export interface FilterDryerItem {
  id: string;
  category: "Filter" | "Dryer" | "";
  type: string;
  capacity: string;
  moc: string;
  mocOther: string;
  dryingMedia: string;
}

export interface LabEquipItem {
  id: string;
  type: string;
  count: string;
  make: string;
  notes: string;
}

export interface OtherEquipItem {
  id: string;
  name: string;
  type: string;
  moc: string;
  mocOther: string;
  capacity: string;
  count: string;
  notes: string;
}

export interface ETPCard {
  id: string;
  isZLD: boolean | null;
  infra: string;
  infraOther: string;
  capacityKL: string;
}

export interface CleanRoomCard {
  id: string;
  numberOfLines: string;
}

export interface FireCard {
  id: string;
  waterStorageType: string;
  capacityKL: string;
}

export interface PowerCard {
  id: string;
  type: string;
  count: string;
  capacityKVA: string;
}

export interface Utility {
  id: string;
  category: string;
  details: Record<string, string>;
}

export interface ProfileTerms {
  agreed: boolean;
  sigName: string;
  signed: boolean;
  sigDate: string;
}
