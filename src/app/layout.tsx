import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { SITE_CONFIG, CLIENT_OWNER_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import { SiteFrozenOverlay } from '@/components/site-frozen-overlay';
import { PaymentDueBanner } from '@/components/payment-due-banner';
import { OrganizationJsonLd } from '@/components/seo/json-ld';
import { supabaseAdmin } from '@/lib/supabase';
import { unstable_noStore as noStore } from 'next/cache';

// Force dynamic rendering to always check platform status
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} | Youth BJJ in Dallas-Fort Worth`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'kids BJJ',
    'youth Brazilian Jiu-Jitsu',
    'kids martial arts Dallas',
    'children BJJ classes',
    'daycare martial arts',
    'BJJ for kids',
    'youth jiu-jitsu DFW',
    'kids self defense Dallas',
    'Little Grapplers',
    'toddler martial arts',
    'preschool BJJ',
  ],
  authors: [{ name: 'Little Grapplers', url: SITE_CONFIG.url }],
  creator: 'Little Grapplers',
  publisher: 'Little Grapplers',
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | Youth BJJ in Dallas-Fort Worth`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/logo.jpg`,
        width: 1200,
        height: 630,
        alt: 'Little Grapplers - Youth Brazilian Jiu-Jitsu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | Youth BJJ in Dallas-Fort Worth`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/images/logo.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: 'white',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent caching - always fetch fresh status
  noStore();
  
  let platformStatus = null;
  let hasUnpaidWorkOrders = false;
  
  try {
    const { data } = await supabaseAdmin
      .from('platform_status')
      .select('*')
      .limit(1)
      .single();
    platformStatus = data;
  } catch {
    // Platform status table may not exist yet, fall back to env var
  }

  // Check for unpaid work orders (development fees)
  try {
    const { data: unpaidOrders } = await supabaseAdmin
      .from('work_orders')
      .select('id, quoted_cost')
      .eq('status', 'completed')
      .eq('paid', false)
      .gt('quoted_cost', 0);
    
    hasUnpaidWorkOrders = (unpaidOrders?.length || 0) > 0;
  } catch {
    // Work orders table may not exist
  }

  // Site is frozen if:
  // 1. Platform is disabled (payment overdue) OR
  // 2. There are unpaid work orders (development fees owed)
  const isFrozen = platformStatus 
    ? (!platformStatus.is_enabled || hasUnpaidWorkOrders)
    : process.env.SITE_FROZEN === 'true';
  const freezeMessage = platformStatus?.disabled_reason || process.env.SITE_FREEZE_MESSAGE;

  // Check if payment is due or overdue
  const paymentDueDate = platformStatus?.payment_due_date || null;
  const paymentReceivedAt = platformStatus?.payment_received_at || null;
  const overdueDays = platformStatus?.payment_overdue_days || 0;
  
  // Check if current user is the client owner (Stephen)
  // Only Stephen sees the payment due banner - not regular visitors
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const isClientOwner = userEmail && CLIENT_OWNER_EMAILS.map(e => e.toLowerCase()).includes(userEmail);
  
  // Show payment banner ONLY to Stephen if:
  // 1. User is Stephen (client owner) AND
  // 2. There's a due date set AND
  // 3. Payment hasn't been received yet (or received before due date was set)
  const showPaymentBanner = isClientOwner && paymentDueDate && (
    !paymentReceivedAt || 
    new Date(paymentReceivedAt) < new Date(paymentDueDate)
  );
  const isPaymentOverdue = overdueDays > 0;

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
        <head>
          <OrganizationJsonLd />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          {/* Payment Due Banner - fixed at top, shows only to Stephen */}
          {showPaymentBanner && !isFrozen && (
            <PaymentDueBanner 
              dueDate={paymentDueDate} 
              overdueDays={overdueDays} 
              isOverdue={isPaymentOverdue} 
            />
          )}
          {isFrozen && <SiteFrozenOverlay message={freezeMessage} initialStatus={platformStatus} />}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
