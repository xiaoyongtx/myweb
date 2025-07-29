/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xodtkzaayxxuydrzrcyv.supabase.co'],
  },
  eslint: {
    // 在构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;