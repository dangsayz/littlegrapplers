import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { SITE_CONFIG } from '@/lib/constants';
import { SiteFrozenOverlay } from '@/components/site-frozen-overlay';
import { OrganizationJsonLd } from '@/components/seo/json-ld';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFrozen = process.env.SITE_FROZEN === 'true';
  const freezeMessage = process.env.SITE_FREEZE_MESSAGE;

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
        <head>
          <OrganizationJsonLd />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          {isFrozen && <SiteFrozenOverlay message={freezeMessage} />}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
