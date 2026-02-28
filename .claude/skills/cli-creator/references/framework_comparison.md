# CLI 框架对比

本文档详细对比了主流 Node.js CLI 框架,帮助你选择最适合的框架。

## 框架选择决策树

```
评估你的项目需求
│
├─ 项目规模: 多少个命令?
│  ├─ 1-3 个简单命令 → Commander.js / cac
│  ├─ 3-10 个命令 → Commander.js / Yargs
│  └─ 10+ 个命令 → oclif
│
├─ 用户交互需求
│  ├─ 纯命令行,无 UI → Commander.js / oclif / Yargs
│  ├─ 需要富交互 UI → Ink
│  └─ 需要进度条、spinner → 任何框架 + chalk + ora
│
├─ 插件/扩展需求
│  ├─ 需要插件系统 → oclif
│  └─ 不需要 → 其他框架
│
├─ 学习曲线
│  ├─ 希望快速上手 → Commander.js / cac
│  ├─ 愿意学习高级功能 → Yargs / oclif
│  └─ 熟悉 React → Ink
│
└─ 包体积要求
   ├─ 追求最小体积 → cac / citty
   └─ 功能优先 → 其他框架
```

## 详细对比表

| 特性 | Commander.js | oclif | Yargs | Ink | citty | cac |
|------|-------------|-------|-------|-----|-------|-----|
| **周下载量** | 200M+ | 5M+ | 30M+ | 5M+ | 200K+ | 2M+ |
| **学习曲线** | 低 | 中 | 中 | 高 (需React) | 低 | 极低 |
| **包体积** | ~50KB | ~200KB | ~150KB | ~500KB (含React) | ~20KB | ~10KB |
| **TypeScript** | ✅ 原生支持 | ✅ 原生支持 | ✅ 需配置 | ✅ 原生支持 | ✅ 原生支持 | ✅ 原生支持 |
| **插件系统** | ❌ | ✅ 强大 | ❌ | ❌ | ❌ | ❌ |
| **自动文档** | 基础 | ✅ 自动生成 | 基础 | 手动 | 手动 | 手动 |
| **子命令** | ✅ | ✅ | ✅ | 需实现 | ✅ | ✅ |
| **中间件** | ❌ | ✅ | ✅ | ✅ React组件 | ✅ | ❌ |
| **参数验证** | 基础 | ✅ 内置 | ✅ 强大 | 手动 | 基础 | 基础 |
| **UI 能力** | 手动集成 | 手动集成 | 手动集成 | ✅ React组件 | 手动集成 | 手动集成 |
| **企业级** | 中小 | ✅ 大型 | 中型 | 中型 | 小型 | 小型 |

## 框架详细分析

### Commander.js ⭐ 推荐

**优点**:
- 最流行,社区成熟,每周 2 亿+ 下载
- 简单易用,5 分钟上手
- API 清晰直观
- TypeScript 原生支持
- 文档完善
- 可扩展性强

**缺点**:
- 缺少内置插件系统
- 高级功能需要手动实现
- 参数验证相对基础

**适用场景**:
- 中小型 CLI 工具
- 快速原型开发
- 学习 CLI 开发
- 不需要插件系统的项目

**代码示例**:
```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('mycli')
  .description('My CLI tool')
  .version('1.0.0')
  .option('-d, --debug', 'output extra debugging')
  .argument('<input>', 'input file')
  .action((input, options) => {
    console.log(input);
    if (options.debug) console.log('Debug mode');
  });

program.parse();
```

**包体积**: ~50KB

**推荐度**: ⭐⭐⭐⭐⭐ (默认推荐)

---

### oclif

**优点**:
- Salesforce 维护,企业级质量
- 强大的插件系统
- 自动生成文档
- 自动生成 man pages
- 完善的测试工具
- 多命令项目结构清晰

**缺点**:
- 学习曲线较陡
- 配置复杂
- 包体积较大
- 可能过度工程化 (简单项目)

**适用场景**:
- 大型企业级 CLI
- 需要插件扩展
- 多命令复杂工具
- 团队协作项目

**代码示例**:
```typescript
import { Command, Flags } from '@oclif/core';

export default class MyCommand extends Command {
  static description = 'My command description';

  static flags = {
    debug: Flags.boolean({ char: 'd' }),
  };

  static args = [{
    name: 'input',
    required: true,
  }];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MyCommand);
    console.log(args.input);
  }
}
```

**包体积**: ~200KB

**推荐度**: ⭐⭐⭐⭐ (企业级项目)

---

### Yargs

**优点**:
- 功能丰富
- 声明式语法
- 强大的参数验证
- 内置中间件支持
- 自动生成帮助信息
- 成熟稳定

**缺点**:
- API 相对复杂
- 学习曲线中等
- 配置较多

**适用场景**:
- 需要复杂参数验证
- 需要中间件处理
- 大型 CLI 工具
- 需要细粒度控制

**代码示例**:
```typescript
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('serve [port]', 'start the server', (yargs) => {
    return yargs.positional('port', {
      describe: 'port to bind on',
      default: 5000
    })
  }, (argv) => {
    if (argv.verbose) console.info(`start server on :${argv.port}`)
  })
  .option('verbose', { alias: 'v', type: 'boolean', describe: 'verbose output' })
  .parse();
```

**包体积**: ~150KB

**推荐度**: ⭐⭐⭐⭐ (复杂参数验证)

---

### Ink

**优点**:
- React 组件化 UI
- 现代化开发体验
- 丰富的 UI 生态
- 强大的交互能力
- 类型安全

**缺点**:
- 需要学习 React
- 包体积较大 (含 React)
- 学习曲线高
- 可能过度设计 (简单 CLI)

**适用场景**:
- 需要 Rich UI 的 CLI
- 交互式工具
- 熟悉 React 的团队
- 复杂的用户界面

**代码示例**:
```typescript
import React from 'react';
import { render, Text } from 'ink';

const App = () => <Text>Hello World</Text>;

render(<App />);
```

**包体积**: ~500KB (含 React)

**推荐度**: ⭐⭐⭐⭐ (Rich UI 需求)

---

### citty (UnJS)

**优点**:
- 轻量级
- 现代 ESM
- UnJS 生态集成
- TypeScript 友好
- API 简洁

**缺点**:
- 相对较新
- 社区较小
- 生态不如成熟框架

**适用场景**:
- UnJS 生态项目
- 现代轻量级 CLI
- ESM 项目
- 追求小体积

**代码示例**:
```typescript
import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: 'mycli',
    version: '1.0.0',
  },
  run: async () => {
    console.log('Hello from citty!');
  },
});

await runMain(main);
```

**包体积**: ~20KB

**推荐度**: ⭐⭐⭐ (UnJS 生态)

---

### cac

**优点**:
- 极简设计
- 零依赖
- 超小体积
- 快速上手
- TypeScript 支持

**缺点**:
- 功能相对基础
- 缺少高级特性
- 社区较小

**适用场景**:
- 超轻量级工具
- 追求零依赖
- 简单脚本包装
- 学习 CLI 开发

**代码示例**:
```typescript
import cac from 'cac';

const cli = cac('mycli');

cli
  .command('build [entry]', 'Build your project')
  .option('--output <path>', 'Output directory')
  .action((entry, options) => {
    console.log(entry);
  });

cli.help();
cli.version('1.0.0');
cli.parse();
```

**包体积**: ~10KB

**推荐度**: ⭐⭐⭐⭐ (超轻量需求)

---

## 推荐方案总结

### 新手入门 / 快速原型
**推荐**: Commander.js
- 理由: 最流行,文档多,社区支持好,快速上手

### 企业级 CLI
**推荐**: oclif
- 理由: 插件系统,自动文档, Salesforce 维护

### Rich UI / 交互式工具
**推荐**: Ink
- 理由: React 组件化,强大 UI 能力

### 复杂参数验证
**推荐**: Yargs
- 理由: 内置验证,中间件支持

### UnJS 生态 / 现代轻量
**推荐**: citty
- 理由: UnJS 集成,轻量现代

### 超轻量 / 零依赖
**推荐**: cac
- 理由: 最小体积,零依赖

## 实际项目参考

### 使用 Commander.js
- Vercel CLI
- Cloudflare CLI
- Expo CLI

### 使用 oclif
- Salesforce CLI
- Heroku CLI
- Shopify CLI

### 使用 Yargs
- npm (历史版本)
- nodemon
- webpack-cli

### 使用 Ink
- Jest (调试 UI)
- Gatsby CLI
- Parcel

## 性能对比

| 框架 | 启动时间 | 内存占用 | CPU 使用 |
|------|---------|---------|---------|
| cac | 最快 | 最小 | 最低 |
| citty | 很快 | 很小 | 很低 |
| Commander.js | 快 | 小 | 低 |
| Yargs | 中等 | 中等 | 中等 |
| oclif | 慢 | 大 | 中等 |
| Ink | 最慢 | 最大 | 高 |

## 结论

对于大多数项目,推荐使用 **Commander.js** 作为默认框架:
- ✅ 流行度和社区支持最好
- ✅ 学习曲线平缓
- ✅ 功能完整且不过度设计
- ✅ TypeScript 原生支持
- ✅ 可以轻松集成 chalk, ora 等 UI 库

只有在特定需求下才考虑其他框架:
- 企业级 CLI → oclif
- Rich UI → Ink
- 复杂验证 → Yargs
- 超轻量 → cac/citty
