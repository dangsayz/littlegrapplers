import { Metadata } from 'next';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Terms of Service - Little Grapplers',
  description: 'Terms of Service for Little Grapplers youth Brazilian Jiu-Jitsu program.',
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Terms of <span className="text-brand">Service</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Last updated: December 2024</p>
          </div>
        </Container>
      </section>

      {/* Content Section */}
      <section className="section-padding">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Little Grapplers' website and services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Services Description</h2>
              <p className="text-muted-foreground">
                Little Grapplers provides youth Brazilian Jiu-Jitsu instruction at partner daycare facilities. Our services include:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>In-person BJJ classes at partner daycare locations</li>
                <li>Access to online video tutorials and curriculum</li>
                <li>Belt promotion ceremonies and special events</li>
                <li>Parent communication and progress updates</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Enrollment and Payment</h2>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Enrollment requires completion of a registration form and parental/guardian consent.</li>
                <li>Payment is due according to the selected membership plan (monthly or 3-month paid-in-full).</li>
                <li>All fees are non-refundable unless otherwise specified.</li>
                <li>We reserve the right to modify pricing with 30 days' notice.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Cancellation Policy</h2>
              <p className="text-muted-foreground">
                Monthly memberships may be cancelled with 30 days' written notice. Prepaid packages (3-month paid-in-full) are non-refundable but may be transferred to another child with approval.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Assumption of Risk and Liability Waiver</h2>
              <p className="text-muted-foreground">
                Brazilian Jiu-Jitsu is a physical activity that carries inherent risks of injury. By enrolling your child, you acknowledge and accept these risks. You agree to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Ensure your child is physically fit to participate</li>
                <li>Notify us of any medical conditions or limitations</li>
                <li>Release Little Grapplers, its instructors, and partner facilities from liability for injuries that may occur during normal training activities</li>
                <li>Maintain appropriate health insurance for your child</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Code of Conduct</h2>
              <p className="text-muted-foreground">Participants are expected to:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Show respect to instructors, fellow students, and facilities</li>
                <li>Follow safety guidelines and instructor directions</li>
                <li>Arrive on time and prepared for class</li>
                <li>Maintain proper hygiene and wear clean training attire</li>
              </ul>
              <p className="text-muted-foreground">
                We reserve the right to dismiss students who violate these standards without refund.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Photo and Video Release</h2>
              <p className="text-muted-foreground">
                By enrolling, you grant Little Grapplers permission to photograph and video record your child during classes and events for promotional purposes, including use on our website and social media. You may opt out of this by notifying us in writing.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on our website and in our video library, including text, images, logos, and videos, is the property of Little Grapplers and protected by copyright laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, Little Grapplers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services constitutes acceptance of the updated terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground">
                <strong>Email:</strong> sshnaydbjj@gmail.com<br />
                <strong>Phone:</strong> +1 (469) 209-5814
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
