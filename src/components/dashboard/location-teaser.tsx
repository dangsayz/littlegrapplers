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
          <h2 className="text-lg font-semibold text-slate-900">Community Locations</h2>
          <Link 
            href="/locations" 
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/community/${location.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isAdmin && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => handlePinClick(e, location)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono transition-colors"
                              >
                                <Lock className="h-3 w-3" />
                                {location.accessPin || '----'}
                                <Settings className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Only admins can see this PIN. Click to edit.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-500">
                      {location.city}, {location.state}
                    </p>

                    {location.latestActivity ? (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MessageSquare className="h-3 w-3" />
                          <span className="truncate flex-1">
                            {location.latestActivity.title}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(location.latestActivity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
