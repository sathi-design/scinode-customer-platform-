"use client";

import { useEffect } from "react";
import { Download, FileText, CheckCircle2, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputCls } from "../SharedUI";
import { useProfileStore } from "@/store/useProfileStore";

export function TermsCondition({
  onNext, onBack, isLast,
}: {
  onNext: () => void; onBack: () => void; isLast?: boolean;
}) {
  const terms    = useProfileStore((s) => s.terms);
  const setTerms = useProfileStore((s) => s.setTerms);

  const { agreed, sigName, signed, sigDate } = terms;

  // Pre-fill today's date (YYYY-MM-DD for <input type="date">) on first load
  useEffect(() => {
    if (!sigDate) {
      setTerms({ sigDate: new Date().toISOString().split("T")[0] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSign = agreed && sigName.trim().length > 0 && !!sigDate;

  const handleSign = () => {
    if (!canSign) return;
    // Convert YYYY-MM-DD → DD/MM/YYYY for display
    const [y, m, d] = sigDate.split("-");
    const displayDate = `${d}/${m}/${y}`;
    setTerms({ signed: true, sigDate: displayDate });
  };

  return (
    <div className="flex flex-col">
      <div className="p-5 sm:p-6 pb-4 flex flex-col gap-5">

        {/* ── Terms document card ───────────────────────────────────── */}
        <div className="rounded-[10px] border border-[#e4e4e7] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f6] bg-[#f9fafb]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#1F6F54]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#1F6F54]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#020202]">Scinode Supplier Platform</p>
                <p className="text-[11px] text-[#9ca3af]">Terms &amp; Conditions Agreement</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#cbd5e1] text-[12px] font-medium text-[#353535] hover:bg-[#f7f7f7] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* Scrollable document body */}
          <div className="px-6 py-5 max-h-[320px] overflow-y-auto bg-white">
            <h3 className="text-[13px] font-bold text-[#020202] mb-4 text-center uppercase tracking-wide">
              Supplier Agreement — Terms of Service
            </h3>
            <div className="text-[13px] text-[#353535] space-y-4 leading-relaxed">
              <p>By registering and submitting your profile on the Scinode Supplier Platform, you agree to these Terms of Service. These terms govern your use of the platform and define your rights and obligations as a supplier.</p>
              <div>
                <p className="font-semibold text-[#020202] mb-1">1. Profile Accuracy</p>
                <p>You represent and warrant that all information submitted is accurate, complete, and up to date. Scinode reserves the right to verify any claim and may suspend or remove your profile if information is found to be misleading or inaccurate.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">2. Confidentiality</p>
                <p>Project briefs, buyer requirements, and proposals exchanged on the platform are confidential. You agree not to disclose any such information to third parties without written consent from Scinode.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">3. Intellectual Property</p>
                <p>All project specifications shared by buyers remain their intellectual property. As a supplier, you may use such information solely to prepare and submit a proposal on the Scinode platform.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">4. Data Usage</p>
                <p>Scinode may use anonymised supplier capability data for platform improvement, market analysis, and matching algorithms. No personally identifiable business information will be shared without explicit consent.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">5. Code of Conduct</p>
                <p>Suppliers agree to engage in all platform interactions professionally and in good faith. Any form of misrepresentation, price manipulation, or direct circumvention of the Scinode platform is grounds for immediate account suspension.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">6. Payment &amp; Commission</p>
                <p>Where applicable, Scinode may charge a platform fee or commission on successful projects. These rates are agreed separately during onboarding and subject to 30 days notice for changes.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">7. Termination</p>
                <p>Either party may terminate the supplier agreement with 14 days written notice. Scinode may terminate immediately for breach of any of these terms.</p>
              </div>
              <p className="text-[11px] text-[#9ca3af] pt-2 border-t border-[#f3f4f6]">Last updated: April 2025 · Scinode Global Pvt. Ltd.</p>
            </div>
          </div>
        </div>

        {/* ── Agreement + Digital Signature ─────────────────────────── */}
        {!signed ? (
          <>
            {/* Agreement checkbox */}
            <button
              type="button"
              onClick={() => setTerms({ agreed: !agreed })}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all",
                agreed
                  ? "border-[#1F6F54] bg-[#f0faf5]"
                  : "border-[#e4e4e7] hover:border-[#1F6F54]/40 bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                agreed ? "bg-[#1F6F54] border-[#1F6F54]" : "border-[#cbd5e1]"
              )}>
                {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <p className="text-[14px] font-medium text-[#020202] leading-snug">
                I have read and agree to the Scinode Platform Terms &amp; Conditions.
              </p>
            </button>

            {/* Digital Signature section */}
            <div className="rounded-xl border border-[#e4e4e7] bg-[#f9fafb] overflow-hidden">
              {/* Section header */}
              <div className="px-5 py-3.5 border-b border-[#e4e4e7] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0077CC] flex-shrink-0" />
                <p className="text-[13px] font-semibold text-[#0077CC]">Digital Signature</p>
                <span className="text-[#cbd5e1] text-[13px]">—</span>
                <p className="text-[12px] text-[#9ca3af]">This acts as your legally binding e-signature</p>
              </div>

              {/* Fields */}
              <div className="px-5 py-5 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Authorized Signatory Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-[#020202]">
                      Authorized Signatory Name <span className="text-[#C30E1A]">*</span>
                    </label>
                    <input
                      className={inputCls}
                      value={sigName}
                      onChange={(e) => setTerms({ sigName: e.target.value })}
                      placeholder="Enter full legal name"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-[#020202]">
                      Date <span className="text-[#C30E1A]">*</span>
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={sigDate}
                      onChange={(e) => setTerms({ sigDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Sign button */}
                <button
                  onClick={handleSign}
                  disabled={!canSign}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    canSign
                      ? "bg-[#1F6F54] hover:bg-[#185C45] text-white"
                      : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                  )}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Sign &amp; Accept
                </button>

                {!canSign && (
                  <p className="text-[11px] text-[#9ca3af] text-center -mt-3">
                    {!agreed
                      ? "Check the agreement box above to continue."
                      : !sigName.trim()
                        ? "Enter your authorised signatory name to sign."
                        : "Select a date to sign."}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (

          /* ── Signed confirmation state ─────────────────────────────── */
          <div className="rounded-xl border border-[#1F6F54]/30 bg-[#f0faf5] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#1F6F54]/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F54]" />
              <p className="text-[13px] font-semibold text-[#1F6F54]">Document Signed</p>
            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Signed agreement row */}
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-[#1F6F54] bg-[#f0faf5]">
                <div className="w-5 h-5 rounded-[4px] bg-[#1F6F54] border-2 border-[#1F6F54] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-medium text-[#020202]">
                  I have read and agree to the Scinode Platform Terms &amp; Conditions.
                </p>
              </div>

              {/* Digital Signature display */}
              <div className="rounded-xl border border-[#e4e4e7] bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0077CC] flex-shrink-0" />
                  <p className="text-[13px] font-semibold text-[#0077CC]">Digital Signature</p>
                  <span className="text-[#cbd5e1] text-[13px]">—</span>
                  <p className="text-[12px] text-[#9ca3af]">This acts as your legally binding e-signature</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">Authorized Signatory Name</p>
                    <p className="text-[15px] font-semibold text-[#020202] font-serif italic">{sigName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">Date</p>
                    <p className="text-[14px] font-medium text-[#020202]">{sigDate}</p>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-[#62748e]">
                A copy of the signed agreement will be sent to your registered email address.
              </p>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#1F6F54] hover:underline w-fit"
              >
                <Download className="w-3.5 h-3.5" /> Download signed copy
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
