import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { WaiverForm } from './waiver-form';
import { FileText, Shield, CreditCard, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enrollment Waiver - Little Grapplers',
  description: 'Complete the Little Grapplers enrollment waiver and release of liability for your child to participate in Brazilian Jiu-Jitsu classes.',
};

export default function WaiverPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              <FileText className="h-4 w-4" />
              Required for Enrollment
            </div>
            <h1 className="text-display-lg font-display font-bold">
              Enrollment <span className="text-brand">Waiver</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please read and complete this waiver and enrollment agreement to enroll your child in Little Grapplers classes.
            </p>
          </div>
        </Container>
      </section>

      {/* Waiver Document Section */}
      <section className="section-padding">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Legal Document */}
            <div className="mb-12 rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
                <Shield className="h-8 w-8 text-brand" />
                <div>
                  <h2 className="text-2xl font-display font-bold">Little Grapplers Waiver and Enrollment Policy</h2>
                  <p className="text-sm text-muted-foreground">Parent/Guardian Waiver and Release of Liability for Minor Participation</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
                <p>
                  I, the undersigned parent or legal guardian, hereby give my permission for my child to participate in physical activities, including Brazilian Jiu-Jitsu Training and Aerobics (hereinafter referred to as "Activities") at Little Grapplers, under the supervision of instructors and staff.
                </p>

                <p>
                  I understand that participation in these Activities may involve physical exertion and carry risks, including injury, illness, and I voluntarily assume all risks associated with my child's participation. I confirm that my child is in good physical condition and able to safely participate in these Activities.
                </p>

                <p>
                  <strong className="text-foreground">I hereby release, waive, and hold harmless Little Grapplers, Stephen Shnayderman, and their officers, staff, employees, agents, or representatives (hereinafter referred to as "Releasees")</strong> from any and all claims, demands, or causes of action arising from or related to any injury, loss, or damage, including death, that may occur while my child is participating in the Activities or while on the premises of Little Grapplers. This release extends to any negligence or other acts, whether directly or indirectly caused by the Releasees, to the fullest extent permitted by law.
                </p>

                <p>
                  I understand that my child's participation is voluntary, and I, as the parent/guardian, accept full responsibility for any potential risks, injuries, or damages that may occur. I also understand that my child may be involved in activities that could cause injury to themselves or others.
                </p>

                <p>
                  It is my expressed intent that this Waiver and Release of Liability shall apply not only to me but also to my child, family members, heirs, executors, administrators, and anyone else involved in or related to my child's participation in these Activities. In the event of my child's injury, I understand that I will not hold Little Grapplers, Stephen Shnayderman, or any of the Releasees responsible.
                </p>

                <p>
                  By signing this waiver, I confirm that I have read, understood, and agree to the terms outlined above. I am signing this release voluntarily and have not relied on any oral promises or inducements.
                </p>

                <p className="text-sm italic">
                  This agreement is made with the understanding that the laws of the State of Texas shall govern its interpretation.
                </p>

                {/* Photography Section */}
                <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-brand" />
                    <h3 className="text-lg font-display font-bold text-foreground">Photography and Media Release</h3>
                  </div>
                  <p>
                    By signing below, the Guardian grants Little Grapplers LLC permission to photograph or record the participant during the Activities for marketing, promotional, or educational purposes. These images or videos may be used on Little Grapplers' website, social media platforms, brochures, advertisements, and other promotional materials. I understand that my child's name will not be used without my consent, and that I will not receive compensation for the use of any media.
                  </p>
                </div>

                {/* Enrollment Policy Section */}
                <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-brand" />
                    <h3 className="text-lg font-display font-bold text-foreground">Little Grapplers Enrollment Policy</h3>
                  </div>
                  <p className="mb-4">
                    By enrolling your child in Little Grapplers and submitting payment, you agree to the following terms and conditions:
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground">1. Program and Payment Terms</h4>
                      <ul className="ml-4 mt-2 list-disc space-y-1">
                        <li><strong>Month-to-Month Plan:</strong> $65 per month, due on the 1st. Unlimited classes with flexibility to cancel with 30 days' written notice.</li>
                        <li><strong>3-Month Plan:</strong> $50 per month, due on the 1st, for a 3-month commitment (total $150), payable monthly.</li>
                        <li><strong>6-Month Plan:</strong> $50 per month (total $300), payable monthly.</li>
                        <li>Monthly payments are made via auto-debit (credit card or ACH).</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground">2. Auto-Renewal (Month-to-Month Only)</h4>
                      <p className="mt-1">The Month-to-Month Plan auto-renews monthly until terminated with 30 days' written notice (email to info@littlegrapplers.net).</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground">3. Termination</h4>
                      <ul className="ml-4 mt-2 list-disc space-y-1">
                        <li><strong>Month-to-Month:</strong> Cancel any time with 30 days' written notice. No refunds for partial months.</li>
                        <li><strong>3-Month Plan:</strong> Early termination requires payment of the remaining balance for the 3-month term ($150 total). No refunds for the 6-month plan after the first 30 days.</li>
                        <li>Non-payment may result in suspension of classes until the account is current.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground">4. Parental Consent and Liability</h4>
                      <p className="mt-1">By enrolling, you confirm your child is physically able to participate in Jiu-Jitsu classes and assume all risks of participation. Little Grapplers, Stephen Shnayderman, and their officers, staff, employees, agents, or representatives are not liable for injuries, except as required by law. This clause reinforces the Waiver and Release of Liability above.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Form */}
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-display font-bold">Complete Your Enrollment</h2>
              <p className="text-muted-foreground">Please fill out the form below and sign digitally to complete your enrollment.</p>
            </div>
            
            <WaiverForm />
          </div>
        </Container>
      </section>
    </>
  );
}
