import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // Enables SSR support for styled-components
  },
  images: {
    domains: ['futurepepe-media.suffescom.dev'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "futurepepe-media.suffescom.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
