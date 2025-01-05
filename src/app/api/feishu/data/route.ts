import { NextResponse } from 'next/server'
import { getFeishuClient, getTenantToken } from '@/lib/feishu'

// 添加环境变量类型声明
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FEISHU_APP_ID: string
      FEISHU_APP_SECRET: string
      FEISHU_APP_TOKEN: string
      FEISHU_TABLE_ID: string
      FEISHU_VIEW_ID: string
    }
  }
}

export async function GET() {
  try {
    const client = await getFeishuClient();
    const tenantToken = await getTenantToken();
    
    if (!client || !tenantToken) {
      console.error('Failed to initialize Feishu client or get tenant token');
      return NextResponse.json({ error: 'Failed to initialize client' }, { status: 500 });
    }

    const response = await client.bitable.appTableRecord.list({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN,
        table_id: process.env.FEISHU_TABLE_ID
      },
      params: {
        view_id: process.env.FEISHU_VIEW_ID,
        page_size: 100,
        field_names: "datetime,type,hsysz,hsypj,qrjsz,kqzl,updatetime"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${tenantToken}`
      }
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 

// 在路由处理开始时打印环境变量
console.log('API Route Environment:', {
  hasAppId: !!process.env.FEISHU_APP_ID,
  hasAppSecret: !!process.env.FEISHU_APP_SECRET,
  hasAppToken: !!process.env.FEISHU_APP_TOKEN,
  hasTableId: !!process.env.FEISHU_TABLE_ID,
  hasViewId: !!process.env.FEISHU_VIEW_ID
}); 