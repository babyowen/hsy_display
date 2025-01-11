// 飞书 API 的过滤条件操作符
export type FilterOperator = 
  | 'is'
  | 'isNot'
  | 'contains'
  | 'doesNotContain'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'is_greater'
  | 'is_greater_equal'
  | 'is_less'
  | 'is_less_equal'
  | 'like'
  | 'in';

// 飞书 API 的过滤条件
export interface FilterCondition {
  field_name: string;
  operator: FilterOperator;
  value?: string[];
}

// 飞书 API 的过滤器
export interface Filter {
  conjunction: 'and' | 'or';
  conditions: FilterCondition[];
}

// 飞书 API 的请求参数
export interface RequestParams {
  path: {
    app_token: string;
    table_id: string;
  };
  data: {
    view_id: string;
    page_size: number;
    field_names: string[];
    filter: {
      conjunction: "and" | "or";
      conditions: Array<{
        field_name: string;
        operator: "is_greater" | "is_less" | "is" | "isNot";
        value: string[];
      }>;
    };
    sort: Array<{
      field_name: string;
      desc: boolean;
    }>;
  };
} 