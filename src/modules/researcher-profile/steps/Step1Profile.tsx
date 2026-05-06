"use client";

import { useState, useRef, useEffect } from "react";
import {
  Link2,
  Users,
  UserPlus,
  Check,
  Search,
  X,
} from "lucide-react";
import { useResearcherProfileStore } from "@/store/useResearcherProfileStore";
import { useAuth } from "@/hooks/useAuth";
import {
  FormField,
  SectionLabel,
  PillInput,
  inputCls,
  DropdownSelect,
  CardRow,
  DrawerFooter,
  EmptyState,
} from "@/modules/profile/SharedUI";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { INSTITUTION_OPTIONS } from "../constants";
import type { TeamMember } from "../types";
import { cn } from "@/lib/utils";

// ─── Required asterisk ────────────────────────────────────────────────────────
function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

// ─── Institution autocomplete ─────────────────────────────────────────────────
// Searchable entries (the "Other" option is handled separately)
const SEARCHABLE_INSTITUTIONS = (INSTITUTION_OPTIONS as readonly string[]).filter(
  (o) => o !== "Other (Type your institution)"
);

function InstitutionAutocomplete({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  // Initialise from stored value so state survives tab-switches / remounts
  const initIsOther = value !== "" && !SEARCHABLE_INSTITUTIONS.includes(value);

  const [isOther, setIsOther] = useState(initIsOther);
  const [query,   setQuery]   = useState(initIsOther ? "" : value);
  const [custom,  setCustom]  = useState(initIsOther ? value : "");
  const [open,    setOpen]    = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim().length >= 1
    ? SEARCHABLE_INSTITUTIONS.filter((o) =>
        o.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = open && query.trim().length >= 1;

  const handleSelect = (inst: string) => {
    setIsOther(false);
    setQuery(inst);
    setCustom("");
    onChange(inst);
    setOpen(false);
  };

  const handlePickOther = () => {
    setIsOther(true);
    setOpen(false);
    // Preserve any previously typed value
    onChange(custom);
  };

  const handleCancelOther = () => {
    setIsOther(false);
    setQuery("");
    setCustom("");
    onChange("");
  };

  // ── "Other" mode: keep dropdown display + text field below ───────────────────
  if (isOther) {
    return (
      <div className="flex flex-col gap-2">
        {/* Static "Other selected" row — mirrors the input appearance */}
        <div className={cn(
          inputCls,
          "flex items-center justify-between bg-[#f0faf5] border-[#018E7E] cursor-default select-none"
        )}>
          <span className="flex items-center gap-2 text-sm text-[#018E7E] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#018E7E] flex-shrink-0" />
            Other institution
          </span>
          <button
            type="button"
            onClick={handleCancelOther}
            className="text-[#71717a] hover:text-red-500 transition-colors"
            title="Clear and search again"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom institution text input — revealed below */}
        <div className="flex flex-col gap-1 pl-1">
          <label className="text-xs font-medium text-[#374151]">
            Enter Institution Name <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            className={cn(
              inputCls,
              error && !custom.trim() && "border-red-400 focus:border-red-400 focus:ring-red-200"
            )}
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="e.g. National Centre for Biological Sciences"
          />
          {error && !custom.trim() && (
            <p className="text-xs text-red-500">Please enter your institution name</p>
          )}
        </div>
      </div>
    );
  }

  // ── Normal search mode ────────────────────────────────────────────────────────
  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
        <input
          className={cn(inputCls, "pl-9", error && "border-red-400 focus:border-red-400 focus:ring-red-200")}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => { if (query.trim().length >= 1) setOpen(true); }}
          placeholder="Search by name, e.g. IIT, CSIR, MIT…"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); onChange(""); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#020202]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e4e4e7] rounded-[8px] shadow-xl max-h-52 overflow-y-auto">
          {filtered.map((inst) => (
            <button
              key={inst}
              type="button"
              onClick={() => handleSelect(inst)}
              className="w-full text-left px-3 py-2 text-sm text-[#020202] hover:bg-[#f0faf5] transition-colors"
            >
              {inst}
            </button>
          ))}
          {/* "Other" always anchored at bottom of dropdown */}
          <button
            type="button"
            onClick={handlePickOther}
            className="w-full text-left px-3 py-2 text-sm text-[#018E7E] font-semibold hover:bg-[#f0faf5] border-t border-[#f1f5f9] transition-colors"
          >
            ✎ &nbsp;Other — type your institution
          </button>
        </div>
      )}

      {/* Confirmation badge when a value is selected */}
      {value && !open && (
        <p className="mt-1 text-xs text-[#018E7E] font-medium flex items-center gap-1">
          <Check className="w-3 h-3" /> {value}
        </p>
      )}
    </div>
  );
}

// ─── Inner tab IDs ────────────────────────────────────────────────────────────
type InnerTab = "bio" | "group";

// ─── Invite Member Drawer ─────────────────────────────────────────────────────
function InviteMemberDrawer({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}) {
  const [name, setName]   = useState("");
  const [role, setRole]   = useState("SCIENTIST");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const e: { name?: string; email?: string } = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    return e;
  };

  const handle = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      role,
      email: email.trim(),
      status: "PENDING",
    });
    setName(""); setRole("SCIENTIST"); setEmail(""); setErrors({});
    onClose();
  };

  // Reset when drawer closes
  useEffect(() => {
    if (!open) { setName(""); setRole("SCIENTIST"); setEmail(""); setErrors({}); }
  }, [open]);

  return (
    <DrawerBase
      open={open}
      onClose={onClose}
      title="Invite Team Member"
      width={480}
      footer={<DrawerFooter onCancel={onClose} onSave={handle} saveLabel="Send Invite" />}
    >
      <div className="flex flex-col gap-5">
        <FormField label={<>Full Name <Req /></>}>
          <input
            className={cn(inputCls, errors.name && "border-red-400")}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            placeholder="e.g. Dr. Rajesh Kumar"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </FormField>

        <FormField label={<>Email Address <Req /></>}>
          <input
            className={cn(inputCls, errors.email && "border-red-400")}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="e.g. rajesh.kumar@iitb.ac.in"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </FormField>

        <FormField label={<>Role <Req /></>}>
          <DropdownSelect
            value={role}
            onChange={setRole}
            options={["SCIENTIST", "RESEARCHER", "TECHNICIAN", "STUDENT", "COLLABORATOR"]}
          />
        </FormField>

        <div className="rounded-[8px] bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            An invitation will be sent to this email address. The member will appear as{" "}
            <strong className="text-amber-800">PENDING</strong> until they accept the invitation.
          </p>
        </div>
      </div>
    </DrawerBase>
  );
}

// ─── Step 1 — Profile ─────────────────────────────────────────────────────────
interface Props {
  onNext: () => void;
  isFirst?: boolean;
}

export function Step1Profile({ onNext, isFirst = false }: Props) {
  const { user }           = useAuth();
  const data               = useResearcherProfileStore((s) => s.data);
  const setData            = useResearcherProfileStore((s) => s.setData);
  const addTeamMember      = useResearcherProfileStore((s) => s.addTeamMember);
  const deleteTeamMember   = useResearcherProfileStore((s) => s.deleteTeamMember);

  const [innerTab, setInnerTab] = useState<InnerTab>("bio");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const err = (val: string) => touched && !val.trim();
  const errArr = (arr: string[]) => touched && arr.length === 0;

  const handleContinue = () => {
    setTouched(true);
    const ok =
      data.scientistName.trim().split(/\s+/).filter(Boolean).length >= 2 &&
      data.designation.trim().length > 0 &&
      data.primaryInstitution.trim().length > 0 &&
      data.cityState.trim().length > 0 &&
      data.country.trim().length > 0 &&
      data.technicalDomains.length >= 1 &&
      data.researchInterests.trim().length > 0;
    if (ok) onNext();
  };

  const INNER_TABS: { id: InnerTab; label: string; Icon: React.ElementType }[] = [
    { id: "bio",   label: "Bio & Links",     Icon: Link2  },
    { id: "group", label: "Research Group",  Icon: Users  },
  ];

  return (
    <>
      {/* ── Section 1: Core Profile ──────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-5 border-b border-[#F3F4F6] flex flex-col gap-5">
        <SectionLabel>Core Profile Fields</SectionLabel>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Scientist Name */}
          <FormField label={<>Scientist Name <Req /></>} hint="Enter your full name (min. 2 words)">
            <input
              className={cn(inputCls, err(data.scientistName) && "border-red-400 focus:border-red-400 focus:ring-red-200")}
              value={data.scientistName}
              onChange={(e) => setData({ scientistName: e.target.value })}
              placeholder="e.g. Dr. Vinod Kumar"
            />
            {touched && data.scientistName.trim().split(/\s+/).filter(Boolean).length < 2 && (
              <p className="text-xs text-red-500">Please enter at least 2 words</p>
            )}
          </FormField>

          {/* Designation */}
          <FormField label={<>Designation <Req /></>}>
            <input
              className={cn(inputCls, err(data.designation) && "border-red-400 focus:border-red-400 focus:ring-red-200")}
              value={data.designation}
              onChange={(e) => setData({ designation: e.target.value })}
              placeholder="e.g. Principal Scientist"
            />
            {err(data.designation) && <p className="text-xs text-red-500">This field is required</p>}
          </FormField>
        </div>

        {/* Primary Institution */}
        <FormField
          label={<>Primary Institution <Req /></>}
          hint="Type to search. Select 'Other' to enter a custom institution."
        >
          <InstitutionAutocomplete
            value={data.primaryInstitution}
            onChange={(v) => setData({ primaryInstitution: v })}
            error={touched && !data.primaryInstitution}
          />
          {touched && !data.primaryInstitution && (
            <p className="text-xs text-red-500">Please select or enter an institution</p>
          )}
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* City/State */}
          <FormField label={<>City / State <Req /></>} hint="Auto-populated from institution">
            <input
              className={cn(inputCls, err(data.cityState) && "border-red-400 focus:border-red-400 focus:ring-red-200")}
              value={data.cityState}
              onChange={(e) => setData({ cityState: e.target.value })}
              placeholder="e.g. Pune"
            />
            {err(data.cityState) && <p className="text-xs text-red-500">This field is required</p>}
          </FormField>

          {/* Country */}
          <FormField label={<>Country <Req /></>}>
            <input
              className={cn(inputCls, err(data.country) && "border-red-400 focus:border-red-400 focus:ring-red-200")}
              value={data.country}
              onChange={(e) => setData({ country: e.target.value })}
              placeholder="e.g. India"
            />
            {err(data.country) && <p className="text-xs text-red-500">This field is required</p>}
          </FormField>
        </div>

        {/* Technical Domains */}
        <FormField
          label={<>Technical Domains <Req /></>}
          hint="Type a domain and press Enter to add. At least 1 required."
        >
          <PillInput
            pills={data.technicalDomains}
            onChange={(pills) => setData({ technicalDomains: pills })}
            placeholder="e.g. Polymer Science, Organic Chemistry…"
          />
          {errArr(data.technicalDomains) && (
            <p className="text-xs text-red-500">Add at least one domain</p>
          )}
        </FormField>

        {/* Research Interests */}
        <FormField label={<>Research Interests <Req /></>} hint="Max 2000 characters">
          <textarea
            className={cn(
              inputCls,
              "resize-none min-h-[100px]",
              err(data.researchInterests) && "border-red-400 focus:border-red-400 focus:ring-red-200"
            )}
            value={data.researchInterests}
            onChange={(e) => setData({ researchInterests: e.target.value })}
            maxLength={2000}
            placeholder="My research involves the design, synthesis, and characterization of…"
          />
          <div className="flex items-center justify-between">
            {err(data.researchInterests)
              ? <p className="text-xs text-red-500">This field is required</p>
              : <span />}
            <p className="text-xs text-[#9ca3af]">{data.researchInterests.length}/2000</p>
          </div>
        </FormField>
      </div>

      {/* ── Section 2+3: Bio & Links / Research Group tabs ───────────────── */}
      <div className="px-4 sm:px-5 py-5 flex flex-col gap-5">
        {/* Inner tab bar */}
        <div className="flex gap-0 border-b border-[#e4e4e7]">
          {INNER_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setInnerTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
                innerTab === id
                  ? "border-[#018E7E] text-[#018E7E]"
                  : "border-transparent text-[#71717a] hover:text-[#020202]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Bio & Links ───────────────────────────────────────────────── */}
        {innerTab === "bio" && (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-wider -mt-2">Optional Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Research ID (IRINS)" hint="Format: 0000-0002-1825-0097">
                <input className={inputCls} value={data.researchIdIRINS}
                  onChange={(e) => setData({ researchIdIRINS: e.target.value })}
                  placeholder="0000-0002-1825-0097" />
              </FormField>
              <FormField label="ORCID ID" hint="Format: 0000-0000-0000-0000">
                <input className={inputCls} value={data.orcidId}
                  onChange={(e) => setData({ orcidId: e.target.value })}
                  placeholder="0000-0000-0000-0000" />
              </FormField>
            </div>

            <FormField label="H-Index" hint="Research impact metric (integer ≥ 0)">
              <input className={inputCls} type="number" min={0} value={data.hIndex}
                onChange={(e) => setData({ hIndex: e.target.value })}
                placeholder="e.g. 42" />
            </FormField>

            <FormField label="LinkedIn Profile">
              <input className={inputCls} type="url" value={data.linkedinProfile}
                onChange={(e) => setData({ linkedinProfile: e.target.value })}
                placeholder="https://linkedin.com/in/…" />
            </FormField>

            <FormField label="Google Scholar Profile">
              <input className={inputCls} type="url" value={data.googleScholarProfile}
                onChange={(e) => setData({ googleScholarProfile: e.target.value })}
                placeholder="https://scholar.google.com/citations?user=…" />
            </FormField>
          </div>
        )}

        {/* ── Research Group ────────────────────────────────────────────── */}
        {innerTab === "group" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Group Name" hint="Official or commonly used name of your research group">
                <input className={inputCls} value={data.groupName}
                  onChange={(e) => setData({ groupName: e.target.value })}
                  placeholder="e.g. Advanced Materials Lab" />
              </FormField>
              <FormField label="Head Scientist">
                <input
                  className={cn(inputCls, "bg-[#f9fafb] text-[#71717a] cursor-not-allowed")}
                  value={data.headScientist || user?.name || ""}
                  readOnly placeholder="Auto-populated from profile"
                />
              </FormField>
            </div>

            {/* Team members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#020202]">
                  Active Team Members
                  <span className="ml-1.5 text-xs text-[#9ca3af] font-normal">(optional)</span>
                </p>
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-xs font-medium transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </div>

              {data.teamMembers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No team members yet"
                  subtitle="Add researchers and team members currently contributing to your group's work."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {data.teamMembers.map((m) => {
                    const initials = m.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3);
                    return (
                      <CardRow key={m.id} onDelete={() => deleteTeamMember(m.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#018E7E] to-[#0172E7] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#020202]">{m.name}</p>
                            <p className="text-xs text-[#71717a]">{m.email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#9ca3af]">{m.role}</span>
                              <span className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                m.status === "ACTIVE"
                                  ? "bg-[#d1fae5] text-[#065f46]"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              )}>
                                {m.status === "PENDING" ? "Invitation Sent – Pending" : "ACTIVE"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardRow>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Validation summary ────────────────────────────────────────────── */}
      {touched && (() => {
        const issues: string[] = [];
        if (data.scientistName.trim().split(/\s+/).filter(Boolean).length < 2) issues.push("Scientist Name (min 2 words)");
        if (!data.designation.trim()) issues.push("Designation");
        if (!data.primaryInstitution) issues.push("Primary Institution");
        if (!data.cityState.trim()) issues.push("City / State");
        if (!data.country.trim()) issues.push("Country");
        if (data.technicalDomains.length === 0) issues.push("Technical Domains (at least 1)");
        if (!data.researchInterests.trim()) issues.push("Research Interests");
        if (issues.length === 0) return null;
        return (
          <div className="mx-4 sm:mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
            <p className="text-xs font-semibold text-amber-700 mb-1">Please complete required fields:</p>
            <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
              {issues.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        );
      })()}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#e4e4e7] px-4 sm:px-5 py-3 flex items-center justify-end bg-white rounded-b-[12px]">
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors"
        >
          <Check className="w-4 h-4" />
          Save & Continue
        </button>
      </div>

      <InviteMemberDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSave={addTeamMember}
      />
    </>
  );
}
