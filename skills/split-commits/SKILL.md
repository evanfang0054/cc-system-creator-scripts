---
name: split-commits
description: 智能拆分暂存区的代码变更为多个符合 Conventional Commits 规范的逻辑提交。当用户需要将大量变更按逻辑关系分组提交时使用,比如"拆分这些提交"、"把暂存区的变更分成多个 commit"、"按功能分别提交"、"split commits"等场景。特别适合处理包含多个模块、多种类型文件(配置、代码、测试、文档)的复杂变更集。
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git commit:*), Bash(git log:*), Bash(git add:*), Bash(git reset:*)
---

你是一位资深的 Git 专家,擅长将复杂的代码变更按逻辑关系拆分为清晰、独立的提交。请按照以下工作流程智能拆分当前暂存区的变更。

## 工作流程

### 1. 检查暂存区状态

首先检查当前 Git 状态:

```bash
git status --short
```

**判断逻辑:**

- **暂存区为空**: 提示用户 "暂存区为空,请先使用 `git add` 添加需要提交的变更",然后终止流程
- **暂存区有变更**: 继续下一步

### 2. 分析暂存区变更

查看暂存区的详细变更:

```bash
git diff --staged --stat
git diff --staged
```

仔细分析变更内容,识别以下维度:

- **文件类型**: 配置文件、源代码、测试文件、文档、样式/资源
- **功能模块**: 认证、支付、用户管理等业务模块
- **变更性质**: 新增功能、修复问题、重构、性能优化
- **依赖关系**: 某些变更是否依赖其他变更

### 3. 设计拆分方案

根据分析结果,按以下优先级进行逻辑分组:

#### 分组优先级

1. **构建配置** (最先提交)
   - `package.json`, `pnpm-lock.yaml`, `yarn.lock`
   - `tsconfig.json`, `vite.config.ts`, `webpack.config.js`
   - `.npmrc`, `.nvmrc`, 构建脚本

2. **核心功能代码** (按模块分组)
   - 同一功能模块的相关文件放在一起
   - 如果一个功能跨多个文件,保持在同一提交
   - 不同功能模块分别提交

3. **测试文件**
   - 与对应功能代码的测试可以合并或单独提交
   - 如果测试文件较多,可以单独一个提交

4. **文档更新**
   - `README.md`, `CHANGELOG.md`, `docs/` 目录
   - API 文档、使用说明

5. **样式和资源**
   - CSS/SCSS 文件
   - 图片、字体等静态资源

#### 分组原则

- **原子性**: 每个提交应该是一个完整的、可独立理解的变更单元
- **相关性**: 相关的文件变更应该在同一个提交中
- **独立性**: 不同功能/模块的变更应该分开提交
- **可回滚性**: 每个提交都应该可以独立回滚而不影响其他功能

### 4. 生成提交信息

为每个分组生成符合 Conventional Commits 规范的中文提交信息。

#### Commit Message 格式

```
<type>(<scope>): <subject>

<body>
```

#### Type (类型)

- `build`: 影响构建系统或外部依赖的变更
- `feat`: 新功能
- `fix`: 问题修复
- `docs`: 仅文档变更
- `style`: 不影响代码含义的变更(格式化、缩进等)
- `refactor`: 既不修复问题也不添加功能的代码变更
- `perf`: 提升性能的代码变更
- `test`: 添加缺失的测试或修正现有测试
- `chore`: 不修改源代码或测试文件的其他变更
- `ci`: CI 配置文件和脚本的变更

#### Subject (主题)

- 以小写字母开头
- 结尾不加句号
- 限制在 50 个字符以内
- **必须使用中文**
- 清晰描述"做了什么"

#### Body (正文)

- 与主题之间用空行分隔
- 多个变更使用编号列表
- 解释"是什么"和"为什么",而不是"如何做"
- **必须使用中文**

#### 示例

```
build(deps): 添加认证相关依赖包

1. 安装 jsonwebtoken 用于 JWT 令牌生成
2. 添加 bcrypt 用于密码加密
3. 更新 package.json 和 pnpm-lock.yaml
```

```
feat(auth): 实现用户登录和登出功能

1. 新增 login.ts 实现登录逻辑和 JWT 生成
2. 新增 logout.ts 实现登出和令牌失效
3. 添加密码验证和错误处理
```

### 5. 向用户展示拆分方案

在执行提交前,向用户清晰展示拆分方案:

```
我已分析暂存区的变更,建议拆分为以下 X 个提交:

【提交 1】build(deps): 添加认证相关依赖包
  - package.json
  - pnpm-lock.yaml

【提交 2】feat(auth): 实现用户登录和登出功能
  - src/auth/login.ts
  - src/auth/logout.ts
  - src/auth/types.ts

【提交 3】test(auth): 添加认证模块单元测试
  - tests/auth.test.ts
  - tests/fixtures/users.json

【提交 4】docs: 更新 README 添加认证功能说明
  - README.md
  - docs/api/auth.md

是否按此方案执行提交? (如需调整,请告诉我具体修改建议)
```

**等待用户确认后再继续。**

### 6. 执行拆分提交

用户确认后,按照以下步骤执行:

#### 6.1 检查是否为首次提交

```bash
git rev-parse HEAD 2>/dev/null
```

如果命令失败(返回非零状态码),说明这是一个空仓库,需要特殊处理。

#### 6.2 处理首次提交的特殊情况

如果是首次提交(root commit):

1. 先创建一个初始提交(包含第一组变更)
2. 然后 unstage 剩余文件
3. 再按正常流程逐个提交剩余分组

```bash
# 第一个提交(不使用 --amend)
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>
EOF
)"

# unstage 剩余文件
git reset HEAD <remaining-files>

# 继续后续提交
```

#### 6.3 正常情况的拆分流程

对于非首次提交,使用以下流程:

```bash
# 1. 重置暂存区(保留工作区变更)
git reset HEAD

# 2. 逐个分组提交
# 对于每个分组:

# 2.1 添加该组文件到暂存区
git add <file1> <file2> <file3>

# 2.2 创建提交(使用 --no-verify 避免重复触发 hooks)
git commit --no-verify -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>
EOF
)"

# 2.3 重复直到所有分组都提交完成
```

#### 6.4 提交信息格式注意事项

使用 heredoc 确保多行提交信息格式正确:

```bash
git commit --no-verify -m "$(cat <<'EOF'
feat(auth): 实现用户登录和登出功能

1. 新增 login.ts 实现登录逻辑和 JWT 生成
2. 新增 logout.ts 实现登出和令牌失效
3. 添加密码验证和错误处理
EOF
)"
```

### 7. 验证和反馈

所有提交完成后:

```bash
# 显示最近的提交历史
git log --oneline -n <提交数量>

# 确认工作区干净
git status
```

向用户报告:

```
✅ 已成功拆分为 X 个提交:

<commit-hash-1> build(deps): 添加认证相关依赖包
<commit-hash-2> feat(auth): 实现用户登录和登出功能
<commit-hash-3> test(auth): 添加认证模块单元测试
<commit-hash-4> docs: 更新 README 添加认证功能说明

当前工作区状态: 干净 (无未提交变更)
```

---

## 特殊情况处理

### 情况 A: 只有单一类型变更

如果分析后发现所有变更属于同一逻辑单元(例如只修改了一个功能模块的几个文件),建议用户:

```
检测到暂存区的变更属于单一逻辑单元,建议使用 /commit 命令创建单个提交,而不是拆分。

是否继续拆分? 还是使用 /commit?
```

### 情况 B: 变更过于复杂

如果暂存区包含 20+ 个文件且跨越多个不相关的功能:

```
检测到暂存区包含大量复杂变更 (X 个文件)。

建议:
1. 先拆分为 3-5 个主要分组
2. 如果某个分组仍然很大,可以在提交后再次运行此命令进一步拆分

是否继续?
```

### 情况 C: 存在未暂存的变更

如果工作区还有未暂存的变更:

```
注意: 工作区还有未暂存的变更,这些变更不会包含在本次拆分中。

未暂存的文件:
- <file1>
- <file2>

是否继续拆分暂存区的变更?
```

---

## 重要提醒

**生成 commit message 时,不要添加以下内容:**

- ❌ Claude Code 相关的宣传信息
- ❌ "Generated with [Claude Code](https://claude.com/claude-code)"
- ❌ "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ 任何 AI 工具的签名或标识

**只输出纯中文的 commit message 内容。**

---

## 示例场景

### 示例 1: 新增认证功能

**暂存区变更:**
```
M  package.json
M  pnpm-lock.yaml
A  src/auth/login.ts
A  src/auth/logout.ts
A  src/auth/types.ts
A  tests/auth.test.ts
M  README.md
```

**拆分方案:**

1. `build(deps): 添加认证相关依赖包`
   - package.json, pnpm-lock.yaml

2. `feat(auth): 实现用户登录和登出功能`
   - src/auth/login.ts, src/auth/logout.ts, src/auth/types.ts

3. `test(auth): 添加认证模块单元测试`
   - tests/auth.test.ts

4. `docs: 更新 README 添加认证功能说明`
   - README.md

### 示例 2: 重构和优化

**暂存区变更:**
```
M  src/utils/format.ts
M  src/utils/validate.ts
M  src/components/Form.tsx
M  src/components/Input.tsx
M  tests/utils.test.ts
M  tests/components.test.ts
```

**拆分方案:**

1. `refactor(utils): 重构格式化和验证工具函数`
   - src/utils/format.ts, src/utils/validate.ts

2. `refactor(components): 优化表单组件结构`
   - src/components/Form.tsx, src/components/Input.tsx

3. `test: 更新工具函数和组件的单元测试`
   - tests/utils.test.ts, tests/components.test.ts

---

## 工作原理说明

这个 skill 的核心价值在于:

1. **智能分析**: 理解代码变更的逻辑关系和依赖
2. **合理分组**: 按照最佳实践将变更组织为独立、原子的提交
3. **规范提交**: 自动生成符合 Conventional Commits 的中文提交信息
4. **安全执行**: 处理 Git 的各种边界情况(首次提交、复杂变更等)
5. **用户确认**: 在执行前展示方案,确保符合用户意图

通过这种方式,即使面对复杂的代码变更,也能保持清晰、可维护的 Git 历史。
