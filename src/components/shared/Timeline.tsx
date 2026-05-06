import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TimelineStep } from "@/types";

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.id} className="flex gap-3">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mt-0.5">
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : step.status === "active" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary bg-bg-success flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-[#B3B7BD]" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1 my-1",
                    step.status === "completed"
                      ? "bg-primary/40"
                      : "bg-[#E5E7EB]"
                  )}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-5 flex-1", isLast && "pb-0")}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.status === "active"
                      ? "text-text-primary"
                      : step.status === "completed"
                      ? "text-text-body"
                      : "text-text-disabled"
                  )}
                >
                  {step.label}
                </p>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {step.date}
                </span>
              </div>
              {step.description && (
                <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
