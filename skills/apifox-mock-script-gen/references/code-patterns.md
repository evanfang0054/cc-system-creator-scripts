# Apifox Mock 代码模式库

本文件包含各种常见场景的 Mock 脚本代码模式。在需要生成特定功能的 Mock 脚本时参考这些模式。

## 目录

1. [基础结构](#基础结构)
2. [分页数据处理](#分页数据处理)
3. [Token 验证](#token-验证)
4. [Mock.js 随机数据](#mockjs-随机数据)
5. [异常场景模拟](#异常场景模拟)
6. [网络延迟模拟](#网络延迟模拟)
7. [参数校验逻辑](#参数校验逻辑)

## 基础结构

适用于所有 Mock 脚本的基础模板。

```javascript
var MockJs = require('mockjs');

var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // GET 请求：获取 Query 参数
  var page = fox.mockRequest.getParam('page') || '1';

  // POST 请求：获取 JSON Body
  var body = fox.mockRequest.body || {};

  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = {
    page: page,
    moduleId: body.module || 1
  };

  fox.mockResponse.setBody(responseJson);
  fox.mockResponse.setDelay(300);
};

handleRequest();
```

## 分页数据处理

适用于需要分页的列表接口。

```javascript
var MockJs = require('mockjs');

var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 获取分页参数
  var page = parseInt(fox.mockRequest.getParam('page')) || 1;
  var pageSize = parseInt(fox.mockRequest.getParam('pageSize')) || 10;

  // 生成分页数据
  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = {
    page: page,
    pageSize: pageSize,
    total: 120,
    list: MockJs.mock({
      'list|10': [{
        'id|+1': (page - 1) * pageSize + 1,
        name: '@cname',
        email: '@email'
      }]
    }).list
  };

  fox.mockResponse.setBody(responseJson);
  fox.mockResponse.setDelay(300);
};

handleRequest();
```

## Token 验证

适用于需要身份验证的接口。

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 验证 Token
  var token = fox.mockRequest.headers.get('token');
  if (!token) {
    responseJson.code = 401;
    responseJson.msg = '未授权：缺少 Token';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(401);
    return;
  }

  // Token 验证通过
  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = {
    userId: 1001,
    username: 'test_user'
  };

  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## Mock.js 随机数据

适用于需要生成大量测试数据的场景。

```javascript
var MockJs = require('mockjs');

var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = MockJs.mock({
    // 用户列表
    'list|5-10': [{
      'id|+1': 1,
      name: '@cname',           // 中文姓名
      email: '@email',           // 邮箱
      phone: /^1[3-9]\d{9}$/,   // 手机号
      avatar: '@image("100x100")', // 头像
      address: '@city(true)',    // 地址
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
    }],
    // 统计数据
    stats: {
      'total|100-1000': 1,
      'active|50-500': 1,
      'rate|1-100': 1
    }
  });

  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## 异常场景模拟

适用于需要测试各种错误情况的场景。

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 获取参数
  var id = fox.mockRequest.getParam('id');

  // 异常场景1：资源不存在
  if (id === '999') {
    responseJson.code = 404;
    responseJson.msg = '资源不存在';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(404);
    return;
  }

  // 异常场景2：服务器错误
  if (id === '500') {
    responseJson.code = 500;
    responseJson.msg = '服务器内部错误';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(500);
    return;
  }

  // 正常响应
  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = { id: id, name: '测试数据' };
  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## 网络延迟模拟

适用于需要测试加载状态的场景。

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 模拟不同的延迟场景
  var delayType = fox.mockRequest.getParam('delay');

  if (delayType === 'slow') {
    fox.mockResponse.setDelay(2000); // 慢速：2秒
  } else if (delayType === 'fast') {
    fox.mockResponse.setDelay(100);  // 快速：100ms
  } else {
    fox.mockResponse.setDelay(500);  // 正常：500ms
  }

  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = { message: '请求成功' };

  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## 参数校验逻辑

适用于需要验证请求参数的场景。

```javascript
var handleRequest = function() {
  var responseJson = fox.mockResponse.json();

  // 获取参数
  var email = fox.mockRequest.getParam('email');
  var phone = fox.mockRequest.getParam('phone');

  // 校验邮箱格式
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    responseJson.code = 400;
    responseJson.msg = '邮箱格式不正确';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(400);
    return;
  }

  // 校验手机号格式
  var phoneRegex = /^1[3-9]\d{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    responseJson.code = 400;
    responseJson.msg = '手机号格式不正确';
    fox.mockResponse.setBody(responseJson);
    fox.mockResponse.setCode(400);
    return;
  }

  // 校验通过
  responseJson.code = 0;
  responseJson.msg = 'success';
  responseJson.data = {
    email: email,
    phone: phone
  };

  fox.mockResponse.setBody(responseJson);
};

handleRequest();
```

## Mock.js 常用方法速查

### 基础数据类型
```javascript
'@string'           // 随机字符串
'@integer'          // 随机整数
'@float'            // 随机浮点数
'@boolean'          // 随机布尔值
```

### 个人信息
```javascript
'@cname'            // 中文姓名
'@name'             // 英文姓名
'@email'            // 邮箱
'@phone'            // 手机号
'@id'               // 身份证号
'@ip'               // IP 地址
```

### 地址和位置
```javascript
'@city(true)'       // 带省份的城市
'@county(true)'     // 带城市的区县
'@address'          // 完整地址
'@zip'              // 邮政编码
```

### 时间和日期
```javascript
'@datetime'         // 完整日期时间
'@date'             // 日期
'@time'             // 时间
'@datetime("yyyy-MM-dd HH:mm:ss")'  // 自定义格式
```

### 图片和颜色
```javascript
'@image("200x100")' // 指定尺寸图片
'@color'            // 随机颜色
'@rgb'              // RGB 颜色
```

### 文本内容
```javascript
'@ctitle'           // 中文标题
'@cparagraph'       // 中文段落
'@csentence'        // 中文句子
'@cword'            // 中文单词
```

### 数组操作
```javascript
'list|10'           // 固定10个元素
'list|5-10'         // 5-10个随机元素
'id|+1'             // 自增ID
```
