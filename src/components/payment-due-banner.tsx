'use client';

import { AlertCircle, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface PaymentDueBannerProps {
  dueDate: string | null;
  overdueDays: number;
  isOverdue: boolean;
}

type UrgencyLevel = 'info' | 'warning' | 'urgent' | 'critical';

export function PaymentDueBanner({ dueDate }: PaymentDueBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate days until the 1st of next month (payment always due on the 1st)
  const { daysUntilDue, isActuallyOverdue, urgencyLevel, targetDate } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Target is always the 1st of the next month
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine urgency level based on days until due
    let level: UrgencyLevel = 'info';
    if (diffDays <= 3) {
      level = 'warning';
    } else if (diffDays <= 7) {
      level = 'info';
    }
    
    return { 
      daysUntilDue: diffDays, 
      isActuallyOverdue: false, // Payment is never overdue since we're counting to next 1st
      urgencyLevel: level,
      targetDate: target
    };
  }, []);

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted || dismissed || !dueDate) return null;

  const formattedDueDate = targetDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric'
  });

  const getMessage = (): { main: string; sub?: string } => {
    if (daysUntilDue === 0) {
      return {
        main: `Invoice due today`,
        sub: 'Payment is due by end of business day.'
      };
    } else if (daysUntilDue === 1) {
      return {
        main: `Invoice due tomorrow`,
        sub: 'Services will pause if unpaid.'
      };
    } else if (daysUntilDue <= 3) {
      return {
        main: `Invoice due in ${daysUntilDue} days`,
        sub: 'Services will pause if unpaid.'
      };
    } else if (daysUntilDue <= 7) {
      return {
        main: `Payment due in ${daysUntilDue} days`,
        sub: `Due ${formattedDueDate}`
      };
    }
    return {
      main: `Next payment in ${daysUntilDue} days`,
      sub: 'Billed on the 1st of each month.'
    };
  };

  const message = getMessage();
  const showIcon = urgencyLevel !== 'info' || daysUntilDue <= 7;

  // Get urgency-based colors (simplified - payment is always upcoming, never overdue)
  const getUrgencyColors = () => {
    if (urgencyLevel === 'warning') {
      return {
        gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.1) 50%, rgba(217,119,6,0.15) 100%)',
        iconColor: 'text-amber-400',
        glowColor: 'rgba(251,191,36,0.6)',
        edgeColor: 'rgba(251,191,36,0.4)',
      };
    }
    // Default - info level (payment coming up but not urgent)
    return {
      gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 25%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.1) 75%, rgba(59,130,246,0.15) 100%)',
      iconColor: 'text-cyan-400',
      glowColor: 'rgba(6,182,212,0.6)',
      edgeColor: 'rgba(6,182,212,0.4)',
    };
  };

  const colors = getUrgencyColors();

  return (
    <div className="relative z-50 w-full overflow-hidden">
      {/* Glacier ice glass base */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl">
        {/* Urgency-based gradient */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: colors.gradient,
            backgroundSize: '400% 400%',
            animation: 'holographicShift 12s ease-in-out infinite',
          }}
        />
        
        {/* Frosted glass overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Top edge highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.edgeColor} 20%, rgba(255,255,255,0.6) 50%, ${colors.edgeColor} 80%, transparent 100%)`,
          }}
        />
        
        {/* Bottom edge - subtle depth */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.edgeColor} 30%, ${colors.edgeColor} 50%, ${colors.edgeColor} 70%, transparent 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-center gap-4">
            {/* Icon - Clock for upcoming payment */}
            {showIcon && (
              <div className="relative">
                {urgencyLevel === 'warning' ? (
                  <AlertCircle 
                    className={`h-4 w-4 flex-shrink-0 ${colors.iconColor}`}
                    style={{ 
                      filter: `drop-shadow(0 0 6px ${colors.glowColor})`,
                      animation: 'subtlePulse 3s ease-in-out infinite'
                    }}
                  />
                ) : (
                  <Clock 
                    className={`h-4 w-4 flex-shrink-0 ${colors.iconColor}`}
                    style={{ filter: `drop-shadow(0 0 6px ${colors.glowColor})` }}
                  />
                )}
              </div>
            )}
            
            {/* Message - main and sub text */}
            <div className="flex items-center gap-2">
              <p 
                className="text-[13px] font-medium tracking-wide text-white"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  letterSpacing: '0.02em'
                }}
              >
                {message.main}
              </p>
              {message.sub && (
                <>
                  <span className="text-white/30">|</span>
                  <p className="text-[12px] text-white/70">
                    {message.sub}
                  </p>
                </>
              )}
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/admin/developer"
              className="group relative inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-300"
            >
              <span 
                className={`relative z-10 font-bold ${
                  urgencyLevel === 'warning'
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400'
                    : 'bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400'
                } bg-clip-text text-transparent`}
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                Pay now
              </span>
              <ArrowRight 
                className={`h-3.5 w-3.5 ${colors.iconColor} transition-all duration-300 group-hover:translate-x-1`} 
              />
              
              {/* Hover glow */}
              <div 
                className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{
                  background: `radial-gradient(circle, ${colors.glowColor.replace('0.6', '0.2')} 0%, transparent 70%)`,
                }}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes holographicShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
