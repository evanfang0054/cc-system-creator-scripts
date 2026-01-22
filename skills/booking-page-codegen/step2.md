# 步骤2：接口与数据逻辑补全

**触发条件**：'current_step = 2'，已完成需求理解和代码分析

**前置准备（关键）**：
```bash
# 必须首先读取任务计划和研究笔记，刷新目标和获取前面步骤的上下文
# 注意：路径占位符 `/path/to/booking/` 应替换为实际目录
Read /path/to/booking/task_plan.md
Read /path/to/booking/research_notes.md
```

**目的**：
- 确保 API 设计与原始需求一致（从 task_plan.md 获取）
- 了解用户需求澄清的结果（从 research_notes.md 获取）
- 避免在步骤间失去上下文连贯性

**路径占位符说明**：
- 提供的静态模板路径如 `/Users/user/project/pages/booking/index.tsx`
- 则 `/path/to/booking/` 替换为 `/Users/user/project/pages/booking/`

**主要行动**:

1. **阅读接口文档**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/api-request.md`

2. **获取接口 Schema**

   **调用流程**：
   a. 调用 `mcp__apifox-api-docs-mcp__get_api_list` 获取完整接口列表
   b. 根据业务需求筛选相关接口（关键字：`booking`, `reservation`, `lounge`, `resources`, `available` 等）
   c. 对每个相关接口调用 `mcp__apifox-api-docs-mcp__get_api_detail` 获取详细文档

   **约束条件**：
   - **禁止**在没有查询到接口文档的情况下对接口参数和响应进行假设使用
   - **必须**重试直到成功获取接口文档，最多重试 5 次
   - **必须**在 task_plan.md 的"遇到的错误"部分记录每次 MCP 调用失败

   **重试策略**：
   - 如果 MCP 调用失败，等待 2 秒后重试
   - 如果 ApiFox Key 无效，不要传入key直接调用mcp
   - 最多重试 5 次
   - 每次失败时记录错误信息到 task_plan.md

3. **设计数据层逻辑**
   - 基于 `api-request.md` 的规范，设计接口请求函数
   - 规划页面初始化时的数据加载流程（如 `useEffect` 中的调用）
   - 使用 `useProductConfig()` 获取 `api` 实例，调用 `api.api.xxx` 方法

**步骤完成后的行动（重要）**：

1. **存储研究结果到 research_notes.md**：
   ```bash
   Edit /path/to/booking/research_notes.md
   ```
   - 将 API 文档查询结果添加到"API 文档查询结果"部分
   - 将数据流设计和状态管理方案添加到"综合发现"部分

2. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 2 为完成：`- [x] 阶段 2：接口与数据逻辑补全`
   - 在"已做出的决策"部分记录关键决策（如接口选择、数据流设计）
   - 在"遇到的错误"部分记录 MCP 调用失败及解决方案（如有）
   - 更新状态为："**当前处于阶段 3** - 准备设计交互层逻辑"

3. **告知用户并自动进入步骤3**：
   - 明确告知用户："✅ 步骤2已完成，现在自动进入步骤3：UI组件与交互逻辑补全"
   - 直接开始执行步骤3，无需用户再次触发
