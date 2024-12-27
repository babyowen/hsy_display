import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'

interface FeishuResponse {
  code: number;
  data: unknown;
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
  let requestParams;

  try {
    const tenantToken = await getTenantToken();
    console.log('Got tenant token:', tenantToken);

    console.log('Environment variables:', {
      APP_TOKEN: process.env.FEISHU_APP_TOKEN,
      TABLE_ID: process.env.TABLE_ID,
      VIEW_ID: process.env.VIEW_ID
    });

    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

    requestParams = {
      path: {
        app_token: process.env.FEISHU_APP_TOKEN!,
        table_id: process.env.TABLE_ID!,
      },
      params: {
        view_id: process.env.VIEW_ID,
      },
      data: {
        page_size: 100,
        field_names: ['datetime', 'type', 'hsysz', 'hsypj', 'qrjsz', 'kqzl', 'updatetime'],
        filter: {
          conjunction: 'or',
          conditions: [
            {
              field_name: 'datetime',
              operator: 'is',
              value: ['Today']
            },
            {
              field_name: 'datetime',
              operator: 'is',
              value: ['Tomorrow']
            }
          ]
        },
        sort: [
          {
            field_name: 'datetime',
            order: 'asc'
          }
        ]
      }
    };

    console.log('Sending request with params:', JSON.stringify(requestParams, null, 2));

    const response = await client.bitable.appTableRecord.search(requestParams, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    });

    console.log('Raw API Response:', response);
    console.log('Stringified API Response:', JSON.stringify(response, null, 2));

    return NextResponse.json({ data: response });
  } catch (error: any) {
    console.error('Detailed Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response?.data,
      config: error.config
    });

    if (error.isAxiosError) {
      console.log('Axios Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data
      });
    }

    return NextResponse.json(
      { 
        error: '获取数据失败', 
        details: error instanceof Error ? error.message : String(error),
        response: error.response?.data,
        requestParams
      }, 
      { status: 500 }
    );
  }
} 