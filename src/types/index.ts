// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = "cro" | "manufacturing" | "scientist" | "researcher" | "pi";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  profileCompletion: number;
  createdAt: string;
  /** Sub-type selected during CRO / Scientist signup */
  profileSubtype?: "researcher" | "pi" | "others";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Status & Badge ──────────────────────────────────────────────────────────

export type StatusType =
  | "accepted"
  | "declined"
  | "under_review"
  | "submitted"
  | "exclusive"
  | "po_raised"
  | "urgent"
  | "draft"
  | "active"
  | "completed";

export type ProjectType = "RFQ" | "CDMO" | "CMO" | "RnD" | "Custom Synthesis";

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  status: StatusType;
  client: string;
  deadline: string;
  progress: number;
  description?: string;
  tags?: string[];
  updatedAt: string;
}

// ─── Proposals ───────────────────────────────────────────────────────────────

export interface Proposal {
  id: string;
  title: string;
  projectType: ProjectType;
  status: StatusType;
  submittedAt: string;
  value?: string;
  client: string;
  notes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  activeProjects: number;
  totalProposals: number;
  productProposals: number;
  projectProposals: number;
  pendingReview: number;
  completedThisMonth: number;
}

export interface ActivityItem {
  id: string;
  type: "proposal" | "project" | "message" | "system";
  title: string;
  description: string;
  timestamp: string;
  status?: StatusType;
}

export interface TimelineStep {
  id: string;
  label: string;
  date: string;
  status: "completed" | "active" | "pending";
  description?: string;
}

// ─── CRO-specific ────────────────────────────────────────────────────────────

export interface CROProfile {
  organizationName: string;
  organizationType: string;
  servicesOffered: string[];
  certifications: string[];
  yearsOperating: number;
  teamSize: string;
  website?: string;
  therapeuticAreas: string[];
}

// ─── Manufacturing-specific ──────────────────────────────────────────────────

export interface ManufacturingProfile {
  facilityName: string;
  facilityType: string;
  productionCapabilities: string[];
  complianceCerts: string[];
  capacity: string;
  gmpCertified: boolean;
  location: string;
  equipmentTypes: string[];
}

// ─── Scientist-specific ──────────────────────────────────────────────────────

export interface ScientistProfile {
  fullName: string;
  institution: string;
  researchInterests: string[];
  publications: number;
  expertise: string[];
  orcidId?: string;
  linkedinUrl?: string;
  bio: string;
}

// ─── Forms ───────────────────────────────────────────────────────────────────

export interface SignupStep {
  id: string;
  title: string;
  description: string;
}

export interface SignupFlowState {
  role: UserRole | null;
  step: number;
  formData: Record<string, unknown>;
  isComplete: boolean;
}

// ─── Preview Mode ────────────────────────────────────────────────────────────

export type PreviewMode = "web" | "mobile";
