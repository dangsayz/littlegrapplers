'use client';
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
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <MapPin className="h-3 w-3" />
        <span>{locationName}</span>
      </span>
      {locationPin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 cursor-help"
                onClick={(e) => e.stopPropagation()}
              >
                <Key className="h-3 w-3 text-teal-600" />
                <span className="font-mono text-xs font-semibold text-teal-700 tracking-wider">
                  {locationPin}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 text-white">
              <p className="text-xs">Community PIN - use this to access discussions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
