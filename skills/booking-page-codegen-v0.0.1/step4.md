# 步骤4：代码整合与PRD验收

**触发条件**：'current_step = 4'，已完成数据和交互逻辑设计

**行动**:

1. **代码整合与生成**
   - 将步骤 2 和步骤 3 设计的逻辑，完整地补全到用户的静态模板代码中
   - 确保保留原有的样式类名（Tailwind CSS）和 DOM 结构
   - 移除所有 TODO 注释，替换为实际的业务逻辑代码

2. **PRD 功能验收**
   - 再次读取 `.claude/skills/booking-page-codegen/references/prd.md`
   - 逐条核对 Gherkin Scenarios，确保生成的代码满足所有验收标准：
     - [ ] Scenario: 初始化预订表单
     - [ ] Scenario: 选择访问日期
     - [ ] Scenario: 选择进入时间
     - [ ] Scenario: 动态填写乘客姓名
     - [ ] Scenario: 动态字段必填验证
     - [ ] Scenario: 数据持久化
     - [ ] Scenario: 表单验证和按钮状态
     - [ ] Scenario: 跳转到结账页面

**输出目标**：

- 生成完整的 booking 页面代码
- 确认代码逻辑覆盖了所有 PRD 需求
