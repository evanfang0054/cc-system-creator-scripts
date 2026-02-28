/**
 * Shell 自动补全生成器
 *
 * 生成 Bash、Zsh、Fish 等 Shell 的自动补全脚本
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * 补全配置
 */
export interface CompletionConfig {
  name: string;
  version: string;
  commands: string[];
  options: Array<{
    flags: string;
    description: string;
    global?: boolean;
  }>;
}

/**
 * 生成 Bash 自动补全脚本
 */
export function generateBashCompletion(config: CompletionConfig): string {
  const commands = config.commands.join(' ');
  const globalOptions = config.options
    .filter(opt => opt.global)
    .map(opt => opt.flags)
    .join(' ');

  return `#!/bin/bash

# Bash 自动补全脚本 for ${config.name}
#
# 安装方法:
#   1. 将此脚本添加到 ~/.bash_completion.d/ 或 ~/.bashrc
#   2. 或运行: ${config.name} completion >> ~/.bashrc
#   3. 重新加载配置: source ~/.bashrc

_${config.name}() {
    local cur prev words cword
    _init_completion || return

    case \${prev} in
        ${config.name})
            COMPREPLY=($(compgen -W "${commands} ${globalOptions} help completion" -- "\${cur}"))
            ;;
        add)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "\${cur}"))
            ;;
        update)
            COMPREPLY=($(compgen -W "--scope --verbose --help" -- "\${cur}"))
            ;;
        check)
            COMPREPLY=($(compgen -W "--scope --json --verbose --help" -- "\${cur}"))
            ;;
        remove)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "\${cur}"))
            ;;
        scan)
            COMPREPLY=($(compgen -W "--scope --register --verbose --help" -- "\${cur}"))
            ;;
        search)
            COMPREPLY=($(compgen -W "--scope --type --verbose --help" -- "\${cur}"))
            ;;
        --scope)
            COMPREPLY=($(compgen -W "global project all" -- "\${cur}"))
            ;;
        --type)
            COMPREPLY=($(compgen -W "cli tool framework library" -- "\${cur}"))
            ;;
        *)
            ;;
    esac
}

complete -F _${config.name} ${config.name}
`;
}

/**
 * 生成 Zsh 自动补全脚本
 */
export function generateZshCompletion(config: CompletionConfig): string {
  return `#compdef ${config.name}

# Zsh 自动补全脚本 for ${config.name}
#
# 安装方法:
#   1. 将此脚本复制到 ~/.zsh/completion/
#   2. 或添加到 fpath: fpath=(~/.zsh/completion \$fpath)
#   3. 重新加载: autoload -U compinit && compinit

_${config.name}() {
    local -a commands
    commands=(
${config.commands.map(cmd => `        '${cmd}:${cmd}命令'`).join('\n')}
    )

    if (( CURRENT == 2 )); then
        _describe 'command' commands
    else
        case \${words[2]} in
            add)
                _arguments -C \\
                    '--force[强制覆盖]' \\
                    '--verbose[详细输出]' \\
                    ':项目名:'
                ;;
            update)
                _arguments -C \\
                    '--scope[作用域:(global project)]' \\
                    '--verbose[详细输出]' \\
                    '::项目名:'
                ;;
            check)
                _arguments -C \\
                    '--scope[作用域:(global project)]' \\
                    '--json[JSON格式输出]' \\
                    '--verbose[详细输出]' \\
                    '::项目名:'
                ;;
            remove)
                _arguments -C \\
                    '--force[强制删除]' \\
                    '--verbose[详细输出]' \\
                    ':项目名:'
                ;;
            scan)
                _arguments -C \\
                    '--scope[作用域:(global project all)]' \\
                    '--register[自动注册]' \\
                    '--verbose[详细输出]'
                ;;
            search)
                _arguments -C \\
                    '--scope[作用域:(global project)]' \\
                    '--type[类型]' \\
                    '--verbose[详细输出]' \\
                    ':关键词:'
                ;;
        esac
    fi
}

_${config.name} "$@"
`;
}

/**
 * 生成 Fish 自动补全脚本
 */
export function generateFishCompletion(config: CompletionConfig): string {
  return `# Fish 自动补全脚本 for ${config.name}
#
# 安装方法:
#   1. 将此脚本复制到 ~/.config/fish/completions/${config.name}.fish
#   2. 重新启动 Fish 或重新加载: source ~/.config/fish/completions/${config.name}.fish

complete -c ${config.name} -f

complete -c ${config.name} -n '__fish_use_subcommand' -a add -d '添加项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a update -d '更新项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a check -d '查看项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a remove -d '删除项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a scan -d '扫描项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a search -d '搜索项目'
complete -c ${config.name} -n '__fish_use_subcommand' -a help -d '显示帮助'
complete -c ${config.name} -n '__fish_use_subcommand' -a completion -d '生成补全脚本'

# Add 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from add' -l force -d '强制覆盖'
complete -c ${config.name} -n '__fish_seen_subcommand_from add' -l verbose -d '详细输出'

# Update 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from update' -l scope -d '作用域' -xa 'global project'
complete -c ${config.name} -n '__fish_seen_subcommand_from update' -l verbose -d '详细输出'

# Check 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from check' -l scope -d '作用域' -xa 'global project'
complete -c ${config.name} -n '__fish_seen_subcommand_from check' -l json -d 'JSON 格式输出'
complete -c ${config.name} -n '__fish_seen_subcommand_from check' -l verbose -d '详细输出'

# Remove 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from remove' -l force -d '强制删除'
complete -c ${config.name} -n '__fish_seen_subcommand_from remove' -l verbose -d '详细输出'

# Scan 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from scan' -l scope -d '作用域' -xa 'global project all'
complete -c ${config.name} -n '__fish_seen_subcommand_from scan' -l register -d '自动注册'
complete -c ${config.name} -n '__fish_seen_subcommand_from scan' -l verbose -d '详细输出'

# Search 命令选项
complete -c ${config.name} -n '__fish_seen_subcommand_from search' -l scope -d '作用域' -xa 'global project'
complete -c ${config.name} -n '__fish_seen_subcommand_from search' -l type -d '类型' -xa 'cli tool framework library'
complete -c ${config.name} -n '__fish_seen_subcommand_from search' -l verbose -d '详细输出'
`;
}

/**
 * 生成交互式补全脚本
 */
export function generateInteractiveScript(config: CompletionConfig): string {
  return `#!/bin/bash

# ${config.name} 自动补全安装脚本

SHELL_TYPE=\$(basename \$SHELL)
COMPLETION_DIR=""
SCRIPT_NAME=""

# 检测 Shell 类型并设置补全目录
case "\$SHELL_TYPE" in
    bash)
        if [ -d "\$HOME/.bash_completion.d" ]; then
            COMPLETION_DIR="\$HOME/.bash_completion.d"
        else
            COMPLETION_DIR="\$HOME"
        fi
        SCRIPT_NAME="${config.name}.bash"
        ;;
    zsh)
        COMPLETION_DIR="\$HOME/.zsh/completion"
        mkdir -p "\$COMPLETION_DIR" 2>/dev/null
        SCRIPT_NAME="_${config.name}"
        ;;
    fish)
        COMPLETION_DIR="\$HOME/.config/fish/completions"
        mkdir -p "\$COMPLETION_DIR" 2>/dev/null
        SCRIPT_NAME="${config.name}.fish"
        ;;
    *)
        echo "不支持的 Shell 类型: \$SHELL_TYPE"
        echo "支持的 Shell: bash, zsh, fish"
        exit 1
        ;;
esac

# 复制补全脚本
echo "正在安装 ${config.name} 自动补全..."
echo "Shell 类型: \$SHELL_TYPE"
echo "目标目录: \$COMPLETION_DIR"

# 这里应该由 CLI 主程序输出补全脚本内容
# 并重定向到目标文件

# 添加到配置文件 (如果需要)
case "\$SHELL_TYPE" in
    bash)
        if ! grep -q "${config.name}.bash" ~/.bashrc 2>/dev/null; then
            echo "" >> ~/.bashrc
            echo "# ${config.name} 自动补全" >> ~/.bashrc
            echo "source \$COMPLETION_DIR/\$SCRIPT_NAME" >> ~/.bashrc
            echo "已添加到 ~/.bashrc"
        fi
        ;;
    zsh)
        if ! grep -q "fpath.*.zsh/completion" ~/.zshrc 2>/dev/null; then
            echo "" >> ~/.zshrc
            echo "# ${config.name} 自动补全" >> ~/.zshrc
            echo "fpath=(~/.zsh/completion \$fpath)" >> ~/.zshrc
            echo "autoload -U compinit && compinit" >> ~/.zshrc
            echo "已添加到 ~/.zshrc"
        fi
        ;;
    fish)
        # Fish 会自动加载 completions 目录
        echo "Fish 会自动加载补全脚本"
        ;;
esac

echo ""
echo "✅ 安装完成!"
echo "请重新加载 Shell 配置或重启 Shell"
echo "  Bash: source ~/.bashrc"
echo "  Zsh:  source ~/.zshrc"
echo "  Fish: 无需操作，自动加载"
`;
}

/**
 * 生成所有补全脚本
 */
export async function generateAllCompletions(
  config: CompletionConfig,
  outputDir: string
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });

  // Bash
  const bashCompletion = generateBashCompletion(config);
  await fs.writeFile(
    path.join(outputDir, `${config.name}.bash`),
    bashCompletion
  );

  // Zsh
  const zshCompletion = generateZshCompletion(config);
  await fs.writeFile(
    path.join(outputDir, `_${config.name}`),
    zshCompletion
  );

  // Fish
  const fishCompletion = generateFishCompletion(config);
  await fs.writeFile(
    path.join(outputDir, `${config.name}.fish`),
    fishCompletion
  );

  // 安装脚本
  const installScript = generateInteractiveScript(config);
  await fs.writeFile(
    path.join(outputDir, 'install-completion.sh'),
    installScript
  );
}
