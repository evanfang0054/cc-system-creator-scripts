# OpenTUI 核心 (@opentui/core)

构建终端用户界面的基础库。提供包含所有原语的命令式 API，为您对渲染、状态和行为的最大控制力。

## 概述

OpenTUI Core 运行在 Bun 上，使用原生 Zig 绑定来处理性能关键操作：
- **Renderer（渲染器）**：管理终端输出、输入事件和渲染循环
- **Renderables（可渲染组件）**：具有 Yoga 布局的分层 UI 构建块
- **Constructs（构造器）**：用于组合 Renderables 的声明式包装器
- **FrameBuffer（帧缓冲）**：用于自定义图形的低级 2D 渲染表面

## 何时使用 Core

在以下情况下使用核心命令式 API：
- 在 OpenTUI 之上构建库或框架
- 需要对渲染和状态的最大控制
- 希望获得尽可能小的打包体积（无需 React/Solid 运行时）
- 构建性能关键型应用程序
- 与现有命令式代码库集成

## 何时不使用 Core

| 场景 | 改用 |
|----------|-------------|
| 熟悉 React 模式 | `@opentui/react` |
| 希望使用细粒度响应式 | `@opentui/solid` |
| 构建典型应用程序 | React 或 Solid 协调器 |
| 快速原型开发 | React 或 Solid 协调器 |

## 快速开始

### 使用 create-tui（推荐）

```bash
bunx create-tui@latest -t core my-app
cd my-app
bun run src/index.ts
```

CLI 会为您创建 `my-app` 目录 - 该目录必须**不存在**。

**代理指导**：始终使用带 `-t <template>` 标志的自主模式。切勿使用交互模式（不带 `-t` 的 `bunx create-tui@latest my-app`），因为它需要代理无法响应用户提示。

### 手动设置

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/core
```

```typescript
import { createCliRenderer, TextRenderable, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

// 创建一个盒子容器
const container = new BoxRenderable(renderer, {
  id: "container",
  width: 40,
  height: 10,
  border: true,
  borderStyle: "rounded",
  padding: 1,
})

// 在盒子内创建文本
const greeting = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
})

// 组合树结构
container.add(greeting)
renderer.root.add(container)
```

## 核心概念

### Renderer（渲染器）

`CliRenderer` 协调一切：
- 管理终端视口和备用屏幕
- 处理输入事件（键盘、鼠标、粘贴）
- 运行渲染循环（可配置 FPS）
- 为可渲染树提供根节点

### Renderables vs Constructs

| Renderables（命令式） | Constructs（声明式） |
|--------------------------|--------------------------|
| `new TextRenderable(renderer, {...})` | `Text({...})` |
| 创建时需要 renderer | 创建 VNode，稍后实例化 |
| 通过方法直接修改 | 链式调用被记录，在实例化时重放 |
| 完全控制 | 更清晰的组合 |

### 组合选项

Renderables 可以通过两种方式组合：
1. **命令式**：创建实例，调用 `.add()` 组合
2. **声明式（Constructs）**：创建 VNodes，将子元素作为参数传递

## 基本命令

```bash
bun install @opentui/core     # 安装
bun run src/index.ts          # 直接运行（无需构建）
bun test                      # 运行测试
```

## 运行时要求

OpenTUI 运行在 Bun 上，并使用 Zig 进行原生构建。

```bash
# 包管理
bun install @opentui/core

# 运行
bun run src/index.ts
bun test

# 构建（仅在更改原生代码时需要）
bun run build
```

构建原生组件需要 **Zig**。

## 本参考文档包含

- [配置](./configuration.md) - 渲染器选项、环境变量
- [API](./api.md) - 渲染器、Renderables、类型、工具
- [模式](./patterns.md) - 组合、事件、状态管理
- [陷阱](./gotchas.md) - 常见问题、调试、限制

## 另请参阅

- [React](../react/REFERENCE.md) - 用于声明式 TUI 的 React 协调器
- [Solid](../solid/REFERENCE.md) - 用于声明式 TUI 的 Solid 协调器
- [Layout](../layout/REFERENCE.md) - Yoga/Flexbox 布局系统
- [Components](../components/REFERENCE.md) - 按类别分类的组件参考
- [Keyboard](../keyboard/REFERENCE.md) - 输入处理和快捷键
- [Testing](../testing/REFERENCE.md) - 测试渲染器和快照
