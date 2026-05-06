"use client";

import { Download, FileText, CheckCircle2, PenLine } from "lucide-react";
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

  const canSign = agreed && sigName.trim().length > 0;

  const handleSign = () => {
    if (!canSign) return;
    setTerms({
      signed: true,
      sigDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    });
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 pb-2 flex flex-col gap-5">

        {/* Document header card */}
        <div className="rounded-[10px] border border-[#e4e4e7] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f6] bg-[#f9fafb]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#1F6F54]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#1F6F54]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#020202]">ATOMS Supplier Platform</p>
                <p className="text-xs text-[#9ca3af]">Terms &amp; Conditions Agreement</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#cbd5e1] text-sm font-medium text-[#353535] hover:bg-[#f7f7f7] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* Document body — scrollable */}
          <div className="px-6 py-5 max-h-[340px] overflow-y-auto bg-white">
            <h3 className="text-sm font-bold text-[#020202] mb-4 text-center uppercase tracking-wide">
              Supplier Agreement — Terms of Service
            </h3>
            <div className="text-sm text-[#353535] space-y-4 leading-relaxed">
              <p>By registering and submitting your profile on the ATOMS Supplier Platform, you agree to these Terms of Service. These terms govern your use of the platform and define your rights and obligations as a supplier.</p>
              <div>
                <p className="font-semibold text-[#020202] mb-1">1. Profile Accuracy</p>
                <p>You represent and warrant that all information submitted is accurate, complete, and up to date. ATOMS reserves the right to verify any claim and may suspend or remove your profile if information is found to be misleading or inaccurate.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">2. Confidentiality</p>
                <p>Project briefs, buyer requirements, and proposals exchanged on the platform are confidential. You agree not to disclose any such information to third parties without written consent from ATOMS.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">3. Intellectual Property</p>
                <p>All project specifications shared by buyers remain their intellectual property. As a supplier, you may use such information solely to prepare and submit a proposal on the ATOMS platform.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">4. Data Usage</p>
                <p>ATOMS may use anonymised supplier capability data for platform improvement, market analysis, and matching algorithms. No personally identifiable business information will be shared without explicit consent.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">5. Code of Conduct</p>
                <p>Suppliers agree to engage in all platform interactions professionally and in good faith. Any form of misrepresentation, price manipulation, or direct circumvention of the ATOMS platform is grounds for immediate account suspension.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">6. Payment &amp; Commission</p>
                <p>Where applicable, ATOMS may charge a platform fee or commission on successful projects. These rates are agreed separately during onboarding and subject to 30 days notice for changes.</p>
              </div>
              <div>
                <p className="font-semibold text-[#020202] mb-1">7. Termination</p>
                <p>Either party may terminate the supplier agreement with 14 days written notice. ATOMS may terminate immediately for breach of any of these terms.</p>
              </div>
              <p className="text-xs text-[#9ca3af] pt-2 border-t border-[#f3f4f6]">Last updated: April 2025 · ATOMS Global Pvt. Ltd.</p>
            </div>
          </div>
        </div>

        {/* Signature section */}
        {!signed ? (
          <div className="rounded-[10px] border border-[#e4e4e7] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-[#1F6F54]" />
              <p className="text-sm font-semibold text-[#020202]">Sign Document</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setTerms({ agreed: !agreed })}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  agreed ? "bg-[#1F6F54] border-[#1F6F54]" : "border-[#cbd5e1] hover:border-[#1F6F54]/50"
                }`}
              >
                {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <p className="text-sm text-[#353535] leading-relaxed">
                I have read, understood, and agree to the ATOMS Supplier Platform Terms &amp; Conditions, including the confidentiality and data usage provisions.
              </p>
            </label>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#020202]">Full Name (as signature)</label>
              <input
                className={inputCls}
                value={sigName}
                onChange={(e) => setTerms({ sigName: e.target.value })}
                placeholder="Type your full legal name to sign"
              />
            </div>

            <button
              onClick={handleSign}
              disabled={!canSign}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-medium transition-colors w-full ${
                canSign
                  ? "bg-[#1F6F54] hover:bg-[#185C45] text-white"
                  : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              <PenLine className="w-4 h-4" />
              Sign &amp; Accept
            </button>

            {!canSign && (
              <p className="text-xs text-[#9ca3af] text-center -mt-2">
                Check the agreement box and enter your name to sign.
              </p>
            )}
          </div>
        ) : (
          /* Signed confirmation */
          <div className="rounded-[10px] border border-[#1F6F54]/30 bg-[#f0faf5] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1F6F54]" />
              <p className="text-sm font-semibold text-[#1F6F54]">Document Signed</p>
            </div>
            <div className="border border-[#1F6F54]/20 rounded-[8px] bg-white px-4 py-3 flex flex-col gap-1">
              <p className="text-xs text-[#9ca3af]">Signed by</p>
              <p className="text-base font-semibold text-[#020202] font-serif italic">{sigName}</p>
              <p className="text-xs text-[#9ca3af] mt-0.5">Date: {sigDate}</p>
            </div>
            <p className="text-xs text-[#62748e]">
              A copy of the signed agreement will be sent to your registered email address.
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm font-medium text-[#1F6F54] hover:underline w-fit"
            >
              <Download className="w-3.5 h-3.5" /> Download signed copy
            </button>
          </div>
        )}

      </div>
      {/* navigation handled by ProfileSetup header */}
    </div>
  );
}
