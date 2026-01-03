'use client';

import { useUser } from '@clerk/nextjs';
import { AlertTriangle, Lock } from 'lucide-react';
import { MASTER_EMAILS } from '@/lib/site-status';

interface SiteFrozenOverlayProps {
  message?: string;
}

export function SiteFrozenOverlay({ message }: SiteFrozenOverlayProps) {
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Masters can always see the site
  if (isLoaded && userEmail && MASTER_EMAILS.includes(userEmail)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        {/* Lock Icon */}
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
          <Lock className="h-10 w-10 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Site Temporarily Unavailable
        </h1>

        {/* Message */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          {message || 'This website is currently under maintenance. We apologize for any inconvenience and will be back shortly.'}
        </p>

        {/* Contact Info */}
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

        {/* Warning for client */}
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
