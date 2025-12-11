# JSBridge 接口文档

## 引用方式
```typescript
import { openWebview, navigateBack } from '@dragonpass/miniapp-jsbridge';
```

## 功能类型
工具

## 功能名称
JSBridge API 接口

## 功能描述
提供程序与 H5 页面之间的通信桥梁，支持页面导航、返回操作等功能，适用于需要与程序交互的 H5 场景。

## 何时使用
当 H5 页面需要在程序环境中进行页面跳转、返回等原生操作时使用此 JSBridge 接口。

## 使用示例
```typescript
// 打开新页面
openWebview('https://example.com/page', {
    closePrevPage: 0,
    pageName: '页面标题',
    query: { id: 123, type: 'demo' },
    onSuccess: (response) => {
        console.log('页面打开成功', response);
    }
});

// 返回上一页
navigateBack({
    h5Options: {
        mode: 'back',
        steps: 1
    },
    onSuccess: (response) => {
        console.log('返回成功', response);
    }
});
```

## API

### openWebview 函数
| 参数名 | 类型 | 说明 | 默认值 |
|-------|------|-----|-------|
| url | string | 要打开的页面 URL | - |
| options | OpenWebviewParams | 打开页面的配置参数 | 可选 |

### navigateBack 函数
| 参数名 | 类型 | 说明 | 默认值 |
|-------|------|-----|-------|
| options | NavigateBackParams | 返回页面的配置参数 | 可选 |

## 类型描述
| 类型名 | 类型详情 | 必填 | 默认值 | 说明 |
|-------|------|-----|-------|------|
| OpenWebviewParams | { closePrevPage?: 0 \| 1; pageName?: string; pageSetting?: PageConfig; params?: Record<string, unknown>; query?: Record<string, string \| number \| boolean \| undefined>; h5Options?: OpenWebviewMode; onSuccess?: CallbackAction; } | 否 | - | 打开 Webview 的参数配置 |
| OpenWebviewMode | { mode?: 'href' \| 'replace' \| 'spaPush' \| 'spaReplace'; state?: Record<string, unknown>; } | 否 | - | H5 页面打开模式配置 |
| CallbackAction | <T = any>(info: MessageResponse<T>) => void | 否 | - | 回调函数类型 |
| MessageResponse | { statusCode: number; msg?: string; errCode?: string; data?: T; } | 否 | - | 消息响应结构 |
| NavigateBackParams | { h5Options?: NavigateBackMode; onSuccess?: CallbackAction; } | 否 | - | 返回导航的参数配置 |
| NavigateBackMode | { mode?: 'back' \| 'close'; steps?: number; } | 否 | - | 返回模式配置 |

## 主题变量
此工具为纯功能接口，不涉及 UI 样式，无需主题变量。