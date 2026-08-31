export type DealStage = "Screening" | "Due Diligence" | "IC Review" | "Closed";

export type RiskLevel = "High" | "Medium" | "Low";

export type RiskStatus = "green" | "yellow" | "red";

export type WorkstreamStatus = "Complete" | "In Progress" | "Pending";

export type FindingStatus = "Open" | "Mitigated" | "Monitoring";

export interface RiskBreakdown {
  financials: RiskStatus;
  collateral: RiskStatus;
  industry: RiskStatus;
  legal: RiskStatus;
}

export interface TimelineStep {
  label: string;
  date: string;
  completed: boolean;
}

export interface ActivityItem {
  action: string;
  date: string;
}

export interface Deal {
  id: string;
  companyName: string;
  industry: string;
  dealSize: number;
  revenue: number;
  ebitda: number;
  leverage: number;
  sponsor: string;
  stage: DealStage;
  owner: string;
  riskScore: number;
  riskBreakdown: RiskBreakdown;
  createdAt: string;
  timeline: TimelineStep[];
  recentActivity: ActivityItem[];
}

export interface Covenant {
  id: string;
  name: string;
  threshold: string;
}

export interface Security {
  id: string;
  dealId: string;
  type: string;
  amount: number;
  rate: string;
  maturity: string;
  originationFee: string;
  covenants: Covenant[];
  collateral: string[];
}

export interface Workstream {
  name: string;
  status: WorkstreamStatus;
}

export interface Finding {
  id: string;
  dealId: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  mitigation: string;
  owner: string;
  status: FindingStatus;
}

export interface DueDiligence {
  dealId: string;
  workstreams: Workstream[];
  findings: Finding[];
}

export interface ICMemo {
  id: string;
  dealId: string;
  generatedAt: string;
  content: string;
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
}
