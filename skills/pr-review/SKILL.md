---
name: pr-review
description: GitHub PR 代码审查技能。检查代码质量、安全性、性能和最佳实践，生成结构化审查报告。触发场景包括"审查 PR"、"代码检查"、"review pull request"。
allowed-tools: Bash(gh:*), Read, Grep, Glob
---

# PR 代码审查技能

## 概述

系统化的 PR 审查流程，帮助发现代码问题、安全漏洞和改进机会。

## 审查维度

### 1. 代码质量
- 命名规范（变量、函数、文件）
- 代码结构和组织
- 可读性和可维护性
- DRY 原则（不重复代码）
- 单一职责原则

### 2. 安全问题
- XSS 跨站脚本攻击
- SQL 注入
- 敏感信息泄露（API Key、密码）
- 不安全的依赖
- 输入验证

### 3. 性能问题
- N+1 查询问题
- 不必要的重渲染（React）
- 内存泄漏风险
- 大文件/大包体积
- 未优化的循环

### 4. TypeScript 类型安全
- `any` 类型滥用
- 类型定义缺失
- 类型断言过度使用
- 泛型使用不当

### 5. React 最佳实践
- Hooks 使用规范
- 状态管理合理性
- 组件拆分
- Props 验证

### 6. 测试覆盖
- 单元测试
- 集成测试
- 边界条件
- 错误处理

## 审查流程

### 1. 获取 PR 信息
```bash
gh pr view <number> --json title,body,files,additions,deletions
gh pr diff <number>
```

### 2. 分析变更文件
按文件类型分组审查：
- `.tsx/.jsx` - React 组件
- `.ts/.js` - 逻辑代码
- `.css/.scss` - 样式
- `.md` - 文档
- `.json` - 配置

### 3. 生成审查报告

## 报告格式

```markdown
## PR 审查报告

**PR**: #<number> - <title>
**作者**: @username
**变更**: +<additions> -<deletions>

### 概要
[整体评价和建议]

---

### 🔴 必须修复

#### 1. [问题标题]
**文件**: `path/to/file.ts:行号`
**问题**: [问题描述]
**建议**: [修复建议]

\`\`\`diff
- // 问题代码
+ // 建议代码
\`\`\`

---

### 🟡 建议改进

#### 1. [改进标题]
**文件**: `path/to/file.ts:行号`
**说明**: [改进说明]

---

### 🟢 良好实践

- [发现的良好实践点]

---

### 📊 统计

| 指标 | 值 |
|------|-----|
| 变更文件数 | X |
| 新增行数 | +X |
| 删除行数 | -X |
| 问题数 | X |
| 建议数 | X |

---

### 检查清单

- [ ] 代码质量
- [ ] 安全问题
- [ ] 性能问题
- [ ] 类型安全
- [ ] 测试覆盖
```

## 使用方式

### 审查指定 PR
```
/pr-review 123
```

### 审查当前分支的 PR
```
/pr-review
```

### 只检查安全问题
```
/pr-review 123 --security-only
```

### 输出为评论格式
```
/pr-review 123 --comment
```

## 常见问题检测规则

### 安全问题

#### 敏感信息检测
```regex
(password|secret|api_key|token)\s*[=:]\s*["\'][^"\']+["\']
```

#### XSS 风险
```regex
dangerouslySetInnerHTML
innerHTML\s*=
document\.write
```

### 性能问题

#### N+1 查询
```typescript
// 问题模式
items.map(item => fetchDetail(item.id))

// 建议模式
const details = await batchFetchDetails(items.map(i => i.id))
```

#### React 重渲染
```typescript
// 问题：内联对象/函数
<Component style={{ color: 'red' }} onClick={() => {}} />

// 建议：使用 useMemo/useCallback
const style = useMemo(() => ({ color: 'red' }), [])
const handleClick = useCallback(() => {}, [])
```

### TypeScript 问题

#### any 类型
```typescript
// 问题
const data: any = response.data

// 建议
interface Response {
  data: DataType
}
const data: DataType = response.data
```

## 配置选项

可在 `.pr-review.json` 中配置：

```json
{
  "rules": {
    "security": true,
    "performance": true,
    "typescript": true,
    "react": true,
    "tests": false
  },
  "severity": {
    "any-type": "warning",
    "xss-risk": "error"
  },
  "ignore": ["**/*.test.ts", "**/dist/**"]
}
```

## 与 GitHub 集成

### 发布审查评论
```bash
gh pr review <number> --comment --body "$(cat review.md)"
```

### 请求修改
```bash
gh pr review <number> --request-changes --body "$(cat review.md)"
```

### 批准 PR
```bash
gh pr review <number> --approve --body "LGTM!"
```
