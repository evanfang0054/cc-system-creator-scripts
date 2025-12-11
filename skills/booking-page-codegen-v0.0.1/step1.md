# 步骤1：理解需求与代码分析

**触发条件**：'current_step = 1'，用户已提供booking页面的静态模板代码

**行动**:

1. **读取并理解静态代码**
   - 仔细阅读用户提供的 `index.tsx` 及相关文件
   - 识别现有的 UI 结构、组件层级和待补全的逻辑点（TODOs）
   - 分析 `useBookingStore` 的状态定义（如果提供了相关文件）

2. **读取需求文档**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/prd.md`
   - 理解业务流程、核心功能点（如日期选择、乘客信息动态渲染）
   - 理解数据流向和字段必填规则（PrebookingPolicy）

3. **读取编码规范**
   - 彻底阅读 `.claude/skills/booking-page-codegen/references/codingspec.md`
   - 确保了解项目的文件命名、变量命名、注释规范及 React Hooks 使用规范

**输出目标**：

- 确认已理解代码结构和业务需求
- 准备好进行下一步的数据层逻辑设计
