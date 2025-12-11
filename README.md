# CC 系统 - Claude Code 扩展管理系统

<div align="center">

![CC System Logo](https://img.shields.io/badge/CC%20System-v1.0.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**一个强大的 Claude Code 扩展和系统管理平台，专注于技能创建、代理管理和工作流编排**

[快速开始](#quick-start) • [功能特性](#features) • [文档指南](#documentation) • [示例代码](#examples)

</div>

## 📖 系统概述

CC 系统是一个专门为 Claude Code 设计的元框架，通过模块化、可重用的组件和自动化工作流来增强其功能。该系统让您能够创建专业级 AI 技能、管理专业化的代理，并编排复杂的多代理工作流。

### 🎯 核心价值

- **🔧 技能创建框架** - 标准化的 AI 技能开发和管理
- **🤖 代理管理系统** - 创建专业化的 Claude 子代理
- **⚡ 工作流编排** - 自动化的多代理协作流程
- **📦 代码生成管道** - 端到端的应用程序生成

## ✨ 功能特性

### 🛠️ 技能管理框架

- **TypeScript 自动化** - 专业级的构建和打包工具
- **模板系统** - 快速初始化新的技能项目
- **验证机制** - 内置的技能验证和打包功能
- **版本管理** - 技能版本控制和迭代管理

### 🎭 代理管理系统

- **YAML 配置** - 简洁的代理定义格式
- **工具权限管理** - 细粒度的工具访问控制
- **模型选择** - 灵活的模型配置 (sonnet/opus/haiku)
- **技能自动加载** - 代理技能的自动集成

### 🔄 工作流编排

- **多代理协作** - 复杂任务的代理协调
- **状态管理** - 工作流状态跟踪和维护
- **步骤验证** - 每个阶段的完整性检查
- **错误恢复** - 智能的错误处理和重试机制

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+
- Claude Code CLI

### 安装部署

```bash
# 克隆项目
git clone https://github.com/evanfang0054/cc-system-creator-scripts.git
cd cc-system

# 安装依赖
pnpm install
```

### 创建您的第一个技能

```bash
# 初始化新技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts my-skill --path ./skills

# 编辑技能内容
vim ./skills/my-skill/SKILL.md

# 打包技能
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts ./skills/my-skill
```

### 创建您的第一个代理

```bash
# 使用 subagent-creator 技能
Skill(subagent-creator)
```

## 📁 项目结构

```
cc-system/
├── .claude/                    # Claude Code 系统配置
│   ├── agents/                 # 系统级代理
│   │   ├── gherkin-analyst.md  # Gherkin 需求分析专家
│   │   └── universal-translator.md # 文档翻译专家
│   ├── skills/                 # 核心管理技能
│   │   ├── hook-creator/       # Hook 管理技能
│   │   ├── skill-creator/      # 技能创建框架
│   │   └── subagent-creator/   # 代理创建框架
│   └── settings.local.json     # Claude Code 权限配置
├── agents/                     # 项目特定代理
│   ├── booking-requirement-analyzer.md
│   ├── booking-data-integration-expert.md
│   ├── booking-ui-interaction-expert.md
│   ├── booking-code-integrator.md
│   └── booking-test-validator.md
├── skills/                     # 项目特定技能
│   ├── booking-page-codegen-v0.0.1/
│   ├── booking-page-codegen-v0.0.2/
│   └── booking-page-codegen-v0.0.3/
├── package.json
├── tsconfig.json
└── README.md
```

## 💡 使用指南

### 技能开发流程

1. **需求理解** - 通过具体示例了解技能使用场景
2. **内容规划** - 分析所需的脚本、参考资料和资源
3. **技能初始化** - 使用 `init_skill.ts` 创建技能模板
4. **功能实现** - 编辑 SKILL.md 和相关资源
5. **打包验证** - 使用 `package_skill.ts` 验证和打包
6. **测试迭代** - 根据实际使用情况进行改进

### 代理配置示例

```yaml
---
name: booking-requirement-analyzer
description: 预订页面需求理解和代码分析专家。专门分析静态代码模板、阅读 PRD 需求文档和编码规范。
tools: Read, Glob, Grep, Bash
model: inherit
---

您是资深前端需求分析师和代码架构专家，负责预订页面项目的需求理解和代码分析阶段。

**核心职责**：
分析用户提供的预订页面静态模板代码，深度理解业务需求，为后续开发步骤奠定坚实基础。
```

### 工作流编排示例

```markdown
# 预订页面胶水代码完成编排

当用户引用此规则文档时，系统将按照以下步骤执行页面胶水代码完成工作流：

1. **需求理解专家分析**：调用 booking-requirement-analyzer 代理
2. **数据集成专家设计**：调用 booking-data-integration-expert 代理
3. **UI 交互专家规划**：调用 booking-ui-interaction-expert 代理
4. **代码集成专家实现**：调用 booking-code-integrator 代理
5. **测试验证专家检查**：调用 booking-test-validator 代理
```

## 🛠️ 开发命令

```bash
# 构建项目
pnpm run build

# 运行 TypeScript 文件
pnpm run start

# 初始化新技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts <skill-name> --path <path>

# 打包现有技能
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts <path/to/skill-folder>
```

## 📚 技术栈

- **编程语言**：TypeScript/Node.js
- **包管理器**：pnpm
- **构建系统**：TypeScript 编译器 (CommonJS 输出)
- **核心库**：js-yaml, archiver
- **开发工具**：ts-node

## 🎯 应用场景

### 预订页面生成工作流

系统包含一个完整的预订页面生成工作流，通过 5 个专业代理的协作实现：

1. **需求分析** (`booking-requirement-analyzer`) - 分析静态模板和需求文档
2. **数据集成** (`booking-data-integration-expert`) - 设计 API 集成和数据层
3. **UI 交互** (`booking-ui-interaction-expert`) - 规划组件交互逻辑
4. **代码集成** (`booking-code-integrator`) - 生成完整的业务代码
5. **测试验证** (`booking-test-validator`) - 执行全面测试和质量验证

### 技能创建流程

```bash
# 创建图像处理技能
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts image-processor --path ./skills

# 编辑技能配置
vim ./skills/image-processor/SKILL.md

# 添加处理脚本
vim ./skills/image-processor/scripts/process.ts

# 打包技能
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts ./skills/image-processor
```

## 🔧 系统配置

### Claude Code 权限配置

系统在 `.claude/settings.local.json` 中预配置了以下权限：

- 包管理 (`pnpm install`, `pnpm run build:*`)
- TypeScript 执行 (`npx ts-node:*`, `node:*`)
- 归档操作 (`unzip:*`, `tree:*`)
- 技能使用 (`Skill(subagent-creator)`)

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

### 开发指南

- 遵循 TypeScript 最佳实践
- 确保所有脚本都有适当的错误处理
- 为新技能和代理添加完整的文档
- 运行 `pnpm run build` 确保代码编译成功

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 联系我们

- 项目主页：[https://github.com/evanfang0054/cc-system-creator-scripts](https://github.com/evanfang0054/cc-system-creator-scripts)
- 问题反馈：[Issues](https://github.com/evanfang0054/cc-system-creator-scripts/issues)
- 功能请求：[Feature Requests](https://github.com/evanfang0054/cc-system-creator-scripts/issues/new?template=feature_request.md)

---

<div align="center">

**[⬆ 返回顶部](#cc-系统---claude-code-扩展管理系统)**

Made with ❤️ by [Evan Fang](https://github.com/evanfang0054)

</div>