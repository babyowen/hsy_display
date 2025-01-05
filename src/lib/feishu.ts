import { Client } from '@larksuiteoapi/node-sdk'

export async function getFeishuClient() {
  try {
    const client = new Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      disableTokenCache: true
    });

    return client;
  } catch (error) {
    console.error('Failed to initialize Feishu client:', error);
    return null;
  }
}

export async function getTenantToken() {
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET
      })
    });

    const data = await response.json();
    return data.tenant_access_token;
  } catch (error) {
    console.error('Failed to get tenant token:', error);
    return null;
  }
} 