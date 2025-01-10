import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // 克隆响应以添加头信息
  const response = NextResponse.next()

  // 添加缓存控制头
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，但不包括：
     * - api 路由 (因为它们有自己的缓存控制)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 