---
name: changelog
description: 基于 git commits 自动生成 CHANGELOG.md 变更日志。支持语义化版本、分类整理、多格式输出。触发场景包括"生成变更日志"、"更新 CHANGELOG"、"版本记录"。
allowed-tools: Bash(git:*), Read, Write, Edit
---

# 变更日志生成技能

## 概述

自动从 Git 提交历史生成结构化的 CHANGELOG.md，遵循 [Keep a Changelog](https://keepachangelog.com/) 规范。

## 变更类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | 新增用户登录功能 |
| fix | Bug 修复 | 修复登录验证失败问题 |
| docs | 文档更新 | 更新 API 文档 |
| style | 代码格式 | 调整代码缩进格式 |
| refactor | 代码重构 | 重构用户服务模块 |
| perf | 性能优化 | 优化列表渲染性能 |
| test | 测试相关 | 添加用户模块单元测试 |
| chore | 构建/工具 | 更新构建配置 |
| ci | CI/CD | 添加自动部署流程 |
| revert | 回滚 | 回滚登录功能变更 |

## 输出格式

### 标准 CHANGELOG 格式

```markdown
# Changelog

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- 待发布的新功能

## [1.2.0] - 2026-03-02

### Added
- 新增用户登录功能
- 新增权限管理模块

### Fixed
- 修复登录验证失败问题
- 修复表格分页显示错误

### Changed
- 优化首页加载速度
- 更新依赖版本

### Removed
- 移除废弃的 API 接口

## [1.1.0] - 2026-02-15

### Added
- 新增数据导出功能

### Fixed
- 修复文件上传失败问题
```

## 使用方式

### 生成完整 CHANGELOG
```
/changelog
```

### 生成指定版本范围
```
/changelog v1.0.0 v1.2.0
```

### 添加新版本
```
/changelog --new-version 1.3.0
```

### 只显示未发布变更
```
/changelog --unreleased
```

### 输出为 JSON 格式
```
/changelog --format json
```

## Git 命令参考

### 获取两个标签之间的提交
```bash
git log v1.0.0..v1.1.0 --pretty=format:"%s" --no-merges
```

### 获取所有标签
```bash
git tag -l --sort=-version:refname
```

### 获取上次标签以来的提交
```bash
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" --no-merges
```

### 按类型筛选提交
```bash
git log --pretty=format:"%s" --no-merges | grep "^feat"
```

## 解析规则

### Conventional Commit 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 解析示例

| 提交信息 | 类型 | 范围 | 主题 |
|----------|------|------|------|
| `feat(auth): add OAuth login` | feat | auth | add OAuth login |
| `fix: resolve null pointer` | fix | - | resolve null pointer |
| `docs(api): update endpoint docs` | docs | api | update endpoint docs |

## 自动化配置

### package.json 集成
```json
{
  "scripts": {
    "changelog": "claude -p '/changelog --new-version'",
    "release": "npm version patch && npm run changelog"
  }
}
```

### GitHub Actions 集成
```yaml
name: Update Changelog
on:
  push:
    tags:
      - 'v*'
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Generate Changelog
        run: |
          # 使用 claude-code 生成 changelog
```

## 模板定制

### 自定义分类
```json
{
  "categories": {
    "added": ["feat", "feature"],
    "fixed": ["fix", "bugfix"],
    "changed": ["refactor", "perf", "style"],
    "deprecated": ["deprecate"],
    "removed": ["remove"],
    "security": ["security"]
  }
}
```

### 自定义标题映射
```json
{
  "titles": {
    "added": "新增功能",
    "fixed": "问题修复",
    "changed": "变更优化",
    "security": "安全更新"
  }
}
```

## 常见场景

### 场景 1：准备发布
```bash
# 1. 确保所有提交已推送
git push

# 2. 生成变更日志
/changelog --new-version 1.2.0

# 3. 创建标签
git tag v1.2.0

# 4. 推送标签
git push --tags
```

### 场景 2：补丁版本
```bash
# 快速修复后的变更记录
/changelog v1.2.0 HEAD
```

### 场景 3：回溯历史
```bash
# 生成从项目开始的完整 changelog
/changelog --all
```

## 质量检查

- [ ] 版本号遵循语义化版本
- [ ] 日期格式统一 (YYYY-MM-DD)
- [ ] 变更分类准确
- [ ] 无重复条目
- [ ] 链接可访问

## 注意事项

1. **首次生成**：如果项目没有标签，会从第一个提交开始生成
2. **合并提交**：默认跳过 merge commits
3. **中文提交**：完全支持中文提交信息
4. **Breaking Changes**：自动识别并在文档中高亮显示
