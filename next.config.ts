import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // Enables SSR support for styled-components
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
  experimental: {
    serverComponentsExternalPackages: ["child_process"],
  },
};

export default nextConfig;
