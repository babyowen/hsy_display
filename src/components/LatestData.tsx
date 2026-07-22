'use client'
import { useEffect } from 'react'
import { SunMedium, Sunrise, Sunset, Radar, Wind } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
import { getHsyszColor, getQrjszColor } from '@/lib/colors'
import type { FeishuResponse } from '@/lib/types'

interface ProcessedData {
  datetime: number
  type: string
  hsysz: string
  hsypj: string
  qrjsz: string
  kqzl: string
  updatetime: string
}

export default function LatestData() {
  const { data: response, error, mutate, isValidating } = useSWR<{
    data: {
      items: FeishuResponse['data']['items']
    }
  }>('/api/feishu/data', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0
  })

  // 只在组件挂载时获取一次数据
  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 添加空依赖数组，只在挂载时执行一次

  // 获取最新的更新时间
  const getLatestUpdateTime = (items: FeishuResponse['data']['items']) => {
    if (!items || items.length === 0) return null;
    return new Date(Math.max(...items.map(item => new Date(item.fields.updatetime).getTime())));
  };

  if (error) return (
    <div className="glass-panel rounded-xl p-4 text-sm text-red-400">
      加载失败，请稍后重试
    </div>
  )

  // 处理数据
  const processData = () => {
    if (!response?.data?.items) {
      return null;
    }

    const processedData = response.data.items.reduce((acc: { [key: string]: ProcessedData }, item: FeishuResponse['data']['items'][0]) => {
      const key = `${item.fields.datetime}_${item.fields.type}`

      if (!acc[key] || new Date(acc[key].updatetime).getTime() < new Date(item.fields.updatetime).getTime()) {
        acc[key] = {
          datetime: new Date(item.fields.datetime).getTime(),
          type: item.fields.type,
          hsysz: item.fields.hsysz,
          hsypj: item.fields.hsypj[0]?.text || '无评价',
          qrjsz: item.fields.qrjsz,
          kqzl: item.fields.kqzl[0]?.text || '无评价',
          updatetime: item.fields.updatetime
        }
      }
      return acc
    }, {})

    // 数据已经在服务器端过滤，这里只需要排序
    const sortedData = Object.values(processedData)
      .sort((a, b) => a.datetime - b.datetime);

    return sortedData;
  }

  const sortedData = processData();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Radar className="h-6 w-6 text-ember-400 animate-glow-pulse" />
          <h2 className="text-2xl font-semibold tracking-wider text-white">近日预测</h2>
          {response?.data?.items && (
            <span className="font-mono-num text-xs tracking-wider text-slate-400">
              数据更新 · {getLatestUpdateTime(response.data.items)?.toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
              })}
            </span>
          )}
        </div>
        {isValidating && (
          <div className="flex items-center gap-2 font-mono-num text-xs tracking-wider text-slate-400">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ember-400 border-t-transparent" />
            读取数据中...
          </div>
        )}
      </div>

      {!response ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="glass-panel animate-pulse rounded-2xl p-6"
            >
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-10 w-1/2 rounded bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-white/10" />
                  <div className="h-4 w-5/6 rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !sortedData || sortedData.length === 0 ? (
        <div className="glass-panel rounded-xl p-4 text-sm text-amber-300">
          暂无数据
        </div>
      ) : (
        <div className={`
          grid gap-4 w-full
          ${sortedData.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : ''}
          ${sortedData.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : ''}
          ${sortedData.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto' : ''}
          ${sortedData.length >= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full' : ''}
        `}>
          {sortedData.map((item: ProcessedData, index: number) => {
            const hsyszNum = parseFloat(item.hsysz)
            const qrjszNum = parseFloat(item.qrjsz)
            // 火烧云量表按 0-2.5 量程，气溶胶按 0-1 量程
            const hsyszPct = Number.isNaN(hsyszNum) ? 0 : Math.min(Math.max(hsyszNum / 2.5, 0), 1) * 100
            const qrjszPct = Number.isNaN(qrjszNum) ? 0 : Math.min(Math.max(qrjszNum, 0), 1) * 100
            return (
              <div
                key={`${item.datetime}_${item.type}`}
                className="glass-panel group animate-rise relative w-full overflow-hidden rounded-2xl p-6
                  transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:border-ember-500/40
                  hover:shadow-[0_24px_60px_-20px_rgba(255,107,74,0.35)]"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* 悬停时顶部亮起的火烧云渐变线 */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-ember-500/0 via-ember-500/80 to-ember-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* 事件时间显示 */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="font-mono-num text-lg tracking-wider text-slate-200">
                    {new Date(item.datetime).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${
                    item.type === '日出'
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                      : 'border-rose-400/40 bg-rose-400/10 text-rose-300'
                  }`}>
                    {item.type === '日出' ? (
                      <Sunrise className="h-3.5 w-3.5" />
                    ) : (
                      <Sunset className="h-3.5 w-3.5" />
                    )}
                    {item.type}
                  </span>
                </div>

                {/* 主要数据显示 */}
                <div className="space-y-7">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono-num text-[11px] uppercase tracking-[0.25em] text-slate-400">
                      <SunMedium className="h-4 w-4 text-ember-400" />
                      火烧云指数
                    </div>
                    <div className={`mt-2 font-mono-num text-6xl font-semibold tracking-tight ${getHsyszColor(item.hsysz)} drop-shadow-[0_0_18px_rgba(255,107,74,0.3)]`}>
                      {item.hsysz}
                    </div>
                    <div className={`mt-1.5 text-sm ${getHsyszColor(item.hsysz)}`}>
                      {item.hsypj}
                    </div>
                    {/* 火烧云量表 */}
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-ember-500 to-rose-500 transition-all duration-1000 ease-out"
                        style={{ width: `${hsyszPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono-num text-[11px] uppercase tracking-[0.25em] text-slate-400">
                      <Wind className="h-4 w-4 text-sky-400" />
                      气溶胶指数
                    </div>
                    <div className={`mt-2 font-mono-num text-6xl font-semibold tracking-tight ${getQrjszColor(item.qrjsz)}`}>
                      {item.qrjsz}
                    </div>
                    <div className={`mt-1.5 text-sm ${getQrjszColor(item.qrjsz)}`}>
                      {item.kqzl}
                    </div>
                    {/* 气溶胶量表 */}
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500 transition-all duration-1000 ease-out"
                        style={{ width: `${qrjszPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
