/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⚠️ This will ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
