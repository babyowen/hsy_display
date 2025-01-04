'use client'
import React from 'react'
import { fetcher } from '@/lib/utils'
import useSWR from 'swr'

interface HistoryData {
  record_id: string;
  datetime: number;
  type: string;
  hsysz: number;
  hsypj: string;
  qrjsz: number;
  kqzl: string;
  updatetime: number;
}

interface DataItem {
  id: string;
}

interface Props {
  data?: DataItem[];
}

interface FeishuResponse {
  data: {
    data: {
      items: any[]
    }
  }
}

const DataTable: React.FC<Props> = ({ data = [] }) => {
  const { data: response, error } = useSWR<FeishuResponse>('/api/feishu/history', fetcher)
  
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
  const processData = (items: any[]) => {
    if (!items?.length) return [];
    
    const now = new Date();
    
    // 使用 Map 按时间和类型去重，保留最新的记录
    const uniqueMap = new Map();
    
    items.forEach(item => {
      const key = `${item.fields.datetime}-${item.fields.type}`;
      const itemDate = new Date(item.fields.datetime);
      
      // 只处理历史数据
      if (itemDate > now) {
        return;
      }
      
      const existingItem = uniqueMap.get(key);
      if (!existingItem || existingItem.fields.updatetime < item.fields.updatetime) {
        uniqueMap.set(key, item);
      }
    });

    // 转换为数组并排序
    return Array.from(uniqueMap.values())
      .map(item => ({
        record_id: item.record_id, // 添加 record_id
        datetime: item.fields.datetime,
        type: item.fields.type,
        hsysz: parseFloat(item.fields.hsysz) || 0,
        hsypj: item.fields.hsypj[0]?.text || '无评价',
        qrjsz: parseFloat(item.fields.qrjsz) || 0,
        kqzl: item.fields.kqzl[0]?.text || '无评价',
        updatetime: item.fields.updatetime
      }))
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  };

  const sortedData = processData(response.data.data.items);

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
            {sortedData.map((item, index) => (
              <tr 
                key={`${item.record_id || index}`} 
                className="hover:bg-gray-50"
              >
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

export default DataTable 