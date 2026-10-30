/* METADATA
{
    "name": "extended_file_tools",

    "display_name": {
        "zh": "增强文件工具",
        "en": "Extended File Tools",
        "ru": "Расширенные файловые инструменты"
    },
    "description": {
        "zh": "拓展文件工具包：提供 file_exists / move_file / copy_file / file_info / unzip_files / zip_files / open_file / share_file（默认文件工具中已移除这些项）。",
        "en": "Extended file tools: file_exists / move_file / copy_file / file_info / unzip_files / zip_files / open_file / share_file (removed from default file tools).",
        "ru": "Расширенные файловые инструменты: file_exists / move_file / copy_file / file_info / unzip_files / zip_files / open_file / share_file (убраны из стандартных файловых инструментов)."
    },
    "category": "File",
    "enabledByDefault": true,
    "tools": [
        {
            "name": "file_exists",
            "description": { "zh": "检查文件或目录是否存在。", "en": "Check if a file or directory exists.", "ru": "Проверить, существует ли файл или каталог." },
            "parameters": [
                { "name": "path", "description": { "zh": "目标路径", "en": "Target path", "ru": "Целевой путь" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "move_file",
            "description": { "zh": "移动或重命名文件/目录。", "en": "Move or rename a file/directory.", "ru": "Переместить или переименовать файл/каталог." },
            "parameters": [
                { "name": "source", "description": { "zh": "源路径", "en": "Source path", "ru": "Исходный путь" }, "type": "string", "required": true },
                { "name": "destination", "description": { "zh": "目标路径", "en": "Destination path", "ru": "Путь назначения" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "copy_file",
            "description": { "zh": "复制文件/目录（支持跨环境复制）。", "en": "Copy a file/directory (supports cross-environment copy).", "ru": "Скопировать файл/каталог (поддерживается копирование между средами)." },
            "parameters": [
                { "name": "source", "description": { "zh": "源路径", "en": "Source path", "ru": "Исходный путь" }, "type": "string", "required": true },
                { "name": "destination", "description": { "zh": "目标路径", "en": "Destination path", "ru": "Путь назначения" }, "type": "string", "required": true },
                { "name": "recursive", "description": { "zh": "可选：是否递归，默认 false", "en": "Optional: recursive (default: false)", "ru": "Необязательно: рекурсивно (по умолчанию: false)" }, "type": "boolean", "required": false },
                { "name": "source_environment", "description": { "zh": "可选：源环境 android/linux", "en": "Optional: source environment android/linux", "ru": "Необязательно: исходная среда android/linux" }, "type": "string", "required": false },
                { "name": "dest_environment", "description": { "zh": "可选：目标环境 android/linux", "en": "Optional: destination environment android/linux", "ru": "Необязательно: целевая среда android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "file_info",
            "description": { "zh": "获取文件/目录信息。", "en": "Get file/directory info.", "ru": "Получить сведения о файле/каталоге." },
            "parameters": [
                { "name": "path", "description": { "zh": "目标路径", "en": "Target path", "ru": "Целевой путь" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "zip_files",
            "description": { "zh": "压缩文件/目录。", "en": "Zip files/directories.", "ru": "Сжать файлы/каталоги в zip." },
            "parameters": [
                { "name": "source", "description": { "zh": "源路径", "en": "Source path", "ru": "Исходный путь" }, "type": "string", "required": true },
                { "name": "destination", "description": { "zh": "输出 zip 文件路径", "en": "Destination zip path", "ru": "Путь к выходному zip-файлу" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false },
                { "name": "include_root_directory", "description": { "zh": "压缩目录时是否保留源目录名作为顶层目录，默认 true", "en": "When zipping a directory, keep the source directory name as the top-level folder, default true", "ru": "При сжатии каталога сохранять имя исходного каталога как каталог верхнего уровня, по умолчанию: true" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "unzip_files",
            "description": { "zh": "解压 zip 文件。", "en": "Unzip an archive.", "ru": "Распаковать архив." },
            "parameters": [
                { "name": "source", "description": { "zh": "zip 文件路径", "en": "Zip file path", "ru": "Путь к zip-файлу" }, "type": "string", "required": true },
                { "name": "destination", "description": { "zh": "解压目录", "en": "Destination directory", "ru": "Каталог назначения" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "open_file",
            "description": { "zh": "用系统默认应用打开文件。", "en": "Open a file with system default app.", "ru": "Открыть файл приложением системы по умолчанию." },
            "parameters": [
                { "name": "path", "description": { "zh": "文件路径", "en": "File path", "ru": "Путь к файлу" }, "type": "string", "required": true },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "share_file",
            "description": { "zh": "分享文件给其他应用。", "en": "Share a file with other apps.", "ru": "Поделиться файлом с другими приложениями." },
            "parameters": [
                { "name": "path", "description": { "zh": "文件路径", "en": "File path", "ru": "Путь к файлу" }, "type": "string", "required": true },
                { "name": "title", "description": { "zh": "可选：分享标题", "en": "Optional: share title", "ru": "Необязательно: заголовок" }, "type": "string", "required": false },
                { "name": "environment", "description": { "zh": "可选：android/linux", "en": "Optional: android/linux", "ru": "Необязательно: android/linux" }, "type": "string", "required": false }
            ]
        }
    ]
}*/
const ExtendedFileTools = (function () {
    function localizedText(zhText, ruText, enText) {
        const langBase = getLang().toLowerCase().split('-')[0];
        if (langBase === 'zh')
            return zhText;
        if (langBase === 'ru')
            return ruText;
        return enText;
    }
    async function file_exists(params) {
        const result = await Tools.Files.exists(params.path, params.environment);
        return { success: !!result && (result.exists ?? true), message: localizedText('检查完成', 'Проверка завершена', 'Check complete'), data: result };
    }
    async function move_file(params) {
        const result = await Tools.Files.move(params.source, params.destination, params.environment);
        return { success: !!result, message: localizedText('移动完成', 'Перемещение завершено', 'Move complete'), data: result };
    }
    async function copy_file(params) {
        const result = await Tools.Files.copy(params.source, params.destination, params.recursive, params.source_environment, params.dest_environment);
        return { success: !!result, message: localizedText('复制完成', 'Копирование завершено', 'Copy complete'), data: result };
    }
    async function file_info(params) {
        const result = await Tools.Files.info(params.path, params.environment);
        return { success: !!result, message: localizedText('获取信息完成', 'Сведения получены', 'Info retrieved'), data: result };
    }
    async function zip_files(params) {
        const result = await Tools.Files.zip(params.source, params.destination, params.environment, params.include_root_directory);
        return { success: !!result, message: localizedText('压缩完成', 'Упаковка завершена', 'Compression complete'), data: result };
    }
    async function unzip_files(params) {
        const result = await Tools.Files.unzip(params.source, params.destination, params.environment);
        return { success: !!result, message: localizedText('解压完成', 'Распаковка завершена', 'Extraction complete'), data: result };
    }
    async function open_file(params) {
        const result = await Tools.Files.open(params.path, params.environment);
        return { success: !!result, message: localizedText('打开文件完成', 'Файл открыт', 'File opened'), data: result };
    }
    async function share_file(params) {
        const result = await Tools.Files.share(params.path, params.title, params.environment);
        return { success: !!result, message: localizedText('分享文件完成', 'Файл передан для общего доступа', 'File shared'), data: result };
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
        results.push({ tool: 'file_exists', result: { success: null, message: localizedText('未测试', 'Не тестировалось', 'Not tested') } });
        results.push({ tool: 'move_file', result: { success: null, message: localizedText('未测试（会移动/重命名文件）', 'Не тестировалось (перемещает/переименовывает файлы)', 'Not tested (moves/renames files)') } });
        results.push({ tool: 'copy_file', result: { success: null, message: localizedText('未测试（会复制文件）', 'Не тестировалось (копирует файлы)', 'Not tested (copies files)') } });
        results.push({ tool: 'file_info', result: { success: null, message: localizedText('未测试', 'Не тестировалось', 'Not tested') } });
        results.push({ tool: 'zip_files', result: { success: null, message: localizedText('未测试（会写入zip文件）', 'Не тестировалось (создаёт zip-файл)', 'Not tested (writes a zip file)') } });
        results.push({ tool: 'unzip_files', result: { success: null, message: localizedText('未测试（会写入解压文件）', 'Не тестировалось (записывает распакованные файлы)', 'Not tested (writes extracted files)') } });
        results.push({ tool: 'open_file', result: { success: null, message: localizedText('未测试（会拉起系统应用）', 'Не тестировалось (запускает системное приложение)', 'Not tested (launches a system app)') } });
        results.push({ tool: 'share_file', result: { success: null, message: localizedText('未测试（会弹出分享面板）', 'Не тестировалось (открывает панель общего доступа)', 'Not tested (opens the share sheet)') } });
        complete({
            success: true,
            message: localizedText('拓展文件工具包加载完成（未执行破坏性测试）', 'Пакет расширенных файловых инструментов загружен (разрушительные тесты не выполнялись)', 'Extended file tools package loaded (no destructive tests performed)'),
            data: { results }
        });
    }
    return {
        file_exists: (params) => wrapToolExecution(file_exists, params),
        move_file: (params) => wrapToolExecution(move_file, params),
        copy_file: (params) => wrapToolExecution(copy_file, params),
        file_info: (params) => wrapToolExecution(file_info, params),
        zip_files: (params) => wrapToolExecution(zip_files, params),
        unzip_files: (params) => wrapToolExecution(unzip_files, params),
        open_file: (params) => wrapToolExecution(open_file, params),
        share_file: (params) => wrapToolExecution(share_file, params),
        main,
    };
})();
exports.file_exists = ExtendedFileTools.file_exists;
exports.move_file = ExtendedFileTools.move_file;
exports.copy_file = ExtendedFileTools.copy_file;
exports.file_info = ExtendedFileTools.file_info;
exports.zip_files = ExtendedFileTools.zip_files;
exports.unzip_files = ExtendedFileTools.unzip_files;
exports.open_file = ExtendedFileTools.open_file;
exports.share_file = ExtendedFileTools.share_file;
exports.main = ExtendedFileTools.main;
