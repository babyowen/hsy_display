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
  const { data: response, error } = useSWR<FeishuResponse>('/api/feishu/data', fetcher)
  
  // 添加调试日志
  console.log('Response:', response);
  console.log('Error:', error);

  if (error) {
    console.error('Feishu API Error:', error);
    return <div className="text-red-500">加载失败: {error.toString()}</div>
  }

  if (!response?.data?.data?.items) {
    console.log('No data in response:', response);
    return (
      <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
        暂无数据 (Response: {JSON.stringify(response)})
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
    console.log('Raw datetime:', {
      datetime: item.fields.datetime,
      type: typeof item.fields.datetime,
      sample: new Date(item.fields.datetime).toLocaleString()
    });
    
    const key = `${item.fields.datetime}_${item.fields.type}`
    if (!acc[key] || acc[key].updatetime < item.fields.updatetime) {
      acc[key] = {
        datetime: item.fields.datetime,  // 保持原始格式
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
      const now = Date.now();
      console.log('Comparing times:', {
        itemTime: item.datetime,
        nowTime: now,
        itemDate: new Date(item.datetime).toLocaleString(),
        nowDate: new Date(now).toLocaleString()
      });
      return item.datetime > now;
    })
    .sort((a, b) => a.datetime - b.datetime)

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