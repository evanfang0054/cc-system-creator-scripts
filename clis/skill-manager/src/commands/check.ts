import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { ConfigManager } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { validatePlatform } from '../lib/validation.js';
import { exitWithError } from '../lib/exit-codes.js';
import { formatSkillsList, validateOutputFormat, type OutputFormat } from '../lib/formatters.js';

interface CheckOptions {
  platform: string;
  verbose: boolean;
  output?: string;
}

export async function check(options: CheckOptions): Promise<void> {
  const config = new ConfigManager();

  try {
    // 验证参数 (如果提供了平台)
    if (options.platform) {
      validatePlatform(options.platform);
    }

    // 验证输出格式
    const outputFormat: OutputFormat = options.output
      ? validateOutputFormat(options.output)
      : 'text';

    const skills = await config.getSkills();

    // 筛选平台
    let filteredSkills = skills;
    if (options.platform) {
      filteredSkills = skills.filter((s) => s.platform === options.platform);
    }

    if (filteredSkills.length === 0) {
      if (outputFormat !== 'json') {
        logger.title('📋 已安装的 Skills');
      }
      logger.info('没有找到已安装的 skills');
      return;
    }

    // JSON 格式输出 (不显示标题)
    if (outputFormat === 'json') {
      const { formatJSON } = await import('../lib/formatters.js');
      console.log(formatJSON(filteredSkills));
      return;
    }

    // 显示标题 (非JSON格式)
    logger.title('📋 已安装的 Skills');

    if (outputFormat === 'table') {
      const { formatTable } = await import('../lib/formatters.js');

      const tableData = {
        headers: ['名称', '平台', '描述', '版本'],
        rows: filteredSkills.map((s) => [
          s.name,
          s.platform,
          s.description,
          s.version || 'N/A',
        ]),
      };

      console.log(formatTable(tableData));
      return;
    }

    if (outputFormat === 'list') {
      const { formatList } = await import('../lib/formatters.js');
      console.log(
        formatList(
          filteredSkills.map((s) => `${s.name} (${s.platform}): ${s.description}`),
        ),
      );
      return;
    }

    // text 格式 (默认)
    // 按平台分组
    const byPlatform: Record<string, typeof skills> = {};
    for (const skill of filteredSkills) {
      if (!byPlatform[skill.platform]) {
        byPlatform[skill.platform] = [];
      }
      byPlatform[skill.platform].push(skill);
    }

    // 显示每个平台的 skills
    for (const [platform, platformSkills] of Object.entries(byPlatform)) {
      console.log(`\n${platform.toUpperCase()}`);
      console.log('─'.repeat(50));

      if (options.verbose) {
        // 详细模式
        for (const skill of platformSkills) {
          // 根据作用域获取正确的路径
          const platformPath = config.getPlatformPath(
            skill.platform as any,
            skill.scope,
            skill.projectPath,
          );
          const skillPath = path.join(platformPath, skill.name);
          const exists = await checkSkillExists(skillPath);

          console.log(
            `\n  ${chalk.bold(skill.name)} ${exists ? chalk.green('✓') : chalk.red('✗')}`,
          );
          console.log(`  描述: ${skill.description}`);
          console.log(`  版本: ${skill.version}`);
          console.log(`  作者: ${skill.author}`);
          console.log(`  仓库: ${skill.repository}`);
          console.log(`  路径: ${skillPath}`);
          console.log(
            `  安装时间: ${new Date(skill.installedAt).toLocaleString('zh-CN')}`,
          );
          console.log(
            `  最后更新: ${new Date(skill.lastUpdated).toLocaleString('zh-CN')}`,
          );

          if (!exists) {
            console.log(`  ${chalk.yellow('⚠️  文件不存在,可能已被手动删除')}`);
          }
        }
      } else {
        // 简洁模式
        for (const skill of platformSkills) {
          // 根据作用域获取正确的路径
          const platformPath = config.getPlatformPath(
            skill.platform as any,
            skill.scope,
            skill.projectPath,
          );
          const skillPath = path.join(platformPath, skill.name);
          const exists = await checkSkillExists(skillPath);

          const statusIcon = exists ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${statusIcon} ${skill.name}`);
          console.log(`    ${skill.description}`);
          console.log(
            `    安装于: ${new Date(skill.installedAt).toLocaleDateString('zh-CN')}`,
          );
        }
      }
    }

    // 统计信息
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`总计: ${filteredSkills.length} 个 skills`);
    console.log(`平台: ${Object.keys(byPlatform).length} 个`);
  } catch (error) {
    exitWithError(error);
  }
}

/**
 * 检查 skill 目录是否存在
 */
async function checkSkillExists(skillPath: string): Promise<boolean> {
  try {
    await fs.access(skillPath);
    // 检查是否有 SKILL.md
    const skillFile = path.join(skillPath, 'SKILL.md');
    await fs.access(skillFile);
    return true;
  } catch {
    return false;
  }
}
