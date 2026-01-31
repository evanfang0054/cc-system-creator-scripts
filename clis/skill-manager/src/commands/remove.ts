import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { ConfigManager } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { validatePlatform } from '../lib/validation.js';
import { exitWithError } from '../lib/exit-codes.js';
import type { Platform } from '../types/index.js';

interface RemoveOptions {
  platform: Platform;
}

export async function remove(
  name: string,
  options: RemoveOptions,
): Promise<void> {
  const config = new ConfigManager();

  try {
    logger.title('🗑️  删除 Skill');

    // 验证平台参数
    validatePlatform(options.platform);

    // 查找 skill
    const skills = await config.getSkills();
    const skill = skills.find(
      (s) => s.name === name && s.platform === options.platform,
    );

    if (!skill) {
      logger.warn(`未找到 skill "${name}" 在平台 "${options.platform}"`);
      return;
    }

    // 确认删除
    console.log('\n将要删除的 skill:');
    console.log(`  名称: ${chalk.bold(skill.name)}`);
    console.log(`  平台: ${skill.platform}`);
    console.log(`  描述: ${skill.description}`);

    // TODO: 添加交互式确认
    // 这里简化处理,直接删除

    // 删除文件 (根据作用域获取正确的路径)
    const platformPath = config.getPlatformPath(
      skill.platform,
      skill.scope,
      skill.projectPath,
    );
    const skillPath = path.join(platformPath, skill.name);

    logger.start('正在删除文件...');
    try {
      await fs.rm(skillPath, { recursive: true, force: true });
      logger.succeed('文件删除成功');
    } catch (error) {
      logger.warn(
        `文件删除失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // 从注册表移除
    await config.removeSkill(name, options.platform);

    logger.success(`\n✓ Skill "${name}" 已成功删除`);
  } catch (error) {
    exitWithError(error);
  }
}
