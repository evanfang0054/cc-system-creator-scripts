export interface ApiInfo {
  id: string;
  name: string;
  method: string;
  path: string;
  description?: string;
  tags?: string[];
}

export interface ApiDetail {
  id: string;
  name: string;
  method: string;
  path: string;
  description?: string;
  headers?: Record<string, any>;
  parameters?: ParameterInfo[];
  requestBody?: RequestBodyInfo;
  responses?: ResponseInfo[];
  tags?: string[];
}

export interface ParameterInfo {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required: boolean;
  type: string;
  schema?: any;
}

export interface RequestBodyInfo {
  description?: string;
  required: boolean;
  content: Record<string, any>;
}

export interface ResponseInfo {
  code: string;
  description?: string;
  content?: Record<string, any>;
}

export interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}