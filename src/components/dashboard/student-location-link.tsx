'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Key } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StudentLocationLinkProps {
  locationName: string;
  locationSlug: string;
  locationPin?: string;
}

export function StudentLocationLink({
  locationName,
  locationSlug,
  locationPin,
}: StudentLocationLinkProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={showPin} onOpenChange={setShowPin}>
        <TooltipTrigger asChild>
          <Link
            href={`/community/${locationSlug}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPin(true);
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 transition-colors mt-0.5 group"
          >
            <MapPin className="h-3 w-3" />
            <span className="underline-offset-2 group-hover:underline">
              {locationName}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-slate-900 text-white border-slate-700 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Access PIN for {locationName}</p>
            {locationPin ? (
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-teal-400" />
                <span className="font-mono text-lg font-bold tracking-widest text-teal-400">
                  {locationPin}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-300">No PIN required</p>
            )}
            <Link
              href={`/community/${locationSlug}`}
              className="block text-xs text-teal-400 hover:text-teal-300 underline mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              Go to community page
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
