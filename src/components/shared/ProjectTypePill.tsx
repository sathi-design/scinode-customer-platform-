import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types";

const PILL_STYLES: Record<ProjectType, string> = {
  "RFQ":              "bg-[#E6F3FB] text-[#0077CC]",
  "CDMO":             "bg-[#EDE8FB] text-[#6237C7]",
  "CMO":              "bg-[#E8FBF2] text-[#0F7614]",
  "RnD":              "bg-[#FBF0C5] text-[#9C5022]",
  "Custom Synthesis": "bg-[#FCE8F0] text-[#E36389]",
};

interface ProjectTypePillProps {
  type: ProjectType;
  className?: string;
}

export function ProjectTypePill({ type, className }: ProjectTypePillProps) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium",
        PILL_STYLES[type],
        className
      )}
    >
      {type}
    </span>
  );
}
