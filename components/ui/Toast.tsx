"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  durationMs?: number;
  className?: string;
}

export default function Toast({
  open,
  message,
  onClose,
  durationMs = 3000,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [open, onClose, durationMs]);

  if (!open) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg",
        "animate-[toast-in_0.2s_ease-out]",
        className
      )}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded-lg p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
