/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["xiojvizsednpddgmemfm.supabase.co"],
    unoptimized: true,
  },
}

module.exports = nextConfig
