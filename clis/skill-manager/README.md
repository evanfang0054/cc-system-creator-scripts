# Skill Manager

<div align="center">

**多平台 AI Agent Skills 统一管理工具**

[![npm version](https://img.shields.io/npm/v/skill-manager)](https://www.npmjs.org/package/skill-manager)
[![Node.js Version](https://img.shields.io/node/v/skill-manager)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

支持 Claude Code、Cursor、Trae、VSCode、Windsurf 等多个 AI 开发平台的技能包统一管理

</div>

## ✨ 特性

- 🎯 **多平台支持** - 统一管理 Claude Code、Cursor、Trae、VSCode、Windsurf 等 AI 平台的技能包
- 📦 **一键安装** - 从 Git 仓库快速安装 AI 技能包,支持指定分支
- 🔄 **自动更新** - 批量更新已安装的技能包,保持最新版本
- 🔍 **智能扫描** - 自动发现并注册已安装但未记录的技能包
- 📊 **状态检查** - 查看已安装技能的详细信息和状态
- 🗑️ **便捷删除** - 安全卸载不需要的技能包
- 🔎 **仓库搜索** - 在 Git 仓库中快速搜索需要的技能
- 🎨 **多种输出格式** - 支持文本、表格、JSON 等多种输出格式
- ⚡ **并发控制** - 智能并发操作,提高批量处理效率
- 🛡️ **安全模式** - 支持干运行(dry-run)模式,预览操作结果
- 📝 **Shell 补全** - 支持 Bash、Zsh、Fish 的命令自动补全

## 📋 系统要求

- **Node.js**: >= 18.0.0
- **操作系统**: Linux、macOS、Windows (WSL)
- **Git**: 用于克隆技能仓库

## 🚀 快速开始

### 安装

```bash
# 全局安装 (推荐)
npm install -g skill-manager
# 或
pnpm add -g skill-manager

# 验证安装
skill-manager --version
```

### 基本使用

```bash
# 从 Git 仓库添加技能
skill-manager add https://github.com/user/skill-repo

# 查看已安装的技能
skill-manager check

# 更新所有技能
skill-manager update

# 删除技能
skill-manager remove skill-name

# 扫描并发现未注册的技能
skill-manager scan --register
```

## 📖 详细使用

### 1. 添加技能 (add)

从 Git 仓库安装新的技能包到指定平台。

```bash
# 基本用法 - 安装到 Claude Code
skill-manager add https://github.com/user/awesome-skill

# 自定义技能名称
skill-manager add https://github.com/user/skill-repo my-custom-name

# 安装到其他平台
skill-manager add https://github.com/user/skill-repo -p cursor
skill-manager add https://github.com/user/skill-repo -p trae

# 指定 Git 分支
skill-manager add https://github.com/user/skill-repo --branch develop

# 从本地路径添加
skill-manager add /path/to/local/skill
```

**支持的参数:**
- `<url>` - Git 仓库 URL 或本地路径
- `[name]` - 可选的自定义技能名称
- `-p, --platform <type>` - 目标平台 (claude-code|cursor|trae|vscode|windsurf),默认: claude-code
- `--branch <name>` - Git 分支名称,默认: main

### 2. 检查技能 (check)

查看已安装技能的详细信息。

```bash
# 列出所有技能
skill-manager check

# 过滤特定平台
skill-manager check -p cursor

# 显示详细信息
skill-manager check -v

# 使用表格输出
skill-manager check -o table

# JSON 格式输出 (便于脚本处理)
skill-manager check -o json

# 简洁列表格式
skill-manager check -o list
```

**输出格式:**
- `text` - 默认文本格式
- `table` - 表格格式,适合终端查看
- `json` - JSON 格式,便于程序处理
- `list` - 简洁列表格式

### 3. 更新技能 (update)

更新已安装的技能包到最新版本。

```bash
# 更新所有技能
skill-manager update

# 更新指定技能
skill-manager update skill-name

# 更新特定平台的技能
skill-manager update -p cursor

# 查看详细输出
skill-manager update -v

# 模拟运行 (不实际更新)
skill-manager update --dry-run
```

**注意:** 更新操作会拉取 Git 仓库的最新代码,但不会修改技能的配置文件。

### 4. 扫描技能 (scan)

发现并注册已安装但未在注册表中的技能。

```bash
# 扫描所有位置
skill-manager scan

# 只扫描全局安装
skill-manager scan --scope global

# 只扫描项目级安装
skill-manager scan --scope project

# 扫描特定平台
skill-manager scan -p cursor

# 自动注册发现的技能
skill-manager scan --register

# 组合使用
skill-manager scan --scope project --register -p claude-code
```

**扫描范围:**
- `global` - 全局技能目录 (~/.claude/skills, ~/.cursor/skills 等)
- `project` - 当前项目的技能目录 (./.claude/skills 等)
- `all` - 同时扫描全局和项目 (默认)

### 5. 删除技能 (remove)

卸载已安装的技能包。

```bash
# 删除技能
skill-manager remove skill-name

# 删除特定平台的技能
skill-manager remove skill-name -p cursor

# 模拟运行 (预览将被删除的内容)
skill-manager remove skill-name --dry-run
```

**注意:** 删除操作会同时:
1. 删除技能目录中的文件
2. 从注册表中移除记录

### 6. 搜索技能 (search)

在 Git 仓库中搜索可用的技能。

```bash
# 搜索关键词
skill-manager search typescript

# 在指定仓库中搜索
skill-manager search react --repo https://github.com/user/skills-collection
```

### 7. Shell 补全 (completion)

生成命令自动补全脚本,提高使用效率。

```bash
# 生成 Zsh 补全脚本
skill-manager completion zsh

# 生成 Bash 补全脚本
skill-manager completion bash

# 生成 Fish 补全脚本
skill-manager completion fish

# 指定输出目录
skill-manager completion zsh --dir ~/.local/share/bash-completion/completions
```

**启用补全:**

**Zsh:**
```bash
# 添加到 ~/.zshrc
eval "$(skill-manager completion zsh)"
```

**Bash:**
```bash
# 添加到 ~/.bashrc
eval "$(skill-manager completion bash)"
```

**Fish:**
```bash
# 添加到 ~/.config/fish/completions/skill-manager.fish
skill-manager completion fish > ~/.config/fish/completions/skill-manager.fish
```

## 🎯 全局选项

所有命令都支持以下全局选项:

```bash
# 显示详细输出
skill-manager -v check

# 模拟运行 (不执行实际操作)
skill-manager --dry-run update

# 组合使用
skill-manager -v --dry-run add https://github.com/user/skill-repo
```

## 📁 配置和目录

### 目录结构

```
~/.skill-manager/          # 配置目录
├── registry.json          # 技能注册表
└── cache/                 # 缓存目录 (未来功能)

~/.claude/skills/          # Claude Code 全局技能目录
~/.cursor/skills/          # Cursor 全局技能目录
~/.trae/skills/            # Trae 全局技能目录
~/.vscode/skills/          # VSCode 全局技能目录
~/.windsurf/skills/        # Windsurf 全局技能目录

./.claude/skills/          # Claude Code 项目级技能目录
./.cursor/skills/          # Cursor 项目级技能目录
# ... 其他平台类似
```

### 注册表格式

`~/.skill-manager/registry.json`:

```json
{
  "skills": [
    {
      "name": "commit",
      "platform": "claude-code",
      "scope": "global",
      "version": "1.0.0",
      "description": "生成符合规范的 Git 提交信息",
      "author": "Your Name",
      "repository": "https://github.com/user/commit-skill",
      "installedAt": "2026-01-31T12:00:00.000Z",
      "lastUpdated": "2026-01-31T12:00:00.000Z",
      "branch": "main"
    }
  ]
}
```

## 🔧 开发

### 项目结构

```
skill-manager/
├── bin/
│   └── run.js              # CLI 入口
├── src/
│   ├── commands/           # 命令实现
│   │   ├── add.ts
│   │   ├── check.ts
│   │   ├── remove.ts
│   │   ├── scan.ts
│   │   ├── search.ts
│   │   └── update.ts
│   ├── lib/                # 工具库
│   │   ├── config.ts       # 配置管理
│   │   ├── gitlab.ts       # Git 操作
│   │   ├── logger.ts       # 日志系统
│   │   ├── progress.ts     # 进度条
│   │   ├── formatters.ts   # 输出格式化
│   │   ├── validation.ts   # 参数验证
│   │   ├── errors.ts       # 错误处理
│   │   ├── concurrent.ts   # 并发控制
│   │   ├── completion.ts   # Shell 补全
│   │   └── ...
│   ├── types/
│   │   └── index.ts        # 类型定义
│   └── index.ts            # 主入口
├── package.json
├── tsconfig.json
└── README.md
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/skill-manager.git
cd skill-manager

# 安装依赖
pnpm install

# 开发模式 (监听文件变化)
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **Commander.js** - CLI 框架
- **Chalk** - 终端颜色输出
- **Ora** - 加载动画
- **cli-progress** - 进度条
- **cli-table3** - 表格输出
- **simple-git** - Git 操作
- **Zod** - 参数验证
- **p-limit** - 并发控制
- **SemVer** - 版本比较

## 🤝 贡献

欢迎贡献! 请遵循以下步骤:

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个很酷的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循项目的 ESLint 和 Biome 配置
- 添加必要的类型注解
- 编写清晰的注释和文档
- 确保所有测试通过

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范:

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `perf:` - 性能优化
- `test:` - 测试相关
- `chore:` - 构建工具、依赖更新

示例:
```
feat(commands): 添加技能导出功能

支持将已安装的技能导出为 JSON 格式,
便于备份和迁移配置
```

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件
