---
name: claude-md
description: 项目 CLAUDE.md 文档生成器。为项目创建或更新 CLAUDE.md 配置文件，包含开发约定、构建命令、技术栈说明。触发场景包括"创建 CLAUDE.md"、"更新项目文档"、"生成 Claude 配置"。
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# CLAUDE.md 生成器

## 概述

基于 10 次文档创建会话的分析，本技能帮助你快速生成标准化的 CLAUDE.md 文件，避免重复说明项目配置。

## 标准模板

```markdown
# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

[项目名称和简介]

## 开发原则 (KISS)

遵循 **KISS (Keep It Simple, Stupid)** 原则：
- 保持代码简单直接，避免过度设计
- 优先选择简单易懂的解决方案
- 不需要的复杂度不要引入
- 代码可读性优于炫技

## 开发命令

\`\`\`bash
# 安装依赖
yarn install

# 开发模式
yarn dev

# 构建
yarn build

# 测试
yarn test

# 代码检查
yarn lint
\`\`\`

## 包管理配置

- **包管理器**：yarn（不是 npm）
- **私有仓库**：https://npm.dragonpass.com.cn/
- **Node 版本**：[版本要求]

## 项目结构

\`\`\`
project-root/
├── src/           # 源代码
├── libs/          # Git 子模块共享库
├── packages/      # Monorepo 子包
├── public/        # 静态资源
└── tests/         # 测试文件
\`\`\`

## 技术栈

- **框架**：[React/Vue/Next.js 等]
- **语言**：TypeScript
- **样式**：[CSS 方案]
- **状态管理**：[状态管理方案]
- **UI 组件库**：[Ant Design/其他]

## Git 提交规范

### 提交信息格式

\`\`\`
<type>(<scope>): <subject>
\`\`\`

### 提交类型

- **feat** - 新功能
- **fix** - 修复问题
- **docs** - 文档更新
- **refactor** - 代码重构
- **test** - 测试相关
- **chore** - 构建/依赖更新

### 重要约定

- 提交信息使用中文
- 不添加 AI 工具签名
- 遵循 Conventional Commits 规范

## 架构约定

[项目特定的架构说明]

## 注意事项

[其他需要 Claude 了解的约定]
```

## 自动检测项

执行时会自动检测以下信息：

### 1. 包管理器检测
```bash
# 检测 yarn
[ -f yarn.lock ] && echo "yarn"
# 检测 pnpm
[ -f pnpm-lock.yaml ] && echo "pnpm"
# 检测 npm
[ -f package-lock.json ] && echo "npm"
```

### 2. 框架检测
- `next.config.js` → Next.js
- `nuxt.config.js` → Nuxt.js
- `vue.config.js` → Vue CLI
- `craco.config.js` → CRACO
- `vite.config.ts` → Vite

### 3. Monorepo 检测
- `pnpm-workspace.yaml` → pnpm workspace
- `lerna.json` → Lerna
- `turbo.json` → Turborepo

### 4. 子模块检测
```bash
git submodule status
```

## 使用方式

### 创建新 CLAUDE.md
```
/claude-md
```

### 更新现有 CLAUDE.md
```
/claude-md --update
```

### 指定项目路径
```
/claude-md /path/to/project
```

### 添加特定配置
```
/claude-md --with-mcp --with-submodules
```

## 配置选项

| 选项 | 说明 |
|------|------|
| `--update` | 更新现有文件，保留自定义内容 |
| `--with-mcp` | 包含 MCP 服务器配置 |
| `--with-submodules` | 包含子模块说明 |
| `--with-agents` | 包含代理配置说明 |
| `--minimal` | 生成最小化版本 |

## 信息收集流程

1. 读取 `package.json` 获取依赖和脚本
2. 检测项目结构和框架
3. 查找现有配置文件
4. 分析 Git 子模块
5. 识别 MCP 配置
6. 生成完整文档

## 常见项目类型模板

### React + Ant Design 项目
```markdown
## 技术栈
- **框架**：React 18
- **语言**：TypeScript
- **UI 组件库**：Ant Design
- **状态管理**：Zustand/Redux
- **构建工具**：Vite/CRA
```

### Monorepo 项目
```markdown
## Monorepo 结构

\`\`\`
packages/
├── shared/        # 共享组件
├── utils/         # 工具函数
├── ui/            # UI 组件库
└── main-app/      # 主应用
\`\`\`

## 工作区命令
\`\`\`bash
yarn workspace @scope/package-name dev
yarn workspace @scope/package-name build
\`\`\`
```

### Git Submodule 项目
```markdown
## Git 子模块

项目使用 Git 子模块管理共享代码：

\`\`\`bash
# 初始化子模块
git submodule update --init --recursive

# 更新子模块
git submodule update --remote
\`\`\`

子模块位于 `libs/` 目录：
- `libs/shared-components` - 共享组件
- `libs/common-utils` - 通用工具
```

## 质量检查

生成的 CLAUDE.md 应包含：
- [ ] 项目概述
- [ ] 开发原则
- [ ] 常用命令
- [ ] 包管理器配置
- [ ] 技术栈说明
- [ ] Git 提交规范
- [ ] 项目特定约定
