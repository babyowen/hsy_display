// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@larksuiteoapi/node-sdk')
import type { FeishuResponse } from './types'

export interface SunsetData {
  datetime: string;
  type: string;
  hsysz: string;  // 改为 string，因为实际数据是字符串
  hsypj: Array<{ text: string }>;  // 修改为正确的类型
  qrjsz: string;  // 改为 string
  kqzl: Array<{ text: string }>;   // 修改为正确的类型
  updatetime: string;
}

export function getFeishuClient() {
  return new Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    disableTokenCache: false,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      trace: () => {}
    }
  })
}

export interface FeishuRequestParams {
  path: {
    app_token: string;
    table_id: string;
  };
  data: {
    view_id: string;
    page_size: number;
    field_names: string[];
    filter: {
      conjunction: 'and' | 'or';
      conditions: Array<{
        field_name: string;
        operator: 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'isEmpty' | 'isNotEmpty' | 'isGreater' | 'isGreaterEqual' | 'isLess' | 'isLessEqual';
        value: string[];
      }>;
    };
    sort: Array<{
      field_name: string;
      order: 'asc' | 'desc';
    }>;
  };
}

export interface FeishuError {
  error: string;
  details: string;
  errorData?: unknown;
}

export type { FeishuResponse }; 