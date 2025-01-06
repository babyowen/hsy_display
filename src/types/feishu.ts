export interface FeishuResponse {
  data: {
    data: {
      items: Array<{
        record_id: string;
        fields: {
          datetime: string;
          type: string;
          hsysz: number;
          hsypj: Array<{ text: string }>;
          qrjsz: number;
          kqzl: Array<{ text: string }>;
          updatetime: number;
        };
      }>;
    };
  };
}

export interface ProcessedData {
  record_id: string;
  datetime: number;
  type: string;
  hsysz: number;
  hsypj: string;
  qrjsz: number;
  kqzl: string;
  updatetime: number;
} 