/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    console.log(
      "Configuring rewrites with API URL:",
      process.env.NEXT_PUBLIC_API_URL
    );

    // Fallback to a default URL if environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

// mergeConfig(nextConfig, userConfig);

// function mergeConfig(nextConfig, userConfig) {
//   if (!userConfig) {
//     return;
//   }

//   for (const key in userConfig) {
//     if (
//       typeof nextConfig[key] === "object" &&
//       !Array.isArray(nextConfig[key])
//     ) {
//       nextConfig[key] = {
//         ...nextConfig[key],
//         ...userConfig[key],
//       };
//     } else {
//       nextConfig[key] = userConfig[key];
//     }
//   }
// }

export default nextConfig;
