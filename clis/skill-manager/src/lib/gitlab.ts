import fs from 'node:fs/promises';
import path from 'node:path';
import simpleGit, { type SimpleGit } from 'simple-git';
import type { GitLabRepo, SkillConfig } from '../types/index.js';
import { GitError } from './errors.js';

/**
 * GitLab 操作类
 */
export class GitLabClient {
  /**
   * 解析 GitLab URL
   */
  parseUrl(url: string): GitLabRepo {
    // 支持 https://gitlab.com/group/project.git
    // 支持 git@gitlab.com:group/project.git
    // 支持 https://gitlab.com/group/project/tree/main/path/to/skill

    let cleanUrl = url.replace(/\.git$/, '');
    let branch = 'main';
    let skillPath = '';

    // 解析路径和分支
    if (cleanUrl.includes('/tree/')) {
      const parts = cleanUrl.split('/tree/');
      cleanUrl = parts[0];
      const remaining = parts[1].split('/');
      branch = remaining[0];
      skillPath = remaining.slice(1).join('/');
    } else if (cleanUrl.includes('/blob/')) {
      const parts = cleanUrl.split('/blob/');
      cleanUrl = parts[0];
      const remaining = parts[1].split('/');
      branch = remaining[0];
      skillPath = remaining.slice(1, -1).join('/'); // 移除文件名
    }

    return {
      url: cleanUrl,
      branch,
      path: skillPath || undefined,
    };
  }

  /**
   * 克隆 GitLab 仓库
   */
  async clone(repo: GitLabRepo, targetPath: string): Promise<void> {
    const { url, branch } = repo;

    try {
      // 检查目标目录是否存在
      await fs.access(targetPath);

      // 如果存在,先删除
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch {
      // 目录不存在,继续
    }

    const cloneUrl = url.startsWith('http') ? url : `https://${url}`;
    const git: SimpleGit = simpleGit();

    try {
      await git.clone(cloneUrl, targetPath, ['--depth', '1', '--branch', branch]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new GitError(
        `克隆仓库失败: ${errorMessage}`,
        [
          '检查URL格式是否正确',
          '确认仓库是否存在',
          '确认你有访问权限',
          '尝试使用完整的HTTPS URL: https://gitlab.com/group/repo',
          '检查网络连接是否正常',
        ]
      );
    }
  }

  /**
   * 更新已克隆的仓库
   */
  async update(repoPath: string, branch = 'main'): Promise<void> {
    const git: SimpleGit = simpleGit(repoPath);
    try {
      await git.pull('origin', branch);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new GitError(
        `更新仓库失败: ${errorMessage}`,
        [
          '检查网络连接是否正常',
          '确认仓库地址是否正确',
          '检查本地文件是否被修改或删除',
          '尝试手动解决冲突: cd <skill-path> && git pull',
        ]
      );
    }
  }

  /**
   * 读取 skill 配置 (SKILL.md)
   */
  async readSkillConfig(skillPath: string): Promise<SkillConfig | null> {
    const skillFilePath = path.join(skillPath, 'SKILL.md');

    try {
      const content = await fs.readFile(skillFilePath, 'utf-8');

      // 解析 frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!frontmatterMatch) {
        return null;
      }

      const frontmatter = frontmatterMatch[1];
      const config: Record<string, unknown> = {};

      // 简单的 YAML 解析 (支持 key: value 格式)
      for (const line of frontmatter.split('\n')) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          config[key.trim()] = value;
        }
      }

      return {
        name: (config.name as string) || '',
        description: (config.description as string) || '',
        author: (config.author as string) || undefined,
        platforms: config.platforms
          ? (config.platforms as string[])
          : undefined,
        dependencies: config.dependencies
          ? (config.dependencies as string[])
          : undefined,
      };
    } catch (error) {
      console.error('读取 SKILL.md 失败:', error);
      return null;
    }
  }

  /**
   * 获取最新版本
   */
  async getLatestCommit(skillPath: string): Promise<string> {
    const git: SimpleGit = simpleGit(skillPath);
    try {
      const log = await git.log({ maxCount: 1 });
      return log.latest?.hash || '';
    } catch (error) {
      throw new Error(`获取提交信息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 在 GitLab 仓库中搜索 skills
   */
  async searchSkills(repoUrl: string, keyword: string): Promise<string[]> {
    try {
      const repo = this.parseUrl(repoUrl);
      const tempDir = `/tmp/skill-manager-search-${Date.now()}`;

      await this.clone(repo, tempDir);

      const searchPath = repo.path ? path.join(tempDir, repo.path) : tempDir;
      const results: string[] = [];

      // 递归搜索 SKILL.md 文件
      async function searchDir(dir: string, baseDir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await searchDir(fullPath, baseDir);
          } else if (entry.name === 'SKILL.md') {
            const relativePath = path.relative(baseDir, fullPath);
            const skillDir = path.dirname(relativePath);

            // 读取并检查是否匹配关键词
            const content = await fs.readFile(fullPath, 'utf-8');
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
              results.push(skillDir);
            }
          }
        }
      }

      await searchDir(searchPath, tempDir);

      // 清理临时目录
      await fs.rm(tempDir, { recursive: true, force: true });

      return results;
    } catch (error) {
      console.error('搜索失败:', error);
      return [];
    }
  }
}
