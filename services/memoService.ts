import type { ICMemo } from '@/types';

// Reads via the API route (backed by fs) rather than a static import, so a memo
// generated in a previous session is still returned after a full page reload.
export async function getMemoByDealId(dealId: string): Promise<ICMemo | undefined> {
  const response = await fetch(`/api/memos?dealId=${encodeURIComponent(dealId)}`);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to load memo');
  }

  return response.json();
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
