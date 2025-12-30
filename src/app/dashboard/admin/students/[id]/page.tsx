import { redirect, notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Pencil,
  FileText,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminStudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch student (waiver) data
  const { data: student, error } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !student) {
    notFound();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin/students"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {student.child_full_name}
            </h1>
            <p className="text-muted-foreground">
              {calculateAge(student.child_date_of_birth)} years old
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/admin/students/${params.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Student
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Child Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{student.child_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(student.child_date_of_birth)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <Badge variant="secondary">{calculateAge(student.child_date_of_birth)} years</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{student.child_gender || '-'}</p>
              </div>
            </div>
            
            {student.medical_conditions && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Medical Conditions</p>
                  <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    {student.medical_conditions}
                  </p>
                </div>
              </>
            )}

            {student.allergies && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                <p className="text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {student.allergies}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parent/Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{student.parent_first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{student.parent_last_name}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${student.parent_email}`} className="font-medium text-brand hover:underline">
                    {student.parent_email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${student.parent_phone}`} className="font-medium">
                    {student.parent_phone || '-'}
                  </a>
                </div>
              </div>

              {student.parent_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{student.parent_address}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact Name</p>
                <p className="font-medium">{student.emergency_contact_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium">{student.emergency_contact_relationship || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{student.emergency_contact_phone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Enrollment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Waiver Signed</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">Signed</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signed Date</p>
                <p className="font-medium">{formatDate(student.signed_at)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Record Created</p>
                <p className="text-sm">{formatDate(student.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href={`mailto:${student.parent_email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email Parent
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`tel:${student.parent_phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call Parent
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/admin/students/${params.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </Link>
            </Button>
            <Button variant="destructive" asChild>
              <Link href={`/dashboard/admin/students/${params.id}/delete`}>
                Delete Student
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
