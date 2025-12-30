import { redirect, notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { FileCheck, User, Baby, Phone, Shield, Calendar, Globe, Monitor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

interface PageProps {
  params: { id: string };
}

export default async function AdminWaiverDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  const { data: waiver, error } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !waiver) {
    notFound();
  }

  const signedDate = new Date(waiver.signed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Waivers', href: '/dashboard/admin/waivers' },
          { label: waiver.guardian_full_name },
        ]}
      />

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <FileCheck className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Waiver Details
            </h1>
            <p className="text-muted-foreground">
              Viewing waiver for {waiver.child_full_name}
            </p>
          </div>
        </div>
        <Badge
          variant="default"
          className={waiver.photo_media_consent ? 'bg-green-500' : 'bg-gray-500'}
        >
          {waiver.photo_media_consent ? 'Media Consent Granted' : 'No Media Consent'}
        </Badge>
      </div>

      {/* Status Card */}
      <Card className="border-brand/20 bg-brand/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <FileCheck className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Waiver Signed</h3>
              <p className="text-sm text-muted-foreground">Signed on {signedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiver Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Guardian Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-brand" />
              Parent/Guardian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{waiver.guardian_full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{waiver.guardian_email}</p>
            </div>
            {waiver.guardian_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{waiver.guardian_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Child Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="h-5 w-5 text-orange-500" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{waiver.child_full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{formatDate(waiver.child_date_of_birth)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {waiver.emergency_contact_name || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">
                {waiver.emergency_contact_phone || 'Not provided'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand" />
              Digital Signature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-center">
              <p className="font-display text-xl italic text-foreground">
                {waiver.digital_signature}
              </p>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Photo/Media Consent:{' '}
              <span className={waiver.photo_media_consent ? 'text-green-600' : ''}>
                {waiver.photo_media_consent ? 'Granted' : 'Not granted'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Waiver ID</p>
              <p className="font-mono text-xs">{waiver.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clerk User ID</p>
              <p className="font-mono text-xs">{waiver.clerk_user_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> IP Address
              </p>
              <p className="font-mono text-xs">{waiver.ip_address || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Created At
              </p>
              <p className="text-xs">
                {new Date(waiver.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          {waiver.user_agent && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">User Agent</p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {waiver.user_agent}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
