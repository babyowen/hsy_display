/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 在生产构建时忽略类型错误
    ignoreBuildErrors: false,
  }
}

module.exports = nextConfig 
