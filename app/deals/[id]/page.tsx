'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, SearchX } from 'lucide-react';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Tabs, { type TabItem } from '@/components/ui/Tabs';
import OverviewTab from '@/components/deals/OverviewTab';
import SecuritiesTab from '@/components/deals/SecuritiesTab';
import DueDiligenceTab from '@/components/deals/DueDiligenceTab';
import ICMemoTab from '@/components/deals/ICMemoTab';
import { getDealById } from '@/services/dealService';
import type { Deal } from '@/types';
import { formatMillions, getInitials, stageBadgeVariant } from '@/lib/utils';

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'securities', label: 'Securities' },
  { id: 'diligence', label: 'Due Diligence' },
  { id: 'memo', label: 'IC Memo' },
];

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs uppercase tracking-wider text-slate-400'>{label}</span>
      <span className='text-sm font-semibold tabular-nums text-slate-100'>{value}</span>
    </div>
  );
}

export default function DealDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [deal, setDeal] = useState<Deal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getDealById(id).then((data) => {
      setDeal(data);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className='px-6 py-8 lg:px-10'>
        <Skeleton className='mb-6 h-4 w-48' />
        <Skeleton className='mb-6 h-32' />
        <Skeleton className='mb-6 h-10 w-96' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className='px-6 py-8 lg:px-10'>
        <Card>
          <EmptyState icon={<SearchX className='h-8 w-8 text-slate-400' />} title='Deal not found' />
          <div className='mt-1 text-center'>
            <Link href='/deals' className='text-sm font-medium text-indigo-400 hover:text-indigo-300'>
              ← Back to Deals
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='px-6 py-8 lg:px-10'>
      {/* ── Breadcrumb ── */}
      <div className='mb-6 flex items-center gap-1.5 text-sm'>
        <Link href='/deals' className='text-slate-400 hover:text-slate-300'>
          Deals
        </Link>
        <ChevronRight className='h-3.5 w-3.5 text-slate-400' />
        <span className='font-medium text-slate-100'>{deal.companyName}</span>
      </div>

      {/* ── Deal Header ── */}
      <Card className='mb-6'>
        <div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-center'>
          <div>
            <h1 className='text-2xl font-bold text-slate-100'>{deal.companyName}</h1>
            <p className='mt-1 text-sm text-slate-400'>{deal.sponsor}</p>
            <div className='mt-3'>
              <Badge variant={stageBadgeVariant(deal.stage)}>{deal.stage}</Badge>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-x-8 gap-y-4'>
            <KpiChip label='Deal Size' value={formatMillions(deal.dealSize)} />
            <KpiChip label='Revenue' value={formatMillions(deal.revenue)} />
            <KpiChip label='EBITDA' value={formatMillions(deal.ebitda)} />
            <KpiChip label='Leverage' value={`${deal.leverage.toFixed(1)}x`} />
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs uppercase tracking-wider text-slate-400'>Owner</span>
              <div className='flex items-center gap-2'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-300'>
                  {getInitials(deal.owner)}
                </span>
                <span className='text-sm font-semibold text-slate-100'>{deal.owner}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* ── Tab content ── */}
      <div>
        {activeTab === 'overview' && <OverviewTab deal={deal} />}
        {activeTab === 'securities' && <SecuritiesTab dealId={deal.id} />}
        {activeTab === 'diligence' && <DueDiligenceTab dealId={deal.id} />}
        {activeTab === 'memo' && <ICMemoTab deal={deal} />}
      </div>
    </div>
  );
}
