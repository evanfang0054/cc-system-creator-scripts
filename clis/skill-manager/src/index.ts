#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Command } from 'commander';
import { setupSignalHandlers, setupUnhandledRejection } from './lib/exit-codes.js';
import { checkNodeVersion, checkForUpdates } from './lib/update-check.js';
import { add } from './commands/add.js';
import { check } from './commands/check.js';
import { remove } from './commands/remove.js';
import { scan } from './commands/scan.js';
import { search } from './commands/search.js';
import { update } from './commands/update.js';

// 读取 package.json 获取版本号
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

// 设置信号处理器
setupSignalHandlers();
setupUnhandledRejection();

// 检查 Node.js 版本
try {
  checkNodeVersion();
} catch (error) {
  console.error(String(error));
  process.exit(1);
}

// 启动非阻塞版本检查
checkForUpdates();

const program = new Command();

// 全局选项
program
  .name('skill-manager')
  .description(
    '管理多平台的 AI Agent Skills - 支持 Claude Code, Cursor, Trae 等',
  )
  .version(packageJson.version)
  .option('-v, --verbose', '显示详细输出', false)
  .option('--dry-run', '模拟运行,不执行实际操作', false)
  .hook('preAction', (thisCommand) => {
    // 获取全局选项并设置环境变量,使其对logger生效
    const options = thisCommand.opts();
    if (options.verbose) {
      process.env.VERBOSE = '1';
    }
    if (options.dryRun) {
      process.env.DRY_RUN = '1';
    }
  });

// 添加 skill 命令
program
  .command('add')
  .description('从 Git 仓库添加 skill')
  .argument('<url>', 'Git 仓库 URL 或 skill 路径')
  .argument('[name]', '自定义 skill 名称')
  .option(
    '-p, --platform <type>',
    '目标平台 (claude-code|cursor|trae|vscode|windsurf)',
    'claude-code',
  )
  .option('--branch <name>', 'Git 分支', 'main')
  .action(add);

// 更新 skill 命令
program
  .command('update')
  .description('更新已安装的 skills')
  .argument('[name]', '指定 skill 名称,不指定则更新全部')
  .option('-p, --platform <type>', '目标平台', 'claude-code')
  .action(update);

// 检查已安装 skills 命令
program
  .command('check')
  .description('查看已注册的 skills')
  .option('-p, --platform <type>', '过滤平台', '')
  .option('-v, --verbose', '显示详细信息')
  .option('-o, --output <format>', '输出格式 (text|table|json|list)')
  .action(check);

// 扫描已安装 skills 命令
program
  .command('scan')
  .description('扫描并发现已安装的 skills (包括手动安装的)')
  .option('-p, --platform <type>', '只扫描指定平台')
  .option('--scope <scope>', '扫描范围 (global|project|all)', 'all')
  .option('--register', '自动注册未注册的 skills')
  .action(scan);

// 删除 skill 命令
program
  .command('remove')
  .description('删除已安装的 skill')
  .argument('<name>', 'skill 名称')
  .option('-p, --platform <type>', '目标平台', 'claude-code')
  .action(remove);

// 搜索 skills 命令
program
  .command('search')
  .description('在 Git 仓库中搜索 skills')
  .argument('<keyword>', '搜索关键词')
  .option('--repo <url>', 'Git 仓库 URL')
  .action(search);

// 补全命令
program
  .command('completion')
  .description('生成 Shell 自动补全脚本')
  .argument('[shell]', 'Shell 类型 (bash|zsh|fish)')
  .option('--dir <path>', '输出目录')
  .action(async (shell, options) => {
    const { setupCompletion } = await import('./lib/completion.js');
    const validShells = ['bash', 'zsh', 'fish'];

    if (!shell) {
      console.log('支持的 Shell 类型:');
      validShells.forEach((s) => console.log(`  - ${s}`));
      console.log('\n使用方法:');
      console.log('  skill-manager completion bash');
      console.log('  skill-manager completion zsh');
      console.log('  skill-manager completion fish');
      return;
    }

    if (!validShells.includes(shell)) {
      console.error(`无效的 Shell 类型: ${shell}`);
      console.error(`有效选项: ${validShells.join(', ')}`);
      process.exit(1);
    }

    await setupCompletion(shell, options.dir);
  });

// 解析命令行参数
program.parse();
