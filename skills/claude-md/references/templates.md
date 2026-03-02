# CLAUDE.md 模板集合

## 最小化模板

```markdown
# CLAUDE.md

## 开发命令

\`\`\`bash
yarn install    # 安装依赖
yarn dev        # 开发模式
yarn build      # 构建
\`\`\`

## 技术栈

- React + TypeScript
- Vite
- Ant Design
```

## React 项目模板

```markdown
# CLAUDE.md

## 项目概述

[项目名称] - [项目简介]

## 开发原则 (KISS)

- 保持代码简单直接
- 优先选择简单解决方案
- 不引入不需要的复杂度

## 开发命令

\`\`\`bash
yarn install        # 安装依赖
yarn dev            # 开发服务器
yarn build          # 生产构建
yarn test           # 运行测试
yarn lint           # 代码检查
\`\`\`

## 包管理配置

- **包管理器**: yarn
- **私有仓库**: https://npm.dragonpass.com.cn/

## 技术栈

- **框架**: React 18
- **语言**: TypeScript 5
- **构建**: Vite
- **UI**: Ant Design 5
- **状态**: Zustand
- **请求**: Axios

## 项目结构

\`\`\`
src/
├── components/     # 组件
├── hooks/          # 自定义 Hooks
├── pages/          # 页面
├── services/       # API 服务
├── stores/         # 状态管理
├── types/          # 类型定义
└── utils/          # 工具函数
\`\`\`

## Git 提交规范

使用中文 Conventional Commits：

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- refactor: 代码重构
- test: 测试相关
- chore: 构建/依赖
```

## Monorepo 项目模板

```markdown
# CLAUDE.md

## Monorepo 结构

\`\`\`
packages/
├── web/            # Web 应用
├── mobile/         # 移动端
├── shared/         # 共享代码
└── ui/             # UI 组件库
\`\`\`

## 工作区命令

\`\`\`bash
# 安装所有依赖
yarn install

# 运行特定包
yarn workspace @scope/web dev

# 构建特定包
yarn workspace @scope/shared build

# 运行所有测试
yarn workspaces run test
\`\`\`

## 依赖管理

- 使用 yarn workspaces
- 共享依赖提升到根目录
- 版本使用 Changesets 管理
```

## Git Submodule 项目模板

```markdown
# CLAUDE.md

## Git 子模块

项目使用子模块管理共享代码：

\`\`\`bash
# 初始化
git submodule update --init --recursive

# 更新子模块
git submodule update --remote
\`\`\`

## 子模块说明

| 子模块 | 路径 | 说明 |
|--------|------|------|
| shared-components | libs/shared | 共享组件 |
| common-utils | libs/utils | 通用工具 |

## 注意事项

- 提交前先更新子模块
- 子模块变更需单独提交
- CI/CD 需要初始化子模块
```

## MCP 项目模板

```markdown
# CLAUDE.md

## MCP 服务器配置

项目包含 MCP 服务器：

\`\`\`bash
# 构建 MCP
cd mcp/server-name
yarn build

# 调试 MCP
yarn inspector

# 运行 MCP
yarn start
\`\`\`

## 可用工具

- \`tool_name\`: 工具说明
- \`another_tool\`: 另一个工具说明
```
```
