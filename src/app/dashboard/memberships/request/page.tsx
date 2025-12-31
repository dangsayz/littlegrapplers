'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  XCircle, 
  PauseCircle, 
  PlayCircle, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const REQUEST_TYPES = {
  cancel: {
    title: 'Cancel Membership',
    description: 'Submit a request to cancel your membership. Our team will process this within 1-2 business days.',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
  },
  pause: {
    title: 'Pause Membership',
    description: 'Temporarily pause your membership for up to 90 days. Perfect for vacations or temporary breaks.',
    icon: PauseCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  resume: {
    title: 'Resume Membership',
    description: 'Ready to come back? Submit a request to resume your paused membership.',
    icon: PlayCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

const CANCELLATION_REASONS = [
  { value: 'moving', label: 'Moving to a different area' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'schedule', label: 'Schedule conflicts' },
  { value: 'lost_interest', label: 'Child lost interest' },
  { value: 'other_activity', label: 'Trying a different activity' },
  { value: 'medical', label: 'Medical reasons' },
  { value: 'seasonal', label: 'Seasonal break (will return)' },
  { value: 'other', label: 'Other' },
];

const PAUSE_REASONS = [
  { value: 'vacation', label: 'Family vacation' },
  { value: 'travel', label: 'Extended travel' },
  { value: 'medical', label: 'Medical reasons' },
  { value: 'school', label: 'School commitments' },
  { value: 'summer_break', label: 'Summer break' },
  { value: 'other', label: 'Other' },
];

export default function MembershipRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as 'cancel' | 'pause' | 'resume' | null;
  
  const [requestType, setRequestType] = useState<'cancel' | 'pause' | 'resume'>(typeParam || 'cancel');
  const [reason, setReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [pauseStartDate, setPauseStartDate] = useState('');
  const [pauseEndDate, setPauseEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingRequests, setExistingRequests] = useState<Array<{ id: string; request_type: string; status: string }>>([]);

  // Fetch existing requests to show status
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/membership/requests');
        if (response.ok) {
          const data = await response.json();
          setExistingRequests(data.requests || []);
        }
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      }
    };
    fetchRequests();
  }, []);

  const pendingRequest = existingRequests.find(
    r => r.request_type === requestType && r.status === 'pending'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/membership/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          reason,
          additionalComments,
          pauseStartDate: requestType === 'pause' ? pauseStartDate : undefined,
          pauseEndDate: requestType === 'pause' ? pauseEndDate : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = REQUEST_TYPES[requestType];
  const Icon = config.icon;
  const reasons = requestType === 'cancel' ? CANCELLATION_REASONS : PAUSE_REASONS;

  // Calculate min dates
  const today = new Date().toISOString().split('T')[0];
  const maxPauseEnd = pauseStartDate 
    ? new Date(new Date(pauseStartDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : undefined;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">Request Submitted</h2>
              <p className="text-green-700">
                Your {requestType === 'cancel' ? 'cancellation' : requestType === 'pause' ? 'pause' : 'resume'} request 
                has been submitted successfully. Our team will review it within 1-2 business days.
              </p>
              <p className="text-sm text-green-600">
                You will receive an email notification once your request has been processed.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/dashboard/memberships">Back to Memberships</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/memberships" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Memberships
        </Link>
      </Button>

      {/* Request Type Selection */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(Object.keys(REQUEST_TYPES) as Array<keyof typeof REQUEST_TYPES>).map((type) => {
          const cfg = REQUEST_TYPES[type];
          const TypeIcon = cfg.icon;
          return (
            <button
              key={type}
              onClick={() => setRequestType(type)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                requestType === type 
                  ? `${cfg.borderColor} ${cfg.bgColor}` 
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <TypeIcon className={`h-6 w-6 mb-2 ${requestType === type ? cfg.color : 'text-muted-foreground'}`} />
              <p className={`font-medium ${requestType === type ? cfg.color : 'text-foreground'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Pending Request Warning */}
      {pendingRequest && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  You already have a pending {requestType} request
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please wait for it to be processed or withdraw it before submitting a new one.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      <Card className={config.borderColor}>
        <CardHeader className={config.bgColor}>
          <CardTitle className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="h-5 w-5" />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Pause Dates */}
            {requestType === 'pause' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pauseStartDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Pause Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pauseStartDate"
                    type="date"
                    value={pauseStartDate}
                    onChange={(e) => setPauseStartDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pauseEndDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Pause End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pauseEndDate"
                    type="date"
                    value={pauseEndDate}
                    onChange={(e) => setPauseEndDate(e.target.value)}
                    min={pauseStartDate || today}
                    max={maxPauseEnd}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Maximum 90 days</p>
                </div>
              </div>
            )}

            {/* Reason Selection */}
            {requestType !== 'resume' && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for {requestType === 'cancel' ? 'cancellation' : 'pause'} <span className="text-destructive">*</span>
                </Label>
                <Select value={reason} onValueChange={setReason} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="additionalComments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Additional Comments {requestType === 'resume' && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="additionalComments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder={
                  requestType === 'cancel' 
                    ? "Is there anything we could have done better? We'd love your feedback..."
                    : requestType === 'pause'
                    ? "Any additional details about your pause request..."
                    : "Let us know you're ready to come back..."
                }
                rows={4}
                required={requestType === 'resume'}
              />
            </div>

            {/* What happens next */}
            <div className="p-4 rounded-lg bg-muted text-sm">
              <p className="font-medium mb-2">What happens next:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {requestType === 'cancel' && (
                  <>
                    <li>Your request will be reviewed within 1-2 business days</li>
                    <li>You will continue to have access until the end of your billing period</li>
                    <li>A confirmation email will be sent once processed</li>
                    <li>You can withdraw this request anytime before it&apos;s processed</li>
                  </>
                )}
                {requestType === 'pause' && (
                  <>
                    <li>Your request will be reviewed within 1-2 business days</li>
                    <li>Billing will be paused during the specified period</li>
                    <li>Your spot in the program will be held for you</li>
                    <li>You&apos;ll receive a reminder before your pause ends</li>
                  </>
                )}
                {requestType === 'resume' && (
                  <>
                    <li>Your request will be reviewed within 1-2 business days</li>
                    <li>Billing will resume from your next scheduled date</li>
                    <li>You&apos;ll regain full access to classes</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !!pendingRequest || (requestType !== 'resume' && !reason)}
                className={requestType === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/memberships">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
