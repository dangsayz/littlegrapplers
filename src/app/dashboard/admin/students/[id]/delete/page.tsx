'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentData {
  id: string;
  child_full_name: string;
  parent_email: string;
}

export default function AdminStudentDeletePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/admin/students/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch student');
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        setError('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [params.id]);

  const handleDelete = async () => {
    if (!student || confirmName !== student.child_full_name) {
      setError('Please type the student name exactly to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/students/${params.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      router.push('/dashboard/admin/students?deleted=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
      setIsDeleting(false);
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
          <Link href="/dashboard/admin/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  const isConfirmValid = confirmName === student.child_full_name;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <Link 
        href={`/dashboard/admin/students/${params.id}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Student Details
      </Link>

      {/* Warning Card */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Delete Student</CardTitle>
              <CardDescription>
                This action cannot be undone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm">
              You are about to permanently delete the following student record:
            </p>
            <div className="mt-3 p-3 bg-background rounded border">
              <p className="font-semibold">{student.child_full_name}</p>
              <p className="text-sm text-muted-foreground">{student.parent_email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>The student's enrollment record</li>
              <li>The signed waiver associated with this student</li>
              <li>All related membership data</li>
            </ul>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-semibold">{student.child_full_name}</span> to confirm:
            </Label>
            <Input
              id="confirm"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                setError(null);
              }}
              placeholder="Type student name to confirm"
              className={isConfirmValid ? 'border-green-500 focus-visible:ring-green-500' : ''}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Student Permanently
                </>
              )}
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/dashboard/admin/students/${params.id}`}>
                Cancel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
