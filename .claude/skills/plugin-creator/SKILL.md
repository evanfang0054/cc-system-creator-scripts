---
name: plugin-creator
description: 将用户提供的 skills、agents、commands、hooks、MCP 配置等组件整理打包成标准 Claude Code 插件。当用户需要：(1) 将现有技能/代理转换为可分发插件，(2) 组织多个组件为统一插件结构，(3) 创建符合插件规范的项目，(4) 从独立配置迁移到插件格式时使用。
---

# Plugin Creator

将分散的 Claude Code 组件整合为标准的可分发插件。

## 概述

此技能帮助用户将现有的 skills、agents、commands、hooks、MCP 服务器配置等组件，按照 Claude Code 插件规范组织成完整的插件结构，便于团队共享和社区分发。

## 工作流程

```
用户提供组件 → 分析与验证 → 规划结构 → 创建插件 → 验证完整性
```

### 步骤 1：收集用户组件

首先明确用户提供的组件类型和位置：

| 组件类型 | 标识 | 来源位置 |
|---------|------|---------|
| Skills | `skills/` | 包含 SKILL.md 的目录 |
| Agents | `agents/*.md` | YAML frontmatter 配置文件 |
| Commands | `commands/*.md` | 斜杠命令定义 |
| Hooks | `hooks.json` 或 `settings.json` | 钩子配置 |
| MCP | `.mcp.json` | MCP 服务器配置 |
| LSP | `.lsp.json` | LSP 服务器配置 |
| Settings | `settings.json` | 默认设置 |

询问用户：
1. 插件名称和描述
2. 各组件的源路径
3. 是否需要创建新的组件

### 步骤 2：规划插件结构

基于收集的组件，规划目标结构：

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # 必需：插件元数据
├── commands/                # 可选：斜杠命令
├── agents/                  # 可选：代理定义
├── skills/                  # 可选：技能
│   └── skill-name/
│       └── SKILL.md
├── hooks/                   # 可选：钩子
│   └── hooks.json
├── .mcp.json                # 可选：MCP 配置
├── .lsp.json                # 可选：LSP 配置
├── settings.json            # 可选：默认设置
└── README.md                # 推荐：使用文档
```

### 步骤 3：创建插件清单

生成 `plugin.json`：

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "插件功能描述",
  "author": "作者名称"
}
```

**命名规范：**
- 使用小写字母和连字符
- 简洁且具有描述性
- 避免与现有插件冲突

### 步骤 4：迁移组件

按以下规则迁移各组件：

#### Skills 迁移
- 复制整个 skill 目录到 `skills/`
- 验证 SKILL.md 包含有效的 frontmatter
- 确保 `name` 和 `description` 字段完整

#### Agents 迁移
- 复制 `.md` 文件到 `agents/`
- 验证 YAML frontmatter 格式
- 确认 `tools` 和 `model` 配置正确

#### Commands 迁移
- 复制 `.md` 文件到 `commands/`
- 命令文件无需 frontmatter

#### Hooks 迁移
从 settings.json 提取钩子配置，转换为 `hooks/hooks.json`：

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Notification": [...]
  }
}
```

#### MCP/LSP 迁移
- 直接复制 `.mcp.json` 和 `.lsp.json` 到插件根目录
- 检查路径引用是否需要调整

### 步骤 5：生成文档

创建 README.md，包含：

```markdown
# Plugin Name

简短描述插件功能。

## 安装

```bash
claude /plugin install <plugin-path>
```

## 组件

### Skills
- `skill-name`: 技能描述

### Commands
- `/command-name`: 命令描述

### Agents
- `agent-name`: 代理描述

## 使用示例

具体使用示例...

## 配置

可选配置说明...
```

### 步骤 6：验证插件

运行验证检查：

```bash
# 检查插件结构
claude --plugin-dir ./plugin-name --validate
```

**验证清单：**
- [ ] plugin.json 存在且格式正确
- [ ] 所有 SKILL.md 包含有效 frontmatter
- [ ] agents/*.md 格式正确
- [ ] hooks.json 语法有效
- [ ] MCP/LSP 配置路径正确
- [ ] README.md 包含基本使用说明

## 组件格式规范

详细格式规范参见 [references/plugin-spec.md](references/plugin-spec.md)。

### SKILL.md 格式

```markdown
---
name: skill-name
description: 触发条件和使用场景描述
---

技能指令内容...
```

### Agent 格式

```markdown
---
name: agent-name
description: 代理用途描述
tools: Read, Write, Edit, Grep, Glob, Bash
model: inherit
---

系统提示内容...
```

### Hooks 格式

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["命令"]
      }
    ]
  }
}
```

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| 技能命名冲突 | 使用插件命名空间：`/plugin-name:skill-name` |
| 路径引用错误 | 使用相对于插件根目录的路径 |
| 钩子不触发 | 检查 matcher 配置和命令可执行性 |
| MCP 连接失败 | 验证命令路径和环境变量 |

## 输出

完成后输出：
1. 插件目录结构概览
2. 包含的组件清单
3. 安装和测试命令
4. 后续分发建议
