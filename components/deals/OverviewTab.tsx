import Card from '@/components/ui/Card';
import type { Deal, RiskStatus } from '@/types';
import { cn, formatMillions, relativeDate, riskColor, riskStatusColor, riskStatusLabel } from '@/lib/utils';

interface OverviewTabProps {
  deal: Deal;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs uppercase tracking-wider text-slate-500'>{label}</p>
      <p className='mt-1 text-sm font-medium text-slate-900'>{value}</p>
    </div>
  );
}

const RISK_ROWS: { key: keyof Deal['riskBreakdown']; label: string }[] = [
  { key: 'financials', label: 'Financials' },
  { key: 'collateral', label: 'Collateral' },
  { key: 'industry', label: 'Industry' },
  { key: 'legal', label: 'Legal' },
];

function RiskRow({ label, status, isLast }: { label: string; status: RiskStatus; isLast: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-3', !isLast && 'border-b border-slate-100')}>
      <span className='text-sm text-slate-700'>{label}</span>
      <span className='flex items-center gap-2'>
        <span className={cn('h-2 w-2 rounded-full', riskStatusColor(status))} />
        <span className='text-xs font-medium text-slate-500'>{riskStatusLabel(status)}</span>
      </span>
    </div>
  );
}

export default function OverviewTab({ deal }: OverviewTabProps) {
  const { bar } = riskColor(deal.riskScore);

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      {/* ── Left column ── */}
      <div className='space-y-6 lg:col-span-2'>
        <Card title='Deal Summary'>
          <div className='grid grid-cols-2 gap-x-6 gap-y-5'>
            <Field label='Borrower' value={deal.companyName} />
            <Field label='Sector' value={deal.industry} />
            <Field label='Revenue' value={formatMillions(deal.revenue)} />
            <Field label='EBITDA' value={formatMillions(deal.ebitda)} />
            <Field label='Sponsor' value={deal.sponsor} />
            <Field label='Owner' value={deal.owner} />
          </div>
        </Card>

        <Card title='Risk Assessment'>
          <p className='text-3xl font-semibold tabular-nums text-slate-900'>
            {deal.riskScore}
            <span className='text-lg font-normal text-slate-400'> / 100</span>
          </p>
          <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100'>
            <div className={cn('h-full rounded-full', bar)} style={{ width: `${deal.riskScore}%` }} />
          </div>

          <div className='mt-4'>
            {RISK_ROWS.map((row, i) => (
              <RiskRow
                key={row.key}
                label={row.label}
                status={deal.riskBreakdown[row.key]}
                isLast={i === RISK_ROWS.length - 1}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right column ── */}
      <div className='space-y-6 lg:col-span-1'>
        <Card title='Deal Timeline'>
          {deal.timeline.length === 0 ? (
            <p className='text-sm text-slate-400'>No timeline steps yet.</p>
          ) : (
            <div>
              {deal.timeline.map((step, i) => {
                const isLast = i === deal.timeline.length - 1;
                return (
                  <div key={`${step.label}-${i}`} className='relative flex gap-3'>
                    {!isLast && <span className='absolute left-1.5 top-4 h-full w-px bg-slate-200' />}
                    <span
                      className={cn(
                        'relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full',
                        step.completed ? 'bg-indigo-500' : 'border-2 border-slate-300 bg-white'
                      )}
                    />
                    <div className='min-w-0 pb-5'>
                      <p className={cn('text-sm leading-snug', step.completed ? 'font-medium text-slate-900' : 'text-slate-400')}>
                        {step.label}
                      </p>
                      <p className='mt-0.5 text-xs text-slate-400'>{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title='Recent Activity'>
          {deal.recentActivity.length === 0 ? (
            <p className='text-sm text-slate-400'>No recent activity.</p>
          ) : (
            <ul className='space-y-3'>
              {deal.recentActivity.slice(0, 3).map((item, i) => (
                <li key={`${item.date}-${i}`} className='flex gap-2.5'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400' />
                  <div className='min-w-0'>
                    <p className='text-sm leading-snug text-slate-700'>{item.action}</p>
                    <p className='mt-0.5 text-xs text-slate-400'>{relativeDate(item.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
