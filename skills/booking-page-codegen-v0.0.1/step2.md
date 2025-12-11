# 步骤2：接口与数据逻辑补全

**触发条件**：'current_step = 2'，已完成需求理解和代码分析

**行动**:

1. **阅读接口文档**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/api-docs.md`
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/api-request.md`

2. **获取接口 Schema**
   - 针对 `api-docs.md` 中提到的接口链接，使用 `WebFetch` 工具获取详细的接口文档 Schema
   - **重要**：禁止在没有获取到对应接口 Schema 的情况下对接口参数和响应进行假设补全
   - 示例1：

     ```bash
     WebFetch https://apifox.dragonpass.com.cn/apidoc/shared/...
     ```

     - 示例2：
  
     ```bash
     curl https://apifox.dragonpass.com.cn/apidoc/shared/...
     ```

3. **设计数据层逻辑**
   - 基于 `api-request.md` 的规范，设计接口请求函数
   - 规划如何在 `useBookingStore` 中存储和获取数据（资源详情、Policy、可选日期等）
   - 规划页面初始化时的数据加载流程（如 `useEffect` 中的调用）

**输出目标**：

- 完成所有涉及接口调用的代码逻辑设计
- 明确数据状态的管理方式
