"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ResearcherProfileData,
  TeamMember,
  ResearchCert,
  Technology,
  ResearchProject,
  Patent,
  Publication,
} from "@/modules/researcher-profile/types";

// ─── Default data ─────────────────────────────────────────────────────────────

const DATA_DEFAULTS: ResearcherProfileData = {
  scientistName: "",
  designation: "",
  primaryInstitution: "",
  cityState: "",
  country: "",
  technicalDomains: [],
  researchInterests: "",
  researchIdIRINS: "",
  orcidId: "",
  hIndex: "",
  linkedinProfile: "",
  googleScholarProfile: "",
  groupName: "",
  headScientist: "",
  teamMembers: [],
  executionCapabilities: [],
  industriesWorkedWith: [],
  preferredEngagement: [],
  certifications: [],
  technologies: [],
  projects: [],
  patents: [],
  publications: [],
  termsAgreed: false,
  termsSignName: "",
  termsSignDate: "",
  submitted: false,
};

// ─── Store interface ──────────────────────────────────────────────────────────

interface ResearcherProfileStore {
  data: ResearcherProfileData;
  setData: (patch: Partial<ResearcherProfileData>) => void;
  reset: () => void;

  addTeamMember: (m: TeamMember) => void;
  deleteTeamMember: (id: string) => void;

  setCertifications: (certs: ResearchCert[]) => void;
  deleteCert: (id: string) => void;

  addTechnology: (t: Technology) => void;
  deleteTechnology: (id: string) => void;

  addProject: (p: ResearchProject) => void;
  deleteProject: (id: string) => void;

  addPatent: (p: Patent) => void;
  deletePatent: (id: string) => void;

  addPublication: (p: Publication) => void;
  deletePublication: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useResearcherProfileStore = create<ResearcherProfileStore>()(
  persist(
    (set) => ({
      data: DATA_DEFAULTS,

      setData: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),

      reset: () => set({ data: DATA_DEFAULTS }),

      addTeamMember: (m) =>
        set((s) => ({ data: { ...s.data, teamMembers: [...s.data.teamMembers, m] } })),
      deleteTeamMember: (id) =>
        set((s) => ({ data: { ...s.data, teamMembers: s.data.teamMembers.filter((x) => x.id !== id) } })),

      // Replace full cert list (used by accordion drawer)
      setCertifications: (certs) =>
        set((s) => ({ data: { ...s.data, certifications: certs } })),
      deleteCert: (id) =>
        set((s) => ({ data: { ...s.data, certifications: s.data.certifications.filter((x) => x.id !== id) } })),

      addTechnology: (t) =>
        set((s) => ({ data: { ...s.data, technologies: [...s.data.technologies, t] } })),
      deleteTechnology: (id) =>
        set((s) => ({ data: { ...s.data, technologies: s.data.technologies.filter((x) => x.id !== id) } })),

      addProject: (p) =>
        set((s) => ({ data: { ...s.data, projects: [...s.data.projects, p] } })),
      deleteProject: (id) =>
        set((s) => ({ data: { ...s.data, projects: s.data.projects.filter((x) => x.id !== id) } })),

      addPatent: (p) =>
        set((s) => ({ data: { ...s.data, patents: [...s.data.patents, p] } })),
      deletePatent: (id) =>
        set((s) => ({ data: { ...s.data, patents: s.data.patents.filter((x) => x.id !== id) } })),

      addPublication: (p) =>
        set((s) => ({ data: { ...s.data, publications: [...s.data.publications, p] } })),
      deletePublication: (id) =>
        set((s) => ({ data: { ...s.data, publications: s.data.publications.filter((x) => x.id !== id) } })),
    }),
    {
      name: "scinode-researcher-profile-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
