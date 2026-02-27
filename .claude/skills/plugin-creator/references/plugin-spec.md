# Claude Code 插件开发规范

基于 [Claude Code 官方文档](https://code.claude.com/docs/en/plugins) 整理的完整插件开发指南。

## 目录

- [何时使用插件 vs 独立配置](#何时使用插件-vs-独立配置)
- [插件目录结构](#插件目录结构)
- [配置文件详解](#配置文件详解)
- [开发与测试](#开发与测试)
- [发布与分发](#发布与分发)
- [迁移指南](#迁移指南)

---

## 何时使用插件 vs 独立配置

Claude Code 支持两种方式添加自定义技能、代理和钩子：

| 方式 | 技能名称 | 适用场景 |
|------|---------|---------|
| **独立配置** (`.claude/` 目录) | `/hello` | 个人工作流、项目特定定制、快速实验 |
| **插件** (带 `.claude-plugin/plugin.json` 的目录) | `/plugin-name:hello` | 团队共享、社区分发、版本发布、跨项目复用 |

### 使用独立配置的场景

- 为单个项目定制 Claude Code
- 配置是个人使用的，无需共享
- 在打包前实验技能或钩子
- 需要简短的技能名称如 `/hello` 或 `/review`

### 使用插件的场景

- 与团队或社区共享功能
- 跨多个项目使用相同的技能/代理
- 需要版本控制和便捷更新
- 通过市场分发
- 接受命名空间技能如 `/my-plugin:hello`（命名空间防止插件间冲突）

---

## 插件目录结构

### 目录说明

| 目录 | 位置 | 用途 |
|------|------|------|
| `.claude-plugin/` | 插件根目录 | 包含 `plugin.json` 清单（组件使用默认位置时可选） |
| `commands/` | 插件根目录 | 斜杠命令（Markdown 文件） |
| `agents/` | 插件根目录 | 自定义代理定义 |
| `skills/` | 插件根目录 | 代理技能（包含 `SKILL.md` 文件） |
| `hooks/` | 插件根目录 | `hooks.json` 中的事件处理器 |
| `.mcp.json` | 插件根目录 | MCP 服务器配置 |
| `.lsp.json` | 插件根目录 | 代码智能的 LSP 服务器配置 |
| `settings.json` | 插件根目录 | 插件启用时应用的默认设置 |

### 完整插件结构示例

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # 插件元数据清单
├── commands/                # 斜杠命令（可选）
│   └── review.md            # 命令定义
├── agents/                  # 专业代理（可选）
│   └── security-reviewer.md # 代理配置
├── skills/                  # 代理技能（可选）
│   └── code-review/
│       └── SKILL.md         # 技能定义
├── hooks/                   # 事件处理器（可选）
│   └── hooks.json           # 钩子配置
├── .mcp.json                # MCP 服务器配置（可选）
├── .lsp.json                # LSP 服务器配置（可选）
├── settings.json            # 默认设置（可选）
└── README.md                # 插件文档
```

---

## 配置文件详解

### 插件清单 (plugin.json)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名称"
}
```

### 技能定义 (SKILL.md)

每个 `SKILL.md` 需要包含 `name` 和 `description` 的 frontmatter，后跟指令：

```markdown
---
name: code-review
description: 审查代码的最佳实践和潜在问题。用于审查代码、检查 PR 或分析代码质量时使用。
---

审查代码时检查：

1. 代码组织和结构
2. 错误处理
3. 安全问题
4. 测试覆盖率
```

### 代理配置 (agents/*.md)

```markdown
---
name: security-reviewer
description: 安全审查代理
tools: Read, Grep, Glob
model: inherit
---

系统提示内容...
```

**可用工具列表：**
- `Read` - 读取文件
- `Write` - 写入文件
- `Edit` - 编辑文件
- `Glob` - 文件模式匹配
- `Grep` - 内容搜索
- `Bash` - 执行命令

**模型选择：**
- `inherit` - 继承父代理模型
- `sonnet` - Claude Sonnet
- `opus` - Claude Opus
- `haiku` - Claude Haiku

### 钩子配置 (hooks/hooks.json)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["echo '执行命令前'"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": ["echo '文件写入后'"]
      }
    ]
  }
}
```

**支持的钩子事件：**
- `PreToolUse` - 工具执行前
- `PostToolUse` - 工具执行后
- `Notification` - 通知事件

### MCP 服务器配置 (.mcp.json)

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./server.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### LSP 服务器配置 (.lsp.json)

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

### 默认设置 (settings.json)

```json
{
  "agent": "security-reviewer"
}
```

设置 `agent` 会激活插件的自定义代理作为主线程，应用其系统提示、工具限制和模型。

---

## 开发与测试

### 本地测试插件

```bash
# 使用 --plugin-dir 标志测试插件
claude --plugin-dir ./my-plugin
```

### 测试清单

- [ ] 使用 `/plugin-name:skill-name` 测试技能
- [ ] 检查代理是否出现在 `/agents` 中
- [ ] 验证钩子按预期工作
- [ ] 测试 MCP 服务器连接
- [ ] 验证 LSP 服务器功能

### 调试插件问题

1. **检查结构**：确保目录位于插件根目录，不在 `.claude-plugin/` 内
2. **单独测试组件**：分别检查每个命令、代理和钩子
3. **使用验证工具**：参考调试和开发工具的 CLI 命令
4. **查看日志**：检查 Claude Code 的输出日志

### 常见问题

| 问题 | 解决方案 |
|------|---------|
| 技能无法加载 | 检查 `SKILL.md` 的 frontmatter 格式 |
| 代理不显示 | 确认文件位于 `agents/` 目录 |
| 钩子不触发 | 验证 `hooks.json` 的 matcher 配置 |
| MCP 连接失败 | 检查命令路径和环境变量 |

---

## 发布与分发

### 发布前检查

1. **添加文档**：包含 `README.md`，说明安装和使用方法
2. **版本控制**：在 `plugin.json` 中使用语义化版本
3. **创建或使用市场**：通过插件市场分发
4. **团队测试**：在更广泛分发前让团队成员测试

### 版本规范

使用语义化版本号（Semantic Versioning）：

- `1.0.0` - 初始稳定版本
- `1.1.0` - 新增功能
- `1.1.1` - Bug 修复
- `2.0.0` - 重大变更

### 提交到官方市场

使用以下表单提交到 Anthropic 官方市场：

- **Claude.ai**: [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Console**: [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

---

## 迁移指南

### 从独立配置迁移到插件

| 独立配置 (`.claude/`) | 插件 |
|------|------|
| 仅在一个项目中可用 | 可通过市场共享 |
| 文件在 `.claude/commands/` | 文件在 `plugin-name/commands/` |
| 钩子在 `settings.json` | 钩子在 `hooks/hooks.json` |
| 必须手动复制共享 | 使用 `/plugin install` 安装 |

### 迁移步骤

1. 创建插件目录结构
2. 复制命令文件到 `commands/`
3. 复制代理文件到 `agents/`
4. 复制技能文件夹到 `skills/`
5. 转换钩子配置到 `hooks/hooks.json`
6. 创建 `plugin.json` 清单
7. 添加 `README.md` 文档
8. 测试插件功能

---

## 参考资料

- [Claude Code 官方文档 - Plugins](https://code.claude.com/docs/en/plugins)
- [Agent Skills 开发指南](https://code.claude.com/docs/en/skills)
- [Subagents 配置](https://code.claude.com/docs/en/subagents)
- [Hooks 事件处理](https://code.claude.com/docs/en/hooks)
- [MCP 服务器集成](https://code.claude.com/docs/en/mcp)
