// educationService.js
import api from './api';

// Константы для валидации файлов
export const SUPPORTED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    audio: [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/ogg',
        'audio/webm',
        'audio/mp4',
        'audio/m4a',
        'audio/aac'
    ]
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_FILES_PER_MESSAGE = 10;

// Основные функции для работы с чатом

/**
 * Отправка сообщения (с файлами или без)
 * @param {string} message - Текст сообщения
 * @param {File[]} files - Массив файлов для отправки
 * @param {string|null} chatId - ID чата
 * @returns {Promise<Object>} Ответ от сервера
 */
export const sendMessage = async (message, files = [], chatId = null) => {
    try {
        // Если есть файлы, используем multipart/form-data
        if (files && files.length > 0) {
            // Валидируем файлы перед отправкой
            const validation = validateFiles(files);
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации файлов: ${validation.errors.join(', ')}`);
            }

            const formData = new FormData();
            formData.append('message', message);
            if (chatId) formData.append('chat_id', chatId);

            // Добавляем каждый файл в FormData
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await api.post('/chat/send-with-files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 секунд для больших файлов
            });

            return response.data;
        } else {
            // Обычная отправка текстового сообщения
            const response = await api.post('/chat/send', {
                message,
                chat_id: chatId
            });
            return response.data;
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

/**
 * Получение ответа от ИИ
 * @param {string} message - Сообщение пользователя
 * @param {Object} context - Контекст для ИИ
 * @returns {Promise<Object>} Ответ от ИИ
 */
export const getAIResponse = async (message, context = {}) => {
    try {
        // Подготавливаем контекст с информацией о файлах
        const aiContext = {
            chat_id: context.chatId,
            chat_history: context.chatHistory || [],
            tool_type: context.toolType,
            has_files: Boolean(context.files && context.files.length > 0),
            file_count: context.files ? context.files.length : 0,
            file_types: context.files ? context.files.map(f => f.type) : [],
            ...context
        };

        const response = await api.post('/chat/ai-response', {
            message,
            context: aiContext
        });

        return response.data;
    } catch (error) {
        console.error('Failed to get AI response:', error);
        throw error;
    }
};

/**
 * Получение истории чатов
 * @param {string|null} chatId - ID конкретного чата (если null, возвращает список всех чатов)
 * @param {number} limit - Количество сообщений/чатов
 * @returns {Promise<Array>} История чатов или сообщений
 */
export const getChatHistory = async (chatId = null, limit = 20) => {
    try {
        const response = await api.get('/chat/history', {
            params: {
                chat_id: chatId,
                limit
            }
        });
        return response.data || [];
    } catch (error) {
        console.error('Failed to get chat history:', error);
        return [];
    }
};

/**
 * Создание нового чата
 * @param {string} title - Название чата
 * @returns {Promise<Object>} Данные созданного чата
 */
export const createNewChat = async (title = "Новый чат") => {
    try {
        const response = await api.post('/chat/create', { title });
        return response.data;
    } catch (error) {
        console.error('Failed to create new chat:', error);
        throw error;
    }
};

/**
 * Создание чата для инструмента
 * @param {string} toolType - Тип инструмента
 * @param {string} toolTitle - Название инструмента
 * @param {string} description - Описание инструмента
 * @returns {Promise<Object>} Данные созданного чата
 */
export const createToolChat = async (toolType, toolTitle, description) => {
    try {
        const response = await api.post('/chat/create-tool', {
            tool_type: toolType,
            tool_title: toolTitle,
            description: description
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create tool chat:', error);
        throw error;
    }
};

// Функции для работы с файлами

/**
 * Загрузка отдельного файла
 * @param {File} file - Файл для загрузки
 * @param {string|null} chatId - ID чата
 * @returns {Promise<Object>} Информация о загруженном файле
 */
export const uploadFile = async (file, chatId = null) => {
    try {
        // Валидируем файл
        const validation = validateFile(file);
        if (!validation.isValid) {
            throw new Error(`Ошибка валидации файла: ${validation.errors.join(', ')}`);
        }

        const formData = new FormData();
        formData.append('file', file);
        if (chatId) formData.append('chat_id', chatId);

        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 секунд для больших файлов
        });

        return response.data;
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
    }
};

/**
 * Получение информации о файле
 * @param {string} fileId - ID файла
 * @returns {Promise<Object>} Информация о файле
 */
export const getFileInfo = async (fileId) => {
    try {
        const response = await api.get(`/files/${fileId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get file info:', error);
        throw error;
    }
};

/**
 * Анализ конкретного файла через ИИ
 * @param {string} fileId - ID файла
 * @param {string} prompt - Промпт для анализа (опционально)
 * @returns {Promise<Object>} Результат анализа
 */
export const analyzeFile = async (fileId, prompt = '') => {
    try {
        const response = await api.post(`/files/${fileId}/analyze`, {
            prompt: prompt || null
        });
        return response.data;
    } catch (error) {
        console.error('Failed to analyze file:', error);
        throw error;
    }
};

/**
 * Удаление файла
 * @param {string} fileId - ID файла
 * @returns {Promise<Object>} Результат удаления
 */
export const deleteFile = async (fileId) => {
    try {
        const response = await api.delete(`/files/${fileId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw error;
    }
};

// Утилитарные функции для валидации и работы с файлами

/**
 * Валидация одного файла
 * @param {File} file - Файл для проверки
 * @returns {Object} Результат валидации
 */
export const validateFile = (file) => {
    const errors = [];

    // Проверка существования файла
    if (!file) {
        errors.push('Файл не найден');
        return { isValid: false, errors };
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
        errors.push(`Файл превышает максимальный размер ${formatFileSize(MAX_FILE_SIZE)}`);
    }

    // Проверка типа файла - ИСПРАВЛЕНО: добавлено аудио
    const allSupportedTypes = [
        ...SUPPORTED_FILE_TYPES.images,
        ...SUPPORTED_FILE_TYPES.documents,
        ...SUPPORTED_FILE_TYPES.audio
    ];
    if (!allSupportedTypes.includes(file.type)) {
        errors.push(`Тип файла "${file.type}" не поддерживается`);
    }

    // Проверка имени файла
    if (!file.name || file.name.trim() === '') {
        errors.push('Недопустимое имя файла');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Валидация массива файлов
 * @param {File[]} files - Файлы для проверки
 * @returns {Object} Результат валидации
 */
export const validateFiles = (files) => {
    if (!Array.isArray(files)) {
        return { isValid: false, errors: ['Файлы должны быть переданы в виде массива'] };
    }

    if (files.length === 0) {
        return { isValid: true, errors: [], validFiles: [] };
    }

    if (files.length > MAX_FILES_PER_MESSAGE) {
        return {
            isValid: false,
            errors: [`Можно прикрепить максимум ${MAX_FILES_PER_MESSAGE} файлов`]
        };
    }

    const allErrors = [];
    const validFiles = [];

    files.forEach((file, index) => {
        const validation = validateFile(file);
        if (validation.isValid) {
            validFiles.push(file);
        } else {
            allErrors.push(`Файл ${index + 1} (${file.name || 'без имени'}): ${validation.errors.join(', ')}`);
        }
    });

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        validFiles
    };
};

/**
 * Проверка размера файла
 * @param {File} file - Файл для проверки
 * @param {number} maxSizeMB - Максимальный размер в МБ
 * @returns {boolean} Результат проверки
 */
export const validateFileSize = (file, maxSizeMB = 50) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Проверка типа файла
 * @param {File} file - Файл для проверки
 * @param {string[]} allowedTypes - Разрешенные типы (если не указаны, используются дефолтные)
 * @returns {boolean} Результат проверки
 */
export const validateFileType = (file, allowedTypes = []) => {
    if (allowedTypes.length === 0) {
        // Используем дефолтные поддерживаемые типы
        const defaultTypes = [
            ...SUPPORTED_FILE_TYPES.images,
            ...SUPPORTED_FILE_TYPES.documents,
            ...SUPPORTED_FILE_TYPES.audio
        ];
        return defaultTypes.includes(file.type);
    }
    return allowedTypes.includes(file.type);
};


/**
 * Форматирование размера файла в читаемый вид
 * @param {number} bytes - Размер в байтах
 * @returns {string} Отформатированный размер
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Определение типа файла по MIME-type
 * @param {string} mimeType - MIME тип файла
 * @returns {string} Категория файла
 */
export const getFileCategory = (mimeType) => {
    if (SUPPORTED_FILE_TYPES.images.includes(mimeType)) {
        return 'image';
    } else if (SUPPORTED_FILE_TYPES.documents.includes(mimeType)) {
        return 'document';
    } else if (SUPPORTED_FILE_TYPES.audio.includes(mimeType)) {
        return 'audio';
    } else {
        return 'unknown';
    }
};

/**
 * Проверка, является ли файл изображением
 * @param {File|string} file - Файл или MIME тип
 * @returns {boolean} Результат проверки
 */
export const isImageFile = (file) => {
    const mimeType = typeof file === 'string' ? file : file.type;
    return SUPPORTED_FILE_TYPES.images.includes(mimeType);
};

/**
 * Проверка, является ли файл документом
 * @param {File|string} file - Файл или MIME тип
 * @returns {boolean} Результат проверки
 */
export const isDocumentFile = (file) => {
    const mimeType = typeof file === 'string' ? file : file.type;
    return SUPPORTED_FILE_TYPES.documents.includes(mimeType);
};

export const isAudioFile = (file) => {
    const mimeType = typeof file === 'string' ? file : file.type;
    return SUPPORTED_FILE_TYPES.audio.includes(mimeType);
};

/**
 * Создание превью для изображения
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} Data URL изображения
 */
export const createImagePreview = (file) => {
    return new Promise((resolve, reject) => {
        if (!isImageFile(file)) {
            reject(new Error('Файл не является изображением'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
};

/**
 * Получение информации о системе
 * @returns {Promise<Object>} Информация о системе и лимитах
 */
export const getSystemInfo = async () => {
    try {
        const response = await api.get('/api/system/info');
        return response.data;
    } catch (error) {
        console.error('Failed to get system info:', error);
        throw error;
    }
};

/**
 * Получение статуса здоровья API
 * @returns {Promise<Object>} Статус сервера
 */
export const getHealthStatus = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Failed to get health status:', error);
        throw error;
    }
};

// Функции для обработки ошибок

/**
 * Обработка ошибок API
 * @param {Error} error - Ошибка
 * @returns {string} Понятное описание ошибки
 */
export const handleApiError = (error) => {
    if (error.response) {
        // Ошибка от сервера
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message || 'Неизвестная ошибка сервера';

        switch (status) {
            case 400:
                return `Ошибка запроса: ${message}`;
            case 401:
                return 'Необходима авторизация';
            case 403:
                return 'Доступ запрещен';
            case 404:
                return 'Ресурс не найден';
            case 413:
                return 'Файл слишком большой';
            case 422:
                return `Ошибка валидации: ${message}`;
            case 429:
                return 'Превышен лимит запросов, попробуйте позже';
            case 500:
                return 'Внутренняя ошибка сервера';
            default:
                return `Ошибка ${status}: ${message}`;
        }
    } else if (error.request) {
        // Сетевая ошибка
        return 'Ошибка сети. Проверьте подключение к интернету';
    } else {
        // Другая ошибка
        return error.message || 'Неизвестная ошибка';
    }
};

// Дополнительные утилиты

/**
 * Генерация уникального ID для файла (для локального использования)
 * @param {File} file - Файл
 * @returns {string} Уникальный ID
 */
export const generateFileId = (file) => {
    return `${file.name}-${file.size}-${file.lastModified || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Группировка файлов по типу
 * @param {File[]} files - Массив файлов
 * @returns {Object} Файлы, сгруппированные по типам
 */
export const groupFilesByType = (files) => {
    return files.reduce((groups, file) => {
        const category = getFileCategory(file.type);
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(file);
        return groups;
    }, {});
};

/**
 * Получение списка поддерживаемых расширений
 * @returns {Object} Поддерживаемые расширения по категориям
 */
export const getSupportedExtensions = () => {
    return {
        images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
        documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.csv', '.xls', '.xlsx'],
        audio: ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac']
    };
};

/**
 * Создание строки accept для input[type="file"]
 * @param {string} category - Категория файлов ('image', 'document', 'all')
 * @returns {string} Строка accept
 */
export const createAcceptString = (category = 'all') => {
    switch (category) {
        case 'image':
            return SUPPORTED_FILE_TYPES.images.join(',');
        case 'document':
            return SUPPORTED_FILE_TYPES.documents.join(',');
        case 'audio':
            return SUPPORTED_FILE_TYPES.audio.join(',');
        default:
            return [
                ...SUPPORTED_FILE_TYPES.images,
                ...SUPPORTED_FILE_TYPES.documents,
                ...SUPPORTED_FILE_TYPES.audio
            ].join(',');
    }
};

// Добавить функцию для получения длительности аудио (примерная)
export const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
        if (!isAudioFile(file)) {
            reject(new Error('Файл не является аудио'));
            return;
        }

        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve({
                duration: audio.duration,
                formattedDuration: formatDuration(audio.duration)
            });
        };

        audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Ошибка загрузки аудио'));
        };

        audio.src = url;
    });
};

// Вспомогательная функция для форматирования времени
export const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};


/**
 * Получение потокового ответа от ИИ
 * @param {string} message - Сообщение пользователя
 * @param {Object} context - Контекст для ИИ
 * @returns {Object} Объект с методом для чтения потока
 */
export const getAIResponseStream = async (message, context = {}) => {
    try {
        // Подготавливаем контекст
        const aiContext = {
            chat_id: context.chatId,
            chat_history: context.chatHistory || [],
            tool_type: context.toolType,
            has_files: Boolean(context.files && context.files.length > 0),
            file_count: context.files ? context.files.length : 0,
            file_types: context.files ? context.files.map(f => f.type) : [],
            ...context
        };

        // Получаем токен авторизации
        const token = localStorage.getItem('auth_token') || 'simple_token_123';

        console.log('Starting streaming request...'); // Отладка

        // Используем fetch вместо axios для streaming
        const response = await fetch('http://127.0.0.1:3213/api/chat/ai-response-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                message,
                context: aiContext
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Stream response received, creating reader...'); // Отладка

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            async *readStream() {
                try {
                    let buffer = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            console.log('Stream finished'); // Отладка
                            break;
                        }

                        // Декодируем чанк
                        buffer += decoder.decode(value, { stream: true });

                        // Разбиваем на строки
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Оставляем неполную строку в буфере

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6).trim();
                                if (data) {
                                    try {
                                        const parsed = JSON.parse(data);
                                        console.log('Parsed chunk:', parsed); // Отладка
                                        yield parsed;
                                    } catch (e) {
                                        console.error('Error parsing stream data:', e, 'Raw data:', data);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream reading error:', error);
                    throw error;
                } finally {
                    reader.releaseLock();
                }
            }
        };
    } catch (error) {
        console.error('Failed to get AI response stream:', error);
        throw error;
    }
};



export default {
    // Основные функции чата
    sendMessage,
    getAIResponse,
    getChatHistory,
    createNewChat,
    createToolChat,

    // Функции работы с файлами
    uploadFile,
    getFileInfo,
    deleteFile,
    analyzeFile,

    // Валидация и утилиты
    validateFile,
    validateFiles,
    validateFileSize,
    validateFileType,
    formatFileSize,
    getFileCategory,
    isImageFile,
    isDocumentFile,
    isAudioFile, // новая функция
    createImagePreview,
    getAudioDuration, // новая функция
    formatDuration, // новая функция

    // Системные функции
    getSystemInfo,
    getHealthStatus,
    handleApiError,

    // Дополнительные утилиты
    generateFileId,
    groupFilesByType,
    getSupportedExtensions,
    createAcceptString,

    // Константы
    SUPPORTED_FILE_TYPES,
    MAX_FILE_SIZE,
    MAX_FILES_PER_MESSAGE
};