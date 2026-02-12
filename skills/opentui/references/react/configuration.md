# React 配置

## 项目设置

### 快速开始

```bash
bunx create-tui@latest -t react my-app
cd my-app && bun install
```

CLI 会为您创建 `my-app` 目录 - 该目录**必须不存在**。

选项：`--no-git`（跳过 git init），`--no-install`（跳过 bun install）

### 手动设置

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/react @opentui/core react
```

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",

    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react",

    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"]
}
```

**关键设置：**
- `jsx: "react-jsx"` - 使用新的 JSX 转换
- `jsxImportSource: "@opentui/react"` - 从 OpenTUI 导入 JSX 运行时

### 为什么需要 DOM lib？

`DOM` lib 是 React 类型所需要的。OpenTUI 的 JSX 类型扩展自 React 的类型。

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
    "build": "bun build src/index.tsx --outdir=dist --target=bun"
  },
  "dependencies": {
    "@opentui/core": "latest",
    "@opentui/react": "latest",
    "react": ">=19.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/react": ">=19.0.0",
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
│   ├── hooks/
│   │   └── useAppState.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### 入口点（src/index.tsx）

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

createRoot(renderer).render(<App />)
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

## Renderer 配置

### createCliRenderer 选项

```tsx
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  // 渲染
  targetFPS: 60,

  // 行为
  exitOnCtrlC: true,        // 设置为 false 以自己处理 Ctrl+C

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

## 构建用于分发

### 使用 Bun 打包

```typescript
// build.ts
await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "bun",
  minify: true,
})
```

运行：`bun run build.ts`

### 创建可执行文件

```typescript
// build.ts
await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "bun",
  compile: {
    target: "bun-darwin-arm64",  // 或 bun-linux-x64 等
    outfile: "my-app",
  },
})
```

## 环境变量

为开发创建 `.env`：

```env
# Debug settings
OTUI_SHOW_STATS=false
SHOW_CONSOLE=false

# App settings
API_URL=https://api.example.com
```

Bun 会自动加载 `.env` 文件。通过 `process.env` 访问：

```tsx
const apiUrl = process.env.API_URL
```

## React DevTools

OpenTUI React 支持 React DevTools 进行调试。

### 设置

1. 将 DevTools 安装为开发依赖项（必须使用版本 7）：
   ```bash
   bun add react-devtools-core@7 -d
   ```

2. 运行 DevTools 独立应用：
   ```bash
   npx react-devtools@7
   ```

3. 使用 `DEV=true` 环境变量启动您的应用：
   ```bash
   DEV=true bun run src/index.tsx
   ```

**重要**：只有设置了 `DEV=true` 时才会自动连接到 DevTools。如果没有这个环境变量，DevTools 连接代码不会加载。

### 工作原理

OpenTUI 在启动时检查 `process.env["DEV"] === "true"`。如果为 true，它会动态导入 `react-devtools-core` 并连接到独立的 DevTools 应用。

## 测试配置

### 测试设置

```typescript
// src/test-utils.tsx
import { createTestRenderer } from "@opentui/core/testing"
import { createRoot } from "@opentui/react"

export async function renderForTest(
  element: React.ReactElement,
  options = { width: 80, height: 24 }
) {
  const testSetup = await createTestRenderer(options)
  createRoot(testSetup.renderer).render(element)
  return testSetup
}
```

### 测试示例

```typescript
// src/components/Counter.test.tsx
import { test, expect } from "bun:test"
import { renderForTest } from "../test-utils"
import { Counter } from "./Counter"

test("Counter renders initial value", async () => {
  const { snapshot } = await renderForTest(<Counter initialValue={5} />)
  expect(snapshot()).toContain("Count: 5")
})
```

## 常见问题

### JSX 类型不工作

确保设置了 `jsxImportSource`：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react"
  }
}
```

### React 版本不匹配

确保使用 React 19+：

```bash
bun install react@19 @types/react@19
```

### 模块解析错误

使用 `moduleResolution: "bundler"` 以兼容 Bun。
