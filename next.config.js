/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 在生产构建时忽略类型错误
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig 