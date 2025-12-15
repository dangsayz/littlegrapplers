'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * BorderBeamButton - Pill button with animated gradient border beam
 * Purpose: Guides user to primary action with subtle motion reward
 * Per MOTION-SYSTEM.md: GPU-only (gradient position), respects reduced-motion
 */

interface BorderBeamButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'light' | 'dark';
}

export function BorderBeamButton({
  children,
  href,
  onClick,
  className,
  variant = 'dark',
}: BorderBeamButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = cn(
    'group relative inline-flex items-center justify-center gap-2',
    'px-8 py-4 rounded-full font-medium text-sm uppercase tracking-wider',
    'transition-all duration-300',
    variant === 'dark' 
      ? 'bg-foreground text-background hover:bg-foreground/90' 
      : 'bg-white text-foreground hover:bg-white/90 border border-foreground/20',
    className
  );

  const content = (
    <>
      {/* Animated border beam */}
      <span 
        className={cn(
          'absolute inset-0 rounded-full',
          'before:absolute before:inset-0 before:rounded-full before:p-px',
          'before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent',
          'before:opacity-0 group-hover:before:opacity-100',
          'before:transition-opacity before:duration-300',
          prefersReducedMotion ? '' : 'before:animate-border-beam'
        )}
      />
      
      {/* Border */}
      <span 
        className={cn(
          'absolute inset-0 rounded-full border',
          variant === 'dark' ? 'border-background/10' : 'border-foreground/10',
          'group-hover:border-brand/50 transition-colors duration-300'
        )}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href as any} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}

/**
 * GlowButton - Button with glow effect on hover
 */
interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function GlowButton({
  children,
  href,
  onClick,
  className,
}: GlowButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = cn(
    'group relative inline-flex items-center justify-center gap-2',
    'px-8 py-4 rounded-full font-medium',
    'bg-brand text-brand-foreground',
    'transition-all duration-300',
    className
  );

  const content = (
    <>
      {/* Glow effect */}
      {!prefersReducedMotion && (
        <span 
          className={cn(
            'absolute inset-0 rounded-full bg-brand',
            'opacity-0 group-hover:opacity-40 blur-xl',
            'transition-opacity duration-500 -z-10',
            'scale-110'
          )}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href as any} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}
