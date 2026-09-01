import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-500 text-white border border-indigo-500 hover:bg-indigo-400 disabled:hover:bg-indigo-500',
  secondary: 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600/60',
  ghost: 'bg-transparent text-slate-200 border border-transparent hover:bg-slate-700/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
      {children}
    </button>
  );
}
