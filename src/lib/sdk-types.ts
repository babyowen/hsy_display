// 覆盖 SDK 的类型定义
declare module '@larksuiteoapi/node-sdk' {
  interface BitableRequestParams {
    path: {
      app_token: string;
      table_id: string;
    };
    data: {
      view_id?: string;
      page_size?: number;
      field_names?: string[];
      filter?: {
        conjunction: 'and' | 'or';
        conditions: Array<{
          field_name: string;
          operator: 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'isEmpty' | 'isNotEmpty' | 'isGreater' | 'isGreaterEqual' | 'isLess' | 'isLessEqual' | 'like' | 'in';
          value?: string[];
        }>;
      };
      sort?: Array<{
        field_name: string;
        desc: boolean;
      }>;
    };
  }
} 