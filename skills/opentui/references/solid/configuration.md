# Solid 配置

## 项目设置

### 快速开始

```bash
bunx create-tui@latest -t solid my-app
cd my-app && bun install
```

CLI 会为你创建 `my-app` 目录 - 该目录必须**不存在**。

选项：`--no-git`（跳过 git init），`--no-install`（跳过 bun install）

### 手动设置

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/solid @opentui/core solid-js
```

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",

    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid",

    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"]
}
```

**关键设置：**
- `jsx: "preserve"` - 让 Solid 编译器处理 JSX
- `jsxImportSource: "@opentui/solid"` - 从 OpenTUI Solid 导入 JSX runtime

## Bun 配置

### bunfig.toml

Solid 编译器**必需**：

```toml
preload = ["@opentui/solid/preload"]
```

这会在代码运行前加载 Solid JSX 转换。

## 包配置

### package.json

```json
{
  "name": "my-tui-app",
  "type": "module",
  "scripts": {
    "start": "bun run src/index.tsx",
    "dev": "bun --watch run src/index.tsx",
    "test": "bun test",
    "build": "bun run build.ts"
  },
  "dependencies": {
    "@opentui/core": "latest",
    "@opentui/solid": "latest",
    "solid-js": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "latest"
  }
}
```

## 项目结构

推荐结构：

```
my-tui-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainContent.tsx
│   ├── stores/
│   │   └── appStore.ts
│   ├── App.tsx
│   └── index.tsx
├── bunfig.toml           # 必需！
├── package.json
└── tsconfig.json
```

### 入口点（src/index.tsx）

```tsx
import { render } from "@opentui/solid"
import { App } from "./App"

render(() => <App />)
```

### App 组件（src/App.tsx）

```tsx
import { Header } from "./components/Header"
import { Sidebar } from "./components/Sidebar"
import { MainContent } from "./components/MainContent"

export function App() {
  return (
    <box flexDirection="column" width="100%" height="100%">
      <Header />
      <box flexDirection="row" flexGrow={1}>
        <Sidebar />
        <MainContent />
      </box>
    </box>
  )
}
```

## 渲染器配置

### render() 选项

```tsx
import { render } from "@opentui/solid"
import { ConsolePosition } from "@opentui/core"

render(() => <App />, {
  // 渲染
  targetFPS: 60,

  // 行为
  exitOnCtrlC: true,

  // 调试控制台
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
    startInDebugMode: false,
  },

  // 清理
  onDestroy: () => {
    // 清理代码
  },
})
```

### 使用现有渲染器

```tsx
import { render } from "@opentui/solid"
import { createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
})

render(() => <App />, renderer)
```

## 构建发布

### 构建脚本（build.ts）

```typescript
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "bun",
  minify: true,
  plugins: [solidPlugin],
})

console.log("Build complete!")
```

运行：`bun run build.ts`

### 创建可执行文件

```typescript
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  target: "bun",
  plugins: [solidPlugin],
  compile: {
    target: "bun-darwin-arm64",  // 或 bun-linux-x64 等
    outfile: "my-app",
  },
})
```

**可用目标：**
- `bun-darwin-arm64` - macOS Apple Silicon
- `bun-darwin-x64` - macOS Intel
- `bun-linux-x64` - Linux x64
- `bun-linux-arm64` - Linux ARM64
- `bun-windows-x64` - Windows x64

## 环境变量

为开发创建 `.env`：

```env
# 调试设置
OTUI_SHOW_STATS=false
SHOW_CONSOLE=false

# 应用设置
API_URL=https://api.example.com
```

Bun 会自动加载 `.env` 文件：

```tsx
const apiUrl = process.env.API_URL
```

## 测试配置

### 测试设置

```typescript
// src/test-utils.tsx
import { testRender } from "@opentui/solid"

export async function renderForTest(
  Component: () => JSX.Element,
  options = { width: 80, height: 24 }
) {
  return await testRender(Component, options)
}
```

### 测试示例

```typescript
// src/components/Counter.test.tsx
import { test, expect } from "bun:test"
import { renderForTest } from "../test-utils"
import { Counter } from "./Counter"

test("Counter renders initial value", async () => {
  const { snapshot } = await renderForTest(() => <Counter initialValue={5} />)
  expect(snapshot()).toContain("Count: 5")
})
```

## 常见配置问题

### 缺少 bunfig.toml

**症状**：JSX 未转换，语法错误

**修复**：创建带有 preload 的 `bunfig.toml`：

```toml
preload = ["@opentui/solid/preload"]
```

### JSX 设置错误

**症状**：JSX 编译为 React 调用

**修复**：确保 tsconfig 包含：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid"
  }
}
```

### 构建缺少插件

**症状**：构建输出包含未转换的 JSX

**修复**：在构建中添加 Solid 插件：

```typescript
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  // ...
  plugins: [solidPlugin],
})
```
