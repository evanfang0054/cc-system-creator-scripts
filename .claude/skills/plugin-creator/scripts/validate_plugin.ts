/**
 * 插件验证脚本
 * 用于检查 Claude Code 插件结构的完整性
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  components: {
    skills: string[];
    agents: string[];
    commands: string[];
    hooks: boolean;
    mcp: boolean;
    lsp: boolean;
    settings: boolean;
  };
}

/**
 * 验证插件目录结构
 */
export function validatePlugin(pluginPath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    components: {
      skills: [],
      agents: [],
      commands: [],
      hooks: false,
      mcp: false,
      lsp: false,
      settings: false,
    },
  };

  // 检查目录是否存在
  if (!fs.existsSync(pluginPath)) {
    result.valid = false;
    result.errors.push(`插件目录不存在: ${pluginPath}`);
    return result;
  }

  // 1. 检查 plugin.json
  const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    try {
      const content = fs.readFileSync(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      if (!pluginJson.name) {
        result.errors.push('plugin.json 缺少 name 字段');
        result.valid = false;
      }
      if (!pluginJson.version) {
        result.warnings.push('plugin.json 建议包含 version 字段');
      }
      if (!pluginJson.description) {
        result.warnings.push('plugin.json 建议包含 description 字段');
      }
    } catch (e) {
      result.errors.push(`plugin.json 解析失败: ${(e as Error).message}`);
      result.valid = false;
    }
  } else {
    result.warnings.push('未找到 .claude-plugin/plugin.json（可选但推荐）');
  }

  // 2. 检查 skills
  const skillsPath = path.join(pluginPath, 'skills');
  if (fs.existsSync(skillsPath)) {
    const skillDirs = fs.readdirSync(skillsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const skillName of skillDirs) {
      const skillMdPath = path.join(skillsPath, skillName, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        const content = fs.readFileSync(skillMdPath, 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (!frontmatterMatch) {
          result.errors.push(`skills/${skillName}/SKILL.md 缺少 frontmatter`);
          result.valid = false;
        } else {
          const frontmatter = frontmatterMatch[1];
          if (!frontmatter.includes('name:')) {
            result.errors.push(`skills/${skillName}/SKILL.md frontmatter 缺少 name 字段`);
            result.valid = false;
          }
          if (!frontmatter.includes('description:')) {
            result.errors.push(`skills/${skillName}/SKILL.md frontmatter 缺少 description 字段`);
            result.valid = false;
          }
        }
        result.components.skills.push(skillName);
      } else {
        result.warnings.push(`skills/${skillName} 目录缺少 SKILL.md 文件`);
      }
    }
  }

  // 3. 检查 agents
  const agentsPath = path.join(pluginPath, 'agents');
  if (fs.existsSync(agentsPath)) {
    const agentFiles = fs.readdirSync(agentsPath)
      .filter(file => file.endsWith('.md'));

    for (const agentFile of agentFiles) {
      const agentPath = path.join(agentsPath, agentFile);
      const content = fs.readFileSync(agentPath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        result.errors.push(`agents/${agentFile} 缺少 frontmatter`);
        result.valid = false;
      } else {
        const frontmatter = frontmatterMatch[1];
        if (!frontmatter.includes('name:')) {
          result.errors.push(`agents/${agentFile} frontmatter 缺少 name 字段`);
          result.valid = false;
        }
        if (!frontmatter.includes('description:')) {
          result.errors.push(`agents/${agentFile} frontmatter 缺少 description 字段`);
          result.valid = false;
        }
      }
      result.components.agents.push(agentFile.replace('.md', ''));
    }
  }

  // 4. 检查 commands
  const commandsPath = path.join(pluginPath, 'commands');
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.md'));

    for (const commandFile of commandFiles) {
      result.components.commands.push(commandFile.replace('.md', ''));
    }
  }

  // 5. 检查 hooks
  const hooksPath = path.join(pluginPath, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksPath)) {
    try {
      const content = fs.readFileSync(hooksPath, 'utf-8');
      const hooksJson = JSON.parse(content);

      if (!hooksJson.hooks) {
        result.warnings.push('hooks/hooks.json 建议包含 hooks 字段');
      }
      result.components.hooks = true;
    } catch (e) {
      result.errors.push(`hooks/hooks.json 解析失败: ${(e as Error).message}`);
      result.valid = false;
    }
  }

  // 6. 检查 MCP 配置
  const mcpPath = path.join(pluginPath, '.mcp.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const content = fs.readFileSync(mcpPath, 'utf-8');
      const mcpJson = JSON.parse(content);

      if (!mcpJson.mcpServers || Object.keys(mcpJson.mcpServers).length === 0) {
        result.warnings.push('.mcp.json 建议包含 mcpServers 配置');
      }
      result.components.mcp = true;
    } catch (e) {
      result.errors.push(`.mcp.json 解析失败: ${(e as Error).message}`);
      result.valid = false;
    }
  }

  // 7. 检查 LSP 配置
  const lspPath = path.join(pluginPath, '.lsp.json');
  if (fs.existsSync(lspPath)) {
    try {
      fs.readFileSync(lspPath, 'utf-8');
      JSON.parse(fs.readFileSync(lspPath, 'utf-8'));
      result.components.lsp = true;
    } catch (e) {
      result.errors.push(`.lsp.json 解析失败: ${(e as Error).message}`);
      result.valid = false;
    }
  }

  // 8. 检查 settings
  const settingsPath = path.join(pluginPath, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      fs.readFileSync(settingsPath, 'utf-8');
      JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      result.components.settings = true;
    } catch (e) {
      result.errors.push(`settings.json 解析失败: ${(e as Error).message}`);
      result.valid = false;
    }
  }

  // 9. 检查 README
  const readmePath = path.join(pluginPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    result.warnings.push('建议添加 README.md 文档');
  }

  return result;
}

/**
 * 打印验证结果
 */
export function printValidationResult(result: ValidationResult): void {
  console.log('\n=== 插件验证结果 ===\n');

  if (result.valid) {
    console.log('✅ 插件结构有效\n');
  } else {
    console.log('❌ 插件结构存在问题\n');
  }

  if (result.errors.length > 0) {
    console.log('错误:');
    result.errors.forEach(err => console.log(`  ❌ ${err}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('警告:');
    result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
    console.log('');
  }

  console.log('组件统计:');
  console.log(`  📦 Skills: ${result.components.skills.length > 0 ? result.components.skills.join(', ') : '无'}`);
  console.log(`  🤖 Agents: ${result.components.agents.length > 0 ? result.components.agents.join(', ') : '无'}`);
  console.log(`  ⚡ Commands: ${result.components.commands.length > 0 ? result.components.commands.join(', ') : '无'}`);
  console.log(`  🪝 Hooks: ${result.components.hooks ? '已配置' : '未配置'}`);
  console.log(`  🔌 MCP: ${result.components.mcp ? '已配置' : '未配置'}`);
  console.log(`  📝 LSP: ${result.components.lsp ? '已配置' : '未配置'}`);
  console.log(`  ⚙️  Settings: ${result.components.settings ? '已配置' : '未配置'}`);
}

// CLI 入口
if (require.main === module) {
  const pluginPath = process.argv[2];

  if (!pluginPath) {
    console.error('用法: npx ts-node validate_plugin.ts <plugin-path>');
    process.exit(1);
  }

  const result = validatePlugin(pluginPath);
  printValidationResult(result);

  process.exit(result.valid ? 0 : 1);
}
