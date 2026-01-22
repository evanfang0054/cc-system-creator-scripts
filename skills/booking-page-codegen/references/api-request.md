# api-request 工具文档

## 概述

本文档描述了SaaS国际H5项目中API接口的使用方式和规范。通过自动生成的API类型定义，开发者可以便捷地进行接口调用和数据处理。

## 引用方式

```ts
import { useProductConfig } from '@/context/provider';
```

## 功能类型

工具

## 功能名称

SaaS国际H5 API接口工具

## 功能描述

基于自动生成API类型定义的接口调用工具，提供统一的API调用方式，支持错误处理、请求参数配置和响应数据格式化。适用于需要与后端API进行数据交互的所有场景。

## 何时使用

- 需要调用后端业务接口获取数据
- 需要发送业务数据到后端服务
- 需要处理API请求的错误和异常情况
- 需要配置请求参数和选项

## 使用示例

### 基础用法 - 获取商品详情

```ts
import { useProductConfig } from '@/context/provider';

const Component = () => {
  const { api } = useProductConfig();

  const getEntitlementList = async () => {
    try {
      const res = await api.api.businessResourcesProductDetailPost({
        proCode: pro_code,
      });
      return res.data.data;
    } catch (error) {
      console.error('获取商品详情失败:', error);
    }
  };

  return <div>商品组件</div>;
};

export default Component;
```

### 完整用法 - 用户登录认证

```ts
import { useProductConfig } from '@/context/provider';

const Component = () => {
  const { api } = useProductConfig();

  const handleLogin = async () => {
    try {
      // 显示加载状态
      showLoading();

      const res = await api.api.businessAuthLoginPost({
        params: allQueryParams?.params ?? undefined,
        tenantCode: allQueryParams?.tenantCode ?? undefined,
      });

      // 处理登录成功响应
      console.log('登录成功:', res.data);
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      // 隐藏加载状态
      hideLoading();
    }
  };

  return <div>登录组件</div>;
};

export default Component;
```

## API命名规则

接口调用方法按照以下规则生成：

**转换规则**：`/api/business/resources/productDetail` → `api.api.businessResourcesProductDetailPost`

**命名逻辑**：
- 路径中的 `/` 转换为驼峰命名
- HTTP方法 `POST` 作为后缀
- 所有接口方法统一挂载在 `api.api` 对象下

**示例接口定义**：
```typescript
/**
 * @name BusinessResourcesProductDetailPost
 * @summary 获取指定商品详情
 * @request POST:/api/business/resources/productDetail
 * @response `200` `ResultProductDetailResp`
 */
businessResourcesProductDetailPost: (
  data: ProductDetailReq,
  params: RequestParams = {},
): Promise<AxiosResponse<ResultProductDetailResp>> =>
  this.http.request<ResultProductDetailResp, any>({
    path: `/api/business/resources/productDetail`,
    method: "POST",
    body: data,
    type: ContentType.Json,
    format: "json",
    ...params,
  });
```

## 响应数据类型

### ResultProductDetailResp

标准API响应数据结构，所有接口返回数据都遵循此格式。

```typescript
export interface ResultProductDetailResp {
  code?: number;           // 响应状态码
  data?: ProductDetailResp; // 业务数据
  msg?: string;            // 响应消息
  errCode?: string;        // 错误码
}
```

**字段说明**：
- `code`: 业务状态码，用于判断请求是否成功
- `data`: 实际的业务数据，类型取决于具体接口
- `msg`: 响应消息，成功或错误的具体描述
- `errCode`: 错误码，用于定位具体的错误类型

## 请求参数类型

### RequestParams

通用请求参数配置，用于控制请求行为。

| 属性名 | 类型 | 说明 | 默认值 |
|-------|------|-----|-------|
| secure | boolean | 是否为此次请求调用安全工作函数 | false |
| path | string | 请求路径 | - |
| type | ContentType | 请求体内容类型 | Json |
| query | QueryParamsType | 查询参数 | - |
| format | ResponseType | 响应格式 | json |
| body | unknown | 请求体数据 | - |

### FullRequestParams

完整请求参数类型，继承自AxiosRequestConfig并进行了自定义扩展。

```typescript
export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  secure?: boolean;
  path: string;
  type?: ContentType;
  query?: QueryParamsType;
  format?: ResponseType;
  body?: unknown;
}
```

## 主题变量

本工具不涉及UI主题变量，主要提供API调用功能。
