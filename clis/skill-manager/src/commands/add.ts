import fs from 'node:fs/promises';
import path from 'node:path';
import { ConfigManager } from '../lib/config.js';
import { GitLabClient } from '../lib/gitlab.js';
import { logger } from '../lib/logger.js';
import { now } from '../lib/datetime.js';
import { validatePlatform, validateBranch } from '../lib/validation.js';
import { exitWithError } from '../lib/exit-codes.js';
import type { Platform } from '../types/index.js';

interface AddOptions {
  platform: Platform;
  branch: string;
}

export async function add(
  url: string,
  name: string | undefined,
  options: AddOptions,
): Promise<void> {
  const config = new ConfigManager();
  const gitlab = new GitLabClient();

  try {
    logger.title('📦 添加 Skill');

    // 验证参数 (现在会抛出 ValidationError)
    validatePlatform(options.platform);
    validateBranch(options.branch);

    // 解析 Git URL
    const repo = gitlab.parseUrl(url);
    logger.info(`仓库: ${repo.url}`);
    logger.info(`分支: ${repo.branch}`);

    // 克隆到临时目录
    const tempDir = `/tmp/skill-manager-temp-${Date.now()}`;
    logger.start('正在克隆仓库...');
    await gitlab.clone(repo, tempDir);
    logger.succeed('仓库克隆成功');

    // 确定 skill 目录
    const skillDir = repo.path ? path.join(tempDir, repo.path) : tempDir;

    // 读取 skill 配置
    const skillConfig = await gitlab.readSkillConfig(skillDir);

    if (!skillConfig) {
      logger.warn('未找到 SKILL.md,将使用默认配置');
    }

    // 确定 skill 名称
    const skillName = name || skillConfig?.name || path.basename(skillDir);

    // 获取目标平台路径
    const platformPath = config.getPlatformPath(options.platform);
    const targetPath = path.join(platformPath, skillName);

    // 创建平台目录
    await fs.mkdir(platformPath, { recursive: true });

    // 移动 skill 到目标位置
    logger.start(`正在安装到 ${options.platform}...`);
    await fs.cp(skillDir, targetPath, { recursive: true });
    logger.succeed('安装成功');

    // 注册到配置文件
    const metadata = {
      name: skillName,
      platform: options.platform,
      scope: 'global' as const,
      version: '1.0.0',
      description: skillConfig?.description || '从 Git 安装的 skill',
      author: skillConfig?.author || 'Unknown',
      repository: repo.url,
      installedAt: now(),
      lastUpdated: now(),
      branch: repo.branch,
    };

    await config.addSkill(metadata);

    // 清理临时目录
    await fs.rm(tempDir, { recursive: true, force: true });

    logger.success(`\n✓ Skill "${skillName}" 已成功安装到 ${options.platform}`);
    logger.info(`路径: ${targetPath}`);
  } catch (error) {
    exitWithError(error);
  }
}
