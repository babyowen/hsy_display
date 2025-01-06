'use client'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { History } from 'lucide-react'
import type { FeishuResponse } from '@/lib/types'

// 复用颜色判断函数
function getHsyszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-red-500'
  if (numValue > 0.2) return 'text-green-500'
  return 'text-gray-400'
}

function getQrjszColor(value: string): string {
  const numValue = parseFloat(value)
  if (numValue > 0.8) return 'text-black'
  if (numValue > 0.4) return 'text-purple-500'
  if (numValue > 0.2) return 'text-green-500'
  return 'text-green-400'
}

// 定义数据类型
interface ProcessedDataItem {
  datetime: number
  type: string
  hsysz: string
  hsypj: string
  qrjsz: string
  kqzl: string
  updatetime: string
}

interface DataTableProps {
  data: {
    data: {
      items: FeishuResponse['data']['items']
    }
  }
  title: string
}

export default function DataTable({ data, title }: DataTableProps) {
  // 数据去重
  const processedData = data.data.items.reduce<{ [key: string]: ProcessedDataItem }>((acc, item) => {
    const datetime = new Date(item.fields.datetime).getTime()
    const key = `${datetime}_${item.fields.type}`
    
    if (!acc[key] || new Date(acc[key].updatetime).getTime() < new Date(item.fields.updatetime).getTime()) {
      acc[key] = {
        datetime,
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
  const tableData = Object.values(processedData)
    .filter((item: ProcessedDataItem) => item.datetime < Date.now())
    .sort((a: ProcessedDataItem, b: ProcessedDataItem) => b.datetime - a.datetime)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History className="w-7 h-7 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">火烧云指数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">火烧云评价</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">气溶胶指数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">空气质量</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.map((item: ProcessedDataItem, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(item.datetime, 'MM-dd HH:mm', { locale: zhCN })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.type}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getHsyszColor(item.hsysz)}`}>
                  {item.hsysz}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getHsyszColor(item.hsysz)}`}>
                  {item.hsypj}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getQrjszColor(item.qrjsz)}`}>
                  {item.qrjsz}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getQrjszColor(item.qrjsz)}`}>
                  {item.kqzl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 