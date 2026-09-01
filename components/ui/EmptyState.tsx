import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-12 text-center text-slate-500", className)}>
      {icon}
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {description ? <p className="max-w-md text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}
