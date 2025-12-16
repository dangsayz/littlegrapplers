import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Video, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function CheckoutSuccessPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const userName = user.firstName || 'there';

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand/10">
          <CheckCircle className="h-12 w-12 text-brand" />
        </div>

        {/* Message */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome to Little Grapplers!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Hey {userName}, your enrollment is complete. Your child is now ready to start their BJJ journey!
          </p>
        </div>

        {/* What's Next */}
        <Card>
          <CardContent className="py-6">
            <h2 className="font-semibold text-foreground mb-4">What's Next?</h2>
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 mt-0.5">
                  <Video className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Access Video Library</p>
                  <p className="text-sm text-muted-foreground">
                    Over 20 hours of training content available now
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10 mt-0.5">
                  <Users className="h-4 w-4 text-orange" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Join Your Community</p>
                  <p className="text-sm text-muted-foreground">
                    Connect with other parents at your location
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow/10 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-yellow" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Class Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    Classes happen at your daycare - check with them for times
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-brand hover:bg-brand/90" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Confirmation */}
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}
