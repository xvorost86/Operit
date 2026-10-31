# Operit RU — русская сборка Operit AI

Форк [Operit](https://github.com/AAswordman/Operit) (снимок `dbf7191`, версия 1.12.2) с полной русской
локализацией. Собирается как **отдельное приложение** `ru.xvorost.operit` и ставится рядом с
официальным Operit: свои данные, своя подпись, чужой APK не перезаписывается.

[![Latest release](https://img.shields.io/github/v/release/xvorost86/Operit?label=release)](https://github.com/xvorost86/Operit/releases/latest)
[![L10n Check](https://github.com/xvorost86/Operit/actions/workflows/l10n-check.yml/badge.svg?branch=ru-localization)](https://github.com/xvorost86/Operit/actions/workflows/l10n-check.yml)

| | |
|---|---|
| applicationId | `ru.xvorost.operit` (debug-вариант — `ru.xvorost.operit.debug`) |
| versionName | `1.12.2-ru3` |
| versionCode | 512 (схема: апстрим × 10 + ревизия ru-сборки) |
| namespace | `com.ai.assistance.operit` — не меняется, чтобы правки апстрима мержились без конфликтов |
| ABI | только `arm64-v8a` (как в апстриме) |
| Подпись | собственный keystore, вне git |

## Что переведено

- `app/src/main/res/values-ru/strings.xml` — 7717 ресурсов, полный паритет с `values-en` и `values`:
  имена, порядок, типы и плейсхолдеры совпадают.
- `terminal/src/main/res/values-ru/strings.xml` — 194 ресурса модуля терминала (в апстриме есть
  только `values` и `values-en`, из-за чего русский интерфейс терминала откатывался на китайский).
- `strings_l10n.xml` (триада `values` / `values-en` / `values-ru`) — новые ключи для строк, которые в
  апстриме были зашиты в Kotlin.
- `ru` в 31 JS-пакете `app/src/main/assets/packages/*.js` — и в METADATA (974 объекта `zh/en/ru`), и в
  пользовательских сообщениях через селектор `localizedText` (D11: `zh` → китайский, `ru` → русский,
  остальные коды → английский). Семь строк, которые в апстриме были только по-английски (в
  `code_runner.js` и `super_admin.js`), тоже переведены: английский оригинал стоит байт-в-байт в
  `zh`-ветке, поэтому вывод для zh и en не изменился.
- 9 языковых кодов и `res/xml/locales_config.xml` — русская локаль зарегистрирована наравне с остальными.
- `web-chat/` (LAN-страница на Vite) — 327 вызовов `t`/`tf` в 56 файлах `src`, язык берётся из
  `navigator.language` (ru → русский, zh → китайский, любой другой тег → английский, та же политика D11);
  где строка уже была в Android-ресурсах, en и ru взяты оттуда дословно.

## Сборка

Требуется JDK 21 (апстрим не собирается на JDK 25), Android SDK и Node.js для `web-chat`. Путь к JDK
в этом проекте:

```bash
export JAVA_HOME=$HOME/Android/jdk21
npm --prefix web-chat install          # один раз, для сборки LAN-страницы
npm run build:webchat                  # обязательно перед сборкой APK
./gradlew :app:assembleRelease      # релизный APK с нашей подписью
./gradlew :app:assembleDebug        # отладочный, applicationId ru.xvorost.operit.debug
```

`npm run build:webchat` собирает `web-chat/` (Vite) и синхронизирует результат в
`app/src/main/assets/web-chat`; этот каталог в git не лежит. Без шага APK собирается без LAN-страницы,
и `WebChatHttpBridge` отвечает 404 — апстрим помечает шаг как ключевой
(`docs/doc-src/dev-core/BUILDING.md`, п. 6). Правили `web-chat/src` — повторите шаг перед сборкой.

Результат: `app/build/outputs/apk/release/app-release.apk` (arm64-v8a, ~420 МБ).

Не собирайте в `/tmp` и не держите `TMPDIR` в системной временной папке: на машинах, где `/tmp`
смонтирован как tmpfs, распаковка native-зависимостей упирается в OOM. Собирайте в каталоге проекта.

Первый прогон скачивает native-зависимости (dragonbones, MNN, ufbx, llama.cpp); при сетевой ошибке
(`Stream error in the HTTP/2 framing layer`) достаточно повторить запуск — кэш уже частично наполнен.

## Подпись

Параметры подписи Gradle читает из `local.properties` (`/local.properties` в `.gitignore`):
`RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD`.
Если хотя бы одного значения нет или файл не существует, `signingConfig release` не создаётся и
релизная сборка выходит неподписанной — это штатное поведение апстрима, переопределять его не нужно.

На этой машине ключ лежит вне репозитория:

```
~/Projects/Operit-ru/keys/operit-ru-release.jks     # PKCS12, RSA 4096, alias operit-ru, 10000 дней
~/Projects/Operit-ru/keys/keystore.env              # chmod 600, те же значения, что в local.properties
```

В PKCS12 пароль ключа совпадает с паролем хранилища (`keytool` игнорирует `-keypass`), поэтому
`RELEASE_KEY_PASSWORD` дублирует `RELEASE_STORE_PASSWORD`. Хранилище и `.env` нужно сохранить: без них
обновление `ru.xvorost.operit` невозможно, придётся удалять приложение вместе с данными.

## Как подтянуть апстрим

```bash
git fetch upstream
git merge upstream/main                 # ожидаемо мало конфликтов: новые ключи живут в strings_l10n.xml
python3 tools/l10n/check_locale.py app/src/main/res/values-ru --base app/src/main/res/values \
    --files strings.xml strings_l10n.xml --strict-android
python3 tools/l10n/check_locale.py app/src/main/res/values-en --base app/src/main/res/values
python3 tools/l10n/scan_cjk.py --summary          # сводка остатка до и после мержа
```

Ветка `main` форка синхронизируется отдельно: в ней нет перевода, только блок `ru-build-note` в самом
верху `README.md`.

```bash
git fetch upstream
git checkout main
git merge upstream/main     # конфликт возможен только в этом блоке — оставить наш вариант
git push fork main
```

Для точного сравнения с состоянием до мержа снимите инвентарь заранее (`--out`) и после мержа
сравните с ним (`--diff`). `l10n/inventory.json` намеренно не лежит в git: это 4 МБ машинного вывода,
его генерируют локально.

Порядок разбора новых строк апстрима:

1. Проверяющий сначала падает на отсутствующих в `values-ru` ключах — это и есть список на перевод.
2. Перевод пишется в `values-ru/strings.xml` **в том же порядке**, в котором ключи стоят в `values-en`.
3. Зашитые в Kotlin строки выносятся в `strings_l10n.xml` (три ключа: zh = исходная строка байт-в-байт,
   en и ru — переводы). Существующий `strings.xml` не правится, чтобы мерж оставался дешёвым (D3).
4. Всё, что переводить нельзя, фиксируется в `l10n/functional_cjk.md`, а точечные исключения для
   проверяющего — в `l10n/cjk_allowlist.txt` (`<файл>:<имя ключа>  # причина`).

## Публикация

Ветка опубликована в форке: **`ru-localization`** в https://github.com/xvorost86/Operit
(поверх апстрима `dbf7191`). Русские ресурсы модуля терминала закоммичены в его
собственном репозитории, поэтому второй форк — https://github.com/xvorost86/OperitTerminalCore
(ветка `ru-localization`, коммит `5cc5777`), и `.gitmodules` указывает именно на него: с адресом
апстрима `git clone --recurse-submodules` не смог бы разрешить закреплённый коммит.

```bash
git clone --recurse-submodules -b ru-localization git@github.com:xvorost86/Operit.git
# или по HTTPS:
git clone --recurse-submodules -b ru-localization https://github.com/xvorost86/Operit.git
```

Оба сабмодуля адресуются по HTTPS: `terminal` — на форк с русскими ресурсами, `tools/hotbuild/OperitNightlyRelease`
— на публичный репозиторий апстрима (в апстриме там SSH-адрес, из-за которого анонимный клон спотыкался).
Закреплённый коммит ночного сборщика (`35016523…`) — вершина `main` его репозитория, поэтому резолвится без ключа.

Главная страница форка — дефолтная ветка `main`, а GitHub рендерит `README.md` только из неё. Поэтому в
`README.md` ветки `main` лежит короткий блок между маркерами `ru-build-note:start` / `ru-build-note:end`
со ссылкой на релиз и на эту ветку; в остальном `main` — апстрим без изменений.

Pull request в апстрим не открывается: `applicationId`, подпись и версия отличаются от апстрима
(D7). Гейт — `.github/workflows/l10n-check.yml` (job `L10n Check`): 67 тестов инструментов, строгие
проверки ru/en/terminal и информационный инвентарь CJK. На `822b910` прогон зелёный за 30 c:
`OK` (ru, strict, 13 warnings), `OK` (en, 45 warnings), `OK` (terminal ru), инвентарь
`literal 2513 / 118`.

### Релиз

Текущий: **https://github.com/xvorost86/Operit/releases/tag/v1.12.2-ru3**
(тег `v1.12.2-ru3` → коммит `0e620c4`, из этого дерева собран APK).

| Ассет | Размер | sha256 |
|---|---:|---|
| `Operit-1.12.2-ru3-arm64-v8a.apk` | 377 767 836 | `f61f9f563101c08bea7fddb46979641284b375f869e1ab3326f9df8264a4b4f4` |
| `Operit-1.12.2-ru3-arm64-v8a.apk.sha256` | 98 | — (файл с хешем) |

```bash
gh release download v1.12.2-ru3 --repo xvorost86/Operit
sha256sum -c Operit-1.12.2-ru3-arm64-v8a.apk.sha256
adb install -r Operit-1.12.2-ru3-arm64-v8a.apk
```

Что в ru3 против ru2: семь пользовательских строк в JS-пакетах, которые в апстриме были только
по-английски, получили русский вариант (английский оригинал остался в zh-ветке, вывод для zh/en не
изменился): «Установлено через pip», «Установлено через pnpm в \<каталог\>», «Возвращаемое значение:»,
«(Нет вывода console.log и нет возвращаемого значения)», «Не удалось выполнить скрипт:» (два места),
подсказка «Вывод большой, сохранён в файл…»; плюс две подписи для TalkBack в экране пакетов —
«Маркет скриптов и пакетов» вместо `Artifact Market` и «Необязательно» вместо `Optional`.

Предыдущий выпуск — **https://github.com/xvorost86/Operit/releases/tag/v1.12.2-ru2**
(тег `v1.12.2-ru2` → коммит `5d66831`): APK 377 774 132 байта,
sha256 `3c331f32dd960c52aa524a22134fbed179385000033aca2149863671f6202eaa`. В ru2: подписи «Запрос» /
«Запрос от \<имя\>» / «Ответ» вместо `Prompt`/`Response`, полный текст результата инструмента для
TalkBack (было обрезано до 20 символов), перенос длинных имён инструментов на две строки в LAN-странице.

Первый выпуск — **https://github.com/xvorost86/Operit/releases/tag/v1.12.2-ru1**
(тег `v1.12.2-ru1` → коммит `4087dbe`): APK 377 765 404 байта,
sha256 `8c39efa3367b4c041220d6f64a43a534585136a30216c72499aa03f8fa942077`; в нём нет
`assets/web-chat`, то есть LAN-страница отдаёт 404 — для неё нужен ru2 или новее.

## Как обновляться

Схема версий: `versionCode = версия апстрима × 10 + ревизия ru-сборки`, `versionName = <апстрим>-ru<ревизия>`.
Текущая — `1.12.2-ru3` / `512`. Следующая правка поверх того же апстрима — `1.12.2-ru4` / `513`, новый
апстрим `1.13.0` — `1.13.0-ru1` / 600.

Обновление на телефоне (подпись и `applicationId` те же, данные и настройки сохраняются):

```bash
gh release download <тег> --repo xvorost86/Operit    # либо взять APK из ~/Projects/Operit-ru/dist
sha256sum -c Operit-…-arm64-v8a.apk.sha256
adb install -r Operit-…-arm64-v8a.apk
```

Без кабеля: скачать APK из релиза на телефоне и открыть — браузеру нужно разрешение «Установка
неизвестных приложений». Официальный Operit обновляется отдельно и наш пакет не трогает.

**Ключ подписи обязателен.** `~/Projects/Operit-ru/keys/operit-ru-release.jks` + `keystore.env`
(вне git) — без них обновить установленное приложение нельзя: Android отвергнет APK с другой
подписью, придётся удалять приложение вместе с данными. Копия ключа лежит на NAS:
`//192.168.1.122/Storage/backups/operit-ru-signing/` (keystore, `keystore.env`, `SHA256SUMS`,
`README.md` с порядком восстановления; копия скачана обратно и сверена по sha256, сертификат
открывается паролем из `keystore.env`). Пароль лежит рядом с хранилищем — доступ к этой папке на
NAS фактически даёт право подписать обновление; при желании разнесите `keystore.env` и `.jks` по
разным местам.

**Когда выйдет новый апстрим:**

1. `git fetch upstream && git merge upstream/main` — конфликты почти всегда в `strings.xml` и
   `.gitmodules`.
2. `check_locale.py` покажет новые ключи без перевода; `scan_cjk.py --summary --budget
   l10n/cjk_budget.json` — вырос ли `literal` против эталона. Разобранный (классифицированный) текст
   принимается обновлением эталона тем же коммитом: `scan_cjk.py --write-budget l10n/cjk_budget.json`;
   остальное — по рецепту из «Как подтянуть апстрим».
3. `npm run build:webchat` (без него LAN-страница не попадёт в APK) и
   `./gradlew :app:testDebugUnitTest :app:assembleRelease`.
4. Поднять `versionCode`/`versionName` по схеме выше, обновить `dist/` и `.sha256`, дождаться
   зелёного `L10n Check`.
5. `git tag -a <версия> -F <сообщение> && git push fork <версия>`, затем
   `gh release create <версия> --verify-tag … APK .sha256`.

## Инструменты проверки

| Команда | Что делает |
|---|---|
| `python3 tools/l10n/check_locale.py <локаль> --base <база> --files ...` | набор ключей, типы, плейсхолдеры, HTML/`xliff`-теги, escape-последовательности; с `--strict-android` — ещё и Android-экранирование (`\"`, `\'`, реальные переводы строк) |
| `python3 tools/l10n/scan_cjk.py --summary` | инвентарь иероглифов по классам (`comment` / `log` / `literal` / `other`) |
| `python3 tools/l10n/scan_cjk.py --summary --budget l10n/cjk_budget.json` | гейт: код возврата 1, если `literal` или `other` вырос против принятого эталона |
| `python3 tools/l10n/scan_cjk.py --write-budget l10n/cjk_budget.json` | принять текущие счётчики как новый эталон (осознанное действие, тем же коммитом, что и принятый текст) |
| `python3 tools/l10n/scan_cjk.py --diff l10n/inventory.json` | сравнение с эталонным инвентарём: рост `literal` виден сразу |
| `python3 -m unittest discover -s tools/l10n/tests` | 71 тест самих инструментов |

`.github/workflows/l10n-check.yml` прогоняет всё это на каждый push в `ru-localization` и на pull
request, который трогает ресурсы или `tools/l10n`. Инвентарь CJK — **гейт**: принятые счётчики лежат
в `l10n/cjk_budget.json` (`literal 2513`, `other 1`), и job падает, если любой из них вырос. Остаток
`literal` классифицирован в `l10n/coverage_audit.md` (промпты, логи, функциональные данные), поэтому
рост означает либо новый непереведённый текст, либо новую функциональную строку, которую нужно внести
в allowlist и осознанно поднять эталон. Полный `--diff` в CI недоступен: `l10n/inventory.json` — 4 МБ
машинного вывода, в git его не кладут.

## Что не переводится (осознанно)

- Комментарии, KDoc, `docs/`, сообщения логов (D4).
- Системные промпты ИИ: остаются английскими, добавлено указание отвечать на языке пользователя (D8).
- Данные, на которых держится логика: regex и ключевые слова на китайском, названия языков в
  собственном написании (`中文`, `日本語`, `한국어`), имена пакетов, протокольные ключи (D5).
- Содержимое внешних источников: объявления с сервера (перевод привязан к исходному тексту, при смене
  формулировки показывается оригинал), маркет плагинов, ответы моделей, MCP-серверы.
- В `web-chat/` остались только 3 `console.error` (D4) — интерфейс переведён.

## Известные ограничения и долги

| # | Что | Состояние |
|---|---|---|
| 1 | Пользовательские строки только по-английски без zh-оригинала: `code_runner.js` (`Installed with pip:`, `Installed with pnpm in …:`, `Return value:`, `Script execution failed:` ×2, `(No output from console.log or return value)`) и `super_admin.js` (`hint: Output is large…`) | **закрыт**: 7 строк обёрнуты в `localizedText`, где zh-ветка — исходный английский текст байт-в-байт. Вывод zh/en не изменился, ru переведён («Установлено через pip:», «Возвращаемое значение:», «Не удалось выполнить скрипт:», «Вывод большой, сохранён в файл…»). Самопроверка `code_runner` собирает ожидаемый вывод тем же селектором, иначе тест падал бы на ru |
| 2 | Рантайм JS-пакетов (QuickJS) и переключение языка внутри них | **закрыт 2026-10-31**: на устройстве вызов `code_runner:run_javascript_es5` вернул «Возвращаемое значение: 42» при русском интерфейсе и `Return value: 42` после переключения на английский — строка выбирается в момент формирования результата, а не при создании модуля; описания пакета пришли модели по-русски. Детали — `l10n/device_check.md` (P4.4) |
| 3 | `terminal`: 13 оставшихся иероглифов — комментарии `#` внутри shell-скриптов | подтверждено статически |
| 4 | Ротация подписи апстрима: finalizer `assembleRelease` включается только при заданных `APK_ROTATION_*` (legacy-ключа нет) | не настроено осознанно |
| 5 | CI: инвентарь CJK | **закрыт**: гейт `--budget l10n/cjk_budget.json` валит job при росте `literal` или `other`; `--diff` против 4-МБ `l10n/inventory.json` остаётся только локальным |
| 6 | Экраны под API-ключ/аккаунт (реальный диалог, публикация в маркет, вход в GitHub), содержимое маркета и внешних источников, подключённый сеанс LAN-страницы | частично: LAN-сеанс проверен (P4.2b), диалог выбора способа входа в GitHub — по-русски и без иероглифов (P4.5), сам вход не выполнялся (нужны учётные данные владельца); содержимое маркета и внешних источников не переводится по политике |
| 7 | Терминальное окружение не развёрнуто: `run_javascript_node` и экран «Выполнение команд» не возвращают вывод | **диагноз есть** (P4.5): `hiddenExec("node --version")` ждёт окружение, а Node.js не установлен — «Командный терминал» → «Настройка окружения» → «Начать настройку». Таймаут по умолчанию 120 с. Лечится развёртыванием окружения на устройстве |

Закрыто 2026-10-31: скан `literal` больше не зависит от того, собран ли фронтенд (`tools/l10n/scan_cjk.py` исключает сгенерированный `app/src/main/assets/web-chat`, тест `test_generated_web_chat_bundle_is_skipped`); инвентарь CJK стал гейтом с эталоном `l10n/cjk_budget.json` (тесты `test_budget_gate_*`, `test_cli_budget_exit_codes`); английские строки без zh-оригинала в `code_runner.js`/`super_admin.js` переведены с сохранением английского в zh-ветке. Всего 71 тест инструментов.

## Отчёты

- `l10n/glossary.md` — глоссарий терминов и правила перевода.
- `l10n/coverage_audit.md` — аудит покрытия: что осталось в `literal` и почему это не интерфейс.
- `l10n/functional_cjk.md` — места, где иероглифы функциональны, с проверкой потребителей в коде.
- `l10n/device_check.md` — проход по экранам на устройстве (Poco F7 Ultra, Android 16), найденные
  дефекты F1–F5 и их исправления.
- `l10n/questions.md` — закрытые вопросы к архитектору по спорным строкам.
- `l10n/PATTERN.md` — как выбирается язык в JS-пакетах (`localizedText`, ленивые поставщики).

## Перед релизом

```bash
export JAVA_HOME=$HOME/Android/jdk21
python3 -m unittest discover -s tools/l10n/tests
python3 tools/l10n/check_locale.py app/src/main/res/values-ru --base app/src/main/res/values \
    --files strings.xml strings_l10n.xml --strict-android
python3 tools/l10n/check_locale.py terminal/src/main/res/values-ru --base terminal/src/main/res/values \
    --files strings.xml strings_l10n.xml --strict-android
python3 tools/l10n/scan_cjk.py --budget l10n/cjk_budget.json
npm run build:webchat
./gradlew :app:testDebugUnitTest :app:assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

После установки — проход по экранам в `ru` и `en` с автоматическим поиском иероглифов в тексте экрана:
драйвер описан в `l10n/device_check.md` («Как повторить»).
