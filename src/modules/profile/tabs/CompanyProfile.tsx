"use client";

import { useState, useEffect } from "react";
import { Upload, Eye, EyeOff, Edit3 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProfileStore } from "@/store/useProfileStore";
import {
  FormField, inputCls, DropdownSelect, SectionLabel,
  PillInput, YNToggle, ChipGroup,
} from "../SharedUI";
import { INDUSTRIES, REACTION_TYPES, AUTOMATION_TYPES } from "../constants";

interface Props { onNext: () => void; isFirst?: boolean; }

export function CompanyProfile({ onNext, isFirst }: Props) {
  const signupData = useAppStore((s) => s.signup.formData) as Record<string, unknown>;
  const user       = useAppStore((s) => s.user);

  const company    = useProfileStore((s) => s.company);
  const setCompany = useProfileStore((s) => s.setCompany);

  // UI-only local state (no persistence needed)
  const [viewAsCustomer, setViewAsCustomer] = useState(false);

  // Seed from signup data on first load only (when store values are still empty)
  useEffect(() => {
    if (!company.companyName && !company.address) {
      setCompany({
        address:     (signupData?.location     as string) ?? "",
        companyName: (signupData?.facilityName as string) ?? (user?.name ?? ""),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── View as Customer toggle + Edit Profile CTA ─────────────────────── */}
      <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#f3f4f6]">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setViewAsCustomer((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              viewAsCustomer ? "bg-[#1F6F54]" : "bg-[#cbd5e1]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                viewAsCustomer ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="flex items-center gap-1.5 text-sm text-[#62748e]">
            {viewAsCustomer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {viewAsCustomer ? "Viewing as Customer" : "View as Customer"}
          </span>
        </label>

        {!viewAsCustomer && (
          <button className="flex items-center gap-1.5 text-sm font-medium text-[#1F6F54] hover:underline">
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* ── Customer view ────────────────────────────────────────────────────── */}
      {viewAsCustomer && (
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-5">
          <div className="rounded-[10px] border border-[#e4e4e7] bg-[#f9fafb] p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Customer-Facing Preview
            </p>
            {company.companyDesc && (
              <div>
                <p className="text-xs font-medium text-[#62748e] mb-1">About</p>
                <p className="text-sm text-[#020202] leading-relaxed">{company.companyDesc}</p>
              </div>
            )}
            {(company.address || company.stateCountry) && (
              <div>
                <p className="text-xs font-medium text-[#62748e] mb-1">Location</p>
                <p className="text-sm text-[#020202]">{[company.address, company.stateCountry].filter(Boolean).join(", ")}</p>
              </div>
            )}
            {company.industries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#62748e] mb-1.5">Industries</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.industries.map((i) => (
                    <span key={i} className="text-xs bg-[#f0faf5] text-[#1F6F54] border border-[#1F6F54]/20 px-2.5 py-0.5 rounded-full">{i}</span>
                  ))}
                  {company.otherIndustry && <span className="text-xs bg-[#f0faf5] text-[#1F6F54] border border-[#1F6F54]/20 px-2.5 py-0.5 rounded-full">{company.otherIndustry}</span>}
                </div>
              </div>
            )}
            {company.reactions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#62748e] mb-1.5">Reactions</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.reactions.map((r) => (
                    <span key={r} className="text-xs bg-white text-[#353535] border border-[#e4e4e7] px-2.5 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {company.uniqueCaps.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#62748e] mb-1.5">Unique Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.uniqueCaps.map((c) => (
                    <span key={c} className="text-xs bg-white text-[#353535] border border-[#e4e4e7] px-2.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {!company.companyDesc && !company.address && company.industries.length === 0 && (
              <p className="text-sm text-[#9ca3af] text-center py-6">
                Fill in the fields below to preview how customers will see your profile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Edit view ────────────────────────────────────────────────────────── */}
      {!viewAsCustomer && (
        <div className="p-4 sm:p-6 pb-2 flex flex-col gap-6">

          {/* Section 1 */}
          <div className="flex flex-col gap-5">
            <SectionLabel>Visible to Customers</SectionLabel>

            <FormField label="Company Description *">
              <textarea className={inputCls + " resize-none"} rows={3}
                value={company.companyDesc}
                onChange={(e) => setCompany({ companyDesc: e.target.value })}
                placeholder="Briefly describe your company, core focus areas, and what sets you apart…" />
            </FormField>

            <FormField label="Address *">
              <input className={inputCls} value={company.address}
                onChange={(e) => setCompany({ address: e.target.value })}
                placeholder="e.g. Plot 42, MIDC Industrial Area, Ankleshwar" />
            </FormField>

            <FormField label="State & Country *">
              <input className={inputCls} value={company.stateCountry}
                onChange={(e) => setCompany({ stateCountry: e.target.value })}
                placeholder="e.g. Gujarat, India" />
            </FormField>

            <FormField label="Industries *" hint="Select all that apply.">
              <ChipGroup options={INDUSTRIES} selected={company.industries}
                onChange={(v) => setCompany({ industries: v })} />
              <input className={inputCls + " mt-2"} value={company.otherIndustry}
                onChange={(e) => setCompany({ otherIndustry: e.target.value })}
                placeholder="Other industry (optional)" />
            </FormField>

            <FormField label="Reactions *" hint="Select all reaction types your facility can handle.">
              <ChipGroup options={REACTION_TYPES} selected={company.reactions}
                onChange={(v) => setCompany({ reactions: v })} />
              <input className={inputCls + " mt-2"} value={company.otherReaction}
                onChange={(e) => setCompany({ otherReaction: e.target.value })}
                placeholder="Other reaction type (optional)" />
            </FormField>

            <FormField label="Unique Capabilities *" hint="Type a capability and press Enter to add it as a pill.">
              <PillInput pills={company.uniqueCaps}
                onChange={(v) => setCompany({ uniqueCaps: v })}
                placeholder="e.g. High-pressure hydrogenation, Chiral synthesis…" />
            </FormField>

            <FormField label="Plant Images">
              <label className="flex items-center gap-2 border border-dashed border-[#cbd5e1] rounded-[6px] px-3 py-3 text-sm text-[#9ca3af] cursor-pointer hover:border-[#1F6F54]/50 transition-colors w-full">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span>{company.plantImage || "Upload image / PNG"}</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => setCompany({ plantImage: e.target.files?.[0]?.name ?? "" })} />
              </label>
            </FormField>
          </div>

          {/* Section 2 */}
          <div className="flex flex-col gap-5 pt-2">
            <SectionLabel>Internal Information</SectionLabel>
            <p className="text-xs text-[#1F6F54] -mt-3 bg-[#f0faf5] border border-[#d1fae5] rounded-[6px] px-3 py-2">
              🔒 These details are kept strictly confidential and will never be shared with customers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Company Name *">
                <input className={inputCls} value={company.companyName}
                  onChange={(e) => setCompany({ companyName: e.target.value })}
                  placeholder="e.g. Mehta Speciality Chemicals Pvt. Ltd." />
              </FormField>
              <FormField label="Company Owner Name *">
                <input className={inputCls} value={company.ownerName}
                  onChange={(e) => setCompany({ ownerName: e.target.value })}
                  placeholder="e.g. Rajesh Mehta" />
              </FormField>
            </div>

            <FormField label="Company Logo *">
              <label className="flex items-center gap-2 border border-dashed border-[#cbd5e1] rounded-[6px] px-3 py-3 text-sm text-[#9ca3af] cursor-pointer hover:border-[#1F6F54]/50 transition-colors w-full">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span>{company.logoFile || "Upload logo (PNG / SVG)"}</span>
                <input type="file" accept="image/*,.svg" className="hidden"
                  onChange={(e) => setCompany({ logoFile: e.target.files?.[0]?.name ?? "" })} />
              </label>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone Number *">
                <input className={inputCls} value={company.phone} type="tel"
                  onChange={(e) => setCompany({ phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210" />
              </FormField>
              <FormField label="Company Identification Number *">
                <input className={inputCls} value={company.cin}
                  onChange={(e) => setCompany({ cin: e.target.value })}
                  placeholder="e.g. U24100MH2010PTC123456" />
              </FormField>
            </div>

            <FormField label="GST / VAT *">
              <input className={inputCls} value={company.gst}
                onChange={(e) => setCompany({ gst: e.target.value })}
                placeholder="e.g. 27AABCU9603R1ZX" />
            </FormField>

            <FormField label="Automation (DCS / PLC)">
              <YNToggle value={company.automation}
                onChange={(v) => setCompany({ automation: v })} />
            </FormField>

            {company.automation === true && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in-0 duration-200">
                <FormField label="Type of Automation">
                  <DropdownSelect
                    value={company.autoType}
                    onChange={(v) => setCompany({ autoType: v })}
                    options={AUTOMATION_TYPES}
                    placeholder="Select type"
                  />
                </FormField>
                <FormField label="Automation Coverage (%)">
                  <div className="flex items-center gap-2">
                    <input className={inputCls} type="number" min="0" max="100"
                      value={company.autoPct}
                      onChange={(e) => setCompany({ autoPct: e.target.value })}
                      placeholder="e.g. 60" />
                    <span className="text-sm text-[#9ca3af] flex-shrink-0">%</span>
                  </div>
                </FormField>
              </div>
            )}

            <FormField label="Pilot Plant Available">
              <YNToggle value={company.pilotPlant}
                onChange={(v) => setCompany({ pilotPlant: v })} />
            </FormField>
          </div>

        </div>
      )}

      {/* navigation handled by ProfileSetup header */}
    </div>
  );
}
