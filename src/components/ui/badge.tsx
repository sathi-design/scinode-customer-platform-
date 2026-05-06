import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        accepted:   "bg-[#B2F3B7] text-[#0F7614]",
        declined:   "bg-[#FFEFEF] text-[#C30E1A]",
        review:     "bg-[#FBF0C5] text-[#9C5022]",
        submitted:  "bg-[#020202] text-[#2ACB83]",
        exclusive:  "bg-[#EDE8FB] text-[#6237C7]",
        po_raised:  "bg-[#E6F3FB] text-[#0077CC]",
        urgent:     "bg-[#FEF0EB] text-[#FD4923]",
        draft:      "bg-[#F3F4F6] text-[#4B5563]",
        active:     "bg-[#E8FBF2] text-[#0F7614]",
        completed:  "bg-[#B2F3B7] text-[#0F7614]",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
