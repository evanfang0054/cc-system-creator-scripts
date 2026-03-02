---
name: translate
description: 批量文件翻译技能。支持并行翻译多个文件到中文，自动处理 API 超时，保留代码块和技术术语。触发场景包括"翻译文件"、"批量翻译"、"中文化文档"、"translate to Chinese"。
allowed-tools: Agent, Read, Write, Edit, Glob, Grep
---

# 批量翻译技能

## 概述

基于 3 个月使用数据分析，翻译是你第二大高频任务（12 次会话）。本技能优化了批量翻译流程，支持并行处理和自动容错。

## 翻译规则

### 必须保留不翻译
- 代码块（```包裹的内容）
- 行内代码（`code`）
- Frontmatter 元数据（YAML 头部）
- URL 和链接地址
- 文件路径
- 环境变量名
- 技术术语（API、MCP、SDK、CLI 等）
- 专有名词（React、TypeScript、npm 等）

### 格式保留
- Markdown 标题层级
- 列表缩进
- 表格结构
- 引用块
- HTML 标签

### 语言风格
- 目标语言：中文（默认）
- 使用简洁、专业的技术文档风格
- 保持原文的语气和表达习惯

## 执行策略

### 文件数量判断
- **1-3 个文件**：顺序翻译，直接处理
- **4-9 个文件**：小批量并行（2-3 个一组）
- **10+ 个文件**：使用并行 Task agents（每组 5 个文件）

### 并行翻译流程（10+ 文件）

```
1. Glob 查找目标文件
2. 分组（每组 5 个文件）
3. 为每组启动 Task agent
4. 监控完成状态
5. 处理失败的文件（手动回退）
```

### 容错机制

当 API 超时（524 错误）时：
1. 记录失败的文件
2. 回退到顺序手动翻译
3. 逐个完成剩余文件

## 使用方式

### 单文件翻译
```
/translate path/to/file.md
```

### 目录批量翻译
```
/translate docs/ --lang zh
```

### 指定文件类型
```
/translate src/ --ext .md,.txt
```

### 排除文件
```
/translate docs/ --exclude node_modules,dist
```

## 翻译模板

### Markdown 文件头部注释
翻译完成后在文件头部添加：
```html
<!--
翻译状态：已完成
源语言：English
目标语言：中文
翻译时间：YYYY-MM-DD
-->
```

## 质量检查清单

- [ ] 代码块内容未被修改
- [ ] Frontmatter 保持原格式
- [ ] 技术术语保留英文
- [ ] Markdown 格式正确
- [ ] 链接可正常访问
- [ ] 无遗漏段落

## 示例工作流

### 场景：翻译 16 个文档文件

```bash
# 1. 查找所有 markdown 文件
glob: docs/**/*.md

# 2. 分组（每组 5 个）
Group 1: file1.md, file2.md, file3.md, file4.md, file5.md
Group 2: file6.md, file7.md, file8.md, file9.md, file10.md
Group 3: file11.md, file12.md, file13.md, file14.md, file15.md
Group 4: file16.md

# 3. 启动并行 agents
# 使用 Task tool 为每组启动 agent

# 4. 处理失败（如有）
# 手动翻译 API 超时的文件
```

## 常见问题

**Q: 如何处理代码注释？**
A: 代码块内的注释不翻译，代码块外的注释翻译。

**Q: 技术文档中的命令怎么办？**
A: 命令和参数保持原样，只翻译说明文字。

**Q: 遇到无法确定的专业术语？**
A: 保留英文原文，可在括号中添加中文解释。

## 参考资料

### references/translation-glossary.md
常用技术术语翻译对照表：
- Agent -> 代理
- Skill -> 技能
- Hook -> 钩子
- Commit -> 提交
- Repository -> 仓库
- Branch -> 分支

### references/style-guide.md
中文技术文档写作风格指南。
