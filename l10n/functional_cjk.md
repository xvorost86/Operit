# Функциональные CJK: не заменять ресурсами

Этот перечень фиксирует проверенные потребители, а не все совпадения сканера. Номера строк относятся к текущему рабочему дереву; перед дальнейшими правками повторно проверять вызовы.

- `core/tools/defaultTool/standard/StandardUITools.kt:64–132`: китайские имена приложений сопоставляются с Android package ID при разрешении имени приложения. Перевод ключей нарушит распознавание исходного ввода.
- `ui/features/workflow/viewmodel/WorkflowViewModel.kt:1041`: регулярное выражение голосового триггера распознаёт китайские команды открытия чата/плавающего окна; это условия совпадения, не подпись UI.
- `ui/floating/ui/pet/AvatarEmotionManager.kt:19–29`: списки ключевых слов определяют эмоцию по тексту ответа. Это словарь классификатора.
- `ui/floating/voice/SpeechInteractionManager.kt:220,238,247–272`: знак конца фразы и `leadingRegex` участвуют в сборке/удалении пунктуации распознанной речи; это обработка текста.
- `util/TtsSegmenter.kt:5,47,61`: `END_CHARS` определяет границы TTS-сегментов.
- `util/TextSegmenter.kt:15,54`: `PREWARM_TEXT` подаётся Jieba как текст прогрева сегментатора, не выводится пользователю.
- `data/converter/ChatFormatDetector.kt:142` и `data/converter/GenericJsonConverter.kt:203–205`: китайские роли распознаются во входных форматах и нормализуются к внутренним ролям.
- `api/voice/MimoVoiceProvider.kt:26–29`: китайские ID голосов передаются как `Voice.id` провайдеру; перевод изменит выбираемый голос. `:131` — текст управляющей инструкции TTS-провайдеру, не подпись интерфейса.
- `api/chat/enhance/ConversationService.kt:397–398`: китайские знаки кавычек и препинания участвуют в очистке и нормализации входного текста.
- `ui/features/token/preferences/UrlConfigManager.kt:104–106`: китайские названия вкладок — варианты входных значений для выбора локализованного ресурса, не текст самой вкладки.
- `ui/features/toolbox/screens/autoglm/AutoGlmViewModel.kt:205–207`: китайские шаблон даты и названия дней недели входят в текст команды/промпта для AutoGLM; не UI-метки календаря.
- `app/src/main/assets/bridge/spawn-helper.js:32700–32940`: собранный webpack-модуль Zod содержит каталоги ошибок `zhCN` и `zhTW` рядом с `en`, `ru` и другими локалями (`exports.locales`); китайские значения нужны для сообщений валидации при выборе соответствующей локали. Не править порождённый бандл ради удаления иероглифов; проверить выбор локали в исходном коде, если пользователь действительно получает эти сообщения на ru.

Не путать с иными исключениями: строки `@Preview` в `StreamMarkdownDemo.kt:223–238` не являются runtime UI; `LogModels.kt:20–27` пока не имеет подтверждённого UI-потребителя `displayName`; строки `AppLogger` и `Log.*` вне области P2 по D4. Эти места требуют повторной трассировки, если появится новый потребитель.

## Аудит покрытия P2 (дополнено по остатку сканера)

Проверено по потребителям при закрытии P2; номера строк — текущее рабочее дерево.

- `api/chat/enhance/ConversationMarkupManager.kt:19`: `TOOL_RESULT_TRUNCATION_SUFFIX` дописывается в XML результата инструмента. Это протокольная пометка для модели и содержимое tool-result, а не подпись UI; функция статическая, `Context` в цепочке `OrderedToolResults` нет — не переводить.
- `api/chat/llmprovider/StructuredToolCallBridge.kt:106–120`: синтетическое содержимое `tool_result` для восстановления протокола провайдера (модель видит его как результат инструмента). Модельный текст, не UI-метка; переводить не требуется.
- `ui/features/toolbox/screens/logcat/LogModels.kt:19–27`: `displayName` не читается ни в одном файле (`rg` по `displayName|LogLevel`), поэтому подписи уровней не показываются; данные enum оставлены.
- `ui/features/token/webview/JsScripts.kt:138,151,155`: объект `JsScripts` не referenced нигде в `app/src/main`, а `DeepseekJsInterface` не инстанцируется; это мёртвые диагностические строки внутри встроенного JS.
- `core/avatar/common/state/AvatarMoodType.kt:22–50`: `promptHint` — данные подсказок для промпта выбора эмоции, не подпись интерфейса.
- `data/preferences/WaifuPreferences.kt:51`: `DEFAULT_WAIFU_CUSTOM_PROMPT` — промпт по умолчанию для режима Waifu (D8: промпты не переводятся).
- `core/chat/AIMessageManager.kt:1168`: китайская ветка двуязычного промпта прогрева пакетов; для ru `useEnglish = true`, поэтому используется английская ветка выше.
- `core/tools/defaultTool/standard/StandardUITools.kt:545–555`: китайский формат даты и дни недели для промпта UI-автоматизации в zh-ветке; при `useEnglish` (ru/en) формат английский.
- `data/preferences/TagMarketBilingualData.kt`, `data/preferences/CharacterCardBilingualData.kt`: двуязычные наборы (`*Zh` и `*En`) готовых промптов/карточек; это данные-пресеты, а не UI-хром.
- `util/stream/StreamGroup.kt:166,169`: `context?.getString(...) ?: "…"` — литерал существует только в ветке `null`-контекста; ресурс уже переводится, литерал не является целью перевода.
- `app/src/main/assets/templates/**`: примеры проектов ToolPkg (Calculator, Node hello-world) — демонстрационный код, не runtime UI.
- `app/src/main/assets/js/AndroidUtils.js:463–510`: комментарии внутри встроенного JS-скрипта разбора Activity.
- `app/src/main/assets/templates/java/src/test/**`: `@DisplayName` тестовых примеров — демонстрационный код.

Слепые зоны сканера, выявленные аудитом: логи через обёртки (`StreamLogger.*`, `logDebug`, `logError`, `progressListener.onPluginLog`, `NativeBridge.log`, многострочные вызовы `AppLogger.*`) попадают в `literal`; комментарии внутри Kotlin raw-string со встроенным JS тоже классифицируются как `literal`; zh-аргументы `localizedText(...)` и блоки `METADATA` остаются `literal` по построению. Поэтому `literal` — верхняя граница, а не число непереведённых строк.
