# Apifox Mock 自定义脚本文档

## 引用方式
在 Apifox 接口的「高级 Mock」设置中使用 Mock 自定义脚本功能

## 功能类型
工具

## 功能名称
Mock 自定义脚本

## 功能描述
Apifox Mock 自定义脚本允许开发者通过 JavaScript 代码动态控制 Mock 接口的响应行为。该功能提供了灵活的请求参数获取和响应内容修改能力，支持根据请求参数、Headers、Cookies 等条件动态生成响应数据。适用于需要复杂 Mock 逻辑的场景，如分页数据模拟、权限验证、异常场景测试等。

## 何时使用
- 需要根据请求参数动态生成 Mock 数据时
- 需要模拟权限验证和异常响应时
- 需要测试分页、延迟等特殊场景时
- 需要基于请求头或 Cookie 返回不同数据时
- 需要完全自定义响应逻辑时

## 使用示例

### 基础示例：分页数据设置

```javascript
// 获取智能 Mock 功能自动 Mock 出来的数据
var responseJson = fox.mockResponse.json();

// 修改 responseJson 里的分页数据
// 将 page 设置为请求参数的 page
responseJson.page = parseInt(fox.mockRequest.getParam('page'));
// 将 total 设置 120
responseJson.total = 120;

// 将修改后的 json 写入 fox.mockResponse
fox.mockResponse.setBody(responseJson);
```

### 高级示例：多条件判断与动态响应

```javascript
var MockJs = require('mockjs');

// 获取"智能Mock"自动生成的 json
var responseJson = fox.mockResponse.json();

// 根据请求参数（包括 query、body、path）修改响应值
if(fox.mockRequest.getParam('id') === '123'){
  responseJson.data = null;
  responseJson.code = 400104;
  responseJson.errorMessage = '数据不存在';
  fox.mockResponse.setBody(responseJson);
  fox.mockResponse.setCode(404);
}

// 根据请求的 header 修改响应值
if(!fox.mockRequest.headers.get('token')){
  responseJson.data = null;
  responseJson.code = 400103;
  responseJson.errorMessage = '没有权限';
  fox.mockResponse.setBody(responseJson);
  fox.mockResponse.setCode(403);
}

// 根据请求的 cookie 修改响应值
if(fox.mockRequest.cookies.get('projectId') === '123'){
    var idList = [1,2,3,4,5,6,7,8];
    fox.mockResponse.setBody({
        code: 0,
        data: idList.map(function(id){
            return {
                id: id,
                name: MockJs.mock('@cname'),
                email: MockJs.mock('@email'),
                city: MockJs.mock('@city'),
            }
        })
    });
}

// 设置返回延迟
fox.mockResponse.setDelay(500);

// 添加 header
fox.mockResponse.headers.add({
    key: 'X-Token',
    value: '<token>',
});

// 添加或修改 header
fox.mockResponse.headers.upsert({
    key: 'X-Token',
    value: '<token>',
});
```

### 兼容 Postman 语法示例

```javascript
// 获取自动 Mock 出来的数据
var responseJson = $$.mockResponse.json();
// 修改 responseJson 里的分页数据
// 将 page 设置为请求参数的 page
responseJson.page = $$.mockRequest.getParam("page");
// 将 total 设置 120
responseJson.total = 120;
// 将修改后的 json 写入 $$.mockResponse
$$.mockResponse.setBody(responseJson);

// 获取请求参数
var userId = $$.mockRequest.getParam("userId");
// 获取请求 Header
var userId = $$.mockRequest.headers.get("userId");
// 获取请求 Cookie
var userId = $$.mockRequest.cookies.get("userId");
// 获取请求 JSON 格式的 Body 内容
var requestJsonData = $$.mockRequest.body.toJSON();
// 获取请求 string 格式的 Body 内容
var requestStringData = $$.mockRequest.body.toString();
// 获取请求 form-data 格式的 Body 内容
var userId = $$.mockRequest.body.formdata.get("userId");
// 获取请求 urlencoded 格式的 Body 内容
var userId = $$.mockRequest.body.urlencoded.get("userId");

// 获取系统自动生成的 JSON 格式响应数据
var responseJsonData = $$.mockResponse.json();
// 设置接口返回 JSON 格式 Body
$$.mockResponse.setBody({ id: "1", name: "Apple" });
// 设置接口返回 string 格式 Body
$$.mockResponse.setBody("Hello World!");
// 设置接口返回的 HTTP 状态码
$$.mockResponse.setCode(200);
// 设置 Mock 响应延时，单位为毫秒
$$.mockResponse.setDelay(3000);
// 获取 HTTP 状态码
var statusCode = $$.mockResponse.code;
// 获取 HTTP header
var myHeader = $$.mockResponse.headers.get("X-My-Header");
// 删除当前请求里 key 为 X-My-Header 的 header
$$.mockResponse.headers.remove("X-My-Header")
// 给当前请求添加一个 key 为 X-My-Header 的 header。
$$.mockResponse.headers.add({ key: "X-My-Header", value: "hello"});
// upsert key 为 X-My-Header 的 header（如不存在则新增,如已存在则修改）。
$$.mockResponse.headers.upsert({ key: "X-My-Header", value: "hello"})
```

## API

### 请求对象 API

| 属性名 | 类型 | 说明 | 默认值 |
|-------|------|-----|-------|
| headers | Headers | 请求的 HTTP 头对象 | - |
| cookies | Cookies | 请求带的 Cookies 对象 | - |
| body | RequestBody | 请求 Body 对象（Postman 兼容） | - |
| getParam(key) | (key: string) => string | 获取请求参数,包括 Path 参数、Body 参数、Query 参数 | - |

### 响应对象 API

| 属性名 | 类型 | 说明 | 默认值 |
|-------|------|-----|-------|
| headers | Headers | 响应的 HTTP 头对象 | - |
| code | number | 系统自动生成的 HTTP 状态码 | - |
| json() | () => any | 获取系统自动生成的 JSON 格式响应数据 | - |
| setBody(body) | (body: any) => void | 设置接口返回 Body,参数支持 JSON 或字符串 | - |
| setCode(code) | (code: number) => void | 设置接口返回的 HTTP 状态码 | - |
| setDelay(duration) | (duration: number) => void | 设置 Mock 响应延时,单位为毫秒 | - |

### Headers 对象 API

| 方法名 | 参数 | 说明 | 返回值 |
|-------|------|-----|-------|
| get(key) | key: string | 获取指定 Header 的值 | string |
| add(options) | { key: string, value: string } | 添加 Header（如已存在则报错） | void |
| upsert(options) | { key: string, value: string } | 添加或修改 Header（不存在则新增,已存在则修改） | void |
| remove(key) | key: string | 删除指定 Header | void |

### RequestBody 对象 API（Postman 兼容）

| 方法名 | 参数 | 说明 | 返回值 |
|-------|------|-----|-------|
| toJSON() | - | 获取请求 JSON 格式的 Body 内容 | object |
| toString() | - | 获取请求 string 格式的 Body 内容 | string |
| formdata.get(key) | key: string | 获取请求 form-data 格式的 Body 内容 | string |
| urlencoded.get(key) | key: string | 获取请求 urlencoded 格式的 Body 内容 | string |

### Cookies 对象 API

| 方法名 | 参数 | 说明 | 返回值 |
|-------|------|-----|-------|
| get(key) | key: string | 获取指定 Cookie 的值 | string |

## 类型描述

本工具为 JavaScript 运行时环境,无静态类型定义。主要类型如下：

| 类型名 | 类型详情 | 必填 | 默认值 | 说明 |
|-------|------|-----|-------|------|
| Headers | object | 否 | - | HTTP 头对象,提供 get、add、upsert、remove 方法 |
| Cookies | object | 否 | - | Cookie 对象,提供 get 方法 |
| RequestBody | object | 否 | - | 请求 Body 对象,提供 toJSON、toString、formdata、urlencoded 属性和方法 |
| MockResponse | any | 是 | - | 响应数据,支持 JSON 对象或字符串 |

## 重要说明

### Mock 优先级
请求 Mock 数据时,规则匹配优先级为：**高级 Mock 里的期望 > 自定义 Mock 脚本**。如果匹配到了高级 Mock 里的期望,则不调用自定义 Mock 脚本。

### 使用限制
1. 此脚本仅用于「高级 Mock」的「Mock 自定义脚本」,不能用于前后置脚本中
2. 需要在接口设置中先开启此功能才能使用
3. 支持使用 require 引入 Mock.js 等依赖库

### 兼容性说明
Apifox 提供两套 API 语法：
- **fox 前缀**：Apifox 原生 API（推荐使用）
- **$$ 前缀**：兼容 Postman pm.request/pm.response 语法的 API

两套 API 功能等价,开发者可根据习惯选择使用。
