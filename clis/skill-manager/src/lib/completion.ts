/**
 * Shell 自动补全工具
 *
 * 生成 bash、zsh、fish 的补全脚本
 */

import { logger } from './logger.js';

/**
 * 生成 bash 补全脚本
 */
export function generateBashCompletion(): string {
  return `# Bash completion for skill-manager

_skill_manager_completion() {
    local cur words commands
    cur="\${COMP_WORDS[COMP_CWORD]}"
    words=("\${COMP_WORDS[@]}")
    commands="add check remove scan search update help"

    # 完成主命令
    if [ \${COMP_CWORD} -eq 1 ]; then
        COMPREPLY=($(compgen -W "\$commands" -- "\$cur"))
        return 0
    fi

    # 获取子命令
    local cmd="\${words[1]}"

    case "\$cmd" in
        add)
            # 补全 add 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--platform --branch --help" -- "\$cur"))
            fi
            ;;
        check)
            # 补全 check 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--platform --verbose --help" -- "\$cur"))
            fi
            ;;
        remove)
            # 补全 remove 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--platform --help" -- "\$cur"))
            fi
            ;;
        scan)
            # 补全 scan 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--platform --scope --register --help" -- "\$cur"))
            fi
            ;;
        search)
            # 补全 search 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--repo --help" -- "\$cur"))
            fi
            ;;
        update)
            # 补全 update 命令
            if [[ "\$cur" == -* ]]; then
                COMPREPLY=($(compgen -W "--platform --help" -- "\$cur"))
            fi
            ;;
    esac
}

complete -F _skill_manager_completion skill-manager
`;
}

/**
 * 生成 zsh 补全脚本
 */
export function generateZshCompletion(): string {
  return `#compdef skill-manager

_skill_manager() {
    local -a commands
    commands=(
        'add:从 Git 仓库添加 skill'
        'check:查看已注册的 skills'
        'remove:删除已安装的 skill'
        'scan:扫描并发现已安装的 skills'
        'search:在 Git 仓库中搜索 skills'
        'update:更新已安装的 skills'
        'help:显示帮助信息'
    )

    if (( CURRENT == 2 )); then
        _describe 'command' commands
        return
    fi

    local cmd=\${words[2]}

    case \$cmd in
        add)
            _arguments \\
                '--platform[目标平台]' \\
                '--branch[Git 分支]' \\
                ':url:Git 仓库 URL' \\
                ':name:自定义 skill 名称'
            ;;
        check)
            _arguments \\
                '--platform[过滤平台]' \\
                '--verbose[显示详细信息]' \\
                '--output[输出格式]'
            ;;
        remove)
            _arguments \\
                '--platform[目标平台]' \\
                ':name:skill 名称'
            ;;
        scan)
            _arguments \\
                '--platform[只扫描指定平台]' \\
                '--scope[扫描范围]' \\
                '--register[自动注册未注册的 skills]'
            ;;
        search)
            _arguments \\
                '--repo[Git 仓库 URL]' \\
                ':keyword:搜索关键词'
            ;;
        update)
            _arguments \\
                '--platform[目标平台]' \\
                ':name:skill 名称'
            ;;
    esac
}

_skill_manager
`;
}

/**
 * 生成 fish 补全脚本
 */
export function generateFishCompletion(): string {
  return `# Fish completion for skill-manager

complete -c skill-manager -f

# 主命令
complete -c skill-manager -n '__fish_use_subcommand' -a add -d '从 Git 仓库添加 skill'
complete -c skill-manager -n '__fish_use_subcommand' -a check -d '查看已注册的 skills'
complete -c skill-manager -n '__fish_use_subcommand' -a remove -d '删除已安装的 skill'
complete -c skill-manager -n '__fish_use_subcommand' -a scan -d '扫描并发现已安装的 skills'
complete -c skill-manager -n '__fish_use_subcommand' -a search -d '在 Git 仓库中搜索 skills'
complete -c skill-manager -n '__fish_use_subcommand' -a update -d '更新已安装的 skills'

# add 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from add' -l platform -d '目标平台' -x -a 'claude-code cursor trae vscode windsurf'
complete -c skill-manager -n '__fish_seen_subcommand_from add' -l branch -d 'Git 分支' -x
complete -c skill-manager -n '__fish_seen_subcommand_from add' -l help -d '显示帮助'

# check 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from check' -l platform -d '过滤平台' -x -a 'claude-code cursor trae vscode windsurf'
complete -c skill-manager -n '__fish_seen_subcommand_from check' -l verbose -d '显示详细信息' -s v
complete -c skill-manager -n '__fish_seen_subcommand_from check' -l output -d '输出格式' -x -a 'text table json list'
complete -c skill-manager -n '__fish_seen_subcommand_from check' -l help -d '显示帮助'

# remove 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from remove' -l platform -d '目标平台' -x -a 'claude-code cursor trae vscode windsurf'
complete -c skill-manager -n '__fish_seen_subcommand_from remove' -l help -d '显示帮助'

# scan 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from scan' -l platform -d '只扫描指定平台' -x -a 'claude-code cursor trae vscode windsurf'
complete -c skill-manager -n '__fish_seen_subcommand_from scan' -l scope -d '扫描范围' -x -a 'global project all'
complete -c skill-manager -n '__fish_seen_subcommand_from scan' -l register -d '自动注册未注册的 skills'
complete -c skill-manager -n '__fish_seen_subcommand_from scan' -l help -d '显示帮助'

# search 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from search' -l repo -d 'Git 仓库 URL' -x
complete -c skill-manager -n '__fish_seen_subcommand_from search' -l help -d '显示帮助'

# update 命令选项
complete -c skill-manager -n '__fish_seen_subcommand_from update' -l platform -d '目标平台' -x -a 'claude-code cursor trae vscode windsurf'
complete -c skill-manager -n '__fish_seen_subcommand_from update' -l help -d '显示帮助'
`;
}

/**
 * 设置补全
 *
 * @param shell Shell 类型 (bash | zsh | fish)
 * @param outputDir 输出目录
 */
export async function setupCompletion(
  shell: 'bash' | 'zsh' | 'fish',
  outputDir?: string,
): Promise<void> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const os = await import('node:os');

  let completion: string;
  let filename: string;

  switch (shell) {
    case 'bash':
      completion = generateBashCompletion();
      filename = 'skill-manager.bash';
      break;
    case 'zsh':
      completion = generateZshCompletion();
      filename = '_skill-manager';
      break;
    case 'fish':
      completion = generateFishCompletion();
      filename = 'skill-manager.fish';
      break;
  }

  if (outputDir) {
    const outputPath = path.join(outputDir, filename);
    await fs.writeFile(outputPath, completion, 'utf-8');
    logger.info(`补全脚本已保存到: ${outputPath}`);
    logger.info(`请将以下内容添加到你的 ~/.${shell}rc:`);
    logger.info(`  source ${outputPath}`);
  } else {
    // 输出到控制台
    console.log('\n' + '='.repeat(60));
    console.log(`${shell.toUpperCase()} 补全脚本:`);
    console.log('='.repeat(60) + '\n');
    console.log(completion);
    console.log('\n' + '='.repeat(60));
    console.log('安装说明:');
    console.log('='.repeat(60));

    switch (shell) {
      case 'bash':
        console.log('\n1. 保存到文件:');
        console.log('   mkdir -p ~/.bash_completion.d');
        console.log(`   cat > ~/.bash_completion.d/skill-manager.bash << 'EOF'`);
        console.log(completion);
        console.log('   EOF');
        console.log('\n2. 添加到 ~/.bashrc:');
        console.log('   echo "source ~/.bash_completion.d/skill-manager.bash" >> ~/.bashrc');
        console.log('\n3. 重新加载:');
        console.log('   source ~/.bashrc');
        break;

      case 'zsh':
        console.log('\n1. 保存到文件:');
        console.log(`   cat > ~/.zsh/completions/_skill-manager << 'EOF'`);
        console.log(completion);
        console.log('   EOF');
        console.log('\n2. 确保以下内容在 ~/.zshrc:');
        console.log('   fpath=(~/.zsh/completions $fpath)');
        console.log('   autoload -U compinit && compinit');
        console.log('\n3. 重新加载:');
        console.log('   exec zsh');
        break;

      case 'fish':
        console.log('\n1. 保存到文件:');
        console.log(`   cat > ~/.config/fish/completions/skill-manager.fish << 'EOF'`);
        console.log(completion);
        console.log('   EOF');
        console.log('\n2. 重新加载:');
        console.log('   source ~/.config/fish/config.fish');
        break;
    }

    console.log('');
  }
}

/**
 * 显示所有支持的 Shell
 */
export function listSupportedShells(): string[] {
  return ['bash', 'zsh', 'fish'];
}
