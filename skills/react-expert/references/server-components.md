# Server Components

## Server vs Client Components

```tsx
// Server Component (App Router 中的默认)
// 可以: 获取数据、访问后端、使用 async/await
// 不能: 使用 hooks、浏览器 API、事件处理器
async function ProductList() {
  const products = await db.products.findMany();
  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}

// Client Component (显式标记)
'use client';
import { useState } from 'react';

function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={() => addToCart(productId)} disabled={loading}>
      Add to Cart
    </button>
  );
}
```

## 数据获取模式

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  // 仅在服务器上运行 - 无客户端打包影响
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // 缓存 1 小时
  }).then(res => res.json());

  return <ProductGrid products={products} />;
}

// 并行数据获取
async function Dashboard() {
  const [user, orders, recommendations] = await Promise.all([
    getUser(),
    getOrders(),
    getRecommendations(),
  ]);

  return (
    <>
      <UserHeader user={user} />
      <OrderList orders={orders} />
      <Recommendations items={recommendations} />
    </>
  );
}
```

## 使用 Suspense 流式传输

```tsx
import { Suspense } from 'react';

async function SlowComponent() {
  const data = await slowFetch(); // 3 秒 API 调用
  return <div>{data}</div>;
}

export default function Page() {
  return (
    <main>
      <h1>Dashboard</h1>
      <FastComponent />

      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
    </main>
  );
}
```

## 传递数据 Server → Client

```tsx
// Server Component
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id);

  // 传递可序列化数据到客户端
  return (
    <div>
      <h1>{product.name}</h1>
      {/* Client component 接收序列化的 props */}
      <AddToCartButton productId={product.id} price={product.price} />
    </div>
  );
}
```

## Server Actions

```tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}

// page.tsx (Server Component)
import { createPost } from './actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## 快速参考

| 类型 | 可以使用 | 不能使用 |
|------|---------|------------|
| Server | async/await、db、fs | useState、onClick |
| Client | hooks、events、浏览器 API | async 组件 |

| 模式 | 使用场景 |
|---------|----------|
| Server Component | 数据获取、大型依赖 |
| Client Component | 交互、状态 |
| `'use client'` | 标记客户端边界 |
| `'use server'` | Server Action |
| Suspense | 流式传输、加载状态 |
