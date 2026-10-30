/* METADATA
{
    "name": "extended_http_tools",

    "display_name": {
        "zh": "增强 HTTP 工具",
        "en": "Extended HTTP Tools",
        "ru": "Расширенные инструменты HTTP"
    },
    "description": {
        "zh": "允许文件上传，以及 GET/POST 等网络直接访问操作。",
        "en": "Allows file uploads and direct network access operations such as GET/POST.",
        "ru": "Позволяет загружать файлы и выполнять прямой доступ к сети, например GET/POST."
    },
    "enabledByDefault": true,
    "category": "Network",
    "tools": [
        {
            "name": "http_request",
            "description": { "zh": "发送 HTTP 请求。", "en": "Send an HTTP request.", "ru": "Отправить HTTP-запрос." },
            "parameters": [
                { "name": "url", "description": { "zh": "请求 URL", "en": "Request URL", "ru": "URL запроса" }, "type": "string", "required": true },
                { "name": "method", "description": { "zh": "请求方法：GET/POST/PUT/DELETE", "en": "Method: GET/POST/PUT/DELETE", "ru": "Метод: GET/POST/PUT/DELETE" }, "type": "string", "required": true },
                { "name": "headers", "description": { "zh": "可选：headers（JSON 对象字符串）", "en": "Optional: headers (JSON object string)", "ru": "Необязательно: headers (строка JSON-объекта)" }, "type": "string", "required": false },
                { "name": "body", "description": { "zh": "可选：请求体（字符串）", "en": "Optional: body (string)", "ru": "Необязательно: body (строка)" }, "type": "string", "required": false },
                { "name": "body_type", "description": { "zh": "可选：json/form/text/xml", "en": "Optional: json/form/text/xml", "ru": "Необязательно: json/form/text/xml" }, "type": "string", "required": false },
                { "name": "ignore_ssl", "description": { "zh": "可选：是否忽略 HTTPS 证书校验（true/false）", "en": "Optional: ignore HTTPS certificate verification (true/false)", "ru": "Необязательно: игнорировать проверку сертификата HTTPS (true/false)" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "multipart_request",
            "description": { "zh": "上传文件（multipart）。", "en": "Upload files (multipart).", "ru": "Загрузить файлы (multipart)." },
            "parameters": [
                { "name": "url", "description": { "zh": "请求 URL", "en": "Request URL", "ru": "URL запроса" }, "type": "string", "required": true },
                { "name": "method", "description": { "zh": "请求方法：POST/PUT", "en": "Method: POST/PUT", "ru": "Метод: POST/PUT" }, "type": "string", "required": true },
                { "name": "headers", "description": { "zh": "可选：headers（JSON 对象字符串）", "en": "Optional: headers (JSON object string)", "ru": "Необязательно: headers (строка JSON-объекта)" }, "type": "string", "required": false },
                { "name": "form_data", "description": { "zh": "可选：form_data（字符串）", "en": "Optional: form_data (string)", "ru": "Необязательно: form_data (строка)" }, "type": "string", "required": false },
                { "name": "files", "description": { "zh": "可选：files（JSON 数组字符串）", "en": "Optional: files (JSON array string)", "ru": "Необязательно: files (строка JSON-массива)" }, "type": "string", "required": false },
                { "name": "ignore_ssl", "description": { "zh": "可选：是否忽略 HTTPS 证书校验（true/false）", "en": "Optional: ignore HTTPS certificate verification (true/false)", "ru": "Необязательно: игнорировать проверку сертификата HTTPS (true/false)" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "manage_cookies",
            "description": { "zh": "管理 Cookies。", "en": "Manage cookies.", "ru": "Управлять cookies." },
            "parameters": [
                { "name": "action", "description": { "zh": "操作：get/set/clear", "en": "Action: get/set/clear", "ru": "Действие: get/set/clear" }, "type": "string", "required": true },
                { "name": "domain", "description": { "zh": "可选：域名", "en": "Optional: domain", "ru": "Необязательно: домен" }, "type": "string", "required": false },
                { "name": "cookies", "description": { "zh": "可选：cookies（字符串）", "en": "Optional: cookies (string)", "ru": "Необязательно: cookies (строка)" }, "type": "string", "required": false }
            ]
        }
    ]
}*/
const ExtendedHttpTools = (function () {
    function localizedText(zhText, ruText, enText) {
        const langBase = getLang().toLowerCase().split("-")[0];
        if (langBase === "zh")
            return zhText;
        if (langBase === "ru")
            return ruText;
        return enText;
    }
    const MAX_INLINE_HTTP_RESPONSE_CHARS = 12000;
    async function http_request(params) {
        const toolParams = {
            url: params.url,
            method: params.method,
        };
        if (params.headers !== undefined)
            toolParams.headers = params.headers;
        if (params.body !== undefined)
            toolParams.body = params.body;
        if (params.body_type !== undefined)
            toolParams.body_type = params.body_type;
        if (params.ignore_ssl !== undefined)
            toolParams.ignore_ssl = params.ignore_ssl;
        const result = await toolCall({ name: "http_request", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;
        const contentStr = typeof result?.content === "string" ? result.content : "";
        if (contentStr.length > MAX_INLINE_HTTP_RESPONSE_CHARS) {
            await Tools.Files.mkdir(OPERIT_CLEAN_ON_EXIT_DIR, true);
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const rand = Math.floor(Math.random() * 1000000);
            let ext = "txt";
            const ct = typeof result?.contentType === "string" ? result.contentType.toLowerCase() : "";
            if (ct.includes("json"))
                ext = "json";
            else if (ct.includes("html"))
                ext = "html";
            else if (ct.includes("xml"))
                ext = "xml";
            const filePath = `${OPERIT_CLEAN_ON_EXIT_DIR}/http_response_${timestamp}_${rand}.${ext}`;
            await Tools.Files.write(filePath, contentStr, false);
            const resultMeta = {
                url: result?.url,
                statusCode: result?.statusCode,
                statusMessage: result?.statusMessage,
                headers: result?.headers,
                contentType: result?.contentType,
                size: result?.size,
                content: "(saved_to_file)",
            };
            return {
                success,
                message: localizedText(
                    `HTTP 请求完成；响应内容过大，已保存到文件：${filePath}。请使用 read_file_part 读取指定行范围，或用 grep_code 在该文件中检索关键字。`,
                    `Запрос HTTP выполнен; ответ слишком велик и сохранён в файл: ${filePath}. Используйте read_file_part, чтобы прочитать указанный диапазон строк, или grep_code, чтобы найти ключевые слова в этом файле.`,
                    `HTTP request complete; the response is too large and has been saved to a file: ${filePath}. Use read_file_part to read the specified line range, or grep_code to search for keywords in that file.`
                ),
                data: {
                    result: resultMeta,
                    content_saved_to: filePath,
                    operit_clean_on_exit_dir: OPERIT_CLEAN_ON_EXIT_DIR,
                },
            };
        }
        return { success, message: localizedText('HTTP 请求完成', 'Запрос HTTP выполнен', 'HTTP request complete'), data: result };
    }
    async function multipart_request(params) {
        const toolParams = {
            url: params.url,
            method: params.method,
        };
        if (params.headers !== undefined)
            toolParams.headers = params.headers;
        if (params.form_data !== undefined)
            toolParams.form_data = params.form_data;
        if (params.files !== undefined)
            toolParams.files = params.files;
        if (params.ignore_ssl !== undefined)
            toolParams.ignore_ssl = params.ignore_ssl;
        const result = await toolCall({ name: "multipart_request", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;
        return { success, message: localizedText('文件上传完成', 'Файл загружен', 'File upload complete'), data: result };
    }
    async function manage_cookies(params) {
        const toolParams = {
            action: params.action,
        };
        if (params.domain !== undefined)
            toolParams.domain = params.domain;
        if (params.cookies !== undefined)
            toolParams.cookies = params.cookies;
        const result = await toolCall({ name: "manage_cookies", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;
        return { success, message: localizedText('Cookies 操作完成', 'Операция с cookies выполнена', 'Cookies operation complete'), data: result };
    }
    async function wrapToolExecution(func, params) {
        try {
            const result = await func(params);
            complete(result);
        }
        catch (error) {
            console.error(`Tool ${func.name} failed unexpectedly`, error);
            const detail = error.message;
            complete({
                success: false,
                message: localizedText(`工具执行时发生意外错误: ${detail}`, `При выполнении инструмента произошла непредвиденная ошибка: ${detail}`, `Unexpected error while executing the tool: ${detail}`),
            });
        }
    }
    async function main() {
        const results = [];
        // 这些工具可能对外发请求 / 写 cookies，默认不做自动化演示。
        results.push({ tool: 'http_request', result: { success: null, message: localizedText('未测试（会对外发起网络请求）', 'Не тестировалось (будет выполнен внешний сетевой запрос)', 'Not tested (would make an external network request)') } });
        results.push({ tool: 'multipart_request', result: { success: null, message: localizedText('未测试（会上传文件/对外发起网络请求）', 'Не тестировалось (будут загружены файлы и выполнен внешний сетевой запрос)', 'Not tested (would upload files and make an external network request)') } });
        results.push({ tool: 'manage_cookies', result: { success: null, message: localizedText('未测试（会读写 cookies）', 'Не тестировалось (чтение и запись cookies)', 'Not tested (would read and write cookies)') } });
        complete({
            success: true,
            message: localizedText("拓展 HTTP 工具包加载完成（未执行网络请求测试）", "Пакет расширенных инструментов HTTP загружен (тесты сетевых запросов не выполнялись)", "Extended HTTP Tools package loaded (network request tests not executed)"),
            data: { results }
        });
    }
    return {
        http_request: (params) => wrapToolExecution(http_request, params),
        multipart_request: (params) => wrapToolExecution(multipart_request, params),
        manage_cookies: (params) => wrapToolExecution(manage_cookies, params),
        main,
    };
})();
exports.http_request = ExtendedHttpTools.http_request;
exports.multipart_request = ExtendedHttpTools.multipart_request;
exports.manage_cookies = ExtendedHttpTools.manage_cookies;
exports.main = ExtendedHttpTools.main;
