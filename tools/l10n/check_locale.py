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
     флаг --allow-cjk. Функциональные иероглифы (реальные значения параметров
     API, образец символа для метрик шрифта, официальное название документа)
     вносятся в файл-исключение `l10n/cjk_allowlist.txt` (строки
     `<file>:<name>  # причина`, `#` — начало комментария); для этих ключей
     проверка иероглифов пропускается, остальные проверки остаются.
     Исключение снимает ТОЛЬКО проверку иероглифов: плейсхолдеры, теги,
     escape-последовательности и наличие ключа проверяются как обычно.
     По умолчанию берётся `l10n/cjk_allowlist.txt` от корня репозитория;
     если файла нет — исключений нет. Путь, указанный в `--allowlist` явно,
     должен существовать, а каждая его строка иметь вид `<file>:<name>`,
     иначе проверка падает с ошибкой (опечатка в исключении не должна
     молча превращаться в «исключений нет»).

  6. Android-экранирование значений локали — режим `--strict-android`, по
     умолчанию выключен. Это редакционный контроль НОВЫХ строк, а не приговор
     upstream-файлам, поэтому базовая локаль этим режимом не проверяется
     никогда: в старых zh/en-строках «сырые» кавычки есть, их не трогаем.
     При флаге для каждого значения локали (в том числе для каждого item
     plurals/string-array) выдаётся ERROR на:
        - «сырую» `"` без обратного слэша (`\"` — правильная форма; `&quot;`
          Android тоже получает как кавычку, поэтому она ошибка, а не экранирование;
          исключение — пара внешних outer quotes, см. ниже);
        - реальный перевод строки или табуляцию в значении (`\n`, `\t` — правильные
          формы: aapt2 сворачивает реальные пробельные символы и портит строку);
        - неэкранированный `'` без обратного слэша (`\'`).
     Чётность обратных слэшей: кавычку и апостроф экранирует только НЕЧЁТНОЕ
     число слэшей перед символом, при чётном числе символ остаётся сырым.
     Android outer quotes — это НЕэкранированные двойные кавычки в начале и в
     конце значения: <string name="q">"It didn't work"</string>. Такая обёртка
     задаёт quoted-режим, апостроф внутри неё допустим. Обратный слэш перед
     кавычкой — это буквальная кавычка, а не переключение quoted-режима,
     поэтому обёртка, набранная с обратными слэшами перед обеими кавычками,
     апостроф НЕ разрешает. Из проверки сырых кавычек исключаются только две
     внешние, сырая кавычка внутри значения — по-прежнему ERROR.
     Содержимое XML-атрибутов тегов (`<a href="…">`, `<xliff:g id="…">`) —
     не текст значения, кавычки там законны и не проверяются.
     Значение с CDATA-секцией не анализируется вообще: ElementTree отдаёт
     CDATA склеенной с текстом, поэтому различие снимается ДО ET.parse
     отдельным проходом expat по тому же файлу и не восстанавливается задним
     числом. Голый `&` и кривые XML-теги ловит сам XML-парсер — второго
     самописного разбора XML здесь нет.

Содержимое значения сравнивается в виде «внутренней разметки» элемента:
текст экранируется обратно (& < >), вложенные узлы сериализуются. Поэтому
&lt; в базе и в переводе выглядят одинаково, а <b>…</b> в переводе пропущен не
будет.

Использование:
    python3 tools/l10n/check_locale.py app/src/main/res/values-ru
    python3 tools/l10n/check_locale.py app/src/main/res/values-en \\
        --base app/src/main/res/values --files strings.xml
    python3 tools/l10n/check_locale.py app/src/main/res/values-en \\
        --allowlist l10n/cjk_allowlist.txt
    python3 tools/l10n/check_locale.py app/src/main/res/values --allow-cjk
    python3 tools/l10n/check_locale.py app/src/main/res/values-ru \\
        --strict-android

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
from xml.parsers import expat

DEFAULT_BASE = "app/src/main/res/values"
DEFAULT_FILES = ("strings.xml", "strings_l10n.xml")
# Корень репозитория: tools/l10n/check_locale.py -> tools -> <repo>
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ALLOWLIST_RELATIVE = Path("l10n") / "cjk_allowlist.txt"
DEFAULT_ALLOWLIST = REPO_ROOT / DEFAULT_ALLOWLIST_RELATIVE

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
# Тег в «внутренней разметке»: текст уже экранирован (&lt;), поэтому любой
# <...> здесь — настоящий тег, а его атрибуты — не текст значения.
TAG_SPAN_RE = re.compile(r"<[^<>]*>")


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


def resolve_allowlist(explicit: str | None) -> tuple[Path | None, str | None]:
    """Путь к файлу-исключению или причина ошибки.

    Явно указанный путь обязан существовать; путь по умолчанию может
    отсутствовать — тогда список исключений пуст.
    """
    if explicit is not None:
        path = Path(explicit)
        if not path.is_file():
            return None, "allowlist file not found"
        return path, None
    if DEFAULT_ALLOWLIST.is_file():
        return DEFAULT_ALLOWLIST, None
    return None, None


def load_allowlist(path: Path) -> tuple[set[tuple[str, str]], list[tuple[int, str]]]:
    """Читает исключения CJK: пары (файл ресурсов, имя ресурса) и ошибки формата.

    Формат строки — `<file>:<name>  # причина`. Причина нужна человеку, поэтому
    после `#` строка не разбирается. Ошибки формата возвращаются вместе с
    номером строки: опечатка не должна молча отключать исключение.
    """
    entries: set[tuple[str, str]] = set()
    problems: list[tuple[int, str]] = []
    text = path.read_text(encoding="utf-8")
    for lineno, raw in enumerate(text.splitlines(), 1):
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        file_name, separator, name = line.partition(":")
        file_name = file_name.strip()
        name = name.strip()
        if not separator or not file_name or not name:
            problems.append((lineno, f"bad allowlist entry, expected <file>:<name>: {line}"))
            continue
        entries.add((file_name, name))
    return entries, problems


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


@dataclass
class _ElementFrame:
    """Открытый XML-элемент при проходе expat (для поиска CDATA-значений)."""

    tag: str
    name: str | None
    quantity: str | None
    items: int = 0


def cdata_labels(path: Path) -> set[str]:
    """Метки значений с CDATA-секцией: `<name>`, `<name>[<quantity>]`, `<name>[<index>]`.

    ElementTree не отличает CDATA от обычного текста — он отдаёт уже склеенное
    содержимое. Поэтому различие снимается здесь, до ET.parse, отдельным
    проходом expat по тому же файлу. Метка совпадает с той, что печатается в
    отчёте, чтобы строгий режим мог пропустить ровно эти значения.
    """
    labels: set[str] = set()
    frames: list[_ElementFrame] = []

    def start_element(tag: str, attrs: dict[str, str]) -> None:
        if frames:
            parent = frames[-1]
            if parent.tag in ("plurals", "string-array") and tag == "item":
                parent.items += 1
        frames.append(_ElementFrame(tag, attrs.get("name"), attrs.get("quantity")))

    def end_element(tag: str) -> None:
        frames.pop()

    def start_cdata() -> None:
        if not frames:
            return
        leaf = frames[-1]
        if leaf.tag == "string":
            if leaf.name is not None:
                labels.add(leaf.name)
            return
        if leaf.tag != "item" or len(frames) < 2:
            return
        parent = frames[-2]
        if parent.name is None:
            return
        if parent.tag == "plurals":
            labels.add(f"{parent.name}[{leaf.quantity or ''}]")
        elif parent.tag == "string-array":
            labels.add(f"{parent.name}[{parent.items - 1}]")

    scanner = expat.ParserCreate()
    scanner.StartElementHandler = start_element
    scanner.EndElementHandler = end_element
    scanner.StartCdataSectionHandler = start_cdata
    scanner.Parse(path.read_bytes(), True)
    return labels


def _unescaped_positions(text: str, char: str) -> list[int]:
    """Позиции `char`, перед которыми ЧЁТНОЕ число обратных слэшей.

    Экранирует только нечётное число слэшей: `\"` — экранированная кавычка,
    а `\\"` — экранированный слэш и следом «сырая» кавычка. Считать
    «есть ли слэш перед символом» недостаточно — это и есть ловушка чётности.
    """
    found: list[int] = []
    backslashes = 0
    for index, current in enumerate(text):
        if current == "\\":
            backslashes += 1
            continue
        if current == char and backslashes % 2 == 0:
            found.append(index)
        backslashes = 0
    return found


def _slash_escaped(text: str, index: int) -> bool:
    """True, если символ под `index` экранирован обратным слэшем.

    Экранирует только нечётное число слэшей: два слэша перед кавычкой — это
    экранированный слэш и следом «сырая» кавычка. Считать «есть ли слэш
    перед символом» недостаточно — это и есть ловушка чётности.
    """
    backslashes = 0
    position = index - 1
    while position >= 0 and text[position] == "\\":
        backslashes += 1
        position -= 1
    return backslashes % 2 == 1


def _android_outer_span(markup: str) -> tuple[int, int] | None:
    """Границы Android outer quotes в значении или None.

    Outer quotes — это НЕэкранированные двойные кавычки в начале и в конце
    значения: <string name="q">"It didn't work"</string>. Внутри такой обёртки
    aapt2 считает содержимое quoted-строкой, поэтому апостроф законен.
    Кавычка с обратным слэшем перед ней — буквальная, режим она не
    переключает, и обёрткой такое значение не считается. Пробелы по краям
    значения обёртке не мешают.
    """
    start = 0
    end = len(markup)
    while start < end and markup[start].isspace():
        start += 1
    while end > start and markup[end - 1].isspace():
        end -= 1
    if end - start < 3:
        return None
    if markup[start] != '"' or markup[end - 1] != '"':
        return None
    if _slash_escaped(markup, start) or _slash_escaped(markup, end - 1):
        return None
    return start, end


def strict_android_problems(markup: str) -> list[str]:
    """Причины ERROR строгого режима для одного значения локали.

    Проверяется только текст вне тегов: содержимое атрибутов (`<a href="…">`,
    `<xliff:g id="…">`) — не текст значения, кавычки там законны. `<` в тексте
    к этому моменту экранирован в `&lt;`, поэтому любой `<…>` в разметке —
    настоящий тег. Пустой список — значение корректно.

    Действительные outer quotes дают quoted-режим: из проверки сырых кавычек
    исключаются ровно эти две внешние кавычки, а апостроф внутри допустим.
    Сырая кавычка внутри значения и кавычка с обратным слэшем перед ней
    (буквальная, режим не переключает) остаются ошибками.
    """
    problems: list[str] = []
    outer = _android_outer_span(markup)
    quoted = outer is not None
    checked = markup
    if outer is not None:
        start, end = outer
        # Снимаем ровно две внешние кавычки: остальные проверки видят только
        # содержимое, поэтому одиночная сырая кавычка внутри остаётся ERROR.
        checked = markup[:start] + markup[start + 1 : end - 1] + markup[end:]
    segments = TAG_SPAN_RE.split(checked)
    for segment in segments:
        if "\n" in segment or "\r" in segment:
            problems.append("real newline in value, use \\n")
        if "\t" in segment:
            problems.append("real tab in value, use \\t")
        if _unescaped_positions(segment, '"'):
            problems.append('raw double quote in value (&quot; is a quote too), use \\"')
        if not quoted and _unescaped_positions(segment, "'"):
            problems.append("unescaped apostrophe in value, use \\' or Android outer quotes")
    return list(dict.fromkeys(problems))


def check_strict_android(
    report: Report,
    file_name: str,
    entries: dict[str, Entry],
    cdata: set[str],
) -> None:
    """Строгий режим: Android-экранирование каждого значения локали (кроме CDATA)."""
    for name, entry in entries.items():
        for key, markup in entry.values.items():
            label = name if key == "" else f"{name}[{key}]"
            if label in cdata:
                continue
            for problem in strict_android_problems(markup):
                report.error(file_name, label, problem)


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
    exempt_cjk: bool,
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

        if not allow_cjk and not exempt_cjk:
            chars = cjk_chars(loc_markup)
            if chars:
                sample = "".join(dict.fromkeys(chars))[:5]
                report.error(
                    file_name,
                    label,
                    f"CJK in locale value: {sample} (U+{ord(chars[0]):04X})",
                )


def check_file(
    base_dir: Path,
    loc_dir: Path,
    file_name: str,
    allow_cjk: bool,
    allowlist: set[tuple[str, str]],
    report: Report,
    strict_android: bool = False,
) -> None:
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

    if strict_android:
        # Только значения локали: база (upstream zh) этим режимом не проверяется.
        check_strict_android(report, file_name, loc, cdata_labels(loc_path))

    for name, base_entry in base.items():
        if base_entry.translatable == "false":
            continue
        loc_entry = loc.get(name)
        if loc_entry is None:
            report.error(file_name, name, "missing in locale")
            continue
        compare_entry(
            report,
            file_name,
            name,
            base_entry,
            loc_entry,
            allow_cjk,
            (file_name, name) in allowlist,
        )

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
    parser.add_argument(
        "--strict-android",
        action="store_true",
        help=(
            "ERROR на неэкранированные по правилам Android значения локали: "
            "«сырые» \\\" и ', реальные переводы строки/табуляция; CDATA не проверяется "
            "(по умолчанию выключен, база не проверяется никогда)"
        ),
    )
    parser.add_argument(
        "--allowlist",
        default=None,
        help=(
            "файл-исключение CJK со строками '<file>:<name>  # причина' "
            f"(по умолчанию {DEFAULT_ALLOWLIST_RELATIVE}, "
            "отсутствие файла по умолчанию = нет исключений)"
        ),
    )
    args = parser.parse_args(argv)

    base_dir = Path(args.base)
    loc_dir = Path(args.locale_dir)
    if not loc_dir.is_dir():
        print(f"ERROR {loc_dir} - locale directory not found")
        print("FAILED: 1 errors, 0 warnings")
        return 1

    allowlist_path, allowlist_error = resolve_allowlist(args.allowlist)
    if allowlist_error is not None:
        print(f"ERROR {args.allowlist} - {allowlist_error}")
        print("FAILED: 1 errors, 0 warnings")
        return 1

    report = Report()
    allowlist: set[tuple[str, str]] = set()
    if allowlist_path is not None:
        allowlist, problems = load_allowlist(allowlist_path)
        for lineno, reason in problems:
            report.error(f"{allowlist_path}:{lineno}", "-", reason)
        if report.errors:
            # Ошибка в самом файле-исключении: проверять ресурсы с неполным
            # набором исключений значило бы выдать ложный результат.
            for line in report.lines:
                print(line)
            print(f"FAILED: {report.errors} errors, 0 warnings")
            return 1

    for file_name in args.files:
        check_file(
            base_dir,
            loc_dir,
            file_name,
            args.allow_cjk,
            allowlist,
            report,
            strict_android=args.strict_android,
        )

    for line in report.lines:
        print(line)
    if report.errors:
        print(f"FAILED: {report.errors} errors, {report.warnings} warnings")
        return 1
    print("OK" if not report.warnings else f"OK ({report.warnings} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
