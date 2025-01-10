'use client'
import React, { useEffect } from 'react'
import { SunMedium, Sunrise, Sunset, CloudSun, Wind } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
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

// 获取火烧云指数的颜色
function getHsyszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-red-500'
  if (numValue > 0.2) return 'text-green-500'
  return 'text-gray-400'
}

// 获取气溶胶指数的颜色
function getQrjszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-black'
  if (numValue > 0.4) return 'text-purple-500'
  if (numValue > 0.2) return 'text-green-500'
  return 'text-green-400'
}

export default function LatestData() {
  const { data: response, error, mutate } = useSWR<{
    data: FeishuResponse
  }>('/api/feishu/data', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    revalidateOnFocus: true, // 当用户重新关注页面时重新验证
  })

  // 添加日期变更检查
  useEffect(() => {
    // 获取当前时间
    const now = new Date()
    // 计算到明天0点的毫秒数
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    // 设置定时器，在日期变更时刷新数据
    const timer = setTimeout(() => {
      console.log('日期已变更，刷新数据...')
      mutate() // 强制刷新数据
    }, msUntilTomorrow)

    // 清理定时器
    return () => clearTimeout(timer)
  }, [mutate])

  if (error) return <div className="text-red-500">加载失败</div>
  if (!response) return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-200 rounded-full" />
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="animate-fade-in-out text-gray-400 ml-2">
          加载中...
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
          >
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!response.data?.data?.items || response.data.data.items.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
        暂无数据
      </div>
    )
  }

  // 处理数据：按时间和类型分组，只保留每组最新的数据
  const processedData = response.data.data.items.reduce((acc: { [key: string]: ProcessedData }, item: FeishuResponse['data']['items'][0]) => {
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

  // 转换为数组并按时间排序
  const sortedData = (Object.values(processedData) as ProcessedData[])
    .filter(item => item.datetime > Date.now()) // 只保留未来的数据
    .sort((a, b) => a.datetime - b.datetime)

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2">
        <CloudSun className="w-7 h-7 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">近日预测</h2>
      </div>
      <div className={`
        grid gap-4 w-full
        ${sortedData.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : ''}
        ${sortedData.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : ''}
        ${sortedData.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto' : ''}
        ${sortedData.length >= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full' : ''}
      `}>
        {sortedData.map((item: ProcessedData) => (
          <div 
            key={`${item.datetime}_${item.type}`}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 
              hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200 
              transition-all duration-300 ease-in-out 
              cursor-pointer
              w-full"
          >
            {/* 事件时间显示 */}
            <div className="mb-6">
              <div className="text-sm text-gray-500">事件时间</div>
              <div className="text-lg font-medium text-gray-800 flex items-center">
                {new Date(item.datetime).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-sm">
                  {item.type === '日出' ? (
                    <Sunrise className="w-4 h-4 mr-1" />
                  ) : (
                    <Sunset className="w-4 h-4 mr-1" />
                  )}
                  {item.type}
                </span>
              </div>
            </div>

            {/* 主要数据显示 */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-base font-semibold text-gray-700 mb-3 flex items-center justify-center">
                  <SunMedium className="w-5 h-5 mr-1 text-orange-400" />
                  火烧云指数
                </div>
                <div className={`text-5xl font-medium tracking-tight ${getHsyszColor(item.hsysz)}`}>
                  {item.hsysz}
                </div>
                <div className={`text-sm mt-2 ${getHsyszColor(item.hsysz)}`}>
                  {item.hsypj}
                </div>
              </div>

              <div className="text-center">
                <div className="text-base font-semibold text-gray-700 mb-3 flex items-center justify-center">
                  <Wind className="w-5 h-5 mr-1 text-blue-400" />
                  气溶胶指数
                </div>
                <div className={`text-5xl font-medium tracking-tight ${getQrjszColor(item.qrjsz)}`}>
                  {item.qrjsz}
                </div>
                <div className={`text-sm mt-2 ${getQrjszColor(item.qrjsz)}`}>
                  {item.kqzl}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 