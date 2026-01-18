'use client';

import { useState } from 'react';
import { CreditCard, Copy, Check, X, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentLinkButtonProps {
  studentId: string;
  studentName: string;
  parentEmail: string;
}

export function PaymentLinkButton({ studentId, studentName, parentEmail }: PaymentLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [planType, setPlanType] = useState<'monthly' | '3month'>('monthly');
  const [error, setError] = useState<string | null>(null);

  const generateLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, planType }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate link');
      }
      
      setPaymentUrl(data.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!paymentUrl) return;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEmailClient = () => {
    if (!paymentUrl) return;
    
    const subject = encodeURIComponent(`Payment Link for ${studentName} - Little Grapplers`);
    const body = encodeURIComponent(
      `Hi,\n\nHere is your payment link to complete enrollment for ${studentName}:\n\n${paymentUrl}\n\nThis link will take you to a secure checkout page.\n\nThank you!\nLittle Grapplers`
    );
    
    window.open(`mailto:${parentEmail}?subject=${subject}&body=${body}`);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setPaymentUrl(null);
    setError(null);
    setCopied(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Send Payment Link
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Link</DialogTitle>
            <DialogDescription>
              Generate a checkout link for <span className="font-medium text-gray-900">{studentName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plan Selection */}
            {!paymentUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPlanType('monthly')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      planType === 'monthly'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Monthly</p>
                    <p className="text-lg font-bold text-gray-900">$50<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  </button>
                  <button
                    onClick={() => setPlanType('3month')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      planType === '3month'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">3 Months</p>
                    <p className="text-lg font-bold text-gray-900">$150<span className="text-sm font-normal text-gray-500"> once</span></p>
                  </button>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {!paymentUrl && !error && (
              <Button
                onClick={generateLink}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Generate Payment Link
                  </>
                )}
              </Button>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  onClick={generateLink}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Success - Show Link */}
            {paymentUrl && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">Payment link ready!</p>
                  </div>
                  <p className="text-xs text-emerald-600 break-all">{paymentUrl}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={openEmailClient}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Parent
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Sending to: {parentEmail}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
