'use client'
import React from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
import { SunMedium, Sunrise, Sunset, CloudSun, Wind } from 'lucide-react'

interface ProcessedData {
  datetime: number
  type: string
  hsysz: number
  hsypj: string
  qrjsz: number
  kqzl: string
  updatetime: number
}

// 获取火烧云指数的颜色
function getHsyszColor(value: number): string {
  if (value > 0.8) return 'text-red-500'
  if (value > 0.2) return 'text-green-500'
  return 'text-gray-400'
}

// 获取气溶胶指数的颜色
function getQrjszColor(value: number): string {
  if (value > 0.8) return 'text-black'
  if (value > 0.4) return 'text-purple-500'
  if (value > 0.2) return 'text-green-500'
  return 'text-green-400'
}

// 为 any 类型添加具体的接口定义
interface SunsetDataType {
  // 添加你的数据类型定义
  id: string;
  // ... 其他字段
}

// 修改接口定义，使 data 属性可选
interface Props {
  data?: SunsetDataType[];
}

// 添加响应类型
interface FeishuResponse {
  data: {
    data: {
      items: any[] // 或者定义更具体的类型
    }
  }
}

// 修改组件中的 any 类型
const LatestData: React.FC<Props> = ({ data = [] }) => {
  const { data: response, error, isLoading } = useSWR<FeishuResponse>('/api/feishu/data', fetcher)
  
  // 添加详细的调试日志
  console.log('Response:', JSON.stringify(response, null, 2));
  console.log('Error:', error);
  console.log('Loading:', isLoading);

  if (error) {
    console.error('Feishu API Error:', error);
    return <div className="text-red-500">加载失败: {error.toString()}</div>
  }

  // 显示加载状态
  if (isLoading || !response) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-200 rounded-full" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="animate-fade-in-out text-gray-400 ml-2">
            正在读取...
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
  }

  if (!response?.data?.data?.items) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
        暂无数据
      </div>
    )
  }

  // 获取最新的更新时间
  const getLatestUpdateTime = (data: ProcessedData[]) => {
    if (data.length === 0) return null
    const latestTime = Math.max(...data.map(item => item.updatetime))
    return new Date(latestTime).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  // 处理数据：按时间和类型分组，只保留每组最新的数据
  const processedData = response.data.data.items.reduce((acc: { [key: string]: ProcessedData }, item: any) => {
    console.log('Processing item:', JSON.stringify({
      datetime: item.fields.datetime,
      humanReadable: new Date(item.fields.datetime).toLocaleString(),
      now: new Date().toLocaleString(),
      type: item.fields.type
    }, null, 2));
    
    const key = `${item.fields.datetime}_${item.fields.type}`
    if (!acc[key] || acc[key].updatetime < item.fields.updatetime) {
      acc[key] = {
        datetime: Number(item.fields.datetime), // 确保是数字类型
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
  const sortedData = (Object.values(processedData) as Array<ProcessedData>)
    .filter(item => {
      const itemDate = new Date(item.datetime);
      const now = new Date();
      
      // 比较完整的时间戳，而不是只比较日期
      console.log('Comparing times:', JSON.stringify({
        itemDateTime: itemDate.toLocaleString(),
        nowDateTime: now.toLocaleString(),
        isInFuture: itemDate > now
      }, null, 2));
      
      // 只显示未来的时间
      return itemDate > now;
    })
    .sort((a, b) => {
      // 先按日期排序，再按类型排序（日出在前，日落在后）
      const dateCompare = a.datetime - b.datetime;
      if (dateCompare === 0) {
        return a.type === '日出' ? -1 : 1;
      }
      return dateCompare;
    });

  const latestUpdateTime = getLatestUpdateTime(sortedData)

  // 修改这部分：根据数据条数动态设置网格列数
  const getGridCols = (count: number) => {
    switch(count) {
      case 1:
        return 'md:grid-cols-1'
      case 2:
        return 'md:grid-cols-2'
      case 3:
        return 'md:grid-cols-3'
      default:
        return 'md:grid-cols-4'
    }
  }

  // 使用新的 gridCols 逻辑
  const gridCols = getGridCols(sortedData.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CloudSun className="w-7 h-7 text-blue-500" />
        <h2 className="text-2xl font-semibold text-gray-800">近日预测</h2>
        {latestUpdateTime && (
          <span className="text-sm text-gray-500 ml-2">
            (更新于 {latestUpdateTime})
          </span>
        )}
      </div>
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {sortedData.map((item) => (
          <div 
            key={`${item.datetime}_${item.type}`}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 
              hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200 
              transition-all duration-300 ease-in-out 
              cursor-pointer"
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
                <div className={`text-5xl font-bold tracking-tight ${getHsyszColor(item.hsysz)}`}>
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
                <div className={`text-5xl font-bold tracking-tight ${getQrjszColor(item.qrjsz)}`}>
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

export default LatestData 