# 步骤3：UI组件与交互逻辑补全

**触发条件**：'current_step = 3'，已完成数据层逻辑设计

**前置准备（关键）**：
```bash
# 必须首先读取任务计划和研究笔记，刷新目标和获取前面步骤的上下文
# 注意：路径占位符 `/path/to/booking/` 应替换为实际目录
Read /path/to/booking/task_plan.md
Read /path/to/booking/research_notes.md
```

**目的**：
- 确保交互逻辑与原始需求一致（从 task_plan.md 获取）
- 了解 API 文档查询结果（从 research_notes.md 获取）
- 在上下文窗口中保持 API 设计的信息，确保交互逻辑与数据层匹配

**路径占位符说明**：
- 提供的静态模板路径如 `/Users/user/project/pages/booking/index.tsx`
- 则 `/path/to/booking/` 替换为 `/Users/user/project/pages/booking/`

**主要行动**:

1. **组件文档检索**

   **识别组件**：
   - 从静态模板代码中提取所有 `atom-ui-mobile` 组件引用
   - 常见组件：`Button`, `Form`, `Input`, `DatePicker`, `TimePicker`, `Picker`, `Stepper` 等

   **查询组件 API**：
   - 使用 `retrieve-knowledgeBase-mcp` 获取组件 API 文档
   - 针对每个组件查询其属性、事件和用法
   - 查询内容为 `组件文档: [组件名称]`
   - 分为多次查询，每次查询一个组件文档

   **约束条件**：
   - **禁止**在没有查询组件文档的情况下对组件属性进行假设使用
   - **必须**在 task_plan.md 的"遇到的错误"部分记录每次组件查询失败

   **查询失败处理**：
   - 如果组件查询失败，检查组件名称是否正确
   - 尝试使用组件的别名或简化名称
   - 如果 3 次重试仍失败，记录错误并使用默认配置

2. **阅读 JSBridge 文档**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/jsbridge.md`
   - 掌握页面跳转（`openWebview`）、关闭页面等原生交互方法

3. **设计交互逻辑**
   - 实现日期选择器与时间选择器的联动逻辑（选择日期 -> 重置时间 -> 获取时段）
   - 实现 "Continue to checkout" 按钮的状态控制（表单验证未通过时置灰）
   - 实现路由跳转逻辑（保存数据到 Store -> 调用 JSBridge 跳转）

**步骤完成后的行动（重要）**：

1. **存储研究结果到 research_notes.md**：
   ```bash
   Edit /path/to/booking/research_notes.md
   ```
   - 将组件 API 查询结果添加到"组件 API 查询结果"部分
   - 将交互逻辑设计添加到"综合发现"部分

2. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 3 为完成：`- [x] 阶段 3：UI 组件与交互逻辑补全`
   - 在"已做出的决策"部分记录关键决策（如组件选择、交互设计）
   - 在"遇到的错误"部分记录组件查询失败及解决方案（如有）
   - 更新状态为："**当前处于阶段 4** - 准备整合代码并验收"

3. **告知用户并自动进入步骤4**：
   - 明确告知用户："✅ 步骤3已完成，现在自动进入步骤4：代码整合与PRD验收"
   - 直接开始执行步骤4，无需用户再次触发
