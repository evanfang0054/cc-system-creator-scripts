# 动画系统

OpenTUI 提供基于时间轴的动画系统，用于平滑的属性过渡。

## 概述

OpenTUI 中的动画使用：
- **Timeline（时间轴）**：编排多个动画
- **Animation Engine（动画引擎）**：管理时间轴和渲染
- **Easing Functions（缓动函数）**：控制动画曲线

## 使用场景

当您需要基于时间轴的动画、缓动曲线或渐进式过渡时，请参考此文档。

## 基本用法

### React

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function AnimatedBox() {
  const [width, setWidth] = useState(0)
  
  const timeline = useTimeline({
    duration: 2000,
  })
  
  useEffect(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  }, [])
  
  return (
    <box
      width={width}
      height={3}
      backgroundColor="#6a5acd"
    />
  )
}
```

### Solid

```tsx
import { useTimeline } from "@opentui/solid"
import { createSignal, onMount } from "solid-js"

function AnimatedBox() {
  const [width, setWidth] = createSignal(0)
  
  const timeline = useTimeline({
    duration: 2000,
  })
  
  onMount(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  })
  
  return (
    <box
      width={width()}
      height={3}
      backgroundColor="#6a5acd"
    />
  )
}
```

### Core

```typescript
import { createCliRenderer, Timeline, engine } from "@opentui/core"

const renderer = await createCliRenderer()
engine.attach(renderer)

const timeline = new Timeline({
  duration: 2000,
  autoplay: true,
})

timeline.add(
  { x: 0 },
  {
    x: 50,
    duration: 2000,
    ease: "easeOutQuad",
    onUpdate: (anim) => {
      box.setLeft(Math.round(anim.targets[0].x))
    },
  }
)

engine.addTimeline(timeline)
```

## Timeline 选项

```typescript
const timeline = useTimeline({
  duration: 2000,         // 总持续时间（毫秒）
  loop: false,            // 循环播放时间轴
  autoplay: true,         // 自动开始
  onComplete: () => {},   // 时间轴完成时调用
  onPause: () => {},      // 时间轴暂停时调用
})
```

## Timeline 方法

```typescript
// 添加动画
timeline.add(target, properties, startTime?)

// 控制播放
timeline.play()           // 开始/恢复
timeline.pause()          // 暂停
timeline.restart()        // 从头重新开始

// 状态
timeline.progress         // 当前进度（0-1）
timeline.duration         // 总持续时间
```

## 动画属性

```typescript
timeline.add(
  { value: 0 },           // 带有初始值的目标对象
  {
    value: 100,           // 最终值
    duration: 1000,       // 动画持续时间（毫秒）
    ease: "linear",       // 缓动函数
    delay: 0,             // 开始前的延迟
    onUpdate: (anim) => {
      // 每帧调用
      const current = anim.targets[0].value
    },
    onComplete: () => {
      // 此动画完成时调用
    },
  },
  0                       // 时间轴中的开始时间（可选）
)
```

## 缓动函数

可用的缓动函数：

### Linear（线性）

| 名称 | 描述 |
|------|-------------|
| `linear` | 恒定速度 |

### Quad（二次方）

| 名称 | 描述 |
|------|-------------|
| `easeInQuad` | 慢速开始 |
| `easeOutQuad` | 慢速结束 |
| `easeInOutQuad` | 慢速开始和结束 |

### Cubic（三次方）

| 名称 | 描述 |
|------|-------------|
| `easeInCubic` | 更慢的开始 |
| `easeOutCubic` | 更慢的结束 |
| `easeInOutCubic` | 更慢的开始和结束 |

### Quart（四次方）

| 名称 | 描述 |
|------|-------------|
| `easeInQuart` | 非常慢的开始 |
| `easeOutQuart` | 非常慢的结束 |
| `easeInOutQuart` | 非常慢的开始和结束 |

### Expo（指数）

| 名称 | 描述 |
|------|-------------|
| `easeInExpo` | 指数级开始 |
| `easeOutExpo` | 指数级结束 |
| `easeInOutExpo` | 指数级开始和结束 |

### Back（回弹）

| 名称 | 描述 |
|------|-------------|
| `easeInBack` | 先回拉再前进 |
| `easeOutBack` | 超出目标后回弹 |
| `easeInOutBack` | 两者结合 |

### Elastic（弹性）

| 名称 | 描述 |
|------|-------------|
| `easeInElastic` | 弹性开始 |
| `easeOutElastic` | 弹性结束（有弹性） |
| `easeInOutElastic` | 两者结合 |

### Bounce（弹跳）

| 名称 | 描述 |
|------|-------------|
| `easeInBounce` | 开始时弹跳 |
| `easeOutBounce` | 结束时弹跳 |
| `easeInOutBounce` | 两者结合 |

## 常见模式

### 进度条

```tsx
function ProgressBar({ progress }: { progress: number }) {
  const [width, setWidth] = useState(0)
  const maxWidth = 50
  
  const timeline = useTimeline()
  
  useEffect(() => {
    timeline.add(
      { value: width },
      {
        value: (progress / 100) * maxWidth,
        duration: 300,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].value))
        },
      }
    )
  }, [progress])
  
  return (
    <box flexDirection="column" gap={1}>
      <text>Progress: {progress}%</text>
      <box width={maxWidth} height={1} backgroundColor="#333">
        <box width={width} height={1} backgroundColor="#00FF00" />
      </box>
    </box>
  )
}
```

### 淡入效果

```tsx
function FadeIn({ children }) {
  const [opacity, setOpacity] = useState(0)
  
  const timeline = useTimeline()
  
  useEffect(() => {
    timeline.add(
      { opacity: 0 },
      {
        opacity: 1,
        duration: 500,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setOpacity(anim.targets[0].opacity)
        },
      }
    )
  }, [])
  
  return (
    <box style={{ opacity }}>
      {children}
    </box>
  )
}
```

### 循环动画

```tsx
function Spinner() {
  const [frame, setFrame] = useState(0)
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length)
    }, 80)
    
    return () => clearInterval(interval)
  }, [])
  
  return <text>{frames[frame]} Loading...</text>
}
```

### 错落动画

```tsx
function StaggeredList({ items }) {
  const [visibleCount, setVisibleCount] = useState(0)
  
  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleCount(count)
      if (count >= items.length) {
        clearInterval(interval)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [items.length])
  
  return (
    <box flexDirection="column">
      {items.slice(0, visibleCount).map((item, i) => (
        <text key={i}>{item}</text>
      ))}
    </box>
  )
}
```

### 滑入效果

```tsx
function SlideIn({ children, from = "left" }) {
  const [offset, setOffset] = useState(from === "left" ? -20 : 20)
  
  const timeline = useTimeline()
  
  useEffect(() => {
    timeline.add(
      { offset: from === "left" ? -20 : 20 },
      {
        offset: 0,
        duration: 300,
        ease: "easeOutCubic",
        onUpdate: (anim) => {
          setOffset(Math.round(anim.targets[0].offset))
        },
      }
    )
  }, [])
  
  return (
    <box position="relative" left={offset}>
      {children}
    </box>
  )
}
```

## 性能优化建议

### 批量更新

Timeline 会在渲染循环内自动批量更新。

### 使用整数值

对基于字符的定位，应将动画值四舍五入：

```typescript
onUpdate: (anim) => {
  setX(Math.round(anim.targets[0].x))
}
```

### 清理 Timeline

Hooks 会自动清理，但对于核心模式：

```typescript
// 当不再需要 timeline 时
engine.removeTimeline(timeline)
```

## 注意事项

### 终端刷新率

终端 UI 通常最高以 60 FPS 刷新。非常快的动画可能会显得卡顿。

### 字符网格

动画受限于字符单元格。无法实现亚像素级别的定位。

### 在 Effect 中清理

务必清理 intervals 和 timelines：

```tsx
useEffect(() => {
  const interval = setInterval(...)
  return () => clearInterval(interval)
}, [])
```
