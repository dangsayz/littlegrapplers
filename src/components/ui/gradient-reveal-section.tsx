'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientRevealSectionProps {
  primaryText: string;
  secondaryText: string;
  description?: string;
  className?: string;
  variant?: 'brand' | 'accent' | 'secondary';
}

/**
 * Gradient Reveal Section Component
 * Purpose: Creates a visually striking section with gradient background
 * and reveal typography animation. Draws attention to key messaging.
 * 
 * Motion: Text clips in from bottom with staggered timing
 * Accessibility: prefers-reduced-motion respected via Framer Motion
 */
export function GradientRevealSection({
  primaryText,
  secondaryText,
  description,
  className,
  variant = 'brand',
}: GradientRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const gradientStyles = {
    brand: 'from-brand via-brand/70 to-secondary',
    accent: 'from-accent via-accent/70 to-brand',
    secondary: 'from-secondary via-secondary/70 to-brand',
  };

  // Split text into characters for staggered animation
  const primaryChars = primaryText.split('');
  const secondaryChars = secondaryText.split('');

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden py-24 md:py-32',
        className
      )}
    >
      {/* Gradient background with mesh effect */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-90',
          gradientStyles[variant]
        )}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : {}}
        transition={{ duration: 1 }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-background/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-4xl">
          {/* Primary text with reveal animation */}
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-background leading-none"
            >
              {primaryText}
            </motion.h2>
          </div>

          {/* Secondary text - more subtle */}
          <div className="overflow-hidden mt-2">
            <motion.p
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-background/50 leading-none"
            >
              {secondaryText}
            </motion.p>
          </div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-px w-full bg-background/30 mt-12 origin-left"
          />

          {/* Description */}
          {description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent block mb-3">
                Why It Matters
              </span>
              <p className="text-lg text-background/80 max-w-xl font-mono">
                "{description}"
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
