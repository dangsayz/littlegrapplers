'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface PaymentDueBannerProps {
  dueDate: string | null;
  overdueDays: number;
  isOverdue: boolean;
}

export function PaymentDueBanner({ dueDate, overdueDays, isOverdue }: PaymentDueBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const formattedDueDate = dueDate 
    ? new Date(dueDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    : null;

  const isUrgent = overdueDays > 7;
  const isCritical = overdueDays > 14;

  const getMessage = () => {
    if (isCritical) {
      return `Payment ${overdueDays} days overdue. Immediate action required.`;
    } else if (isUrgent) {
      return `Payment ${overdueDays} days overdue. Please resolve soon.`;
    } else if (isOverdue) {
      return `Payment overdue since ${formattedDueDate}.`;
    }
    return `Payment due ${formattedDueDate}.`;
  };

  return (
    <div className="relative z-50 w-full overflow-hidden">
      {/* Glacier ice glass base */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl">
        {/* Holographic ice gradient - animated */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 25%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.1) 75%, rgba(59,130,246,0.15) 100%)',
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
        
        {/* Top edge highlight - ice reflection */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(139,92,246,0.4) 80%, transparent 100%)',
          }}
        />
        
        {/* Bottom edge - subtle depth */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.2) 30%, rgba(59,130,246,0.3) 50%, rgba(139,92,246,0.2) 70%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-center gap-4">
            {/* Icon with cyan glow */}
            {(isOverdue || isCritical || isUrgent) && (
              <div className="relative">
                <AlertCircle 
                  className="h-4 w-4 flex-shrink-0 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                  style={{ animation: 'subtlePulse 3s ease-in-out infinite' }}
                />
              </div>
            )}
            
            {/* Message - high contrast white text */}
            <p 
              className="text-[13px] font-medium tracking-wide text-white"
              style={{ 
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                letterSpacing: '0.02em'
              }}
            >
              {getMessage()}
            </p>

            {/* CTA with holographic effect */}
            <Link
              href="/dashboard/admin/developer"
              className="group relative inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-300"
            >
              <span 
                className="relative z-10 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent font-bold"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                Pay now
              </span>
              <ArrowRight 
                className="h-3.5 w-3.5 text-cyan-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-400" 
              />
              
              {/* Hover glow */}
              <div 
                className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
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
