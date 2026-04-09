/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone 模式（SSR 部署）
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,  // 打包时忽略 TypeScript 类型错误
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
