"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, ChevronDown, X, ImageIcon } from "lucide-react";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import {
  FormField, inputCls, DropdownSelect,
  PillInput, YNToggle, TabFooter,
} from "@/modules/profile/SharedUI";
import { CRO_MODEL_TYPES, CRO_INDUSTRIES, CRO_EMPLOYEE_RANGES } from "../constants";
import { cn } from "@/lib/utils";

const AUTOMATION_TYPES = ["DCS", "PLC", "SCADA", "DCS + PLC", "DCS + SCADA", "None"] as const;

interface Props { onNext: () => void; onBack?: () => void; }

export function Tab1CompanyProfile({ onNext, onBack }: Props) {
  const company    = useIndependentCROProfileStore((s) => s.company);
  const setCompany = useIndependentCROProfileStore((s) => s.setCompany);

  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);

  // When Pilot Plant = No, clear dependent fields
  useEffect(() => {
    if (company.pilotPlant === false) {
      setCompany({ automation: null, analyticalLab: null, autoType: "", autoPct: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.pilotPlant]);

  // Close industries dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleIndustry = (val: string) => {
    const cur = company.industries;
    setCompany({
      industries: cur.includes(val) ? cur.filter((i) => i !== val) : [...cur, val],
    });
  };

  // Multiple lab image upload
  const labImages: string[] = company.labImageFiles ?? [];
  const handleLabImages = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setCompany({ labImageFiles: [...labImages, ...names] });
  };
  const removeLabImage = (name: string) =>
    setCompany({ labImageFiles: labImages.filter((n) => n !== name) });

  return (
    <div className="p-6 space-y-5">

      {/* ── Row 1: Owner + Company name ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={<>Owner Name <span className="text-red-500">*</span></>}>
          <input
            className={inputCls}
            value={company.ownerName}
            onChange={(e) => setCompany({ ownerName: e.target.value })}
            placeholder="e.g. Dr. Rahul Sharma"
          />
        </FormField>
        <FormField label={<>Company Name <span className="text-red-500">*</span></>}>
          <input
            className={inputCls}
            value={company.companyName}
            onChange={(e) => setCompany({ companyName: e.target.value })}
            placeholder="e.g. BioPath Research Pvt. Ltd."
          />
        </FormField>
      </div>

      {/* ── Row 2: CIN + Year ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={<>Company Identification Number (CIN) <span className="text-red-500">*</span></>}>
          <input
            className={inputCls}
            value={company.companyIdNumber}
            onChange={(e) => setCompany({ companyIdNumber: e.target.value })}
            placeholder="e.g. U74900MH2010PTC123456"
          />
        </FormField>
        <FormField label={<>Year Established <span className="text-red-500">*</span></>}>
          <input
            className={inputCls}
            value={company.yearEstablished}
            onChange={(e) => setCompany({ yearEstablished: e.target.value })}
            placeholder="e.g. 2010"
          />
        </FormField>
      </div>

      {/* ── Row 3: Employees + Model Type ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={<>Number of Employees <span className="text-red-500">*</span></>}>
          <DropdownSelect
            value={company.numberOfEmployees}
            onChange={(v) => setCompany({ numberOfEmployees: v })}
            options={CRO_EMPLOYEE_RANGES}
            placeholder="Select range"
          />
        </FormField>
        <FormField label="Engagement Model Type">
          <DropdownSelect
            value={company.modelType}
            onChange={(v) => setCompany({ modelType: v })}
            options={CRO_MODEL_TYPES}
            placeholder="Select model type"
          />
        </FormField>
      </div>

      {/* ── Address ────────────────────────────────────────────────── */}
      <FormField label={<>Address <span className="text-red-500">*</span></>}>
        <input
          className={inputCls}
          value={company.address}
          onChange={(e) => setCompany({ address: e.target.value })}
          placeholder="e.g. Plot 12, Pharma City, Hyderabad"
        />
      </FormField>

      {/* ── State & Country ────────────────────────────────────────── */}
      <FormField label={<>State &amp; Country <span className="text-red-500">*</span></>}>
        <input
          className={inputCls}
          value={company.stateCountry}
          onChange={(e) => setCompany({ stateCountry: e.target.value })}
          placeholder="e.g. Maharashtra, India"
        />
      </FormField>

      {/* ── Industries multi-select ────────────────────────────────── */}
      <FormField label="Industries">
        <div className="relative" ref={industryRef}>
          <button
            type="button"
            onClick={() => setIndustryOpen((v) => !v)}
            className={cn(inputCls, "text-left flex items-center justify-between")}
          >
            <span className={company.industries.length === 0 ? "text-[#9ca3af]" : "text-[#020202]"}>
              {company.industries.length === 0 ? "Select industries…" : `${company.industries.length} selected`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
          </button>
          {industryOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded-[6px] shadow-md max-h-52 overflow-y-auto">
              {[...CRO_INDUSTRIES, "Other" as const].map((ind) => (
                <label key={ind} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f0faf5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={company.industries.includes(ind)}
                    onChange={() => toggleIndustry(ind)}
                    className="w-4 h-4 accent-[#1F6F54]"
                  />
                  <span className="text-sm text-[#020202]">{ind}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {company.industries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {company.industries.map((ind) => (
              <span key={ind} className="flex items-center gap-1 bg-[#e6f4ef] text-[#1F6F54] text-xs font-medium px-2 py-0.5 rounded-full">
                {ind}
                <button type="button" onClick={() => toggleIndustry(ind)} className="hover:text-[#185C45]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {company.industries.includes("Other") && (
          <input
            className={cn(inputCls, "mt-2")}
            value={company.industryOther}
            onChange={(e) => setCompany({ industryOther: e.target.value })}
            placeholder="Specify other industry"
          />
        )}
      </FormField>

      {/* ── Company Description ────────────────────────────────────── */}
      <FormField label="Company Description">
        <textarea
          className={cn(inputCls, "resize-none")}
          rows={4}
          value={company.description}
          onChange={(e) => setCompany({ description: e.target.value })}
          placeholder="Briefly describe your CRO, core capabilities, and what sets you apart…"
        />
      </FormField>

      {/* ── Logo upload ────────────────────────────────────────────── */}
      <FormField label="Company Logo">
        <label className="border-2 border-dashed border-[#cbd5e1] rounded-[10px] p-6 text-center cursor-pointer hover:border-[#1F6F54]/50 transition-colors block">
          <Upload className="w-6 h-6 text-[#9ca3af] mx-auto mb-2" />
          <p className="text-sm text-[#9ca3af]">{company.logoFile ?? "Upload logo (PNG / JPEG)"}</p>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => setCompany({ logoFile: e.target.files?.[0]?.name ?? null })}
          />
        </label>
        {company.logoFile && (
          <p className="text-xs text-[#1F6F54] mt-1 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> {company.logoFile}
          </p>
        )}
      </FormField>

      {/* ── Lab Images — MULTIPLE upload ───────────────────────────── */}
      <FormField label="Lab Images">
        <label className="border-2 border-dashed border-[#cbd5e1] rounded-[10px] p-5 text-center cursor-pointer hover:border-[#1F6F54]/50 transition-colors block">
          <Upload className="w-6 h-6 text-[#9ca3af] mx-auto mb-2" />
          <p className="text-sm text-[#9ca3af]">Upload lab images (JPG / PNG) — multiple allowed</p>
          <p className="text-xs text-[#c4c9d4] mt-0.5">Click to browse or drag & drop</p>
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple
            className="hidden"
            onChange={(e) => handleLabImages(e.target.files)}
          />
        </label>

        {/* Thumbnail preview grid */}
        {labImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
            {labImages.map((name) => (
              <div key={name} className="relative group rounded-[6px] border border-[#e4e4e7] bg-[#f9fafb] p-2 flex flex-col items-center gap-1 min-w-0">
                <ImageIcon className="w-5 h-5 text-[#9ca3af]" />
                <p className="text-[10px] text-[#62748e] truncate w-full text-center">{name}</p>
                <button
                  type="button"
                  onClick={() => removeLabImage(name)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </FormField>

      {/* ── Unique Capabilities ────────────────────────────────────── */}
      <FormField label={<>Unique Capabilities <span className="text-red-500">*</span></>}>
        <PillInput
          pills={company.uniqueCapabilities}
          onChange={(v) => setCompany({ uniqueCapabilities: v })}
          placeholder="Type a capability and press Enter"
        />
      </FormField>

      {/* ── Pilot Plant (at top of toggle section) ─────────────────── */}
      <FormField label={<>Pilot Plant <span className="text-red-500">*</span></>}>
        <YNToggle
          value={company.pilotPlant}
          onChange={(v) => setCompany({ pilotPlant: v })}
        />
      </FormField>

      {/* ── Automation + Analytical Lab — only shown when Pilot Plant = Yes */}
      {company.pilotPlant === true && (
        <div className="space-y-5 animate-in fade-in-0 slide-in-from-top-1 duration-200">

          <FormField label="Automation (DCS / PLC)">
            <YNToggle
              value={company.automation}
              onChange={(v) => setCompany({ automation: v })}
            />
          </FormField>

          {company.automation === true && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in-0 duration-150">
              <FormField label="Type of Automation">
                <DropdownSelect
                  value={company.autoType}
                  onChange={(v) => setCompany({ autoType: v })}
                  options={AUTOMATION_TYPES}
                  placeholder="Select type"
                />
              </FormField>
              <FormField label="Automation Coverage (%)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  max="100"
                  value={company.autoPct}
                  onChange={(e) => setCompany({ autoPct: e.target.value })}
                  placeholder="e.g. 60"
                />
              </FormField>
            </div>
          )}

          <FormField label={<>In-house Analytical Lab <span className="text-red-500">*</span></>}>
            <YNToggle
              value={company.analyticalLab}
              onChange={(v) => setCompany({ analyticalLab: v })}
            />
          </FormField>
        </div>
      )}


      <TabFooter onSave={onNext} onBack={onBack} isFirst={!onBack} />
    </div>
  );
}
