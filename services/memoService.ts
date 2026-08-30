import icMemosData from '@/mock-api/ic-memos.json';
import type { ICMemo } from '@/types';

const icMemos = icMemosData as ICMemo[];

export function getMemoByDealId(dealId: string): Promise<ICMemo | undefined> {
  return Promise.resolve(icMemos.find((memo) => memo.dealId === dealId));
}

export function generateMemo(dealId: string, content: string): Promise<ICMemo> {
  const newMemo: ICMemo = {
    id: `memo-${Math.random().toString(36).slice(2, 9)}`,
    dealId,
    generatedAt: new Date().toISOString(),
    content,
  };

  icMemos.push(newMemo);

  console.log('Generating memo:', newMemo);
  // TODO: in the future, we will use a real backend to generate a memo, so we will replace this with a POST /api/memos

  return Promise.resolve(newMemo);
}
