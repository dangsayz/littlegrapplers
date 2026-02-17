'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface EnrollmentSyncResult {
  synced: number;
  fixed: number;
  errors: string[];
}

export function EnrollmentSyncTool() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<EnrollmentSyncResult | null>(null);

  const syncEnrollments = async () => {
    setIsSyncing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/enrollments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      setResult(data);
      
      if (data.errors.length === 0) {
        console.log(`Synced ${data.synced} enrollments, fixed ${data.fixed} issues`);
      } else {
        console.warn(`Synced ${data.synced} enrollments, ${data.errors.length} errors`);
      }
    } catch (error) {
      console.error('Failed to sync enrollments');
      setResult({
        synced: 0,
        fixed: 0,
        errors: ['Failed to connect to server'],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Enrollment Sync Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Use this tool when parents report enrollment issues. It will:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Check for status mismatches between database and admin panel</li>
            <li>Sync enrollment visibility issues</li>
            <li>Fix orphaned payment records</li>
            <li>Validate enrollment data integrity</li>
          </ul>
        </div>

        <Button 
          onClick={syncEnrollments} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All Enrollments
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                Sync Complete: {result.synced} enrollments checked
              </span>
            </div>

            {result.fixed > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  Fixed {result.fixed} enrollment issues
                </p>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-medium mb-2">
                  Errors encountered:
                </p>
                <ul className="list-disc list-inside text-yellow-600 text-sm space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
