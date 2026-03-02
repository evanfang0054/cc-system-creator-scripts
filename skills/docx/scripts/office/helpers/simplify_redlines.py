"""通过合并相邻的 w:ins 或 w:del 元素来简化追踪修订。

将同一作者的相邻 <w:ins> 元素合并为单个元素。
<w:del> 元素同理。通过减少追踪修订包装器的数量，
使重度修订的文档更易于处理。

规则：
- 仅合并相同元素类型（w:ins 与 w:ins，w:del 与 w:del）
- 仅合并同一作者的元素（忽略时间戳差异）
- 仅合并真正相邻的元素（中间只有空白字符）
"""

import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import defusedxml.minidom

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def simplify_redlines(input_dir: str) -> tuple[int, str]:
    doc_xml = Path(input_dir) / "word" / "document.xml"

    if not doc_xml.exists():
        return 0, f"Error: {doc_xml} not found"

    try:
        dom = defusedxml.minidom.parseString(doc_xml.read_text(encoding="utf-8"))
        root = dom.documentElement

        merge_count = 0

        # 查找所有段落和表格单元格容器
        containers = _find_elements(root, "p") + _find_elements(root, "tc")

        for container in containers:
            merge_count += _merge_tracked_changes_in(container, "ins")
            merge_count += _merge_tracked_changes_in(container, "del")

        doc_xml.write_bytes(dom.toxml(encoding="UTF-8"))
        return merge_count, f"Simplified {merge_count} tracked changes"

    except Exception as e:
        return 0, f"Error: {e}"


def _merge_tracked_changes_in(container, tag: str) -> int:
    merge_count = 0

    # 收集容器中所有指定类型的追踪修订元素
    tracked = [
        child
        for child in container.childNodes
        if child.nodeType == child.ELEMENT_NODE and _is_element(child, tag)
    ]

    if len(tracked) < 2:
        return 0

    i = 0
    while i < len(tracked) - 1:
        curr = tracked[i]
        next_elem = tracked[i + 1]

        if _can_merge_tracked(curr, next_elem):
            # 将下一个元素的内容合并到当前元素
            _merge_tracked_content(curr, next_elem)
            container.removeChild(next_elem)
            tracked.pop(i + 1)
            merge_count += 1
        else:
            i += 1

    return merge_count


def _is_element(node, tag: str) -> bool:
    """检查节点是否为指定标签的元素（支持命名空间前缀）"""
    name = node.localName or node.tagName
    return name == tag or name.endswith(f":{tag}")


def _get_author(elem) -> str:
    """获取元素的作者属性值"""
    author = elem.getAttribute("w:author")
    if not author:
        # 尝试查找带有命名空间的 author 属性
        for attr in elem.attributes.values():
            if attr.localName == "author" or attr.name.endswith(":author"):
                return attr.value
    return author


def _can_merge_tracked(elem1, elem2) -> bool:
    """判断两个追踪修订元素是否可以合并"""
    # 作者不同则不能合并
    if _get_author(elem1) != _get_author(elem2):
        return False

    # 检查两个元素之间是否只有空白内容
    node = elem1.nextSibling
    while node and node != elem2:
        if node.nodeType == node.ELEMENT_NODE:
            return False
        if node.nodeType == node.TEXT_NODE and node.data.strip():
            return False
        node = node.nextSibling

    return True


def _merge_tracked_content(target, source):
    """将源元素的所有子节点移动到目标元素"""
    while source.firstChild:
        child = source.firstChild
        source.removeChild(child)
        target.appendChild(child)


def _find_elements(root, tag: str) -> list:
    """递归查找所有指定标签的元素"""
    results = []

    def traverse(node):
        if node.nodeType == node.ELEMENT_NODE:
            name = node.localName or node.tagName
            if name == tag or name.endswith(f":{tag}"):
                results.append(node)
            for child in node.childNodes:
                traverse(child)

    traverse(root)
    return results


def get_tracked_change_authors(doc_xml_path: Path) -> dict[str, int]:
    """获取文档中所有追踪修订的作者及其修订数量"""
    if not doc_xml_path.exists():
        return {}

    try:
        tree = ET.parse(doc_xml_path)
        root = tree.getroot()
    except ET.ParseError:
        return {}

    namespaces = {"w": WORD_NS}
    author_attr = f"{{{WORD_NS}}}author"

    authors: dict[str, int] = {}
    for tag in ["ins", "del"]:
        for elem in root.findall(f".//w:{tag}", namespaces):
            author = elem.get(author_attr)
            if author:
                authors[author] = authors.get(author, 0) + 1

    return authors


def _get_authors_from_docx(docx_path: Path) -> dict[str, int]:
    """从 docx 文件中提取所有追踪修订的作者信息"""
    try:
        with zipfile.ZipFile(docx_path, "r") as zf:
            if "word/document.xml" not in zf.namelist():
                return {}
            with zf.open("word/document.xml") as f:
                tree = ET.parse(f)
                root = tree.getroot()

                namespaces = {"w": WORD_NS}
                author_attr = f"{{{WORD_NS}}}author"

                authors: dict[str, int] = {}
                for tag in ["ins", "del"]:
                    for elem in root.findall(f".//w:{tag}", namespaces):
                        author = elem.get(author_attr)
                        if author:
                            authors[author] = authors.get(author, 0) + 1
                return authors
    except (zipfile.BadZipFile, ET.ParseError):
        return {}


def infer_author(modified_dir: Path, original_docx: Path, default: str = "Claude") -> str:
    """推断新增追踪修订的作者。

    通过对比修改后文档与原始文档的修订数量，
    找出新增修订的作者。如果无法确定则返回默认值。

    Args:
        modified_dir: 解压后的修改文档目录
        original_docx: 原始 docx 文件路径
        default: 无法推断时的默认作者名

    Returns:
        推断出的作者名

    Raises:
        ValueError: 当多个作者都新增了修订时
    """
    modified_xml = modified_dir / "word" / "document.xml"
    modified_authors = get_tracked_change_authors(modified_xml)

    if not modified_authors:
        return default

    original_authors = _get_authors_from_docx(original_docx)

    # 计算每个作者新增的修订数量
    new_changes: dict[str, int] = {}
    for author, count in modified_authors.items():
        original_count = original_authors.get(author, 0)
        diff = count - original_count
        if diff > 0:
            new_changes[author] = diff

    if not new_changes:
        return default

    if len(new_changes) == 1:
        return next(iter(new_changes))

    raise ValueError(
        f"Multiple authors added new changes: {new_changes}. "
        "Cannot infer which author to validate."
    )
