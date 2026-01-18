'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  MapPin, 
  XCircle, 
  CheckCircle,
  Loader2,
  ChevronDown,
  Pause,
  Play,
  Trash2,
  Edit,
  Save,
  X,
  CreditCard,
  Mail,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Location {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  studentCount?: number;
}

interface Enrollment {
  id: string;
  status: string;
  location_id: string;
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_email: string;
  guardian_phone: string | null;
  child_first_name: string;
  child_last_name: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

interface AdminActionsProps {
  enrollment: Enrollment;
  locations: Location[];
  currentLocationName: string;
  hasPaymentRecord?: boolean;
}

export function AdminActions({ enrollment, locations, currentLocationName, hasPaymentRecord = false }: AdminActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Status change
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Location change
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [newLocationId, setNewLocationId] = useState(enrollment.location_id);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Payment link
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentPlanType, setPaymentPlanType] = useState<'monthly' | '3month'>('monthly');
  const [generatedPaymentUrl, setGeneratedPaymentUrl] = useState<string | null>(null);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);
  const [editData, setEditData] = useState({
    guardian_first_name: enrollment.guardian_first_name,
    guardian_last_name: enrollment.guardian_last_name,
    guardian_email: enrollment.guardian_email,
    guardian_phone: enrollment.guardian_phone || '',
    child_first_name: enrollment.child_first_name,
    child_last_name: enrollment.child_last_name,
    emergency_contact_name: enrollment.emergency_contact_name || '',
    emergency_contact_phone: enrollment.emergency_contact_phone || '',
  });

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setSuccess('Status updated successfully');
      setShowStatusDialog(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = async () => {
    if (newLocationId === enrollment.location_id) {
      setShowLocationDialog(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: newLocationId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update location');
      }

      setSuccess('Location updated successfully');
      setShowLocationDialog(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaymentLink = async (sendEmail: boolean) => {
    setPaymentLinkLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: paymentPlanType, sendEmail }),
      });

      const data = await response.json();
      console.log('Payment link API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate payment link');
      }

      setGeneratedPaymentUrl(data.checkoutUrl);
      if (sendEmail) {
        if (data.emailSent === true && data.emailDetails) {
          const sentTime = new Date(data.emailDetails.sentAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          setSuccess(`Email sent successfully to ${data.emailDetails.recipient} at ${sentTime} for ${data.emailDetails.childName}'s ${data.emailDetails.planType} plan`);
        } else if (data.emailError) {
          setError(`Failed to send email: ${data.emailError}`);
        } else {
          setError('Email was not sent. The email service may not be configured. Copy the link and send manually.');
        }
      } else {
        setSuccess('Payment link generated - copy and share manually');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payment link');
    } finally {
      setPaymentLinkLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Link copied to clipboard');
    } catch {
      setError('Failed to copy link');
    }
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update enrollment');
      }

      setSuccess('Enrollment updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update enrollment');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Loader2, color: 'text-amber-600' },
    { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-blue-600' },
    { value: 'active', label: 'Active', icon: Play, color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  ].filter(s => s.value !== enrollment.status);

  return (
    <>
      {/* Admin Actions - Elegant Glass Panel */}
      <div className="rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm shadow-slate-100/50 divide-y divide-slate-100/80 overflow-hidden">
        {/* Success/Error Messages */}
        {success && (
          <div className="px-4 py-3.5 bg-gradient-to-r from-sky-50 via-blue-50/80 to-indigo-50/60 border-l-3 border-sky-400 text-sky-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-500 ease-out">
            {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3.5 bg-gradient-to-r from-rose-50 via-pink-50/80 to-fuchsia-50/60 border-l-3 border-rose-400 text-rose-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-500 ease-out">
            {error}
          </div>
        )}

        <button
          onClick={() => setShowStatusDialog(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition-all duration-200 ease-out group"
        >
          <span className="text-[13px] font-medium text-slate-700">Status</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 capitalize">{enrollment.status}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-300 -rotate-90 group-hover:text-slate-500 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => setShowLocationDialog(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition-all duration-200 ease-out group"
        >
          <span className="text-[13px] font-medium text-slate-700">Location</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 truncate max-w-[160px]">{currentLocationName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-300 -rotate-90 group-hover:text-slate-500 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition-all duration-200 ease-out group"
        >
          <span className="text-[13px] font-medium text-slate-700">Edit Details</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-300 -rotate-90 group-hover:text-slate-500 transition-colors" />
        </button>

        {/* Payment Link - Only show for pending/approved enrollments */}
        {['pending', 'approved'].includes(enrollment.status) && (
          <>
            <button
              onClick={() => {
                setShowPaymentDialog(true);
                setGeneratedPaymentUrl(null);
                setSuccess(null);
                setError(null);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-emerald-50/60 transition-all duration-200 ease-out group"
            >
              <span className="text-[13px] font-medium text-emerald-600">Send Payment Link</span>
              <CreditCard className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            </button>
            <button
              onClick={async () => {
                if (confirm('Mark this enrollment as paid and activate it?')) {
                  setIsLoading(true);
                  setError(null);
                  try {
                    const response = await fetch(`/api/admin/enrollments/${enrollment.id}/status`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'active' }),
                    });
                    if (!response.ok) {
                      const data = await response.json();
                      throw new Error(data.error || 'Failed to activate enrollment');
                    }
                    setSuccess('Enrollment marked as paid and activated');
                    router.refresh();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to activate');
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-green-50/60 transition-all duration-200 ease-out group"
            >
              <span className="text-[13px] font-medium text-green-600">Mark as Paid</span>
              <CheckCircle className="h-3.5 w-3.5 text-green-400 group-hover:text-green-600 transition-colors" />
            </button>
          </>
        )}

        {/* Link Payment - For active enrollments without payment record */}
        {enrollment.status === 'active' && !hasPaymentRecord && (
          <button
            onClick={async () => {
              if (confirm('Create payment record for this enrollment?')) {
                setIsLoading(true);
                setError(null);
                try {
                  const response = await fetch(`/api/admin/enrollments/${enrollment.id}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'active' }),
                  });
                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to link payment');
                  }
                  setSuccess('Payment record created successfully');
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to link payment');
                } finally {
                  setIsLoading(false);
                }
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-amber-50/60 transition-all duration-200 ease-out group"
          >
            <span className="text-[13px] font-medium text-amber-600">Link Payment Record</span>
            <CreditCard className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-600 transition-colors" />
          </button>
        )}

        {enrollment.status !== 'cancelled' && (
          <button
            onClick={() => {
              setNewStatus('cancelled');
              setShowStatusDialog(true);
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-50/60 transition-all duration-200 ease-out group"
          >
            <span className="text-[13px] font-medium text-red-600">Cancel Enrollment</span>
            <ChevronDown className="h-3.5 w-3.5 text-red-300 -rotate-90 group-hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Enrollment Status</DialogTitle>
            <DialogDescription>
              Select a new status for this enrollment. This action can be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setNewStatus(option.value)}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                    newStatus === option.value 
                      ? 'border-slate-900 bg-slate-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${option.color}`} />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isLoading || !newStatus}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Change Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Location</DialogTitle>
            <DialogDescription>
              Move this enrollment to a different location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            {locations.map((location) => {
              const addressLine = [location.address, location.city, location.state].filter(Boolean).join(', ');
              return (
                <button
                  key={location.id}
                  onClick={() => setNewLocationId(location.id)}
                  className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                    newLocationId === location.id 
                      ? 'border-[#2EC4B6] bg-[#2EC4B6]/5' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className={`h-5 w-5 mt-0.5 flex-shrink-0 ${newLocationId === location.id ? 'text-[#2EC4B6]' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{location.name}</span>
                      {location.id === enrollment.location_id && (
                        <span className="text-xs text-slate-500">(current)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {addressLine && (
                        <p className="text-xs text-slate-500 truncate">{addressLine}</p>
                      )}
                      {addressLine && typeof location.studentCount === 'number' && (
                        <span className="text-xs text-slate-300">·</span>
                      )}
                      {typeof location.studentCount === 'number' && (
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {location.studentCount} {location.studentCount === 1 ? 'student' : 'students'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleLocationChange} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Link Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Send Payment Link
            </DialogTitle>
            <DialogDescription>
              Generate a Stripe checkout link for {enrollment.guardian_first_name} to complete payment for {enrollment.child_first_name}&apos;s enrollment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Select Plan</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentPlanType('monthly')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    paymentPlanType === 'monthly' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium block">Monthly</span>
                  <span className="text-xs text-slate-500">$50/month recurring</span>
                </button>
                <button
                  onClick={() => setPaymentPlanType('3month')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    paymentPlanType === '3month' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium block">3-Month</span>
                  <span className="text-xs text-slate-500">$150 one-time</span>
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {generatedPaymentUrl && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">Payment Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedPaymentUrl}
                    className="flex-1 text-xs bg-white border rounded px-2 py-1.5 text-slate-600"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedPaymentUrl)}
                    className="shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(generatedPaymentUrl, '_blank')}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={paymentLinkLoading}>
              Close
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGeneratePaymentLink(false)} 
              disabled={paymentLinkLoading}
            >
              {paymentLinkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Generate Link
            </Button>
            <Button 
              onClick={() => handleGeneratePaymentLink(true)} 
              disabled={paymentLinkLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {paymentLinkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Email to Parent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>
              Update the enrollment information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-700">Child Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="child_first_name">First Name</Label>
                  <Input
                    id="child_first_name"
                    value={editData.child_first_name}
                    onChange={(e) => setEditData({ ...editData, child_first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="child_last_name">Last Name</Label>
                  <Input
                    id="child_last_name"
                    value={editData.child_last_name}
                    onChange={(e) => setEditData({ ...editData, child_last_name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-slate-700">Parent/Guardian</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="guardian_first_name">First Name</Label>
                  <Input
                    id="guardian_first_name"
                    value={editData.guardian_first_name}
                    onChange={(e) => setEditData({ ...editData, guardian_first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="guardian_last_name">Last Name</Label>
                  <Input
                    id="guardian_last_name"
                    value={editData.guardian_last_name}
                    onChange={(e) => setEditData({ ...editData, guardian_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guardian_email">Email</Label>
                <Input
                  id="guardian_email"
                  type="email"
                  value={editData.guardian_email}
                  onChange={(e) => setEditData({ ...editData, guardian_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="guardian_phone">Phone</Label>
                <Input
                  id="guardian_phone"
                  value={editData.guardian_phone}
                  onChange={(e) => setEditData({ ...editData, guardian_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-slate-700">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="emergency_contact_name">Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={editData.emergency_contact_name}
                    onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={editData.emergency_contact_phone}
                    onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
