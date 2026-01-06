import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * Configuration decisions:
 * 
 * 1. Image Optimization:
 *    - Enabled (unoptimized: false) for better performance and bandwidth usage
 *    - Remote patterns allow all hosts (http/https) - this is permissive but necessary
 *      for the photo guessing game where users may upload images from any URL.
 *    - Consider restricting in production if security is a concern, but this would
 *      limit functionality for URL-based photo uploads.
 * 
 * 2. Turbopack Configuration:
 *    - Currently configured but not actively used (dev script uses --webpack flag)
 *    - Kept for future migration to Turbopack when stable
 *    - Can be removed if not planning to use Turbopack
 * 
 * 3. Webpack Configuration:
 *    - Prisma client is externalized on server-side to prevent bundling issues
 *    - This is necessary because Prisma generates client code that shouldn't be bundled
 *    - Required for proper Prisma functionality in Next.js
 * 
 * 4. Page Extensions:
 *    - Only processes TypeScript/JavaScript files (ts, tsx, js, jsx)
 *    - Prevents processing of other file types as pages
 */
const nextConfig: NextConfig = {
  // Only process specific file extensions
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Enable optimization for better performance and bandwidth usage
    // Note: Remote patterns are permissive to allow URL-based photo uploads
    // Consider restricting in production if security is a concern
    unoptimized: false,
  },
  
  // Configure Turbopack (currently not used - dev script uses --webpack)
  // Kept for future migration when Turbopack is stable
  // Can be removed if not planning to use Turbopack
  turbopack: {
    resolveExtensions: [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
    ],
    rules: {
      "*.md": {
        loaders: [],
        as: "*.txt",
      },
    },
  },
  
  // Webpack configuration to externalize Prisma
  // Required: Prisma client must be externalized on server-side to prevent bundling issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
