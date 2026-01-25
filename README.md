# CC 系统 - Claude Code 扩展管理系统

<div align="center">

![CC System Logo](https://img.shields.io/badge/CC%20System-v1.0.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**Claude Code 的元框架：创建技能、管理代理、编排工作流、开发 MCP 服务器**

[快速开始](#快速开始) • [功能特性](#功能特性) • [核心技能](#核心技能) • [系统代理](#系统代理) • [开发指南](#开发指南)

</div>

## 系统概述

CC 系统（Claude Code System Creator Scripts）为 Claude Code 提供了一套扩展工具。你可以用它创建 AI 技能、管理代理、编排多代理工作流，以及开发 MCP 服务器。

### 核心价值

- **技能创建** - 标准化的开发、验证和打包流程
- **代理管理** - 用 YAML 配置创建专业化子代理
- **工作流编排** - 多代理协作处理复杂任务
- **MCP 开发** - 创建和调试 MCP 服务器
- **文档处理** - 学习、翻译、协作和人性化编辑
- **代码质量** - TypeScript 检查、API 文档、组件文档
- **中文支持** - 文档、调试指南、Git 提交规范
- **模板** - 命令模板、代理模板、项目模板

## 功能特性

### 技能管理

- **TypeScript 自动化** - 构建、验证和打包工具
- **模板系统** - 快速初始化，完整目录结构
- **验证机制** - 检查元数据、描述完整性、文件组织
- **打包分发** - 生成 .skill 文件，跨平台共享
- **渐进式披露** - 三级加载系统优化上下文

### 代理管理

- **YAML 配置** - 简洁的代理定义，frontmatter 元数据
- **工具权限** - 细粒度的访问控制
- **模型选择** - inherit/sonnet/opus/haiku
- **专业代理** - 内置多个领域专家

### 工作流编排

- **多代理协作** - 协调复杂任务
- **状态管理** - 跟踪工作流状态
- **步骤验证** - 每个阶段的质量检查
- **错误恢复** - 智能重试机制

### MCP 服务器

- **标准化 SDK** - 基于 @modelcontextprotocol/sdk
- **调试工具** - 集成 MCP Inspector
- **工具定义** - 灵活的创建和参数验证（Zod）
- **环境配置** - 支持 .env 文件
- **错误处理** - 中文提示和故障排除

### 文档处理

- **文档学习** - 分析结构、风格、写作模式
- **多语言翻译** - 保持技术术语完整
- **文档协作** - 智能编辑和优化
- **人性化编辑** - 去除 AI 痕迹
- **语义压缩** - Agent/Skill 压缩，保留功能

### 代码质量

- **TypeScript 检查** - 自动化错误检测
- **API 文档** - 集成 Apifox 查询
- **组件文档** - atom-ui-mobile API 获取
- **代码片段** - 智能提取和管理

### 中文支持

- **完整文档** - 说明、调试指南、示例
- **本地化** - 中文错误提示
- **Git 提交** - 标准化规范和模板
- **调试友好** - 详细的故障排除指南

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+
- Claude Code CLI
- Git（支持中文提交）

### 安装

```bash
git clone https://github.com/evanfang0054/cc-system-creator-scripts.git
cd cc-system-creator-scripts
pnpm install
pnpm run build
```

### 创建技能

```bash
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts my-skill --path ./skills
vim ./skills/my-skill/SKILL.md
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts ./skills/my-skill
```

### 创建代理

在 Claude Code 中使用 `Skill(subagent-creator)`

### 开发 MCP 服务器

```bash
cd mcp/apifox-api-docs-mcp
pnpm install
pnpm build
pnpm debug:apifox
```

## 项目结构

```
cc-system-creator-scripts/
├── .claude/                    # Claude Code 配置
│   ├── agents/                 # 系统级代理
│   │   ├── apifox-api-fetcher.md       # Apifox API 文档
│   │   ├── code-quality-checker.md     # 代码质量检查
│   │   ├── component-docs-fetcher.md   # 组件文档查询
│   │   ├── gherkin-analyst.md          # Gherkin 分析
│   │   ├── prd-acceptance-tester.md    # PRD 验收
│   │   └── universal-translator.md     # 文档翻译
│   ├── commands/                # 系统级命令
│   │   ├── c2docs.md                   # 前端文档
│   │   ├── commit.md                   # Git 提交
│   │   ├── gherkin.md                  # Gherkin 分析
│   │   └── spec.md                     # Specs 提示词
│   ├── skills/                 # 核心技能
│   │   ├── doc-learner/                # 文档学习
│   │   ├── hook-creator/               # Hook 管理
│   │   ├── humanizer/                  # 人性化编辑
│   │   ├── mcp-builder/                # MCP 构建
│   │   ├── prompt-engineering-patterns/ # 提示工程
│   │   ├── semantic-compressor/        # 语义压缩
│   │   ├── skill-creator/              # 技能创建
│   │   └── subagent-creator/           # 代理创建
│   ├── template/               # 系统模板
│   └── settings.local.json     # 权限配置
├── skills/                     # 项目技能
│   ├── code-fragment-extractor/        # 代码片段
│   ├── component-docs-batcher/         # 组件文档批量
│   ├── doc-coauthoring/                # 文档协作
│   ├── doc-learner/                    # 文档学习
│   ├── humanizer/                      # 人性化编辑
│   ├── mac-maintenance-cleanup/        # Mac 维护
│   ├── macos-cleaner/                  # macOS 清理
│   ├── planning-with-files/            # 文件规划
│   ├── planning-with-files-evan/       # Evan 规划
│   └── semantic-compressor/            # 语义压缩
├── templates/                  # 项目模板
│   ├── CLAUDE-template.md
│   ├── agent-file-template.md
│   ├── checklist-template.md
│   ├── commands/
│   ├── memory/
│   ├── plan-template.md
│   ├── spec-template.md
│   └── tasks-template.md
├── mcp/                        # MCP 服务器
│   └── apifox-api-docs-mcp/
│       ├── src/
│       ├── dist/
│       ├── DEBUG.md
│       ├── example-usage.md
│       └── package.json
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

## 核心技能

### 1. skill-creator - 技能创建

创建技能的指南和自动化工具。

**主要功能：**
- 模板生成
- 验证和打包
- 渐进式披露设计
- 三级加载优化

**使用场景：**
- 创建新技能
- 验证技能结构
- 打包分发

### 2. subagent-creator - 代理创建

创建专业化 Claude 子代理。

**主要功能：**
- YAML frontmatter 配置
- 工具权限管理
- 模型选择
- 代理模板

**使用场景：**
- 创建专业代理
- 配置权限
- 管理行为

### 3. hook-creator - Hook 管理

配置 Claude Code 钩子。

**主要功能：**
- PreToolUse/PostToolUse 事件
- 通知钩子
- 文件保护
- 权限管理

**使用场景：**
- 自动格式化
- 日志记录
- 文件保护

### 4. mcp-builder - MCP 构建

创建 MCP 服务器。

**主要功能：**
- Python/Node.js 支持
- 工具定义和验证
- MCP SDK 集成
- 调试指南

**使用场景：**
- 集成外部 API
- 创建工具
- 扩展能力

### 5. prompt-engineering-patterns - 提示工程

高级提示工程技术。

**主要功能：**
- 提示模板库
- 最佳实践
- 模式识别
- 性能优化

**使用场景：**
- 优化提示
- 改进输出
- 设计模板

### 6. doc-learner - 文档学习

学习文档结构和风格。

**主要功能：**
- 结构分析
- 风格学习
- 模板提取
- 内容生成

**使用场景：**
- 学习优秀文档
- 提取模式
- 生成材料

### 7. humanizer - 人性化编辑

去除 AI 痕迹。

**主要功能：**
- AI 模式识别
- 文本自然化
- 风格优化
- 个性化注入

**使用场景：**
- 编辑 AI 文本
- 改善自然度
- 去除机械化

### 8. semantic-compressor - 语义压缩

压缩 Agent/Skill。

**主要功能：**
- 5 阶段迭代
- 理解保留
- Token 优化
- 质量检查

**使用场景：**
- 压缩大型 Agent
- 优化 Skill
- 提升性能

## 系统代理

### 1. apifox-api-fetcher - Apifox API 文档

查询和获取 Apifox 文档。

**核心能力：**
- API 列表获取
- 详细文档查询
- 自动重试
- 错误处理

**使用场景：**
- 获取接口列表
- 查询特定文档
- 提取参数和响应

### 2. code-quality-checker - 代码质量

检查和修复代码质量。

**核心能力：**
- TypeScript 错误检测
- ESLint 检查
- 组件 API 验证
- Monorepo 支持

**使用场景：**
- 执行 pnpm check
- 修复质量问题
- 验证组件使用

### 3. component-docs-fetcher - 组件文档

查询组件 API 文档。

**核心能力：**
- atom-ui-mobile 查询
- 属性获取
- 事件和方法
- 使用示例

**使用场景：**
- 获取 API 文档
- 查询属性
- 获取示例

### 4. gherkin-analyst - Gherkin 分析

前端 Gherkin 需求分析。

**核心能力：**
- 需求分析和拆解
- Gherkin 语法转换
- 场景描述
- BDD 实践

**使用场景：**
- 分析前端需求
- 编写场景
- 需求格式化

### 5. prd-acceptance-tester - PRD 验收

PRD 功能验收。

**核心能力：**
- 需求逐条验收
- 功能覆盖检查
- 验收清单
- 代码验证

**使用场景：**
- 根据 PRD 验收
- 生成清单
- 验证覆盖

### 6. universal-translator - 文档翻译

智能文档翻译。

**核心能力：**
- 多语言翻译
- 技术术语保持
- 格式保留
- 本地化

**使用场景：**
- 翻译技术文档
- 本地化内容
- 跨语言协作

## 系统命令

### 1. /commit - Git 提交

生成符合 Conventional Commits 的中文提交信息，自动执行 git commit。

**功能特性：**
- 自动识别变更类型
- 生成中文信息
- 自动添加暂存
- 符合规范

### 2. /gherkin - Gherkin 分析

启动 Gherkin 需求分析。

**功能特性：**
- 需求分析拆解
- 语法转换
- 场景描述

### 3. /spec - Specs 提示词

完整的 Specs 系统提示词。

**功能特性：**
- 提示词模板
- 规范和标准
- 最佳实践

### 4. /c2docs - 前端文档

前端文档编写。

**功能特性：**
- 结构规划
- 技术文档编写
- 示例代码
- 格式检查

## 使用指南

### 技能开发流程

1. **需求理解** - 通过示例了解使用场景
2. **内容规划** - 分析脚本、资料、资源
3. **技能初始化** - 用 `init_skill.ts` 创建模板
4. **功能实现** - 编辑 SKILL.md 和资源
5. **打包验证** - 用 `package_skill.ts` 验证打包
6. **测试迭代** - 根据使用改进

### 代理配置

```yaml
---
name: gherkin-analyst
description: 专业的前端 Gherkin 需求分析师。当用户需要分析、拆解和格式化前端需求时使用此代理。
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
---

您是资深前端需求分析师，专门使用 Gherkin 语法进行需求分析和拆解。

**核心职责**：
分析用户需求，将其转换为标准的 Gherkin 格式，确保需求清晰、可测试。
```

### 工作流编排

```markdown
# API 文档集成工作流

用户请求 API 文档集成时，系统按以下步骤执行：

1. **需求分析**：调用 gherkin-analyst 分析需求
2. **API 文档获取**：调用 apifox-api-fetcher 获取接口文档
3. **代码质量检查**：调用 code-quality-checker 验证代码
4. **组件文档查询**：调用 component-docs-fetcher 获取组件信息
```

## 开发指南

### 开发命令

```bash
# 构建
pnpm run build

# 运行
pnpm run start <file>

# 初始化技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts <skill-name> --path <path>

# 打包技能
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts <path/to/skill-folder>

# MCP 开发（在 mcp/apifox-api-docs-mcp 下）
cd mcp/apifox-api-docs-mcp
pnpm install
pnpm build
pnpm debug:apifox
pnpm inspector
```

### 技术栈

- **语言**：TypeScript/Node.js
- **包管理**：pnpm
- **构建**：TypeScript 编译器 (CommonJS)
- **核心库**：js-yaml, archiver
- **开发**：ts-node
- **MCP**：@modelcontextprotocol/sdk, @modelcontextprotocol/inspector
- **文档**：Markdown, 中文支持

### 最佳实践

1. 遵循 TypeScript 最佳实践，使用类型检查和严格模式
2. 确保错误处理，所有脚本应有适当错误处理
3. 添加完整文档，为新技能和代理添加中文文档
4. 运行构建测试，`pnpm run build` 确保编译成功
5. 使用中文文档，提高可维护性
6. 遵循 Git 规范，保持版本历史清晰
7. 利用 MCP Inspector 本地调试

### 技能结构

```
skill-name/
├── SKILL.md (必需)         # YAML 元数据 + markdown
├── scripts/                # 可执行代码
├── references/             # 参考文档
└── assets/                 # 输出资源
```

**SKILL.md 格式：**

```markdown
---
name: skill-name
description: 何时使用此技能
---

# 技能说明

详细的使用说明。
```

### 代理结构

```markdown
---
name: agent-name
description: 何时使用此代理
tools: Read, Write, Edit  # 可选
model: inherit
---

系统提示。
```

## 应用场景

### 文档处理工作流

1. **文档学习** - 分析结构、风格、模式
2. **文档翻译** - 多语言翻译，保持术语
3. **文档协作** - 智能编辑优化
4. **人性化编辑** - 去除 AI 痕迹

### 代码质量工作流

1. **TypeScript 检查** - 自动化错误检测
2. **API 文档** - 集成 Apifox 查询
3. **组件文档** - atom-ui-mobile API
4. **代码片段** - 智能提取管理

### MCP 服务器集成

- **Apifox API 文档 MCP** - 自动获取最新文档
- **接口详情解析** - 提取参数、响应、说明
- **开发调试** - 本地环境，实时测试
- **中文支持** - 调试指南、错误提示

### 技能创建

```bash
# 创建文档处理技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts doc-processor --path ./skills
vim ./skills/doc-processor/SKILL.md
vim ./skills/doc-processor/scripts/process.ts
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts ./skills/doc-processor
```

## 系统配置

### Claude Code 权限

系统在 `.claude/settings.local.json` 中预配置：

- 包管理 (`pnpm install`, `pnpm run build:*`)
- TypeScript 执行 (`npx ts-node:*`, `node:*`)
- 归档操作 (`unzip:*`, `tree:*`)
- 技能使用 (`Skill(subagent-creator)`)
- Web 搜索和 MCP 工具
- 诊断和代码分析

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": [".claude/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.js"]
}
```

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

## 联系我们

- 项目主页：[https://github.com/evanfang0054/cc-system-creator-scripts](https://github.com/evanfang0054/cc-system-creator-scripts)
- 问题反馈：[Issues](https://github.com/evanfang0054/cc-system-creator-scripts/issues)
- 功能请求：[Feature Requests](https://github.com/evanfang0054/cc-system-creator-scripts/issues/new?template=feature_request.md)

---

<div align="center">

**[返回顶部](#cc-系统---claude-code-扩展管理系统)**

Made with by [Evan Fang](https://github.com/evanfang0054)

</div>
