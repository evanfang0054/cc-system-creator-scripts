---
name: booking-page-codegen
description: 通过分析静态模板、实现 API 集成的数据逻辑、添加 JSBridge 交互和 PRD 验证，为 LFD 项目生成完整的预订页面胶水代码。当用户需要：(1) 从静态模板完成预订页面实现，(2) 集成日期时间选择和乘客验证的 API 调用，(3) 添加表单验证和错误处理，(4) 实现移动应用集成的 JSBridge 通信时使用。
---

# LFD 预订页面代码生成

此技能提供结构化的工作流程，通过静态模板生成完整的预订页面实现，遵循 LFD 项目架构和标准。

## 快速开始

提供静态模板代码以开始 5 步自动化生成流程。系统将引导您完成每个阶段：

1. **需求分析** - 分析模板并理解业务逻辑
2. **数据层设计** - 实现 API 集成和状态管理
3. **UI 交互逻辑** - 添加用户交互和 JSBridge 通信
4. **代码整合与验证** - 生成完整实现
5. **测试与验证** - 根据测试用例和要求进行验证

## 实现工作流程

该技能遵循渐进式 5 步工作流程。首先提供您的静态模板代码：

```bash
# 示例：提供您的预订页面模板
用户: "这是我的静态预订页面模板代码..."
```

系统将自动从第 1 步开始，并引导您完成每个阶段。

## 详细步骤流程

### 第 1 步：需求分析与代码结构
- **读取**: [step1.md](step1.md) - 模板分析和需求理解
- **参考**: [prd.md](references/prd.md), [codingspec.md](references/codingspec.md)
- **输出**: 理解当前结构和业务需求

### 第 2 步：API 集成与数据逻辑
- **读取**: [step2.md](step2.md) - 数据层设计和 API 集成
- **参考**: [api-docs.md](references/api-docs.md), [api-request.md](references/api-request.md)
- **输出**: 数据流设计和 API 调用实现

### 第 3 步：UI 组件与用户交互
- **读取**: [step3.md](step3.md) - 组件逻辑和用户体验
- **参考**: [jsbridge.md](references/jsbridge.md), 组件文档
- **输出**: 具有适当事件处理的交互式组件

### 第 4 步：代码整合与验证
- **读取**: [step4.md](step4.md) - 完整实现生成
- **参考**: 所有先前文档用于整合
- **输出**: 完整的、集成的预订页面代码

### 第 5 步：测试与最终验证
- **读取**: [step5.md](step5.md) - 测试和质量保证
- **参考**: [test-cases.md](references/test-cases.md), [prd.md](references/prd.md)
- **输出**: 经过验证的、生产就绪的代码

## 参考文档

以下参考资料根据需要可用并加载：

### 核心参考
- **[prd.md](references/prd.md)** - 完整的产品需求和业务逻辑
- **[test-cases.md](references/test-cases.md)** - 测试场景和验证标准
- **[codingspec.md](references/codingspec.md)** - LFD 项目编码标准和约定

### 技术参考
- **[api-docs.md](references/api-docs.md)** - REST API 文档和端点
- **[api-request.md](references/api-request.md)** - API 客户端使用模式和工具
- **[jsbridge.md](references/jsbridge.md)** - 通过 JSBridge 进行移动应用集成

## 使用说明

- **渐进式加载**: 步骤文件和参考资料仅在需要时加载以优化上下文使用
- **顺序执行**: 必须完成每一步才能进行下一步
- **完整覆盖**: 完全阅读所有文档部分以确保不遗漏任何需求
- **验证**: 每一步都包括进行前的验证检查点
