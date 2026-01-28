'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle, User, Baby, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Location {
  id: string;
  name: string;
}

interface CreateNewStudentDialogProps {
  locations: Location[];
}

// Phone: digits only, max 15 chars (international)
const formatPhoneInput = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 15);
};

// Email: max 100 chars
const MAX_EMAIL_LENGTH = 100;

export function CreateNewStudentDialog({ locations }: CreateNewStudentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [guardianFirstName, setGuardianFirstName] = useState('');
  const [guardianLastName, setGuardianLastName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childDateOfBirth, setChildDateOfBirth] = useState('');
  const [locationId, setLocationId] = useState('');

  const handleCreate = async () => {
    if (!guardianFirstName || !guardianLastName || !guardianEmail || !childFirstName || !childLastName || !childDateOfBirth || !locationId) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/enrollments/create-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianFirstName,
          guardianLastName,
          guardianEmail,
          guardianPhone,
          emergencyContactName,
          emergencyContactPhone,
          childFirstName,
          childLastName,
          childDateOfBirth,
          locationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setSuccess(data.message);
      
      // Redirect to the new enrollment page
      setTimeout(() => {
        setOpen(false);
        router.push(`/dashboard/admin/enrollments/${data.enrollmentId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setGuardianFirstName('');
    setGuardianLastName('');
    setGuardianEmail('');
    setGuardianPhone('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setChildFirstName('');
    setChildLastName('');
    setChildDateOfBirth('');
    setLocationId('');
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#2EC4B6]" />
            Create New Student Enrollment
          </DialogTitle>
          <DialogDescription>
            Add a brand new student who has no account. This creates parent, student, and enrollment records. Use &quot;Send Payment Link&quot; after to charge the parent.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-700 font-medium">{success}</p>
            <p className="text-sm text-slate-500 mt-2">Redirecting...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Parent/Guardian Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-slate-500" />
                Parent/Guardian Information
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="guardianFirstName" className="text-xs">First Name *</Label>
                  <Input
                    id="guardianFirstName"
                    value={guardianFirstName}
                    onChange={(e) => setGuardianFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guardianLastName" className="text-xs">Last Name *</Label>
                  <Input
                    id="guardianLastName"
                    value={guardianLastName}
                    onChange={(e) => setGuardianLastName(e.target.value)}
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="guardianEmail" className="text-xs flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email *
                  </Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value.slice(0, MAX_EMAIL_LENGTH))}
                    placeholder="parent@email.com"
                    maxLength={MAX_EMAIL_LENGTH}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guardianPhone" className="text-xs flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone (digits only)
                  </Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(formatPhoneInput(e.target.value))}
                    placeholder="5551234567"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4 text-slate-500" />
                Emergency Contact (Optional)
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyName" className="text-xs">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyPhone" className="text-xs">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(formatPhoneInput(e.target.value))}
                    placeholder="5559876543"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Child Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Baby className="h-4 w-4 text-slate-500" />
                Child Information
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="childFirstName" className="text-xs">First Name *</Label>
                  <Input
                    id="childFirstName"
                    value={childFirstName}
                    onChange={(e) => setChildFirstName(e.target.value)}
                    placeholder="Tommy"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="childLastName" className="text-xs">Last Name *</Label>
                  <Input
                    id="childLastName"
                    value={childLastName}
                    onChange={(e) => setChildLastName(e.target.value)}
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="childDob" className="text-xs">Date of Birth *</Label>
                <Input
                  id="childDob"
                  type="date"
                  value={childDateOfBirth}
                  onChange={(e) => setChildDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-slate-500" />
                Location *
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2EC4B6]/20 focus:border-[#2EC4B6]"
                >
                  <option value="">Select a location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={creating}
                className="bg-[#2EC4B6] hover:bg-[#2EC4B6]/90"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Student
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
