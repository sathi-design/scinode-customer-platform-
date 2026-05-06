"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ProfileCompany, Product, Certificate, Reactor,
  DistillationItem, FilterDryerItem, LabEquipItem, OtherEquipItem,
  ETPCard, CleanRoomCard, FireCard, PowerCard,
  Utility, ProfileTerms,
} from "@/modules/profile/types";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const COMPANY_DEFAULTS: ProfileCompany = {
  companyDesc: "", address: "", stateCountry: "",
  industries: [], otherIndustry: "", reactions: [], otherReaction: "",
  uniqueCaps: [], plantImage: "", companyName: "", ownerName: "",
  logoFile: "", phone: "", cin: "", gst: "",
  automation: null, autoType: "", autoPct: "", pilotPlant: null,
};

const TERMS_DEFAULTS: ProfileTerms = {
  agreed: false, sigName: "", signed: false, sigDate: "",
};

// ─── Store interface ───────────────────────────────────────────────────────────

interface ProfileStore {
  // ── Company Profile ────────────────────────────────────────────────────────
  company: ProfileCompany;
  setCompany: (patch: Partial<ProfileCompany>) => void;

  // ── Products ───────────────────────────────────────────────────────────────
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  // ── Licences & Certifications ──────────────────────────────────────────────
  certs: Certificate[];
  addCert: (c: Certificate) => void;
  updateCert: (c: Certificate) => void;
  deleteCert: (id: string) => void;

  // ── Reactors ───────────────────────────────────────────────────────────────
  reactorTotalCap: string;
  reactors: Reactor[];
  setReactorTotalCap: (v: string) => void;
  addReactor: (r: Reactor) => void;
  updateReactor: (r: Reactor) => void;
  deleteReactor: (id: string) => void;

  // ── Equipments ─────────────────────────────────────────────────────────────
  equipDistillation: DistillationItem[];
  equipFilterDryer: FilterDryerItem[];
  equipLab: LabEquipItem[];
  equipOther: OtherEquipItem[];
  addEquipDistillation: (e: DistillationItem) => void;
  deleteEquipDistillation: (id: string) => void;
  addEquipFilterDryer: (e: FilterDryerItem) => void;
  deleteEquipFilterDryer: (id: string) => void;
  addEquipLab: (e: LabEquipItem) => void;
  deleteEquipLab: (id: string) => void;
  addEquipOther: (e: OtherEquipItem) => void;
  deleteEquipOther: (id: string) => void;

  // ── EHS & Facility ─────────────────────────────────────────────────────────
  etpCards: ETPCard[];
  cleanRoomCards: CleanRoomCard[];
  fireCards: FireCard[];
  powerCards: PowerCard[];
  addETP: (c: ETPCard) => void;
  deleteETP: (id: string) => void;
  addCleanRoom: (c: CleanRoomCard) => void;
  deleteCleanRoom: (id: string) => void;
  addFire: (c: FireCard) => void;
  deleteFire: (id: string) => void;
  addPower: (c: PowerCard) => void;
  deletePower: (id: string) => void;

  // ── Utilities ──────────────────────────────────────────────────────────────
  utilities: Utility[];
  addUtility: (u: Utility) => void;
  deleteUtility: (id: string) => void;

  // ── Terms & Conditions ─────────────────────────────────────────────────────
  terms: ProfileTerms;
  setTerms: (patch: Partial<ProfileTerms>) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      // Company
      company: COMPANY_DEFAULTS,
      setCompany: (patch) =>
        set((s) => ({ company: { ...s.company, ...patch } })),

      // Products
      products: [],
      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      // Licences
      certs: [],
      addCert: (c) => set((s) => ({ certs: [...s.certs, c] })),
      updateCert: (c) =>
        set((s) => ({ certs: s.certs.map((x) => (x.id === c.id ? c : x)) })),
      deleteCert: (id) =>
        set((s) => ({ certs: s.certs.filter((x) => x.id !== id) })),

      // Reactors
      reactorTotalCap: "",
      reactors: [],
      setReactorTotalCap: (v) => set({ reactorTotalCap: v }),
      addReactor: (r) => set((s) => ({ reactors: [...s.reactors, r] })),
      updateReactor: (r) =>
        set((s) => ({ reactors: s.reactors.map((x) => (x.id === r.id ? r : x)) })),
      deleteReactor: (id) =>
        set((s) => ({ reactors: s.reactors.filter((x) => x.id !== id) })),

      // Equipments
      equipDistillation: [],
      equipFilterDryer: [],
      equipLab: [],
      equipOther: [],
      addEquipDistillation: (e) =>
        set((s) => ({ equipDistillation: [...s.equipDistillation, e] })),
      deleteEquipDistillation: (id) =>
        set((s) => ({ equipDistillation: s.equipDistillation.filter((x) => x.id !== id) })),
      addEquipFilterDryer: (e) =>
        set((s) => ({ equipFilterDryer: [...s.equipFilterDryer, e] })),
      deleteEquipFilterDryer: (id) =>
        set((s) => ({ equipFilterDryer: s.equipFilterDryer.filter((x) => x.id !== id) })),
      addEquipLab: (e) =>
        set((s) => ({ equipLab: [...s.equipLab, e] })),
      deleteEquipLab: (id) =>
        set((s) => ({ equipLab: s.equipLab.filter((x) => x.id !== id) })),
      addEquipOther: (e) =>
        set((s) => ({ equipOther: [...s.equipOther, e] })),
      deleteEquipOther: (id) =>
        set((s) => ({ equipOther: s.equipOther.filter((x) => x.id !== id) })),

      // EHS
      etpCards: [],
      cleanRoomCards: [],
      fireCards: [],
      powerCards: [],
      addETP: (c) => set((s) => ({ etpCards: [...s.etpCards, c] })),
      deleteETP: (id) =>
        set((s) => ({ etpCards: s.etpCards.filter((x) => x.id !== id) })),
      addCleanRoom: (c) =>
        set((s) => ({ cleanRoomCards: [...s.cleanRoomCards, c] })),
      deleteCleanRoom: (id) =>
        set((s) => ({ cleanRoomCards: s.cleanRoomCards.filter((x) => x.id !== id) })),
      addFire: (c) => set((s) => ({ fireCards: [...s.fireCards, c] })),
      deleteFire: (id) =>
        set((s) => ({ fireCards: s.fireCards.filter((x) => x.id !== id) })),
      addPower: (c) => set((s) => ({ powerCards: [...s.powerCards, c] })),
      deletePower: (id) =>
        set((s) => ({ powerCards: s.powerCards.filter((x) => x.id !== id) })),

      // Utilities
      utilities: [],
      addUtility: (u) => set((s) => ({ utilities: [...s.utilities, u] })),
      deleteUtility: (id) =>
        set((s) => ({ utilities: s.utilities.filter((x) => x.id !== id) })),

      // Terms
      terms: TERMS_DEFAULTS,
      setTerms: (patch) =>
        set((s) => ({ terms: { ...s.terms, ...patch } })),
    }),
    {
      name: "scinode-profile-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
