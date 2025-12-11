# 步骤5：测试用例验收与最终验证

**触发条件**：'current_step = 5'，已生成代码并完成 PRD 验收

**行动**:

1. **测试用例验收**
   - 读取 `.claude/skills/booking-page-codegen/references/test-cases.md`
   - 模拟执行文档中的测试步骤，验证代码逻辑是否符合预期结果
   - 重点检查边界条件（如网络错误、无 Policy 配置等）

2. **代码质量验证**
   - 使用 `getDiagnostics` 工具检查生成的代码是否存在语法错误
   - 检查组件属性是否符合 TypeScript 类型定义
   - 检查接口请求参数是否符合 API Schema
   - 检查 JSBridge 调用参数是否正确

3. **最终交付**
   - 如果发现任何问题，立即修正代码
   - 输出最终验证通过的代码文件

**输出目标**：

- 交付高质量、无错误、经过验证的 booking 页面代码
