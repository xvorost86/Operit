# Открытые вопросы исполнителя (Operit-ru)

Формат: `файл:строка` | ключ | вопрос | что сделано сейчас (если что-то сделано) | статус.

---

## T1.2 (values-en)

### Q-1. autoglm_status_success — en-значение не совпадает по смыслу с базой

- Где: `app/src/main/res/values-en/strings.xml:5912` (после правки), база — `app/src/main/res/values/strings.xml:2387`.
- Расхождение: zh — «已完成 AutoGLM 一键配置：» + список из трёх пунктов (создан конфиг `autoglm-phone`, «UI 控制器» переключён, `Automatic_ui_base` выключен / `Automatic_ui_subagent` включён). en — совсем другой текст: «Model: %1$s / API Key: %2$s / Toolkit: AutoGLM», т.е. два аргумента, которых в базе нет вообще.
- Проверка кода: единственный вызов — `AutoGlmOneClickToolScreen.kt:194` `context.getString(R.string.autoglm_status_success)`, без аргументов. Значит в en на экране показывались литералы `%1$s` / `%2$s`, а `\\n` были двойными (в XML это «\n» текстом, не перевод строки).
- Что сделано: en заменён переводом zh-текста, плейсхолдеров нет (как в базе): «AutoGLM one-click configuration completed:» + три пункта + финальная строка. Ничего не додумывано — взят смысл базовой строки.
- Статус: **Q-1 РЕШЕНО архитектором** (приёмка T1.2): смысл en-перевода принят по китайскому оригиналу, возврат к апстримному en («Model: %1$s / API Key: %2$s / Toolkit: AutoGLM») отклонён. Аргументы `%1$s`/`%2$s` в en не восстанавливать — вызов `AutoGlmOneClickToolScreen.kt:194` идёт без аргументов.
- T1.2c: в этой же строке выполнено Android-экранирование — реальные переводы строк заменены на `\n`, сырые `"` на `\"` (см. ниже, «Android-экранирование»).

### Q-2. Иероглифические кавычки в en-значениях — что считать «формат», а что непереведённым текстом

- Где: `artifact_publish_node_updated`, `unsupported_artifact_version_message`, `confirm_remove_script_from_market`, `confirm_remove_package_from_market`, `skill_publish_name_taken_message` (`「」`), `ai_message_package_warmup_title` (`【】`).
- Решение исполнителя: это не токены форматирования (не xliff/HTML, не часть плейсхолдера), а типографские кавычки вокруг `%1$s` в уже английском тексте → заменены на `"…"` и `[Activated Packages]`.
- Оставлены и внесены в `l10n/cjk_allowlist.txt` только: `《人工智能拟人化互动服务管理暂行办法》` (название НПА КНР внутри англ. юридического текста, `agreement_serious_content`), голоса MiMo (`speech_services_mimo_voice_id_placeholder`, `speech_services_mimo_voice_id_hint` — реальные значения параметра API), `graph_char_for_measurement` (`中` — образец символа для измерения шрифта).
- Статус: **Q-2 РЕШЕНО архитектором** (приёмка T1.2): замена `「」`/`【】` на английские кавычки и квадратные скобки принята; возврат к иероглифическим кавычкам не нужен. Три функциональных CJK-значения из списка выше остаются как есть и вносятся в `l10n/cjk_allowlist.txt` (T1.2b).

## T1.2c (values-en) — Android-экранирование изменённых строк

- Правка только значений, изменённых в коммите `e239a30`: сырые `"` → `\"`, реальные переводы строк в `autoglm_status_success` → `\n`. Плейсхолдеры и смысл не менялись.
- Затронуто 6 ключей: `autoglm_status_success` (5 × `\n`, 2 × `\"`), `unsupported_artifact_version_message`, `confirm_remove_script_from_market`, `confirm_remove_package_from_market`, `artifact_publish_node_updated`, `skill_publish_name_taken_message` (по 2 × `\"`).
- Остальные значения из `e239a30` (`data_recovery_configuration_file_domain_issue`, `backup_format_csv`, `backup_format_csv_desc`, `tool_permission_execution_denied`, `tool_permission_overlay_required_for_confirmation`, `tool_permission_confirmation_timeout`, `ai_message_package_warmup_title`) кавычек и переводов строк не содержат — не правились.
- Старые строки файла, которых коммит не касался, не трогались (правило 12) — там остались как были.

## T1.3 batch08 (values-en, values-ru) — Q-3. auto_approve_desc: устаревшая en-подсказка против актуальных zh и кода

- Где: `app/src/main/res/values-en/strings.xml:1499` (значение до правки: «Safe tools will be executed automatically without prompting. For specific group approvals, please go to Settings - Tool Permission Management.»), `app/src/main/res/values-ru/strings.xml:1354`, база — `app/src/main/res/values/strings.xml:1478`.
- Расхождение: en обещает, что автоподтверждение действует только для «безопасных инструментов», а подтверждения настраиваются «группами» (`specific group approvals`). zh и код утверждают другое: автоподтверждение — глобальная политика по умолчанию для всех вызовов, а исключения задаются для отдельных инструментов, не для групп; деления инструментов на «безопасные» в проверке нет.
- Доказательство по коду: `app/src/main/java/com/ai/assistance/operit/ui/permissions/ToolPermissionSystem.kt:196` `val masterSwitch = PermissionLevel.fromString(preferences[MASTER_SWITCH] ?: DEFAULT_MASTER_SWITCH)`, `:197` `val key = toolPermissionKey(tool.name)`, `:198` `val overrideLevel = preferences[key]?.let { PermissionLevel.fromString(it) }`, `:200` `val permissionLevel = overrideLevel ?: masterSwitch`, `:203`–`:205` `ALLOW -> ToolPermissionCheckResult.GRANTED` / `ASK -> requestPermission(tool)` / `FORBID -> ToolPermissionCheckResult.DENIED`. Ключ исключения — имя инструмента (`toolPermissionKey(tool.name)`), группы и «безопасность» инструмента в решении не участвуют. Подсказка показывается как info-попап пункта меню инструментов: `app/src/main/java/com/ai/assistance/operit/ui/features/chat/components/style/input/agent/AgentChatInputSection.kt:2403` (`context.getString(R.string.auto_approve_desc)`).
- Решение архитектора (приёмка T1.3 batch07): подсказку привести к фактической семантике политики в обеих локалях; текст согласован архитектором дословно.
- Что сделано: значения `auto_approve_desc` в en (`:1499`) и ru (`:1354`) заменены согласованным текстом — «глобальная политика по умолчанию» + «исключения отдельных инструментов имеют приоритет». Остальные en-строки, Kotlin-код и сама политика разрешений не менялись.
- Статус: **Q-3 РЕШЕНО архитектором**, правка вошла в коммит `l10n(en,ru): clarify global tool approval policy`.
