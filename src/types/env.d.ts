declare namespace NodeJS {
  interface ProcessEnv {
    FEISHU_APP_ID: string
    FEISHU_APP_SECRET: string
    FEISHU_APP_TOKEN: string
    TABLE_ID: string
    VIEW_ID: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
} 