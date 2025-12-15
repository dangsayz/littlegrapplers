'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassFeatureCardProps {
  children: ReactNode;
  label?: string;
  className?: string;
  variant?: 'default' | 'accent' | 'brand';
}

/**
 * Glass Feature Card Component
 * Purpose: Displays content in a glassmorphism container with viewport indicator.
 * Creates visual depth and modern aesthetic for feature highlights.
 * 
 * Motion: Fade in + slight scale on viewport entry
 * Accessibility: prefers-reduced-motion fallback via Framer Motion
 */
export function GlassFeatureCard({
  children,
  label,
  className,
  variant = 'default',
}: GlassFeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const variantStyles = {
    default: 'border-background/15 bg-background/5',
    accent: 'border-accent/30 bg-accent/5',
    brand: 'border-brand/30 bg-brand/5',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Outer glow effect */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-background/20 via-transparent to-background/10" />

      {/* Glass container */}
      <div
        className={cn(
          'relative rounded-2xl border backdrop-blur-xl p-6',
          variantStyles[variant]
        )}
      >
        {/* Viewport badge */}
        {label && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider uppercase bg-background/90 text-foreground rounded">
              {label}
            </span>
          </div>
        )}

        {/* Inner content areas with blur */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

interface GlassBlurBlockProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Blurred placeholder block for glass cards
 * Creates abstract content preview effect
 */
export function GlassBlurBlock({ className, size = 'md' }: GlassBlurBlockProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-24',
    lg: 'h-40',
  };

  return (
    <div
      className={cn(
        'rounded-lg bg-background/10 backdrop-blur-sm',
        heights[size],
        className
      )}
    />
  );
}
