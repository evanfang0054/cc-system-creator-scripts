#!/bin/bash
# Mole 安装检查和快速诊断脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   Mole 诊断工具${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查操作系统
echo -e "${YELLOW}[1/6] 检查操作系统...${NC}"
if [[ "$(uname)" != "Darwin" ]]; then
    echo -e "${RED}✗ 错误：Mole 仅支持 macOS${NC}"
    exit 1
fi
echo -e "${GREEN}✓ macOS $(sw_vers -productVersion)${NC}"
echo ""

# 检查 Mole 安装
echo -e "${YELLOW}[2/6] 检查 Mole 安装...${NC}"
if ! command -v mo &> /dev/null; then
    echo -e "${RED}✗ Mole 未安装${NC}"
    echo ""
    echo "安装方法："
    echo "  brew install tw93/tap/mole"
    echo "  或"
    echo "  curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash"
    exit 1
fi
echo -e "${GREEN}✓ Mole 已安装${NC}"
mo --version
echo ""

# 检查配置目录
echo -e "${YELLOW}[3/6] 检查配置目录...${NC}"
CONFIG_DIR="$HOME/.config/mole"
if [[ -d "$CONFIG_DIR" ]]; then
    echo -e "${GREEN}✓ 配置目录存在: $CONFIG_DIR${NC}"
    echo "  文件列表："
    ls -la "$CONFIG_DIR" | tail -n +2 | while read line; do
        echo "    $line"
    done
else
    echo -e "${YELLOW}⚠ 配置目录不存在，将在首次运行时创建${NC}"
fi
echo ""

# 检查白名单
echo -e "${YELLOW}[4/6] 检查白名单配置...${NC}"
WHITELIST="$CONFIG_DIR/whitelist"
if [[ -f "$WHITELIST" ]] && [[ -s "$WHITELIST" ]]; then
    echo -e "${GREEN}✓ 白名单已配置:${NC}"
    cat "$WHITELIST" | while read line; do
        [[ -n "$line" ]] && echo "    $line"
    done
else
    echo -e "${YELLOW}⚠ 白名单为空或不存在${NC}"
    echo "  可通过 'mo clean --whitelist' 配置"
fi
echo ""

# 检查磁盘空间
echo -e "${YELLOW}[5/6] 检查磁盘空间...${NC}"
DISK_INFO=$(df -h / | tail -1)
TOTAL=$(echo $DISK_INFO | awk '{print $2}')
USED=$(echo $DISK_INFO | awk '{print $3}')
AVAIL=$(echo $DISK_INFO | awk '{print $4}')
PERCENT=$(echo $DISK_INFO | awk '{print $5}')
echo "  总容量: $TOTAL"
echo "  已使用: $USED ($PERCENT)"
echo "  可用: $AVAIL"
echo ""

# 检查终端
echo -e "${YELLOW}[6/6] 检查终端兼容性...${NC}"
TERM_APP="${TERM_PROGRAM:-Unknown}"
case "$TERM_APP" in
    "Alacritty"|"kitty"|"WezTerm"|"Ghostty"|"Warp"|"Apple_Terminal")
        echo -e "${GREEN}✓ 终端: $TERM_APP (兼容)${NC}"
        ;;
    "iTerm"|"iTerm.app")
        echo -e "${YELLOW}⚠ 终端: $TERM_APP (已知兼容性问题，建议更换)${NC}"
        ;;
    *)
        echo -e "${YELLOW}? 终端: $TERM_APP (未知)${NC}"
        ;;
esac
echo ""

# 总结
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   诊断完成${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "快速命令："
echo "  mo              # 主菜单"
echo "  mo clean        # 深度清理"
echo "  mo status       # 系统状态"
echo "  mo analyze      # 磁盘分析"
