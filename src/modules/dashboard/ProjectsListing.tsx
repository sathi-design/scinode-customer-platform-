"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, X, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_PROJECTS, type BadgeType } from "@/lib/projectsData";

// ─── Figma assets ─────────────────────────────────────────────────────────────
const STAR_ICON = "https://www.figma.com/api/mcp/asset/8749bfbf-c143-471d-b88f-25e83b75af4c";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  image: string;
  badge: BadgeType | null;
  industry: string;
  title: string;
  description: string;
}

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<BadgeType, { bg: string; text: string; hasStar: boolean }> = {
  Exclusive:       { bg: "#020202",  text: "white",   hasStar: true  },
  CMO:             { bg: "#1F6F54",  text: "white",   hasStar: false },
  RFQ:             { bg: "#0077CC",  text: "white",   hasStar: false },
  "Tech Transfer": { bg: "#7C3AED",  text: "white",   hasStar: false },
  Open:            { bg: "#D97706",  text: "white",   hasStar: false },
};

// ─── Seed data — sourced from shared ALL_PROJECTS (first card = Vitamin D3) ──
const SEED_PROJECTS: Omit<Project, "id">[] = ALL_PROJECTS.map((p) => ({
  image: p.image,
  badge: p.badge,
  industry: p.industry,
  title: p.title,
  description: p.description,
}));

// Generate projects list — repeat seed cyclically
function generateProjects(count: number, offset = 0): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i + 1,
    ...SEED_PROJECTS[(offset + i) % SEED_PROJECTS.length],
  }));
}

const INITIAL_COUNT = 16;
const LOAD_MORE_COUNT = 8;
const MATCHED_COUNT = 47;

// ─── Filter options ───────────────────────────────────────────────────────────
const INDUSTRY_OPTIONS = [
  "Agro Chemical", "Pharmaceutical", "Industrial Chemicals", "Flavors & Fragrances",
  "Beauty & Personal Care", "Food & Nutrition", "Dyes and Pigments", "Oleochemicals",
  "Metallurgy Chemicals", "Elemental Derivatives",
];
const PROJECT_TYPE_OPTIONS = ["RFQ", "CMO", "Tech Transfer", "Scale-up", "Open Projects"];
const TIMELINE_OPTIONS = ["< 1 Month", "1–3 Months", "3–6 Months", "6–12 Months", "> 1 Year"];
const SORT_OPTIONS = ["Latest", "Most Relevant", "Deadline Soon", "Newest First"];

// ─── Dropdown component ───────────────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  value,
  onSelect,
  flex = true,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  flex?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", flex && "flex-1")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-between w-full gap-3 px-3 py-[10px]",
          "bg-white border border-[#e4e4e7] rounded-[6px] text-sm text-[#09090b]",
          "hover:border-[#1F6F54]/40 transition-colors",
          open && "border-[#1F6F54]/60",
        )}
      >
        <span className={cn(value !== label && "text-[#09090b] font-medium", value === label && "text-[#71717a]")}>
          {value || label}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-[#71717a] flex-shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#e4e4e7] rounded-[8px] shadow-lg z-20 py-1 min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                value === opt
                  ? "bg-[#f0faf5] text-[#1F6F54] font-medium"
                  : "text-[#353535] hover:bg-[#f7f7f7]",
              )}
            >
              {opt}
            </button>
          ))}
          {value !== label && (
            <button
              onClick={() => { onSelect(label); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-[#9ca3af] hover:bg-[#f7f7f7] border-t border-[#f3f4f6] mt-1"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sort dropdown (right-aligned variant) ────────────────────────────────────
function SortDropdown({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-3 px-3 py-[10px] bg-white border border-[#e4e4e7] rounded-[6px]",
          "text-sm text-[#09090b] hover:border-[#1F6F54]/40 transition-colors whitespace-nowrap",
          open && "border-[#1F6F54]/60",
        )}
      >
        <span className="font-normal">Sort By: <strong className="font-medium">{value}</strong></span>
        <ChevronDown className={cn("w-4 h-4 text-[#71717a] transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-[#e4e4e7] rounded-[8px] shadow-lg z-20 py-1 min-w-[160px]">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                value === opt ? "bg-[#f0faf5] text-[#1F6F54] font-medium" : "text-[#353535] hover:bg-[#f7f7f7]",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const badge = project.badge ? BADGE_CONFIG[project.badge] : null;

  return (
    // Outer wrapper: gradient border visible on hover
    <div className="group relative cursor-pointer flex-1 min-w-0" onClick={onClick}>
      {/* Animated gradient border layer */}
      <div
        className="absolute -inset-[1.5px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, #1F6F54 0%, #2ACB83 40%, #1F6F54 70%, #2dd194 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 3s ease infinite",
        }}
      />

      {/* Card body */}
      <div
        className={cn(
          "relative bg-white rounded-[12px] p-[10px] flex flex-col gap-3.5 overflow-hidden",
          "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.06)]",
          "group-hover:shadow-[0px_16px_32px_rgba(31,111,84,0.18)] group-hover:pb-11",
          "transition-[box-shadow,padding] duration-300 ease-in-out",
        )}
      >
        {/* Image container */}
        <div className="relative overflow-hidden rounded-[10px] h-[140px] bg-[#cfd8dc] flex-shrink-0">
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.07]"
          />
          {/* Gradient overlay on image hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge */}
          {project.badge && badge && (
            <div
              className="absolute top-[8px] left-[9px] flex items-center gap-[5px] px-2 py-1 rounded-[39px] border border-white/30"
              style={{ backgroundColor: badge.bg }}
            >
              {badge.hasStar && (
                <img src={STAR_ICON} alt="" className="w-[14px] h-[14px] object-contain flex-shrink-0" />
              )}
              <span className="text-[11px] font-medium leading-[20px]" style={{ color: badge.text }}>
                {project.badge}
              </span>
            </div>
          )}
        </div>

        {/* Industry pill */}
        <div>
          <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[13px] font-medium leading-[24px]">
            {project.industry}
          </span>
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-[5px] flex-1">
          <h3 className="font-semibold text-[17px] leading-[26px] text-black line-clamp-2">
            {project.title}
          </h3>
          <p className="text-[13px] font-normal leading-[20px] text-[#353535] line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Arrow icon — appears on hover */}
        <div
          className={cn(
            "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-[#1F6F54] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
            "transition-all duration-300 ease-in-out",
          )}
        >
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Matched Profile Banner ───────────────────────────────────────────────────
function MatchedBanner({ count }: { count: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-[10px] cursor-pointer",
        "transition-all duration-200 hover:shadow-md hover:scale-[1.005]",
      )}
      style={{
        background: "linear-gradient(90deg, #1F6F54 0%, #185C45 40%, #0d4a37 100%)",
      }}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm font-semibold">
          {count} projects matched to your profile
        </span>
        <span className="text-white/70 text-sm ml-2">
          — based on your capabilities, certifications, and past projects.
        </span>
      </div>
      <span className="text-white/80 text-sm font-medium flex items-center gap-1 flex-shrink-0 hidden sm:flex">
        View all <ArrowUpRight className="w-4 h-4" />
      </span>
    </div>
  );
}

// ─── Infinite scroll loader ───────────────────────────────────────────────────
function ScrollLoader() {
  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-0 h-16"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(247,247,247,0.9))",
        }}
      />
      <div className="relative flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#1F6F54] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProjectsListing() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Latest");
  const [industry, setIndustry] = useState("Industry");
  const [projectType, setProjectType] = useState("Type of project");
  const [timeline, setTimeline] = useState("Timeline");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Agrochemical", "Synthesis"]);
  const [projects, setProjects] = useState<Project[]>(() => generateProjects(INITIAL_COUNT));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedCount = useRef(INITIAL_COUNT);

  // Remove an applied filter chip
  const removeFilter = (filter: string) =>
    setActiveFilters((prev) => prev.filter((f) => f !== filter));

  const clearAllFilters = () => {
    setActiveFilters([]);
    setIndustry("Industry");
    setProjectType("Type of project");
    setTimeline("Timeline");
  };

  // Add a filter chip when dropdown selection is made
  const applyFilter = (label: string, value: string, defaultLabel: string) => {
    if (value !== defaultLabel && !activeFilters.includes(value)) {
      setActiveFilters((prev) => [...prev, value]);
    }
  };

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const next = generateProjects(LOAD_MORE_COUNT, loadedCount.current);
      loadedCount.current += LOAD_MORE_COUNT;
      setProjects((prev) => [...prev, ...next]);
      if (loadedCount.current >= 60) setHasMore(false);
      setIsLoading(false);
    }, 600);
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // Filter projects by search
  const filteredProjects = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q) ||
      (p.badge?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <>
      {/* Inject keyframes for gradient border animation */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="flex flex-col gap-6 p-4 sm:p-6 pb-8 h-full overflow-y-auto">
        {/* Page header */}
        <div>
          <h1
            className="text-[30px] font-semibold leading-[36px] tracking-[-0.225px] text-[#18181b]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Open Projects
          </h1>
          <p className="text-sm text-[#62748e] mt-1 leading-[24px]">
            Browse current open projects and apply with proposals or interest.
          </p>
        </div>

        {/* Search + Sort row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-[10px] bg-white border border-[#e4e4e7] rounded-[6px] hover:border-[#1F6F54]/40 transition-colors focus-within:border-[#1F6F54]/60">
            <Search className="w-4 h-4 text-[#71717a] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CAS No., Molecular Name, Projects Name"
              className="flex-1 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#9ca3af] hover:text-[#353535] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <SortDropdown value={sort} onSelect={setSort} />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <FilterDropdown
            label="Industry"
            options={INDUSTRY_OPTIONS}
            value={industry}
            onSelect={(v) => { setIndustry(v); applyFilter("industry", v, "Industry"); }}
          />
          <FilterDropdown
            label="Type of project"
            options={PROJECT_TYPE_OPTIONS}
            value={projectType}
            onSelect={(v) => { setProjectType(v); applyFilter("type", v, "Type of project"); }}
          />
          <FilterDropdown
            label="Timeline"
            options={TIMELINE_OPTIONS}
            value={timeline}
            onSelect={(v) => { setTimeline(v); applyFilter("timeline", v, "Timeline"); }}
          />
        </div>

        {/* Applied filters row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <span className="text-sm font-semibold text-[#171717]">Applied Filters</span>
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map((filter) => (
                <div
                  key={filter}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#5c5e5c] cursor-pointer group/chip"
                >
                  <span>{filter}</span>
                  <button
                    onClick={() => removeFilter(filter)}
                    className="text-[#9ca3af] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {activeFilters.length === 0 && (
                <span className="text-sm text-[#9ca3af]">None</span>
              )}
            </div>
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-[#0077CC] underline decoration-solid hover:text-[#005fa3] transition-colors flex-shrink-0 mt-0.5"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Matched profile banner */}
        <MatchedBanner count={MATCHED_COUNT} />

        {/* Project grid */}
        {filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0faf5] flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-[#1F6F54]" />
            </div>
            <p className="text-base font-semibold text-[#020202]">No projects found</p>
            <p className="text-sm text-[#62748e] mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel + loader */}
        <div ref={sentinelRef} className="h-1" />
        {isLoading && <ScrollLoader />}
        {!hasMore && filteredProjects.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-[#9ca3af]">All projects loaded</p>
          </div>
        )}
      </div>
    </>
  );
}
