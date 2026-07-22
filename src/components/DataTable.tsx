'use client'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { History, Sunrise, Sunset } from 'lucide-react'
import { getHsyszColor, getQrjszColor } from '@/lib/colors'
import type { FeishuResponse } from '@/lib/types'

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

  // 转换为数组并按时间排序
  const tableData = Object.values(processedData)
    .sort((a: ProcessedDataItem, b: ProcessedDataItem) => b.datetime - a.datetime)  // 历史数据按时间倒序排列

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <History className="h-6 w-6 text-ember-400" />
        <h2 className="text-2xl font-semibold tracking-wider text-white">{title}</h2>
        <span className="font-mono-num text-xs tracking-wider text-slate-500">
          {tableData.length} 条记录
        </span>
      </div>
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th className="w-[15%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">时间</th>
                <th className="w-[10%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">类型</th>
                <th className="w-[15%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">火烧云指数</th>
                <th className="w-[25%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">火烧云评价</th>
                <th className="w-[15%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">气溶胶指数</th>
                <th className="w-[20%] px-4 py-3.5 text-center font-mono-num text-xs font-medium uppercase tracking-[0.2em] text-slate-400">空气质量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tableData.map((item: ProcessedDataItem, index: number) => (
                <tr
                  key={index}
                  className="transition-colors duration-200 hover:bg-ember-500/5"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-center font-mono-num text-sm tracking-wider text-slate-300">
                    {format(item.datetime, 'MM-dd HH:mm', { locale: zhCN })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                      item.type === '日出'
                        ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                        : 'border-rose-400/40 bg-rose-400/10 text-rose-300'
                    }`}>
                      {item.type === '日出' ? (
                        <Sunrise className="h-3 w-3" />
                      ) : (
                        <Sunset className="h-3 w-3" />
                      )}
                      {item.type}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-center font-mono-num text-sm font-semibold ${getHsyszColor(item.hsysz)}`}>
                    {item.hsysz}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-center text-sm ${getHsyszColor(item.hsysz)}`}>
                    {item.hsypj}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-center font-mono-num text-sm font-semibold ${getQrjszColor(item.qrjsz)}`}>
                    {item.qrjsz}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-center text-sm ${getQrjszColor(item.qrjsz)}`}>
                    {item.kqzl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
