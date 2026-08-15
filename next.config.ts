import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip/brotli compression
  compress: true,

  // Reduce unnecessary headers
  poweredByHeader: false,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Production optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@heroicons/react",
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
