'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, DollarSign, BarChart3, ClipboardCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getDeals } from '@/services/dealService';
import type { Deal } from '@/types';
import { cn, formatMillions, formatLongDate, relativeDate, stageBadgeVariant } from '@/lib/utils';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  iconBg: string;
}

function KpiCard({ icon, label, value, trend, iconBg }: KpiCardProps) {
  return (
    <Card>
      <div className='flex items-start justify-between gap-3'>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>{icon}</div>
        <div className='min-w-0 flex-1 text-right'>
          <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>{label}</p>
          <p className='mt-1 text-2xl font-semibold tabular-nums text-slate-900'>{value}</p>
          <p className='mt-0.5 text-xs text-slate-400'>{trend}</p>
        </div>
      </div>
    </Card>
  );
}

interface PipelineBoxProps {
  stage: string;
  count: number;
  borderColor: string;
  textColor: string;
}

function PipelineBox({ stage, count, borderColor, textColor }: PipelineBoxProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm border-l-4', borderColor)}>
      <span className='text-xs font-semibold uppercase tracking-wider text-slate-500'>{stage}</span>
      <span className={cn('text-3xl font-bold tabular-nums', textColor)}>{count}</span>
      <span className='text-xs text-slate-400'>{count === 1 ? 'deal' : 'deals'}</span>
    </div>
  );
}

interface ActivityRowProps {
  action: string;
  company: string;
  relDate: string;
  isLast: boolean;
}

function ActivityRow({ action, company, relDate, isLast }: ActivityRowProps) {
  return (
    <div className='relative flex gap-3'>
      {/* vertical line */}
      {!isLast && <span className='absolute left-1.75 top-5 h-full w-px bg-slate-100' />}
      <span className='relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-indigo-400 bg-white' />
      <div className='min-w-0 pb-5'>
        <p className='text-sm text-slate-700 leading-snug'>
          {action}
          <span className='ml-1 text-xs font-medium text-slate-400'>· {company}</span>
        </p>
        <p className='mt-0.5 text-xs text-slate-400'>{relDate}</p>
      </div>
    </div>
  );
}

function PulseSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200', className)} />;
}

const RISK_COLORS = {
  'Low Risk': '#10b981', // emerald-500
  'Medium Risk': '#f59e0b', // amber-500
  'High Risk': '#ef4444', // red-500
} as const;

type RiskBucket = keyof typeof RISK_COLORS;

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // "now" is captured after mount to avoid hydration mismatch
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    getDeals().then((data) => {
      setDeals(data);
      setNow(new Date());
      setIsLoading(false);
    });
  }, []);

  // ── Derived KPIs ──────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const activeDeals = deals.filter((d) => d.stage !== 'Closed');
    const totalCommitted = deals.reduce((s, d) => s + d.dealSize, 0);
    const avgDealSize = deals.length > 0 ? totalCommitted / deals.length : 0;
    const icReviewCount = deals.filter((d) => d.stage === 'IC Review').length;
    return { activeDeals: activeDeals.length, totalCommitted, avgDealSize, icReviewCount };
  }, [deals]);

  // ── Pipeline counts ───────────────────────────────────────────────────────

  const pipelineCounts = useMemo(() => {
    const stages = ['Screening', 'Due Diligence', 'IC Review', 'Closed'] as const;
    return stages.map((stage) => ({
      stage,
      count: deals.filter((d) => d.stage === stage).length,
    }));
  }, [deals]);

  // ── Risk distribution ─────────────────────────────────────────────────────

  const riskData = useMemo(() => {
    const buckets: Record<RiskBucket, number> = {
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0,
    };
    deals.forEach((d) => {
      if (d.riskScore >= 70) buckets['Low Risk']++;
      else if (d.riskScore >= 40) buckets['Medium Risk']++;
      else buckets['High Risk']++;
    });
    return (Object.entries(buckets) as [RiskBucket, number][]).map(([name, value]) => ({ name, value }));
  }, [deals]);

  const riskChartData = riskData.filter((d) => d.value > 0);

  // ── Recent activity ───────────────────────────────────────────────────────

  const recentActivity = useMemo(() => {
    const items: { action: string; company: string; date: string }[] = [];
    deals.forEach((deal) => {
      deal.recentActivity.forEach((a) => {
        items.push({ action: a.action, company: deal.companyName, date: a.date });
      });
    });
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 6);
  }, [deals]);

  // ── Table preview (last 4 by createdAt) ──────────────────────────────────

  const tableDeals = useMemo(() => {
    return [...deals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [deals]);

  // ── Stage pipeline style map ──────────────────────────────────────────────

  const pipelineStyle: Record<string, { borderColor: string; textColor: string }> = {
    Screening: { borderColor: 'border-l-blue-500', textColor: 'text-blue-600' },
    'Due Diligence': { borderColor: 'border-l-amber-500', textColor: 'text-amber-600' },
    'IC Review': { borderColor: 'border-l-purple-500', textColor: 'text-purple-600' },
    Closed: { borderColor: 'border-l-green-500', textColor: 'text-green-600' },
  };

  return (
    <div className='px-6 py-8 lg:px-10'>
      {/* ── Header ── */}
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold text-slate-900'>Underwriting Dashboard</h1>
        <p className='mt-1 text-sm text-slate-500'>{now ? formatLongDate(now) : ''}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {isLoading ? (
          <>
            <PulseSkeleton className='h-28' />
            <PulseSkeleton className='h-28' />
            <PulseSkeleton className='h-28' />
            <PulseSkeleton className='h-28' />
          </>
        ) : (
          <>
            <KpiCard
              icon={<Briefcase className='h-5 w-5 text-indigo-600' />}
              iconBg='bg-indigo-50'
              label='Active Deals'
              value={String(kpis.activeDeals)}
              trend='Excluding closed'
            />
            <KpiCard
              icon={<DollarSign className='h-5 w-5 text-emerald-600' />}
              iconBg='bg-emerald-50'
              label='Total Committed'
              value={formatMillions(kpis.totalCommitted)}
              trend='Across all deals'
            />
            <KpiCard
              icon={<BarChart3 className='h-5 w-5 text-sky-600' />}
              iconBg='bg-sky-50'
              label='Avg Deal Size'
              value={formatMillions(kpis.avgDealSize)}
              trend='Portfolio average'
            />
            <KpiCard
              icon={<ClipboardCheck className='h-5 w-5 text-purple-600' />}
              iconBg='bg-purple-50'
              label='IC Review'
              value={String(kpis.icReviewCount)}
              trend='Pending committee'
            />
          </>
        )}
      </div>

      {/* ── Pipeline Summary ── */}
      <div className='mb-6'>
        <h2 className='mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500'>Pipeline Summary</h2>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <PulseSkeleton key={i} className='h-24' />)
            : pipelineCounts.map(({ stage, count }) => {
                const style = pipelineStyle[stage] ?? {
                  borderColor: 'border-l-slate-400',
                  textColor: 'text-slate-700',
                };
                return <PipelineBox key={stage} stage={stage} count={count} borderColor={style.borderColor} textColor={style.textColor} />;
              })}
        </div>
      </div>

      {/* ── Bottom grid: chart + activity + table ── */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Risk Distribution */}
        <div className='lg:col-span-1'>
          <Card title='Risk Distribution'>
            {isLoading ? (
              <PulseSkeleton className='h-48' />
            ) : (
              <>
                <ResponsiveContainer width='100%' height={180}>
                  <PieChart>
                    <Pie data={riskChartData} cx='50%' cy='50%' innerRadius={50} outerRadius={78} paddingAngle={3} dataKey='value'>
                      {riskChartData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name as RiskBucket]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} deal${value !== 1 ? 's' : ''}`]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend — always shows all three buckets */}
                <ul className='mt-2 space-y-1.5'>
                  {riskData.map(({ name, value }) => (
                    <li key={name} className='flex items-center justify-between'>
                      <span className='flex items-center gap-2 text-sm text-slate-600'>
                        <span
                          className='inline-block h-2.5 w-2.5 rounded-full'
                          style={{
                            backgroundColor: RISK_COLORS[name as RiskBucket],
                          }}
                        />
                        {name}
                      </span>
                      <span className='text-sm font-medium tabular-nums text-slate-900'>{value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div className='lg:col-span-1'>
          <Card title='Recent Activity'>
            {isLoading ? (
              <PulseSkeleton className='h-64' />
            ) : recentActivity.length === 0 ? (
              <p className='text-sm text-slate-400'>No recent activity.</p>
            ) : (
              <div className='relative'>
                {recentActivity.map((item, i) => (
                  <ActivityRow
                    key={`${item.date}-${i}`}
                    action={item.action}
                    company={item.company}
                    relDate={now ? relativeDate(item.date, now) : item.date}
                    isLast={i === recentActivity.length - 1}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Deals Table Preview */}
        <div className='lg:col-span-1'>
          <Card title='Recent Deals'>
            {isLoading ? (
              <PulseSkeleton className='h-64' />
            ) : (
              <div className='-mx-5 -mt-5'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-100'>
                      <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Company</th>
                      <th className='hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell'>Size</th>
                      <th className='px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableDeals.map((deal, i) => (
                      <tr key={deal.id} className={cn('transition-colors hover:bg-slate-50', i < tableDeals.length - 1 && 'border-b border-slate-100')}>
                        <td className='px-5 py-3'>
                          <p className='font-medium text-slate-900 leading-tight'>{deal.companyName}</p>
                          <p className='text-xs text-slate-400'>{deal.industry}</p>
                        </td>
                        <td className='hidden px-3 py-3 tabular-nums text-slate-700 sm:table-cell'>{formatMillions(deal.dealSize)}</td>
                        <td className='px-3 py-3'>
                          <Badge variant={stageBadgeVariant(deal.stage)}>{deal.stage}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='border-t border-slate-100 px-5 py-3 text-right'>
                  <Link href='/deals' className='text-xs font-medium text-indigo-600 hover:text-indigo-700'>
                    View all deals →
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
