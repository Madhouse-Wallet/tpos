import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // Enables SSR support for styled-components
  },
   reactStrictMode: true,
  devIndicators: {
    buildActivity: false,
  },
  async headers() {

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  },
  images: {
    domains: ["media.madhousewallet.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.madhousewallet.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["child_process"],
};

export default nextConfig;
