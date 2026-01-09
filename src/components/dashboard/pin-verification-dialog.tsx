'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationSlug: string;
  locationName: string;
}

const REMEMBER_PIN_KEY = 'lg_remembered_pins';

function getRememberedPins(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(REMEMBER_PIN_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setRememberedPin(slug: string, pin: string) {
  if (typeof window === 'undefined') return;
  try {
    const pins = getRememberedPins();
    pins[slug] = pin;
    localStorage.setItem(REMEMBER_PIN_KEY, JSON.stringify(pins));
  } catch {
    console.error('Failed to save PIN to localStorage');
  }
}

function clearRememberedPin(slug: string) {
  if (typeof window === 'undefined') return;
  try {
    const pins = getRememberedPins();
    delete pins[slug];
    localStorage.setItem(REMEMBER_PIN_KEY, JSON.stringify(pins));
  } catch {
    console.error('Failed to clear PIN from localStorage');
  }
}

export function hasRememberedPin(slug: string): boolean {
  const pins = getRememberedPins();
  return !!pins[slug];
}

export function getRememberedPin(slug: string): string | null {
  const pins = getRememberedPins();
  return pins[slug] || null;
}

export function PinVerificationDialog({
  isOpen,
  onClose,
  locationSlug,
  locationName,
}: PinVerificationDialogProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberPin, setRememberPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setSuccess(false);
      setShowPin(false);
      
      const remembered = getRememberedPin(locationSlug);
      if (remembered) {
        setPin(remembered);
        setRememberPin(true);
      }
    }
  }, [isOpen, locationSlug]);

  const handleVerify = async () => {
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch(`/api/locations/${locationSlug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid PIN');
        if (!res.ok) {
          clearRememberedPin(locationSlug);
        }
        return;
      }

      if (rememberPin) {
        setRememberedPin(locationSlug, pin.trim());
      } else {
        clearRememberedPin(locationSlug);
      }

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        router.push(`/community/${locationSlug}`);
      }, 500);
    } catch {
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              success 
                ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                : 'bg-gradient-to-br from-[#2EC4B6] to-[#1FA89C]'
            )}>
              {success ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Lock className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-left">Enter Community PIN</DialogTitle>
              <DialogDescription className="text-left mt-1">
                {locationName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder="Enter 4-6 digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                'pr-10 text-center text-lg tracking-widest font-mono',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              maxLength={6}
              autoFocus
              disabled={isVerifying || success}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPin ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-pin"
              checked={rememberPin}
              onCheckedChange={(checked) => setRememberPin(checked === true)}
              disabled={isVerifying || success}
            />
            <label
              htmlFor="remember-pin"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Remember PIN for this location
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isVerifying || success}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!pin.trim() || isVerifying || success}
              className={cn(
                'flex-1 transition-colors',
                success 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-[#2EC4B6] hover:bg-[#2EC4B6]/90'
              )}
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Verified
                </span>
              ) : (
                'Verify PIN'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
