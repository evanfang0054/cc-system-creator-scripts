import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { ConfigManager } from '../lib/config.js';
import { GitLabClient } from '../lib/gitlab.js';
import { logger } from '../lib/logger.js';
import { now } from '../lib/datetime.js';
import { validatePlatform, validateScope } from '../lib/validation.js';
import { exitWithError } from '../lib/exit-codes.js';
import type { Platform } from '../types/index.js';

interface ScanOptions {
  platform: string;
  register: boolean;
  scope?: 'global' | 'project' | 'all';
}

export async function scan(options: ScanOptions): Promise<void> {
  const config = new ConfigManager();
  const gitlab = new GitLabClient();

  try {
    logger.title('🔍 扫描已安装的 Skills');

    // 验证参数
    if (options.platform) {
      validatePlatform(options.platform);
    }

    if (options.scope && options.scope !== 'all') {
      validateScope(options.scope);
    }

    const platformsToScan: Platform[] = options.platform
      ? ([validatePlatform(options.platform)] as Platform[])
      : (['claude-code', 'cursor', 'trae', 'vscode', 'windsurf'] as Platform[]);

    const discoveredSkills: Array<{
      platform: Platform;
      name: string;
      path: string;
      scope: 'global' | 'project';
      projectPath?: string;
      config: any;
      registered: boolean;
    }> = [];

    // 获取当前项目路径
    const currentProjectPath = await config.getCurrentProjectPath();
    if (currentProjectPath) {
      logger.info(`当前项目: ${currentProjectPath}`);
    }

    // 扫描全局 skills
    if (options.scope === 'global' || options.scope === 'all' || !options.scope) {
      logger.info('\n扫描全局 skills...');
      for (const platform of platformsToScan) {
        const platformPath = config.getPlatformPath(platform, 'global');

        try {
          await fs.access(platformPath);
        } catch {
          continue;
        }

        await scanDirectory(platformPath, platform, 'global', undefined, discoveredSkills, gitlab, config);
      }
    }

    // 扫描项目 skills
    if ((options.scope === 'project' || options.scope === 'all' || !options.scope) && currentProjectPath) {
      logger.info('\n扫描项目 skills...');
      for (const platform of platformsToScan) {
        const platformPath = config.getPlatformPath(platform, 'project', currentProjectPath);

        try {
          await fs.access(platformPath);
        } catch {
          continue;
        }

        await scanDirectory(platformPath, platform, 'project', currentProjectPath, discoveredSkills, gitlab, config);
      }
    }

    // 显示扫描结果
    if (discoveredSkills.length === 0) {
      logger.info('未发现任何 skills');
      return;
    }

    console.log(
      `\n${chalk.bold(`发现 ${discoveredSkills.length} 个 skills:`)}`,
    );
    console.log('─'.repeat(60));

    let unregisteredCount = 0;

    for (const skill of discoveredSkills) {
      const status = skill.registered
        ? chalk.green('✓ 已注册')
        : chalk.yellow('✗ 未注册');
      const platformLabel = chalk.bold(skill.platform.toUpperCase());
      const scopeLabel = skill.scope === 'global' ? '全局' : '项目';

      console.log(`\n${status} ${platformLabel}/${skill.name} (${scopeLabel})`);
      console.log(`  路径: ${skill.path}`);
      console.log(`  描述: ${skill.config.description || '无描述'}`);

      if (skill.config.author) {
        console.log(`  作者: ${skill.config.author}`);
      }

      if (!skill.registered) {
        unregisteredCount++;
      }
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`总计: ${discoveredSkills.length} 个 skills`);
    console.log(`未注册: ${unregisteredCount} 个`);

    // 询问是否注册未注册的 skills
    if (unregisteredCount > 0 && options.register) {
      console.log(`\n${chalk.yellow('⚠️  发现未注册的 skills')}`);

      const unregisteredSkills = discoveredSkills.filter((s) => !s.registered);
      let successCount = 0;

      for (const skill of unregisteredSkills) {
        try {
          logger.info(`注册 ${skill.platform}/${skill.name}...`);

          const metadata = {
            name: skill.name,
            platform: skill.platform,
            scope: skill.scope,
            projectPath: skill.projectPath,
            version: '1.0.0',
            description: skill.config.description || '手动安装的 skill',
            author: skill.config.author || 'Unknown',
            repository: 'manual',
            installedAt: now(),
            lastUpdated: now(),
            branch: 'main',
          };

          await config.addSkill(metadata);
          logger.success(`${skill.name} 注册成功`);
          successCount++;
        } catch (error) {
          logger.error(
            `${skill.name} 注册失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // 显示注册汇总
      console.log();
      logger.success(`✓ 已成功注册 ${successCount}/${unregisteredSkills.length} 个 skills`);
      if (successCount < unregisteredSkills.length) {
        logger.warn(`⚠️  ${unregisteredSkills.length - successCount} 个 skills 注册失败`);
      }
    } else if (unregisteredCount > 0 && !options.register) {
      console.log(
        `\n${chalk.blue('💡 提示: 使用 --register 选项自动注册未注册的 skills')}`,
      );
      console.log('$ skill-manager scan --register');
    }
  } catch (error) {
    exitWithError(error);
  }
}

/**
 * 扫描目录中的 skills
 */
async function scanDirectory(
  dirPath: string,
  platform: Platform,
  scope: 'global' | 'project',
  projectPath: string | undefined,
  discoveredSkills: any[],
  gitlab: GitLabClient,
  config: ConfigManager,
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(dirPath, entry.name);
      const skillFile = path.join(skillPath, 'SKILL.md');

      // 检查是否有 SKILL.md
      try {
        await fs.access(skillFile);

        // 读取 skill 配置
        const skillConfig = await gitlab.readSkillConfig(skillPath);

        if (!skillConfig) {
          logger.warn(`跳过 ${entry.name}: 无法解析 SKILL.md`);
          continue;
        }

        // 检查是否已在注册表中
        const registeredSkills = await config.getSkills();
        const isRegistered = registeredSkills.some(
          (s) => s.name === entry.name &&
               s.platform === platform &&
               s.scope === scope &&
               (scope === 'global' || s.projectPath === projectPath),
        );

        discoveredSkills.push({
          platform,
          name: entry.name,
          path: skillPath,
          scope,
          projectPath,
          config: skillConfig,
          registered: isRegistered,
        });
      } catch {
        // 没有 SKILL.md,跳过
      }
    }
  } catch (error) {
    logger.error(`扫描目录失败 ${dirPath}: ${error}`);
  }
}
