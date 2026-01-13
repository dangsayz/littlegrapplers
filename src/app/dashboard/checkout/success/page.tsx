import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight, Users, MessageSquare, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CheckoutSuccessPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
          <Check className="h-10 w-10 text-brand" />
        </div>

        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome to the Family!
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Your enrollment is complete. We&apos;re excited to have you join Little Grapplers!
        </p>

        <div className="mt-8 p-6 rounded-2xl bg-brand/5 border border-brand/20">
          <h2 className="font-semibold text-foreground mb-4">What&apos;s Next?</h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 mt-0.5">
                <Check className="h-3.5 w-3.5 text-brand" />
              </div>
              <span className="text-muted-foreground">
                You&apos;ll receive a confirmation email shortly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 mt-0.5">
                <Check className="h-3.5 w-3.5 text-brand" />
              </div>
              <span className="text-muted-foreground">
                Your child can attend their next scheduled class
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 mt-0.5">
                <Check className="h-3.5 w-3.5 text-brand" />
              </div>
              <span className="text-muted-foreground">
                Access the parent community to connect with other families
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8 grid gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="grid grid-cols-3 gap-3 mt-2">
            <Link
              href="/dashboard/students"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand/50 hover:bg-brand/5 transition-all"
            >
              <Users className="h-5 w-5 text-brand" />
              <span className="text-xs text-muted-foreground">My Students</span>
            </Link>
            <Link
              href="/dashboard/discussions"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand/50 hover:bg-brand/5 transition-all"
            >
              <MessageSquare className="h-5 w-5 text-brand" />
              <span className="text-xs text-muted-foreground">Community</span>
            </Link>
            <Link
              href="/dashboard/memberships"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand/50 hover:bg-brand/5 transition-all"
            >
              <BookOpen className="h-5 w-5 text-brand" />
              <span className="text-xs text-muted-foreground">Membership</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
