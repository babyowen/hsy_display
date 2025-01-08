'use client'
import LatestData from '@/components/LatestData'
import Description from '@/components/Description'
import DataTable from '@/components/DataTable'
import Header from '@/components/Header'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
import type { FeishuResponse } from '@/lib/types'

export default function Home() {
  const { data, error, isLoading } = useSWR<{
    data: {
      items: FeishuResponse['data']['items']
    }
  }>('/api/feishu/history', fetcher)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full overflow-hidden">
        <Header />
      </div>
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8 space-y-8">
        <LatestData />
        {isLoading ? (
          <div>加载历史数据中...</div>
        ) : error ? (
          <div>加载历史数据失败: {error.message}</div>
        ) : data ? (
          <DataTable data={data} title="历史数据" />
        ) : (
          <div>暂无历史数据</div>
        )}
        <Description />
      </div>
      <footer className="py-4 text-center text-sm text-gray-500">
        <a 
          href="https://beian.miit.gov.cn/#/Integrated/index"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          苏ICP备08105700号-2
        </a>
      </footer>
    </main>
  )
}
