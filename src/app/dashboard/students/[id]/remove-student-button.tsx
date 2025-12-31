'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface RemoveStudentButtonProps {
  studentId: string;
  studentName: string;
}

const REMOVAL_REASONS = [
  { value: 'no_longer_attending', label: 'No longer attending classes' },
  { value: 'moved_away', label: 'Moved to a different area' },
  { value: 'trying_other_activities', label: 'Trying other activities' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'schedule', label: 'Schedule conflicts' },
  { value: 'duplicate', label: 'Duplicate entry / Added by mistake' },
  { value: 'other', label: 'Other reason' },
];

export function RemoveStudentButton({ studentId, studentName }: RemoveStudentButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!reason) {
      setError('Please select a reason for removal');
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      const reasonText = REMOVAL_REASONS.find(r => r.value === reason)?.label || reason;
      const fullReason = additionalNotes 
        ? `${reasonText}: ${additionalNotes}`
        : reasonText;

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.hasActiveMembership) {
          setError('Cannot remove student with an active membership. Please cancel the membership first.');
        } else {
          throw new Error(data.error || 'Failed to remove student');
        }
        return;
      }

      setIsOpen(false);
      router.push('/dashboard/students');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Remove Student
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{studentName}</strong> from your account? 
            This action can be undone by contacting support.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for removal <span className="text-destructive">*</span></Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REMOVAL_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Please specify</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Tell us more about why you're removing this student..."
                rows={3}
              />
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Student will be removed from your dashboard</li>
              <li>Waiver records are kept for legal purposes</li>
              <li>Contact support if you need to restore this student</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving || !reason}
          >
            {isRemoving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
