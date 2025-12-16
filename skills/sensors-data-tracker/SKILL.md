---
name: sensors-data-tracker
description: 专业的神策埋点系统接入指导技能，提供完整的前端埋点解决方案，包括API调用、组件使用、配置规范和最佳实践。适用于需要快速集成神策数据分析的React/TypeScript项目。
---

# 神策埋点接入专家

## 概述

该技能提供完整的神策埋点系统接入指导，包括环境配置、API使用、组件集成、埋点规范和最佳实践。帮助开发者在React/TypeScript项目中快速、准确地实现用户行为数据采集。

## 核心能力

### 1. 环境配置
- **依赖包安装**: `@dragonpass/intl-unified-tracker`
- **全局配置**: TrackViewContext Provider 配置
- **类型定义**: TypeScript 全局变量声明 `window.dpTracker: Tracker`

### 2. API 埋点方法
- **事件上报**: sendClk (点击事件), sendExp (曝光开始), sendExpEnd (曝光结束)
- **页面追踪**: sendPage (页面曝光PV), sendPageEnd (页面结束曝光，记录停留时长)
- **用户管理**: identify (登录), anonymous (登出)
- **公共参数**: setPublicParams (添加公用参数)
- **其他**: sendEvent (自定义事件), sendExit (退出应用，window.unload时自动调用)

### 3. TrackView 组件使用
- **自动埋点**: 支持自动曝光和点击事件上报
- **视口监听**: 使用 IntersectionObserver 监听进入/离开视口
- **组件集成**: 支持 forwardRef 和 findRootNode 两种方式
- **列表埋点**: 按索引生成唯一标识的列表遍历模式
- **嵌套处理**: 事件冒泡处理和嵌套组件配置

### 4. 数据结构
- **事件数据**: `IPropsTrackViewTrackData` 接口定义
- **公共参数**: `IEventPublicParams` 包含环境、页面、UTM参数
- **事件类型**: 枚举定义和映射关系

## 基础配置

### 依赖安装

```bash
yarn add @dragonpass/intl-unified-tracker -S
```

### 全局类型定义

在 `typings.d.ts` 中添加：

```typescript
import Tracker from "@dragonpass/intl-unified-tracker"

declare global {
  interface Window {
    dpTracker?: Tracker
  }
}

export {} // 确保这是一个模块
```

### 项目级配置（可选）

如果需要对整个项目进行埋点配置，在最外层布局组件中注册 TrackViewContext：

```typescript
import React from 'react'
import { TrackViewContext } from '@dragonpass/intl-unified-tracker'

const App = (props: any) => {
  return (
    <TrackViewContext.Provider value={{ tracker: (window as any).dpTracker ?? null }}>
      {props.children}
    </TrackViewContext.Provider>
  )
}
```

## 使用场景

### 局部代码片段埋点

对于局部功能或组件的快速埋点：

```typescript
// 点击事件埋点
const handleClick = () => {
  window.dpTracker?.sendClk({
    eventData: {
      module_name: 'feature_module',
      component_name: 'action_button',
    },
  });
};

// 组件曝光埋点
<TrackView
  trackData={{
    module_name: 'feature_module',
    component_name: 'content_area',
  }}
  trackClk={false}
>
  <div>需要埋点的内容</div>
</TrackView>
```

### 单页面埋点

为特定页面添加完整的埋点逻辑：

```typescript
function ProductDetailPage() {
  useEffect(() => {
    // 页面访问埋点
    window.dpTracker?.sendPage({
      publicParams: {
        page_name: 'product_detail',
      },
    });

    return () => {
      window.dpTracker?.sendPageEnd();
    };
  }, []);

  const handleAddToCart = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'product_detail',
        component_name: 'add_to_cart_button',
      },
    });
  };

  return (
    <TrackView
      trackData={{
        module_name: 'product_detail',
        component_name: 'product_gallery',
      }}
    >
      <div>
        <Button onClick={handleAddToCart}>加入购物车</Button>
      </div>
    </TrackView>
  );
}
```

### 多页面项目埋点

基于实际demo的完整页面埋点示例：

```typescript
export default function DpTracker() {
  const [modalVisible, setModalVisible] = useState(false);

  // 页面级埋点
  useEffect(() => {
    window.dpTracker?.sendPage({
      publicParams: {
        page_name: 'spmB1',
      },
    });

    return () => {
      window.dpTracker?.sendPageEnd();
    };
  }, []);

  // 各种交互埋点
  const handleClick = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'demo',
        component_name: 'click',
      },
    });
  };

  const handleLogin = () => {
    window.dpTracker?.identify({
      user_id: 'test_user_id',
      DPID: 'test_DPID',
      app_name: 'test_app_name',
      app_version: '0.0.1',
    });
  };

  return (
    <TrackView
      trackData={{
        module_name: 'demo',
        component_name: 'demo_div',
      }}
      trackClk={false}
    >
      {/* 页面内容 */}
    </TrackView>
  );
}
```

### 列表渲染埋点

适用于数据列表的埋点场景：

```typescript
// 基于实际文档的列表遍历
{Array.from({ length: 10 }).map((_, idx) => {
  const className = `item-${idx}`;
  return (
    <TrackView
      key={idx}
      trackData={{
        module_name: 'list',
        component_name: `item-${idx}`,
        position: idx + 1
      }}
      findRootNode={() => document.querySelector(`.${className}`)}
    >
      <div className={className}>Item {idx}</div>
    </TrackView>
  );
})}
```

### 弹窗和对话框埋点

基于实际demo的Dialog使用：

```typescript
Dialog.show({
  title: '权益激活',
  content: (
    <TrackView
      component="div"
      trackClk={false}
      trackData={{
        module_name: 'demo_dialog',
        component_name: 'body',
      }}
    >
      <div>对话框内容</div>
    </TrackView>
  ),
  getContainer: () => document.getElementById('demo-lagyout'),
  actions: [
    {
      key: 'confirm',
      text: '确定',
      onClick: () => {
        window.dpTracker?.sendClk({
          eventData: {
            module_name: 'demo_dialog',
            coponent_name: 'confirm_button',
          },
        });
      },
    },
  ],
});
```

## 高级技巧

### 嵌套组件处理

基于实际文档中的嵌套使用示例：

```typescript
// 外层跟踪曝光，内层仅跟踪点击并阻止冒泡
<TrackView
  trackData={{ module_name: 'Modal', component_name: 'Container' }}
>
  <TrackView
    trackData={{ module_name: 'Modal', component_name: 'ConfirmButton' }}
    trackExp={false} // 内层不跟踪曝光
    onClick={(e) => {
      e.stopPropagation(); // 阻止事件冒泡
      handleConfirm();
    }}
  >
    <Button>确认</Button>
  </TrackView>
</TrackView>
```

### 自定义组件集成

对于不支持 forwardRef 的组件：

```typescript
// 使用 findRootNode 获取真实 DOM
<TrackView
  component={CustomItem}
  trackData={{ module_name: 'list', component_name: 'item-1' }}
  findRootNode={() => document.querySelector('.item-1')}
>
  内容
</TrackView>
```

## 代码规范和审核要求

### TODO 注释规范

在使用神策埋点时，对于以下情况必须添加 TODO 注释进行标记：

#### 1. 未知字段和参数

```typescript
// ❌ 错误示例 - 直接使用未经验证的字段
window.dpTracker?.sendClk({
  eventData: {
    module_name: 'product_detail',
    component_name: 'buy_button',
    unknown_field: 'some_value', // 缺少TODO注释
  },
});

// ✅ 正确示例 - 添加TODO注释说明需要审核
window.dpTracker?.sendClk({
  eventData: {
    module_name: 'product_detail',
    component_name: 'buy_button',
    // TODO: 请确认 unknown_field 字段是否符合神策数据规范，需要和数据分析团队确认
    unknown_field: 'some_value',
  },
});
```

#### 2. 新增自定义事件类型

```typescript
// ✅ 新增自定义事件时必须添加TODO
window.dpTracker?.sendEvent({
  eventType: 'custom_product_interaction',
  // TODO: 请和数据分析团队确认事件名称是否符合规范，并确认已添加到事件枚举库中
  eventData: {
    module_name: 'product_detail',
    component_name: 'custom_action',
  },
});
```

#### 3. 公共参数配置

```typescript
// ✅ 设置新的公共参数时需要审核
window.dpTracker?.setPublicParams({
  // TODO: 请确认 custom_business_param 是否已在神策数据池中定义，避免字段冲突
  custom_business_param: 'custom_value',
  // TODO: user_level 需要和用户体系团队确认数据来源和计算逻辑
  user_level: 'premium',
});
```

#### 4. 页面参数配置

```typescript
useEffect(() => {
  window.dpTracker?.sendPage({
    publicParams: {
      page_name: 'product_detail',
      // TODO: 请确认 department_id 是否符合神策数据规范，需要和产品团队确认页面分类逻辑
      department_id: 'electronics_001',
    },
    eventData: {
      // TODO: source_channel 需要确认参数值的统一规范，避免数据不一致
      source_channel: 'unknown_source',
    },
  });
}, []);
```

#### 5. TrackView 组件中的未知属性

```typescript
// ✅ TrackView 中添加新属性时需要注释
<TrackView
  trackData={{
    module_name: 'product_list',
    component_name: 'product_item',
    // TODO: 请确认 inventory_status 字段是否需要在数据分析中使用，如不需要请移除
    inventory_status: 'in_stock',
    // TODO: ai_recommendation_score 需要确认数据来源和计算逻辑
    ai_recommendation_score: 0.85,
  }}
>
  <ProductCard />
</TrackView>
```

### 审核清单

在提交代码前，请检查以下 TODO 项目是否已处理：

```typescript
// ✅ 提交前检查清单示例
interface TrackingAuditChecklist {
  // TODO-REVIEW: 确认所有自定义字段都有神策团队确认
  customFields: string[];
  // TODO-REVIEW: 确认事件命名符合神策规范
  eventNames: string[];
  // TODO-REVIEW: 确认公共参数配置正确
  publicParams: Record<string, any>;
  // TODO-REVIEW: 确认数据类型和格式符合要求
  dataFormats: string[];
}
```

### 审核流程

1. **代码审查阶段**: 检查所有 TODO 注释是否有明确的责任人和预期完成时间
2. **测试验证**: 在测试环境验证所有埋点数据是否正确上报
3. **神策团队确认**: 将新增字段和事件类型提交给神策数据团队确认
4. **生产部署**: 确保所有 TODO 项目都已处理完成

### 注意事项

- **必须添加**: 所有未经验证的字段、参数、事件类型都必须添加 TODO 注释
- **明确说明**: TODO 注释应明确说明需要确认的具体内容和负责团队
- **定期清理**: 定期检查并清理已完成的 TODO 项目
- **代码规范**: 遵循项目的代码规范和注释标准

## 常见问题解决

基于实际文档中的常见问题：

### 曝光事件未触发
1. 确认元素进入视口
2. 检查 findRootNode 是否返回真实 DOM
3. 验证 TrackViewContext.Provider 中提供了 tracker 实例

### 点击事件重复上报
1. 在内层组件 onClick 中调用 `e.stopPropagation()` 避免外层重复上报
2. 设置外层组件 trackClk={false}
3. 确保 trackData 中的 component_name 唯一，避免数据混淆

### 多次曝光抖动
- 阈值步进为 0.1，可按需调整

### 自定义组件集成
对于不支持 forwardRef 的自定义组件，可通过 findRootNode 获取真实 DOM（基于实际文档）：

```typescript
// 无 forwardRef 版本（需配合 findRootNode）
<TrackView
  component={CustomItem}
  trackData={{ module_name: 'list', component_name: 'item-1' }}
  findRootNode={() => document.querySelector('.item-1')}
>
  内容
</TrackView>
```

### 嵌套组件使用注意事项
基于实际文档中的嵌套使用指导：

- 点击事件会冒泡到外层，若不希望外层也上报，需在内层 `onClick` 调用 `e.stopPropagation()`
- 曝光事件会分别基于各自 DOM 触发
- 建议在内外层 `trackData` 中明确不同的标识，避免数据混淆

## 资源

### references/
基于实际文档和最佳实践整理：

- **tracking_specifications.md**: 基于实际文档的埋点规范和数据结构定义
- **integration_guide.md**: 完整的集成指南，包含实际项目配置
- **sensors_data_documentation.md**: 神策官方文档参考和保留字段说明

### assets/
提供基于实际demo的代码模板：

- **typescript_types.ts**: 基于实际文档定义的完整TypeScript类型
- **trackview_templates.tsx**: 基于实际demo和文档的使用模式模板

---

该技能严格基于实际文档和demo开发，提供符合 @dragonpass/intl-unified-tracker 规范的神策埋点接入指导。