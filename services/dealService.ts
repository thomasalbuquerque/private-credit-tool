import dealsData from '@/mock-api/deals.json';
import type { Deal } from '@/types';

const deals = dealsData as Deal[];

export function getDeals(): Promise<Deal[]> {
  return Promise.resolve(deals);
}

export function getDealById(id: string): Promise<Deal | undefined> {
  return Promise.resolve(deals.find((deal) => deal.id === id));
}

export function createDeal(data: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> {
  const newDeal: Deal = {
    ...data,
    id: `deal-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  console.log('Creating deal:', newDeal);
  // TODO: in the future, we will use a real backend to create a deal, so we will replace this with a POST /api/deals

  return Promise.resolve(newDeal);
}
