import { supabaseAdmin } from '@/lib/supabase';
import { EnrollmentWizard } from './enrollment-wizard';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
}

export const metadata = {
  title: 'Enroll Your Child | Little Grapplers',
  description: 'Enroll your child in Little Grapplers jiu-jitsu classes. Quick and easy enrollment in just a few steps.',
};

export default async function EnrollPage() {
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug, city, state')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">Enroll</span>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Enroll Your Child
          </h1>
          <p className="mt-2 text-muted-foreground">
            Quick enrollment in just a few steps
          </p>
        </div>
        
        <EnrollmentWizard locations={(locations as Location[]) || []} />
      </div>
    </div>
  );
}
