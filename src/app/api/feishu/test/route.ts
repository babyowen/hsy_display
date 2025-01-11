import { NextResponse } from 'next/server'
import { getFeishuConfig } from '@/lib/env'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@larksuiteoapi/node-sdk')

interface FeishuError {
  message: string;
  code?: string;
}

export async function GET() {
  const sessionId = Math.random().toString(36).substring(7)
  console.log(`[${sessionId}] 步骤1: 开始测试查询`)

  try {
    // 1. 获取配置和初始化客户端
    const config = getFeishuConfig()
    const client = new Client({
      appId: config.appId,
      appSecret: config.appSecret,
      disableTokenCache: false
    })
    console.log(`[${sessionId}] 步骤2: 客户端初始化完成`)

    // 2. 构建查询参数
    const testParams = {
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
              value: ["Tomorrow"]
            }
          ]
        },
        sort: [
          {
            field_name: "datetime",
            desc: false
          }
        ]
      }
    }
    console.log(`[${sessionId}] 步骤3: 查询参数准备完成`)

    // 3. 发送请求
    const response = await client.bitable.appTableRecord.search(testParams)
    console.log(`[${sessionId}] 步骤4: 查询完成，获取到 ${response.data?.items?.length || 0} 条记录`)

    // 4. 返回响应
    return NextResponse.json({ 
      data: {
        items: response.data?.items || []
      }
    })

  } catch (error: unknown) {
    const err = error as FeishuError
    console.log(`[${sessionId}] ❌ 查询失败: ${err.message}`)
    return NextResponse.json({
      data: {
        items: []
      }
    }, { status: 500 })
  }
} 