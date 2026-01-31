# 从类组件到现代 React 迁移指南

---

## 何时使用此指南

**应该迁移时：**
- 采用 React 18+ 特性（并发渲染、Suspense）
- 提高代码可重用性和组合性
- 减小打包体积（hooks 通常更小）
- 在 Next.js 13+ 中启用 Server Components
- 团队标准化到现代模式
- 存在性能优化机会
- 需要降低测试复杂度

**不应迁移时：**
- 错误边界（仍需要类组件）
- 没有维护预算的遗留代码库
- 组件完美运行且不会变化
- 团队缺乏 hooks 专业知识
- 第三方库需要类继承
- 迁移风险超过收益

**迁移优先级：**
1. 新功能（使用 hooks 编写）
2. 频繁修改的组件
3. 具有可重用逻辑的组件
4. 性能瓶颈
5. 稳定、工作的组件（最低优先级）

---

## 生命周期到 Hooks 概念映射

| 类组件 | 现代 React 等价物 | 说明 |
|----------------|------------------------|-------|
| `constructor` | `useState` 初始化 | 不需要单独的构造函数 |
| `componentDidMount` | `useEffect(() => {}, [])` | 空依赖数组 |
| `componentDidUpdate` | `useEffect(() => {})` | 每次渲染后运行 |
| `componentWillUnmount` | `useEffect` 清理 | 返回清理函数 |
| `shouldComponentUpdate` | `React.memo` | 包装组件，自定义比较器 |
| `getDerivedStateFromProps` | 避免或使用渲染时计算 | 通常是反模式 |
| `getSnapshotBeforeUpdate` | `useLayoutEffect` | 很少需要 |
| `componentDidCatch` | 无 hook 等价物 | 保留类组件 |
| `this.forceUpdate()` | `useState` + setter 切换 | 避免，修复架构 |
| `this.state` | `useState` 或 `useReducer` | 多个状态片段 |
| `this.setState` 回调 | `useEffect` 监听状态 | 单独的 effect |

---

## 模式 1: 构造函数和状态 → useState

### 类组件

```tsx
interface Props {
  initialCount: number;
  userId: string;
}

interface State {
  count: number;
  user: User | null;
  isLoading: boolean;
}

class Counter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      count: props.initialCount,
      user: null,
      isLoading: false,
    };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### 现代 React

```tsx
interface Props {
  initialCount: number;
  userId: string;
}

interface User {
  id: string;
  name: string;
}

function Counter({ initialCount, userId }: Props) {
  // 分离状态片段以获得更好的粒度
  const [count, setCount] = useState(initialCount);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 箭头函数不再需要绑定
  const increment = () => {
    setCount(prev => prev + 1); // 函数式更新确保安全
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

**关键差异：**
- 不需要构造函数
- 懒初始化：`useState(() => expensiveComputation())`
- 函数式更新避免闭包过期 bug
- 分离的 `useState` 调用改善重新渲染优化

---

## 模式 2: 生命周期方法 → useEffect

### 类组件

```tsx
class UserProfile extends React.Component<{ userId: string }, State> {
  state = {
    user: null as User | null,
    posts: [] as Post[],
  };

  async componentDidMount() {
    await this.fetchUser();
    await this.fetchPosts();
    window.addEventListener('resize', this.handleResize);
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.userId !== this.props.userId) {
      await this.fetchUser();
      await this.fetchPosts();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  fetchUser = async () => {
    const user = await api.getUser(this.props.userId);
    this.setState({ user });
  };

  fetchPosts = async () => {
    const posts = await api.getPosts(this.props.userId);
    this.setState({ posts });
  };

  handleResize = () => {
    // 处理 resize
  };

  render() {
    return <div>{this.state.user?.name}</div>;
  }
}
```

### 现代 React

```tsx
interface Props {
  userId: string;
}

interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
}

function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // userId 变化时获取用户
  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      const userData = await api.getUser(userId);
      if (!cancelled) {
        setUser(userData);
      }
    }

    fetchUser();

    // 清理以防止卸载后状态更新
    return () => {
      cancelled = true;
    };
  }, [userId]); // userId 变化时重新运行

  // userId 变化时获取帖子
  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      const postsData = await api.getPosts(userId);
      if (!cancelled) {
        setPosts(postsData);
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 带清理的事件监听器
  useEffect(() => {
    function handleResize() {
      // 处理 resize
    }

    window.addEventListener('resize', handleResize);

    // 清理移除监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 空数组 = 仅挂载/卸载

  return <div>{user?.name}</div>;
}
```

**关键点：**
- 为不同关注点分离 effects
- 始终为订阅添加清理
- 取消标志防止内存泄漏
- 依赖数组必须包含所有使用的值
- 空数组 `[]` = 仅挂载/卸载
- 无数组 = 每次渲染后（很少需要）

---

## 模式 3: shouldComponentUpdate → React.memo

### 类组件

```tsx
class ExpensiveList extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      nextProps.items !== this.props.items ||
      nextProps.filter !== this.props.filter
    );
  }

  render() {
    const { items, filter } = this.props;
    const filtered = items.filter(item => item.includes(filter));
    return (
      <ul>
        {filtered.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
}
```

### 现代 React

```tsx
interface Props {
  items: string[];
  filter: string;
  onItemClick?: (item: string) => void;
}

// React.memo 带自定义比较
const ExpensiveList = React.memo<Props>(
  ({ items, filter, onItemClick }) => {
    // useMemo 用于昂贵计算
    const filtered = useMemo(
      () => items.filter(item => item.includes(filter)),
      [items, filter]
    );

    return (
      <ul>
        {filtered.map(item => (
          <li key={item} onClick={() => onItemClick?.(item)}>
            {item}
          </li>
        ))}
      </ul>
    );
  },
  // 自定义比较函数（可选）
  (prevProps, nextProps) => {
    return (
      prevProps.items === nextProps.items &&
      prevProps.filter === nextProps.filter &&
      prevProps.onItemClick === nextProps.onItemClick
    );
  }
);

ExpensiveList.displayName = 'ExpensiveList';
```

**优化清单：**
- `React.memo` 防止 props 未变化时重新渲染
- `useMemo` 缓存昂贵计算
- `useCallback` 稳定函数引用
- 自定义比较器用于复杂 props
- 默认使用浅比较

---

## 模式 4: 复杂状态 → useReducer

### 类组件

```tsx
class TodoManager extends React.Component<{}, State> {
  state = {
    todos: [] as Todo[],
    filter: 'all' as Filter,
    editingId: null as string | null,
  };

  addTodo = (text: string) => {
    this.setState(prev => ({
      todos: [...prev.todos, { id: uuid(), text, completed: false }],
    }));
  };

  toggleTodo = (id: string) => {
    this.setState(prev => ({
      todos: prev.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  deleteTodo = (id: string) => {
    this.setState(prev => ({
      todos: prev.todos.filter(todo => todo.id !== id),
    }));
  };

  setFilter = (filter: Filter) => {
    this.setState({ filter });
  };
}
```

### 现代 React

```tsx
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

interface State {
  todos: Todo[];
  filter: Filter;
  editingId: string | null;
}

type Action =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'SET_FILTER'; filter: Filter }
  | { type: 'START_EDITING'; id: string }
  | { type: 'STOP_EDITING' };

function todoReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.text, completed: false },
        ],
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id),
      };

    case 'SET_FILTER':
      return { ...state, filter: action.filter };

    case 'START_EDITING':
      return { ...state, editingId: action.id };

    case 'STOP_EDITING':
      return { ...state, editingId: null };

    default:
      return state;
  }
}

function TodoManager() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    editingId: null,
  });

  // Action creators
  const addTodo = (text: string) => {
    dispatch({ type: 'ADD_TODO', text });
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', id });
  };

  // 使用 useMemo 派生状态
  const visibleTodos = useMemo(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(t => !t.completed);
      case 'completed':
        return state.todos.filter(t => t.completed);
      default:
        return state.todos;
    }
  }, [state.todos, state.filter]);

  return (
    <div>
      {visibleTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => toggleTodo(todo.id)}
        />
      ))}
    </div>
  );
}
```

**何时使用 useReducer：**
- 多个相关的状态值
- 复杂的状态转换
- 下一个状态依赖于前一个
- 单独测试状态逻辑
- 需要 Redux 式的可预测性

---

## 模式 5: Refs 迁移

### 类组件

```tsx
class FormWithFocus extends React.Component {
  inputRef = React.createRef<HTMLInputElement>();
  timeoutId: number | null = null;

  componentDidMount() {
    this.inputRef.current?.focus();
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  handleSubmit = () => {
    const value = this.inputRef.current?.value;
    console.log(value);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input ref={this.inputRef} />
      </form>
    );
  }
}
```

### 现代 React

```tsx
function FormWithFocus() {
  // DOM ref
  const inputRef = useRef<HTMLInputElement>(null);

  // 可变值 ref（跨渲染持久化）
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 挂载时聚焦
    inputRef.current?.focus();

    // 卸载时清理 timeout
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    console.log(value);
  };

  const handleDelayedAction = () => {
    timeoutIdRef.current = window.setTimeout(() => {
      console.log('Delayed action');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} />
      <button type="button" onClick={handleDelayedAction}>
        Delayed
      </button>
    </form>
  );
}
```

**Ref 使用场景：**
- DOM 访问（focus、scroll、测量）
- 存储可变值（timers、订阅）
- 跟踪之前的值
- 实例变量替换

---

## 模式 6: HOC → 自定义 Hooks

### 带 HOC 的类组件

```tsx
// HOC
function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: User }>
) {
  return class extends React.Component<P> {
    state = { user: null as User | null };

    componentDidMount() {
      this.fetchUser();
    }

    fetchUser = async () => {
      const user = await auth.getCurrentUser();
      this.setState({ user });
    };

    render() {
      if (!this.state.user) return <div>Loading...</div>;
      return <Component {...this.props} user={this.state.user} />;
    }
  };
}

// 使用
class Dashboard extends React.Component<{ user: User }> {
  render() {
    return <div>Welcome {this.props.user.name}</div>;
  }
}

export default withAuth(Dashboard);
```

### 带自定义 Hook 的现代 React

```tsx
// 自定义 hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const userData = await auth.getCurrentUser();
        if (!cancelled) {
          setUser(userData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Auth failed'));
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  return { user, loading, error, logout };
}

// 使用
function Dashboard() {
  const { user, loading, error, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**自定义 Hook 优势：**
- 更容易组合（使用多个 hooks）
- 更好的 TypeScript 推断
- 无包装组件（更简单的树）
- 更容易单独测试
- 更明确的依赖

---

## 模式 7: Render Props → 自定义 Hooks

### 带 Render Props 的类组件

```tsx
interface MousePosition {
  x: number;
  y: number;
}

class Mouse extends React.Component<
  { children: (pos: MousePosition) => React.ReactNode },
  MousePosition
> {
  state = { x: 0, y: 0 };

  handleMouseMove = (e: MouseEvent) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  render() {
    return this.props.children(this.state);
  }
}

// 使用
<Mouse>
  {({ x, y }) => (
    <div>
      Mouse at {x}, {y}
    </div>
  )}
</Mouse>
```

### 带自定义 Hook 的现代 React

```tsx
interface MousePosition {
  x: number;
  y: number;
}

function useMouse(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setPosition({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
}

// 使用
function MouseTracker() {
  const { x, y } = useMouse();

  return (
    <div>
      Mouse at {x}, {y}
    </div>
  );
}
```

**Hook 优势：**
- 无额外嵌套
- 更清晰的数据流
- 轻松组合多个 hooks
- 更好的性能（无包装渲染）

---

## 模式 8: Context 迁移

### 类组件

```tsx
const ThemeContext = React.createContext<Theme>('light');

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  declare context: React.ContextType<typeof ThemeContext>;

  render() {
    return <button className={this.context}>{this.props.children}</button>;
  }
}

// 或使用 Consumer
class ThemedButton2 extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => <button className={theme}>{this.props.children}</button>}
      </ThemeContext.Consumer>
    );
  }
}
```

### 现代 React

```tsx
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// 使用
function ThemedButton({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={theme} onClick={toggleTheme}>
      {children}
    </button>
  );
}
```

**Context 最佳实践：**
- 自定义 hook 用于消费 context
- 记忆化 context 值以防止重新渲染
- 按更新频率分割 contexts
- 提供类型安全并检查 undefined

---

## Server Components 迁移

现代 Next.js 13+ 支持 Server Components，它们不能使用 hooks。

### Client Component (Hooks)

```tsx
'use client';

import { useState, useEffect } from 'react';

export function ClientCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Client-side effect');
  }, []);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Component (Async)

```tsx
// app/page.tsx - 默认为 Server Component
interface User {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    next: { revalidate: 3600 }, // 缓存 1 小时
  });
  return res.json();
}

export default async function UserProfile({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  return (
    <div>
      <h1>{user.name}</h1>
      {/* Client component 用于交互 */}
      <ClientCounter />
    </div>
  );
}
```

**Server vs Client 决策树：**
- 需要交互（onClick、state）？ → Client Component
- 需要浏览器 API（localStorage、window）？ → Client Component
- 需要 effects 或 hooks？ → Client Component
- 获取数据、读取文件、数据库？ → Server Component
- SEO 关键内容？ → Server Component
- 大型依赖？ → Server Component（更小的客户端打包）

参考：`react-expert/references/server-components.md`

---

## 常见陷阱

### 1. 闭包过期

**问题：**
```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 总是打印 0！
      setCount(count + 1); // 总是设置为 1！
    }, 1000);

    return () => clearInterval(id);
  }, []); // 缺少依赖

  return <div>{count}</div>;
}
```

**解决方案：**
```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 函数式更新 - 始终有最新状态
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []); // 现在安全了

  return <div>{count}</div>;
}
```

### 2. 缺少 Effect 依赖

**问题：**
```tsx
function UserSearch({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId); // userId 是一个依赖！
  }, []); // Bug: userId 变化时不会重新获取

  return <div>{user?.name}</div>;
}
```

**解决方案：**
```tsx
function UserSearch({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      const data = await fetchUser(userId);
      if (!cancelled) setUser(data);
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [userId]); // 正确的依赖

  return <div>{user?.name}</div>;
}
```

### 3. 过度记忆化

**问题：**
```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  // 不必要 - React 已经很快
  const memoizedTodos = useMemo(() => todos, [todos]);

  // 不必要 - 简单函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <ul>
      {memoizedTodos.map(todo => (
        <li key={todo.id} onClick={handleClick}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

**解决方案：**
```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  // 仅记忆化昂贵计算
  const completedCount = useMemo(
    () => todos.filter(t => t.completed).length,
    [todos]
  );

  // 仅对传递给 memoized 子组件的 props 使用 useCallback
  return (
    <div>
      <p>Completed: {completedCount}</p>
      <ul>
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
```

**记忆化规则：**
- 优化前先测量
- 仅记忆化昂贵计算
- 记忆化传递给 memoized 子组件的回调
- 不要默认记忆化所有内容

---

## 迁移清单

**迁移前：**
- [ ] 为当前类组件添加测试
- [ ] 识别所有使用的生命周期方法
- [ ] 记录 props、state 和行为
- [ ] 检查错误边界需求
- [ ] 验证无第三方类继承

**迁移中：**
- [ ] 转换构造函数/state 到 useState
- [ ] 映射生命周期方法到 useEffect
- [ ] 转换方法到函数或 useCallback
- [ ] 替换 this.setState 为 state setters
- [ ] 更新 ref 使用到 useRef
- [ ] 添加正确的 effect 依赖
- [ ] 在需要的地方添加清理函数

**迁移后：**
- [ ] 所有测试通过
- [ ] 未添加 eslint-disable 注释
- [ ] 性能等同或更好
- [ ] TypeScript 类型完整
- [ ] 代码审查完成
- [ ] 文档已更新

---

## 渐进式迁移策略

**阶段 1: 新代码**
- 使用 hooks 编写所有新组件
- 建立团队模式和约定

**阶段 2: 叶子组件**
- 首先迁移没有子组件的组件
- 建立信心和肌肉记忆

**阶段 3: 容器组件**
- 迁移父组件
- 提取自定义 hooks 用于可重用逻辑

**阶段 4: 核心基础设施**
- 迁移 providers 和 contexts
- 更新路由和状态管理

**永不：**
- 不要一次性迁移所有内容
- 不要不必要地迁移稳定代码
- 不要为了纯粹性而破坏工作功能

---

本迁移指南提供了实用模式，用于现代化 React 代码库，同时避免常见陷阱并在整个过渡过程中保持代码质量。
