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
  console.log(`\n[${sessionId}] 近日预测 | 开始查询`)

  try {
    // 1. 获取配置和初始化客户端
    const config = getFeishuConfig()
    
    // 验证配置是否有效
    if (!config.appId || !config.appSecret || !config.appToken || !config.tableId || !config.viewId) {
      console.log(`[${sessionId}] 近日预测 | ❌ 配置无效: 环境变量未设置`)
      return NextResponse.json({
        data: {
          items: []
        }
      }, { status: 500 })
    }

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
          conjunction: "or",
          conditions: [
            {
              field_name: "datetime",
              operator: "is",
              value: ["Today"]
            },
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

    // 3. 发送请求并获取数据
    const response = await client.bitable.appTableRecord.search(params)
    const totalRecords = response.data?.items?.length || 0
    console.log(`[${sessionId}] 近日预测 | 查询完成：获取到 ${totalRecords} 条记录\n`)

    // 4. 返回响应
    return NextResponse.json({ 
      data: {
        items: response.data?.items || []
      }
    })

  } catch (error: unknown) {
    const err = error as FeishuError
    console.log(`[${sessionId}] 近日预测 | ❌ 查询失败: ${err.message}\n`)
    return NextResponse.json({
      data: {
        items: []
      }
    }, { status: 500 })
  }
} 