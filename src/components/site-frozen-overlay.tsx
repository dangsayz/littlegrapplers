'use client';

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Lock, Power, CreditCard } from 'lucide-react';
import { MASTER_EMAILS, type PlatformStatusData } from '@/lib/site-status';
import { CLIENT_OWNER_EMAILS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface SiteFrozenOverlayProps {
  message?: string;
  initialStatus?: PlatformStatusData | null;
}

export function SiteFrozenOverlay({ message, initialStatus }: SiteFrozenOverlayProps) {
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const [status, setStatus] = useState<PlatformStatusData | null>(initialStatus || null);
  const [isEnabling, setIsEnabling] = useState(false);

  const pathname = usePathname();
  const isSuperAdmin = isLoaded && userEmail && MASTER_EMAILS.map(e => e.toLowerCase()).includes(userEmail.toLowerCase());
  const isClientOwner = isLoaded && userEmail && CLIENT_OWNER_EMAILS.map(e => e.toLowerCase()).includes(userEmail.toLowerCase());
  
  // Allow access to sign-in and payment pages even when frozen
  const isOnPaymentPage = pathname === '/dashboard/admin/developer';
  const isOnSignInPage = pathname?.startsWith('/sign-in');

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/admin/platform');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch platform status:', error);
      }
    }

    if (!initialStatus) {
      fetchStatus();
    }

    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [initialStatus]);

  const handleEnablePlatform = async () => {
    if (!isSuperAdmin) return;
    
    setIsEnabling(true);
    try {
      const res = await fetch('/api/admin/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable' }),
      });

      if (res.ok) {
        setStatus(prev => prev ? { ...prev, is_enabled: true } : null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to enable platform:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  if (!status || status.is_enabled) {
    return null;
  }

  // Allow access to sign-in page without overlay (so people can actually sign in)
  if (isOnSignInPage) {
    return null;
  }

  // Super admins (Dang) bypass the frozen overlay completely
  if (isSuperAdmin) {
    return null;
  }

  // Allow Stephen to access the payment page without overlay
  if (isClientOwner && isOnPaymentPage) {
    return null;
  }

  // Client owner (Stephen) sees elegant minimal maintenance page
  if (isClientOwner) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #e6e9ec 0%, #dde1e5 35%, #d4d8dd 70%, #cdd2d8 100%)',
        }}
      >
        {/* Diagonal light beam from top-left */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(130deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 20%, transparent 45%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* Subtle vignette around button area */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,0.03) 100%)',
          }}
        />

        {/* Floating card with glow */}
        <div className="relative" style={{ transform: 'scaleY(0.97)' }}>
          {/* Warm subsurface glow - emanating from BEHIND the pill */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,200,160,0.5) 0%, rgba(255,185,140,0.35) 25%, rgba(255,170,120,0.15) 50%, transparent 75%)',
              filter: 'blur(18px)',
            }}
          />

          {/* Secondary warm glow - bottom concentrated */}
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 20%, rgba(255,180,130,0.7) 0%, rgba(255,165,110,0.4) 40%, transparent 75%)',
              filter: 'blur(12px)',
            }}
          />

          {/* Primary soft shadow - directly underneath */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-[85%] h-8 pointer-events-none"
            style={{
              bottom: '-18px',
              background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(60,50,45,0.18) 0%, rgba(60,50,45,0.08) 50%, transparent 80%)',
              filter: 'blur(10px)',
            }}
          />

          {/* Secondary ambient shadow - wide spread */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-[120%] h-12 pointer-events-none"
            style={{
              bottom: '-28px',
              background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(80,70,65,0.06) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Main pill */}
          <a
            href="/dashboard/admin/developer"
            className="relative flex items-center gap-4 px-9 py-4 cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
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
              className="text-gray-400" 
              style={{ 
                width: '18px', 
                height: '18px',
                opacity: 0.55,
                marginLeft: '2px',
              }} 
            />
          </a>
        </div>
      </div>
    );
  }

  // Regular users see professional maintenance page
  // If logged in, show sign out option. If not logged in, just show the offline message.
  const isLoggedIn = isLoaded && user;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
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
        
        {/* Pill - clickable, goes to sign-in */}
        <a
          href="/sign-in?redirect_url=/dashboard/admin/developer"
          className="relative flex items-center gap-4 px-9 py-4 cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
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
        </a>
      </div>

      {/* Sign out button for logged-in users */}
      {isLoggedIn && (
        <div className="relative mt-8">
          <SignOutButton>
            <button
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline underline-offset-2"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
