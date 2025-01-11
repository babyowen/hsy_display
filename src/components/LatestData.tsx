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
  const { data: response, error, mutate, isValidating } = useSWR<{
    data: {
      items: FeishuResponse['data']['items']
    }
  }>('/api/feishu/data', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
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

  if (error) return <div className="text-red-500">加载失败</div>

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

    const filteredData = Object.values(processedData)
      .filter(item => {
        return item.datetime > Date.now();
      })
      .sort((a, b) => a.datetime - b.datetime);

    return filteredData;
  }

  const sortedData = processData();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="w-7 h-7 text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-800">近日预测</h2>
          {response?.data?.items && (
            <span className="text-sm text-gray-500 ml-2">
              更新时间: {getLatestUpdateTime(response.data.items)?.toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}
            </span>
          )}
        </div>
        {isValidating && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            读取数据中...
          </div>
        )}
      </div>

      {!response ? (
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
      ) : !sortedData || sortedData.length === 0 ? (
        <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
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
      )}
    </div>
  )
} 