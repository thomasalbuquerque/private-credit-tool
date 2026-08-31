'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Download, FileText, Loader2, RefreshCw } from 'lucide-react';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import MemoContent from '@/components/deals/MemoContent';
import { getMemoByDealId, generateMemo } from '@/services/memoService';
import { getSecurityByDealId } from '@/services/securityService';
import { getDueDiligenceByDealId } from '@/services/dueDiligenceService';
import type { Deal, Finding, ICMemo, Security } from '@/types';
import { formatDateTime, formatMillions } from '@/lib/utils';

interface ICMemoTabProps {
  deal: Deal;
}

// TEMPORARY — replaced by the real LLM call in the next prompt.
async function generatePlaceholderMemo(deal: Deal, findings: Finding[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const keyRisksLines =
    findings.length > 0
      ? findings.map((f) => `- ${f.title}`).join('\n')
      : '- No significant findings identified to date.';

  const mitigantsLines =
    findings.length > 0
      ? findings.map((f) => `- ${f.mitigation || 'Mitigation plan to be finalized with the deal team.'}`).join('\n')
      : '- Standard covenant package and reporting requirements apply.';

  return `## Investment Recommendation
Proceed with the proposed credit facility for ${deal.companyName}, subject to satisfactory completion of the outstanding due diligence workstreams and standard closing conditions.

## Executive Summary
${deal.companyName} is a ${deal.industry} company sponsored by ${deal.sponsor}, seeking a ${formatMillions(
    deal.dealSize
  )} facility. The company generates ${formatMillions(deal.revenue)} in revenue and ${formatMillions(
    deal.ebitda
  )} in EBITDA, implying leverage of ${deal.leverage.toFixed(1)}x. The deal is currently in the ${deal.stage} stage under the ownership of ${deal.owner}.

## Investment Thesis
The transaction offers an attractive risk-adjusted return profile supported by the sponsor's track record and the company's position within the ${deal.industry} sector. The internal risk score of ${deal.riskScore}/100 reflects a manageable credit profile relative to comparable transactions.

## Financial Overview
- Deal size: ${formatMillions(deal.dealSize)}
- Revenue: ${formatMillions(deal.revenue)}
- EBITDA: ${formatMillions(deal.ebitda)}
- Leverage: ${deal.leverage.toFixed(1)}x

## Key Risks
${keyRisksLines}

## Mitigants
${mitigantsLines}

## Recommendation
The deal team recommends approval, subject to final sign-off on outstanding diligence items and execution of definitive documentation.`;
}
// TODO(next prompt): replace generatePlaceholderMemo with POST /api/memos (real LLM call).

export default function ICMemoTab({ deal }: ICMemoTabProps) {
  const [memo, setMemo] = useState<ICMemo | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  // Loaded now, but not rendered yet — the next prompt sends this alongside the deal to the LLM.
  const [security, setSecurity] = useState<Security | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMemoByDealId(deal.id), getSecurityByDealId(deal.id), getDueDiligenceByDealId(deal.id)]).then(
      ([memoData, securityData, dueDiligenceData]) => {
        setMemo(memoData ?? null);
        setSecurity(securityData);
        setFindings(dueDiligenceData?.findings ?? []);
        setIsLoading(false);
      }
    );
  }, [deal.id]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const content = await generatePlaceholderMemo(deal, findings);
      const newMemo = await generateMemo(deal.id, content);
      setMemo(newMemo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate IC memo. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <Skeleton className='mb-6 h-6 w-64' />
        <div className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='flex flex-col items-center gap-3 py-16 text-center'>
        <AlertTriangle className='h-8 w-8 text-red-400' />
        <p className='text-sm font-medium text-slate-700'>{error}</p>
        <Button onClick={handleGenerate} loading={isGenerating}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (!memo && isGenerating) {
    return (
      <Card className='flex flex-col items-center gap-2 py-20 text-center'>
        <Loader2 className='h-8 w-8 animate-spin text-indigo-500' />
        <p className='text-sm font-medium text-slate-700'>Generating memo from deal data...</p>
        <p className='text-xs text-slate-400'>This can take up to 30 seconds.</p>
      </Card>
    );
  }

  if (!memo) {
    return (
      <Card className='flex flex-col items-center gap-3 py-20 text-center'>
        <FileText className='h-8 w-8 text-slate-300' />
        <p className='text-sm font-medium text-slate-900'>No IC Memo Generated</p>
        <p className='max-w-md text-sm text-slate-500'>
          Generate an Investment Committee memo based on deal data, securities, and diligence findings.
        </p>
        <Button size='lg' onClick={handleGenerate} loading={isGenerating} className='mt-2'>
          Generate IC Memo
        </Button>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Investment Committee Memo</h2>
          <p className='mt-0.5 text-xs text-slate-500'>Generated on {formatDateTime(memo.generatedAt)}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm'>
            <Download className='h-3.5 w-3.5' />
            Export to PDF
          </Button>
          <Button variant='secondary' size='sm' onClick={handleGenerate} loading={isGenerating}>
            <RefreshCw className='h-3.5 w-3.5' />
            Regenerate
          </Button>
        </div>
      </div>

      <MemoContent content={memo.content} findings={findings} />
    </div>
  );
}
