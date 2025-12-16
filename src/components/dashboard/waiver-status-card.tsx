'use client';

import Link from 'next/link';
import { FileCheck, FileWarning, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WaiverStatusCardProps {
  hasSigned: boolean;
  signedAt?: string | null;
  childName?: string | null;
}

export function WaiverStatusCard({ hasSigned, signedAt, childName }: WaiverStatusCardProps) {
  if (hasSigned) {
    return (
      <Card className="border-brand/20 bg-brand/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-brand" />
            Waiver Signed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You signed the enrollment waiver
            {childName && <> for <span className="font-medium text-foreground">{childName}</span></>}
            {signedAt && (
              <> on {new Date(signedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</>
            )}.
          </p>
          <Button variant="ghost" size="sm" className="mt-3 -ml-2" asChild>
            <Link href="/dashboard/waiver">
              View waiver details
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coral/20 bg-coral/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-coral" />
          Waiver Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Please sign the enrollment waiver before your child can attend classes.
        </p>
        <Button size="sm" className="mt-4 bg-brand text-white hover:bg-brand/90" asChild>
          <Link href="/dashboard/waiver">
            Sign Waiver Now
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
