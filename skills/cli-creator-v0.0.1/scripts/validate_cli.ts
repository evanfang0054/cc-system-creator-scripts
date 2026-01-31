#!/usr/bin/env node

/**
 * CLI 项目验证器
 *
 * 验证生成的 CLI 项目是否完整和可用
 *
 * 使用方法：
 *    validate_cli.ts <project-path>
 *
 * 示例：
 *    validate_cli.ts ./my-cli
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * 验证结果
 */
interface ValidationResult {
  check: string;
  passed: boolean;
  message?: string;
  fix?: string;
}

/**
 * 验证清单
 */
const validations: ValidationResult[] = [];

/**
 * 添加验证结果
 */
function addResult(check: string, passed: boolean, message?: string, fix?: string): void {
  validations.push({ check, passed, message, fix });
}

/**
 * 检查文件或目录是否存在
 */
async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证 package.json
 */
async function validatePackageJson(projectDir: string): Promise<void> {
  const pkgPath = path.join(projectDir, 'package.json');

  if (!(await exists(pkgPath))) {
    addResult(
      'package.json 存在',
      false,
      'package.json 文件不存在',
      '运行: npm init'
    );
    return;
  }

  try {
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // 检查必需字段
    const requiredFields = ['name', 'version', 'description', 'bin'];
    const missingFields = requiredFields.filter(field => !pkg[field]);

    if (missingFields.length > 0) {
      addResult(
        'package.json 格式',
        false,
        `缺少字段: ${missingFields.join(', ')}`
      );
    } else {
      addResult('package.json 格式', true);

      // 检查 bin 字段
      if (typeof pkg.bin === 'object') {
        const binFile = Object.values(pkg.bin)[0] as string;
        const binPath = path.join(projectDir, binFile);
        if (await exists(binPath)) {
          addResult('bin 可执行文件存在', true);
        } else {
          addResult(
            'bin 可执行文件存在',
            false,
            `${binPath} 不存在`
          );
        }
      }
    }

    // 检查 scripts
    if (pkg.scripts) {
      const scripts = Object.keys(pkg.scripts);
      if (scripts.length > 0) {
        addResult('npm scripts 配置', true, `已配置 ${scripts.length} 个脚本`);
      }
    }

    // 检查文件列表
    if (pkg.files && pkg.files.length > 0) {
      addResult('files 字段配置', true);
    }
  } catch (error) {
    addResult(
      'package.json 格式',
      false,
      `解析失败: ${(error as Error).message}`
    );
  }
}

/**
 * 验证 tsconfig.json
 */
async function validateTsconfig(projectDir: string): Promise<void> {
  const tsconfigPath = path.join(projectDir, 'tsconfig.json');

  if (!(await exists(tsconfigPath))) {
    addResult(
      'tsconfig.json 存在',
      false,
      'TypeScript 项目需要 tsconfig.json',
      '运行: npx tsc --init'
    );
    return;
  }

  try {
    const content = await fs.readFile(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(content);

    if (tsconfig.compilerOptions) {
      const { outDir, rootDir } = tsconfig.compilerOptions;
      if (outDir && rootDir) {
        addResult('tsconfig.json 配置', true, `outDir: ${outDir}, rootDir: ${rootDir}`);
      } else {
        addResult('tsconfig.json 配置', false, '缺少 outDir 或 rootDir');
      }
    }
  } catch (error) {
    addResult(
      'tsconfig.json 格式',
      false,
      `解析失败: ${(error as Error).message}`
    );
  }
}

/**
 * 验证目录结构
 */
async function validateDirectoryStructure(projectDir: string): Promise<void> {
  const requiredDirs = ['src'];
  const optionalDirs = ['test', 'bin'];

  for (const dir of requiredDirs) {
    const dirPath = path.join(projectDir, dir);
    if (await exists(dirPath)) {
      addResult(`${dir}/ 目录存在`, true);
    } else {
      addResult(`${dir}/ 目录存在`, false, `${dir}/ 目录缺失`);
    }
  }

  for (const dir of optionalDirs) {
    const dirPath = path.join(projectDir, dir);
    if (await exists(dirPath)) {
      addResult(`${dir}/ 目录存在`, true);
    }
  }

  // 检查 src/ 内容
  const srcDir = path.join(projectDir, 'src');
  if (await exists(srcDir)) {
    const files = await fs.readdir(srcDir);
    if (files.length > 0) {
      addResult('src/ 源文件', true, `找到 ${files.length} 个文件`);
    } else {
      addResult('src/ 源文件', false, 'src/ 目录为空');
    }
  }
}

/**
 * 验证依赖安装
 */
async function validateDependencies(projectDir: string): Promise<void> {
  const nodeModulesPath = path.join(projectDir, 'node_modules');
  const lockfilePath = path.join(projectDir, 'pnpm-lock.yaml');

  if (await exists(nodeModulesPath)) {
    addResult('依赖已安装', true);
  } else {
    addResult(
      '依赖已安装',
      false,
      'node_modules 不存在',
      '运行: pnpm install'
    );
  }

  if (await exists(lockfilePath)) {
    addResult('lockfile 存在', true);
  } else {
    addResult('lockfile 存在', false, 'pnpm-lock.yaml 不存在');
  }
}

/**
 * 验证 CLI 功能
 */
async function validateCliFunctionality(projectDir: string): Promise<void> {
  const pkgPath = path.join(projectDir, 'package.json');

  try {
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);

    // 获取 bin 命令
    let binCmd = 'node';
    if (pkg.bin) {
      if (typeof pkg.bin === 'string') {
        binCmd = `node ${pkg.bin}`;
      } else if (typeof pkg.bin === 'object') {
        const binFile = Object.values(pkg.bin)[0] as string;
        binCmd = `node ${binFile}`;
      }
    }

    // 测试 --version
    try {
      const version = execSync(`${binCmd} --version`, {
        cwd: projectDir,
        encoding: 'utf-8',
      });
      if (version.trim()) {
        addResult('--version 命令', true, `版本: ${version.trim()}`);
      }
    } catch {
      addResult('--version 命令', false, '无法获取版本信息');
    }

    // 测试 --help
    try {
      const help = execSync(`${binCmd} --help`, {
        cwd: projectDir,
        encoding: 'utf-8',
      });
      if (help.trim()) {
        addResult('--help 命令', true, '帮助信息可用');
      }
    } catch {
      addResult('--help 命令', false, '无法获取帮助信息');
    }
  } catch (error) {
    addResult('CLI 功能测试', false, `测试失败: ${(error as Error).message}`);
  }
}

/**
 * 验证测试配置
 */
async function validateTestConfig(projectDir: string): Promise<void> {
  const vitestConfig = path.join(projectDir, 'vitest.config.ts');
  const testDir = path.join(projectDir, 'test');

  if (await exists(vitestConfig)) {
    addResult('Vitest 配置', true);

    // 尝试运行测试
    try {
      execSync('pnpm test --run', {
        cwd: projectDir,
        stdio: 'pipe',
      });
      addResult('测试运行', true);
    } catch {
      addResult('测试运行', false, '测试失败或未配置', '运行: pnpm test');
    }
  } else if (await exists(testDir)) {
    addResult('测试配置', false, '存在 test/ 但无 Vitest 配置');
  }
}

/**
 * 验证 Lint 配置
 */
async function validateLintConfig(projectDir: string): Promise<void> {
  const biomeConfig = path.join(projectDir, 'biome.json');

  if (await exists(biomeConfig)) {
    addResult('Biome 配置', true);

    try {
      execSync('pnpm run lint', {
        cwd: projectDir,
        stdio: 'pipe',
      });
      addResult('Lint 检查', true);
    } catch {
      addResult('Lint 检查', false, 'Lint 发现问题', '运行: pnpm run lint');
    }
  }
}

/**
 * 验证 README.md
 */
async function validateReadme(projectDir: string): Promise<void> {
  const readmePath = path.join(projectDir, 'README.md');

  if (await exists(readmePath)) {
    const content = await fs.readFile(readmePath, 'utf-8');

    const requiredSections = [
      '安装',
      '使用',
      'Usage',
      'Install',
    ];

    const hasRequiredSections = requiredSections.some(section =>
      content.toLowerCase().includes(section.toLowerCase())
    );

    if (hasRequiredSections) {
      addResult('README.md', true, '包含必要章节');
    } else {
      addResult(
        'README.md',
        false,
        '缺少安装或使用说明',
        '添加安装和使用示例'
      );
    }
  } else {
    addResult(
      'README.md',
      false,
      'README.md 文件不存在',
      '创建 README.md'
    );
  }
}

/**
 * 打印验证结果
 */
function printResults(): void {
  console.log('\n📋 验证结果:\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const result of validations) {
    if (result.passed) {
      console.log(`✅ ${result.check}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
      passedCount++;
    } else {
      console.log(`❌ ${result.check}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
      if (result.fix) {
        console.log(`   💡 修复: ${result.fix}`);
      }
      failedCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`总计: ${validations.length} 项检查`);
  console.log(`✅ 通过: ${passedCount}`);
  console.log(`❌ 失败: ${failedCount}`);
  console.log('='.repeat(50));

  if (failedCount === 0) {
    console.log('\n🎉 所有检查通过! CLI 项目验证成功。\n');
  } else {
    console.log('\n⚠️  部分检查失败,请按照建议修复问题。\n');
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法：validate_cli.ts <project-path>');
    console.log('\n示例：');
    console.log('  validate_cli.ts ./my-cli');
    console.log('  validate_cli.ts /path/to/cli-project');
    process.exit(1);
  }

  const projectDir = args[0];

  console.log(`\n🔍 验证 CLI 项目: ${projectDir}\n`);

  // 检查项目目录是否存在
  if (!(await exists(projectDir))) {
    console.log(`❌ 错误：目录不存在: ${projectDir}`);
    process.exit(1);
  }

  // 运行所有验证
  await validatePackageJson(projectDir);
  await validateTsconfig(projectDir);
  await validateDirectoryStructure(projectDir);
  await validateDependencies(projectDir);
  await validateCliFunctionality(projectDir);
  await validateTestConfig(projectDir);
  await validateLintConfig(projectDir);
  await validateReadme(projectDir);

  // 打印结果
  printResults();

  // 根据结果退出
  const failedCount = validations.filter(r => !r.passed).length;
  process.exit(failedCount === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 意外错误：', error);
    process.exit(1);
  });
}
