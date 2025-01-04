import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'

interface FeishuField {
  datetime: number;  // 确保这是数字类型
  type: string;
  hsysz: number;
  hsypj: Array<{ text: string }>;
  qrjsz: number;
  kqzl: Array<{ text: string }>;
  updatetime: number;
}

interface FeishuRecord {
  fields: FeishuField;
  record_id: string;
}

interface FeishuResponse {
  code: number;
  data: {
    data: {
      items: FeishuRecord[];
      has_more: boolean;
    };
  };
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
    const tenantToken = await getTenantToken();
    console.log('Got tenant token:', tenantToken ? '成功获取' : '获取失败');

    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

    // 获取当前时间和未来7天的时间范围
    const now = new Date();
    const future = new Date(now);
    future.setDate(now.getDate() + 7);

    // 格式化时间为 ISO 字符串
    const nowStr = now.toISOString();
    const futureStr = future.toISOString();

    console.log('Time range:', {
      now: nowStr,
      future: futureStr
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
          conjunction: 'and' as const,
          conditions: [
            {
              field_name: 'datetime',
              operator: 'contains',
              value: [nowStr.split('T')[0]]  // 使用当前日期作为起始点
            }
          ]
        },
        sort: [
          {
            field_name: 'datetime',
            desc: false
          }
        ]
      }
    };

    console.log('Request params:', JSON.stringify(requestParams, null, 2));

    const response = await client.bitable.appTableRecord.search(requestParams, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    }) as FeishuResponse;

    // 打印完整的响应数据
    console.log('Full API response:', JSON.stringify(response, null, 2));

    if (!response.data.data?.items?.length) {
      console.log('No items found in response');
      return NextResponse.json({ data: { items: [] } });
    }

    // 过滤出未来的数据
    const futureItems = response.data.data.items.filter(item => {
      const itemDate = new Date(item.fields.datetime);
      return itemDate > now && itemDate <= future;
    });

    console.log('Filtered future items:', futureItems.length);

    // 返回处理后的数据
    return NextResponse.json({ 
      data: {
        ...response,
        data: {
          ...response.data,
          data: {
            ...response.data.data,
            items: futureItems
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    return NextResponse.json(
      { 
        error: '获取数据失败', 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 