# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

CC 系统（Claude Code System Creator Scripts）是一个为 Claude Code 设计的元框架，提供创建 AI 技能、管理代理、编排工作流和开发 MCP 服务器的完整工具链。

## 开发命令

```bash
# 构建项目
pnpm run build

# 运行 TypeScript 文件
pnpm run start <file>

# 初始化新技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts <skill-name> --path <path>

# 打包现有技能
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts <path/to/skill-folder>

# MCP 服务器开发（在 mcp/apifox-api-docs-mcp 目录下）
cd mcp/apifox-api-docs-mcp
pnpm install              # 安装依赖
pnpm build               # 构建 MCP 服务器
pnpm debug:apifox        # 启动调试会话
pnpm inspector           # 启动 MCP Inspector
```

## 架构概览

### 核心目录

- **`.claude/agents/`** - 系统级代理（6个专业代理）
- **`.claude/commands/`** - 系统级命令（4个便捷命令）
- **`.claude/skills/`** - 核心管理技能（8个框架技能）
- **`skills/`** - 项目特定技能（10+应用技能）
- **`mcp/`** - MCP 服务器项目
- **`templates/`** - 项目模板集合

### 系统级代理（.claude/agents/）

这些是预配置的专业代理，通过 YAML frontmatter 定义：

1. **apifox-api-fetcher** - 查询和获取 Apifox API 文档
2. **code-quality-checker** - TypeScript 和 ESLint 代码质量检查
3. **component-docs-fetcher** - atom-ui-mobile 组件文档查询
4. **gherkin-analyst** - 前端 Gherkin 需求分析和 BDD 实践
5. **prd-acceptance-tester** - PRD 功能验收和测试
6. **universal-translator** - 多语言文档翻译

**代理结构模式：**
```yaml
---
name: agent-name
description: 何时使用此代理
tools: Read, Write, Edit  # 可选工具限制
model: inherit           # inherit/sonnet/opus/haiku
---
系统提示内容
```

### 系统级命令（.claude/commands/）

快捷命令，通过 `/命令名` 调用：

1. **/commit** - 生成符合 Conventional Commits 规范的中文提交信息
2. **/gherkin** - 启动 Gherkin 需求分析流程
3. **/spec** - 提供完整的 Specs 系统提示词
4. **/c2docs** - 前端文档编写专家

### 核心管理技能（.claude/skills/）

这些技能用于创建和管理其他技能/代理：

1. **skill-creator** - 技能创建框架（初始化、验证、打包）
2. **subagent-creator** - 代理创建框架（YAML 配置、权限管理）
3. **hook-creator** - Hook 管理技能（PreToolUse/PostToolUse 事件）
4. **mcp-builder** - MCP 服务器构建（Python/Node.js 支持）
5. **prompt-engineering-patterns** - 提示工程模式和最佳实践
6. **doc-learner** - 文档学习和内容模仿
7. **humanizer** - 去除 AI 写作痕迹
8. **semantic-compressor** - Agent/Skill 智能压缩

### 技能结构模式

每个技能包含：

```
skill-name/
├── SKILL.md (必需)         # YAML 元数据 + markdown 指令
├── scripts/                # 可执行的 TypeScript 代码
├── references/             # 按需加载的参考文档
└── assets/                 # 输出中使用的模板和文件
```

**SKILL.md 格式：**
```markdown
---
name: skill-name
description: 何时使用此技能的详细描述
---

技能的使用说明和指导。
```

### MCP 服务器（mcp/apifox-api-docs-mcp/）

专门用于获取 Apifox API 文档的 MCP 服务器：

- **核心工具**：`get_api_list`、`get_api_detail`、`health_check`
- **特点**：自动重试、Zod 参数验证、中文错误提示
- **调试**：集成 MCP Inspector，支持本地化开发

### 工作流编排模式

技能可以协调多个代理按顺序执行。典型模式：

1. 需求分析（gherkin-analyst）
2. API 文档获取（apifox-api-fetcher）
3. 代码质量检查（code-quality-checker）
4. 组件文档查询（component-docs-fetcher）

## 权限配置

项目在 `.claude/settings.local.json` 中预配置了以下权限：

- 包管理：`pnpm install`, `pnpm run build:*`
- TypeScript 执行：`npx ts-node:*`, `node:*`
- Git 操作：`git commit:*`, `git push:*`, `git add:*`
- 技能使用：`Skill(subagent-creator)`, `Skill(skill-creator)` 等
- MCP 工具：`mcp__apifox-api-docs-mcp__*`
- Web 搜索：`WebSearch`, `mcp__web-search-prime__*`
- 诊断工具：`Bash(find:*)`, `Bash(ls:*)`, `Bash(cat:*)`

## 技术栈

- **语言**：TypeScript/Node.js
- **包管理**：pnpm
- **构建**：TypeScript 编译器（CommonJS 输出）
- **核心库**：js-yaml, archiver
- **开发工具**：ts-node
- **MCP 开发**：@modelcontextprotocol/sdk, @modelcontextprotocol/inspector

## Git 中文提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>
```

### 提交类型

- **feat** - 新功能
- **fix** - 修复问题
- **docs** - 文档更新
- **style** - 代码格式调整
- **refactor** - 代码重构
- **perf** - 性能优化
- **test** - 测试相关
- **chore** - 构建工具、依赖更新
- **workflow** - 工作流改进

### 示例

```bash
feat(skills): 新增文档学习技能

- 支持分析和学习优秀文档的结构和风格
- 实现内容模仿和模板提取功能
- 添加多格式文档支持

fix(agents): 修复代理配置解析的编码问题

解决中文配置文件读取时的乱码问题，确保UTF-8编码正确处理
```

### 重要注意事项

**生成 commit message 时，不要添加以下内容：**
- ❌ "Generated with [Claude Code](https://claude.com/claude-code)"
- ❌ "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ 任何 AI 工具的签名或标识

## 开发工作流

1. **创建技能**：使用 `skill-creator` 技能初始化和打包
2. **创建代理**：使用 `subagent-creator` 技能生成 YAML 配置
3. **开发 MCP**：使用 `mcp-builder` 技能构建服务器
4. **验证代码**：使用 `code-quality-checker` 代理检查质量
5. **提交代码**：使用 `/commit` 命令生成中文提交信息

## 中文化支持

项目完全支持中文开发：

- 所有文档使用中文编写
- Git 提交信息使用中文
- 错误提示和调试指南使用中文
- MCP 服务器支持中文错误信息
