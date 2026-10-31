#!/usr/bin/env python3
"""scan_cjk.py — инвентаризация строк с иероглифами в исходниках и ассетах.

Сканирует *.kt, *.java, *.js, *.ts в указанных корнях и для каждой строки, где
есть иероглиф, записывает {file, line, cls, text}. Текст усекается до 200
символов. Результат — JSON (по умолчанию l10n/inventory.json).

Классы (cls)
------------
comment — иероглифы только в комментарии: строчном `// …` (в том числе хвостовом
          после кода) или блочном `/* … */` / KDoc `/** … */`. Состояние блочного
          комментария переносится между строками.
log     — иероглифы в строковом литерале, который является аргументом вызова
          лога, закрывающая скобка которого есть в этой же строке:
          Log.d/i/w/e/v, println, Timber.x, AppLogger.x (Kotlin/Java);
          console.log/warn/error/info/debug (JS/TS).
literal — иероглифы внутри строкового литерала "…", '…', `…`, triple-quoted
          \"\"\"…\"\"\" вне комментария и вне log-вызова.
other   — иероглифы вне строк и комментариев (идентификаторы, ключи и т.п.).

Правила классификации одной строки (первое совпадение выигрывает):
    1. log      — есть иероглиф в литерале внутри log-вызова;
    2. literal  — есть иероглиф в любом строковом литерале;
    3. other    — есть иероглиф в коде вне литералов/комментариев;
    4. comment  — иероглиф только в комментарии, включая хвостовой `// …`.
Строка `val u = "http://пример 中文" // 中文` — literal: литерал важнее
комментария, а `//` внутри литерала комментарием не считается.

Регулярные выражения
--------------------
иероглиф:      [\\u3400-\\u4DBF\\u4E00-\\u9FFF\\u3000-\\u303F]
log (Kotlin):  \\b(?:Log\\.[diwev]|println|Timber\\.[A-Za-z]+|AppLogger\\.[A-Za-z_]\\w*)\\s*\\(
log (JS):      \\bconsole\\.(?:log|warn|error|info|debug)\\s*\\(

Исключаются минифицированные и вендорные файлы: katex.min.js,
terser.bundle.min.js, CryptoJS.js, Jimp.js, pako.js, OkHttp3.js, любые *.min.js,
а также каталоги .git, build, node_modules, __pycache__, .gradle.

Отдельно исключается сгенерированный бандл LAN-страницы
`app/src/main/assets/web-chat` — его кладёт `npm run build:webchat`, каталог в
.gitignore, но внутри сканируемого `assets`. В бандле те же zh-аргументы
селектора, что и в `web-chat/src`, поэтому без исключения счётчик `literal`
зависел бы от того, собран ли фронтенд на этой машине.

Использование:
    python3 tools/l10n/scan_cjk.py --out l10n/inventory.json --summary
    python3 tools/l10n/scan_cjk.py --root app/src/main/java --root terminal/src
    python3 tools/l10n/scan_cjk.py --diff l10n/inventory.json
    python3 tools/l10n/scan_cjk.py --summary --budget l10n/cjk_budget.json
    python3 tools/l10n/scan_cjk.py --write-budget l10n/cjk_budget.json

Гейт (--budget)
---------------
`l10n/cjk_budget.json` хранит принятые счётчики классов `literal` и `other`.
Проверка падает (код 1), если любой из них вырос: новый иероглифный текст либо
классифицируется (промпт/лог/функциональные данные в allowlist), либо эталон
обновляется осознанно через `--write-budget` в том же коммите, где принят текст.
Полный `--diff` против `l10n/inventory.json` в CI недоступен: тот файл — 4 МБ
машинного вывода и в git не лежит.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_ROOTS = ("app/src/main/java", "terminal/src", "app/src/main/assets")
EXTENSIONS = (".kt", ".java", ".js", ".ts")
SKIP_DIRS = {".git", "build", "node_modules", "__pycache__", ".gradle", ".cxx"}
SKIP_FILES = {
    "katex.min.js",
    "terser.bundle.min.js",
    "cryptojs.js",
    "jimp.js",
    "pako.js",
    "okhttp3.js",
}
# Сгенерированные артефакты сборки: `npm run build:webchat` синхронизирует собранный
# бандл LAN-страницы в этот каталог. Он в .gitignore, но лежит внутри сканируемого
# `app/src/main/assets`, и в нём те же zh-аргументы селектора, что и в web-chat/src —
# без исключения цифры инвентаря зависели бы от того, собран ли фронтенд.
GENERATED_PATHS = ("app/src/main/assets/web-chat",)

CJK_RE = re.compile(r"[\u3400-\u4DBF\u4E00-\u9FFF\u3000-\u303F]")
KT_LOG_RE = re.compile(r"\b(?:Log\.[diwev]|println|Timber\.[A-Za-z]+|AppLogger\.[A-Za-z_]\w*)\s*\(")
JS_LOG_RE = re.compile(r"\bconsole\.(?:log|warn|error|info|debug)\s*\(")
TRIPLE_QUOTE = '"""'

CODE = "code"
STRING = "string"
COMMENT = "comment"


@dataclass
class LineState:
    """Состояние разбора, переносимое между строками файла."""

    block_comment: bool = False
    triple_string: bool = False
    backtick_string: bool = False


def find_quote_end(text: str, start: int, quote: str) -> tuple[int, bool]:
    """Ищет закрывающую кавычку начиная с позиции start (start — за открывающей).

    Возвращает (индекс сразу за кавычкой, закрыта ли строка). Экранированные
    символы (\\" и т.п.) пропускаются парой.
    """
    index = start
    while index < len(text):
        char = text[index]
        if char == "\\":
            index += 2
            continue
        if char == quote:
            return index + 1, True
        index += 1
    return len(text), False


def skip_template_expression(text: str, start: int) -> int:
    """Пропускает ${ … } внутри строкового литерала, возвращая индекс за `}`.

    Внутри выражения могут быть свои кавычки (`${intent ?: "无"}`) и вложенные
    скобки — без этого разбор строки обрывался бы на первой внутренней кавычке
    и остаток литерала классифицировался как код.
    """
    index = start
    depth = 1
    while index < len(text):
        char = text[index]
        if char == "{":
            depth += 1
            index += 1
        elif char == "}":
            depth -= 1
            index += 1
            if depth == 0:
                return index
        elif char in ("\"", "'", "`"):
            index, _ = find_quote_end(text, index + 1, char)
        else:
            index += 1
    return len(text)


def find_string_end(text: str, start: int, quote: str) -> tuple[int, bool]:
    """Как find_quote_end, но с учётом шаблонных вставок ${ … } внутри литерала."""
    index = start
    while index < len(text):
        char = text[index]
        if char == "\\":
            index += 2
            continue
        if char == "$" and text.startswith("${", index):
            index = skip_template_expression(text, index + 2)
            continue
        if char == quote:
            return index + 1, True
        index += 1
    return len(text), False


def find_triple_end(text: str, start: int) -> tuple[int, bool]:
    """Ищет закрывающие \"\"\" с учётом шаблонных вставок ${ … }."""
    index = start
    while index < len(text):
        if text.startswith("${", index):
            index = skip_template_expression(text, index + 2)
            continue
        if text.startswith(TRIPLE_QUOTE, index):
            return index + 3, True
        index += 1
    return len(text), False


def scan_line(text: str, state: LineState, is_js: bool) -> list[tuple[int, int, str]]:
    """Разбивает строку на участки code/string/comment, обновляя состояние."""
    quotes = ("\"", "'", "`") if is_js else ("\"", "'")
    segments: list[tuple[int, int, str]] = []
    index = 0
    length = len(text)

    while index < length:
        if state.block_comment:
            end = text.find("*/", index)
            if end < 0:
                segments.append((index, length, COMMENT))
                index = length
            else:
                segments.append((index, end + 2, COMMENT))
                index = end + 2
                state.block_comment = False
            continue

        if state.triple_string:
            end, closed = find_triple_end(text, index)
            segments.append((index, end, STRING))
            index = end
            state.triple_string = not closed
            continue

        if state.backtick_string:
            end, closed = find_string_end(text, index, "`")
            segments.append((index, end, STRING))
            index = end
            state.backtick_string = not closed
            continue

        char = text[index]
        if text.startswith("//", index):
            segments.append((index, length, COMMENT))
            index = length
        elif text.startswith("/*", index):
            end = text.find("*/", index + 2)
            if end < 0:
                segments.append((index, length, COMMENT))
                index = length
                state.block_comment = True
            else:
                segments.append((index, end + 2, COMMENT))
                index = end + 2
        elif not is_js and text.startswith(TRIPLE_QUOTE, index):
            end, closed = find_triple_end(text, index + 3)
            segments.append((index, end, STRING))
            index = end
            state.triple_string = not closed
        elif char in quotes:
            end, closed = find_string_end(text, index + 1, char)
            segments.append((index, end, STRING))
            if not closed and char == "`":
                state.backtick_string = True
            index = end
        else:
            index += 1

    return segments


def code_skeleton(text: str, segments: list[tuple[int, int, str]]) -> str:
    """Строка, в которой содержимое литералов и комментариев заменено пробелами.

    Нужна, чтобы искать вызов лога и считать скобки, не спотыкаясь о скобки
    внутри строк ("(см. пример)") и в комментариях.
    """
    chars = list(text)
    for start, end, kind in segments:
        if kind == CODE:
            continue
        for pos in range(start, end):
            chars[pos] = " "
    return "".join(chars)


def log_spans(skeleton: str, is_js: bool) -> list[tuple[int, int]]:
    """Границы вызовов лога (от имени до закрывающей скобки) в этой строке.

    Закрывающая скобка должна быть в той же строке — иначе вызов не считается
    логом (см. docstring модуля).
    """
    pattern = JS_LOG_RE if is_js else KT_LOG_RE
    spans: list[tuple[int, int]] = []
    for match in pattern.finditer(skeleton):
        open_paren = match.end() - 1
        depth = 0
        for pos in range(open_paren, len(skeleton)):
            char = skeleton[pos]
            if char == "(":
                depth += 1
            elif char == ")":
                depth -= 1
                if depth == 0:
                    spans.append((match.start(), pos + 1))
                    break
    return spans


def classify_line(text: str, state: LineState, is_js: bool) -> str | None:
    """Возвращает cls строки с иероглифами либо None, если иероглифов нет.

    scan_line вызывается всегда: даже на строке без иероглифов он обновляет
    состояние блочного комментария и многострочных литералов для следующих
    строк файла.
    """
    segments = scan_line(text, state, is_js)
    if not CJK_RE.search(text):
        return None

    skeleton = code_skeleton(text, segments)
    spans = log_spans(skeleton, is_js)

    has_other = bool(CJK_RE.search(skeleton))
    string_hits: list[int] = []
    has_comment = False
    for start, end, kind in segments:
        chunk = text[start:end]
        if not CJK_RE.search(chunk):
            continue
        if kind == COMMENT:
            has_comment = True
        elif kind == STRING:
            for match in CJK_RE.finditer(chunk):
                string_hits.append(start + match.start())

    if string_hits and any(begin <= pos < finish for pos in string_hits for begin, finish in spans):
        return "log"
    if string_hits:
        return "literal"
    if has_other:
        return "other"
    if has_comment:
        return "comment"
    return None


def is_generated(path: Path) -> bool:
    """True, если путь лежит внутри сгенерированного каталога сборки.

    Сравнение идёт по сегментам пути: `web-chat-notes` или `assets/web-chat.css`
    под исключение не попадают.
    """
    normalized = "/" + str(path).replace(os.sep, "/").strip("/") + "/"
    return any(f"/{generated}/" in normalized for generated in GENERATED_PATHS)


def iter_source_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(
            name
            for name in dirnames
            if name not in SKIP_DIRS and not is_generated(Path(dirpath) / name)
        )
        for name in sorted(filenames):
            if not name.endswith(EXTENSIONS):
                continue
            if name.lower() in SKIP_FILES or name.endswith(".min.js"):
                continue
            if is_generated(Path(dirpath) / name):
                continue
            yield Path(dirpath) / name


def scan_file(path: Path, entries: list[dict]) -> None:
    is_js = path.suffix in (".js", ".ts")
    state = LineState()
    text = path.read_text(encoding="utf-8")
    relative = os.path.normpath(str(path))
    for number, line in enumerate(text.splitlines(), start=1):
        cls = classify_line(line, state, is_js)
        if cls is None:
            continue
        entries.append(
            {
                "file": relative,
                "line": number,
                "cls": cls,
                "text": line.strip()[:200],
            }
        )


def build_inventory(roots: list[str]) -> dict:
    entries: list[dict] = []
    files: list[Path] = []
    for root in roots:
        root_path = Path(root)
        if not root_path.is_dir():
            print(f"ERROR root not found: {root}", file=sys.stderr)
            raise SystemExit(2)
        for path in iter_source_files(root_path):
            files.append(path)
            scan_file(path, entries)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "roots": roots,
        "files_scanned": len(files),
        "total": len(entries),
        "entries": entries,
    }


def print_summary(inventory: dict) -> None:
    entries = inventory["entries"]
    per_cls_lines = Counter(entry["cls"] for entry in entries)
    per_cls_files: dict[str, set[str]] = defaultdict(set)
    per_dir_literal: Counter[str] = Counter()
    for entry in entries:
        per_cls_files[entry["cls"]].add(entry["file"])
        if entry["cls"] == "literal":
            per_dir_literal[os.path.dirname(entry["file"]) or "."] += 1

    print(f"{'cls':10} {'lines':>8} {'files':>8}")
    for cls in ("comment", "log", "literal", "other"):
        print(f"{cls:10} {per_cls_lines.get(cls, 0):>8} {len(per_cls_files.get(cls, ())):>8}")
    print(f"{'total':10} {len(entries):>8}")

    print()
    print("top-20 dirs by literal lines:")
    print(f"{'literal':>8}  dir")
    for directory, count in per_dir_literal.most_common(20):
        print(f"{count:>8}  {directory}")


def print_diff(inventory: dict, old_path: str) -> None:
    with open(old_path, encoding="utf-8") as handle:
        old = json.load(handle)

    def counts(data: dict) -> Counter:
        return Counter(entry["cls"] for entry in data["entries"])

    new_counts = counts(inventory)
    old_counts = counts(old)
    print(f"diff vs {old_path}:")
    for cls in ("literal", "other"):
        before = old_counts.get(cls, 0)
        after = new_counts.get(cls, 0)
        delta = after - before
        direction = "less" if delta < 0 else ("more" if delta > 0 else "same")
        print(f"{cls:8} {before:>8} -> {after:>8}  {direction} ({delta:+d})")

    def per_file(data: dict) -> Counter:
        return Counter(entry["file"] for entry in data["entries"] if entry["cls"] == "literal")

    new_files = per_file(inventory)
    old_files = per_file(old)
    grown = [
        (name, old_files.get(name, 0), new_files[name])
        for name in sorted(new_files)
        if new_files[name] > old_files.get(name, 0)
    ]
    print(f"files with more literal lines: {len(grown)}")
    for name, before, after in grown:
        print(f"  {name}: {before} -> {after}")


BUDGET_CLASSES = ("literal", "other")


def class_counts(inventory: dict) -> Counter:
    return Counter(entry["cls"] for entry in inventory["entries"])


def write_budget(inventory: dict, path: str) -> None:
    """Записывает текущие счётчики классов как эталон гейта.

    Перезапись — осознанное действие принимающего: гейт сравнивает дерево с этим
    файлом, поэтому новый принятый текст и новый эталон едут одним коммитом.
    """
    counts = class_counts(inventory)
    budget = {cls: counts.get(cls, 0) for cls in BUDGET_CLASSES}
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(budget, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    summary = ", ".join(f"{cls} {budget[cls]}" for cls in BUDGET_CLASSES)
    print(f"wrote budget {target}: {summary}")


def check_budget(inventory: dict, path: str) -> int:
    """Сверяет счётчики с эталоном. 0 — в пределах, 1 — рост, 2 — эталон непригоден."""
    with open(path, encoding="utf-8") as handle:
        budget = json.load(handle)
    missing = [cls for cls in BUDGET_CLASSES if cls not in budget]
    if missing:
        print(f"ERROR budget {path}: нет класса(ов) {', '.join(missing)}", file=sys.stderr)
        return 2
    counts = class_counts(inventory)
    print(f"budget vs {path}:")
    grown: list[str] = []
    for cls in BUDGET_CLASSES:
        allowed = int(budget[cls])
        actual = counts.get(cls, 0)
        delta = actual - allowed
        state = "OK" if delta <= 0 else "OVER"
        print(f"{cls:8} {actual:>8} / {allowed:>8}  {state} ({delta:+d})")
        if delta > 0:
            grown.append(cls)
    if grown:
        print(
            "ERROR CJK budget exceeded: "
            + ", ".join(grown)
            + " — classify the new text (prompt/log/functional allowlist) or accept the "
            "baseline with `python3 tools/l10n/scan_cjk.py --write-budget l10n/cjk_budget.json`"
            " in the same commit",
            file=sys.stderr,
        )
        return 1
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Инвентаризация иероглифов в исходниках проекта.")
    parser.add_argument("--root", action="append", dest="roots", help="корень сканирования (можно несколько)")
    parser.add_argument("--out", help="куда записать JSON-инвентарь")
    parser.add_argument("--diff", help="старый инвентарь для сравнения")
    parser.add_argument("--summary", action="store_true", help="напечатать сводку по классам и каталогам")
    parser.add_argument("--budget", help="эталон счётчиков: код возврата 1, если literal или other вырос")
    parser.add_argument("--write-budget", help="записать текущие счётчики как эталон")
    args = parser.parse_args(argv)

    roots: list[str] = list(args.roots) if args.roots else list(DEFAULT_ROOTS)
    inventory = build_inventory(roots)

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(inventory, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {out_path}")

    if args.write_budget:
        write_budget(inventory, args.write_budget)
    if args.summary:
        print_summary(inventory)
    if args.diff:
        print_diff(inventory, args.diff)
    if not args.summary and not args.diff:
        print(f"scanned {inventory['files_scanned']} files, {inventory['total']} lines with CJK")
    if args.budget:
        return check_budget(inventory, args.budget)
    return 0


if __name__ == "__main__":
    sys.exit(main())
