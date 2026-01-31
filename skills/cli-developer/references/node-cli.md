# Node.js CLI 开发

## Commander.js（推荐）

现代化、优雅的 CLI 框架，支持 TypeScript。

```javascript
#!/usr/bin/env node
import { Command } from 'commander';
import { version } from './package.json';

const program = new Command();

program
  .name('mycli')
  .description('我的强大 CLI 工具')
  .version(version);

// 简单命令
program
  .command('init')
  .description('初始化新项目')
  .option('-t, --template <type>', '项目模板', 'default')
  .option('-f, --force', '覆盖已存在的文件')
  .action(async (options) => {
    console.log(`正在使用模板初始化：${options.template}`);
  });

// 带参数的命令
program
  .command('deploy <environment>')
  .description('部署到环境')
  .option('--dry-run', '预览而不执行')
  .action(async (environment, options) => {
    if (options.dryRun) {
      console.log(`将部署到：${environment}`);
    } else {
      await deploy(environment);
    }
  });

// 嵌套子命令
const config = program.command('config').description('管理配置');

config
  .command('get <key>')
  .description('获取配置值')
  .action((key) => console.log(getConfig(key)));

config
  .command('set <key> <value>')
  .description('设置配置值')
  .action((key, value) => setConfig(key, value));

program.parse();
```

## Yargs（替代方案）

强大的参数解析，支持中间件。

```javascript
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command(
    'deploy <env>',
    '部署到环境',
    (yargs) => {
      return yargs
        .positional('env', {
          describe: '环境名称',
          choices: ['dev', 'staging', 'prod'],
        })
        .option('force', {
          alias: 'f',
          type: 'boolean',
          description: '强制部署',
        });
    },
    async (argv) => {
      await deploy(argv.env, { force: argv.force });
    }
  )
  .middleware([(argv) => {
    // 在所有命令之前验证
    if (!isConfigValid()) {
      throw new Error('配置无效');
    }
  }])
  .demandCommand()
  .help()
  .parse();
```

## 交互式提示（Inquirer）

美观的交互式提示，用于用户输入。

```javascript
import inquirer from 'inquirer';

// 文本输入
const { name } = await inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: '项目名称：',
    default: 'my-project',
    validate: (input) => input.length > 0 || '名称不能为空',
  },
]);

// 从列表选择
const { environment } = await inquirer.prompt([
  {
    type: 'list',
    name: 'environment',
    message: '选择环境：',
    choices: ['development', 'staging', 'production'],
    default: 'development',
  },
]);

// 复选框（多选）
const { features } = await inquirer.prompt([
  {
    type: 'checkbox',
    name: 'features',
    message: '选择功能：',
    choices: [
      { name: 'TypeScript', checked: true },
      { name: 'ESLint', checked: true },
      { name: 'Prettier', checked: true },
      { name: 'Jest', checked: false },
    ],
  },
]);

// 确认
const { confirmed } = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'confirmed',
    message: '部署到生产环境？',
    default: false,
  },
]);

// 密码
const { password } = await inquirer.prompt([
  {
    type: 'password',
    name: 'password',
    message: '输入密码：',
    mask: '*',
  },
]);
```

## 终端输出（Chalk）

彩色终端输出，支持正确的 TTY 检测。

```javascript
import chalk from 'chalk';

// 基本颜色
console.log(chalk.blue('信息：') + '正在开始部署...');
console.log(chalk.green('成功：') + '部署完成');
console.log(chalk.yellow('警告：') + '使用了已弃用的标志');
console.log(chalk.red('错误：') + '部署失败');

// 样式
console.log(chalk.bold.underline('重要'));
console.log(chalk.dim('不那么重要'));

// 模板
const success = chalk.green.bold;
const error = chalk.red.bold;
console.log(success('✓') + ' 构建成功');
console.log(error('✗') + ' 构建失败');

// 为 CI 禁用颜色
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✔'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✖'), msg),
};

// 自动检测 TTY 和 CI 环境
```

## 进度指示器（Ora）

优雅的终端加载动画和进度指示器。

```javascript
import ora from 'ora';

// 简单加载动画
const spinner = ora('加载中...').start();
await doWork();
spinner.succeed('完成！');

// 更新文本
const spinner = ora('开始中...').start();
spinner.text = '处理中...';
await process();
spinner.text = '完成中...';
await finalize();
spinner.succeed('完成！');

// 不同状态
spinner.start('正在安装依赖...');
// ... 工作
spinner.succeed('依赖已安装');
// 或
spinner.fail('安装失败');
// 或
spinner.warn('跳过了一些包');
// 或
spinner.info('使用缓存的包');

// 多个加载动画
const spinners = {
  api: ora('正在部署 API...').start(),
  web: ora('正在部署 Web 应用...').start(),
  db: ora('正在运行迁移...').start(),
};

await Promise.all([
  deployApi().then(() => spinners.api.succeed()),
  deployWeb().then(() => spinners.web.succeed()),
  runMigrations().then(() => spinners.db.succeed()),
]);
```

## 进度条（cli-progress）

```javascript
import cliProgress from 'cli-progress';

// 单个进度条
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(100, 0);

for (let i = 0; i <= 100; i++) {
  await processItem(i);
  bar.update(i);
}

bar.stop();

// 多进度条
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
});

const bar1 = multibar.create(100, 0, { task: 'API' });
const bar2 = multibar.create(100, 0, { task: 'Web' });

await Promise.all([
  processApi(bar1),
  processWeb(bar2),
]);

multibar.stop();
```

## 文件系统辅助工具

```javascript
import fs from 'fs-extra';
import { globby } from 'globby';
import path from 'path';

// 带模板复制
await fs.copy('templates/app', targetDir, {
  filter: (src) => !src.includes('node_modules'),
});

// 读/写 JSON
const config = await fs.readJson('config.json');
await fs.writeJson('output.json', data, { spaces: 2 });

// 确保目录存在
await fs.ensureDir('dist/assets');

// 查找文件
const files = await globby(['src/**/*.ts', '!src/**/*.test.ts']);
```

## 错误处理

```javascript
import { Command } from 'commander';

program
  .command('deploy')
  .action(async () => {
    try {
      await deploy();
    } catch (error) {
      if (error.code === 'EACCES') {
        console.error(chalk.red('权限被拒绝'));
        console.error('尝试使用 sudo 运行或检查文件权限');
        process.exit(77);
      } else if (error.code === 'ENOENT') {
        console.error(chalk.red('文件未找到：'), error.path);
        process.exit(127);
      } else {
        console.error(chalk.red('部署失败：'), error.message);
        if (process.env.DEBUG) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    }
  });

// 处理 SIGINT（Ctrl+C）
process.on('SIGINT', () => {
  console.log('\n操作已取消');
  process.exit(130);
});
```

## Package.json 设置

```json
{
  "name": "mycli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mycli": "./bin/cli.js"
  },
  "files": [
    "bin/",
    "lib/",
    "templates/"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0"
  }
}
```

## 测试 CLI

```javascript
import { execaCommand } from 'execa';
import { describe, it, expect } from 'vitest';

describe('mycli', () => {
  it('显示版本', async () => {
    const { stdout } = await execaCommand('node bin/cli.js --version');
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it('显示帮助', async () => {
    const { stdout } = await execaCommand('node bin/cli.js --help');
    expect(stdout).toContain('用法：');
  });

  it('处理无效命令', async () => {
    await expect(
      execaCommand('node bin/cli.js invalid')
    ).rejects.toThrow();
  });
});
```
