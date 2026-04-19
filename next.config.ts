import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nyc.cloud.appwrite.io",
        port: "",
        pathname: "/**", // Allows all paths from this domain
      },
    ],
  },
};

export default nextConfig;