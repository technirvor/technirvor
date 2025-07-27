/** @type {import('next').NextConfig} */

const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.102:3000",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // swcMinify: true, // Not needed in Next.js 15+
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
  },
  webpack: (config) => {
    config.cache = {
      type: "memory",
    };
    return config;
  },

  // Security headers are now handled in middleware.ts to avoid conflicts
  // async headers() {
  //   return [];
  // },
};

export default nextConfig;
