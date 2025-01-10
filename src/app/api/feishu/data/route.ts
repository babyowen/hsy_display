import { Client } from '@larksuiteoapi/node-sdk'
import type { FeishuResponse } from '@/lib/types'

// 创建一个简单的内存缓存
let cache: {
  data: FeishuResponse | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// 缓存有效期（5分钟）
const CACHE_TTL = 5 * 60 * 1000;

// 创建一个函数来初始化客户端
function createClient() {
  return new Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    disableTokenCache: false,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      trace: () => {}
    }
  });
}

// 定义一个类型来表示处理后的数据
type ProcessedDataMap = {
  [key: string]: FeishuResponse['data']['items'][0]
}

export async function GET() {
  try {
    // 检查缓存是否有效
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
      // 只在剩余时间大于4分钟或小于1分钟时输出日志
      const remainingSeconds = Math.round((CACHE_TTL - (now - cache.timestamp)) / 1000);
      if (remainingSeconds > 240 || remainingSeconds < 60) {
        console.log('\n使用缓存数据，剩余有效期：', remainingSeconds, '秒');
      }
      return new Response(JSON.stringify({ data: cache.data }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, must-revalidate',
          'Expires': '0',
        },
      });
    }

    // 1. 开始请求
    console.log('\n==========================================')
    console.log('🌟 新的数据请求开始 🌟')
    console.log('时间:', new Date().toLocaleString('zh-CN'))
    console.log('==========================================\n')
    
    // 2. 初始化客户端
    const client = createClient();
    console.log('✅ 客户端初始化完成')

    // 3. 构建并执行预测数据查询
    console.log('\n=== 📈 预测数据处理 ===')
    console.log('1️⃣ 构建查询参数...')
    const requestParams = {
      path: {
        app_token: process.env.FEISHU_APP_TOKEN!,
        table_id: process.env.TABLE_ID!,
      },
      data: {
        view_id: process.env.VIEW_ID,
        page_size: 100,
        field_names: ['datetime', 'type', 'hsysz', 'hsypj', 'qrjsz', 'kqzl', 'updatetime'],
        filter: {
          conjunction: 'or' as const,
          conditions: [
            {
              field_name: 'datetime',
              operator: 'is' as const,
              value: ['Today']
            },
            {
              field_name: 'datetime',
              operator: 'is' as const,
              value: ['Tomorrow']
            }
          ]
        },
        sort: [
          {
            field_name: 'datetime',
            order: 'asc' as const
          }
        ]
      }
    };
    console.log('预测数据查询参数:', {
      数据范围: '今天和明天',
      过滤条件: requestParams.data.filter,
      排序方式: '按时间升序',
      每页数量: requestParams.data.page_size
    });

    console.log('\n2️⃣ 执行数据查询...')
    const response = await client.bitable.appTableRecord.search(requestParams) as FeishuResponse;
    console.log('✅ 数据查询完成')

    // 4. 处理预测数据
    if (response.data?.items) {
      console.log('\n3️⃣ 处理查询结果...')
      console.log('原始数据统计:', {
        总记录数: response.data.items.length,
        今天记录: response.data.items.filter(item => 
          new Date(item.fields.datetime).toDateString() === new Date().toDateString()
        ).length,
        明天记录: response.data.items.filter(item => 
          new Date(item.fields.datetime).toDateString() === new Date(Date.now() + 86400000).toDateString()
        ).length
      });
      console.log('✅ 原始数据处理完成')

      // 5. 数据去重
      console.log('\n4️⃣ 数据去重处理...')
      const processedData = response.data.items.reduce<ProcessedDataMap>((acc, item) => {
        const key = `${item.fields.datetime}_${item.fields.type}`
        if (!acc[key] || new Date(acc[key].fields.updatetime).getTime() < new Date(item.fields.updatetime).getTime()) {
          acc[key] = item
        }
        return acc
      }, {});

      const deduplicatedItems = Object.values(processedData);
      console.log('去重结果:', {
        去重前记录数: response.data.items.length,
        去重后记录数: deduplicatedItems.length,
        重复数据数量: response.data.items.length - deduplicatedItems.length
      });
      console.log('✅ 数据去重完成')

      // 6. 输出最终的预测数据结果
      console.log('\n5️⃣ 预测数据最终结果...')
      
      // 使用类型谓词进行过滤
      const filteredItems = deduplicatedItems.filter((item): item is FeishuResponse['data']['items'][0] => {
        return item.fields.type === '日出' || item.fields.type === '日落';
      });

      // 过滤掉已过期的数据
      const now = new Date();
      const validItems = filteredItems.filter(item => {
        const itemDate = new Date(item.fields.datetime);
        return itemDate > now;
      });

      console.log('\n数据处理详细统计:');
      console.log('1. 原始数据统计:');
      console.log(`   • 日出记录数: ${filteredItems.filter(item => item.fields.type === '日出').length}`);
      console.log(`   • 日落记录数: ${filteredItems.filter(item => item.fields.type === '日落').length}`);
      console.log('   • 具体数据:');
      filteredItems.forEach(item => {
        const date = new Date(item.fields.datetime);
        console.log(`     - ${date.toLocaleString('zh-CN')} | ${item.fields.type}`);
      });

      console.log('\n2. 有效数据统计 (过滤掉已过期数据):');
      console.log(`   • 日出记录数: ${validItems.filter(item => item.fields.type === '日出').length}`);
      console.log(`   • 日落记录数: ${validItems.filter(item => item.fields.type === '日落').length}`);
      console.log('   • 具体数据:');
      validItems.forEach(item => {
        const date = new Date(item.fields.datetime);
        console.log(`     - ${date.toLocaleString('zh-CN')} | ${item.fields.type}`);
      });

      console.log('✅ 预测数据处理完成')
    }

    // 在返回响应前更新缓存
    cache = {
      data: response,
      timestamp: now
    };

    return new Response(JSON.stringify({ data: response }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    console.error('\n❌ 处理失败:', {
      步骤: '数据查询',
      错误类型: error instanceof Error ? error.name : '未知错误',
      错误信息: error instanceof Error ? error.message : String(error),
      详细信息: (error as { response?: { data: unknown } })?.response?.data || '无详细信息'
    });
    
    return new Response(
      JSON.stringify({ 
        error: '获取数据失败',
        details: error instanceof Error ? error.message : String(error)
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, must-revalidate',
          'Expires': '0',
        },
      }
    );
  } finally {
    console.log('\n==========================================')
    console.log('🏁 请求处理结束 🏁')
    console.log('==========================================\n')
  }
} 