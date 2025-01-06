// 创建新文件定义类型
export interface FeishuResponse {
  code: number;
  msg: string;
  data: {
    items: Array<{
      fields: {
        datetime: string;
        type: string;
        hsysz: string;
        hsypj: Array<{ text: string }>;
        qrjsz: string;
        kqzl: Array<{ text: string }>;
        updatetime: string;
      }
    }>
  }
} 