/**
 * 神策埋点 TypeScript 类型定义模板
 * 可直接复制到项目中使用
 *
 * 重要提醒：
 * - 任何新增的自定义字段都需要添加 TODO 注释进行人工审核
 * - 请确保所有上报的数据字段都符合神策数据规范
 * - 对于未知字段或需要确认的字段，请参考 SKILL.md 中的代码规范和审核要求
 */

// ==================== 基础类型定义 ====================

/**
 * 事件类型枚举（开发者使用）
 */
export const TRACK_EVENT_TYPE = {
  clk: 'clk',        // 点击事件
  exp: 'exp',        // 曝光事件
  page: 'page',      // 页面开始事件
  pageEnd: 'pageEnd', // 页面结束事件
  expEnd: 'expEnd',  // 曝光结束事件
  exit: 'exit',      // 退出事件，页面hidden时触发
} as const;

/**
 * 数据落库事件类型
 */
export const TRACK_TRIGGER_TYPE = {
  Click: 'Click',
  Exp: 'Exp',
  View: 'View',
  Exit: 'Exit',
} as const;

/**
 * 事件类型映射
 */
export const TRACK_EVENT_TYPE_MAP = {
  [TRACK_EVENT_TYPE.clk]: TRACK_TRIGGER_TYPE.Click,
  [TRACK_EVENT_TYPE.exp]: TRACK_TRIGGER_TYPE.Exp,
  [TRACK_EVENT_TYPE.expEnd]: TRACK_TRIGGER_TYPE.View,
  [TRACK_EVENT_TYPE.page]: TRACK_TRIGGER_TYPE.Exp,
  [TRACK_EVENT_TYPE.pageEnd]: TRACK_TRIGGER_TYPE.View,
  [TRACK_EVENT_TYPE.exit]: TRACK_TRIGGER_TYPE.Exit,
} as const;

// ==================== 接口定义 ====================

/**
 * 埋点事件数据基础接口
 */
export interface ITrackEventData {
  module_name: string;
  component_name?: string;
  [key: string]: any;
}

/**
 * 公共参数接口
 */
export interface IEventPublicParams {
  env?: string;                    // 环境标识
  h5_version?: string;             // h5应用的版本
  project_id?: string;             // 业务项目ID
  page_name?: string;              // 页面名称
  referral_page_name?: string;     // 上一跳来源，格式：project_id.page_name
  is_from_html?: '1' | null;       // 是否来源于H5，默认1
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

/**
 * 用户身份信息接口
 */
export interface IUserIdentity {
  user_id: string;      // 用户ID，通常是memberId
  DPID?: string;        // 会籍ID，saas项目不需要
  app_name: string;     // 应用名称
  app_version: string;  // 应用版本
}

/**
 * 曝光上下文存储接口
 */
export interface IExpContextStorage {
  expTimes?: number;     // 曝光次数
  expEndTimes?: number;  // 曝光结束次数
}

/**
 * TrackView 组件属性接口
 */
export interface ITrackViewProps<T = any> {
  // 渲染相关
  component?: React.ElementType<T>;  // 指定渲染的元素或组件类型，默认 'div'
  className?: string;
  id?: string;

  // 埋点数据
  trackData: ITrackEventData;  // 必需的埋点数据
  trackExp?: boolean;          // 是否跟踪曝光，默认 true
  trackClk?: boolean;          // 是否跟踪点击，默认 true

  // DOM查找
  findRootNode?: () => Element | null | undefined;  // 获取真实DOM

  // 事件回调
  onFirstExp?: () => void;         // 首次曝光回调
  onFirstExpEnd?: () => void;      // 首次曝光结束回调
  onExp?: (data: { amount: number }) => void;      // 曝光回调
  onExpEnd?: (data: { amount: number }) => void;   // 曝光结束回调
  onClick?: (event: React.MouseEvent) => void;  // 点击回调

  // React 属性
  children?: React.ReactNode;
  [key: string]: any;
}

// ==================== API 调用接口 ====================

/**
 * 点击事件参数
 */
export interface ISendClkParams {
  eventData: ITrackEventData;
}

/**
 * 曝光事件参数
 */
export interface ISendExpParams {
  eventData: ITrackEventData;
  ctxStorage?: IExpContextStorage;
}

/**
 * 曝光结束事件参数
 */
export interface ISendExpEndParams {
  eventData: ITrackEventData;
  ctxStorage?: IExpContextStorage;
}

/**
 * 页面事件参数
 */
export interface ISendPageParams {
  publicParams?: IEventPublicParams;
  eventData?: ITrackEventData;
}

/**
 * 自定义事件参数
 */
export interface ISendEventParams {
  eventType: string;
  publicParams?: IEventPublicParams;
  eventData?: ITrackEventData;
}

// ==================== 业务场景类型 ====================

/**
 * 商品相关埋点数据
 */
export interface IProductTrackData extends ITrackEventData {
  product_id: string;
  product_name?: string;
  product_price?: number;
  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  position?: number;        // 在列表中的位置
  price_range?: string;     // 价格区间
  is_promoted?: boolean;    // 是否推广商品
  discount_rate?: number;   // 折扣率
}

/**
 * 搜索相关埋点数据
 */
export interface ISearchTrackData extends ITrackEventData {
  search_term?: string;     // 搜索关键词
  search_type?: string;     // 搜索类型
  result_count?: number;    // 搜索结果数量
  search_source?: string;   // 搜索来源
  filter_options?: Record<string, any>;  // 筛选条件
  sort_option?: string;     // 排序选项
}

/**
 * 用户行为埋点数据
 */
export interface IUserActionTrackData extends ITrackEventData {
  user_id?: string;
  action_type?: string;     // 行为类型
  action_target?: string;   // 行为目标
  action_value?: any;       // 行为值
  previous_state?: string;  // 之前状态
  new_state?: string;       // 新状态
}

/**
 * 页面性能埋点数据
 */
export interface IPerformanceTrackData extends ITrackEventData {
  load_time?: number;       // 加载时间
  render_time?: number;     // 渲染时间
  interaction_time?: number; // 交互时间
  error_count?: number;     // 错误数量
  network_type?: string;    // 网络类型
  device_type?: string;     // 设备类型
}

// ==================== 常用类型工具 ====================

/**
 * 埋点配置选项
 */
export interface ITrackerConfig {
  project_id: string;
  app_name: string;
  app_version: string;
  env?: string;
  debug?: boolean;
  auto_track?: boolean;
  batch_size?: number;
  flush_interval?: number;
}

/**
 * 埋点事件类型
 */
export type TrackerEventType = keyof typeof TRACK_EVENT_TYPE;

/**
 * 埋点数据工厂函数
 */
export class TrackDataFactory {
  static createProductData(data: Partial<IProductTrackData>): IProductTrackData {
    return {
      module_name: 'product',
      component_name: 'unknown',
      ...data,
    };
  }

  static createSearchData(data: Partial<ISearchTrackData>): ISearchTrackData {
    return {
      module_name: 'search',
      component_name: 'search_bar',
      ...data,
    };
  }

  static createUserActionData(data: Partial<IUserActionTrackData>): IUserActionTrackData {
    return {
      module_name: 'user_action',
      component_name: 'action_button',
      ...data,
    };
  }
}

// ==================== 全局声明 ====================

/**
 * 扩展 Window 接口
 */
declare global {
  interface Window {
    dpTracker?: {
      sendClk: (params: ISendClkParams) => void;
      sendExp: (params: ISendExpParams) => void;
      sendExpEnd: (params: ISendExpEndParams) => void;
      sendPage: (params: ISendPageParams) => void;
      sendPageEnd: () => void;
      sendEvent: (params: ISendEventParams) => void;
      identify: (params: IUserIdentity) => void;
      anonymous: () => void;
      setPublicParams: (params: Partial<IEventPublicParams>) => void;
      sendExit?: () => void;
    };
  }
}

export {};