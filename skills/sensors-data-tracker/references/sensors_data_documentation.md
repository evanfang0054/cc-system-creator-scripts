# 神策数据官方文档参考

## 官方资源链接

### 主要文档

- [神策分析官方文档](https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web)
- [埋点规范参考文档](https://dragonpass.feishu.cn/sheets/IiEcs2QDXhhl97t360hc07Qmndf?sheet=oOUjTo)

### SDK 下载

```bash
# NPM 安装
npm install @dragonpass/intl-unified-tracker

# Yarn 安装
yarn add @dragonpass/intl-unified-tracker

# PNPM 安装
pnpm add @dragonpass/intl-unified-tracker
```

## 核心概念

### 1. 事件模型

神策数据采用事件驱动的数据模型，每个事件包含：

- **事件类型**：标识用户行为类型
- **事件属性**：描述事件发生时的上下文信息
- **用户属性**：描述用户的静态和动态特征

### 2. 数据保留字段

神策系统预定义了一系列保留字段，用于标准化的数据采集：

#### 用户相关保留字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| distinct_id | String | 用户唯一标识 | "user_123" |
| user_id | String | 业务用户ID | "member_456" |
| is_login | Boolean | 是否登录 | true |
| $ip | String | IP地址 | "192.168.1.1" |
| $timezone | String | 时区 | "Asia/Shanghai" |

#### 设备相关保留字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| $device_id | String | 设备唯一标识 | "device_789" |
| $os | String | 操作系统 | "iOS" |
| $os_version | String | 操作系统版本 | "15.0" |
| $manufacturer | String | 设备制造商 | "Apple" |
| $model | String | 设备型号 | "iPhone 13" |
| $screen_width | Number | 屏幕宽度 | 390 |
| $screen_height | Number | 屏幕高度 | 844 |
| $browser | String | 浏览器类型 | "Safari" |
| $browser_version | String | 浏览器版本 | "15.0" |
| $is_first_day | Boolean | 是否首日访问 | true |

#### 应用相关保留字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| $app_id | String | 应用ID | "com.example.app" |
| $app_version | String | 应用版本 | "1.0.0" |
| $lib | String | SDK类型 | "js" |
| $lib_version | String | SDK版本 | "2.0.0" |

#### 事件相关保留字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| $event | String | 事件名称 | "ViewProduct" |
| $is_first_time | Boolean | 是否首次触发 | true |
| $url | String | 页面URL | "https://example.com/product/123" |
| $title | String | 页面标题 | "商品详情页" |
| $referrer | String | 来源页面 | "https://example.com/list" |
| $referrer_domain | String | 来源域名 | "example.com" |
| $utm_source | String | UTM来源 | "google" |
| $utm_medium | String | UTM媒介 | "cpc" |
| $utm_campaign | String | UTM活动 | "summer_sale" |
| $utm_term | String | UTM关键词 | "running_shoes" |
| $utm_content | String | UTM内容 | "banner_ad" |

### 3. 事件类型规范

#### 标准事件类型

| 事件类型 | 英文标识 | 说明 | 使用场景 |
|----------|----------|------|----------|
| 页面浏览 | $AppViewScreen | 页面访问 | SPA页面切换 |
| 元素点击 | $AppClick | 元素点击 | 按钮、链接点击 |
| 元素曝光 | $AppView | 元素曝光 | 组件进入视口 |
| 应用启动 | $AppInstall | 应用首次启动 | 移动端应用 |
| 应用退出 | $AppEnd | 应用退出/页面卸载 | 页面关闭 |

#### 自定义事件类型

自定义事件应遵循以下命名规范：

- 使用驼峰命名法：`ViewProduct`, `AddToCart`, `CompletePurchase`
- 事件名以动词开头：`View`, `Click`, `Search`, `Purchase`
- 避免使用特殊字符和中文
- 保持事件名简洁且具有描述性

## API 接口文档

### 1. 初始化接口

```typescript
interface TrackerInitOptions {
  server_url: string;           // 数据接收地址
  app_id?: string;             // 应用ID
  show_log?: boolean;          // 是否显示日志
  is_single_page?: boolean;    // 是否单页应用
  heatmap?: {                  // 热图配置
    clickmap?: boolean;        // 点击图
    scroll_notice_map?: boolean; // 滚动曝光图
    load_timeout?: number;     // 页面加载超时时间
  };
  cross_subdomain?: boolean;   // 是否跨子域名
  source_channel?: string[];   // 自定义渠道参数
}

// 初始化示例
sensors.init({
  server_url: 'https://your-server.com/sa',
  app_id: 'your-app-id',
  show_log: process.env.NODE_ENV === 'development',
  is_single_page: true,
  heatmap: {
    clickmap: true,
    scroll_notice_map: true,
    load_timeout: 3000,
  },
  cross_subdomain: true,
});
```

### 2. 事件追踪接口

#### track() - 自定义事件追踪

```typescript
// 基础语法
sensors.track(eventName: string, properties?: object);

// 示例
sensors.track('ViewProduct', {
  product_id: '12345',
  product_name: '运动鞋',
  category: '服装',
  price: 299.00,
  brand: 'Nike',
});
```

#### quick() - 自动埋点

```typescript
// 启用自动埋点
sensors.quick('autoTrack');

// 自动采集的事件
// - $AppClick: 自动点击事件
// - $AppViewScreen: 页面浏览事件
// - $PageLeave: 页面离开事件
```

#### profileSet() - 用户属性设置

```typescript
// 设置用户属性（覆盖）
sensors.profileSet({
  name: '张三',
  age: 25,
  gender: '男',
  city: '北京',
});

// 设置用户属性（首次设置）
sensors.profileSetOnce({
  first_visit_time: new Date().toISOString(),
  registration_channel: 'search_engine',
});

// 增加数值型属性
sensors.profileIncrement({
  total_orders: 1,
  total_amount: 299.00,
});

// 追加列表型属性
sensors.profileAppend({
  favorite_categories: ['运动', '时尚'],
});
```

### 3. 用户身份接口

#### identify() - 设置用户标识

```typescript
// 关联业务用户ID
sensors.identify('user_12345');

// 同时设置多个标识
sensors.identify({
  user_id: 'user_12345',
  email: 'user@example.com',
  phone: '138****5678',
});
```

#### logout() - 用户登出

```typescript
// 清除用户标识，恢复匿名状态
sensors.logout();
```

### 4. 页面浏览接口

#### pageView() - 页面浏览事件

```typescript
// 手动触发页面浏览事件
sensors.pageView('ProductDetail', {
  product_id: '12345',
  category: '运动鞋',
});
```

### 5. 存储接口

#### getDistinctId() - 获取用户唯一标识

```typescript
// 获取当前用户distinct_id
const distinctId = sensors.getDistinctId();
console.log('当前用户ID:', distinctId);
```

#### getProfile() - 获取用户属性

```typescript
// 获取当前用户属性
sensors.getProfile((profile) => {
  console.log('用户属性:', profile);
});
```

## 数据格式规范

### 1. 属性值类型

| 类型 | 说明 | 示例 |
|------|------|------|
| String | 字符串类型 | "商品名称", "分类ID" |
| Number | 数值类型 | 299, 3.14 |
| Boolean | 布尔类型 | true, false |
| Date | 日期类型 | new Date(), "2023-12-01" |
| Array | 数组类型 | ["红色", "蓝色"] |
| Object | 对象类型 | {key: "value"} |

### 2. 属性名规范

- 使用英文小写字母和下划线
- 不能以数字开头
- 不能包含特殊字符（除了下划线）
- 长度限制：1-50字符

```typescript
// ✅ 正确的属性名
product_id, user_name, created_at, is_vip

// ❌ 错误的属性名
productId, 用户名称, 123_id, product@id
```

### 3. 属性值限制

- String类型：最大255字符
- Number类型：-2^63 到 2^63-1
- Array类型：最多100个元素
- Object类型：最多50个键值对

## 数据校验

### 1. 必填字段校验

```typescript
// 事件名校验
function validateEventName(eventName: string): boolean {
  // 长度检查
  if (eventName.length < 1 || eventName.length > 50) {
    return false;
  }

  // 格式检查
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return regex.test(eventName);
}

// 属性名校验
function validatePropertyName(propertyName: string): boolean {
  if (propertyName.length < 1 || propertyName.length > 50) {
    return false;
  }

  const regex = /^[a-z][a-z0-9_]*$/;
  return regex.test(propertyName);
}
```

### 2. 数据类型校验

```typescript
// 属性值校验
function validatePropertyValue(key: string, value: any): boolean {
  switch (typeof value) {
    case 'string':
      return value.length <= 255;
    case 'number':
      return !isNaN(value) && isFinite(value);
    case 'boolean':
      return true;
    case 'object':
      if (value instanceof Date) {
        return !isNaN(value.getTime());
      }
      if (Array.isArray(value)) {
        return value.length <= 100;
      }
      if (value && typeof value === 'object') {
        return Object.keys(value).length <= 50;
      }
      return false;
    default:
      return false;
  }
}
```

## 错误处理

### 1. 常见错误类型

| 错误代码 | 错误信息 | 解决方案 |
|----------|----------|----------|
| 40001 | 参数错误 | 检查参数格式和类型 |
| 40003 | 数据格式错误 | 验证属性值是否符合规范 |
| 40004 | 属性名错误 | 检查属性名命名规范 |
| 50001 | 网络错误 | 检查网络连接和服务器状态 |

### 2. 错误处理最佳实践

```typescript
// 封装安全的埋点调用
function safeTrack(eventName: string, properties: object) {
  try {
    // 数据校验
    if (!validateEventName(eventName)) {
      console.error('Invalid event name:', eventName);
      return;
    }

    const validProperties = {};
    for (const [key, value] of Object.entries(properties)) {
      if (validatePropertyName(key) && validatePropertyValue(key, value)) {
        validProperties[key] = value;
      } else {
        console.warn('Invalid property:', key, value);
      }
    }

    // 调用埋点
    sensors.track(eventName, validProperties);
  } catch (error) {
    console.error('Tracking error:', error);
  }
}
```

## 性能优化

### 1. 批量上报

```typescript
// 配置批量上报
sensors.init({
  server_url: 'https://your-server.com/sa',
  batch_send: true,
  data_url: 'https://your-server.com/sa?project=default',
  config: {
    batch_send: true,
    batch_send_file: 'sa_data.zip',
    batch_send_max_length: 20,
    batch_send_request_data: 'flush',
  },
});
```

### 2. 事件采样

```typescript
// 实现事件采样
function shouldSample(eventName: string, rate: number = 0.1): boolean {
  const hash = hashCode(eventName + Date.now());
  return (Math.abs(hash) % 100) < (rate * 100);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}
```

### 3. 本地存储优化

```typescript
// 配置本地存储
sensors.init({
  server_url: 'https://your-server.com/sa',
  use_client_time: true,
  send_type: 'beacon',
  is_track_single_page: true,
  storage: {
    name: 'sensorsdata',
    prefix: 'sa_',
    max_length: 1000,
  },
});
```

## 调试工具

### 1. 开发模式

```typescript
// 启用调试模式
sensors.init({
  server_url: 'https://your-server.com/sa',
  show_log: true,
  is_debug: true,
});

// 查看调试信息
console.log('Tracker initialized:', sensors.para);
console.log('Current distinct_id:', sensors.getDistinctId());
```

### 2. 实时日志

```typescript
// 自定义日志处理器
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, args);

  // 发送日志到神策
  if (args[0] === '[SA]') {
    sensors.track('DebugLog', {
      message: args.slice(1).join(' '),
      timestamp: new Date().toISOString(),
    });
  }
};
```

### 3. 数据验证工具

```typescript
// 埋点数据验证工具
const TrackerValidator = {
  validateEvent(eventName, properties) {
    const issues = [];

    if (!eventName || typeof eventName !== 'string') {
      issues.push('Invalid event name');
    }

    if (properties && typeof properties !== 'object') {
      issues.push('Properties must be an object');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },

  log(eventName, properties) {
    const validation = this.validateEvent(eventName, properties);
    if (!validation.valid) {
      console.error('Tracking validation failed:', validation.issues);
    }
  },
};
```

---

更多详细信息请参考神策数据官方文档：
https://manual.sensorsdata.cn/sa/docs/tech_sdk_client_web