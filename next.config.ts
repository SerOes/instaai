import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Allow cross-origin requests in development
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.50.253:3000",
    "127.0.0.1:3000",
    "192.168.50.253",
  ],
};

export default nextConfig;
