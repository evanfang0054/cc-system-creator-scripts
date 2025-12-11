# LFD休息室预订页面需求规格书

## 功能概述

本文档定义了LFD休息室预订页面的用户需求和行为场景，为前端开发提供清晰的功能指导。

```gherkin
Feature: 休息室预订表单
  As a 旅客
  I want to 填写休息室预订信息
  So that I can 完成预订并继续到结账页面

  Background:
    Given 用户已进入休息室预订页面
    And 用户已从网点详情页面选择休息室资源(无需校验，默认存在)
    And 资源详情接口已调用完成，数据存储在useBookingStore中
    And prebookingPolicy数据已从资源详情中获取并存储在useBookingStore中
    And 可选日期列表接口已调用完成

  Scenario: 初始化预订表单
    Given 页面加载完成
    And 资源详情和prebookingPolicy已从useBookingStore中获取
    When 系统初始化表单字段，完善表单字段逻辑补充
    Then 获取URL参数中的maxPassengers
    And 如果URL中有maxPassengers参数，使用该值
    And 如果URL中没有maxPassengers参数，使用prebookingPolicy中的maxPassengerPerOrder值
    And 默认最大乘客数不超过6人
    And 表单字段全部显示，根据prebookingPolicy.prebookingRequiredInfo配置确定是否必填
    And 调用可选日期列表接口获取可用日期

  Scenario: 选择访问日期
    Given 用户在预订表单页面
    And 系统已调用获取可选日期列表接口
    When 用户点击"Date of visit"日期选择器
    Then 显示日期选择器，格式为yyyy-mm-dd
    And 只显示接口返回的可选日期列表
    And 用户只能选择从接口获取的可用日期
    When 用户选择日期后
    Then "Entry time"时间选择器重置并需要重新选择
    And 触发获取该日期的可预约时段接口调用

  Scenario: 选择进入时间
    Given 用户已选择访问日期
    And 系统已调用获取可预约时段接口并返回数据
    When 用户点击"Entry time"时间选择器
    Then 显示时间选择器，格式为hh:mm
    And 只显示接口返回的可预约时间段列表
    When 用户选择时间
    Then 时间显示在表单中

  Scenario: 动态填写乘客姓名
    Given 系统根据政策设置乘客数量
    When 乘客数量为N人
    Then 表单显示N个"Full Name"输入字段
    And 每个字段对应一个乘客
    And 字段标签显示为"Passenger 1", "Passenger 2", etc.

  Scenario: 动态字段必填验证
    Given 系统从useBookingStore获取prebookingPolicy配置
    When prebookingPolicy.prebookingRequiredInfo中字段为true
    Then 对应表单字段标记为必填
    And 表单验证时会检查必填字段
    And placeholder显示字段名称
    When prebookingPolicy.prebookingRequiredInfo中字段为false
    Then 对应表单字段为非必填
    And placeholder显示字段名称 + "(Optional)"

  Scenario: 数据持久化
    Given 用户开始填写表单
    When 用户填写表单数据
    Then 数据暂存在组件状态中，不立即保存到useBookingStore
    When 用户点击"Continue to checkout"按钮
    Then 表单数据保存到useBookingStore中
    And 数据传递到结账页面

  Scenario: 表单验证和按钮状态
    Given 用户填写表单信息
    When 所有必填字段都已填写完成
    Then "Continue to checkout"按钮激活并可点击
    When 存在未填写的必填字段
    Then "Continue to checkout"按钮置灰不可点击

  Scenario: 跳转到结账页面
    Given 所有必填字段已填写完成
    When 用户点击"Continue to checkout"按钮
    Then 首先将表单数据保存到useBookingStore中
    And 使用JSBridge的openWebview方法
    And 跳转到"/lounge/checkout"页面
    And 结账页面从useBookingStore获取预订数据

  Scenario: 边界条件 - 最大乘客数限制
    Given 系统从useBookingStore获取prebookingPolicy配置
    When prebookingPolicy.maxPassengerPerOrder为0或未设置
    Then 默认最大乘客数为6人
    When URL中的maxPassengers超过prebookingPolicy.maxPassengerPerOrder值
    Then 使用prebookingPolicy中的maxPassengerPerOrder值

  Scenario: 边界条件 - 日期时间重置
    Given 用户已选择日期和时间
    When 用户重新选择日期
    Then 时间选择器重置为未选择状态
    And 用户需要重新选择进入时间

  Scenario: 边界条件 - 网络错误处理
    Given 系统调用接口获取数据
    When 可选日期列表接口调用失败
    Then 显示友好的错误提示"无法获取可用日期，请稍后重试"
    When 可预约时段接口调用失败
    Then 显示友好的错误提示"无法获取可预约时段，请选择其他日期"
    And 保持日期选择器可用状态

  @frontend
  前端开发指导说明:
  1. 数据存储：使用packages/shared-product/src/lfd/stores/useBookingStore.ts管理表单状态
  2. prebookingPolicy数据：从useBookingStore中获取，由网点详情页面传入
  3. 表单组件：使用atom-ui中的Form组件构建表单界面
  4. 样式保持：确保布局样式100%还原设计稿
  5. 数据持久化：表单数据暂存在组件状态中，点击Continue to checkout按钮时保存到useBookingStore
  6. 错误处理：实现完整的错误边界和用户友好的错误提示
  7. 性能优化：使用React.memo和useMemo优化表单渲染性能
  8. 类型安全：使用TypeScript严格模式，定义完整的类型接口

  @validation
  验证要求:
  1. 表单验证：实时验证所有必填字段，非必填字段跳过验证
  2. 数据格式：确保日期格式为yyyy-mm-dd，时间格式为hh:mm
  3. 字符限制：姓名字段支持多语言字符输入
  4. 数字限制：乘客数量在合理范围内（1-6人）
  5. 业务规则：严格按照prebookingPolicy.prebookingRequiredInfo配置控制字段必填/非必填状态
  6. UI规范：非必填字段的placeholder必须包含"(Optional)"标识
```

## 技术实现要求

### 数据来源说明

- **资源详情数据来源**：从资源详情接口返回，在网点详情页面存储到useBookingStore
- **prebookingPolicy数据来源**：从资源详情数据中获取，存储在useBookingStore
- **可选日期列表**：页面初始化时调用接口获取
- **可预约时段**：选择日期后调用接口获取
- **数据流向**：
  - 网点详情页面 → 资源详情接口 → useBookingStore → 预订页面读取
  - 预订页面 → 可选日期接口 → 日期选择器
  - 选择日期 → 可预约时段接口 → 时间选择器

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
