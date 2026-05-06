import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: { value: number; direction: "up" | "down" };
  variant?: "default" | "highlight" | "alert" | "exclusive";
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const containerClass = {
    default:   "bg-bg-subtle rounded-xl p-4",
    highlight: "bg-bg-success border border-primary/30 rounded-xl p-4",
    alert:     "bg-bg-peach border border-[#FD4923]/30 rounded-xl p-4",
    exclusive: "bg-bg-exclusive border border-[#6237C7]/30 rounded-xl p-4",
  }[variant];

  const trendColor = trend
    ? trend.direction === "up"
      ? "text-[#0F7614]"
      : "text-[#C30E1A]"
    : "";

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-normal text-text-muted mb-1">{label}</p>
          <p className="text-2xl font-medium text-text-primary leading-none">{value}</p>
          {subtext && (
            <p className="text-xs text-text-muted mt-1">{subtext}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium mt-1.5", trendColor)}>
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
            <Icon className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
