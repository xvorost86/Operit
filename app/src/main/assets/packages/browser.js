/* METADATA
{
    "name": "browser",
    "display_name": {
        "zh": "Browser 自动化操作",
        "en": "Browser Automation",
        "ru": "Автоматизация браузера"
    },
    "description": {
        "zh": "严格对齐 Playwright MCP 默认 browser 工具面的浏览器自动化工具集。",
        "en": "Browser automation tools aligned to the default Playwright MCP browser surface.",
        "ru": "Инструменты автоматизации браузера, согласованные со стандартным набором инструментов browser в Playwright MCP."
    },
    "enabledByDefault": true,
    "category": "Automatic",
    "tools": [
        {
            "name": "click",
            "description": { "zh": "按快照 ref 点击页面元素，包括同源 iframe 内的元素。", "en": "Click an element by snapshot ref, including refs inside same-origin iframes.", "ru": "Нажимает на элемент страницы по ref из снимка, включая ref внутри iframe того же источника." },
            "parameters": [
                { "name": "ref", "description": { "zh": "快照中的目标元素引用；和 selector 至少提供一个。", "en": "Target element ref from the snapshot; provide ref or selector.", "ru": "ref целевого элемента из снимка; укажите ref или selector." }, "type": "string", "required": false },
                { "name": "selector", "description": { "zh": "可选，ref 不可用时的元素选择器。", "en": "Optional selector fallback when ref is not available.", "ru": "Необязательный селектор элемента, если ref недоступен." }, "type": "string", "required": false },
                { "name": "element", "description": { "zh": "可选，人类可读元素描述。", "en": "Optional human-readable element description.", "ru": "Необязательное понятное человеку описание элемента." }, "type": "string", "required": false },
                { "name": "doubleClick", "description": { "zh": "可选，是否双击。", "en": "Optional double click.", "ru": "Необязательно: двойной щелчок." }, "type": "boolean", "required": false },
                { "name": "button", "description": { "zh": "可选，left/right/middle。", "en": "Optional mouse button: left/right/middle.", "ru": "Необязательная кнопка мыши: left/right/middle." }, "type": "string", "required": false },
                { "name": "modifiers", "description": { "zh": "可选，修饰键数组。", "en": "Optional modifier keys array.", "ru": "Необязательный массив клавиш-модификаторов." }, "type": "array", "required": false }
            ]
        },
        {
            "name": "close",
            "description": { "zh": "关闭当前 tab。", "en": "Close the current tab.", "ru": "Закрывает текущую вкладку." },
            "parameters": []
        },
        {
            "name": "console_messages",
            "description": { "zh": "读取控制台消息。", "en": "Read console messages.", "ru": "Читает сообщения консоли." },
            "parameters": [
                { "name": "level", "description": { "zh": "可选，日志级别：error/warning/info/debug，默认 info。", "en": "Optional log level: error/warning/info/debug. Defaults to info.", "ru": "Необязательный уровень логов: error/warning/info/debug. По умолчанию info." }, "type": "string", "required": false },
                { "name": "filename", "description": { "zh": "可选，保存输出的文件名。", "en": "Optional output file name.", "ru": "Необязательное имя файла для сохранения вывода." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "drag",
            "description": { "zh": "在两个元素之间拖拽。", "en": "Drag between two elements.", "ru": "Перетаскивает между двумя элементами." },
            "parameters": [
                { "name": "startElement", "description": { "zh": "源元素的人类可读描述。", "en": "Human-readable source element description.", "ru": "Понятное человеку описание исходного элемента." }, "type": "string", "required": true },
                { "name": "startRef", "description": { "zh": "源元素 ref。", "en": "Source element ref.", "ru": "ref исходного элемента." }, "type": "string", "required": true },
                { "name": "endElement", "description": { "zh": "目标元素的人类可读描述。", "en": "Human-readable target element description.", "ru": "Понятное человеку описание целевого элемента." }, "type": "string", "required": true },
                { "name": "endRef", "description": { "zh": "目标元素 ref。", "en": "Target element ref.", "ru": "ref целевого элемента." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "evaluate",
            "description": { "zh": "在页面或元素上执行 JavaScript 函数。", "en": "Evaluate a JavaScript function on the page or an element.", "ru": "Выполняет функцию JavaScript на странице или элементе." },
            "parameters": [
                { "name": "function", "description": { "zh": "要执行的函数源码。", "en": "Function source to execute.", "ru": "Исходный код функции для выполнения." }, "type": "string", "required": true },
                { "name": "element", "description": { "zh": "可选，人类可读元素描述。", "en": "Optional human-readable element description.", "ru": "Необязательное понятное человеку описание элемента." }, "type": "string", "required": false },
                { "name": "ref", "description": { "zh": "可选，目标元素 ref。", "en": "Optional target element ref.", "ru": "Необязательный ref целевого элемента." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "upload",
            "description": { "zh": "向当前文件选择器上传文件。", "en": "Upload files to the current file chooser.", "ru": "Загружает файлы в текущий диалог выбора файлов." },
            "parameters": [
                { "name": "paths", "description": { "zh": "可选，绝对路径数组；不传则取消 file chooser。", "en": "Optional absolute file paths; omit to cancel the file chooser.", "ru": "Необязательный массив абсолютных путей; если не передать, диалог выбора файлов будет отменён." }, "type": "array", "required": false }
            ]
        },
        {
            "name": "fill_form",
            "description": { "zh": "批量填写表单字段。", "en": "Fill multiple form fields.", "ru": "Заполняет несколько полей формы." },
            "parameters": [
                { "name": "fields", "description": { "zh": "字段数组。", "en": "Array of form fields.", "ru": "Массив полей формы." }, "type": "array", "required": true }
            ]
        },
        {
            "name": "handle_dialog",
            "description": { "zh": "处理当前对话框。", "en": "Handle the current dialog.", "ru": "Обрабатывает текущий диалог." },
            "parameters": [
                { "name": "accept", "description": { "zh": "是否接受对话框。", "en": "Whether to accept the dialog.", "ru": "Принять диалог или нет." }, "type": "boolean", "required": true },
                { "name": "promptText", "description": { "zh": "可选，prompt 的输入文本。", "en": "Optional prompt text.", "ru": "Необязательный текст для prompt." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "hover",
            "description": { "zh": "悬停到页面元素上。", "en": "Hover over an element.", "ru": "Наводит курсор на элемент." },
            "parameters": [
                { "name": "ref", "description": { "zh": "目标元素 ref。", "en": "Target element ref.", "ru": "ref целевого элемента." }, "type": "string", "required": true },
                { "name": "element", "description": { "zh": "可选，人类可读元素描述。", "en": "Optional human-readable element description.", "ru": "Необязательное понятное человеку описание элемента." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "goto",
            "description": { "zh": "导航到指定 URL。", "en": "Navigate to a URL.", "ru": "Переходит по URL." },
            "parameters": [
                { "name": "url", "description": { "zh": "目标 URL。", "en": "Target URL.", "ru": "Целевой URL." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "back",
            "description": { "zh": "后退到上一页。", "en": "Go back to the previous page.", "ru": "Возвращается на предыдущую страницу." },
            "parameters": []
        },
        {
            "name": "network_requests",
            "description": { "zh": "读取当前页面的网络请求。", "en": "Read network requests for the current page.", "ru": "Читает сетевые запросы текущей страницы." },
            "parameters": [
                { "name": "includeStatic", "description": { "zh": "可选，是否包含静态资源请求，默认 false。", "en": "Optional include static resource requests. Defaults to false.", "ru": "Необязательно: включать запросы статических ресурсов. По умолчанию false." }, "type": "boolean", "required": false },
                { "name": "filename", "description": { "zh": "可选，保存输出的文件名。", "en": "Optional output file name.", "ru": "Необязательное имя файла для сохранения вывода." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "press_key",
            "description": { "zh": "按下键盘按键。", "en": "Press a keyboard key.", "ru": "Нажимает клавишу клавиатуры." },
            "parameters": [
                { "name": "key", "description": { "zh": "按键名。", "en": "Key name.", "ru": "Имя клавиши." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "resize",
            "description": { "zh": "调整浏览器视口大小。", "en": "Resize the browser viewport.", "ru": "Изменяет размер области просмотра браузера." },
            "parameters": [
                { "name": "width", "description": { "zh": "宽度。", "en": "Width.", "ru": "Ширина." }, "type": "number", "required": true },
                { "name": "height", "description": { "zh": "高度。", "en": "Height.", "ru": "Высота." }, "type": "number", "required": true }
            ]
        },
        {
            "name": "run_code",
            "description": { "zh": "运行 Playwright 风格代码片段。", "en": "Run a Playwright-style code snippet.", "ru": "Выполняет фрагмент кода в стиле Playwright." },
            "parameters": [
                { "name": "code", "description": { "zh": "代码片段。", "en": "Code snippet.", "ru": "Фрагмент кода." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "select_option",
            "description": { "zh": "在下拉框中选择选项。", "en": "Select options in a dropdown.", "ru": "Выбирает варианты в раскрывающемся списке." },
            "parameters": [
                { "name": "ref", "description": { "zh": "目标元素 ref。", "en": "Target element ref.", "ru": "ref целевого элемента." }, "type": "string", "required": true },
                { "name": "values", "description": { "zh": "要选择的值数组。", "en": "Values to select.", "ru": "Значения для выбора." }, "type": "array", "required": true },
                { "name": "element", "description": { "zh": "可选，人类可读元素描述。", "en": "Optional human-readable element description.", "ru": "Необязательное понятное человеку описание элемента." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "snapshot",
            "description": { "zh": "获取当前页面结构化快照，包括同源 iframe 内容。", "en": "Get a structured page snapshot, including same-origin iframe content.", "ru": "Получает структурированный снимок страницы, включая содержимое iframe того же источника." },
            "parameters": [
                { "name": "filename", "description": { "zh": "可选，保存快照的文件名。", "en": "Optional snapshot output file name.", "ru": "Необязательное имя файла для сохранения снимка." }, "type": "string", "required": false },
                { "name": "selector", "description": { "zh": "可选，作为快照根节点的元素选择器。", "en": "Optional root element selector for a partial snapshot.", "ru": "Необязательный селектор корневого элемента для частичного снимка." }, "type": "string", "required": false },
                { "name": "depth", "description": { "zh": "可选，限制快照树深度。", "en": "Optional snapshot tree depth limit.", "ru": "Необязательное ограничение глубины дерева снимка." }, "type": "number", "required": false }
            ]
        },
        {
            "name": "type",
            "description": { "zh": "向可编辑元素输入文本。", "en": "Type text into an editable element.", "ru": "Вводит текст в редактируемый элемент." },
            "parameters": [
                { "name": "ref", "description": { "zh": "目标元素 ref。", "en": "Target element ref.", "ru": "ref целевого элемента." }, "type": "string", "required": true },
                { "name": "text", "description": { "zh": "输入文本。", "en": "Text to type.", "ru": "Текст для ввода." }, "type": "string", "required": true },
                { "name": "element", "description": { "zh": "可选，人类可读元素描述。", "en": "Optional human-readable element description.", "ru": "Необязательное понятное человеку описание элемента." }, "type": "string", "required": false },
                { "name": "submit", "description": { "zh": "可选，输入后是否提交。", "en": "Optional submit after typing.", "ru": "Необязательно: отправить после ввода." }, "type": "boolean", "required": false },
                { "name": "slowly", "description": { "zh": "可选，是否逐字输入。", "en": "Optional type slowly.", "ru": "Необязательно: вводить посимвольно." }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "wait_for",
            "description": { "zh": "等待文本出现、消失或等待指定时间。", "en": "Wait for text to appear, disappear, or for a duration.", "ru": "Ожидает появления или исчезновения текста либо заданной длительности." },
            "parameters": [
                { "name": "time", "description": { "zh": "可选，等待秒数。", "en": "Optional number of seconds to wait.", "ru": "Необязательное количество секунд ожидания." }, "type": "number", "required": false },
                { "name": "text", "description": { "zh": "可选，等待出现的文本。", "en": "Optional text to wait for.", "ru": "Необязательный текст, появления которого нужно дождаться." }, "type": "string", "required": false },
                { "name": "textGone", "description": { "zh": "可选，等待消失的文本。", "en": "Optional text to wait to disappear.", "ru": "Необязательный текст, исчезновения которого нужно дождаться." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "tabs",
            "description": { "zh": "列出、创建、切换或关闭 tab。", "en": "List, create, select, or close tabs.", "ru": "Перечисляет вкладки, создаёт их, переключается между ними и закрывает их." },
            "parameters": [
                { "name": "action", "description": { "zh": "操作：list/create/select/close。", "en": "Action: list/create/select/close.", "ru": "Действие: list/create/select/close." }, "type": "string", "required": true },
                { "name": "index", "description": { "zh": "可选，0-based tab 索引。", "en": "Optional 0-based tab index.", "ru": "Необязательный индекс вкладки, начиная с 0." }, "type": "number", "required": false }
            ]
        },
    ]
}*/
const MAX_INLINE_BROWSER_TEXT_CHARS = 24000;
const TOOL_NAMES = [
    "click",
    "close",
    "close_all",
    "console_messages",
    "drag",
    "evaluate",
    "upload",
    "fill_form",
    "handle_dialog",
    "hover",
    "goto",
    "back",
    "network_requests",
    "press_key",
    "resize",
    "run_code",
    "select_option",
    "snapshot",
    "type",
    "wait_for",
    "tabs"
];
function normalizeOptionalString(value) {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim();
    return normalized ? normalized : undefined;
}
function buildLargeOutputFilename(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = Math.floor(Math.random() * 1000000);
    return OPERIT_CLEAN_ON_EXIT_DIR + "/browser_" + prefix + "_" + timestamp + "_" + rand + "." + extension;
}
async function maybePersistLargeBrowserResponse(result, prefix, extension = "md") {
    if (result.length <= MAX_INLINE_BROWSER_TEXT_CHARS) {
        return result;
    }
    await Tools.Files.mkdir(OPERIT_CLEAN_ON_EXIT_DIR, true);
    const filename = buildLargeOutputFilename(prefix, extension);
    await Tools.Files.write(filename, result, false);
    const normalizedPath = filename.replace(/\\/g, "/");
    return "Large browser response saved to:\n- [Browser Output](" + normalizedPath + ")";
}
async function click(params) {
    const result = await Tools.Net.browserClick(params);
    return maybePersistLargeBrowserResponse(result, "click");
}
async function close() {
    const result = await Tools.Net.browserClose();
    return maybePersistLargeBrowserResponse(result, "close");
}
async function close_all() {
    const result = await Tools.Net.browserCloseAll();
    return maybePersistLargeBrowserResponse(result, "close_all");
}
async function console_messages(params = {}) {
    const result = await Tools.Net.browserConsoleMessages(params);
    return maybePersistLargeBrowserResponse(result, "console_messages");
}
async function drag(params) {
    const result = await Tools.Net.browserDrag(params);
    return maybePersistLargeBrowserResponse(result, "drag");
}
async function evaluate(params) {
    const result = await Tools.Net.browserEvaluate(params);
    return maybePersistLargeBrowserResponse(result, "evaluate");
}
async function upload(params = {}) {
    const result = await Tools.Net.browserFileUpload(params);
    return maybePersistLargeBrowserResponse(result, "upload");
}
function normalizeFormFields(fields) {
    if (fields.length === 0) {
        throw new Error("fields must be a non-empty array");
    }
    return fields.map((field, index) => {
        const normalized = {
            name: field.name.trim(),
            type: field.type.trim(),
            value: field.value
        };
        if (!normalized.name) {
            throw new Error("fields[" + index + "].name is required");
        }
        if (!normalized.type) {
            throw new Error("fields[" + index + "].type is required");
        }
        const ref = normalizeOptionalString(field.ref);
        const selector = normalizeOptionalString(field.selector);
        if (!ref && !selector) {
            throw new Error("fields[" + index + "] requires ref or selector");
        }
        if (ref) {
            normalized.ref = ref;
        }
        if (selector) {
            normalized.selector = selector;
        }
        return normalized;
    });
}
async function fill_form(params) {
    const result = await Tools.Net.browserFillForm({
        fields: normalizeFormFields(params.fields)
    });
    return maybePersistLargeBrowserResponse(result, "fill_form");
}
async function handle_dialog(params) {
    const result = await Tools.Net.browserHandleDialog(params);
    return maybePersistLargeBrowserResponse(result, "handle_dialog");
}
async function hover(params) {
    const result = await Tools.Net.browserHover(params);
    return maybePersistLargeBrowserResponse(result, "hover");
}
async function goto(params) {
    const result = await Tools.Net.browserNavigate(params);
    return maybePersistLargeBrowserResponse(result, "goto");
}
async function back() {
    const result = await Tools.Net.browserNavigateBack();
    return maybePersistLargeBrowserResponse(result, "back");
}
async function network_requests(params = {}) {
    const result = await Tools.Net.browserNetworkRequests(params);
    return maybePersistLargeBrowserResponse(result, "network_requests");
}
async function press_key(params) {
    const result = await Tools.Net.browserPressKey(params);
    return maybePersistLargeBrowserResponse(result, "press_key");
}
async function resize(params) {
    const result = await Tools.Net.browserResize(params);
    return maybePersistLargeBrowserResponse(result, "resize");
}
async function run_code(params) {
    const result = await Tools.Net.browserRunCode(params);
    return maybePersistLargeBrowserResponse(result, "run_code");
}
async function select_option(params) {
    const result = await Tools.Net.browserSelectOption(params);
    return maybePersistLargeBrowserResponse(result, "select_option");
}
async function snapshot(params = {}) {
    const result = await Tools.Net.browserSnapshot(params);
    return maybePersistLargeBrowserResponse(result, "snapshot");
}
async function type(params) {
    const result = await Tools.Net.browserType(params);
    return maybePersistLargeBrowserResponse(result, "type");
}
async function wait_for(params = {}) {
    const result = await Tools.Net.browserWaitFor(params);
    return maybePersistLargeBrowserResponse(result, "wait_for");
}
async function tabs(params) {
    const result = await Tools.Net.browserTabs(params);
    return maybePersistLargeBrowserResponse(result, "tabs");
}
async function browserMain() {
    return "Browser package ready: " + TOOL_NAMES.join(", ");
}
exports.click = click;
exports.close = close;
exports.close_all = close_all;
exports.console_messages = console_messages;
exports.drag = drag;
exports.evaluate = evaluate;
exports.upload = upload;
exports.fill_form = fill_form;
exports.handle_dialog = handle_dialog;
exports.hover = hover;
exports.goto = goto;
exports.back = back;
exports.network_requests = network_requests;
exports.press_key = press_key;
exports.resize = resize;
exports.run_code = run_code;
exports.select_option = select_option;
exports.snapshot = snapshot;
exports.type = type;
exports.wait_for = wait_for;
exports.tabs = tabs;
exports.main = browserMain;
