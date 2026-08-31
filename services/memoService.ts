import icMemosData from '@/mock-api/ic-memos.json';
import type { ICMemo } from '@/types';

const icMemos = icMemosData as ICMemo[];

// Reads from the static JSON snapshot for a fast initial load. After a successful
// generateMemo() call, the freshest memo is the one returned directly by the POST response.
export function getMemoByDealId(dealId: string): Promise<ICMemo | undefined> {
  return Promise.resolve(icMemos.find((memo) => memo.dealId === dealId));
}

export async function generateMemo(dealId: string): Promise<ICMemo> {
  const response = await fetch('/api/memos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dealId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to generate memo');
  }

  return response.json();
}
