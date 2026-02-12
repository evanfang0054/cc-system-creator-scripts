# 测试 OpenTUI 应用程序

如何测试使用 OpenTUI 构建的终端用户界面。

## 概述

OpenTUI 提供：
- **Test Renderer（测试渲染器）**：用于测试的无头渲染器
- **Snapshot Testing（快照测试）**：验证可视化输出
- **Interaction Testing（交互测试）**：模拟用户输入

## 使用场景

当您需要快照测试、交互测试或基于渲染器的回归检查时，请参考本文档。

## 测试设置

### Bun 测试运行器

OpenTUI 使用 Bun 内置的测试运行器：

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test"
```

### 测试渲染器

创建用于无头测试的测试渲染器：

```typescript
import { createTestRenderer } from "@opentui/core/testing"

const testSetup = await createTestRenderer({
  width: 80,     // 终端宽度
  height: 24,    // 终端高度
})
```

## 核心测试

### 基础测试

```typescript
import { test, expect } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"
import { TextRenderable } from "@opentui/core"

test("renders text", async () => {
  const testSetup = await createTestRenderer({
    width: 40,
    height: 10,
  })
  
  const text = new TextRenderable(testSetup.renderer, {
    id: "greeting",
    content: "Hello, World!",
  })
  
  testSetup.renderer.root.add(text)
  await testSetup.renderOnce()
  
  expect(testSetup.captureCharFrame()).toContain("Hello, World!")
})
```

### 快照测试

```typescript
import { test, expect, afterEach } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"
import { BoxRenderable, TextRenderable } from "@opentui/core"

let testSetup: Awaited<ReturnType<typeof createTestRenderer>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("component matches snapshot", async () => {
  testSetup = await createTestRenderer({
    width: 40,
    height: 10,
  })
  
  const box = new BoxRenderable(testSetup.renderer, {
    id: "box",
    border: true,
    width: 20,
    height: 5,
  })
  box.add(new TextRenderable(testSetup.renderer, {
    content: "Content",
  }))
  
  testSetup.renderer.root.add(box)
  await testSetup.renderOnce()
  
  expect(testSetup.captureCharFrame()).toMatchSnapshot()
})
```

## React 测试

### 测试工具

React 通过 `@opentui/react/test-utils` 子路径导出提供内置的 `testRender` 工具：

```tsx
import { testRender } from "@opentui/react/test-utils"
```

该工具：
- 创建一个无头测试渲染器
- 自动设置 React Act 环境
- 在销毁时处理正确的卸载
- 返回标准测试设置对象

### 基础组件测试

```tsx
import { test, expect } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

function Greeting({ name }: { name: string }) {
  return <text>Hello, {name}!</text>
}

test("Greeting renders name", async () => {
  const testSetup = await testRender(
    <Greeting name="World" />,
    { width: 80, height: 24 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  
  expect(frame).toContain("Hello, World!")
})
```

### 快照测试

```tsx
import { test, expect, afterEach } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("component matches snapshot", async () => {
  testSetup = await testRender(
    <box style={{ width: 20, height: 5, border: true }}>
      <text>Content</text>
    </box>,
    { width: 25, height: 8 }
  )

  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()

  expect(frame).toMatchSnapshot()
})
```

### 状态测试

```tsx
import { test, expect, afterEach } from "bun:test"
import { useState } from "react"
import { testRender } from "@opentui/react/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <box>
      <text>Count: {count}</text>
    </box>
  )
}

test("Counter shows initial value", async () => {
  testSetup = await testRender(
    <Counter />,
    { width: 20, height: 5 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  
  expect(frame).toContain("Count: 0")
})
```

### 测试设置/清理模式

对于多个测试，使用 beforeEach/afterEach 来管理渲染器生命周期：

```tsx
import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

describe("MyComponent", () => {
  beforeEach(async () => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  afterEach(() => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  test("renders correctly", async () => {
    testSetup = await testRender(<MyComponent />, {
      width: 40,
      height: 10,
    })

    await testSetup.renderOnce()
    const frame = testSetup.captureCharFrame()
    expect(frame).toMatchSnapshot()
  })
})
```

### 测试设置返回对象

`testRender` 函数返回一个具有以下属性的测试设置对象：

| Property | Type | Description |
|----------|------|-------------|
| `renderer` | `Renderer` | 无头渲染器实例 |
| `renderOnce` | `() => Promise<void>` | 触发单个渲染周期 |
| `captureCharFrame` | `() => string` | 以文本形式捕获当前输出 |
| `resize` | `(width, height) => void` | 调整虚拟终端大小 |

## Solid 测试

### 测试工具

Solid 从主包直接导出 `testRender`：

```tsx
import { testRender } from "@opentui/solid"
```

注意：与 React 不同，Solid 的 `testRender` 接受一个**函数组件**（而不是 JSX 元素）。

### 基础组件测试

```tsx
import { test, expect } from "bun:test"
import { testRender } from "@opentui/solid"

function Greeting(props: { name: string }) {
  return <text>Hello, {props.name}!</text>
}

test("Greeting renders name", async () => {
  const testSetup = await testRender(
    () => <Greeting name="World" />,
    { width: 80, height: 24 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  
  expect(frame).toContain("Hello, World!")
})
```

### 快照测试

```tsx
import { test, expect, afterEach } from "bun:test"
import { testRender } from "@opentui/solid"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("component matches snapshot", async () => {
  testSetup = await testRender(
    () => (
      <box style={{ width: 20, height: 5, border: true }}>
        <text>Content</text>
      </box>
    ),
    { width: 25, height: 8 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  
  expect(frame).toMatchSnapshot()
})
```

## 快照格式

快照以文本形式捕获渲染的终端输出：

```
┌──────────────────┐
│ Hello, World!    │
│                  │
└──────────────────┘
```

### 更新快照

```bash
bun test --update-snapshots
```

## 交互测试

### 模拟按键

```typescript
import { test, expect, afterEach } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"

let testSetup: Awaited<ReturnType<typeof createTestRenderer>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("responds to keyboard", async () => {
  testSetup = await createTestRenderer({
    width: 40,
    height: 10,
  })

  // 创建响应按键的组件
  // ...

  // 模拟按键
  testSetup.renderer.keyInput.emit("keypress", {
    name: "enter",
    sequence: "\r",
    ctrl: false,
    shift: false,
    meta: false,
    option: false,
    eventType: "press",
    repeated: false,
  })

  // 在按键后渲染
  await testSetup.renderOnce()

  expect(testSetup.captureCharFrame()).toContain("Selected")
})
```

### 测试焦点

```typescript
import { test, expect, afterEach } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"
import { InputRenderable } from "@opentui/core"

let testSetup: Awaited<ReturnType<typeof createTestRenderer>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("input receives focus", async () => {
  testSetup = await createTestRenderer({
    width: 40,
    height: 10,
  })
  
  const input = new InputRenderable(testSetup.renderer, {
    id: "test-input",
    placeholder: "Type here",
  })
  testSetup.renderer.root.add(input)
  
  input.focus()
  
  expect(input.isFocused()).toBe(true)
})
```

## 测试组织

### 文件结构

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useCounter.ts
│   └── useCounter.test.ts
└── test-utils.tsx
```

### 运行测试

```bash
# 运行所有测试
bun test

# 运行特定测试文件
bun test src/components/Button.test.tsx

# 使用过滤器运行
bun test --filter "Button"

# 监视模式
bun test --watch
```

## 模式

### 测试条件渲染（React）

```tsx
import { test, expect, afterEach } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("shows loading state", async () => {
  testSetup = await testRender(
    <DataLoader loading={true} />,
    { width: 40, height: 10 }
  )
  
  await testSetup.renderOnce()
  expect(testSetup.captureCharFrame()).toContain("Loading...")
})

test("shows data when loaded", async () => {
  testSetup = await testRender(
    <DataLoader loading={false} data={["Item 1", "Item 2"]} />,
    { width: 40, height: 10 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  expect(frame).toContain("Item 1")
  expect(frame).toContain("Item 2")
})
```

### 测试列表

```tsx
test("renders all items", async () => {
  const items = ["Apple", "Banana", "Cherry"]
  
  testSetup = await testRender(
    <ItemList items={items} />,
    { width: 40, height: 10 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()
  
  items.forEach(item => {
    expect(frame).toContain(item)
  })
})
```

### 测试布局

```tsx
test("matches layout snapshot", async () => {
  testSetup = await testRender(
    <AppLayout />,
    { width: 120, height: 40 }  // 更大的视口
  )
  
  await testSetup.renderOnce()
  expect(testSetup.captureCharFrame()).toMatchSnapshot()
})
```

## 调试测试

### 打印帧输出

```tsx
import { testRender } from "@opentui/react/test-utils"

test("debug output", async () => {
  const testSetup = await testRender(
    <MyComponent />,
    { width: 40, height: 10 }
  )
  
  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()

  // 打印以查看渲染内容
  console.log(frame)

  expect(frame).toContain("expected")
})
```

### 详细模式

```bash
bun test --verbose
```

## 注意事项

### 异步渲染

在设置组件后始终调用 `renderOnce()` 以确保渲染完成：

```typescript
const testSetup = await testRender(<MyComponent />, { width: 40, height: 10 })
await testSetup.renderOnce()  // 在捕获帧之前必须调用
const frame = testSetup.captureCharFrame()
```

### 测试隔离和清理

在每个测试后始终销毁渲染器以避免资源泄漏：

```typescript
import { afterEach } from "bun:test"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("test 1", async () => {
  testSetup = await testRender(<Component1 />, { width: 40, height: 10 })
  // ...
})

test("test 2", async () => {
  testSetup = await testRender(<Component2 />, { width: 40, height: 10 })
  // ...
})
```

### 快照尺寸

为稳定的快照保持一致的测试尺寸：

```typescript
const testSetup = await createTestRenderer({
  width: 80,   // 标准宽度
  height: 24,  // 标准高度
})
```

### 从包目录运行

从包目录运行测试：

```bash
cd packages/core
bun test

# 不要从仓库根目录运行包特定的测试
```
