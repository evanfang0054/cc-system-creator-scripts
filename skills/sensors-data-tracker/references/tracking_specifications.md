# 神策埋点规范与数据结构

## 事件类型枚举

### 开发者事件类型

```typescript
export const TRACK_EVENT_TYPE = {
  clk: 'clk',        // 点击事件
  exp: 'exp',        // 曝光事件
  page: 'page',      // 页面开始事件
  pageEnd: 'pageEnd', // 页面结束事件
  expEnd: 'expEnd',  // 曝光结束事件
  exit: 'exit',      // 退出事件，页面hidden时触发
};
```

### 数据落库事件类型

```typescript
export const TRACK_TRIGGER_TYPE = {
  Click: 'Click',
  Exp: 'Exp',
  View: 'View',
  Exit: 'Exit',
};
```

### 事件类型映射

```typescript
export const TRACK_EVENT_TYPE_MAP = {
  [TRACK_EVENT_TYPE.clk]: TRACK_TRIGGER_TYPE.Click,
  [TRACK_EVENT_TYPE.exp]: TRACK_TRIGGER_TYPE.Exp,
  [TRACK_EVENT_TYPE.expEnd]: TRACK_TRIGGER_TYPE.View,
  [TRACK_EVENT_TYPE.page]: TRACK_TRIGGER_TYPE.Exp,
  [TRACK_EVENT_TYPE.pageEnd]: TRACK_TRIGGER_TYPE.View,
  [TRACK_EVENT_TYPE.exit]: TRACK_TRIGGER_TYPE.Exit,
};
```

## 数据结构定义

### 事件数据结构

```typescript
export interface IPropsTrackViewTrackData {
  module_name: string;
  component_name?: string;
  [key: string]: any;
}
```

### 公共参数结构

```typescript
export interface IEventPublicParams {
  env?: string;                    // 环境标识
  h5_version?: string;             // h5应用的版本版本
  project_id?: string;             // 业务项目ID
  page_name?: string;              // 页面名称
  referral_page_name?: string;     // 上一跳来源，格式：project_id.page_name
  is_from_html?: '1' | null;       // 是否来源于H5 (From H5 1/null)，默认1
  terminal_type?: string;          // 终端类型：1-iOS，2-Android，3-H5，4-WeChatMiniprogram
  os_type?: string;                // 操作系统，如iOS、Android
  os_version?: string;             // 操作系统版本，例如：17.5
  utm_source?: string;             // 活动来源名
  utm_medium?: string;             // 媒介
  utm_campaign?: string;           // 活动
  utm_term?: string;               // 关键词
  utm_content?: string;            // 内容
  source?: string;                 // 来源：h5, deeplink等
  [key: string]: any;
}
```

### 用户身份信息

```typescript
export interface IUserIdentity {
  user_id: string;      // 用户ID，通常是memberId
  DPID?: string;        // 会籍ID，saas项目不需要
  app_name: string;     // 应用名称
  app_version: string;  // 应用版本
}
```

## TrackView 组件属性

### 核心属性

```typescript
interface TrackViewProps<T = any> {
  // 渲染相关
  component?: React.ElementType<T>;  // 指定渲染的元素或组件类型，默认 'div'

  // 埋点数据
  trackData: IPropsTrackViewTrackData;  // 必需的埋点数据
  trackExp?: boolean;              // 是否跟踪曝光，默认 true
  trackClk?: boolean;              // 是否跟踪点击，默认 true

  // DOM查找
  findRootNode?: () => Element | null | undefined;  // 获取真实DOM

  // 事件回调
  onFirstExp?: () => void;         // 首次曝光回调
  onFirstExpEnd?: () => void;      // 首次曝光结束回调
  onExp?: ({ amount }: { amount: number }) => void;      // 曝光回调
  onExpEnd?: ({ amount }: { amount: number }) => void;   // 曝光结束回调
  onClick?: (event: React.MouseEvent) => void;  // 点击回调
}
```

## 上下文存储结构

### 曝光上下文

```typescript
interface IExpContextStorage {
  expTimes?: number;     // 曝光次数
  expEndTimes?: number;  // 曝光结束次数
}
```

## 埋点命名规范

### module_name 命名规范

- 使用英文小写字母和下划线
- 采用层级结构：`page_section_component`
- 示例：
  - `home_banner`
  - `product_list_item`
  - `checkout_payment_form`

### component_name 命名规范

- 在 module_name 基础上的具体组件标识
- 使用英文小写字母和数字
- 示例：
  - `search_button`
  - `product_image_1`
  - `confirm_dialog`

## 事件上报时机

### 曝光事件

- **开始时机**: 元素进入视口达到阈值（默认50%）
- **结束时机**: 元素离开视口或页面隐藏
- **去重策略**: 同一组件的曝光事件有去重机制

### 点击事件

- **触发时机**: 用户点击被包装的元素
- **冒泡处理**: 支持阻止事件冒泡避免重复上报

### 页面事件

- **开始事件**: 页面加载完成或路由切换时
- **结束事件**: 页面卸载或路由切换前
- **停留时长**: 自动计算页面停留时间

## 数据质量要求

### 必填字段

- `module_name`: 必须提供，用于标识功能模块
- 其他字段根据具体业务需求补充

### 数据类型

- 字符串类型：不超过255字符
- 数值类型：使用number类型
- 布尔类型：使用boolean类型

### 特殊字符处理

- 避免使用特殊字符：`@`, `#`, `$`, `%`, `^`, `&`, `*`
- 中文字符需要UTF-8编码
- 空值使用null或undefined，不使用空字符串