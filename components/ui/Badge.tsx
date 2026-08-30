import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "screening"
  | "due-diligence"
  | "ic-review"
  | "closed"
  | "high"
  | "medium"
  | "low"
  | "complete"
  | "in-progress"
  | "pending"
  | "open"
  | "mitigated"
  | "monitoring"
  | "green"
  | "yellow"
  | "red";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  screening: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  "due-diligence": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "ic-review": "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  closed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  high: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  low: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  complete: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  "in-progress": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  pending: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
  open: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  mitigated: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  monitoring: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
