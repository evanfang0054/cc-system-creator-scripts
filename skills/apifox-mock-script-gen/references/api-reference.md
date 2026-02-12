# Apifox Mock API 快速参考

本文件提供 Apifox Mock 自定义脚本的完整 API 参考。在需要查询具体 API 用法时参考此文件。

## 目录

1. [请求对象 API](#请求对象-api)
2. [响应对象 API](#响应对象-api)
3. [Headers 对象 API](#headers-对象-api)
4. [RequestBody 对象 API](#requestbody-对象-api)
5. [Cookies 对象 API](#cookies-对象-api)
6. [参数获取策略矩阵](#参数获取策略矩阵)
7. [数据类型映射表](#数据类型映射表)

## 请求对象 API

### fox.mockRequest

请求对象的入口点，提供访问请求参数、Headers、Cookies 等功能。

#### headers

类型：`Headers`

说明：请求的 HTTP 头对象

示例：
```javascript
var token = fox.mockRequest.headers.get('token');
var contentType = fox.mockRequest.headers.get('Content-Type');
```

#### cookies

类型：`Cookies`

说明：请求带的 Cookies 对象

示例：
```javascript
var sessionId = fox.mockRequest.cookies.get('sessionId');
var userToken = fox.mockRequest.cookies.get('userToken');
```

#### body

类型：`RequestBody`

说明：请求 Body 对象（Postman 兼容）

示例：
```javascript
var username = fox.mockRequest.body.username;
var userId = fox.mockRequest.body.user.id;
var firstItem = fox.mockRequest.body.items[0];
```

#### getParam(key)

类型：`(key: string) => string`

说明：获取请求参数，包括 Path 参数、Body 参数、Query 参数

示例：
```javascript
var page = fox.mockRequest.getParam('page');
var pageSize = fox.mockRequest.getParam('pageSize');
var keyword = fox.mockRequest.getParam('keyword');
```

## 响应对象 API

### fox.mockResponse

响应对象的入口点，提供设置响应数据、状态码、延迟等功能。

#### headers

类型：`Headers`

说明：响应的 HTTP 头对象

示例：
```javascript
fox.mockResponse.headers.add({
  key: 'X-Token',
  value: '<token>'
});
```

#### code

类型：`number`

说明：系统自动生成的 HTTP 状态码

示例：
```javascript
var currentCode = fox.mockResponse.code;
```

#### json()

类型：`() => any`

说明：获取系统自动生成的 JSON 格式响应数据

示例：
```javascript
var responseJson = fox.mockResponse.json();
responseJson.code = 0;
responseJson.msg = 'success';
responseJson.data = {};
```

#### setBody(body)

类型：`(body: any) => void`

说明：设置接口返回 Body，参数支持 JSON 或字符串

示例：
```javascript
// JSON 格式
fox.mockResponse.setBody({
  code: 0,
  msg: 'success',
  data: {}
});

// 字符串格式
fox.mockResponse.setBody('Hello World!');
```

#### setCode(code)

类型：`(code: number) => void`

说明：设置接口返回的 HTTP 状态码

示例：
```javascript
fox.mockResponse.setCode(200);
fox.mockResponse.setCode(404);
fox.mockResponse.setCode(500);
```

#### setDelay(duration)

类型：`(duration: number) => void`

说明：设置 Mock 响应延时，单位为毫秒

示例：
```javascript
fox.mockResponse.setDelay(500);   // 500ms
fox.mockResponse.setDelay(2000);  // 2秒
```

## Headers 对象 API

Headers 对象用于操作 HTTP 头，既可用于请求对象也可用于响应对象。

### get(key)

类型：`(key: string) => string`

说明：获取指定 Header 的值

示例：
```javascript
var token = fox.mockRequest.headers.get('token');
var auth = fox.mockRequest.headers.get('Authorization');
```

### add(options)

类型：`(options: { key: string, value: string }) => void`

说明：添加 Header（如已存在则报错）

示例：
```javascript
fox.mockResponse.headers.add({
  key: 'X-Custom-Header',
  value: 'custom-value'
});
```

### upsert(options)

类型：`(options: { key: string, value: string }) => void`

说明：添加或修改 Header（不存在则新增，已存在则修改）

示例：
```javascript
fox.mockResponse.headers.upsert({
  key: 'X-Token',
  value: '<token>'
});
```

### remove(key)

类型：`(key: string) => void`

说明：删除指定 Header

示例：
```javascript
fox.mockResponse.headers.remove('X-Old-Header');
```

## RequestBody 对象 API（Postman 兼容）

RequestBody 对象提供多种方式访问请求 Body 内容。

### toJSON()

类型：`() => object`

说明：获取请求 JSON 格式的 Body 内容

示例：
```javascript
var jsonData = fox.mockRequest.body.toJSON();
var username = jsonData.username;
```

### toString()

类型：`() => string`

说明：获取请求 string 格式的 Body 内容

示例：
```javascript
var stringData = fox.mockRequest.body.toString();
```

### formdata.get(key)

类型：`(key: string) => string`

说明：获取请求 form-data 格式的 Body 内容

示例：
```javascript
var userId = fox.mockRequest.body.formdata.get('userId');
var file = fox.mockRequest.body.formdata.get('file');
```

### urlencoded.get(key)

类型：`(key: string) => string`

说明：获取请求 urlencoded 格式的 Body 内容

示例：
```javascript
var username = fox.mockRequest.body.urlencoded.get('username');
var password = fox.mockRequest.body.urlencoded.get('password');
```

## Cookies 对象 API

Cookies 对象用于访问请求中的 Cookie。

### get(key)

类型：`(key: string) => string`

说明：获取指定 Cookie 的值

示例：
```javascript
var sessionId = fox.mockRequest.cookies.get('sessionId');
var userToken = fox.mockRequest.cookies.get('userToken');
```

## 参数获取策略矩阵

根据 HTTP 方法和参数位置选择正确的 API：

| HTTP 方法 | 参数位置 | 正确的 API | 示例 |
|----------|---------|-----------|------|
| GET | Query 参数 | `fox.mockRequest.getParam(key)` | `fox.mockRequest.getParam('page')` |
| POST | JSON Body | `fox.mockRequest.body.key` | `fox.mockRequest.body.username` |
| PUT | JSON Body | `fox.mockRequest.body.key` | `fox.mockRequest.body.id` |
| DELETE | Query 参数 | `fox.mockRequest.getParam(key)` | `fox.mockRequest.getParam('id')` |
| ALL | Headers | `fox.mockRequest.headers.get(key)` | `fox.mockRequest.headers.get('token')` |
| ALL | Cookies | `fox.mockRequest.cookies.get(key)` | `fox.mockRequest.cookies.get('sessionId')` |

## 数据类型映射表

从 API 文档提取类型后，使用对应的 Mock 数据生成策略：

| 文档类型 | JavaScript 类型 | Mock 示例 |
|---------|----------------|----------|
| `string` | String | `"测试文本"` 或 `MockJs.mock('@ctitle(5,10)')` |
| `integer` | Number (整数) | `123` 或 `MockJs.mock('@integer(1,100)')` |
| `number` | Number (浮点) | `123.45` 或 `MockJs.mock('@float(1,100,2,2)')` |
| `boolean` | Boolean | `true` 或 `false` |
| `array` | Array | `[1, 2, 3]` 或 `[{ id: 1 }]` |
| `object` | Object | `{ key: 'value' }` |
| `null` | null | `null` |

### 类型验证技巧

使用以下方法验证数据类型：

```javascript
// 基本类型检查
typeof value === 'string'           // 字符串
typeof value === 'number'           // 数字（包括 integer 和 float）
Number.isInteger(value)             // 整数
typeof value === 'boolean'          // 布尔值

// 复杂类型检查
Array.isArray(value)                // 数组
typeof value === 'object' && value !== null  // 对象
value === null                      // null
```

## 完整示例

### GET 请求示例

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 获取 Query 参数
  var page = parseInt(fox.mockRequest.getParam('page')) || 1;
  var pageSize = parseInt(fox.mockRequest.getParam('pageSize')) || 10;

  // 获取 Headers
  var token = fox.mockRequest.headers.get('token');

  // 设置响应
  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = {
    page: page,
    pageSize: pageSize,
    total: 100,
    list: []
  };

  fox.mockResponse.setBody(responseJson);
  fox.mockResponse.setDelay(500);
};

handleRequest();
```

### POST 请求示例

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 获取 JSON Body
  var username = fox.mockRequest.body.username;
  var password = fox.mockRequest.body.password;

  // 参数验证
  if (!username || !password) {
    responseJson.code = 400;
    responseJson.msg = '用户名和密码不能为空';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(400);
    return;
  }

  // 设置响应
  responseJson.code = 0;
  responseJson.msg = '登录成功';
  responseJson.data = {
    token: 'mock-token-123',
    userId: 1001
  };

  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## 重要说明

### Mock 优先级

请求 Mock 数据时，规则匹配优先级为：**高级 Mock 里的期望 > 自定义 Mock 脚本**。如果匹配到了高级 Mock 里的期望，则不调用自定义 Mock 脚本。

### 使用限制

1. 此脚本仅用于「高级 Mock」的「Mock 自定义脚本」，不能用于前后置脚本中
2. 需要在接口设置中先开启此功能才能使用
3. 支持使用 `require` 引入 Mock.js 等依赖库

### 兼容性说明

Apifox 提供两套 API 语法：
- **fox 前缀**：Apifox 原生 API（推荐使用）
- **$$ 前缀**：兼容 Postman pm.request/pm.response 语法的 API

两套 API 功能等价，开发者可根据习惯选择使用。

### Postman 语法示例

```javascript
// 获取自动 Mock 出来的数据
var responseJson = $$.mockResponse.json();

// 修改 responseJson 里的分页数据
responseJson.page = $$.mockRequest.getParam("page");
responseJson.total = 120;

// 将修改后的 json 写入 $$.mockResponse
$$.mockResponse.setBody(responseJson);

// 获取请求参数
var userId = $$.mockRequest.getParam("userId");

// 获取请求 Header
var userId = $$.mockRequest.headers.get("userId");

// 获取请求 Cookie
var userId = $$.mockRequest.cookies.get("userId");

// 设置接口返回的 HTTP 状态码
$$.mockResponse.setCode(200);

// 设置 Mock 响应延时，单位为毫秒
$$.mockResponse.setDelay(3000);
```
