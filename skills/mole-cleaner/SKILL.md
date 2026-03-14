---
name: mole-cleaner
description: |
  Mac 系统深度清理和优化工具。使用 Mole (mo 命令) 执行系统清理、磁盘分析、应用卸载、系统优化等任务。

  触发场景（当用户提到以下任一内容时使用此 skill）：
  - 清理 Mac、清理磁盘、释放空间、清理缓存、清理系统
  - 卸载应用、删除应用、移除应用及其残留
  - 磁盘分析、查看磁盘占用、大文件查找、空间分析
  - 系统优化、系统维护、刷新系统、重建缓存
  - 系统状态、系统监控、CPU/内存/磁盘监控
  - 清理 node_modules、清理构建产物、清理项目依赖
  - 清理安装包、删除 dmg/pkg 文件
  - Mac 清理工具、类似 CleanMyMac 的功能
  - "我的 Mac 太慢了"、"磁盘空间不足"、"电脑卡顿"
  - 即使没有明确说 "Mole"，只要涉及上述场景就应使用
---

# Mole - Mac 系统清理与优化 Skill

## 概述

Mole 是一款功能强大的 Mac 系统深度清理和优化工具，集成了 CleanMyMac、AppCleaner、DaisyDisk 和 iStat Menus 的功能于单一二进制文件中。通过 `mo` 命令调用。

**适用系统**：仅限 macOS（不支持 Windows/Linux）

**命令前缀**：`mo`

## 安装检查

执行任何操作前，先确认 Mole 已安装：

```bash
mo --version
```

如果未安装，执行：

```bash
# 推荐：通过 Homebrew 安装
brew install tw93/tap/mole

# 或者通过脚本安装
curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash
```

## 核心命令详解

### 1. 深度系统清理 (`mo clean`)

**用途**：扫描并删除系统缓存、日志、浏览器残留等，释放大量磁盘空间。

**基础命令**：
```bash
mo clean              # 执行深度清理
mo clean --dry-run    # 预览将要清理的内容（安全！）
mo clean --dry-run --debug  # 详细预览，包含风险级别和文件信息
mo clean --whitelist  # 管理受保护的缓存路径
```

**清理范围**：
| 类别 | 说明 | 典型大小 |
|------|------|----------|
| 用户应用缓存 | `~/Library/Caches` 下的应用缓存 | 10-50GB |
| 浏览器缓存 | Chrome、Safari、Firefox 缓存 | 5-20GB |
| 开发工具缓存 | Xcode、Node.js、npm、Cargo 等 | 10-30GB |
| 系统日志 | `/var/log`、诊断日志等 | 1-5GB |
| 应用特定缓存 | Spotify、Dropbox、Slack 等 | 2-10GB |
| 废纸篓 | 已删除但未清空的文件 | 可变 |

**安全机制**：
- 孤儿检测：应用数据仅当应用本身已删除且数据 60 天未访问时才清理
- 受保护应用：Adobe、Microsoft、Google 产品默认白名单
- AI 工具保护：Cursor、Claude、ChatGPT、Ollama、LM Studio 不会被清理
- VPN/代理保护：Shadowsocks、V2Ray、Tailscale、Clash 跳过

**执行流程**：
1. **必须先预览**：`mo clean --dry-run`
2. 向用户展示预览结果，说明将释放多少空间
3. 征得用户同意后执行：`mo clean`
4. 报告清理结果

### 2. 智能应用卸载 (`mo uninstall`)

**用途**：彻底移除应用程序及其关联文件（缓存、偏好设置、启动项等）。

**基础命令**：
```bash
mo uninstall           # 交互式选择要卸载的应用
mo uninstall --dry-run # 预览卸载结果
```

**卸载范围**：
- 应用程序本身（`/Applications`、`~/Applications`）
- Application Support 目录
- Caches 目录
- Preferences 目录
- Logs 目录
- WebKit 存储、Cookies
- Extensions、Plugins
- LaunchAgents、LaunchDaemons

**安全机制**：
- 应用名至少 3 个字符才匹配（防止 "Go" 匹配 "Google"）
- `com.apple.*` 的 LaunchAgents 永不删除
- 通用名称（Music、Notes、Photos）被排除
- 先通过 `launchctl` 停止服务再删除

**执行流程**：
1. 运行 `mo uninstall` 进入交互界面
2. 使用方向键或 `j/k` 导航，空格选择
3. 回车确认选择
4. 等待卸载完成并查看释放的空间

### 3. 系统优化 (`mo optimize`)

**用途**：刷新系统服务、重建缓存、优化系统性能。

**基础命令**：
```bash
mo optimize              # 执行系统优化
mo optimize --dry-run    # 预览优化操作
mo optimize --whitelist  # 管理受保护的优化规则
```

**优化项目**：
- 重建系统数据库和缓存
- 重置网络服务
- 刷新 Finder 和 Dock
- 清理诊断和崩溃日志
- 移除交换文件并重启动态分页器
- 重建 Launch Services 和 Spotlight 索引

**注意事项**：
- 部分操作可能需要管理员权限
- 优化过程中某些服务可能短暂不可用
- 建议在非工作时间执行

### 4. 磁盘空间分析 (`mo analyze`)

**用途**：可视化磁盘使用情况，找出大文件和目录。

**基础命令**：
```bash
mo analyze              # 分析用户主目录
mo analyze /path/to/dir # 分析指定目录
mo analyze /Volumes     # 分析外置驱动器
```

**交互操作**：
| 按键 | 功能 |
|------|------|
| `↑↓` 或 `j/k` | 导航 |
| `O` | 在 Finder 中打开 |
| `F` | 显示文件信息 |
| `⌫` 然后 `Enter` | 删除（移到废纸篓） |
| `L` | 查看大文件列表 |
| `Q` | 退出 |

**安全特性**：
- 使用普通用户权限，不请求 sudo
- 遵循 SIP 保护
- 文件移到废纸篓而非直接删除（可通过 Finder 恢复）
- 需要两次按键确认删除（防止误操作）

### 5. 实时系统监控 (`mo status`)

**用途**：实时显示 CPU、内存、磁盘、网络状态和系统健康分数。

**基础命令**：
```bash
mo status    # 启动实时监控面板
```

**显示信息**：
- 系统健康分数（0-100，基于 CPU、内存、磁盘、温度、I/O）
- CPU：总使用率、负载、各核心使用率
- 内存：已用/总量、可用内存
- 磁盘：已用/总量、读写速度
- 网络：上传/下载速度、代理状态
- 电源：电量、充电状态、健康度、温度
- 进程：资源占用排行

**快捷键**：
- `k`：切换猫咪显示
- `q`：退出

### 6. 项目构建产物清理 (`mo purge`)

**用途**：清理项目的构建产物（node_modules、target、build、dist、venv 等）。

**基础命令**：
```bash
mo purge              # 扫描并清理项目构建产物
mo purge --dry-run    # 预览将要清理的内容
mo purge --paths      # 配置扫描目录
```

**可清理的构建产物**：
| 类型 | 目录名 |
|------|--------|
| Node.js | `node_modules` |
| Rust | `target` |
| Python | `venv`、`__pycache__`、`.venv` |
| Java | `build`、`target`、`.gradle` |
| 前端 | `dist`、`.next`、`.nuxt` |

**配置扫描路径**：
编辑 `~/.config/mole/purge_paths` 文件：
```
~/Documents/MyProjects
~/Work/ClientA
~/GitHub
```

**安全机制**：
- 7 天内的项目标记为 "Recent" 且默认不选中
- 永久删除，无法恢复
- 必须谨慎确认

**推荐安装 fd**：
```bash
brew install fd
```

### 7. 安装包清理 (`mo installer`)

**用途**：查找并删除散落各处的安装包文件（dmg、pkg、zip 等）。

**基础命令**：
```bash
mo installer           # 查找并清理安装包
mo installer --dry-run # 预览
```

**扫描位置**：
- Downloads 目录
- Desktop
- Homebrew 缓存
- iCloud
- Mail 附件

**输出格式**：每个文件标注来源（如 `Downloads`、`Homebrew`）

### 8. 辅助命令

#### Touch ID 配置
```bash
mo touchid           # 配置 Touch ID 用于 sudo
mo touchid enable    # 启用
mo touchid disable   # 禁用
```

#### Shell 补全
```bash
mo completion        # 设置 shell tab 补全
```

#### 更新与卸载
```bash
mo update            # 更新到最新稳定版
mo update --force    # 强制重装最新稳定版
mo update --nightly  # 安装最新开发版
mo remove            # 从系统移除 Mole
```

## ⚠️ 核心执行原则（必须遵守）

### 绝对禁止未经扫描直接执行清理

**正确流程**：扫描 → 展示方案 → 用户确认 → 执行

```
┌─────────────────────────────────────────────────────────────┐
│  第一步：扫描预览（--dry-run）                                │
│  第二步：整理并向用户展示具体清理方案                          │
│  第三步：等待用户明确确认                                     │
│  第四步：用户同意后才执行实际清理                              │
└─────────────────────────────────────────────────────────────┘
```

### 标准执行模板

**阶段 1：扫描**
```bash
mo clean --dry-run
```

**阶段 2：向用户展示方案**

必须清晰呈现以下信息：
1. 扫描到的可清理项目列表
2. 每个项目的大小
3. 预计可释放的总空间
4. 风险提示（如有）

示例输出格式：
```
📊 扫描结果：

┌─────────────────────────────┬───────────┐
│ 清理项目                     │ 大小       │
├─────────────────────────────┼───────────┤
│ 用户应用缓存                  │ 12.3 GB   │
│ 浏览器缓存 (Chrome/Safari)   │ 5.8 GB    │
│ 开发工具缓存 (npm/Xcode)     │ 8.2 GB    │
│ 系统日志                     │ 1.2 GB    │
│ 废纸篓                       │ 3.5 GB    │
├─────────────────────────────┼───────────┤
│ 总计可释放                    │ 31.0 GB   │
└─────────────────────────────┴───────────┘

⚠️ 注意：此操作将永久删除上述文件
```

**阶段 3：等待用户确认**

必须使用 `AskUserQuestion` 工具询问：
```
是否执行以上清理操作？
- 选项 A：确认执行清理
- 选项 B：取消操作
- 选项 C：查看更详细的信息（--debug）
```

**阶段 4：用户同意后执行**
```bash
mo clean
```

### 各命令的标准流程

| 命令 | 扫描命令 | 确认后执行 |
|------|----------|------------|
| `mo clean` | `mo clean --dry-run` | `mo clean` |
| `mo purge` | `mo purge --dry-run` | `mo purge` |
| `mo installer` | `mo installer --dry-run` | `mo installer` |
| `mo optimize` | `mo optimize --dry-run` | `mo optimize` |
| `mo uninstall` | `mo uninstall --dry-run` | `mo uninstall` |

### 禁止行为

- ❌ 未经扫描直接执行 `mo clean`
- ❌ 未经用户确认执行任何删除操作
- ❌ 在用户不知情的情况下清理文件
- ❌ 跳过 `--dry-run` 预览步骤

---

## 安全最佳实践

### 执行前必须做的事

1. **始终使用 `--dry-run` 预览**：
   ```bash
   mo clean --dry-run
   mo uninstall --dry-run
   mo purge --dry-run
   ```

2. **向用户展示预览结果并确认**

3. **对于高风险操作，使用 `--debug` 获取详细信息**：
   ```bash
   mo clean --dry-run --debug
   ```

### 用户配置保护

用户可在 `~/.config/mole/whitelist` 中添加受保护路径：
```bash
# 精确匹配
/Users/me/important-cache
~/Library/Application Support/MyApp
```

### 操作日志

所有文件操作记录在 `~/.config/mole/operations.log`。

禁用日志：`export MO_NO_OPLOG=1`

## 受保护的系统路径

Mole **永不删除**以下路径（即使有 sudo）：

```
/                          # 根目录
/System                    # macOS 系统
/bin, /sbin, /usr          # 二进制文件
/etc, /var                 # 配置
/Library/Extensions        # 内核扩展
/private                   # 系统私有目录（部分缓存除外）
```

## 受保护的应用类别

以下应用默认受保护，不会被清理：

| 类别 | 应用 |
|------|------|
| 系统组件 | Control Center、System Settings、TCC、Spotlight |
| VPN/代理 | Shadowsocks、V2Ray、Tailscale、Clash |
| AI 工具 | Cursor、Claude、ChatGPT、Ollama、LM Studio |
| Apple 原生 | `com.apple.*` LaunchAgents/Daemons |

## 常见使用场景

### 场景 1：磁盘空间不足

```bash
# 1. 分析磁盘使用
mo analyze

# 2. 预览清理
mo clean --dry-run

# 3. 执行清理（确认后）
mo clean

# 4. 清理项目构建产物
mo purge --dry-run
mo purge
```

### 场景 2：系统变慢

```bash
# 1. 查看系统状态
mo status

# 2. 清理缓存
mo clean --dry-run
mo clean

# 3. 系统优化
mo optimize --dry-run
mo optimize
```

### 场景 3：卸载应用

```bash
# 交互式卸载
mo uninstall

# 或预览
mo uninstall --dry-run
```

### 场景 4：清理开发项目

```bash
# 配置扫描路径
mo purge --paths

# 预览
mo purge --dry-run

# 执行
mo purge
```

### 场景 5：清理安装包

```bash
mo installer --dry-run
mo installer
```

## 终端兼容性

推荐终端（按优先级）：
1. Kaku（推荐）
2. Alacritty
3. kitty
4. WezTerm
5. Ghostty
6. Warp

iTerm2 已知兼容性问题，不推荐。

覆盖终端检测：`export MO_LAUNCHER_APP=<name>`

## 错误处理

### 常见错误

1. **权限不足**：
   - 系统缓存清理首次需要 sudo 密码
   - 可配置 Touch ID：`mo touchid`

2. **命令超时**：
   - 网络卷检查超时 5 秒
   - mdfind 搜索超时 10 秒
   - SQLite vacuum 超时 20 秒

3. **Time Machine 运行中**：
   - 检测到备份运行时跳过清理

## 配置文件位置

| 文件 | 路径 | 用途 |
|------|------|------|
| 白名单 | `~/.config/mole/whitelist` | 受保护路径 |
| 清理路径 | `~/.config/mole/purge_paths` | purge 扫描目录 |
| 操作日志 | `~/.config/mole/operations.log` | 文件操作记录 |
| 运行日志 | `~/.config/mole/mole.log` | 运行时日志 |

## 版本信息

查看版本：
```bash
mo --version
```

输出示例：
```
Mole version 1.30.0
macOS: 10.15.7
Architecture: x86_64
Kernel: 19.6.0
SIP: Enabled
Disk Free: 24Gi
Install: Homebrew
Shell: /bin/zsh
```

## 相关链接

- GitHub: https://github.com/tw93/Mole
- 安全审计: https://github.com/tw93/Mole/blob/main/SECURITY_AUDIT.md
- 安全策略: https://github.com/tw93/Mole/blob/main/SECURITY.md
