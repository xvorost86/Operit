"""Тесты check_locale.py на синтетических XML-ресурсах."""

from __future__ import annotations

import io
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import check_locale  # noqa: E402

BASE_XML = """<resources>
    <string name="hello">你好 %1$s</string>
    <string name="escaped">第一行\\n第二行</string>
    <string name="entity">a &lt; b &amp; c</string>
    <string name="markup">见 <b>粗体</b> 和 <a href="https://x.y/%1$s">链接</a></string>
    <string name="footer">再见</string>
    <plurals name="items">
        <item quantity="one">%1$d 个项目</item>
        <item quantity="other">%1$d 个项目</item>
    </plurals>
    <string-array name="modes">
        <item>快速</item>
        <item>精确</item>
    </string-array>
    <string name="internal" translatable="false">内部 %s</string>
</resources>
"""

LOCALE_XML = """<resources>
    <string name="hello">Привет %1$s</string>
    <string name="escaped">Строка\\nвторая</string>
    <string name="entity">a &lt; b &amp; c</string>
    <string name="markup">см. <b>жирный</b> и <a href="https://x.y/%1$s">ссылка</a></string>
    <string name="footer">Пока</string>
    <plurals name="items">
        <item quantity="one">%1$d проект</item>
        <item quantity="other">%1$d проектов</item>
    </plurals>
    <string-array name="modes">
        <item>Быстро</item>
        <item>Точно</item>
    </string-array>
</resources>
"""


class Fixture:
    """Временная пара каталогов base/locale с файлами ресурсов."""

    def __init__(self, base_xml: str | None, locale_xml: str | None, file_name: str = "strings.xml") -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.base_dir = self.root / "values"
        self.locale_dir = self.root / "values-ru"
        self.base_dir.mkdir()
        self.locale_dir.mkdir()
        self.file_name = file_name
        if base_xml is not None:
            (self.base_dir / file_name).write_text(base_xml, encoding="utf-8")
        if locale_xml is not None:
            (self.locale_dir / file_name).write_text(locale_xml, encoding="utf-8")

    def run(self, *extra: str) -> tuple[int, str]:
        out = io.StringIO()
        argv = [str(self.locale_dir), "--base", str(self.base_dir), "--files", self.file_name, *extra]
        with redirect_stdout(out):
            code = check_locale.main(argv)
        return code, out.getvalue()

    def close(self) -> None:
        self._tmp.cleanup()


class CheckLocaleTest(unittest.TestCase):
    def check(self, base: str | None, locale: str | None, *extra: str) -> tuple[int, str]:
        fixture = Fixture(base, locale)
        self.addCleanup(fixture.close)
        return fixture.run(*extra)

    def test_clean_locale_passes(self) -> None:
        code, output = self.check(BASE_XML, LOCALE_XML, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertIn("OK", output.strip().splitlines()[-1])

    def test_missing_key_is_error(self) -> None:
        locale = LOCALE_XML.replace('    <string name="footer">Пока</string>\n', "")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("ERROR strings.xml footer missing in locale", output)

    def test_extra_key_is_error(self) -> None:
        locale = LOCALE_XML.replace(
            '    <string name="footer">Пока</string>',
            '    <string name="footer">Пока</string>\n    <string name="extra">Лишняя</string>',
        )
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("ERROR strings.xml extra not present in base", output)

    def test_changed_placeholder_type_is_error(self) -> None:
        locale = LOCALE_XML.replace("Привет %1$s", "Привет %1$d")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("placeholder mismatch", output)
        self.assertIn("%1$s", output)

    def test_lost_escape_warns(self) -> None:
        locale = LOCALE_XML.replace("Строка\\nвторая", "Строка вторая")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertIn("WARN strings.xml escaped lost escape sequence \\n", output)

    def test_quote_escape_difference_is_not_reported(self) -> None:
        base = '<resources><string name="q">没有听清</string></resources>'
        locale = '<resources><string name="q">Didn\\\'t hear clearly</string></resources>'
        code, output = self.check(base, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertEqual(output.strip(), "OK")

    def test_entity_difference_warns(self) -> None:
        locale = LOCALE_XML.replace("a &lt; b &amp; c", "a &amp; b &amp; c")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertIn("WARN strings.xml entity XML entity set differs", output)

    def test_dropped_tag_is_error(self) -> None:
        locale = LOCALE_XML.replace("<b>жирный</b>", "жирный")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("markup", output)
        self.assertIn("<b>", output)

    def test_positional_reorder_is_allowed(self) -> None:
        base = '<resources><string name="both">%1$s и %2$s</string></resources>'
        locale = '<resources><string name="both">%2$s и %1$s</string></resources>'
        code, output = self.check(base, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)

    def test_non_positional_reorder_warns(self) -> None:
        base = '<resources><string name="both">%s в %d</string></resources>'
        locale = '<resources><string name="both">%d в %s</string></resources>'
        code, output = self.check(base, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertIn("WARN strings.xml both non-positional placeholders reordered", output)
        self.assertIn("OK (1 warnings)", output)

    def test_cjk_in_locale_is_error_unless_allowed(self) -> None:
        locale = LOCALE_XML.replace("<string name=\"footer\">Пока</string>", "<string name=\"footer\">中文</string>")
        code, output = self.check(BASE_XML, locale)
        self.assertEqual(code, 1)
        self.assertIn("CJK in locale value", output)

        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)

    def test_translatable_false_is_skipped(self) -> None:
        locale = LOCALE_XML  # "internal" отсутствует в локали, но помечен translatable="false"
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertNotIn("internal", output)

    def test_string_array_item_count(self) -> None:
        locale = LOCALE_XML.replace("        <item>Точно</item>\n", "")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("ERROR strings.xml modes missing string-array item(s) 1", output)

    def test_plurals_quantity_mismatch(self) -> None:
        locale = LOCALE_XML.replace('        <item quantity="other">%1$d проектов</item>\n', "")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("ERROR strings.xml items missing plurals item(s) other", output)

    def test_plurals_placeholder_mismatch(self) -> None:
        locale = LOCALE_XML.replace('<item quantity="one">%1$d проект</item>', '<item quantity="one">%1$s проект</item>')
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("ERROR strings.xml items[one] placeholder mismatch", output)

    def test_extra_plural_quantity_warns(self) -> None:
        locale = LOCALE_XML.replace(
            '<item quantity="other">%1$d проектов</item>',
            '<item quantity="few">%1$d проекта</item>\n        <item quantity="other">%1$d проектов</item>',
        )
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 0, output)
        self.assertIn("WARN strings.xml items extra plurals item(s) few", output)

    def test_type_mismatch(self) -> None:
        locale = LOCALE_XML.replace("<plurals name=\"items\">", "<string name=\"items\">x</string><plurals name=\"unused_items\">")
        code, output = self.check(BASE_XML, locale, "--allow-cjk")
        self.assertEqual(code, 1)
        self.assertIn("type mismatch", output)

    def test_missing_locale_file_is_error(self) -> None:
        code, output = self.check(BASE_XML, None)
        self.assertEqual(code, 1)
        self.assertIn("locale file not found", output)

    def test_missing_base_file_is_error(self) -> None:
        code, output = self.check(None, LOCALE_XML)
        self.assertEqual(code, 1)
        self.assertIn("base file not found", output)

    def test_broken_xml_is_error(self) -> None:
        code, output = self.check(BASE_XML, "<resources><string name=\"a\">ужас</resources>")
        self.assertEqual(code, 1)
        self.assertIn("locale XML parse error", output)

    def test_default_files_include_l10n(self) -> None:
        fixture = Fixture(BASE_XML, LOCALE_XML)
        self.addCleanup(fixture.close)
        (fixture.base_dir / "strings_l10n.xml").write_text(
            '<resources><string name="l10n_a">中文 %s</string></resources>', encoding="utf-8"
        )
        (fixture.locale_dir / "strings_l10n.xml").write_text(
            '<resources><string name="l10n_a">Русский %s</string></resources>', encoding="utf-8"
        )
        out = io.StringIO()
        with redirect_stdout(out):
            code = check_locale.main([str(fixture.locale_dir), "--base", str(fixture.base_dir), "--allow-cjk"])
        self.assertEqual(code, 0, out.getvalue())

    # --- --allowlist: исключение снимает только проверку иероглифов ---

    ALLOWLIST_BASE = (
        '<resources><string name="voice">默认 %1$s</string>'
        '<string name="other">中文 %1$s</string></resources>'
    )

    def fixture_with_allowlist(self, locale: str, allowlist_body: str) -> tuple[Fixture, Path]:
        fixture = Fixture(self.ALLOWLIST_BASE, locale)
        self.addCleanup(fixture.close)
        path = fixture.root / "cjk_allowlist.txt"
        path.write_text(allowlist_body, encoding="utf-8")
        return fixture, path

    def test_allowlist_exempts_cjk_of_listed_key(self) -> None:
        locale = (
            '<resources><string name="voice">Default %1$s, 冰糖</string>'
            '<string name="other">Other %1$s</string></resources>'
        )
        fixture, path = self.fixture_with_allowlist(locale, "strings.xml:voice  # параметр API\n")
        code, output = fixture.run("--allowlist", str(path))
        self.assertEqual(code, 0, output)
        self.assertEqual(output.strip(), "OK")

    def test_allowlist_keeps_placeholder_check_for_listed_key(self) -> None:
        locale = (
            '<resources><string name="voice">Default %1$d, 冰糖</string>'
            '<string name="other">Other %1$s</string></resources>'
        )
        fixture, path = self.fixture_with_allowlist(locale, "strings.xml:voice  # параметр API\n")
        code, output = fixture.run("--allowlist", str(path))
        self.assertEqual(code, 1, output)
        self.assertIn("ERROR strings.xml voice placeholder mismatch", output)
        self.assertNotIn("CJK in locale value", output)

    def test_allowlist_does_not_exempt_unlisted_key(self) -> None:
        locale = (
            '<resources><string name="voice">Default %1$s, 冰糖</string>'
            '<string name="other">中文 %1$s</string></resources>'
        )
        fixture, path = self.fixture_with_allowlist(locale, "strings.xml:voice  # параметр API\n")
        code, output = fixture.run("--allowlist", str(path))
        self.assertEqual(code, 1, output)
        self.assertIn("ERROR strings.xml other CJK in locale value", output)
        self.assertNotIn("ERROR strings.xml voice", output)

    def test_explicit_missing_allowlist_is_error(self) -> None:
        fixture, _ = self.fixture_with_allowlist(
            '<resources><string name="voice">Default %1$s</string>'
            '<string name="other">Other %1$s</string></resources>',
            "",
        )
        absent = fixture.root / "absent_allowlist.txt"
        code, output = fixture.run("--allowlist", str(absent))
        self.assertEqual(code, 1, output)
        self.assertIn("allowlist file not found", output)
        self.assertIn(str(absent), output)

    def test_missing_default_allowlist_is_empty_list(self) -> None:
        locale = (
            '<resources><string name="voice">Default %1$s, 冰糖</string>'
            '<string name="other">Other %1$s</string></resources>'
        )
        fixture, _ = self.fixture_with_allowlist(locale, "")
        absent = fixture.root / "no_such_default.txt"
        with mock.patch.object(check_locale, "DEFAULT_ALLOWLIST", absent):
            code, output = fixture.run()
        self.assertEqual(code, 1, output)
        self.assertIn("ERROR strings.xml voice CJK in locale value", output)

    def test_allowlist_comment_and_blank_lines_are_ignored(self) -> None:
        locale = (
            '<resources><string name="voice">Default %1$s, 冰糖</string>'
            '<string name="other">Other %1$s</string></resources>'
        )
        fixture, path = self.fixture_with_allowlist(
            locale, "# заголовок\n\n   \nstrings.xml:voice   # причина без кавычек\n\n"
        )
        code, output = fixture.run("--allowlist", str(path))
        self.assertEqual(code, 0, output)

    def test_malformed_allowlist_line_is_error(self) -> None:
        fixture, path = self.fixture_with_allowlist(
            '<resources><string name="voice">Default %1$s</string>'
            '<string name="other">Other %1$s</string></resources>',
            "strings.xml voice  # забыт разделитель\n",
        )
        code, output = fixture.run("--allowlist", str(path))
        self.assertEqual(code, 1, output)
        self.assertIn("bad allowlist entry", output)
        self.assertIn(":1", output)


if __name__ == "__main__":
    unittest.main()
