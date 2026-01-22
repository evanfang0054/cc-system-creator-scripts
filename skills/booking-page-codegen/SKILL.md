---
name: booking-page-codegen
description: 自动为LFD项目booking预订页面生成数据对接、交互逻辑和表单验证的完整胶水代码
---

# booking 页面胶水代码补全编排

当用户引用该规则文档时，系统将按照以下工作流程执行页面胶水代码补全生成：

1. **理解与分析**：分析静态模板、PRD 和编码规范
2. **数据层设计**：阅读 API 文档并设计数据逻辑
3. **交互层设计**：阅读组件和 JSBridge 文档并设计交互逻辑
4. **代码整合与验收**：生成代码并对照 PRD 验收
5. **最终测试与验证**：对照测试用例验收并检查语法错误

## 三文件模式

本技能使用持久化的 markdown 文件作为"磁盘工作记忆"，确保在多步骤执行中不会丢失上下文：

| 文件 | 用途 | 更新时机 |
|------|---------|----------------|
| `task_plan.md` | 跟踪阶段、进度、决策和错误 | 每个阶段开始前读取，完成后更新 |
| `research_notes.md` | 存储 API 文档、组件 API 查询结果 | 研究过程中存储发现 |
| `final_code.md` | 最终代码输出 | 完成时生成 |

### 核心工作流

```
循环 1：创建 task_plan.md（从 templates/task_plan_template.md）
循环 2：每个步骤开始前 → 读取 task_plan.md（刷新目标）
循环 3：执行步骤 → 存储研究结果到 research_notes.md → 更新 task_plan.md
循环 4：步骤完成 → 标记复选框 → 更新状态 → 记录错误（如有）
循环 5：最终交付 → 生成 final_code.md
```

**重要说明：**

- 必须逐步完整读取所需的步骤文件，只有完成一步后才能读取下一步文件
- 每一步都应按顺序执行，以确保胶水代码补全的正确性
- 不要一次性加载所有步骤文件内容——根据需要逐步读取
- **关键规则**：每个步骤开始前必须先读取 `task_plan.md` 以刷新目标

## 状态管理与执行机制

系统将维护以下状态变量：

- 'current_step'：当前执行步骤（1-5）

### 完整的步文件读取机制

由于步骤文件可能超过单次读取限制，系统将：

1. **使用多段读取**：多次完整阅读每个步骤文件，且不遗漏任何内容
2. **验证完整性**：通过检查文件末尾内容，确保步骤文件已被完全读取
3. **保持上下文**：在读取多个段落时，保持步骤文件的整体上下文和连贯性

## 步骤详情

### 步骤0：初始化（新增）

**触发条件**：用户首次调用技能，未创建计划文件

**行动**:

1. **确定目标目录**：
   - 从用户提供的静态模板文件路径中提取目录
   - 例如：用户提供 `/path/to/project/pages/booking/index.tsx`
   - 则目标目录为：`/path/to/project/pages/booking/`

2. **创建 task_plan.md**：
   ```bash
   Write /path/to/project/pages/booking/task_plan.md
   ```
   从 `templates/task_plan_template.md` 复制内容，根据用户提供的具体需求填写目标部分

3. **创建 research_notes.md**：
   ```bash
   Write /path/to/project/pages/booking/research_notes.md
   ```
   从 `templates/research_notes_template.md` 复制内容，清空待填写部分
  
4. **调用MCP获取静态模板代码**：
   **调用流程**
   a. 调用 `one-day-mcp-server` 获取静态模板代码
   b. 将获取到的代码存储到用户指定的路径中

   **约束条件**：
   - **禁止**不可改动获取到的静态模板代码的任何内容，包括但不限于：
     - 样式类名（Tailwind CSS）
     - DOM 结构
     - 组件名称
     - 事件处理函数

5. **更新 task_plan.md 状态**：
   - 标记阶段 1 为进行中
   - 更新状态为"**当前处于阶段 1** - 准备开始需求分析"

6. **告知用户并自动进入步骤1**：
   - 明确告知用户："✅ 初始化已完成，现在自动进入步骤1：理解需求与代码分析"
   - 直接开始执行步骤1，无需用户再次触发

**重要说明**：
- 所有文件（task_plan.md、research_notes.md、final_code.md）都将生成在用户提供的静态模板文件所在目录
- 这样便于与实际代码放在一起，便于查找和管理
- **自动执行机制**：初始化完成后立即自动进入步骤1

### 步骤1：理解需求与代码分析

**触发条件**：'current_step = 1'，用户已提供booking页面的静态模板代码

**前置行动**：
```bash
Read /path/to/booking/task_plan.md  # 刷新目标，确保理解原始需求
```

**主要行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step1.md` 中的指令。

2. **存储研究结果**：
   ```bash
   Edit /path/to/booking/research_notes.md
   ```
   - 将用户需求澄清的结果存储到"用户需求澄清记录"部分
   - 将关键代码片段参考存储到"代码片段参考"部分

3. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 1 为完成 [x]
   - 在"已做出的决策"部分记录关键决策
   - 更新状态为"**当前处于阶段 2** - 准备设计数据层逻辑"

4. **告知用户并自动进入步骤2**：
   - 明确告知用户："✅ 步骤1已完成，现在自动进入步骤2：接口与数据逻辑补全"
   - 直接开始执行步骤2，无需用户再次触发

### 步骤2：接口与数据逻辑补全

**触发条件**：'current_step = 2'，已完成步骤 1

**前置行动**：
```bash
Read /path/to/booking/task_plan.md  # 刷新目标
Read /path/to/booking/research_notes.md  # 获取前面步骤的研究发现
```

**主要行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step2.md` 中的指令。

2. **存储研究结果**：
   ```bash
   Edit /path/to/booking/research_notes.md
   ```
   - 将 API 文档查询结果存储到"API 文档查询结果"部分
   - 将数据流设计和状态管理方案存储到"综合发现"部分

3. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 2 为完成 [x]
   - 在"遇到的错误"部分记录 MCP 调用失败及解决方案（如有）
   - 更新状态为"**当前处于阶段 3** - 准备设计交互层逻辑"

4. **告知用户并自动进入步骤3**：
   - 明确告知用户："✅ 步骤2已完成，现在自动进入步骤3：UI组件与交互逻辑补全"
   - 直接开始执行步骤3，无需用户再次触发

### 步骤3：UI组件与交互逻辑补全

**触发条件**：'current_step = 3'，已完成步骤 2

**前置行动**：
```bash
Read /path/to/booking/task_plan.md  # 刷新目标
Read /path/to/booking/research_notes.md  # 获取 API 文档和前面步骤的研究发现
```

**主要行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step3.md` 中的指令。

2. **存储研究结果**：
   ```bash
   Edit /path/to/booking/research_notes.md
   ```
   - 将组件 API 查询结果存储到"组件 API 查询结果"部分
   - 将交互逻辑设计存储到"综合发现"部分

3. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 3 为完成 [x]
   - 在"遇到的错误"部分记录组件查询失败及解决方案（如有）
   - 更新状态为"**当前处于阶段 4** - 准备整合代码并验收"

4. **告知用户并自动进入步骤4**：
   - 明确告知用户："✅ 步骤3已完成，现在自动进入步骤4：代码整合与PRD验收"
   - 直接开始执行步骤4，无需用户再次触发

### 步骤4：代码整合与PRD验收

**触发条件**：'current_step = 4'，已完成步骤 3

**前置行动**：
```bash
Read /path/to/booking/task_plan.md  # 刷新目标
Read /path/to/booking/research_notes.md  # 获取所有研究成果（API、组件、设计等）
```

**主要行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step4.md` 中的指令。

2. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 4 为完成 [x]
   - 在"遇到的错误"部分记录代码整合过程中的问题及解决方案
   - 更新状态为"**当前处于阶段 5** - 准备最终测试验证"

3. **告知用户并自动进入步骤5**：
   - 明确告知用户："✅ 步骤4已完成，现在自动进入步骤5：测试用例验收与最终验证"
   - 直接开始执行步骤5，无需用户再次触发

### 步骤5：测试用例验收与最终验证

**触发条件**：'current_step = 5'，已完成步骤 4

**前置行动**：
```bash
Read /path/to/booking/task_plan.md  # 刷新目标，回顾整个任务过程
Read /path/to/booking/research_notes.md  # 获取完整的研究上下文
```

**主要行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step5.md` 中的指令。

2. **生成最终输出**：
   ```bash
   Write /path/to/booking/final_code.md
   ```
   生成最终的代码文件

3. **更新 task_plan.md**：
   ```bash
   Edit /path/to/booking/task_plan.md
   ```
   - 标记阶段 5 为完成 [x]
   - 在"遇到的错误"部分记录测试过程中的问题及解决方案
   - 更新状态为"**所有阶段已完成** - 任务完成"

4. **告知用户任务全部完成**：
   - 明确告知用户："🎉 所有步骤已完成！任务已成功完成"
   - 总结关键成果（生成的代码、解决的问题等）
   - 提供最终代码文件的路径（`/path/to/booking/final_code.md`）
   - **这是最后一步，无需再进入下一步**

## 重要注释

### 三文件模式的关键规则

1. **始终先创建计划文件**
   - 在没有 `task_plan.md` 的情况下永远不要开始复杂任务
   - 这是在步骤 0 中完成的初始化工作

2. **决策前先读取计划**
   - 在任何重大决策之前，读取 `task_plan.md`
   - 这可以将目标保持在你的注意力窗口中，避免"中间迷失"效应

3. **行动后更新计划**
   - 完成任何阶段后，立即更新 `task_plan.md`
   - 用 [x] 标记已完成的阶段
   - 更新状态部分
   - 记录遇到的任何错误

4. **存储，不要塞满**
   - 大型输出（API 文档、组件文档）放入 `research_notes.md`
   - 在上下文中只保留路径引用
   - 避免上下文过载

5. **记录所有错误**
   - 每个错误都进入 `task_plan.md` 的"遇到的错误"部分
   - 这为未来的任务积累知识

### 执行流程说明

1. 步骤文件将按需加载，不会一次性加载所有步骤内容
2. 每个步文件都将被完整读取，不会因行号限制而遗漏内容
3. 状态变量在整个工作流程中持续维护，以确保步骤间的一致性
4. 每一步完成后，更新 `task_plan.md` 并告知用户下一步步骤
5. **关键**：每个步骤开始前必须先读取 `task_plan.md` 和 `research_notes.md`，确保上下文连贯

## 用途

使用该技能时，先提供booking页面的静态模板代码，系统将从第一步自动开始执行。

---

**技能文件结构**：

- `SKILL.md`（此文件）- 主编排控制器（已优化，引入三文件模式）
- `step1.md` - 步骤 1：理解与分析
- `step2.md` - 步骤 2：数据层设计
- `step3.md` - 步骤 3：交互层设计
- `step4.md` - 步骤 4：整合与验收
- `step5.md` - 步骤 5：测试与验证
- `templates/task_plan_template.md` - 任务计划文件模板
- `templates/research_notes_template.md` - 研究笔记文件模板
- `references/codingspec.md` - 编码规范文档
- `references/jsbridge.md` - JSBridge 使用文档
- `references/api-request.md` - 接口请求工具使用文档

## 资源合集(可选)

### references/

根据需要将文档加载到上下文中:

- `codingspec.md`: 编码规范
- `jsbridge.md`: JSBridge 指南
- `api-request.md`: API 请求工具指南
