'use client'
export const dynamic = 'force-dynamic'
import LatestData from '@/components/LatestData'
import Description from '@/components/Description'
import DataTable from '@/components/DataTable'
import Header from '@/components/Header'
import LoadingState from '@/components/LoadingState'
import ErrorMessage from '@/components/ErrorMessage'
import EmptyState from '@/components/EmptyState'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
import type { FeishuResponse } from '@/lib/types'

export default function Home() {
  const { data, error, isLoading } = useSWR<{
    data: {
      items: FeishuResponse['data']['items']
    }
  }>('/api/feishu/history', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
  })

  return (
    <main className="relative min-h-screen overflow-x-clip bg-dusk-950">
      {/* 环境氛围层：网格 + 星空 + 扫描线 + 极光带 + 漂浮光斑 + 噪点 */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black,transparent)]" />
        {/* 双层星空，不同节奏闪烁 */}
        <div className="absolute inset-0 bg-stars animate-twinkle" />
        <div className="absolute inset-0 bg-stars animate-twinkle-slow [background-position:220px_130px]" />
        {/* 斜切极光带，缓慢色相流动 */}
        <div className="absolute left-1/2 top-[12%] h-[280px] w-[130%] -translate-x-1/2 -rotate-6 bg-gradient-to-r from-transparent via-ember-500/10 to-transparent blur-3xl animate-aurora" />
        <div className="absolute -top-48 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-ember-500/15 blur-[140px] animate-drift-a" />
        <div className="absolute top-[35%] -right-48 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-[120px] animate-drift-b" />
        <div className="absolute -bottom-24 -left-48 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px] animate-drift-a" />
        {/* 周期性下扫的监测扫描线 */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-400/60 to-transparent animate-scanline" />
        <div className="absolute inset-0 noise-overlay" />
      </div>

      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 pb-12 pt-10 sm:px-8 lg:px-16 space-y-14">
          <section className="animate-rise" style={{ animationDelay: '0.1s' }}>
            <LatestData />
          </section>
          <section className="animate-rise" style={{ animationDelay: '0.25s' }}>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorMessage message={`加载本周历史数据失败: ${error.message}`} />
            ) : data ? (
              <DataTable data={data} title="本周历史" />
            ) : (
              <EmptyState message="暂无本周历史数据" />
            )}
          </section>
          <section className="animate-rise" style={{ animationDelay: '0.4s' }}>
            <Description />
          </section>
        </div>
        <footer className="py-8 text-center">
          <div className="mx-auto mb-6 h-px w-40 bg-gradient-to-r from-transparent via-ember-500/50 to-transparent" />
          <a
            href="https://beian.miit.gov.cn/#/Integrated/index"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-num text-xs tracking-widest text-slate-500 transition-colors hover:text-ember-300"
          >
            苏ICP备08105700号-3
          </a>
        </footer>
      </div>
    </main>
  )
}
