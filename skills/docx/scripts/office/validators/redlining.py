"""
Word 文档中修订追踪的验证器。
"""

import subprocess
import tempfile
import zipfile
from pathlib import Path


class RedliningValidator:

    def __init__(self, unpacked_dir, original_docx, verbose=False, author="Claude"):
        self.unpacked_dir = Path(unpacked_dir)
        self.original_docx = Path(original_docx)
        self.verbose = verbose
        self.author = author
        self.namespaces = {
            "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        }

    def repair(self) -> int:
        return 0

    def validate(self):
        modified_file = self.unpacked_dir / "word" / "document.xml"
        if not modified_file.exists():
            print(f"FAILED - 修改后的 document.xml 未找到: {modified_file}")
            return False

        try:
            import xml.etree.ElementTree as ET

            tree = ET.parse(modified_file)
            root = tree.getroot()

            del_elements = root.findall(".//w:del", self.namespaces)
            ins_elements = root.findall(".//w:ins", self.namespaces)

            author_del_elements = [
                elem
                for elem in del_elements
                if elem.get(f"{{{self.namespaces['w']}}}author") == self.author
            ]
            author_ins_elements = [
                elem
                for elem in ins_elements
                if elem.get(f"{{{self.namespaces['w']}}}author") == self.author
            ]

            if not author_del_elements and not author_ins_elements:
                if self.verbose:
                    print(f"PASSED - 未找到 {self.author} 的修订追踪。")
                return True

        except Exception:
            pass

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            try:
                with zipfile.ZipFile(self.original_docx, "r") as zip_ref:
                    zip_ref.extractall(temp_path)
            except Exception as e:
                print(f"FAILED - 解压原始 docx 时出错: {e}")
                return False

            original_file = temp_path / "word" / "document.xml"
            if not original_file.exists():
                print(
                    f"FAILED - 原始 document.xml 在 {self.original_docx} 中未找到"
                )
                return False

            try:
                import xml.etree.ElementTree as ET

                modified_tree = ET.parse(modified_file)
                modified_root = modified_tree.getroot()
                original_tree = ET.parse(original_file)
                original_root = original_tree.getroot()
            except ET.ParseError as e:
                print(f"FAILED - 解析 XML 文件时出错: {e}")
                return False

            self._remove_author_tracked_changes(original_root)
            self._remove_author_tracked_changes(modified_root)

            modified_text = self._extract_text_content(modified_root)
            original_text = self._extract_text_content(original_root)

            if modified_text != original_text:
                error_message = self._generate_detailed_diff(
                    original_text, modified_text
                )
                print(error_message)
                return False

            if self.verbose:
                print(f"PASSED - {self.author} 的所有修订追踪均正确")
            return True

    def _generate_detailed_diff(self, original_text, modified_text):
        error_parts = [
            f"FAILED - 移除 {self.author} 的修订追踪后，文档文本不匹配",
            "",
            "可能的原因:",
            "  1. 在其他作者的 <w:ins> 或 <w:del> 标签内修改了文本",
            "  2. 进行了编辑但未正确使用修订追踪",
            "  3. 删除其他人的插入内容时，未将 <w:del> 嵌套在 <w:ins> 中",
            "",
            "对于预修订文档，请使用正确的模式:",
            "  - 要拒绝他人的插入内容: 将 <w:del> 嵌套在他们的 <w:ins> 中",
            "  - 要恢复他人的删除内容: 在他们的 <w:del> 之后添加新的 <w:ins>",
            "",
        ]

        git_diff = self._get_git_word_diff(original_text, modified_text)
        if git_diff:
            error_parts.extend(["差异:", "============", git_diff])
        else:
            error_parts.append("无法生成单词级别的差异对比 (git 不可用)")

        return "\n".join(error_parts)

    def _get_git_word_diff(self, original_text, modified_text):
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)

                original_file = temp_path / "original.txt"
                modified_file = temp_path / "modified.txt"

                original_file.write_text(original_text, encoding="utf-8")
                modified_file.write_text(modified_text, encoding="utf-8")

                result = subprocess.run(
                    [
                        "git",
                        "diff",
                        "--word-diff=plain",
                        "--word-diff-regex=.",
                        "-U0",
                        "--no-index",
                        str(original_file),
                        str(modified_file),
                    ],
                    capture_output=True,
                    text=True,
                )

                if result.stdout.strip():
                    lines = result.stdout.split("\n")
                    content_lines = []
                    in_content = False
                    for line in lines:
                        if line.startswith("@@"):
                            in_content = True
                            continue
                        if in_content and line.strip():
                            content_lines.append(line)

                    if content_lines:
                        return "\n".join(content_lines)

                result = subprocess.run(
                    [
                        "git",
                        "diff",
                        "--word-diff=plain",
                        "-U0",
                        "--no-index",
                        str(original_file),
                        str(modified_file),
                    ],
                    capture_output=True,
                    text=True,
                )

                if result.stdout.strip():
                    lines = result.stdout.split("\n")
                    content_lines = []
                    in_content = False
                    for line in lines:
                        if line.startswith("@@"):
                            in_content = True
                            continue
                        if in_content and line.strip():
                            content_lines.append(line)
                    return "\n".join(content_lines)

        except (subprocess.CalledProcessError, FileNotFoundError, Exception):
            pass

        return None

    def _remove_author_tracked_changes(self, root):
        ins_tag = f"{{{self.namespaces['w']}}}ins"
        del_tag = f"{{{self.namespaces['w']}}}del"
        author_attr = f"{{{self.namespaces['w']}}}author"

        for parent in root.iter():
            to_remove = []
            for child in parent:
                if child.tag == ins_tag and child.get(author_attr) == self.author:
                    to_remove.append(child)
            for elem in to_remove:
                parent.remove(elem)

        deltext_tag = f"{{{self.namespaces['w']}}}delText"
        t_tag = f"{{{self.namespaces['w']}}}t"

        for parent in root.iter():
            to_process = []
            for child in parent:
                if child.tag == del_tag and child.get(author_attr) == self.author:
                    to_process.append((child, list(parent).index(child)))

            for del_elem, del_index in reversed(to_process):
                for elem in del_elem.iter():
                    if elem.tag == deltext_tag:
                        elem.tag = t_tag

                for child in reversed(list(del_elem)):
                    parent.insert(del_index, child)
                parent.remove(del_elem)

    def _extract_text_content(self, root):
        p_tag = f"{{{self.namespaces['w']}}}p"
        t_tag = f"{{{self.namespaces['w']}}}t"

        paragraphs = []
        for p_elem in root.findall(f".//{p_tag}"):
            text_parts = []
            for t_elem in p_elem.findall(f".//{t_tag}"):
                if t_elem.text:
                    text_parts.append(t_elem.text)
            paragraph_text = "".join(text_parts)
            if paragraph_text:
                paragraphs.append(paragraph_text)

        return "\n".join(paragraphs)


if __name__ == "__main__":
    raise RuntimeError("此模块不应直接运行。")
