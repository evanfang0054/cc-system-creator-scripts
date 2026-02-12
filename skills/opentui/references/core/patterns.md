# 核心模式

## 组合模式

### 命令式组合

创建 renderables 并使用 `.add()` 组合：

```typescript
import { createCliRenderer, BoxRenderable, TextRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

// 创建父元素
const container = new BoxRenderable(renderer, {
  id: "container",
  flexDirection: "column",
  padding: 1,
})

// 创建子元素
const header = new TextRenderable(renderer, {
  id: "header",
  content: "Header",
  fg: "#00FF00",
})

const body = new TextRenderable(renderer, {
  id: "body",
  content: "Body content",
})

// 组合树结构
container.add(header)
container.add(body)
renderer.root.add(container)
```

### 声明式组合（Constructs）

使用 VNode 函数进行更清晰的组合：

```typescript
import { createCliRenderer, Box, Text, Input, delegate } from "@opentui/core"

const renderer = await createCliRenderer()

// 作为函数调用组合
const ui = Box(
  { flexDirection: "column", padding: 1 },
  Text({ content: "Header", fg: "#00FF00" }),
  Box(
    { flexDirection: "row", gap: 2 },
    Text({ content: "Name:" }),
    Input({ id: "name", placeholder: "Enter name..." }),
  ),
)

renderer.root.add(ui)
```

### 可重用组件

为可重用的 UI 部分创建工厂函数：

```typescript
// 命令式工厂
function createLabeledInput(
  renderer: RenderContext,
  props: { id: string; label: string; placeholder: string }
) {
  const container = new BoxRenderable(renderer, {
    id: `${props.id}-container`,
    flexDirection: "row",
    gap: 1,
  })

  container.add(new TextRenderable(renderer, {
    id: `${props.id}-label`,
    content: props.label,
  }))

  container.add(new InputRenderable(renderer, {
    id: `${props.id}-input`,
    placeholder: props.placeholder,
    width: 20,
  }))

  return container
}

// 声明式工厂
function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    { focus: `${props.id}-input` },
    Box(
      { flexDirection: "row", gap: 1 },
      Text({ content: props.label }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
      }),
    ),
  )
}
```

### 焦点委托

将焦点调用路由到嵌套元素：

```typescript
import { delegate, Box, Input, Text } from "@opentui/core"

const form = delegate(
  {
    focus: "email-input",     // 将 .focus() 路由到此子元素
    blur: "email-input",      // 将 .blur() 路由此子元素
  },
  Box(
    { border: true, padding: 1 },
    Text({ content: "Email:" }),
    Input({ id: "email-input", placeholder: "you@example.com" }),
  ),
)

// 这会聚焦内部的输入框，而不是盒子
form.focus()
```

## 事件处理

### 键盘事件

```typescript
const renderer = await createCliRenderer()

// 全局键盘处理器
renderer.keyInput.on("keypress", (key) => {
  if (key.name === "escape") {
    renderer.destroy()
    process.exit(0)
  }

  if (key.ctrl && key.name === "c") {
    // Ctrl+C 处理（如果 exitOnCtrlC 为 false）
  }

  if (key.name === "tab") {
    // Tab 导航
    focusNext()
  }
})

// 粘贴事件
renderer.keyInput.on("paste", (text) => {
  currentInput?.setValue(currentInput.value + text)
})
```

### 组件事件

```typescript
import { InputRenderable, InputRenderableEvents } from "@opentui/core"

const input = new InputRenderable(renderer, {
  id: "search",
  placeholder: "Search...",
})

input.on(InputRenderableEvents.CHANGE, (value) => {
  performSearch(value)
})

// 选择事件
const select = new SelectRenderable(renderer, {
  id: "menu",
  options: [...],
})

select.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  handleSelection(option)
})

select.on(SelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
  showPreview(option)
})
```

### 鼠标事件

```typescript
const button = new BoxRenderable(renderer, {
  id: "button",
  border: true,
  onMouseDown: (event) => {
    button.setBackgroundColor("#444444")
  },
  onMouseUp: (event) => {
    button.setBackgroundColor("#222222")
    handleClick()
  },
  onMouseMove: (event) => {
    // 悬停效果
  },
})
```

## 状态管理

### 本地状态

在闭包或对象中管理状态：

```typescript
// 基于闭包的状态
function createCounter(renderer: RenderContext) {
  let count = 0

  const display = new TextRenderable(renderer, {
    id: "count",
    content: `Count: ${count}`,
  })

  const increment = () => {
    count++
    display.setContent(`Count: ${count}`)
  }

  return { display, increment }
}

// 基于类的状态
class CounterWidget {
  private count = 0
  private display: TextRenderable

  constructor(renderer: RenderContext) {
    this.display = new TextRenderable(renderer, {
      id: "count",
      content: this.formatCount(),
    })
  }

  private formatCount() {
    return `Count: ${this.count}`
  }

  increment() {
    this.count++
    this.display.setContent(this.formatCount())
  }

  getRenderable() {
    return this.display
  }
}
```

### 焦点管理

跨组件跟踪和管理焦点：

```typescript
class FocusManager {
  private focusables: Renderable[] = []
  private currentIndex = 0

  register(renderable: Renderable) {
    this.focusables.push(renderable)
  }

  focusNext() {
    this.focusables[this.currentIndex]?.blur()
    this.currentIndex = (this.currentIndex + 1) % this.focusables.length
    this.focusables[this.currentIndex]?.focus()
  }

  focusPrevious() {
    this.focusables[this.currentIndex]?.blur()
    this.currentIndex = (this.currentIndex - 1 + this.focusables.length) % this.focusables.length
    this.focusables[this.currentIndex]?.focus()
  }
}

// 使用
const focusManager = new FocusManager()
focusManager.register(input1)
focusManager.register(input2)
focusManager.register(select1)

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "tab") {
    key.shift ? focusManager.focusPrevious() : focusManager.focusNext()
  }
})
```

## 生命周期模式

### 清理

始终清理资源：

```typescript
const renderer = await createCliRenderer()

// 跟踪 intervals/timeouts
const intervals: Timer[] = []

intervals.push(setInterval(() => {
  updateClock()
}, 1000))

// 退出时清理
process.on("SIGINT", () => {
  intervals.forEach(clearInterval)
  renderer.destroy()
  process.exit(0)
})

// 或使用 onDestroy 回调
const renderer = await createCliRenderer({
  onDestroy: () => {
    intervals.forEach(clearInterval)
  },
})
```

### 动态更新

基于外部数据更新 UI：

```typescript
async function createDashboard(renderer: RenderContext) {
  const statsText = new TextRenderable(renderer, {
    id: "stats",
    content: "Loading...",
  })

  // 轮询更新
  const updateStats = async () => {
    const data = await fetchStats()
    statsText.setContent(`CPU: ${data.cpu}% | Memory: ${data.memory}%`)
  }

  // 初始加载
  await updateStats()

  // 定期更新
  setInterval(updateStats, 5000)

  return statsText
}
```

## 布局模式

### 响应式布局

适应终端尺寸：

```typescript
const renderer = await createCliRenderer()

const mainPanel = new BoxRenderable(renderer, {
  id: "main",
  width: "100%",
  height: "100%",
  flexDirection: renderer.width > 80 ? "row" : "column",
})

// 监听调整大小
process.stdout.on("resize", () => {
  mainPanel.setFlexDirection(renderer.width > 80 ? "row" : "column")
})
```

### 分割面板

```typescript
function createSplitView(renderer: RenderContext, ratio = 0.3) {
  const container = new BoxRenderable(renderer, {
    id: "split",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  })

  const left = new BoxRenderable(renderer, {
    id: "left",
    width: `${ratio * 100}%`,
    border: true,
  })

  const right = new BoxRenderable(renderer, {
    id: "right",
    flexGrow: 1,
    border: true,
  })

  container.add(left)
  container.add(right)

  return { container, left, right }
}
```

## 调试模式

### 控制台覆盖层

使用内置控制台进行调试：

```typescript
const renderer = await createCliRenderer({
  consoleOptions: {
    startInDebugMode: true,
  },
})

// 显示控制台
renderer.console.show()

// 所有控制台方法都可用
console.log("Debug info")
console.warn("Warning")
console.error("Error")

// 使用键盘切换
renderer.keyInput.on("keypress", (key) => {
  if (key.name === "f12") {
    renderer.console.toggle()
  }
})
```

### 状态检查

```typescript
function debugState(label: string, state: unknown) {
  console.log(`[${label}]`, JSON.stringify(state, null, 2))
}

// 在您的更新逻辑中
debugState("form", { name: nameInput.value, email: emailInput.value })
```
