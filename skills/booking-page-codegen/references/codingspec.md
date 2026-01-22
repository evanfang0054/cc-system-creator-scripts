# 编码规范

## 概述

本文档定义了前端编码规范和最佳实践，旨在确保代码质量、一致性和可维护性。

## 技术栈

- **构建工具**: Rollup 4.x + TypeScript 5.7.x
- **框架**: React 18.2.0 + TypeScript
- **UI 库**: Ant Design Mobile 5.38.1 + @dragonpass/atom-ui-mobile
- **状态管理**: React Context (推荐) 或 Zustand
- **路由**: React Router v7

## 项目结构规范

### 目录命名规范

- 使用小写字母和连字符 (kebab-case)
- 组件目录使用语义化命名
- 避免缩写，使用描述性名称

## 文件引用规范

### 路径别名配置

使用 `@/*` 别名简化文件路径引用：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 引用规范

#### 1. Context 和 Provider 引用

```typescript
// ✅ 推荐方式
import { useProductConfig } from '@/context/provider';
import { AuthContext } from '@/context/auth';

// ❌ 避免相对路径
import { useProductConfig } from '../../../context/provider';
```

#### 2. 类型定义引用

```typescript
// ✅ 推荐：统一从 types 目录导入
import {
  BookingData,
  ContractData,
  FormValidationState,
  TimeDataItem
} from '@/types/standard';

// ✅ 推荐：按需导入
import type { BookingData } from '@/types/standard';
```

#### 3. 状态管理引用

```typescript
// ✅ Zustand 状态管理
import { useBookingStore } from '@/lfd/stores/useBookingStore';

// ✅ Context 状态管理
import { useAuthContext } from '@/context/auth';
```

#### 4. 工具函数和 Hooks 引用

```typescript
// ✅ 自定义 Hooks
import { useRouteParams } from '@/hooks/useRouteParams';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ✅ 工具函数
import { formatCurrency } from '@/utils/currency';
import { validateEmail } from '@/utils/validation';
```

### 2. Props 设计规范

```typescript
// interface.ts
interface LoungeBookingFormProps {
  // 数据属性
  initialData?: BookingData;
  formData: FormValidationState;

  // 配置属性
  disabled?: boolean;
  loading?: boolean;
  theme?: 'light' | 'dark';

  // 事件回调
  onSubmit?: (data: BookingData) => void;
  onDataChange?: (data: Partial<BookingData>) => void;
  onValidationChange?: (isValid: boolean) => void;
}
```

### Form 表单规范

```typescript
// ✅ 表单组件使用 Form 组件
import { CSSProperties } from 'react';
import { Form, LabelInput } from '@dragonpass/atom-ui-mobile';

const [form] = Form.useForm();

<Form
                    form={form}
                    onValuesChange={onValuesChange}
                    style={{
                        '--dp-aum-border-color': '#cdcbcb',
                    } as CSSProperties}
                    className="[&_.adm-list-body]:bg-inherit [&_.adm-list-body]:border-none [&_.adm-list-body]:text-[14px] [&_.adm-list-item]:p-0 [&_.adm-list-item-content]:border-none [&_.adm-list-item-content-main]:p-0 [&_.adm-list-item]:w-full"
                >
<Form.Item
  name="flightNumber"
  rules={[
    { required: true },
    {
      validator: (_, value) =>
        !value || isValidFlightNumber(value)
          ? Promise.resolve()
          : Promise.reject(new Error(t('InvalidFlightNumber')))
    }
  ]}
  className="mt-[16px] [&_.adm-list-item]:p-0"
>
  <LabelInput
    placeholder={t(required ? 'FlightNumber' : 'FlightNumberOptional')}
    suffix={<FlightOutline className="text-[16px]" />}
    maxLength={6}
    className="shrink-0 h-[52px]"
  />
</Form.Item>
</Form>
```

## 状态管理规范

### 状态管理选择原则

**跨页面数据必须使用 Zustand Store 统一管理**

#### 适用场景

**✅ 必须使用 Zustand Store 的场景：**

1. **跨页面共享数据**
   - 在多个页面间共享的业务数据（如预订信息、用户选择）
   - 需要在页面跳转后保持状态的数据
   - 需要从详情页传递到预订页/确认页的数据

2. **复杂应用状态**
   - 表单的多步骤数据（多页面表单）
   - 需要持久化的用户偏好设置
   - 全局加载状态、错误状态

3. **需要响应式更新的全局数据**
   - 购物车类数据
   - 多个组件都需要监听变化的数据

**✅ 可以使用 Context 的场景：**

1. **单一页面内的局部状态**
   - 组件树内共享的UI状态（展开/收起、模态框显示）
   - 主题、语言等全局配置
   - 不涉及业务数据的交互状态

**❌ 不应使用状态管理的场景：**

1. **组件内部状态**
   - 仅在单个组件内使用的临时状态
   - 表单输入的临时值（如果不需要跨组件共享）

#### Zustand Store 使用规范

**1. Store 文件组织**

```typescript
// ✅ 推荐：按业务模块组织 Store
// stores/booking/useBookingStore.ts
// stores/user/useUserStore.ts
// stores/cart/useCartStore.ts
```

**2. 跨页面数据流转示例**

```typescript
// 场景：网点详情页 -> 预订页面 -> 确认页面

// Step 1: 在详情页存储数据到 Store
// pages/lounge/detail/index.tsx
import { useBookingStore } from '@/lfd/stores/useBookingStore';

const LoungeDetail = () => {
  const setResourceDetail = useBookingStore(state => state.setResourceDetail);

  const handleSelectLounge = (loungeData) => {
    // 将选中的休息室数据存入 Store
    setResourceDetail(loungeData);
    // 跳转到预订页面
    navigate('/lounge/booking');
  };
};

// Step 2: 在预订页面读取和更新数据
// pages/lounge/booking/index.tsx
const BookingPage = () => {
  const resourceDetail = useBookingStore(state => state.resourceDetail);
  const bookingData = useBookingStore(state => state.bookingData);
  const updateBookingData = useBookingStore(state => state.updateBookingData);

  // 使用 Store 中的数据
  useEffect(() => {
    if (!resourceDetail) {
      // 如果没有数据，返回详情页
      navigate('/lounge/detail');
    }
  }, [resourceDetail]);

  const handleFormChange = (field, value) => {
    // 更新预订数据到 Store
    updateBookingData({ [field]: value });
  };
};

// Step 3: 在确认页面使用完整数据
// pages/lounge/confirmation/index.tsx
const ConfirmationPage = () => {
  const { resourceDetail, bookingData } = useBookingStore();

  // 展示完整的预订信息
  return (
    <div>
      <h2>{resourceDetail.name}</h2>
      <p>预订人：{bookingData.firstName} {bookingData.lastName}</p>
      {/* ... */}
    </div>
  );
};
```

**3. Store 数据持久化（可选）**

```typescript
// stores/useBookingStore.ts
import { persist } from 'zustand/middleware';

export const useBookingStore = create<BookingStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... store 实现
      }),
      {
        name: 'booking-storage', // localStorage key
        // 只持久化部分字段
        partialize: (state) => ({
          bookingData: state.bookingData,
          // 不持久化临时状态
        }),
      }
    ),
    { name: 'booking-store' }
  )
);
```

**4. Store 数据清理**

```typescript
// 在预订完成或取消时清理数据
const handleBookingComplete = () => {
  // ... 提交订单逻辑
  useBookingStore.getState().resetStore();
  navigate('/success');
};

const handleCancelBooking = () => {
  useBookingStore.getState().resetStore();
  navigate('/lounge/detail');
};
```

### 1. Zustand Store 基础规范

```typescript
// stores/useBookingStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BookingData, FormValidationState } from '@/types/standard';

interface BookingStoreState {
  // 状态
  bookingData: BookingData | null;
  validationState: FormValidationState;
  isLoading: boolean;
  error: string | null;

  // 操作方法
  setBookingData: (data: BookingData) => void;
  updateValidationState: (state: Partial<FormValidationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

export const useBookingStore = create<BookingStoreState>()(
  devtools(
    (set, get) => ({
      bookingData: null,
      validationState: { isValid: false, errors: {} },
      isLoading: false,
      error: null,

      setBookingData: (data) => set({ bookingData: data }),

      updateValidationState: (state) =>
        set((prev) => ({
          validationState: { ...prev.validationState, ...state }
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      resetStore: () => set({
        bookingData: null,
        validationState: { isValid: false, errors: {} },
        isLoading: false,
        error: null
      })
    }),
    { name: 'booking-store' }
  )
);
```

### 2. Context 规范

```typescript
// context/BookingContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { BookingData, BookingAction } from '@/types/booking';

interface BookingContextType {
  state: BookingData;
  dispatch: React.Dispatch<BookingAction>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
};
```

## 开发注意事项

1. **保持现有样式**：不要影响当前页面的样式和布局，确保100%还原设计
2. **表单组件使用**：在数据填写模块使用atom-ui中的Form表单组件
3. **组件检查**：使用MCP检查atom-ui组件使用是否正确
4. **数据对接**：使用MCP检索atom-ui，为没有数据对接的组件补充数据对接逻辑
  
## 案例参考

### 表单校验

#### 好的案例

```tsx
<Form
                    form={form}
                    onValuesChange={onValuesChange}
                    style={{
                        '--dp-aum-border-color': '#cdcbcb',
                    } as CSSProperties}
                    className="[&_.adm-list-body]:bg-inherit [&_.adm-list-body]:border-none [&_.adm-list-body]:text-[14px] [&_.adm-list-item]:p-0 [&_.adm-list-item-content]:border-none [&_.adm-list-item-content-main]:p-0 [&_.adm-list-item]:w-full"
                >
                <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please input your first name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please input your last name' }]}
                >
                    <Input />
                </Form.Item>
                </Form>
```

#### 差的案例

```tsx
const [firstName, setFirstName] = useState()
const onChange = (value: string) => {
    setFirstName(value);
  };
         <Form.Item >
                    <Input onChange={onChange} />
                </Form.Item>
```

## 最佳实践总结

### ✅ 推荐做法

1. **使用 TypeScript** 进行类型安全开发
2. **组件化思维**，保持组件单一职责
3. **合理使用 Hooks**，避免过度使用
4. **性能优化**，合理使用 memo、useMemo、useCallback
5. **错误处理**，实现完善的错误边界和用户提示
6. **代码复用**，通过组件和工具函数提高复用性
7. **跨页面数据管理**：必须使用 Zustand Store 统一管理跨页面共享的业务数据
8. **数据流清晰**：从 Store 读取数据，通过事件回调更新 Store，保持单向数据流

### ❌ 避免做法

1. 避免在组件中进行数据请求（保持组件纯净）
2. 避免过度嵌套组件结构
3. 避免使用 any 类型（尽量具体化类型定义）
4. 避免在渲染中创建新对象和函数
5. 避免直接修改 props（保持数据单向流动）
6. 避免在组件中硬编码文本内容
7. **避免使用 URL 参数传递复杂业务数据**（应使用 Zustand Store）
8. **避免使用 localStorage/sessionStorage 直接存储业务数据**（应使用 Zustand persist 中间件）
9. **避免在多个页面间通过事件总线或消息传递数据**（应使用 Zustand Store）

## 技术实现参考

### 数据来源说明

- **资源详情数据来源**：从资源详情接口返回，在网点详情页面存储到useBookingStore
- **prebookingPolicy数据来源**：从资源详情数据中获取，存储在useBookingStore
- **可选日期列表**：页面初始化时调用接口获取
- **可预约时段**：选择日期后调用接口获取

### 数据结构配置

系统需要根据以下从useBookingStore获取的配置动态控制表单字段的必填状态：

```typescript
interface PrebookingPolicy {
  maxPassengerPerOrder: number;
  prebookingRequiredInfo: {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    phoneNumber: boolean;
    callingCode: boolean;
    transportNumber: boolean;
  };
}
```

### 页面路径

- 目标文件：`packages/shared-product/src/lfd/pages/lounge/booking/index.tsx`
- 状态管理：`packages/shared-product/src/lfd/stores/useBookingStore.ts`
- 数据来源：网点详情页面（预先存储到useBookingStore）

## 参考资源

- [React 官方文档](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design Mobile 文档](https://mobile.ant.design/)
