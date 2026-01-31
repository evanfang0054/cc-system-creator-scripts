import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { now } from './datetime.js';
import { ConfigError } from './errors.js';
import type { Platform, SkillMetadata } from '../types/index.js';

/**
 * 配置管理类
 */
export class ConfigManager {
  private configDir: string;
  private registryFile: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.skill-manager');
    this.registryFile = path.join(this.configDir, 'registry.json');
  }

  /**
   * 初始化配置目录
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true });

      const registryExists = await fs
        .access(this.registryFile)
        .then(() => true)
        .catch(() => false);

      if (!registryExists) {
        await fs.writeFile(
          this.registryFile,
          JSON.stringify({ skills: [] }, null, 2),
        );
      }
    } catch (error) {
      console.error('初始化配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取已安装的 skills 列表
   */
  async getSkills(): Promise<SkillMetadata[]> {
    await this.init();

    try {
      const content = await fs.readFile(this.registryFile, 'utf-8');
      const data = JSON.parse(content);
      return data.skills || [];
    } catch (error) {
      // 捕获 JSON 解析错误
      if (error instanceof SyntaxError) {
        throw new ConfigError(
          `注册表文件损坏: ${this.registryFile}\n错误: ${error.message}`,
          [
            '删除损坏的文件: rm ~/.skill-manager/registry.json',
            '重新运行命令以创建新的注册表',
            '如果有备份，恢复备份文件: cp ~/.skill-manager/registry.json.backup ~/.skill-manager/registry.json',
          ]
        );
      }
      // 其他错误继续抛出
      throw error;
    }
  }

  /**
   * 添加 skill 到注册表
   */
  async addSkill(skill: SkillMetadata): Promise<void> {
    await this.init();
    const skills = await this.getSkills();

    // 检查是否已存在
    const exists = skills.some(
      (s) => s.name === skill.name && s.platform === skill.platform,
    );
    if (exists) {
      throw new Error(`Skill "${skill.name}" 已安装在平台 "${skill.platform}"`);
    }

    skills.push(skill);
    await this.saveSkills(skills);
  }

  /**
   * 更新 skill 信息
   */
  async updateSkill(
    name: string,
    platform: Platform,
    updates: Partial<SkillMetadata>,
  ): Promise<void> {
    const skills = await this.getSkills();
    const index = skills.findIndex(
      (s) => s.name === name && s.platform === platform,
    );

    if (index === -1) {
      throw new Error(`Skill "${name}" 未找到`);
    }

    skills[index] = {
      ...skills[index],
      ...updates,
      lastUpdated: now(),
    };
    await this.saveSkills(skills);
  }

  /**
   * 删除 skill
   */
  async removeSkill(name: string, platform: Platform): Promise<void> {
    const skills = await this.getSkills();
    const filtered = skills.filter(
      (s) => !(s.name === name && s.platform === platform),
    );

    if (filtered.length === skills.length) {
      throw new Error(`Skill "${name}" 未找到`);
    }

    await this.saveSkills(filtered);
  }

  /**
   * 获取平台的 skill 安装路径
   */
  getPlatformPath(platform: Platform, scope: 'global' | 'project' = 'global', projectPath?: string): string {
    const globalPaths: Record<Platform, string> = {
      'claude-code': path.join(os.homedir(), '.claude', 'skills'),
      cursor: path.join(os.homedir(), '.cursor', 'skills'),
      trae: path.join(os.homedir(), '.trae', 'skills'),
      vscode: path.join(os.homedir(), '.vscode', 'skills'),
      windsurf: path.join(os.homedir(), '.windsurf', 'skills'),
    };

    // 项目级别的路径
    if (scope === 'project' && projectPath) {
      const projectPaths: Record<Platform, string> = {
        'claude-code': path.join(projectPath, '.claude', 'skills'),
        cursor: path.join(projectPath, '.cursor', 'skills'),
        trae: path.join(projectPath, '.trae', 'skills'),
        vscode: path.join(projectPath, '.vscode', 'skills'),
        windsurf: path.join(projectPath, '.windsurf', 'skills'),
      };
      return projectPaths[platform] || projectPaths['claude-code'];
    }

    return globalPaths[platform] || globalPaths['claude-code'];
  }

  /**
   * 获取当前项目路径
   */
  async getCurrentProjectPath(): Promise<string | null> {
    // 尝试查找项目根目录 (包含 .git、package.json 等)
    try {
      const currentDir = process.cwd();

      // 检查是否是项目根目录
      const gitDir = path.join(currentDir, '.git');
      const packageJson = path.join(currentDir, 'package.json');
      const claudeDir = path.join(currentDir, '.claude');

      const isProjectRoot = await Promise.all([
        fs.access(gitDir).then(() => true).catch(() => false),
        fs.access(packageJson).then(() => true).catch(() => false),
        fs.access(claudeDir).then(() => true).catch(() => false),
      ]);

      if (isProjectRoot.some((exists) => exists)) {
        return currentDir;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 保存 skills 列表
   */
  private async saveSkills(skills: SkillMetadata[]): Promise<void> {
    await fs.writeFile(this.registryFile, JSON.stringify({ skills }, null, 2));
  }
}
