import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'

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

interface HistoryResponse {
  code: number;
  data: unknown;
}

export async function GET() {
  try {
    const tenantToken = await getTenantToken();

    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

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
          conjunction: "and" as const,
          conditions: [
            {
              field_name: 'datetime',
              operator: "is" as const,
              value: ["CurrentWeek"]
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

    return NextResponse.json({ data: response });
  } catch (error: any) {
    console.error('Feishu API Error:', error);
    if (error.response?.data) {
      console.error('Error Response Data:', error.response.data);
    }
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