# 容器组件

用于在 OpenTUI 中分组和组织内容的组件。

## Box 组件

主要的容器组件，支持边框、背景和布局功能。

### 基本用法

```tsx
// React/Solid
<box>
  <text>Content inside box</text>
</box>

// Core
const box = new BoxRenderable(renderer, {
  id: "container",
})
box.add(child)
```

### 边框

```tsx
<box border>
  简单边框
</box>

<box
  border
  borderStyle="single"    // single | double | rounded | bold | none
  borderColor="#FFFFFF"
>
  样式边框
</box>

// 单独的边框
<box
  borderTop
  borderBottom
  borderLeft={false}
  borderRight={false}
>
  仅顶部和底部
</box>
```

**边框样式：**

| 样式 | 外观 |
|-------|------------|
| `single` | `┌─┐│ │└─┘` |
| `double` | `╔═╗║ ║╚═╝` |
| `rounded` | `╭─╮│ │╰─╯` |
| `bold` | `┏━┓┃ ┃┗━┛` |

### 标题

```tsx
<box
  border
  title="Settings"
  titleAlignment="center"   // left | center | right
>
  Panel content
</box>
```

### 背景

```tsx
<box backgroundColor="#1a1a2e">
  Dark background
</box>

<box backgroundColor="transparent">
  No background
</box>
```

### 布局

Box 默认是 flex 容器：

```tsx
<box
  flexDirection="row"       // row | column | row-reverse | column-reverse
  justifyContent="center"   // flex-start | flex-end | center | space-between | space-around
  alignItems="center"       // flex-start | flex-end | center | stretch | baseline
  gap={2}                   // Space between children
>
  <text>Item 1</text>
  <text>Item 2</text>
</box>
```

### 间距

```tsx
<box
  padding={2}               // All sides
  paddingTop={1}
  paddingRight={2}
  paddingBottom={1}
  paddingLeft={2}
  margin={1}
  marginTop={1}
>
  Spaced content
</box>
```

### 尺寸

```tsx
<box
  width={40}                // Fixed width
  height={10}               // Fixed height
  width="50%"               // Percentage of parent
  minWidth={20}             // Minimum width
  maxWidth={80}             // Maximum width
  flexGrow={1}              // Grow to fill space
>
  Sized box
</box>
```

### 鼠标事件

```tsx
<box
  onMouseDown={(event) => {
    console.log("Clicked at:", event.x, event.y)
  }}
  onMouseUp={(event) => {}}
  onMouseMove={(event) => {}}
>
  Clickable box
</box>
```

## ScrollBox 组件

用于超出视口内容的可滚动容器。

### 基本用法

```tsx
// React
<scrollbox height={10}>
  {items.map((item, i) => (
    <text key={i}>{item}</text>
  ))}
</scrollbox>

// Solid
<scrollbox height={10}>
  <For each={items()}>
    {(item) => <text>{item}</text>}
  </For>
</scrollbox>

// Core
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "list",
  height: 10,
})
items.forEach(item => {
  scrollbox.add(new TextRenderable(renderer, { content: item }))
})
```

### 键盘滚动焦点

```tsx
<scrollbox focused height={20}>
  {/* 使用方向键滚动 */}
</scrollbox>
```

### 滚动条样式

```tsx
// React
<scrollbox
  style={{
    rootOptions: {
      backgroundColor: "#24283b",
    },
    wrapperOptions: {
      backgroundColor: "#1f2335",
    },
    viewportOptions: {
      backgroundColor: "#1a1b26",
    },
    contentOptions: {
      backgroundColor: "#16161e",
    },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
>
  {content}
</scrollbox>
```

### 滚动位置（Core）

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "list",
  height: 20,
})

// 编程方式滚动
scrollbox.scrollTo(0)           // 滚动到顶部
scrollbox.scrollTo(100)         // 滚动到指定位置
scrollbox.scrollBy(10)          // 相对滚动
scrollbox.scrollToBottom()      // 滚动到底部
```

## 组合模式

### Card 组件

```tsx
function Card({ title, children }) {
  return (
    <box
      border
      borderStyle="rounded"
      padding={2}
      marginBottom={1}
    >
      {title && (
        <text fg="#00FFFF" bold>
          {title}
        </text>
      )}
      <box marginTop={title ? 1 : 0}>
        {children}
      </box>
    </box>
  )
}
```

### Panel 组件

```tsx
function Panel({ title, children, width = 40 }) {
  return (
    <box
      border
      borderStyle="double"
      width={width}
      backgroundColor="#1a1a2e"
    >
      {title && (
        <box
          borderBottom
          padding={1}
          backgroundColor="#2a2a4e"
        >
          <text bold>{title}</text>
        </box>
      )}
      <box padding={2}>
        {children}
      </box>
    </box>
  )
}
```

### 列表容器

```tsx
function List({ items, renderItem }) {
  return (
    <scrollbox height={15} focused>
      {items.map((item, i) => (
        <box
          key={i}
          padding={1}
          backgroundColor={i % 2 === 0 ? "#222" : "#333"}
        >
          {renderItem(item, i)}
        </box>
      ))}
    </scrollbox>
  )
}
```

## 嵌套容器

```tsx
<box flexDirection="column" height="100%">
  {/* Header */}
  <box height={3} border>
    <text>Header</text>
  </box>
  
  {/* Main area with sidebar */}
  <box flexDirection="row" flexGrow={1}>
    <box width={20} border>
      <text>Sidebar</text>
    </box>
    <box flexGrow={1}>
      <scrollbox height="100%">
        {/* Scrollable content */}
      </scrollbox>
    </box>
  </box>
  
  {/* Footer */}
  <box height={1}>
    <text>Footer</text>
  </box>
</box>
```

## 注意事项

### 百分比尺寸需要父容器尺寸

```tsx
// 错误 - 父容器没有明确尺寸
<box>
  <box width="50%">不会工作</box>
</box>

// 正确
<box width="100%">
  <box width="50%">正常工作</box>
</box>
```

### FlexGrow 需要指定尺寸的父容器

```tsx
// 错误
<box>
  <box flexGrow={1}>不会增长</box>
</box>

// 正确
<box height="100%">
  <box flexGrow={1}>会增长</box>
</box>
```

### ScrollBox 需要高度

```tsx
// 错误 - 没有高度约束
<scrollbox>
  {items}
</scrollbox>

// 正确
<scrollbox height={20}>
  {items}
</scrollbox>
```

### 边框占用空间

边框会占用 box 内部的空间：

```tsx
<box width={10} border>
  {/* 内部内容区域为 8 个字符（10 - 2 个边框字符） */}
</box>
```
