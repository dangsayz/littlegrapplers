import { supabaseAdmin } from '@/lib/supabase';
import { Wrench } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';

async function getPlatformStatus() {
  // Prevent caching - always fetch fresh status
  noStore();
  try {
    const { data, error } = await supabaseAdmin
      .from('platform_status')
      .select('is_enabled, disabled_reason')
      .limit(1)
      .single();

    if (error || !data) {
      // If table doesn't exist or no data, assume site is enabled
      return { is_enabled: true, disabled_reason: null };
    }

    return data;
  } catch {
    // On any error, default to enabled
    return { is_enabled: true, disabled_reason: null };
  }
}

export async function SiteOfflineCheck({ children }: { children: React.ReactNode }) {
  const status = await getPlatformStatus();

  if (!status.is_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Glass card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-full blur-2xl" />
            
            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            
            <div className="relative z-10 p-10 text-center">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20 mb-8">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LG</span>
                </div>
                <span className="text-white font-semibold text-lg">Little Grapplers</span>
              </div>
              
              {/* Message */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                We'll Be Right Back
              </h1>
              
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                {status.disabled_reason || 'We are performing scheduled maintenance to enhance your experience. We will be back shortly.'}
              </p>
              
              {/* Decorative element */}
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
          
          {/* Footer text */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Thank you for your patience
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
