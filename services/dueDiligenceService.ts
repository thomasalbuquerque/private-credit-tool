import dueDiligenceData from '@/mock-api/due-diligence.json';
import type { DueDiligence, Finding } from '@/types';

const dueDiligenceRecords = dueDiligenceData as DueDiligence[];

export function getDueDiligenceByDealId(dealId: string): Promise<DueDiligence | undefined> {
  return Promise.resolve(dueDiligenceRecords.find((record) => record.dealId === dealId));
}

export function addFinding(finding: Omit<Finding, 'id'>): Promise<Finding> {
  const newFinding: Finding = {
    ...finding,
    id: `find-${Math.random().toString(36).slice(2, 9)}`,
  };

  const record = dueDiligenceRecords.find((item) => item.dealId === finding.dealId);
  if (record) {
    record.findings.push(newFinding);
  }

  console.log('Adding finding:', newFinding);
  // TODO: in the future, we will use a real backend to add a finding, so we will replace this with a POST /api/due-diligence/findings

  return Promise.resolve(newFinding);
}
