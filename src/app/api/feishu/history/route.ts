import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'
import type { FeishuResponse } from '@/lib/types'

// 创建一个函数来初始化客户端
function createClient() {
  return new Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    disableTokenCache: true,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      trace: () => {}
    }
  });
}

async function getTenantToken() {
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "app_id": process.env.FEISHU_APP_ID,
        "app_secret": process.env.FEISHU_APP_SECRET
      })
    });

    const data = await response.json();
    
    if (data.code === 0) {
      return data.tenant_access_token;
    } else {
      throw new Error(`Failed to get tenant token: ${data.msg}`);
    }
  } catch (error) {
    console.error('Error getting tenant token:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const tenantToken = await getTenantToken();
    const client = createClient();

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

    const response = await client.bitable.appTableRecord.search(requestParams, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    }) as FeishuResponse;

    if (!response || !response.data) {
      return NextResponse.json<{
        data: { items: [] }
      }>({
        data: {
          items: []
        }
      });
    }

    return NextResponse.json<{
      data: {
        items: FeishuResponse['data']['items']
      }
    }>({
      data: {
        items: response.data.items || []
      }
    });
  } catch (error: unknown) {
    console.error('Feishu API Error:', error);
    const errorResponse = error as { response?: { data: unknown } };
    if (errorResponse.response?.data) {
      console.error('Error Response Data:', errorResponse.response.data);
    }
    return NextResponse.json<{
      error: string;
      details: string;
      errorData?: unknown;
    }>({ 
      error: '获取数据失败', 
      details: error instanceof Error ? error.message : String(error),
      errorData: errorResponse.response?.data
    }, { 
      status: 500 
    });
  }
} 