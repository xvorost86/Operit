#!/usr/bin/env python3
"""check_locale.py — сверка локали Android-ресурсов с базовой локалью (values = zh).

Что проверяется по каждому файлу ресурсов (по умолчанию strings.xml,
strings_l10n.xml):

  1. Набор имён ресурсов (string / string-array / plurals) в локали совпадает
     с базой: пропущенное имя, лишнее имя и несовпадение типа — ошибки.
  2. string-array: число <item> совпадает с базой (и токены каждого item);
     лишние item в локали — WARN.
  3. plurals: все quantity базы должны быть в локали (иначе на устройствах
     нужной языковой группы ресурс не найдётся — ERROR); лишние quantity в
     локали — WARN, это норма: в en one/other, в ru one/few/many/other, а в
     zh-базе только other.
  4. Токены значения сравниваются с базой по классам, порядок не важен:
        - printf-плейсхолдеры (%s %d %1$s %.2f %%): расхождение в любую сторону
          — ERROR (лишний аргумент ломает форматирование в рантайме);
        - теги (<b>, <a href="...">, <xliff:g>): расхождение — ERROR;
        - escape-последовательности (\\n \\t \\r \\uXXXX): потеря в локали —
          WARN; \\' \\" \\\\ не сравниваются, их наличие зависит от алфавита
          перевода, а пропущенный \\ перед кавычкой ломает сам aapt;
        - XML-сущности (&lt; &gt; &amp; и т.п.): расхождение — WARN, потому что
          &amp; и &lt; в тексте — это язык (например «Display &amp; Behavior»),
          а не разметка.
     Если у строки в базе больше одного НЕпозиционного плейсхолдера (%s, %d) и
     порядок их следования в локали другой — WARN: рантайм подставит аргументы
     в порядке локали, смысл может поехать, но аргументы не потеряны.
     Такое разделение держит код возврата осмысленным: FAILED означает
     механическую поломку строки, а не «перевод сформулирован иначе».
  5. Иероглифы (U+3400-U+4DBF, U+4E00-U+9FFF, U+3000-U+303F кроме U+3000) в
     значении локали — ошибка. Для локальных проверок самой китайской базы есть
     флаг --allow-cjk.

Содержимое значения сравнивается в виде «внутренней разметки» элемента:
текст экранируется обратно (& < >), вложенные узлы сериализуются. Поэтому
&lt; в базе и в переводе выглядят одинаково, а <b>…</b> в переводе пропущен не
будет.

Использование:
    python3 tools/l10n/check_locale.py app/src/main/res/values-ru
    python3 tools/l10n/check_locale.py app/src/main/res/values-en \\
        --base app/src/main/res/values --files strings.xml
    python3 tools/l10n/check_locale.py app/src/main/res/values --allow-cjk

Вывод: строка на проблему `ERROR|WARN <file> <name> <причина>`, затем итог
`OK` либо `FAILED: N errors, M warnings`. Код возврата 1 при наличии ошибок.
"""

from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

DEFAULT_BASE = "app/src/main/res/values"
DEFAULT_FILES = ("strings.xml", "strings_l10n.xml")

# Иероглифы: CJK Unified Ideographs, Extension A, CJK Symbols and Punctuation.
# U+3000 (идеографический пробел) — пробельный символ, а не текст, исключён.
CJK_RANGES = ((0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0x3000, 0x303F))
CJK_EXEMPT = {0x3000}

# Java Formatter conversions: bBhHsScCdoxXeEfgGaAtT%n
_PRINTF = r"%(?:\d+\$)?[-#+ 0,(]*\d*(?:\.\d+)?[bBhHsScCdoxXeEfgGaAtTn%]"

TOKEN_RE = re.compile(
    # Порядок альтернатив важен: тег забирает плейсхолдер в своих атрибутах
    # целиком, иначе <a href="%s"> дал бы ещё и отдельный токен %s.
    r"(?P<tag><[^<>]*>)"
    r"|(?P<entity>&(?:lt|gt|amp|quot|apos|\#\d+|\#x[0-9a-fA-F]+);)"
    rf"|(?P<printf>{_PRINTF})"
    r"|(?P<esc>\\[ntr'\"\\]|\\u[0-9a-fA-F]{4})"
)

NONPOSITIONAL_RE = re.compile(r"%[-#+ 0,(]*\d*(?:\.\d+)?[bBhHsScCdoxXeEfgGaAtTn]")
WS_RE = re.compile(r"\s+")


@dataclass
class Entry:
    """Ресурс: тип + значение (для string — один ключ "", для остальных — по ключам)."""

    kind: str
    translatable: str | None
    values: dict[str, str] = field(default_factory=dict)


def _escape_text(text: str) -> str:
    """Экранирует текстовый узел обратно в разметку.

    Так &lt; из исходника и <b> как узел остаются различимыми, а сравнение
    локали с базой идёт на одном и том же представлении.
    """
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _serialize(elem: ET.Element) -> str:
    """Сериализует узел во внутреннюю разметку (без внешних пробелов)."""
    attrs = "".join(f' {name}="{value}"' for name, value in elem.attrib.items())
    inner = _inner_markup(elem)
    if not inner:
        return f"<{elem.tag}{attrs}/>"
    return f"<{elem.tag}{attrs}>{inner}</{elem.tag}>"


def _inner_markup(elem: ET.Element) -> str:
    """Содержимое элемента: текст + сериализованные дочерние узлы + их хвосты."""
    parts: list[str] = []
    if elem.text:
        parts.append(_escape_text(elem.text))
    for child in elem:
        parts.append(_serialize(child))
        if child.tail:
            parts.append(_escape_text(child.tail))
    return "".join(parts)


def normalize_tag(tag: str) -> str:
    tag = WS_RE.sub(" ", tag.strip())
    # <br/> и <br /> — то же, что <br>: различие самозакрытия не значимо.
    return re.sub(r"\s*/>$", ">", tag)


def tokenize(markup: str) -> dict[str, list[str]]:
    """Токены значения по классам: printf, tag, escape, entity.

    Внутри класса порядок сохраняется, но при сравнении он не значим (кроме
    отдельной проверки перестановки непозиционных плейсхолдеров).
    """
    tokens: dict[str, list[str]] = {"printf": [], "tag": [], "escape": [], "entity": []}
    for match in TOKEN_RE.finditer(markup):
        group = match.lastgroup or ""
        key = "escape" if group == "esc" else group
        value = normalize_tag(match.group()) if key == "tag" else match.group()
        tokens[key].append(value)
    return tokens


def required_escape(token: str) -> bool:
    """Escape, потеря которого ломает вёрстку строки: перевод строки/табуляция/\\uXXXX.

    Кавычки (\\' \\") и \\\\ сюда не входят: их наличие зависит от алфавита
    перевода, а пропущенный \\ перед кавычкой ломает сам aapt, и такой файл до
    проверки не доживёт.
    """
    return token in ("\\n", "\\t", "\\r") or token.startswith("\\u")


def nonpositional_sequence(markup: str) -> list[str]:
    """Непозиционные плейсхолдеры в порядке появления (для WARN о перестановке)."""
    return [m.group() for m in NONPOSITIONAL_RE.finditer(markup)]


def cjk_chars(markup: str) -> list[str]:
    found: list[str] = []
    for char in markup:
        code = ord(char)
        if code in CJK_EXEMPT:
            continue
        if any(low <= code <= high for low, high in CJK_RANGES):
            found.append(char)
    return found


def parse_resources(path: Path) -> dict[str, Entry]:
    """Разбирает файл ресурсов в {имя: Entry}, сохраняя порядок объявления."""
    root = ET.parse(path).getroot()
    entries: dict[str, Entry] = {}
    for elem in root:
        name = elem.get("name")
        if name is None:
            continue
        if elem.tag == "string":
            entries[name] = Entry("string", elem.get("translatable"), {"": _inner_markup(elem)})
        elif elem.tag == "plurals":
            values = {
                item.get("quantity", ""): _inner_markup(item)
                for item in elem.findall("item")
            }
            entries[name] = Entry("plurals", elem.get("translatable"), values)
        elif elem.tag == "string-array":
            items = elem.findall("item")
            values = {str(index): _inner_markup(item) for index, item in enumerate(items)}
            entries[name] = Entry("string-array", elem.get("translatable"), values)
    return entries


class Report:
    def __init__(self) -> None:
        self.errors = 0
        self.warnings = 0
        self.lines: list[str] = []

    def error(self, file_name: str, name: str, reason: str) -> None:
        self.errors += 1
        self.lines.append(f"ERROR {file_name} {name} {reason}")

    def warn(self, file_name: str, name: str, reason: str) -> None:
        self.warnings += 1
        self.lines.append(f"WARN {file_name} {name} {reason}")


def _diff_tokens(base_tokens: list[str], loc_tokens: list[str]) -> str:
    missing = list(base_tokens)
    unexpected: list[str] = []
    for token in loc_tokens:
        if token in missing:
            missing.remove(token)
        else:
            unexpected.append(token)
    parts = []
    if missing:
        parts.append("missing " + " ".join(sorted(missing)))
    if unexpected:
        parts.append("unexpected " + " ".join(sorted(unexpected)))
    return "; ".join(parts)


def compare_entry(
    report: Report,
    file_name: str,
    name: str,
    base: Entry,
    loc: Entry,
    allow_cjk: bool,
) -> None:
    if base.kind != loc.kind:
        report.error(file_name, name, f"type mismatch: base {base.kind}, locale {loc.kind}")
        return

    if base.kind in ("plurals", "string-array"):
        missing_keys = [key for key in base.values if key not in loc.values]
        extra_keys = [key for key in loc.values if key not in base.values]
        if missing_keys:
            report.error(file_name, name, "missing " + base.kind + " item(s) " + " ".join(missing_keys))
        if extra_keys:
            # Лишние формы множественного числа — норма: в ru нужны one/few/many,
            # в en one/other, а в zh-базе только other.
            report.warn(file_name, name, "extra " + base.kind + " item(s) " + " ".join(extra_keys))

    for key, base_markup in base.values.items():
        loc_markup = loc.values.get(key)
        if loc_markup is None:
            continue
        label = name if key == "" else f"{name}[{key}]"

        base_tokens = tokenize(base_markup)
        loc_tokens = tokenize(loc_markup)

        for group, title in (("printf", "placeholder"), ("tag", "tag")):
            if sorted(base_tokens[group]) != sorted(loc_tokens[group]):
                report.error(
                    file_name,
                    label,
                    f"{title} mismatch: " + _diff_tokens(base_tokens[group], loc_tokens[group]),
                )

        if sorted(base_tokens["printf"]) == sorted(loc_tokens["printf"]):
            base_seq = nonpositional_sequence(base_markup)
            loc_seq = nonpositional_sequence(loc_markup)
            if len(base_seq) > 1 and base_seq != loc_seq:
                report.warn(
                    file_name,
                    label,
                    "non-positional placeholders reordered: base "
                    + " ".join(base_seq)
                    + ", locale "
                    + " ".join(loc_seq),
                )

        lost_escapes = [token for token in base_tokens["escape"] if required_escape(token)]
        for token in lost_escapes:
            if token not in loc_tokens["escape"]:
                report.warn(file_name, label, f"lost escape sequence {token}")

        if sorted(base_tokens["entity"]) != sorted(loc_tokens["entity"]):
            report.warn(
                file_name,
                label,
                "XML entity set differs: "
                + _diff_tokens(base_tokens["entity"], loc_tokens["entity"]),
            )

        if not allow_cjk:
            chars = cjk_chars(loc_markup)
            if chars:
                sample = "".join(dict.fromkeys(chars))[:5]
                report.error(
                    file_name,
                    label,
                    f"CJK in locale value: {sample} (U+{ord(chars[0]):04X})",
                )


def check_file(base_dir: Path, loc_dir: Path, file_name: str, allow_cjk: bool, report: Report) -> None:
    base_path = base_dir / file_name
    loc_path = loc_dir / file_name

    if not base_path.is_file():
        report.error(file_name, "-", f"base file not found: {base_path}")
        return
    if not loc_path.is_file():
        report.error(file_name, "-", f"locale file not found: {loc_path}")
        return

    try:
        base = parse_resources(base_path)
    except ET.ParseError as exc:
        report.error(file_name, "-", f"base XML parse error: {exc}")
        return
    try:
        loc = parse_resources(loc_path)
    except ET.ParseError as exc:
        report.error(file_name, "-", f"locale XML parse error: {exc}")
        return

    for name, base_entry in base.items():
        if base_entry.translatable == "false":
            continue
        loc_entry = loc.get(name)
        if loc_entry is None:
            report.error(file_name, name, "missing in locale")
            continue
        compare_entry(report, file_name, name, base_entry, loc_entry, allow_cjk)

    for name in loc:
        if name in base:
            continue
        report.error(file_name, name, "not present in base")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Сверка локали Android-ресурсов с базовой (values).",
    )
    parser.add_argument("locale_dir", help="каталог локали, например app/src/main/res/values-ru")
    parser.add_argument("--base", default=DEFAULT_BASE, help=f"каталог базовой локали (по умолчанию {DEFAULT_BASE})")
    parser.add_argument("--files", nargs="+", default=list(DEFAULT_FILES), help="файлы ресурсов для сверки")
    parser.add_argument(
        "--allow-cjk",
        action="store_true",
        help="не считать иероглифы в значениях ошибкой (для проверки самой zh-базы)",
    )
    args = parser.parse_args(argv)

    base_dir = Path(args.base)
    loc_dir = Path(args.locale_dir)
    if not loc_dir.is_dir():
        print(f"ERROR {loc_dir} - locale directory not found")
        print("FAILED: 1 errors, 0 warnings")
        return 1

    report = Report()
    for file_name in args.files:
        check_file(base_dir, loc_dir, file_name, args.allow_cjk, report)

    for line in report.lines:
        print(line)
    if report.errors:
        print(f"FAILED: {report.errors} errors, {report.warnings} warnings")
        return 1
    print("OK" if not report.warnings else f"OK ({report.warnings} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
