---
name: booking-page-codegen
description: 补全LFD项目booking预订页面的胶水代码
---

# booking 页面胶水代码补全编排

当用户引用该规则文档时，系统将按照以下工作流程执行页面胶水代码补全生成：

1. **理解与分析**：分析静态模板、PRD 和编码规范
2. **数据层设计**：阅读 API 文档并设计数据逻辑
3. **交互层设计**：阅读组件和 JSBridge 文档并设计交互逻辑
4. **代码整合与验收**：生成代码并对照 PRD 验收
5. **最终测试与验证**：对照测试用例验收并检查语法错误

**重要说明：**

- 必须逐步完整读取所需的步骤文件，只有完成一步后才能读取下一步文件
- 每一步都应按顺序执行，以确保胶水代码补全的正确性
- 不要一次性加载所有步骤文件内容——根据需要逐步读取

## 状态管理与执行机制

系统将维护以下状态变量：

- 'current_step'：当前执行步骤（1-5）

### 完整的步文件读取机制

由于步骤文件可能超过单次读取限制，系统将：

1. **使用多段读取**：多次完整阅读每个步骤文件，且不遗漏任何内容
2. **验证完整性**：通过检查文件末尾内容，确保步骤文件已被完全读取
3. **保持上下文**：在读取多个段落时，保持步骤文件的整体上下文和连贯性

## 步骤详情

### 步骤1：理解需求与代码分析

**触发条件**：'current_step = 1'，用户已提供booking页面的静态模板代码

**行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step1.md` 中的指令。

### 步骤2：接口与数据逻辑补全

**触发条件**：'current_step = 2'，已完成步骤 1

**行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step2.md` 中的指令。

### 步骤3：UI组件与交互逻辑补全

**触发条件**：'current_step = 3'，已完成步骤 2

**行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step3.md` 中的指令。

### 步骤4：代码整合与PRD验收

**触发条件**：'current_step = 4'，已完成步骤 3

**行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step4.md` 中的指令。

### 步骤5：测试用例验收与最终验证

**触发条件**：'current_step = 5'，已完成步骤 4

**行动**:

1. 彻底阅读并执行 `.claude/skills/booking-page-codegen/step5.md` 中的指令。

## 重要注释

1. 步骤文件将按需加载，不会一次性加载所有步骤内容
2. 每个步文件都将被完整读取，不会因行号限制而遗漏内容
3. 状态变量在整个工作流程中持续维护，以确保步骤间的一致性
4. 每一步完成后，打印 'current_step' 的值，并告知用户下一步步骤

## 用途

使用该技能时，先提供booking页面的静态模板代码，系统将从第一步自动开始执行。

---

**技能文件结构**：

- `SKILL.md`（此文件）- 主编排控制器
- `step1.md` - 步骤 1：理解与分析
- `step2.md` - 步骤 2：数据层设计
- `step3.md` - 步骤 3：交互层设计
- `step4.md` - 步骤 4：整合与验收
- `step5.md` - 步骤 5：测试与验证
- `references/prd.md` - 需求规格说明书
- `references/test-cases.md` - 测试用例
- `references/codingspec.md` - 编码规范文档
- `references/jsbridge.md` - JSBridge 使用文档
- `references/api-request.md` - 接口请求工具使用文档
- `references/api-docs.md` - 接口 API 文档

## 资源合集(可选)

### references/

根据需要将文档加载到上下文中:

- `prd.md`: 需求规格书
- `test-cases.md`: 测试用例
- `codingspec.md`: 编码规范
- `jsbridge.md`: JSBridge 指南
- `api-request.md`: API 请求工具指南
- `api-docs.md`: API 接口文档
