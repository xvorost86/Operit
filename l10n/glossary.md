# Глоссарий Operit-ru (T0.4, черновик на утверждение архитектора)

Источник: `app/src/main/res/values-en/strings.xml` (7710 `<string>`, 0 `string-array`, 1 `plurals`) на коммите `dbf7191`.
Отбор: частотный анализ слов и биграмм (скрипт разбора запускался вне репозитория, чтобы не добавлять в него файлы сверх задачи), затем ручной отбор терминов и сверка каждого спорного термина с реальной строкой — в колонке «примечание» указан ключ `strings.xml`.
Счётчик терминов: **148** строк в таблицах разделов 4.1–4.6.

Статус: черновик. Утверждает архитектор; до утверждения T1.3 (перевод values-en → values-ru) не начинается.

---

## 1. Как пользоваться

1. Перед переводом чанка найди термин в разделе 4. Если термина нет — смотри раздел 5 («не переводить»), затем стиль (раздел 2).
2. Термин из раздела 4 переводится **одинаково во всех строках**. Синонимы в скобках примечания — не альтернатива на выбор, а запрещённые варианты («не …»).
3. Сомневаешься — не переводи, оставь en и запиши `файл:строка` + причину в `l10n/questions.md` (правило 3 исполнителя).
4. Глоссарий — живой документ: новый термин добавляется вместе с ключом-примером и попадает в тот же коммит, что и чанк, где он впервые встретился.

---

## 2. Стиль

### 2.1 Обращение

- Только **«вы»**, всегда строчными, в том числе в середине предложения: «Выберите модель, которую вы хотите использовать» — нет; «Выберите модель» — да. «Вы» с заглавной не используется нигде.
- «ты», «тебя», «твой» — запрещены.
- Пол пользователя не угадываем: безличные и инфинитивные конструкции вместо причастий («Не удалось сохранить», а не «Вы не сохранили» / «Сохранено вами»).
- Притяжательное «ваш» — допустимо, но не в каждой строке: `settings_user_preferences` «User Profile Settings» → «Настройки профиля пользователя», не «вашего профиля».

### 2.2 Кнопки, пункты меню, переключатели

- Глагол действия в кнопке — **инфинитив** с заглавной буквы, без точки: «Сохранить», «Отмена», «Удалить», «Создать», «Импортировать».
- Не «Сохраняем», не «Сохранение» (это существительное для заголовков), не «Нажмите, чтобы сохранить».
- Меню и пункты списка — существительное с заглавной: «Настройки», «История», «Инструментарий».
- Переключатели: подпись — существительное/состояние («Потоковый вывод»), не глагол. Строки вида «Enable X» → «Включить X».
- Образец: `config_save_button` «Confirm and Save» → «Подтвердить и сохранить»; `floating_cancel` «Cancel» → «Отмена».

### 2.3 Заголовки и регистр

- Sentence case, как в en: с заглавной только первое слово и имена собственные. «Настройки истории чата», а не «Настройки Истории Чата».
- Названия экранов не заканчиваются точкой и не заканчиваются многоточием.
- `nav_settings` «Settings» → «Настройки»; `chat_history_settings` «Chat History Settings» → «Настройки истории чата».

### 2.4 Кавычки

- Основные — «ёлочки»: `backup_location` «Backup files are saved in the ...Download/Operit... folder» → «Резервные копии сохраняются в папку «Download/Operit»».
- Вложенные — „лапки“: «Пункт «Маркет» → раздел „Плагины“». Внутри XML-значения кавычки пишем сырыми символами «», без экранирования обратным слэшем.
- Прямые `"` в переводе не используются вообще (кроме случаев, когда они часть синтаксиса в примере кода/JSON — такие строки берём в `<xliff:g>`-подобную защиту или оставляем как есть и помечаем в `l10n/questions.md`).
- Плейсхолдеры и HTML-теги (`<b>`, `<a href>`) остаются байт-в-байт.

### 2.5 Многоточие и пунктуация

- Многоточие — один символ **«…»**, не три точки. В values-en три точки стоят в 225 строках — все они при переводе получают «…».
- «…» ставится в статусах и подсказках полей, но **не** в кнопках.
- Статусы вида «X-ing…» переводятся отглагольным существительным: `floating_thinking` «Thinking...» → «Размышление…», «Processing...» → «Обработка…», «Loading...» → «Загрузка…», «Saving...» → «Сохранение…». Не «Думаю…», не «Загружается…».
- Тире в предложении — длинное «—» с пробелами; дефис `-` только внутри слов и составных названий.
- Восклицательных знаков не добавляем: если в en их нет, в ru их нет тоже.
- Сокращения с точкой («т. д.», «т. п.», «напр.») — только при реальной нехватке места; иначе полная форма.

### 2.6 Латиница внутри русского текста

- Непереводимый термин + русское слово: дефис, если термин работает как определение: «API-токен», «MCP-сервер», «TTS-служба», «root-права» (когда без «права root»). Если термин — подлежащее/дополнение, обычный пробел: «Сервер MCP», «Токен DeepSeek».
- Склонять латинские аббревиатуры нельзя: «в MCP», а не «в MCPе».
- Названия провайдеров и моделей (`provider_ollama` «Ollama (Local Model)») — латиницей, пояснение в скобках по-русски: «Ollama (локальная модель)».

### 2.7 Шаблонные фразы ошибок и подсказок

Эти конструкции встречаются сотнями строк (в values-en: `Failed to …` — 455 вхождений слова failed, `Cannot …` — 171, `Please …` — 264). Переводим по шаблону, а не дословно.

| en | ru | Пример ключа |
|---|---|---|
| Failed to X | Не удалось X | `theme_save_failed` «Failed to save theme» → «Не удалось сохранить тему»; `theme_image_crop_failed` «Failed to crop image: %1$s» → «Не удалось обрезать изображение: %1$s» |
| X failed | Не удалось X / Сбой X | `mcp_uninstall_failed` «Uninstall failed» → «Не удалось удалить» |
| Cannot X | Не удалось X / Невозможно X | `cannot_connect_to_server` «Cannot connect to server» → «Не удалось подключиться к серверу»; `floating_cannot_get_focus` «Cannot get focus» → «Не удалось получить фокус» |
| X cannot be empty | Поле X не может быть пустым | `avatar_custom_type_prompt_hint_required` «Prompt hint cannot be empty» → «Подсказка промпта не может быть пустой» |
| Please enter X | Введите X | `enter_age` «Please enter birth year» → «Введите год рождения» |
| Please select X | Выберите X | `please_select_model` «Please select a model» → «Выберите модель» |
| Please wait | Подождите | `agreement_wait` «Please wait... (%1$d)» → «Подождите… (%1$d)» |
| Please try again later | Повторите попытку позже | `one_click_config_failed` «Failed to get configuration, please try again later» → «Не удалось получить конфигурацию. Повторите попытку позже» |
| Note: … | Примечание: … | `workflow_speech_trigger_help` «Note: Speech trigger matches …» → «Примечание: триггер речи сверяет …» |
| X is not running | X не запущен | `plugin_termux_not_running` «Terminal service is not running, cannot start plugins» → «Служба терминала не запущена, невозможно запустить плагины» |

- Слово «пожалуйста» в переводе не появляется, если en-строка — стандартная подсказка ввода. Исключение: строка, где «please» несёт эмоцию/извинение, — тогда «Пожалуйста, …» (решение фиксируется в `l10n/questions.md`).
- Две фразы в одной строке разделяем точкой, а не запятой, если в en стоит запятая между независимыми утверждениями.

### 2.8 Числа словами и склонение

- Счётные конструкции — через плейсхолдер с числом, склонение — средствами `plurals`. В ru нужны формы `one` / `few` / `many` / `other`; в values-en сейчас один `plurals` (`chat_delete_selected_messages_confirm`, формы `one`,`other`). `check_locale.py` для лишних quantity даёт WARN — для ru это ожидаемо, не ошибка.
- Без числа — множественное число родительного падежа: «Выбрано сообщений: %1$d».
- Дробные числа — с запятой (1,5), но только в статическом тексте; значения, приходящие из `%1$s`, форматирует приложение, в ресурсе их не трогаем.

---

## 3. Числа и единицы

| Что | Правило | Пример |
|---|---|---|
| Плейсхолдеры | `%s %d %1$s %.2f %%` не меняются; порядок позиционных можно менять только если это не ломает смысл, неиндексированные `%s` — порядок сохранять | `tag_count_locked_status` «Selected %1$d / Limit %2$d» → «Выбрано %1$d / лимит %2$d» |
| Проценты | знак `%` отбивается пробелом от числа: `%1$d%%` → `%1$d %%` (плейсхолдер не изменён) | `mnn_download_progress` «Progress: %1$d%%» → «Прогресс: %1$d %%» |
| Двоеточие после метки | сохраняем en-пунктуацию метки, если она часть формата | `about_version` «Version: %1$s» → «Версия: %1$s» |
| Объём данных | MB → МБ, GB → ГБ, KB → КБ, TB → ТБ; между числом и единицей — пробел | `theme_video_too_large` «…select videos less than 30MB.» → «…выберите видео меньше 30 МБ.»; `anr_max_memory` «Max Memory: %1$dMB» → «Максимум памяти: %1$d МБ» |
| Время | ms → мс, s → с, min → мин, h → ч; пробел между числом и единицей | `toolreg_sleep_desc` «Sleep %1$d ms» → «Пауза %1$d мс» |
| Шаг/задержка | «interval», «delay» → «интервал», «задержка» (не «дилей») | `waifu_merge_send_delay` «Merge Send Interval» → «Интервал объединённой отправки» |
| Валюта | CNY / ¥ / RMB: в метках — латиницей `CNY` (из плейсхолдера `%1$s`), в прозе — «в юанях» | `settings_price_per_request` «Price Per Request (CNY)» → «Цена за запрос (CNY)»; «Set the RMB price per API request» → «Задайте цену за запрос API в юанях» |
| Цена за токены | «per million tokens» → «за миллион токенов», не «за 1M токенов» | `settings_input_price_per_million` «Input Price (per million tokens)» → «Цена ввода (за миллион токенов)» |
| Версии и имена файлов | не переводятся и не форматируются: `1.12.2`, `SKILL.md`, `.toolpkg`, `Android/data/package/files` | `package_js_only` «(.js) and ToolPkg (.toolpkg)» → «(.js) и ToolPkg (.toolpkg)» |
| Дроби и диапазоны | десятичная запятая; диапазон — среднее тире без пробелов | `settings_summary_threshold_subtitle` «(0.1-0.95)» → «(0,1–0,95)» |
| Разряды | разделитель разрядов не вставляем: число приходит из `%d`/`%1$s` уже отформатированным приложением | `tag_count_locked_status` «Selected %1$d / Limit %2$d» → «Выбрано %1$d / лимит %2$d» (без «1 000») |
| Неразрывный пробел | не используем (риск с поиском и раскладкой); только обычный пробел | — |
| Единицы, которых нет в en | не добавляем | — |

---

## 4. Термины

### 4.1 ИИ, модели, контекст

| термин en | перевод ru | примечание |
|---|---|---|
| Agent | агент | `external_http_chat_a2a_title` «A2A Agent Interface» → «Интерфейс агента A2A». Не «ИИ-агент» в коротких метках |
| Assistant | ассистент | `nav_assistant_config` → «Настройки ассистента»; `config_title` «Operit AI Assistant» → «Ассистент Operit AI» |
| AI Chat | ИИ-чат | `nav_ai_chat`; «ИИ» капсом, дефис обязателен |
| Chat | чат | `url_tab_chat` → «Чат» |
| Conversation | беседа | `settings_enable_summary` «Enable Conversation Summary» → «Включить сводку беседы». Не «разговор» |
| Message | сообщение | `copy_message` → «Копировать сообщение» |
| Prompt | промпт | `function_prompt` «Function Prompt» → «Промпт функции». Не «запрос», не «подсказка» |
| System Prompt | системный промпт | `select_prompt_config` → «Выбрать конфигурацию системного промпта» |
| Prompt Hint | подсказка промпта | `avatar_custom_type_prompt_hint_label`; «Hint» в полях ввода — «подсказка» |
| Model | модель | `model` → «Модель» |
| Model Configuration | конфигурация модели | `model_selector_title` «Select Model Configuration» → «Выбрать конфигурацию модели». Это сохранённый набор параметров, не сама модель — «модель» здесь ошибка |
| Provider | провайдер | `accessibility_wizard_install_provider` → «Установить приложение-провайдер» |
| Context | контекст | `context_window` «Context: %1$s» → «Контекст: %1$s» |
| Summary | сводка | `insert_summary` → «Вставить сводку». Не «резюме», не «итог» |
| Token | токен | `token_config_title` «DeepSeek Token Configuration» → «Конфигурация токена DeepSeek»; `token_info_title` «Get DeepSeek API Token» → «Получить API-токен DeepSeek» |
| Reasoning | рассуждения | `enable_deepseek_reasoning` → «Включить режим рассуждений DeepSeek» |
| Stream Output | потоковый вывод | `disable_stream_output` → «Отключить потоковый вывод» |
| Tool Call | вызов инструмента | `test_item_toolcall` «Tool Call» → «Вызов инструмента» |
| Temperature | температура | `temperature_name`; не «температура сэмплирования» в метке |
| Embedding | эмбеддинг | `memory_embedding_cloud_title` → «Облачная модель эмбеддингов». Не «встраивание» |
| Vector Weight | вес векторного поиска | `memory_search_vector_weight`; «Vector» в одиночку — «вектор» |
| Realtime | Realtime | `speech_services_tts_type_openai_ws` «OpenAI Realtime (WebSocket)» — название протокола, не переводим; в прозе — «в реальном времени» |
| Plan Mode | режим плана | `ai_message_plan_mode_indicator` «[Plan Mode]» → «[Режим плана]» |

### 4.2 Персонажи, память, оформление чата

| термин en | перевод ru | примечание |
|---|---|---|
| Character | персонаж | `reset_default_character` → «Сбросить персонажа по умолчанию» |
| Character Card | карточка персонажа | `character_card_change_title` «Character Card Updated» → «Карточка персонажа обновлена» |
| Persona | персона | `persona_card_generation` «Persona Card Generation» → «Генерация карточки персоны». Persona ≠ Character: не «персонаж» |
| Persona Card | карточка персоны | `select_persona_config` «Select AI Assistant Persona Card Configuration» → «Выбрать конфигурацию карточки персоны ассистента» |
| Opening Statement | вступительная фраза | `character_card_translate_opening_statement` → «Перевести вступительную фразу» |
| Avatar | аватар | `avatar_config` → «Настройка аватара» |
| Group | группа | `manage_group` → «Управление группами» |
| Role | роль | `show_role_name` «Show Role Card Name» → «Показывать имя в карточке роли» |
| Profile | профиль | `settings_user_preferences` «User Profile Settings» → «Настройки профиля пользователя» |
| Memory | память | `modify_memory` → «Изменить память». Для ОЗУ — «использование памяти»: `pkg_runtime_monitor_memory_title` «Memory Usage». Никогда «мемори» |
| Long-term memory | долговременная память | `memory_auto_update_active` «Long-term memory autosave enabled» → «Автосохранение долговременной памяти включено» |
| Memory autosave | автосохранение памяти | `memory_auto_update_active` |
| Keyword | ключевое слово | `memory_search_keyword_weight` «Keyword Weight» → «Вес ключевых слов» |
| Tag | тег | `tag_must_be_set` → «Тег должен быть задан» |
| Weight | вес | `memory_weight` → «Вес» |
| Bubble | пузырь | `chat_style_bubble` «Bubble» → «Пузырь»; `chat_style_bubble_text_style_title` → «Стиль текста в пузыре» |
| Waifu Mode | режим вайфу | `waifu_mode` → «Режим вайфу»; «вайфу» строчными |
| Desktop Pet | питомец на рабочем столе | `desktop_pet_start` → «Запустить питомца на рабочем столе» |
| Floating Chat Window | плавающее окно чата | `floating_chat_window` |

### 4.3 Инструменты, плагины, пакеты, разрешения

| термин en | перевод ru | примечание |
|---|---|---|
| Tool | инструмент | `workflow_tool_name_label` «Tool name» → «Название инструмента»; `nav_tool_permissions` → «Разрешения для инструментов» |
| Tool Execution | выполнение инструмента | `tool_result` «Tool Execution Result» → «Результат выполнения инструмента» |
| Toolbox | инструментарий | `nav_toolbox`, `toolbox` → «Инструментарий». Не «ящик инструментов», не «тулбокс» |
| Package | пакет | `package_manager` → «Менеджер пакетов»; `import_package` → «Импортировать пакет» |
| Plugin | плагин | `plugin_loading_status_title` → «Состояние загрузки плагина» |
| Plugin Market | маркет плагинов | `market_agreement_title` «Plugin Market Agreement and Community Rules» → «Соглашение и правила сообщества маркета плагинов» |
| Market | маркет | `market_tab_artifact`, `publish_mcp_plugins_to_market` → «Опубликовать плагины MCP в маркете» |
| Publish | опубликовать | `publish_new_plugin` → «Опубликовать новый плагин» |
| Repository | репозиторий | `attach_local_storage_repo` «Attach Local Storage Repository» → «Подключить локальный репозиторий» |
| Skills / Skill | Skills / Skill (латиницей) | `skillmgr_no_skills_found` «No Skills found. Please place Skill folders in: %1$s, and ensure they contain SKILL.md.» → «Skills не найдены. Поместите папки Skill в: %1$s и убедитесь, что в них есть SKILL.md.» Согласование — по смыслу («Skills не найдены»), падеж латинского слова не меняется |
| Sandbox | песочница | `market_tab_artifact` «Sandbox Packages» → «Пакеты песочницы» |
| Permission | разрешение | `tool_permissions` → «Разрешения для инструментов». «Права» — только для root и отладки |
| Permission Level | уровень доступа | `permission_guide_permission_level` «Permission Level» → «Уровень доступа»; `permission_guide_level_desc` — «Выберите предпочитаемый уровень доступа…» |
| Root Permissions | права root | `permission_guide_root_title`; root — строчными латиницей, не «рут», не «Root-права» |
| Accessibility | специальные возможности | `accessibility_permission` → «Разрешение специальных возможностей»; Accessibility Service → «служба специальных возможностей» |
| Overlay Permission | разрешение на наложение поверх других окон | `overlay_permission_required` → «Требуется разрешение на наложение поверх других окон» |
| Debug Permission | право отладки | `permission_level_debugger`; Debugger → «отладчик»: `screen_title_ui_debugger` «UI Debugger» → «Отладчик интерфейса» |
| Floating Window | плавающее окно | `enable_floating_mode` «Enable Floating Window» → «Включить плавающее окно» |
| Terminal | терминал | `nav_terminal`, `terminal` → «Терминал» |
| Session | сеанс | `terminal_session` «Session %d» → «Сеанс %d». Не «сессия» |
| Shell | оболочка | `execute_shell` «Execute Shell Command» → «Выполнить команду оболочки» |
| Script | скрипт | `run_script` → «Запустить скрипт» |
| Command | команда | `termux_result` «Command Result» → «Результат команды» |
| Phantom Process | фантомный процесс | `process_limit_title` «Phantom Process Limit Remover» → «Удаление ограничения фантомных процессов» |
| Battery Optimization | оптимизация батареи | `permission_guide_battery_title` «Battery Optimization Exemption» → «Исключение из оптимизации батареи» |

### 4.4 Воркфлоу

| термин en | перевод ru | примечание |
|---|---|---|
| Workflow | воркфлоу | `nav_workflow`; несклоняемое, строчными. Не «рабочий процесс» (см. раздел 6) |
| Node | узел | `workflow_action_add_node` «Add Node» → «Добавить узел»; `workflow_execution_log_node_title` «Node logs: %1$s» → «Журнал узла: %1$s» |
| Condition | условие | `workflow_node_label_condition` «Condition» → «Условие» |
| Branch | ветка | `branch` → «Ветка»; `workflow_template_condition_desc` «Branch follow-up» → «Переход по ветке» |
| Connection | связь | `workflow_create_connection` «Create Connection» → «Создать связь». В сетевом смысле — «соединение» (см. 4.5) |
| Trigger | триггер | Как сущность — «триггер»: `workflow_trigger_type_speech` «Speech» → «Речь». Как действие `workflow_trigger` «Trigger Execution» → «Запустить выполнение» |
| Execution | выполнение | `workflow_execution_result_title` «Execution Result» → «Результат выполнения» |
| Schedule | расписание | `workflow_schedule_dialog_title`; `workflow_schedule_type_label` «Schedule type» → «Тип расписания» |
| Preset | предустановка | `shell_executor_show_presets` «Show Preset Commands» → «Показать предустановленные команды» |
| Template | шаблон | `workflow_create_from_template` → «Создать из шаблона» |
| Variable | переменная | `mcp_var_name` «Variable Name» → «Имя переменной» |
| Parameter | параметр | `workflow_tool_params_title` «Tool parameters» → «Параметры инструмента» |
| Custom | свой | `workflow_connection_condition_custom` «Custom (regex/text)» → «Свой (regex/текст)»; `avatar_custom_types_title` «Custom Types» → «Свои типы» |
| Default | по умолчанию | `workflow_default_value_label` «Default value» → «Значение по умолчанию» |
| Task | задача | `autoglm_task_complete` «✅ Task completed: %1$s» → «✅ Задача выполнена: %1$s» |
| Subtask | подзадача | «Executing subtasks...» → «Выполнение подзадач…» |
| Execution Plan | план выполнения | `plan_execution_graph` «Execution Plan» → «План выполнения» |

### 4.5 Настройки, данные, система, файлы

| термин en | перевод ru | примечание |
|---|---|---|
| Settings | настройки | `nav_settings` → «Настройки» |
| Configuration | конфигурация | `function_config_title` «Function Configuration» → «Конфигурация функции». Не «настройка» — «настройки» занято разделом Settings |
| Version | версия | `about_version` «Version: %1$s» → «Версия: %1$s» |
| Update | обновить / обновление | Кнопка — «Обновить»: `shizuku_wizard_update` → «Обновить Shizuku»; процесс — «обновление»; `update_log` «Update Log» → «Журнал обновлений» |
| Install | установить / установка | `install_termux_title` → «Установить Termux»; `local_installation` → «Локальная установка» |
| Uninstall | удалить | `uninstall` → «Удалить»; `mcp_uninstall_failed` → «Не удалось удалить» |
| Download | скачать / загрузка | `download_old_editor` → «Скачать старый редактор»; прогресс — «Загрузка…» |
| Import | импортировать | `import_package` → «Импортировать пакет» |
| Export | экспортировать | `export_chat_history` → «Экспортировать историю чата»; `export_success` → «Экспорт выполнен» |
| Backup | резервная копия | `settings_manage_backup` «Manage Backup» → «Управление резервными копиями»; `settings_data_backup` → «Резервное копирование и восстановление данных» |
| Restore | восстановить | `restore_default_prompts` → «Восстановить промпты по умолчанию» |
| Snapshot | снимок | `backup_raw_snapshot_title` «File Snapshot Backup (Experimental)» → «Резервная копия файлового снимка (экспериментально)» |
| Rollback | откат | `rollback_to_here` → «Откатить до этого места»; `chat_rollback_failed` → «Не удалось выполнить откат: %1$s» |
| History | история | `url_tab_history` → «История»; `chat_history_manager` → «Управление историей чата» |
| Theme | тема | `theme_title_mode` «Theme Mode» → «Режим темы»; `theme_follow_system` → «Следовать системной теме» |
| Language | язык | `language_settings` → «Настройки языка»; `change_language` → «Сменить язык» |
| Notification | уведомление | `floating_notification` → «Уведомление» |
| Notice | предупреждение | `backup_model_config_warning_title` «Security Notice» → «Предупреждение о безопасности»; `package_market_origin_title` «External Package Source Notice» → «Предупреждение об источнике внешних пакетов» |
| Warning | предупреждение | `logcat_warning` → «Предупреждение»; `accessibility_risk_warning_title` → «Предупреждение о рисках специальных возможностей» |
| Error | ошибка | `error_title`; `floating_error` «Error: %1$s» → «Ошибка: %1$s» |
| Limit | лимит | `free_usage_depleted` «Limit Reached» → «Лимит исчерпан»; `tag_count_locked_status` → «Выбрано %1$d / лимит %2$d» |
| Threshold | порог | `settings_summary_threshold` «Summary Token Threshold» → «Порог токенов для сводки» |
| Billing Mode | режим оплаты | `settings_billing_mode`; `settings_billing_mode_token` «Token-based Billing» → «Оплата по токенам»; Per-request Billing → «Оплата за запрос» |
| Price | цена | `settings_price_per_request_with_currency` «Price per Request (%1$s)» → «Цена за запрос (%1$s)» |
| Network | сеть | `network_status` «Network Status: %1$s» → «Состояние сети: %1$s»; `network_unavailable` → «Сеть недоступна. Проверьте настройки сети» |
| Connection (network) | соединение | `connection_timeout` «Server connection timeout…» → «Тайм-аут соединения с сервером…»; `connection_refused` → «Сервер отклонил соединение. Повторите попытку позже» |
| Server | сервер | `mcp_server` → «Сервер MCP» |
| Endpoint | эндпоинт | `api_endpoint` «API Endpoint» → «Эндпоинт API» (см. раздел 6) |
| Cache | кэш | `token_stats_cache_rate` «Cache rate» → «Доля попаданий в кэш» |
| Database | база данных | `data_recovery_database_details` → «Сведения о базе данных» |
| File | файл | `search_files` «Search Files» → «Поиск файлов» |
| Folder | папка | `new_folder` → «Новая папка»; `file_manager_create_folder` → «Создать папку» |
| Directory | каталог | `skillmgr_detail_directory`, `create_test_dir` «Create Test Directory» → «Создать тестовый каталог» |
| Path | путь | `copy_path` → «Копировать путь»; `external_packages_path` → «Путь к внешнему хранилищу пакетов» |
| Archive | архив | `file_type_archive` → «Архив»; как действие (compress) — «упаковать» |
| Screen Content | содержимое экрана | `floating_screen_content`, `screen_content` |
| Screenshot | снимок экрана | `screen_ocr_capture_failed` «Screenshot capture failed» → «Не удалось сделать снимок экрана» |
| Attachment | вложение | `add_attachment` → «Добавить вложение» |
| Voice | голос | `floating_voice_call` «Voice Call» → «Голосовой вызов» |
| Voice Wake-up | голосовая активация | `voice_wakeup_section_title`; `voice_wakeup_phrase_label` «Wake phrase» → «Фраза активации» |
| Speech Recognition | распознавание речи | `speech_recognition_demo` → «Демонстрация распознавания речи» |
| User Agreement | пользовательское соглашение | `nav_item_agreement`; `agreement_title` «User Agreement and Privacy Policy» → «Пользовательское соглашение и политика конфиденциальности» |
| Privacy Policy | политика конфиденциальности | `settings_privacy_data_cleanup` «Privacy and Data Cleanup» → «Конфиденциальность и очистка данных» |

### 4.6 Действия и кнопки

| термин en | перевод ru | примечание |
|---|---|---|
| Save | Сохранить | `voice_wakeup_personal_config_save` → «Сохранить» |
| Cancel | Отмена | `floating_cancel` → «Отмена»; `floating_cancel_recording` → «Отменить запись» |
| Confirm | Подтвердить | `confirm_delete` «Confirm Delete» → «Подтвердить удаление» |
| Delete | Удалить | `workflow_delete` → «Удалить воркфлоу»; `workflow_confirm_delete_title` «Confirm deletion» → «Подтвердите удаление» |
| Remove | Убрать | `remove_attachment` → «Убрать вложение»; `process_limit_action_remove` → «Убрать ограничение». Отличие от Delete обязательно сохраняем |
| Edit | Изменить | `floating_edit` → «Изменить»; `edit_script` → «Изменить скрипт». Не «Редактировать» |
| Add | Добавить | `add_attachment` → «Добавить вложение» |
| Create | Создать | `workflow_create` → «Создать воркфлоу» |
| Clear | Очистить | `clear_chat_history` «Clear All Chat History» → «Очистить всю историю чата» |
| Reset | Сбросить | `theme_reset` «Reset to Default Theme» → «Сбросить тему по умолчанию» |
| Copy | Копировать | `copy_message` → «Копировать сообщение»; `copy_plain_text` → «Копировать как текст» |
| Search | Поиск | `search` → «Поиск» (кнопка/поле). В связном тексте — «найти», «поискать» |
| Select | Выбрать | `model_selector_title`; `floating_ocr_select` «Select to Recognize» → «Выбрать для распознавания» |
| Enable | Включить | `workflow_enabled_label` «Enable workflow» → «Включить воркфлоу»; состояние — «включено» |
| Disable | Отключить | `disable_stream_output` → «Отключить потоковый вывод»; состояние — «отключено»: `plugin_disabled_suffix` « (Plugin disabled)» → « (плагин отключён)» |
| Filter | Фильтр | `logcat_filter` → «Фильтр»; `filter_chat_history` → «Фильтр истории чата» |
| Sort by | Сортировать по | `file_manager_sort_by`; `file_manager_sort` → «Сортировка» |
| Record | Записать | `voice_wakeup_personal_config_record` → «Записать»; существительное — «запись» |
| Translate | Перевести | `character_card_translate_opening_statement` → «Перевести вступительную фразу» |
| Loading | Загрузка | `loading...` → «Загрузка…» |
| Retry | Повторить | «retrying (%2$d)» → «повторная попытка (%2$d)» |

---

## 5. Не переводить

Латиницей, байт-в-байт, без транслитерации и без склонения. В скобках — число вхождений в `values-en/strings.xml` (сверено скриптом).

| Термин | Вхождений | Пример ключа |
|---|---|---|
| Operit / Operit AI | 62 | `app_name` «Operit AI»; `backup_location` «...Download/Operit... folder» |
| MCP | 74 | `mcp` «MCP»; `plugin_starting_server` «Starting MCP server...» → «Запуск сервера MCP…» |
| ToolPkg | 13 | `package_js_only` «Only JavaScript (.js) and ToolPkg (.toolpkg) files are supported» |
| Skill / Skills / SKILL.md | 52 / 15 | `skillmgr_no_skills_found` |
| Shizuku | 48 | `shizuku_status` «Shizuku Status» → «Состояние Shizuku» |
| Termux | 56 | `install_termux_title` «Install Termux» |
| API | 112 | `api_endpoint`; `token_config` «Get API Key» → «Получить ключ API» (Key → «ключ») |
| A2A | 3 | `external_http_chat_a2a_title` |
| GitHub | 55 | `star_on_github` «Star on GitHub» → «Поставить звезду на GitHub» |
| Gemini | 4 | `provider_google` «Google (Gemini Series)»; `provider_gemini_generic` «Gemini (Generic)» |
| OpenAI | 35 | `speech_services_tts_type_openai` «OpenAI Voice (HTTP)» |
| Anthropic | 3 | `provider_anthropic` «Anthropic (Claude Series)» |
| DeepSeek | 13 | `token_config_title` «DeepSeek Token Configuration» |
| Ollama | 1 | `provider_ollama` |
| JSON | 38 | `workflow_json_path_label` «JSON path» → «Путь JSON» |
| OCR | 5 | `screen_ocr_select` «Select OCR» → «Выбрать OCR» |
| TTS | 104 | `speech_services_tts_type_vits` «VITS/Piper TTS (Local)» |
| STT | 25 | `workflow_speech_trigger_help` «…background STT (speech-to-text) output…» |
| VITS / Piper / Sherpa-ncnn / Whisper | 44 / 44 / — / 1 | `speech_recognition_instructions` «Android Native/Sherpa-ncnn/Whisper Offline» |
| WebSocket | 7 | `speech_services_openai_ws_url` «Realtime WebSocket URL» |
| Markdown | 18 | `copy_markdown_source` «Copy Markdown source» → «Копировать исходник Markdown» |
| QuickJS / FFmpeg / JVM | 2 / 10 / 1 | `ffmpeg_command` «FFmpeg Command»; `pkg_runtime_monitor_note` «…QuickJS instance…» |
| Android / Android/data | 40 | `android_version` «Android Version: %1$s (API %2$d)» |
| root | 47 (в т.ч. в тексте соглашения) | `permission_guide_root_title` «Root Permissions» → «Права root» |
| WebDAV, SSH | 0 в values-en | Правило на будущее: не переводить, транслитерации нет |
| regex | (в custom-условиях) | `workflow_connection_condition_custom` «Custom (regex/text)» → «Свой (regex/текст)» |
| ID, URL, HTTP / HTTPS | 31 / 57 / 46 | `skillmgr_direct_skill_id` «Skill ID» → «ID Skill» |
| CNY / ¥ | 7 (price) | `settings_price_per_request` «Price Per Request (CNY)» |
| Имена моделей (`gpt-4`, `claude-3-opus-20240229`) | — | примеры в подсказках полей остаются в исходном виде |

Не переводим также: пути и имена файлов (`data:audio/mpeg;base64,…`, `.toolpkg`, `.js`), названия каталогов (`Download/Operit`, `shared_prefs`, `datastore`, `databases`), команды и фрагменты кода внутри строк-примеров.

---

## 6. Спорные места — нужно решение архитектора

| # | Вопрос | Предложение исполнителя | Альтернатива |
|---|---|---|---|
| 1 | Workflow | «воркфлоу» (нескл.) | «рабочий процесс» — длинно для nav и кнопок; «сценарий» — смешивается с Character |
| 2 | Skills оставляем латиницей | да, по ТЗ T0.4 | «навыки» — привычнее, но расходится с папками `Skill/` в файловой системе |
| 3 | Toolbox | «инструментарий» | «инструменты» — но тогда путается с Tool |
| 4 | Sandbox | «песочница» | «Sandbox Packages» → «Пакеты в песочнице» |
| 5 | Endpoint | «эндпоинт» | «конечная точка» — точно, но непривычно для русских админов |
| 6 | Waifu Mode | «режим вайфу» | «Waifu Mode» без перевода — тогда строка наполовину английская |
| 7 | Conversation | «беседа» | «диалог» — но в чате уже есть «чат» |
| 8 | Session | «сеанс» | «сессия» — разговорнее, но в остальном тексте «сеанс» |
| 9 | Notice | «предупреждение» | «уведомление» — но Notification уже «уведомление» |
| 10 | Пробел перед `%` | добавляем (`%1$d %%`) | без пробела (`%1$d%%`) — как в en, короче в узких метриках |
| 11 | Edit | «Изменить» | «Редактировать» — длиннее на 4 символа |

До утверждения этих 11 пунктов перевод соответствующих строк не начинается (T1.3 ждёт).

---

## 7. Проверка и пополнение

- Автоматической проверки терминологии нет: `tools/l10n/check_locale.py` сверяет только наборы ключей и плейсхолдеры. Терминология проверяется глазами при приёмке чанка, спорные места — по этому файлу.
- Пополнение: строка `| термин en | перевод ru | примечание с ключом-примером |` в нужный подраздел 4.x; при смене термина — правка всех уже переведённых чанков отдельной задачей, а не «на ходу».
