# CLI 用户体验模式

## 进度指示器

### 使用场景

```
确定性（已知总数）：
  [████████████░░░░░░░░] 60% (3/5 个文件)
  使用场景：文件操作、下载、批处理

不确定性（未知持续时间）：
  ⠋ 加载中...
  使用场景：API 调用、数据库查询、等待外部服务

多步骤：
  ✓ 依赖已安装
  ⠋ 正在构建应用...
  ⏳ 正在运行测试...
  使用场景：多阶段操作（构建、部署等）
```

### 进度条最佳实践

```
好：
[████████████░░░░░░░░] 60% | 120/200 MB | 2.4 MB/s | 剩余时间：33s
↑ 视觉条     ↑ 百分比  ↑ 当前进进  ↑ 速度     ↑ 时间

组成部分：
- 视觉条（20-40 字符）
- 百分比（已知时）
- 当前/总计（带单位）
- 速度/速率（适用时）
- 预计剩余时间（ETA）

差：
处理中...（无反馈）
60%（无上下文）
[████████████████████████████████████████]（太宽）
```

### 加载动画样式

```
⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏   点（优雅、低调）
⣾ ⣽ ⣻ ⢿ ⡿ ⣟ ⣯ ⣷        块（醒目、引人注意）
◐ ◓ ◑ ◒                  圆形（经典）
▖ ▘ ▝ ▗                  角（极简）
⠁ ⠂ ⠄ ⡀ ⢀ ⠠ ⠐ ⠈        线条（微妙）

选择依据：
- 终端兼容性（Windows 使用 ASCII）
- 品牌形象（匹配工具个性）
- 上下文（后台任务微妙、主任务醒目）
```

## 颜色使用

### 语义颜色

```
红色：     错误、失败、破坏性操作
黄色：  警告、弃用、非关键问题
绿色：   成功、完成、正面反馈
蓝色：    信息、提示、中性消息
青色：    命令、代码、技术细节
洋红色： 高亮、特殊项目
灰色：    次要、元数据、时间戳

示例：
✓ 成功：部署完成
✗ 错误：文件未找到
⚠ 警告：使用了已弃用的标志 --old-flag
ℹ 信息：使用来自 ~/.mycli/cache 的缓存
```

### 何时禁用颜色

```javascript
// 检测非 TTY 输出（管道到文件等）
const noColor = !process.stdout.isTTY ||
                process.env.NO_COLOR ||
                process.env.CI === 'true';

if (noColor) {
  // 禁用颜色
}

// 支持 NO_COLOR 标准
// https://no-color.org/
```

### 颜色可访问性

```
- 不要仅依赖颜色（同时使用符号）
- 提供高对比度（在各种终端中测试）
- 支持色盲（红/绿替代方案）

好：
✓ 构建成功（绿色）
✗ 构建失败（红色）
↑ 符号在无颜色时也能工作

差：
Success（仅有颜色，无符号）
Failed（仅有颜色，无符号）
```

## 帮助文本设计

### 命令帮助结构

```
用法
  mycli <命令> [选项]

命令
  init         初始化新项目
  deploy       部署到环境
  config       管理配置
  plugins      管理插件

选项
  -h, --help     显示帮助
  -v, --version  显示版本
  --config FILE  配置文件路径

运行 'mycli <命令> --help' 获取命令的更多信息。

示例
  # 初始化新项目
  mycli init my-app

  # 部署到生产环境
  mycli deploy production --dry-run

了解更多：https://docs.mycli.dev
```

### 子命令帮助

```
用法
  mycli deploy <环境> [选项]

参数
  environment    目标环境（必需）
                 可选值：development、staging、production

选项
  -c, --config <file>    配置文件路径
                         默认值：./mycli.config.yml

  -f, --force            跳过确认提示
                         生产环境中请谨慎使用

  -d, --dry-run          预览更改而不执行
                         显示将发生的操作

  -v, --verbose          显示详细输出
                         包含调试信息

示例
  # 部署到生产环境（带确认）
  mycli deploy production

  # 预览预发布环境部署
  mycli deploy staging --dry-run

  # 使用自定义配置
  mycli deploy production --config ./prod.yml

  # 强制部署，不提示
  mycli deploy production --force

更多信息，请访问 https://docs.mycli.dev/deploy
```

## 错误消息

### 好的错误消息

```
模式：[上下文] → [问题] → [解决方案]

示例 1：文件未找到
✗ 错误：未找到配置文件

已搜索的位置：
  • ./mycli.config.yml
  • ~/.config/mycli/config.yml
  • /etc/mycli/config.yml

解决方案：
  • 运行 'mycli init' 创建配置文件
  • 使用 --config 指定不同的位置
  • 检查文件权限

示例 2：验证错误
✗ 错误：无效的环境 'prod'

应为以下之一：
  • development
  • staging
  • production

您是否指 'production'？

示例 3：权限错误
✗ 错误：写入 /etc/mycli/config.yml 时权限被拒绝

此操作需要提升的权限。

尝试：
  • 使用 sudo 运行：sudo mycli config set key value
  • 使用用户配置：mycli config set --user key value
  • 检查文件权限：ls -la /etc/mycli/config.yml
```

### 错误消息指南

```
应该做：
✓ 具体明确（"端口 3000 已被占用" 而非 "端口不可用"）
✓ 显示上下文（"在文件 config.yml 第 42 行"）
✓ 建议解决方案（"尝试运行 'mycli fix'"）
✓ 使用通俗语言（"文件未找到" 而非 "ENOENT"）

不应该做：
✗ 向用户显示堆栈跟踪（保留给 --debug）
✗ 使用技术术语（"EACCES: permission denied"）
✗ 让用户困住（"无效输入" 而无解释）
✗ 模糊不清（"出了问题"）
```

## 交互式提示

### 提示类型

```
文本输入：
  项目名称：my-awesome-app
  ↑ 清晰的标签

选择（单选）：
  ? 选择环境：（使用方向键）
  ❯ development
    staging
    production

复选框（多选）：
  ? 选择功能：（按空格选择，回车确认）
  ◉ TypeScript
  ◯ ESLint
  ◉ Prettier
  ◯ Jest

确认：
  ? 部署到生产环境？(y/N)
  ↑ 默认为否（更安全）

密码：
  ? 输入密码：********
  ↑ 遮罩输入
```

### 提示指南

```
应该做：
✓ 显示键盘提示（"使用方向键"、"按空格"）
✓ 提供合理的默认值（预选常用选项）
✓ 允许使用 Ctrl+C 跳过
✓ 立即验证输入
✓ 在最终操作前显示预览/摘要

不应该做：
✗ 在 CI/CD 环境中要求交互
✗ 问显而易见的问题（确认每个操作）
✗ 隐藏下一步会发生什么
✗ 让用户重复输入信息
```

## 输出格式化

### 表格

```
好：
┌─────────────┬──────────┬──────────┐
│ 环境       │ 状态    │ 更新时间 │
├─────────────┼──────────┼──────────┤
│ production  │ ✓ 活跃  │ 2小时前  │
│ staging     │ ✓ 活跃  │ 5分钟前  │
│ development │ ✗ 停止  │ 1天前    │
└─────────────┴──────────┴──────────┘

极简（用于脚本）：
环境          状态    更新时间
production   活跃    2小时前
staging      活跃    5分钟前
development  停止    1天前

JSON（用于程序化使用）：
[
  {"env": "production", "status": "active", "updated": "2小时前"},
  {"env": "staging", "status": "active", "updated": "5分钟前"}
]
```

### 列表

```
项目符号列表：
功能：
  • TypeScript 支持
  • 热重载
  • 自动格式化

编号列表：
部署步骤：
  1. 构建应用
  2. 运行测试
  3. 部署到服务器
  4. 验证部署

树形结构：
my-app/
├── src/
│   ├── components/
│   └── utils/
├── tests/
└── package.json
```

## 状态消息

### 实时更新

```
多步骤过程：
✓ 依赖已安装（2.3秒）
✓ 应用已构建（8.1秒）
⠋ 正在运行测试...（当前）
⏳ 部署中...（待处理）
⏳ 验证中...（待处理）

更新：
⠋ 正在安装依赖...
  → npm install
✓ 依赖已安装（2.3秒）

⠋ 正在构建应用...
  → webpack build
✓ 应用已构建（8.1秒）
  → 输出：dist/（2.4 MB）
```

### 摘要/完成

```
✓ 部署完成！

摘要：
  环境：      production
  版本：      v1.2.3
  持续时间：   2分34秒
  部署时间：  2023-12-14 10:30:45 UTC

后续步骤：
  • 查看日志：mycli logs production
  • 监控：   mycli status production
  • 回滚：  mycli rollback production

URL：https://app.example.com
```

## 调试和详细模式

```
正常模式（默认）：
✓ 部署到生产环境成功（2分34秒）

详细模式（--verbose）：
[10:30:12] 正在开始部署...
[10:30:13] 正在从 ./mycli.config.yml 加载配置
[10:30:14] 正在连接生产服务器...
[10:30:15] 正在上传文件（124 个文件，2.4 MB）...
[10:30:28] 正在运行部署后钩子...
[10:32:46] ✓ 部署完成

调试模式（--debug）：
[DEBUG] 已加载配置：{env: 'production', ...}
[DEBUG] SSH 连接已建立：user@host
[DEBUG] 正在执行：rsync -avz ./dist/ user@host:/var/www/
[DEBUG] 输出：sending incremental file list...
[DEBUG] 退出码：0
✓ 部署到生产环境成功（2分34秒）

用法：
# 正常：简洁输出
mycli deploy production

# 详细：详细步骤
mycli deploy production --verbose

# 调试：包括内部的所有内容
DEBUG=* mycli deploy production
```

## Man 页面格式

```
名称
    mycli-deploy - 将应用部署到环境

简介
    mycli deploy <环境> [选项]

描述
    将应用部署到指定环境。
    支持 development、staging 和 production 环境。

选项
    -c, --config <文件>
        配置文件路径
        默认值：./mycli.config.yml

    -f, --force
        跳过所有确认提示
        生产环境中请谨慎使用

    -d, --dry-run
        预览部署而不执行
        显示将要部署的内容

示例
    部署到生产环境：
        mycli deploy production

    预览预发布环境部署：
        mycli deploy staging --dry-run

参见
    mycli-init(1), mycli-config(1), mycli-rollback(1)
```
