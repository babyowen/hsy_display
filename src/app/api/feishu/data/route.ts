import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'

interface FeishuResponse {
  code: number;
  data: unknown;
}

// 添加请求参数的类型定义
interface RequestParams {
  path: {
    app_token: string;
    table_id: string;
  };
  data: {
    view_id?: string;
    field_names?: string[];
    sort?: Array<{
      field_name?: string;
      desc?: boolean;
    }>;
    filter?: {
      conjunction?: "or" | "and";
      conditions?: Array<{
        field_name: string;
        operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty";
        value?: string[];
      }>;
    };
    page_token?: string;
    page_size?: number;
  }
}

async function getTenantToken() {
  try {
    console.log('Requesting tenant token with:', {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET?.slice(0, 4) + '****'
    });

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
    console.log('Tenant Token Response:', data);
    
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
    // 检查环境变量
    console.log('Environment check:', {
      hasAppId: !!process.env.FEISHU_APP_ID,
      hasAppSecret: !!process.env.FEISHU_APP_SECRET,
      hasAppToken: !!process.env.FEISHU_APP_TOKEN,
      hasTableId: !!process.env.TABLE_ID,
      hasViewId: !!process.env.VIEW_ID,
    });

    const tenantToken = await getTenantToken();
    console.log('Got tenant token:', tenantToken ? '成功获取' : '获取失败');

    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

    const requestParams: RequestParams = {
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
              operator: 'is',
              value: ['Today']
            }
          ]
        },
        sort: [
          {
            field_name: 'datetime',
            desc: true
          }
        ]
      }
    };

    console.log('Request params:', JSON.stringify(requestParams, null, 2));

    const response = await client.bitable.appTableRecord.search(requestParams, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    });

    console.log('Feishu API Response:', JSON.stringify(response, null, 2));
    return NextResponse.json({ data: response });
  } catch (error: any) {
    console.error('Detailed Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response?.data,
    });

    return NextResponse.json(
      { 
        error: '获取数据失败', 
        details: error instanceof Error ? error.message : String(error),
        errorData: error.response?.data
      }, 
      { status: 500 }
    );
  }
} 