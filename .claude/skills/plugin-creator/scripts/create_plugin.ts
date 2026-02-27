/**
 * 插件模板生成脚本
 * 快速创建标准 Claude Code 插件目录结构
 */

import * as fs from 'fs';
import * as path from 'path';

interface PluginOptions {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  includeSkills?: boolean;
  includeAgents?: boolean;
  includeCommands?: boolean;
  includeHooks?: boolean;
  includeMcp?: boolean;
  includeLsp?: boolean;
  includeSettings?: boolean;
}

/**
 * 创建插件目录结构
 */
export function createPlugin(outputPath: string, options: PluginOptions): void {
  const pluginDir = path.join(outputPath, options.name);

  // 检查目录是否已存在
  if (fs.existsSync(pluginDir)) {
    throw new Error(`目录已存在: ${pluginDir}`);
  }

  // 创建主目录
  fs.mkdirSync(pluginDir, { recursive: true });

  // 1. 创建 plugin.json
  const pluginJsonDir = path.join(pluginDir, '.claude-plugin');
  fs.mkdirSync(pluginJsonDir, { recursive: true });

  const pluginJson = {
    name: options.name,
    version: options.version || '1.0.0',
    description: options.description || `${options.name} 插件`,
    author: options.author || '',
  };

  fs.writeFileSync(
    path.join(pluginJsonDir, 'plugin.json'),
    JSON.stringify(pluginJson, null, 2)
  );

  // 2. 创建 skills 目录
  if (options.includeSkills) {
    const skillsDir = path.join(pluginDir, 'skills', 'example-skill');
    fs.mkdirSync(skillsDir, { recursive: true });

    const skillMd = `---
name: example-skill
description: 示例技能描述。说明何时使用此技能的触发条件和使用场景。
---

# Example Skill

技能的具体指令和使用说明。

## 使用方法

1. 步骤一
2. 步骤二
3. 步骤三

## 示例

\`\`\`typescript
// 示例代码
console.log('Hello from ${options.name}!');
\`\`\`
`;

    fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), skillMd);
  }

  // 3. 创建 agents 目录
  if (options.includeAgents) {
    const agentsDir = path.join(pluginDir, 'agents');
    fs.mkdirSync(agentsDir, { recursive: true });

    const agentMd = `---
name: example-agent
description: 示例代理描述
tools: Read, Write, Edit, Grep, Glob
model: inherit
---

# Example Agent

你是一个专业的示例代理。

## 职责

- 职责一
- 职责二
- 职责三

## 工作流程

1. 分析任务
2. 执行操作
3. 验证结果
`;

    fs.writeFileSync(path.join(agentsDir, 'example-agent.md'), agentMd);
  }

  // 4. 创建 commands 目录
  if (options.includeCommands) {
    const commandsDir = path.join(pluginDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    const commandMd = `# Example Command

这是一个示例命令。

## 使用方法

\`\`\`
/${options.name}:example
\`\`\`

## 功能说明

执行示例命令时，Claude 会按照以下步骤操作：

1. 步骤一
2. 步骤二
3. 步骤三
`;

    fs.writeFileSync(path.join(commandsDir, 'example.md'), commandMd);
  }

  // 5. 创建 hooks 目录
  if (options.includeHooks) {
    const hooksDir = path.join(pluginDir, 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });

    const hooksJson = {
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash',
            hooks: ['echo "即将执行命令"'],
          },
        ],
        PostToolUse: [
          {
            matcher: 'Write',
            hooks: ['echo "文件已写入"'],
          },
        ],
      },
    };

    fs.writeFileSync(
      path.join(hooksDir, 'hooks.json'),
      JSON.stringify(hooksJson, null, 2)
    );
  }

  // 6. 创建 .mcp.json
  if (options.includeMcp) {
    const mcpJson = {
      mcpServers: {
        'example-server': {
          command: 'node',
          args: ['./server.js'],
          env: {
            API_KEY: 'your-api-key',
          },
        },
      },
    };

    fs.writeFileSync(
      path.join(pluginDir, '.mcp.json'),
      JSON.stringify(mcpJson, null, 2)
    );
  }

  // 7. 创建 .lsp.json
  if (options.includeLsp) {
    const lspJson = {
      typescript: {
        command: 'typescript-language-server',
        args: ['--stdio'],
        extensionToLanguage: {
          '.ts': 'typescript',
          '.tsx': 'typescriptreact',
        },
      },
    };

    fs.writeFileSync(
      path.join(pluginDir, '.lsp.json'),
      JSON.stringify(lspJson, null, 2)
    );
  }

  // 8. 创建 settings.json
  if (options.includeSettings) {
    const settingsJson = {
      // 默认设置
    };

    fs.writeFileSync(
      path.join(pluginDir, 'settings.json'),
      JSON.stringify(settingsJson, null, 2)
    );
  }

  // 9. 创建 README.md
  const readme = `# ${options.name}

${options.description || `${options.name} 插件`}

## 安装

\`\`\`bash
claude /plugin install <plugin-path>
\`\`\`

## 组件

${options.includeSkills ? `### Skills\n- \`example-skill\`: 示例技能描述\n\n` : ''}${options.includeAgents ? `### Agents\n- \`example-agent\`: 示例代理描述\n\n` : ''}${options.includeCommands ? `### Commands\n- \`/${options.name}:example\`: 示例命令\n\n` : ''}${options.includeHooks ? `### Hooks\n- PreToolUse: Bash 命令执行前\n- PostToolUse: Write 文件写入后\n\n` : ''}${options.includeMcp ? `### MCP\n- \`example-server\`: 示例 MCP 服务器\n\n` : ''}
## 使用示例

\`\`\`
/${options.name}:example
\`\`\`

## 配置

参见各配置文件了解详细配置选项。

## 版本历史

- \`1.0.0\` - 初始版本
`;

  fs.writeFileSync(path.join(pluginDir, 'README.md'), readme);

  console.log(`✅ 插件已创建: ${pluginDir}`);
  console.log('\n目录结构:');
  printTree(pluginDir, '', true);
}

/**
 * 打印目录树
 */
function printTree(dir: string, prefix: string, isLast: boolean): void {
  const name = path.basename(dir);
  const stats = fs.statSync(dir);

  if (stats.isDirectory()) {
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${name}/`);

    const children = fs.readdirSync(dir);
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    children.forEach((child, index) => {
      const childPath = path.join(dir, child);
      const childIsLast = index === children.length - 1;
      printTree(childPath, newPrefix, childIsLast);
    });
  } else {
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${name}`);
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('用法: npx ts-node create_plugin.ts <output-path> <plugin-name> [options]');
    console.log('');
    console.log('选项:');
    console.log('  --description <desc>  插件描述');
    console.log('  --author <name>       作者名称');
    console.log('  --with-skills         包含示例技能');
    console.log('  --with-agents         包含示例代理');
    console.log('  --with-commands       包含示例命令');
    console.log('  --with-hooks          包含示例钩子');
    console.log('  --with-mcp            包含 MCP 配置');
    console.log('  --with-lsp            包含 LSP 配置');
    console.log('  --with-settings       包含设置文件');
    console.log('  --full                包含所有组件');
    console.log('');
    console.log('示例:');
    console.log('  npx ts-node create_plugin.ts ./plugins my-plugin --full');
    console.log('  npx ts-node create_plugin.ts ./plugins my-plugin --with-skills --with-commands');
    process.exit(1);
  }

  const outputPath = args[0];
  const pluginName = args[1];

  const options: PluginOptions = {
    name: pluginName,
  };

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--description':
        options.description = args[++i];
        break;
      case '--author':
        options.author = args[++i];
        break;
      case '--with-skills':
        options.includeSkills = true;
        break;
      case '--with-agents':
        options.includeAgents = true;
        break;
      case '--with-commands':
        options.includeCommands = true;
        break;
      case '--with-hooks':
        options.includeHooks = true;
        break;
      case '--with-mcp':
        options.includeMcp = true;
        break;
      case '--with-lsp':
        options.includeLsp = true;
        break;
      case '--with-settings':
        options.includeSettings = true;
        break;
      case '--full':
        options.includeSkills = true;
        options.includeAgents = true;
        options.includeCommands = true;
        options.includeHooks = true;
        options.includeMcp = true;
        options.includeLsp = true;
        options.includeSettings = true;
        break;
    }
  }

  try {
    createPlugin(outputPath, options);
  } catch (error) {
    console.error(`❌ 错误: ${(error as Error).message}`);
    process.exit(1);
  }
}
