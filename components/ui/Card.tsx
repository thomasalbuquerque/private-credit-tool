import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-slate-600 bg-slate-800 shadow-sm', className)}>
      {title ? (
        <div className='border-b border-slate-700 px-5 py-3'>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-200'>{title}</h3>
        </div>
      ) : null}
      <div className='p-5'>{children}</div>
    </div>
  );
}
