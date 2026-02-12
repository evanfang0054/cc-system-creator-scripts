# 核心配置

## 渲染器配置

### createCliRenderer 选项

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  // 渲染
  targetFPS: 60,                    // 目标每秒帧数（默认：60）

  // 行为
  exitOnCtrlC: true,                // 在 Ctrl+C 时退出（默认：true）

  // 控制台覆盖层
  consoleOptions: {
    position: ConsolePosition.BOTTOM,  // BOTTOM | TOP | LEFT | RIGHT
    sizePercent: 30,                   // 屏幕百分比
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
    colorDebug: "#888888",
    startInDebugMode: false,
  },

  // 生命周期
  onDestroy: () => {
    // 清理回调
  },
})
```

## 环境变量

OpenTUI 支持多个环境变量用于配置和调试。

### 调试和开发

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `OTUI_DEBUG` | boolean | false | 启用调试模式，捕获原始输入 |
| `OTUI_DEBUG_FFI` | boolean | false | FFI 绑定的调试日志 |
| `OTUI_TRACE_FFI` | boolean | false | FFI 绑定的跟踪 |
| `OTUI_SHOW_STATS` | boolean | false | 启动时显示调试覆盖层 |
| `OTUI_DUMP_CAPTURES` | boolean | false | 退出时转储捕获的输出 |

### 控制台

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `OTUI_USE_CONSOLE` | boolean | true | 启用控制台捕获 |
| `SHOW_CONSOLE` | boolean | false | 启动时显示控制台 |

### 渲染

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `OTUI_NO_NATIVE_RENDER` | boolean | false | 禁用 ANSI 输出（用于调试） |
| `OTUI_USE_ALTERNATE_SCREEN` | boolean | true | 使用备用屏幕缓冲区 |
| `OTUI_OVERRIDE_STDOUT` | boolean | true | 覆盖标准输出流 |

### 终端能力

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `OPENTUI_NO_GRAPHICS` | boolean | false | 禁用 Kitty 图形协议 |
| `OPENTUI_FORCE_UNICODE` | boolean | false | 强制 Mode 2026 Unicode 支持 |
| `OPENTUI_FORCE_WCWIDTH` | boolean | false | 使用 wcwidth 获取字符宽度 |
| `OPENTUI_FORCE_NOZWJ` | boolean | false | 禁用 ZWJ 表符号连接 |
| `OPENTUI_FORCE_EXPLICIT_WIDTH` | string | - | 强制显式宽度（"true"/"false"） |

### Tree-sitter（语法高亮）

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `OTUI_TS_STYLE_WARN` | boolean | false | 在缺少语法样式时警告 |
| `OTUI_TREE_SITTER_WORKER_PATH` | string | "" | 自定义 tree-sitter worker 路径 |

### XDG 路径

| 变量 | 类型 | 默认值 | 描述 |
|----------|------|---------|-------------|
| `XDG_CONFIG_HOME` | string | "" | 用户配置目录 |
| `XDG_DATA_HOME` | string | "" | 用户数据目录 |

## 使用示例

### 开发模式

```bash
# 显示调试覆盖层和控制台
OTUI_SHOW_STATS=true SHOW_CONSOLE=true bun run src/index.ts

# 调试 FFI 问题
OTUI_DEBUG_FFI=true OTUI_TRACE_FFI=true bun run src/index.ts

# 禁用原生渲染进行测试
OTUI_NO_NATIVE_RENDER=true bun run src/index.ts
```

### 终端兼容性

```bash
# 为有问题的终端强制使用 wcwidth
OPENTUI_FORCE_WCWIDTH=true bun run src/index.ts

# 为 SSH 会话禁用图形
OPENTUI_NO_GRAPHICS=true bun run src/index.ts
```

## 项目设置

### package.json

```json
{
  "name": "my-tui-app",
  "type": "module",
  "scripts": {
    "start": "bun run src/index.ts",
    "dev": "bun --watch run src/index.ts",
    "test": "bun test"
  },
  "dependencies": {
    "@opentui/core": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "latest"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"]
}
```

## 构建原生代码

原生代码更改需要重新构建：

```bash
# 从仓库根目录（如果开发 OpenTUI 本身）
bun run build

# 原生编译需要 Zig
# 安装：https://ziglang.org/learn/getting-started/
```

**注意**：TypeScript 更改不需要构建。Bun 直接运行 TypeScript。
