#!/bin/bash

# 测试 Skill Manager CLI
# 此脚本用于在无法使用 tsx 的环境下测试功能

echo "🧪 Skill Manager 测试脚本"
echo "=========================="
echo ""

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "⚠️  项目未构建,正在构建..."
    pnpm run build
    echo ""
fi

# 显示帮助
echo "📋 测试 --help 命令"
echo "--------------------"
node dist/index.js --help
echo ""

echo "✅ 基本测试完成!"
echo ""
echo "💡 使用示例:"
echo "  node dist/index.js add https://gitlab.company.com/skill"
echo "  node dist/index.js check"
echo "  node dist/index.js update"
echo ""
