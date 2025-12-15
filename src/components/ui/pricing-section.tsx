'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
  badge?: string;
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  tiers: PricingTier[];
  features?: { icon: ReactNode; title: string; description: string }[];
  className?: string;
}

/**
 * Pricing Section Component
 * Purpose: Displays pricing tiers in dark glass cards with brand CTA buttons.
 * Helps parents understand program options and take action.
 * 
 * Motion: Staggered card reveal with fade-up, subtle floating animation
 * Grain: Adds texture depth to cards for premium feel
 * Color: Uses client's teal brand for CTA buttons
 */
export function PricingSection({
  title,
  subtitle,
  description,
  tiers,
  features,
  className,
}: PricingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={cn('py-20 md:py-28', className)}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-16">
          {/* Left column - Title and features */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider uppercase border border-brand/30 text-brand rounded-full mb-6">
                {subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">
                {title.split(',').map((part, i) => (
                  <span key={i} className={i > 0 ? 'block' : ''}>
                    {part}
                    {i === 0 && ','}
                  </span>
                ))}
              </h2>
              {description && (
                <p className="mt-6 text-lg text-background/60 leading-relaxed">
                  {description}
                </p>
              )}
            </motion.div>

            {/* Feature list */}
            {features && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 space-y-6"
              >
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-background/20 bg-background/5 flex items-center justify-center text-background/60 grain overflow-hidden">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-background">{feature.title}</h3>
                      <p className="mt-1 text-sm text-background/50">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right column - Pricing cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'relative rounded-2xl p-6 border grain overflow-hidden transition-shadow duration-300',
                  tier.highlighted
                    ? 'border-brand/30 bg-brand/5 animate-float-delayed hover:shadow-[0_0_30px_rgba(46,196,182,0.15)]'
                    : 'border-background/15 bg-background/5 animate-float hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                )}
              >
                {tier.badge && (
                  <span className="absolute -top-3 right-6 px-3 py-1 text-xs font-bold bg-accent text-accent-foreground rounded-full">
                    {tier.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-background/60">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-background">{tier.price}</span>
                    {tier.period && (
                      <span className="text-background/50">/ {tier.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-background/50">{tier.description}</p>
                </div>

                {/* CTA Button */}
                <a
                  href={tier.ctaLink}
                  className={cn(
                    'block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                    tier.highlighted
                      ? 'bg-brand text-brand-foreground hover:bg-brand/90'
                      : 'border border-background/20 text-background hover:bg-background/10'
                  )}
                >
                  {tier.ctaText}
                </a>

                {/* Secondary link */}
                <button className="w-full mt-3 py-2 text-sm text-background/60 hover:text-background transition-colors">
                  Compare features
                </button>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-background/10">
                  <p className="text-xs uppercase tracking-wider text-background/40 mb-4">
                    {tier.highlighted ? 'Everything included, plus' : 'Includes'}
                  </p>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-background/70">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
