import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // For KYC IDs, Receipts, and Profile Pictures
        port: "",
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com", // For the fallback avatars in the sidebar
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
