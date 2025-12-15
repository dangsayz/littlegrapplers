'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProcessStep {
  number: string;
  title: string;
  active?: boolean;
}

interface FloatingProcessCardsProps {
  steps: ProcessStep[];
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

/**
 * Floating Process Cards Component
 * Purpose: Visually demonstrates a multi-step process with floating glass cards
 * and animated toggle indicators. Teaches user about program structure.
 * 
 * Motion: GPU-only transforms (translateX, translateY, opacity)
 * Accessibility: prefers-reduced-motion handled via Framer Motion
 */
export function FloatingProcessCards({ 
  steps, 
  imageSrc = '/images/highlights/LittleGrapplers-05924.jpg',
  imageAlt = 'BJJ training in action',
  className 
}: FloatingProcessCardsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Position offsets for floating effect - creates depth
  const positions = [
    { x: -60, y: -40, rotate: -8 },
    { x: 80, y: 20, rotate: 4 },
    { x: -40, y: 80, rotate: -4 },
    { x: 60, y: 140, rotate: 6 },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full h-[400px] md:h-[500px] flex items-center justify-center',
        className
      )}
    >
      {/* Central glass container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={isInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-48 h-64 md:w-56 md:h-72"
        style={{ perspective: '1000px' }}
      >
        {/* Layered glass effect */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.3 - i * 0.08 } : {}}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="absolute inset-0 rounded-xl border border-background/20 bg-background/5 backdrop-blur-sm"
            style={{
              transform: `translateZ(${-i * 20}px) rotateY(${i * 3}deg) rotateX(${i * 2}deg)`,
            }}
          />
        ))}
        
        {/* Inner glass card with image */}
        <div className="absolute inset-4 rounded-lg border border-background/10 bg-background/10 backdrop-blur-xl overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 768px) 180px, 220px"
          />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>
      </motion.div>

      {/* Floating step cards */}
      {steps.map((step, index) => {
        const pos = positions[index] || positions[0];
        const delay = 0.4 + index * 0.1;

        // Staggered animation durations for organic movement
        const floatDuration = 4 + index * 0.5;
        const floatDelay = index * 0.3;

        return (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: pos.x * 0.5, y: pos.y + 30 }}
            animate={
              isInView
                ? { 
                    opacity: 1, 
                    x: pos.x, 
                    y: [pos.y, pos.y - 8, pos.y],
                  }
                : {}
            }
            transition={{
              opacity: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              x: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              y: { 
                delay: delay + floatDelay, 
                duration: floatDuration, 
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              },
            }}
            className="absolute"
            style={{ rotate: `${pos.rotate}deg` }}
          >
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-full grain overflow-hidden',
                'border backdrop-blur-lg transition-all duration-300 hover:scale-105',
                step.active
                  ? 'bg-foreground/90 border-foreground text-background'
                  : 'bg-background/10 border-background/20 text-background/80'
              )}
            >
              {/* Toggle indicator */}
              <div
                className={cn(
                  'w-8 h-5 rounded-full flex items-center p-0.5 transition-colors duration-300',
                  step.active ? 'bg-brand justify-end' : 'bg-background/20 justify-start'
                )}
              >
                <motion.div
                  layoutId={`toggle-${step.number}`}
                  className={cn(
                    'w-4 h-4 rounded-full',
                    step.active ? 'bg-background' : 'bg-background/40'
                  )}
                />
              </div>
              <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
                {step.number}. {step.title}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Decorative lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.1 }}
      >
        <motion.line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-background"
        />
        <motion.line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.9, duration: 1 }}
          className="text-background"
        />
      </svg>
    </div>
  );
}
