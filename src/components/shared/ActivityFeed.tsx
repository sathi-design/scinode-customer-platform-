import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, FolderOpen, MessageSquare, Bell } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { ActivityItem } from "@/types";

const TYPE_ICONS = {
  proposal: FileText,
  project:  FolderOpen,
  message:  MessageSquare,
  system:   Bell,
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, className, maxItems = 5 }: ActivityFeedProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div className={cn("flex flex-col divide-y divide-bg-subtle", className)}>
      {visible.map((item) => {
        const Icon = TYPE_ICONS[item.type];
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 py-3 hover:bg-bg-page transition-colors px-1 rounded-lg cursor-pointer"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center mt-0.5">
              <Icon className="w-4 h-4 text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {item.title}
                </p>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                {item.description}
              </p>
              {item.status && (
                <div className="mt-1.5">
                  <StatusBadge status={item.status} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
