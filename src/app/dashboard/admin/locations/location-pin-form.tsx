'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LocationPinFormProps {
  locationId: string;
  locationName: string;
  currentPin: string;
}

export function LocationPinForm({ locationId, locationName, currentPin }: LocationPinFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState(currentPin);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
          <Key className="h-4 w-4 mr-2" />
          {currentPin ? 'Change PIN' : 'Set PIN'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Community PIN</DialogTitle>
          <DialogDescription>
            Set a PIN code for {locationName}. Parents will need this PIN to access the community discussion board.
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
