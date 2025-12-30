import Link from 'next/link';
import type { Route } from 'next';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { Container } from './container';
import { Logo } from './logo';
import { Separator } from '@/components/ui/separator';
import { NewsletterSignup } from './newsletter-signup';

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
    <footer className="bg-muted text-foreground">
      <Container className="py-16 lg:py-20">
        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Logo variant="default" />
            <p className="mt-4 text-sm text-muted-foreground">
              Building confident, disciplined, and resilient children through the art of Brazilian
              Jiu-Jitsu at partnered daycare facilities.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/littlegrapplers"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground/10 p-2.5 transition-colors hover:bg-foreground/20"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/littlegrapplers"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground/10 p-2.5 transition-colors hover:bg-foreground/20"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  sshnaydbjj@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+14692095814"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  +1 (469) 209-5814
                </a>
              </li>
              <li>
                <span className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  Multiple locations across the city
                </span>
              </li>
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="mb-3 text-sm font-semibold">Stay Updated</h4>
              <p className="mb-3 text-xs text-muted-foreground">
                Get news about programs, events, and promotions.
              </p>
              <NewsletterSignup variant="footer" source="footer" />
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-border" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Little Grapplers. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
