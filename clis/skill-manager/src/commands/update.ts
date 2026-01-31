import fs from 'node:fs/promises';
import path from 'node:path';
import * as cliProgress from 'cli-progress';
import { isCI, isTTY } from '../lib/utils.js';
import { ConfigManager } from '../lib/config.js';
import { GitLabClient } from '../lib/gitlab.js';
import { logger } from '../lib/logger.js';
import { now } from '../lib/datetime.js';
import { validatePlatform } from '../lib/validation.js';
import { exitWithError, EXIT_CODES } from '../lib/exit-codes.js';
import type { Platform } from '../types/index.js';

interface UpdateOptions {
  platform: Platform;
  dryRun?: boolean;
}

export async function update(
  name: string | undefined,
  options: UpdateOptions,
): Promise<void> {
  const config = new ConfigManager();
  const gitlab = new GitLabClient();

  // 检查 dry-run 模式
  const isDryRun = options.dryRun || process.env.DRY_RUN === '1';

  try {
    logger.title('🔄 更新 Skills');

    if (isDryRun) {
      logger.warn('[DRY-RUN] 模拟运行模式,不会实际执行操作');
    }

    // 验证平台参数
    validatePlatform(options.platform);

    const skills = await config.getSkills();
    let skillsToUpdate: typeof skills;

    // 筛选要更新的 skills
    if (name) {
      skillsToUpdate = skills.filter(
        (s) => s.name === name && s.platform === options.platform,
      );
      if (skillsToUpdate.length === 0) {
        logger.warn(`未找到 skill "${name}" 在平台 "${options.platform}"`);
        process.exit(EXIT_CODES.CONFIG);
      }
    } else {
      skillsToUpdate = skills.filter((s) => s.platform === options.platform);
    }

    if (skillsToUpdate.length === 0) {
      logger.info('没有需要更新的 skills');
      return;
    }

    logger.info(`准备更新 ${skillsToUpdate.length} 个 skills...\n`);

    // 创建进度条 (仅在 TTY 环境且不是 CI 环境且不是 dry-run 模式)
    const useProgressBar = isTTY() && !isCI() && !isDryRun && skillsToUpdate.length > 1;
    let progressBar: cliProgress.SingleBar | undefined;

    if (useProgressBar) {
      progressBar = new cliProgress.SingleBar({
        format: '更新 [{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      }, cliProgress.Presets.shades_classic);

      progressBar.start(skillsToUpdate.length, 0);
    }

    let successCount = 0;
    let failCount = 0;

    for (const skill of skillsToUpdate) {
      try {
        if (!useProgressBar) {
          logger.start(`正在更新 ${skill.name}...`);
        }

        const platformPath = config.getPlatformPath(skill.platform);
        const skillPath = path.join(platformPath, skill.name);

        // 检查 skill 目录是否存在
        try {
          await fs.access(skillPath);
        } catch {
          if (!useProgressBar) {
            logger.fail(`${skill.name} 目录不存在,跳过`);
          }
          if (progressBar) {
            progressBar.increment();
          }
          failCount++;
          continue;
        }

        if (isDryRun) {
          logger.info(`[DRY-RUN] 将更新 ${skill.name}`);
          logger.info(`[DRY-RUN] git pull ${skill.branch || 'main'}`);
        } else {
          // 更新 git 仓库
          await gitlab.update(skillPath, skill.branch);

          // 更新元数据
          await config.updateSkill(skill.name, skill.platform, {
            lastUpdated: now(),
          });
        }

        if (!useProgressBar) {
          logger.succeed(`${skill.name} 更新成功`);
        }
        if (progressBar) {
          progressBar.increment();
        }
        successCount++;
      } catch (error) {
        if (!useProgressBar) {
          logger.fail(
            `${skill.name} 更新失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (progressBar) {
          progressBar.increment();
        }
        failCount++;
      }
    }

    // 停止进度条
    if (progressBar) {
      progressBar.stop();
    }

    // 显示汇总
    console.log();
    logger.title('更新完成');
    logger.success(`成功: ${successCount} 个`);
    if (failCount > 0) {
      logger.error(`失败: ${failCount} 个`);
      // 如果有失败的更新,使用非零退出码
      process.exit(EXIT_CODES.FAILURE);
    }
  } catch (error) {
    exitWithError(error);
  }
}
