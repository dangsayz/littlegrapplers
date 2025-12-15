import { Metadata } from 'next';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Privacy Policy - Little Grapplers',
  description: 'Privacy Policy for Little Grapplers youth Brazilian Jiu-Jitsu program.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Privacy <span className="text-brand">Policy</span>
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
              <h2 className="text-2xl font-display font-bold">Introduction</h2>
              <p className="text-muted-foreground">
                Little Grapplers ("we," "our," or "us") is committed to protecting the privacy of children and their families. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or enroll in our programs.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Information We Collect</h2>
              <p className="text-muted-foreground">We may collect the following types of information:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and mailing address of parents/guardians.</li>
                <li><strong>Child Information:</strong> Child's name, age, and daycare facility (collected with parental consent).</li>
                <li><strong>Payment Information:</strong> Billing details processed through secure third-party payment processors.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address and browser type.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Provide and manage our BJJ programs</li>
                <li>Process enrollments and payments</li>
                <li>Communicate about classes, schedules, and events</li>
                <li>Send promotional materials (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Children's Privacy (COPPA Compliance)</h2>
              <p className="text-muted-foreground">
                We are committed to complying with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information directly from children under 13 without verifiable parental consent. All information about children enrolled in our programs is collected from and managed by their parents or guardians.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li><strong>Partner Daycare Facilities:</strong> To coordinate program delivery</li>
                <li><strong>Service Providers:</strong> Who assist in operating our business (payment processors, email services)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Your Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Access, update, or delete your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request information about how your data is used</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Cookies</h2>
              <p className="text-muted-foreground">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
