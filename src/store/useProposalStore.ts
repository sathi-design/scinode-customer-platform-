"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalStatus =
  | "Proposal Sent"
  | "Talk to Expert"
  | "Quote Submitted"
  | "Quote Accepted"
  | "Quote Rejected"
  | "PO Issued";

/** Tracks where the negotiation lifecycle is (shared by RFQ + CMO) */
export type NegotiationPhase =
  // Shared
  | "submitted"        // Initial submission, awaiting admin review
  | "under_review"     // RFQ: Admin is reviewing
  | "admin_revised"    // Admin sent a revised quote
  | "supplier_counter" // Supplier submitted a counter-offer / initial CMO quote
  | "accepted"         // Quote accepted
  | "rejected"         // Quote rejected
  | "po_issued"        // PO has been uploaded
  // CMO-specific
  | "talk_to_expert"   // CMO Stage 2: Talk to Expert is active
  | "expert_scheduled" // CMO Stage 2: Call has been scheduled by supplier
  | "quote_pending";   // CMO Stage 3: Awaiting first supplier quote submission

/** A snapshot of a quote (used for initial, admin-revised, and counter-offers) */
export interface QuoteSnapshot {
  qtyValue: string;
  qtyUnit: string;
  costValue: string;
  currency: string;
  costUnit: string;
  timeline: string;
  shipmentTerms: string;
  packaging: string;
  paymentTerms: string;
  productSpec: string;
  termsConditions: string;
}

/** One revision in the negotiation history (both supplier and admin rounds) */
export interface ProposalRevision {
  id: string;
  versionNumber: number;   // 2, 3, 4… (Version 1 = initial proposal fields)
  from: "supplier" | "admin";
  label: string;
  createdAt: string;
  quote: QuoteSnapshot;
  notes?: string;
}

/** CMO-specific post-discussion summary (admin uploads after expert call) */
export interface CMODiscussionSummary {
  projectBrief?: string;
  challenges?: string;
  equipment?: string;
  scale?: string;
}

export interface ProposalRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  projectBadge: string;
  proposalType: "CMO" | "RFQ";
  submittedDate: string;
  status: ProposalStatus;
  // Quantity
  proposedQtyValue: string;
  proposedQtyUnit: string;
  // Technical
  productSpec: string;
  processNotes: string;
  whyGoodFit: string;
  termsConditions: string;
  // Quote fields (RFQ: set at submission; CMO: set at Stage 3)
  costValue: string;
  currency: string;
  costUnit: string;
  timeline: string;
  shipmentTerms: string;
  packaging: string;
  paymentTerms: string;
  // Meta
  fileCount: number;
  cas: string;
  productName: string;
  industry: string;
  // Negotiation lifecycle — defaults applied by store.addProposal
  negotiationPhase: NegotiationPhase;
  revisions: ProposalRevision[];
  adminRevision?: QuoteSnapshot;
  rejectionReason?: string;
  poDocumentUrl?: string;
  // CMO-specific scheduling
  expertCallScheduled?: boolean;
  expertCallDate?: string;
  expertCallTime?: string;
  expertCallTimezone?: string;
  // CMO-specific discussion summary (admin fills after call)
  cmoDiscussionSummary?: CMODiscussionSummary;
}

// ─── Store interface ───────────────────────────────────────────────────────────

interface ProposalStore {
  proposals: ProposalRecord[];
  addProposal: (p: ProposalRecord) => void;
  updateStatus: (id: string, status: ProposalStatus) => void;
  deleteProposal: (id: string) => void;
  updateProposal: (id: string, updates: Partial<ProposalRecord>) => void;
  setNegotiationPhase: (id: string, phase: NegotiationPhase) => void;
  addRevision: (id: string, revision: ProposalRevision) => void;
  setAdminRevision: (id: string, quote: QuoteSnapshot | null) => void;
  setRejection: (id: string, reason: string) => void;
  setPODocument: (id: string, url: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProposalStore = create<ProposalStore>()(
  persist(
    (set) => ({
      proposals: [],

      addProposal: (p) =>
        set((s) => ({
          proposals: [
            {
              ...p,
              negotiationPhase: p.negotiationPhase ?? "submitted",
              revisions: p.revisions ?? [],
            },
            ...s.proposals,
          ],
        })),

      updateStatus: (id, status) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id ? { ...p, status } : p,
          ),
        })),

      deleteProposal: (id) =>
        set((s) => ({
          proposals: s.proposals.filter((p) => p.id !== id),
        })),

      updateProposal: (id, updates) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      setNegotiationPhase: (id, phase) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id ? { ...p, negotiationPhase: phase } : p,
          ),
        })),

      addRevision: (id, revision) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id
              ? { ...p, revisions: [...(p.revisions ?? []), revision] }
              : p,
          ),
        })),

      setAdminRevision: (id, quote) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id
              ? { ...p, adminRevision: quote ?? undefined }
              : p,
          ),
        })),

      setRejection: (id, reason) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id
              ? {
                  ...p,
                  rejectionReason: reason,
                  negotiationPhase: "rejected" as NegotiationPhase,
                  status: "Quote Rejected" as ProposalStatus,
                }
              : p,
          ),
        })),

      setPODocument: (id, url) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id
              ? {
                  ...p,
                  poDocumentUrl: url,
                  negotiationPhase: "po_issued" as NegotiationPhase,
                  status: "PO Issued" as ProposalStatus,
                }
              : p,
          ),
        })),
    }),
    {
      name: "scinode-proposals-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
