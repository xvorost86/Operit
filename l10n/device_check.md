# Проверка на устройстве (P3)

Дата: 2026-10-30. Исполнитель: deepseek-flash. Ветка `ru-localization`.

## Устройство и сборка

| Что | Значение |
|---|---|
| Устройство | Poco F7 Ultra (`24122RKC7G`), Android 16 (API 36), системная локаль `ru-RU` |
| APK | `com.ai.assistance.operit.debug`, versionName `1.12.2`, versionCode 51, только arm64-v8a |
| Сборка | `./gradlew :app:assembleDebug` (JDK 21, `~/Android/jdk21`); первый прогон упал на скачивании native-зависимостей через прокси (`status_code: 92 "Stream error in the HTTP/2 framing layer"` для dragonbones/MNN/ufbx/llama.cpp), повторный прошёл |
| Логи | `~/.hermes/plans/operit-ru/runs/p3_assemble_debug_*.log`, `..._retry_*.log`, `..._fixes_*.log`, `..._final_*.log` |
| Скриншоты и дампы | `~/.hermes/plans/operit-ru/p3/shots/`, `~/.hermes/plans/operit-ru/p3/walk.jsonl` (вне репозитория) |

## Метод

- Драйвер `~/.hermes/plans/operit-ru/p3/drive.py` поверх adb: `uiautomator dump` → список видимых узлов (`text` + `content-desc` + `bounds`), тап по тексту, скриншот, поиск CJK в тексте экрана (`[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffff]`).
- `walk.py` открывает список пунктов по одному, снимает `step` и возвращается назад; при ненайденном пункте останавливается, чтобы не тыкать вслепую.
- Автоматический CJK-скан дополнен просмотром скриншотов: canvas/WebView-текст и вёрстка видны только глазами.
- Язык интерфейса переключался в приложении (Настройки → Настройки языка), проход повторялся в `ru` и `en`.

## Охват (ru и en)

Главный экран/меню (drawer), ИИ-чат (пустое состояние, `ИИ-чат`/`AI Chat`), Настройки и все их подэкраны: профиль пользователя, язык, тема, отображение и поведение, макет, конфигурация модели, функциональные модели, службы речи, конфигурация промптов, генерация карточки персоны, режим вайфу, контекст и сводка, разрешения инструментов, резервное копирование, история чата, статистика токенов, монитор производительности, очистка cookie, внешние HTTP-вызовы, GitHub-аккаунт. Инструментарий и подэкраны: центр тестирования, файловый менеджер, синтез и распознавание речи, менеджер разрешений, пользовательское соглашение, ассистент по умолчанию, командный терминал (настройка окружения, сам терминал, настройки терминала), отладка интерфейса, выполнение команд, просмотр логов, просмотр SQL, FFmpeg, упаковщик HTML, AutoGLM, удаление ограничения фантомных процессов. Пакеты (вкладки плагинов/скриптов/Skill/MCP, переменные среды), Разрешения, Воркфлоу, База памяти, политика конфиденциальности.

Не покрыто: экраны, которым нужен ключ API или сетевой аккаунт (реальный диалог с моделью, публикация в маркете, GitHub-логин), и маркет/внешние источники — их содержимое приходит извне (см. F3).

## Найдено

| # | Дефект | Где | Серьёзность | Статус |
|---|---|---|---|---|
| F1 | В русской локали весь UI модуля `terminal` был на китайском: экран «Настройка окружения» (`环境配置`), настройки терминала (FTP, хранилище, chroot, SSH, шрифты, виртуальные клавиши). Причина: `values/strings.xml` и `values-en/strings.xml` есть, `values-ru` не было — Android откатывался на базовую (zh) локаль. 194 ключа | `terminal/src/main/res/values-ru/` | критическая | исправлено |
| F2 | В списке языков под пунктом «Follow system» выводился китайский «跟随系统»: `LocaleUtils.Language(LanguageCodes.AUTO, "Follow system", "跟随系统")`, а `LanguageSettingsScreen` рисует `nativeName` второй строкой во всех локалях | `LanguageSettingsScreen.kt:186`, `LocaleUtils.kt:45` | средняя | исправлено |
| F3 | Удалённое объявление (`https://operit.app/announcements/latest.json`) приходит только в `zh-CN`; `pickLocalizedContent` берёт `defaultLocale`, поэтому в ru и en первый запуск показывает китайский диалог. Контент внешний, локализовать его в приложении нельзя | `RemoteAnnouncementRepository.kt:204` | средняя | вне области (PLAN T3.3); решение владельца |
| F4 | Обрезка русских подписей многоточием: нижняя панель меню «О приложе…», «Руководст…»; карточка «Менеджер разрешений прило…» в инструментарии; статистика токенов «Обзор пери…», «Максимум токе…», «Доля попадани…», «Акти…», вкладка периода «10/1-10/3» | вёрстка (`maxLines = 1`) и длина ru-строк | низкая (косметика) | не исправлено, нужно решение |
| F5 | Английские `content-desc` в «Базе памяти»: «Toggle Folders», «Toggle Box Selection Mode», «Toggle Linking Mode», «Import Document», «Create Memory» — не видны на экране, но читаются TalkBack | `ui/features/memory/...` | низкая (a11y) | не исправлено |

## Исправления

1. `terminal/src/main/res/values-ru/strings.xml` — новый файл, 194 строки, порядок ключей как в `values/strings.xml`, zh-база байт-в-байт не тронута; терминология по `l10n/glossary.md` (Session → «сеанс», Environment → «окружение», Notice → «предупреждение», «Не удалось …», «…», «ёлочки»).
2. Ключ `l10n_settings_language_auto_native` в триаде `strings_l10n.xml` (values / values-en / values-ru: `跟随系统` / `System language` / `Системный язык`) + `LanguageSettingsScreen`: для пункта AUTO вторая строка берётся из ресурса, для остальных языков остаётся `nativeName` (названия языков по D5 не переводятся).

## Проверки

- `python3 tools/l10n/check_locale.py terminal/src/main/res/values-ru --base terminal/src/main/res/values --files strings.xml --strict-android` → `OK`, `EXIT=0`.
- `python3 tools/l10n/check_locale.py app/src/main/res/values-{en,ru} --base app/src/main/res/values --files strings_l10n.xml` → `OK`, `EXIT=0` для обеих локалей.
- `./gradlew :app:assembleDebug` → `BUILD SUCCESSFUL`, `GRADLE_EXIT=0`; `adb install -r` → `Success`.
- Повторный проход по экранам после исправлений: `Терминал команд` → «Текущий сеанс «Local»», «Новый сеанс», «Строка 30:»; «Настройка окружения» — «Окружение Node.js»/«Выбрать все»/«Пропустить»/«Начать настройку»; настройки терминала — «FTP-файловый сервер», «Управление хранилищем», «Режим chroot», «Общий временный каталог», «Настройки шрифта терминала»; список языков — «Follow system»/«Системный язык». CJK на этих экранах: 0.
- Остаются только названия языков в собственной записи (`中文`, `日本語`, `한국어`) — по D5 не переводятся.

## Как повторить

```bash
export JAVA_HOME=$HOME/Android/jdk21
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
cd ~/.hermes/plans/operit-ru/p3
python3 drive.py step <имя>      # дамп + CJK + скриншот
python3 drive.py cjk             # только CJK по текущему экрану
python3 walk.py <префикс> "Пункт 1" "Пункт 2"
```
