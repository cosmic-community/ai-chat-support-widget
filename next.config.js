/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['cdn.cosmicjs.com', 'imgix.cosmicjs.com'],
  },
  env: {
    COSMIC_BUCKET_SLUG: process.env.COSMIC_BUCKET_SLUG,
  }
}

module.exports = nextConfig