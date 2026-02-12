# Solid 注意事项

## 关键问题

### 永远不要直接使用 `process.exit()`

**这是最常见的错误。** 使用 `process.exit()` 会使终端处于损坏状态（光标隐藏、原始模式、备用屏幕）。

```tsx
// 错误 - 终端处于损坏状态
process.exit(0)

// 正确 - 使用 renderer.destroy()
import { useRenderer } from "@opentui/solid"

function App() {
  const renderer = useRenderer()

  const handleExit = () => {
    renderer.destroy()  // 正确清理并退出
  }
}
```

`renderer.destroy()` 会在退出前恢复终端（退出备用屏幕、恢复光标等）。

## 配置问题

### 缺少 bunfig.toml

**症状**：JSX 语法错误，组件不渲染

```
SyntaxError: Unexpected token '<'
```

**修复**：在项目根目录创建 `bunfig.toml`：

```toml
preload = ["@opentui/solid/preload"]
```

### JSX 设置错误

**症状**：JSX 编译为 React，关于找不到 React 的错误

**修复**：确保 tsconfig.json 包含：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid"
  }
}
```

### 构建时缺少插件

**症状**：构建包包含原始 JSX

**修复**：在构建中添加 Solid 插件：

```typescript
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  // ...
  plugins: [solidPlugin],
})
```

## 响应式问题

### 未调用 Signals

**症状**：值永不更新，显示 `[Function]`

```tsx
// 错误 - 缺少 ()
const [count, setCount] = createSignal(0)
<text>Count: {count}</text>  // 显示 [Function]

// 正确
<text>Count: {count()}</text>
```

### 解构破坏响应式

**症状**：Props 停止响应式更新

```tsx
// 错误 - 破坏响应式
function Component(props: { value: number }) {
  const { value } = props  // 解构一次，永不更新！
  return <text>{value}</text>
}

// 正确 - 保持 props 响应式
function Component(props: { value: number }) {
  return <text>{props.value}</text>
}

// 或使用 splitProps
function Component(props: { value: number; other: string }) {
  const [local, rest] = splitProps(props, ["value"])
  return <text>{local.value}</text>
}
```

### Effects 不运行

**症状**：createEffect 不触发

```tsx
// 错误 - 在 effect 中未访问 signal
const [count, setCount] = createSignal(0)

createEffect(() => {
  console.log("Count changed")  // 初始后永不运行！
})

// 正确 - 访问 signal
createEffect(() => {
  console.log("Count:", count())  // 当 count 变化时运行
})
```

## 组件命名

### 下划线 vs 连字符

Solid 使用下划线命名多词组件：

```tsx
// 错误 - React 风格命名
<tab-select />    // 错误！
<ascii-font />    // 错误！
<line-number />   // 错误！

// 正确 - Solid 命名
<tab_select />
<ascii_font />
<line_number />
```

**组件映射：**
| 概念 | React | Solid |
|---------|-------|-------|
| Tab Select | `<tab-select>` | `<tab_select>` |
| ASCII Font | `<ascii-font>` | `<ascii_font>` |
| Line Number | `<line-number>` | `<line_number>` |

## 焦点问题

### 焦点不工作

组件需要显式焦点：

```tsx
// 错误
<input placeholder="Type here..." />

// 正确
<input placeholder="Type here..." focused />
```

### Select 不响应

```tsx
// 错误
<select options={["a", "b"]} />

// 正确
<select
  options={[
    { name: "A", description: "Option A", value: "a" },
    { name: "B", description: "Option B", value: "b" },
  ]}
  onSelect={(index, option) => {
    // 按下 Enter 时调用
    console.log("Selected:", option.name)
  }}
  focused
/>
```

### Select 事件混淆

记住：`onSelect` 在按 Enter 时触发（确认选择），`onChange` 在导航时触发：

```tsx
// 错误 - 期望 onChange 在按 Enter 时触发
<select
  options={options()}
  onChange={(i, opt) => submitForm(opt)}  // 这在箭头键时触发！
/>

// 正确
<select
  options={options()}
  onSelect={(i, opt) => submitForm(opt)}   // 按下 Enter - 提交
  onChange={(i, opt) => showPreview(opt)}  // 箭头键 - 预览
/>
```

## 控制流问题

### For vs Index

对对象数组使用 `For`，对基本类型使用 `Index`：

```tsx
// 对于对象 - item 是响应式的
<For each={objects()}>
  {(obj) => <text>{obj.name}</text>}
</For>

// 对于基本类型 - 使用 Index，item() 是响应式的
<Index each={strings()}>
  {(str, index) => <text>{index}: {str()}</text>}
</Index>
```

### 缺少 Fallback

Show 需要 fallback 以正确渲染：

```tsx
// 可能导致问题
<Show when={data()}>
  <Component />
</Show>

// 更好 - 显式 fallback
<Show when={data()} fallback={<text>Loading...</text>}>
  <Component />
</Show>
```

## 清理问题

### 忘记 onCleanup

**症状**：内存泄漏，多个 intervals 运行

```tsx
// 错误 - Interval 从不清理
function Timer() {
  const [time, setTime] = createSignal(0)

  setInterval(() => setTime(t => t + 1), 1000)

  return <text>{time()}</text>
}

// 正确
function Timer() {
  const [time, setTime] = createSignal(0)

  const interval = setInterval(() => setTime(t => t + 1), 1000)
  onCleanup(() => clearInterval(interval))

  return <text>{time()}</text>
}
```

### Effect 清理

```tsx
createEffect(() => {
  const subscription = subscribe(data())

  // 错误 - 无清理
  // subscription 保持活动

  // 正确
  onCleanup(() => subscription.unsubscribe())
})
```

## Store 问题

### 直接修改 Store

**症状**：更改不触发更新

```tsx
const [state, setState] = createStore({ items: [] })

// 错误 - 直接修改
state.items.push(newItem)  // 不会触发更新！

// 正确 - 使用 setState
setState("items", items => [...items, newItem])
```

### 嵌套更新

```tsx
const [state, setState] = createStore({
  user: { profile: { name: "John" } }
})

// 错误
state.user.profile.name = "Jane"

// 正确
setState("user", "profile", "name", "Jane")
```

## 调试

### 控制台不可见

OpenTUI 捕获控制台输出：

```tsx
import { useRenderer } from "@opentui/solid"
import { onMount } from "solid-js"

function App() {
  const renderer = useRenderer()

  onMount(() => {
    renderer.console.show()
    console.log("Now visible!")
  })

  return <box>{/* ... */}</box>
}
```

### 跟踪响应式

使用 `createEffect` 调试：

```tsx
createEffect(() => {
  console.log("State:", {
    count: count(),
    items: items(),
  })
})
```

## 运行时问题

### 使用 Bun

```bash
# 错误
node src/index.tsx
npm run start

# 正确
bun run src/index.tsx
bun run start
```

### Async render()

创建渲染器时 render 函数是异步的：

```tsx
// 这是可以的 - Bun 支持顶层 await
render(() => <App />)

// 如果你需要渲染器
import { createCliRenderer } from "@opentui/core"
import { render } from "@opentui/solid"

const renderer = await createCliRenderer()
render(() => <App />, renderer)
```

## 常见错误消息

### "Cannot read properties of undefined"

通常是缺少响应式访问：

```tsx
// 检查 signal 是否被调用
<text>{count()}</text>  // 注意 ()

// 检查 props 是否被正确访问
<text>{props.value}</text>  // 不要解构
```

### "JSX element has no corresponding closing tag"

检查组件命名：

```tsx
// 错误
<tab-select></tab-select>

// 正确
<tab_select></tab_select>
```

### "store is not a function"

Store 不像 signals 那样调用：

```tsx
const [store, setStore] = createStore({ count: 0 })

// 错误
<text>{store().count}</text>

// 正确
<text>{store.count}</text>
```
