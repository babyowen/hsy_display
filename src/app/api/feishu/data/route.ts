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

export async function GET() {
  try {
    const tenantToken = await getTenantToken();
    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

    // 1. 获取本周数据
    console.log('1. 开始获取本周数据');
    const thisWeekResponse = await client.bitable.appTableRecord.search({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN!,
        table_id: process.env.TABLE_ID!,
      },
      data: {
        view_id: process.env.VIEW_ID,
        field_names: ['datetime', 'type', 'hsysz', 'hsypj', 'qrjsz', 'kqzl', 'updatetime'],
        filter: {
          conjunction: 'and',
          conditions: [{
            field_name: 'datetime',
            operator: 'is',
            value: ['CurrentWeek']
          }]
        }
      }
    }, { headers: { 'Authorization': `Bearer ${tenantToken}` } });

    // 计算本周日期范围（如果今天是周日，则算作上周的最后一天）
    const now = new Date();
    const today = now.getDay(); // 0是周日，1-6是周一到周六
    
    // 如果是周日，向前推一周
    const thisWeekStart = new Date(now);
    if (today === 0) {
      thisWeekStart.setDate(now.getDate() - 7); // 回到上周一
    } else {
      thisWeekStart.setDate(now.getDate() - today + 1); // 回到本周一
    }
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    console.log('本周数据:', {
      时间范围: `${thisWeekStart.toLocaleDateString()} - ${thisWeekEnd.toLocaleDateString()}`,
      获取条数: thisWeekResponse?.data?.items?.length || 0,
      示例: thisWeekResponse?.data?.items?.slice(0, 2).map(item => ({
        日期: item.fields.datetime,
        类型: item.fields.type
      }))
    });

    // 2. 获取下周数据
    console.log('2. 开始获取下周数据');
    const nextWeekResponse = await client.bitable.appTableRecord.search({
      path: {
        app_token: process.env.FEISHU_APP_TOKEN!,
        table_id: process.env.TABLE_ID!,
      },
      data: {
        view_id: process.env.VIEW_ID,
        field_names: ['datetime', 'type', 'hsysz', 'hsypj', 'qrjsz', 'kqzl', 'updatetime'],
        filter: {
          conjunction: 'and',
          conditions: [{
            field_name: 'datetime',
            operator: 'is',
            value: ['NextWeek']
          }]
        }
      }
    }, { headers: { 'Authorization': `Bearer ${tenantToken}` } });

    // 计算下周日期范围
    const nextWeekStart = new Date(thisWeekEnd);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    console.log('下周数据:', {
      时间范围: `${nextWeekStart.toLocaleDateString()} - ${nextWeekEnd.toLocaleDateString()}`,
      获取条数: nextWeekResponse?.data?.items?.length || 0,
      示例: nextWeekResponse?.data?.items?.slice(0, 2).map(item => ({
        日期: item.fields.datetime,
        类型: item.fields.type
      }))
    });

    // 3. 合并数据
    const allItems = [
      ...(thisWeekResponse?.data?.items || []),
      ...(nextWeekResponse?.data?.items || [])
    ];

    // 4. 数据去重
    const uniqueDataMap = new Map();
    allItems.forEach(item => {
      const dateTime = item.fields.datetime as string;
      const type = item.fields.type as string;
      const updateTime = item.fields.updatetime as string;
      const key = `${dateTime}-${type}`;

      if (!uniqueDataMap.has(key)) {
        uniqueDataMap.set(key, item);
      } else {
        const existingItem = uniqueDataMap.get(key);
        const existingUpdateTime = existingItem.fields.updatetime as string;
        if (new Date(updateTime).getTime() > new Date(existingUpdateTime).getTime()) {
          uniqueDataMap.set(key, item);
        }
      }
    });

    const uniqueItems = Array.from(uniqueDataMap.values()).sort((a, b) => {
      return new Date(a.fields.datetime).getTime() - new Date(b.fields.datetime).getTime();
    });

    console.log('3. 数据处理完成:', {
      合并前数据总数: allItems.length,
      去重后数据总数: uniqueItems.length
    });

    return NextResponse.json({
      data: {
        data: {
          items: uniqueItems
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
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

// 在路由处理开始时打印环境变量
console.log('API Route Environment:', {
  hasAppId: !!process.env.FEISHU_APP_ID,
  hasAppSecret: !!process.env.FEISHU_APP_SECRET,
  hasAppToken: !!process.env.FEISHU_APP_TOKEN,
  hasTableId: !!process.env.TABLE_ID,
  hasViewId: !!process.env.VIEW_ID
}); 