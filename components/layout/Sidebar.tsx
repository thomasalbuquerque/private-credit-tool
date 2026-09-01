'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, Briefcase, LayoutDashboard, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Deals', href: '/deals', icon: Briefcase },
];

function BrandMark() {
  return (
    <div className='flex items-center gap-2 px-5 py-6'>
      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20'>
        <Building2 className='h-5 w-5 text-indigo-300' suppressHydrationWarning />
      </div>
      <span className='text-base font-semibold tracking-tight text-white'>CreditDesk</span>
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className='flex-1 space-y-1 px-3 py-2'>
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800/60 hover:text-slate-100',
            )}
          >
            <Icon className='h-5 w-5' suppressHydrationWarning />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter() {
  return (
    <div className='border-t border-slate-800 px-4 py-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200'>SJ</div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-white'>Sarah Johnson</p>
          <p className='truncate text-xs text-slate-200'>Senior Associate</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes. Adjusting state during render
  // (rather than in an effect) avoids an extra render pass after navigation.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsDrawerOpen(false);
  }

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className='fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:hidden'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20'>
            <Building2 className='h-4 w-4 text-indigo-300' suppressHydrationWarning />
          </div>
          <span className='text-sm font-semibold tracking-tight text-white'>CreditDesk</span>
        </div>
        <button
          type='button'
          onClick={() => setIsDrawerOpen(true)}
          aria-label='Open navigation menu'
          className='rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white'
        >
          <Menu className='h-5 w-5' />
        </button>
      </div>

      {/* ── Desktop fixed rail ── */}
      <aside className='fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-slate-900 md:flex'>
        <BrandMark />
        <NavList pathname={pathname} />
        <UserFooter />
      </aside>

      {/* ── Mobile slide-in drawer ── */}
      {isDrawerOpen ? (
        <div className='fixed inset-0 z-40 md:hidden'>
          <div className='absolute inset-0 bg-slate-950/70' onClick={() => setIsDrawerOpen(false)} />
          <aside className='relative z-10 flex h-full w-64 max-w-[80vw] flex-col bg-slate-900 shadow-xl'>
            <div className='flex items-center justify-between px-5 py-6'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20'>
                  <Building2 className='h-5 w-5 text-indigo-300' suppressHydrationWarning />
                </div>
                <span className='text-base font-semibold tracking-tight text-white'>CreditDesk</span>
              </div>
              <button
                type='button'
                onClick={() => setIsDrawerOpen(false)}
                aria-label='Close navigation menu'
                className='rounded-lg p-1.5 text-slate-200 transition-colors hover:bg-slate-800 hover:text-white'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setIsDrawerOpen(false)} />
            <UserFooter />
          </aside>
        </div>
      ) : null}
    </>
  );
}
