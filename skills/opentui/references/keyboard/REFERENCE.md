# 键盘输入处理

如何在 OpenTUI 应用程序中处理键盘输入。

## 概述

OpenTUI 通过以下方式提供键盘输入处理：
- **Core**: `renderer.keyInput` EventEmitter
- **React**: `useKeyboard()` hook
- **Solid**: `useKeyboard()` hook

## 使用场景

当您需要键盘快捷键、感知焦点的输入处理或自定义键绑定时，请参考此文档。

## KeyEvent 对象

所有键盘处理器都接收一个 `KeyEvent` 对象：

```typescript
interface KeyEvent {
  name: string          // 按键名称："a"、"escape"、"f1" 等
  sequence: string      // 原始转义序列
  ctrl: boolean         // 按住了 Ctrl 修饰键
  shift: boolean        // 按住了 Shift 修饰键
  meta: boolean         // 按住了 Alt 修饰键
  option: boolean       // 按住了 Option 修饰键（macOS）
  eventType: "press" | "release" | "repeat"
  repeated: boolean     // 按键正在被按住（重复事件）
}
```

## 基本用法

### Core

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  if (key.name === "escape") {
    renderer.destroy()
    return
  }

  if (key.ctrl && key.name === "s") {
    saveDocument()
  }
})
```

### React

```tsx
import { useKeyboard, useRenderer } from "@opentui/react"

function App() {
  const renderer = useRenderer()
  useKeyboard((key) => {
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return <text>按 ESC 退出</text>
}
```


### Solid

```tsx
import { useKeyboard, useRenderer } from "@opentui/solid"

function App() {
  const renderer = useRenderer()
  useKeyboard((key) => {
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return <text>按 ESC 退出</text>
}
```

## 按键名称

### 字母键

小写：`a`、`b`、`c`...`z`

按住 Shift：检查 `key.shift && key.name === "a"` 表示大写

### 数字键

`0`、`1`、`2`...`9`

### 功能键

`f1`、`f2`、`f3`...`f12`

### 特殊键

| 按键名称 | 描述 |
|----------|-------------|
| `escape` | Escape 键 |
| `enter` | Enter/Return |
| `return` | Enter/Return（别名） |
| `tab` | Tab 键 |
| `backspace` | Backspace |
| `delete` | Delete 键 |
| `space` | 空格键 |

### 方向键

| 按键名称 | 描述 |
|----------|-------------|
| `up` | 向上箭头 |
| `down` | 向下箭头 |
| `left` | 向左箭头 |
| `right` | 向右箭头 |

### 导航键

| 按键名称 | 描述 |
|----------|-------------|
| `home` | Home 键 |
| `end` | End 键 |
| `pageup` | Page Up |
| `pagedown` | Page Down |
| `insert` | Insert 键 |

## 修饰键

检查 `KeyEvent` 上的修饰键属性：

```typescript
renderer.keyInput.on("keypress", (key) => {
  if (key.ctrl && key.name === "c") {
    // Ctrl+C
  }

  if (key.shift && key.name === "tab") {
    // Shift+Tab
  }

  if (key.meta && key.name === "s") {
    // Alt+S（在大多数系统上 meta = Alt）
  }

  if (key.option && key.name === "a") {
    // Option+A（macOS）
  }
})
```

### 修饰键组合

```typescript
// Ctrl+Shift+S
if (key.ctrl && key.shift && key.name === "s") {
  saveAs()
}

// Ctrl+Alt+Delete（注意系统快捷键！）
if (key.ctrl && key.meta && key.name === "delete") {
  // ...
}
```

## 事件类型

### 按下事件（默认）

正常的按键按下：

```typescript
renderer.keyInput.on("keypress", (key) => {
  if (key.eventType === "press") {
    // 初始按键按下
  }
})
```

### 重复事件

按键被按住：

```typescript
renderer.keyInput.on("keypress", (key) => {
  if (key.eventType === "repeat" || key.repeated) {
    // 按键正在被按住
  }
})
```

### 释放事件

按键释放（可选启用）：

```tsx
// React
useKeyboard(
  (key) => {
    if (key.eventType === "release") {
      // 按键释放
    }
  },
  { release: true }  // 启用释放事件
)

// Solid
useKeyboard(
  (key) => {
    if (key.eventType === "release") {
      // 按键释放
    }
  },
  { release: true }
)
```

## 模式

### 导航菜单

```tsx
function Menu() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const items = ["Home", "Settings", "Help", "Quit"]

  useKeyboard((key) => {
    switch (key.name) {
      case "up":
      case "k":
        setSelectedIndex(i => Math.max(0, i - 1))
        break
      case "down":
      case "j":
        setSelectedIndex(i => Math.min(items.length - 1, i + 1))
        break
      case "enter":
        handleSelect(items[selectedIndex])
        break
    }
  })

  return (
    <box flexDirection="column">
      {items.map((item, i) => (
        <text
          key={item}
          fg={i === selectedIndex ? "#00FF00" : "#FFFFFF"}
        >
          {i === selectedIndex ? "> " : "  "}{item}
        </text>
      ))}
    </box>
  )
}
```

### 模态框退出

```tsx
function Modal({ onClose, children }) {
  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose()
    }
  })

  return (
    <box border padding={2}>
      {children}
    </box>
  )
}
```

### Vim 风格模式

```tsx
function Editor() {
  const [mode, setMode] = useState<"normal" | "insert">("normal")
  const [content, setContent] = useState("")

  useKeyboard((key) => {
    if (mode === "normal") {
      switch (key.name) {
        case "i":
          setMode("insert")
          break
        case "escape":
          // 已经在 normal 模式中
          break
        case "j":
          moveCursorDown()
          break
        case "k":
          moveCursorUp()
          break
      }
    } else if (mode === "insert") {
      if (key.name === "escape") {
        setMode("normal")
      }
      // 输入组件在 insert 模式下处理文本
    }
  })

  return (
    <box flexDirection="column">
      <text>模式: {mode}</text>
      <textarea
        value={content}
        onChange={setContent}
        focused={mode === "insert"}
      />
    </box>
  )
}
```

### 游戏控制

```tsx
function Game() {
  const [pressed, setPressed] = useState(new Set<string>())

  useKeyboard(
    (key) => {
      setPressed(keys => {
        const newKeys = new Set(keys)
        if (key.eventType === "release") {
          newKeys.delete(key.name)
        } else {
          newKeys.add(key.name)
        }
        return newKeys
      })
    },
    { release: true }
  )

  // 游戏逻辑使用按下按键的集合
  useEffect(() => {
    if (pressed.has("up") || pressed.has("w")) {
      moveUp()
    }
    if (pressed.has("down") || pressed.has("s")) {
      moveDown()
    }
  }, [pressed])

  return <text>使用 WASD 或方向键移动</text>
}
```

### 键盘快捷键帮助

```tsx
function ShortcutsHelp() {
  const shortcuts = [
    { keys: "Ctrl+S", action: "保存" },
    { keys: "Ctrl+Q", action: "退出" },
    { keys: "Ctrl+F", action: "查找" },
    { keys: "Tab", action: "下一个字段" },
    { keys: "Shift+Tab", action: "上一个字段" },
  ]

  return (
    <box border title="键盘快捷键" padding={1}>
      {shortcuts.map(({ keys, action }) => (
        <box key={keys} flexDirection="row">
          <text width={15} fg="#00FFFF">{keys}</text>
          <text>{action}</text>
        </box>
      ))}
    </box>
  )
}
```

## 粘贴事件

处理粘贴的文本：

### Core

```typescript
renderer.keyInput.on("paste", (text: string) => {
  console.log("粘贴的文本:", text)
})
```

### React/Solid

```tsx
// 目前通过全局键盘监听器处理
// 或通过输入组件的 onChange 处理
```

## 焦点和输入组件

输入组件（`<input>`、`<textarea>`、`<select>`）在获得焦点时会捕获键盘事件：

```tsx
<input focused />  // 接收键盘输入

// 全局 useKeyboard 仍然会触发，但输入组件会消耗字符
```

为了防止冲突，在处理全局快捷键之前检查是否有输入组件获得焦点：

```tsx
function App() {
  const renderer = useRenderer()
  const [inputFocused, setInputFocused] = useState(false)

  useKeyboard((key) => {
    if (inputFocused) return  // 让输入组件处理

    // 全局快捷键
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <input
      focused={inputFocused}
      onFocus={() => setInputFocused(true)}
      onBlur={() => setInputFocused(false)}
    />
  )
}
```

## 注意事项

### 终端限制

某些按键组合会被终端或操作系统捕获：
- `Ctrl+C` 通常发送 SIGINT（使用 `exitOnCtrlC: false` 来处理）
- `Ctrl+Z` 暂停进程
- 某些功能键可能被拦截

### SSH 和远程会话

通过 SSH 连接时按键检测可能会有所不同。请在目标环境中测试。

### 多个处理器

多个 `useKeyboard` 调用都会接收事件。请协调处理器以防止冲突。
