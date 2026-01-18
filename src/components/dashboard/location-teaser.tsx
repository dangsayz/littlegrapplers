'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, MessageSquare, Clock, ChevronRight, Lock, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationActivity {
  id: string;
  title: string;
  createdAt: string;
  authorEmail: string;
}

interface PinnedLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  accessPin: string | null;
  latestActivity: LocationActivity | null;
}

interface LocationTeaserProps {
  locations: PinnedLocation[];
  isAdmin?: boolean;
}

function PinEditor({ 
  locationId, 
  locationName, 
  currentPin, 
  open, 
  onOpenChange 
}: { 
  locationId: string; 
  locationName: string; 
  currentPin: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pin, setPin] = useState(currentPin);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when dialog opens with new location
  React.useEffect(() => {
    if (open) {
      setPin(currentPin);
      setError('');
    }
  }, [open, currentPin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/locations/${locationId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update PIN');
      }
    } catch {
      setError('Failed to update PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Community PIN</DialogTitle>
          <DialogDescription>
            Set a PIN code for {locationName}. Parents will need this PIN to access the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN Code</Label>
            <Input
              id="pin"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 4-6 digit PIN"
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Use 4-6 digits. Share this PIN with parents at this location.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || pin.length < 4}>
              {isLoading ? 'Saving...' : 'Save PIN'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LocationTeaser({ locations, isAdmin = false }: LocationTeaserProps) {
  const [editingLocation, setEditingLocation] = useState<PinnedLocation | null>(null);

  if (locations.length === 0) {
    return null;
  }

  const handlePinClick = (e: React.MouseEvent, location: PinnedLocation) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLocation(location);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Communities</h2>
          <Link 
            href="/locations" 
            className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {locations.map((location, index) => {
            // Apple/Google inspired accent colors with texture
            const accentStyles = [
              'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
              'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500',
              'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
              'bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500',
              'bg-gradient-to-r from-rose-400 via-pink-500 to-red-500',
            ];
            const accentClass = accentStyles[index % accentStyles.length];

            return (
            <Link
              key={location.id}
              href={`/community/${location.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300">
                {/* Header with unique gradient accent */}
                <div className={`h-1.5 ${accentClass}`}>
                  <div className="h-full w-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>
                
                <div className="p-5">
                  {/* Location Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/50 flex items-center justify-center flex-shrink-0 group-hover:ring-slate-300 transition-all">
                      <MapPin className="h-6 w-6 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
                            {location.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {location.city}, {location.state}
                          </p>
                        </div>
                        {isAdmin && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => handlePinClick(e, location)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono transition-colors"
                              >
                                <Lock className="h-3 w-3" />
                                {location.accessPin || '----'}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Admin PIN. Click to edit.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity - Social Media Style */}
                  {location.latestActivity ? (
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-snug" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                            {location.latestActivity.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(location.latestActivity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-400">No recent posts</p>
                      <p className="text-xs text-slate-300 mt-0.5">Be the first to start a conversation</p>
                    </div>
                  )}

                  {/* CTA Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Tap to enter community</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                      Open
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
          })}
        </div>

        {editingLocation && (
          <PinEditor
            locationId={editingLocation.id}
            locationName={editingLocation.name}
            currentPin={editingLocation.accessPin || ''}
            open={!!editingLocation}
            onOpenChange={(open) => !open && setEditingLocation(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
