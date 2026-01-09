'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

interface LocationToggleProps {
  locationId: string;
  locationName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
}

export function LocationToggle({
  locationId,
  locationName,
  isActive,
  isSuperAdmin,
}: LocationToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isActive);

  if (!isSuperAdmin) {
    return null;
  }

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/locations/${locationId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        setCurrentStatus(!currentStatus);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to toggle location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Power className="h-4 w-4 mr-1.5" />
                Disable
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set <strong>{locationName}</strong> to offline. 
              Users will see "Currently Offline" when trying to access this location's community.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              className="bg-red-600 hover:bg-red-700"
            >
              Disable Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      size="sm"
      className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white border-0 backdrop-blur-sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Power className="h-4 w-4 mr-1.5" />
          Enable
        </>
      )}
    </Button>
  );
}
