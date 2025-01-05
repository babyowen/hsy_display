import { NextResponse } from 'next/server'
import { Client } from '@larksuiteoapi/node-sdk'

// 添加环境变量类型声明
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FEISHU_APP_ID: string
      FEISHU_APP_SECRET: string
      FEISHU_APP_TOKEN: string
      TABLE_ID: string
      VIEW_ID: string
    }
  }
}

interface FeishuField {
  datetime: string | number;  // 可以是字符串或数字
  type: string;
  hsysz: string | number;
  hsypj: Array<{ text: string }> | string | number;
  qrjsz: string | number;
  kqzl: Array<{ text: string }> | string | number;
  updatetime: string | number;
}

interface FeishuRecord {
  fields: FeishuField;
  record_id: string;
}

interface FeishuResponse {
  code: number;
  data: {
    items: FeishuRecord[];
    has_more: boolean;
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
        operator: "is" | "isNot" | "contains" | "doesNotContain" | "isEmpty" | "isNotEmpty" | "isGreater" | "isGreaterEqual" | "isLess" | "isLessEqual" | "like" | "in";
        value?: string[];
      }>;
    };
    page_token?: string;
    page_size?: number;
  }
}

async function getTenantToken() {
  try {
    console.log('Starting token request...');
    
    // 测试网络连接
    try {
      const testResponse = await fetch('https://open.feishu.cn/open-apis/ping', {
        method: 'GET'
      });
      console.log('Feishu API connectivity test:', testResponse.status);
    } catch (error) {
      console.error('Feishu API connectivity test failed:', error);
    }

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
    console.error('Full token error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // 验证环境变量
    const envCheck = {
      hasAppId: !!process.env.FEISHU_APP_ID,
      hasAppSecret: !!process.env.FEISHU_APP_SECRET,
      hasAppToken: !!process.env.FEISHU_APP_TOKEN,
      hasTableId: !!process.env.TABLE_ID,
      hasViewId: !!process.env.VIEW_ID
    };
    
    console.log('Environment check:', envCheck);

    if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
      throw new Error('Missing required environment variables');
    }

    const tenantToken = await getTenantToken();
    if (!tenantToken) {
      throw new Error('Failed to get tenant token');
    }

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
        sort: [
          {
            field_name: 'datetime',
            desc: false
          }
        ]
      }
    };

    // 添加调试日志
    console.log('Request parameters:', {
      appToken: process.env.FEISHU_APP_TOKEN,
      tableId: process.env.TABLE_ID,
      viewId: process.env.VIEW_ID,
      requestParams
    });

    const response = await client.bitable.appTableRecord.search(requestParams, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    });

    // 添加响应调试日志
    console.log('API Response:', {
      status: response?.code,
      hasData: !!response?.data?.items,
      itemCount: response?.data?.items?.length
    });

    // 确保响应格式正确
    if (!response?.data?.items) {
      throw new Error('Invalid response format from Feishu API');
    }

    // 处理数据格式
    const processedItems = response.data.items.map(item => ({
      fields: {
        datetime: String(item.fields.datetime || ''),
        type: String(item.fields.type || ''),
        hsysz: parseFloat(String(item.fields.hsysz)) || 0,
        hsypj: Array.isArray(item.fields.hsypj) ? item.fields.hsypj : [{ text: String(item.fields.hsypj || '') }],
        qrjsz: parseFloat(String(item.fields.qrjsz)) || 0,
        kqzl: Array.isArray(item.fields.kqzl) ? item.fields.kqzl : [{ text: String(item.fields.kqzl || '') }],
        updatetime: String(item.fields.updatetime || '')
      }
    }));

    return NextResponse.json({ 
      data: {
        code: 0,
        data: {
          items: processedItems,
          has_more: false
        }
      }
    });

  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data || error.response
    });

    return NextResponse.json(
      { 
        error: error.message || '获取数据失败',
        details: error.stack,
        code: error.code,
        response: error.response?.data || error.response
      }, 
      { status: 500 }
    );
  }
} 

// 在路由处理开始时打印环境变量
console.log('API Route Environment:', {
  hasAppId: !!process.env.FEISHU_APP_ID,
  hasAppSecret: !!process.env.FEISHU_APP_SECRET,
  hasAppToken: !!process.env.FEISHU_APP_TOKEN,
  hasTableId: !!process.env.TABLE_ID,
  hasViewId: !!process.env.VIEW_ID
}); 