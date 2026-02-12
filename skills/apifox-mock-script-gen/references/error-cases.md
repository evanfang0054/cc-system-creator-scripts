# Apifox Mock 错误案例库

本文件收录了常见的 Mock 脚本错误案例及其正确解决方案。在遇到问题时参考这些案例可以快速定位和修复问题。

## 目录

1. [错误 #1：脚本不生效](#错误-1脚本不生效-最高频错误)
2. [错误 #2：POST Body 参数获取错误](#错误-2post-body-参数获取错误)
3. [错误 #3：Mock.js 字符串拼接](#错误-3mockjs-字符串拼接)
4. [错误 #4：全局作用域 return](#错误-4全局作用域-return)
5. [错误 #5：数据类型不匹配](#错误-5数据类型不匹配)
6. [错误 #6：嵌套类型不匹配](#错误-6嵌套类型不匹配-高频错误)
7. [错误 #7：深层嵌套类型错误](#错误-7深层嵌套类型错误)

## 错误 #1：脚本不生效 ⚠️ 最高频错误

**症状**：脚本保存后没有任何效果

### 错误代码
```javascript
// ❌ 错误：使用参数化函数（不会被执行）
function handleMockRequest(req, res) {
  var responseJson = fox.mockResponse.json();
  responseJson.code = 0;
  res.json(responseJson);  // 方法不存在
  return responseJson;     // return 无效
}
```

### 正确代码
```javascript
// ✅ 正确：定义并手动调用
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();
  responseJson.code = 0;
  fox.mockResponse.setBody(responseJson);
};

handleRequest();  // 必须手动调用
```

### 问题分析
1. Apifox 不会自动调用带参数的函数
2. 必须使用 `var` 声明函数表达式
3. 必须在脚本末尾手动调用该函数
4. 不能使用 `res.json()` 等不存在的方法

## 错误 #2：POST Body 参数获取错误

**症状**：获取不到 POST 请求的参数

### 错误代码
```javascript
// ❌ 错误1：方法不存在
var body = fox.mockRequest.getJson();

// ❌ 错误2：嵌套路径访问
var module = fox.mockRequest.getParam('body.module');
```

### 正确代码
```javascript
// ✅ 正确：直接访问 body 对象
var body = fox.mockRequest.body || {};
var module = body.module || 1;
```

### 问题分析
1. POST/PUT 请求的 JSON Body 通过 `fox.mockRequest.body` 访问
2. Body 是一个对象，可以直接通过点号访问属性
3. 不要使用 `getParam()` 访问 Body 内容

## 错误 #3：Mock.js 字符串拼接

**症状**：语法错误或数据不生成

### 错误代码
```javascript
// ❌ 错误：使用字符串拼接
var data = MockJs.mock('@pick(' + JSON.stringify(arr) + ')');
```

### 正确代码
```javascript
// ✅ 正确：使用原生 JavaScript
var data = arr[Math.floor(Math.random() * arr.length)];
```

### 问题分析
1. Mock.js 的占位符不支持动态参数拼接
2. 对于简单随机选择，使用原生 JavaScript 更可靠
3. 复杂场景可以考虑使用 Mock.js 的其他占位符

## 错误 #4：全局作用域 return

**症状**：报错 "Illegal return statement"

### 错误代码
```javascript
// ❌ 错误：return 在全局作用域
var token = fox.mockRequest.headers.get('token');
if (!token) {
  responseJson.code = 401;
  fox.mockResponse.setBody(responseJson);
  return;  // 非法！
}
```

### 正确代码
```javascript
// ✅ 正确：包装在函数中
var handleRequest = function() {
  var token = fox.mockRequest.headers.get('token');
  if (!token) {
    responseJson.code = 401;
    fox.mockResponse.setBody(responseJson);
    return;  // 在函数中合法
  }
  // 其他逻辑...
};
handleRequest();
```

### 问题分析
1. JavaScript 不能在全局作用域使用 `return`
2. 所有逻辑必须包装在函数中
3. `return` 只能在函数内部使用

## 错误 #5：数据类型不匹配

**症状**：前端报类型错误

### 错误示例
```javascript
// ❌ 文档定义 businessHours 为 object，但生成 array
responseJson.data.businessHours = [];

// ❌ 文档定义 day 为 integer，但生成 string
responseJson.data.day = '周一';

// ✅ 正确
responseJson.data.businessHours = { open: '09:00', close: '18:00' };
responseJson.data.day = 1;
```

### 问题分析
1. 必须严格按照 API 文档的类型定义生成数据
2. 常见类型错误：
   - `object` → `[]` （应该是 `{}`）
   - `string` → `123` （应该是 `'123'`）
   - `integer` → `'123'` （应该是 `123`）

### 预防措施
```javascript
// 从 API 文档提取类型定义
// $.data.businessHours: object
// $.data.day: integer

// 创建类型映射表
var typeMapping = {
  'businessHours': 'object',
  'day': 'integer'
};

// 按类型生成数据
responseJson.data.businessHours = { open: '09:00', close: '18:00' };
responseJson.data.day = 1;
```

## 错误 #6：嵌套类型不匹配 ⚠️ 高频错误

**症状**：类型检查工具报错，如 `$.data.businessHours 应当是 array 类型`

### 真实案例
```javascript
// ❌ 错误：根据业务习惯假设结构，未查看文档
responseJson.data.businessHours = {
  monday: '05:00-18:00',
  tuesday: '06:00-09:00'
};

// ✅ 正确：按文档定义为 array
responseJson.data.businessHours = [
  { day: 1, open: '05:00', close: '18:00' },
  { day: 2, open: '06:00', close: '09:00' }
];
```

### 错误根源
1. 未获取 API 文档，凭经验假设数据结构
2. 忽略了嵌套字段的类型定义
3. 未进行逐字段类型核对

### 预防措施
```javascript
// 步骤1：从文档提取类型定义
// $.data.businessHours: array[object]
// $.data.businessHours[0].day: integer
// $.data.businessHours[0].open: string

// 步骤2：创建类型映射表
var typeMapping = {
  'businessHours': 'array',
  'businessHours[].day': 'integer',
  'businessHours[].open': 'string'
};

// 步骤3：按类型生成数据
responseJson.data.businessHours = [
  { day: 1, open: '05:00', close: '18:00' }  // day 是 integer
];
```

## 错误 #7：深层嵌套类型错误

**症状**：用户反馈 `$.data.businessHours[0].day 应当是 integer 类型`

### 错误示例
```javascript
// ❌ 错误：使用字符串表示星期
responseJson.data.businessHours = [
  { day: 'monday', open: '05:00', close: '18:00' },
  { day: 'tuesday', open: '06:00', close: '09:00' }
];

// ✅ 正确：使用整数表示星期
responseJson.data.businessHours = [
  { day: 1, open: '05:00', close: '18:00' },
  { day: 2, open: '06:00', close: '09:00' }
];
```

### 类型对照表
| 字段路径 | 错误类型 | 正确类型 | 说明 |
|---------|---------|---------|------|
| `$.data.businessHours` | object | array | 营业时间列表 |
| `$.data.description` | string | object | 描述信息结构 |
| `$.data.businessHours[0].day` | string | integer | 星期（1-7） |

### 完整验证流程
```javascript
// 步骤1：从 API 文档提取类型定义
// 步骤2：创建类型映射表（包含嵌套字段）
// 步骤3：根据类型选择对应的 Mock 规则
// 步骤4：生成代码后逐字段核对
// 步骤5：检查嵌套类型（array 元素、object 字段）
// 步骤6：验证输出代码的类型一致性
```

## 类型错误典型案例

### 案例1：资源详情接口类型错误

**场景**：生成资源详情 Mock 脚本

**错误过程**：
```
第1轮：用户描述需求
  → businessHours: "周一是5-18，周二是6到9点"
  → AI 理解为 object 类型 {monday: "5-18"}

第2轮：用户纠正
  → "$.data.businessHours 应当是 array 类型"
  → AI 修改为 array [{day: "monday"}]

第3轮：用户再次纠正
  → "$.data.businessHours[0].day 应当是 integer 类型"
  → AI 最终修改为 [{day: 1}]
```

**正确流程**（避免3次修正）：
```
步骤1：获取 API 文档（获取真实的类型定义）
步骤2：提取类型映射表
  {
    "businessHours": "array",
    "businessHours[].day": "integer",
    "description": "object"
  }
步骤3：按类型生成 Mock 数据
步骤4：逐字段验证类型
```

**教训**：如果一开始就获取文档，可以避免 100% 的类型错误。

## 快速故障排除

### 问题：脚本不生效
检查清单：
- [ ] 使用了 `var handleRequest = function() {}` 而不是 `function handleRequest()`
- [ ] 在脚本末尾调用了 `handleRequest()`
- [ ] 没有使用 `(req, res)` 参数
- [ ] 使用了 `fox.mockResponse.setBody()` 而不是 `res.json()`

### 问题：获取不到参数
检查清单：
- [ ] GET 请求使用 `fox.mockRequest.getParam(key)`
- [ ] POST 请求使用 `fox.mockRequest.body.key`
- [ ] Headers 使用 `fox.mockRequest.headers.get(key)`
- [ ] 参数名称拼写正确

### 问题：类型错误
检查清单：
- [ ] 已获取 API 文档
- [ ] 创建了类型映射表
- [ ] 逐字段验证了类型
- [ ] 检查了嵌套字段的类型
- [ ] integer 使用数字而不是字符串
- [ ] array 使用 `[]` 而不是 `{}`
- [ ] object 使用 `{}` 而不是 `[]`
