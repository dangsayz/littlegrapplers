import Link from 'next/link';
import { User, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Belt rank display mapping
const beltConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string; stripeColor: string }
> = {
  white: {
    label: 'White',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    stripeColor: 'bg-gray-900',
  },
  grey_white: {
    label: 'Grey/White',
    bgColor: 'bg-gray-400',
    textColor: 'text-white',
    stripeColor: 'bg-white',
  },
  grey: {
    label: 'Grey',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  grey_black: {
    label: 'Grey/Black',
    bgColor: 'bg-gray-600',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  yellow_white: {
    label: 'Yellow/White',
    bgColor: 'bg-yellow-400',
    textColor: 'text-gray-900',
    stripeColor: 'bg-white',
  },
  yellow: {
    label: 'Yellow',
    bgColor: 'bg-yellow-500',
    textColor: 'text-gray-900',
    stripeColor: 'bg-gray-900',
  },
  yellow_black: {
    label: 'Yellow/Black',
    bgColor: 'bg-yellow-600',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  orange_white: {
    label: 'Orange/White',
    bgColor: 'bg-orange-400',
    textColor: 'text-white',
    stripeColor: 'bg-white',
  },
  orange: {
    label: 'Orange',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  orange_black: {
    label: 'Orange/Black',
    bgColor: 'bg-orange-600',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  green_white: {
    label: 'Green/White',
    bgColor: 'bg-green-400',
    textColor: 'text-white',
    stripeColor: 'bg-white',
  },
  green: {
    label: 'Green',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
  green_black: {
    label: 'Green/Black',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    stripeColor: 'bg-gray-900',
  },
};

interface StudentCardProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    beltRank: string;
    stripes: number;
    avatarUrl?: string | null;
  };
}

export function StudentCard({ student }: StudentCardProps) {
  const belt = beltConfig[student.beltRank] || beltConfig.white;
  const age = null; // Would calculate from dateOfBirth if needed

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.firstName}
                className="w-14 h-14 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {student.firstName} {student.lastName}
            </h3>

            {/* Belt display */}
            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  'h-4 w-20 rounded-sm flex items-center justify-end pr-1 gap-0.5 border border-border',
                  belt.bgColor
                )}
              >
                {/* Stripes */}
                {Array.from({ length: student.stripes }).map((_, i) => (
                  <div
                    key={i}
                    className={cn('h-2.5 w-1 rounded-sm', belt.stripeColor)}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {belt.label}
                {student.stripes > 0 && ` • ${student.stripes} stripe${student.stripes > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="default" className="flex-1 h-11" asChild>
            <Link href={`/dashboard/students/${student.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state when no students
export function NoStudentsCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No students yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your first student to get started with memberships and classes.
        </p>
        <Button asChild>
          <Link href="/dashboard/students/new">Add Student</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
