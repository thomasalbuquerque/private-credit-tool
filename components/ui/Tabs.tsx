'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div role='tablist' className={cn('flex items-center gap-6 border-b border-slate-200', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type='button'
            role='tab'
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px border-b-2 px-1 py-3 text-sm transition-colors',
              isActive
                ? 'border-slate-900 font-medium text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
