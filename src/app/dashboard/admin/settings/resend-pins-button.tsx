'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Key, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function ResendPinsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleResendPins = async () => {
    if (!confirm('This will send community PIN codes to ALL active members. Continue?')) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/resend-pin', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        const successCount = data.results?.filter((r: { success: boolean }) => r.success).length || 0;
        setResult({
          success: true,
          message: `Successfully sent PIN codes to ${successCount} member(s)`,
          count: successCount,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send PIN codes',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-600" />
          Community PIN Codes
        </CardTitle>
        <CardDescription>
          Send PIN codes to all active members who may not have received them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button below to send community access PIN codes to all active members. 
          This is useful if parents report they haven&apos;t received their PIN code.
        </p>
        
        <Button 
          onClick={handleResendPins} 
          disabled={isLoading}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending PIN Codes...
            </>
          ) : (
            <>
              <Key className="h-4 w-4 mr-2" />
              Send PIN Codes to All Active Members
            </>
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
