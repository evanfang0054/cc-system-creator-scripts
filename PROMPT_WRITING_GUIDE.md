# AI 工具提示词编写指南

> 本指南基于对实际项目中所有工具提示词的深度分析，提炼出了一套系统化的提示词编写方法论和最佳实践。

## 目录

- [1. 提示词整体结构模式](#1-提示词整体结构模式)
- [2. 各部分写作规范](#2-各部分写作规范)
- [3. 关键要素与最佳实践](#3-关键要素与最佳实践)
- [4. 不同工具类型的提示词特点](#4-不同工具类型的提示词特点)
- [5. 常用模板与模式](#5-常用模板与模式)
- [6. 编写检查清单](#6-编写检查清单)

---

## 1. 提示词整体结构模式

### 1.1 基础结构

所有工具提示词文件应遵循以下导出结构：

```typescript
export const TOOL_NAME_FOR_PROMPT = '工具名称'

export const DESCRIPTION = `简短的一句话描述（1-2行）`

export const PROMPT = `详细的工具使用说明...`
```

**示例：**
```typescript
// src/tools/search/GrepTool/prompt.ts
export const TOOL_NAME_FOR_PROMPT = 'Grep'

export const DESCRIPTION = `基于 ripgrep 的强大搜索工具`

export const PROMPT = `详细的使用说明...`
```

### 1.2 完整结构（复杂工具）

对于复杂工具，PROMPT 应包含以下部分：

```
1. 功能概述（1-2句话）
2. 核心能力/特性列表
3. 使用场景说明
   - 何时使用
   - 何时不使用
4. 使用说明（参数、选项）
5. 示例（可选，对于复杂工具）
6. 重要注意事项/约束
7. 最佳实践建议
```

**示例结构：**
```typescript
export const PROMPT = `在持久化 shell 会话中执行给定的 bash 命令，支持可选的超时设置，确保正确的处理和安全措施。

重要：此工具用于 git、npm、docker 等终端操作。不要将其用于文件操作（读取、写入、编辑、搜索、查找文件）- 为此请使用专门的工具。

## 何时使用

- 需要执行终端命令时
- 需要 git 操作时
- ...

## 何时不使用

- 文件操作（使用专门的文件工具）
- ...

## 使用说明

- command: 必需参数，要执行的命令
- timeout: 可选，超时时间...
...
`
```

---

## 2. 各部分写作规范

### 2.1 DESCRIPTION 写作规范

**原则：简明扼要，一句话说清功能**

- ✅ 好的示例：
  ```typescript
  export const DESCRIPTION = '从本地文件系统读取文件。'
  export const DESCRIPTION = '基于 ripgrep 的强大搜索工具'
  export const DESCRIPTION = '向用户提出多项选择问题以收集信息'
  ```

- ❌ 避免：
  ```typescript
  export const DESCRIPTION = '这是一个可以读取文件的工具，它支持很多格式...' // 太长
  export const DESCRIPTION = 'FileReadTool' // 不是描述
  ```

**格式要求：**
- 使用中文描述
- 以动词开头（读取、搜索、执行、创建等）
- 长度控制在 1-2 行（约 50 字以内）
- 结尾不加句号（可选，视整体风格而定）

### 2.2 PROMPT 开头部分

**第一句话：功能概述**

```typescript
// 格式：[动作] + [对象] + [目的/特点]
export const PROMPT = `从本地文件系统读取文件。您可以使用此工具直接访问任何文件。`

// 或者更详细的版本
export const PROMPT = `在持久化 shell 会话中执行给定的 bash 命令，支持可选的超时设置，确保正确的处理和安全措施。`
```

**注意事项段落（如适用）**

对于容易误用的工具，在开头添加重要提醒：

```typescript
export const PROMPT = `执行给定的 bash 命令...

重要：此工具用于 git、npm、docker 等终端操作。不要将其用于文件操作（读取、写入、编辑、搜索、查找文件）- 为此请使用专门的工具。

在执行命令之前，请遵循以下步骤：...
`
```

### 2.3 列表写作规范

使用列表组织信息时，遵循以下格式：

```typescript
export const PROMPT = `
使用说明：
- 参数参数是必需的
- 您可以指定可选的超时时间
- 如果输出超过限制将被截断
- 您可以使用 run_in_background 参数在后台运行命令
`
```

**嵌套列表格式：**

```typescript
export const PROMPT = `
- 顶层项目
  - 子项目 1
  - 子项目 2
    - 更深层级的说明
- 另一个顶层项目
`
```

**编号列表格式：**

```typescript
export const PROMPT = `
1. 第一步：准备工作
   - 检查前提条件
   - 验证环境
2. 第二步：执行操作
3. 第三步：验证结果
`
```

### 2.4 代码块和示例

**内联代码：**

使用反引号标记工具名、参数名、文件格式等：

```typescript
export const PROMPT = `
- 使用 \`${TOOL_NAME_READ}\` 工具读取文件
- 设置 \`timeout\` 参数控制超时时间
- 支持 *.js、**/*.ts 等模式
`
```

**代码块示例：**

```typescript
export const PROMPT = `
为了确保良好的格式，始终通过 HEREDOC 传递提交消息，像这个示例：
<example>
git commit -m "$(cat <<'EOF'
   此处为提交消息。
   EOF
   )"
</example>
`
```

### 2.5 强调和重点标记

使用以下方式标记重要内容：

```typescript
export const PROMPT = `
**IMPORTANT**: 这是一条非常重要的信息

关键：这也是重要信息

注意：需要注意的事项

重要：另一种强调方式

警告：表示潜在问题
`
```

---

## 3. 关键要素与最佳实践

### 3.1 必备要素清单

每个工具提示词应包含以下要素：

- [ ] **明确的功能描述**：工具做什么，解决什么问题
- [ ] **使用场景说明**：什么时候应该使用这个工具
- [ ] **参数说明**：有哪些参数，各参数的含义和约束
- [ ] **使用示例**：如何正确使用（特别是复杂工具）
- [ ] **注意事项**：使用时需要特别注意的点
- [ ] **边界说明**：工具不能做什么，限制是什么
- [ ] **与其他工具的关系**：何时应该使用其他工具代替

### 3.2 最佳实践

#### 3.2.1 对比说明

明确说明本工具与其他工具的区别：

```typescript
export const PROMPT = `
避免将 Bash 与 \`find\`、\`grep\`、\`cat\`、\`head\`、\`tail\`、\`sed\`、\`awk\` 或 \`echo\` 命令一起使用，
除非明确指示或当这些命令对任务来说是真正必需的。
相反，始终优先使用这些命令的专门工具：
  - 文件搜索：使用 ${TOOL_NAME_GLOB}（不是 find 或 ls）
  - 内容搜索：使用 ${TOOL_NAME_GREP}（不是 grep 或 rg）
  - 读取文件：使用 ${TOOL_NAME_READ}（不是 cat/head/tail）
  - 编辑文件：使用 ${TOOL_NAME_EDIT}（不是 sed/awk）
  - 写入文件：使用 ${TOOL_NAME_WRITE}（不是 echo >/cat <<EOF）
`
```

#### 3.2.2 "何时使用/何时不使用"模式

对于复杂工具，明确使用场景：

```typescript
export const PROMPT = `
## 何时使用此工具

**对于实现任务，优先使用此工具**，除非它们很简单。

1. **新功能实现**：添加有意义的新功能
   - 示例："添加退出按钮" - 应该放在哪里？点击时应该发生什么？

2. **多种有效方法**：任务可以通过几种不同方式解决
   - 示例："为 API 添加缓存" - 可以使用 Redis、内存、基于文件等

## 何时不使用此工具

仅对简单任务跳过：
- 单行或几行修复（拼写错误、明显的错误、小调整）
- 添加一个需求明确的单个函数
- 用户给出了非常具体、详细说明的任务
`
```

#### 3.2.3 并行执行建议

鼓励并行执行独立操作：

```typescript
export const PROMPT = `
您可以在单个响应中调用多个工具。当请求多个独立的信息并且所有命令都可能成功时，
为获得最佳性能，请并行运行多个工具调用。

例如，如果您需要运行 "git status" 和 "git diff"，请发送一个包含两个并行工具调用的单个消息。
`
```

#### 3.2.4 安全性和约束

明确安全相关的要求：

```typescript
export const PROMPT = `
Git 安全协议：
- 永远不要更新 git config
- 永远不要运行破坏性/不可逆的 git 命令（如 push --force、hard reset 等），
  除非用户明确要求它们
- 永远不要跳过钩子（--no-verify、--no-gpg-sign 等），除非用户明确要求
`
```

#### 3.2.5 动态内容注入

使用模板变量注入动态内容：

```typescript
const MAX_LINES_TO_READ = 2000
const MAX_LINE_LENGTH = 2000

export const PROMPT = `
- 默认情况下，它从文件开头开始读取最多 ${MAX_LINES_TO_READ} 行
- 任何长于 ${MAX_LINE_LENGTH} 个字符的行都将被截断
- 结果使用 cat -n 格式返回，行号从 1 开始
`
```

### 3.3 常见模式总结

#### 模式 1：前置条件检查

```typescript
export const PROMPT = `
在编辑之前，您必须在对话中至少使用一次 \`Read\` 工具。
如果您尝试在未读取文件的情况下进行编辑，此工具将报错。
`
```

#### 模式 2：默认行为说明

```typescript
export const PROMPT = `
- 始终优先编辑代码库中的现有文件。除非明确要求，否则绝不写入新文件。
- 绝不主动创建文档文件（*.md）或 README 文件。只有在用户明确要求时才创建文档文件。
`
```

#### 模式 3：错误处理指导

```typescript
export const PROMPT = `
如果命令由于沙盒限制而失败：
1. 立即使用 \`dangerouslyDisableSandbox: true\` 重试（不要问，直接做）
2. 简要说明什么沙盒限制可能导致了失败
3. 提及："使用 \`/sandbox\` 管理限制"
`
```

#### 模式 4：参数验证

```typescript
export const PROMPT = `
目录验证：
   - 如果命令将创建新目录或文件，首先使用 \`ls\` 验证父目录存在
   - 例如，在运行 "mkdir foo/bar" 之前，首先使用 \`ls foo\` 检查 "foo" 存在
`
```

---

## 4. 不同工具类型的提示词特点

### 4.1 Agent 工具（TaskTool、PlanModeTool）

**特点：**
- 需要列出可用的 agent 类型及其用途
- 强调无状态性和一次性通信
- 提供详细的使用示例和场景

**模板：**

```typescript
export async function getPrompt(safeMode: boolean): Promise<string> {
  const agents = await getActiveAgents()

  const agentDescriptions = agents
    .map(agent => {
      const toolsStr = Array.isArray(agent.tools) ? agent.tools.join(', ') : '*'
      return `- ${agent.agentType}: ${agent.whenToUse} (Tools: ${toolsStr})`
    })
    .join('\n')

  return `启动一个新的 agent 来处理复杂的多步骤任务。

可用的 agent 类型及其可访问的工具：
${agentDescriptions}

使用 Task 工具时，您必须指定 subagent_type 参数来选择要使用的 agent 类型。

## 何时使用 Agent 工具

- 当您被指示执行自定义斜杠命令时

## 何时不使用 Agent 工具

- 如果您想读取特定文件路径，请改用 ${FileReadTool.name} 或 ${GlobTool.name} 工具
...

## 使用说明

1. 尽可能并发启动多个 agent 以最大化性能
2. agent 调用是无状态的，您需要提供详细的任务描述
...

## 使用示例

<example>
用户："请编写一个检查数字是否为素数的函数"
助手：...
</example>
`
}
```

### 4.2 文件系统工具（Read、Edit、Write、Glob）

**特点：**
- 强调与 Bash 工具的区别
- 明确文件路径格式要求
- 说明前置条件（如必须先 Read 才能 Edit）

**模板：**

```typescript
export const PROMPT = `从本地文件系统读取文件。

使用方法：
- file_path 参数必须是绝对路径，而不是相对路径
- 默认情况下，它从文件开头开始读取最多 ${MAX_LINES_TO_READ} 行
- 您可以选择指定行偏移量和限制
- 此工具只能读取文件，不能读取目录。要读取目录，请使用 ls 命令。
- 您可以在单个响应中调用多个工具。投机性地并行读取多个文件总是更好的。
`
```

### 4.3 系统工具（Bash、KillShell、TaskOutput）

**特点：**
- 包含安全策略和沙盒限制
- 详细的命令执行前检查
- Git 操作的专门指导
- 超时和输出限制说明

**模板：**

```typescript
export const PROMPT = `在持久化 shell 会话中执行给定的 bash 命令...

重要：此工具用于 git、npm、docker 等终端操作。不要将其用于文件操作...

## 命令执行前检查

1. 目录验证：...
2. 命令执行：...

## 使用说明

- command 参数是必需的
- 您可以指定可选的超时时间
- ${sandboxPrompt}
- 避免将 Bash 与其他命令一起使用...

${getBashGitPrompt()}
`
```

### 4.4 搜索工具（Grep、Lsp）

**特点：**
- 强调优于 Bash 命令的地方
- 支持的语法和模式说明
- 输出模式说明

**模板：**

```typescript
export const PROMPT = `基于 ripgrep 的强大搜索工具

使用方法：
- 始终使用 Grep 进行搜索任务。永远不要作为 Bash 命令调用 \`grep\` 或 \`rg\`
- 支持完整的正则表达式语法
- 使用 glob 参数或 type 参数过滤文件
- 输出模式："content" 显示匹配行，"files_with_matches" 仅显示文件路径，"count" 显示匹配计数
`
```

### 4.5 交互工具（AskUserQuestion、TodoWrite）

**特点：**
- 详细的使用场景说明
- 丰富的示例（包含正面和反面示例）
- 参数使用建议

**模板：**

```typescript
export const PROMPT = `使用此工具创建和管理结构化的任务列表...

## 何时使用此工具

1. 复杂的多步骤任务 - 当任务需要 3 个或更多不同的步骤时
2. 非平凡且复杂的任务 - 需要仔细规划或多个操作的任务
...

## 何时不使用此工具

1. 只有一个简单的任务
2. 任务微不足道，跟踪它没有组织效益
...

## Examples

<example>
User: I want to add a dark mode toggle...
Assistant: I'll help add a dark mode toggle...
*Creates todo list with the following items:*
...
</example>

...
`
```

### 4.6 网络工具（WebSearch、WebFetch）

**特点：**
- 使用限制说明（如地区限制）
- 输出格式要求
- 缓存机制说明
- 与其他工具的优先级说明

**模板：**

```typescript
export const PROMPT = `
- 允许助手搜索 web 并使用结果来通知响应
- 为当前事件和最新数据提供最新信息
- 返回格式化为搜索结果块的搜索结果信息

关键要求 - 您必须遵循这一点：
  - 回答用户问题后，您必须在响应末尾包含"来源："部分
  - 在来源部分，将搜索结果中的所有相关 URL 列为 markdown 超链接

使用说明：
  - 支持域过滤以包含或阻止特定网站
  - Web 搜索仅在美国可用
`
```

---

## 5. 常用模板与模式

### 5.1 基础模板

```typescript
export const TOOL_NAME_FOR_PROMPT = 'ToolName'

export const DESCRIPTION = `简短的一句话功能描述`

export const PROMPT = `
功能概述（1-2句话）。

使用说明：
- 参数1：说明
- 参数2：说明
- 参数3：说明

重要注意事项：
- 注意事项1
- 注意事项2
`.trim()
```

### 5.2 复杂工具模板

```typescript
export const TOOL_NAME_FOR_PROMPT = 'ToolName'

export const DESCRIPTION = `简短的一句话功能描述`

export const PROMPT = `
功能概述。

重要：容易误用的重要提醒。

## 何时使用此工具

1. **场景1**：说明
   - 示例：具体例子

2. **场景2**：说明
   - 示例：具体例子

## 何时不使用此工具

- 不适用场景1
- 不适用场景2

## 使用说明

基本用法：
- 参数1：说明
- 参数2：说明

高级用法：
- 选项1：说明
- 选项2：说明

## 使用示例

<example>
用户："用户请求"
助手："助手响应"
*具体操作*
</example>

## 重要注意事项

- 注意事项1
- 注意事项2

## 最佳实践

- 实践1
- 实践2
`.trim()
```

### 5.3 常用段落模板

#### "何时使用"模板

```typescript
## 何时使用此工具

**对于实现任务，优先使用此工具**，除非它们很简单。

1. **新功能实现**：添加有意义的新功能
   - 示例："示例描述" - 说明

2. **多种有效方法**：任务可以通过几种不同方式解决
   - 示例："示例描述" - 说明
```

#### "何时不使用"模板

```typescript
## 何时不使用此工具

仅对简单任务跳过此工具：
- 单行或几行修复（拼写错误、明显的错误、小调整）
- 添加一个需求明确的单个函数
- 用户给出了非常具体、详细说明的任务
- 纯研究/探索任务（改用其他工具）
```

#### "使用说明"模板

```typescript
## 使用说明

基本参数：
- 参数名：必需/可选，说明
- 参数名：必需/可选，说明

使用建议：
- 建议1
- 建议2

约束条件：
- 约束1
- 约束2
```

#### "示例"模板

```typescript
## 使用示例

<example>
用户："用户的问题或请求"
助手：助手的思考过程和响应
*具体的工具调用或操作*
<commentary>
解释为什么这样做
</commentary>
助手：继续的响应...
</example>
```

### 5.4 常用短语和句式

**功能描述：**
- "在...中执行..."
- "从...读取/获取..."
- "允许您..."
- "支持..."

**强调：**
- "重要："
- "关键："
- "注意："
- "警告："
- "**IMPORTANT**:"

**对比：**
- "不要使用...而是使用..."
- "避免使用...，改用..."
- "优先使用...而不是..."
- "始终使用...永远不要使用..."

**条件：**
- "当...时"
- "如果...请..."
- "只有在...时才..."
- "除非...否则..."

**示例：**
- "示例："
- "例如："
- "<example>...</example>"
- "好的示例："
- "坏的示例："

---

## 6. 编写检查清单

### 6.1 完整性检查

在完成提示词编写后，检查以下项目：

#### 内容完整性

- [ ] 是否有清晰的功能描述？
- [ ] 是否说明了工具的主要用途？
- [ ] 是否列出了所有参数及其说明？
- [ ] 是否有使用示例（对于复杂工具）？
- [ ] 是否说明了使用场景？
- [ ] 是否有注意事项或约束说明？

#### 结构完整性

- [ ] 是否导出了 `TOOL_NAME_FOR_PROMPT`？
- [ ] 是否导出了 `DESCRIPTION`？
- [ ] 是否导出了 `PROMPT`？
- [ ] 内容组织是否合理（概述→说明→示例→注意事项）？
- [ ] 是否使用了适当的标题和层级？

#### 语言质量

- [ ] 是否使用简洁的中文表述？
- [ ] 是否避免了冗余和重复？
- [ ] 语气是否一致？
- [ ] 术语使用是否准确？
- [ ] 是否有语法或拼写错误？

### 6.2 最佳实践检查

- [ ] 是否说明了与其他工具的区别？
- [ ] 是否强调了正确的使用方式？
- [ ] 是否警告了常见的误用情况？
- [ ] 是否提供了"何时使用/何时不使用"指导（对于复杂工具）？
- [ ] 是否鼓励并行执行独立操作（如适用）？
- [ ] 是否说明了安全相关的要求（如适用）？
- [ ] 是否使用了模板变量而非硬编码值？

### 6.3 可读性检查

- [ ] 列表格式是否正确？
- [ ] 代码块格式是否正确？
- [ ] 是否有适当的空行分隔不同部分？
- [ ] 是否使用了粗体、斜体等格式强调重点？
- [ ] 是否避免了过长的段落（超过 10 行）？
- [ ] 整体布局是否清晰易读？

### 6.4 实用性检查

- [ ] 示例是否真实有用？
- [ ] 说明是否足够详细，AI 能够理解？
- [ ] 是否覆盖了主要的使用场景？
- [ ] 是否预见并回答了常见问题？
- [ ] 是否有助于避免常见错误？

---

## 7. 参考示例

### 7.1 简单工具示例

```typescript
// src/tools/filesystem/FileReadTool/prompt.ts

const MAX_LINES_TO_READ = 2000
const MAX_LINE_LENGTH = 2000

export const DESCRIPTION = '从本地文件系统读取文件。'

export const PROMPT = `从本地文件系统读取文件。您可以使用此工具直接访问任何文件。
假设此工具能够读取机器上的所有文件。如果用户提供了文件路径，假设该路径有效。
读取不存在的文件是可以的；将返回错误。

使用方法：
- file_path 参数必须是绝对路径，而不是相对路径
- 默认情况下，它从文件开头开始读取最多 ${MAX_LINES_TO_READ} 行
- 您可以选择指定行偏移量和限制（对于长文件特别有用）
- 任何长于 ${MAX_LINE_LENGTH} 个字符的行都将被截断
- 结果使用 cat -n 格式返回，行号从 1 开始
- 此工具只能读取文件，不能读取目录。要读取目录，请使用 ls 命令。
- 您可以在单个响应中调用多个工具。投机性地并行读取多个文件总是更好的。`
```

### 7.2 中等复杂度工具示例

```typescript
// src/tools/search/GrepTool/prompt.ts

export const TOOL_NAME_FOR_PROMPT = 'Grep'

export const DESCRIPTION = `基于 ripgrep 的强大搜索工具`

export const PROMPT = `基于 ripgrep 的强大搜索工具

使用方法：
- 始终使用 Grep 进行搜索任务。永远不要作为 Bash 命令调用 \`grep\` 或 \`rg\`。
  Grep 工具已针对正确的权限和访问进行了优化。
- 支持完整的正则表达式语法（例如，"log.*Error"、"function\\s+\\w+"）
- 使用 glob 参数（例如，"*.js"、"**/*.tsx"）或 type 参数（例如，"js"、"py"、"rust"）过滤文件
- 输出模式："content" 显示匹配行，"files_with_matches" 仅显示文件路径（默认），
  "count" 显示匹配计数
- 对需要多轮的开放式搜索使用 Task 工具
- 模式语法：使用 ripgrep（不是 grep）- 字面量大括号需要转义
  （使用 \`interface\\{\\}\` 在 Go 代码中查找 \`interface{}\`）
- 多行匹配：默认情况下，模式仅在单行内匹配。对于跨行模式如
  \`struct \\{[\\s\\S]*?field\`，使用 \`multiline: true\``
```

### 7.3 复杂工具示例

```typescript
// src/tools/interaction/TodoWriteTool/prompt.ts

export const DESCRIPTION =
  '更新当前会话的待办事项列表。主动且经常使用以跟踪进度和待处理任务。'

export const PROMPT = `使用此工具为当前的编码会话创建和管理结构化的任务列表。
这有助于您跟踪进度、组织复杂任务，并向用户展示完整性。

## 何时使用此工具

在这些场景中主动使用此工具：

1. 复杂的多步骤任务 - 当任务需要 3 个或更多不同的步骤或操作时
2. 非平凡且复杂的任务 - 需要仔细规划或多个操作的任务
3. 用户明确要求待办事项列表 - 当用户直接要求您使用待办事项列表时
4. 用户提供多个任务 - 当用户提供要完成的事情列表时
5. 收到新指令后 - 立即将用户需求捕获为待办事项
6. 当您开始处理任务时 - 在开始工作之前将其标记为 in_progress
7. 完成任务后 - 将其标记为已完成，并添加任何新的后续任务

## 何时不使用此工具

在以下情况下跳过使用此工具：
1. 只有一个简单的任务
2. 任务微不足道，跟踪它没有组织效益
3. 任务可以在不到 3 个微不足道的步骤中完成
4. 任务纯粹是对话性或信息性的

## Examples

<example>
User: I want to add a dark mode toggle...
Assistant: I'll help add a dark mode toggle...
*Creates todo list with the following items:*
...
</example>

## Task States and Management

1. **Task States**:
   - pending: Task not yet started
   - in_progress: Currently working on (limit to ONE task at a time)
   - completed: Task finished successfully

2. **Task Management**:
   - Update task status in real-time as you work
   - Mark tasks complete IMMEDIATELY after finishing
   - Exactly ONE task must be in_progress at any time

...`
```

---

## 8. 附录

### 8.1 常用变量命名规范

```typescript
// 工具名称
export const TOOL_NAME_FOR_PROMPT = 'ToolName'

// 描述
export const DESCRIPTION = '...'

// 提示词
export const PROMPT = '...'

// 常量值
const MAX_LINES_TO_READ = 2000
const DEFAULT_TIMEOUT_MS = 120000
const MAX_OUTPUT_LENGTH = 30000

// 动态内容
function getPrompt(): string { ... }
```

### 8.2 导入规范

```typescript
// 导入相关工具
import { FileReadTool } from '@tools/FileReadTool/FileReadTool'
import { BashTool } from '@tools/BashTool/BashTool'

// 导入工具类型
import { type Tool } from '@tool'

// 导入其他依赖
import { getActiveAgents } from '@utils/agent/loader'
```

### 8.3 格式化建议

- 使用 `.trim()` 去除 PROMPT 字符串首尾空白
- 使用模板字符串（反引号）支持多行
- 使用 `${variable}` 注入动态内容
- 使用 `\` 转义特殊字符
- 适当使用空行分隔不同部分

### 8.4 版本控制建议

- 每次修改提示词时提交清晰的 commit message
- 在描述中说明修改的原因和影响
- 对于重大修改，考虑在工具文档中记录变更历史

---

## 总结

编写优秀的工具提示词是一门艺术，需要平衡：

- **完整性** vs **简洁性**
- **详细指导** vs **阅读负担**
- **严格约束** vs **灵活性**
- **通用性** vs **针对性**

遵循本指南的最佳实践，结合具体工具的特点，编写出清晰、准确、实用的提示词，
将大大提升 AI 工具的使用体验和效果。

记住：好的提示词是 AI 正确理解和使用工具的基础。投入时间精心编写提示词，
将在后续的使用中带来持续的回报。
