import Link from 'next/link';
import type { Route } from 'next';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { Container } from './container';
import { Logo } from './logo';
import { Separator } from '@/components/ui/separator';

type FooterLink = { label: string; href: Route };

const footerLinks: { programs: FooterLink[]; company: FooterLink[]; legal: FooterLink[] } = {
  programs: [
    { label: 'Tiny Grapplers (3-5)', href: '/programs#tiny' as Route },
    { label: 'Junior Grapplers (6-8)', href: '/programs#junior' as Route },
    { label: 'Advanced Grapplers (9-12)', href: '/programs#advanced' as Route },
    { label: 'All Programs', href: '/programs' as Route },
  ],
  company: [
    { label: 'About Us', href: '/about' as Route },
    { label: 'Our Locations', href: '/locations' as Route },
    { label: 'FAQ', href: '/faq' as Route },
    { label: 'Contact', href: '/contact' as Route },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' as Route },
    { label: 'Terms of Service', href: '/terms' as Route },
    { label: 'Enrollment Waiver', href: '/waiver' as Route },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <Container className="py-16 lg:py-20">
        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 text-sm text-background/70">
              Building confident, disciplined, and resilient children through the art of Brazilian
              Jiu-Jitsu at partnered daycare facilities.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/littlegrapplers"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-background/20"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/littlegrapplers"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-background/20"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Programs Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Programs</h3>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:sshnaydbjj@gmail.com"
                  className="inline-flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
                >
                  <Mail className="h-4 w-4" />
                  sshnaydbjj@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+14692095814"
                  className="inline-flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
                >
                  <Phone className="h-4 w-4" />
                  +1 (469) 209-5814
                </a>
              </li>
              <li>
                <span className="inline-flex items-start gap-2 text-sm text-background/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  Multiple locations across the city
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-background/20" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-background/60">
            © {currentYear} Little Grapplers. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-background/60 transition-colors hover:text-background"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
