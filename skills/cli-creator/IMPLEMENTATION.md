# CLI-Creator 优化实施文档

## 已实施的优化

### 1. 新增模板文件 ✅

创建了以下模板文件:

#### 核心工具模板
- `scripts/templates/logger.ts` - 统一的日志工具
- `scripts/templates/validation.ts` - 参数验证工具

#### 扩展命令模板
- `scripts/templates/commands/scan.ts` - Scan 命令模板
- `scripts/templates/commands/search.ts` - Search 命令模板

---

## 需要修改的核心文件

### scripts/init_cli.ts 主要改进

#### 改进 1: 添加 logger 和 validation 生成逻辑

**位置**: `generateLibFiles()` 函数 (行 446-516)

**当前实现**:
```typescript
// Logger
if (config.features.ui) {
  const loggerContent = `...`;
  await fs.writeFile(path.join(libDir, 'logger.ts'), loggerContent);
}
```

**改进建议**:
```typescript
// 始终生成 logger (改进后)
const loggerTemplate = await fs.readFile(
  path.join(__dirname, 'templates/logger.ts'),
  'utf-8'
);
await fs.writeFile(path.join(libDir, 'logger.ts'), loggerTemplate);

// 始终生成 validation (新增)
if (config.template !== 'minimal') {
  const validationTemplate = await fs.readFile(
    path.join(__dirname, 'templates/validation.ts'),
    'utf-8'
  );
  await fs.writeFile(path.join(libDir, 'validation.ts'), validationTemplate);
}
```

---

#### 改进 2: 扩展命令生成

**位置**: `generateCommanderIndex()` 函数 (行 332-353)

**当前实现**:
```typescript
program
  .name('${config.name}')
  .description('${config.description}')
  .version('${config.version}')
  .action(async () => {
    // Your logic here
  });
```

**改进建议**:
```typescript
program
  .name('${config.name}')
  .description('${config.description}')
  .version('${config.version}')

// 基础命令
program
  .command('add')
  .description('添加项目')
  .argument('<name>', '项目名称')
  .option('--description <desc>', '描述')
  .action(add);

program
  .command('update')
  .description('更新项目')
  .argument('[name]', '项目名称')
  .action(update);

program
  .command('check')
  .description('查看项目')
  .action(check);

program
  .command('remove')
  .description('删除项目')
  .argument('<name>', '项目名称')
  .action(remove);

// 标准模板包含额外命令
if (config.template !== 'minimal') {
  program
    .command('scan')
    .description('扫描项目')
    .option('--register', '自动注册')
    .action(scan);

  program
    .command('search')
    .description('搜索项目')
    .argument('<keyword>', '搜索关键词')
    .action(search);
}

program.parse();
```

---

#### 改进 3: 优化 TypeScript 配置

**位置**: `generateTsconfig()` 函数 (行 213-232)

**当前实现**:
```typescript
{
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'bundler',
    // ...
  }
}
```

**改进建议**:
```typescript
{
  compilerOptions: {
    target: 'ES2022',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    lib: ['ES2022'],
    esModuleInterop: true,
    resolveJsonModule: true,
    strict: true,
    skipLibCheck: true,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    outDir: './dist',
    rootDir: './src',
    baseUrl: '.',
    paths: {
      '@/*': ['src/*'],
      '@lib/*': ['src/lib/*'],
      '@commands/*': ['src/commands/*'],
    },
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist'],
}
```

---

#### 改进 4: 改进 README.md 生成

**位置**: `generateReadme()` 函数 (行 521-561)

**当前实现**: 简单的 README

**改进建议**: 添加完整的文档结构

```markdown
# ${config.name}

${config.description}

## ✨ 特性

- ✅ 特性 1
- ✅ 特性 2

## 🚀 快速开始

### 安装

\`\`\`bash
npm install -g ${config.name}
\`\`\`

### 基本使用

\`\`\`bash
${config.name} --help
\`\`\`

## 📚 核心命令

### 1. Add - 添加项目

\`\`\`bash
${config.name} add <name>
\`\`\`

### 2. Update - 更新项目

\`\`\`bash
${config.name} update [name]
\`\`\`

### 3. Check - 查看项目

\`\`\`bash
${config-name} check
\`\`\`

### 4. Remove - 删除项目

\`\`\`bash
${config.name} remove <name>
\`\`\`

${config.template !== 'minimal' ? `
### 5. Scan - 扫描项目

\`\`\`bash
${config.name} scan
\`\`\`

### 6. Search - 搜索项目

\`\`\`bash
${config.name} search <keyword>
\`\`\`
` : ''}

## 📖 使用示例

### 场景 1: 基本使用

\`\`\`bash
# 添加项目
${config.name} add my-project

# 查看所有项目
${config.name} check

# 更新项目
${config.name} update my-project
\`\`\`

## 🔧 开发

\`\`\`bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 测试
pnpm test
\`\`\`

## 📄 许可证

${config.license}
```

---

## 新增辅助函数

### generateCommands()

生成命令文件:

```typescript
async function generateCommands(config: CliConfig, srcDir: string): Promise<void> {
  if (config.template === 'minimal') {
    // minimal 只生成基础命令
    return;
  }

  const commandsDir = path.join(srcDir, 'commands');
  await fs.mkdir(commandsDir, { recursive: true });

  // 从模板生成 scan 和 search 命令
  const scanTemplate = await fs.readFile(
    path.join(__dirname, 'templates/commands/scan.ts'),
    'utf-8'
  );
  await fs.writeFile(path.join(commandsDir, 'scan.ts'), scanTemplate);

  const searchTemplate = await fs.readFile(
    path.join(__dirname, 'templates/commands/search.ts'),
    'utf-8'
  );
  await fs.writeFile(path.join(commandsDir, 'search.ts'), searchTemplate);
}
```

---

### generateValidation()

生成验证工具:

```typescript
async function generateValidation(config: CliConfig, srcDir: string): Promise<void> {
  if (config.template === 'minimal') {
    return;
  }

  const validationTemplate = await fs.readFile(
    path.join(__dirname, 'templates/validation.ts'),
    'utf-8'
  );

  // 替换模板中的变量
  const validationContent = validationTemplate
    .replace(/CLI_NAME/g, config.name)
    .replace(/DEFAULT_PLATFORM/g, 'default');

  await fs.writeFile(path.join(srcDir, 'lib', 'validation.ts'), validationContent);
}
```

---

## 使用方法

### 更新后的初始化命令

```bash
# 最小化 CLI (只有基础命令)
npx ts-node skills/cli-creator/scripts/init_cli.ts my-cli

# 标准 CLI (包含 scan/search + logger + validation)
npx ts-node skills/cli-creator/scripts/init_cli.ts my-cli --template standard

# 高级 CLI (包含所有功能)
npx ts-node skills/cli-creator/scripts/init_cli.ts my-cli --template advanced
```

---

## 改进效果对比

### 改进前
- ❌ 只有基础的 add/update/check/remove
- ❌ 缺少日志系统
- ❌ 没有参数验证
- ❌ README 简单
- ❌ TypeScript 配置基础

### 改进后
- ✅ 包含 scan 和 search 命令
- ✅ 内置 logger 工具
- ✅ 自动参数验证
- ✅ 详细的 README 文档
- ✅ 完善的 TypeScript 配置

---

## 实施检查清单

- [x] 创建 logger.ts 模板
- [x] 创建 validation.ts 模板
- [x] 创建 scan.ts 命令模板
- [x] 创建 search.ts 命令模板
- [ ] 修改 init_cli.ts 主逻辑
- [ ] 添加 generateCommands() 函数
- [ ] 添加 generateValidation() 函数
- [ ] 改进 generateCommanderIndex()
- [ ] 改进 generateTsconfig()
- [ ] 改进 generateReadme()
- [ ] 测试生成的 CLI
- [ ] 更新 SKILL.md 说明

---

## 下一步行动

1. **立即执行**: 修改 `scripts/init_cli.ts` 集成新模板
2. **测试验证**: 创建测试项目验证功能
3. **文档更新**: 更新 SKILL.md 说明新增功能
4. **发布**: 提交改进后的 cli-creator
