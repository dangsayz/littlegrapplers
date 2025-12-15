'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { FadeIn } from './motion';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  dark?: boolean;
}

/**
 * StatCounter - Animated stat with count-up effect
 * Purpose: Rewards scrolling, provides credibility
 */
export function StatCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
  dark = false,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    // Animate count up
    const duration = 1500; // ms
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(Math.round(easedProgress * value));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value, prefersReducedMotion]);

  return (
    <FadeIn direction="up">
      <div ref={ref} className="text-center">
        {/* Large stat number */}
        <div className={`text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight ${
          dark ? 'text-background' : 'text-foreground'
        }`}>
          <span className="text-brand">{prefix}</span>
          {displayValue.toLocaleString()}
          <span className="text-brand">{suffix}</span>
        </div>

        {/* Label */}
        <div className={`mt-2 text-sm uppercase tracking-[0.15em] font-medium ${
          dark ? 'text-background/60' : 'text-muted-foreground'
        }`}>
          {label}
        </div>

        {/* Sublabel */}
        {sublabel && (
          <div className={`mt-1 text-xs ${
            dark ? 'text-background/40' : 'text-muted-foreground/60'
          }`}>
            {sublabel}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

/**
 * StatsGrid - Container for stat counters
 */
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  dark?: boolean;
}

export function StatsGrid({ children, columns = 3, dark = false }: StatsGridProps) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`
      grid ${colClasses[columns]} gap-8 md:gap-12
      ${dark ? '' : 'py-12 border-y border-border'}
    `}>
      {children}
    </div>
  );
}
