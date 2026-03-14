# Mole 快速参考卡

## 命令速查

| 命令 | 用途 | 安全预览 |
|------|------|----------|
| `mo` | 交互式主菜单 | - |
| `mo clean` | 深度清理 | `--dry-run` |
| `mo uninstall` | 卸载应用 | `--dry-run` |
| `mo optimize` | 系统优化 | `--dry-run` |
| `mo analyze` | 磁盘分析 | 安全（只读） |
| `mo status` | 系统监控 | 安全（只读） |
| `mo purge` | 清理构建产物 | `--dry-run` |
| `mo installer` | 清理安装包 | `--dry-run` |
| `mo update` | 更新 Mole | - |
| `mo remove` | 卸载 Mole | `--dry-run` |

## 常用选项

```bash
--dry-run      # 预览模式，不执行实际操作
--debug        # 详细日志
--whitelist    # 管理白名单
--paths        # 配置扫描路径（purge 专用）
--force        # 强制操作
--nightly      # 安装开发版（update 专用）
```

## analyze 交互按键

| 按键 | 功能 |
|------|------|
| `↑` / `k` | 上移 |
| `↓` / `j` | 下移 |
| `O` | 在 Finder 打开 |
| `F` | 显示文件信息 |
| `⌫` + `Enter` | 删除到废纸篓 |
| `L` | 大文件列表 |
| `Q` | 退出 |

## status 快捷键

| 按键 | 功能 |
|------|------|
| `k` | 切换猫咪显示 |
| `q` | 退出 |

## 清理范围参考

### mo clean 清理项

- 用户应用缓存 (`~/Library/Caches`)
- 浏览器缓存 (Chrome/Safari/Firefox)
- 开发工具 (Xcode/Node.js/npm/Cargo/Gradle)
- 系统日志和临时文件
- 应用特定缓存 (Spotify/Dropbox/Slack)
- 废纸篓

### mo purge 清理项

- `node_modules`
- `target` (Rust/Maven)
- `build` / `dist`
- `venv` / `__pycache__`
- `.next` / `.nuxt`

## 受保护项目

### 永不删除的路径
- `/` (根目录)
- `/System`
- `/bin`, `/sbin`, `/usr`
- `/etc`, `/var`
- `/Library/Extensions`
- `/private` (大部分)

### 受保护的应用
- Apple 系统组件 (`com.apple.*`)
- VPN/代理 (Shadowsocks/V2Ray/Tailscale/Clash)
- AI 工具 (Cursor/Claude/ChatGPT/Ollama/LM Studio)

## 配置文件

| 文件 | 路径 |
|------|------|
| 白名单 | `~/.config/mole/whitelist` |
| purge 路径 | `~/.config/mole/purge_paths` |
| 操作日志 | `~/.config/mole/operations.log` |

## 安全检查清单

执行清理前：

- [ ] 运行 `--dry-run` 预览
- [ ] 向用户展示预览结果
- [ ] 确认用户同意后执行
- [ ] 对高风险操作使用 `--debug`

## 安装命令

```bash
# Homebrew（推荐）
brew install tw93/tap/mole

# 脚本安装
curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash

# 特定版本
curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash -s -- -s 1.30.0
```

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 权限不足 | 首次清理系统缓存需 sudo，或配置 `mo touchid` |
| iTerm2 显示异常 | 换用 Alacritty/kitty/WezTerm/Ghostty/Warp |
| 命令超时 | 正常现象，网络卷检查 5s 超时 |
| Time Machine 运行中 | 等待备份完成或手动跳过 |
