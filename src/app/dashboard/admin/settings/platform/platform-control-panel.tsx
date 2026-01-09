'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { type PlatformStatusData } from '@/lib/site-status';

interface PlatformStatusLog {
  id: string;
  action: string;
  performed_by: string;
  reason: string | null;
  previous_status: boolean | null;
  new_status: boolean | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface PlatformControlPanelProps {
  initialStatus: PlatformStatusData | null;
  logs: PlatformStatusLog[];
  adminEmail: string;
}

export function PlatformControlPanel({
  initialStatus,
  logs,
  adminEmail,
}: PlatformControlPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

  const isEnabled = status?.is_enabled ?? true;

  const handleTogglePlatform = async (enable: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enable ? 'enable' : 'disable',
          reason: enable ? null : disableReason || 'Maintenance',
        }),
      });

      if (res.ok) {
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                is_enabled: enable,
                disabled_reason: enable ? null : disableReason || 'Maintenance',
                disabled_by: enable ? null : adminEmail,
                disabled_at: enable ? null : new Date().toISOString(),
              }
            : null
        );
        setDisableReason('');
        setShowEnableConfirm(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to toggle platform:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Tesla-style Status Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Status indicator bar */}
        <div className={`h-1 ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        
        <div className="p-8">
          {/* Main toggle area */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Embedded Power Button - Apple/Editorial Style */}
            {isEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button 
                    className="group relative mb-6 focus:outline-none"
                    disabled={isLoading}
                  >
                    {/* Outer glow ring */}
                    <div className="absolute -inset-2 rounded-full bg-emerald-400/20 blur-lg group-hover:bg-emerald-400/30 transition-all duration-300" />
                    
                    {/* Button base with 3D effect */}
                    <div className="relative h-28 w-28 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]">
                      {/* Inner button */}
                      <div className="h-full w-full rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:from-emerald-500 group-hover:to-emerald-600 group-active:from-emerald-600 group-active:to-emerald-700 transition-all duration-200">
                        <Power className="h-10 w-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm rounded-3xl border-0 shadow-2xl">
                  <AlertDialogHeader className="text-center pb-2">
                    <AlertDialogTitle className="text-xl font-semibold">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-slate-600">
                      This will take your entire website offline. All visitors will see a "Site Unavailable" message until you turn it back on.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Textarea
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="resize-none rounded-xl border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                      rows={2}
                    />
                  </div>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                    <AlertDialogAction
                      onClick={() => handleTogglePlatform(false)}
                      className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-12 font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Yes, Take Offline'}
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full rounded-xl h-12 mt-0 font-medium">Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog open={showEnableConfirm} onOpenChange={setShowEnableConfirm}>
                <AlertDialogTrigger asChild>
                  <button 
                    className="group relative mb-6 focus:outline-none"
                    disabled={isLoading}
                  >
                    {/* Button base with 3D effect - Offline state */}
                    <div className="relative h-28 w-28 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]">
                      {/* Inner button - muted */}
                      <div className="h-full w-full rounded-full bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:from-emerald-400 group-hover:to-emerald-500 transition-all duration-200">
                        <Power className="h-10 w-10 text-white/80 group-hover:text-white drop-shadow-sm transition-colors" strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm rounded-3xl border-0 shadow-2xl">
                  <AlertDialogHeader className="text-center pb-2">
                    <AlertDialogTitle className="text-xl font-semibold">Bring site back online?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-slate-600">
                      Your website will be live again and accessible to everyone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-col pt-4">
                    <AlertDialogAction
                      onClick={() => handleTogglePlatform(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl h-12 font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Yes, Bring Online'}
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full rounded-xl h-12 mt-0 font-medium">Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {/* Status text */}
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              {isEnabled ? 'Online' : 'Offline'}
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mb-1">
              {isEnabled
                ? 'Your website is live and accessible to everyone'
                : status?.disabled_reason || 'Your website is currently offline'}
            </p>
            <p className="text-slate-400 text-xs">
              {isEnabled ? 'Tap the button to take offline' : 'Tap the button to bring back online'}
            </p>
          </div>

          {/* What happens hint box */}
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEnabled ? (
                <>
                  <span className="font-medium text-slate-700">When you turn OFF:</span> All visitors will see a "Site Unavailable" page. Only you and your co-admin can still access the site.
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700">When you turn ON:</span> Your website goes live instantly. Everyone can visit littlegrapplers.net again.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Log - Minimal */}
      {logs.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-medium text-slate-900 text-sm">History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    log.action === 'enabled' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-sm text-slate-700">
                    {log.action === 'enabled' ? 'Brought online' : 'Taken offline'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
