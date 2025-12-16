import { FileCheck, User, Baby, Phone, Calendar, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface WaiverData {
  id: string;
  guardian_full_name: string;
  guardian_email: string;
  guardian_phone: string | null;
  child_full_name: string;
  child_date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  digital_signature: string;
  photo_media_consent: boolean;
  signed_at: string;
}

interface WaiverSignedViewProps {
  waiver: WaiverData;
}

export function WaiverSignedView({ waiver }: WaiverSignedViewProps) {
  const signedDate = new Date(waiver.signed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Enrollment Waiver
        </h1>
        <p className="text-muted-foreground mt-1">
          Your signed waiver details
        </p>
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
              <p className="text-sm text-muted-foreground">
                Signed on {signedDate}
              </p>
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
              <Baby className="h-5 w-5 text-orange" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{waiver.child_full_name}</p>
            </div>
            {waiver.child_date_of_birth && (
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {new Date(waiver.child_date_of_birth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(waiver.emergency_contact_name || waiver.emergency_contact_phone) && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-coral" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {waiver.emergency_contact_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{waiver.emergency_contact_name}</p>
                </div>
              )}
              {waiver.emergency_contact_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{waiver.emergency_contact_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Photo/Media Consent: {waiver.photo_media_consent ? 'Granted' : 'Not granted'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
