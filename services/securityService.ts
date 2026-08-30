import securitiesData from '@/mock-api/securities.json';
import type { Security } from '@/types';

const securities = securitiesData as Security[];

export function getSecurityByDealId(dealId: string): Promise<Security | undefined> {
  return Promise.resolve(securities.find((security) => security.dealId === dealId));
}

export function createSecurity(data: Omit<Security, 'id'>): Promise<Security> {
  const newSecurity: Security = {
    ...data,
    id: `sec-${Math.random().toString(36).slice(2, 9)}`,
  };

  console.log('Creating security:', newSecurity);
  // TODO: in the future we will use a real backend to create a security, so we will replace this with a POST /api/securities

  return Promise.resolve(newSecurity);
}
