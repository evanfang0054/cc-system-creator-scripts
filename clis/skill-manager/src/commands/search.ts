import chalk from 'chalk';
import { GitLabClient } from '../lib/gitlab.js';
import { logger } from '../lib/logger.js';
import { exitWithError } from '../lib/exit-codes.js';

interface SearchOptions {
  repo?: string;
}

export async function search(
  keyword: string,
  options: SearchOptions,
): Promise<void> {
  const gitlab = new GitLabClient();

  try {
    logger.title('🔍 搜索 Skills');

    // 默认仓库 URL (公司内部 GitLab)
    const defaultRepo = 'https://gitlab.company.com/ai-skills';
    const repoUrl = options.repo || defaultRepo;

    logger.info(`仓库: ${repoUrl}`);
    logger.info(`关键词: ${chalk.bold(keyword)}\n`);

    logger.start('正在搜索...');
    const results = await gitlab.searchSkills(repoUrl, keyword);

    if (results.length === 0) {
      logger.succeed('未找到匹配的 skills');
      return;
    }

    logger.succeed(`找到 ${results.length} 个匹配的 skills\n`);

    // 显示搜索结果
    results.forEach((result, index) => {
      console.log(`${chalk.bold(`${(index + 1).toString()}.`)} ${result}`);
    });

    console.log('\n使用以下命令安装:');
    console.log(chalk.gray(`  skill-manager add <repo-url> "${results[0]}"`));
  } catch (error) {
    exitWithError(error);
  }
}
