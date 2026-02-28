#!/bin/bash

# Bash 自动补全脚本 for CLI_NAME
#
# 安装方法:
#   1. 将此脚本添加到 ~/.bash_completion.d/ 或 ~/.bashrc
#   2. 或运行: CLI_NAME completion >> ~/.bashrc
#   3. 重新加载配置: source ~/.bashrc

_CLI_NAME_COMPLETION() {
    local cur prev words cword
    _init_completion || return

    case ${prev} in
        CLI_NAME)
            COMPREPLY=($(compgen -W "add update check remove scan search help completion --help --version" -- "${cur}"))
            ;;
        add)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "${cur}"))
            ;;
        update)
            COMPREPLY=($(compgen -W "--scope --verbose --help" -- "${cur}"))
            ;;
        check)
            COMPREPLY=($(compgen -W "--scope --json --verbose --help" -- "${cur}"))
            ;;
        remove)
            COMPREPLY=($(compgen -W "--force --verbose --help" -- "${cur}"))
            ;;
        scan)
            COMPREPLY=($(compgen -W "--scope --register --verbose --help" -- "${cur}"))
            ;;
        search)
            COMPREPLY=($(compgen -W "--scope --type --verbose --help" -- "${cur}"))
            ;;
        --scope)
            COMPREPLY=($(compgen -W "global project all" -- "${cur}"))
            ;;
        --type)
            COMPREPLY=($(compgen -W "cli tool framework library" -- "${cur}"))
            ;;
        *)
            ;;
    esac
}

complete -F _CLI_NAME_COMPLETION CLI_NAME
