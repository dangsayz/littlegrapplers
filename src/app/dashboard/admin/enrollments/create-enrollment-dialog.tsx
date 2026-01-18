'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, User, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
}

interface Location {
  id: string;
  name: string;
}

interface CreateEnrollmentDialogProps {
  locations: Location[];
}

export function CreateEnrollmentDialog({ locations }: CreateEnrollmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search students as user types
  useEffect(() => {
    if (search.length < 2) {
      setStudents([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/enrollments/create?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error('Error searching students:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async () => {
    if (!selectedStudent || !selectedLocation) {
      setError('Please select a student and location');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/enrollments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          locationId: selectedLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create enrollment');
      }

      setSuccess(data.message);
      
      // Refresh page after delay
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enrollment');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSearch('');
    setStudents([]);
    setSelectedStudent(null);
    setSelectedLocation('');
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Create Enrollment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Enrollment for Existing Student</DialogTitle>
          <DialogDescription>
            Create an enrollment for a student who was added without payment. After creating, use &quot;Send Payment Link&quot; to charge the parent.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-700 font-medium">{success}</p>
            <p className="text-sm text-slate-500 mt-2">Redirecting...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Student Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedStudent(null); }}
                  placeholder="Type student name..."
                  className="pl-10"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>
              
              {/* Search Results */}
              {students.length > 0 && !selectedStudent && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => { setSelectedStudent(student); setSearch(student.name); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">
                        Parent: {student.parentName} ({student.parentEmail})
                      </p>
                    </button>
                  ))}
                </div>
              )}
              
              {search.length >= 2 && students.length === 0 && !searching && (
                <p className="text-sm text-slate-500 py-2">No students found</p>
              )}
            </div>

            {/* Selected Student */}
            {selectedStudent && (
              <div className="bg-slate-50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="font-medium">{selectedStudent.name}</span>
                </div>
                <p className="text-sm text-slate-600 ml-6">
                  Parent: {selectedStudent.parentName}
                </p>
                <p className="text-xs text-slate-500 ml-6">
                  Email: {selectedStudent.parentEmail}
                </p>
              </div>
            )}

            {/* Location Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm"
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
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!selectedStudent || !selectedLocation || creating}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Enrollment'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
