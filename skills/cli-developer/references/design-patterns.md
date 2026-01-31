# CLI 设计模式

## 命令层次结构

```
mycli                           # 根命令
├── init [options]              # 简单命令
├── config
│   ├── get <key>              # 嵌套子命令
│   ├── set <key> <value>
│   └── list
├── deploy [environment]        # 带参数的命令
│   ├── --dry-run              # 标志
│   ├── --force
│   └── --config <file>        # 带值的选项
└── plugins
    ├── install <name>
    ├── list
    └── remove <name>
```

## 标志约定

```bash
# 布尔标志（存在即为 true）
mycli deploy --force --dry-run

# 短格式 + 长格式
mycli -v --verbose
mycli -c config.yml --config config.yml

# 必需 vs 可选
mycli deploy <env>              # 位置参数（必需）
mycli deploy --env production   # 标志（可选）

# 多个值
mycli install pkg1 pkg2 pkg3    # 可变参数
mycli --exclude node_modules --exclude .git
```

## 配置层级

优先级顺序（从高到低）：

1. **命令行标志** - 明确的用户意图
2. **环境变量** - 运行时上下文
3. **配置文件（项目）** - `.myclirc`、`mycli.config.js`
4. **配置文件（用户）** - `~/.myclirc`、`~/.config/mycli/config.yml`
5. **配置文件（系统）** - `/etc/mycli/config.yml`
6. **默认值** - 硬编码的合理默认值

```javascript
// 配置解析示例
const config = {
  ...systemDefaults,
  ...loadSystemConfig(),
  ...loadUserConfig(),
  ...loadProjectConfig(),
  ...loadEnvVars(),
  ...parseCliFlags(),
};
```

## 退出码

标准 POSIX 退出码：

```javascript
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,              // 无效参数
  PERMISSION_DENIED: 77,
  NOT_FOUND: 127,
  SIGINT: 130,            // Ctrl+C
};
```

## 插件架构

```
mycli/
├── core/                      # 核心功能
├── plugins/
│   ├── aws/                  # 插件：AWS 集成
│   │   ├── package.json
│   │   └── index.js
│   └── github/               # 插件：GitHub 集成
│       ├── package.json
│       └── index.js
└── plugin-loader.js          # 发现和加载
```

插件发现：
1. 检查 `~/.mycli/plugins/`
2. 检查 `node_modules/mycli-plugin-*`
3. 检查 `MYCLI_PLUGIN_PATH` 环境变量

## 错误处理模式

```javascript
// 好：可操作的错误消息
Error: 在 /path/to/config.yml 未找到配置文件

已搜索的位置：
  • ./mycli.config.yml
  • ~/.myclirc
  • /etc/mycli/config.yml

运行 'mycli init' 创建配置文件，或使用 --config 指定位置。

// 差：无用的错误
Error: ENOENT
```

## 交互式 vs 非交互式

```javascript
// 检测是否在 CI/CD 中运行
const isCI = process.env.CI === 'true' || !process.stdout.isTTY;

if (isCI) {
  // 非交互式：快速失败并提供清晰错误
  if (!options.environment) {
    throw new Error('非交互式模式下需要 --environment 参数');
  }
} else {
  // 交互式：提示用户
  const environment = await prompt({
    type: 'select',
    message: '选择环境：',
    choices: ['development', 'staging', 'production'],
  });
}
```

## 状态管理

```
~/.mycli/
├── config.yml           # 用户配置
├── cache/               # 缓存数据
│   ├── plugins.json
│   └── api-responses/
├── credentials.json     # 敏感数据（600 权限）
└── state.json          # 会话状态
```

## 性能模式

```javascript
// 延迟加载：不加载未使用的依赖
if (command === 'deploy') {
  const deploy = require('./commands/deploy'); // 按需加载
  await deploy.run();
}

// 缓存：避免重复的 API 调用
const cache = new Cache('~/.mycli/cache', { ttl: 3600 });
let plugins = await cache.get('plugins');
if (!plugins) {
  plugins = await fetchPlugins();
  await cache.set('plugins', plugins);
}

// 异步操作：不要不必要地阻塞
await Promise.all([
  validateConfig(),
  checkForUpdates(),
  loadPlugins(),
]);
```

## 版本控制与更新

```javascript
// 检查更新（非阻塞）
checkForUpdates().then(update => {
  if (update.available) {
    console.log(`有可用更新：${update.version}`);
    console.log(`运行：npm install -g mycli@latest`);
  }
}).catch(() => {
  // 静默失败 - 不中断用户工作流
});

// 版本兼容性
const MIN_NODE_VERSION = '18.0.0';
if (!semver.satisfies(process.version, `>=${MIN_NODE_VERSION}`)) {
  console.error(`mycli 需要 Node.js ${MIN_NODE_VERSION} 或更高版本`);
  process.exit(1);
}
```

## 帮助文本设计

```
用法
  mycli deploy [environment] [options]

参数
  environment  目标环境（development|staging|production）

选项
  -c, --config <file>  配置文件路径
  -f, --force          跳过确认提示
  -d, --dry-run        预览更改而不执行
  -v, --verbose        显示详细输出

示例
  # 部署到生产环境
  mycli deploy production

  # 预览预发布环境部署
  mycli deploy staging --dry-run

  # 使用自定义配置
  mycli deploy --config ./custom.yml

了解更多：https://docs.mycli.dev/deploy
```
