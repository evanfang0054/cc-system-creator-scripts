"""解压 Office 文件（DOCX、PPTX、XLSX）以便编辑。

提取 ZIP 压缩包，格式化 XML 文件，并可选地：
- 合并具有相同格式的相邻文本段（仅 DOCX）
- 简化同一作者的相邻修订标记（仅 DOCX）

用法:
    python unpack.py <office文件> <输出目录> [选项]

示例:
    python unpack.py document.docx unpacked/
    python unpack.py presentation.pptx unpacked/
    python unpack.py document.docx unpacked/ --merge-runs false
"""

import argparse
import sys
import zipfile
from pathlib import Path

import defusedxml.minidom

from helpers.merge_runs import merge_runs as do_merge_runs
from helpers.simplify_redlines import simplify_redlines as do_simplify_redlines

# 智能引号替换映射
SMART_QUOTE_REPLACEMENTS = {
    "\u201c": "&#x201C;",  # 左双引号
    "\u201d": "&#x201D;",  # 右双引号
    "\u2018": "&#x2018;",  # 左单引号
    "\u2019": "&#x2019;",  # 右单引号
}


def unpack(
    input_file: str,
    output_directory: str,
    merge_runs: bool = True,
    simplify_redlines: bool = True,
) -> tuple[None, str]:
    """
    解压 Office 文件到指定目录

    参数:
        input_file: 输入的 Office 文件路径
        output_directory: 输出目录路径
        merge_runs: 是否合并相邻的相同格式文本段（仅 DOCX）
        simplify_redlines: 是否简化相邻的修订标记（仅 DOCX）

    返回:
        (None, 消息字符串) 元组
    """
    input_path = Path(input_file)
    output_path = Path(output_directory)
    suffix = input_path.suffix.lower()

    if not input_path.exists():
        return None, f"错误: {input_file} 不存在"

    if suffix not in {".docx", ".pptx", ".xlsx"}:
        return None, f"错误: {input_file} 必须是 .docx、.pptx 或 .xlsx 文件"

    try:
        output_path.mkdir(parents=True, exist_ok=True)

        # 解压 ZIP 文件
        with zipfile.ZipFile(input_path, "r") as zf:
            zf.extractall(output_path)

        # 格式化所有 XML 文件
        xml_files = list(output_path.rglob("*.xml")) + list(output_path.rglob("*.rels"))
        for xml_file in xml_files:
            _pretty_print_xml(xml_file)

        message = f"已解压 {input_file}（{len(xml_files)} 个 XML 文件）"

        # 对 DOCX 文件执行额外的简化操作
        if suffix == ".docx":
            if simplify_redlines:
                simplify_count, _ = do_simplify_redlines(str(output_path))
                message += f"，简化了 {simplify_count} 个修订标记"

            if merge_runs:
                merge_count, _ = do_merge_runs(str(output_path))
                message += f"，合并了 {merge_count} 个文本段"

        # 转义智能引号
        for xml_file in xml_files:
            _escape_smart_quotes(xml_file)

        return None, message

    except zipfile.BadZipFile:
        return None, f"错误: {input_file} 不是有效的 Office 文件"
    except Exception as e:
        return None, f"解压错误: {e}"


def _pretty_print_xml(xml_file: Path) -> None:
    """
    格式化 XML 文件，使其更易读

    参数:
        xml_file: XML 文件路径
    """
    try:
        content = xml_file.read_text(encoding="utf-8")
        dom = defusedxml.minidom.parseString(content)
        xml_file.write_bytes(dom.toprettyxml(indent="  ", encoding="utf-8"))
    except Exception:
        pass  # 忽略无法解析的文件


def _escape_smart_quotes(xml_file: Path) -> None:
    """
    将智能引号转义为 XML 实体

    参数:
        xml_file: XML 文件路径
    """
    try:
        content = xml_file.read_text(encoding="utf-8")
        for char, entity in SMART_QUOTE_REPLACEMENTS.items():
            content = content.replace(char, entity)
        xml_file.write_text(content, encoding="utf-8")
    except Exception:
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="解压 Office 文件（DOCX、PPTX、XLSX）以便编辑"
    )
    parser.add_argument("input_file", help="要解压的 Office 文件")
    parser.add_argument("output_directory", help="输出目录")
    parser.add_argument(
        "--merge-runs",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="合并具有相同格式的相邻文本段（仅 DOCX，默认: true）",
    )
    parser.add_argument(
        "--simplify-redlines",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="合并同一作者的相邻修订标记（仅 DOCX，默认: true）",
    )
    args = parser.parse_args()

    _, message = unpack(
        args.input_file,
        args.output_directory,
        merge_runs=args.merge_runs,
        simplify_redlines=args.simplify_redlines,
    )
    print(message)

    if "错误" in message:
        sys.exit(1)
