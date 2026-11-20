import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Next.js 16.4 agent feedback during development
  experimental: {
    agentFeedback: true,
  },

  // Next.js 16 caching & performance features
  cacheComponents: true,
  partialPrefetching: true,

  // Automatic memoization via React 19 Compiler (`babel-plugin-react-compiler`)
  reactCompiler: true,

  // Allow external image hosts used by Cosmetik Point & Next.js <Image />
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Tailwind CSS v4 Turbopack loader configuration
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
