# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

CC 系统是一个 **Claude Code 扩展和管理系统**，提供了一个用于创建、管理和部署 AI 技能和代理的复杂框架。该系统通过模块化、可重用的组件和自动化工作流来增强 Claude Code 的功能。

## 架构

### 目录结构

```
cc-system/
├── .claude/                    # Claude Code 系统配置
│   ├── agents/                 # 系统级代理 (gherkin-analyst, universal-translator)
│   ├── skills/                 # 核心管理技能
│   │   ├── hook-creator/       # Claude Code hook 管理
│   │   ├── skill-creator/      # 技能创建框架
│   │   └── subagent-creator/   # 代理创建框架
│   └── settings.local.json     # Claude Code 权限
├── agents/                     # 项目特定的预订工作流代理
│   ├── booking-requirement-analyzer.md
│   ├── booking-data-integration-expert.md
│   ├── booking-ui-interaction-expert.md
│   ├── booking-code-integrator.md
│   └── booking-test-validator.md
└── skills/                     # 项目特定技能
    ├── booking-page-codegen-v0.0.1/
    ├── booking-page-codegen-v0.0.2/
    └── booking-page-codegen-v0.0.3/
```

### 核心组件

1. **技能管理框架** (`.claude/skills/skill-creator/`)
   - 使用 TypeScript 自动化创建和管理可重用的 AI 技能
   - 提供技能初始化、验证和打包的脚本
   - 包含全面的技能创建指南和最佳实践

2. **代理管理系统** (`.claude/skills/subagent-creator/`)
   - 创建具有自定义功能的专业 Claude 子代理
   - 代理的 YAML frontmatter 配置
   - 工具权限管理和模型选择

3. **预订页面代码生成工作流** (`skills/booking-page-codegen-v*/`)
   - 生成完整预订页面的多代理协作工作流
   - 按顺序协调 5 个专业代理
   - 版本控制的技能迭代 (v0.0.1, v0.0.2, v0.0.3)

## 开发命令

```bash
# 构建 TypeScript 文件
pnpm run build

# 直接运行 TypeScript 文件
pnpm run start

# 初始化新技能（示例）
npx ts-node .claude/skills/skill-creator/scripts/init_skill.ts <skill-name> --path <path>

# 打包现有技能（示例）
npx ts-node .claude/skills/skill-creator/scripts/package_skill.ts <path/to/skill-folder>
```

## 关键模式

### 代理结构
每个代理都遵循 YAML frontmatter 配置：
```yaml
---
name: agent-name
description: 何时使用此代理
tools: Read, Write, Edit  # 可选工具限制
model: inherit           # 模型选择
---
定义角色和行为的系统提示
```

### 技能结构
每个技能包含：
- **SKILL.md**（必需）：YAML 元数据 + markdown 指令
- **scripts/**：可执行的 TypeScript 代码
- **references/**：按需加载的文档
- **assets/**：输出中使用的模板和文件

### 工作流编排
技能按顺序协调多个代理：
1. 需求分析 → 2. 数据集成 → 3. UI 规划 → 4. 代码实现 → 5. 测试

## 权限

Claude Code 已配置以下权限：
- 包管理 (`pnpm install`, `pnpm run build:*`)
- TypeScript 执行 (`npx ts-node:*`, `node:*`)
- 归档操作 (`unzip:*`, `tree:*`)
- 技能使用 (`Skill(subagent-creator)`)

## 技术栈

- **语言**：TypeScript/Node.js
- **包管理器**：pnpm
- **构建系统**：带 CommonJS 输出的 TypeScript 编译器
- **核心库**：js-yaml, archiver
- **开发**：用于 TypeScript 执行的 ts-node

## 开发工作流

1. **技能创建**：使用带模板的 skill-creator 框架
2. **代理开发**：使用带 YAML 配置的 subagent-creator
3. **工作流实现**：创建协调多个代理的技能
4. **测试与验证**：内置技能验证和打包
5. **分发**：创建用于共享的 .skill 文件

该系统在 Claude Code 中实现企业级 AI 工作流自动化和标准化开发流程。

## Git 中文提交规范

### 配置支持

项目已配置完整的中文 Git 提交支持：

```bash
# 中文编码配置（自动设置）
git config core.quotepath false  # 显示中文路径不转义
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8
```

### 提交信息格式

使用项目配置的中文提交模板 (`.gitmessage`)：

```
# 基本格式
<type>(<scope>): <subject>

# 示例
feat(agents): 新增预订需求分析专家代理
fix(skills): 修复技能初始化脚本的类型错误
docs(readme): 更新安装说明和快速开始指南
```

### 提交类型说明

- **feat**: 新功能
- **fix**: 修复问题
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建工具、依赖更新
- **workflow**: 工作流改进

### CC 系统常用提交示例

```bash
# 新增功能
git commit -m "feat(workflow): 实现预订页面代码生成工作流

- 添加需求分析、数据集成、UI设计等专业代理
- 实现多代理协作的顺序执行机制
- 支持版本化的技能迭代管理
- 集成自动化测试验证流程

Closes #1"

# 文档更新
git commit -m "docs(api): 更新技能管理API文档

补充技能创建和打包接口的详细说明和使用示例"

# 问题修复
git commit -m "fix(agents): 修复代理配置解析的编码问题

解决中文配置文件读取时的乱码问题，确保UTF-8编码正确处理"
```

### 使用方法

```bash
# 使用模板提交（推荐）
git commit

# 直接提交
git commit -m "中文提交信息"

# 查看中文日志
git log --pretty=format:"%h %s" --graph
```

### 重要注意事项

生成commit message时，不要提交Claude Code相关的信息，例如

**坏的**
Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
