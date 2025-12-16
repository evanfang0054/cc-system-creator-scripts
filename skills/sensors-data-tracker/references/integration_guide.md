# 神策埋点集成指南

## 项目前置要求

### 技术栈要求

- React 16.8+ (支持 Hooks)
- TypeScript 3.8+
- 现代浏览器 (支持 IntersectionObserver)

### 项目结构要求

```
src/
├── layout/           # 全局布局组件
├── typings.d.ts      # 全局类型定义
├── components/       # 业务组件
└── pages/           # 页面组件
```

## 详细集成步骤

### 第一步：安装依赖

```bash
# 使用 yarn
yarn add @dragonpass/intl-unified-tracker -S

# 使用 npm
npm install @dragonpass/intl-unified-tracker -S

# 使用 pnpm
pnpm add @dragonpass/intl-unified-tracker -S
```

### 第二步：全局类型定义

在项目根目录创建或更新 `typings.d.ts`：

```typescript
/// <reference types="react" />

import Tracker from "@dragonpass/intl-unified-tracker";

declare global {
  interface Window {
    // 其他全局变量...
    dpTracker?: Tracker;
  }
}

export {}; // 确保这是一个模块
```

### 第三步：全局配置集成

#### 3.1 创建 Tracker 配置文件

```typescript
// src/config/tracker.ts
export const TRACKER_CONFIG = {
  // 项目配置
  project_id: 'your_project_id',
  app_name: 'your_app_name',
  app_version: '1.0.0',

  // 环境配置
  env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',

  // 默认公共参数
  default_params: {
    terminal_type: '3', // 3-H5
    is_from_html: '1',
  }
};
```

#### 3.2 在最外层布局中配置 Provider

```typescript
// src/layout/index.tsx
import React, { useEffect } from 'react';
import { TrackViewContext } from '@dragonpass/intl-unified-tracker';
import { useLocation } from 'react-router-dom';
import { TRACKER_CONFIG } from '@/config/tracker';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // 设置公共参数
    window.dpTracker?.setPublicParams({
      ...TRACKER_CONFIG.default_params,
      project_id: TRACKER_CONFIG.project_id,
      app_name: TRACKER_CONFIG.app_name,
      app_version: TRACKER_CONFIG.app_version,
      env: TRACKER_CONFIG.env,
    });
  }, []);

  useEffect(() => {
    // 页面切换埋点
    const pageName = getPageNameFromPath(location.pathname);

    if (pageName) {
      window.dpTracker?.sendPage({
        publicParams: {
          page_name: pageName,
        },
      });
    }

    return () => {
      // 页面卸载时结束埋点
      window.dpTracker?.sendPageEnd();
    };
  }, [location.pathname]);

  return (
    <TrackViewContext.Provider value={{ tracker: (window as any).dpTracker ?? null }}>
      {children}
    </TrackViewContext.Provider>
  );
};

// 根据路径获取页面名称的工具函数
function getPageNameFromPath(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/': 'home',
    '/products': 'product_list',
    '/products/:id': 'product_detail',
    '/cart': 'shopping_cart',
    '/checkout': 'checkout',
    '/profile': 'user_profile',
  };

  // 动态路由匹配
  for (const [route, name] of Object.entries(pathMap)) {
    if (route.includes(':')) {
      const regex = new RegExp(route.replace(/:[^/]+/, '[^/]+'));
      if (regex.test(pathname)) {
        return name;
      }
    } else if (route === pathname) {
      return name;
    }
  }

  return pathname.replace(/\//g, '_') || 'unknown_page';
}

export default Layout;
```

### 第四步：页面级埋点

```typescript
// src/pages/ProductDetail.tsx
import React, { useEffect } from 'react';
import { TrackView } from '@dragonpass/intl-unified-tracker';
import { useParams } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // 页面特定埋点
    window.dpTracker?.sendPage({
      publicParams: {
        page_name: 'product_detail',
        product_id: id,
      },
      eventData: {
        source: 'direct_access', // 访问来源
      },
    });
  }, [id]);

  const handleAddToCart = () => {
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'product_detail',
        component_name: 'add_to_cart_button',
        product_id: id,
        button_text: '加入购物车',
      },
    });
  };

  return (
    <div className="product-detail">
      <TrackView
        trackData={{
          module_name: 'product_detail',
          component_name: 'product_image',
          product_id: id,
        }}
      >
        <img src={`/products/${id}.jpg`} alt="Product" />
      </TrackView>

      <TrackView
        trackData={{
          module_name: 'product_detail',
          component_name: 'product_info',
          product_id: id,
        }}
      >
        <h1>商品详情</h1>
        <p>商品描述...</p>
      </TrackView>

      <button onClick={handleAddToCart}>
        加入购物车
      </button>
    </div>
  );
};

export default ProductDetail;
```

### 第五步：列表组件埋点

```typescript
// src/components/ProductList.tsx
import React from 'react';
import { TrackView } from '@dragonpass/intl-unified-tracker';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductClick }) => {
  return (
    <div className="product-list">
      {products.map((product, index) => (
        <TrackView
          key={product.id}
          trackData={{
            module_name: 'product_list',
            component_name: `product_item_${index}`,
            product_id: product.id,
            product_name: product.name,
            position: index + 1,
          }}
          onClick={() => onProductClick(product)}
        >
          <div className="product-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>¥{product.price}</p>
          </div>
        </TrackView>
      ))}
    </div>
  );
};

export default ProductList;
```

### 第六步：弹窗组件埋点

```typescript
// src/components/ConfirmDialog.tsx
import React from 'react';
import { Modal, Button } from 'antd';
import { TrackView } from '@dragonpass/intl-unified-tracker';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  content,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 点击确认按钮埋点
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'confirm_dialog',
        component_name: 'confirm_button',
        dialog_title: title,
      },
    });

    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 点击取消按钮埋点
    window.dpTracker?.sendClk({
      eventData: {
        module_name: 'confirm_dialog',
        component_name: 'cancel_button',
        dialog_title: title,
      },
    });

    onCancel();
  };

  return (
    <Modal
      visible={visible}
      title={title}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确认
        </Button>,
      ]}
      getContainer={() => document.getElementById('modal-root') || document.body}
    >
      <TrackView
        trackData={{
          module_name: 'confirm_dialog',
          component_name: 'content',
          dialog_title: title,
        }}
        trackClk={false}
      >
        <div>{content}</div>
      </TrackView>
    </Modal>
  );
};

export default ConfirmDialog;
```

## 高级配置

### 自定义组件集成

对于不支持 forwardRef 的自定义组件：

```typescript
// src/components/CustomCard.tsx
import React from 'react';

interface CustomCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ title, children, className }) => {
  return (
    <div className={`custom-card ${className || ''}`}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default CustomCard;

// 使用时的埋点
<TrackView
  component={CustomCard}
  trackData={{
    module_name: 'dashboard',
    component_name: 'custom_card',
    card_title: title,
  }}
  findRootNode={() => document.querySelector('.custom-card')}
  className="my-custom-card"
  title="数据概览"
>
  <div>卡片内容...</div>
</TrackView>
```

### 用户身份管理

```typescript
// src/utils/auth.ts
export class AuthTracker {
  static login(userInfo: { userId: string; userName?: string }) {
    window.dpTracker?.identify({
      user_id: userInfo.userId,
      app_name: process.env.REACT_APP_NAME || 'unknown',
      app_version: process.env.REACT_APP_VERSION || '1.0.0',
    });
  }

  static logout() {
    window.dpTracker?.anonymous();
  }

  static updateUserProfile(profile: Record<string, any>) {
    window.dpTracker?.setPublicParams({
      user_profile: profile,
    });
  }
}
```

## 测试验证

### 埋点测试工具

```typescript
// src/utils/tracker-test.ts
export const TrackerDebugger = {
  // 开启调试模式
  enableDebug() {
    if (process.env.NODE_ENV === 'development') {
      window.dpTracker?.setPublicParams({
        debug_mode: '1',
      });
    }
  },

  // 监听埋点事件
  setupEventListener() {
    if (process.env.NODE_ENV === 'development') {
      const originalSendClk = window.dpTracker?.sendClk;
      const originalSendExp = window.dpTracker?.sendExp;
      const originalSendPage = window.dpTracker?.sendPage;

      if (originalSendClk) {
        window.dpTracker.sendClk = (data) => {
          console.log('🖱️ Click Event:', data);
          return originalSendClk.call(window.dpTracker, data);
        };
      }

      if (originalSendExp) {
        window.dpTracker.sendExp = (data) => {
          console.log('👁️  Exposure Event:', data);
          return originalSendExp.call(window.dpTracker, data);
        };
      }

      if (originalSendPage) {
        window.dpTracker.sendPage = (data) => {
          console.log('📄 Page View Event:', data);
          return originalSendPage.call(window.dpTracker, data);
        };
      }
    }
  },
};

// 在应用启动时初始化
TrackerDebugger.enableDebug();
TrackerDebugger.setupEventListener();
```

## 常见问题排查

### 1. TrackView 组件不生效

**检查清单：**
- [ ] 确认 `TrackViewContext.Provider` 已正确配置
- [ ] 检查 `window.dpTracker` 是否存在
- [ ] 验证组件是否在 Provider 的子组件树中

### 2. 曝光事件未触发

**排查步骤：**
- 检查元素是否真正进入视口
- 验证 `trackExp` 是否为 `true`
- 检查 `findRootNode` 是否返回有效 DOM
- 确认 IntersectionObserver 浏览器兼容性

### 3. 点击事件重复上报

**解决方案：**
- 在嵌套组件内层使用 `e.stopPropagation()`
- 设置外层组件 `trackClk={false}`
- 确保 `trackData` 中的 `component_name` 唯一

## 数据审核和规范

### 字段审核要求

所有新增的自定义字段都必须经过审核和确认：

```typescript
// ✅ 正确的审核流程
window.dpTracker?.sendClk({
  eventData: {
    module_name: 'product_detail',
    component_name: 'add_to_cart',
    // TODO-REVIEW: 请神策团队确认 custom_metric 字段的定义和使用规范
    custom_metric: 123,
    // TODO-REVIEW: 请确认 business_unit 字段是否已在数据池中定义
    business_unit: 'electronics',
  },
});
```

### 必须添加 TODO 注释的情况

1. **未知字段**: 任何未在神策官方文档中明确说明的字段
2. **自定义字段**: 业务特定的新增字段
3. **数据类型变更**: 修改现有字段的数据类型
4. **事件类型**: 新增自定义事件类型

### 审核流程

1. **开发阶段**: 添加 TODO 注释说明需要审核的内容
2. **代码审查**: 检查所有 TODO 是否有明确的处理计划
3. **神策确认**: 提交神策团队确认字段和事件定义
4. **测试验证**: 在测试环境验证数据上报正确性
5. **生产部署**: 确保所有 TODO 都已处理完成

### 审核检查清单

在提交埋点代码前，请确认：

- [ ] 所有自定义字段都有神策团队的确认
- [ ] 事件命名符合神策规范
- [ ] 数据类型和格式正确
- [ ] 没有重复或冲突的字段定义
- [ ] 所有 TODO 注释都有明确的处理计划

## 性能优化建议

1. **合理使用曝光埋点**：避免在大列表中对所有元素都使用曝光埋点
2. **事件防抖**：对频繁触发的点击事件添加防抖逻辑
3. **懒加载埋点**：对于非关键区域的埋点，可以使用懒加载策略
4. **内存管理**：及时清理事件监听器和观察器对象