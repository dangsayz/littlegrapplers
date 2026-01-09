import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { SiteOfflineCheck } from '@/components/layout/site-offline-check';

// Force dynamic rendering to always check platform status
export const dynamic = 'force-dynamic';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteOfflineCheck>
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </SiteOfflineCheck>
  );
}
