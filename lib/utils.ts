import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BadgeVariant } from '@/components/ui/Badge';
import type { DealStage, FindingStatus, RiskLevel, RiskStatus, WorkstreamStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number in millions, e.g. 550 → "$550m", 92.3 → "$92m" */
export function formatMillions(n: number): string {
  return `$${Math.round(n)}m`;
}

/** Formats an ISO date or Date object as a long weekday date string, e.g. "Sunday, August 30, 2026" */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Returns a human-readable relative date string from an ISO date, e.g. "2 days ago", "Today" */
export function relativeDate(isoDate: string, now: Date = new Date()): string {
  const d = new Date(isoDate);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

/** Maps a DealStage to the corresponding BadgeVariant */
export function stageBadgeVariant(stage: DealStage): BadgeVariant {
  const map: Record<DealStage, BadgeVariant> = {
    Screening: 'screening',
    'Due Diligence': 'due-diligence',
    'IC Review': 'ic-review',
    Closed: 'closed',
  };
  return map[stage];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function riskColor(score: number): { bar: string; text: string } {
  if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
  if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  return { bar: 'bg-red-500', text: 'text-red-700' };
}

export function riskStatusColor(status: RiskStatus): string {
  const map: Record<RiskStatus, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return map[status];
}

export function riskStatusLabel(status: RiskStatus): string {
  const map: Record<RiskStatus, string> = {
    green: 'Strong',
    yellow: 'Monitor',
    red: 'Elevated concern',
  };
  return map[status];
}

export function workstreamStatusBadgeVariant(status: WorkstreamStatus): BadgeVariant {
  const map: Record<WorkstreamStatus, BadgeVariant> = {
    Complete: 'complete',
    'In Progress': 'in-progress',
    Pending: 'pending',
  };
  return map[status];
}

export function riskLevelBadgeVariant(level: RiskLevel): BadgeVariant {
  const map: Record<RiskLevel, BadgeVariant> = {
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  };
  return map[level];
}

export function findingStatusBadgeVariant(status: FindingStatus): BadgeVariant {
  const map: Record<FindingStatus, BadgeVariant> = {
    Open: 'open',
    Mitigated: 'mitigated',
    Monitoring: 'monitoring',
  };
  return map[status];
}

export function riskLevelAccent(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    High: 'border-l-red-500',
    Medium: 'border-l-amber-500',
    Low: 'border-l-emerald-500',
  };
  return map[level];
}
