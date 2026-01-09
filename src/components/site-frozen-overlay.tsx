'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AlertTriangle, Lock, Power } from 'lucide-react';
import { MASTER_EMAILS, type PlatformStatusData } from '@/lib/site-status';
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

  const isSuperAdmin = isLoaded && userEmail && MASTER_EMAILS.map(e => e.toLowerCase()).includes(userEmail.toLowerCase());

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

  if (isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8">
            <Power className="h-10 w-10 text-red-400" />
          </div>

          <h1 className="text-2xl font-semibold text-white mb-4">
            Platform Disabled
          </h1>

          <p className="text-slate-400 mb-4 leading-relaxed">
            {status.disabled_reason || 'The platform has been manually disabled.'}
          </p>

          {status.auto_disabled && (
            <div className="mb-6 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <p className="text-sm text-amber-300">
                Auto-disabled due to payment overdue by {status.payment_overdue_days} days
              </p>
            </div>
          )}

          {status.disabled_by && (
            <p className="text-sm text-slate-500 mb-6">
              Disabled by: {status.disabled_by}
              {status.disabled_at && ` on ${new Date(status.disabled_at).toLocaleDateString()}`}
            </p>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleEnablePlatform}
              disabled={isEnabling}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Power className="h-4 w-4 mr-2" />
              {isEnabling ? 'Enabling...' : 'Enable Platform'}
            </Button>
            
            <p className="text-xs text-slate-500">
              You are viewing this as a Super Admin. Regular users see the maintenance page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
          <Lock className="h-10 w-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Site Temporarily Unavailable
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          {message || status.disabled_reason || 'This website is currently under maintenance. We apologize for any inconvenience and will be back shortly.'}
        </p>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-500">
            For urgent inquiries, please contact:
          </p>
          <a 
            href="mailto:dangzr1@gmail.com" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            dangzr1@gmail.com
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">
            If you are the site owner, please check your billing status.
          </p>
        </div>
      </div>
    </div>
  );
}
