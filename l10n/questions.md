# Открытые вопросы исполнителя (Operit-ru)

Формат: `файл:строка` | ключ | вопрос | что сделано сейчас (если что-то сделано) | статус.

---

## T1.2 (values-en)

### Q-1. autoglm_status_success — en-значение не совпадает по смыслу с базой

- Где: `app/src/main/res/values-en/strings.xml:5912` (после правки), база — `app/src/main/res/values/strings.xml:2387`.
- Расхождение: zh — «已完成 AutoGLM 一键配置：» + список из трёх пунктов (создан конфиг `autoglm-phone`, «UI 控制器» переключён, `Automatic_ui_base` выключен / `Automatic_ui_subagent` включён). en — совсем другой текст: «Model: %1$s / API Key: %2$s / Toolkit: AutoGLM», т.е. два аргумента, которых в базе нет вообще.
- Проверка кода: единственный вызов — `AutoGlmOneClickToolScreen.kt:194` `context.getString(R.string.autoglm_status_success)`, без аргументов. Значит в en на экране показывались литералы `%1$s` / `%2$s`, а `\\n` были двойными (в XML это «\n» текстом, не перевод строки).
- Что сделано: en заменён переводом zh-текста, плейсхолдеров нет (как в базе): «AutoGLM one-click configuration completed:» + три пункта + финальная строка. Ничего не додумывано — взят смысл базовой строки.
- Статус: **на подтверждение архитектора**. Если у апстрима en считался эталоном и zh устарел — скажи, верну/переделаю.

### Q-2. Иероглифические кавычки в en-значениях — что считать «формат», а что непереведённым текстом

- Где: `artifact_publish_node_updated`, `unsupported_artifact_version_message`, `confirm_remove_script_from_market`, `confirm_remove_package_from_market`, `skill_publish_name_taken_message` (`「」`), `ai_message_package_warmup_title` (`【】`).
- Решение исполнителя: это не токены форматирования (не xliff/HTML, не часть плейсхолдера), а типографские кавычки вокруг `%1$s` в уже английском тексте → заменены на `"…"` и `[Activated Packages]`.
- Оставлены и внесены в `l10n/cjk_allowlist.txt` только: `《人工智能拟人化互动服务管理暂行办法》` (название НПА КНР внутри англ. юридического текста, `agreement_serious_content`), голоса MiMo (`speech_services_mimo_voice_id_placeholder`, `speech_services_mimo_voice_id_hint` — реальные значения параметра API), `graph_char_for_measurement` (`中` — образец символа для измерения шрифта).
- Статус: **на подтверждение архитектора** (п. «кавычки — если часть форматирования» из запуска читается двояко).
