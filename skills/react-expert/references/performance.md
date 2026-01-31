# 性能优化

## React.memo

```tsx
import { memo } from 'react';

// 记忆化组件 - 仅在 props 变化时重新渲染
const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
});

// 自定义比较函数
const UserCard = memo(
  function UserCard({ user }: { user: User }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

## 防止重新渲染

```tsx
// 问题: 每次渲染创建新对象/函数
function Parent() {
  // ❌ 每次渲染创建新对象
  return <Child style={{ color: 'red' }} onClick={() => doSomething()} />;
}

// 解决方案: 记忆化或提升
const style = { color: 'red' }; // 提升到外部

function Parent() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Child style={style} onClick={handleClick} />;
}
```

## 使用 lazy() 代码分割

```tsx
import { lazy, Suspense } from 'react';

// 分割重型组件
const HeavyChart = lazy(() => import('./HeavyChart'));
const AdminPanel = lazy(() => import('./AdminPanel'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {showChart && <HeavyChart data={data} />}
    </Suspense>
  );
}

// 基于路由的分割 (React Router)
const routes = [
  {
    path: '/admin',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminPanel />
      </Suspense>
    ),
  },
];
```

## 虚拟化

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## useMemo 用于昂贵计算

```tsx
function Analytics({ data }: { data: DataPoint[] }) {
  // 仅在数据变化时重新计算
  const stats = useMemo(() => ({
    total: data.reduce((sum, d) => sum + d.value, 0),
    average: data.reduce((sum, d) => sum + d.value, 0) / data.length,
    max: Math.max(...data.map(d => d.value)),
  }), [data]);

  return <StatsDisplay stats={stats} />;
}
```

## useTransition 用于非紧急更新

```tsx
import { useTransition } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value); // 紧急: 立即更新输入

    startTransition(() => {
      // 非紧急: 可以被中断
      setResults(filterItems(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results items={results} />}
    </>
  );
}
```

## 快速参考

| 技术 | 何时使用 |
|-----------|-------------|
| `memo()` | 防止 props 未变化时的重新渲染 |
| `useMemo()` | 缓存昂贵计算 |
| `useCallback()` | 稳定的函数引用 |
| `lazy()` | 代码分割重型组件 |
| `useTransition()` | 在更新期间保持 UI 响应 |
| 虚拟化 | 大型列表（1000+ 项）|

| 反模式 | 修复方法 |
|--------------|-----|
| 内联对象 | 提升或使用 useMemo |
| 内联函数 | 使用 useCallback |
| 大型打包 | lazy() + Suspense |
| 长列表 | 虚拟化 |
