import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
  color?: "primary" | "blue" | "purple" | "orange";
}

const COLOR_MAP = {
  primary: "bg-primary",
  blue:    "bg-[#0077CC]",
  purple:  "bg-[#6237C7]",
  orange:  "bg-[#FD4923]",
};

export function ProgressBar({
  value,
  className,
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", COLOR_MAP[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted flex-shrink-0 w-8 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
