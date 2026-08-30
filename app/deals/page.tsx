'use client';

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Inbox, ArrowRight } from 'lucide-react';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import Skeleton from '@/components/ui/Skeleton';
import { getDeals, createDeal } from '@/services/dealService';
import type { Deal, DealStage } from '@/types';
import { cn, formatMillions, getInitials, riskColor, stageBadgeVariant } from '@/lib/utils';

const STAGE_OPTIONS: DealStage[] = ['Screening', 'Due Diligence', 'IC Review', 'Closed'];

const INDUSTRY_OPTIONS = ['Industrial', 'Healthcare', 'Technology', 'Retail', 'Energy', 'Real Estate'];

interface NewDealFormState {
  companyName: string;
  industry: string;
  dealSize: string;
  revenue: string;
  ebitda: string;
  sponsor: string;
  owner: string;
}

const EMPTY_FORM: NewDealFormState = {
  companyName: '',
  industry: INDUSTRY_OPTIONS[0],
  dealSize: '',
  revenue: '',
  ebitda: '',
  sponsor: '',
  owner: '',
};

function RiskBar({ score }: { score: number }) {
  const { bar, text } = riskColor(score);
  return (
    <div className='flex items-center gap-2'>
      <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-100'>
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn('text-xs font-medium tabular-nums', text)}>{score}/100</span>
    </div>
  );
}

export default function DealsPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | DealStage>('All');
  const [industryFilter, setIndustryFilter] = useState<'All' | string>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewDealFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    getDeals().then((data) => {
      setDeals(data);
      setIsLoading(false);
    });
  }, []);

  const industries = useMemo(() => {
    return [...new Set(deals.map((d) => d.industry))].sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesSearch = query === '' || deal.companyName.toLowerCase().includes(query);
      const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;
      const matchesIndustry = industryFilter === 'All' || deal.industry === industryFilter;
      return matchesSearch && matchesStage && matchesIndustry;
    });
  }, [deals, search, stageFilter, industryFilter]);

  const activeDealsCount = useMemo(() => deals.filter((d) => d.stage !== 'Closed').length, [deals]);
  const stageCount = useMemo(() => new Set(deals.map((d) => d.stage)).size, [deals]);

  function handleRowNavigate(id: string) {
    router.push(`/deals/${id}`);
  }

  function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowNavigate(id);
    }
  }

  const canSubmit = form.companyName.trim() !== '' && form.dealSize !== '' && form.ebitda !== '';

  async function handleCreateDeal(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    const dealSize = Number(form.dealSize) || 0;
    const revenue = Number(form.revenue) || 0;
    const ebitda = Number(form.ebitda) || 0;
    const leverage = ebitda > 0 ? Math.round((dealSize / ebitda) * 10) / 10 : 0;

    await createDeal({
      companyName: form.companyName,
      industry: form.industry,
      dealSize,
      revenue,
      ebitda,
      leverage,
      sponsor: form.sponsor,
      stage: 'Screening',
      owner: form.owner,
      riskScore: 50,
      riskBreakdown: {
        financials: 'yellow',
        collateral: 'yellow',
        industry: 'yellow',
        legal: 'yellow',
      },
      timeline: [],
      recentActivity: [],
    });
    // TODO: refetch or update state after real POST

    setIsSubmitting(false);
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setToastOpen(true);
  }

  return (
    <div className='px-6 py-8 lg:px-10'>
      {/* ── Header ── */}
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>Deal Pipeline</h1>
          <p className='mt-1 text-sm text-slate-500'>
            {isLoading ? 'Loading deals…' : `${activeDealsCount} active deals across ${stageCount} stages`}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className='h-4 w-4' />
          New Deal
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1 sm:max-w-xs'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by company name…'
            className='w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as 'All' | DealStage)}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
        >
          <option value='All'>All Stages</option>
          {STAGE_OPTIONS.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
        >
          <option value='All'>All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <Card className='overflow-hidden'>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12' />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-12 text-center'>
            <Inbox className='h-8 w-8 text-slate-300' />
            <p className='text-sm font-medium text-slate-500'>No deals match your filters</p>
            <p className='text-xs text-slate-400'>Try adjusting your search or filter selections.</p>
          </div>
        ) : (
          <div className='-m-5 overflow-x-auto'>
            <table className='w-full min-w-225 text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Company</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Industry</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Deal Size</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Leverage</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Stage</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Owner</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Risk Score</th>
                  <th className='px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, i) => (
                  <tr
                    key={deal.id}
                    tabIndex={0}
                    role='link'
                    onClick={() => handleRowNavigate(deal.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, deal.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none',
                      i % 2 === 1 && 'bg-slate-50/30',
                      i < filteredDeals.length - 1 && 'border-b border-slate-100'
                    )}
                  >
                    <td className='px-5 py-3.5'>
                      <p className='font-medium text-slate-900 leading-tight'>{deal.companyName}</p>
                      <span className='mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500'>{deal.industry}</span>
                    </td>
                    <td className='px-3 py-3.5 text-slate-600'>{deal.industry}</td>
                    <td className='px-3 py-3.5 tabular-nums text-slate-700'>{formatMillions(deal.dealSize)}</td>
                    <td className='px-3 py-3.5 tabular-nums text-slate-700'>{deal.leverage.toFixed(1)}x EBITDA</td>
                    <td className='px-3 py-3.5'>
                      <Badge variant={stageBadgeVariant(deal.stage)}>{deal.stage}</Badge>
                    </td>
                    <td className='px-3 py-3.5'>
                      <div className='flex items-center gap-2'>
                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-600'>
                          {getInitials(deal.owner)}
                        </span>
                        <span className='text-slate-700'>{deal.owner}</span>
                      </div>
                    </td>
                    <td className='px-3 py-3.5'>
                      <RiskBar score={deal.riskScore} />
                    </td>
                    <td className='px-3 py-3.5 text-right'>
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className='inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700'
                      >
                        View <ArrowRight className='h-3.5 w-3.5' />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── New Deal Modal ── */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='New Deal'
        footer={
          <>
            <Button variant='secondary' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeal} loading={isSubmitting} disabled={!canSubmit}>
              Create Deal
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDeal} className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Company Name</label>
            <input
              type='text'
              required
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-slate-600'>Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
            >
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600'>Deal Size ($M)</label>
              <input
                type='number'
                required
                min={0}
                value={form.dealSize}
                onChange={(e) => setForm((f) => ({ ...f, dealSize: e.target.value }))}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600'>Revenue ($M)</label>
              <input
                type='number'
                min={0}
                value={form.revenue}
                onChange={(e) => setForm((f) => ({ ...f, revenue: e.target.value }))}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600'>EBITDA ($M)</label>
              <input
                type='number'
                required
                min={0}
                value={form.ebitda}
                onChange={(e) => setForm((f) => ({ ...f, ebitda: e.target.value }))}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600'>Sponsor</label>
              <input
                type='text'
                value={form.sponsor}
                onChange={(e) => setForm((f) => ({ ...f, sponsor: e.target.value }))}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600'>Owner</label>
              <input
                type='text'
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
              />
            </div>
          </div>
        </form>
      </Modal>

      <Toast open={toastOpen} message='Deal created successfully.' onClose={() => setToastOpen(false)} />
    </div>
  );
}
