'use client';

import { useState } from 'react';
import { Shield, ChevronDown, Camera, CreditCard, CheckCircle } from 'lucide-react';

export function CollapsibleWaiverDocument() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-sm ring-1 ring-gray-950/5">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-gray-900">Waiver & Policy</h2>
            <p className="text-xs text-gray-500">Tap to review terms</p>
          </div>
        </div>
        <div className={`h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </button>

      {/* Summary - Always Visible */}
      <div className="px-5 pb-4 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          Liability waiver
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          Photo consent
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          Payment terms
        </span>
      </div>

      {/* Expandable Full Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 border-t border-border">
          <div className="prose prose-sm max-w-none pt-6 space-y-5 text-muted-foreground">
            <p>
              I, the undersigned parent or legal guardian, hereby give my permission for my child to participate in physical activities, including Brazilian Jiu-Jitsu Training and Aerobics (hereinafter referred to as &quot;Activities&quot;) at Little Grapplers, under the supervision of instructors and staff.
            </p>

            <p>
              I understand that participation in these Activities may involve physical exertion and carry risks, including injury, illness, and I voluntarily assume all risks associated with my child&apos;s participation. I confirm that my child is in good physical condition and able to safely participate in these Activities.
            </p>

            <p>
              <strong className="text-foreground">I hereby release, waive, and hold harmless Little Grapplers, Stephen Shnayderman, and their officers, staff, employees, agents, or representatives (hereinafter referred to as &quot;Releasees&quot;)</strong> from any and all claims, demands, or causes of action arising from or related to any injury, loss, or damage, including death, that may occur while my child is participating in the Activities or while on the premises of Little Grapplers. This release extends to any negligence or other acts, whether directly or indirectly caused by the Releasees, to the fullest extent permitted by law.
            </p>

            <p>
              I understand that my child&apos;s participation is voluntary, and I, as the parent/guardian, accept full responsibility for any potential risks, injuries, or damages that may occur. I also understand that my child may be involved in activities that could cause injury to themselves or others.
            </p>

            <p>
              It is my expressed intent that this Waiver and Release of Liability shall apply not only to me but also to my child, family members, heirs, executors, administrators, and anyone else involved in or related to my child&apos;s participation in these Activities. In the event of my child&apos;s injury, I understand that I will not hold Little Grapplers, Stephen Shnayderman, or any of the Releasees responsible.
            </p>

            <p>
              By signing this waiver, I confirm that I have read, understood, and agree to the terms outlined above. I am signing this release voluntarily and have not relied on any oral promises or inducements.
            </p>

            <p className="text-xs italic">
              This agreement is made with the understanding that the laws of the State of Texas shall govern its interpretation.
            </p>

            {/* Photography Section */}
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5 text-brand" />
                <h3 className="text-base font-display font-bold text-foreground">Photography and Media Release</h3>
              </div>
              <p className="text-sm">
                By signing below, the Guardian grants Little Grapplers LLC permission to photograph or record the participant during the Activities for marketing, promotional, or educational purposes. These images or videos may be used on Little Grapplers&apos; website, social media platforms, brochures, advertisements, and other promotional materials. I understand that my child&apos;s name will not be used without my consent, and that I will not receive compensation for the use of any media.
              </p>
            </div>

            {/* Enrollment Policy Section */}
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand" />
                <h3 className="text-base font-display font-bold text-foreground">Enrollment Policy</h3>
              </div>
              <p className="mb-4 text-sm">
                By enrolling your child in Little Grapplers and submitting payment, you agree to the following terms:
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground">1. Program and Payment Terms</h4>
                  <ul className="ml-4 mt-1.5 list-disc space-y-1">
                    <li><strong>Monthly:</strong> $50/mo, cancel anytime with 30 days notice</li>
                    <li><strong>3 Months Paid-In-Full:</strong> $150 one-time payment</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">2. Auto-Renewal</h4>
                  <p className="mt-1">Month-to-Month auto-renews until cancelled with 30 days written notice.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">3. Termination</h4>
                  <p className="mt-1">Early termination of commitment plans requires payment of remaining balance. Non-payment may result in class suspension.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">4. Parental Consent</h4>
                  <p className="mt-1">By enrolling, you confirm your child can safely participate and assume all risks. This reinforces the waiver above.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
