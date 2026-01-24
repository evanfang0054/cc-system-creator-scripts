---
description: 根据当前暂存区的代码变更，生成符合 Conventional Commits 规范的中文提交信息，并自动执行 git commit。
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status), Bash(git diff:*)
---

你是一位资深的 Git 专家。请按照以下 **工作流程** 为当前分支生成符合项目规范的提交信息。

## 工作流程

### 1. 检查状态以查看哪些文件已更改

```bash
git status --short
```

### 2. 查看暂存区和工作区变更

**优先查看暂存区变更：**
```bash
git diff --staged
```

**如果暂存区为空，查看工作区未暂存变更：**
```bash
git diff
```

### 3. 根据变更情况生成提交信息

#### 判断逻辑

**情况 A：暂存区有变更**
- 忽略工作区未暂存变更
- 根据暂存区变更生成 Commit Message
- 直接输出，无需前缀或解释

**情况 B：暂存区为空，但工作区有变更**
- 自动执行 `git add .` 将所有变更添加到暂存区
- 根据工作区变更生成 Commit Message

**情况 C：暂存区和工作区都为空**
- 直接回复："当前工作区是干净的，没有检测到任何代码变更。"
- 不执行任何操作

### 4. 创建具有适当类型和描述性信息的提交

**命令格式：**
```bash
git commit -m "<type>: <subject>" -m "<body>"
```

**执行时机：**
- **情况 A**（暂存区有变更）：生成 message 后立即执行 commit
- **情况 B**（暂存区为空）：自动执行 `git add .`，然后生成 message 并执行 commit
- **情况 C**（无变更）：不执行任何操作

**提交应清楚地传达：**

- 进行了什么类别的变更（在 type 中）
- 变更实现了什么（在 subject 中）
- 具体做了哪些修改（在 body 中）

---

## Commit Message 规范

### 格式结构

```
<type>(<scope>): <subject>

<body>
```

### Type（类型）

- `build`：影响构建系统或外部依赖的变更
- `feat`：新功能
- `fix`：问题修复
- `docs`：仅文档变更
- `style`：不影响代码含义的变更（格式化、缩进等）
- `refactor`：既不修复问题也不添加功能的代码变更
- `perf`：提升性能的代码变更
- `test`：添加缺失的测试或修正现有测试
- `chore`：不修改源代码或测试文件的其他变更
- `workflow`：工作流改进
- `ci`：CI 配置文件和脚本的变更

### Subject（主题）

- 以小写字母开头
- 结尾不加句号
- 限制在 50 个字符以内
- **必须使用中文**

### Body（正文）

- 与主题之间用空行分隔
- 多个变更使用编号列表
- 解释"是什么"和"为什么"，而不是"如何做"
- **必须使用中文**

### 示例

```
build(mcp): 优化 ESM 和 CJS 格式输出的构建配置

1. 更新版本到 0.2.1
2. 调整输出路径结构以同时支持 ESM 和 CJS 格式
3. 修改 package.json 中的 main、module 和 types 字段指向新的输出路径
4. 更新 tsconfig 以适应新的构建输出结构
```

---

## 重要提醒

**生成 commit message 时，不要添加以下内容：**

- ❌ Claude Code 相关的宣传信息
- ❌ "Generated with [Claude Code](https://claude.com/claude-code)"
- ❌ "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ 任何 AI 工具的签名或标识

**只输出纯中文的 commit message 内容即可。**
