'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, BadgeCheck, Clock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Client's color palette
const colors = {
  teal: '#2EC4B6',
  navy: '#1F2A44',
  orange: '#F7931E',
  yellow: '#FFC857',
  coral: '#FF5A5F',
  white: '#F7F9F9',
  skyBlue: '#8FE3CF',
};


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
          <div className="relative">
            {/* Strategic background glows - positioned behind cards */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Teal glow behind highlighted card (right side) */}
              <div 
                className="absolute top-1/2 right-0 w-80 h-80 -translate-y-1/2 rounded-full blur-[100px] opacity-25"
                style={{ background: colors.teal }}
              />
              {/* Subtle warm accent behind left card */}
              <div 
                className="absolute top-1/3 left-0 w-48 h-48 rounded-full blur-[80px] opacity-10"
                style={{ background: colors.orange }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 relative z-10">
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
                  'relative rounded-2xl p-6 border grain overflow-hidden transition-all duration-300',
                  tier.highlighted
                    ? 'border-[#2EC4B6]/40 bg-gradient-to-br from-[#2EC4B6]/10 via-[#8FE3CF]/5 to-transparent hover:shadow-[0_0_40px_rgba(46,196,182,0.25)] hover:border-[#2EC4B6]/60'
                    : 'border-background/15 bg-background/5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-background/25'
                )}
              >
                {/* Card-specific accent elements */}
                {tier.highlighted ? (
                  <>
                    {/* Corner accent for highlighted card */}
                    <div 
                      className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-40"
                      style={{ background: colors.teal }}
                    />
                    {/* Bottom accent */}
                    <div 
                      className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-2xl opacity-20"
                      style={{ background: colors.skyBlue }}
                    />
                  </>
                ) : (
                  <>
                    {/* Subtle warm corner accent for standard card */}
                    <div 
                      className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-15"
                      style={{ background: colors.orange }}
                    />
                  </>
                )}
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                {tier.badge && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -top-3 right-6 px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.teal}, ${colors.skyBlue})`,
                      color: colors.navy,
                    }}
                  >
                    <BadgeCheck className="w-3 h-3" />
                    {tier.badge}
                  </motion.span>
                )}

                <div className="mb-6 relative">
                  <div className="flex items-center gap-2">
                    {/* Icon that relates to the tier type */}
                    {tier.highlighted ? (
                      <Crown className="w-4 h-4" style={{ color: colors.teal }} />
                    ) : (
                      <Clock className="w-4 h-4" style={{ color: colors.orange }} />
                    )}
                    <h3 className="text-sm font-medium text-background/60">{tier.name}</h3>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span 
                      className="text-4xl font-black"
                      style={{ color: tier.highlighted ? colors.teal : colors.white }}
                    >
                      {tier.price}
                    </span>
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
                    'relative block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 overflow-hidden group',
                    tier.highlighted
                      ? 'text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : 'border border-background/20 text-background hover:bg-background/10 hover:border-background/30'
                  )}
                  style={tier.highlighted ? {
                    background: `linear-gradient(135deg, ${colors.teal}, ${colors.skyBlue})`,
                  } : undefined}
                >
                  {tier.highlighted && (
                    <span 
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  )}
                  <span className="relative">{tier.ctaText}</span>
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
                        <Check 
                          className="w-4 h-4 flex-shrink-0 mt-0.5" 
                          style={{ color: tier.highlighted ? colors.teal : colors.skyBlue }}
                        />
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
    </div>
  );
}
