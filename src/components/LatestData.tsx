'use client'
import React from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils'
import { SunMedium, Sunrise, Sunset, CloudSun, Wind } from 'lucide-react'

// 添加 formatDate 函数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 添加 LoadingState 组件
const LoadingState = () => (
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
);

// 添加 ErrorState 组件
const ErrorState = () => (
  <div className="p-4 bg-red-50 text-red-600 rounded-lg">
    数据加载失败，请稍后重试
  </div>
);

// 添加 DataCard 组件
const DataCard = ({ data }: { data: any }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 
    hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200 
    transition-all duration-300 ease-in-out 
    cursor-pointer
    h-full flex flex-col"
  >
    {/* 事件时间显示 */}
    <div className="mb-4 flex-shrink-0">
      <div className="text-sm text-gray-500">事件时间</div>
      <div className="text-lg font-medium text-gray-800 flex items-center">
        {data.humanReadable}
        <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-sm">
          {data.fields.type === '日出' ? (
            <Sunrise className="w-4 h-4 mr-1" />
          ) : (
            <Sunset className="w-4 h-4 mr-1" />
          )}
          {data.fields.type}
        </span>
      </div>
    </div>

    {/* 主要数据显示 */}
    <div className="flex-grow flex flex-col justify-between space-y-4">
      <div className="text-center">
        <div className="text-base font-semibold text-gray-700 mb-2 flex items-center justify-center">
          <SunMedium className="w-5 h-5 mr-1 text-orange-400" />
          火烧云指数
        </div>
        <div className={`text-4xl font-bold tracking-tight ${getHsyszColor(data.fields.hsysz)}`}>
          {data.fields.hsysz}
        </div>
        <div className={`text-sm mt-1 ${getHsyszColor(data.fields.hsysz)}`}>
          {Array.isArray(data.fields.hsypj) ? data.fields.hsypj[0]?.text : data.fields.hsypj}
        </div>
      </div>

      <div className="text-center">
        <div className="text-base font-semibold text-gray-700 mb-2 flex items-center justify-center">
          <Wind className="w-5 h-5 mr-1 text-blue-400" />
          气溶胶指数
        </div>
        <div className={`text-4xl font-bold tracking-tight ${getQrjszColor(data.fields.qrjsz)}`}>
          {data.fields.qrjsz}
        </div>
        <div className={`text-sm mt-1 ${getQrjszColor(data.fields.qrjsz)}`}>
          {Array.isArray(data.fields.kqzl) ? data.fields.kqzl[0]?.text : data.fields.kqzl}
        </div>
      </div>
    </div>
  </div>
);

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
      items: Array<{
        fields: {
          datetime: string;
          type: string;
          hsysz: number;
          hsypj: Array<{ text: string }>;
          qrjsz: number;
          kqzl: Array<{ text: string }>;
          updatetime: number;
        };
      }>;
    };
  };
}

// 在组件顶部添加一个获取最新更新时间的函数
const getLatestUpdateTime = (items: any[]): string => {
  if (!items?.length) return '';
  
  const latestTime = Math.max(...items.map(item => item.fields.updatetime));
  return formatDate(new Date(latestTime).toString());
};

// 修改组件中的 any 类型
export default function LatestData() {
  const { data: response, error } = useSWR<FeishuResponse>('/api/feishu/data', fetcher);

  // 添加更详细的 API 响应调试
  console.log('API Response 详细信息:', {
    hasData: !!response,
    error: error,
    responseData: response,
    dataStructure: {
      hasDataProperty: !!response?.data,
      hasNestedData: !!response?.data?.data,
      hasItems: !!response?.data?.data?.items,
      rawResponse: response
    }
  });

  // 添加错误处理
  if (error) {
    console.error('Data fetching error:', error);
    return (
      <div className="p-4 text-red-500">
        加载失败: {error.message}
      </div>
    );
  }

  // 添加加载状态
  if (!response) {
    return <LoadingState />;
  }

  const items = response?.data?.data?.items || [];
  console.log('数据解析:', {
    responseData: response,
    dataField: response?.data,
    nestedData: response?.data?.data,
    items: items,
    itemsLength: items.length
  });
  
  const now = new Date();
  const today = now.getDay(); // 0是周日，1-6是周一到周六

  // 如果是周日，向前推一周
  const thisWeekStart = new Date(now);
  if (today === 0) {
    thisWeekStart.setDate(now.getDate() - 6); // 回到上周一
  } else {
    thisWeekStart.setDate(now.getDate() - today + 1); // 回到本周一
  }
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisWeekEnd = new Date(now);
  if (today === 0) {
    thisWeekEnd.setHours(23, 59, 59, 999); // 今天就是周日，设为今天结束
  } else {
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // 设为本周日
    thisWeekEnd.setHours(23, 59, 59, 999);
  }

  console.log('时间范围设置:', {
    当前时间: now.toLocaleString(),
    本周开始: thisWeekStart.toLocaleString(),
    本周结束: thisWeekEnd.toLocaleString()
  });

  // 1. 分别处理本周和下周数据
  const currentWeekData = items.filter(item => {
    const itemDate = new Date(Number(item.fields.datetime));
    return itemDate >= thisWeekStart && itemDate <= thisWeekEnd;
  });

  const nextWeekStart = new Date(thisWeekEnd);
  nextWeekStart.setDate(nextWeekStart.getDate() + 1);
  nextWeekStart.setHours(0, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);

  const nextWeekData = items.filter(item => {
    const itemDate = new Date(Number(item.fields.datetime));
    return itemDate > thisWeekEnd && itemDate <= nextWeekEnd;
  });

  console.log('数据分类:', {
    本周数据: {
      时间范围: `${thisWeekStart.toLocaleString()} - ${thisWeekEnd.toLocaleString()}`,
      数据条数: currentWeekData.length,
      示例: currentWeekData.slice(0, 2).map(item => ({
        日期: new Date(Number(item.fields.datetime)).toLocaleString(),
        类型: item.fields.type
      }))
    },
    下周数据: {
      时间范围: `${nextWeekStart.toLocaleString()} - ${nextWeekEnd.toLocaleString()}`,
      数据条数: nextWeekData.length,
      示例: nextWeekData.slice(0, 2).map(item => ({
        日期: new Date(Number(item.fields.datetime)).toLocaleString(),
        类型: item.fields.type
      }))
    }
  });

  // 2. 合并数据
  const combinedData = [...currentWeekData, ...nextWeekData];
  console.log('合并数据:', {
    总条数: combinedData.length,
    示例: combinedData.slice(0, 2).map(item => ({
      日期: new Date(Number(item.fields.datetime)).toLocaleString(),
      类型: item.fields.type
    }))
  });

  // 3. 数据去重（按日期和类型，保留最新更新时间的记录）
  const uniqueEventsMap = new Map();
  combinedData.forEach(item => {
    const key = `${new Date(Number(item.fields.datetime)).toDateString()}-${item.fields.type}`;
    const existingItem = uniqueEventsMap.get(key);
    
    if (!existingItem || Number(item.fields.updatetime) > Number(existingItem.fields.updatetime)) {
      uniqueEventsMap.set(key, item);
      console.log('更新数据:', {
        key,
        更新原因: existingItem ? '发现更新的数据' : '新数据',
        更新时间: new Date(Number(item.fields.updatetime)).toLocaleString()
      });
    }
  });

  // 4. 转换为数组并排序
  const sortedItems = Array.from(uniqueEventsMap.values())
    .sort((a, b) => {
      const dateA = new Date(Number(a.fields.datetime));
      const dateB = new Date(Number(b.fields.datetime));
      // 如果是同一天，日出排在日落前面
      if (dateA.toDateString() === dateB.toDateString()) {
        return a.fields.type === '日出' ? -1 : 1;
      }
      return dateA.getTime() - dateB.getTime();
    });

  // 5. 分离历史和未来数据（使用之前定义的 now）
  const futureItems = sortedItems
    .filter(item => new Date(Number(item.fields.datetime)) > now)
    .slice(0, 4);  // 只显示未来4条数据

  console.log('最终数据:', {
    总条数: sortedItems.length,
    未来数据条数: futureItems.length,
    示例: futureItems.map(item => ({
      日期: new Date(Number(item.fields.datetime)).toLocaleString(),
      类型: item.fields.type,
      更新时间: new Date(Number(item.fields.updatetime)).toLocaleString()
    }))
  });

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* 修改标题栏布局 */}
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-2">
          <CloudSun className="w-7 h-7 text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-800">近日预测</h2>
        </div>
        {futureItems.length > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            最后更新: {getLatestUpdateTime(items)}
          </span>
        )}
      </div>

      {/* 修改卡片容器布局 */}
      <div className={`grid gap-4 ${
        futureItems.length === 1 ? 'grid-cols-1' :
        futureItems.length === 2 ? 'grid-cols-2' :
        futureItems.length === 3 ? 'grid-cols-3' :
        'grid-cols-4'
      }`}>
        {futureItems.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            暂无预测数据
          </div>
        ) : (
          futureItems.map((item, index) => (
            <div 
              key={`${item.fields.datetime}-${item.fields.type}-${index}`} 
              className="w-full"
            >
              <DataCard data={{
                ...item,
                humanReadable: formatDate(new Date(Number(item.fields.datetime)).toString())
              }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 