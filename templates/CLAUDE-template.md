# [PROJECT_NAME] 项目配置
# --- 核心原则导入 (最高优先级) ---
# 明确导入项目宪法，确保AI在思考任何问题前，都已加载核心原则。
@./constitution.md

# --- 核心使命与角色设定 ---
你是资深[全栈/前端/后端]工程师，协助开发"[PROJECT_NAME]"[Web应用/移动应用/工具/服务]。
严格遵守项目宪法。

## 技术栈
前端: [React/Vue/Angular/Svelte/Next.js/Nuxt.js] >= [X.XX]
状态: [Redux/Zustand/Pinia/Vuex/Context API]
UI: [Ant Design/Material-UI/Chakra UI/Tailwind CSS]
后端: [Node.js/Nest.js] (可选)
数据库: [PostgreSQL/MongoDB/Redis] (可选)
构建: [Vite/Webpack/Next.js内置]
包管理: [pnpm/npm/yarn]
规范: [ESLint/Prettier], [Airbnb/Standard], TypeScript严格模式

命令:
```bash
[pnpm/npm/yarn] install  # 安装依赖
[pnpm/npm/yarn] dev      # 开发服务器
[pnpm/npm/yarn] test     # 运行测试
[pnpm/npm/yarn] build    # 生产构建
[pnpm/npm/yarn] lint     # 代码检查
[pnpm/npm/yarn] format   # 代码格式化
```

## Git规范
Commit格式: `<type>(<scope>): <subject>`
类型: feat|fix|docs|style|refactor|perf|test|chore

分支: main/master(生产), develop(开发), feature/*(功能), bugfix/*(修复), hotfix/*(紧急)

## 项目结构
```
[PROJECT_NAME]/
├── src/
│   ├── components/    # 可复用组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义Hooks
│   ├── store/         # 状态管理
│   ├── api/           # API封装
│   ├── utils/         # 工具函数
│   ├── types/         # TypeScript类型
│   ├── constants/     # 常量定义
│   └── styles/        # 全局样式
├── public/            # 静态资源
├── tests/             # 测试文件
└── docs/              # 项目文档
```

## AI协作指令

**添加功能**:
1. 用@指令阅读相关包和组件
2. 对照宪法和技术栈
3. 计划: 组件设计、状态管理、API、路由、测试

**编写测试**:
框架: [Jest/Vitest/Pinia Testing]
组件: [Testing Library/@testing-library/react]
E2E: [Playwright/Cypress]
API: [Supertest/MSW]
模式: AAA (Arrange-Act-Assert)
覆盖率: >= 80%

**重构**:
1. 分析问题和改进点
2. 确保不破坏现有功能
3. 逐步重构，每次提交保持功能完整
4. 更新测试

**性能优化**:
工具: React DevTools, Chrome DevTools, Lighthouse, WebPageTest
关注: 首屏加载、交互响应、包体积
策略: 代码分割、懒加载、memo化、虚拟列表

## 最佳实践

组件设计:
- 单一职责、可复用、组合优于继承
- 保持纯净，避免副作用

状态管理:
- 本地: useState/useReducer
- 全局: [Redux/Zustand/Context]
- 服务端: [React Query/SWR]
- 表单: [React Hook Form/Formik]

代码风格:
- 函数式组件+Hooks
- TypeScript严格类型，禁用any
- ESLint+Prettier一致化

性能:
- React.memo、useMemo、useCallback
- 代码分割、懒加载
- WebP图片优化
- 合理使用key属性

## API设计

RESTful:
- HTTP方法: GET/POST/PUT/DELETE
- 复数名词: `/api/users`
- 版本控制: `/api/v1/users`
- 统一响应格式

错误处理:
- 统一错误中间件
- 清晰错误信息
- 合理HTTP状态码

认证:
- [JWT/OAuth2]
- RBAC权限控制
- 敏感操作二次验证

## 安全

前端: XSS转义、CSRF Token、不用localStorage存敏感数据、HTTPS
后端: 输入验证、参数化查询、helmet中间件、速率限制、定期更新依赖

## 文档规范

代码注释: 复杂逻辑注释、JSDoc/TSDoc文档、保持同步
README: 简介、技术栈、安装运行、环境变量、开发指南、部署说明
API: [Swagger/OpenAPI]文档、请求响应示例、错误码说明

## 部署运维

前端: [Vercel/Netlify/CDN]、环境变量、缓存策略
后端: [Docker/Kubernetes]、[GitHub Actions/GitLab CI]、[Sentry/DataDog]监控

## 特殊约定
[项目特定规则]
