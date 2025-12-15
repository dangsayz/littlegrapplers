'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// TODO: Replace with actual database queries
const mockStudents = [
  { id: '1', firstName: 'Timmy', lastName: 'Johnson' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson' },
];

const mockPrograms = [
  {
    id: '1',
    name: 'Tiny Grapplers (Ages 4-6)',
    monthlyPrice: 9900,
    location: { name: 'Austin HQ' },
  },
  {
    id: '2',
    name: 'Little Grapplers (Ages 7-10)',
    monthlyPrice: 9900,
    location: { name: 'Austin HQ' },
  },
  {
    id: '3',
    name: 'Junior Grapplers (Ages 11-14)',
    monthlyPrice: 10900,
    location: { name: 'Austin HQ' },
  },
];

export default function NewMembershipPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    programId: '',
  });

  const selectedProgram = mockPrograms.find((p) => p.id === formData.programId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual membership creation via API
    // await createMembership(formData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect back to memberships list
    router.push('/dashboard/memberships');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/memberships" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Memberships
        </Link>
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            Enroll in a Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <select
                id="student"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                required
              >
                <option value="">Choose a student...</option>
                {mockStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="program">Select Program</Label>
              <select
                id="program"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={formData.programId}
                onChange={(e) =>
                  setFormData({ ...formData, programId: e.target.value })
                }
                required
              >
                <option value="">Choose a program...</option>
                {mockPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} - ${(program.monthlyPrice / 100).toFixed(2)}/mo
                  </option>
                ))}
              </select>
            </div>

            {/* Price Summary */}
            {selectedProgram && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedProgram.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProgram.location.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand">
                      ${(selectedProgram.monthlyPrice / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.studentId || !formData.programId}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enroll Now
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
