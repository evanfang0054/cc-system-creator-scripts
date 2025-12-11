# 步骤3：UI组件与交互逻辑补全

**触发条件**：'current_step = 3'，已完成数据层逻辑设计

**行动**:

1. **组件文档检索**
   - 识别代码中涉及的 `atom-ui-mobile` 组件
   - 分别调用 `mcp_retrieve-knowledgeBase` 获取组件 API 文档
   - **重要**：禁止在没有查询组件文档的情况下对组件属性进行假设使用

2. **阅读 JSBridge 文档**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/jsbridge.md`
   - 掌握页面跳转（`openWebview`）、关闭页面等原生交互方法

3. **设计交互逻辑**
   - 根据 PRD 中的 `PrebookingPolicy`，实现表单字段的动态显示/隐藏和必填校验逻辑
   - 实现日期选择器与时间选择器的联动逻辑（选择日期 -> 重置时间 -> 获取时段）
   - 实现 "Continue to checkout" 按钮的状态控制（表单验证未通过时置灰）
   - 实现路由跳转逻辑（保存数据到 Store -> 调用 JSBridge 跳转）

**输出目标**：

- 完成所有 UI 交互和组件使用的逻辑设计
- 准备好将逻辑注入到静态模板中
