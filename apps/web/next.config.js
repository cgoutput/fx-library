/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fx-library/shared'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'),
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
