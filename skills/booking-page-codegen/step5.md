# 步骤5：测试用例验收与最终验证

**触发条件**：'current_step = 5'，已生成代码并完成 PRD 验收

**前置准备（关键）**：
```bash
# 必须首先读取任务计划和研究笔记，回顾整个任务过程
# 注意：路径占位符 `/path/to/booking/` 应替换为实际目录
Read /path/to/booking/task_plan.md
Read /path/to/booking/research_notes.md
```

**目的**：
- 回顾整个任务过程，确保没有遗漏任何需求（从 task_plan.md 获取）
- 获取完整的研究上下文，确保测试验证全面（从 research_notes.md 获取）
- 在上下文窗口中保持完整的设计和实现信息

**路径占位符说明**：
- 提供的静态模板路径如 `/Users/user/project/pages/booking/index.tsx`
- 则 `/path/to/booking/` 替换为 `/Users/user/project/pages/booking/`

**主要行动**:

1. **代码质量验证（必须通过，不得跳过）**

   **⚠️ 强制原则**：
   - **验证必须通过才能进入最终交付**
   - **存在任何错误时不得继续**
   - **修复后重新验证，直到零错误**

   **关键前置步骤：确定项目目录**

   从用户提供的静态模板路径中找到项目根目录：
   - 静态模板：`/Users/user/project/pages/booking/index.tsx`
   - 项目根目录：`/Users/user/project/`（包含 package.json 的目录）
   - Monorepo 子包：`/Users/user/project/packages/package-name/`

   **统一验证流程（必须 cd 到项目目录）**：

   **步骤1：进入项目根目录**

   ```bash
   cd /path/to/project && pnpm run check
   ```

   **步骤2：如果命令失败，检查可用的脚本**

   ```bash
   cd /path/to/project && cat package.json | grep -E '"(check|lint|validate|test)"'
   ```

   **步骤3：使用存在的脚本**

   ```bash
   # 如果有 check
   cd /path/to/project && pnpm run check

   # 如果有 lint 和 type-check
   cd /path/to/project && pnpm run lint && pnpm run type-check

   # 如果只有 lint
   cd /path/to/project && pnpm run lint

   # 如果都没有，使用 tsc 检查类型
   cd /path/to/project && npx tsc --noEmit
   ```

   **验证结果处理**：

   ✅ **如果通过**（退出码 0，无 error）：
   - 直接进入下一步（最终交付）

   ❌ **如果失败**（存在错误）：
   1. 仔细阅读错误信息
   2. 修复所有错误
   3. **重新运行验证命令**
   4. 重复直到验证通过
   5. **只有在验证通过后才能进入最终交付**

   **常见错误修复**：

   - **TypeScript 类型错误**：检查组件属性类型、接口参数类型
   - **ESLint 规则错误**：检查代码风格、未使用变量
   - **组件属性错误**：查询组件文档并修正属性配置
   - **接口参数错误**：对照 API 文档修正参数

2. **最终交付（仅限验证通过后）**

   **⚠️ 前置条件**：
   - **必须先通过代码质量验证**
   - **零错误才能进入此步骤**

   **交付内容**：
   - 生成 `final_code.md`，包含完整代码、注释和说明

**步骤完成后的行动（重要）**：

1. **生成最终输出文件**：

   ```bash
   Write /path/to/booking/final_code.md
   ```

   - 生成最终的代码文件
   - 包含完整的代码、注释和说明

2. **更新 task_plan.md**：

   ```bash
   Edit /path/to/booking/task_plan.md
   ```

   - 标记阶段 5 为完成：`- [x] 阶段 5：测试用例验收与最终验证`
   - 在"遇到的错误"部分记录测试过程中的问题及解决方案
   - 更新状态为："**所有阶段已完成** - 任务完成"

3. **告知用户任务全部完成**：
   - 明确告知用户："🎉 所有步骤已完成！任务已成功完成"
   - 总结关键成果（生成的代码、解决的问题等）
   - 提供最终代码文件的路径（`/path/to/booking/final_code.md`）
   - **这是最后一步，无需再进入下一步**
