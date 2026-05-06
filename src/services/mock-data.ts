import type {
  Project,
  Proposal,
  DashboardMetrics,
  ActivityItem,
  TimelineStep,
  UserRole,
} from "@/types";

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const mockMetrics: Record<UserRole, DashboardMetrics> = {
  cro: {
    activeProjects: 7,
    totalProposals: 24,
    productProposals: 8,
    projectProposals: 16,
    pendingReview: 5,
    completedThisMonth: 3,
  },
  manufacturing: {
    activeProjects: 12,
    totalProposals: 18,
    productProposals: 14,
    projectProposals: 4,
    pendingReview: 3,
    completedThisMonth: 6,
  },
  scientist: {
    activeProjects: 4,
    totalProposals: 11,
    productProposals: 2,
    projectProposals: 9,
    pendingReview: 2,
    completedThisMonth: 1,
  },
  // researcher + pi share CRO data (their dashboards are placeholders)
  researcher: {
    activeProjects: 0,
    totalProposals: 0,
    productProposals: 0,
    projectProposals: 0,
    pendingReview: 0,
    completedThisMonth: 0,
  },
  pi: {
    activeProjects: 0,
    totalProposals: 0,
    productProposals: 0,
    projectProposals: 0,
    pendingReview: 0,
    completedThisMonth: 0,
  },
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const mockProjects: Record<UserRole, Project[]> = {
  cro: [
    {
      id: "PRJ-2401",
      title: "Phase II Oncology Trial — TRK-77X",
      type: "CDMO",
      status: "active",
      client: "NovaBiotech AG",
      deadline: "2025-06-30",
      progress: 62,
      tags: ["Oncology", "Phase II"],
      updatedAt: "2025-04-01",
    },
    {
      id: "PRJ-2398",
      title: "Bioequivalence Study — GEN-112",
      type: "RFQ",
      status: "under_review",
      client: "GeneriPharma Inc.",
      deadline: "2025-05-15",
      progress: 34,
      tags: ["Generic", "Bioequivalence"],
      updatedAt: "2025-03-28",
    },
    {
      id: "PRJ-2385",
      title: "Tox Safety Assessment — MPX-9",
      type: "RnD",
      status: "active",
      client: "Meridian Labs",
      deadline: "2025-07-20",
      progress: 80,
      tags: ["Toxicology", "Safety"],
      updatedAt: "2025-03-22",
    },
    {
      id: "PRJ-2370",
      title: "Clinical Data Management — CAR-T",
      type: "CDMO",
      status: "submitted",
      client: "CellMed Therapeutics",
      deadline: "2025-08-10",
      progress: 15,
      tags: ["Cell Therapy", "CAR-T"],
      updatedAt: "2025-03-15",
    },
  ],
  manufacturing: [
    {
      id: "ORD-5501",
      title: "API Batch Production — Losartan Potassium",
      type: "CMO",
      status: "active",
      client: "CardioVita Pharma",
      deadline: "2025-05-20",
      progress: 55,
      tags: ["API", "Cardiovascular"],
      updatedAt: "2025-04-03",
    },
    {
      id: "ORD-5498",
      title: "Sterile Fill-Finish — Insulin Analogue",
      type: "CDMO",
      status: "active",
      client: "DiabeCare Solutions",
      deadline: "2025-06-15",
      progress: 72,
      tags: ["Sterile", "Biologics"],
      updatedAt: "2025-04-01",
    },
    {
      id: "ORD-5480",
      title: "Scale-Up Synthesis — LTP-304",
      type: "Custom Synthesis",
      status: "under_review",
      client: "NeuroPath AG",
      deadline: "2025-07-01",
      progress: 20,
      tags: ["Scale-up", "CNS"],
      updatedAt: "2025-03-25",
    },
    {
      id: "ORD-5461",
      title: "Secondary Packaging — Antibiotic Line",
      type: "CMO",
      status: "completed",
      client: "MedCore Global",
      deadline: "2025-03-31",
      progress: 100,
      tags: ["Packaging", "Antibiotics"],
      updatedAt: "2025-03-30",
    },
  ],
  scientist: [
    {
      id: "RES-1101",
      title: "PROTAC Degrader Mechanism — BCL-2",
      type: "RnD",
      status: "active",
      client: "Self / Open Research",
      deadline: "2025-09-01",
      progress: 45,
      tags: ["PROTAC", "Oncology"],
      updatedAt: "2025-04-02",
    },
    {
      id: "COL-1095",
      title: "Nanoparticle Drug Delivery Collaboration",
      type: "CDMO",
      status: "active",
      client: "NanoMed Institute",
      deadline: "2025-10-15",
      progress: 30,
      tags: ["Nanoparticles", "Delivery"],
      updatedAt: "2025-03-29",
    },
  ],
  researcher: [],
  pi: [],
};

// ─── Proposals ────────────────────────────────────────────────────────────────

export const mockProposals: Record<UserRole, Proposal[]> = {
  cro: [
    { id: "PROP-9801", title: "Phase I/II CNS Drug Trial", projectType: "CDMO", status: "under_review", submittedAt: "2025-03-20", value: "$2.4M", client: "NeuroBridge" },
    { id: "PROP-9789", title: "PK/PD Study — Oral Biologics", projectType: "RFQ", status: "accepted", submittedAt: "2025-03-10", value: "$680K", client: "OralBio Labs" },
    { id: "PROP-9775", title: "Regulatory Submission Support", projectType: "RnD", status: "draft", submittedAt: "2025-02-28", value: "$320K", client: "PharmaCore" },
    { id: "PROP-9760", title: "Biomarker Analysis — IMM-7", projectType: "CDMO", status: "declined", submittedAt: "2025-02-15", value: "$450K", client: "ImmuneTech" },
    { id: "PROP-9744", title: "Stability Testing Package", projectType: "RFQ", status: "submitted", submittedAt: "2025-04-01", value: "$185K", client: "StableCore" },
  ],
  manufacturing: [
    { id: "MFG-4401", title: "GMP Batch — Metformin HCl 500mg", projectType: "CMO", status: "accepted", submittedAt: "2025-03-22", value: "$1.1M", client: "DiabeCare" },
    { id: "MFG-4389", title: "Aseptic Fill — Peptide Injection", projectType: "CDMO", status: "under_review", submittedAt: "2025-03-15", value: "$3.2M", client: "PeptidePharma" },
    { id: "MFG-4370", title: "Solid Dosage Line — Antifungal", projectType: "CMO", status: "po_raised", submittedAt: "2025-02-28", value: "$780K", client: "FungaCure" },
    { id: "MFG-4355", title: "Lyophilization Development", projectType: "CDMO", status: "draft", submittedAt: "2025-02-10", client: "CryoBio" },
    { id: "MFG-4340", title: "Conjugation Chemistry Scale-Up", projectType: "Custom Synthesis", status: "submitted", submittedAt: "2025-04-02", value: "$560K", client: "ConjuGate" },
  ],
  scientist: [
    { id: "SCI-2201", title: "Collaboration on KRAS Inhibitor Series", projectType: "RnD", status: "under_review", submittedAt: "2025-03-18", client: "OncoTarget Labs" },
    { id: "SCI-2188", title: "mRNA Formulation Consultancy", projectType: "CDMO", status: "accepted", submittedAt: "2025-03-05", value: "$95K", client: "RNAVax" },
    { id: "SCI-2172", title: "ADC Linker Mechanism Study", projectType: "RnD", status: "draft", submittedAt: "2025-02-20", client: "AntibodyDrug Co." },
    { id: "SCI-2160", title: "In Silico Docking Analysis — DRD2", projectType: "RFQ", status: "submitted", submittedAt: "2025-04-03", client: "NeuroTarget" },
  ],
  researcher: [],
  pi: [],
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const mockActivity: Record<UserRole, ActivityItem[]> = {
  cro: [
    { id: "a1", type: "proposal", title: "Proposal PROP-9801 is under review", description: "NeuroBridge requested additional protocol documentation", timestamp: "2025-04-03T09:30:00Z", status: "under_review" },
    { id: "a2", type: "project", title: "Project PRJ-2401 milestone reached", description: "Phase II patient enrollment completed — 62% overall progress", timestamp: "2025-04-02T14:15:00Z", status: "active" },
    { id: "a3", type: "proposal", title: "PROP-9789 accepted", description: "OralBio Labs accepted the PK/PD proposal — contract pending", timestamp: "2025-04-01T10:00:00Z", status: "accepted" },
    { id: "a4", type: "message", title: "New message from Meridian Labs", description: "Query regarding tox safety assessment timeline", timestamp: "2025-03-31T16:45:00Z" },
  ],
  manufacturing: [
    { id: "a1", type: "project", title: "ORD-5498 Sterile batch QC passed", description: "All quality checks cleared. Ready for fill-finish stage", timestamp: "2025-04-03T11:00:00Z", status: "active" },
    { id: "a2", type: "proposal", title: "MFG-4370 PO Raised", description: "FungaCure raised a purchase order for antifungal line", timestamp: "2025-04-02T09:20:00Z", status: "po_raised" },
    { id: "a3", type: "project", title: "ORD-5461 order completed", description: "Antibiotic packaging line order fulfilled and shipped", timestamp: "2025-03-30T17:00:00Z", status: "completed" },
    { id: "a4", type: "system", title: "Capacity alert", description: "Sterile manufacturing suite booked through July 2025", timestamp: "2025-03-29T08:00:00Z", status: "urgent" },
  ],
  scientist: [
    { id: "a1", type: "proposal", title: "SCI-2188 accepted", description: "RNAVax accepted mRNA formulation consultancy proposal", timestamp: "2025-04-03T10:00:00Z", status: "accepted" },
    { id: "a2", type: "project", title: "RES-1101 update published", description: "Preprint submitted to bioRxiv on BCL-2 degradation mechanism", timestamp: "2025-04-01T15:30:00Z", status: "active" },
    { id: "a3", type: "message", title: "Collaboration invite from NanoMed", description: "Team invites you to review nanoparticle synthesis protocol", timestamp: "2025-03-30T12:00:00Z" },
  ],
  researcher: [],
  pi: [],
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const mockTimeline: Record<UserRole, TimelineStep[]> = {
  cro: [
    { id: "t1", label: "Proposal Submitted", date: "Mar 20, 2025", status: "completed", description: "Full protocol documentation sent" },
    { id: "t2", label: "Client Review", date: "Mar 25, 2025", status: "completed", description: "NeuroBridge internal review in progress" },
    { id: "t3", label: "Negotiation", date: "Apr 5, 2025", status: "active", description: "Budget and timeline alignment" },
    { id: "t4", label: "Contract Signing", date: "Apr 15, 2025", status: "pending", description: "MSA and SOW finalization" },
    { id: "t5", label: "Project Kick-off", date: "May 1, 2025", status: "pending", description: "Site setup and team onboarding" },
  ],
  manufacturing: [
    { id: "t1", label: "RFQ Received", date: "Mar 15, 2025", status: "completed", description: "Peptide injection order specifications received" },
    { id: "t2", label: "Feasibility Assessment", date: "Mar 22, 2025", status: "completed", description: "Equipment and capacity confirmed" },
    { id: "t3", label: "Quote Submitted", date: "Mar 28, 2025", status: "completed", description: "Formal quote sent to PeptidePharma" },
    { id: "t4", label: "Client Approval", date: "Apr 8, 2025", status: "active", description: "Awaiting sign-off on technical specs" },
    { id: "t5", label: "Production Start", date: "May 10, 2025", status: "pending", description: "GMP batch manufacturing begins" },
  ],
  scientist: [
    { id: "t1", label: "Research Proposal", date: "Feb 20, 2025", status: "completed", description: "KRAS inhibitor collaboration proposal submitted" },
    { id: "t2", label: "IP Review", date: "Mar 5, 2025", status: "completed", description: "IP agreement reviewed and signed" },
    { id: "t3", label: "Data Sharing", date: "Mar 18, 2025", status: "active", description: "Initial compound data exchange" },
    { id: "t4", label: "Joint Experiments", date: "May 1, 2025", status: "pending", description: "Collaborative lab work begins" },
    { id: "t5", label: "Publication", date: "Sep 1, 2025", status: "pending", description: "Co-authored paper submission" },
  ],
  researcher: [],
  pi: [],
};
