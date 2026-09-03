// Server-side only: the LLM API key lives in process.env and never reaches the browser.
// Node.js is the default runtime for Route Handlers in this Next.js version, which gives us
// filesystem access (fs/promises) without needing an explicit `runtime` export.

import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import dealsData from '@/mock-api/deals.json';
import securitiesData from '@/mock-api/securities.json';
import dueDiligenceData from '@/mock-api/due-diligence.json';
import type { Deal, DueDiligence, ICMemo, Security } from '@/types';
import { generateText, LlmConfigError, LlmRequestError } from '@/lib/llm';
import { buildMemoPrompt, MEMO_SYSTEM_PROMPT } from '@/lib/memoPrompt';

const deals = dealsData as Deal[];
const securities = securitiesData as Security[];
const dueDiligenceRecords = dueDiligenceData as DueDiligence[];

const MEMOS_FILE_PATH = path.join(process.cwd(), 'mock-api', 'ic-memos.json');

// Serverless hosts (Vercel) run on a read-only filesystem and do not ship the JSON
// seed file inside the function bundle. Storing memos on disk is therefore a local
// convenience only: when it is unavailable the memo is still generated and returned,
// it just does not survive a page reload.
function isFilesystemUnavailable(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return code === 'ENOENT' || code === 'EROFS' || code === 'EACCES' || code === 'EPERM';
}

async function readMemos(): Promise<ICMemo[]> {
  try {
    const raw = await readFile(MEMOS_FILE_PATH, 'utf-8');
    return JSON.parse(raw) as ICMemo[];
  } catch (error) {
    if (isFilesystemUnavailable(error)) {
      return [];
    }
    throw error;
  }
}

async function writeMemos(memos: ICMemo[]): Promise<void> {
  try {
    await writeFile(MEMOS_FILE_PATH, `${JSON.stringify(memos, null, 2)}\n`, 'utf-8');
  } catch (error) {
    console.warn('Memo generated but not persisted to disk:', error);
  }
}

export async function POST(request: Request) {
  let dealId: unknown;

  try {
    const body = await request.json();
    dealId = body?.dealId;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (typeof dealId !== 'string' || dealId.trim() === '') {
    return NextResponse.json({ error: 'dealId is required and must be a non-empty string.' }, { status: 400 });
  }

  const deal = deals.find((d) => d.id === dealId);
  if (!deal) {
    return NextResponse.json({ error: `Deal "${dealId}" was not found.` }, { status: 404 });
  }

  const security = securities.find((s) => s.dealId === dealId);
  const dueDiligence = dueDiligenceRecords.find((d) => d.dealId === dealId);

  try {
    const prompt = buildMemoPrompt({ deal, security, dueDiligence });
    const { text, provider, model } = await generateText({ system: MEMO_SYSTEM_PROMPT, prompt });

    const memos = await readMemos();
    const existingIndex = memos.findIndex((m) => m.dealId === dealId);

    const memo: ICMemo = {
      id: existingIndex >= 0 ? memos[existingIndex].id : `memo-${Math.random().toString(36).slice(2, 9)}`,
      dealId,
      generatedAt: new Date().toISOString(),
      content: text,
      provider,
      model,
    };

    if (existingIndex >= 0) {
      memos[existingIndex] = memo;
    } else {
      memos.push(memo);
    }

    await writeMemos(memos);

    return NextResponse.json(memo, { status: 200 });
  } catch (error) {
    console.error('Failed to generate IC memo:', error);

    if (error instanceof LlmConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof LlmRequestError) {
      return NextResponse.json(
        { error: `LLM provider returned an error (status ${error.status}): ${error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: 'Failed to generate IC memo. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get('dealId');

  if (!dealId) {
    return NextResponse.json({ error: 'dealId query parameter is required.' }, { status: 400 });
  }

  try {
    const memos = await readMemos();
    const memo = memos.find((m) => m.dealId === dealId);

    if (!memo) {
      return NextResponse.json({ error: `No memo found for deal "${dealId}".` }, { status: 404 });
    }

    return NextResponse.json(memo, { status: 200 });
  } catch (error) {
    console.error('Failed to read IC memos:', error);
    return NextResponse.json({ error: 'Failed to read IC memos.' }, { status: 500 });
  }
}
