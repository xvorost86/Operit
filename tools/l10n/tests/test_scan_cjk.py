"""Тесты scan_cjk.py: классификация строк на синтетических файлах."""

from __future__ import annotations

import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import scan_cjk  # noqa: E402

KOTLIN_SOURCE = [
    "package demo",  # 1
    "",  # 2
    "// 中文 комментарий в строке",  # 3 comment
    "val a = 1 // 中文 хвостовой комментарий",  # 4 comment
    'val literal = "中文 строка"',  # 5 literal
    'Log.d("TAG", "中文 в логе")',  # 6 log
    'println("中文 println")',  # 7 log
    'Timber.e("中文 timber")',  # 8 log
    'AppLogger.info("中文 applogger")',  # 9 log
    "/**",  # 10 comment (KDoc)
    " * 中文 первая строка KDoc",  # 11 comment
    " * 中文 вторая строка KDoc",  # 12 comment
    " */",  # 13
    "/* 中文 блочный в одну строку */ val b = 2",  # 14 comment
    "/*",  # 15
    "中文 внутри блочного комментария",  # 16 comment
    "*/",  # 17
    'val url = "http://example.com/中文 путь" // 中文 хвост',  # 18 literal
    "val 中文Переменная = 3",  # 19 other
    'val multi = """',  # 20
    "строка с 中文 внутри triple",  # 21 literal
    '"""',  # 22
    'Text("中文 в compose")',  # 23 literal
    'Log.d(',  # 24
    '    "TAG",',  # 25
    '    "中文 без закрытой скобки"',  # 26 literal (перенос вызова — не log)
    ')',  # 27
    "val empty = 1",  # 28
]

EXPECTED_KOTLIN = {
    3: "comment",
    4: "comment",
    5: "literal",
    6: "log",
    7: "log",
    8: "log",
    9: "log",
    11: "comment",
    12: "comment",
    14: "comment",
    16: "comment",
    18: "literal",
    19: "other",
    21: "literal",
    23: "literal",
    26: "literal",
}

JS_SOURCE = [
    "// 中文 строчный комментарий",  # 1 comment
    "/*",  # 2
    "中文 блочный комментарий",  # 3 comment
    "*/",  # 4
    'const a = "中文 литерал";',  # 5 literal
    "console.log('中文 лог');",  # 6 log
    "console.warn(`中文 шаблон`);",  # 7 log
    "const t = `строка",  # 8 — иероглифов нет, в инвентарь не попадает
    "с 中文 переносом`;",  # 9 literal
    "const url = 'http://x.y/中文'; // 中文",  # 10 literal
]

EXPECTED_JS = {
    1: "comment",
    3: "comment",
    5: "literal",
    6: "log",
    7: "log",
    9: "literal",
    10: "literal",
}


class Workspace:
    def __init__(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def write(self, relative: str, lines: list[str] | str) -> Path:
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        text = lines if isinstance(lines, str) else "\n".join(lines) + "\n"
        path.write_text(text, encoding="utf-8")
        return path

    def inventory(self) -> dict:
        out = io.StringIO()
        with redirect_stdout(out):
            return scan_cjk.build_inventory([str(self.root)])

    def close(self) -> None:
        self._tmp.cleanup()


class ScanCjkTest(unittest.TestCase):
    def setUp(self) -> None:
        self.ws = Workspace()
        self.addCleanup(self.ws.close)

    def classes_by_line(self) -> dict[int, str]:
        inventory = self.ws.inventory()
        return {entry["line"]: entry["cls"] for entry in inventory["entries"]}

    def test_kotlin_classification(self) -> None:
        self.ws.write("demo/Sample.kt", KOTLIN_SOURCE)
        self.assertEqual(self.classes_by_line(), EXPECTED_KOTLIN)

    def test_js_classification(self) -> None:
        self.ws.write("assets/demo.js", JS_SOURCE)
        self.assertEqual(self.classes_by_line(), EXPECTED_JS)

    def test_ts_uses_js_rules(self) -> None:
        self.ws.write("assets/demo.ts", ['export const s = "中文";', "console.error('中文');"])
        self.assertEqual(self.classes_by_line(), {1: "literal", 2: "log"})

    def test_block_comment_state_survives_lines(self) -> None:
        self.ws.write(
            "demo/Block.kt",
            [
                "val before = 1",
                "/* начало",  # строка без иероглифов — не попадает в инвентарь
                "中文",
                "中文",
                "*/ val after = 2",
            ],
        )
        self.assertEqual(self.classes_by_line(), {3: "comment", 4: "comment"})

    def test_minified_and_vendor_files_are_skipped(self) -> None:
        self.ws.write("assets/js/katex.min.js", ['var a = "中文";'])
        self.ws.write("assets/js/other.min.js", ['var a = "中文";'])
        self.ws.write("assets/js/CryptoJS.js", ['var a = "中文";'])
        self.ws.write("assets/js/pako.js", ['var a = "中文";'])
        self.ws.write("assets/js/app.js", ["// 中文 комментарий"])
        inventory = self.ws.inventory()
        self.assertEqual([entry["file"] for entry in inventory["entries"]], [str(self.ws.root / "assets/js/app.js")])
        self.assertEqual(inventory["files_scanned"], 1)

    def test_build_dirs_are_skipped(self) -> None:
        self.ws.write("demo/build/Generated.kt", ['val s = "中文"'])
        self.ws.write("demo/Source.kt", ['val s = "中文"'])
        inventory = self.ws.inventory()
        self.assertEqual(inventory["files_scanned"], 1)

    def test_generated_web_chat_bundle_is_skipped(self) -> None:
        # `npm run build:webchat` синхронизирует готовый бандл в assets/web-chat: каталог
        # в .gitignore, но лежит внутри сканируемого assets, поэтому без исключения
        # цифры инвентаря зависели бы от того, собирали ли фронтенд на этой машине.
        self.ws.write("app/src/main/assets/web-chat/assets/index-abc.js", ['const s = "中文";'])
        self.ws.write("app/src/main/assets/web-chat/index.js", ['const s = "中文";'])
        self.ws.write("app/src/main/assets/packages/demo.js", ['const s = "中文";'])
        # Похожие имена под исключение не попадают.
        self.ws.write("app/src/main/assets/web-chat-notes/demo.js", ['const s = "中文";'])
        self.ws.write("app/src/main/assets/packages/web-chat.js", ['const s = "中文";'])
        inventory = self.ws.inventory()
        self.assertEqual(inventory["files_scanned"], 3)
        self.assertEqual(
            sorted(entry["file"] for entry in inventory["entries"]),
            sorted(
                [
                    str(self.ws.root / "app/src/main/assets/packages/demo.js"),
                    str(self.ws.root / "app/src/main/assets/packages/web-chat.js"),
                    str(self.ws.root / "app/src/main/assets/web-chat-notes/demo.js"),
                ]
            ),
        )

    def test_text_is_truncated_and_stripped(self) -> None:
        long_line = '    val s = "' + "中" * 300 + '"'
        self.ws.write("demo/Long.kt", [long_line])
        entry = self.ws.inventory()["entries"][0]
        self.assertEqual(len(entry["text"]), 200)
        self.assertTrue(entry["text"].startswith('val s = "中'))

    def test_java_rules_match_kotlin(self) -> None:
        self.ws.write(
            "demo/Sample.java",
            [
                'String s = "中文";',
                "// 中文",
                'android.util.Log.w("T", "中文");',
            ],
        )
        self.assertEqual(self.classes_by_line(), {1: "literal", 2: "comment", 3: "log"})

    def test_template_expression_with_inner_quotes(self) -> None:
        self.ws.write(
            "demo/Template.kt",
            [
                'val s = "Detected ${intent ?: "无"} file"',  # 1 literal: кавычки внутри ${}
                'AppLogger.d(TAG, "режим ${if (wide) "中文" else ""}")',  # 2 log
                'val url = "a ${"中文"} b"',  # 3 literal
            ],
        )
        self.assertEqual(self.classes_by_line(), {1: "literal", 2: "log", 3: "literal"})

    def test_reset_state_between_files(self) -> None:
        self.ws.write("demo/A.kt", ["/*", "中文 в комментарии", "*/"])
        self.ws.write("demo/B.kt", ['val s = "中文"'])
        inventory = self.ws.inventory()
        by_file = {entry["file"]: entry for entry in inventory["entries"]}
        self.assertEqual(by_file[str(self.ws.root / "demo/A.kt")]["cls"], "comment")
        self.assertEqual(by_file[str(self.ws.root / "demo/B.kt")]["cls"], "literal")

    def test_summary_output(self) -> None:
        self.ws.write("demo/Sample.kt", KOTLIN_SOURCE)
        inventory = self.ws.inventory()
        out = io.StringIO()
        with redirect_stdout(out):
            scan_cjk.print_summary(inventory)
        text = out.getvalue()
        self.assertIn("top-20 dirs by literal lines", text)
        self.assertIn("literal", text)
        self.assertIn("total", text)

    def test_diff_reports_growth(self) -> None:
        self.ws.write("demo/Old.kt", ['val s = "中文"'])
        old = self.ws.inventory()
        old_path = self.ws.root / "old.json"
        old_path.write_text(json.dumps(old, ensure_ascii=False), encoding="utf-8")

        self.ws.write(
            "demo/Old.kt",
            ['val s = "中文"', 'val t = "中文"', 'val u = "中文"'],
        )
        new = self.ws.inventory()
        out = io.StringIO()
        with redirect_stdout(out):
            scan_cjk.print_diff(new, str(old_path))
        text = out.getvalue()
        self.assertIn("literal         1 ->        3", text)
        self.assertIn("files with more literal lines: 1", text)
        self.assertIn("demo/Old.kt", text)

    def test_budget_gate_passes_on_unchanged_tree(self) -> None:
        self.ws.write("demo/Sample.kt", ['val s = "中文"'])
        inventory = self.ws.inventory()
        path = self.ws.root / "l10n" / "cjk_budget.json"
        with redirect_stdout(io.StringIO()):
            scan_cjk.write_budget(inventory, str(path))
        self.assertEqual(json.loads(path.read_text(encoding="utf-8")), {"literal": 1, "other": 0})
        out = io.StringIO()
        with redirect_stdout(out):
            code = scan_cjk.check_budget(inventory, str(path))
        self.assertEqual(code, 0)
        self.assertIn("literal         1 /        1  OK (+0)", out.getvalue())

    def test_budget_gate_fails_when_literal_grows(self) -> None:
        # Гейт существует ради этого случая: новый иероглифный литерал в дереве
        # должен валить job, а не печататься в summary рядом с зелёной галочкой.
        self.ws.write("demo/Sample.kt", ['val s = "中文"'])
        inventory = self.ws.inventory()
        path = self.ws.root / "budget.json"
        path.write_text(json.dumps({"literal": 0, "other": 0}), encoding="utf-8")
        err = io.StringIO()
        original_stderr = sys.stderr
        sys.stderr = err
        try:
            with redirect_stdout(io.StringIO()):
                code = scan_cjk.check_budget(inventory, str(path))
        finally:
            sys.stderr = original_stderr
        self.assertEqual(code, 1)
        self.assertIn("CJK budget exceeded: literal", err.getvalue())

    def test_budget_without_a_class_is_rejected(self) -> None:
        self.ws.write("demo/Sample.kt", ['val s = "中文"'])
        inventory = self.ws.inventory()
        path = self.ws.root / "budget.json"
        path.write_text(json.dumps({"literal": 1}), encoding="utf-8")
        err = io.StringIO()
        original_stderr = sys.stderr
        sys.stderr = err
        try:
            with redirect_stdout(io.StringIO()):
                code = scan_cjk.check_budget(inventory, str(path))
        finally:
            sys.stderr = original_stderr
        self.assertEqual(code, 2)
        self.assertIn("нет класса(ов) other", err.getvalue())

    def test_cli_budget_exit_codes(self) -> None:
        self.ws.write("demo/Sample.kt", ["val s = \"中文\""])
        budget_path = self.ws.root / "l10n" / "cjk_budget.json"
        with redirect_stdout(io.StringIO()):
            self.assertEqual(
                scan_cjk.main(["--root", str(self.ws.root), "--write-budget", str(budget_path)]),
                0,
            )
        with redirect_stdout(io.StringIO()):
            self.assertEqual(
                scan_cjk.main(["--root", str(self.ws.root), "--budget", str(budget_path)]),
                0,
            )
        self.ws.write("demo/Sample.kt", ["val s = \"中文\"", "val t = \"中文\""])
        err = io.StringIO()
        original_stderr = sys.stderr
        sys.stderr = err
        try:
            with redirect_stdout(io.StringIO()):
                code = scan_cjk.main(["--root", str(self.ws.root), "--budget", str(budget_path)])
        finally:
            sys.stderr = original_stderr
        self.assertEqual(code, 1)
        self.assertIn("CJK budget exceeded", err.getvalue())

    def test_missing_root_exits(self) -> None:
        err = io.StringIO()
        original_stderr = sys.stderr
        sys.stderr = err
        try:
            with self.assertRaises(SystemExit) as raised:
                with redirect_stdout(io.StringIO()):
                    scan_cjk.build_inventory([str(self.ws.root / "absent")])
        finally:
            sys.stderr = original_stderr
        self.assertEqual(raised.exception.code, 2)
        self.assertIn("root not found", err.getvalue())

    def test_cli_writes_inventory(self) -> None:
        self.ws.write("demo/Sample.kt", KOTLIN_SOURCE)
        out_path = self.ws.root / "l10n" / "inventory.json"
        out = io.StringIO()
        with redirect_stdout(out):
            code = scan_cjk.main(["--root", str(self.ws.root), "--out", str(out_path), "--summary"])
        self.assertEqual(code, 0)
        self.assertTrue(out_path.is_file())
        data = json.loads(out_path.read_text(encoding="utf-8"))
        self.assertEqual(data["roots"], [str(self.ws.root)])
        self.assertGreater(data["total"], 0)
        self.assertIn(f"wrote {out_path}", out.getvalue())


if __name__ == "__main__":
    unittest.main()
