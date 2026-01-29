import { redirect, notFound } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Calendar,
  Mail,
  Phone,
  Baby,
  User,
  FileText,
  AlertCircle,
  Shield,
  Sparkles,
  CreditCard,
  UserPlus,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EnrollmentActions } from '../enrollment-actions';
import { AdminActions } from './admin-actions';

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending Review', 
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
  },
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: XCircle,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const { id } = await params;

  // Fetch enrollment with location
  const { data: enrollment, error } = await supabaseAdmin
    .from('enrollments')
    .select(`
      *,
      locations(id, name, slug, address, city, state)
    `)
    .eq('id', id)
    .single();

  if (error || !enrollment) {
    notFound();
  }

  // Fetch all locations for admin actions
  const { data: allLocations } = await supabaseAdmin
    .from('locations')
    .select('id, name, address, city, state')
    .eq('is_active', true)
    .order('name');

  // Fetch student counts per location (approved/active enrollments)
  const { data: enrollmentCounts } = await supabaseAdmin
    .from('enrollments')
    .select('location_id')
    .in('status', ['approved', 'active']);

  const studentCountByLocation = (enrollmentCounts || []).reduce((acc, e) => {
    acc[e.location_id] = (acc[e.location_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationsWithCounts = (allLocations || []).map(loc => ({
    ...loc,
    studentCount: studentCountByLocation[loc.id] || 0,
  }));

  // Check if enrollment has a payment record
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status')
    .eq('enrollment_id', id)
    .single();
  
  const hasPaymentRecord = !!subscription;

  // Fetch activity logs for this enrollment
  const { data: activityLogs } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .eq('entity_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch reviewer info if reviewed
  let reviewerName = null;
  if (enrollment.reviewed_by) {
    const { data: reviewer } = await supabaseAdmin
      .from('admin_users')
      .select('first_name, last_name, email')
      .eq('id', enrollment.reviewed_by)
      .single();
    
    if (reviewer) {
      reviewerName = reviewer.first_name && reviewer.last_name 
        ? `${reviewer.first_name} ${reviewer.last_name}`
        : reviewer.email;
    }
  }

  const status = STATUS_CONFIG[enrollment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('created') || action.includes('submitted')) return UserPlus;
    if (action.includes('approved') || action.includes('active')) return CheckCircle;
    if (action.includes('payment') || action.includes('subscription')) return CreditCard;
    if (action.includes('email') || action.includes('sent')) return Send;
    if (action.includes('transfer') || action.includes('location')) return RefreshCw;
    return Sparkles;
  };

  const getActivityMessage = (action: string, details: Record<string, unknown> | null) => {
    const studentName = details?.student_name || `${enrollment.child_first_name} ${enrollment.child_last_name}`;
    
    if (action === 'enrollment.admin_created_new') {
      return { title: `Welcome, ${studentName}`, subtitle: 'Joined Little Grapplers' };
    }
    if (action === 'enrollment.submitted') {
      return { title: `Welcome, ${studentName}`, subtitle: 'Enrollment submitted' };
    }
    if (action === 'enrollment.approved') {
      return { title: 'Enrollment Approved', subtitle: `${studentName} is ready to train` };
    }
    if (action === 'enrollment.activated') {
      return { title: 'Now Active', subtitle: `${studentName} is officially enrolled` };
    }
    if (action.includes('payment_link')) {
      return { title: 'Payment Link Sent', subtitle: `Sent to ${details?.guardian_email || 'parent'}` };
    }
    if (action.includes('location_transfer')) {
      return { title: 'Location Updated', subtitle: `Transferred to ${details?.new_location || 'new location'}` };
    }
    return { title: action.replace(/[._]/g, ' ').replace(/^\w/, c => c.toUpperCase()), subtitle: '' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* Elegant background texture */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-sky-50/30" />
        {/* Fine grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }} 
        />
        {/* Soft ambient orbs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-sky-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 via-violet-50/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        {/* Subtle cross pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234B5563' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Enrollments', href: '/dashboard/admin/enrollments' },
          { label: `${enrollment.child_first_name} ${enrollment.child_last_name}` },
        ]}
      />

      {/* Back Link */}
      <Link 
        href="/dashboard/admin/enrollments"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Enrollments
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {enrollment.child_first_name} {enrollment.child_last_name}
            </h1>
            <Badge className={`${status.color} border`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-slate-500">
            Submitted {formatDateTime(enrollment.submitted_at)}
          </p>
        </div>

        {enrollment.status === 'pending' && (
          <EnrollmentActions 
            enrollmentId={enrollment.id} 
            currentStatus={enrollment.status}
            childName={`${enrollment.child_first_name} ${enrollment.child_last_name}`}
          />
        )}
      </div>

      {/* Admin Actions Panel */}
      <AdminActions 
        enrollment={{
          id: enrollment.id,
          status: enrollment.status,
          location_id: enrollment.location_id,
          guardian_first_name: enrollment.guardian_first_name,
          guardian_last_name: enrollment.guardian_last_name,
          guardian_email: enrollment.guardian_email,
          guardian_phone: enrollment.guardian_phone,
          child_first_name: enrollment.child_first_name,
          child_last_name: enrollment.child_last_name,
          child_date_of_birth: enrollment.child_date_of_birth,
          emergency_contact_name: enrollment.emergency_contact_name,
          emergency_contact_phone: enrollment.emergency_contact_phone,
        }}
        locations={locationsWithCounts}
        currentLocationName={enrollment.locations?.name || 'Not assigned'}
        hasPaymentRecord={hasPaymentRecord}
      />

      {/* Apple-Inspired Activity Feed */}
      <Card className="border border-white/60 shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden">
        <div className="relative">
          {/* Subtle top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2EC4B6]/30 to-transparent" />
          
          <CardContent className="pt-6 pb-4">
            {/* Welcome Header - Always show for new enrollments */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Welcome, <span className="text-[#2EC4B6]">{enrollment.child_first_name}</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {enrollment.locations?.name || 'Little Grapplers'} Community
              </p>
            </div>

            {/* Activity Timeline */}
            {activityLogs && activityLogs.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Recent Activity</p>
                <div className="space-y-3">
                  {activityLogs.map((log) => {
                    const ActivityIcon = getActivityIcon(log.action);
                    const message = getActivityMessage(log.action, log.details as Record<string, unknown> | null);
                    
                    return (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#2EC4B6]/10 to-[#2EC4B6]/5 flex items-center justify-center group-hover:from-[#2EC4B6]/20 group-hover:to-[#2EC4B6]/10 transition-colors">
                          <ActivityIcon className="h-4 w-4 text-[#2EC4B6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm">{message.title}</p>
                          {message.subtitle && (
                            <p className="text-slate-500 text-xs mt-0.5">{message.subtitle}</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback if no activity logs yet */}
            {(!activityLogs || activityLogs.length === 0) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#2EC4B6]/5 to-transparent">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#2EC4B6]/20 to-[#2EC4B6]/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-[#2EC4B6]" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Joined Little Grapplers</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {formatRelativeTime(enrollment.submitted_at || enrollment.created_at)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Rejection Reason */}
      {enrollment.status === 'rejected' && enrollment.rejection_reason && (
        <Card className="border-rose-200/60 bg-gradient-to-r from-rose-50/80 to-pink-50/60 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-800">Rejection Reason</p>
                <p className="text-rose-700 mt-1">{enrollment.rejection_reason}</p>
                {reviewerName && (
                  <p className="text-sm text-rose-600 mt-2">
                    Reviewed by {reviewerName} on {formatDateTime(enrollment.reviewed_at)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Info */}
      {(enrollment.status === 'approved' || enrollment.status === 'active') && enrollment.reviewed_at && (
        <Card className="border-sky-200/60 bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-indigo-50/50 backdrop-blur-sm shadow-sm shadow-sky-100/50 animate-in fade-in slide-in-from-top-1 duration-500 ease-out">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sky-800">Enrollment Approved</p>
                {reviewerName && (
                  <p className="text-sm text-sky-600 mt-1">
                    Approved by {reviewerName} on {formatDateTime(enrollment.reviewed_at)}
                  </p>
                )}
                {enrollment.student_id && (
                  <Link 
                    href={`/dashboard/admin/students/${enrollment.student_id}`}
                    className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-800 hover:underline mt-2 transition-colors"
                  >
                    View Student Record →
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Child Information */}
        <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Baby className="h-5 w-5 text-[#2EC4B6]" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900">
                {enrollment.child_first_name} {enrollment.child_last_name}
              </p>
            </div>
            {enrollment.child_date_of_birth && (
              <div>
                <p className="text-sm text-slate-500">Date of Birth</p>
                <p className="font-medium text-slate-900">
                  {formatDate(enrollment.child_date_of_birth)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#F7931E]" />
              Parent/Guardian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900">
                {enrollment.guardian_first_name} {enrollment.guardian_last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${enrollment.guardian_email}`} className="text-[#2EC4B6] hover:underline">
                  {enrollment.guardian_email}
                </a>
              </p>
            </div>
            {enrollment.guardian_phone && (
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {enrollment.guardian_phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(enrollment.emergency_contact_name || enrollment.emergency_contact_phone) && (
          <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-[#FF5A5F]" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollment.emergency_contact_name && (
                <div>
                  <p className="text-sm text-slate-500">Contact Name</p>
                  <p className="font-medium text-slate-900">{enrollment.emergency_contact_name}</p>
                </div>
              )}
              {enrollment.emergency_contact_phone && (
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {enrollment.emergency_contact_phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location */}
        <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-[#FFC857]" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Selected Location</p>
              <p className="font-medium text-slate-900">
                {enrollment.locations?.name || 'Not specified'}
              </p>
            </div>
            {enrollment.locations?.address && (
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium text-slate-900">
                  {enrollment.locations.address}
                  {enrollment.locations.city && `, ${enrollment.locations.city}`}
                  {enrollment.locations.state && `, ${enrollment.locations.state}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Details */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-slate-600" />
            Enrollment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500">Plan Type</p>
              <p className="font-medium text-slate-900 capitalize">
                {enrollment.plan_type?.replace(/-/g, ' ') || 'Month-to-month'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Photo Consent</p>
              <p className={`font-medium ${enrollment.photo_media_consent ? 'text-green-600' : 'text-slate-500'}`}>
                {enrollment.photo_media_consent ? 'Granted' : 'Not granted'}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-slate-500">Digital Signature</p>
              <p className="font-medium text-slate-900 italic break-words">
                {enrollment.digital_signature || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Waiver Signed</p>
              <p className="font-medium text-slate-900">
                {formatDateTime(enrollment.waiver_agreed_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Info - Simplified for admin */}
      <Card className="border border-slate-100 bg-slate-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Record #{enrollment.id.slice(0, 8)}</span>
              {enrollment.student_id && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Student linked
                </span>
              )}
              {enrollment.clerk_user_id && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Account linked
                </span>
              )}
            </div>
            {enrollment.waiver_ip_address && (
              <span>Signed from {enrollment.waiver_ip_address}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
