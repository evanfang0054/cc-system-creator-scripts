/**
 * 错误处理工具
 *
 * 提供友好的错误消息和解决方案建议
 */

import chalk from 'chalk';

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  [key: string]: string | string[];
}

/**
 * CLI 自定义错误类
 *
 * 提供结构化的错误信息,包含:
 * - 错误消息
 * - 错误代码
 * - 解决建议
 * - 上下文信息
 */
export class CliError extends Error {
  code: string;
  suggestions: string[];
  context?: ErrorContext;

  constructor(
    message: string,
    code: string,
    suggestions: string[] = [],
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.suggestions = suggestions;
    this.context = context;
  }
}

/**
 * 显示友好的错误消息
 *
 * 格式化输出错误信息,包括:
 * - 错误标题和消息
 * - 错误代码
 * - 上下文信息
 * - 解决方案建议
 */
export function displayError(error: Error | CliError): void {
  if (error instanceof CliError) {
    // 错误标题
    console.error(chalk.red('✗ 错误: ') + error.message);

    // 错误代码
    if (error.code) {
      console.error(chalk.dim(`  代码: ${error.code}`));
    }

    // 上下文
    if (error.context && Object.keys(error.context).length > 0) {
      console.error('');
      Object.entries(error.context).forEach(([key, value]) => {
        console.error(chalk.dim('  ') + chalk.bold(key) + ':');
        if (Array.isArray(value)) {
          value.forEach(v => {
            console.error(chalk.dim('    • ') + v);
          });
        } else {
          console.error(chalk.dim('    • ') + value);
        }
      });
    }

    // 解决方案
    if (error.suggestions.length > 0) {
      console.error('');
      console.error(chalk.yellow('解决方案:'));
      error.suggestions.forEach(s => {
        console.error(chalk.dim('  • ') + s);
      });
    }
  } else {
    // 标准错误
    console.error(chalk.red('✗ 错误: ') + error.message);

    // 调试模式下显示堆栈
    if (process.env.DEBUG === 'true') {
      console.error('');
      console.error(chalk.dim(error.stack));
    }
  }
}

/**
 * 预定义错误工厂
 *
 * 提供常见错误场景的快速创建方法
 */
export const Errors = {
  /**
   * 文件未找到错误
   */
  fileNotFound(
    filePath: string,
    searchedPaths: string[],
    command = 'init'
  ): CliError {
    return new CliError(
      `未找到配置文件: ${filePath}`,
      'ENOENT',
      [
        `运行 '${process.argv[1]} ${command}' 创建配置文件`,
        '使用 --config 指定不同的位置',
        '检查文件路径是否正确',
      ],
      {
        '已搜索的位置': searchedPaths,
      }
    );
  },

  /**
   * 无效选项错误
   */
  invalidOption(
    option: string,
    validOptions: string[],
    suggestion?: string
  ): CliError {
    const suggestions = suggestion
      ? [`您是否指 "${suggestion}"?`]
      : [];

    return new CliError(
      `无效的选项 "${option}"`,
      'EINVAL',
      suggestions,
      {
        '有效选项': validOptions,
      }
    );
  },

  /**
   * 无效参数错误
   */
  invalidArgument(
    argName: string,
    argValue: string,
    validOptions: string[],
    suggestion?: string
  ): CliError {
    const suggestions = suggestion
      ? [`您是否指 "${suggestion}"?`]
      : [`使用 --help 查看有效选项`];

    return new CliError(
      `无效的 ${argName} 参数: "${argValue}"`,
      'EINVAL',
      suggestions,
      {
        '有效选项': validOptions,
      }
    );
  },

  /**
   * 权限被拒绝错误
   */
  permissionDenied(path: string, operation = '访问'): CliError {
    return new CliError(
      `${operation} "${path}" 时权限被拒绝`,
      'EACCES',
      [
        '使用 sudo 运行命令 (Unix/Linux)',
        '以管理员身份运行 (Windows)',
        '检查文件权限',
        '确保当前用户有访问权限',
      ],
      {
        '文件路径': path,
        '操作': operation,
      }
    );
  },

  /**
   * 网络错误
   */
  networkError(url: string, detail?: string): CliError {
    return new CliError(
      '网络请求失败',
      'ENETWORK',
      [
        '检查网络连接',
        '确认 URL 是否正确',
        '检查代理设置',
        '稍后重试',
      ],
      {
        URL: url,
        ...(detail ? { '详细信息': detail } : {}),
      }
    );
  },

  /**
   * 命令不存在错误
   */
  commandNotFound(command: string, availableCommands: string[]): CliError {
    // 寻找相似的命令
    const suggestion = findClosestMatch(command, availableCommands);

    return new CliError(
      `命令 "${command}" 不存在`,
      'ECMDNOTFOUND',
      suggestion
        ? [`您是否指 "${suggestion}"?`]
        : ['使用 --help 查看可用命令'],
      {
        '可用命令': availableCommands,
      }
    );
  },

  /**
   * 必需参数缺失错误
   */
  missingArgument(argName: string, command = ''): CliError {
    return new CliError(
      `缺少必需的参数 ${argName}`,
      'EMISSINGARG',
      [
        command
          ? `使用 '--help' 查看 ${command} 命令的参数`
          : "使用 '--help' 查看帮助信息",
        '参考示例用法',
      ]
    );
  },

  /**
   * 配置无效错误
   */
  invalidConfig(configPath: string, errors: string[]): CliError {
    return new CliError(
      `配置文件无效: ${configPath}`,
      'EINVALIDCONFIG',
      [
        '检查配置文件语法',
        '参考配置文件示例',
        '使用 --validate 验证配置',
      ],
      {
        '错误列表': errors,
      }
    );
  },

  /**
   * 操作已取消错误
   */
  operationCancelled(operation = '操作'): CliError {
    return new CliError(
      `${operation}已取消`,
      'ECANCELLED',
      [
        '如需重新执行,请再次运行命令',
      ]
    );
  },

  /**
   * 版本不兼容错误
   */
  versionIncompatible(
    packageName: string,
    currentVersion: string,
    requiredVersion: string
  ): CliError {
    return new CliError(
      `${packageName} 版本不兼容`,
      'EVERSION',
      [
        `更新 ${packageName} 到 ${requiredVersion} 或更高版本`,
        `运行: npm install ${packageName}@${requiredVersion}`,
      ],
      {
        '当前版本': currentVersion,
        '需要版本': requiredVersion,
      }
    );
  },
};

/**
 * 查找最接近的匹配 (用于建议)
 */
function findClosestMatch(
  input: string,
  candidates: string[]
): string | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  let closest = candidates[0];
  let minDistance = levenshteinDistance(input, closest);

  for (let i = 1; i < candidates.length; i++) {
    const distance = levenshteinDistance(input, candidates[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = candidates[i];
    }
  }

  // 如果距离太远,不建议
  return minDistance <= 3 ? closest : undefined;
}

/**
 * 计算编辑距离 (Levenshtein 距离)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 获取退出码
 *
 * 根据错误类型返回标准 POSIX 退出码
 */
export function getExitCode(error: Error): number {
  // 标准退出码
  const EXIT_CODES = {
    SUCCESS: 0,
    GENERAL_ERROR: 1,
    MISUSE: 2,              // 无效参数
    PERMISSION_DENIED: 77,
    NOT_FOUND: 127,
    SIGINT: 130,            // Ctrl+C
  };

  if (error instanceof CliError) {
    switch (error.code) {
      case 'EACCES':
      case 'EPERM':
        return EXIT_CODES.PERMISSION_DENIED;
      case 'ENOENT':
        return EXIT_CODES.NOT_FOUND;
      case 'EINVAL':
      case 'EINVALIDCONFIG':
      case 'EMISSINGARG':
        return EXIT_CODES.MISUSE;
      case 'ECANCELLED':
        return EXIT_CODES.SIGINT;
      default:
        return EXIT_CODES.GENERAL_ERROR;
    }
  }

  // 检查 Node.js 错误代码
  if ('code' in error) {
    switch ((error as any).code) {
      case 'EACCES':
        return EXIT_CODES.PERMISSION_DENIED;
      case 'ENOENT':
        return EXIT_CODES.NOT_FOUND;
      default:
        return EXIT_CODES.GENERAL_ERROR;
    }
  }

  return EXIT_CODES.GENERAL_ERROR;
}

/**
 * 优雅退出
 */
export function exitWithError(error: Error): never {
  displayError(error);
  process.exit(getExitCode(error));
}
