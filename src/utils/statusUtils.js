/**
 * Утилиты для работы со статусами обработки сообщений ИИ-агентом
 * Определяет текущий этап обработки и соответствующий текст
 */

/**
 * Типы статусов обработки сообщений
 */
export const PROCESSING_STATUS = {
    // Начальные этапы
    PREPARING: 'preparing',                    // Получаю запрос

    // Работа с файлами
    ANALYZING_FILES: 'analyzing_files',        // Анализирую файлы
    UPLOADING_FILES: 'uploading_files',        // Загружаю файлы

    // Работа с аудио
    TRANSCRIBING: 'transcribing',              // Транскрибирую аудио

    // Генерация контента
    GENERATING_IMAGE: 'generating_image',      // Генерирую изображение
    GENERATING_TEXT: 'generating_text',        // Генерирую ответ
    ANALYZING_IMAGE: 'analyzing_image',        // Анализирую изображение

    // Процесс написания
    STREAMING: 'streaming',                    // Пишу ответ

    // Общие
    THINKING: 'thinking',                      // Думаю
    PROCESSING: 'processing',                  // Обрабатываю
};

/**
 * Маппинг статусов к отображаемым текстам
 */
export const STATUS_TEXTS = {
    [PROCESSING_STATUS.PREPARING]: 'Получаю запрос...',
    [PROCESSING_STATUS.ANALYZING_FILES]: 'Анализирую файлы...',
    [PROCESSING_STATUS.UPLOADING_FILES]: 'Загружаю файлы...',
    [PROCESSING_STATUS.TRANSCRIBING]: 'Транскрибирую аудио...',
    [PROCESSING_STATUS.GENERATING_IMAGE]: 'Генерирую изображение...',
    [PROCESSING_STATUS.GENERATING_TEXT]: 'Генерирую ответ...',
    [PROCESSING_STATUS.ANALYZING_IMAGE]: 'Анализирую изображение...',
    [PROCESSING_STATUS.STREAMING]: 'Пишу ответ...',
    [PROCESSING_STATUS.THINKING]: 'Думаю...',
    [PROCESSING_STATUS.PROCESSING]: 'Обрабатываю...',
};

/**
 * Получить текст статуса по его типу
 * @param {string} status - Тип статуса из PROCESSING_STATUS
 * @returns {string} Текст для отображения
 */
export const getStatusText = (status) => {
    return STATUS_TEXTS[status] || STATUS_TEXTS[PROCESSING_STATUS.GENERATING_TEXT];
};

/**
 * Определить статус на основе контекста обработки
 * @param {Object} context - Контекст обработки
 * @param {boolean} context.hasFiles - Есть ли файлы
 * @param {boolean} context.isAudio - Это аудио
 * @param {boolean} context.isImageGeneration - Генерация изображения
 * @param {boolean} context.isStreaming - Идет streaming
 * @param {boolean} context.isAnalyzingImage - Анализ изображения
 * @returns {string} Тип статуса
 */
export const determineStatus = (context = {}) => {
    const {
        hasFiles,
        isAudio,
        isImageGeneration,
        isStreaming,
        isAnalyzingImage,
        isUploading
    } = context;

    // Приоритет определения статуса
    if (isStreaming) {
        return PROCESSING_STATUS.STREAMING;
    }

    if (isImageGeneration) {
        return PROCESSING_STATUS.GENERATING_IMAGE;
    }

    if (isAnalyzingImage) {
        return PROCESSING_STATUS.ANALYZING_IMAGE;
    }

    if (isAudio) {
        return PROCESSING_STATUS.TRANSCRIBING;
    }

    if (isUploading) {
        return PROCESSING_STATUS.UPLOADING_FILES;
    }

    if (hasFiles) {
        return PROCESSING_STATUS.ANALYZING_FILES;
    }

    return PROCESSING_STATUS.GENERATING_TEXT;
};

/**
 * Проверить, является ли статус активным (требует индикации)
 * @param {string} status - Статус для проверки
 * @returns {boolean} true если статус активный
 */
export const isActiveStatus = (status) => {
    return status && Object.values(PROCESSING_STATUS).includes(status);
};

/**
 * Получить цветовой класс для статуса (для стилизации)
 * @param {string} status - Тип статуса
 * @returns {string} CSS класс для цвета
 */
export const getStatusColorClass = (status) => {
    const colorMap = {
        [PROCESSING_STATUS.ANALYZING_FILES]: 'blue',
        [PROCESSING_STATUS.UPLOADING_FILES]: 'blue',
        [PROCESSING_STATUS.ANALYZING_IMAGE]: 'blue',
        [PROCESSING_STATUS.TRANSCRIBING]: 'yellow',
        [PROCESSING_STATUS.GENERATING_IMAGE]: 'red',
        [PROCESSING_STATUS.GENERATING_TEXT]: 'green',
        [PROCESSING_STATUS.STREAMING]: 'green',
        [PROCESSING_STATUS.THINKING]: 'green',
        [PROCESSING_STATUS.PROCESSING]: 'green',
        [PROCESSING_STATUS.PREPARING]: 'green',
    };

    return colorMap[status] || 'green';
};

/**
 * Создать объект статуса для сообщения
 * @param {string} statusType - Тип статуса из PROCESSING_STATUS
 * @param {string} customText - Кастомный текст (опционально)
 * @returns {Object} Объект статуса для хранения в сообщении
 */
export const createStatusObject = (statusType, customText = null) => {
    return {
        type: statusType,
        text: customText || getStatusText(statusType),
        colorClass: getStatusColorClass(statusType),
        timestamp: new Date().toISOString(),
        isActive: true
    };
};

/**
 * Обновить статус сообщения
 * @param {Object} message - Объект сообщения
 * @param {string} newStatus - Новый статус
 * @param {string} customText - Кастомный текст (опционально)
 * @returns {Object} Обновленное сообщение
 */
export const updateMessageStatus = (message, newStatus, customText = null) => {
    return {
        ...message,
        processingStatus: createStatusObject(newStatus, customText)
    };
};

/**
 * Очистить статус сообщения (завершить обработку)
 * @param {Object} message - Объект сообщения
 * @returns {Object} Сообщение без активного статуса
 */
export const clearMessageStatus = (message) => {
    return {
        ...message,
        processingStatus: null,
        isStreaming: false
    };
};

// Экспорт всех утилит по умолчанию
export default {
    PROCESSING_STATUS,
    STATUS_TEXTS,
    getStatusText,
    determineStatus,
    isActiveStatus,
    getStatusColorClass,
    createStatusObject,
    updateMessageStatus,
    clearMessageStatus
};