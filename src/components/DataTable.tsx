'use client'
import { useState, useEffect } from 'react'
import { formatDate, fetcher } from '@/lib/utils'
import useSWR from 'swr'

interface HistoryData {
  datetime: number
  type: string
  hsysz: number
  hsypj: string
  qrjsz: number
  kqzl: string
  updatetime: number
}

export default function DataTable() {
  const { data: response, error } = useSWR<any>('/api/feishu/history', fetcher)
  
  if (error) return <div className="text-red-500">加载失败</div>
  if (!response) return (
    <div className="bg-white shadow-lg rounded-lg p-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded w-full" />
        ))}
      </div>
    </div>
  )
  
  // 处理数据：按时间和类型分组，只保留每组最新的数据
  const processedData = response.data.data.items.reduce((acc: { [key: string]: HistoryData }, item: any) => {
    const key = `${item.fields.datetime}_${item.fields.type}`
    if (!acc[key] || acc[key].updatetime < item.fields.updatetime) {
      acc[key] = {
        datetime: item.fields.datetime,
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

  // 转换为数组并按时间倒序排列，只显示过去的数据
  const sortedData = Object.values(processedData)
    .filter(item => item.datetime <= Date.now())
    .sort((a, b) => b.datetime - a.datetime)

  // 如果没有历史数据，显示提示信息
  if (sortedData.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">本周数据</h2>
        <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
          暂无历史数据
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">本周数据</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                火烧云指数
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                火烧云评价
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                气溶胶指数
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                空气质量
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr key={`${item.datetime}_${item.type}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.datetime).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`${
                    item.hsysz > 0.8 ? 'text-red-500' : 
                    item.hsysz > 0.2 ? 'text-green-500' : 
                    'text-gray-400'
                  }`}>
                    {item.hsysz}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`${
                    item.hsysz > 0.8 ? 'text-red-500' : 
                    item.hsysz > 0.2 ? 'text-green-500' : 
                    'text-gray-400'
                  }`}>
                    {item.hsypj}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`${
                    item.qrjsz > 0.8 ? 'text-black' :
                    item.qrjsz > 0.4 ? 'text-purple-500' :
                    item.qrjsz > 0.2 ? 'text-green-500' :
                    'text-green-400'
                  }`}>
                    {item.qrjsz}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`${
                    item.qrjsz > 0.8 ? 'text-black' :
                    item.qrjsz > 0.4 ? 'text-purple-500' :
                    item.qrjsz > 0.2 ? 'text-green-500' :
                    'text-green-400'
                  }`}>
                    {item.kqzl}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 