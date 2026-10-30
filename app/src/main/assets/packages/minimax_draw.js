/* METADATA
{
  "name": "minimax_draw",
  "display_name": {
    "zh": "MiniMax 绘图",
    "en": "MiniMax Draw",
    "ru": "Рисование MiniMax"
  },
  "description": {
    "zh": "使用 MiniMax 官方图像生成接口 (/v1/image_generation) 生成图片，支持文生图和带参考图的生图；结果保存到本地 /sdcard/Download/Operit/plugins/draw/minimax_draw/draws/ 目录，并返回 Markdown 图片提示。",
    "en": "Generate images with the official MiniMax image generation API (/v1/image_generation). Supports text-to-image and reference-image generation. Saves results to /sdcard/Download/Operit/plugins/draw/minimax_draw/draws/ and returns Markdown image hints.",
    "ru": "Генерирует изображения через официальный API генерации изображений MiniMax (/v1/image_generation). Поддерживает генерацию по тексту и генерацию с референсными изображениями. Сохраняет результаты в /sdcard/Download/Operit/plugins/draw/minimax_draw/draws/ и возвращает подсказки изображений в Markdown."
  },
  "category": "Draw",
  "env": [
    {
      "name": "MINIMAX_API_KEY",
      "description": {
        "zh": "MiniMax API Key（必填）",
        "en": "MiniMax API key (required)",
        "ru": "Ключ API MiniMax (обязательно)"
      },
      "required": true
    },
    {
      "name": "MINIMAX_API_BASE_URL",
      "description": {
        "zh": "MiniMax API Base URL（可选；默认 https://api.minimaxi.com，国际站可改为 https://api.minimax.io）",
        "en": "MiniMax API base URL (optional; defaults to https://api.minimaxi.com, international users can use https://api.minimax.io)",
        "ru": "Базовый URL API MiniMax (необязательно; по умолчанию https://api.minimaxi.com, для международного сайта можно использовать https://api.minimax.io)"
      },
      "required": false
    },
    {
      "name": "MINIMAX_IMAGE_MODEL",
      "description": {
        "zh": "默认图片模型（可选；未传 model 时使用，默认 image-01）",
        "en": "Default image model (optional; used when model is omitted, default image-01)",
        "ru": "Модель изображений по умолчанию (необязательно; используется, когда model не передан, по умолчанию image-01)"
      },
      "required": false
    },
    {
      "name": "BEEIMG_API_KEY",
      "description": {
        "zh": "BeeIMG API Key（可选；仅当 image_paths 传本地参考图路径时需要，用于先上传到公网图床）",
        "en": "BeeIMG API key (optional; only needed when image_paths is used so local reference images can be uploaded first)",
        "ru": "Ключ API BeeIMG (необязательно; нужен только когда используется image_paths, чтобы сначала загрузить локальные референсные изображения)"
      },
      "required": false
    }
  ],
  "tools": [
    {
      "name": "draw_image",
      "description": {
        "zh": "根据提示词调用 MiniMax 官方绘图接口生成图片，支持文生图和参考图生图，保存到本地并返回 Markdown 图片提示。",
        "en": "Generate images with the official MiniMax image API using a prompt. Supports text-to-image and reference-image generation, saves locally, and returns Markdown image hints.",
        "ru": "Генерирует изображения по промпту через официальный API изображений MiniMax. Поддерживает генерацию по тексту и с референсными изображениями, сохраняет результаты локально и возвращает подсказки изображений в Markdown."
      },
      "parameters": [
        { "name": "prompt", "description": { "zh": "绘图提示词（中文或英文）", "en": "Image prompt (Chinese or English)", "ru": "Промпт для генерации изображения (на китайском или английском)" }, "type": "string", "required": true },
        { "name": "model", "description": { "zh": "模型名称（可选；不传则使用环境变量 MINIMAX_IMAGE_MODEL，否则默认 image-01）", "en": "Model name (optional; falls back to MINIMAX_IMAGE_MODEL, then image-01)", "ru": "Название модели (необязательно; если не указано, берётся MINIMAX_IMAGE_MODEL, затем image-01)" }, "type": "string", "required": false },
        { "name": "aspect_ratio", "description": { "zh": "输出比例，可选 1:1、16:9、4:3、3:2、2:3、3:4、9:16、21:9；21:9 仅 image-01 支持", "en": "Aspect ratio. Supported: 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9. 21:9 is only supported by image-01.", "ru": "Соотношение сторон. Поддерживаются: 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9. 21:9 поддерживается только моделью image-01." }, "type": "string", "required": false },
        { "name": "width", "description": { "zh": "输出宽度（可选；仅 image-01 支持；需与 height 一起传，范围 512-2048 且为 8 的倍数）", "en": "Output width (optional; image-01 only; must be provided together with height, range 512-2048 and multiple of 8)", "ru": "Ширина результата (необязательно; только для image-01; передаётся вместе с height, диапазон 512–2048 и кратность 8)" }, "type": "number", "required": false },
        { "name": "height", "description": { "zh": "输出高度（可选；仅 image-01 支持；需与 width 一起传，范围 512-2048 且为 8 的倍数）", "en": "Output height (optional; image-01 only; must be provided together with width, range 512-2048 and multiple of 8)", "ru": "Высота результата (необязательно; только для image-01; передаётся вместе с width, диапазон 512–2048 и кратность 8)" }, "type": "number", "required": false },
        { "name": "n", "description": { "zh": "生成图片数量，范围 1-9，默认 1", "en": "Number of images to generate, range 1-9, default 1", "ru": "Количество генерируемых изображений, диапазон 1–9, по умолчанию 1" }, "type": "number", "required": false },
        { "name": "response_format", "description": { "zh": "返回格式，可选 url 或 base64；默认 base64（更适合直接保存到本地）", "en": "Response format: url or base64. Defaults to base64 for direct local saving.", "ru": "Формат ответа: url или base64. По умолчанию base64 — так проще сохранять локально." }, "type": "string", "required": false },
        { "name": "prompt_optimizer", "description": { "zh": "是否启用提示词优化（可选）", "en": "Enable prompt optimizer (optional)", "ru": "Включить оптимизатор промпта (необязательно)" }, "type": "boolean", "required": false },
        { "name": "aigc_watermark", "description": { "zh": "是否添加 AIGC 水印（可选）", "en": "Add AIGC watermark (optional)", "ru": "Добавить водяной знак AIGC (необязательно)" }, "type": "boolean", "required": false },
        { "name": "seed", "description": { "zh": "随机种子（可选）", "en": "Seed (optional)", "ru": "Сид (необязательно)" }, "type": "number", "required": false },
        { "name": "image_urls", "description": { "zh": "参考图公网 URL 数组（可选；图生图用）。支持字符串数组、JSON 字符串或逗号分隔字符串", "en": "Reference image public URL list (optional; for reference-image generation). Accepts string array, JSON string, or comma-separated string.", "ru": "Список публичных URL референсных изображений (необязательно; для генерации по референсу). Принимает массив строк, JSON-строку или строку, разделённую запятыми." }, "type": "array", "required": false },
        { "name": "image_paths", "description": { "zh": "参考图本地路径数组（可选；会先上传到图床再提交给 MiniMax）。支持字符串数组、JSON 字符串或逗号分隔字符串", "en": "Reference local image path list (optional; local images are uploaded first before calling MiniMax). Accepts string array, JSON string, or comma-separated string.", "ru": "Список локальных путей референсных изображений (необязательно; локальные изображения сначала загружаются, а затем передаются в MiniMax). Принимает массив строк, JSON-строку или строку, разделённую запятыми." }, "type": "array", "required": false },
        { "name": "file_name", "description": { "zh": "自定义本地文件名（不含扩展名）", "en": "Custom local output file name without extension", "ru": "Своё имя локального выходного файла без расширения" }, "type": "string", "required": false },
        { "name": "api_base_url", "description": { "zh": "自定义 MiniMax API Base URL（可选）", "en": "Custom MiniMax API base URL (optional)", "ru": "Свой базовый URL API MiniMax (необязательно)" }, "type": "string", "required": false }
      ]
    }
  ]
}*/
/// <reference path="./types/index.d.ts" />
const minimaxDraw = (function () {
    const HTTP_TIMEOUT_MS = 600000;
    const client = OkHttp.newBuilder()
        .connectTimeout(HTTP_TIMEOUT_MS)
        .readTimeout(HTTP_TIMEOUT_MS)
        .writeTimeout(HTTP_TIMEOUT_MS)
        .build();
    function localizedText(zhText, ruText, enText) {
        const langBase = getLang().toLowerCase().split("-")[0];
        if (langBase === "zh")
            return zhText;
        if (langBase === "ru")
            return ruText;
        return enText;
    }
    const DEFAULT_API_BASE_URL = "https://api.minimaxi.com";
    const DEFAULT_MODEL = "image-01";
    const DEFAULT_RESPONSE_FORMAT = "base64";
    const DEFAULT_IMAGE_COUNT = 1;
    const DEFAULT_BASE64_EXTENSION = "jpeg";
    const SUPPORTED_ASPECT_RATIOS = ["1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "21:9"];
    const BEEIMG_UPLOAD_ENDPOINT = "https://beeimg.com/api/upload/file/json/";
    const DRAW_ROOT_DIR = getPluginConfigDir("draw");
    const STORAGE_DIR = `${DRAW_ROOT_DIR}/minimax_draw`;
    const DRAWS_DIR = `${STORAGE_DIR}/draws`;
    function isRecord(value) {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    function getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return String(error);
    }
    function getApiKey() {
        const apiKey = String(getEnv("MINIMAX_API_KEY") || "").trim();
        if (!apiKey) {
            throw new Error(localizedText("MINIMAX_API_KEY 未配置，请先在环境变量中设置 MiniMax API Key。", "MINIMAX_API_KEY не настроен — сначала укажите ключ API MiniMax в переменных окружения.", "MINIMAX_API_KEY is not set — configure the MiniMax API key in the environment variables first."));
        }
        return apiKey;
    }
    function joinUrl(baseUrl, path) {
        const normalizedBase = String(baseUrl || "").endsWith("/") ? String(baseUrl || "") : `${baseUrl}/`;
        const normalizedPath = String(path || "").startsWith("/") ? String(path).slice(1) : String(path || "");
        return `${normalizedBase}${normalizedPath}`;
    }
    function getApiBaseUrl(customBaseUrl) {
        const fromParam = String(customBaseUrl || "").trim();
        if (fromParam)
            return fromParam;
        const fromEnv = String(getEnv("MINIMAX_API_BASE_URL") || "").trim();
        if (fromEnv)
            return fromEnv;
        return DEFAULT_API_BASE_URL;
    }
    function getImageEndpoint(baseUrl) {
        const trimmed = String(baseUrl || "").trim();
        if (!trimmed)
            return joinUrl(DEFAULT_API_BASE_URL, "v1/image_generation");
        if (trimmed.includes("/v1/image_generation"))
            return trimmed;
        if (trimmed.endsWith("/v1"))
            return joinUrl(trimmed, "image_generation");
        if (trimmed.endsWith("/v1/"))
            return joinUrl(trimmed, "image_generation");
        return joinUrl(trimmed, "v1/image_generation");
    }
    function resolveModel(model) {
        const fromParam = String(model || "").trim();
        if (fromParam)
            return fromParam;
        const fromEnv = String(getEnv("MINIMAX_IMAGE_MODEL") || "").trim();
        if (fromEnv)
            return fromEnv;
        return DEFAULT_MODEL;
    }
    function sanitizeFileName(name, fallbackPrefix) {
        const safe = String(name || "").replace(/[\\/:*?"<>|]/g, "_").trim();
        if (!safe)
            return `${fallbackPrefix}_${Date.now()}`;
        return safe.substring(0, 80);
    }
    function buildFileBaseName(prompt, customName, fallbackPrefix) {
        const fromCustom = String(customName || "").trim();
        if (fromCustom) {
            return sanitizeFileName(fromCustom, fallbackPrefix);
        }
        const rawPrompt = String(prompt || "").trim();
        const shortPrompt = rawPrompt.length > 40 ? `${rawPrompt.substring(0, 40)}...` : rawPrompt;
        return `${sanitizeFileName(shortPrompt || fallbackPrefix, fallbackPrefix)}_${Date.now()}`;
    }
    async function ensureDirectories() {
        const dirs = [DRAW_ROOT_DIR, STORAGE_DIR, DRAWS_DIR];
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
    function parsePositiveInteger(value, fieldName, options) {
        const hasDefault = !!options && Object.prototype.hasOwnProperty.call(options, "defaultValue");
        const defaultValue = hasDefault ? options.defaultValue : undefined;
        if (value === undefined || value === null || value === "") {
            return defaultValue;
        }
        const numberValue = typeof value === "number" ? value : Number(String(value));
        if (!Number.isFinite(numberValue) || numberValue <= 0 || !Number.isInteger(numberValue)) {
            throw new Error(localizedText(`${fieldName} 必须是正整数。`, `Параметр ${fieldName} должен быть положительным целым числом.`, `${fieldName} must be a positive integer.`));
        }
        if (options && options.min !== undefined && numberValue < options.min) {
            throw new Error(localizedText(`${fieldName} 不能小于 ${options.min}。`, `Значение ${fieldName} не может быть меньше ${options.min}.`, `${fieldName} cannot be less than ${options.min}.`));
        }
        if (options && options.max !== undefined && numberValue > options.max) {
            throw new Error(localizedText(`${fieldName} 不能大于 ${options.max}。`, `Значение ${fieldName} не может быть больше ${options.max}.`, `${fieldName} cannot be greater than ${options.max}.`));
        }
        return numberValue;
    }
    function parseInteger(value, fieldName) {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }
        const numberValue = typeof value === "number" ? value : Number(String(value));
        if (!Number.isFinite(numberValue) || !Number.isInteger(numberValue)) {
            throw new Error(localizedText(`${fieldName} 必须是整数。`, `Параметр ${fieldName} должен быть целым числом.`, `${fieldName} must be an integer.`));
        }
        return numberValue;
    }
    function parseBoolean(value, fieldName) {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }
        if (typeof value === "boolean") {
            return value;
        }
        const normalized = String(value).trim().toLowerCase();
        if (normalized === "true" || normalized === "1" || normalized === "yes") {
            return true;
        }
        if (normalized === "false" || normalized === "0" || normalized === "no") {
            return false;
        }
        throw new Error(localizedText(`${fieldName} 必须是布尔值。`, `Параметр ${fieldName} должен быть логическим значением.`, `${fieldName} must be a boolean.`));
    }
    function normalizeResponseFormat(value) {
        const normalized = String(value || DEFAULT_RESPONSE_FORMAT).trim().toLowerCase();
        if (normalized !== "url" && normalized !== "base64") {
            throw new Error(localizedText("response_format 仅支持 url 或 base64。", "Параметр response_format поддерживает только url или base64.", "response_format supports only url or base64."));
        }
        return normalized;
    }
    function normalizeAspectRatio(model, value) {
        const normalized = String(value || "").trim();
        if (!normalized)
            return undefined;
        if (!SUPPORTED_ASPECT_RATIOS.includes(normalized)) {
            throw new Error(localizedText(`aspect_ratio 仅支持 ${SUPPORTED_ASPECT_RATIOS.join("、")}。`, `Параметр aspect_ratio поддерживает только ${SUPPORTED_ASPECT_RATIOS.join(", ")}.`, `aspect_ratio supports only ${SUPPORTED_ASPECT_RATIOS.join(", ")}.`));
        }
        if (normalized === "21:9" && String(model || "").trim() !== "image-01") {
            throw new Error(localizedText("aspect_ratio=21:9 仅支持 model=image-01。", "Значение aspect_ratio=21:9 поддерживается только при model=image-01.", "aspect_ratio=21:9 is supported only with model=image-01."));
        }
        return normalized;
    }
    function normalizeDimensions(model, widthValue, heightValue, aspectRatio) {
        if (aspectRatio) {
            return {
                width: undefined,
                height: undefined
            };
        }
        const width = parsePositiveInteger(widthValue, "width");
        const height = parsePositiveInteger(heightValue, "height");
        if (width === undefined && height === undefined) {
            return {
                width: undefined,
                height: undefined
            };
        }
        if (width === undefined || height === undefined) {
            throw new Error(localizedText("width 和 height 需要同时传入。", "Параметры width и height нужно передавать вместе.", "width and height must be passed together."));
        }
        if (String(model || "").trim() !== "image-01") {
            throw new Error(localizedText("width 和 height 仅支持 model=image-01。", "Параметры width и height поддерживаются только при model=image-01.", "width and height are supported only with model=image-01."));
        }
        if (width < 512 || width > 2048 || width % 8 !== 0) {
            throw new Error(localizedText("width 需要在 512-2048 之间，且必须为 8 的倍数。", "Значение width должно быть в диапазоне 512–2048 и кратно 8.", "width must be between 512 and 2048 and a multiple of 8."));
        }
        if (height < 512 || height > 2048 || height % 8 !== 0) {
            throw new Error(localizedText("height 需要在 512-2048 之间，且必须为 8 的倍数。", "Значение height должно быть в диапазоне 512–2048 и кратно 8.", "height must be between 512 and 2048 and a multiple of 8."));
        }
        return { width, height };
    }
    function parseStringList(value, fieldName) {
        if (value === undefined || value === null || value === "") {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map(item => String(item || "").trim())
                .filter(item => item.length > 0);
        }
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed)
                return [];
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map(item => String(item || "").trim())
                        .filter(item => item.length > 0);
                }
            }
            catch {
                // ignore and try comma-separated parsing
            }
            return trimmed
                .split(",")
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }
        throw new Error(localizedText(`${fieldName} 必须是字符串数组、JSON 字符串或逗号分隔字符串。`, `Параметр ${fieldName} должен быть массивом строк, строкой JSON или строкой со значениями через запятую.`, `${fieldName} must be an array of strings, a JSON string or a comma-separated string.`));
    }
    function isProbablyUrl(value) {
        return /^https?:\/\//i.test(String(value || "").trim());
    }
    function getBeeimgApiKey() {
        return String(getEnv("BEEIMG_API_KEY") || "").trim();
    }
    function guessMimeTypeFromPath(filePath) {
        const lower = String(filePath || "").toLowerCase();
        if (lower.endsWith(".png"))
            return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
            return "image/jpeg";
        if (lower.endsWith(".webp"))
            return "image/webp";
        if (lower.endsWith(".gif"))
            return "image/gif";
        return "application/octet-stream";
    }
    async function uploadImageToBeeimg(filePath) {
        const exists = await Tools.Files.exists(filePath);
        if (!exists.exists) {
            throw new Error(localizedText(`参考图文件不存在: ${filePath}`, `Файл референсного изображения не найден: ${filePath}`, `Reference image file not found: ${filePath}`));
        }
        const apiKey = getBeeimgApiKey();
        if (!apiKey) {
            throw new Error(localizedText("使用 image_paths 需要配置 BEEIMG_API_KEY，用于先把本地参考图上传到公网图床。", "Для image_paths нужно настроить BEEIMG_API_KEY: локальные референсные изображения сначала загружаются на публичный хостинг изображений.", "image_paths requires BEEIMG_API_KEY to upload local reference images to a public image host first."));
        }
        const response = await Tools.Net.uploadFile({
            url: BEEIMG_UPLOAD_ENDPOINT,
            method: "POST",
            form_data: {
                apikey: apiKey
            },
            files: [
                {
                    field_name: "file",
                    file_path: filePath,
                    content_type: guessMimeTypeFromPath(filePath)
                }
            ]
        });
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new Error(localizedText(`BeeIMG 上传失败: HTTP ${response.statusCode} - ${response.content}`, `Не удалось загрузить файл на BeeIMG: HTTP ${response.statusCode} — ${response.content}`, `BeeIMG upload failed: HTTP ${response.statusCode} — ${response.content}`));
        }
        let parsed;
        try {
            parsed = JSON.parse(response.content);
        }
        catch (error) {
            throw new Error(localizedText(`解析 BeeIMG 响应失败: ${getErrorMessage(error)}`, `Не удалось разобрать ответ BeeIMG: ${getErrorMessage(error)}`, `Failed to parse the BeeIMG response: ${getErrorMessage(error)}`));
        }
        const files = isRecord(parsed) && isRecord(parsed.files) ? parsed.files : null;
        const fileUrl = files && files.url ? String(files.url).trim() : "";
        const code = files && files.code !== undefined ? String(files.code) : "";
        const status = files && files.status ? String(files.status) : "";
        if (!fileUrl || (code !== "200" && code !== "" && status !== "Success")) {
            throw new Error(localizedText(`BeeIMG 上传失败: ${response.content}`, `Не удалось загрузить файл на BeeIMG: ${response.content}`, `BeeIMG upload failed: ${response.content}`));
        }
        return fileUrl;
    }
    async function resolveSubjectReference(imageUrls, imagePaths) {
        const resolvedUrls = parseStringList(imageUrls, "image_urls");
        const resolvedPaths = parseStringList(imagePaths, "image_paths");
        for (const url of resolvedUrls) {
            if (!isProbablyUrl(url)) {
                throw new Error(localizedText(`image_urls 中包含无效链接: ${url}`, `В image_urls есть некорректная ссылка: ${url}`, `image_urls contains an invalid link: ${url}`));
            }
        }
        for (const filePath of resolvedPaths) {
            const uploadedUrl = await uploadImageToBeeimg(filePath);
            resolvedUrls.push(uploadedUrl);
        }
        if (resolvedUrls.length === 0) {
            return undefined;
        }
        return resolvedUrls.map(url => ({
            type: "character",
            image_file: url
        }));
    }
    function normalizeBase64(base64) {
        const raw = String(base64 || "").trim();
        if (!raw)
            return raw;
        const prefixIndex = raw.indexOf("base64,");
        if (raw.startsWith("data:") && prefixIndex >= 0) {
            return raw.substring(prefixIndex + "base64,".length).trim();
        }
        return raw;
    }
    function guessExtensionFromUrl(url, fallbackExtension) {
        const match = String(url || "").match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i);
        if (match && match[1])
            return match[1].toLowerCase();
        return fallbackExtension;
    }
    function parseMiniMaxError(parsed, fallbackMessage) {
        const baseResp = isRecord(parsed) && isRecord(parsed.base_resp) ? parsed.base_resp : null;
        if (!baseResp)
            return;
        const statusCode = baseResp.status_code !== undefined ? Number(baseResp.status_code) : 0;
        if (Number.isFinite(statusCode) && statusCode !== 0) {
            const statusMsg = baseResp.status_msg ? String(baseResp.status_msg) : fallbackMessage;
            throw new Error(localizedText(`MiniMax 图片接口返回错误: ${statusMsg} (status_code=${statusCode})`, `API изображений MiniMax вернул ошибку: ${statusMsg} (status_code=${statusCode})`, `The MiniMax image API returned an error: ${statusMsg} (status_code=${statusCode})`));
        }
    }
    async function callMiniMaxImageApi(params) {
        const apiBaseUrl = getApiBaseUrl(params.api_base_url);
        const endpoint = getImageEndpoint(apiBaseUrl);
        const effectiveModel = resolveModel(params.model);
        const responseFormat = normalizeResponseFormat(params.response_format);
        const aspectRatio = normalizeAspectRatio(effectiveModel, params.aspect_ratio);
        const dimensions = normalizeDimensions(effectiveModel, params.width, params.height, aspectRatio);
        const imageCount = parsePositiveInteger(params.n, "n", { defaultValue: DEFAULT_IMAGE_COUNT, min: 1, max: 9 });
        const promptOptimizer = parseBoolean(params.prompt_optimizer, "prompt_optimizer");
        const aigcWatermark = parseBoolean(params.aigc_watermark, "aigc_watermark");
        const seed = parseInteger(params.seed, "seed");
        const subjectReference = await resolveSubjectReference(params.image_urls, params.image_paths);
        const body = {
            model: effectiveModel,
            prompt: String(params.prompt || "").trim(),
            response_format: responseFormat,
            n: imageCount
        };
        if (aspectRatio) {
            body.aspect_ratio = aspectRatio;
        }
        if (dimensions.width !== undefined && dimensions.height !== undefined) {
            body.width = dimensions.width;
            body.height = dimensions.height;
        }
        if (promptOptimizer !== undefined) {
            body.prompt_optimizer = promptOptimizer;
        }
        if (aigcWatermark !== undefined) {
            body.aigc_watermark = aigcWatermark;
        }
        if (seed !== undefined) {
            body.seed = seed;
        }
        if (subjectReference) {
            body.subject_reference = subjectReference;
        }
        const request = client
            .newRequest()
            .url(endpoint)
            .method("POST")
            .headers({
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": `Bearer ${getApiKey()}`
        })
            .body(JSON.stringify(body), "json");
        const response = await request.build().execute();
        if (!response.isSuccessful()) {
            throw new Error(localizedText(`MiniMax 图片 API 调用失败: ${response.statusCode} - ${response.content}`, `Не удалось вызвать API изображений MiniMax: ${response.statusCode} — ${response.content}`, `MiniMax image API call failed: ${response.statusCode} — ${response.content}`));
        }
        let parsed;
        try {
            parsed = JSON.parse(response.content);
        }
        catch (error) {
            throw new Error(localizedText(`解析 MiniMax 响应失败: ${getErrorMessage(error)}`, `Не удалось разобрать ответ MiniMax: ${getErrorMessage(error)}`, `Failed to parse the MiniMax response: ${getErrorMessage(error)}`));
        }
        parseMiniMaxError(parsed, localizedText("MiniMax 接口返回错误", "MiniMax API вернул ошибку", "the MiniMax API returned an error"));
        const data = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : null;
        if (!data) {
            throw new Error(localizedText("MiniMax 响应中未找到 data 对象。", "В ответе MiniMax не найден объект data.", "No data object found in the MiniMax response."));
        }
        const metadata = isRecord(data.metadata) ? data.metadata : null;
        const successCount = metadata && metadata.success_count !== undefined ? Number(metadata.success_count) : undefined;
        const failedCount = metadata && metadata.failed_count !== undefined ? Number(metadata.failed_count) : undefined;
        const requestId = isRecord(parsed) && parsed.id ? String(parsed.id) : "";
        if (responseFormat === "base64") {
            const imageBase64 = Array.isArray(data.image_base64)
                ? data.image_base64.map(item => String(item || "").trim()).filter(item => item.length > 0)
                : [];
            if (imageBase64.length === 0) {
                throw new Error(localizedText("MiniMax 响应中未找到 data.image_base64。", "В ответе MiniMax не найден data.image_base64.", "No data.image_base64 found in the MiniMax response."));
            }
            return {
                request_id: requestId,
                effective_model: effectiveModel,
                response_format: responseFormat,
                image_base64: imageBase64,
                image_urls: [],
                success_count: Number.isFinite(successCount) ? successCount : imageBase64.length,
                failed_count: Number.isFinite(failedCount) ? failedCount : 0,
                reference_count: subjectReference ? subjectReference.length : 0
            };
        }
        const imageUrls = Array.isArray(data.image_urls)
            ? data.image_urls.map(item => String(item || "").trim()).filter(item => item.length > 0)
            : [];
        if (imageUrls.length === 0) {
            throw new Error(localizedText("MiniMax 响应中未找到 data.image_urls。", "В ответе MiniMax не найден data.image_urls.", "No data.image_urls found in the MiniMax response."));
        }
        return {
            request_id: requestId,
            effective_model: effectiveModel,
            response_format: responseFormat,
            image_base64: [],
            image_urls: imageUrls,
            success_count: Number.isFinite(successCount) ? successCount : imageUrls.length,
            failed_count: Number.isFinite(failedCount) ? failedCount : 0,
            reference_count: subjectReference ? subjectReference.length : 0
        };
    }
    async function draw_image(params) {
        const prompt = String(params && params.prompt ? params.prompt : "").trim();
        if (!prompt) {
            throw new Error(localizedText("参数 prompt 不能为空。", "Параметр prompt не может быть пустым.", "Parameter prompt cannot be empty."));
        }
        await ensureDirectories();
        const apiResult = await callMiniMaxImageApi({
            prompt,
            model: params.model,
            aspect_ratio: params.aspect_ratio,
            width: params.width,
            height: params.height,
            n: params.n,
            response_format: params.response_format,
            prompt_optimizer: params.prompt_optimizer,
            aigc_watermark: params.aigc_watermark,
            seed: params.seed,
            image_urls: params.image_urls,
            image_paths: params.image_paths,
            api_base_url: params.api_base_url
        });
        const baseName = buildFileBaseName(prompt, params.file_name, "minimax_draw");
        const files = [];
        if (apiResult.response_format === "base64") {
            for (let index = 0; index < apiResult.image_base64.length; index += 1) {
                const suffix = apiResult.image_base64.length > 1 ? `_${index + 1}` : "";
                const filePath = `${DRAWS_DIR}/${baseName}${suffix}.${DEFAULT_BASE64_EXTENSION}`;
                const writeResult = await Tools.Files.writeBinary(filePath, normalizeBase64(apiResult.image_base64[index]));
                if (!writeResult.successful) {
                    throw new Error(localizedText(`保存图片失败: ${writeResult.details}`, `Не удалось сохранить изображение: ${writeResult.details}`, `Failed to save the image: ${writeResult.details}`));
                }
                const fileUri = `file://${filePath}`;
                files.push({
                    file_path: filePath,
                    file_uri: fileUri,
                    markdown: localizedText(`![MiniMax 生成的图片${apiResult.image_base64.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`, `![Изображение MiniMax${apiResult.image_base64.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`, `![MiniMax-generated image${apiResult.image_base64.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`),
                    remote_image_url: null
                });
            }
        }
        else {
            for (let index = 0; index < apiResult.image_urls.length; index += 1) {
                const imageUrl = apiResult.image_urls[index];
                const extension = guessExtensionFromUrl(imageUrl, "png");
                const suffix = apiResult.image_urls.length > 1 ? `_${index + 1}` : "";
                const filePath = `${DRAWS_DIR}/${baseName}${suffix}.${extension}`;
                const downloadResult = await Tools.Files.download(imageUrl, filePath);
                if (!downloadResult.successful) {
                    throw new Error(localizedText(`下载图片失败: ${downloadResult.details}`, `Не удалось скачать изображение: ${downloadResult.details}`, `Failed to download the image: ${downloadResult.details}`));
                }
                const fileUri = `file://${filePath}`;
                files.push({
                    file_path: filePath,
                    file_uri: fileUri,
                    markdown: localizedText(`![MiniMax 生成的图片${apiResult.image_urls.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`, `![Изображение MiniMax${apiResult.image_urls.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`, `![MiniMax-generated image${apiResult.image_urls.length > 1 ? ` ${index + 1}` : ""}](${fileUri})`),
                    remote_image_url: imageUrl
                });
            }
        }
        const hintLines = [];
        hintLines.push(localizedText(`图片已生成并保存在本地 ${DRAWS_DIR}。`, `Изображения созданы и сохранены локально в ${DRAWS_DIR}.`, `The images were generated and saved locally to ${DRAWS_DIR}.`));
        hintLines.push(localizedText(`共生成 ${files.length} 张。`, `Всего создано изображений: ${files.length}.`, `Total images generated: ${files.length}.`));
        if (apiResult.reference_count > 0) {
            hintLines.push(localizedText(`本次使用了 ${apiResult.reference_count} 张参考图。`, `В этот раз использовано референсных изображений: ${apiResult.reference_count}.`, `Reference images used this time: ${apiResult.reference_count}.`));
        }
        hintLines.push("");
        hintLines.push(localizedText("后续回答如果需要展示图片，请直接输出下面这些 Markdown：", "Если в дальнейшем ответе нужно показать изображения, выведите эти строки Markdown:", "If your follow-up answer needs to show the images, output these Markdown lines:"));
        hintLines.push("");
        for (const fileItem of files) {
            hintLines.push(fileItem.markdown);
        }
        return {
            prompt,
            model: apiResult.effective_model,
            request_id: apiResult.request_id || null,
            response_format: apiResult.response_format,
            success_count: apiResult.success_count,
            failed_count: apiResult.failed_count,
            reference_count: apiResult.reference_count,
            file_path: files[0].file_path,
            file_uri: files[0].file_uri,
            markdown: files[0].markdown,
            files,
            hint: hintLines.join("\n")
        };
    }
    async function draw_image_wrapper(params) {
        try {
            const result = await draw_image(params || {});
            complete({
                success: true,
                message: localizedText("MiniMax 图片生成成功，已保存到本地。", "Изображение MiniMax создано и сохранено локально.", "The MiniMax image was generated and saved locally."),
                data: result
            });
        }
        catch (error) {
            console.error("draw_image 执行失败:", error);
            complete({
                success: false,
                message: localizedText(`MiniMax 图片生成失败: ${getErrorMessage(error)}`, `Не удалось создать изображение MiniMax: ${getErrorMessage(error)}`, `MiniMax image generation failed: ${getErrorMessage(error)}`),
                error_stack: error && error.stack ? error.stack : undefined
            });
        }
    }
    return {
        draw_image: draw_image_wrapper
    };
})();
exports.draw_image = minimaxDraw.draw_image;
