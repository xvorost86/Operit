/* METADATA
{
  name: "operit_editor"
  display_name: {
    zh: "Operit平台编辑器"
    en: "Operit Platform Editor"
    ru: "Редактор платформы Operit"
  }
  description: {
    zh: '''Operit 平台配置直改工具包：提供一组可直接读取与修改 Operit 平台设置的工具，覆盖 MCP、Skill、Sandbox Package、角色卡、功能模型绑定、模型参数、上下文总结与 TTS/STT 语音服务配置。'''
    en: '''Direct Operit platform configuration toolkit: a collection of tools for reading and directly modifying Operit platform settings, covering MCP, Skill, Sandbox Package, character cards, function-model bindings, model parameters, context-summary settings, and TTS/STT speech-service configuration.'''
    ru: '''Инструментарий прямого изменения конфигурации платформы Operit: набор инструментов для чтения и непосредственного изменения настроек платформы Operit, охватывающий MCP, Skill, Sandbox Package, карточки персонажей, привязки функциональных моделей, параметры моделей, настройки сводки контекста и конфигурацию голосовых служб TTS/STT.'''
  }

  enabledByDefault: true

  "category": "Chat",
  tools: [
    {
      name: "operit_editor"
      description: {
        zh: '''配置排查手册。

【触发条件】
- 用户提到 MCP/Skill 安装失败、无法启动、工具不出现、导入失败、重名冲突、配置文件怎么改
- 用户提到沙盒包（Package）开关、内置包列表、导入删除路径、包启用状态异常
- 用户让你排查 Operit 的插件配置路径、部署目录、开关状态、环境变量
- 用户提到功能模型绑定、模型配置新增/删除/修改、模型连接测试
- 用户提到角色卡的新增、编辑、删除、激活、酒馆 JSON 导入或导出
- 用户提到 TTS/STT 语音服务不会配置、参数太多不会填、语音播报/语音识别不可用
- 问题核心是“配置和部署链路”，而不是普通问答

【MCP：安装与排查】
1) 配置目录：/sdcard/Download/Operit/mcp_plugins/
- 主配置：mcp_config.json
- 运行状态缓存：server_status.json（非实时快照，仅用于状态记录与工具缓存，不作为排查判定依据）
2) 两侧路径要严格区分：
- Android 侧是源目录（用户导入/存放目录），不是最终运行目录
- Linux 侧是最终运行目录：~/mcp_plugins/<pluginId最后一段>
- MCP 真正启动时，执行目录与命令都以 Linux 侧为准
3) 本地部署实际行为（代码逻辑）：
- 创建目标目录
- 将 Android 侧插件目录复制到 Linux 侧目录
- 执行自动分析出的安装/构建命令（会跳过启动命令）
3.1) 本地插件识别规则：
- 这样识别是为兼容存储位置外层套目录的情况（如 `<pluginId>/<repo>-main/...`）；Android 侧目录内至少要命中一个标志文件：`README.md`、`package.json`、`mcp.config.json`、`main.js`、`main.py`、`index.js`、`index.py`，否则可能被判定为未安装，进不了启动列表。
4) 命令型插件判定：
- 对于 command 为 npx/uvx/uv 的命令型插件，系统按“已部署”处理，仅做最小目录准备。
- 配置 Node 类命令型 MCP 时，mcp_config.json 里仍应按上游常见写法填写 `command: "npx"`；不要自行改写成 `pnpm` 或 `npm`。
- 软件内部启动这类 `npx` MCP 时，会自动把 `npx` 改写为 `pnpm dlx` 执行，并去掉 `-y`/`--yes` 一类确认参数。
- 因此这类 MCP 的实际运行依赖是 `pnpm`；Linux 终端里必须装有 `pnpm`，不能只装 `npm`。
- 不要把 command 改成 `npm`；当前已知这样可能触发 `double free` 报错。现阶段约定是：配置时按 `npx` 填，运行时由软件内部转成 `pnpm dlx`。
5) 系统启动行为（必须理解）：
- 本地插件：系统会读取 mcp_config.json 中该插件的 command/args/env，使用 cwd=~/mcp_plugins/<shortName> 启动进程；可用性以“工具可调用/服务可响应”为准
- 远程插件：系统按 endpoint + connectionType（可选 bearerToken/headers）发起连接并校验连通
6) command 的实际执行位置（必须按此理解）：
- 本地插件启动时，系统在 Linux 终端环境中启动进程；执行工作目录固定是 ~/mcp_plugins/<shortName>
- mcp_config.json 里填写的 command 就是在这个 Linux 工作目录上下文中被执行，不会在 Android 源目录执行
- args 里的相对路径，统一按该 cwd 解析
6.1) node 命令示例（按插件ID）：
- 例：pluginId=owner/my-plugin，则 shortName=my-plugin，cwd=~/mcp_plugins/my-plugin
- 如果入口文件在 ~/mcp_plugins/my-plugin/dist/index.js，则写：
  "command": "node"
  "args": ["dist/index.js"]
- 这里 args 必须按 cwd 写相对路径，不要写 /sdcard/... 的 Android 路径
7) mcp_config.json 字段规范：
- 顶层必须有 mcpServers（对象）
- mcpServers 的 key 是 serverId（通常与插件ID一致，避免随意改名）
- pluginId（即 mcpServers 的 key）只允许 a-zA-Z_ 和空格
- 每个 server 常用字段：
  - command（必填，启动命令）
  - args（可选，字符串数组）
  - env（可选，键值对）
  - autoApprove（可选，数组）
  - disabled（可选，true=禁用）
- MCP 的环境变量必须写在 mcpServers.<id>.env；`read_environment_variable` / `write_environment_variable` 不会读写这里。
8) mcp_config.json 路径写法规则：
- 不要把 Android 绝对路径写进本地插件启动参数（例如 /sdcard/...）
- 本地插件命令应按 Linux 运行目录编写，优先相对路径（因为 cwd 已固定到 ~/mcp_plugins/<shortName>）
- 如果必须写绝对路径，也应是 Linux 侧路径，不应写 Android 侧路径
9) 启用开关：
- 本地插件使用 mcpServers.<id>.disabled
- 远程插件使用 pluginMetadata.<id>.disabled
10) MCP 排查顺序（按顺序执行）：
- 检查开关是否启用
- 检查本地部署目录是否存在且非空
- 检查 mcp_config.json 的 command/args/env 字段是否完整
- 检查 args 是否误写 Android 路径
- 检查 env 中所需 key/token
- 不要把 server_status.json 的 active 当作唯一依据；优先看工具是否可拉取、可调用
- 检查终端依赖（node/pnpm/python/uv）与 MCP 服务状态；其中 Node 类 `npx` MCP 实际依赖 `pnpm`，若缺少 `pnpm` 将无法启动

【Skill：安装与排查】
1) 目录：/sdcard/Download/Operit/skills/
2) 识别规则：每个 Skill 必须是一个文件夹，且包含 SKILL.md（skill.md 也可）。
3) 添加方式（按这个做）：
- 先从可信来源下载 Skill（zip 或仓库源码均可）
- 把下载内容解压后，直接放到 /sdcard/Download/Operit/skills/
- 最终目录结构必须是 /sdcard/Download/Operit/skills/<skill_name>/，且该目录内有 SKILL.md
4) 元数据解析：
- 优先读取 frontmatter 中的 name/description
- 若缺失，回退读取文件前40行里的 name:/description:
5) AI 可见性：
- 列表开关关闭后，Skill 仍在本地，但 AI 不会使用
6) Skill 排查顺序：
- 先确认路径和 SKILL.md
- 再确认是否重名冲突
- 再确认开关是否开启
- 最后检查 SKILL.md 内容是否完整（步骤/约束/输出）

【Sandbox Package：安装与排查】
1) 沙盒包目录（外部）：
- Android/data/com.ai.assistance.operit/files/packages
2) 内置包：
- 内置包来自应用内置资源，不在上述外部目录；删除内置包文件不是常规操作，通常只做开关管理。
3) 导入与删除：
- 导入：把 `.js` 或 `.toolpkg` 放入/导入到外部 packages 目录。
- 删除：外部包可直接按文件路径删除；删除前先确认是否仍被依赖。
4) 开关管理（优先使用工具）：
- 先调用 list_sandbox_packages 获取“内置+外部”包列表与当前 enabled 状态。
- 再调用 set_sandbox_package_enabled(package_name, enabled) 执行启停。
5) 制作包文档：
- https://cdn.jsdelivr.net/gh/AAswordman/Operit@main/docs/SCRIPT_DEV_SKILL.md
- 该地址可直接通过 HTTP GET 请求访问，用于拉取原始 Markdown 文档内容。
6) 软件内调试烧录：
- 普通 `.js` 沙盒包优先用 `debug_install_js_package`。
- `ToolPkg` 优先用 `debug_install_toolpkg`；它会处理目录/manifest/.toolpkg 的打包或安装，并触发 ToolPkg 的刷新链路。

【Package 兼容模型（重要）】
- AI 看到的 package 是统一抽象，底层可能来自 MCP、Skill、Sandbox Package 任意一种。
- 可用包列表中的条目，不保证同类型；可能是三种类型混合出现。
- `use_package` 是三兼容入口：对 MCP/Skill/Sandbox Package 都可统一调用。
- `ping_mcp` 工具是 `use_package` 的直通封装，用于快速探测指定包是否可被加载。

【市场 Agent API（HTTP，只读）】
- 基础前缀：`https://api.operit.app/market-stats`
- 搜索：`/agent/search?q=<关键词>&type=mcp|skill|package|script&limit=10`
- 详情：`/agent/items/<type>/<id>`
- 安装计划：`/agent/items/<type>/<id>/install-plan`
- `package` / `script` 的 install_plan 通常会返回 `download_url`、`tracked_download_url`、`sha256`、`runtime_package_id`。
- `skill` 的 install_plan 通常会返回 `repository_url`。
- `mcp` 的 install_plan 可能返回 `config`（可直接作为 installConfig 参考）或 `repository_url`。
- 当前软件未对 JS 暴露统一的一键安装市场接口；需要安装时，按条目类型自行下载、解压、导入，必要时配合 `debug_install_js_package` / `debug_install_toolpkg` / `use_package`。

【功能模型与模型配置】
1) 模型配置（Model Config）：
- 每个模型配置是一套完整连接参数（provider / endpoint / api key / model_name / custom_headers / 各能力开关）。
- 可以新增、删除、修改；删除默认配置 `default` 是禁止的。
2) 功能模型（Function Model）：
- 每个功能类型（如 CHAT/SUMMARY/TRANSLATION 等）会绑定到一个模型配置。
- 当一个配置里 `model_name` 写了多个模型（逗号分隔），还要指定 `model_index` 选择第几个。
3) 关键工具（优先使用）：
- `list_model_configs`：查看全部模型配置 + 当前功能绑定。
- `create_model_config`：新增模型配置（可带初始 provider/endpoint/key/model_name/custom_headers）。
- `update_model_config`：修改已有配置（按 config_id）。
- `delete_model_config`：删除配置（默认配置不可删）。
- `list_function_model_configs`：仅列出功能 -> 配置绑定关系（轻量）。
- `get_function_model_config`：查看某个功能当前绑定的单个配置详情。
- `set_function_model_config`：为功能指定配置与模型索引。
- `test_model_config_connection`：按设置页同等逻辑测试配置连通与多模态能力。
4) 配置修改后：
- 若该配置被某些功能使用，系统会刷新对应功能服务；绑定变更也会刷新目标功能服务。
5) 用户抱怨“输出总被截断”时：
- 可先用 `get_function_model_config` 查看对应功能绑定配置里的 `max_tokens` 参数。
- 对 DeepSeek 来说，默认常见是 4096；可将 `max_tokens_enabled` 打开并把 `max_tokens` 设到 8192 再测试。
- 对其他模型，先联网确认该模型可支持的输出上限后再设置。

【角色卡管理】
1) 角色卡是全局配置资产。创建、编辑角色设定、模型绑定、记忆配置、工具白名单、激活与 Tavern JSON 导入导出均使用本包的角色卡工具。
2) 对话只在创建或发送时引用角色卡；不要把角色卡完整配置管理放进会话操作。
3) 关键工具：
- `list_character_cards`：查看完整角色卡列表和当前活跃角色卡。
- `get_character_card`：读取单张角色卡完整配置。
- `create_character_card`、`update_character_card`、`delete_character_card`：管理角色卡。
- `set_active_character_card`、`clear_active_character_card`：管理活跃角色卡。
- `import_character_card_from_tavern_json`、`export_character_card_to_tavern_json`：与 Tavern JSON 交换单张角色卡。
4) `attached_tag_ids` 与四个 `allowed_*` 字段都使用 JSON 字符串数组，例如 `["tag-a","tag-b"]`。
5) 默认角色卡不可删除。更新不会改变角色卡 ID、创建时间或默认属性。

【上下文总结模块（Context Summary）】
1) 用途：
- 控制会话上下文窗口与“何时触发总结”，用于降低上下文膨胀导致的丢信息、跑偏或响应不稳定。
- 只有当前对话功能模型（CHAT）所绑定配置里的上下文总结参数，会在实际对话中生效。
2) 核心机制说明：
- 软件内有一个 max 开关，即 `enable_max_context_mode`。
- 开启时使用 `max_context_length`，关闭时使用 `context_length`，目标是为用户节约 token，并按场景动态决定使用长度。
- `enable_summary` 控制是否自动总结；当上下文超过 `summary_token_threshold * 当前可用上下文长度` 时，会触发总结。
3) 建议排查顺序：
- 先用 `get_context_summary_config` 看当前功能绑定配置的上下文总结参数。
- 再用 `set_context_summary_config` 设置上下文总结参数（可传入参数覆盖默认值）。
- 若仍异常，再结合具体模型能力与业务负载做细调。

【TTS/STT 语音服务配置】
1) 配置入口：
- 在软件设置里的 Speech Services（语音服务）页面配置。
- 该页面会自动保存；改完后语音服务实例会自动重建。
2) TTS（文本转语音）可选引擎：
- `SIMPLE_TTS`：系统 TTS，基本无需填网络参数。
- `HTTP_TTS`：需重点填写 `url_template`、`headers`、`http_method`、`content_type`、`request_body`；若服务先返回 JSON / 字段 / 下载链接，再额外填写 `response_pipeline`。
- `OPENAI_WS_TTS`：需填写 `url_template`、`api_key`、`model_name`、`voice_id`。其中 `url_template` 应为 Realtime WebSocket 地址（例如 `wss://api.openai.com/v1/realtime`）。
- `SILICONFLOW_TTS`：需填写 `api_key`、`model_name`、`voice_id`。
- `MINIMAX_TTS`：需填写 `api_key`，可选填写 `url_template`、`model_name`、`voice_id`。默认接口为 `https://api.minimaxi.com/v1/t2a_v2`，内部固定按 `data.audio -> http_get` 解析音频。
- `MIMO_TTS`：需填写 `api_key`，可选填写 `url_template`、`model_name`、`voice_id`。预置音色使用 `mimo-v2.5-tts` 和短 `voice_id`；声音克隆使用 `mimo-v2.5-tts-voiceclone`，`voice_id` 填完整 `data:audio/...;base64,...` 音频样本。默认接口为 `https://api.xiaomimimo.com/v1/chat/completions`，内部固定按 `choices[0].message.audio.data -> base64_decode` 解析音频。
- `DOUBAO_TTS`：豆包 TTS，需填写 `url_template`、`api_key`（Token）、`model_name`（App ID）、`voice_id`（voice_type）。默认接口为 `https://openspeech.bytedance.com/api/v1/tts`，继承 HTTP TTS 队列和响应管线，内部固定按 `data -> base64_decode` 解析音频。
- `OPENAI_TTS`：需填写 `url_template`、`api_key`、`model_name`、`voice_id`。
- `VITS_TTS`：本地 VITS/Piper TTS。`tts_vits_package_path` 填本地模型包 `.zip` 或已解压目录，`tts_vits_speaker_id` 可选填数字 speaker id，`tts_vits_options` 可选填写 `sample_rate`、`threads`、`noise_scale`、`length_scale`、`noise_w`、`frontend`、`text_mode`、`speaker_count`、输入名和 blank/bos/eos token 等本地参数。
3) STT（语音转文本）可选引擎：
- `SHERPA_NCNN`：本地识别，通常无需 API Key。
- `OPENAI_STT`：需填写 `endpoint_url`、`api_key`、`model_name`。
- `DEEPGRAM_STT`：需填写 `endpoint_url`、`api_key`、`model_name`。
4) 最常见填错点（优先检查）：
- `HTTP_TTS` 的 `headers` 不是合法 JSON（必须是对象）。
- `HTTP_TTS` 的模板没放 `{text}` 占位符（GET 通常在 URL，POST 通常在 body）。
- `HTTP_TTS` 的 `response_pipeline` 不是合法 JSON 数组，或步骤名 / `path` 填错。
- `OPENAI_WS_TTS` 把 HTTP 地址填成了 WebSocket 地址，或把 WebSocket 地址误填成 HTTP 地址。
- `VITS_TTS` 的 `tts_vits_package_path` 不是本地 `.zip` 模型包或已解压目录，或文件不存在。
- `VITS_TTS` 模型包里没有可识别的 `.onnx` / config JSON / lexicon，或配置里缺少 `sample_rate` / token 映射。
- `VITS_TTS` 的 `tts_vits_options` 不是合法 JSON（必须是对象），或把本地参数名 / 数值类型写错。
- TTS/STT 的 endpoint 路径写错（比如把 chat/completions 写成 audio 接口）。
- `model_name` 填了不存在的模型或与接口不匹配。
- 改完配置后没有重新测试语音播报或语音识别。
5) HTTP_TTS 占位符说明（按代码逻辑）：
- 必填占位符：`{text}`。
  - 当 `http_method=GET` 时，`{text}` 必须在 `url_template` 里。
  - 当 `http_method=POST` 时，`{text}` 必须在 `request_body` 里。
- 可选占位符：`{rate}`、`{pitch}`、`{voice}`。
- 当前对外可稳定使用的占位符：`{text}`、`{rate}`、`{pitch}`、`{voice}`、`{apiKey}`、`{model}`、`{locale}`、`{uuid}`。
6) HTTP_TTS 响应处理说明（已发布版本兼容）：
- `response_pipeline` 留空或传 `[]`：保持旧行为，直接把首个响应体当音频。
- 当服务端先返回 JSON、字段或下载链接时，再填写 `response_pipeline`，按步骤解析。
- 当前可用步骤：`parse_json`、`pick`、`parse_json_string`、`http_get`、`http_request_from_object`、`base64_decode`。
- 常见 JSON 下载链接场景：
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"audio_uri"},{"type":"http_get"}]`
- 若字段里还是 JSON 字符串：
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"data.payload"},{"type":"parse_json_string"},{"type":"pick","path":"audio.url"},{"type":"http_get"}]`
7) 可直接参考的最小模板：
- HTTP TTS（GET）：
  - `url_template`: `https://example.com/tts?text={text}`
  - `headers`: `{}`
  - `http_method`: `GET`
  - `content_type`: `application/json`
- HTTP TTS（POST）：
  - `url_template`: `https://example.com/tts`
  - `headers`: `{"Authorization":"Bearer <API_KEY>"}`
  - `http_method`: `POST`
  - `content_type`: `application/json`
  - `request_body`: `{"text":"{text}"}`
- OpenAI STT（默认常见）：
  - `endpoint_url`: `https://api.openai.com/v1/audio/transcriptions`
  - `model_name`: `whisper-1`
8) 排查顺序（建议）：
- 先确认选中的引擎类型是否正确（TTS 与 STT 分开看）。
- 再检查 endpoint / key / model 三件套是否完整。
- 再检查 HTTP 模板字段（headers JSON、method、body、占位符、response_pipeline）。
- 至少做一次真实 TTS 播报测试；若还要排查 STT，再另外走语音识别链路。
9) 对应工具（可直接用）：
- `get_speech_services_config`：获取当前 TTS/STT 配置快照（含引擎类型与关键字段）。
- `set_speech_services_config`：按字段修改 TTS/STT 配置（支持只改部分字段）。
- `test_tts_playback`：按当前 TTS 配置播放一次测试文本（支持临时覆盖语速/音调）。

【多模态输入规则】
1) 能力开关含义：
- 模型配置里的“支持 Tool Call / 识图 / 音频 / 视频”等开关，只是软件侧能力标识，不等于模型真实能力。
- 实际配置时，必须依据模型真实支持情况来开关，不能乱开。
2) 软件识图主链路：
- 当“对话功能模型”的模型配置开启识图且模型真实支持时：聊天附图会直接发给该模型识别。
- 当对话模型不支持识图时：软件会尝试走 OCR，或走“识图功能模型”进行识图中转。
3) 用户有识图需求时的可行条件：
- 条件 A：对话模型支持识图。
- 条件 B：对话模型不支持识图，但识图功能模型支持识图。
- 若识图功能模型也不支持识图：最终回退到 OCR。

【绘图输出说明】
- 绘图通过工具包实现。
- 软件内置了一些绘图包，可调用 list_sandbox_packages 查看。
- 通常只需启用其中一个可用绘图包即可，无需全部开启。

【执行原则】
- 严格按用户明确指示执行，不自行定义“问题”或追加未被要求的目标。
- 任何会改动用户配置的操作（开关、导入/删除、写环境变量、模型配置增删改、重启）都必须先得到用户明确确认。
- 用户没有明确要求执行某个工具时，不主动调用写入类工具。
- 回答优先基于本手册的路径与规则，避免泛化推断。'''
        en: '''Configuration troubleshooting guide.

[Trigger conditions]
- The user mentions MCP/Skill install failure, startup failure, tools not appearing, import failure, duplicate name conflicts, or config editing
- The user mentions sandbox package toggles, built-in package listing, import/delete paths, or package enable-state issues
- The user asks to troubleshoot plugin config paths, deploy directories, enable switches, or environment variables
- The user mentions function model bindings, adding/deleting/updating model configs, or testing model connectivity
- The user says TTS/STT setup is confusing, too many fields to fill, or speech playback/recognition is not working
- The core issue is configuration/deployment flow rather than normal Q&A

[MCP: install and troubleshooting]
1) Config directory: /sdcard/Download/Operit/mcp_plugins/
- Main config: mcp_config.json
- Runtime status cache: server_status.json (non-realtime snapshot for status/tool cache only; not a troubleshooting source of truth)
2) Keep Android-side and Linux-side paths strictly separated:
- Android side is the source/import location, not the final runtime location
- Linux runtime directory is: ~/mcp_plugins/<last-segment-of-pluginId>
- Actual MCP startup always runs from the Linux side
3) Real deployment behavior (from implementation):
- Create target directory
- Copy plugin files from Android side to Linux side
- Execute auto-generated install/build commands (startup commands are skipped)
3.1) Local plugin recognition rule:
- This exists to handle nested storage layouts (for example `<pluginId>/<repo>-main/...`): the Android-side plugin directory must contain at least one marker file such as `README.md`, `package.json`, `mcp.config.json`, `main.js`, `main.py`, `index.js`, or `index.py`; otherwise it may be treated as not installed and never enter the startup list.
4) Command-based plugin handling:
- For command-based plugins using npx/uvx/uv, the system treats them as deployed and only performs minimal directory preparation.
- For Node-style command MCPs, keep the config in mcp_config.json aligned with upstream examples and still write `command: "npx"`; do not rewrite it to `pnpm` or `npm` yourself.
- When the app starts this kind of `npx` MCP, it internally rewrites `npx` to `pnpm dlx` and strips confirmation flags such as `-y` / `--yes`.
- That means the real runtime dependency for this kind of MCP is `pnpm`; `pnpm` must exist in the Linux terminal, and having only `npm` is not enough.
- Do not change the command to `npm`; this is known to trigger `double free` errors. The current convention is: configure it as `npx`, and let the app run it internally as `pnpm dlx`.
5) System startup behavior (critical):
- Local plugins: the app reads command/args/env from mcp_config.json and starts the process with cwd=~/mcp_plugins/<shortName>; availability should be judged by real tool call/response
- Remote plugins: the app connects using endpoint + connectionType (optional bearerToken/headers) and verifies connectivity
6) Actual execution location of command (must be understood this way):
- For local plugins, the process starts in the Linux terminal environment with fixed working directory: ~/mcp_plugins/<shortName>
- The command from mcp_config.json is executed in that Linux working-directory context, not in the Android source directory
- Any relative paths in args are resolved against that cwd
6.1) node command example (by plugin ID):
- Example: pluginId=owner/my-plugin, so shortName=my-plugin and cwd=~/mcp_plugins/my-plugin
- If the entry file is ~/mcp_plugins/my-plugin/dist/index.js, write:
  "command": "node"
  "args": ["dist/index.js"]
- args must be relative to cwd; do not use Android paths such as /sdcard/...
7) mcp_config.json field rules:
- Top level must contain mcpServers (object)
- Each key in mcpServers is a serverId (normally keep it aligned with plugin ID)
- pluginId (the mcpServers key) only allows letters a-zA-Z, underscore (_), and spaces
- Common server fields:
  - command (required, startup command)
  - args (optional, string array)
  - env (optional, key-value map)
  - autoApprove (optional, array)
  - disabled (optional, true means disabled)
- MCP environment variables must be configured in mcpServers.<id>.env; `read_environment_variable` / `write_environment_variable` do not read or write these MCP env entries.
8) Path-writing rules in mcp_config.json:
- Do not put Android absolute paths (for example /sdcard/...) in local plugin startup args
- Write local plugin command/args for Linux runtime; prefer relative paths because cwd is fixed to ~/mcp_plugins/<shortName>
- If an absolute path is required, it must be a Linux path, not an Android path
9) Enable switch:
- Local plugin uses mcpServers.<id>.disabled
- Remote plugin uses pluginMetadata.<id>.disabled
10) MCP troubleshooting order:
- Check enable switch
- Check local deployed directory exists and is non-empty
- Check whether command/args/env in mcp_config.json are complete
- Check whether args incorrectly use Android paths
- Check required key/token in env
- Do not treat `active` in server_status.json as the single source of truth; prioritize whether tools can be fetched/called successfully
- Check terminal dependencies (node/pnpm/python/uv) and MCP service status; Node-style `npx` MCPs actually depend on `pnpm`, so missing `pnpm` will prevent startup

[Skill: install and troubleshooting]
1) Directory: /sdcard/Download/Operit/skills/
2) Recognition rule: each Skill must be a folder containing SKILL.md (skill.md is also accepted).
3) How to add a skill (use this workflow):
- Download the skill from a trusted source (zip or repository source code).
- Extract it, then place the folder directly under /sdcard/Download/Operit/skills/
- Final structure must be /sdcard/Download/Operit/skills/<skill_name>/ and that folder must contain SKILL.md
4) Metadata parsing:
- Prefer frontmatter name/description
- Fallback to name:/description: in the first 40 lines
5) AI visibility:
- If the list switch is off, the Skill remains local but is hidden from AI usage
6) Skill troubleshooting order:
- Verify path and SKILL.md
- Check duplicate-name conflict
- Check enable switch
- Check whether SKILL.md instructions are complete (steps/constraints/outputs)

[Sandbox Package: install and troubleshooting]
1) External sandbox packages directory:
- Android/data/com.ai.assistance.operit/files/packages
2) Built-in packages:
- Built-in packages come from app bundled assets, not from the external directory above; usually manage via enable/disable instead of file deletion.
3) Import and delete:
- Import: place/import `.js` or `.toolpkg` into the external packages directory.
- Delete: for external packages, delete by file path after confirming dependency impact.
4) Toggle management (prefer tools):
- Call list_sandbox_packages first to get built-in + external package list and current enabled state.
- Then call set_sandbox_package_enabled(package_name, enabled) to apply changes.
5) Package authoring guide:
- https://cdn.jsdelivr.net/gh/AAswordman/Operit@main/docs/SCRIPT_DEV_SKILL.md
- This URL can be accessed directly with an HTTP GET request to fetch the raw Markdown document.
6) In-app debug install:
- For plain `.js` sandbox packages, prefer `debug_install_js_package`.
- For `ToolPkg`, prefer `debug_install_toolpkg`; it handles packaging/install flow for folder/manifest/.toolpkg sources and triggers the ToolPkg refresh path.

[Package compatibility model (important)]
- The package list seen by AI is a unified abstraction, and each item may come from MCP, Skill, or Sandbox Package.
- Available package entries are not guaranteed to be a single type; mixed types are expected.
- `use_package` is tri-compatible and can be called uniformly for MCP/Skill/Sandbox Package.
- `ping_mcp` is a thin wrapper over `use_package` for quick package availability probing.

[Market agent API (HTTP, read-only)]
- Base prefix: `https://api.operit.app/market-stats`
- Search: `/agent/search?q=<query>&type=mcp|skill|package|script&limit=10`
- Detail: `/agent/items/<type>/<id>`
- Install plan: `/agent/items/<type>/<id>/install-plan`
- `package` / `script` install_plan usually returns `download_url`, `tracked_download_url`, `sha256`, and `runtime_package_id`.
- `skill` install_plan usually returns `repository_url`.
- `mcp` install_plan may return `config` (usable as installConfig reference) or `repository_url`.
- The app does not currently expose a unified one-click market install API to JS; when installation is needed, download/extract/import by item type and use `debug_install_js_package`, `debug_install_toolpkg`, or `use_package` when appropriate.

[Function model and model config]
1) Model config:
- Each model config is one full connection profile (provider / endpoint / api key / model_name / custom_headers / capability switches).
- Configs can be created, updated, and deleted; deleting the default `default` config is forbidden.
2) Function model binding:
- Each function type (for example CHAT/SUMMARY/TRANSLATION) is bound to one model config.
- If `model_name` contains multiple models (comma-separated), `model_index` selects which one to use.
3) Key tools (prefer these):
- `list_model_configs`: list all model configs and current function bindings.
- `create_model_config`: create a new model config (with optional initial provider/endpoint/key/model_name/custom_headers).
- `update_model_config`: update an existing config by config_id.
- `delete_model_config`: delete a config (default cannot be deleted).
- `list_function_model_configs`: list function -> config bindings only (lightweight).
- `get_function_model_config`: get one bound config detail by function type.
- `set_function_model_config`: assign config and model index for a function.
- `test_model_config_connection`: run settings-UI-equivalent connectivity/capability checks for a config.
4) After config changes:
- If a config is used by functions, corresponding function services are refreshed; binding updates also refresh target function service.
5) When users complain about truncated outputs:
- Use `get_function_model_config` to inspect `max_tokens` in the bound config for that function.
- For DeepSeek, a common default is 4096; enable `max_tokens_enabled` and try setting `max_tokens` to 8192.
- For other models, verify the supported output-token limit online before changing values.

[Context summary module]
1) Purpose:
- Controls context window behavior and summary-trigger conditions to reduce context bloat, drift, and unstable long-chat responses.
- Only context-summary settings on the config currently bound to CHAT are effective in real conversation.
2) Core mechanism:
- There is a max switch in the app: `enable_max_context_mode`.
- When enabled, it uses `max_context_length`; when disabled, it uses `context_length`, so context length can be chosen dynamically to save tokens.
- `enable_summary` controls automatic summarization. When context exceeds `summary_token_threshold * current available context length`, summarization is triggered.
3) Recommended troubleshooting flow:
- Use `get_context_summary_config` to inspect current context-summary fields for a function.
- Use `set_context_summary_config` to set context-summary fields (you can override default values via params).
- If issues remain, fine-tune based on real model capability and workload.

[TTS/STT speech-service configuration]
1) Where to configure:
- Configure it on the Speech Services page in app settings.
- The page auto-saves; after changes, speech-service instances are rebuilt automatically.
2) TTS (text-to-speech) engines:
- `SIMPLE_TTS`: system TTS, usually no network fields required.
- `HTTP_TTS`: mainly fill `url_template`, `headers`, `http_method`, `content_type`, `request_body`; if the service first returns JSON / fields / a download link, also fill `response_pipeline`.
- `OPENAI_WS_TTS`: fill `url_template`, `api_key`, `model_name`, `voice_id`. `url_template` should be a Realtime WebSocket endpoint such as `wss://api.openai.com/v1/realtime`.
- `SILICONFLOW_TTS`: fill `api_key`, `model_name`, `voice_id`.
- `MINIMAX_TTS`: fill `api_key`; optionally set `url_template`, `model_name`, and `voice_id`. Default endpoint is `https://api.minimaxi.com/v1/t2a_v2`, and audio is resolved from `data.audio` automatically.
- `MIMO_TTS`: fill `api_key`; optionally set `url_template`, `model_name`, and `voice_id`. Use `mimo-v2.5-tts` with a short `voice_id` for preset voices. Use `mimo-v2.5-tts-voiceclone` with a full `data:audio/...;base64,...` audio sample in `voice_id` for voice cloning. Default endpoint is `https://api.xiaomimimo.com/v1/chat/completions`, and audio is resolved from `choices[0].message.audio.data` with Base64 decoding.
- `DOUBAO_TTS`: Doubao TTS. Fill `url_template`, `api_key` (token), `model_name` (App ID), and `voice_id` (voice_type). Default endpoint is `https://openspeech.bytedance.com/api/v1/tts`; it inherits the HTTP TTS queue and response pipeline and resolves audio from `data` with Base64 decoding.
- `OPENAI_TTS`: fill `url_template`, `api_key`, `model_name`, `voice_id`.
- `VITS_TTS`: local VITS/Piper TTS. Set `tts_vits_package_path` to the local model package `.zip` or extracted package directory, optionally set `tts_vits_speaker_id` to a numeric speaker id, and use `tts_vits_options` for local options such as `sample_rate`, `threads`, `noise_scale`, `length_scale`, `noise_w`, `frontend`, `text_mode`, `speaker_count`, input names, and blank/bos/eos token settings.
3) STT (speech-to-text) engines:
- `SHERPA_NCNN`: local recognition, usually no API key required.
- `OPENAI_STT`: fill `endpoint_url`, `api_key`, `model_name`.
- `DEEPGRAM_STT`: fill `endpoint_url`, `api_key`, `model_name`.
4) Most common mistakes (check first):
- `headers` in `HTTP_TTS` is not valid JSON (must be an object).
- Missing `{text}` placeholder in HTTP TTS template (typically in URL for GET, in body for POST).
- `response_pipeline` in `HTTP_TTS` is not a valid JSON array, or a step name / `path` is incorrect.
- `OPENAI_WS_TTS` is configured with an HTTP URL instead of a WebSocket URL, or vice versa.
- `tts_vits_package_path` in `VITS_TTS` is not a local `.zip` model package or extracted package directory, or it does not exist.
- The `VITS_TTS` package has no recognizable `.onnx` / config JSON / lexicon, or the config is missing `sample_rate` / token mappings.
- `tts_vits_options` in `VITS_TTS` is not valid JSON, or local option names / numeric values are invalid.
- Wrong endpoint path for TTS/STT (for example using chat/completions instead of audio endpoints).
- `model_name` does not exist or does not match the API.
- No real retest after saving config.
5) HTTP_TTS placeholder rules (from implementation):
- Required placeholder: `{text}`.
  - When `http_method=GET`, `{text}` must appear in `url_template`.
  - When `http_method=POST`, `{text}` must appear in `request_body`.
- Optional placeholders: `{rate}`, `{pitch}`, `{voice}`.
- Stable placeholders for external configuration: `{text}`, `{rate}`, `{pitch}`, `{voice}`, `{apiKey}`, `{model}`, `{locale}`, `{uuid}`.
6) HTTP_TTS response handling notes (forward-compatible with released configs):
- Leave `response_pipeline` empty or use `[]` to keep the old behavior: the first response body is treated as audio directly.
- Only fill `response_pipeline` when the service returns JSON, nested fields, or a follow-up download URL before audio is available.
- Currently supported steps: `parse_json`, `pick`, `parse_json_string`, `http_get`, `http_request_from_object`, `base64_decode`.
- Common JSON download-link case:
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"audio_uri"},{"type":"http_get"}]`
- If the picked field is itself a JSON string:
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"data.payload"},{"type":"parse_json_string"},{"type":"pick","path":"audio.url"},{"type":"http_get"}]`
7) Minimal templates you can copy:
- HTTP TTS (GET):
  - `url_template`: `https://example.com/tts?text={text}`
  - `headers`: `{}`
  - `http_method`: `GET`
  - `content_type`: `application/json`
- HTTP TTS (POST):
  - `url_template`: `https://example.com/tts`
  - `headers`: `{"Authorization":"Bearer <API_KEY>"}`
  - `http_method`: `POST`
  - `content_type`: `application/json`
  - `request_body`: `{"text":"{text}"}`
- OpenAI STT (common default):
  - `endpoint_url`: `https://api.openai.com/v1/audio/transcriptions`
  - `model_name`: `whisper-1`
8) Recommended troubleshooting order:
- Confirm the selected engine type first (TTS and STT separately).
- Check endpoint/key/model as a bundle.
- Then verify HTTP template fields (headers JSON, method, body, placeholder, response_pipeline).
- Run at least one real TTS playback test; if STT also needs troubleshooting, verify recognition in a separate speech flow.
9) Related tools:
- `get_speech_services_config`: fetch current TTS/STT config snapshot (engine types + key fields).
- `set_speech_services_config`: update TTS/STT config fields (partial update supported).
- `test_tts_playback`: play one test utterance with the current TTS config (supports temporary rate/pitch overrides).

[Multimodal input rules]
1) Meaning of capability switches:
- Switches like Tool Call / image / audio / video in model config are software-side capability markers, not proof of real model capability.
- Configure these switches according to actual model support; do not enable blindly.
2) Image understanding main path in app:
- If the chat-function model config enables image understanding and the model truly supports it, attached images are sent directly to that chat model.
- If the chat model does not support image understanding, the app will try OCR, or use the dedicated image-recognition function model as a relay.
3) Valid conditions when users need image understanding:
- Condition A: chat model supports image understanding.
- Condition B: chat model does not support it, but image-recognition function model supports it.
- If the image-recognition model also does not support it, the final fallback is OCR.

[Drawing output note]
- Drawing is implemented via package tools.
- The app includes several built-in drawing packages; use list_sandbox_packages to inspect them.
- Usually enabling one available drawing package is enough; no need to enable all of them.

[Execution principles]
- Follow the user's explicit instructions strictly; do not define your own "problem" or add unrequested goals.
- Any configuration-changing action (toggle/import/delete/write env/model config CRUD/restart) requires explicit user confirmation first.
- If the user did not explicitly ask to execute a specific tool, do not proactively run write-type tools.
- Answer with concrete paths/rules from this guide and avoid generic assumptions.'''
        ru: '''Руководство по устранению проблем с конфигурацией.

[Условия срабатывания]
- Пользователь упоминает сбой установки MCP/Skill, сбой запуска, непоявление инструментов, сбой импорта, конфликт одинаковых имён или правку конфигурации
- Пользователь упоминает переключатели пакетов песочницы, список встроенных пакетов, пути импорта и удаления или неисправное состояние включения пакета
- Пользователь просит разобраться с путями конфигурации плагинов, каталогами развёртывания, переключателями включения или переменными среды
- Пользователь упоминает привязки функциональных моделей, добавление, удаление и изменение конфигураций моделей или проверку связи с моделью
- Пользователь говорит, что настройка TTS/STT непонятна, полей слишком много или воспроизведение и распознавание речи не работают
- Суть вопроса — поток конфигурации и развёртывания, а не обычные вопросы и ответы

[MCP: установка и поиск неисправностей]
1) Каталог конфигурации: /sdcard/Download/Operit/mcp_plugins/
- Основная конфигурация: mcp_config.json
- Кэш состояния выполнения: server_status.json (снимок не в реальном времени, только для статуса и кэша инструментов; не источник истины при поиске неисправностей)
2) Пути на стороне Android и на стороне Linux строго разделяются:
- Сторона Android — место хранения и импорта, а не конечное место выполнения
- Каталог выполнения на стороне Linux: ~/mcp_plugins/<последний-сегмент-pluginId>
- Реальный запуск MCP всегда идёт со стороны Linux
3) Фактическое поведение развёртывания (по реализации):
- Создать целевой каталог
- Скопировать файлы плагина со стороны Android на сторону Linux
- Выполнить автоматически сформированные команды установки и сборки (команды запуска пропускаются)
3.1) Правило распознавания локального плагина:
- Оно существует, чтобы обрабатывать вложенные схемы хранения (например, `<pluginId>/<repo>-main/...`): каталог плагина на стороне Android должен содержать хотя бы один файл-маркер, такой как `README.md`, `package.json`, `mcp.config.json`, `main.js`, `main.py`, `index.js` или `index.py`; иначе он может считаться неустановленным и никогда не попадёт в список запуска.
4) Работа с командными плагинами:
- Для командных плагинов на npx/uvx/uv система считает их развёрнутыми и выполняет только минимальную подготовку каталога.
- Для Node-подобных командных MCP оставляйте конфигурацию в mcp_config.json такой же, как в примерах вышестоящего проекта, и по-прежнему пишите `command: "npx"`; не переписывайте это на `pnpm` или `npm` самостоятельно.
- Когда приложение запускает такой `npx` MCP, оно внутри подменяет `npx` на `pnpm dlx` и убирает флаги подтверждения вроде `-y` / `--yes`.
- Значит, реальная зависимость времени выполнения для такого MCP — `pnpm`; `pnpm` должен быть в терминале Linux, одного `npm` недостаточно.
- Не меняйте команду на `npm`; известно, что это вызывает ошибки `double free`. Текущее соглашение: настраивать как `npx`, а приложение запустит это внутри как `pnpm dlx`.
5) Поведение запуска в системе (критично):
- Локальные плагины: приложение читает command/args/env из mcp_config.json и запускает процесс с cwd=~/mcp_plugins/<shortName>; о доступности следует судить по реальному вызову инструмента и ответу
- Удалённые плагины: приложение подключается по endpoint + connectionType (необязательные bearerToken/headers) и проверяет связность
6) Фактическое место выполнения команды (понимать именно так):
- Для локальных плагинов процесс запускается в окружении терминала Linux с фиксированным рабочим каталогом: ~/mcp_plugins/<shortName>
- Команда из mcp_config.json выполняется в контексте этого рабочего каталога Linux, а не в исходном каталоге Android
- Любые относительные пути в args разрешаются относительно этого cwd
6.1) Пример команды node (по ID плагина):
- Пример: pluginId=owner/my-plugin, значит shortName=my-plugin и cwd=~/mcp_plugins/my-plugin
- Если входной файл — ~/mcp_plugins/my-plugin/dist/index.js, пишите:
  "command": "node"
  "args": ["dist/index.js"]
- args должны быть относительными к cwd; не используйте пути Android вроде /sdcard/...
7) Правила полей mcp_config.json:
- На верхнем уровне должен быть mcpServers (объект)
- Каждый ключ в mcpServers — это serverId (обычно держите его в соответствии с ID плагина)
- pluginId (ключ mcpServers) допускает только буквы a-zA-Z, подчёркивание (_) и пробелы
- Общие поля сервера:
  - command (обязательно, команда запуска)
  - args (необязательно, массив строк)
  - env (необязательно, карта ключ-значение)
  - autoApprove (необязательно, массив)
  - disabled (необязательно, true означает отключено)
- Переменные среды MCP должны задаваться в mcpServers.<id>.env; `read_environment_variable` / `write_environment_variable` не читают и не пишут эти записи env MCP.
8) Правила записи путей в mcp_config.json:
- Не помещайте абсолютные пути Android (например, /sdcard/...) в параметры запуска локального плагина
- Пишите command/args локального плагина для работы в Linux; предпочитайте относительные пути, так как cwd фиксирован на ~/mcp_plugins/<shortName>
- Если абсолютный путь необходим, он должен быть путём Linux, а не путём Android
9) Переключатель включения:
- Локальный плагин использует mcpServers.<id>.disabled
- Удалённый плагин использует pluginMetadata.<id>.disabled
10) Порядок поиска неисправностей MCP:
- Проверить переключатель включения
- Проверить, что локальный каталог развёртывания существует и не пуст
- Проверить, полны ли command/args/env в mcp_config.json
- Проверить, не используют ли args ошибочно пути Android
- Проверить нужный key/token в env
- Не считайте `active` в server_status.json единственным источником истины; в первую очередь смотрите, удаётся ли получить и вызвать инструменты
- Проверить зависимости терминала (node/pnpm/python/uv) и состояние службы MCP; Node-подобные `npx` MCP фактически зависят от `pnpm`, поэтому без `pnpm` запуск не состоится

[Skill: установка и поиск неисправностей]
1) Каталог: /sdcard/Download/Operit/skills/
2) Правило распознавания: каждый Skill должен быть папкой с файлом SKILL.md (skill.md также принимается).
3) Как добавить skill (используйте этот порядок):
- Скачайте skill из доверенного источника (zip или исходный код репозитория).
- Распакуйте его, затем поместите папку непосредственно в /sdcard/Download/Operit/skills/
- Итоговая структура должна быть /sdcard/Download/Operit/skills/<skill_name>/, и в этой папке должен быть SKILL.md
4) Разбор метаданных:
- Предпочтительно name/description из frontmatter
- Иначе — name:/description: в первых 40 строках
5) Видимость для ИИ:
- Если переключатель списка выключен, Skill остаётся локальным, но скрыт от использования ИИ
6) Порядок поиска неисправностей Skill:
- Проверить путь и SKILL.md
- Проверить конфликт одинаковых имён
- Проверить переключатель включения
- Проверить, полны ли инструкции SKILL.md (шаги, ограничения, результаты)

[Sandbox Package: установка и поиск неисправностей]
1) Каталог внешних пакетов песочницы:
- Android/data/com.ai.assistance.operit/files/packages
2) Встроенные пакеты:
- Встроенные пакеты берутся из ресурсов, поставляемых с приложением, а не из внешнего каталога выше; обычно ими управляют включением и отключением, а не удалением файлов.
3) Импорт и удаление:
- Импорт: поместите или импортируйте `.js` либо `.toolpkg` во внешний каталог packages.
- Удаление: для внешних пакетов удаляйте по пути к файлу, предварительно убедившись во влиянии на зависимости.
4) Управление переключателями (предпочитайте инструменты):
- Сначала вызовите list_sandbox_packages, чтобы получить список встроенных и внешних пакетов и текущее состояние включения.
- Затем вызовите set_sandbox_package_enabled(package_name, enabled), чтобы применить изменения.
5) Руководство по созданию пакетов:
- https://cdn.jsdelivr.net/gh/AAswordman/Operit@main/docs/SCRIPT_DEV_SKILL.md
- Этот URL можно открыть напрямую запросом HTTP GET, чтобы получить исходный документ Markdown.
6) Отладочная установка в приложении:
- Для обычных `.js` пакетов песочницы предпочитайте `debug_install_js_package`.
- Для `ToolPkg` предпочитайте `debug_install_toolpkg`; он выполняет поток упаковки и установки для источников в виде папки, manifest и .toolpkg и запускает путь обновления ToolPkg.

[Модель совместимости пакетов (важно)]
- Список пакетов, который видит ИИ, — это единая абстракция, и каждый элемент может происходить из MCP, Skill или Sandbox Package.
- Для доступных записей пакетов единый тип не гарантируется; смешанные типы ожидаемы.
- `use_package` совместим со всеми тремя и может вызываться единообразно для MCP/Skill/Sandbox Package.
- `ping_mcp` — тонкая обёртка над `use_package` для быстрой проверки доступности пакета.

[API агента маркета (HTTP, только чтение)]
- Базовый префикс: `https://api.operit.app/market-stats`
- Поиск: `/agent/search?q=<query>&type=mcp|skill|package|script&limit=10`
- Подробности: `/agent/items/<type>/<id>`
- План установки: `/agent/items/<type>/<id>/install-plan`
- install_plan для `package` / `script` обычно возвращает `download_url`, `tracked_download_url`, `sha256` и `runtime_package_id`.
- install_plan для `skill` обычно возвращает `repository_url`.
- install_plan для `mcp` может возвращать `config` (годится как ссылка installConfig) или `repository_url`.
- Сейчас приложение не предоставляет JS единый API установки из маркета в один клик; когда установка нужна, скачивайте, распаковывайте и импортируйте по типу записи и используйте `debug_install_js_package`, `debug_install_toolpkg` или `use_package`, когда это уместно.

[Функциональные модели и конфигурация моделей]
1) Конфигурация модели:
- Каждая конфигурация модели — это полный профиль подключения (provider / endpoint / api key / model_name / custom_headers / переключатели возможностей).
- Конфигурации можно создавать, изменять и удалять; удаление конфигурации `default` по умолчанию запрещено.
2) Привязка функциональной модели:
- Каждый тип функции (например, CHAT/SUMMARY/TRANSLATION) привязан к одной конфигурации модели.
- Если `model_name` содержит несколько моделей (через запятую), `model_index` выбирает, какую использовать.
3) Ключевые инструменты (предпочитайте их):
- `list_model_configs`: список всех конфигураций моделей и текущих привязок функций.
- `create_model_config`: создать новую конфигурацию модели (с необязательными исходными provider/endpoint/key/model_name/custom_headers).
- `update_model_config`: изменить существующую конфигурацию по config_id.
- `delete_model_config`: удалить конфигурацию (по умолчанию удалить нельзя).
- `list_function_model_configs`: вывести только привязки функция → конфигурация (облегчённо).
- `get_function_model_config`: получить подробности одной привязанной конфигурации по типу функции.
- `set_function_model_config`: назначить конфигурацию и индекс модели для функции.
- `test_model_config_connection`: выполнить эквивалентные экрану настроек проверки связности и возможностей для конфигурации.
4) После изменения конфигураций:
- Если конфигурация используется функциями, соответствующие службы функций обновляются; обновление привязок также обновляет службу целевой функции.
5) Когда пользователь жалуется на обрезанный вывод:
- Используйте `get_function_model_config`, чтобы посмотреть `max_tokens` в конфигурации, привязанной к этой функции.
- Для DeepSeek обычное значение по умолчанию — 4096; включите `max_tokens_enabled` и попробуйте задать `max_tokens` 8192.
- Для других моделей перед изменением значений проверьте в интернете поддерживаемый предел выходных токенов.

[Модуль сводки контекста]
1) Назначение:
- Управляет поведением окна контекста и условиями срабатывания сводки, чтобы уменьшить раздувание контекста, его уход в сторону и нестабильные ответы в долгом чате.
- В реальном диалоге действуют только настройки сводки контекста в конфигурации, привязанной сейчас к CHAT.
2) Основной механизм:
- В приложении есть переключатель максимума: `enable_max_context_mode`.
- При включении используется `max_context_length`; при выключении используется `context_length`, поэтому длину контекста можно выбирать динамически ради экономии токенов.
- `enable_summary` управляет автоматическим суммированием. Когда контекст превышает `summary_token_threshold * текущая доступная длина контекста`, запускается суммирование.
3) Рекомендуемый порядок поиска неисправностей:
- Используйте `get_context_summary_config`, чтобы посмотреть текущие поля сводки контекста для функции.
- Используйте `set_context_summary_config`, чтобы задать поля сводки контекста (значения по умолчанию можно переопределить через параметры).
- Если проблемы остаются, тонко настройте по реальным возможностям модели и нагрузке.

[TTS/STT: конфигурация голосовых служб]
1) Где настраивать:
- Настраивается на странице Speech Services в настройках приложения.
- Страница сохраняет изменения автоматически; после изменений экземпляры голосовых служб пересоздаются автоматически.
2) Движки TTS (синтез речи):
- `SIMPLE_TTS`: системный TTS, обычно сетевые поля не нужны.
- `HTTP_TTS`: в основном заполните `url_template`, `headers`, `http_method`, `content_type`, `request_body`; если служба сначала возвращает JSON, поля или ссылку на скачивание, дополнительно заполните `response_pipeline`.
- `OPENAI_WS_TTS`: заполните `url_template`, `api_key`, `model_name`, `voice_id`. `url_template` должен быть эндпоинтом Realtime WebSocket, например `wss://api.openai.com/v1/realtime`.
- `SILICONFLOW_TTS`: заполните `api_key`, `model_name`, `voice_id`.
- `MINIMAX_TTS`: заполните `api_key`; при необходимости задайте `url_template`, `model_name` и `voice_id`. Эндпоинт по умолчанию — `https://api.minimaxi.com/v1/t2a_v2`, звук автоматически берётся из `data.audio`.
- `MIMO_TTS`: заполните `api_key`; при необходимости задайте `url_template`, `model_name` и `voice_id`. Для готовых голосов используйте `mimo-v2.5-tts` с коротким `voice_id`. Для клонирования голоса используйте `mimo-v2.5-tts-voiceclone` с полным аудиообразцом `data:audio/...;base64,...` в `voice_id`. Эндпоинт по умолчанию — `https://api.xiaomimimo.com/v1/chat/completions`, звук берётся из `choices[0].message.audio.data` с декодированием Base64.
- `DOUBAO_TTS`: Doubao TTS. Заполните `url_template`, `api_key` (token), `model_name` (App ID) и `voice_id` (voice_type). Эндпоинт по умолчанию — `https://openspeech.bytedance.com/api/v1/tts`; он наследует очередь и конвейер ответа HTTP TTS и берёт звук из `data` с декодированием Base64.
- `OPENAI_TTS`: заполните `url_template`, `api_key`, `model_name`, `voice_id`.
- `VITS_TTS`: локальный TTS VITS/Piper. Задайте `tts_vits_package_path` — локальный пакет модели `.zip` или распакованный каталог пакета, при необходимости `tts_vits_speaker_id` — числовой id говорящего, а `tts_vits_options` — локальные параметры вроде `sample_rate`, `threads`, `noise_scale`, `length_scale`, `noise_w`, `frontend`, `text_mode`, `speaker_count`, имён входов и настроек токенов blank/bos/eos.
3) Движки STT (распознавание речи):
- `SHERPA_NCNN`: локальное распознавание, обычно ключ API не нужен.
- `OPENAI_STT`: заполните `endpoint_url`, `api_key`, `model_name`.
- `DEEPGRAM_STT`: заполните `endpoint_url`, `api_key`, `model_name`.
4) Самые частые ошибки (проверяйте в первую очередь):
- `headers` в `HTTP_TTS` — не корректный JSON (должен быть объектом).
- В шаблоне HTTP TTS нет заполнителя `{text}` (обычно в URL для GET, в теле для POST).
- `response_pipeline` в `HTTP_TTS` — не корректный массив JSON, либо неверны имя шага или `path`.
- `OPENAI_WS_TTS` настроен с URL HTTP вместо URL WebSocket или наоборот.
- `tts_vits_package_path` в `VITS_TTS` — не локальный пакет модели `.zip` и не распакованный каталог пакета, либо такого пути нет.
- В пакете `VITS_TTS` нет распознаваемых `.onnx`, config JSON или лексикона, либо в конфигурации отсутствуют `sample_rate` или отображения токенов.
- `tts_vits_options` в `VITS_TTS` — не корректный JSON, либо имена локальных параметров или числовые значения неверны.
- Неверный путь эндпоинта TTS/STT (например, используется chat/completions вместо аудиоэндпоинтов).
- `model_name` не существует или не соответствует API.
- После сохранения конфигурации не проведена реальная повторная проверка.
5) Правила заполнителей HTTP_TTS (по реализации):
- Обязательный заполнитель: `{text}`.
  - При `http_method=GET` заполнитель `{text}` должен присутствовать в `url_template`.
  - При `http_method=POST` заполнитель `{text}` должен присутствовать в `request_body`.
- Необязательные заполнители: `{rate}`, `{pitch}`, `{voice}`.
- Стабильные заполнители для внешней конфигурации: `{text}`, `{rate}`, `{pitch}`, `{voice}`, `{apiKey}`, `{model}`, `{locale}`, `{uuid}`.
6) Примечания по обработке ответа HTTP_TTS (совместимо с выпущенными конфигурациями):
- Оставьте `response_pipeline` пустым или используйте `[]`, чтобы сохранить прежнее поведение: первое тело ответа сразу считается звуком.
- Заполняйте `response_pipeline` только когда служба возвращает JSON, вложенные поля или ссылку на скачивание до появления звука.
- Сейчас поддерживаются шаги: `parse_json`, `pick`, `parse_json_string`, `http_get`, `http_request_from_object`, `base64_decode`.
- Частый случай со ссылкой на скачивание в JSON:
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"audio_uri"},{"type":"http_get"}]`
- Если выбранное поле само является строкой JSON:
  - `response_pipeline`: `[{"type":"parse_json"},{"type":"pick","path":"data.payload"},{"type":"parse_json_string"},{"type":"pick","path":"audio.url"},{"type":"http_get"}]`
7) Минимальные шаблоны для копирования:
- HTTP TTS (GET):
  - `url_template`: `https://example.com/tts?text={text}`
  - `headers`: `{}`
  - `http_method`: `GET`
  - `content_type`: `application/json`
- HTTP TTS (POST):
  - `url_template`: `https://example.com/tts`
  - `headers`: `{"Authorization":"Bearer <API_KEY>"}`
  - `http_method`: `POST`
  - `content_type`: `application/json`
  - `request_body`: `{"text":"{text}"}`
- OpenAI STT (частый вариант по умолчанию):
  - `endpoint_url`: `https://api.openai.com/v1/audio/transcriptions`
  - `model_name`: `whisper-1`
8) Рекомендуемый порядок поиска неисправностей:
- Сначала подтвердите выбранный тип движка (TTS и STT отдельно).
- Проверьте эндпоинт, ключ и модель в связке.
- Затем проверьте поля шаблона HTTP (headers JSON, method, body, заполнитель, response_pipeline).
- Выполните хотя бы одну реальную проверку воспроизведения TTS; если нужно искать неисправности и в STT, проверьте распознавание отдельным голосовым потоком.
9) Связанные инструменты:
- `get_speech_services_config`: получить текущий снимок конфигурации TTS/STT (типы движков и ключевые поля).
- `set_speech_services_config`: обновить поля конфигурации TTS/STT (поддерживается частичное обновление).
- `test_tts_playback`: воспроизвести одну тестовую фразу с текущей конфигурацией TTS (поддерживает временное переопределение скорости и высоты тона).

[Правила мультимодального ввода]
1) Смысл переключателей возможностей:
- Переключатели Tool Call, изображения, аудио и видео в конфигурации модели — это маркеры возможностей на стороне программы, а не доказательство реальных возможностей модели.
- Настраивайте эти переключатели по фактической поддержке модели; не включайте их вслепую.
2) Основной путь понимания изображений в приложении:
- Если конфигурация модели функции чата включает понимание изображений и модель действительно это поддерживает, приложенные изображения отправляются прямо этой модели чата.
- Если модель чата не поддерживает понимание изображений, приложение попробует OCR или использует отдельную функциональную модель распознавания изображений как посредника.
3) Условия, при которых пользователю доступно понимание изображений:
- Условие A: модель чата поддерживает понимание изображений.
- Условие B: модель чата не поддерживает понимание изображений, но функциональная модель распознавания изображений поддерживает.
- Если модель распознавания изображений тоже не поддерживает, в итоге используется OCR.

[Примечание о выводе рисунков]
- Рисование реализовано через инструменты пакетов.
- В приложении есть несколько встроенных пакетов рисования; посмотрите их через list_sandbox_packages.
- Обычно достаточно включить один доступный пакет рисования; включать все не нужно.

[Принципы выполнения]
- Строго следуйте явным указаниям пользователя; не определяйте собственную «проблему» и не добавляйте не запрошенные цели.
- Любое действие, меняющее конфигурацию (переключатель, импорт, удаление, запись переменной среды, CRUD конфигурации модели, перезапуск), требует предварительного явного подтверждения пользователя.
- Если пользователь явно не просил выполнить конкретный инструмент, не запускайте инициативно инструменты записи.
- Отвечайте конкретными путями и правилами из этого руководства, избегая общих предположений.'''
      }
      parameters: []
      advice: true
    },
    {
      name: "how_make_skill"
      description: {
        zh: '''返回如何制作 skill 的双语说明。'''
        en: '''Return a bilingual guide for creating a skill.'''
        ru: '''Возвращает двуязычное руководство по созданию skill.'''
      }
      parameters: []
    },
    {
      name: "list_sandbox_packages"
      description: {
        zh: '''获取沙盒包列表（内置+外部）及当前启用状态、管理路径。'''
        en: '''Get sandbox package list (built-in + external), current enabled states, and management paths.'''
        ru: '''Возвращает список пакетов песочницы (встроенных и внешних), текущие состояния включения и пути управления.'''
      }
      parameters: []
    },
    {
      name: "set_sandbox_package_enabled"
      description: {
        zh: '''设置沙盒包开关状态。'''
        en: '''Set sandbox package enabled state.'''
        ru: '''Задаёт состояние включения пакета песочницы.'''
      }
      parameters: [
        {
          name: "package_name"
          description: {
            zh: "沙盒包名称"
            en: "Sandbox package name"
            ru: "Имя пакета песочницы"
          }
          type: string
          required: true
        },
        {
          name: "enabled"
          description: {
            zh: "是否启用（true/false）"
            en: "Enable state (true/false)"
            ru: "Состояние включения (true/false)"
          }
          type: boolean
          required: true
        }
      ]
    },
    {
      name: "debug_install_js_package"
      description: {
        zh: '''将 Android 侧的普通 `.js` 沙盒包直接烧录到外部 packages 目录，并刷新、启用、重新加载，便于在软件内调试。'''
        en: '''Install an Android-side plain `.js` sandbox package into the external packages directory, refresh it, enable it, and reload it for in-app debugging.'''
        ru: '''Устанавливает обычный `.js` пакет песочницы со стороны Android во внешний каталог packages, обновляет его, включает и перезагружает для отладки внутри приложения.'''
      }
      parameters: [
        {
          name: "source_path"
          description: {
            zh: "Android 侧 `.js` 源文件路径"
            en: "Android-side `.js` source file path"
            ru: "Путь к исходному файлу `.js` на стороне Android"
          }
          type: string
          required: true
        },
        {
          name: "enable_after_install"
          description: {
            zh: "安装后是否自动启用，默认 true"
            en: "Whether to enable it automatically after install, default true"
            ru: "Включать ли автоматически после установки, по умолчанию true"
          }
          type: boolean
          required: false
        },
        {
          name: "activate_after_install"
          description: {
            zh: "安装后是否自动 use_package 重新加载，默认 true"
            en: "Whether to automatically call use_package after install, default true"
            ru: "Вызывать ли автоматически use_package после установки, по умолчанию true"
          }
          type: boolean
          required: false
        }
      ]
    },
    {
      name: "debug_install_toolpkg"
      description: {
        zh: '''根据 Android 侧的 ToolPkg 目录、manifest 或现成 `.toolpkg`，直接打包/烧录到外部 packages 目录，并触发 ToolPkg 安装与刷新链路。'''
        en: '''Package or install an Android-side ToolPkg folder, manifest, or existing `.toolpkg` into the external packages directory and trigger the ToolPkg install/refresh flow.'''
        ru: '''Упаковывает или устанавливает папку ToolPkg, manifest или готовый `.toolpkg` со стороны Android во внешний каталог packages и запускает поток установки и обновления ToolPkg.'''
      }
      parameters: [
        {
          name: "source_path"
          description: {
            zh: "Android 侧 ToolPkg 目录、manifest.json/manifest.hjson 或 `.toolpkg` 路径"
            en: "Android-side ToolPkg folder, manifest.json/manifest.hjson, or `.toolpkg` path"
            ru: "Путь к папке ToolPkg, manifest.json/manifest.hjson или `.toolpkg` на стороне Android"
          }
          type: string
          required: true
        },
        {
          name: "reset_subpackage_states"
          description: {
            zh: "是否按 manifest 默认值重置子包启用状态，默认 true"
            en: "Whether to reset subpackage enable states from manifest defaults, default true"
            ru: "Сбрасывать ли состояния включения подпакетов по значениям по умолчанию из manifest, по умолчанию true"
          }
          type: boolean
          required: false
        },
        {
          name: "activate_subpackages"
          description: {
            zh: "可选，逗号或换行分隔的子包 ID；安装后会自动启用并 use_package"
            en: "Optional comma/newline separated subpackage IDs; they will be enabled and activated after install"
            ru: "Необязательно: ID подпакетов через запятую или перевод строки; после установки они будут включены и активированы"
          }
          type: string
          required: false
        },
        {
          name: "wait_ms"
          description: {
            zh: "安装广播后等待并轮询刷新的毫秒数，默认 1500"
            en: "Milliseconds to wait and poll for refresh after sending the install broadcast, default 1500"
            ru: "Сколько миллисекунд ждать и опрашивать обновление после отправки широковещательного сообщения об установке, по умолчанию 1500"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "debug_run_sandbox_script"
      description: {
        zh: '''直接运行一段 sandbox script。可传 Android 侧 `source_path`，也可直接传 `source_code` 内联代码；会返回结构化执行结果与日志事件。'''
        en: '''Run a sandbox script directly. Accepts either an Android-side `source_path` or inline `source_code`, and returns structured execution results with log events.'''
        ru: '''Запускает скрипт песочницы напрямую. Принимает либо `source_path` на стороне Android, либо встроенный `source_code` и возвращает структурированные результаты выполнения с событиями журнала.'''
      }
      parameters: [
        {
          name: "source_path"
          description: {
            zh: "Android 侧脚本文件路径；与 source_code 二选一"
            en: "Android-side script file path; use either this or source_code"
            ru: "Путь к файлу скрипта на стороне Android; используйте либо его, либо source_code"
          }
          type: string
          required: false
        },
        {
          name: "source_code"
          description: {
            zh: "直接执行的内联 JavaScript 代码；与 source_path 二选一"
            en: "Inline JavaScript code to execute directly; use either this or source_path"
            ru: "Встроенный код JavaScript для непосредственного выполнения; используйте либо его, либо source_path"
          }
          type: string
          required: false
        },
        {
          name: "params_json"
          description: {
            zh: "传给脚本运行时的 JSON 参数字符串，默认 {}"
            en: "JSON parameter string passed to the script runtime, default {}"
            ru: "Строка параметров JSON, передаваемая среде выполнения скрипта, по умолчанию {}"
          }
          type: string
          required: false
        },
        {
          name: "env_file_path"
          description: {
            zh: "可选，Android 侧 env 文件路径"
            en: "Optional Android-side env file path"
            ru: "Необязательный путь к файлу env на стороне Android"
          }
          type: string
          required: false
        },
        {
          name: "script_label"
          description: {
            zh: "可选，仅用于内联代码模式下生成结果文件名和显示标识"
            en: "Optional label used only for inline-code mode to name the result file and display path"
            ru: "Необязательная метка, используемая только в режиме встроенного кода для имени файла результата и отображаемого пути"
          }
          type: string
          required: false
        },
        {
          name: "wait_ms"
          description: {
            zh: "等待结构化结果文件的毫秒数，默认 15000"
            en: "Milliseconds to wait for the structured result file, default 15000"
            ru: "Сколько миллисекунд ждать файл структурированного результата, по умолчанию 15000"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "read_environment_variable"
      description: {
        zh: '''读取指定环境变量当前值（仅用于沙盒包脚本环境变量排查，不用于 MCP 配置）。'''
        en: '''Read current value of a specified environment variable (sandbox-package script env troubleshooting only, not MCP config env).'''
        ru: '''Читает текущее значение указанной переменной среды (только для поиска неисправностей переменных среды скриптов пакетов песочницы, не для env конфигурации MCP).'''
      }
      parameters: [
        {
          name: "key"
          description: {
            zh: "环境变量名"
            en: "Environment variable key"
            ru: "Имя переменной среды"
          }
          type: string
          required: true
        }
      ]
    },
    {
      name: "write_environment_variable"
      description: {
        zh: '''写入指定环境变量；value 为空时会清除该变量（仅用于沙盒包脚本环境变量，不用于 MCP 配置 env）。'''
        en: '''Write a specified environment variable; empty value clears it (sandbox-package script env only, not MCP config env).'''
        ru: '''Записывает указанную переменную среды; пустое значение очищает её (только для env скриптов пакетов песочницы, не для env конфигурации MCP).'''
      }
      parameters: [
        {
          name: "key"
          description: {
            zh: "环境变量名"
            en: "Environment variable key"
            ru: "Имя переменной среды"
          }
          type: string
          required: true
        },
        {
          name: "value"
          description: {
            zh: "变量值；为空时清除该变量"
            en: "Variable value; empty clears the variable"
            ru: "Значение переменной; пустое значение очищает переменную"
          }
          type: string
          required: false
        }
      ]
    },
    {
      name: "restart_mcp_with_logs"
      description: {
        zh: '''触发一次 MCP 重启流程，返回每个插件的启动日志与状态摘要。'''
        en: '''Trigger one MCP restart flow and return per-plugin startup logs with status summary.'''
        ru: '''Запускает один поток перезапуска MCP и возвращает журналы запуска по каждому плагину со сводкой состояния.'''
      }
      parameters: [
        {
          name: "timeout_ms"
          description: {
            zh: "可选，最大等待时长（毫秒）"
            en: "Optional max wait time in milliseconds"
            ru: "Необязательное максимальное время ожидания в миллисекундах"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "get_speech_services_config"
      description: {
        zh: '''获取当前 TTS/STT 语音服务配置快照。'''
        en: '''Get current TTS/STT speech services config snapshot.'''
        ru: '''Возвращает текущий снимок конфигурации голосовых служб TTS/STT.'''
      }
      parameters: []
    },
    {
      name: "set_speech_services_config"
      description: {
        zh: '''按字段更新 TTS/STT 语音服务配置（支持部分字段更新）。'''
        en: '''Update TTS/STT speech services config by fields (partial update supported).'''
        ru: '''Обновляет конфигурацию голосовых служб TTS/STT по полям (поддерживается частичное обновление).'''
      }
      parameters: [
        {
          name: "tts_service_type"
          description: {
            zh: "可选，SIMPLE_TTS/HTTP_TTS/OPENAI_WS_TTS/SILICONFLOW_TTS/MINIMAX_TTS/MIMO_TTS/DOUBAO_TTS/OPENAI_TTS/VITS_TTS"
            en: "Optional, SIMPLE_TTS/HTTP_TTS/OPENAI_WS_TTS/SILICONFLOW_TTS/MINIMAX_TTS/MIMO_TTS/DOUBAO_TTS/OPENAI_TTS/VITS_TTS"
            ru: "Необязательно, SIMPLE_TTS/HTTP_TTS/OPENAI_WS_TTS/SILICONFLOW_TTS/MINIMAX_TTS/MIMO_TTS/DOUBAO_TTS/OPENAI_TTS/VITS_TTS"
          }
          type: string
          required: false
        },
        {
          name: "tts_url_template"
          description: {
            zh: "可选，HTTP 类 TTS 的 URL 模板。HTTP 系列仅支持 `{text}`、`{rate}`、`{pitch}`、`{voice}`"
            en: "Optional URL template for HTTP-style TTS providers. HTTP-style providers support only `{text}`, `{rate}`, `{pitch}`, `{voice}`"
            ru: "Необязательный шаблон URL для TTS-провайдеров HTTP-типа. Провайдеры HTTP-типа поддерживают только `{text}`, `{rate}`, `{pitch}`, `{voice}`"
          }
          type: string
          required: false
        },
        {
          name: "tts_api_key"
          description: {
            zh: "可选，TTS API Key"
            en: "Optional TTS API key"
            ru: "Необязательный ключ API TTS"
          }
          type: string
          required: false
        },
        {
          name: "tts_headers"
          description: {
            zh: "可选，HTTP 类 TTS headers 的 JSON 对象字符串"
            en: "Optional JSON object string for HTTP-style TTS headers"
            ru: "Необязательная строка объекта JSON для заголовков TTS HTTP-типа"
          }
          type: string
          required: false
        },
        {
          name: "tts_http_method"
          description: {
            zh: "可选，GET/POST"
            en: "Optional, GET/POST"
            ru: "Необязательно, GET/POST"
          }
          type: string
          required: false
        },
        {
          name: "tts_request_body"
          description: {
            zh: "可选，HTTP 类 TTS 的 POST body 模板。仅支持 `{text}`、`{rate}`、`{pitch}`、`{voice}`"
            en: "Optional POST body template for HTTP-style TTS providers. Supports only `{text}`, `{rate}`, `{pitch}`, `{voice}`"
            ru: "Необязательный шаблон тела POST для TTS-провайдеров HTTP-типа. Поддерживаются только `{text}`, `{rate}`, `{pitch}`, `{voice}`"
          }
          type: string
          required: false
        },
        {
          name: "tts_content_type"
          description: {
            zh: "可选，TTS Content-Type"
            en: "Optional TTS content type"
            ru: "Необязательный тип содержимого TTS"
          }
          type: string
          required: false
        },
        {
          name: "tts_locale"
          description: {
            zh: "可选，TTS 语言标签，例如 zh-CN 或 en-US"
            en: "Optional TTS locale tag, for example zh-CN or en-US"
            ru: "Необязательный тег локали TTS, например zh-CN или en-US"
          }
          type: string
          required: false
        },
        {
          name: "tts_voice_id"
          description: {
            zh: "可选，TTS 音色 ID。MIMO voiceclone 可填写完整 data:audio/...;base64,... 音频样本"
            en: "Optional TTS voice id. For MIMO voiceclone, this may be the full data:audio/...;base64,... audio sample"
            ru: "Необязательный ID голоса TTS. Для клонирования голоса MIMO здесь может быть полный аудиообразец data:audio/...;base64,..."
          }
          type: string
          required: false
        },
        {
          name: "tts_model_name"
          description: {
            zh: "可选，TTS 模型名"
            en: "Optional TTS model name"
            ru: "Необязательное имя модели TTS"
          }
          type: string
          required: false
        },
        {
          name: "tts_vits_package_path"
          description: {
            zh: "可选，本地 VITS/Piper TTS 模型包路径，支持 .zip 文件或已解压目录"
            en: "Optional local VITS/Piper TTS package path, supporting a .zip file or extracted package directory"
            ru: "Необязательный путь к локальному пакету TTS VITS/Piper: файл .zip или распакованный каталог пакета"
          }
          type: string
          required: false
        },
        {
          name: "tts_vits_speaker_id"
          description: {
            zh: "可选，VITS/Piper TTS 模型包需要的数字 speaker id"
            en: "Optional numeric speaker id required by the VITS/Piper TTS package"
            ru: "Необязательный числовой id говорящего, требуемый пакетом TTS VITS/Piper"
          }
          type: string
          required: false
        },
        {
          name: "tts_vits_options"
          description: {
            zh: "可选，VITS/Piper TTS 模型包参数 JSON 对象字符串"
            en: "Optional JSON object string for VITS/Piper TTS package options"
            ru: "Необязательная строка объекта JSON для параметров пакета TTS VITS/Piper"
          }
          type: string
          required: false
        },
        {
          name: "tts_response_pipeline"
          description: {
            zh: "可选，HTTP TTS 响应处理管线 JSON 数组字符串。留空或 `[]` 时保持旧行为，直接把响应体当音频"
            en: "Optional HTTP TTS response pipeline JSON array string. Leave empty or use `[]` to keep the old direct-audio behavior"
            ru: "Необязательная строка массива JSON конвейера обработки ответа HTTP TTS. Оставьте пустой или укажите `[]`, чтобы сохранить прежнее поведение с прямым аудио"
          }
          type: string
          required: false
        },
        {
          name: "tts_cleaner_regexs"
          description: {
            zh: "可选，TTS 清理正则列表 JSON 数组字符串"
            en: "Optional JSON array string for TTS cleaner regex list"
            ru: "Необязательная строка массива JSON со списком regex для очистки TTS"
          }
          type: string
          required: false
        },
        {
          name: "tts_speech_rate"
          description: {
            zh: "可选，TTS 语速"
            en: "Optional TTS speech rate"
            ru: "Необязательная скорость речи TTS"
          }
          type: number
          required: false
        },
        {
          name: "tts_pitch"
          description: {
            zh: "可选，TTS 音调"
            en: "Optional TTS pitch"
            ru: "Необязательная высота тона TTS"
          }
          type: number
          required: false
        },
        {
          name: "stt_service_type"
          description: {
            zh: "可选，SHERPA_NCNN/OPENAI_STT/DEEPGRAM_STT"
            en: "Optional, SHERPA_NCNN/OPENAI_STT/DEEPGRAM_STT"
            ru: "Необязательно, SHERPA_NCNN/OPENAI_STT/DEEPGRAM_STT"
          }
          type: string
          required: false
        },
        {
          name: "stt_endpoint_url"
          description: {
            zh: "可选，STT endpoint URL"
            en: "Optional STT endpoint URL"
            ru: "Необязательный URL эндпоинта STT"
          }
          type: string
          required: false
        },
        {
          name: "stt_api_key"
          description: {
            zh: "可选，STT API Key"
            en: "Optional STT API key"
            ru: "Необязательный ключ API STT"
          }
          type: string
          required: false
        },
        {
          name: "stt_model_name"
          description: {
            zh: "可选，STT 模型名"
            en: "Optional STT model name"
            ru: "Необязательное имя модели STT"
          }
          type: string
          required: false
        }
      ]
    },
    {
      name: "test_tts_playback"
      description: {
        zh: '''按当前 TTS 配置播放一次测试文本。'''
        en: '''Play one TTS test utterance with the current configuration.'''
        ru: '''Воспроизводит одну тестовую фразу TTS с текущей конфигурацией.'''
      }
      parameters: [
        {
          name: "text"
          description: {
            zh: "必填，要播放的测试文本"
            en: "Required test text to play"
            ru: "Обязательный тестовый текст для воспроизведения"
          }
          type: string
          required: true
        },
        {
          name: "interrupt"
          description: {
            zh: "可选，播放前是否先中断当前播报"
            en: "Optional, interrupt current playback before this test"
            ru: "Необязательно, прерывать ли текущее воспроизведение перед этой проверкой"
          }
          type: boolean
          required: false
        },
        {
          name: "speech_rate"
          description: {
            zh: "可选，仅本次测试生效的语速覆盖值"
            en: "Optional speech-rate override for this test only"
            ru: "Необязательное переопределение скорости речи только для этой проверки"
          }
          type: number
          required: false
        },
        {
          name: "pitch"
          description: {
            zh: "可选，仅本次测试生效的音调覆盖值"
            en: "Optional pitch override for this test only"
            ru: "Необязательное переопределение высоты тона только для этой проверки"
          }
          type: number
          required: false
        }
      ]
    },
    {
      name: "list_model_configs"
      description: {
        zh: '''列出全部模型配置及功能模型绑定关系。'''
        en: '''List all model configs and function-model bindings.'''
        ru: '''Выводит все конфигурации моделей и привязки функциональных моделей.'''
      }
      parameters: []
    },
    {
      name: "create_model_config"
      description: {
        zh: '''新增模型配置（可带初始化字段）。'''
        en: '''Create a model config (optional initialization fields).'''
        ru: '''Создаёт конфигурацию модели (необязательные поля инициализации).'''
      }
      parameters: [
        {
          name: "name"
          description: {
            zh: "可选，配置名称"
            en: "Optional config name"
            ru: "Необязательное имя конфигурации"
          }
          type: string
          required: false
        },
        {
          name: "api_provider_type"
          description: {
            zh: "可选，提供商枚举名（如 OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP；其中 LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP 为本地模型链路）"
            en: "Optional provider enum name (e.g. OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP; LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP are local-model providers)"
            ru: "Необязательное имя перечисления провайдера (например, OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP; LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP — провайдеры локальных моделей)"
          }
          type: string
          required: false
        },
        {
          name: "api_endpoint"
          description: {
            zh: "可选，API端点"
            en: "Optional API endpoint"
            ru: "Необязательный эндпоинт API"
          }
          type: string
          required: false
        },
        {
          name: "api_key"
          description: {
            zh: "可选，API Key"
            en: "Optional API key"
            ru: "Необязательный ключ API"
          }
          type: string
          required: false
        },
        {
          name: "model_name"
          description: {
            zh: "可选，模型名（多个可逗号分隔）"
            en: "Optional model name (comma-separated for multiple models)"
            ru: "Необязательное имя модели (несколько моделей — через запятую)"
          }
          type: string
          required: false
        },
        {
          name: "max_tokens_enabled"
          description: {
            zh: "可选，是否启用 max_tokens 参数"
            en: "Optional switch for max_tokens"
            ru: "Необязательный переключатель max_tokens"
          }
          type: boolean
          required: false
        },
        {
          name: "max_tokens"
          description: {
            zh: "可选，max_tokens 数值"
            en: "Optional max_tokens value"
            ru: "Необязательное значение max_tokens"
          }
          type: integer
          required: false
        },
        {
          name: "temperature_enabled"
          description: {
            zh: "可选，是否启用 temperature 参数"
            en: "Optional switch for temperature"
            ru: "Необязательный переключатель temperature"
          }
          type: boolean
          required: false
        },
        {
          name: "temperature"
          description: {
            zh: "可选，temperature 数值"
            en: "Optional temperature value"
            ru: "Необязательное значение temperature"
          }
          type: number
          required: false
        },
        {
          name: "top_p_enabled"
          description: {
            zh: "可选，是否启用 top_p 参数"
            en: "Optional switch for top_p"
            ru: "Необязательный переключатель top_p"
          }
          type: boolean
          required: false
        },
        {
          name: "top_p"
          description: {
            zh: "可选，top_p 数值"
            en: "Optional top_p value"
            ru: "Необязательное значение top_p"
          }
          type: number
          required: false
        },
        {
          name: "top_k_enabled"
          description: {
            zh: "可选，是否启用 top_k 参数"
            en: "Optional switch for top_k"
            ru: "Необязательный переключатель top_k"
          }
          type: boolean
          required: false
        },
        {
          name: "top_k"
          description: {
            zh: "可选，top_k 数值"
            en: "Optional top_k value"
            ru: "Необязательное значение top_k"
          }
          type: integer
          required: false
        },
        {
          name: "presence_penalty_enabled"
          description: {
            zh: "可选，是否启用 presence_penalty 参数"
            en: "Optional switch for presence_penalty"
            ru: "Необязательный переключатель presence_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "presence_penalty"
          description: {
            zh: "可选，presence_penalty 数值"
            en: "Optional presence_penalty value"
            ru: "Необязательное значение presence_penalty"
          }
          type: number
          required: false
        },
        {
          name: "frequency_penalty_enabled"
          description: {
            zh: "可选，是否启用 frequency_penalty 参数"
            en: "Optional switch for frequency_penalty"
            ru: "Необязательный переключатель frequency_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "frequency_penalty"
          description: {
            zh: "可选，frequency_penalty 数值"
            en: "Optional frequency_penalty value"
            ru: "Необязательное значение frequency_penalty"
          }
          type: number
          required: false
        },
        {
          name: "repetition_penalty_enabled"
          description: {
            zh: "可选，是否启用 repetition_penalty 参数"
            en: "Optional switch for repetition_penalty"
            ru: "Необязательный переключатель repetition_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "repetition_penalty"
          description: {
            zh: "可选，repetition_penalty 数值"
            en: "Optional repetition_penalty value"
            ru: "Необязательное значение repetition_penalty"
          }
          type: number
          required: false
        },
        {
          name: "custom_parameters"
          description: {
            zh: "可选，自定义参数 JSON 字符串"
            en: "Optional custom parameters JSON string"
            ru: "Необязательная строка JSON пользовательских параметров"
          }
          type: string
          required: false
        },
        {
          name: "custom_headers"
          description: {
            zh: "可选，自定义请求头 JSON 对象字符串"
            en: "Optional custom request headers JSON object string"
            ru: "Необязательная строка объекта JSON пользовательских заголовков запроса"
          }
          type: string
          required: false
        },
        {
          name: "context_length"
          description: {
            zh: "可选，上下文长度倍率"
            en: "Optional context length multiplier"
            ru: "Необязательный множитель длины контекста"
          }
          type: number
          required: false
        },
        {
          name: "max_context_length"
          description: {
            zh: "可选，最大上下文长度倍率"
            en: "Optional max context length multiplier"
            ru: "Необязательный множитель максимальной длины контекста"
          }
          type: number
          required: false
        },
        {
          name: "enable_max_context_mode"
          description: {
            zh: "可选，是否启用最大上下文模式"
            en: "Optional max-context mode switch"
            ru: "Необязательный переключатель режима максимального контекста"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_token_threshold"
          description: {
            zh: "可选，总结触发阈值"
            en: "Optional summary trigger threshold"
            ru: "Необязательный порог срабатывания сводки"
          }
          type: number
          required: false
        },
        {
          name: "enable_summary"
          description: {
            zh: "可选，是否启用总结"
            en: "Optional summary switch"
            ru: "Необязательный переключатель сводки"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_summary_by_message_count"
          description: {
            zh: "可选，是否按消息数触发总结"
            en: "Optional summary-by-message-count switch"
            ru: "Необязательный переключатель сводки по количеству сообщений"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_message_count_threshold"
          description: {
            zh: "可选，按消息数总结的阈值"
            en: "Optional message-count threshold for summary"
            ru: "Необязательный порог количества сообщений для сводки"
          }
          type: integer
          required: false
        },
        {
          name: "enable_direct_image_processing"
          description: {
            zh: "可选，是否启用直接图片处理"
            en: "Optional direct image processing switch"
            ru: "Необязательный переключатель прямой обработки изображений"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_direct_audio_processing"
          description: {
            zh: "可选，是否启用直接音频处理"
            en: "Optional direct audio processing switch"
            ru: "Необязательный переключатель прямой обработки аудио"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_direct_video_processing"
          description: {
            zh: "可选，是否启用直接视频处理"
            en: "Optional direct video processing switch"
            ru: "Необязательный переключатель прямой обработки видео"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_google_search"
          description: {
            zh: "可选，是否启用 Google Search"
            en: "Optional Google Search switch"
            ru: "Необязательный переключатель Google Search"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_claude_1h_prompt_cache"
          description: {
            zh: "可选，是否启用 Claude 1h Prompt Cache"
            en: "Optional Claude 1h prompt cache switch"
            ru: "Необязательный переключатель кэша промптов Claude на 1 ч"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_tool_call"
          description: {
            zh: "可选，是否开启Tool Call"
            en: "Optional tool-call switch"
            ru: "Необязательный переключатель вызова инструментов"
          }
          type: boolean
          required: false
        },
        {
          name: "mnn_forward_type"
          description: {
            zh: "可选，MNN 前向类型"
            en: "Optional MNN forward type"
            ru: "Необязательный тип прямого прохода MNN"
          }
          type: integer
          required: false
        },
        {
          name: "mnn_thread_count"
          description: {
            zh: "可选，MNN 线程数"
            en: "Optional MNN thread count"
            ru: "Необязательное число потоков MNN"
          }
          type: integer
          required: false
        },
        {
          name: "llama_thread_count"
          description: {
            zh: "可选，llama.cpp 线程数"
            en: "Optional llama.cpp thread count"
            ru: "Необязательное число потоков llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "llama_context_size"
          description: {
            zh: "可选，llama.cpp 上下文长度"
            en: "Optional llama.cpp context size"
            ru: "Необязательный размер контекста llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "llama_gpu_layers"
          description: {
            zh: "可选，llama.cpp GPU 层数"
            en: "Optional llama.cpp GPU layer count"
            ru: "Необязательное число слоёв GPU llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "request_limit_per_minute"
          description: {
            zh: "可选，每分钟请求限制"
            en: "Optional request-per-minute limit"
            ru: "Необязательный лимит запросов в минуту"
          }
          type: integer
          required: false
        },
        {
          name: "max_concurrent_requests"
          description: {
            zh: "可选，最大并发请求数"
            en: "Optional max concurrent requests"
            ru: "Необязательное максимальное число одновременных запросов"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "update_model_config"
      description: {
        zh: '''按 config_id 修改模型配置。'''
        en: '''Update model config by config_id.'''
        ru: '''Изменяет конфигурацию модели по config_id.'''
      }
      parameters: [
        {
          name: "config_id"
          description: {
            zh: "目标配置ID"
            en: "Target config id"
            ru: "ID целевой конфигурации"
          }
          type: string
          required: true
        },
        {
          name: "name"
          description: {
            zh: "可选，配置名称"
            en: "Optional config name"
            ru: "Необязательное имя конфигурации"
          }
          type: string
          required: false
        },
        {
          name: "api_provider_type"
          description: {
            zh: "可选，提供商枚举名（如 OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP；其中 LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP 为本地模型链路）"
            en: "Optional provider enum name (e.g. OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP; LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP are local-model providers)"
            ru: "Необязательное имя перечисления провайдера (например, OPENAI_GENERIC/OPENAI_LOCAL/OPENAI_RESPONSES_GENERIC/DEEPSEEK/GEMINI_GENERIC/LMSTUDIO/OLLAMA/MNN/LLAMA_CPP; LMSTUDIO/OLLAMA/OPENAI_LOCAL/MNN/LLAMA_CPP — провайдеры локальных моделей)"
          }
          type: string
          required: false
        },
        {
          name: "api_endpoint"
          description: {
            zh: "可选，API端点"
            en: "Optional API endpoint"
            ru: "Необязательный эндпоинт API"
          }
          type: string
          required: false
        },
        {
          name: "api_key"
          description: {
            zh: "可选，API Key"
            en: "Optional API key"
            ru: "Необязательный ключ API"
          }
          type: string
          required: false
        },
        {
          name: "model_name"
          description: {
            zh: "可选，模型名（多个可逗号分隔）"
            en: "Optional model name (comma-separated for multiple models)"
            ru: "Необязательное имя модели (несколько моделей — через запятую)"
          }
          type: string
          required: false
        },
        {
          name: "max_tokens_enabled"
          description: {
            zh: "可选，是否启用 max_tokens 参数"
            en: "Optional switch for max_tokens"
            ru: "Необязательный переключатель max_tokens"
          }
          type: boolean
          required: false
        },
        {
          name: "max_tokens"
          description: {
            zh: "可选，max_tokens 数值"
            en: "Optional max_tokens value"
            ru: "Необязательное значение max_tokens"
          }
          type: integer
          required: false
        },
        {
          name: "temperature_enabled"
          description: {
            zh: "可选，是否启用 temperature 参数"
            en: "Optional switch for temperature"
            ru: "Необязательный переключатель temperature"
          }
          type: boolean
          required: false
        },
        {
          name: "temperature"
          description: {
            zh: "可选，temperature 数值"
            en: "Optional temperature value"
            ru: "Необязательное значение temperature"
          }
          type: number
          required: false
        },
        {
          name: "top_p_enabled"
          description: {
            zh: "可选，是否启用 top_p 参数"
            en: "Optional switch for top_p"
            ru: "Необязательный переключатель top_p"
          }
          type: boolean
          required: false
        },
        {
          name: "top_p"
          description: {
            zh: "可选，top_p 数值"
            en: "Optional top_p value"
            ru: "Необязательное значение top_p"
          }
          type: number
          required: false
        },
        {
          name: "top_k_enabled"
          description: {
            zh: "可选，是否启用 top_k 参数"
            en: "Optional switch for top_k"
            ru: "Необязательный переключатель top_k"
          }
          type: boolean
          required: false
        },
        {
          name: "top_k"
          description: {
            zh: "可选，top_k 数值"
            en: "Optional top_k value"
            ru: "Необязательное значение top_k"
          }
          type: integer
          required: false
        },
        {
          name: "presence_penalty_enabled"
          description: {
            zh: "可选，是否启用 presence_penalty 参数"
            en: "Optional switch for presence_penalty"
            ru: "Необязательный переключатель presence_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "presence_penalty"
          description: {
            zh: "可选，presence_penalty 数值"
            en: "Optional presence_penalty value"
            ru: "Необязательное значение presence_penalty"
          }
          type: number
          required: false
        },
        {
          name: "frequency_penalty_enabled"
          description: {
            zh: "可选，是否启用 frequency_penalty 参数"
            en: "Optional switch for frequency_penalty"
            ru: "Необязательный переключатель frequency_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "frequency_penalty"
          description: {
            zh: "可选，frequency_penalty 数值"
            en: "Optional frequency_penalty value"
            ru: "Необязательное значение frequency_penalty"
          }
          type: number
          required: false
        },
        {
          name: "repetition_penalty_enabled"
          description: {
            zh: "可选，是否启用 repetition_penalty 参数"
            en: "Optional switch for repetition_penalty"
            ru: "Необязательный переключатель repetition_penalty"
          }
          type: boolean
          required: false
        },
        {
          name: "repetition_penalty"
          description: {
            zh: "可选，repetition_penalty 数值"
            en: "Optional repetition_penalty value"
            ru: "Необязательное значение repetition_penalty"
          }
          type: number
          required: false
        },
        {
          name: "custom_parameters"
          description: {
            zh: "可选，自定义参数 JSON 字符串"
            en: "Optional custom parameters JSON string"
            ru: "Необязательная строка JSON пользовательских параметров"
          }
          type: string
          required: false
        },
        {
          name: "custom_headers"
          description: {
            zh: "可选，自定义请求头 JSON 对象字符串"
            en: "Optional custom request headers JSON object string"
            ru: "Необязательная строка объекта JSON пользовательских заголовков запроса"
          }
          type: string
          required: false
        },
        {
          name: "context_length"
          description: {
            zh: "可选，上下文长度倍率"
            en: "Optional context length multiplier"
            ru: "Необязательный множитель длины контекста"
          }
          type: number
          required: false
        },
        {
          name: "max_context_length"
          description: {
            zh: "可选，最大上下文长度倍率"
            en: "Optional max context length multiplier"
            ru: "Необязательный множитель максимальной длины контекста"
          }
          type: number
          required: false
        },
        {
          name: "enable_max_context_mode"
          description: {
            zh: "可选，是否启用最大上下文模式"
            en: "Optional max-context mode switch"
            ru: "Необязательный переключатель режима максимального контекста"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_token_threshold"
          description: {
            zh: "可选，总结触发阈值"
            en: "Optional summary trigger threshold"
            ru: "Необязательный порог срабатывания сводки"
          }
          type: number
          required: false
        },
        {
          name: "enable_summary"
          description: {
            zh: "可选，是否启用总结"
            en: "Optional summary switch"
            ru: "Необязательный переключатель сводки"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_summary_by_message_count"
          description: {
            zh: "可选，是否按消息数触发总结"
            en: "Optional summary-by-message-count switch"
            ru: "Необязательный переключатель сводки по количеству сообщений"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_message_count_threshold"
          description: {
            zh: "可选，按消息数总结的阈值"
            en: "Optional message-count threshold for summary"
            ru: "Необязательный порог количества сообщений для сводки"
          }
          type: integer
          required: false
        },
        {
          name: "enable_direct_image_processing"
          description: {
            zh: "可选，是否启用直接图片处理"
            en: "Optional direct image processing switch"
            ru: "Необязательный переключатель прямой обработки изображений"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_direct_audio_processing"
          description: {
            zh: "可选，是否启用直接音频处理"
            en: "Optional direct audio processing switch"
            ru: "Необязательный переключатель прямой обработки аудио"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_direct_video_processing"
          description: {
            zh: "可选，是否启用直接视频处理"
            en: "Optional direct video processing switch"
            ru: "Необязательный переключатель прямой обработки видео"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_google_search"
          description: {
            zh: "可选，是否启用 Google Search"
            en: "Optional Google Search switch"
            ru: "Необязательный переключатель Google Search"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_claude_1h_prompt_cache"
          description: {
            zh: "可选，是否启用 Claude 1h Prompt Cache"
            en: "Optional Claude 1h prompt cache switch"
            ru: "Необязательный переключатель кэша промптов Claude на 1 ч"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_tool_call"
          description: {
            zh: "可选，是否开启Tool Call"
            en: "Optional tool-call switch"
            ru: "Необязательный переключатель вызова инструментов"
          }
          type: boolean
          required: false
        },
        {
          name: "mnn_forward_type"
          description: {
            zh: "可选，MNN 前向类型"
            en: "Optional MNN forward type"
            ru: "Необязательный тип прямого прохода MNN"
          }
          type: integer
          required: false
        },
        {
          name: "mnn_thread_count"
          description: {
            zh: "可选，MNN 线程数"
            en: "Optional MNN thread count"
            ru: "Необязательное число потоков MNN"
          }
          type: integer
          required: false
        },
        {
          name: "llama_thread_count"
          description: {
            zh: "可选，llama.cpp 线程数"
            en: "Optional llama.cpp thread count"
            ru: "Необязательное число потоков llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "llama_context_size"
          description: {
            zh: "可选，llama.cpp 上下文长度"
            en: "Optional llama.cpp context size"
            ru: "Необязательный размер контекста llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "llama_gpu_layers"
          description: {
            zh: "可选，llama.cpp GPU 层数"
            en: "Optional llama.cpp GPU layer count"
            ru: "Необязательное число слоёв GPU llama.cpp"
          }
          type: integer
          required: false
        },
        {
          name: "request_limit_per_minute"
          description: {
            zh: "可选，每分钟请求限制"
            en: "Optional request-per-minute limit"
            ru: "Необязательный лимит запросов в минуту"
          }
          type: integer
          required: false
        },
        {
          name: "max_concurrent_requests"
          description: {
            zh: "可选，最大并发请求数"
            en: "Optional max concurrent requests"
            ru: "Необязательное максимальное число одновременных запросов"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "delete_model_config"
      description: {
        zh: '''按 config_id 删除模型配置（默认配置不可删）。'''
        en: '''Delete model config by config_id (default cannot be deleted).'''
        ru: '''Удаляет конфигурацию модели по config_id (конфигурацию по умолчанию удалить нельзя).'''
      }
      parameters: [
        {
          name: "config_id"
          description: {
            zh: "目标配置ID"
            en: "Target config id"
            ru: "ID целевой конфигурации"
          }
          type: string
          required: true
        }
      ]
    },
    {
      name: "list_function_model_configs"
      description: {
        zh: '''仅列出功能模型绑定关系（功能 -> 配置 + 模型索引）。'''
        en: '''List function model bindings only (function -> config + model index).'''
        ru: '''Выводит только привязки функциональных моделей (функция → конфигурация + индекс модели).'''
      }
      parameters: []
    },
    {
      name: "get_function_model_config"
      description: {
        zh: '''查看某个功能当前绑定的单个模型配置详情。'''
        en: '''Get one function's currently bound model config detail.'''
        ru: '''Возвращает подробности конфигурации модели, привязанной сейчас к функции.'''
      }
      parameters: [
        {
          name: "function_type"
          description: {
            zh: "功能类型枚举名"
            en: "Function type enum name"
            ru: "Имя перечисления типа функции"
          }
          type: string
          required: true
        }
      ]
    },
    {
      name: "get_context_summary_config"
      description: {
        zh: '''获取某个功能当前绑定模型配置中的上下文总结参数。'''
        en: '''Get context-summary settings from the model config bound to a function.'''
        ru: '''Возвращает параметры сводки контекста из конфигурации модели, привязанной к функции.'''
      }
      parameters: [
        {
          name: "function_type"
          description: {
            zh: "可选，功能类型；默认 CHAT"
            en: "Optional function type; default CHAT"
            ru: "Необязательно: тип функции; по умолчанию CHAT"
          }
          type: string
          required: false
        }
      ]
    },
    {
      name: "set_context_summary_config"
      description: {
        zh: '''为某个功能绑定配置设置上下文总结参数（可选覆盖默认值）。'''
        en: '''Set context-summary settings for a function binding (optional overrides supported).'''
        ru: '''Задаёт параметры сводки контекста для привязки функции (переопределение значений по умолчанию поддерживается).'''
      }
      parameters: [
        {
          name: "function_type"
          description: {
            zh: "可选，功能类型；默认 CHAT"
            en: "Optional function type; default CHAT"
            ru: "Необязательно: тип функции; по умолчанию CHAT"
          }
          type: string
          required: false
        },
        {
          name: "context_length"
          description: {
            zh: "可选，基础上下文长度"
            en: "Optional base context length"
            ru: "Необязательная базовая длина контекста"
          }
          type: number
          required: false
        },
        {
          name: "max_context_length"
          description: {
            zh: "可选，最大上下文长度"
            en: "Optional max context length"
            ru: "Необязательная максимальная длина контекста"
          }
          type: number
          required: false
        },
        {
          name: "enable_max_context_mode"
          description: {
            zh: "可选，是否启用最大上下文模式"
            en: "Optional max-context-mode switch"
            ru: "Необязательный переключатель режима максимального контекста"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_token_threshold"
          description: {
            zh: "可选，总结触发 token 阈值（0~1）"
            en: "Optional token-ratio threshold for summary trigger (0~1)"
            ru: "Необязательный порог доли токенов для срабатывания сводки (0–1)"
          }
          type: number
          required: false
        },
        {
          name: "enable_summary"
          description: {
            zh: "可选，是否启用上下文总结"
            en: "Optional context-summary switch"
            ru: "Необязательный переключатель сводки контекста"
          }
          type: boolean
          required: false
        },
        {
          name: "enable_summary_by_message_count"
          description: {
            zh: "可选，是否启用按消息条数触发总结"
            en: "Optional message-count summary trigger switch"
            ru: "Необязательный переключатель срабатывания сводки по количеству сообщений"
          }
          type: boolean
          required: false
        },
        {
          name: "summary_message_count_threshold"
          description: {
            zh: "可选，按消息条数触发总结阈值"
            en: "Optional message-count threshold for summary trigger"
            ru: "Необязательный порог количества сообщений для срабатывания сводки"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "set_function_model_config"
      description: {
        zh: '''为功能指定模型配置与模型索引。'''
        en: '''Set model config and model index for a function.'''
        ru: '''Задаёт конфигурацию модели и индекс модели для функции.'''
      }
      parameters: [
        {
          name: "function_type"
          description: {
            zh: "功能类型枚举名"
            en: "Function type enum name"
            ru: "Имя перечисления типа функции"
          }
          type: string
          required: true
        },
        {
          name: "config_id"
          description: {
            zh: "模型配置ID"
            en: "Model config id"
            ru: "ID конфигурации модели"
          }
          type: string
          required: true
        },
        {
          name: "model_index"
          description: {
            zh: "可选，模型索引"
            en: "Optional model index"
            ru: "Необязательный индекс модели"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "test_model_config_connection"
      description: {
        zh: '''按设置页同等逻辑测试某个模型配置。'''
        en: '''Run settings-UI-equivalent tests for one model config.'''
        ru: '''Выполняет для конфигурации модели проверки, эквивалентные экрану настроек.'''
      }
      parameters: [
        {
          name: "config_id"
          description: {
            zh: "目标配置ID"
            en: "Target config id"
            ru: "ID целевой конфигурации"
          }
          type: string
          required: true
        },
        {
          name: "model_index"
          description: {
            zh: "可选，模型索引"
            en: "Optional model index"
            ru: "Необязательный индекс модели"
          }
          type: integer
          required: false
        }
      ]
    },
    {
      name: "list_character_cards"
      description: {
        zh: '''列出完整角色卡配置及当前活跃角色卡。'''
        en: '''List full character-card settings and the active character card.'''
        ru: '''Выводит полную конфигурацию карточек персонажей и активную карточку персонажа.'''
      }
      parameters: []
    },
    {
      name: "get_character_card"
      description: {
        zh: '''按角色卡 ID 获取完整配置。'''
        en: '''Get one full character-card configuration by id.'''
        ru: '''Возвращает полную конфигурацию одной карточки персонажа по ID.'''
      }
      parameters: [
        {
          name: "character_card_id"
          description: { zh: "角色卡 ID" en: "Character card id" ru: "ID карточки персонажа" }
          type: string
          required: true
        }
      ]
    },
    {
      name: "create_character_card"
      description: {
        zh: '''创建角色卡。name 必填；列表字段传 JSON 字符串数组。'''
        en: '''Create a character card. name is required; list fields use JSON string arrays.'''
        ru: '''Создаёт карточку персонажа. Поле name обязательно; поля-списки передаются как строковые массивы JSON.'''
      }
      parameters: [
        {
          name: "name"
          description: { zh: "角色卡名称" en: "Character card name" ru: "Название карточки персонажа" }
          type: string
          required: true
        },
        {
          name: "description"
          description: { zh: "可选，简介" en: "Optional description" ru: "Необязательное описание" }
          type: string
          required: false
        },
        {
          name: "character_setting"
          description: { zh: "可选，角色设定提示词" en: "Optional character-setting prompt" ru: "Необязательный промпт настройки персонажа" }
          type: string
          required: false
        },
        {
          name: "opening_statement"
          description: { zh: "可选，开场白" en: "Optional opening statement" ru: "Необязательная вступительная фраза" }
          type: string
          required: false
        },
        {
          name: "other_content_chat"
          description: { zh: "可选，聊天附加内容" en: "Optional chat content" ru: "Необязательное содержимое чата" }
          type: string
          required: false
        },
        {
          name: "other_content_voice"
          description: { zh: "可选，语音附加内容" en: "Optional voice content" ru: "Необязательное содержимое для голоса" }
          type: string
          required: false
        },
        {
          name: "attached_tag_ids"
          description: { zh: "可选，标签 ID 的 JSON 字符串数组" en: "Optional JSON string array of tag ids" ru: "Необязательный строковый массив JSON с ID тегов" }
          type: string
          required: false
        },
        {
          name: "advanced_custom_prompt"
          description: { zh: "可选，高级自定义提示词" en: "Optional advanced custom prompt" ru: "Необязательный расширенный пользовательский промпт" }
          type: string
          required: false
        },
        {
          name: "marks"
          description: { zh: "可选，备注" en: "Optional marks" ru: "Необязательные пометки" }
          type: string
          required: false
        },
        {
          name: "chat_model_binding_mode"
          description: { zh: "可选，FOLLOW_GLOBAL 或 FIXED_CONFIG" en: "Optional FOLLOW_GLOBAL or FIXED_CONFIG" ru: "Необязательно: FOLLOW_GLOBAL или FIXED_CONFIG" }
          type: string
          required: false
        },
        {
          name: "chat_model_config_id"
          description: { zh: "可选，固定对话模型配置 ID；空字符串清除" en: "Optional fixed chat-model config id; empty string clears" ru: "Необязательно: ID конфигурации фиксированной модели чата; пустая строка очищает" }
          type: string
          required: false
        },
        {
          name: "chat_model_index"
          description: { zh: "可选，固定对话模型索引" en: "Optional fixed chat-model index" ru: "Необязательный индекс фиксированной модели чата" }
          type: integer
          required: false
        },
        {
          name: "memory_profile_binding_mode"
          description: { zh: "可选，FOLLOW_GLOBAL 或 FIXED_PROFILE" en: "Optional FOLLOW_GLOBAL or FIXED_PROFILE" ru: "Необязательно: FOLLOW_GLOBAL или FIXED_PROFILE" }
          type: string
          required: false
        },
        {
          name: "memory_profile_id"
          description: { zh: "可选，固定记忆配置 ID；空字符串清除" en: "Optional fixed memory-profile id; empty string clears" ru: "Необязательно: ID фиксированного профиля памяти; пустая строка очищает" }
          type: string
          required: false
        },
        {
          name: "tool_access_enabled"
          description: { zh: "可选，启用角色卡工具白名单" en: "Optional switch for the card tool allowlist" ru: "Необязательный переключатель белого списка инструментов карточки" }
          type: boolean
          required: false
        },
        {
          name: "allowed_builtin_tools"
          description: { zh: "可选，内置工具名的 JSON 字符串数组" en: "Optional JSON string array of built-in tool names" ru: "Необязательный строковый массив JSON с именами встроенных инструментов" }
          type: string
          required: false
        },
        {
          name: "allowed_packages"
          description: { zh: "可选，包名的 JSON 字符串数组" en: "Optional JSON string array of package names" ru: "Необязательный строковый массив JSON с именами пакетов" }
          type: string
          required: false
        },
        {
          name: "allowed_skills"
          description: { zh: "可选，Skill 名称的 JSON 字符串数组" en: "Optional JSON string array of skill names" ru: "Необязательный строковый массив JSON с именами Skill" }
          type: string
          required: false
        },
        {
          name: "allowed_mcp_servers"
          description: { zh: "可选，MCP 服务名的 JSON 字符串数组" en: "Optional JSON string array of MCP server names" ru: "Необязательный строковый массив JSON с именами серверов MCP" }
          type: string
          required: false
        }
      ]
    },
    {
      name: "update_character_card"
      description: {
        zh: '''按角色卡 ID 更新提供的字段。除 ID 外的字段定义与 create_character_card 一致。'''
        en: '''Update supplied fields by character-card id. The editable fields match create_character_card.'''
        ru: '''Обновляет переданные поля по ID карточки персонажа. Редактируемые поля совпадают с create_character_card.'''
      }
      parameters: [
        {
          name: "character_card_id"
          description: { zh: "角色卡 ID" en: "Character card id" ru: "ID карточки персонажа" }
          type: string
          required: true
        },
        {
          name: "name"
          description: { zh: "可选，角色卡名称" en: "Optional character card name" ru: "Необязательное название карточки персонажа" }
          type: string
          required: false
        },
        {
          name: "description"
          description: { zh: "可选，简介" en: "Optional description" ru: "Необязательное описание" }
          type: string
          required: false
        },
        {
          name: "character_setting"
          description: { zh: "可选，角色设定提示词" en: "Optional character-setting prompt" ru: "Необязательный промпт настройки персонажа" }
          type: string
          required: false
        },
        {
          name: "opening_statement"
          description: { zh: "可选，开场白" en: "Optional opening statement" ru: "Необязательная вступительная фраза" }
          type: string
          required: false
        },
        {
          name: "other_content_chat"
          description: { zh: "可选，聊天附加内容" en: "Optional chat content" ru: "Необязательное содержимое чата" }
          type: string
          required: false
        },
        {
          name: "other_content_voice"
          description: { zh: "可选，语音附加内容" en: "Optional voice content" ru: "Необязательное содержимое для голоса" }
          type: string
          required: false
        },
        {
          name: "attached_tag_ids"
          description: { zh: "可选，标签 ID 的 JSON 字符串数组" en: "Optional JSON string array of tag ids" ru: "Необязательный строковый массив JSON с ID тегов" }
          type: string
          required: false
        },
        {
          name: "advanced_custom_prompt"
          description: { zh: "可选，高级自定义提示词" en: "Optional advanced custom prompt" ru: "Необязательный расширенный пользовательский промпт" }
          type: string
          required: false
        },
        {
          name: "marks"
          description: { zh: "可选，备注" en: "Optional marks" ru: "Необязательные пометки" }
          type: string
          required: false
        },
        {
          name: "chat_model_binding_mode"
          description: { zh: "可选，FOLLOW_GLOBAL 或 FIXED_CONFIG" en: "Optional FOLLOW_GLOBAL or FIXED_CONFIG" ru: "Необязательно: FOLLOW_GLOBAL или FIXED_CONFIG" }
          type: string
          required: false
        },
        {
          name: "chat_model_config_id"
          description: { zh: "可选，固定对话模型配置 ID；空字符串清除" en: "Optional fixed chat-model config id; empty string clears" ru: "Необязательно: ID конфигурации фиксированной модели чата; пустая строка очищает" }
          type: string
          required: false
        },
        {
          name: "chat_model_index"
          description: { zh: "可选，固定对话模型索引" en: "Optional fixed chat-model index" ru: "Необязательный индекс фиксированной модели чата" }
          type: integer
          required: false
        },
        {
          name: "memory_profile_binding_mode"
          description: { zh: "可选，FOLLOW_GLOBAL 或 FIXED_PROFILE" en: "Optional FOLLOW_GLOBAL or FIXED_PROFILE" ru: "Необязательно: FOLLOW_GLOBAL или FIXED_PROFILE" }
          type: string
          required: false
        },
        {
          name: "memory_profile_id"
          description: { zh: "可选，固定记忆配置 ID；空字符串清除" en: "Optional fixed memory-profile id; empty string clears" ru: "Необязательно: ID фиксированного профиля памяти; пустая строка очищает" }
          type: string
          required: false
        },
        {
          name: "tool_access_enabled"
          description: { zh: "可选，启用角色卡工具白名单" en: "Optional switch for the card tool allowlist" ru: "Необязательный переключатель белого списка инструментов карточки" }
          type: boolean
          required: false
        },
        {
          name: "allowed_builtin_tools"
          description: { zh: "可选，内置工具名的 JSON 字符串数组" en: "Optional JSON string array of built-in tool names" ru: "Необязательный строковый массив JSON с именами встроенных инструментов" }
          type: string
          required: false
        },
        {
          name: "allowed_packages"
          description: { zh: "可选，包名的 JSON 字符串数组" en: "Optional JSON string array of package names" ru: "Необязательный строковый массив JSON с именами пакетов" }
          type: string
          required: false
        },
        {
          name: "allowed_skills"
          description: { zh: "可选，Skill 名称的 JSON 字符串数组" en: "Optional JSON string array of skill names" ru: "Необязательный строковый массив JSON с именами Skill" }
          type: string
          required: false
        },
        {
          name: "allowed_mcp_servers"
          description: { zh: "可选，MCP 服务名的 JSON 字符串数组" en: "Optional JSON string array of MCP server names" ru: "Необязательный строковый массив JSON с именами серверов MCP" }
          type: string
          required: false
        }
      ]
    },
    {
      name: "delete_character_card"
      description: {
        zh: '''删除非默认角色卡。'''
        en: '''Delete a non-default character card.'''
        ru: '''Удаляет карточку персонажа, не являющуюся карточкой по умолчанию.'''
      }
      parameters: [
        {
          name: "character_card_id"
          description: { zh: "角色卡 ID" en: "Character card id" ru: "ID карточки персонажа" }
          type: string
          required: true
        }
      ]
    },
    {
      name: "set_active_character_card"
      description: {
        zh: '''将指定角色卡设为活跃角色卡。'''
        en: '''Set an existing character card as active.'''
        ru: '''Назначает существующую карточку персонажа активной.'''
      }
      parameters: [
        {
          name: "character_card_id"
          description: { zh: "角色卡 ID" en: "Character card id" ru: "ID карточки персонажа" }
          type: string
          required: true
        }
      ]
    },
    {
      name: "clear_active_character_card"
      description: {
        zh: '''清除当前活跃角色卡。'''
        en: '''Clear the current active character card.'''
        ru: '''Очищает текущую активную карточку персонажа.'''
      }
      parameters: []
    },
    {
      name: "import_character_card_from_tavern_json"
      description: {
        zh: '''从 Tavern JSON 导入一张角色卡。'''
        en: '''Import one character card from Tavern JSON.'''
        ru: '''Импортирует одну карточку персонажа из Tavern JSON.'''
      }
      parameters: [
        {
          name: "tavern_json"
          description: { zh: "Tavern 角色卡 JSON 内容" en: "Tavern character-card JSON content" ru: "Содержимое JSON карточки персонажа Tavern" }
          type: string
          required: true
        }
      ]
    },
    {
      name: "export_character_card_to_tavern_json"
      description: {
        zh: '''将一张角色卡导出为 Tavern JSON。'''
        en: '''Export one character card as Tavern JSON.'''
        ru: '''Экспортирует одну карточку персонажа в Tavern JSON.'''
      }
      parameters: [
        {
          name: "character_card_id"
          description: { zh: "角色卡 ID" en: "Character card id" ru: "ID карточки персонажа" }
          type: string
          required: true
        }
      ]
    },
    {
      name: "ping_mcp"
      description: {
        zh: '''直通 use_package 的探测工具：用于快速测试某个 package 是否可被加载（MCP/Skill/Sandbox 三兼容）。'''
        en: '''A pass-through probe for use_package: quickly test whether a package can be loaded (tri-compatible across MCP/Skill/Sandbox).'''
        ru: '''Сквозная проверка для use_package: быстро определяет, можно ли загрузить пакет (совместимо с MCP/Skill/Sandbox).'''
      }
      parameters: [
        {
          name: "package_name"
          description: {
            zh: "要探测的包名"
            en: "Package name to probe"
            ru: "Имя проверяемого пакета"
          }
          type: string
          required: true
        }
      ]
    }
  ]
}*/
const operitEditorPackage = (function () {
    async function operit_editor(params) {
        try {
            const { query } = params ?? {};
            complete({
                success: true,
                message: "配置排查手册已加载（MCP/Skill/Sandbox Package/沙盒包调试烧录/功能模型与模型配置/TTS-STT语音服务），将按配置链路执行排查。",
                data: {
                    query: query ?? ""
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function how_make_skill() {
        try {
            const locale = (getLang() ?? "").toLowerCase();
            const lang = locale.startsWith("zh") ? "zh" : locale.startsWith("en") ? "en" : "both";
            const zh = `如何制作 skill（简版）
1. 先创建目录：/sdcard/Download/Operit/skills/<skill_name>/
2. 必备文件：SKILL.md
3. 在 SKILL.md 顶部用 Markdown 元数据（frontmatter）写 name、description，例如：
---
name: your_skill_name
description: 用一句话说明这个 skill 做什么
---
4. 元数据后再写正文：适用场景、执行步骤、约束边界、期望输出
5. 可选内容：scripts/、templates/、examples/、assets/；在 SKILL.md 里用相对路径引用
6. 实践建议：优先下载现成 skill，直接解压过来，并确保目录下有 SKILL.md。`;
            const en = `How to make a skill (quick guide)
1. Create a directory: /sdcard/Download/Operit/skills/<skill_name>/
2. Required file: SKILL.md
3. At the top of SKILL.md, use Markdown metadata (frontmatter) for name and description, for example:
---
name: your_skill_name
description: one-line summary of what this skill does
---
4. After metadata, write the main sections: use cases, workflow steps, constraints, expected outputs
5. Optional content: scripts/, templates/, examples/, assets/; reference them from SKILL.md using relative paths
6. Practical tip: download an existing skill, extract it directly, and ensure the directory contains SKILL.md`;
            const message = lang === "zh" ? zh : lang === "en" ? en : `${zh}\n\n---\n\n${en}`;
            complete({
                success: true,
                message,
                data: {
                    lang,
                    zh,
                    en
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function list_sandbox_packages() {
        try {
            const result = await Tools.SoftwareSettings.listSandboxPackages();
            complete({
                success: true,
                message: `Sandbox package list fetched: ${String(result.totalCount)} package(s).`,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function set_sandbox_package_enabled(params) {
        try {
            const packageName = params?.package_name ?? "";
            const enabled = params?.enabled ?? false;
            const result = await Tools.SoftwareSettings.setSandboxPackageEnabled(packageName, enabled);
            complete({
                success: true,
                message: result.message || "Sandbox package switch updated.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    const SANDBOX_EXTERNAL_PACKAGES_DIR = "/sdcard/Android/data/com.ai.assistance.operit/files/packages";
    const TOOLPKG_DEBUG_INSTALL_ACTION = "com.ai.assistance.operit.DEBUG_INSTALL_TOOLPKG";
    const TOOLPKG_DEBUG_INSTALL_COMPONENT = "com.ai.assistance.operit/.core.tools.packTool.ToolPkgDebugInstallReceiver";
    const SANDBOX_SCRIPT_EXECUTION_ACTION = "com.ai.assistance.operit.EXECUTE_JS";
    const SANDBOX_SCRIPT_EXECUTION_COMPONENT = "com.ai.assistance.operit/com.ai.assistance.operit.core.tools.javascript.ScriptExecutionReceiver";
    const SANDBOX_SCRIPT_EXECUTION_MODE_SCRIPT = "script";
    const SANDBOX_SCRIPT_EXECUTION_MODE_CODE = "code";
    const SANDBOX_JS_TEMP_DIR = "/sdcard/Android/data/com.ai.assistance.operit/js_temp";
    const DEFAULT_SANDBOX_REFRESH_TIMEOUT_MS = 1500;
    const DEFAULT_TOOLPKG_INSTALL_WAIT_MS = 1500;
    const DEFAULT_SANDBOX_SCRIPT_WAIT_MS = 15000;
    const JS_METADATA_BLOCK_PATTERN = /\/\*\s*METADATA([\s\S]*?)\*\//m;
    const JS_PACKAGE_NAME_PATTERN = /^\s*["']?name["']?\s*:\s*["']([^"']+)["']/m;
    const TOOLPKG_ID_PATTERN = /^\s*["']?toolpkg_id["']?\s*:\s*["']([^"']+)["']/m;
    const TOOLPKG_MAIN_PATTERN = /^\s*["']?main["']?\s*:\s*["']([^"']+)["']/m;
    const TOOLPKG_SUBPACKAGE_ID_PATTERN = /^\s*["']?id["']?\s*:\s*["']([^"']+)["']/gm;
    const TOOLPKG_SKIP_DIR_NAMES = new Set([".git", "__pycache__", ".backup", "backup", ".operit"]);
    const TOOLPKG_SKIP_FILE_NAMES = new Set([".DS_Store", "Thumbs.db"]);
    function collect_related_package_load_errors(payload, packageName, ...relatedPaths) {
        const normalizedPackageName = normalize_package_key(packageName);
        const normalizedPaths = relatedPaths.map((path) => String(path ?? "").trim()).filter(Boolean);
        const packageLoadErrors = payload?.packageLoadErrors;
        if (!packageLoadErrors) {
            return {};
        }
        return Object.fromEntries(Object.entries(packageLoadErrors).filter(([key, value]) => {
            const normalizedKey = normalize_package_key(key);
            const message = String(value ?? "");
            return (normalizedKey === normalizedPackageName ||
                message.toLowerCase().includes(normalizedPackageName) ||
                normalizedPaths.some((path) => message.includes(path)));
        }));
    }
    function normalize_android_path(raw) {
        const normalized = String(raw ?? "").trim().replace(/\\/g, "/");
        if (!normalized)
            return "";
        if (/^[a-zA-Z]+:\/\//.test(normalized))
            return normalized;
        if (normalized.startsWith("/"))
            return normalized;
        if (normalized.startsWith("sdcard/"))
            return `/${normalized}`;
        if (normalized.startsWith("Android/") || normalized.startsWith("Download/")) {
            return `/sdcard/${normalized}`;
        }
        return normalized;
    }
    function normalize_package_key(raw) {
        return String(raw ?? "").trim().toLowerCase();
    }
    function normalize_directory_path(path) {
        const normalized = normalize_android_path(path).replace(/\/+/g, "/");
        if (normalized === "/")
            return normalized;
        return normalized.replace(/\/+$/, "");
    }
    function same_android_path(left, right) {
        return normalize_directory_path(left) === normalize_directory_path(right);
    }
    function path_dirname(path) {
        const normalized = normalize_directory_path(path);
        const index = normalized.lastIndexOf("/");
        if (index < 0)
            return "";
        if (index === 0)
            return "/";
        return normalized.slice(0, index);
    }
    function path_basename(path) {
        const normalized = normalize_directory_path(path);
        const index = normalized.lastIndexOf("/");
        return index >= 0 ? normalized.slice(index + 1) : normalized;
    }
    function path_join(...parts) {
        const filtered = parts
            .map((part) => String(part ?? "").trim().replace(/\\/g, "/"))
            .filter(Boolean);
        if (filtered.length === 0)
            return "";
        const leadingSlash = filtered[0].startsWith("/");
        const joined = filtered.map((part) => part.replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/");
        return leadingSlash ? `/${joined}` : joined;
    }
    function safe_debug_file_stem(raw, fallback) {
        const normalized = String(raw ?? "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[_\.]+|[_\.]+$/g, "");
        return normalized || fallback;
    }
    function parse_boolean_like(value, defaultValue) {
        if (value === undefined || value === null || value === "")
            return defaultValue;
        if (typeof value === "boolean")
            return value;
        if (typeof value === "number")
            return value !== 0;
        const normalized = String(value).trim().toLowerCase();
        if (!normalized)
            return defaultValue;
        if (["true", "1", "yes", "on"].includes(normalized))
            return true;
        if (["false", "0", "no", "off"].includes(normalized))
            return false;
        return defaultValue;
    }
    function parse_integer_like(value, defaultValue) {
        if (value === undefined || value === null || value === "")
            return defaultValue;
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : defaultValue;
    }
    async function android_path_exists(path) {
        const result = await Tools.Files.exists(path, "android");
        return result.exists;
    }
    async function get_android_file_type(path) {
        const result = await Tools.Files.info(path, "android");
        return result.fileType.trim().toLowerCase();
    }
    async function ensure_android_directory(path) {
        await Tools.Files.mkdir(path, true, "android");
    }
    async function delete_android_path_if_exists(path) {
        if (!path)
            return;
        if (!(await android_path_exists(path)))
            return;
        await Tools.Files.deleteFile(path, true, "android");
    }
    async function cleanup_android_paths(paths) {
        const uniquePaths = Array.from(new Set(paths.map((path) => normalize_android_path(path)).filter(Boolean)));
        uniquePaths.sort((left, right) => right.length - left.length);
        for (const path of uniquePaths) {
            try {
                await delete_android_path_if_exists(path);
            }
            catch {
                // Ignore cleanup failures.
            }
        }
    }
    async function read_android_text_file(path) {
        const result = await Tools.Files.read({ path, environment: "android" });
        return result.content;
    }
    function parse_json_record(raw) {
        if (!raw)
            return null;
        try {
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
                return null;
            return parsed;
        }
        catch {
            return null;
        }
    }
    function find_sandbox_package_entry(payload, packageName) {
        const targetKey = normalize_package_key(packageName);
        const packages = payload?.packages ?? [];
        return (packages.find((entry) => normalize_package_key(entry?.packageName) === targetKey) ?? null);
    }
    async function refresh_sandbox_packages_until(packageName, timeoutMs) {
        const deadline = Date.now() + Math.max(0, timeoutMs);
        let lastPayload = null;
        let lastEntry = null;
        while (true) {
            lastPayload = await Tools.SoftwareSettings.listSandboxPackages();
            lastEntry = find_sandbox_package_entry(lastPayload, packageName);
            if (lastEntry) {
                return {
                    payload: lastPayload,
                    packageEntry: lastEntry
                };
            }
            if (Date.now() >= deadline) {
                return {
                    payload: lastPayload,
                    packageEntry: lastEntry
                };
            }
            await Tools.System.sleep(Math.min(300, Math.max(50, deadline - Date.now())));
        }
    }
    async function wait_for_android_file(path, timeoutMs) {
        const deadline = Date.now() + Math.max(0, timeoutMs);
        while (true) {
            if (await android_path_exists(path)) {
                return true;
            }
            if (Date.now() >= deadline) {
                return false;
            }
            await Tools.System.sleep(Math.min(300, Math.max(50, deadline - Date.now())));
        }
    }
    function parse_json_text(raw) {
        const text = String(raw ?? "").trim();
        if (!text)
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return null;
        }
    }
    function extract_js_metadata_block(sourceText, sourcePath) {
        const match = JS_METADATA_BLOCK_PATTERN.exec(sourceText);
        if (!match) {
            throw new Error(`Missing METADATA block: ${sourcePath}`);
        }
        return match[1].trim();
    }
    function parse_js_package_source(sourceText, sourcePath) {
        const metadataBlock = extract_js_metadata_block(sourceText, sourcePath);
        const packageName = JS_PACKAGE_NAME_PATTERN.exec(metadataBlock)?.[1]?.trim() ?? "";
        if (!packageName) {
            throw new Error(`Missing package metadata name: ${sourcePath}`);
        }
        return {
            packageName,
            metadataBlock
        };
    }
    async function delete_duplicate_external_js_package_files(packageName, keepPath) {
        const removedPaths = [];
        const listing = await Tools.Files.list(SANDBOX_EXTERNAL_PACKAGES_DIR, "android");
        for (const entry of listing?.entries ?? []) {
            const entryName = String(entry?.name ?? "").trim();
            if (!entryName || entry?.isDirectory || !entryName.toLowerCase().endsWith(".js")) {
                continue;
            }
            const candidatePath = path_join(SANDBOX_EXTERNAL_PACKAGES_DIR, entryName);
            if (same_android_path(candidatePath, keepPath)) {
                continue;
            }
            try {
                const candidateText = await read_android_text_file(candidatePath);
                const candidateInfo = parse_js_package_source(candidateText, candidatePath);
                if (normalize_package_key(candidateInfo.packageName) !== normalize_package_key(packageName)) {
                    continue;
                }
                await Tools.Files.deleteFile(candidatePath, false, "android");
                removedPaths.push(candidatePath);
            }
            catch {
                // Ignore files that cannot be parsed as sandbox packages.
            }
        }
        return removedPaths;
    }
    function parse_toolpkg_manifest_text(text, manifestPath) {
        let packageId = "";
        let mainEntry = "";
        let subpackageIds = [];
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                packageId = String(parsed.toolpkg_id ?? "").trim();
                mainEntry = String(parsed.main ?? "").trim();
                if (Array.isArray(parsed.subpackages)) {
                    subpackageIds = parsed.subpackages
                        .map((subpackage) => String(subpackage?.id ?? "").trim())
                        .filter(Boolean);
                }
            }
        }
        catch {
            // HJSON-like manifests will fall back to regex parsing below.
        }
        if (!packageId) {
            packageId = TOOLPKG_ID_PATTERN.exec(text)?.[1]?.trim() ?? "";
        }
        if (!mainEntry) {
            mainEntry = TOOLPKG_MAIN_PATTERN.exec(text)?.[1]?.trim() ?? "";
        }
        if (subpackageIds.length === 0) {
            const matches = [];
            const pattern = new RegExp(TOOLPKG_SUBPACKAGE_ID_PATTERN.source, TOOLPKG_SUBPACKAGE_ID_PATTERN.flags);
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const subpackageId = match[1]?.trim() ?? "";
                if (subpackageId) {
                    matches.push(subpackageId);
                }
            }
            subpackageIds = matches;
        }
        if (!packageId) {
            throw new Error(`manifest.toolpkg_id is required: ${manifestPath}`);
        }
        if (!mainEntry) {
            throw new Error(`manifest.main is required: ${manifestPath}`);
        }
        return {
            packageId,
            mainEntry: mainEntry.replace(/\\/g, "/").replace(/^\/+/, ""),
            subpackageIds: Array.from(new Set(subpackageIds))
        };
    }
    async function find_toolpkg_manifest_in_folder(folderPath) {
        const manifestJson = path_join(folderPath, "manifest.json");
        if (await android_path_exists(manifestJson)) {
            return manifestJson;
        }
        const manifestHjson = path_join(folderPath, "manifest.hjson");
        if (await android_path_exists(manifestHjson)) {
            return manifestHjson;
        }
        throw new Error(`Missing manifest.json or manifest.hjson in folder: ${folderPath}`);
    }
    async function resolve_toolpkg_source(rawSourcePath) {
        const sourcePath = normalize_android_path(rawSourcePath);
        if (!sourcePath) {
            throw new Error("Missing required parameter: source_path");
        }
        if (!(await android_path_exists(sourcePath))) {
            throw new Error(`Source path does not exist: ${sourcePath}`);
        }
        const sourceType = await get_android_file_type(sourcePath);
        let sourceKind = "folder";
        let folderPath = sourcePath;
        let archivePath;
        const temporaryPaths = [];
        const lowerBaseName = path_basename(sourcePath).toLowerCase();
        if (sourceType === "directory") {
            folderPath = sourcePath;
        }
        else if (sourceType === "file" && (lowerBaseName === "manifest.json" || lowerBaseName === "manifest.hjson")) {
            folderPath = path_dirname(sourcePath);
        }
        else if (sourceType === "file" && lowerBaseName.endsWith(".toolpkg")) {
            sourceKind = "archive";
            archivePath = sourcePath;
            const tempExtractDir = path_join(OPERIT_CLEAN_ON_EXIT_DIR, `operit_editor_toolpkg_extract_${safe_debug_file_stem(lowerBaseName.replace(/\.toolpkg$/i, ""), "toolpkg")}_${Date.now()}`);
            await ensure_android_directory(tempExtractDir);
            await Tools.Files.unzip(sourcePath, tempExtractDir, "android");
            folderPath = tempExtractDir;
            temporaryPaths.push(tempExtractDir);
        }
        else {
            throw new Error("ToolPkg source must be a folder, manifest.json/manifest.hjson, or an existing .toolpkg file");
        }
        const manifestPath = await find_toolpkg_manifest_in_folder(folderPath);
        const manifestText = await read_android_text_file(manifestPath);
        const manifest = parse_toolpkg_manifest_text(manifestText, manifestPath);
        const mainPath = path_join(folderPath, manifest.mainEntry);
        if (!(await android_path_exists(mainPath))) {
            throw new Error(`manifest.main file does not exist: ${manifestPath} -> ${manifest.mainEntry}`);
        }
        return {
            sourceKind,
            sourcePath,
            folderPath,
            manifestPath,
            packageId: manifest.packageId,
            mainEntry: manifest.mainEntry,
            subpackageIds: manifest.subpackageIds,
            archivePath,
            temporaryPaths
        };
    }
    async function copy_toolpkg_sources_filtered(sourceDir, targetDir, relativePath = "", stats = { copiedFiles: 0, skippedEntries: [] }) {
        await ensure_android_directory(targetDir);
        const listing = await Tools.Files.list(sourceDir, "android");
        for (const entry of listing?.entries ?? []) {
            const entryName = String(entry?.name ?? "").trim();
            if (!entryName || entryName === "." || entryName === "..") {
                continue;
            }
            const entryRelativePath = relativePath ? `${relativePath}/${entryName}` : entryName;
            const sourceEntryPath = path_join(sourceDir, entryName);
            if (entry?.isDirectory) {
                if (TOOLPKG_SKIP_DIR_NAMES.has(entryName)) {
                    stats.skippedEntries.push(`${entryRelativePath}/`);
                    continue;
                }
                await copy_toolpkg_sources_filtered(sourceEntryPath, path_join(targetDir, entryName), entryRelativePath, stats);
                continue;
            }
            if (TOOLPKG_SKIP_FILE_NAMES.has(entryName)) {
                stats.skippedEntries.push(entryRelativePath);
                continue;
            }
            await Tools.Files.copy(sourceEntryPath, path_join(targetDir, entryName), false, "android", "android");
            stats.copiedFiles += 1;
        }
        return stats;
    }
    async function build_toolpkg_archive_from_folder(source) {
        const tempBuildDir = path_join(OPERIT_CLEAN_ON_EXIT_DIR, `operit_editor_toolpkg_build_${safe_debug_file_stem(source.packageId, "toolpkg")}_${Date.now()}`);
        await ensure_android_directory(tempBuildDir);
        const archivePath = path_join(tempBuildDir, `${safe_debug_file_stem(source.packageId, "toolpkg")}.toolpkg`);
        // 工作区绑定对话后会生成 .backup/（含聊天记录与快照），且在工作区文件树中不可见。
        // 直接 zip 整个目录会把它打进 toolpkg，因此先按排除名单拷贝出一份干净的打包源。
        const stageDir = path_join(tempBuildDir, "stage");
        const stats = await copy_toolpkg_sources_filtered(source.folderPath, stageDir);
        if (stats.copiedFiles === 0) {
            throw new Error(`No packable files found in source folder: ${source.folderPath}`);
        }
        const stagedManifestExists = (await android_path_exists(path_join(stageDir, "manifest.json")))
            || (await android_path_exists(path_join(stageDir, "manifest.hjson")));
        if (!stagedManifestExists) {
            throw new Error(`Root manifest is missing after filtering source folder: ${source.folderPath}`);
        }
        await Tools.Files.zip(stageDir, archivePath, "android", false);
        if (!(await android_path_exists(archivePath))) {
            throw new Error(`Failed to create ToolPkg archive: ${archivePath}`);
        }
        return {
            archivePath,
            temporaryPaths: [tempBuildDir],
            skippedEntries: stats.skippedEntries
        };
    }
    function parse_requested_package_ids(raw) {
        const input = String(raw ?? "").trim();
        if (!input)
            return [];
        return Array.from(new Set(input.split(/[\r\n,]+/).map((item) => item.trim()).filter(Boolean)));
    }
    async function debug_install_js_package(params) {
        const logs = [];
        const logStep = (message) => {
            logs.push(message);
        };
        const finish = (payload) => complete({
            ...payload,
            data: {
                ...(payload.data ?? {}),
                logs
            }
        });
        try {
            const sourcePath = normalize_android_path(params?.source_path);
            logStep(`Resolved source_path -> ${sourcePath || "<empty>"}`);
            if (!sourcePath) {
                finish({
                    success: false,
                    message: "Missing required parameter: source_path"
                });
                return;
            }
            const sourceType = await get_android_file_type(sourcePath);
            logStep(`Source type detected -> ${sourceType}`);
            if (sourceType !== "file") {
                finish({
                    success: false,
                    message: `JS source must be a file: ${sourcePath}`
                });
                return;
            }
            if (!sourcePath.toLowerCase().endsWith(".js")) {
                finish({
                    success: false,
                    message: `JS debug install only supports .js files: ${sourcePath}`
                });
                return;
            }
            const sourceText = await read_android_text_file(sourcePath);
            const packageInfo = parse_js_package_source(sourceText, sourcePath);
            logStep(`Parsed package info -> packageName=${packageInfo.packageName}`);
            const enableAfterInstall = parse_boolean_like(params?.enable_after_install, true);
            const activateAfterInstall = parse_boolean_like(params?.activate_after_install, true);
            const shouldEnable = enableAfterInstall || activateAfterInstall;
            logStep(`Install options -> enableAfterInstall=${String(enableAfterInstall)}, activateAfterInstall=${String(activateAfterInstall)}, shouldEnable=${String(shouldEnable)}`);
            await ensure_android_directory(SANDBOX_EXTERNAL_PACKAGES_DIR);
            const targetPath = path_join(SANDBOX_EXTERNAL_PACKAGES_DIR, `${safe_debug_file_stem(packageInfo.packageName, "debug_js_package")}.js`);
            logStep(`Target install path -> ${targetPath}`);
            const copied = !same_android_path(sourcePath, targetPath);
            if (copied) {
                logStep("Source and target differ; replacing target file before copy.");
                await delete_android_path_if_exists(targetPath);
                await Tools.Files.copy(sourcePath, targetPath, false, "android", "android");
                logStep("Package file copied to external sandbox directory.");
            }
            else {
                logStep("Source path already matches target path; skipping file copy.");
            }
            if (!(await android_path_exists(targetPath))) {
                finish({
                    success: false,
                    message: `Installed JS package file is missing after copy: ${targetPath}`
                });
                return;
            }
            logStep("Verified installed JS package file exists.");
            const removedDuplicateFiles = await delete_duplicate_external_js_package_files(packageInfo.packageName, targetPath);
            logStep(`Duplicate cleanup completed -> removed ${removedDuplicateFiles.length} file(s).`);
            const refresh = await refresh_sandbox_packages_until(packageInfo.packageName, DEFAULT_SANDBOX_REFRESH_TIMEOUT_MS);
            logStep(`Sandbox refresh completed -> found=${String(Boolean(refresh.packageEntry))}, builtIn=${String(refresh.packageEntry?.isBuiltIn ?? false)}`);
            if (!refresh.packageEntry) {
                finish({
                    success: false,
                    message: `Sandbox package did not appear after refresh: ${packageInfo.packageName}`,
                    data: {
                        package_name: packageInfo.packageName,
                        source_path: sourcePath,
                        target_path: targetPath,
                        refresh_result: refresh.payload
                    }
                });
                return;
            }
            if (refresh.packageEntry.isBuiltIn) {
                finish({
                    success: false,
                    message: `External JS package '${packageInfo.packageName}' did not take precedence over a built-in package with the same name.`,
                    data: {
                        package: refresh.packageEntry,
                        source_path: sourcePath,
                        target_path: targetPath
                    }
                });
                return;
            }
            let enableResult = null;
            if (shouldEnable) {
                logStep(`Enabling sandbox package -> ${packageInfo.packageName}`);
                enableResult = await Tools.SoftwareSettings.setSandboxPackageEnabled(packageInfo.packageName, true);
                logStep(`Enable result -> ${enableResult.message || "<empty>"}`);
            }
            else {
                logStep("Enable step skipped by configuration.");
            }
            let activateResult = null;
            if (activateAfterInstall) {
                logStep(`Activating package via use_package -> ${packageInfo.packageName}`);
                activateResult = await Tools.System.usePackage(packageInfo.packageName);
                logStep(`Activation result -> ${activateResult || "<empty>"}`);
            }
            else {
                logStep("Activation step skipped by configuration.");
            }
            finish({
                success: true,
                message: `Debug JS package installed: ${packageInfo.packageName}`,
                data: {
                    package_name: packageInfo.packageName,
                    source_path: sourcePath,
                    target_path: targetPath,
                    copied,
                    removed_duplicate_files: removedDuplicateFiles,
                    package: refresh.packageEntry,
                    enable_after_install: shouldEnable,
                    activate_after_install: activateAfterInstall,
                    enable_result: enableResult,
                    activate_result: activateResult,
                    refresh_result: refresh.payload
                }
            });
        }
        catch (error) {
            logStep(`Execution failed -> ${get_error_message(error)}`);
            finish({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function debug_install_toolpkg(params) {
        const cleanupPaths = [];
        const logs = [];
        const logStep = (message) => {
            logs.push(message);
        };
        const finish = (payload) => complete({
            ...payload,
            data: {
                ...(payload.data ?? {}),
                logs
            }
        });
        let finalPayload = null;
        try {
            const resolvedSource = await resolve_toolpkg_source(params?.source_path ?? "");
            logStep(`Resolved ToolPkg source -> kind=${resolvedSource.sourceKind}, packageId=${resolvedSource.packageId}, sourcePath=${resolvedSource.sourcePath}`);
            cleanupPaths.push(...resolvedSource.temporaryPaths);
            if (resolvedSource.temporaryPaths.length > 0) {
                logStep(`Registered temporary paths -> ${resolvedSource.temporaryPaths.join(", ")}`);
            }
            let archivePath = resolvedSource.archivePath ?? "";
            if (resolvedSource.sourceKind === "folder") {
                logStep("Source is a folder; building temporary .toolpkg archive.");
                const builtArchive = await build_toolpkg_archive_from_folder(resolvedSource);
                archivePath = builtArchive.archivePath;
                cleanupPaths.push(...builtArchive.temporaryPaths);
                logStep(`Built archive -> ${archivePath}`);
            }
            await ensure_android_directory(SANDBOX_EXTERNAL_PACKAGES_DIR);
            const targetPath = path_join(SANDBOX_EXTERNAL_PACKAGES_DIR, `${safe_debug_file_stem(resolvedSource.packageId, "toolpkg")}.toolpkg`);
            logStep(`Target install path -> ${targetPath}`);
            if (!same_android_path(archivePath, targetPath)) {
                logStep("Archive path differs from target; replacing target archive before copy.");
                await delete_android_path_if_exists(targetPath);
                await Tools.Files.copy(archivePath, targetPath, false, "android", "android");
                logStep("ToolPkg archive copied to external sandbox directory.");
            }
            else {
                logStep("Archive path already matches target path; skipping archive copy.");
            }
            if (!(await android_path_exists(targetPath))) {
                finalPayload = {
                    success: false,
                    message: `Installed ToolPkg archive is missing after copy: ${targetPath}`
                };
                return;
            }
            logStep("Verified installed ToolPkg archive exists.");
            const resetSubpackageStates = parse_boolean_like(params?.reset_subpackage_states, true);
            const waitMs = parse_integer_like(params?.wait_ms, DEFAULT_TOOLPKG_INSTALL_WAIT_MS);
            logStep(`Install options -> resetSubpackageStates=${String(resetSubpackageStates)}, waitMs=${String(waitMs)}`);
            const broadcastResult = await Tools.System.sendBroadcast({
                action: TOOLPKG_DEBUG_INSTALL_ACTION,
                component: TOOLPKG_DEBUG_INSTALL_COMPONENT,
                extras: {
                    package_name: resolvedSource.packageId,
                    file_path: targetPath,
                    reset_subpackage_states: resetSubpackageStates
                }
            });
            logStep(`Debug install broadcast dispatched -> ${broadcastResult.result || "<empty>"}`);
            const refresh = await refresh_sandbox_packages_until(resolvedSource.packageId, waitMs);
            const relatedLoadErrors = collect_related_package_load_errors(refresh.payload, resolvedSource.packageId, resolvedSource.sourcePath, archivePath, targetPath);
            logStep(`Sandbox refresh completed -> found=${String(Boolean(refresh.packageEntry))}, builtIn=${String(refresh.packageEntry?.isBuiltIn ?? false)}`);
            if (Object.keys(relatedLoadErrors).length > 0) {
                logStep(`Related load errors -> ${JSON.stringify(relatedLoadErrors)}`);
            }
            if (!refresh.packageEntry) {
                finalPayload = {
                    success: false,
                    message: `ToolPkg container did not appear after debug install: ${resolvedSource.packageId}`,
                    data: {
                        package_name: resolvedSource.packageId,
                        source_path: resolvedSource.sourcePath,
                        archive_path: targetPath,
                        broadcast_result: broadcastResult,
                        refresh_result: refresh.payload,
                        related_load_errors: relatedLoadErrors
                    }
                };
                return;
            }
            if (refresh.packageEntry.isBuiltIn) {
                finalPayload = {
                    success: false,
                    message: `Debug ToolPkg '${resolvedSource.packageId}' is shadowed by a built-in package with the same name.`,
                    data: {
                        package: refresh.packageEntry,
                        broadcast_result: broadcastResult,
                        refresh_result: refresh.payload,
                        related_load_errors: relatedLoadErrors
                    }
                };
                return;
            }
            const requestedSubpackages = parse_requested_package_ids(params?.activate_subpackages);
            const knownSubpackageKeys = new Set(resolvedSource.subpackageIds.map(normalize_package_key));
            const unknownRequestedSubpackages = knownSubpackageKeys.size === 0
                ? []
                : requestedSubpackages.filter((subpackageId) => !knownSubpackageKeys.has(normalize_package_key(subpackageId)));
            const activationTargets = requestedSubpackages.filter((subpackageId) => !unknownRequestedSubpackages.includes(subpackageId));
            logStep(`Subpackage activation plan -> requested=${requestedSubpackages.join(", ") || "<none>"}, targets=${activationTargets.join(", ") || "<none>"}, unknown=${unknownRequestedSubpackages.join(", ") || "<none>"}`);
            const subpackageResults = [];
            for (const subpackageId of activationTargets) {
                logStep(`Enabling subpackage -> ${subpackageId}`);
                const enableResult = await Tools.SoftwareSettings.setSandboxPackageEnabled(subpackageId, true);
                logStep(`Subpackage enable result [${subpackageId}] -> ${enableResult.message || "<empty>"}`);
                const activateResult = await Tools.System.usePackage(subpackageId);
                logStep(`Subpackage activate result [${subpackageId}] -> ${activateResult || "<empty>"}`);
                subpackageResults.push({
                    subpackage_id: subpackageId,
                    enable_result: enableResult,
                    activate_result: activateResult
                });
            }
            finalPayload = {
                success: true,
                message: `Debug ToolPkg installed: ${resolvedSource.packageId}`,
                data: {
                    package_name: resolvedSource.packageId,
                    source_kind: resolvedSource.sourceKind,
                    source_path: resolvedSource.sourcePath,
                    manifest_path: resolvedSource.manifestPath,
                    main_entry: resolvedSource.mainEntry,
                    archive_path: targetPath,
                    subpackage_ids: resolvedSource.subpackageIds,
                    reset_subpackage_states: resetSubpackageStates,
                    requested_activate_subpackages: requestedSubpackages,
                    unknown_requested_subpackages: unknownRequestedSubpackages,
                    subpackage_results: subpackageResults,
                    package: refresh.packageEntry,
                    broadcast_result: broadcastResult,
                    refresh_result: refresh.payload,
                    related_load_errors: relatedLoadErrors
                }
            };
        }
        catch (error) {
            logStep(`Execution failed -> ${get_error_message(error)}`);
            finalPayload = {
                success: false,
                message: get_error_message(error)
            };
        }
        finally {
            if (cleanupPaths.length > 0) {
                logStep(`Cleaning temporary paths -> ${cleanupPaths.join(", ")}`);
            }
            await cleanup_android_paths(cleanupPaths);
            if (cleanupPaths.length > 0) {
                logStep("Temporary path cleanup completed.");
            }
            if (finalPayload) {
                finish(finalPayload);
            }
        }
    }
    async function debug_run_sandbox_script(params) {
        const logs = [];
        const logStep = (message) => {
            logs.push(message);
        };
        const finish = (payload) => complete({
            ...payload,
            data: {
                ...(payload.data ?? {}),
                logs
            }
        });
        let finalPayload = null;
        try {
            const sourcePath = normalize_android_path(params?.source_path);
            const sourceCode = typeof params?.source_code === "string" ? params.source_code : "";
            const hasInlineCode = sourceCode.trim().length > 0;
            const waitMs = parse_integer_like(params?.wait_ms, DEFAULT_SANDBOX_SCRIPT_WAIT_MS);
            const paramsJson = String(params?.params_json ?? "{}").trim() || "{}";
            const parsedParams = parse_json_text(paramsJson);
            const envFilePath = normalize_android_path(params?.env_file_path);
            const scriptLabel = safe_debug_file_stem(String(params?.script_label ?? "").trim(), "sandbox_script");
            logStep(`Resolved input -> sourcePath=${sourcePath || "<empty>"}, hasInlineCode=${String(hasInlineCode)}, waitMs=${String(waitMs)}`);
            if (!sourcePath && !hasInlineCode) {
                finalPayload = {
                    success: false,
                    message: "Either source_path or source_code is required."
                };
                return;
            }
            if (sourcePath) {
                const sourceType = await get_android_file_type(sourcePath);
                logStep(`Source type detected -> ${sourceType}`);
                if (sourceType !== "file") {
                    finalPayload = {
                        success: false,
                        message: `Sandbox script source must be a file: ${sourcePath}`
                    };
                    return;
                }
            }
            if (!parsedParams || typeof parsedParams !== "object" || Array.isArray(parsedParams)) {
                finalPayload = {
                    success: false,
                    message: `params_json must be a JSON object: ${paramsJson}`
                };
                return;
            }
            logStep("params_json parsed successfully.");
            if (envFilePath) {
                const envType = await get_android_file_type(envFilePath);
                logStep(`Env file type detected -> ${envType}`);
                if (envType !== "file") {
                    finalPayload = {
                        success: false,
                        message: `env_file_path must be a file: ${envFilePath}`
                    };
                    return;
                }
            }
            const executionMode = hasInlineCode ? SANDBOX_SCRIPT_EXECUTION_MODE_CODE : SANDBOX_SCRIPT_EXECUTION_MODE_SCRIPT;
            const scriptIdentityPath = sourcePath || path_join(SANDBOX_JS_TEMP_DIR, `${scriptLabel}_${Date.now()}.inline.js`);
            logStep(`Execution mode -> ${executionMode}`);
            logStep(`Execution target -> ${scriptIdentityPath}`);
            const executionResult = await Tools.SoftwareSettings.executeSandboxScriptDirect({
                source_path: sourcePath || undefined,
                source_code: hasInlineCode ? sourceCode : undefined,
                params_json: paramsJson,
                env_file_path: envFilePath || undefined,
                script_label: scriptLabel,
                wait_ms: waitMs
            });
            logStep(`Direct execution tool completed -> success=${String(Boolean(executionResult.success))}, durationMs=${String(executionResult.durationMs ?? "")}`);
            finalPayload = {
                success: executionResult.success,
                message: executionResult.success
                    ? "Sandbox script executed successfully."
                    : String(executionResult.error ?? "Sandbox script execution failed."),
                data: {
                    execution_mode: executionMode,
                    source_path: sourcePath,
                    has_inline_code: hasInlineCode,
                    env_file_path: envFilePath || null,
                    params_json: paramsJson,
                    execution_result: executionResult
                }
            };
        }
        catch (error) {
            logStep(`Execution failed -> ${get_error_message(error)}`);
            finalPayload = {
                success: false,
                message: get_error_message(error)
            };
        }
        finally {
            finish(finalPayload ?? {
                success: false,
                message: "Sandbox script execution did not produce a final result."
            });
        }
    }
    async function read_environment_variable(params) {
        try {
            const key = (params?.key ?? "").trim();
            if (!key) {
                complete({
                    success: false,
                    message: "Missing required parameter: key"
                });
                return;
            }
            const result = await Tools.SoftwareSettings.readEnvironmentVariable(key);
            complete({
                success: true,
                message: result.exists ? `Environment variable read: ${key}` : `Environment variable not set: ${key}`,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function write_environment_variable(params) {
        try {
            const key = (params?.key ?? "").trim();
            if (!key) {
                complete({
                    success: false,
                    message: "Missing required parameter: key"
                });
                return;
            }
            const value = params?.value ?? "";
            const result = await Tools.SoftwareSettings.writeEnvironmentVariable(key, String(value));
            complete({
                success: true,
                message: result.cleared ? `Environment variable cleared: ${key}` : `Environment variable written: ${key}`,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function restart_mcp_with_logs(params) {
        try {
            const timeoutMs = params?.timeout_ms;
            const result = await Tools.SoftwareSettings.restartMcpWithLogs(timeoutMs);
            complete({
                success: true,
                message: result.timedOut
                    ? `MCP restart timed out after ${String(result.elapsedMs)}ms.`
                    : `MCP restart completed: ${String(result.successCount)} success, ${String(result.failedCount)} failed.`,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function get_speech_services_config() {
        try {
            const result = await Tools.SoftwareSettings.getSpeechServicesConfig();
            const parsed = result;
            complete({
                success: true,
                message: "Speech services config fetched.",
                data: {
                    parsed
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function set_speech_services_config(params) {
        try {
            const updates = { ...(params ?? {}) };
            const result = await Tools.SoftwareSettings.setSpeechServicesConfig(updates);
            const parsed = result;
            complete({
                success: true,
                message: "Speech services config updated.",
                data: {
                    updates,
                    parsed
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function test_tts_playback(params) {
        try {
            const text = (params?.text ?? "").trim();
            if (!text) {
                complete({
                    success: false,
                    message: "Missing required parameter: text"
                });
                return;
            }
            const options = { ...(params ?? {}) };
            delete options.text;
            const result = await Tools.SoftwareSettings.testTtsPlayback(text, options);
            const success = result.playbackTriggered;
            const detailMessage = result.errorMessage?.trim() || "TTS playback test failed.";
            complete({
                success,
                message: success ? "TTS playback test triggered." : detailMessage,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function list_model_configs() {
        try {
            const result = await Tools.SoftwareSettings.listModelConfigs();
            complete({
                success: true,
                message: "Model configs listed.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function create_model_config(params) {
        try {
            const options = { ...(params ?? {}) };
            const result = await Tools.SoftwareSettings.createModelConfig(options);
            complete({
                success: true,
                message: "Model config created.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function update_model_config(params) {
        try {
            const configId = (params?.config_id ?? "").trim();
            if (!configId) {
                complete({
                    success: false,
                    message: "Missing required parameter: config_id"
                });
                return;
            }
            const { config_id: _ignoredConfigId, ...updates } = params ?? {};
            const result = await Tools.SoftwareSettings.updateModelConfig(configId, updates);
            complete({
                success: true,
                message: "Model config updated.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function delete_model_config(params) {
        try {
            const configId = (params?.config_id ?? "").trim();
            if (!configId) {
                complete({
                    success: false,
                    message: "Missing required parameter: config_id"
                });
                return;
            }
            const result = await Tools.SoftwareSettings.deleteModelConfig(configId);
            complete({
                success: true,
                message: "Model config deleted.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function list_function_model_configs() {
        try {
            const result = await Tools.SoftwareSettings.listFunctionModelConfigs();
            complete({
                success: true,
                message: "Function model bindings listed.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function get_function_model_config(params) {
        try {
            const functionType = (params?.function_type ?? "").trim();
            if (!functionType) {
                complete({
                    success: false,
                    message: "Missing required parameter: function_type"
                });
                return;
            }
            const result = await Tools.SoftwareSettings.getFunctionModelConfig(functionType);
            const config = result?.config ?? {};
            const { contextLength: _contextLength, maxContextLength: _maxContextLength, enableMaxContextMode: _enableMaxContextMode, summaryTokenThreshold: _summaryTokenThreshold, enableSummary: _enableSummary, enableSummaryByMessageCount: _enableSummaryByMessageCount, summaryMessageCountThreshold: _summaryMessageCountThreshold, ...configWithoutContextSummary } = config;
            const filteredResult = {
                ...result,
                config: configWithoutContextSummary
            };
            complete({
                success: true,
                message: "Function model config fetched.",
                data: filteredResult
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    function get_error_message(error) {
        return error instanceof Error ? error.message : "Unknown error";
    }
    function pick_context_summary_fields(config) {
        return {
            context_length: config?.contextLength,
            max_context_length: config?.maxContextLength,
            enable_max_context_mode: config?.enableMaxContextMode,
            summary_token_threshold: config?.summaryTokenThreshold,
            enable_summary: config?.enableSummary,
            enable_summary_by_message_count: config?.enableSummaryByMessageCount,
            summary_message_count_threshold: config?.summaryMessageCountThreshold
        };
    }
    async function get_context_summary_config(params) {
        try {
            const functionType = (params?.function_type ?? "CHAT").trim().toUpperCase();
            if (!functionType) {
                complete({
                    success: false,
                    message: "Missing required parameter: function_type"
                });
                return;
            }
            const result = (await Tools.SoftwareSettings.getFunctionModelConfig(functionType));
            const config = result.config;
            if (!config) {
                complete({
                    success: false,
                    message: `No bound config found for function_type: ${functionType}`,
                    data: result
                });
                return;
            }
            complete({
                success: true,
                message: `Context summary config fetched for ${functionType}.`,
                data: {
                    function_type: functionType,
                    config_id: result.configId ?? config.id ?? "",
                    config_name: result.configName ?? config.name ?? "",
                    model_index: result.modelIndex ?? 0,
                    actual_model_index: result.actualModelIndex ?? 0,
                    selected_model: result.selectedModel ?? "",
                    context_summary: pick_context_summary_fields(config),
                    raw: result
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function set_context_summary_config(params) {
        try {
            const functionType = (params?.function_type ?? "CHAT").trim().toUpperCase();
            if (!functionType) {
                complete({
                    success: false,
                    message: "Missing required parameter: function_type"
                });
                return;
            }
            const binding = (await Tools.SoftwareSettings.getFunctionModelConfig(functionType));
            const configId = (binding.configId ?? binding.config?.id ?? "").trim();
            if (!configId) {
                complete({
                    success: false,
                    message: `No bound config found for function_type: ${functionType}`,
                    data: binding
                });
                return;
            }
            const defaultUpdates = {
                context_length: 48,
                max_context_length: 128,
                enable_max_context_mode: true,
                summary_token_threshold: 0.7,
                enable_summary: true,
                enable_summary_by_message_count: true,
                summary_message_count_threshold: 16
            };
            const updates = {
                ...defaultUpdates,
                ...(params?.context_length === undefined ? {} : { context_length: params.context_length }),
                ...(params?.max_context_length === undefined
                    ? {}
                    : { max_context_length: params.max_context_length }),
                ...(params?.enable_max_context_mode === undefined
                    ? {}
                    : { enable_max_context_mode: params.enable_max_context_mode }),
                ...(params?.summary_token_threshold === undefined
                    ? {}
                    : { summary_token_threshold: params.summary_token_threshold }),
                ...(params?.enable_summary === undefined ? {} : { enable_summary: params.enable_summary }),
                ...(params?.enable_summary_by_message_count === undefined
                    ? {}
                    : { enable_summary_by_message_count: params.enable_summary_by_message_count }),
                ...(params?.summary_message_count_threshold === undefined
                    ? {}
                    : { summary_message_count_threshold: params.summary_message_count_threshold })
            };
            const updateResult = (await Tools.SoftwareSettings.updateModelConfig(configId, updates));
            complete({
                success: true,
                message: `Context summary config updated for ${functionType}.`,
                data: {
                    function_type: functionType,
                    config_id: configId,
                    applied_updates: updates,
                    before: pick_context_summary_fields(binding.config),
                    after: pick_context_summary_fields(updateResult.config),
                    update_result: updateResult
                }
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function set_function_model_config(params) {
        try {
            const functionType = (params?.function_type ?? "").trim();
            const configId = (params?.config_id ?? "").trim();
            if (!functionType) {
                complete({
                    success: false,
                    message: "Missing required parameter: function_type"
                });
                return;
            }
            if (!configId) {
                complete({
                    success: false,
                    message: "Missing required parameter: config_id"
                });
                return;
            }
            const result = await Tools.SoftwareSettings.setFunctionModelConfig(functionType, configId, params?.model_index);
            complete({
                success: true,
                message: "Function model binding updated.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    async function test_model_config_connection(params) {
        try {
            const configId = (params?.config_id ?? "").trim();
            if (!configId) {
                complete({
                    success: false,
                    message: "Missing required parameter: config_id"
                });
                return;
            }
            const result = await Tools.SoftwareSettings.testModelConfigConnection(configId, params?.model_index);
            const success = !!result?.success;
            complete({
                success,
                message: success ? "Model config connection tests passed." : "Model config connection tests have failures.",
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    function complete_character_card_error(toolName, error) {
        const message = get_error_message(error);
        console.error(`[operit_editor] ${toolName} failed: ${message}`, error);
        complete({
            success: false,
            message
        });
    }
    async function list_character_cards() {
        try {
            const result = await Tools.SoftwareSettings.listCharacterCards();
            complete({
                success: true,
                message: `Character cards listed: ${result.totalCount}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("list_character_cards", error);
        }
    }
    async function get_character_card(params) {
        const characterCardId = params?.character_card_id?.trim();
        if (!characterCardId) {
            complete({
                success: false,
                message: "Missing required parameter: character_card_id"
            });
            return;
        }
        try {
            const result = await Tools.SoftwareSettings.getCharacterCard(characterCardId);
            complete({
                success: true,
                message: `Character card fetched: ${result.card.name}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("get_character_card", error);
        }
    }
    async function create_character_card(params) {
        if (params === undefined) {
            complete({
                success: false,
                message: "Missing required parameter: name"
            });
            return;
        }
        const name = params.name?.trim();
        if (!name) {
            complete({
                success: false,
                message: "Missing required parameter: name"
            });
            return;
        }
        try {
            const { name: _ignoredName, ...options } = params;
            const result = await Tools.SoftwareSettings.createCharacterCard({
                ...options,
                name
            });
            complete({
                success: true,
                message: `Character card created: ${result.card.name}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("create_character_card", error);
        }
    }
    async function update_character_card(params) {
        const characterCardId = params?.character_card_id?.trim();
        if (!characterCardId) {
            complete({
                success: false,
                message: "Missing required parameter: character_card_id"
            });
            return;
        }
        if (params === undefined) {
            complete({
                success: false,
                message: "Missing character card update parameters"
            });
            return;
        }
        try {
            const { character_card_id: _ignoredCharacterCardId, ...updates } = params;
            const result = await Tools.SoftwareSettings.updateCharacterCard(characterCardId, updates);
            complete({
                success: true,
                message: `Character card updated: ${result.card.name}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("update_character_card", error);
        }
    }
    async function delete_character_card(params) {
        const characterCardId = params?.character_card_id?.trim();
        if (!characterCardId) {
            complete({
                success: false,
                message: "Missing required parameter: character_card_id"
            });
            return;
        }
        try {
            const result = await Tools.SoftwareSettings.deleteCharacterCard(characterCardId);
            complete({
                success: true,
                message: `Character card deleted: ${result.characterCardId}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("delete_character_card", error);
        }
    }
    async function set_active_character_card(params) {
        const characterCardId = params?.character_card_id?.trim();
        if (!characterCardId) {
            complete({
                success: false,
                message: "Missing required parameter: character_card_id"
            });
            return;
        }
        try {
            const result = await Tools.SoftwareSettings.setActiveCharacterCard(characterCardId);
            complete({
                success: true,
                message: `Active character card set: ${result.activeCharacterCardId}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("set_active_character_card", error);
        }
    }
    async function clear_active_character_card() {
        try {
            const result = await Tools.SoftwareSettings.clearActiveCharacterCard();
            complete({
                success: true,
                message: "Active character card cleared.",
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("clear_active_character_card", error);
        }
    }
    async function import_character_card_from_tavern_json(params) {
        const tavernJson = params?.tavern_json;
        if (!tavernJson?.trim()) {
            complete({
                success: false,
                message: "Missing required parameter: tavern_json"
            });
            return;
        }
        try {
            const result = await Tools.SoftwareSettings.importCharacterCardFromTavernJson(tavernJson);
            complete({
                success: true,
                message: `Character card imported: ${result.card.name}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("import_character_card_from_tavern_json", error);
        }
    }
    async function export_character_card_to_tavern_json(params) {
        const characterCardId = params?.character_card_id?.trim();
        if (!characterCardId) {
            complete({
                success: false,
                message: "Missing required parameter: character_card_id"
            });
            return;
        }
        try {
            const result = await Tools.SoftwareSettings.exportCharacterCardToTavernJson(characterCardId);
            complete({
                success: true,
                message: `Character card exported: ${result.characterCardId}.`,
                data: result
            });
        }
        catch (error) {
            complete_character_card_error("export_character_card_to_tavern_json", error);
        }
    }
    async function ping_mcp(params) {
        try {
            const packageName = (params?.package_name ?? "").trim();
            if (!packageName) {
                complete({
                    success: false,
                    message: "Missing required parameter: package_name"
                });
                return;
            }
            const result = await Tools.System.usePackage(packageName);
            complete({
                success: true,
                message: `Package probe finished: ${packageName}`,
                data: result
            });
        }
        catch (error) {
            complete({
                success: false,
                message: get_error_message(error)
            });
        }
    }
    return {
        operit_editor,
        how_make_skill,
        list_sandbox_packages,
        set_sandbox_package_enabled,
        debug_install_js_package,
        debug_install_toolpkg,
        debug_run_sandbox_script,
        read_environment_variable,
        write_environment_variable,
        restart_mcp_with_logs,
        get_speech_services_config,
        set_speech_services_config,
        test_tts_playback,
        list_model_configs,
        create_model_config,
        update_model_config,
        delete_model_config,
        list_function_model_configs,
        get_function_model_config,
        get_context_summary_config,
        set_context_summary_config,
        set_function_model_config,
        test_model_config_connection,
        list_character_cards,
        get_character_card,
        create_character_card,
        update_character_card,
        delete_character_card,
        set_active_character_card,
        clear_active_character_card,
        import_character_card_from_tavern_json,
        export_character_card_to_tavern_json,
        ping_mcp
    };
})();
exports.operit_editor = operitEditorPackage.operit_editor;
exports.how_make_skill = operitEditorPackage.how_make_skill;
exports.list_sandbox_packages = operitEditorPackage.list_sandbox_packages;
exports.set_sandbox_package_enabled = operitEditorPackage.set_sandbox_package_enabled;
exports.debug_install_js_package = operitEditorPackage.debug_install_js_package;
exports.debug_install_toolpkg = operitEditorPackage.debug_install_toolpkg;
exports.debug_run_sandbox_script = operitEditorPackage.debug_run_sandbox_script;
exports.read_environment_variable = operitEditorPackage.read_environment_variable;
exports.write_environment_variable = operitEditorPackage.write_environment_variable;
exports.restart_mcp_with_logs = operitEditorPackage.restart_mcp_with_logs;
exports.get_speech_services_config = operitEditorPackage.get_speech_services_config;
exports.set_speech_services_config = operitEditorPackage.set_speech_services_config;
exports.test_tts_playback = operitEditorPackage.test_tts_playback;
exports.list_model_configs = operitEditorPackage.list_model_configs;
exports.create_model_config = operitEditorPackage.create_model_config;
exports.update_model_config = operitEditorPackage.update_model_config;
exports.delete_model_config = operitEditorPackage.delete_model_config;
exports.list_function_model_configs = operitEditorPackage.list_function_model_configs;
exports.get_function_model_config = operitEditorPackage.get_function_model_config;
exports.get_context_summary_config = operitEditorPackage.get_context_summary_config;
exports.set_context_summary_config = operitEditorPackage.set_context_summary_config;
exports.set_function_model_config = operitEditorPackage.set_function_model_config;
exports.test_model_config_connection = operitEditorPackage.test_model_config_connection;
exports.list_character_cards = operitEditorPackage.list_character_cards;
exports.get_character_card = operitEditorPackage.get_character_card;
exports.create_character_card = operitEditorPackage.create_character_card;
exports.update_character_card = operitEditorPackage.update_character_card;
exports.delete_character_card = operitEditorPackage.delete_character_card;
exports.set_active_character_card = operitEditorPackage.set_active_character_card;
exports.clear_active_character_card = operitEditorPackage.clear_active_character_card;
exports.import_character_card_from_tavern_json = operitEditorPackage.import_character_card_from_tavern_json;
exports.export_character_card_to_tavern_json = operitEditorPackage.export_character_card_to_tavern_json;
exports.ping_mcp = operitEditorPackage.ping_mcp;
