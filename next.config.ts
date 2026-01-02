import type { NextConfig } from "next";

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
    unoptimized: false, // Enable optimization for better performance
  },
  
  // Configure Turbopack
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
