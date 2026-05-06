// ─── Researcher / CRO Profile — Data Models ──────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "ACTIVE" | "PENDING";
}

export interface ResearchCert {
  id: string;
  name: string;
  category: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  attachment: string;
  imageFile?: string;
  documentFile?: string;
}

export interface Technology {
  id: string;
  name: string;
  trlLevel: string;
  patentStatus: string;
  industrialAdvantages: string;
  applications: string;
  imageUrl: string;
  link: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  projectType: string;
  description: string;
  link: string;
}

export interface Patent {
  id: string;
  title: string;
  authors: string;
  domain: string;
  status: string;
  link: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  journalConference: string;
  year: string;
  citations: string;
  link: string;
}

export interface ResearcherProfileData {
  // ── Step 1 — Core Profile ───────────────────────────────────────────────────
  scientistName: string;
  designation: string;
  primaryInstitution: string;
  cityState: string;
  country: string;
  technicalDomains: string[];
  researchInterests: string;

  // ── Step 1 — Bio & Links (optional) ────────────────────────────────────────
  researchIdIRINS: string;
  orcidId: string;
  hIndex: string;
  linkedinProfile: string;
  googleScholarProfile: string;

  // ── Step 1 — Research Group ─────────────────────────────────────────────────
  groupName: string;
  headScientist: string;
  teamMembers: TeamMember[];

  // ── Step 2 — Capabilities ───────────────────────────────────────────────────
  executionCapabilities: string[];
  industriesWorkedWith: string[];
  preferredEngagement: string[];
  certifications: ResearchCert[];

  // ── Step 3 — Track Record ───────────────────────────────────────────────────
  technologies: Technology[];
  projects: ResearchProject[];
  patents: Patent[];
  publications: Publication[];

  // ── Step 4 — Terms & Conditions ─────────────────────────────────────────────
  termsAgreed: boolean;
  termsSignName: string;
  termsSignDate: string;

  // ── Meta ────────────────────────────────────────────────────────────────────
  submitted: boolean;
}

// ── Step-completion helpers ───────────────────────────────────────────────────

export function getStepCompletions(d: ResearcherProfileData): boolean[] {
  const step1 =
    d.scientistName.trim().split(/\s+/).filter(Boolean).length >= 2 &&
    d.designation.trim().length > 0 &&
    d.primaryInstitution.trim().length > 0 &&
    d.cityState.trim().length > 0 &&
    d.country.trim().length > 0 &&
    d.technicalDomains.length >= 1 &&
    d.researchInterests.trim().length > 0;

  const step2 =
    d.executionCapabilities.length >= 1 &&
    d.industriesWorkedWith.length >= 1 &&
    d.preferredEngagement.length >= 1;

  const step3 = true;

  const step4 =
    d.termsAgreed &&
    (d.termsSignName ?? "").trim().length > 0 &&
    (d.termsSignDate ?? "").length > 0;

  return [step1, step2, step3, step4];
}

export function getProfileProgress(d: ResearcherProfileData): number {
  const completions = getStepCompletions(d);
  const done = completions.filter(Boolean).length;
  return Math.min((done / 4) * 100, 99);
}
