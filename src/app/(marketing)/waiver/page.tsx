import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { WizardWaiverForm } from './wizard-waiver-form';
import { CollapsibleWaiverDocument } from './collapsible-waiver';
import { FileText, Clock } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Enrollment Waiver - Little Grapplers',
  description: 'Complete the Little Grapplers enrollment waiver and release of liability for your child to participate in Brazilian Jiu-Jitsu classes.',
};

async function getLocations() {
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');
  
  return locations || [];
}

export default async function WaiverPage() {
  const locations = await getLocations();
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding relative overflow-hidden bg-gradient-to-br from-[#2EC4B6]/5 via-white to-[#8FE3CF]/10">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231F2A44\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#2EC4B6]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#8FE3CF]/15 blur-3xl" />
        
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2EC4B6]/10 px-4 py-2 text-sm font-medium text-[#2EC4B6] shadow-sm">
              <FileText className="h-4 w-4" />
              Required for Enrollment
            </div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Takes about 3 minutes
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              Enrollment <span className="text-[#2EC4B6]">Waiver</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              Complete this quick form to enroll your child in Little Grapplers classes.
            </p>
          </div>
        </Container>
      </section>

      {/* Waiver Document Section */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Collapsible Legal Document */}
            <CollapsibleWaiverDocument />

            {/* Enrollment Form */}
            <div className="mb-8 mt-12">
              <h2 className="mb-2 text-2xl font-display font-bold">Complete Your Enrollment</h2>
              <p className="text-muted-foreground">Fill out the form below and sign digitally to enroll your child.</p>
            </div>
            
            <WizardWaiverForm locations={locations} />
          </div>
        </Container>
      </section>
    </>
  );
}
