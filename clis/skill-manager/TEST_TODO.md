# Skill Manager CLI 测试 TODO

> 基于 CLI Creator Standard 模板的完整测试计划
>
> 版本: 0.2.0 | 更新日期: 2026-01-31

## 📋 测试计划概述

本测试计划涵盖 Skill Manager CLI v0.2.0 的所有功能和场景，确保 CLI 在实际使用中的可靠性和稳定性。测试计划基于 CLI Creator Standard 模板的最佳实践，覆盖了 P0、P1、P2 三个优化阶段的所有新增功能。

### 测试范围

- **44 个测试组**，涵盖 **200+ 个测试用例**
- **P0 核心功能**: 环境兼容性、错误处理、基础命令
- **P1 功能增强**: 输出格式、进度条、版本检查
- **P2 高级功能**: 配置文件、Shell 补全、并发处理
- **P3 高级场景**: 边界情况、性能测试、集成测试

### 测试目标

1. ✅ 验证所有核心功能正常运行
2. ✅ 确保环境兼容性 (NO_COLOR, CI, TTY)
3. ✅ 测试错误处理和退出码
4. ✅ 验证新增的输出格式和进度条
5. ✅ 测试配置文件和 Shell 补全
6. ✅ 性能和并发处理验证
7. ✅ 完整的集成测试和场景测试

---

## 🔧 环境准备

### 前置条件

- [ ] **1.1 确认环境准备**
  - [ ] Node.js >= 18.0.0 已安装
  - [ ] pnpm 已安装
  - [ ] Git 已安装且可用
  - [ ] 有 GitLab 访问权限

- [ ] **1.2 项目准备**
  - [ ] 进入项目目录: `cd /Users/arwen/Desktop/Arwen/evanfang/cc-system-creator-scripts/clis/skill-manager`
  - [ ] 构建项目: `pnpm run build`
  - [ ] 全局安装: `pnpm install -g .`
  - [ ] 验证安装: `skill-manager --version`

- [ ] **1.3 清理环境**
  - [ ] 备份现有注册表: `cp ~/.skill-manager/registry.json ~/.skill-manager/registry.json.backup`
  - [ ] 清空注册表: `echo '{"skills":[]}' > ~/.skill-manager/registry.json`
  - [ ] 创建测试项目目录

---

## 🆕 基础命令测试

### Test-01: 帮助和版本命令

- [ ] **Test-01.1: 主帮助**
  ```bash
  skill-manager --help
  skill-manager -h
  ```
  - [ ] 显示所有命令列表 (scan, add, check, update, remove, search, completion)
  - [ ] 显示版本号选项
  - [ ] 显示全局选项 (--verbose, --dry-run, --version)
  - [ ] 帮助信息格式正确

- [ ] **Test-01.2: 版本号**
  ```bash
  skill-manager --version
  skill-manager -V
  ```
  - [ ] 显示版本号 `0.2.0`
  - [ ] 两种形式都能工作

- [ ] **Test-01.3: 全局选项**
  ```bash
  skill-manager --verbose scan
  skill-manager --dry-run add https://...
  skill-manager --version --verbose
  ```
  - [ ] `--verbose` 显示详细输出
  - [ ] `--dry-run` 模拟执行但不修改
  - [ ] 全局选项与命令选项兼容

### Test-01.5: 环境兼容性 (P0 新增)

- [ ] **Test-01.5.1: NO_COLOR 支持**
  ```bash
  NO_COLOR=1 skill-manager scan
  export NO_COLOR=1
  skill-manager check
  ```
  - [ ] 输出无颜色
  - [ ] 信息仍然清晰可读

- [ ] **Test-01.5.2: CI 环境检测**
  ```bash
  CI=true skill-manager scan
  # 或在真实 CI 环境中
  ```
  - [ ] 自动检测 CI 环境
  - [ ] 禁用交互式功能
  - [ ] 使用简化输出

- [ ] **Test-01.5.3: VERBOSE/DEBUG 模式**
  ```bash
  skill-manager --verbose scan
  VERBOSE=1 skill-manager check
  DEBUG=1 skill-manager update
  ```
  - [ ] `--verbose` 显示额外信息
  - [ ] `DEBUG=1` 显示调试信息
  - [ ] 帮助排查问题

- [ ] **Test-01.5.4: TTY 降级**
  ```bash
  # 非交互式环境
  skill-manager scan | cat
  echo "test" | skill-manager scan
  ```
  - [ ] 检测非 TTY 环境
  - [ ] 禁用进度条和动画
  - [ ] 使用简单输出格式

- [ ] **Test-01.5.5: 信号处理**
  ```bash
  skill-manager update
  # 按 Ctrl+C
  ```
  - [ ] 响应 SIGINT (Ctrl+C)
  - [ ] 清理临时文件
  - [ ] 显示友好的中断消息
  - [ ] 使用正确的退出码 (130)

- [ ] **Test-01.5.6: 错误退出码**
  ```bash
  skill-manager add invalid-url
  echo $?
  ```
  - [ ] 使用正确的退出码 (遵循 sysexits.h)
  - [ ] 网络错误: EXIT_NETWORK_ERROR
  - [ ] 验证错误: EXIT_CONFIG_ERROR
  - [ ] 文件错误: EXIT_IO_ERROR

---

## 🔍 Scan 命令测试 (核心功能)

### Test-02: 全局扫描

- [ ] **Test-02.1: 扫描空环境**
  ```bash
  # 清空所有 skills
  rm -rf ~/.claude/skills/*
  skill-manager scan
  ```
  - [ ] 显示"未发现任何 skills"
  - [ ] 没有错误信息

- [ ] **Test-02.2: 扫描全局 skills**
  ```bash
  # 创建测试 skills
  mkdir -p ~/.claude/skills/test-global-1
  cat > ~/.claude/skills/test-global-1/SKILL.md << 'EOF'
  ---
  name: test-global-1
  description: 全局测试技能1
  author: Test Author
  ---
  EOF

  mkdir -p ~/.claude/skills/test-global-2
  cat > ~/.claude/skills/test-global-2/SKILL.md << 'EOF'
  ---
  name: test-global-2
  description: 全局测试技能2
  ---
  EOF

  skill-manager scan
  ```
  - [ ] 发现 2 个 skills
  - [ ] 显示为"未注册"状态
  - [ ] 显示正确的路径和描述

- [ ] **Test-02.3: 只扫描全局**
  ```bash
  skill-manager scan --scope global
  ```
  - [ ] 只扫描 `~/.claude/skills/`
  - [ ] 不扫描项目目录

### Test-03: 项目扫描

- [ ] **Test-03.1: 在非项目目录扫描**
  ```bash
  cd /tmp
  skill-manager scan --scope project
  ```
  - [ ] 提示不在项目目录
  - [ ] 或者扫描结果为空

- [ ] **Test-03.2: 在项目目录扫描**
  ```bash
  cd /Users/arwen/Desktop/Arwen/evanfang/cc-system-creator-scripts/clis/skill-manager

  mkdir -p .claude/skills/test-project-1
  cat > .claude/skills/test-project-1/SKILL.md << 'EOF'
  ---
  name: test-project-1
  description: 项目测试技能1
  author: Project Author
  ---
  EOF

  skill-manager scan --scope project
  ```
  - [ ] 显示当前项目路径
  - [ ] 发现 1 个项目 skill
  - [ ] 标注为"(项目)"作用域

- [ ] **Test-03.3: 项目识别测试**
  ```bash
  # 测试项目识别
  cd /tmp/test-project

  # 无任何特征
  skill-manager scan --scope project
  # 预期: 不识别为项目

  # 添加 .git
  git init
  skill-manager scan --scope project
  # 预期: 识别为项目

  # 添加 package.json
  echo '{"name":"test"}' > package.json
  skill-manager scan --scope project
  # 预期: 识别为项目

  # 添加 .claude
  mkdir .claude
  skill-manager scan --scope project
  # 预期: 识别为项目
  ```

### Test-04: 混合扫描

- [ ] **Test-04.1: 扫描所有 (默认行为)**
  ```bash
  cd /Users/arwen/Desktop/Arwen/evanfang/cc-system-creator-scripts/clis/skill-manager

  # 确保有全局和项目 skills
  skill-manager scan
  ```
  - [ ] 同时扫描全局和项目
  - [ ] 分开显示两个区域
  - [ ] 正确标注作用域 (全局/项目)

- [ ] **Test-04.2: 作用域筛选**
  ```bash
  skill-manager scan --scope all
  skill-manager scan --scope global
  skill-manager scan --scope project
  ```
  - [ ] `--scope all`: 显示全局+项目
  - [ ] `--scope global`: 只显示全局
  - [ ] `--scope project`: 只显示项目

### Test-05: 平台筛选

- [ ] **Test-05.1: 单平台扫描**
  ```bash
  skill-manager scan --platform claude-code
  ```
  - [ ] 只扫描 Claude Code 平台
  - [ ] 不扫描其他平台

- [ ] **Test-05.2: 多平台环境**
  ```bash
  # 在多个平台创建同名 skill
  mkdir -p ~/.cursor/skills/test-multi
  cat > ~/.cursor/skills/test-multi/SKILL.md << 'EOF'
  ---
  name: test-multi
  description: 多平台测试
  ---
  EOF

  skill-manager scan
  ```
  - [ ] 区分不同平台的 skills
  - [ ] 显示平台标签

### Test-06: 注册功能

- [ ] **Test-06.1: 自动注册**
  ```bash
  skill-manager scan --register
  ```
  - [ ] 所有未注册的 skills 被注册
  - [ ] 显示"注册成功"消息
  - [ ] 注册表文件已更新

- [ ] **Test-06.2: 重复注册保护**
  ```bash
  # 运行两次
  skill-manager scan --register
  skill-manager scan --register
  ```
  - [ ] 第二次显示"已注册"
  - [ ] 不会重复添加到注册表

- [ ] **Test-06.3: 验证注册表**
  ```bash
  cat ~/.skill-manager/registry.json
  ```
  - [ ] JSON 格式正确
  - [ ] 包含 `scope` 字段
  - [ ] 项目 skills 包含 `projectPath` 字段

### Test-07: 边界情况

- [ ] **Test-07.1: 无效的 SKILL.md**
  ```bash
  mkdir -p ~/.claude/skills/invalid-skill
  echo "invalid content" > ~/.claude/skills/invalid-skill/SKILL.md

  skill-manager scan
  ```
  - [ ] 跳过无效的 skill
  - [ ] 显示警告信息

- [ ] **Test-07.2: 缺少 SKILL.md**
  ```bash
  mkdir -p ~/.claude/skills/no-skill-md
  # 不创建 SKILL.md

  skill-manager scan
  ```
  - [ ] 忽略该目录
  - [ ] 不报错

- [ ] **Test-07.3: 空目录**
  ```bash
  mkdir -p ~/.claude/skills/empty-dir

  skill-manager scan
  ```
  - [ ] 忽略空目录

---

## ➕ Add 命令测试

### Test-08: 基本添加

- [ ] **Test-08.1: 从 GitLab 添加 (全局)**
  ```bash
  # 使用真实或模拟的 GitLab URL
  skill-manager add https://gitlab.company.com/ai-skills/test-skill
  ```
  - [ ] 成功克隆仓库
  - [ ] 安装到 `~/.claude/skills/test-skill/`
  - [ ] 注册到全局
  - [ ] scope 为 `global`

- [ ] **Test-08.2: 指定平台**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-skill --platform cursor
  ```
  - [ ] 安装到 Cursor 平台
  - [ ] 路径为 `~/.cursor/skills/test-skill/`

- [ ] **Test-08.3: 指定分支**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-skill --branch develop
  ```
  - [ ] 克隆 develop 分支
  - [ ] 注册表中 branch 字段正确

- [ ] **Test-08.4: 自定义名称**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-skill my-custom-name
  ```
  - [ ] 使用自定义名称安装
  - [ ] 注册表中 name 为自定义名称

### Test-09: 子路径安装

- [ ] **Test-09.1: 从子目录安装**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/tree/main/skills/nested-skill
  ```
  - [ ] 正确解析子路径
  - [ ] 只安装子目录内容
  - [ ] skill 名称正确

### Test-10: 错误处理 (P0 增强)

- [ ] **Test-10.1: 仓库不存在**
  ```bash
  skill-manager add https://gitlab.company.com/nonexistent/repo
  ```
  - [ ] 显示友好的错误信息 (使用 CliError)
  - [ ] 包含解决方案建议
  - [ ] 不会部分安装
  - [ ] 注册表未修改
  - [ ] 使用正确的退出码

- [ ] **Test-10.2: 分支不存在**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-skill --branch nonexistent
  ```
  - [ ] 显示分支错误 (ValidationError)
  - [ ] 清理临时文件
  - [ ] 建议检查分支名称

- [ ] **Test-10.3: 重复安装**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-skill
  skill-manager add https://gitlab.company.com/ai-skills/test-skill
  ```
  - [ ] 第二次提示"已安装"
  - [ ] 不会覆盖已存在的 skill
  - [ ] 使用 FileSystemError

- [ ] **Test-10.4: URL 验证 (P0 新增)**
  ```bash
  skill-manager add not-a-valid-url
  skill-manager add ftp://invalid-protocol.com
  skill-manager add gitlab.com/skill (no https://)
  ```
  - [ ] 验证 URL 格式
  - [ ] 抛出 ValidationError
  - [ ] 提示正确的 URL 格式

- [ ] **Test-10.5: 网络错误 (P0 新增)**
  ```bash
  # 模拟网络断开
  skill-manager add https://gitlab.company.com/ai-skills/test-skill
  ```
  - [ ] 使用 NetworkError
  - [ ] 显示友好的网络错误信息
  - [ ] 建议检查网络连接
  - [ ] 不会留下临时文件

### Test-11: 元数据解析

- [ ] **Test-11.1: 完整的 SKILL.md**
  ```bash
  # 创建有完整 frontmatter 的 skill
  skill-manager add https://gitlab.company.com/ai-skills/complete-skill
  ```
  - [ ] 正确解析 name
  - [ ] 正确解析 description
  - [ ] 正确解析 author

- [ ] **Test-11.2: 缺少 SKILL.md**
  ```bash
  # 仓库中没有 SKILL.md
  skill-manager add https://gitlab.company.com/ai-skills/no-skill-md
  ```
  - [ ] 使用默认值
  - [ ] 警告用户

---

## ✅ Check 命令测试 (P1 增强)

### Test-12: 基本查看

- [ ] **Test-12.1: 查看所有已注册**
  ```bash
  skill-manager check
  skill-manager check --output default
  ```
  - [ ] 按平台分组显示
  - [ ] 显示简洁模式信息
  - [ ] 统计信息正确

- [ ] **Test-12.2: 详细模式**
  ```bash
  skill-manager check --verbose
  ```
  - [ ] 显示完整元数据
  - [ ] 显示安装路径
  - [ ] 显示时间戳
  - [ ] 显示文件状态 (✓/✗)

- [ ] **Test-12.3: 平台筛选**
  ```bash
  skill-manager check --platform claude-code
  ```
  - [ ] 只显示指定平台
  - [ ] 筛选功能正确

### Test-12.5: 输出格式 (P1 新增)

- [ ] **Test-12.5.1: 表格输出**
  ```bash
  skill-manager check --output table
  ```
  - [ ] 使用表格格式显示
  - [ ] 列对齐正确
  - [ ] 边框清晰
  - [ ] CI 环境自动降级

- [ ] **Test-12.5.2: JSON 输出**
  ```bash
  skill-manager check --output json
  skill-manager check --output json | jq
  ```
  - [ ] 输出有效 JSON
  - [ ] 包含所有 skill 信息
  - [ ] 可被 `jq` 解析
  - [ ] 适合脚本处理

- [ ] **Test-12.5.3: 列表输出**
  ```bash
  skill-manager check --output list
  ```
  - [ ] 使用列表格式显示
  - [ ] 每行一个 skill
  - [ ] 信息简洁

- [ ] **Test-12.5.4: 默认输出**
  ```bash
  skill-manager check --output default
  skill-manager check
  ```
  - [ ] 使用彩色默认输出
  - [ ] 格式清晰易读
  - [ ] 支持表情符号

### Test-13: 文件验证

- [ ] **Test-13.1: 文件存在**
  ```bash
  # 确保文件存在
  skill-manager check --verbose
  ```
  - [ ] 显示 ✓ (绿色)
  - [ ] 路径验证通过

- [ ] **Test-13.2: 文件缺失**
  ```bash
  # 手动删除 skill 文件
  rm -rf ~/.claude/skills/test-skill

  skill-manager check --verbose
  ```
  - [ ] 显示 ✗ (红色)
  - [ ] 显示"文件不存在"警告

- [ ] **Test-13.3: SKILL.md 缺失**
  ```bash
  # 删除 SKILL.md 但保留目录
  rm ~/.claude/skills/test-skill/SKILL.md

  skill-manager check --verbose
  ```
  - [ ] 显示 ✗ (红色)
  - [ ] 验证失败

### Test-14: 显示格式

- [ ] **Test-14.1: 简洁模式**
  ```bash
  skill-manager check
  ```
  - [ ] 单行显示每个 skill
  - [ ] 不显示详细信息

- [ ] **Test-14.2: 详细模式**
  ```bash
  skill-manager check --verbose
  ```
  - [ ] 多行显示每个 skill
  - [ ] 显示所有字段

---

## 🔄 Update 命令测试 (P1 增强)

### Test-15: 基本更新

- [ ] **Test-15.1: 更新单个 skill**
  ```bash
  # 先添加一个 skill
  skill-manager add https://gitlab.company.com/ai-skills/test-skill

  # 模拟远程更新 (修改远程仓库)
  # 然后本地更新
  skill-manager update test-skill
  ```
  - [ ] 执行 git pull
  - [ ] 更新时间戳
  - [ ] 显示"更新成功"

- [ ] **Test-15.2: 更新所有 skills**
  ```bash
  skill-manager update
  ```
  - [ ] 更新所有已注册的 skills
  - [ ] 显示进度条 (P1 新增)
  - [ ] 统计成功/失败数量
  - [ ] 使用并发处理 (P2 新增)
  - [ ] 性能提升约 5x (P2 新增)

- [ ] **Test-15.3: 更新指定平台**
  ```bash
  skill-manager update --platform claude-code
  ```
  - [ ] 只更新指定平台
  - [ ] 不影响其他平台

### Test-15.5: 进度条和并发 (P1/P2 新增)

- [ ] **Test-15.5.1: 单个进度条**
  ```bash
  # 在 TTY 环境
  skill-manager update test-skill
  ```
  - [ ] 显示实时进度
  - [ ] 显示百分比
  - [ ] 显示 ETA
  - [ ] 完成后清除

- [ ] **Test-15.5.2: 多个进度条**
  ```bash
  # 批量更新多个 skills
  skill-manager update
  ```
  - [ ] 每个 skill 有独立进度条
  - [ ] 多进度条同时更新
  - [ ] 使用 MultiProgress 类

- [ ] **Test-15.5.3: CI 环境进度**
  ```bash
  CI=true skill-manager update
  ```
  - [ ] 不显示进度条
  - [ ] 使用简单文本输出
  - [ ] 显示"正在更新 X/Y..."

- [ ] **Test-15.5.4: 并发限制**
  ```bash
  # 添加 10 个 skills
  skill-manager update
  ```
  - [ ] 使用 ConcurrentPool
  - [ ] 限制并发数 (默认 5)
  - [ ] 不会过载系统

- [ ] **Test-15.5.5: 批量处理**
  ```bash
  skill-manager update --batch-size 3
  ```
  - [ ] 每批处理 3 个
  - [ ] 显示批次进度
  - [ ] 批次间有间隔

### Test-16: 更新逻辑

- [ ] **Test-16.1: 非 Git 仓库**
  ```bash
  # 手动添加的 skill (非 Git)
  mkdir -p ~/.claude/skills/manual-skill
  # ... 创建 SKILL.md ...
  skill-manager scan --register

  skill-manager update manual-skill
  ```
  - [ ] 跳过非 Git 仓库
  - [ ] 显示警告信息

- [ ] **Test-16.2: 文件不存在**
  ```bash
  # 删除 skill 文件但注册表中有记录
  skill-manager update orphan-skill
  ```
  - [ ] 显示"文件不存在"
  - [ ] 不执行更新
  - [ ] 建议运行 remove

### Test-17: 错误处理

- [ ] **Test-17.1: 网络错误**
  ```bash
  # 模拟网络断开
  # skill-manager update test-skill
  ```
  - [ ] 显示网络错误
  - [ ] 不会破坏本地文件

- [ ] **Test-17.2: Git 冲突**
  ```bash
  # 模拟本地有未提交更改
  cd ~/.claude/skills/test-skill
  echo "change" >> test.txt
  cd -

  skill-manager update test-skill
  ```
  - [ ] 处理 Git 冲突
  - [ ] 显示错误信息
  - [ ] 建议手动解决

---

## 🗑️ Remove 命令测试

### Test-18: 基本删除

- [ ] **Test-18.1: 删除存在的 skill**
  ```bash
  skill-manager add https://gitlab.company.com/ai-skills/test-remove
  skill-manager remove test-remove
  ```
  - [ ] 删除文件系统中的 skill
  - [ ] 从注册表移除
  - [ ] 显示"删除成功"

- [ ] **Test-18.2: 删除指定平台**
  ```bash
  skill-manager remove test-remove --platform cursor
  ```
  - [ ] 只删除指定平台的 skill
  - [ ] 不影响其他平台

### Test-19: 错误处理

- [ ] **Test-19.1: 删除不存在的 skill**
  ```bash
  skill-manager remove nonexistent-skill
  ```
  - [ ] 显示"未找到"错误
  - [ ] 不会删除其他内容

- [ ] **Test-19.2: 文件已删除但注册表中有**
  ```bash
  # 手动删除文件
  rm -rf ~/.claude/skills/test-orphan

  # 通过 CLI 删除
  skill-manager remove test-orphan
  ```
  - [ ] 从注册表移除
  - [ ] 显示警告但继续执行

- [ ] **Test-19.3: 权限问题**
  ```bash
  # 创建只读目录
  mkdir -p ~/.claude/skills/readonly-skill
  chmod -w ~/.claude/skills/readonly-skill

  skill-manager remove readonly-skill
  ```
  - [ ] 显示权限错误
  - [ ] 尝试清理

### Test-20: 交互确认 (如果实现)

- [ ] **Test-20.1: 删除确认**
  ```bash
  skill-manager remove test-skill
  ```
  - [ ] 显示将要删除的信息
  - [ ] 显示 skill 名称、平台、描述
  - [ ] 请求用户确认 (如果实现)

---

## 🔍 Search 命令测试

### Test-21: 基本搜索

- [ ] **Test-21.1: 搜索关键词**
  ```bash
  skill-manager search "code helper"
  ```
  - [ ] 在默认仓库搜索
  - [ ] 返回匹配结果
  - [ ] 显示 skill 路径

- [ ] **Test-21.2: 指定仓库**
  ```bash
  skill-manager search "test" --repo https://gitlab.company.com/ai-skills
  ```
  - [ ] 在指定仓库搜索
  - [ ] 正确解析仓库 URL

### Test-22: 搜索结果

- [ ] **Test-22.1: 无结果**
  ```bash
  skill-manager search "nonexistent-keyword-xyz"
  ```
  - [ ] 显示"未找到"
  - [ ] 不报错

- [ ] **Test-22.2: 多个结果**
  ```bash
  skill-manager search "skill"
  ```
  - [ ] 列出所有匹配
  - [ ] 按顺序显示

- [ ] **Test-22.3: 安装提示**
  ```bash
  skill-manager search "code"
  ```
  - [ ] 显示安装命令示例
  - [ ] 格式: `skill-manager add <url>`

### Test-23: 搜索逻辑

- [ ] **Test-23.1: 大小写不敏感**
  ```bash
  skill-manager search "CodeHelper"
  skill-manager search "codehelper"
  skill-manager search "CODE_HELPER"
  ```
  - [ ] 结果相同

- [ ] **Test-23.2: 部分匹配**
  ```bash
  skill-manager search "code"
  ```
  - [ ] 匹配包含 "code" 的技能
  - [ ] 返回相关结果

---

## 🎯 作用域测试

### Test-24: Global vs Project

- [ ] **Test-24.1: Global skill 在所有项目可见**
  ```bash
  # 在项目 A
  cd ~/projects/project-a
  skill-manager check
  # 应该能看到 global skills

  # 在项目 B
  cd ~/projects/project-b
  skill-manager check
  # 应该能看到同样的 global skills
  ```

- [ ] **Test-24.2: Project skill 只在当前项目**
  ```bash
  # 在项目 A
  cd ~/projects/project-a
  skill-manager check
  # 应该能看到 project-a 的 skills

  # 在项目 B
  cd ~/projects/project-b
  skill-manager check
  # 不应该看到 project-a 的 skills
  ```

- [ ] **Test-24.3: 同名 skill**
  ```bash
  # 全局和项目有同名 skill
  # ~/.claude/skills/test-skill
  # project/.claude/skills/test-skill

  skill-manager scan
  ```
  - [ ] 两者都能发现
  - [ ] 通过 scope 和 projectPath 区分

### Test-25: 作用域优先级 (如果实现)

- [ ] **Test-25.1: Project 优先**
  ```bash
  # 如果同名 skill 同时存在于全局和项目
  # 应该优先使用项目级别
  ```

---

## 🌐 平台测试

### Test-26: 多平台支持

- [ ] **Test-26.1: 所有平台路径**
  ```bash
  # Claude Code
  skill-manager add test --platform claude-code
  # 验证: ~/.claude/skills/test/

  # Cursor
  skill-manager add test --platform cursor
  # 验证: ~/.cursor/skills/test/

  # Trae
  skill-manager add test --platform trae
  # 验证: ~/.trae/skills/test/

  # VS Code
  skill-manager add test --platform vscode
  # 验证: ~/.vscode/skills/test/

  # Windsurf
  skill-manager add test --platform windsurf
  # 验证: ~/.windsurf/skills/test/
  ```
  - [ ] 每个平台路径正确
  - [ ] 注册表 platform 字段正确

- [ ] **Test-26.2: 平台筛选**
  ```bash
  skill-manager check --platform claude-code
  skill-manager check --platform cursor
  skill-manager scan --platform claude-code
  ```
  - [ ] 筛选功能正确

---

## 🧪 边界和异常测试

### Test-27: 特殊字符

- [ ] **Test-27.1: Skill 名称特殊字符**
  ```bash
  skill-manager add https://.../skill-with-dash
  skill-manager add https://.../skill_with_underscore
  skill-manager add https://.../skill.with.dots
  ```
  - [ ] 正确处理各种字符

- [ ] **Test-27.2: 路径特殊字符**
  ```bash
  # GitLab URL 包含特殊字符
  skill-manager add "https://gitlab.com/group/skill name"
  ```
  - [ ] URL 正确解析
  - [ ] 错误处理正确

### Test-28: 大量数据

- [ ] **Test-28.1: 大量 skills**
  ```bash
  # 创建 100+ skills
  for i in {1..100}; do
    mkdir -p ~/.claude/skills/test-skill-$i
    echo "---" > ~/.claude/skills/test-skill-$i/SKILL.md
  done

  skill-manager scan
  skill-manager check
  ```
  - [ ] 扫描不超时
  - [ ] 显示不截断
  - [ ] 性能可接受

- [ ] **Test-28.2: 大文件 skill**
  ```bash
  # 创建大文件 SKILL.md
  dd if=/dev/zero of=~/.claude/skills/large-skill/SKILL.md bs=1M count=10

  skill-manager scan
  ```
  - [ ] 能处理大文件
  - [ ] 不崩溃

### Test-29: 并发操作

- [ ] **Test-29.1: 同时运行多个实例**
  ```bash
  skill-manager scan &
  skill-manager scan &
  skill-manager scan &
  wait
  ```
  - [ ] 注册表不损坏
  - [ ] 没有竞态条件

- [ ] **Test-29.2: 扫描时添加 skill**
  ```bash
  skill-manager scan &
  mkdir -p ~/.claude/skills/new-skill
  wait
  ```
  - [ ] 结果一致

---

## 📊 数据一致性测试

### Test-30: 注册表一致性

- [ ] **Test-30.1: 文件和注册表一致**
  ```bash
  # 注册表中有的 skill,文件也存在
  skill-manager check --verbose
  ```
  - [ ] 都显示 ✓
  - [ ] 数量一致

- [ ] **Test-30.2: 孤儿记录**
  ```bash
  # 手动删除文件
  rm -rf ~/.claude/skills/test-skill

  skill-manager check --verbose
  ```
  - [ ] 显示 ✗
  - [ ] 标记为"文件不存在"

- [ ] **Test-30.3: 孤儿文件**
  ```bash
  # 手动创建文件但未注册
  mkdir -p ~/.claude/skills/orphan-file
  echo "---" > ~/.claude/skills/orphan-file/SKILL.md

  skill-manager check
  skill-manager scan
  ```
  - [ ] check 不显示 (未注册)
  - [ ] scan 能发现

### Test-31: JSON 格式

- [ ] **Test-31.1: 注册表 JSON 格式**
  ```bash
  cat ~/.skill-manager/registry.json
  ```
  - [ ] JSON 格式正确
  - [ ] 可以被 `jq` 解析
  - [ ] 字段完整

- [ ] **Test-31.2: 损坏的注册表**
  ```bash
  echo "invalid json" > ~/.skill-manager/registry.json

  skill-manager check
  ```
  - [ ] 显示错误信息
  - [ ] 建议修复方法

---

## 🔐 权限测试

### Test-32: 文件系统权限

- [ ] **Test-32.1: 只读注册表**
  ```bash
  chmod 444 ~/.skill-manager/registry.json

  skill-manager scan --register
  ```
  - [ ] 显示权限错误
  - [ ] 不会破坏文件

- [ ] **Test-32.2: 只读 skill 目录**
  ```bash
  chmod -R 444 ~/.claude/skills/test-skill

  skill-manager update test-skill
  skill-manager remove test-skill
  ```
  - [ ] 显示权限错误
  - [ ] 提示解决方法

- [ ] **Test-32.3: 无写入权限**
  ```bash
  # 在只读文件系统中
  # ... 测试错误处理
  ```

---

## 🌍 网络测试

### Test-33: GitLab 连接

- [ ] **Test-33.1: 私有仓库**
  ```bash
  skill-manager add https://gitlab.company.com/private/skill
  ```
  - [ ] 需要认证时提示
  - [ ] 支持认证 token (如果实现)

- [ ] **Test-33.2: 大仓库**
  ```bash
  skill-manager add https://gitlab.company.com/large-skill-repo
  ```
  - [ ] 克隆不超时
  - [ ] 进度显示

- [ ] **Test-33.3: 网络中断**
  ```bash
  # 模拟网络中断
  # skill-manager add https://...
  ```
  - [ ] 超时处理
  - [ ] 清理临时文件
  - [ ] 错误提示

---

## 💾 备份和恢复测试

### Test-34: 数据备份

- [ ] **Test-34.1: 备份注册表**
  ```bash
  cp ~/.skill-manager/registry.json backup.json

  # 清空
  echo '{"skills":[]}' > ~/.skill-manager/registry.json

  # 恢复
  cp backup.json ~/.skill-manager/registry.json

  skill-manager check
  ```
  - [ ] 恢复后数据完整

- [ ] **Test-34.2: 备份文件**
  ```bash
  cp -r ~/.claude/skills backup-skills

  # 清空
  rm -rf ~/.claude/skills/*

  # 恢复
  cp -r backup-skills/* ~/.claude/skills/

  skill-manager check
  ```
  - [ ] 文件完整

---

## 📈 性能测试

### Test-35: 性能基准

- [ ] **Test-35.1: 扫描性能**
  ```bash
  time skill-manager scan
  ```
  - [ ] 100 个 skills < 5秒
  - [ ] 内存使用合理

- [ ] **Test-35.2: 检查性能**
  ```bash
  time skill-manager check
  ```
  - [ ] 大量 skills < 2秒
  - [ ] 输出流畅

- [ ] **Test-35.3: 更新性能**
  ```bash
  time skill-manager update
  ```
  - [ ] 批量更新合理时间
  - [ ] 并发更新 (如果实现)

---

## 🔄 集成测试

### Test-36: 完整工作流

- [ ] **Test-36.1: 新用户首次使用**
  ```bash
  # 1. 安装
  pnpm install -g .

  # 2. 扫描现有 skills
  skill-manager scan

  # 3. 注册
  skill-manager scan --register

  # 4. 查看已注册
  skill-manager check

  # 5. 添加新 skill
  skill-manager add https://...

  # 6. 更新
  skill-manager update

  # 7. 删除测试
  skill-manager remove test
  ```
  - [ ] 整个流程顺畅
  - [ ] 没有错误

- [ ] **Test-36.2: 项目切换工作流**
  ```bash
  # 项目 A
  cd ~/projects/project-a
  skill-manager scan --scope project
  skill-manager scan --register

  # 项目 B
  cd ~/projects/project-b
  skill-manager scan --scope project
  skill-manager scan --register
  ```
  - [ ] 正确识别不同项目
  - [ ] 项目 skills 不混淆

### Test-37: 升级兼容性

- [ ] **Test-37.1: 旧版注册表**
  ```bash
  # 使用旧格式 (没有 scope 字段)
  echo '{"skills":[{"name":"old-skill","platform":"claude-code","version":"1.0.0"}]}' > ~/.skill-manager/registry.json

  skill-manager check
  ```
  - [ ] 兼容旧格式
  - [ ] 自动添加默认 scope

- [ ] **Test-37.2: 数据迁移**
  ```bash
  # 运行升级脚本 (如果有)
  # 验证数据完整
  ```

---

## 🐛 已知问题测试

### Test-38: 边界情况

- [ ] **Test-38.1: 超长路径**
  ```bash
  # 创建很长的路径
  mkdir -p ~/.claude/skills/$(printf 'a%.0s' {1..100})
  ```
  - [ ] 处理路径长度限制

- [ ] **Test-38.2: Unicode 字符**
  ```bash
  # 使用 Unicode 名称
  skill-manager add https://.../测试技能
  ```
  - [ ] 正确显示中文
  - [ ] 文件系统支持

- [ ] **Test-38.3: 符号链接**
  ```bash
  # 创建符号链接
  ln -s ~/.claude/skills/test-skill ~/.claude/skills/test-link

  skill-manager scan
  ```
  - [ ] 正确处理或跳过

---

## ✅ 最终验收测试

### Test-99: 完整场景测试

- [ ] **Test-99.1: 真实场景 1 - 新项目设置**
  ```bash
  # 1. 创建新项目
  mkdir -p ~/projects/new-project
  cd ~/projects/new-project
  npm init -y

  # 2. 添加项目特定 skills
  mkdir -p .claude/skills/project-config
  # ... 创建 SKILL.md ...

  # 3. 扫描并注册
  skill-manager scan --register

  # 4. 验证
  skill-manager check
  ```
  - [ ] 项目被正确识别
  - [ ] Project skills 被发现
  - [ ] 注册成功

- [ ] **Test-99.2: 真实场景 2 - 团队协作**
  ```bash
  # 1. 团队成员 A 添加 skills
  # 2. 提交到 GitLab

  # 3. 团队成员 B
  skill-manager add https://gitlab.company.com/team-skills/shared-skill

  # 4. 验证共享
  skill-manager check
  ```
  - [ ] 每个人都能安装
  - [ ] 更新同步

- [ ] **Test-99.3: 真实场景 3 - 定期维护**
  ```bash
  # 1. 定期更新所有 skills
  skill-manager update

  # 2. 检查状态
  skill-manager check --verbose

  # 3. 清理孤儿
  # (发现孤儿后)
  skill-manager remove orphan-skill

  # 4. 扫描新添加
  skill-manager scan --register
  ```
  - [ ] 维护流程顺畅

- [ ] **Test-99.4: 真实场景 4 - 项目迁移**
  ```bash
  # 1. 导出当前注册表
  cat ~/.skill-manager/registry.json > backup.json

  # 2. 在新机器上
  skill-manager scan --register

  # 3. 验证一致
  skill-manager check
  ```
  - [ ] 数据完整迁移

---

## 📝 测试记录模板

### 测试执行记录

| 测试ID | 测试项 | 状态 | 备注 |
|--------|--------|------|------|
| Test-01.1 | 主帮助 | ⬜ 未测 | |
| Test-02.1 | 扫描空环境 | ⬜ 未测 | |
| ... | ... | ... | ... |

**状态说明**:
- ✅ 通过
- ❌ 失败
- ⚠️ 部分通过
- ⬜ 未测试
- 🔇 跳过

### Bug 记录

| BugID | 测试ID | 问题描述 | 严重程度 | 状态 |
|-------|--------|----------|----------|------|
| Bug-01 | Test-02.1 | 扫描未正确处理空目录 | 中 | 🔄 修复中 |
| ... | ... | ... | ... | ... |

---

## 🚀 版本检查测试 (P1 新增)

### Test-40: 启动版本检查

- [ ] **Test-40.1: 正常启动**
  ```bash
  skill-manager scan
  ```
  - [ ] 启动时检查更新 (非阻塞)
  - [ ] 5 秒超时保护
  - [ ] 有新版本时提示
  - [ ] 不影响命令执行

- [ ] **Test-40.2: 已是最新版本**
  ```bash
  # 模拟已是最新版本
  skill-manager check
  ```
  - [ ] 不显示更新提示
  - [ ] 不输出多余信息

- [ ] **Test-40.3: 有新版本可用**
  ```bash
  # 模拟有新版本
  skill-manager update
  ```
  - [ ] 显示更新提示
  - [ ] 显示当前版本
  - [ ] 显示最新版本
  - [ ] 提示更新命令

- [ ] **Test-40.4: 网络错误**
  ```bash
  # 模拟网络不可用
  skill-manager scan
  ```
  - [ ] 超时后跳过检查
  - [ ] 不影响命令执行
  - [ ] 不显示错误

- [ ] **Test-40.5: Node.js 版本检查**
  ```bash
  # 测试最低版本要求
  ```
  - [ ] 检查 Node.js 版本
  - [ ] 版本过低时警告
  - [ ] 显示最低版本要求

---

## ⚙️ 配置文件测试 (P2 新增)

### Test-41: 配置文件加载

- [ ] **Test-41.1: 配置文件优先级**
  ```bash
  # 创建各种配置文件
  echo '{"registry":{"checkUpdates":false}}' > ~/.skill-managerrc
  echo '{"registry":{"checkUpdates":true}}' > .skill-manager.rc
  echo 'registry.checkUpdates=false' > .skill-manager.json

  skill-manager check
  ```
  - [ ] 正确的优先级顺序
  - [ ] 项目配置 > 全局配置 > 默认配置

- [ ] **Test-41.2: 支持的配置文件格式**
  ```bash
  # 测试各种格式
  echo '{"checkUpdates":false}' > .skill-manager.json
  echo 'checkUpdates: false' > .skill-manager.yml
  echo 'export default { checkUpdates: false }' > .skill-manager.config.js
  ```
  - [ ] 支持 .skill-managerrc
  - [ ] 支持 .skill-manager.json
  - [ ] 支持 .skill-manager.yml
  - [ ] 支持 .skill-manager.yaml
  - [ ] 支持 .skill-manager.config.js

- [ ] **Test-41.3: 环境变量配置**
  ```bash
  SKILL_MANAGER_CHECK_UPDATES=false skill-manager scan
  SKILL_MANAGER_VERBOSE=1 skill-manager check
  ```
  - [ ] 环境变量优先级最高
  - [ ] 格式: SKILL_MANAGER_<KEY>
  - [ ] 正确解析类型

- [ ] **Test-41.4: 配置验证**
  ```bash
  # 创建无效配置
  echo '{"invalid":true}' > .skill-manager.json
  skill-manager check
  ```
  - [ ] 使用 Zod 验证
  - [ ] 显示验证错误
  - [ ] 回退到默认配置

- [ ] **Test-41.5: 配置查看**
  ```bash
  skill-manager config show
  skill-manager config get registry.checkUpdates
  ```
  - [ ] 显示当前配置
  - [ ] 显示配置来源
  - [ ] 获取单个配置项

- [ ] **Test-41.6: 配置设置**
  ```bash
  skill-manager config set registry.checkUpdates false
  skill-manager config set verbose true
  ```
  - [ ] 设置配置值
  - [ ] 保存到全局配置
  - [ ] 验证配置生效

---

## 🐚 Shell 补全测试 (P2 新增)

### Test-42: 补全功能

- [ ] **Test-42.1: Bash 补全**
  ```bash
  # 安装补全
  skill-manager completion bash > ~/.local/share/bash-completion/completions/skill-manager
  source ~/.bashrc

  # 测试补全
  skill-manager <Tab>
  skill-manager s<Tab>
  skill-manager check --<Tab>
  ```
  - [ ] 命令补全
  - [ ] 选项补全
  - [ ] 平台名称补全
  - [ ] skill 名称补全

- [ ] **Test-42.2: Zsh 补全**
  ```bash
  # 安装补全
  skill-manager completion zsh > ~/.zfunc/_skill-manager
  # 添加到 fpath
  compinit

  # 测试补全
  skill-manager <Tab>
  ```
  - [ ] 命令补全
  - [ ] 选项补全
  - [ ] 描述信息

- [ ] **Test-42.3: Fish 补全**
  ```bash
  # 安装补全
  skill-manager completion fish > ~/.config/fish/completions/skill-manager.fish

  # 测试补全
  skill-manager <Tab>
  ```
  - [ ] 命令补全
  - [ ] 选项补全
  - [ ] 自动加载

- [ ] **Test-42.4: 补全安装说明**
  ```bash
  skill-manager completion --help
  ```
  - [ ] 显示各 shell 安装说明
  - [ ] 提供完整的安装命令
  - [ ] 包含配置步骤

---

## 📝 格式化工具测试 (P1 新增)

### Test-43: 表格和列表格式化

- [ ] **Test-43.1: 表格格式化**
  ```bash
  skill-manager check --output table
  ```
  - [ ] 列对齐正确
  - [ ] 自动列宽
  - [ ] 边框字符正确
  - [ ] 支持多行文本
  - [ ] CI 环境降级

- [ ] **Test-43.2: JSON 格式化**
  ```bash
  skill-manager check --output json | jq
  ```
  - [ ] JSON 格式有效
  - [ ] 缩进正确 (2 空格)
  - [ ] 包含所有字段
  - [ ] 可被 jq 解析

- [ ] **Test-43.3: 列表格式化**
  ```bash
  skill-manager check --output list
  skill-manager scan --output list
  ```
  - [ ] 每行一项
  - [ ] 对齐整齐
  - [ ] 使用符号标记

- [ ] **Test-43.4: 技能列表格式化**
  ```bash
  # formatSkillsList 测试
  ```
  - [ ] 显示技能名称
  - [ ] 显示描述
  - [ ] 显示平台
  - [ ] 显示作用域
  - [ ] 颜色编码

- [ ] **Test-43.5: CI 环境降级**
  ```bash
  CI=true skill-manager check --output table
  CI=true skill-manager check --output list
  ```
  - [ ] 不使用复杂表格
  - [ ] 使用简单文本格式
  - [ ] 信息仍然完整

---

## 🔄 并发处理测试 (P2 新增)

### Test-44: 并发功能

- [ ] **Test-44.1: 基本并发**
  ```bash
  # 添加 10 个 skills
  skill-manager update
  ```
  - [ ] 使用 processConcurrently
  - [ ] 限制并发数 (默认 5)
  - [ ] 正确处理结果

- [ ] **Test-44.2: 自定义并发数**
  ```bash
  CONCURRENT_LIMIT=3 skill-manager update
  skill-manager update --concurrency 3
  ```
  - [ ] 使用自定义并发数
  - [ ] 性能合理提升

- [ ] **Test-44.3: 批量处理**
  ```bash
  skill-manager update --batch-size 5
  ```
  - [ ] 使用 processBatchConcurrently
  - [ ] 每批指定数量
  - [ ] 显示批次进度

- [ ] **Test-44.4: 错误收集**
  ```bash
  # 模拟部分失败
  skill-manager update
  ```
  - [ ] 使用 processConcurrentlyWithErrors
  - [ ] 收集所有错误
  - [ ] 显示成功和失败统计
  - [ ] 不会因单个失败中断

- [ ] **Test-44.5: ConcurrentPool**
  ```bash
  # 测试连接池
  skill-manager update
  ```
  - [ ] 使用 ConcurrentPool 类
  - [ ] 资源复用
  - [ ] 自动清理

- [ ] **Test-44.6: 性能测试**
  ```bash
  time skill-manager update
  # 对比串行和并发
  ```
  - [ ] 并发 > 5x 性能提升
  - [ ] 内存使用合理
  - [ ] CPU 使用合理

---

## 🎯 测试优先级 (已更新)

### P0 - 核心功能 (必须通过)

**基础功能**
- Test-01: 帮助和版本命令
- Test-01.5: 环境兼容性 (NO_COLOR, CI, TTY, 信号处理, 退出码)

**Scan 命令**
- Test-02: Scan 基本扫描
- Test-06: 注册功能

**Add 命令**
- Test-08: Add 基本添加
- Test-10: 错误处理 (增强的错误类型)

**Check 命令**
- Test-12: Check 基本查看

**Update 命令**
- Test-15: Update 基本更新
- Test-15.5: 进度条和并发

**Remove 命令**
- Test-18: Remove 基本删除

### P1 - 重要功能 (强烈建议)

**Check 增强**
- Test-12.5: 输出格式 (table, json, list)

**Update 增强**
- Test-15.5: 进度条和并发

**格式化工具**
- Test-43: 表格和列表格式化

**版本检查**
- Test-40: 启动版本检查

**其他**
- Test-03: 项目扫描
- Test-04: 混合扫描
- Test-13: 文件验证
- Test-24: 作用域测试
- Test-26: 多平台支持

### P2 - 高级功能 (建议测试)

**配置文件**
- Test-41: 配置文件加载 (10 种格式, 环境变量, 验证)

**Shell 补全**
- Test-42: Bash/Zsh/Fish 补全

**并发处理**
- Test-44: 并发功能 (批量处理, 错误收集, 性能)

**其他**
- Test-07: 边界情况
- Test-10: Add 错误处理
- Test-17: Update 错误
- Test-19: Remove 错误
- Test-38: 已知问题

### P3 - 高级场景 (有时间测试)

- Test-21: Search 命令
- Test-25: 作用域优先级
- Test-27: 特殊字符
- Test-28: 大量数据
- Test-29: 并发操作
- Test-30: 注册表一致性
- Test-31: JSON 格式
- Test-32: 权限测试
- Test-33: 网络测试
- Test-34: 备份和恢复
- Test-35: 性能测试
- Test-36: 集成测试
- Test-37: 升级兼容性
- Test-99: 完整场景测试

---

## 📋 测试统计 (已更新)

### 测试覆盖范围

| 类别 | 测试组 | 测试项数 | 说明 |
|------|--------|----------|------|
| 基础命令 | Test-01, Test-01.5 | 10 + 6 = 16 | 帮助、版本、环境兼容 |
| Scan | Test-02 ~ Test-07 | 6 组 | 扫描、注册、边界 |
| Add | Test-08 ~ Test-11 | 4 组 | 添加、子路径、错误 |
| Check | Test-12 ~ Test-14 | 3 组 | 查看、文件验证、格式 |
| Update | Test-15 ~ Test-17 | 3 组 | 更新、进度、并发 |
| Remove | Test-18 ~ Test-20 | 3 组 | 删除、错误、交互 |
| Search | Test-21 ~ Test-23 | 3 组 | 搜索、结果、逻辑 |
| 作用域 | Test-24 ~ Test-25 | 2 组 | Global vs Project |
| 平台 | Test-26 | 1 组 | 多平台支持 |
| 边界 | Test-27 ~ Test-29 | 3 组 | 特殊字符、大数据、并发 |
| 数据 | Test-30 ~ Test-31 | 2 组 | 一致性、JSON 格式 |
| 权限 | Test-32 | 1 组 | 文件系统权限 |
| 网络 | Test-33 | 1 组 | GitLab 连接 |
| 备份 | Test-34 | 1 组 | 备份和恢复 |
| 性能 | Test-35 | 1 组 | 性能基准 |
| 集成 | Test-36 ~ Test-37 | 2 组 | 完整工作流、兼容性 |
| 已知问题 | Test-38 | 1 组 | 边界情况 |
| 场景 | Test-99 | 1 组 | 真实场景 |
| **P0 新增** | Test-01.5, Test-10.5 | - | **环境兼容性** |
| **P1 新增** | Test-12.5, Test-15.5, Test-40, Test-43 | - | **格式化、进度、版本检查** |
| **P2 新增** | Test-41, Test-42, Test-44 | - | **配置、补全、并发** |

**总计**: 44 个测试组，200+ 个测试用例

### 测试验收标准 (已更新)

#### P0 验收 (必须 100% 通过)

- ✅ 所有命令支持 NO_COLOR
- ✅ 所有命令支持 TTY 降级
- ✅ 所有命令支持 --verbose
- ✅ 所有命令支持 --dry-run
- ✅ 错误处理一致性 > 95%
- ✅ 使用正确的退出码 (遵循 sysexits.h)
- ✅ 信号处理正确 (SIGINT, SIGTERM)
- ✅ 代码重复率 < 5%
- ✅ 所有测试通过

#### P1 验收 (强烈建议)

- ✅ 支持 --output table
- ✅ 支持 --output json
- ✅ 支持 --output list
- ✅ 批量操作显示进度条
- ✅ 启动时检查更新 (非阻塞)
- ✅ CI 环境输出正常
- ✅ 表格格式化正确

#### P2 验收 (建议完成)

- ✅ 支持配置文件 (10 种格式)
- ✅ 批量更新速度提升 5x
- ✅ Shell 补全可用 (Bash/Zsh/Fish)
- ✅ 配置优先级正确
- ✅ 并发处理正确

---

## 🚀 开始测试

### 快速开始 (P0 核心测试)

```bash
# 1. 环境准备
cd /Users/arwen/Desktop/Arwen/evanfang/cc-system-creator-scripts/clis/skill-manager
pnpm run build
pnpm install -g .

# 2. 运行 P0 测试
# Test-01: 帮助命令
skill-manager --help
skill-manager --version

# Test-01.5: 环境兼容性
NO_COLOR=1 skill-manager scan              # NO_COLOR 支持
CI=true skill-manager check                 # CI 环境检测
skill-manager --verbose scan                 # VERBOSE 模式
DEBUG=1 skill-manager update                 # DEBUG 模式

# Test-02: 扫描
skill-manager scan
skill-manager scan --scope global
skill-manager scan --scope project

# Test-06: 注册
skill-manager scan --register

# Test-12: 查看
skill-manager check
skill-manager check --verbose

# Test-12.5: 输出格式 (P1)
skill-manager check --output table
skill-manager check --output json
skill-manager check --output list

# Test-08: 添加 (需要真实 GitLab)
# skill-manager add https://...

# Test-10: 错误处理
skill-manager add invalid-url                # URL 验证
echo $?                                      # 检查退出码

# Test-15: 更新
# skill-manager update
# skill-manager update test-skill

# Test-15.5: 进度条和并发 (P1/P2)
# skill-manager update                       # 查看进度条
# skill-manager update --concurrency 3      # 自定义并发

# Test-18: 删除
# skill-manager remove test-skill

# Test-40: 版本检查 (P1)
skill-manager scan                          # 观察启动时的更新检查

# Test-41: 配置文件 (P2)
skill-manager config show                    # 查看配置
skill-manager config get registry.checkUpdates

# Test-42: Shell 补全 (P2)
skill-manager completion bash                # 生成 Bash 补全
skill-manager completion zsh                 # 生成 Zsh 补全
skill-manager completion fish                # 生成 Fish 补全
```

### P1 测试 (功能增强)

```bash
# 输出格式
skill-manager check --output table
skill-manager check --output json | jq
skill-manager check --output list

# 进度条和并发
skill-manager update                         # 查看进度条
CONCURRENT_LIMIT=3 skill-manager update      # 自定义并发

# 版本检查
skill-manager scan                           # 观察更新检查
```

### P2 测试 (高级功能)

```bash
# 配置文件
echo '{"verbose":true}' > .skill-manager.json
skill-manager check

# Shell 补全
skill-manager completion bash > ~/.local/share/bash-completion/completions/skill-manager
source ~/.bashrc
skill-manager <Tab>                          # 测试补全

# 并发性能
time skill-manager update                    # 性能测试
```

---

## 📊 测试报告模板

### 测试总结

```
测试日期: YYYY-MM-DD
测试人员: [姓名]
测试环境:
  - OS: [操作系统]
  - Node.js: [版本]
  - skill-manager: [版本]

总体结果: ✅ 通过 / ❌ 失败 / ⚠️ 部分通过

统计数据:
- 总测试数: 200+
- 通过: XXX (XX%)
- 失败: XXX (XX%)
- 跳过: XXX (XX%)

分阶段结果:
- P0 测试: ✅ 全部通过 (必选)
- P1 测试: ✅ 全部通过 / ⚠️ 部分通过 (强烈建议)
- P2 测试: ✅ 全部通过 / ⚠️ 部分通过 / ⬜ 未测试 (建议)
- P3 测试: ⬜ 未测试 (可选)

功能测试结果:
- ✅ 基础命令 (Test-01, Test-01.5): 通过率 XX%
- ✅ Scan 命令 (Test-02 ~ 07): 通过率 XX%
- ✅ Add 命令 (Test-08 ~ 11): 通过率 XX%
- ✅ Check 命令 (Test-12 ~ 14): 通过率 XX%
- ✅ Update 命令 (Test-15 ~ 17): 通过率 XX%
- ✅ Remove 命令 (Test-18 ~ 20): 通过率 XX%
- ✅ 版本检查 (Test-40): 通过率 XX%
- ✅ 配置文件 (Test-41): 通过率 XX%
- ✅ Shell 补全 (Test-42): 通过率 XX%
- ✅ 格式化工具 (Test-43): 通过率 XX%
- ✅ 并发处理 (Test-44): 通过率 XX%

主要问题:
1. [问题描述]
   - 严重程度: 高/中/低
   - 影响范围: [功能模块]
   - 复现步骤: [步骤]
   - 预期行为: [描述]
   - 实际行为: [描述]

2. [问题描述]
   - ...

建议改进:
1. [改进建议]
   - 优先级: P0/P1/P2/P3
   - 改进内容: [描述]
   - 预期效果: [描述]

2. [改进建议]
   - ...

性能测试结果:
- 扫描 100 个 skills: XXX 秒 (目标: < 5 秒)
- 检查大量 skills: XXX 秒 (目标: < 2 秒)
- 批量更新 (并发): XXX 秒 (目标: 比串行快 5x)
- 内存使用: XXX MB
- CPU 使用: XX%

兼容性测试:
- ✅ NO_COLOR 支持: 通过/失败
- ✅ CI 环境兼容: 通过/失败
- ✅ TTY 降级: 通过/失败
- ✅ 信号处理: 通过/失败
- ✅ 退出码正确: 通过/失败

结论:
[总体评价和结论]

后续计划:
1. [后续工作计划]
2. [...]
```

### 测试检查清单

**P0 核心功能 (必须通过)**
- [ ] Test-01: 帮助和版本
- [ ] Test-01.5: 环境兼容性 (NO_COLOR, CI, TTY, 信号, 退出码)
- [ ] Test-02 ~ 07: Scan 命令
- [ ] Test-08 ~ 11: Add 命令
- [ ] Test-12 ~ 14: Check 命令
- [ ] Test-15 ~ 17: Update 命令
- [ ] Test-18 ~ 20: Remove 命令

**P1 功能增强 (强烈建议)**
- [ ] Test-12.5: 输出格式 (table, json, list)
- [ ] Test-15.5: 进度条和并发
- [ ] Test-40: 版本检查
- [ ] Test-43: 格式化工具

**P2 高级功能 (建议)**
- [ ] Test-41: 配置文件
- [ ] Test-42: Shell 补全
- [ ] Test-44: 并发处理

**P3 高级场景 (可选)**
- [ ] Test-21 ~ 23: Search 命令
- [ ] Test-24 ~ 26: 作用域和平台
- [ ] Test-27 ~ 38: 边界和异常
- [ ] Test-99: 完整场景

---

**测试完成后,请提交测试报告和 Bug 记录!** 🎯
