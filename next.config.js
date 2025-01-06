/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['njsky.cc', 'www.njsky.cc', 'njsky.liuliang.world'],
    unoptimized: process.env.NODE_ENV === 'production' ? true : false,
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig 