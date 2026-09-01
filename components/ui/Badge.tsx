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
  screening: "bg-blue-900/40 text-blue-300 ring-1 ring-inset ring-blue-800/60",
  "due-diligence": "bg-amber-900/40 text-amber-300 ring-1 ring-inset ring-amber-800/60",
  "ic-review": "bg-purple-900/40 text-purple-300 ring-1 ring-inset ring-purple-800/60",
  closed: "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-800/60",
  high: "bg-red-900/40 text-red-300 ring-1 ring-inset ring-red-800/60",
  medium: "bg-amber-900/40 text-amber-300 ring-1 ring-inset ring-amber-800/60",
  low: "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-800/60",
  complete: "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-800/60",
  "in-progress": "bg-blue-900/40 text-blue-300 ring-1 ring-inset ring-blue-800/60",
  pending: "bg-slate-700/60 text-slate-300 ring-1 ring-inset ring-slate-600",
  open: "bg-red-900/40 text-red-300 ring-1 ring-inset ring-red-800/60",
  mitigated: "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-800/60",
  monitoring: "bg-amber-900/40 text-amber-300 ring-1 ring-inset ring-amber-800/60",
  green: "bg-emerald-900/40 text-emerald-300 ring-1 ring-inset ring-emerald-800/60",
  yellow: "bg-amber-900/40 text-amber-300 ring-1 ring-inset ring-amber-800/60",
  red: "bg-red-900/40 text-red-300 ring-1 ring-inset ring-red-800/60",
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
