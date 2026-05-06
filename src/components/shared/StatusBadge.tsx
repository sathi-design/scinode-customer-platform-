import { Badge } from "@/components/ui/badge";
import type { StatusType } from "@/types";

const STATUS_LABELS: Record<StatusType, string> = {
  accepted:     "Accepted",
  declined:     "Declined",
  under_review: "Under Review",
  submitted:    "Submitted",
  exclusive:    "Exclusive",
  po_raised:    "PO Raised",
  urgent:       "Urgent",
  draft:        "Draft",
  active:       "Active",
  completed:    "Completed",
};

const STATUS_VARIANTS: Record<
  StatusType,
  "accepted" | "declined" | "review" | "submitted" | "exclusive" | "po_raised" | "urgent" | "draft" | "active" | "completed"
> = {
  accepted:     "accepted",
  declined:     "declined",
  under_review: "review",
  submitted:    "submitted",
  exclusive:    "exclusive",
  po_raised:    "po_raised",
  urgent:       "urgent",
  draft:        "draft",
  active:       "active",
  completed:    "completed",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
