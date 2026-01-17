'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight, Loader2, Calendar, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EnrollmentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const enrollmentId = searchParams.get('enrollment_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [sessionId, enrollmentId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-brand animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Confirming your enrollment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
            <Check className="h-10 w-10 text-brand" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-foreground">
            Enrollment Complete!
          </h1>
          
          <p className="mt-4 text-lg text-muted-foreground">
            Welcome to the Little Grapplers family. Your child is all set to start their jiu-jitsu journey.
          </p>

          <div className="mt-8 p-6 rounded-2xl border border-brand/20 bg-brand/5">
            <h3 className="font-semibold text-foreground mb-3">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                <span>You&apos;ll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                <span>Our team will reach out with class schedule details</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                <span>Bring comfortable athletic wear to your first class</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-3">
            <Button size="lg" className="w-full" asChild>
              <Link href="/sign-up">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Your Account
              </Link>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Create an account to track progress and access the parent community
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-brand hover:underline text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />
              View Class Schedules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
