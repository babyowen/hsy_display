import { Client } from '@larksuiteoapi/node-sdk'

export interface SunsetData {
  datetime: string;
  type: string;
  hsysz: number;  // 火烧云数值
  hsypj: string;  // 火烧云评价
  qrjsz: number;  // 气溶胶数值
  kqzl: string;   // 空气质量评价
  updatetime: string;
}

export function getFeishuClient() {
  return new Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    disableTokenCache: false
  })
} 