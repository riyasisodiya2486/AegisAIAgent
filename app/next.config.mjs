
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // These polyfills are not needed in the browser for @solana/web3.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
  // Set to false to prevent double-rendering which can break wallet connections
  reactStrictMode: false,
  // Ensure the local SDK is transpiled correctly
  transpilePackages: ["@aegis/sdk"],
};

export default nextConfig;
