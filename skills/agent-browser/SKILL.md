---
name: agent-browser
description: AI 代理的浏览器自动化 CLI 工具。当用户需要与网站交互时使用，包括导航页面、填写表单、点击按钮、截图、提取数据、测试 Web 应用或自动化任何浏览器任务。触发场景包括"打开网站"、"填写表单"、"点击按钮"、"截图"、"从页面抓取数据"、"测试这个 Web 应用"、"登录网站"、"自动化浏览器操作"或任何需要编程式 Web 交互的任务。
allowed-tools: Bash(npx agent-browser:*), Bash(agent-browser:*)
---

# 使用 agent-browser 进行浏览器自动化

## 核心工作流程

每次浏览器自动化都遵循以下模式：

1. **导航**：`agent-browser open <url>`
2. **快照**：`agent-browser snapshot -i`（获取元素引用，如 `@e1`、`@e2`）
3. **交互**：使用引用进行点击、填充、选择
4. **重新快照**：导航或 DOM 变化后，获取新的引用

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# 输出：@e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # 检查结果
```

## 命令链式调用

命令可以通过 `&&` 在单个 shell 调用中链式连接。浏览器通过后台守护进程在命令之间持久存在，因此链式调用是安全的，并且比单独调用更高效。

```bash
# 在一次调用中链式连接打开 + 等待 + 快照
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser snapshot -i

# 链式连接多个交互
agent-browser fill @e1 "user@example.com" && agent-browser fill @e2 "password123" && agent-browser click @e3

# 导航并截图
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser screenshot page.png
```

**何时使用链式调用**：当你不需要在继续之前读取中间命令的输出时使用 `&&`（例如：打开 + 等待 + 截图）。当你需要先解析输出时，请单独运行命令（例如：快照以发现引用，然后使用这些引用进行交互）。

## 基本命令

```bash
# 导航
agent-browser open <url>              # 导航（别名：goto, navigate）
agent-browser close                   # 关闭浏览器

# 快照
agent-browser snapshot -i             # 带引用的交互式元素（推荐）
agent-browser snapshot -i -C          # 包含光标交互式元素（带 onclick 或 cursor:pointer 的 div）
agent-browser snapshot -s "#selector" # 限定到 CSS 选择器范围

# 交互（使用快照中的 @refs）
agent-browser click @e1               # 点击元素
agent-browser click @e1 --new-tab     # 点击并在新标签页打开
agent-browser fill @e2 "text"         # 清空并输入文本
agent-browser type @e2 "text"         # 不清空直接输入文本
agent-browser select @e1 "option"     # 选择下拉选项
agent-browser check @e1               # 勾选复选框
agent-browser press Enter             # 按键
agent-browser keyboard type "text"    # 在当前焦点处输入（无需选择器）
agent-browser keyboard inserttext "text"  # 插入文本（不触发按键事件）
agent-browser scroll down 500         # 滚动页面
agent-browser scroll down 500 --selector "div.content"  # 在特定容器内滚动

# 获取信息
agent-browser get text @e1            # 获取元素文本
agent-browser get url                 # 获取当前 URL
agent-browser get title               # 获取页面标题

# 等待
agent-browser wait @e1                # 等待元素
agent-browser wait --load networkidle # 等待网络空闲
agent-browser wait --url "**/page"    # 等待 URL 模式
agent-browser wait 2000               # 等待毫秒数

# 下载
agent-browser download @e1 ./file.pdf          # 点击元素触发下载
agent-browser wait --download ./output.zip     # 等待任何下载完成
agent-browser --download-path ./downloads open <url>  # 设置默认下载目录

# 捕获
agent-browser screenshot              # 截图到临时目录
agent-browser screenshot --full       # 全页面截图
agent-browser screenshot --annotate   # 带编号元素标签的注释截图
agent-browser pdf output.pdf          # 保存为 PDF

# 差异对比（比较页面状态）
agent-browser diff snapshot                          # 比较当前与上一次快照
agent-browser diff snapshot --baseline before.txt    # 比较当前与保存的文件
agent-browser diff screenshot --baseline before.png  # 视觉像素差异
agent-browser diff url <url1> <url2>                 # 比较两个页面
agent-browser diff url <url1> <url2> --wait-until networkidle  # 自定义等待策略
agent-browser diff url <url1> <url2> --selector "#main"  # 限定到元素范围
```

## 常见模式

### 表单提交

```bash
agent-browser open https://example.com/signup
agent-browser snapshot -i
agent-browser fill @e1 "Jane Doe"
agent-browser fill @e2 "jane@example.com"
agent-browser select @e3 "California"
agent-browser check @e4
agent-browser click @e5
agent-browser wait --load networkidle
```

### 使用认证保险库进行身份验证（推荐）

```bash
# 保存凭证一次（使用 AGENT_BROWSER_ENCRYPTION_KEY 加密）
# 推荐：通过 stdin 管道传输密码以避免 shell 历史记录暴露
echo "pass" | agent-browser auth save github --url https://github.com/login --username user --password-stdin

# 使用保存的配置文件登录（LLM 永远看不到密码）
agent-browser auth login github

# 列出/显示/删除配置文件
agent-browser auth list
agent-browser auth show github
agent-browser auth delete github
```

### 使用状态持久化进行身份验证

```bash
# 登录一次并保存状态
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "$USERNAME"
agent-browser fill @e2 "$PASSWORD"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# 在未来的会话中重用
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### 会话持久化

```bash
# 在浏览器重启之间自动保存/恢复 cookies 和 localStorage
agent-browser --session-name myapp open https://app.example.com/login
# ... 登录流程 ...
agent-browser close  # 状态自动保存到 ~/.agent-browser/sessions/

# 下次使用时，状态自动加载
agent-browser --session-name myapp open https://app.example.com/dashboard

# 静态加密状态
export AGENT_BROWSER_ENCRYPTION_KEY=$(openssl rand -hex 32)
agent-browser --session-name secure open https://app.example.com

# 管理保存的状态
agent-browser state list
agent-browser state show myapp-default.json
agent-browser state clear myapp
agent-browser state clean --older-than 7
```

### 数据提取

```bash
agent-browser open https://example.com/products
agent-browser snapshot -i
agent-browser get text @e5           # 获取特定元素文本
agent-browser get text body > page.txt  # 获取所有页面文本

# JSON 输出用于解析
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

### 并行会话

```bash
agent-browser --session site1 open https://site-a.com
agent-browser --session site2 open https://site-b.com

agent-browser --session site1 snapshot -i
agent-browser --session site2 snapshot -i

agent-browser session list
```

### 连接到现有 Chrome

```bash
# 自动发现启用了远程调试的运行中 Chrome
agent-browser --auto-connect open https://example.com
agent-browser --auto-connect snapshot

# 或使用明确的 CDP 端口
agent-browser --cdp 9222 snapshot
```

### 配色方案（深色模式）

```bash
# 通过标志持久启用深色模式（适用于所有页面和新标签页）
agent-browser --color-scheme dark open https://example.com

# 或通过环境变量
AGENT_BROWSER_COLOR_SCHEME=dark agent-browser open https://example.com

# 或在会话期间设置（对后续命令持久）
agent-browser set media dark
```

### 可视化浏览器（调试）

```bash
agent-browser --headed open https://example.com
agent-browser highlight @e1          # 高亮元素
agent-browser record start demo.webm # 录制会话
agent-browser profiler start         # 启动 Chrome DevTools 性能分析
agent-browser profiler stop trace.json # 停止并保存性能分析（路径可选）
```

### 本地文件（PDF、HTML）

```bash
# 使用 file:// URL 打开本地文件
agent-browser --allow-file-access open file:///path/to/document.pdf
agent-browser --allow-file-access open file:///path/to/page.html
agent-browser screenshot output.png
```

### iOS 模拟器（Mobile Safari）

```bash
# 列出可用的 iOS 模拟器
agent-browser device list

# 在特定设备上启动 Safari
agent-browser -p ios --device "iPhone 16 Pro" open https://example.com

# 与桌面端相同的工作流程 - 快照、交互、重新快照
agent-browser -p ios snapshot -i
agent-browser -p ios tap @e1          # 点击（click 的别名）
agent-browser -p ios fill @e2 "text"
agent-browser -p ios swipe up         # 移动端特有手势

# 截图
agent-browser -p ios screenshot mobile.png

# 关闭会话（关闭模拟器）
agent-browser -p ios close
```

**要求**：macOS 配备 Xcode，Appium（`npm install -g appium && appium driver install xcuitest`）

**真实设备**：如果预先配置，可与物理 iOS 设备一起使用。使用 `--device "<UDID>"`，其中 UDID 来自 `xcrun xctrace list devices`。

## 安全性

所有安全功能都是可选的。默认情况下，agent-browser 对导航、操作或输出没有任何限制。

### 内容边界（推荐用于 AI 代理）

启用 `--content-boundaries` 以在页面源输出周围包装标记，帮助 LLM 区分工具输出和不可信的页面内容：

```bash
export AGENT_BROWSER_CONTENT_BOUNDARIES=1
agent-browser snapshot
# 输出：
# --- AGENT_BROWSER_PAGE_CONTENT nonce=<hex> origin=https://example.com ---
# [accessibility tree]
# --- END_AGENT_BROWSER_PAGE_CONTENT nonce=<hex> ---
```

### 域名白名单

限制导航到受信任的域名。像 `*.example.com` 这样的通配符也会匹配裸域名 `example.com`。对未允许域名的子资源请求、WebSocket 和 EventSource 连接也会被阻止。包含你的目标页面依赖的 CDN 域名：

```bash
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"
agent-browser open https://example.com        # 允许
agent-browser open https://malicious.com       # 阻止
```

### 操作策略

使用策略文件来限制破坏性操作：

```bash
export AGENT_BROWSER_ACTION_POLICY=./policy.json
```

示例 `policy.json`：
```json
{"default": "deny", "allow": ["navigate", "snapshot", "click", "scroll", "wait", "get"]}
```

认证保险库操作（`auth login` 等）绕过操作策略，但域名白名单仍然适用。

### 输出限制

防止大页面的上下文溢出：

```bash
export AGENT_BROWSER_MAX_OUTPUT=50000
```

## 差异对比（验证变更）

在执行操作后使用 `diff snapshot` 来验证它是否产生了预期的效果。这将当前的辅助功能树与会话中最后一次快照进行比较。

```bash
# 典型工作流程：快照 -> 操作 -> 差异
agent-browser snapshot -i          # 获取基线快照
agent-browser click @e2            # 执行操作
agent-browser diff snapshot        # 查看变更（自动与上一次快照比较）
```

用于视觉回归测试或监控：

```bash
# 保存基线截图，然后稍后比较
agent-browser screenshot baseline.png
# ... 时间流逝或进行更改 ...
agent-browser diff screenshot --baseline baseline.png

# 比较预发布环境与生产环境
agent-browser diff url https://staging.example.com https://prod.example.com --screenshot
```

`diff snapshot` 输出使用 `+` 表示添加，`-` 表示删除，类似于 git diff。`diff screenshot` 生成差异图像，变更的像素以红色高亮显示，并附带不匹配百分比。

## 超时和慢速页面

本地浏览器的默认 Playwright 超时为 25 秒。可以使用 `AGENT_BROWSER_DEFAULT_TIMEOUT` 环境变量覆盖此值（以毫秒为单位）。对于慢速网站或大页面，使用显式等待而不是依赖默认超时：

```bash
# 等待网络活动稳定（最适合慢速页面）
agent-browser wait --load networkidle

# 等待特定元素出现
agent-browser wait "#content"
agent-browser wait @e1

# 等待特定 URL 模式（在重定向后有用）
agent-browser wait --url "**/dashboard"

# 等待 JavaScript 条件
agent-browser wait --fn "document.readyState === 'complete'"

# 等待固定时长（毫秒）作为最后手段
agent-browser wait 5000
```

在处理持续缓慢的网站时，在 `open` 之后使用 `wait --load networkidle` 来确保页面完全加载后再进行快照。如果特定元素渲染缓慢，使用 `wait <selector>` 或 `wait @ref` 直接等待它。

## 会话管理和清理

当同时运行多个代理或自动化时，始终使用命名会话以避免冲突：

```bash
# 每个代理获得自己独立的会话
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com

# 检查活动会话
agent-browser session list
```

完成后始终关闭浏览器会话以避免进程泄漏：

```bash
agent-browser close                    # 关闭默认会话
agent-browser --session agent1 close   # 关闭特定会话
```

如果上一个会话未正确关闭，守护进程可能仍在运行。在开始新工作之前使用 `agent-browser close` 来清理它。

## 引用生命周期（重要）

当页面变化时，引用（`@e1`、`@e2` 等）会失效。在以下情况后始终重新快照：

- 点击导航的链接或按钮
- 表单提交
- 动态内容加载（下拉菜单、模态框）

```bash
agent-browser click @e5              # 导航到新页面
agent-browser snapshot -i            # 必须重新快照
agent-browser click @e1              # 使用新引用
```

## 注释截图（视觉模式）

使用 `--annotate` 截取带有交互式元素上覆盖编号标签的截图。每个标签 `[N]` 映射到引用 `@eN`。这也会缓存引用，因此你可以立即与元素交互，无需单独快照。

```bash
agent-browser screenshot --annotate
# 输出包括图像路径和图例：
#   [1] @e1 button "Submit"
#   [2] @e2 link "Home"
#   [3] @e3 textbox "Email"
agent-browser click @e2              # 使用注释截图中的引用点击
```

在以下情况使用注释截图：
- 页面有未标记的图标按钮或仅视觉元素
- 你需要验证视觉布局或样式
- 存在 Canvas 或图表元素（对文本快照不可见）
- 你需要对元素位置进行空间推理

## 语义定位器（引用的替代方案）

当引用不可用或不可靠时，使用语义定位器：

```bash
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find role button click --name "Submit"
agent-browser find placeholder "Search" type "query"
agent-browser find testid "submit-btn" click
```

## JavaScript 执行（eval）

使用 `eval` 在浏览器上下文中运行 JavaScript。**Shell 引用可能会破坏复杂表达式** -- 使用 `--stdin` 或 `-b` 来避免问题。

```bash
# 简单表达式可以使用常规引用
agent-browser eval 'document.title'
agent-browser eval 'document.querySelectorAll("img").length'

# 复杂 JS：使用 --stdin 和 heredoc（推荐）
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify(
  Array.from(document.querySelectorAll("img"))
    .filter(i => !i.alt)
    .map(i => ({ src: i.src.split("/").pop(), width: i.width }))
)
EVALEOF

# 替代方案：base64 编码（避免所有 shell 转义问题）
agent-browser eval -b "$(echo -n 'Array.from(document.querySelectorAll("a")).map(a => a.href)' | base64)"
```

**为什么这很重要**：当 shell 处理你的命令时，内部双引号、[!] 字符（历史扩展）、反引号和 `$()` 都可能在 JavaScript 到达 agent-browser 之前破坏它。`--stdin` 和 `-b` 标志完全绕过 shell 解释。

**经验法则**：
- 单行，无嵌套引号 -> 使用单引号的常规 `eval 'expression'` 即可
- 嵌套引号、箭头函数、模板字面量或多行 -> 使用 `eval --stdin <<'EVALEOF'`
- 编程/生成的脚本 -> 使用 `eval -b` 和 base64

## 配置文件

在项目根目录创建 `agent-browser.json` 以持久化设置：

```json
{
  "headed": true,
  "proxy": "http://localhost:8080",
  "profile": "./browser-data"
}
```

优先级（从低到高）：`~/.agent-browser/config.json` < `./agent-browser.json` < 环境变量 < CLI 标志。使用 `--config <path>` 或 `AGENT_BROWSER_CONFIG` 环境变量指定自定义配置文件（如果缺失/无效则退出并报错）。所有 CLI 选项映射到 camelCase 键（例如 `--executable-path` -> `"executablePath"`）。布尔标志接受 `true`/`false` 值（例如 `--headed false` 覆盖配置）。来自用户和项目配置的扩展是合并的，而不是替换。

## 深入文档

| 参考 | 使用场景 |
|-----------|-------------|
| [references/commands.md](references/commands.md) | 包含所有选项的完整命令参考 |
| [references/snapshot-refs.md](references/snapshot-refs.md) | 引用生命周期、失效规则、故障排除 |
| [references/session-management.md](references/session-management.md) | 并行会话、状态持久化、并发抓取 |
| [references/authentication.md](references/authentication.md) | 登录流程、OAuth、2FA 处理、状态重用 |
| [references/video-recording.md](references/video-recording.md) | 用于调试和文档的录制工作流程 |
| [references/profiling.md](references/profiling.md) | 用于性能分析的 Chrome DevTools 性能分析 |
| [references/proxy-support.md](references/proxy-support.md) | 代理配置、地理测试、轮换代理 |

## 即用模板

| 模板 | 描述 |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | 带验证的表单填充 |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | 登录一次，重用状态 |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | 带截图的内容提取 |

```bash
./templates/form-automation.sh https://example.com/form
./templates/authenticated-session.sh https://app.example.com/login
./templates/capture-workflow.sh https://example.com ./output
```
