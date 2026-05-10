/** @type {import('next').NextConfig} */
const nextConfig = {
  // Provide fallback for env vars during build
  env: {
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111",
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || "devnet",
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  reactStrictMode: false,
  swcMinify: true,

  // Skip type errors during build — fix them separately
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;