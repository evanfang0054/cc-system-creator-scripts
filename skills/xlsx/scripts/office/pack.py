"""将目录打包为 DOCX、PPTX 或 XLSX 文件。

支持自动修复验证、压缩 XML 格式，并创建 Office 文件。

用法:
    python pack.py <输入目录> <输出文件> [--original <文件>] [--validate true|false]

示例:
    python pack.py unpacked/ output.docx --original input.docx
    python pack.py unpacked/ output.pptx --validate false
"""

import argparse
import sys
import shutil
import tempfile
import zipfile
from pathlib import Path

import defusedxml.minidom

from validators import DOCXSchemaValidator, PPTXSchemaValidator, RedliningValidator

def pack(
    input_directory: str,
    output_file: str,
    original_file: str | None = None,
    validate: bool = True,
    infer_author_func=None,
) -> tuple[None, str]:
    """
    将目录打包为 Office 文件

    参数:
        input_directory: 输入目录路径
        output_file: 输出文件路径
        original_file: 原始文件路径（用于验证对比）
        validate: 是否运行验证
        infer_author_func: 推断作者的函数

    返回:
        (None, 消息字符串) 元组
    """
    input_dir = Path(input_directory)
    output_path = Path(output_file)
    suffix = output_path.suffix.lower()

    if not input_dir.is_dir():
        return None, f"错误: {input_dir} 不是目录"

    if suffix not in {".docx", ".pptx", ".xlsx"}:
        return None, f"错误: {output_file} 必须是 .docx、.pptx 或 .xlsx 文件"

    # 如果启用验证且提供了原始文件，则运行验证
    if validate and original_file:
        original_path = Path(original_file)
        if original_path.exists():
            success, output = _run_validation(
                input_dir, original_path, suffix, infer_author_func
            )
            if output:
                print(output)
            if not success:
                return None, f"错误: {input_dir} 验证失败"

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_content_dir = Path(temp_dir) / "content"
        shutil.copytree(input_dir, temp_content_dir)

        # 压缩所有 XML 文件的格式
        for pattern in ["*.xml", "*.rels"]:
            for xml_file in temp_content_dir.rglob(pattern):
                _condense_xml(xml_file)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in temp_content_dir.rglob("*"):
                if f.is_file():
                    zf.write(f, f.relative_to(temp_content_dir))

    return None, f"成功将 {input_dir} 打包为 {output_file}"


def _run_validation(
    unpacked_dir: Path,
    original_file: Path,
    suffix: str,
    infer_author_func=None,
) -> tuple[bool, str | None]:
    """
    运行验证器对解压后的目录进行验证

    参数:
        unpacked_dir: 解压后的目录
        original_file: 原始文件
        suffix: 文件扩展名
        infer_author_func: 推断作者的函数

    返回:
        (是否成功, 输出消息) 元组
    """
    output_lines = []
    validators = []

    if suffix == ".docx":
        author = "Claude"
        if infer_author_func:
            try:
                author = infer_author_func(unpacked_dir, original_file)
            except ValueError as e:
                print(f"警告: {e} 使用默认作者 'Claude'。", file=sys.stderr)

        validators = [
            DOCXSchemaValidator(unpacked_dir, original_file),
            RedliningValidator(unpacked_dir, original_file, author=author),
        ]
    elif suffix == ".pptx":
        validators = [PPTXSchemaValidator(unpacked_dir, original_file)]

    if not validators:
        return True, None

    # 执行自动修复并统计修复数量
    total_repairs = sum(v.repair() for v in validators)
    if total_repairs:
        output_lines.append(f"自动修复了 {total_repairs} 个问题")

    success = all(v.validate() for v in validators)

    if success:
        output_lines.append("所有验证通过！")

    return success, "\n".join(output_lines) if output_lines else None


def _condense_xml(xml_file: Path) -> None:
    """
    压缩 XML 文件格式，移除不必要的空白和注释

    参数:
        xml_file: XML 文件路径
    """
    try:
        with open(xml_file, encoding="utf-8") as f:
            dom = defusedxml.minidom.parse(f)

        # 遍历所有元素，移除空白文本节点和注释
        for element in dom.getElementsByTagName("*"):
            # 保留 w:t 等文本元素中的内容
            if element.tagName.endswith(":t"):
                continue

            for child in list(element.childNodes):
                if (
                    child.nodeType == child.TEXT_NODE
                    and child.nodeValue
                    and child.nodeValue.strip() == ""
                ) or child.nodeType == child.COMMENT_NODE:
                    element.removeChild(child)

        xml_file.write_bytes(dom.toxml(encoding="UTF-8"))
    except Exception as e:
        print(f"错误: 解析 {xml_file.name} 失败: {e}", file=sys.stderr)
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="将目录打包为 DOCX、PPTX 或 XLSX 文件"
    )
    parser.add_argument("input_directory", help="解压后的 Office 文档目录")
    parser.add_argument("output_file", help="输出 Office 文件 (.docx/.pptx/.xlsx)")
    parser.add_argument(
        "--original",
        help="用于验证对比的原始文件",
    )
    parser.add_argument(
        "--validate",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="运行验证并自动修复（默认: true）",
    )
    args = parser.parse_args()

    _, message = pack(
        args.input_directory,
        args.output_file,
        original_file=args.original,
        validate=args.validate,
    )
    print(message)

    if "错误" in message:
        sys.exit(1)
