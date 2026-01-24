# 实施计划：[功能名称]

**分支**：`[###-feature-name]` | **日期**：[DATE] | **规格**：[link]
**输入**：来自 `/specs/[###-feature-name]/spec.md` 的功能规格说明

**注意**：此模板由 `/speckit.plan` 命令填充。执行工作流程请参考 `.specify/templates/commands/plan.md`。

## 摘要

[从功能规格说明中提取：主要需求 + 研究中的技术方法]

## 技术背景

<!--
  需要操作：将此部分的内容替换为项目的技术细节。
  此处的结构仅供参考，用于指导迭代过程。
-->

**语言/版本**：[例如：Python 3.11、Swift 5.9、Rust 1.75 或需要澄清]
**主要依赖**：[例如：FastAPI、UIKit、LLVM 或需要澄清]
**存储**：[如适用，例如：PostgreSQL、CoreData、文件或不适用]
**测试**：[例如：pytest、XCTest、cargo test 或需要澄清]
**目标平台**：[例如：Linux 服务器、iOS 15+、WASM 或需要澄清]
**项目类型**：[single/web/mobile - 决定源代码结构]
**性能目标**：[特定领域，例如：1000 req/s、10k lines/sec、60 fps 或需要澄清]
**约束条件**：[特定领域，例如：<200ms p95、<100MB 内存、支持离线或需要澄清]
**规模/范围**：[特定领域，例如：10k 用户、1M LOC、50 个屏幕或需要澄清]

## 宪法检查

*关卡：必须在阶段 0 研究前通过。在阶段 1 设计后重新检查。*

[基于宪法文件确定的关卡]

## 项目结构

### 文档（此功能）

```text
specs/[###-feature]/
├── plan.md              # 此文件（/speckit.plan 命令输出）
├── research.md          # 阶段 0 输出（/speckit.plan 命令）
├── data-model.md        # 阶段 1 输出（/speckit.plan 命令）
├── quickstart.md        # 阶段 1 输出（/speckit.plan 命令）
├── contracts/           # 阶段 1 输出（/speckit.plan 命令）
└── tasks.md             # 阶段 2 输出（/speckit.tasks 命令 - 非 /speckit.plan 创建）
```

### 源代码（仓库根目录）
<!--
  需要操作：将下面的占位符树替换为此功能的具体布局。
  删除未使用的选项，并使用真实路径（例如：apps/admin、packages/something）扩展所选结构。
  交付的计划不得包含选项标签。
-->

```text
# [如果未使用则删除] 选项 1：单一项目（默认）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [如果未使用则删除] 选项 2：Web 应用程序（检测到 "frontend" + "backend" 时）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [如果未使用则删除] 选项 3：移动端 + API（检测到 "iOS/Android" 时）
api/
└── [同上 backend]

ios/ 或 android/
└── [平台特定结构：功能模块、UI 流程、平台测试]
```

**结构决策**：[记录所选结构并引用上面捕获的真实目录]

## 复杂度跟踪

> **仅在宪法检查有必须证明的违规时填写**

| 违规 | 需要原因 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| [例如：第 4 个项目] | [当前需求] | [为什么 3 个项目不够] |
| [例如：Repository 模式] | [具体问题] | [为什么直接数据库访问不够] |
