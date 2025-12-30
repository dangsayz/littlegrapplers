'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Save, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentData {
  id: string;
  child_full_name: string;
  child_date_of_birth: string | null;
  child_gender: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
}

export default function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [student, setStudent] = useState<StudentData | null>(null);

  const [formData, setFormData] = useState({
    child_full_name: '',
    child_date_of_birth: '',
    child_gender: '',
    medical_conditions: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (!res.ok) throw new Error('Failed to fetch student');
        const data = await res.json();
        setStudent(data);
        setFormData({
          child_full_name: data.child_full_name || '',
          child_date_of_birth: data.child_date_of_birth?.split('T')[0] || '',
          child_gender: data.child_gender || '',
          medical_conditions: data.medical_conditions || '',
          allergies: data.allergies || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
        });
      } catch (err) {
        setError('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update student');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/students/${id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Student not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/students/${id}`} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Update information for {student.child_full_name}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Child Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="child_full_name">Full Name *</Label>
                <Input
                  id="child_full_name"
                  value={formData.child_full_name}
                  onChange={(e) => handleChange('child_full_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child_date_of_birth">Date of Birth</Label>
                <Input
                  id="child_date_of_birth"
                  type="date"
                  value={formData.child_date_of_birth}
                  onChange={(e) => handleChange('child_date_of_birth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child_gender">Gender</Label>
                <Select 
                  value={formData.child_gender} 
                  onValueChange={(value) => handleChange('child_gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Textarea
                id="medical_conditions"
                value={formData.medical_conditions}
                onChange={(e) => handleChange('medical_conditions', e.target.value)}
                placeholder="List any medical conditions..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                placeholder="List any allergies..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                  placeholder="e.g., Grandmother, Uncle"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="emergency_contact_phone">Phone Number</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/students/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
