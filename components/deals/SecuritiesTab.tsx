'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, FileX, Gauge } from 'lucide-react';

import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { getSecurityByDealId } from '@/services/securityService';
import type { Security } from '@/types';
import { cn, formatMillions } from '@/lib/utils';

interface SecuritiesTabProps {
  dealId: string;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className='text-xs uppercase tracking-wider text-slate-500'>{label}</p>
      <p className={cn('mt-1 text-sm font-medium text-slate-900', mono && 'tabular-nums')}>{value}</p>
    </div>
  );
}

export default function SecuritiesTab({ dealId }: SecuritiesTabProps) {
  const [security, setSecurity] = useState<Security | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSecurityByDealId(dealId).then((data) => {
      setSecurity(data);
      setIsLoading(false);
    });
  }, [dealId]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-48' />
        <Skeleton className='h-56' />
        <Skeleton className='h-44' />
      </div>
    );
  }

  if (!security) {
    return (
      <Card className='flex flex-col items-center gap-2 py-16 text-center'>
        <FileX className='h-8 w-8 text-slate-300' />
        <p className='text-sm font-medium text-slate-500'>No security terms recorded for this deal</p>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* ── Credit Instrument ── */}
      <Card title='Credit Instrument'>
        <div className='grid grid-cols-2 gap-x-6 gap-y-5'>
          <Field label='Security Type' value={security.type} />
          <Field label='Amount' value={formatMillions(security.amount)} mono />
          <Field label='Interest Rate' value={security.rate} mono />
          <Field label='Maturity' value={security.maturity} />
          <Field label='Origination Fee' value={security.originationFee} mono />
        </div>
      </Card>

      {/* ── Financial Covenants ── */}
      <Card title='Financial Covenants'>
        {security.covenants.length === 0 ? (
          <p className='text-sm text-slate-400'>No covenants recorded.</p>
        ) : (
          <div className='-mx-5 -mt-5 overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Covenant Name
                  </th>
                  <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {security.covenants.map((covenant, i) => (
                  <tr
                    key={covenant.id}
                    className={cn(i < security.covenants.length - 1 && 'border-b border-slate-100')}
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-2'>
                        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50'>
                          <Gauge className='h-3.5 w-3.5 text-indigo-600' />
                        </span>
                        <span className='font-medium text-slate-900'>{covenant.name}</span>
                      </div>
                    </td>
                    <td className='px-5 py-3.5 text-right tabular-nums text-slate-700'>{covenant.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className='mt-3 text-xs text-slate-400'>Breach of any covenant triggers an event of default.</p>
      </Card>

      {/* ── Collateral Package ── */}
      <Card title='Collateral Package'>
        {security.collateral.length === 0 ? (
          <p className='text-sm text-slate-400'>No collateral pledged.</p>
        ) : (
          <div>
            {security.collateral.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className={cn(
                  'flex items-center gap-2.5 py-3',
                  i < security.collateral.length - 1 && 'border-b border-slate-100'
                )}
              >
                <CheckCircle className='h-4 w-4 shrink-0 text-emerald-500' />
                <span className='text-sm text-slate-700'>{item}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
