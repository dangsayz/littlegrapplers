'use client';

import { WifiOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LocationOfflineOverlayProps {
  locationName?: string;
}

export function LocationOfflineOverlay({ locationName }: LocationOfflineOverlayProps) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Frosted glass background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <div className="mb-8">
            <div 
              className="inline-flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.1) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.2)',
              }}
            >
              <WifiOff className="h-12 w-12 text-slate-400" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Currently Unavailable
          </h1>
          <p className="text-lg text-slate-500 mb-2">
            {locationName ? `${locationName} is` : 'This community is'} temporarily offline.
          </p>
          <p className="text-slate-400 mb-8">
            Please check back later or contact your program administrator for more information.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg"
            >
              <Link href="/locations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Other Locations
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
