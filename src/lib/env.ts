interface FeishuConfig {
  appId: string;
  appSecret: string;
  appToken: string;
  tableId: string;
  viewId: string;
}

export function getFeishuConfig(): FeishuConfig {
  // 检查特定的环境变量
  const envVars = {
    FEISHU_APP_ID: process.env.FEISHU_APP_ID,
    FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
    FEISHU_APP_TOKEN: process.env.FEISHU_APP_TOKEN,
    FEISHU_TABLE_ID: process.env.FEISHU_TABLE_ID,
    VIEW_ID: process.env.VIEW_ID
  }

  // 检查是否所有必需的环境变量都存在
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`环境变量缺失: ${missingVars.join(', ')}。请确保在 .env.local 文件中设置了所有必需的环境变量。`)
  }

  return {
    appId: envVars.FEISHU_APP_ID!,
    appSecret: envVars.FEISHU_APP_SECRET!,
    appToken: envVars.FEISHU_APP_TOKEN!,
    tableId: envVars.FEISHU_TABLE_ID!,
    viewId: envVars.VIEW_ID!
  }
} 