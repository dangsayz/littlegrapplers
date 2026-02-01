import { supabaseAdmin } from '@/lib/supabase';
import { Lock } from 'lucide-react';
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
      <div 
        className="min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #e6e9ec 0%, #dde1e5 35%, #d4d8dd 70%, #cdd2d8 100%)',
        }}
      >
        {/* Diagonal light beam */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(130deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 20%, transparent 45%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        <div className="relative" style={{ transform: 'scaleY(0.97)' }}>
          {/* Warm subsurface glow */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,200,160,0.5) 0%, rgba(255,185,140,0.35) 25%, rgba(255,170,120,0.15) 50%, transparent 75%)',
              filter: 'blur(18px)',
            }}
          />

          {/* Bottom glow */}
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 20%, rgba(255,180,130,0.7) 0%, rgba(255,165,110,0.4) 40%, transparent 75%)',
              filter: 'blur(12px)',
            }}
          />

          {/* Primary shadow */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-[85%] h-8 pointer-events-none"
            style={{
              bottom: '-18px',
              background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(60,50,45,0.18) 0%, rgba(60,50,45,0.08) 50%, transparent 80%)',
              filter: 'blur(10px)',
            }}
          />

          {/* Ambient shadow */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-[120%] h-12 pointer-events-none"
            style={{
              bottom: '-28px',
              background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(80,70,65,0.06) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Pill */}
          <div
            className="relative flex items-center gap-4 px-9 py-4"
            style={{
              borderRadius: '9999px',
              background: 'linear-gradient(180deg, #fffcfa 0%, #faf7f5 50%, #f7f4f2 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <span 
              className="font-medium"
              style={{ 
                fontSize: '17px',
                color: '#2a2a2a',
                letterSpacing: '0.01em',
              }}
            >
              Service Offline
            </span>
            <Lock 
              style={{ 
                width: '18px', 
                height: '18px',
                color: '#9ca3af',
                opacity: 0.55,
                marginLeft: '2px',
              }} 
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
