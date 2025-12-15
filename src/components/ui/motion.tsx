'use client';

/**
 * Motion Components - see docs/MOTION-SYSTEM.md
 * 
 * Purpose: Reveal, guide, reward
 * Constraints: GPU-only (transform, opacity), zero layout shift
 * All components respect prefers-reduced-motion
 */

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

// Motion tokens matching CSS variables
const MOTION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  stagger: 0.06, // 60ms stagger between children
} as const;

// Easing functions matching CSS variables
const EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
};

// Viewport settings for scroll-triggered animations
const VIEWPORT = {
  once: true,
  margin: '-10% 0px -10% 0px',
};

/**
 * FadeIn - Scroll-triggered reveal animation
 * Purpose: Rewards scrolling, reveals content hierarchy
 */
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: 'fast' | 'normal' | 'slow';
}

const directionOffsets = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

// Blur values for blur-in effect
const BLUR = {
  initial: 'blur(8px)',
  animate: 'blur(0px)',
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 'slow',
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = directionOffsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: BLUR.initial, ...offset }}
      whileInView={{ opacity: 1, filter: BLUR.animate, x: 0, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: MOTION[duration],
        delay,
        ease: EASE.outExpo,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Parent container for staggered children
 * Purpose: Creates visual hierarchy through sequential reveals
 * Rule: Max 5 staggered items without user trigger
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = MOTION.stagger,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Child item within StaggerContainer
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = directionOffsets[direction];

  const itemVariants: Variants = {
    hidden: prefersReducedMotion 
      ? { opacity: 1 } 
      : { opacity: 0, filter: BLUR.initial, ...offset },
    visible: {
      opacity: 1,
      filter: BLUR.animate,
      x: 0,
      y: 0,
      transition: {
        duration: MOTION.slow,
        ease: EASE.outExpo,
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * HeroText - Awwwards-style character-by-character reveal
 * Purpose: Cinematic entrance with split-text animation
 * Effect: Each character slides up from behind a mask with staggered timing
 */
interface HeroTextProps {
  lines: Array<{ text: string; className?: string }>;
  className?: string;
}

export function HeroText({ lines, className }: HeroTextProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: 0.2,
      },
    },
  };

  // Each line staggers its characters
  const lineVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.03, // Fast stagger for smooth wave
      },
    },
  };

  // Character animation: slide up from behind mask with slight rotation
  const charVariants: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : {
          y: '120%',
          rotateX: -40,
          opacity: 0,
        },
    visible: {
      y: '0%',
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // outExpo
      },
    },
  };

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ perspective: '1000px' }}
    >
      {lines.map((line, lineIndex) => (
        <motion.span
          key={lineIndex}
          className={`block overflow-hidden whitespace-nowrap ${line.className || ''}`}
          variants={lineVariants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Split text into characters with mask reveal */}
          {line.text.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={charVariants}
              style={{ 
                transformOrigin: 'center bottom',
                display: char === ' ' ? 'inline' : 'inline-block',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/**
 * FadeInCTA - Fade in for CTA buttons after hero text
 * Purpose: Guides user to action after content reveal
 */
interface FadeInCTAProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInCTA({ children, className, delay = 0.3 }: FadeInCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION.normal,
        delay,
        ease: EASE.outExpo,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleOnHover - Subtle scale effect for interactive elements
 * Purpose: Micro-feedback, indicates interactivity
 * Constraint: Max 2% scale, uses GPU-only transform
 */
interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnHover({
  children,
  className,
  scale = 1.02,
}: ScaleOnHoverProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: MOTION.fast, ease: EASE.outExpo }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollIndicator - Subtle scroll prompt (replaces animate-bounce)
 * Purpose: Guides user to scroll, not decorative
 */
export function ScrollIndicator({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: MOTION.slow }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-current opacity-30" />
      </motion.div>
    </motion.div>
  );
}
