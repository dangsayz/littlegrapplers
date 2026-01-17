import { supabaseAdmin } from '@/lib/supabase';
import { EnrollmentWizard } from './enrollment-wizard';

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
