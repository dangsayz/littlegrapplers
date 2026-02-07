/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  typedRoutes: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  
  // Security Headers - PCI DSS & OWASP aligned
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.littlegrapplers.net https://challenges.cloudflare.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://i.ytimg.com https://img.clerk.com https://*.clerk.com https://clerk.littlegrapplers.net; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com https://clerk.littlegrapplers.net wss://*.supabase.co; frame-src https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.littlegrapplers.net https://challenges.cloudflare.com https://www.youtube.com https://vercel.live; media-src 'self' blob: https://*.supabase.co; worker-src 'self' blob:;",
          },
        ],
      },
      // Stricter headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
