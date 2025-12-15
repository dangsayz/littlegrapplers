import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SplashIntro } from '@/components/splash-intro';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplashIntro>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </SplashIntro>
  );
}
