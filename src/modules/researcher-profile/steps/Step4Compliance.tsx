"use client";

import { FileText, Download, Eye, Info, ShieldCheck } from "lucide-react";
import { useResearcherProfileStore } from "@/store/useResearcherProfileStore";
import { inputCls, SectionLabel } from "@/modules/profile/SharedUI";
import { cn } from "@/lib/utils";

// ─── Checkbox row ─────────────────────────────────────────────────────────────
function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-[10px] border-2 text-left transition-all duration-150",
        checked
          ? "border-[#018E7E] bg-[#f0faf5]"
          : "border-[#e4e4e7] bg-white hover:border-[#018E7E]/40"
      )}
    >
      <span className={cn(
        "flex-shrink-0 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center mt-0.5 transition-all",
        checked ? "border-[#018E7E] bg-[#018E7E]" : "border-[#cbd5e1] bg-white"
      )}>
        {checked && (
          <svg viewBox="0 0 12 9" fill="none" className="w-3 h-3">
            <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={cn("text-sm leading-relaxed", checked ? "text-[#018E7E] font-medium" : "text-[#374151]")}>
        {children}
      </span>
    </button>
  );
}

// ─── Legal document card ──────────────────────────────────────────────────────
function LegalDocCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[10px] border border-[#e4e4e7] bg-[#fafafa]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-[8px] bg-[#f0faf5] border border-[#d1fae5] flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[#018E7E]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#020202]">{title}</p>
          <p className="text-xs text-[#71717a] truncate">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#e4e4e7] bg-white text-xs font-medium text-[#62748e] hover:bg-[#f0faf5] hover:border-[#018E7E]/30 hover:text-[#018E7E] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#e4e4e7] bg-white text-xs font-medium text-[#62748e] hover:bg-[#f0faf5] hover:border-[#018E7E]/30 hover:text-[#018E7E] transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Compliance & Declaration ───────────────────────────────────────
interface Props {
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const TC_CONTENT = `Welcome to Scinode by Scimplify. By completing and submitting your researcher profile, you agree to the following terms:

1. Accuracy of Information: All information provided in your profile is accurate, current, and truthful. You accept responsibility for any consequences arising from inaccurate or misleading information.

2. Platform Use: Your profile will be used to match you with industry partners for research collaboration, technology transfer, and consulting engagements.

3. Confidentiality: You will not disclose confidential information shared by industry partners without their explicit consent.

4. Intellectual Property: You confirm ownership or appropriate authorisation for all IP listed in your profile.

5. Code of Conduct: You agree to maintain professional conduct in all platform interactions and communications.

6. Data Privacy: Scinode will process your data in accordance with our Privacy Policy. Your profile data may be shared with verified industry partners based on matching criteria.

7. Modifications: Scinode reserves the right to update these terms. Continued use of the platform constitutes acceptance of any modifications.`;

export function Step4Compliance({ onBack, onSubmit, canSubmit }: Props) {
  const data    = useResearcherProfileStore((s) => s.data);
  const setData = useResearcherProfileStore((s) => s.setData);

  const tcComplete =
    data.termsAgreed &&
    (data.termsSignName ?? "").trim().length > 0 &&
    (data.termsSignDate ?? "").length > 0;

  return (
    <>
      {/* ── Section 1: Terms & Conditions ───────────────────────────── */}
      <div className="px-4 sm:px-5 py-5 border-b border-[#F3F4F6] flex flex-col gap-4">
        <div>
          <SectionLabel>Terms & Conditions <span className="text-red-500">*</span></SectionLabel>
          <p className="text-xs text-[#62748e] mt-0.5">Read and accept the platform terms. Your name and date act as a digital signature.</p>
        </div>

        {/* T&C scrollable box */}
        <div className="rounded-[10px] border border-[#e4e4e7] bg-[#fafafa] p-4 max-h-48 overflow-y-auto">
          <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-line">{TC_CONTENT}</p>
        </div>

        {/* Agreement checkbox */}
        <CheckRow
          checked={data.termsAgreed}
          onChange={(v) => setData({ termsAgreed: v })}
        >
          I have read and agree to the Scinode Platform Terms & Conditions.
        </CheckRow>

        {/* Digital signature fields */}
        {data.termsAgreed && (
          <div className="flex flex-col gap-4 p-4 rounded-[10px] bg-[#f8faff] border border-[#dbeafe]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-700">Digital Signature</span>
              <span className="text-[10px] text-blue-500">— This acts as your legally binding e-signature</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#020202]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={cn(inputCls, !(data.termsSignName ?? "").trim() && "border-amber-300")}
                  value={data.termsSignName ?? ""}
                  onChange={(e) => setData({ termsSignName: e.target.value })}
                  placeholder="Enter your full legal name"
                />
                {!(data.termsSignName ?? "").trim() && (
                  <p className="text-xs text-amber-600">Required for digital signature</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#020202]">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={cn(inputCls, !(data.termsSignDate ?? "") && "border-amber-300")}
                  value={data.termsSignDate ?? ""}
                  onChange={(e) => setData({ termsSignDate: e.target.value })}
                />
                {!data.termsSignDate && (
                  <p className="text-xs text-amber-600">Required for digital signature</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 3: Legal Documents (Admin Controlled) ───────────── */}
      <div className="px-4 sm:px-5 py-5 flex flex-col gap-4">
        <div>
          <SectionLabel>Legal Documents</SectionLabel>
          <p className="text-xs text-[#62748e] mt-0.5">
            Admin-controlled documents. You can view and download — editing or uploading is not permitted.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <LegalDocCard
            title="Non-Circumvention Agreement"
            description="Protects all parties from bypassing established relationships on the platform."
          />
          <LegalDocCard
            title="Memorandum of Understanding (MOU)"
            description="Outlines the terms of collaboration between researcher and industry partner."
          />
          <LegalDocCard
            title="Non-Disclosure Agreement (NDA)"
            description="Governs confidential information shared during research collaborations."
          />
        </div>

        {/* Admin note — neutral gray, clearly secondary */}
        <div className="rounded-[8px] bg-[#f7f7f8] border border-[#e4e4e7] p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#9ca3af] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#71717a] leading-relaxed">
            These documents are uploaded and managed by the Scinode admin team. They will be made available for your review before any engagement begins.
          </p>
        </div>
      </div>

      {/* ── Platform Integrity Notice — teal brand banner ───────────── */}
      <div className="mx-4 sm:mx-5 mb-5">
        <div className="rounded-[10px] p-4 flex items-start gap-3 bg-[#f0faf5] border border-[#a7f3d0]">
          <ShieldCheck className="w-5 h-5 text-[#018E7E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#065f46] mb-1">PLATFORM INTEGRITY NOTICE</p>
            <p className="text-xs text-[#047857] leading-relaxed">
              By submitting, your profile becomes searchable by verified Scinodes. Ensure
              technical data matches lab capabilities to avoid rejection during audit.
            </p>
          </div>
        </div>
      </div>

      {/* ── Submit readiness ─────────────────────────────────────────── */}
      {!tcComplete && (
        <div className="mx-4 sm:mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
          <p className="text-xs font-semibold text-amber-700 mb-1">To submit your profile, complete:</p>
          <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
            {!data.termsAgreed && <li>Accept the Terms & Conditions</li>}
            {data.termsAgreed && !(data.termsSignName ?? "").trim() && <li>Enter your full name (digital signature)</li>}
            {data.termsAgreed && !(data.termsSignDate ?? "") && <li>Select the signature date</li>}
          </ul>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#e4e4e7] px-4 sm:px-5 py-3 flex items-center justify-between bg-white rounded-b-[12px]">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[#71717a] hover:text-[#020202] transition-colors px-3 py-2 rounded-[6px] hover:bg-[#f7f7f7]"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-sm font-semibold transition-all",
            canSubmit
              ? "bg-[#1F6F54] hover:bg-[#185C45] text-white shadow-sm"
              : "bg-[#e4e4e7] text-[#9ca3af] cursor-not-allowed"
          )}
        >
          Submit Profile →
        </button>
      </div>
    </>
  );
}
