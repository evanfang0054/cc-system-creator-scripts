# 布局模式

终端用户界面的常见布局方案。

## 全屏应用

填充整个终端：

```tsx
function App() {
  return (
    <box width="100%" height="100%">
      {/* 内容填充终端 */}
    </box>
  )
}
```

## 页头/内容/页脚

经典的应用布局：

```tsx
function AppLayout() {
  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* 页头 - 固定高度 */}
      <box height={3} borderStyle="single" borderBottom>
        <text>页头</text>
      </box>

      {/* 内容 - 填充剩余空间 */}
      <box flexGrow={1}>
        <text>主要内容</text>
      </box>

      {/* 页脚 - 固定高度 */}
      <box height={1}>
        <text>状态：就绪</text>
      </box>
    </box>
  )
}
```

## 侧边栏布局

```tsx
function SidebarLayout() {
  return (
    <box flexDirection="row" width="100%" height="100%">
      {/* 侧边栏 - 固定宽度 */}
      <box width={25} borderStyle="single" borderRight>
        <text>侧边栏</text>
      </box>

      {/* 主内容 - 填充剩余空间 */}
      <box flexGrow={1}>
        <text>主要内容</text>
      </box>
    </box>
  )
}
```

## 可调整大小的侧边栏

根据终端宽度响应式调整：

```tsx
function ResponsiveSidebar() {
  const dims = useTerminalDimensions()  // React: useTerminalDimensions()
  const showSidebar = dims.width > 60
  const sidebarWidth = Math.min(30, Math.floor(dims.width * 0.3))

  return (
    <box flexDirection="row" width="100%" height="100%">
      {showSidebar && (
        <box width={sidebarWidth} border>
          <text>侧边栏</text>
        </box>
      )}
      <box flexGrow={1}>
        <text>主要内容</text>
      </box>
    </box>
  )
}
```

## 居中内容

### 水平居中

```tsx
<box width="100%" justifyContent="center">
  <box width={40}>
    <text>水平居中</text>
  </box>
</box>
```

### 垂直居中

```tsx
<box height="100%" alignItems="center">
  <text>垂直居中</text>
</box>
```

### 两轴都居中

```tsx
<box
  width="100%"
  height="100%"
  justifyContent="center"
  alignItems="center"
>
  <box width={40} height={10} border>
    <text>两轴都居中</text>
  </box>
</box>
```

## 模态框/对话框

居中的覆盖层：

```tsx
function Modal({ children, visible }) {
  if (!visible) return null

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="rgba(0,0,0,0.5)"
    >
      <box
        width={50}
        height={15}
        border
        borderStyle="double"
        backgroundColor="#1a1a2e"
        padding={2}
      >
        {children}
      </box>
    </box>
  )
}
```

## 网格布局

使用 flexWrap：

```tsx
function Grid({ items, columns = 3 }) {
  const itemWidth = `${Math.floor(100 / columns)}%`

  return (
    <box flexDirection="row" flexWrap="wrap" width="100%">
      {items.map((item, i) => (
        <box key={i} width={itemWidth} padding={1}>
          <text>{item}</text>
        </box>
      ))}
    </box>
  )
}
```

## 分割面板

### 水平分割

```tsx
function HorizontalSplit({ ratio = 0.5 }) {
  return (
    <box flexDirection="row" width="100%" height="100%">
      <box width={`${ratio * 100}%`} border>
        <text>左侧面板</text>
      </box>
      <box flexGrow={1} border>
        <text>右侧面板</text>
      </box>
    </box>
  )
}
```

### 垂直分割

```tsx
function VerticalSplit({ ratio = 0.5 }) {
  return (
    <box flexDirection="column" width="100%" height="100%">
      <box height={`${ratio * 100}%`} border>
        <text>上方面板</text>
      </box>
      <box flexGrow={1} border>
        <text>下方面板</text>
      </box>
    </box>
  )
}
```

## 表单布局

标签 + 输入框配对：

```tsx
function FormField({ label, children }) {
  return (
    <box flexDirection="row" marginBottom={1}>
      <box width={15}>
        <text>{label}:</text>
      </box>
      <box flexGrow={1}>
        {children}
      </box>
    </box>
  )
}

function LoginForm() {
  return (
    <box flexDirection="column" padding={2} border width={50}>
      <FormField label="用户名">
        <input placeholder="输入用户名" />
      </FormField>
      <FormField label="密码">
        <input placeholder="输入密码" />
      </FormField>
      <box marginTop={2} justifyContent="flex-end">
        <box border padding={1}>
          <text>登录</text>
        </box>
      </box>
    </box>
  )
}
```

## 导航标签

```tsx
function TabBar({ tabs, activeIndex, onSelect }) {
  return (
    <box flexDirection="row" borderBottom>
      {tabs.map((tab, i) => (
        <box
          key={i}
          padding={1}
          backgroundColor={i === activeIndex ? "#333" : "transparent"}
          onMouseDown={() => onSelect(i)}
        >
          <text fg={i === activeIndex ? "#fff" : "#888"}>
            {tab}
          </text>
        </box>
      ))}
    </box>
  )
}
```

## 粘性页脚

页脚始终位于底部：

```tsx
function StickyFooterLayout() {
  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* 内容区域 */}
      <box flexGrow={1} flexDirection="column">
        {/* 您的内容在这里 */}
        <text>可能较短的内容</text>
      </box>

      {/* 页脚被推到底部 */}
      <box height={1}>
        <text fg="#888">按 ? 获取帮助 | 按 q 退出</text>
      </box>
    </box>
  )
}
```

## 绝对定位覆盖层

工具提示或弹出窗口：

```tsx
function Tooltip({ x, y, children }) {
  return (
    <box
      position="absolute"
      left={x}
      top={y}
      border
      backgroundColor="#333"
      padding={1}
      zIndex={100}
    >
      {children}
    </box>
  )
}
```

## 响应式断点

根据终端大小的不同布局：

```tsx
function ResponsiveApp() {
  const { width, height } = useTerminalDimensions()

  // 定义断点
  const isSmall = width < 60
  const isMedium = width >= 60 && width < 100
  const isLarge = width >= 100

  if (isSmall) {
    // 移动端风格：堆叠布局
    return (
      <box flexDirection="column">
        <Navigation />
        <Content />
      </box>
    )
  }

  if (isMedium) {
    // 平板风格：侧边栏 + 内容
    return (
      <box flexDirection="row">
        <box width={20}><Navigation /></box>
        <box flexGrow={1}><Content /></box>
      </box>
    )
  }

  // 大屏：完整布局
  return (
    <box flexDirection="row">
      <box width={25}><Navigation /></box>
      <box flexGrow={1}><Content /></box>
      <box width={30}><Sidebar /></box>
    </box>
  )
}
```

## 等高列

```tsx
function EqualColumns() {
  return (
    <box flexDirection="row" alignItems="stretch" height={20}>
      <box flexGrow={1} border>
        <text>短内容</text>
      </box>
      <box flexGrow={1} border>
        <text>
          跨越多行并
          占用空间的
          较长内容
        </text>
      </box>
      <box flexGrow={1} border>
        <text>中等长度内容</text>
      </box>
    </box>
  )
}
```

## 间距工具

一致的间距模式：

```tsx
// 间距组件
function Spacer({ size = 1 }) {
  return <box height={size} width={size} />
}

// 分隔符组件
function Divider() {
  return <box height={1} width="100%" backgroundColor="#333" />
}

// 使用方式
<box flexDirection="column">
  <text>第一节</text>
  <Spacer size={2} />
  <Divider />
  <Spacer size={2} />
  <text>第二节</text>
</box>
```
