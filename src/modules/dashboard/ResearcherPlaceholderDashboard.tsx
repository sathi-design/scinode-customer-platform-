"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";

export function ResearcherPlaceholderDashboard() {
  const router = useRouter();
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-full flex items-center justify-center py-16 px-6">
      <div className="max-w-[480px] w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#f0faf5] border-2 border-[#86efac] flex items-center justify-center mx-auto mb-6">
          <FlaskConical className="w-9 h-9 text-[#018E7E]" />
        </div>

        {/* Heading */}
        <h1 className="text-[26px] font-semibold text-[#111] mb-3 tracking-tight">
          Researcher Dashboard
        </h1>

        {/* Description */}
        <p className="text-[14px] text-[#64748b] leading-relaxed mb-8 max-w-[400px] mx-auto">
          We're currently building your dashboard to help you manage projects, proposals,
          collaborations, and research workflows seamlessly. Advanced features are coming soon.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="h-[42px] px-6 bg-[#018E7E] hover:bg-[#016B5F] text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
          >
            Complete Your Profile <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setNotified(true)}
            disabled={notified}
            className={`h-[42px] px-6 border text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-2 transition-all ${
              notified
                ? "border-[#018E7E] bg-[#f0faf5] text-[#018E7E] cursor-default"
                : "border-[#cbd5e1] bg-white text-[#64748b] hover:border-[#018E7E] hover:text-[#018E7E] hover:bg-[#f0faf5]"
            }`}
          >
            {notified ? (
              <><CheckCircle2 className="w-4 h-4" /> You&apos;re on the list!</>
            ) : (
              "Notify Me on Launch"
            )}
          </button>
        </div>

        {/* Confirmation message */}
        {notified && (
          <p className="mt-4 text-[12px] text-[#1F6F54] animate-in fade-in duration-300">
            We&apos;ll notify you as soon as your dashboard is ready.
          </p>
        )}
      </div>
    </div>
  );
}
