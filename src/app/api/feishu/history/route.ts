import { NextResponse } from 'next/server'
import { getFeishuConfig } from '@/lib/env'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@larksuiteoapi/node-sdk')

interface FeishuError {
  message: string;
  code?: string;
}

interface FeishuItem {
  fields: {
    datetime: string;
    updatetime: string;
    type: string;
    hsysz: string;
    hsypj: { text: string }[];
    qrjsz: string;
    kqzl: { text: string }[];
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const sessionId = Math.random().toString(36).substring(7)
  console.log(`\n[${sessionId}] 本周历史 | 开始查询`)

  try {
    // 1. 获取配置和初始化客户端
    const config = getFeishuConfig()
    const client = new Client({
      appId: config.appId,
      appSecret: config.appSecret,
      disableTokenCache: false
    })

    // 2. 构建查询参数
    const params = {
      path: {
        app_token: config.appToken,
        table_id: config.tableId
      },
      data: {
        view_id: config.viewId,
        page_size: 100,
        field_names: ["datetime", "type", "hsysz", "hsypj", "qrjsz", "kqzl", "updatetime"],
        filter: {
          conjunction: "and",
          conditions: [
            {
              field_name: "datetime",
              operator: "is",
              value: ["CurrentWeek"]
            }
          ]
        },
        sort: [
          {
            field_name: "datetime",
            desc: true
          }
        ]
      }
    }

    // 添加日志函数来格式化时间
    const formatDate = (timestamp: string | number) => {
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }

    // 3. 发送请求并获取数据
    const response = await client.bitable.appTableRecord.search(params)
    const totalRecords = response.data?.items?.length || 0

    // 打印原始数据
    console.log(`[${sessionId}] 本周历史 | 获取到的原始数据:`)
    response.data?.items?.forEach((item: { fields: { datetime: string, updatetime: string } }) => {
      console.log(`  - 事件时间: ${formatDate(item.fields.datetime)}, 更新时间: ${formatDate(item.fields.updatetime)}`)
    })

    // 按事件时间分组，只保留最新更新的记录
    const latestUpdates = response.data?.items?.reduce((acc: { [key: string]: FeishuItem }, item: FeishuItem) => {
      const key = item.fields.datetime
      if (!acc[key] || new Date(acc[key].fields.updatetime).getTime() < new Date(item.fields.updatetime).getTime()) {
        acc[key] = item
      }
      return acc
    }, {})

    // 处理数据，添加格式化的时间
    const processedItems = (Object.values(latestUpdates) as FeishuItem[]).map((item: FeishuItem) => ({
      ...item,
      fields: {
        ...item.fields,
        formatted_datetime: formatDate(item.fields.datetime),
        formatted_updatetime: formatDate(item.fields.updatetime),
        datetime: item.fields.datetime,  // 保留原始时间戳
        updatetime: item.fields.updatetime  // 保留原始时间戳
      }
    }))

    // 打印处理后的数据
    console.log(`\n[${sessionId}] 本周历史 | 过滤后的数据:`)
    processedItems.forEach((item: FeishuItem) => {
      console.log(`  - 事件时间: ${formatDate(item.fields.datetime)}, 更新时间: ${formatDate(item.fields.updatetime)}`)
    })

    console.log(`\n[${sessionId}] 本周历史 | 查询完成：获取到 ${totalRecords} 条记录，过滤后 ${processedItems.length} 条记录\n`)

    // 4. 返回响应
    return NextResponse.json({ 
      data: {
        items: processedItems
      }
    })

  } catch (error: unknown) {
    const err = error as FeishuError
    console.log(`[${sessionId}] 本周历史 | ❌ 查询失败: ${err.message}\n`)
    return NextResponse.json({
      data: {
        items: []
      }
    }, { status: 500 })
  }
} 