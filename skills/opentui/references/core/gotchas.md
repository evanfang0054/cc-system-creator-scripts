# 核心陷阱和注意事项

## 运行时环境

### 使用 Bun，而非 Node.js

OpenTUI 是为 Bun 构建的。始终使用 Bun 命令：

```bash
# 正确
bun install @opentui/core
bun run src/index.ts
bun test

# 错误
npm install @opentui/core
node src/index.ts
npx jest
```

### 推荐使用的 Bun API

优先使用 Bun 的内置 API：

```typescript
// 正确 - Bun API
Bun.file("path").text()           // 而非 fs.readFile
Bun.serve({ ... })                // 而非 express
Bun.$`ls -la`                     // 而非 execa
import { Database } from "bun:sqlite"  // 而非 better-sqlite3

// 错误 - Node.js 模式
import fs from "node:fs"
import express from "express"
```

### 避免使用 process.exit()

**切勿直接使用 `process.exit()`** - 它会阻止正确的终端清理，并可能使终端处于损坏状态（备用屏幕模式、原始输入模式等）。

```typescript
// 错误 - 终端可能处于损坏状态
if (error) {
  console.error("Fatal error")
  process.exit(1)
}

// 正确 - 使用 renderer.destroy() 进行清理
if (error) {
  console.error("Fatal error")
  await renderer.destroy()
  process.exit(1)  // 仅在 destroy 之后
}

// 更好 - 让 destroy 处理退出
const renderer = await createCliRenderer({
  exitOnCtrlC: true,  // 正确处理 Ctrl+C
})

// 对于程序化退出
renderer.destroy()  // 清理并退出
```

`renderer.destroy()` 在退出前将终端恢复到原始状态。

### 环境变量

Bun 会自动加载 `.env` 文件。不要使用 dotenv：

```typescript
// 正确
const apiKey = process.env.API_KEY

// 错误
import dotenv from "dotenv"
dotenv.config()
```

## 调试 TUI

### 无法看到 console.log 输出

OpenTUI 会捕获控制台输出用于调试覆盖层。在 TUI 运行时，您无法在终端中看到日志。

**解决方案：**

1. **使用控制台覆盖层：**
   ```typescript
   const renderer = await createCliRenderer()
   renderer.console.show()
   console.log("This appears in the overlay")
   ```

2. **使用键盘切换：**
   ```typescript
   renderer.keyInput.on("keypress", (key) => {
     if (key.name === "f12") {
       renderer.console.toggle()
     }
   })
   ```

3. **写入文件：**
   ```typescript
   import { appendFileSync } from "node:fs"
   function debugLog(msg: string) {
     appendFileSync("debug.log", `${new Date().toISOString()} ${msg}\n`)
   }
   ```

4. **禁用控制台捕获：**
   ```bash
   OTUI_USE_CONSOLE=false bun run src/index.ts
   ```

### 在测试中重现问题

不要猜测 bug。创建可重现的测试：

```typescript
import { test, expect } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"

test("reproduces the issue", async () => {
  const { renderer, snapshot } = await createTestRenderer({
    width: 40,
    height: 10,
  })

  // 重现 bug 的设置
  const box = new BoxRenderable(renderer, { ... })
  renderer.root.add(box)

  // 使用快照验证
  expect(snapshot()).toMatchSnapshot()
})
```

## 焦点管理

### 组件必须获得焦点

输入组件只有在获得焦点时才接收键盘输入：

```typescript
const input = new InputRenderable(renderer, {
  id: "input",
  placeholder: "Type here...",
})

renderer.root.add(input)

// 错误 - 输入框不会接收按键
//（没有调用 focus）

// 正确
input.focus()
```

### 嵌套组件中的焦点

当组件在容器内时，直接聚焦该组件：

```typescript
const container = new BoxRenderable(renderer, { id: "container" })
const input = new InputRenderable(renderer, { id: "input" })
container.add(input)
renderer.root.add(container)

// 错误
container.focus()

// 正确
input.focus()

// 或使用 getRenderable
container.getRenderable("input")?.focus()

// 或使用 delegate（constructs）
const form = delegate(
  { focus: "input" },
  Box({}, Input({ id: "input" })),
)
form.focus()  // 路由到输入框
```

## 构建要求

### 需要 Zig

原生代码编译需要 Zig：

```bash
# 首先安装 Zig
# macOS
brew install zig

# Linux
# 从 https://ziglang.org/download/ 下载

# 然后构建
bun run build
```

### 何时构建

- **TypeScript 更改**：不需要构建（Bun 直接运行 TS）
- **原生代码更改**：需要构建

```bash
# 仅在更改原生（Zig）代码时需要
cd packages/core
bun run build
```

## 常见错误

### "无法读取 undefined 的属性"

通常意味着 renderable 未被添加到树中：

```typescript
// 错误 - 未添加到树中
const text = new TextRenderable(renderer, { content: "Hello" })
// text.someMethod() // 可能失败

// 正确
const text = new TextRenderable(renderer, { content: "Hello" })
renderer.root.add(text)
text.someMethod()
```

### 布局未更新

Yoga 布局是延迟计算的。强制重新计算：

```typescript
// 更改布局属性后
box.setWidth(newWidth)
renderer.requestRender()
```

### 文本溢出/裁剪

文本默认不换行。设置显式宽度：

```typescript
// 可能溢出
const text = new TextRenderable(renderer, {
  content: "Very long text that might overflow the terminal...",
})

// 包含在宽度内
const text = new TextRenderable(renderer, {
  content: "Very long text that might overflow the terminal...",
  width: 40,  // 将基于父元素裁剪或换行
})
```

### 颜色不显示

检查终端能力和颜色格式：

```typescript
// 正确的格式
fg: "#FF0000"           // 十六进制
fg: "red"               // CSS 颜色名称
fg: RGBA.fromHex("#FF0000")

// 错误
fg: "FF0000"            // 缺少 #
fg: 0xFF0000            // 数字（不支持）
```

## 性能

### 避免频繁重新渲染

尽可能批量更新：

```typescript
// 错误 - 多次渲染调用
item1.setContent("...")
item2.setContent("...")
item3.setContent("...")

// 更好 - 所有更新后单次渲染
//（OpenTUI 会自动批量处理，但要注意）
items.forEach((item, i) => {
  item.setContent(data[i])
})
```

### 最小化树深度

深度嵌套会影响布局计算：

```typescript
// 避免不必要的包装器
// 错误
Box({}, Box({}, Box({}, Text({ content: "Hello" }))))

// 正确
Box({}, Text({ content: "Hello" }))
```

### 使用 display: none

隐藏元素而不是移除/重新添加：

```typescript
// 用于切换可见性
element.setDisplay("none")   // 隐藏
element.setDisplay("flex")   // 可见

// 而不是
parent.remove(element)
parent.add(element)
```

## 测试

### 测试运行器

使用 Bun 的测试运行器：

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test"

test("my test", () => {
  expect(1 + 1).toBe(2)
})
```

### 从包目录运行测试

从特定包目录运行测试：

```bash
# 正确
cd packages/core
bun test

# 对于原生测试
cd packages/core
bun run test:native
```

### 过滤测试

```bash
# Bun 测试过滤器
bun test --filter "component name"

# 原生测试过滤器
bun run test:native -Dtest-filter="test name"
```

## 键盘处理

### 键名

`KeyEvent.name` 的常见键名：

```typescript
// 字母/数字
"a", "b", ..., "z"
"1", "2", ..., "0"

// 特殊键
"escape", "enter", "return", "tab", "backspace", "delete"
"up", "down", "left", "right"
"home", "end", "pageup", "pagedown"
"f1", "f2", ..., "f12"
"space"

// 修饰键（检查布尔属性）
key.ctrl   // 按住 Ctrl
key.shift  // 按住 Shift
key.meta   // 按住 Alt
key.option // 按住 Option（macOS）
```

### 键盘事件类型

```typescript
renderer.keyInput.on("keypress", (key) => {
  // eventType: "press" | "release" | "repeat"
  if (key.eventType === "repeat") {
    // 键正被按住
  }
})
```
