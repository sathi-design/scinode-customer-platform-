"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CROCompany, CROProduct, CROCertification, CROServices,
  CROLabEquip, CRODistillation, CROFilterDryer, CROOtherEquip,
  CROETPCard, CROCleanRoomCard, CROFireCard, CROPowerCard,
  CROUtility, CROTerms,
} from "@/modules/independent-cro-profile/types";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_COMPANY: CROCompany = {
  ownerName: "", companyName: "", logoFile: null, labImageFiles: [],
  description: "", companyIdNumber: "", yearEstablished: "", modelType: "",
  numberOfEmployees: "", gstVat: "", address: "", stateCountry: "",
  industries: [], industryOther: "", uniqueCapabilities: [],
  automation: null, autoType: "", autoPct: "", pilotPlant: null, analyticalLab: null,
};

const DEFAULT_SERVICES: CROServices = {
  researchChemistry: [], researchBiology: [],
  analyticalChemistry: [], analyticalBiology: [],
  scaleUpChemistry: [], scaleUpBiology: [],
  regulatoryChemistry: [], regulatoryBiology: [],
};

const DEFAULT_TERMS: CROTerms = {
  agreed: false, signName: "", signDate: "", submitted: false,
};

// ─── Store interface ──────────────────────────────────────────────────────────

interface CROStore {
  company: CROCompany;
  products: CROProduct[];
  certifications: CROCertification[];
  services: CROServices;
  labEquipments: CROLabEquip[];
  distillationItems: CRODistillation[];
  filterDryerItems: CROFilterDryer[];
  otherEquipItems: CROOtherEquip[];
  etpCards: CROETPCard[];
  cleanRoomCards: CROCleanRoomCard[];
  fireCards: CROFireCard[];
  powerCards: CROPowerCard[];
  utilities: CROUtility[];
  terms: CROTerms;

  setCompany: (patch: Partial<CROCompany>) => void;
  addProduct: (p: CROProduct) => void;
  deleteProduct: (id: string) => void;
  setCertifications: (certs: CROCertification[]) => void;
  deleteCert: (id: string) => void;
  setServices: (patch: Partial<CROServices>) => void;
  addLabEquip: (e: CROLabEquip) => void;
  deleteLabEquip: (id: string) => void;
  addDistillation: (d: CRODistillation) => void;
  deleteDistillation: (id: string) => void;
  addFilterDryer: (f: CROFilterDryer) => void;
  deleteFilterDryer: (id: string) => void;
  addOtherEquip: (o: CROOtherEquip) => void;
  deleteOtherEquip: (id: string) => void;
  addETP: (e: CROETPCard) => void;
  deleteETP: (id: string) => void;
  addCleanRoom: (c: CROCleanRoomCard) => void;
  deleteCleanRoom: (id: string) => void;
  addFire: (f: CROFireCard) => void;
  deleteFire: (id: string) => void;
  addPower: (p: CROPowerCard) => void;
  deletePower: (id: string) => void;
  addUtility: (u: CROUtility) => void;
  deleteUtility: (id: string) => void;
  setTerms: (patch: Partial<CROTerms>) => void;
  reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useIndependentCROProfileStore = create<CROStore>()(
  persist(
    (set) => ({
      company:           DEFAULT_COMPANY,
      products:          [],
      certifications:    [],
      services:          DEFAULT_SERVICES,
      labEquipments:     [],
      distillationItems: [],
      filterDryerItems:  [],
      otherEquipItems:   [],
      etpCards:          [],
      cleanRoomCards:    [],
      fireCards:         [],
      powerCards:        [],
      utilities:         [],
      terms:             DEFAULT_TERMS,

      setCompany: (patch) => set((s) => ({ company: { ...s.company, ...patch } })),

      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      setCertifications: (certs) => set({ certifications: certs }),
      deleteCert: (id) => set((s) => ({ certifications: s.certifications.filter((x) => x.id !== id) })),

      setServices: (patch) => set((s) => ({ services: { ...s.services, ...patch } })),

      addLabEquip: (e) => set((s) => ({ labEquipments: [...s.labEquipments, e] })),
      deleteLabEquip: (id) => set((s) => ({ labEquipments: s.labEquipments.filter((x) => x.id !== id) })),

      addDistillation: (d) => set((s) => ({ distillationItems: [...s.distillationItems, d] })),
      deleteDistillation: (id) => set((s) => ({ distillationItems: s.distillationItems.filter((x) => x.id !== id) })),

      addFilterDryer: (f) => set((s) => ({ filterDryerItems: [...s.filterDryerItems, f] })),
      deleteFilterDryer: (id) => set((s) => ({ filterDryerItems: s.filterDryerItems.filter((x) => x.id !== id) })),

      addOtherEquip: (o) => set((s) => ({ otherEquipItems: [...s.otherEquipItems, o] })),
      deleteOtherEquip: (id) => set((s) => ({ otherEquipItems: s.otherEquipItems.filter((x) => x.id !== id) })),

      addETP: (e) => set((s) => ({ etpCards: [...s.etpCards, e] })),
      deleteETP: (id) => set((s) => ({ etpCards: s.etpCards.filter((x) => x.id !== id) })),

      addCleanRoom: (c) => set((s) => ({ cleanRoomCards: [...s.cleanRoomCards, c] })),
      deleteCleanRoom: (id) => set((s) => ({ cleanRoomCards: s.cleanRoomCards.filter((x) => x.id !== id) })),

      addFire: (f) => set((s) => ({ fireCards: [...s.fireCards, f] })),
      deleteFire: (id) => set((s) => ({ fireCards: s.fireCards.filter((x) => x.id !== id) })),

      addPower: (p) => set((s) => ({ powerCards: [...s.powerCards, p] })),
      deletePower: (id) => set((s) => ({ powerCards: s.powerCards.filter((x) => x.id !== id) })),

      addUtility: (u) => set((s) => ({ utilities: [...s.utilities, u] })),
      deleteUtility: (id) => set((s) => ({ utilities: s.utilities.filter((x) => x.id !== id) })),

      setTerms: (patch) => set((s) => ({ terms: { ...s.terms, ...patch } })),

      reset: () => set({
        company: DEFAULT_COMPANY, products: [], certifications: [],
        services: DEFAULT_SERVICES, labEquipments: [], distillationItems: [],
        filterDryerItems: [], otherEquipItems: [], etpCards: [],
        cleanRoomCards: [], fireCards: [], powerCards: [],
        utilities: [], terms: DEFAULT_TERMS,
      }),
    }),
    {
      name: "scinode-independent-cro-profile-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
    },
  ),
);
