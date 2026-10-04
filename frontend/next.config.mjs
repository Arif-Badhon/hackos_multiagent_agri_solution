import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Keep active to simulate offline-first PWA caching
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support cloud deployments and Vercel edge routes
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://hackos-multiagent-agri-solution.onrender.com";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
