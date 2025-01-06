'use client'
import React from 'react'
import { fetcher } from '@/lib/utils'
import useSWR from 'swr'
import { FeishuResponse, ProcessedData } from '@/types/feishu'

const DataTable: React.FC = () => {
  console.log('1. 组件初始化');
  const { data: response, error } = useSWR<FeishuResponse>('/api/feishu/data', fetcher)
  
  console.log('2. API响应状态:', {
    hasData: !!response,
    hasError: !!error,
    errorMessage: error?.message
  });

  if (error) {
    console.error('3. 数据加载失败:', error);
    return <div className="text-red-500">加载失败</div>
  }

  if (!response) {
    console.log('3. 数据加载中...');
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>
    )
  }
  
  console.log('3. 数据加载成功，开始处理数据');
  
  // 筛选本周数据
  const items = response?.data?.data?.items || [];
  console.log('4. 原始数据条数:', items.length);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  console.log('5. 设置时间范围:', {
    当前时间: now.toLocaleString(),
    本周开始: startOfWeek.toLocaleString(),
    本周结束: endOfWeek.toLocaleString()
  });

  // 筛选本周数据
  const thisWeekItems = items.filter(item => {
    const itemDate = new Date(Number(item.fields.datetime));
    const isThisWeek = itemDate >= startOfWeek && itemDate < endOfWeek;
    console.log('6. 处理数据项:', {
      日期: itemDate.toLocaleString(),
      是否本周: isThisWeek,
      类型: item.fields.type
    });
    return isThisWeek;
  });

  console.log('7. 本周数据条数:', thisWeekItems.length);

  // 处理数据：按时间和类型分组，只保留每组最新的数据
  const processData = (items: typeof thisWeekItems): ProcessedData[] => {
    if (!items?.length) return [];
    
    console.log('8. 开始数据去重处理');
    const uniqueMap = new Map<string, ProcessedData>();
    
    items.forEach(item => {
      const itemDate = new Date(Number(item.fields.datetime));
      const key = `${itemDate.toDateString()}-${item.fields.type}`;
      
      const processedItem: ProcessedData = {
        record_id: item.record_id,
        datetime: Number(item.fields.datetime),
        type: item.fields.type,
        hsysz: Number(item.fields.hsysz) || 0,
        hsypj: Array.isArray(item.fields.hsypj) ? item.fields.hsypj[0]?.text || '无评价' : String(item.fields.hsypj),
        qrjsz: Number(item.fields.qrjsz) || 0,
        kqzl: Array.isArray(item.fields.kqzl) ? item.fields.kqzl[0]?.text || '无评价' : String(item.fields.kqzl),
        updatetime: Number(item.fields.updatetime)
      };
      
      const existingItem = uniqueMap.get(key);
      if (!existingItem || existingItem.updatetime < processedItem.updatetime) {
        console.log('9. 更新数据:', {
          key,
          更新原因: existingItem ? '发现更新的数据' : '新数据',
          更新时间: new Date(processedItem.updatetime).toLocaleString()
        });
        uniqueMap.set(key, processedItem);
      }
    });

    // 转换为数组并按时间降序排序
    const result = Array.from(uniqueMap.values())
      .sort((a, b) => b.datetime - a.datetime);
    
    console.log('10. 数据处理完成:', {
      去重后数据条数: result.length,
      数据预览: result.slice(0, 2)  // 只显示前两条数据预览
    });

    return result;
  };

  const sortedData = processData(thisWeekItems);

  // 如果没有数据，显示提示信息
  if (sortedData.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">本周数据</h2>
        <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
          暂无本周数据
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