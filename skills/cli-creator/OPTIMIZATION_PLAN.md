# CLI-Creator 优化实施方案

## 优化目标

基于 skill-manager 实战经验,改进 cli-creator,使其生成的 CLI 工具更加完善和专业。

---

## 优先级 P0: 核心改进 (必须实现)

### 1. 内置日志系统 ✅

**问题**: 生成的项目缺少统一的日志工具

**解决方案**:
- 生成 `src/lib/logger.ts`
- 提供 title/info/success/error/warn/spinner 方法
- 集成 chalk 和 ora

**实现位置**: `scripts/init_cli.ts` 中的项目生成逻辑

---

### 2. 自动参数验证 ✅

**问题**: 命令参数没有验证,容易出错

**解决方案**:
- 生成 `src/lib/validation.ts`
- 为每个命令选项添加验证
- 提供友好的错误提示

**实现位置**: 命令模板生成逻辑

---

### 3. 扩展命令模板 ✅

**问题**: 只有基础的 add/update/check/remove

**解决方案**:
- 添加 `scan` 命令 (扫描发现)
- 添加 `search` 命令 (搜索功能)
- 提供"推荐组合"选项

**实现位置**: 命令模板生成

---

### 4. TypeScript 配置优化 ✅

**问题**: tsconfig.json 配置不够完善

**解决方案**:
- 添加路径别名 (@/*)
- 优化编译选项
- 添加声明文件生成

**实现位置**: `generateTsConfig()` 函数

---

## 优先级 P1: 重要改进 (应该实现)

### 5. 配置管理模板

**生成**: `src/lib/config.ts`
```typescript
export class ConfigManager {
  async getConfig(): Promise<any>
  async setConfig(data: any): Promise<void>
  async init(): Promise<void>
}
```

---

### 6. Git 集成示例

**生成**: `src/lib/git.ts`
```typescript
import simpleGit from 'simple-git';

export class GitManager {
  async clone(url, target, branch): Promise<void>
  async update(path, branch): Promise<void>
}
```

---

### 7. 改进帮助文档

**生成**: 详细的 README.md
- 快速开始
- 所有命令说明
- 使用场景
- 常见问题
- 开发指南

---

### 8. 测试框架集成

**生成**:
- `tests/unit/` 目录
- 测试模板文件
- vitest 配置

---

## 优先级 P2: 增强功能 (可选)

### 9. 交互式向导

使用 prompts 或 inquirerer 创建交互式初始化流程

---

### 10. 代码质量工具

自动配置 Biome/ESLint/Prettier

---

## 实施步骤

### 第一阶段: 核心改进 (立即执行)

1. 修改 `scripts/init_cli.ts`
   - 添加 logger 生成逻辑
   - 添加 validation 生成逻辑
   - 扩展命令模板

2. 更新模板生成函数
   - `generateLogger()`
   - `generateValidation()`
   - `generateCommand()`

3. 测试生成的 CLI
   - 创建测试项目
   - 验证所有功能

### 第二阶段: 重要改进 (近期执行)

4. 添加配置管理
5. 添加 Git 集成
6. 改进 README 模板
7. 添加测试支持

### 第三阶段: 增强功能 (长期计划)

8. 交互式向导
9. 更多模板选项
10. 社区功能

---

## 修改文件清单

### 需要修改
- `scripts/init_cli.ts` - 主要修改
- `SKILL.md` - 更新说明

### 需要创建
- `scripts/templates/` - 模板文件目录
  - `logger.ts.template`
  - `validation.ts.template`
  - `config.ts.template`
  - `git.ts.template`
  - `commands/` - 命令模板
  - `README.md.template`

---

## 预期效果

### 用户体验提升
- ✅ 开箱即用,包含常用功能
- ✅ 代码质量更高,有参数验证
- ✅ 更专业的日志输出
- ✅ 完善的文档

### 开发效率提升
- ✅ 减少手动编写代码量
- ✅ 更快的开发速度
- ✅ 更少的学习曲线

### CLI 质量提升
- ✅ 统一的代码风格
- ✅ 完整的错误处理
- ✅ 测试覆盖
- ✅ 文档完善
