/* METADATA
{
  "name": "xai_draw",
  "display_name": {
    "zh": "xAI 图片与视频",
    "en": "xAI Images and Video",
    "ru": "Изображения и видео xAI"
  },
  "description": {
    "zh": "使用 xAI 官方接口生成图片和视频，并保存到本地。",
    "en": "Generate images and videos with the official xAI APIs and save them locally.",
    "ru": "Генерирует изображения и видео через официальные API xAI и сохраняет их локально."
  },
  "env": [
    {
      "name": "XAI_API_KEY",
      "description": {
        "zh": "xAI API Key（必填）",
        "en": "xAI API key (required)",
        "ru": "Ключ API xAI (обязательно)"
      },
      "required": true
    },
    {
      "name": "XAI_API_BASE_URL",
      "description": {
        "zh": "xAI API 基地址（可选；默认 https://api.x.ai/v1）",
        "en": "xAI API base URL (optional; default https://api.x.ai/v1)",
        "ru": "Базовый URL API xAI (необязательно; по умолчанию https://api.x.ai/v1)"
      },
      "required": false
    },
    {
      "name": "XAI_IMAGE_MODEL",
      "description": {
        "zh": "默认图片模型（可选；未传 model 时使用，默认 grok-2-image-1212）",
        "en": "Default image model (optional; used when model is omitted, default grok-2-image-1212)",
        "ru": "Модель изображений по умолчанию (необязательно; используется, когда model не передан, по умолчанию grok-2-image-1212)"
      },
      "required": false
    },
    {
      "name": "XAI_VIDEO_MODEL",
      "description": {
        "zh": "默认视频模型（可选；未传 model 时使用，默认 grok-imagine-video）",
        "en": "Default video model (optional; used when model is omitted, default grok-imagine-video)",
        "ru": "Модель видео по умолчанию (необязательно; используется, когда model не передан, по умолчанию grok-imagine-video)"
      },
      "required": false
    }
  ],
  "category": "Draw",
  "tools": [
    {
      "name": "draw_image",
      "description": {
        "zh": "根据提示词调用 xAI 图像生成 API 生成图片，保存到本地并返回 Markdown 图片提示。",
        "en": "Generate an image via the xAI image generation API using a prompt, save it locally, and return a Markdown image reference.",
        "ru": "Генерирует изображение по промпту через API генерации изображений xAI, сохраняет его локально и возвращает ссылку на изображение в Markdown."
      },
      "parameters": [
        { "name": "prompt", "description": { "zh": "绘图提示词（英文或中文皆可）", "en": "Prompt for image generation (Chinese or English)", "ru": "Промпт для генерации изображения (на китайском или английском)" }, "type": "string", "required": true },
        { "name": "model", "description": { "zh": "xAI 图像模型名称；不传则优先取 XAI_IMAGE_MODEL，再用默认值 grok-2-image-1212", "en": "xAI image model name; falls back to XAI_IMAGE_MODEL, then grok-2-image-1212", "ru": "Название модели изображений xAI; если не указано, берётся XAI_IMAGE_MODEL, затем grok-2-image-1212" }, "type": "string", "required": false },
        { "name": "size", "description": { "zh": "图片尺寸，例如 1024x1024（可选）", "en": "Image size, e.g. 1024x1024 (optional)", "ru": "Размер изображения, например 1024x1024 (необязательно)" }, "type": "string", "required": false },
        { "name": "file_name", "description": { "zh": "自定义保存到本地的文件名（不含路径和扩展名）", "en": "Custom output file name (without path or extension)", "ru": "Своё имя выходного файла (без пути и расширения)" }, "type": "string", "required": false }
      ]
    },
    {
      "name": "draw_video",
      "description": {
        "zh": "根据提示词调用 xAI 官方视频生成 API 生成视频，支持文生视频、图生视频和视频编辑，轮询完成后下载到本地并返回本地视频链接提示。",
        "en": "Generate a video with the official xAI video API. Supports text-to-video, image-to-video, and video editing. Polls until completion, downloads locally, and returns local video link hints.",
        "ru": "Генерирует видео через официальный API видео xAI. Поддерживает генерацию по тексту, по изображению и редактирование видео. Опрашивает статус до завершения, скачивает результат локально и возвращает подсказки со ссылкой на локальное видео."
      },
      "parameters": [
        { "name": "prompt", "description": { "zh": "视频提示词", "en": "Video prompt", "ru": "Промпт для видео" }, "type": "string", "required": true },
        { "name": "model", "description": { "zh": "视频模型；不传则优先取 XAI_VIDEO_MODEL，再用默认值 grok-imagine-video", "en": "Video model; falls back to XAI_VIDEO_MODEL, then grok-imagine-video", "ru": "Модель видео; если не указана, берётся XAI_VIDEO_MODEL, затем grok-imagine-video" }, "type": "string", "required": false },
        { "name": "aspect_ratio", "description": { "zh": "输出比例，可选 1:1、16:9、9:16、4:3、3:4、3:2、2:3；默认 16:9；视频编辑模式不支持", "en": "Output aspect ratio. Supported: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3. Defaults to 16:9; not supported for video editing.", "ru": "Соотношение сторон результата. Поддерживаются: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3. По умолчанию 16:9; в режиме редактирования видео не поддерживается." }, "type": "string", "required": false },
        { "name": "resolution", "description": { "zh": "输出分辨率，仅支持 480p 或 720p；默认 480p；视频编辑模式不支持", "en": "Output resolution, only 480p or 720p. Defaults to 480p; not supported for video editing.", "ru": "Разрешение результата: только 480p или 720p. По умолчанию 480p; в режиме редактирования видео не поддерживается." }, "type": "string", "required": false },
        { "name": "duration", "description": { "zh": "输出时长，支持 1-15 秒；默认 5；视频编辑模式不支持", "en": "Output duration from 1 to 15 seconds. Defaults to 5; not supported for video editing.", "ru": "Длительность результата от 1 до 15 секунд. По умолчанию 5; в режиме редактирования видео не поддерживается." }, "type": "number", "required": false },
        { "name": "image_url", "description": { "zh": "图生视频输入图 URL（可选）", "en": "Input image URL for image-to-video (optional)", "ru": "URL входного изображения для генерации видео по изображению (необязательно)" }, "type": "string", "required": false },
        { "name": "image_path", "description": { "zh": "图生视频输入图本地路径（可选，会转成 data URL）", "en": "Local input image path for image-to-video (optional; converted to a data URL)", "ru": "Локальный путь к входному изображению для генерации видео по изображению (необязательно; преобразуется в data URL)" }, "type": "string", "required": false },
        { "name": "video_url", "description": { "zh": "视频编辑输入视频 URL（可选）", "en": "Input video URL for video editing (optional)", "ru": "URL входного видео для редактирования видео (необязательно)" }, "type": "string", "required": false },
        { "name": "file_name", "description": { "zh": "自定义保存到本地的文件名（不含路径和扩展名）", "en": "Custom output file name (without path or extension)", "ru": "Своё имя выходного файла (без пути и расширения)" }, "type": "string", "required": false },
        { "name": "poll_interval_ms", "description": { "zh": "轮询间隔毫秒数，默认 5000", "en": "Polling interval in milliseconds, default 5000", "ru": "Интервал опроса в миллисекундах, по умолчанию 5000" }, "type": "number", "required": false },
        { "name": "max_wait_time_ms", "description": { "zh": "最大等待毫秒数，默认 600000", "en": "Maximum wait time in milliseconds, default 600000", "ru": "Максимальное время ожидания в миллисекундах, по умолчанию 600000" }, "type": "number", "required": false }
      ]
    }
  ]
}*/
/// <reference path="./types/index.d.ts" />
const xaiDraw = (function () {
    function localizedText(zhText, ruText, enText) {
        const langBase = getLang().toLowerCase().split("-")[0];
        if (langBase === "zh")
            return zhText;
        if (langBase === "ru")
            return ruText;
        return enText;
    }
    const HTTP_TIMEOUT_MS = 600000;
    const client = OkHttp.newBuilder()
        .connectTimeout(HTTP_TIMEOUT_MS)
        .readTimeout(HTTP_TIMEOUT_MS)
        .writeTimeout(HTTP_TIMEOUT_MS)
        .build();
    const DEFAULT_IMAGE_MODEL = "grok-2-image-1212";
    const DEFAULT_VIDEO_MODEL = "grok-imagine-video";
    const DEFAULT_POLL_INTERVAL_MS = 5000;
    const DEFAULT_MAX_WAIT_TIME_MS = 600000;
    const DEFAULT_VIDEO_ASPECT_RATIO = "16:9";
    const DEFAULT_VIDEO_RESOLUTION = "480p";
    const DEFAULT_VIDEO_DURATION = 5;
    const VIDEO_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
    const VIDEO_RESOLUTIONS = ["480p", "720p"];
    const MIN_VIDEO_DURATION = 1;
    const MAX_VIDEO_DURATION = 15;
    const DEFAULT_BASE_URL = "https://api.x.ai/v1";
    const DRAW_ROOT_DIR = getPluginConfigDir("draw");
    const STORAGE_DIR = `${DRAW_ROOT_DIR}/xai_draw`;
    const DRAWS_DIR = `${STORAGE_DIR}/draws`;
    const VIDEOS_DIR = `${STORAGE_DIR}/videos`;

    // ===== 新增：动态读取 BaseURL =====
    function getBaseUrl() {
        const raw = String(getEnv("XAI_API_BASE_URL") || "").trim();
        const base = raw || DEFAULT_BASE_URL;
        return base.replace(/\/+$/, "");
    }
    function getImageApiEndpoint() {
        return `${getBaseUrl()}/images/generations`;
    }
    function getVideoGenerationEndpoint() {
        return `${getBaseUrl()}/videos/generations`;
    }
    function getVideoQueryEndpoint(requestId) {
        return `${getBaseUrl()}/videos/${encodeURIComponent(requestId)}`;
    }
    // ==================================

    function getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return String(error);
    }
    function getErrorStack(error) {
        if (error instanceof Error)
            return error.stack;
        return undefined;
    }
    function isRecord(value) {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    function getApiKey() {
        const apiKey = getEnv("XAI_API_KEY");
        if (!apiKey) {
            throw new Error(localizedText("XAI_API_KEY 未配置，请在环境变量中设置 xAI 的 API Key。", "XAI_API_KEY не настроен — укажите ключ API xAI в переменных окружения.", "XAI_API_KEY is not set — configure the xAI API key in the environment variables."));
        }
        return apiKey;
    }
    function getDefaultImageModel() {
        const fromEnv = String(getEnv("XAI_IMAGE_MODEL") || "").trim();
        return fromEnv || DEFAULT_IMAGE_MODEL;
    }
    function getDefaultVideoModel() {
        const fromEnv = String(getEnv("XAI_VIDEO_MODEL") || "").trim();
        return fromEnv || DEFAULT_VIDEO_MODEL;
    }
    function sanitizeFileName(name, fallbackPrefix) {
        const safe = String(name || "").replace(/[\\/:*?"<>|]/g, "_").trim();
        if (!safe) {
            return `${fallbackPrefix}_${Date.now()}`;
        }
        return safe.substring(0, 80);
    }
    function buildFileName(prompt, customName, fallbackPrefix) {
        if (customName && customName.trim().length > 0) {
            return sanitizeFileName(customName, fallbackPrefix);
        }
        const shortPrompt = prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt;
        const base = sanitizeFileName(shortPrompt || fallbackPrefix, fallbackPrefix);
        return `${base}_${Date.now()}`;
    }
    function guessExtensionFromUrl(url, fallback) {
        const match = String(url || "").match(/\.(png|jpg|jpeg|webp|gif|mp4|mov|webm|mkv)(?:\?|#|$)/i);
        if (match && match[1]) {
            return match[1].toLowerCase();
        }
        return fallback;
    }
    function guessMimeTypeFromPath(path) {
        const normalized = String(path || "").trim().toLowerCase();
        if (normalized.endsWith(".png"))
            return "image/png";
        if (normalized.endsWith(".webp"))
            return "image/webp";
        if (normalized.endsWith(".gif"))
            return "image/gif";
        if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg"))
            return "image/jpeg";
        return "application/octet-stream";
    }
    function isProbablyUrl(value) {
        return /^https?:\/\//i.test(String(value || "").trim());
    }
    function normalizePositiveInteger(value, fallback) {
        if (value === undefined || value === null || value === "")
            return fallback;
        const parsed = typeof value === "number" ? value : parseInt(String(value), 10);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return fallback;
        return Math.floor(parsed);
    }
    function normalizeVideoAspectRatio(value) {
        const raw = String(value || "").trim();
        if (!raw)
            return DEFAULT_VIDEO_ASPECT_RATIO;
        if (!VIDEO_ASPECT_RATIOS.includes(raw)) {
            throw new Error(localizedText(`aspect_ratio 仅支持 ${VIDEO_ASPECT_RATIOS.join(" 或 ")}。`, `Параметр aspect_ratio поддерживает только ${VIDEO_ASPECT_RATIOS.join(", ")}.`, `aspect_ratio supports only ${VIDEO_ASPECT_RATIOS.join(", ")}.`));
        }
        return raw;
    }
    function normalizeVideoResolution(value) {
        const raw = String(value || "").trim().toLowerCase();
        if (!raw)
            return DEFAULT_VIDEO_RESOLUTION;
        if (!VIDEO_RESOLUTIONS.includes(raw)) {
            throw new Error(localizedText(`resolution 仅支持 ${VIDEO_RESOLUTIONS.join(" 或 ")}。`, `Параметр resolution поддерживает только ${VIDEO_RESOLUTIONS.join(", ")}.`, `resolution supports only ${VIDEO_RESOLUTIONS.join(", ")}.`));
        }
        return raw;
    }
    function normalizeVideoDuration(value) {
        if (value === undefined || value === null || value === "")
            return DEFAULT_VIDEO_DURATION;
        const parsed = typeof value === "number" ? value : parseInt(String(value), 10);
        if (!Number.isFinite(parsed)) {
            throw new Error(localizedText("duration 必须是数字。", "Параметр duration должен быть числом.", "duration must be a number."));
        }
        const normalized = Math.floor(parsed);
        if (normalized < MIN_VIDEO_DURATION || normalized > MAX_VIDEO_DURATION) {
            throw new Error(localizedText(`duration 仅支持 ${MIN_VIDEO_DURATION}-${MAX_VIDEO_DURATION} 秒。`, `Параметр duration должен быть от ${MIN_VIDEO_DURATION} до ${MAX_VIDEO_DURATION} секунд.`, `duration must be between ${MIN_VIDEO_DURATION} and ${MAX_VIDEO_DURATION} seconds.`));
        }
        return normalized;
    }
    async function ensureDirectories() {
        const dirs = [DRAW_ROOT_DIR, STORAGE_DIR, DRAWS_DIR, VIDEOS_DIR];
        for (const dir of dirs) {
            try {
                const result = await Tools.Files.mkdir(dir);
                if (!result.successful) {
                    console.warn(`创建目录失败(可能已存在): ${dir} -> ${result.details}`);
                }
            }
            catch (error) {
                console.warn(`创建目录异常: ${dir} -> ${getErrorMessage(error)}`);
            }
        }
    }
    async function parseJsonResponse(response, label) {
        try {
            const parsed = JSON.parse(response.content);
            if (!isRecord(parsed)) {
                throw new Error(localizedText("响应不是对象", "ответ не является объектом", "the response is not an object"));
            }
            return parsed;
        }
        catch (error) {
            throw new Error(localizedText(`解析 ${label} 响应失败: ${getErrorMessage(error)}`, `Не удалось разобрать ответ ${label}: ${getErrorMessage(error)}`, `Failed to parse the ${label} response: ${getErrorMessage(error)}`));
        }
    }
    function extractApiErrorMessage(payload) {
        const directError = payload.error;
        if (typeof directError === "string" && directError.trim()) {
            return directError.trim();
        }
        if (isRecord(directError)) {
            if (typeof directError.message === "string" && directError.message.trim()) {
                return directError.message.trim();
            }
            if (typeof directError.code === "string" && directError.code.trim()) {
                return directError.code.trim();
            }
        }
        return "";
    }
    async function readLocalImageAsDataUrl(filePath) {
        const trimmedPath = String(filePath || "").trim();
        if (!trimmedPath) {
            throw new Error(localizedText("image_path 不能为空。", "Параметр image_path не может быть пустым.", "image_path cannot be empty."));
        }
        const existsResult = await Tools.Files.exists(trimmedPath);
        if (!existsResult.exists) {
            throw new Error(localizedText(`本地图片不存在: ${trimmedPath}`, `Локальное изображение не найдено: ${trimmedPath}`, `Local image not found: ${trimmedPath}`));
        }
        const binaryResult = await Tools.Files.readBinary(trimmedPath);
        const base64Content = binaryResult && binaryResult.contentBase64
            ? String(binaryResult.contentBase64).trim()
            : "";
        if (!base64Content) {
            throw new Error(localizedText(`读取本地图片失败: ${trimmedPath}`, `Не удалось прочитать локальное изображение: ${trimmedPath}`, `Failed to read the local image: ${trimmedPath}`));
        }
        return `data:${guessMimeTypeFromPath(trimmedPath)};base64,${base64Content}`;
    }
    async function resolveVideoInputs(imageUrl, imagePath, videoUrl) {
        const trimmedImageUrl = String(imageUrl || "").trim();
        const trimmedImagePath = String(imagePath || "").trim();
        const trimmedVideoUrl = String(videoUrl || "").trim();
        const imageInputCount = (trimmedImageUrl ? 1 : 0) + (trimmedImagePath ? 1 : 0);
        if (imageInputCount > 1) {
            throw new Error(localizedText("image_url 和 image_path 只能二选一，请不要同时传。", "Параметры image_url и image_path взаимоисключающие — не передавайте их одновременно.", "image_url and image_path are mutually exclusive — do not pass both."));
        }
        if (trimmedVideoUrl && imageInputCount > 0) {
            throw new Error(localizedText("视频生成一次只能使用一种输入源：纯文本、图片或视频。请不要同时传 image_* 和 video_url。", "За одну генерацию видео можно использовать только один источник входных данных: текст, изображение или видео. Не передавайте image_* и video_url одновременно.", "A single video generation accepts only one input source: text, image or video. Do not pass image_* and video_url together."));
        }
        if (trimmedImageUrl) {
            if (!isProbablyUrl(trimmedImageUrl)) {
                throw new Error(localizedText("image_url 必须是 http 或 https 链接。", "Параметр image_url должен быть ссылкой http или https.", "image_url must be an http or https link."));
            }
            return {
                image: trimmedImageUrl,
                input_type: "image_url"
            };
        }
        if (trimmedImagePath) {
            return {
                image: await readLocalImageAsDataUrl(trimmedImagePath),
                input_type: "image_path"
            };
        }
        if (trimmedVideoUrl) {
            if (!isProbablyUrl(trimmedVideoUrl)) {
                throw new Error(localizedText("video_url 必须是 http 或 https 链接。", "Параметр video_url должен быть ссылкой http или https.", "video_url must be an http or https link."));
            }
            return {
                video_url: trimmedVideoUrl,
                input_type: "video_url"
            };
        }
        return {
            input_type: "text"
        };
    }
    async function callXaiImageApi(params) {
        const apiKey = getApiKey();
        const modelFromParam = String(params.model || "").trim();
        const effectiveModel = modelFromParam || getDefaultImageModel();
        const body = {
            model: effectiveModel,
            prompt: params.prompt
        };
        const size = String(params.size || "").trim();
        if (size) {
            body.size = size;
        }
        const request = client
            .newRequest()
            .url(getImageApiEndpoint())
            .method("POST")
            .headers({
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        })
            .body(JSON.stringify(body), "json");
        const response = await request.build().execute();
        if (!response.isSuccessful()) {
            throw new Error(localizedText(`xAI 图片 API 调用失败: ${response.statusCode} - ${response.content}`, `Не удалось вызвать API изображений xAI: ${response.statusCode} — ${response.content}`, `xAI image API call failed: ${response.statusCode} — ${response.content}`));
        }
        const parsed = await parseJsonResponse(response, localizedText("xAI 图片生成", "генерации изображения xAI", "xAI image generation"));
        const data = Array.isArray(parsed.data) ? parsed.data : [];
        const first = data.length > 0 && isRecord(data[0]) ? data[0] : null;
        const imageUrl = first && typeof first.url === "string" ? String(first.url).trim() : "";
        if (!imageUrl) {
            throw new Error(localizedText("xAI 响应中未找到图片 URL，请检查模型和参数是否正确。", "В ответе xAI не найден URL изображения — проверьте, верны ли модель и параметры.", "No image URL found in the xAI response — check that the model and parameters are correct."));
        }
        return {
            image_url: imageUrl,
            effective_model: effectiveModel
        };
    }
    async function createVideoTask(params) {
        const apiKey = getApiKey();
        const modelFromParam = String(params.model || "").trim();
        const effectiveModel = modelFromParam || getDefaultVideoModel();
        const body = {
            model: effectiveModel,
            prompt: String(params.prompt || "").trim()
        };
        const isVideoEdit = Boolean(params.video_url);
        if (!isVideoEdit) {
            body.aspect_ratio = normalizeVideoAspectRatio(params.aspect_ratio);
            body.resolution = normalizeVideoResolution(params.resolution);
            body.duration = normalizeVideoDuration(params.duration);
        }
        if (params.image) {
            body.image = {
                url: params.image
            };
        }
        if (params.video_url) {
            body.video_url = params.video_url;
        }
        const request = client
            .newRequest()
            .url(getVideoGenerationEndpoint())
            .method("POST")
            .headers({
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        })
            .body(JSON.stringify(body), "json");
        const response = await request.build().execute();
        if (!response.isSuccessful()) {
            throw new Error(localizedText(`xAI 视频创建任务失败: ${response.statusCode} - ${response.content}`, `Не удалось создать задачу генерации видео xAI: ${response.statusCode} — ${response.content}`, `xAI video task creation failed: ${response.statusCode} — ${response.content}`));
        }
        const parsed = await parseJsonResponse(response, localizedText("xAI 视频创建", "создания видео xAI", "xAI video creation"));
        const requestId = typeof parsed.request_id === "string" ? parsed.request_id.trim() : "";
        const status = typeof parsed.status === "string" ? parsed.status.trim() : "";
        if (!requestId) {
            throw new Error(localizedText(`xAI 视频创建响应中未找到 request_id: ${response.content}`, `В ответе xAI на создание видео не найден request_id: ${response.content}`, `No request_id found in the xAI video creation response: ${response.content}`));
        }
        return {
            request_id: requestId,
            status,
            effective_model: effectiveModel,
            aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : null,
            resolution: typeof body.resolution === "string" ? body.resolution : null,
            duration: typeof body.duration === "number" ? body.duration : null
        };
    }
    async function queryVideoTaskStatus(requestId) {
        const apiKey = getApiKey();
        const endpoint = getVideoQueryEndpoint(requestId);
        const request = client
            .newRequest()
            .url(endpoint)
            .method("GET")
            .headers({
            "accept": "application/json",
            "Authorization": `Bearer ${apiKey}`
        });
        const response = await request.build().execute();
        if (!response.isSuccessful()) {
            throw new Error(localizedText(`xAI 视频查询失败: ${response.statusCode} - ${response.content}`, `Не удалось получить статус видео xAI: ${response.statusCode} — ${response.content}`, `xAI video status query failed: ${response.statusCode} — ${response.content}`));
        }
        const parsed = await parseJsonResponse(response, localizedText("xAI 视频查询", "статуса видео xAI", "xAI video status"));
        const status = typeof parsed.status === "string" ? parsed.status.trim() : "";
        const video = isRecord(parsed.video) ? parsed.video : null;
        const videoUrl = video && typeof video.url === "string" ? video.url.trim() : "";
        const contentType = video && typeof video.content_type === "string" ? video.content_type.trim() : "";
        const expiresAt = video && typeof video.expires_at === "string" ? video.expires_at.trim() : "";
        const duration = video && typeof video.duration === "number" ? video.duration : null;
        const respectModeration = video && typeof video.respect_moderation === "string"
            ? video.respect_moderation.trim()
            : "";
        const errorMessage = extractApiErrorMessage(parsed);
        return {
            status,
            video_url: videoUrl,
            content_type: contentType,
            expires_at: expiresAt,
            duration,
            respect_moderation: respectModeration,
            error_message: errorMessage
        };
    }
    function normalizeVideoTaskStatus(status) {
        const normalized = String(status || "").trim().toLowerCase();
        if (normalized === "done")
            return "completed";
        if (normalized === "expired")
            return "failed";
        return "processing";
    }
    async function draw_image(params) {
        if (!params || !params.prompt || params.prompt.trim().length === 0) {
            throw new Error(localizedText("参数 prompt 不能为空。", "Параметр prompt не может быть пустым.", "Parameter prompt cannot be empty."));
        }
        const prompt = params.prompt.trim();
        await ensureDirectories();
        const apiResult = await callXaiImageApi({
            prompt,
            model: params.model,
            size: params.size
        });
        const ext = guessExtensionFromUrl(apiResult.image_url, "png");
        const baseName = buildFileName(prompt, params.file_name, "xai_draw");
        const filePath = `${DRAWS_DIR}/${baseName}.${ext}`;
        const downloadResult = await Tools.Files.download(apiResult.image_url, filePath);
        if (!downloadResult.successful) {
            throw new Error(localizedText(`下载图片失败: ${downloadResult.details}`, `Не удалось скачать изображение: ${downloadResult.details}`, `Failed to download the image: ${downloadResult.details}`));
        }
        const fileUri = `file://${filePath}`;
        const markdown = localizedText(`![AI生成的图片](${fileUri})`, `![Изображение, созданное ИИ](${fileUri})`, `![AI-generated image](${fileUri})`);
        const hintLines = [];
        hintLines.push(localizedText(`图片已生成并保存在本地 ${DRAWS_DIR}。`, `Изображение создано и сохранено локально в ${DRAWS_DIR}.`, `The image was generated and saved locally to ${DRAWS_DIR}.`));
        hintLines.push(localizedText(`本地路径: ${filePath}`, `Локальный путь: ${filePath}`, `Local path: ${filePath}`));
        hintLines.push("");
        hintLines.push(localizedText("在后续回答中，请直接输出下面这一行 Markdown 来展示这张图片：", "В дальнейшем ответе выведите эту строку Markdown, чтобы показать изображение:", "In your follow-up answer, output this Markdown line to display the image:"));
        hintLines.push("");
        hintLines.push(markdown);
        return {
            prompt,
            model: apiResult.effective_model,
            remote_image_url: apiResult.image_url,
            file_path: filePath,
            file_uri: fileUri,
            markdown,
            hint: hintLines.join("\n")
        };
    }
    async function draw_video(params) {
        const prompt = String(params && params.prompt ? params.prompt : "").trim();
        if (!prompt) {
            throw new Error(localizedText("prompt 不能为空。", "Параметр prompt не может быть пустым.", "prompt cannot be empty."));
        }
        await ensureDirectories();
        const resolvedInputs = await resolveVideoInputs(params.image_url, params.image_path, params.video_url);
        const createdTask = await createVideoTask({
            ...params,
            prompt,
            image: resolvedInputs.image,
            video_url: resolvedInputs.video_url
        });
        const pollIntervalMs = normalizePositiveInteger(params.poll_interval_ms, DEFAULT_POLL_INTERVAL_MS);
        const maxWaitTimeMs = normalizePositiveInteger(params.max_wait_time_ms, DEFAULT_MAX_WAIT_TIME_MS);
        const deadline = Date.now() + maxWaitTimeMs;
        let latestStatus = createdTask.status;
        let latestErrorMessage = "";
        let remoteVideoUrl = "";
        let remoteContentType = "";
        let expiresAt = "";
        let remoteDuration = createdTask.duration;
        let remoteRespectModeration = "";
        while (Date.now() <= deadline) {
            const statusResult = await queryVideoTaskStatus(createdTask.request_id);
            latestStatus = statusResult.status;
            latestErrorMessage = statusResult.error_message;
            remoteContentType = statusResult.content_type;
            expiresAt = statusResult.expires_at;
            remoteDuration = statusResult.duration;
            remoteRespectModeration = statusResult.respect_moderation;
            const normalizedStatus = normalizeVideoTaskStatus(statusResult.status);
            if (normalizedStatus === "completed") {
                remoteVideoUrl = statusResult.video_url;
                if (!remoteVideoUrl) {
                    throw new Error(localizedText("视频任务已完成，但响应中未找到 video.url。", "Задача видео завершена, но в ответе не найден video.url.", "The video task is complete, but no video.url was found in the response."));
                }
                break;
            }
            if (normalizedStatus === "failed") {
                throw new Error(localizedText(`视频生成失败或过期: ${latestErrorMessage || latestStatus || "接口未返回失败原因"}`, `Генерация видео завершилась неудачей или срок её действия истёк: ${latestErrorMessage || latestStatus || "API не вернул причину сбоя"}`, `Video generation failed or expired: ${latestErrorMessage || latestStatus || "the API returned no failure reason"}`));
            }
            await Tools.System.sleep(pollIntervalMs);
        }
        if (!remoteVideoUrl) {
            throw new Error(localizedText(`视频生成超时，最后状态为 ${latestStatus || "未知"}${latestErrorMessage ? `，原因：${latestErrorMessage}` : ""}`, `Генерация видео превысила время ожидания, последний статус — ${latestStatus || "неизвестен"}${latestErrorMessage ? `, причина: ${latestErrorMessage}` : ""}`, `Video generation timed out, last status: ${latestStatus || "unknown"}${latestErrorMessage ? `, reason: ${latestErrorMessage}` : ""}`));
        }
        const extension = guessExtensionFromUrl(remoteVideoUrl, "mp4");
        const baseName = buildFileName(prompt, params.file_name, "xai_video");
        const filePath = `${VIDEOS_DIR}/${baseName}.${extension}`;
        const downloadResult = await Tools.Files.download(remoteVideoUrl, filePath);
        if (!downloadResult.successful) {
            throw new Error(localizedText(`下载视频失败: ${downloadResult.details}`, `Не удалось скачать видео: ${downloadResult.details}`, `Failed to download the video: ${downloadResult.details}`));
        }
        const fileUri = `file://${filePath}`;
        const markdownLink = localizedText(`[点击查看生成的视频](${fileUri})`, `[Открыть созданное видео](${fileUri})`, `[View the generated video](${fileUri})`);
        const htmlVideo = `<video controls src="${fileUri}"></video>`;
        const hintLines = [];
        hintLines.push(localizedText(`视频已生成并保存在本地 ${VIDEOS_DIR}。`, `Видео создано и сохранено локально в ${VIDEOS_DIR}.`, `The video was generated and saved locally to ${VIDEOS_DIR}.`));
        hintLines.push(localizedText(`本地路径: ${filePath}`, `Локальный путь: ${filePath}`, `Local path: ${filePath}`));
        hintLines.push("");
        hintLines.push(localizedText("后续回答如果要给出视频，请优先返回这个本地链接：", "Если в дальнейшем ответе нужно показать видео, отдайте эту локальную ссылку:", "If your follow-up answer needs to show the video, prefer this local link:"));
        hintLines.push(markdownLink);
        hintLines.push("");
        hintLines.push(localizedText("如果当前渲染环境支持 HTML 视频标签，也可以使用：", "Если среда отображения поддерживает HTML-тег video, можно использовать и такой вариант:", "If the current rendering environment supports the HTML video tag, you can also use:"));
        hintLines.push(htmlVideo);
        return {
            prompt,
            model: createdTask.effective_model,
            request_id: createdTask.request_id,
            status: latestStatus,
            input_type: resolvedInputs.input_type,
            aspect_ratio: createdTask.aspect_ratio,
            resolution: createdTask.resolution,
            duration: remoteDuration,
            remote_video_url: remoteVideoUrl,
            remote_content_type: remoteContentType,
            remote_expires_at: expiresAt,
            remote_respect_moderation: remoteRespectModeration,
            file_path: filePath,
            file_uri: fileUri,
            markdown_link: markdownLink,
            html_video: htmlVideo,
            hint: hintLines.join("\n")
        };
    }
    async function draw_image_wrapper(params) {
        try {
            const result = await draw_image(params);
            complete({
                success: true,
                message: localizedText("xAI 图片生成成功，已下载到本地。", "Изображение xAI создано и скачано локально.", "The xAI image was generated and downloaded locally."),
                data: result
            });
        }
        catch (error) {
            console.error("draw_image 执行失败:", error);
            complete({
                success: false,
                message: localizedText(`xAI 图片生成失败: ${getErrorMessage(error)}`, `Не удалось создать изображение xAI: ${getErrorMessage(error)}`, `xAI image generation failed: ${getErrorMessage(error)}`),
                error_stack: getErrorStack(error)
            });
        }
    }
    async function draw_video_wrapper(params) {
        try {
            const result = await draw_video((params || {}));
            complete({
                success: true,
                message: localizedText("xAI 视频生成成功，已下载到本地。", "Видео xAI создано и скачано локально.", "The xAI video was generated and downloaded locally."),
                data: result
            });
        }
        catch (error) {
            console.error("draw_video 执行失败:", error);
            complete({
                success: false,
                message: localizedText(`xAI 视频生成失败: ${getErrorMessage(error)}`, `Не удалось создать видео xAI: ${getErrorMessage(error)}`, `xAI video generation failed: ${getErrorMessage(error)}`),
                error_stack: getErrorStack(error)
            });
        }
    }
    return {
        draw_image: draw_image_wrapper,
        draw_video: draw_video_wrapper
    };
})();
exports.draw_image = xaiDraw.draw_image;
exports.draw_video = xaiDraw.draw_video;
