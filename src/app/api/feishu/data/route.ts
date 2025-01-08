import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'
import type { FeishuResponse } from '@/lib/types'

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

      // 7. 获取历史数据
      console.log('\n===📊 历史数据处理 ===')
      try {
        console.log('1️⃣ 构建历史查询参数...')
        const historyRequestParams = {
          path: {
            app_token: process.env.FEISHU_APP_TOKEN!,
            table_id: process.env.TABLE_ID!,
          },
          data: {
            view_id: process.env.VIEW_ID,
            page_size: 100,
            field_names: ['datetime', 'type', 'hsysz', 'hsypj', 'qrjsz', 'kqzl', 'updatetime'],
            filter: {
              conjunction: 'and' as const,
              conditions: [
                {
                  field_name: 'datetime',
                  operator: 'is' as const,
                  value: ['CurrentWeek']
                }
              ]
            },
            sort: [
              {
                field_name: 'datetime',
                order: 'desc' as const
              }
            ]
          }
        };

        console.log('历史数据查询参数:', {
          数据范围: '本周数据',
          过滤条件: '本周',
          排序方式: '按时间降序',
          每页数量: historyRequestParams.data.page_size
        });

        console.log('\n2️⃣ 执行历史数据查询...')
        const historyResponse = await client.bitable.appTableRecord.search(historyRequestParams) as FeishuResponse;
        console.log('✅ 历史数据查询完成')

        // 8. 处理历史数据
        if (historyResponse.data?.items) {
          console.log('\n3️⃣ 处理历史数据...')
          
          // 过滤掉今天的数据
          const today = new Date().toDateString();
          const historicalItems = historyResponse.data.items.filter(item => 
            new Date(item.fields.datetime).toDateString() !== today
          );
          
          console.log('过滤当天数据:', {
            查询总数: historyResponse.data.items.length,
            过滤后数量: historicalItems.length,
            已过滤数量: historyResponse.data.items.length - historicalItems.length
          });

          // 数据去重
          const processedHistoryData = historicalItems.reduce<ProcessedDataMap>((acc, item) => {
            const key = `${item.fields.datetime}_${item.fields.type}`
            if (!acc[key] || new Date(acc[key].fields.updatetime).getTime() < new Date(item.fields.updatetime).getTime()) {
              acc[key] = item
            }
            return acc
          }, {});

          const historyItems = Object.values(processedHistoryData);
          console.log('历史数据处理结果:', {
            原始记录总数: historicalItems.length,
            去重后记录数: historyItems.length,
            重复数据数量: historicalItems.length - historyItems.length
          });
          console.log('✅ 历史数据处理完成')

          // 9. 历史数据统计
          console.log('\n4️⃣ 历史数据统计...')
          
          // 使用类型谓词进行过滤
          const filteredHistoryItems = historyItems.filter((item): item is FeishuResponse['data']['items'][0] => {
            return item.fields.type === '日出' || item.fields.type === '日落';
          });

          console.log('历史数据统计:', {
            数据分布: {
              日出记录: filteredHistoryItems.filter(item => item.fields.type === '日出').length,
              日落记录: filteredHistoryItems.filter(item => item.fields.type === '日落').length
            }
          });
          console.log('✅ 历史数据统计完成')
        }
      } catch (historyError: unknown) {
        console.error('\n❌ 历史数据处理失败:', {
          错误类型: historyError instanceof Error ? historyError.name : '未知错误',
          错误信息: historyError instanceof Error ? historyError.message : String(historyError),
          详细信息: (historyError as { response?: { data: unknown } })?.response?.data || '无详细信息'
        });
      }
    }

    return NextResponse.json<{
      data: FeishuResponse;
    }>({ data: response });
  } catch (error: unknown) {
    console.error('\n❌ 处理失败:', {
      步骤: '数据查询',
      错误类型: error instanceof Error ? error.name : '未知错误',
      错误信息: error instanceof Error ? error.message : String(error),
      详细信息: (error as { response?: { data: unknown } })?.response?.data || '无详细信息'
    });
    return NextResponse.json<{
      error: string;
      details: string;
    }>({ 
      error: '获取数据失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { 
      status: 500 
    });
  } finally {
    console.log('\n==========================================')
    console.log('🏁 请求处理结束 🏁')
    console.log('==========================================\n')
  }
} 