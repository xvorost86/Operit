# P2 — аудит покрытия (2026-10-30, пере-замер 2026-10-31)

Аудит закрывает P2: проверено, что остаток класса `literal` не содержит непереведённого пользовательского текста. Число `literal` — верхняя граница, а не счётчик непереведённых строк: в него входят zh-аргументы уже локализованных сообщений, промпты, функциональные данные и диагностика.

## Измерения

Сканер и база: `python3 tools/l10n/scan_cjk.py --summary --diff l10n/inventory.json`.

| cls | строк | файлов |
|---|---:|---:|
| comment | 14 954 | 571 |
| log | 1 841 | 139 |
| literal | 2 513 | 118 |
| other | 1 | 1 |
| всего | 19 309 | — |

`literal` 2 702 → 2 513 (−189): 187 строк снято принятыми партиями P2, 4 — проходом аудита (три Kotlin-строки и один `require`). Рост ровно в двух файлах, оба объяснены: `tavily.js` 4 → 8 (партия 05, ленивые поставщики сообщений) и `RemoteAnnouncementTranslations.kt` 0 → 2 (партия F3: zh-ключи каталога переводов объявлений, привязанные к исходному тексту сервера, — не строки интерфейса).

Пере-замер 2026-10-31 (та же команда, после партий P3/P4 и правок F1–F5): числа в таблице выше — текущие. В разделе «Проверки (фактический вывод)» сохранены значения прогона на момент закрытия P2 (`literal 2 511`, 117 файлов) — это исторический вывод, а не расхождение.

Оговорка про локальную сборку: после `npm run build:webchat` в дереве появляется сгенерированный (и gitignored) `app/src/main/assets/web-chat/assets/index-*.js`, и сканер считает его содержимое — `literal` 2 513 → 2 518, `other` 1 → 2 (замер 2026-10-31: файл даёт +5 `literal`). Это артефакт сборки, а не исходники: опубликованное дерево без него (CI на чистом checkout'е даёт 2 513 / 118 файлов). Сканер сгенерированный каталог пока не исключает — см. долг в `README-RU.md`.

### Разрез `literal` по домену

| домен | строк | файлов | что это |
|---|---:|---:|---|
| Kotlin (`app/src/main/java`, `terminal/src`) | 1 733 | 85 | промпты, логи, функциональные данные |
| `assets/packages/*.js` | 646 | 27 | zh-ветки, функциональные данные, METADATA — в классе comment |
| `assets/bridge/spawn-helper.js` | 116 | 1 | сгенерированные каталоги ошибок Zod `zhCN`/`zhTW` |
| `assets/templates/**` | 10 | 3 | демонстрационный код ToolPkg, `@DisplayName` тестов |
| `assets/js/AndroidUtils.js` | 6 | 1 | комментарии внутри встроенного JS |
| `other` | 1 | 1 | `12306.js:421` — regex разбора `all_lishi` (функциональный, D5) |

## Классификация остатка

Метод: для каждой literal-строки проверялось, где именно стоят иероглифы — внутри блока `METADATA`, внутри zh-аргумента `localizedText`/`localizedMessage`/`localizedResultMessage`, в `console.*`, в комментарии внутри raw-string, либо в функциональных/тестовых данных. Для Kotlin потребитель каждой группы проверялся по коду (см. `l10n/functional_cjk.md`).

### Kotlin — 1 733 строки

| группа | строк | содержание |
|---|---:|---|
| Промпты и промпт-данные (D8) | 1 222 | `SystemToolPromptsInternal.kt` 603, `FunctionalPrompts.kt` 321, `SystemToolPrompts.kt` 99, `SystemPromptConfig.kt` 29, `TagMarketBilingualData.kt` 116, `CharacterCardBilingualData.kt` 48, `AvatarMoodType.kt` 5, `WaifuPreferences.kt` 1 |
| Логи, диагностика, встроенный JS | 261 | вызовы `logDebug`/`logError`/`StreamLogger`/`AppLogger`/`progressListener.onPluginLog` (D4), комментарии внутри Kotlin raw-string со встроенным JS/HTML |
| Функциональные данные и протокол | 250 | пунктуация, regex, ключевые слова, alias-карта приложений, id голосов, языковые названия в пикере, `tool_result`-протокол, мёртвый код |

Ни одна группа не является подписью интерфейса. Проверенные потребители зафиксированы в `l10n/functional_cjk.md`: `ConversationMarkupManager` (маркер усечения tool-result), `StructuredToolCallBridge` (синтетический `tool_result`), `LogModels` (нет потребителя `displayName`), `JsScripts`/`DeepseekJsInterface` (мёртвый код), `AIMessageManager:1168` (китайская ветка двуязычного промпта), `StandardUITools:545–555` (дата/дни недели zh-ветки промпта), `StreamGroup` (литерал только при `null`-контексте).

`terminal` (13 строк) — только `#`-комментарии внутри shell-скриптов (`TerminalManager`, `SSHFileConnectionManager`); пользовательского текста нет. Статический проход подтверждён, исполнение не проверялось.

### JS-пакеты — 646 строк

| группа | строк | содержание |
|---|---:|---|
| zh-ветка выбора языка (D11) | 596 | первый аргумент `localizedText(...)`; для zh выводится дословный китайский шаблон |
| Функциональные и тестовые данные | 50 | `12306` 18 (станции, коды мест, `DW_FLAGS`, `case '有'/'无'`, тестовые города), `code_runner` 14 (скрипты самопроверки и `expectedOutput`, сравниваемые между собой), `operit_editor` 8 (`const zh` руководства), `daily_life` 5 (поисковый запрос Baidu, двуязычные теги `[定时触发:…]`/`[自动任务]…`), по 1 — `automatic_ui_base` (тестовый ввод), `extended_chat` (`子任务`/`subTask`), `google_search` (фраза CAPTCHA), `various_search` (демо-запрос), `ffmpeg` (встроенный трёхъязычный тернарник) |

`METADATA` (4 519 CJK-сегментов в 27 пакетах) сканер относит к `comment`; блоки не менялись и содержат готовые `zh/en/ru`.

### Прочее

- `spawn-helper.js` — порождённый webpack-бандл Zod; `exports.locales` содержит `zhCN`/`zhTW` наряду с `en`/`ru`, правка бандла не требуется.
- `assets/templates/**`, `assets/js/AndroidUtils.js` — демонстрационный код и комментарии встроенного JS.

## Что исправлено в этом проходе

### JS: 16 пакетов (15 партий + 4 уточнения в трёх из них и в `google_search`)

Добавлен helper `localizedText(zhText, ruText, enText)` (D11: `zh` → китайский, `ru` → русский, иначе английский), вызов — в точке формирования сообщения, не при создании `exports`.

| файл | мест | файл | мест |
|---|---:|---|---:|
| `code_runner.js` | 92 | `xai_draw.js` | 42 |
| `daily_life.js` | 84 | `minimax_draw.js` | 38 |
| `12306.js` | 35 | `siliconflow_draw.js` | 36 |
| `automatic_ui_base.js` | 18 | `nanobanana_draw.js` | 26 |
| `automatic_ui_subagent.js` | 16 | `qwen_draw.js` | 17 |
| `extended_memory_tools.js` | 20 | `openai_draw.js` | 15 |
| `super_admin.js` | 5 | `zhipu_draw.js` | 15 |
| `operit_editor.js` | 1 (+русская ветка `how_make_skill`) | | |

Уточнения после ревью: `xai_draw`, `minimax_draw`, `siliconflow_draw` — alt/ссылки Markdown в возвращаемых данных; `google_search` — подпись зеркала Google Scholar в сообщении о результате. Итого 475 вхождений `localizedText` в 16 пакетах: 15 определений helper и 460 вызовов.

### Kotlin: 3 файла, 4 ключа ресурсов

- `ArtifactMarketModels.kt`, `ArtifactMarketViewModel.kt`, `GitHubForgePublishService.kt` — ошибка «нестабильный ID пакета» при публикации в маркет; проверка перенесена в точку с `Context`, текст берётся из `l10n_market_unstable_runtime_package_id`.
- `MessageCoordinationDelegate.kt` — метка участника группы `Имя (пользователь)` вместо `Имя（用户）` в en/ru; zh-вывод не изменился (`l10n_chat_group_participant_user_label`, `l10n_chat_group_participant_user_name`).
- `MCPLocalServer.kt` — `require`-сообщение о пустом `command` через `context.getString` (`l10n_mcp_command_required`).

Ключи добавлены в триаду `values`/`values-en`/`values-ru` в одном порядке; zh-значения совпадают с исходными строками.

## Проверки (фактический вывод)

- `node --check` для всех 16 изменённых в этом проходе JS-файлов — exit 0.
- Иероглифические сегменты zh-аргументов: сравнение мультимножества CJK-сегментов с `HEAD` для 16 затронутых пакетов — `missing 0`, `added 0`; блоки `METADATA` побайтово равны `HEAD`.
- 460 вызовов: ровно 3 аргумента, в первом есть иероглифы, в en/ru аргументах иероглифов нет.
- Добавленные строки не содержат комментариев и новых fallback-цепочек (`git diff -U0`).
- XML-триада: 107/107/107 ключей, порядок совпадает, `printf` расхождений 0, CJK в en/ru 0; `check_locale.py ... --files strings_l10n.xml` для en и ru — `OK`.
- `git diff --check` — exit 0; `scan_cjk.py --diff` — `literal 2702 → 2511`, роста по файлам нет, кроме принятого `tavily.js`.
- По прямому указанию владельца («собирай»): `./gradlew :app:compileDebugKotlin :app:mergeDebugResources` — `BUILD SUCCESSFUL in 4m 39s`, 131 задач, 0 ошибок; повторный прогон — `BUILD SUCCESSFUL in 3s`. Журнал: `~/.hermes/plans/operit-ru/runs/acceptance_p2_coverage.log`.
- Юнит-тесты после починки унаследованного тестового долга: `:app:compileDebugUnitTestKotlin` — `BUILD SUCCESSFUL`; целевые `XaiProviderReasoningTest`, `DeepseekProviderMediaRoleTest`, `McpConfigImportParserTest` — 11/11; полный `:app:testDebugUnitTest` — 1333 теста, 0 падений, 6 пропущено (после починки тестовой базы: locale-independent формат калькулятора, отключение AppLogger в JVM-тестах, актуализация устаревших проверок, guard декодера legacy-ключей)

## Остаточные риски и открытые решения

- Исполнение в QuickJS, переключение языка на устройстве и отрисовка строк на экране не проверены: компиляция и слияние ресурсов зелёные, но это не рантайм. `terminal` подтверждён только статически.
- В `code_runner.js` (`Installed with pip:`, `Return value:`, `Script execution failed:`) и `super_admin.js` (`hint: Output is large…`) остались английские пользовательские строки без китайского оригинала. Перевод на ru добавил бы zh-значение, которого не было, и изменил бы вывод для zh; оставлено как есть — решение на уровне продукта.
- `assets/templates/**` и `spawn-helper.js` не переводятся: демонстрационный код и порождённый бандл.

## `web-chat` (LAN-страница, партия P4.C)

`scan_cjk.py` по умолчанию обходит только `app/src/main/java`, `terminal/src` и `app/src/main/assets`; отдельное Vite-приложение `web-chat/` в него не входит. Замер до работ: **308 строк с иероглифами в 29 файлах** `web-chat/src/**/*.ts(x)` — весь интерфейс LAN-страницы (подписи, placeholder'ы, `aria-label`, тексты ошибок, `window.confirm`), i18n-слоя не было.

P4.C (2026-10-31) — сделано. Источник языка: `navigator.language`, решение владельца. Helper `web-chat/src/ui/features/chat/util/i18n.ts`: `resolveUiLanguage()`/`UI_LANGUAGE` (ru → русский, zh → китайский, любой другой тег → английский — та же продуктовая политика, что D11, один детерминированный маппинг, не цепочка), `t(zh, en, ru)` и `tf(zh, en, ru, ...values)` с плейсхолдерами `{0}`. `main.tsx` выставляет `document.documentElement.lang`; `chatUtils.formatTime` и сортировка по имени в `CharacterSelectorPanel` берут локаль оттуда же вместо жёстких `zh-CN`/`zh-Hans-CN`.

Заменены все 305 пользовательских строк (28 файлов `src`): исходный zh перенесён байт-в-байт первым аргументом. Где та же строка уже есть в Android-ресурсах (`values/values-en/values-ru`), en и ru взяты **дословно оттуда** (92 совпадения, автоматическая сверка по значению zh через `strings.xml`), остальное переведено по `l10n/glossary.md` (Conversation → «беседа», Workspace → «рабочее пространство», Thinking → «рассуждения», «…» вместо трёх точек, «вы», ёлочки). Остались только 3 строки `console.error` (D4 — логи не трогаем).

Проверки: `npx tsc --noEmit` — 0 ошибок; `npm --prefix web-chat run build` → `✓ built in 1.27s`, `BUILD_EXIT=0` (единственное предупреждение — размер чанка 616 кБ, было и до правок). Собранный `dist/` открыт в Chromium с разными `Accept-Language`: ru-RU → «История чата / Новый чат / Подключение к LAN-странице», en-GB → «Chat History / New Chat / LAN page connection», zh-CN → исходный китайский, de-DE → английский; `document.documentElement.lang` = ru-RU / en-US / zh-CN / en-US соответственно; скриншот ru-экрана без обрезки текста. Функциональный прогон внутри подключённой сессии (реальные сообщения, тулзы, локатор) не выполнялся — нужен телефон с включённой LAN-страницей.

Поставка партии (2026-10-31): `npm run build:webchat` выполнен, APK пересобран — подробности в разделе про поставку ниже.

Пере-замер 2026-10-31: 327 вызовов `t`/`tf` в 56 файлах `web-chat/src`; строк с иероглифами — 323 в 29 файлах, из них 3 — в `console.error`. Скриптовая проверка (вырезаны все аргументы `t`/`tf`, затем поиск CJK): **0 строк с иероглифами вне вызовов селектора и вне `console.*`** — непереведённого интерфейса в `web-chat/src` не осталось.

Дефект поставки (найден и закрыт 2026-10-31): релизный APK, собранный до партии P4.C, записей `assets/web-chat` не содержал вообще (`unzip -l | grep -c assets/web-chat` → 0). Каталог генерируется шагом `npm run build:webchat` и в git не лежит (`.gitignore`: `web-chat/dist/`, `app/src/main/assets/web-chat/`), а апстрим требует этот шаг перед сборкой (`docs/doc-src/dev-core/BUILDING.md`, п. 6 — «关键步骤»); без него `WebChatHttpBridge` отвечал 404. Пересобрано с шагом: 4 записи `assets/web-chat` в APK, `GET /` → HTTP 200, локали ru/en/zh/de проверены в браузере (`l10n/device_check.md`, раздел P4.2).
