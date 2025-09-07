import api from './api';

/**
 * Отправка сообщения с файлами - синхронизировано с бэкендом
 * Бэкенд ожидает НЕ /api/chat/send-with-files, а FormData с files
 */
export const sendMessageWithFiles = async (message, files = [], chatId = null) => {
    try {
        const formData = new FormData();
        formData.append('message', message);

        if (chatId) {
            formData.append('chat_id', chatId);
        }

        // Добавляем файлы
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        console.error('Failed to send message with files:', error);
        throw error;
    }
};

/**
 * Отправка простого текстового сообщения - ТОЧНО как в бэкенде
 */
export const sendMessage = async (message, chatId = null, toolType = null) => {
    try {
        const response = await api.post('/api/chat/send', {
            message,
            chat_id: chatId,
            tool_type: toolType
        });

        return response.data;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

/**
 * Получение ответа от ИИ - ТОЧНО как в бэкенде
 */
export const getAIResponse = async (message, chatId = null, context = {}) => {
    try {
        const response = await api.post('/api/chat/ai-response', {
            message,
            chat_id: chatId,
            context
        });

        return response.data;
    } catch (error) {
        console.error('Failed to get AI response:', error);
        throw error;
    }
};

/**
 * Получение истории чатов - синхронизировано с бэкендом
 */
export const getChatHistory = async (chatId = null, limit = 20) => {
    try {
        const params = { limit };
        if (chatId) {
            params.chat_id = chatId;
        }

        const response = await api.get('/api/chat/history', { params });
        return response.data || [];
    } catch (error) {
        console.error('Failed to get chat history:', error);
        return [];
    }
};

/**
 * Создание нового чата - ТОЧНО как в бэкенде
 */
export const createNewChat = async (title = "Новый чат", chatType = "general") => {
    try {
        const response = await api.post('/api/chat/create', {
            title,
            chat_type: chatType
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create new chat:', error);
        throw error;
    }
};

/**
 * Создание чата для инструмента - НЕ РЕАЛИЗОВАНО В БЭКЕНДЕ!
 * Используем обычное создание чата
 */
export const createToolChat = async (toolType, toolTitle, description = "") => {
    try {
        // Бэкенд не имеет /api/chat/create-tool, используем обычный create
        const response = await api.post('/api/chat/create', {
            title: toolTitle,
            chat_type: toolType
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create tool chat:', error);
        throw error;
    }
};

// =====================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ФАЙЛАМИ - синхронизированы с бэкендом
// =====================================================

/**
 * Валидация файла перед загрузкой
 */
export const validateFile = (file) => {
    const errors = [];

    // Размер файла (50MB для всех пользователей по умолчанию)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        errors.push(`Размер файла превышает ${Math.round(maxSize / 1024 / 1024)} MB`);
    }

    // Проверяем поддерживаемые типы (взято из бэкенда)
    const supportedTypes = [
        // Изображения
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        // Документы
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/rtf', 'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Аудио
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
        'audio/x-wav', 'audio/m4a', 'audio/mp4', 'audio/aac',
        'audio/webm', 'audio/ogg', 'audio/vorbis'
    ];

    if (!supportedTypes.includes(file.type)) {
        errors.push(`Тип файла ${file.type} не поддерживается`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Загрузка отдельного файла - ТОЧНО как в бэкенде
 */
export const uploadFile = async (file) => {
    try {
        const validation = validateFile(file);
        if (!validation.isValid) {
            throw new Error(`Ошибка валидации файла: ${validation.errors.join(', ')}`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
    }
};

/**
 * Получение файлов пользователя - ТОЧНО как в бэкенде
 */
export const getUserFiles = async (limit = 50) => {
    try {
        const response = await api.get('/api/files', {
            params: { limit }
        });
        return response.data || [];
    } catch (error) {
        console.error('Failed to get user files:', error);
        return [];
    }
};

/**
 * Удаление файла - ТОЧНО как в бэкенде
 */
export const deleteFile = async (fileId) => {
    try {
        const response = await api.delete(`/api/files/${fileId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw error;
    }
};
