"""
PowerPoint 演示文稿 XML 文件的 XSD schema 验证器。
"""

import re

from .base import BaseSchemaValidator


class PPTXSchemaValidator(BaseSchemaValidator):

    PRESENTATIONML_NAMESPACE = (
        "http://schemas.openxmlformats.org/presentationml/2006/main"
    )

    ELEMENT_RELATIONSHIP_TYPES = {
        "sldid": "slide",
        "sldmasterid": "slidemaster",
        "notesmasterid": "notesmaster",
        "sldlayoutid": "slidelayout",
        "themeid": "theme",
        "tablestyleid": "tablestyles",
    }

    def validate(self):
        if not self.validate_xml():
            return False

        all_valid = True
        if not self.validate_namespaces():
            all_valid = False

        if not self.validate_unique_ids():
            all_valid = False

        if not self.validate_uuid_ids():
            all_valid = False

        if not self.validate_file_references():
            all_valid = False

        if not self.validate_slide_layout_ids():
            all_valid = False

        if not self.validate_content_types():
            all_valid = False

        if not self.validate_against_xsd():
            all_valid = False

        if not self.validate_notes_slide_references():
            all_valid = False

        if not self.validate_all_relationship_ids():
            all_valid = False

        if not self.validate_no_duplicate_slide_layouts():
            all_valid = False

        return all_valid

    def validate_uuid_ids(self):
        import lxml.etree

        errors = []
        uuid_pattern = re.compile(
            r"^[\{\(]?[0-9A-Fa-f]{8}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{12}[\}\)]?$"
        )

        for xml_file in self.xml_files:
            try:
                root = lxml.etree.parse(str(xml_file)).getroot()

                for elem in root.iter():
                    for attr, value in elem.attrib.items():
                        attr_name = attr.split("}")[-1].lower()
                        if attr_name == "id" or attr_name.endswith("id"):
                            if self._looks_like_uuid(value):
                                if not uuid_pattern.match(value):
                                    errors.append(
                                        f"  {xml_file.relative_to(self.unpacked_dir)}: "
                                        f"第 {elem.sourceline} 行: ID '{value}' 看起来像 UUID 但包含无效的十六进制字符"
                                    )

            except (lxml.etree.XMLSyntaxError, Exception) as e:
                errors.append(
                    f"  {xml_file.relative_to(self.unpacked_dir)}: 错误: {e}"
                )

        if errors:
            print(f"失败 - 发现 {len(errors)} 个 UUID ID 验证错误:")
            for error in errors:
                print(error)
            return False
        else:
            if self.verbose:
                print("通过 - 所有类似 UUID 的 ID 都包含有效的十六进制值")
            return True

    def _looks_like_uuid(self, value):
        clean_value = value.strip("{}()").replace("-", "")
        return len(clean_value) == 32 and all(c.isalnum() for c in clean_value)

    def validate_slide_layout_ids(self):
        import lxml.etree

        errors = []

        slide_masters = list(self.unpacked_dir.glob("ppt/slideMasters/*.xml"))

        if not slide_masters:
            if self.verbose:
                print("通过 - 未找到 slide master")
            return True

        for slide_master in slide_masters:
            try:
                root = lxml.etree.parse(str(slide_master)).getroot()

                rels_file = slide_master.parent / "_rels" / f"{slide_master.name}.rels"

                if not rels_file.exists():
                    errors.append(
                        f"  {slide_master.relative_to(self.unpacked_dir)}: "
                        f"缺少 relationships 文件: {rels_file.relative_to(self.unpacked_dir)}"
                    )
                    continue

                rels_root = lxml.etree.parse(str(rels_file)).getroot()

                valid_layout_rids = set()
                for rel in rels_root.findall(
                    f".//{{{self.PACKAGE_RELATIONSHIPS_NAMESPACE}}}Relationship"
                ):
                    rel_type = rel.get("Type", "")
                    if "slideLayout" in rel_type:
                        valid_layout_rids.add(rel.get("Id"))

                for sld_layout_id in root.findall(
                    f".//{{{self.PRESENTATIONML_NAMESPACE}}}sldLayoutId"
                ):
                    r_id = sld_layout_id.get(
                        f"{{{self.OFFICE_RELATIONSHIPS_NAMESPACE}}}id"
                    )
                    layout_id = sld_layout_id.get("id")

                    if r_id and r_id not in valid_layout_rids:
                        errors.append(
                            f"  {slide_master.relative_to(self.unpacked_dir)}: "
                            f"第 {sld_layout_id.sourceline} 行: id='{layout_id}' 的 sldLayoutId "
                            f"引用了 r:id='{r_id}'，但在 slide layout relationships 中未找到"
                        )

            except (lxml.etree.XMLSyntaxError, Exception) as e:
                errors.append(
                    f"  {slide_master.relative_to(self.unpacked_dir)}: 错误: {e}"
                )

        if errors:
            print(f"失败 - 发现 {len(errors)} 个 slide layout ID 验证错误:")
            for error in errors:
                print(error)
            print(
                "请删除无效引用或在 relationships 文件中添加缺失的 slide layout。"
            )
            return False
        else:
            if self.verbose:
                print("通过 - 所有 slide layout ID 都引用了有效的 slide layout")
            return True

    def validate_no_duplicate_slide_layouts(self):
        import lxml.etree

        errors = []
        slide_rels_files = list(self.unpacked_dir.glob("ppt/slides/_rels/*.xml.rels"))

        for rels_file in slide_rels_files:
            try:
                root = lxml.etree.parse(str(rels_file)).getroot()

                layout_rels = [
                    rel
                    for rel in root.findall(
                        f".//{{{self.PACKAGE_RELATIONSHIPS_NAMESPACE}}}Relationship"
                    )
                    if "slideLayout" in rel.get("Type", "")
                ]

                if len(layout_rels) > 1:
                    errors.append(
                        f"  {rels_file.relative_to(self.unpacked_dir)}: 有 {len(layout_rels)} 个 slideLayout 引用"
                    )

            except Exception as e:
                errors.append(
                    f"  {rels_file.relative_to(self.unpacked_dir)}: 错误: {e}"
                )

        if errors:
            print("失败 - 发现包含重复 slideLayout 引用的 slide:")
            for error in errors:
                print(error)
            return False
        else:
            if self.verbose:
                print("通过 - 所有 slide 都只有一个 slideLayout 引用")
            return True

    def validate_notes_slide_references(self):
        import lxml.etree

        errors = []
        notes_slide_references = {}  # 用于跟踪 notes slide 被哪些 slide 引用

        slide_rels_files = list(self.unpacked_dir.glob("ppt/slides/_rels/*.xml.rels"))

        if not slide_rels_files:
            if self.verbose:
                print("通过 - 未找到 slide relationship 文件")
            return True

        for rels_file in slide_rels_files:
            try:
                root = lxml.etree.parse(str(rels_file)).getroot()

                for rel in root.findall(
                    f".//{{{self.PACKAGE_RELATIONSHIPS_NAMESPACE}}}Relationship"
                ):
                    rel_type = rel.get("Type", "")
                    if "notesSlide" in rel_type:
                        target = rel.get("Target", "")
                        if target:
                            normalized_target = target.replace("../", "")

                            slide_name = rels_file.stem.replace(
                                ".xml", ""
                            )  # 获取 slide 名称

                            if normalized_target not in notes_slide_references:
                                notes_slide_references[normalized_target] = []
                            notes_slide_references[normalized_target].append(
                                (slide_name, rels_file)
                            )

            except (lxml.etree.XMLSyntaxError, Exception) as e:
                errors.append(
                    f"  {rels_file.relative_to(self.unpacked_dir)}: 错误: {e}"
                )

        for target, references in notes_slide_references.items():
            if len(references) > 1:
                slide_names = [ref[0] for ref in references]
                errors.append(
                    f"  Notes slide '{target}' 被多个 slide 引用: {', '.join(slide_names)}"
                )
                for slide_name, rels_file in references:
                    errors.append(f"    - {rels_file.relative_to(self.unpacked_dir)}")

        if errors:
            print(
                f"失败 - 发现 {len([e for e in errors if not e.startswith('    ')])} 个 notes slide 引用验证错误:"
            )
            for error in errors:
                print(error)
            print("每个 slide 最多只能有自己对应的一个 notes slide 文件。")
            return False
        else:
            if self.verbose:
                print("通过 - 所有 notes slide 引用都是唯一的")
            return True


if __name__ == "__main__":
    raise RuntimeError("此模块不应直接运行。")
