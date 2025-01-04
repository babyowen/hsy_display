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
          {data.type === '日出' ? (
            <Sunrise className="w-4 h-4 mr-1" />
          ) : (
            <Sunset className="w-4 h-4 mr-1" />
          )}
          {data.type}
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
        <div className={`text-4xl font-bold tracking-tight ${getHsyszColor(data.hsysz)}`}>
          {data.hsysz}
        </div>
        <div className={`text-sm mt-1 ${getHsyszColor(data.hsysz)}`}>
          {data.hsypj}
        </div>
      </div>

      <div className="text-center">
        <div className="text-base font-semibold text-gray-700 mb-2 flex items-center justify-center">
          <Wind className="w-5 h-5 mr-1 text-blue-400" />
          气溶胶指数
        </div>
        <div className={`text-4xl font-bold tracking-tight ${getQrjszColor(data.qrjsz)}`}>
          {data.qrjsz}
        </div>
        <div className={`text-sm mt-1 ${getQrjszColor(data.qrjsz)}`}>
          {data.kqzl}
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
const LatestData: React.FC<Props> = ({ data = [] }) => {
  // 改用 history 接口
  const { data: response, error, isLoading } = useSWR<FeishuResponse>('/api/feishu/history', fetcher);
  
  console.log('Raw API Response:', JSON.stringify(response, null, 2));

  const processAndDeduplicateData = (items: any[]) => {
    if (!items?.length) {
      console.log('No items to process');
      return [];
    }
    
    const now = new Date();
    console.log('Processing data at:', now.toISOString());
    
    // 使用Map按datetime和type去重，保留最新的updatetime
    const uniqueMap = new Map();
    
    items.forEach(item => {
      try {
        if (!item.fields) {
          console.log('Invalid item structure:', item);
          return;
        }

        const key = `${item.fields.datetime}-${item.fields.type}`;
        const existingItem = uniqueMap.get(key);
        const itemDate = new Date(item.fields.datetime);
        
        // 只处理未来的数据
        if (itemDate <= now) {
          return;
        }
        
        console.log('Processing future item:', {
          key,
          datetime: item.fields.datetime,
          parsedDate: itemDate.toISOString(),
          type: item.fields.type,
          updatetime: item.fields.updatetime,
          hsysz: item.fields.hsysz,
          qrjsz: item.fields.qrjsz
        });
        
        if (!existingItem || existingItem.fields.updatetime < item.fields.updatetime) {
          uniqueMap.set(key, item);
        }
      } catch (error) {
        console.error('Error processing item:', error, item);
      }
    });

    // 转换为数组
    const processedItems = Array.from(uniqueMap.values())
      .map(item => {
        const itemDate = new Date(item.fields.datetime);
        
        return {
          datetime: item.fields.datetime,
          type: item.fields.type,
          hsysz: parseFloat(item.fields.hsysz) || 0,
          hsypj: item.fields.hsypj?.[0]?.text || '',
          qrjsz: parseFloat(item.fields.qrjsz) || 0,
          kqzl: item.fields.kqzl?.[0]?.text || '',
          humanReadable: formatDate(itemDate.toString()),
          now: formatDate(now.toString())
        };
      })
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    console.log('Final processed items:', processedItems);
    return processedItems;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Error details:', error);
    return <ErrorState />;
  }

  const items = processAndDeduplicateData(response?.data?.data?.items || []);
  
  // 限制只显示最多4条未来的数据
  const futureItems = items.slice(0, 4);

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
            最后更新: {getLatestUpdateTime(response?.data?.data?.items || [])}
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
              key={`${item.datetime}-${item.type}-${index}`} 
              className="w-full"
            >
              <DataCard data={item} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LatestData 