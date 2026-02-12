# 输入组件

用于在 OpenTUI 中进行用户输入的组件。

## Input 组件

单行文本输入字段。

### 基本用法

```tsx
// React
<input
  value={value}
  onChange={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  focused
/>

// Solid
<input
  value={value()}
  onInput={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  focused
/>

// Core
const input = new InputRenderable(renderer, {
  id: "name",
  placeholder: "Enter text...",
})
input.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Value:", value)
})
input.focus()
```

### 样式设置

```tsx
<input
  width={30}
  backgroundColor="#1a1a1a"
  textColor="#FFFFFF"
  cursorColor="#00FF00"
  focusedBackgroundColor="#2a2a2a"
  placeholderColor="#666666"
/>
```

### 事件

```tsx
// React
<input
  onChange={(value) => console.log("Changed:", value)}
  onFocus={() => console.log("Focused")}
  onBlur={() => console.log("Blurred")}
/>

// Core
input.on(InputRenderableEvents.CHANGE, (value) => {})
input.on(InputRenderableEvents.FOCUS, () => {})
input.on(InputRenderableEvents.BLUR, () => {})
```

### 受控输入

```tsx
// React
function ControlledInput() {
  const [value, setValue] = useState("")
  
  return (
    <input
      value={value}
      onChange={setValue}
      focused
    />
  )
}

// Solid
function ControlledInput() {
  const [value, setValue] = createSignal("")
  
  return (
    <input
      value={value()}
      onInput={setValue}
      focused
    />
  )
}
```

## Textarea 组件

多行文本输入字段。

### 基本用法

```tsx
// React
<textarea
  value={text}
  onChange={(newText) => setText(newText)}
  placeholder="Enter multiple lines..."
  width={40}
  height={10}
  focused
/>

// Solid
<textarea
  value={text()}
  onInput={(newText) => setText(newText)}
  placeholder="Enter multiple lines..."
  width={40}
  height={10}
  focused
/>

// Core
const textarea = new TextareaRenderable(renderer, {
  id: "editor",
  width: 40,
  height: 10,
  placeholder: "Enter text...",
})
```

### 功能特性

```tsx
<textarea
  showLineNumbers        // Display line numbers
  wrapText              // Wrap long lines
  readOnly              // Disable editing
  tabSize={2}           // Tab character width
/>
```

### 语法高亮

```tsx
<textarea
  language="typescript"
  value={code}
  onChange={setCode}
/>
```

## Select 组件

用于从选项中进行选择的列表选择器。

### 基本用法

```tsx
// React
<select
  options={[
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
    { name: "Option 3", description: "Third option", value: "3" },
  ]}
  onSelect={(index, option) => {
    console.log("Selected:", option.name)  // Called when Enter is pressed
  }}
  focused
/>

// Solid
<select
  options={[
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ]}
  onSelect={(index, option) => {
    console.log("Selected:", option.name)  // Called when Enter is pressed
  }}
  focused
/>

// Core
const select = new SelectRenderable(renderer, {
  id: "menu",
  options: [
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ],
})
select.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)  // Called when Enter is pressed
})
select.focus()
```

### 选项格式

```typescript
interface SelectOption {
  name: string          // 显示文本
  description?: string  // 可选的描述，显示在下方
  value?: any          // 关联的值
}
```

### 样式设置

```tsx
<select
  height={8}                    // Visible height
  selectedIndex={0}             // Initially selected
  showScrollIndicator           // Show scroll arrows
  selectedBackgroundColor="#333"
  selectedTextColor="#fff"
  highlightBackgroundColor="#444"
/>
```

### 导航

默认快捷键：
- `Up` / `k` - 向上移动
- `Down` / `j` - 向下移动
- `Enter` - 选择项目

### 事件

**重要**：`onSelect` 和 `onChange` 有不同的用途：

| 事件 | 触发条件 | 使用场景 |
|-------|---------|----------|
| `onSelect` | **按下 Enter 键** - 用户确认选择 | 对选中的项目执行操作 |
| `onChange` | **使用方向键** - 用户浏览列表 | 在用户浏览时预览、更新界面 |

```tsx
// React/Solid
<select
  onSelect={(index, option) => {
    // Called when Enter is pressed - selection confirmed
    console.log("User selected:", option.name)
    performAction(option)
  }}
  onChange={(index, option) => {
    // Called when navigating with arrow keys
    console.log("Browsing:", option.name)
    showPreview(option)
  }}
/>

// Core
select.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  // Called when Enter is pressed
})
select.on(SelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
  // Called when navigating with arrow keys
})
```

## Tab Select 组件

基于水平标签页的选择器。

### 基本用法

```tsx
// React
<tab-select
  options={[
    { name: "Home", description: "Dashboard view" },
    { name: "Settings", description: "Configuration" },
    { name: "Help", description: "Documentation" },
  ]}
  onSelect={(index, option) => {
    console.log("Tab selected:", option.name)  // Called when Enter is pressed
  }}
  focused
/>

// Solid (note underscore)
<tab_select
  options={[
    { name: "Home", description: "Dashboard view" },
    { name: "Settings", description: "Configuration" },
  ]}
  onSelect={(index, option) => {
    console.log("Tab selected:", option.name)  // Called when Enter is pressed
  }}
  focused
/>

// Core
const tabs = new TabSelectRenderable(renderer, {
  id: "tabs",
  options: [...],
  tabWidth: 20,
})
tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Tab selected:", option.name)  // Called when Enter is pressed
})
tabs.focus()
```

### 事件

与 Select 相同的模式 - `onSelect` 用于 Enter 键，`onChange` 用于导航：

```tsx
<tab-select
  onSelect={(index, option) => {
    // Called when Enter is pressed - switch to tab
    setActiveTab(index)
  }}
  onChange={(index, option) => {
    // Called when navigating with arrow keys
    showTabPreview(option)
  }}
/>
```

### 样式设置

```tsx
// React
<tab-select
  tabWidth={20}                // 每个标签的宽度
  selectedIndex={0}            // 初始选中的标签
/>

// Solid
<tab_select
  tabWidth={20}
  selectedIndex={0}
/>
```

### 导航

默认快捷键：
- `Left` / `[` - 上一个标签
- `Right` / `]` - 下一个标签
- `Enter` - 选择标签

## 焦点管理

### 单个聚焦输入

```tsx
function SingleInput() {
  return <input placeholder="I'm focused" focused />
}
```

### 多个输入的焦点状态

```tsx
// React
function Form() {
  const [focusIndex, setFocusIndex] = useState(0)
  const fields = ["name", "email", "message"]
  
  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusIndex(i => (i + 1) % fields.length)
    }
  })
  
  return (
    <box flexDirection="column" gap={1}>
      {fields.map((field, i) => (
        <input
          key={field}
          placeholder={`Enter ${field}`}
          focused={i === focusIndex}
        />
      ))}
    </box>
  )
}
```

### 焦点方法（Core）

```typescript
input.focus()      // 获取焦点
input.blur()       // 移除焦点
input.isFocused()  // 检查焦点状态
```

## 表单模式

### 登录表单

```tsx
function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [focusField, setFocusField] = useState<"username" | "password">("username")
  
  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusField(f => f === "username" ? "password" : "username")
    }
    if (key.name === "enter") {
      handleLogin()
    }
  })
  
  return (
    <box flexDirection="column" gap={1} border padding={2}>
      <box flexDirection="row" gap={1}>
        <text>Username:</text>
        <input
          value={username}
          onChange={setUsername}
          focused={focusField === "username"}
          width={20}
        />
      </box>
      <box flexDirection="row" gap={1}>
        <text>Password:</text>
        <input
          value={password}
          onChange={setPassword}
          focused={focusField === "password"}
          width={20}
        />
      </box>
    </box>
  )
}
```

### 带结果的搜索

```tsx
function SearchableList({ items, onItemSelected }) {
  const [query, setQuery] = useState("")
  const [focusSearch, setFocusSearch] = useState(true)
  const [preview, setPreview] = useState(null)
  
  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  )
  
  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusSearch(f => !f)
    }
  })
  
  return (
    <box flexDirection="column">
      <input
        value={query}
        onChange={setQuery}
        placeholder="Search..."
        focused={focusSearch}
      />
      <select
        options={filtered.map(item => ({ name: item }))}
        focused={!focusSearch}
        height={10}
        onSelect={(index, option) => {
          // Enter pressed - confirm selection
          onItemSelected(option)
        }}
        onChange={(index, option) => {
          // Navigating - show preview
          setPreview(option)
        }}
      />
    </box>
  )
}
```

## 注意事项

### 需要焦点

输入必须获得焦点才能接收键盘输入：

```tsx
// 错误 - 不会接收输入
<input placeholder="Type here" />

// 正确
<input placeholder="Type here" focused />
```

### Select 选项格式

选项必须是带有 `name` 属性的对象：

```tsx
// 错误
<select options={["a", "b", "c"]} />

// 正确
<select options={[
  { name: "A", description: "Option A" },
  { name: "B", description: "Option B" },
]} />
```

### Solid 使用下划线

```tsx
// React
<tab-select />

// Solid
<tab_select />
```

### Value 与 onInput（Solid）

Solid 使用 `onInput` 而不是 `onChange`：

```tsx
// React
<input value={value} onChange={setValue} />

// Solid
<input value={value()} onInput={setValue} />
```
