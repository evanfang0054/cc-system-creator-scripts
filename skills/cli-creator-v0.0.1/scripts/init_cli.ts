#!/usr/bin/env node

/**
 * CLI 项目初始化器
 *
 * 使用方法：
 *    init_cli.ts <cli-name> [options]
 *
 * 示例：
 *    init_cli.ts my-tool
 *    init_cli.ts my-tool --template standard --ui --testing
 *    init_cli.ts my-tool --framework oclif --template advanced
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * CLI 配置接口
 */
interface CliConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  framework: 'commander' | 'oclif' | 'yargs' | 'ink' | 'citty' | 'cac';
  features: {
    ui: boolean;           // chalk + ora
    config: boolean;       // cosmiconfig + zod
    testing: boolean;      // vitest
    linting: boolean;      // biome
    typescript: boolean;   // tsx/tsdown
  };
  template: 'minimal' | 'standard' | 'advanced';
}

/**
 * 框架依赖映射
 */
const DEPENDENCY_MAP = {
  frameworks: {
    commander: ['commander@^12.0.0'],
    oclif: ['@oclif/core@^4.0.0'],
    yargs: ['yargs@^17.7.0'],
    ink: ['ink@^4.4.0', 'react@^18.2.0', 'react-reconciler@^0.29.0'],
    citty: ['citty@^0.1.0'],
    cac: ['cac@^6.8.0'],
  },
  ui: {
    colors: ['chalk@^5.3.0'],
    spinners: ['ora@^8.0.0'],
  },
  config: {
    loader: ['cosmiconfig@^9.0.0'],
    validation: ['zod@^3.23.0'],
  },
  testing: {
    framework: ['vitest@^2.1.0'],
    coverage: ['@vitest/coverage-v8@^2.1.0'],
  },
  dev: {
    typescript: ['typescript@^5.6.0'],
    runner: ['tsx@^4.19.0'],
    build: ['tsdown@^0.3.0'],
    linting: ['@biomejs/biome@^1.9.0'],
    types: ['@types/node@^22.0.0'],
  },
};

/**
 * 推断配置
 */
function inferConfig(cliName: string, options: Record<string, string>): CliConfig {
  const framework = (options.framework || 'commander') as CliConfig['framework'];
  const template = (options.template || 'minimal') as CliConfig['template'];

  // 根据模板级别推断功能
  const features: CliConfig['features'] = {
    ui: options.ui === 'true' || template !== 'minimal',
    config: options.config === 'true' || template === 'advanced',
    testing: options.testing === 'true' || template !== 'minimal',
    linting: template !== 'minimal',
    typescript: true,  // 默认启用 TypeScript
  };

  return {
    name: cliName,
    description: options.description || `A CLI tool built with ${framework}`,
    version: options.version || '0.1.0',
    author: options.author || '',
    license: options.license || 'MIT',
    framework,
    features,
    template,
  };
}

/**
 * 收集依赖
 */
function collectDependencies(config: CliConfig): { dependencies: string[], devDependencies: string[] } {
  const dependencies: string[] = [];
  const devDependencies: string[] = [];

  // 框架依赖
  dependencies.push(...DEPENDENCY_MAP.frameworks[config.framework]);

  // UI 库
  if (config.features.ui) {
    dependencies.push(...DEPENDENCY_MAP.ui.colors);
    dependencies.push(...DEPENDENCY_MAP.ui.spinners);
  }

  // 配置管理
  if (config.features.config) {
    dependencies.push(...DEPENDENCY_MAP.config.loader);
    dependencies.push(...DEPENDENCY_MAP.config.validation);
  }

  // 开发依赖
  if (config.features.typescript) {
    devDependencies.push(...DEPENDENCY_MAP.dev.typescript);
    devDependencies.push(...DEPENDENCY_MAP.dev.runner);
    devDependencies.push(...DEPENDENCY_MAP.dev.build);
  }

  if (config.features.testing) {
    devDependencies.push(...DEPENDENCY_MAP.testing.framework);
    devDependencies.push(...DEPENDENCY_MAP.testing.coverage);
  }

  if (config.features.linting) {
    devDependencies.push(...DEPENDENCY_MAP.dev.linting);
  }

  devDependencies.push(...DEPENDENCY_MAP.dev.types);

  return { dependencies, devDependencies };
}

/**
 * 生成 package.json
 */
function generatePackageJson(config: CliConfig): { [key: string]: any } {
  const { dependencies, devDependencies } = collectDependencies(config);

  const pkg: any = {
    name: config.name,
    version: config.version,
    description: config.description,
    type: 'module',
    bin: {
      [config.name]: './bin/run.js',
    },
    scripts: {
      start: `node ${config.framework === 'ink' ? 'src/index.tsx' : 'src/index.ts'}`,
    },
    engines: {
      node: '>=18.0.0',
    },
    dependencies: Object.fromEntries(
      dependencies.map(dep => {
        const [name, version] = dep.split('@');
        return [name, version];
      })
    ),
    devDependencies: Object.fromEntries(
      devDependencies.map(dep => {
        const [name, version] = dep.split('@');
        return [name, version];
      })
    ),
    files: [
      'bin',
      'dist',
      'src',
    ],
  };

  if (config.author) {
    pkg.author = config.author;
  }

  pkg.license = config.license;

  // TypeScript 脚本
  if (config.features.typescript) {
    pkg.scripts.dev = 'tsx watch src/index.ts';
    pkg.scripts.build = `tsdown src/index.ts${config.framework === 'ink' ? 'x' : ''} --format cjs,esm`;
    pkg.scripts.typecheck = 'tsc --noEmit';
  }

  // 测试脚本
  if (config.features.testing) {
    pkg.scripts.test = 'vitest';
    pkg.scripts['test:coverage'] = 'vitest run --coverage';
  }

  // Lint 脚本
  if (config.features.linting) {
    pkg.scripts.lint = 'biome check .';
    pkg.scripts.format = 'biome format . --write';
  }

  return pkg;
}

/**
 * 生成 tsconfig.json
 */
function generateTsconfig(config: CliConfig): { [key: string]: any } {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022'],
      moduleResolution: 'bundler',
      esModuleInterop: true,
      resolveJsonModule: true,
      strict: true,
      skipLibCheck: true,
      declaration: true,
      declarationMap: true,
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
}

/**
 * 生成 vitest.config.ts
 */
function generateVitestConfig(): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`;
}

/**
 * 生成 biome.json
 */
function generateBiomeConfig(): string {
  return JSON.stringify({
    $schema: 'https://biomejs.dev/schemas/1.9.0/schema.json',
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 80,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
      },
    },
    javascript: {
      formatter: {
        quoteStyle: 'single',
        jsxQuoteStyle: 'double',
        trailingCommas: 'all',
      },
    },
  }, null, 2);
}

/**
 * 生成源代码文件
 */
async function generateSourceFiles(config: CliConfig, projectDir: string): Promise<void> {
  const srcDir = path.join(projectDir, 'src');

  // 根据框架生成入口文件
  let indexContent = '';

  switch (config.framework) {
    case 'commander':
      indexContent = generateCommanderIndex(config);
      break;
    case 'oclif':
      indexContent = generateOclifIndex(config);
      break;
    case 'ink':
      indexContent = generateInkIndex(config);
      break;
    case 'yargs':
      indexContent = generateYargsIndex(config);
      break;
    case 'citty':
      indexContent = generateCittyIndex(config);
      break;
    case 'cac':
      indexContent = generateCacIndex(config);
      break;
  }

  await fs.writeFile(path.join(srcDir, `index.ts${config.framework === 'ink' ? 'x' : ''}`), indexContent);

  // 生成 bin/run.js
  const binContent = config.framework === 'ink'
    ? `#!/usr/bin/env node\nimport '../src/index.tsx';\n`
    : `#!/usr/bin/env node\nimport '../src/index.js';\n`;

  const binDir = path.join(projectDir, 'bin');
  await fs.mkdir(binDir, { recursive: true });
  await fs.writeFile(path.join(binDir, 'run.js'), binContent, { mode: 0o755 });

  // 生成配置和日志库 (standard/advanced)
  if (config.template !== 'minimal') {
    await generateLibFiles(config, srcDir);
  }
}

/**
 * 生成 Commander.js 入口
 */
function generateCommanderIndex(config: CliConfig): string {
  let content = `#!/usr/bin/env node\nimport { Command } from 'commander';\n`;

  if (config.features.ui) {
    content += `import chalk from 'chalk';\nimport ora from 'ora';\n`;
  }

  content += `
const program = new Command();

program
  .name('${config.name}')
  .description('${config.description}')
  .version('${config.version}')
  .action(async () => {
    ${config.features.ui ? `const spinner = ora('Processing...').start();\n    // Your logic here\n    spinner.succeed('Done!');` : '// Your logic here'}
  });

program.parse();
`;
  return content;
}

/**
 * 生成 oclif 入口
 */
function generateOclifIndex(config: CliConfig): string {
  return `#!/usr/bin/env node
import { Command } from '@oclif/core';

class MyCommand extends Command {
  static override description = '${config.description}';

  async run(): Promise<void> {
    ${config.features.ui ? `// Use ora and chalk for UI` : '// Your logic here'}
  }
}

await MyCommand.run(void 0, import.meta.url);
`;
}

/**
 * 生成 Ink 入口
 */
function generateInkIndex(config: CliConfig): string {
  return `import React from 'react';
import { render } from 'ink';
import App from './App.js';

render(React.createElement(App));
`;
}

/**
 * 生成 Yargs 入口
 */
function generateYargsIndex(config: CliConfig): string {
  return `#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName('${config.name}')
  .usage('$0 [options]')
  .version('${config.version}')
  .help()
  .parse();
`;
}

/**
 * 生成 citty 入口
 */
function generateCittyIndex(config: CliConfig): string {
  return `#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: '${config.name}',
    description: '${config.description}',
    version: '${config.version}',
  },
  run: async () => {
    // Your logic here
  },
});

await runMain(main);
`;
}

/**
 * 生成 cac 入口
 */
function generateCacIndex(config: CliConfig): string {
  return `#!/usr/bin/env node
import cac from 'cac';

const cli = cac('${config.name}');

cli
  .version('${config.version}')
  .help()
  .parse();

// Your logic here
`;
}

/**
 * 生成库文件 (config, logger)
 */
async function generateLibFiles(config: CliConfig, srcDir: string): Promise<void> {
  const libDir = path.join(srcDir, 'lib');
  await fs.mkdir(libDir, { recursive: true });

  // Logger
  if (config.features.ui) {
    const loggerContent = `import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner?: Ora;

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  start(text: string): void {
    this.spinner = ora(text).start();
  }

  succeed(text?: string): void {
    this.spinner?.succeed(text);
  }

  fail(text?: string): void {
    this.spinner?.fail(text);
  }

  stop(): void {
    this.spinner?.stop();
  }
}

export const logger = new Logger();
`;
    await fs.writeFile(path.join(libDir, 'logger.ts'), loggerContent);
  }

  // Config
  if (config.features.config) {
    const configContent = `import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

const configSchema = z.object({
  ${config.name === 'my-cli' ? '// TODO: Add your config fields' : '// TODO: Add your config fields'}
});

export type Config = z.infer<typeof configSchema>;

export async function loadConfig(): Promise<Config> {
  const explorer = cosmiconfig('${config.name}');
  const result = await explorer.search();

  return configSchema.parse(result?.config || {});
}
`;
    await fs.writeFile(path.join(libDir, 'config.ts'), configContent);
  }
}

/**
 * 生成 README.md
 */
function generateReadme(config: CliConfig): string {
  return `# ${config.name}

${config.description}

## 安装

\`\`\`bash
npm install -g ${config.name}
\`\`\`

## 使用

\`\`\`bash
${config.name} --help
\`\`\`

## 开发

\`\`\`bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 测试
pnpm test

# Lint
pnpm run lint
\`\`\`

## 许可证

${config.license}
`;
}

/**
 * 初始化 CLI 项目
 */
async function initCli(cliName: string, options: Record<string, string>): Promise<void> {
  try {
    // 获取当前工作目录
    const projectDir = path.resolve(process.cwd(), cliName);

    // 检查目录是否存在
    try {
      await fs.access(projectDir);
      console.log(`❌ 错误：目录已存在：${projectDir}`);
      process.exit(1);
    } catch {
      // 目录不存在，继续
    }

    // 推断配置
    const config = inferConfig(cliName, options);

    console.log(`🚀 正在创建 CLI 项目：${cliName}`);
    console.log(`   框架：${config.framework}`);
    console.log(`   模板：${config.template}`);
    console.log();

    // 创建项目目录
    await fs.mkdir(projectDir, { recursive: true });

    // 创建 src 目录
    const srcDir = path.join(projectDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    // 生成 package.json
    const pkg = generatePackageJson(config);
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
    console.log('✅ 已创建 package.json');

    // 生成 tsconfig.json
    if (config.features.typescript) {
      const tsconfig = generateTsconfig(config);
      await fs.writeFile(
        path.join(projectDir, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2)
      );
      console.log('✅ 已创建 tsconfig.json');
    }

    // 生成 vitest.config.ts
    if (config.features.testing) {
      await fs.writeFile(
        path.join(projectDir, 'vitest.config.ts'),
        generateVitestConfig()
      );
      console.log('✅ 已创建 vitest.config.ts');
    }

    // 生成 biome.json
    if (config.features.linting) {
      await fs.writeFile(
        path.join(projectDir, 'biome.json'),
        generateBiomeConfig()
      );
      console.log('✅ 已创建 biome.json');
    }

    // 生成源代码
    await generateSourceFiles(config, projectDir);
    console.log(`✅ 已创建 ${config.framework} 框架的源代码`);

    // 生成 README.md
    await fs.writeFile(
      path.join(projectDir, 'README.md'),
      generateReadme(config)
    );
    console.log('✅ 已创建 README.md');

    // 创建 .gitignore
    const gitignore = `node_modules/
dist/
*.log
.DS_Store
coverage/
.vscode/
.idea/
`;
    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore);
    console.log('✅ 已创建 .gitignore');

    // 安装依赖
    console.log();
    console.log('📦 正在安装依赖...');

    try {
      execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });
      console.log('✅ 依赖安装完成');
    } catch (error) {
      console.log('⚠️  依赖安装失败，请手动运行：');
      console.log(`   cd ${cliName} && pnpm install`);
    }

    console.log();
    console.log(`✅ CLI 项目创建完成！`);
    console.log();
    console.log('后续步骤：');
    console.log(`1. cd ${cliName}`);
    console.log(`2. 编辑 src/index.ts 实现你的 CLI 逻辑`);
    console.log(`3. pnpm run dev      # 开发模式`);
    console.log(`4. pnpm run build    # 构建`);
    console.log(`5. pnpm test         # 测试`);
    console.log();

  } catch (error) {
    console.error('❌ 错误：', error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法：init_cli.ts <cli-name> [options]');
    console.log();
    console.log('选项：');
    console.log('  --framework <name>   框架 (commander/oclif/yargs/ink/citty/cac)');
    console.log('  --template <type>    模板 (minimal/standard/advanced)');
    console.log('  --ui                 包含 UI 库 (chalk + ora)');
    console.log('  --config             包含配置管理 (cosmiconfig + zod)');
    console.log('  --testing            包含测试配置 (vitest)');
    console.log('  --description <text> 项目描述');
    console.log('  --version <version>  版本号 (默认: 0.1.0)');
    console.log('  --author <name>      作者');
    console.log('  --license <type>     许可证 (默认: MIT)');
    console.log();
    console.log('示例：');
    console.log('  init_cli.ts my-tool');
    console.log('  init_cli.ts my-tool --template standard --ui --testing');
    console.log('  init_cli.ts my-tool --framework oclif --template advanced');
    process.exit(1);
  }

  const cliName = args[0];
  const options: Record<string, string> = {};

  // 解析选项
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1] || 'true';
    options[key] = value;
  }

  await initCli(cliName, options);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 意外错误：', error);
    process.exit(1);
  });
}
