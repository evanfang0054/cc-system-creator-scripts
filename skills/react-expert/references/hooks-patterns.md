# Hooks 模式

## 自定义 Hook 模式

```tsx
// useApi - 数据获取 hook
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
```

## useDebounce

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// 使用示例
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery]);
}
```

## useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## useMediaQuery

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// 使用示例
function Layout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

## useCallback & useMemo

```tsx
// useCallback: 记忆化函数（用于子组件依赖）
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []); // 空依赖 = 稳定引用

// useMemo: 记忆化昂贵计算
const sortedItems = useMemo(() =>
  [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// 何时使用:
// - useCallback: 向 memoized 的子组件传递时
// - useMemo: 计算昂贵且依赖很少变化时
```

## Effect 清理

```tsx
useEffect(() => {
  const subscription = api.subscribe(handler);

  // 清理函数
  return () => subscription.unsubscribe();
}, []);

// 异步 effect 模式
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const data = await api.getData();
    if (!cancelled) setData(data);
  }

  fetchData();
  return () => { cancelled = true };
}, []);
```

## 快速参考

| Hook | 用途 |
|------|---------|
| useState | 组件状态 |
| useEffect | 副作用、订阅 |
| useCallback | 记忆化函数 |
| useMemo | 记忆化值 |
| useRef | 可变 ref、DOM 访问 |
| useContext | 读取 context |
| useReducer | 复杂状态逻辑 |

| 自定义 Hook | 使用场景 |
|-------------|----------|
| useDebounce | 输入延迟 |
| useLocalStorage | 持久化状态 |
| useMediaQuery | 响应式逻辑 |
| useApi | 数据获取 |
