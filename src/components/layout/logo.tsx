import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link
      href="/"
      className={cn('flex items-center focus-visible:outline-none', className)}
    >
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          sizeClasses[size],
          {
            'text-foreground': variant === 'default',
            'text-white': variant === 'light',
            'text-black': variant === 'dark',
          }
        )}
      >
        Little Grapplers
      </span>
    </Link>
  );
}
