/**
 * 支持的 AI 平台类型
 */
export type Platform =
  | 'claude-code'
  | 'cursor'
  | 'trae'
  | 'vscode'
  | 'windsurf';

/**
 * Skill 作用域类型
 */
export type SkillScope = 'global' | 'project';

/**
 * Skill 元数据
 */
export interface SkillMetadata {
  name: string;
  platform: Platform;
  scope: SkillScope;  // 新增: global 或 project
  projectPath?: string;  // 新增: 项目路径 (仅 project scope)
  version: string;
  description: string;
  author: string;
  repository: string;
  installedAt: string;
  lastUpdated: string;
  branch: string;
}

/**
 * Skill 配置文件 (SKILL.md frontmatter)
 */
export interface SkillConfig {
  name: string;
  description: string;
  author?: string;
  platforms?: string[];
  dependencies?: string[];
}

/**
 * GitLab 仓库信息
 */
export interface GitLabRepo {
  url: string;
  branch: string;
  path?: string;
}

/**
 * Skill 安装状态
 */
export interface SkillStatus {
  installed: SkillMetadata[];
  outdated: SkillMetadata[];
  errors: Array<{ name: string; error: string }>;
}
