// src/services/chatAPI.js
/**
 * API функции для работы с чатами ТоварищБота
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Получение заголовков для запросов с авторизацией
 */
const getAuthHeaders = () => {
    // TODO: Заменить на реальный токен из Telegram auth
    const token = localStorage.getItem('backend_token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Создание нового чата
 * @param {string} title - Название чата
 * @param {string} chatType - Тип чата (general, coding, brainstorm, images, excuses, study_tools)
 * @returns {Promise<Object>} Данные созданного чата
 */
export const createChat = async (title, chatType = 'general') => {
    try {
        const telegram_auth = localStorage.getItem('telegram_auth')

        const response = await fetch(`${API_BASE_URL}/chat/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: title,
                chat_type: chatType,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const chatData = await response.json();

        console.log('✅ Chat created successfully:', chatData);
        return {
            chat_id: chatData.chat_id,
            success: true,
            data: chatData
        };

    } catch (error) {
        console.error('❌ Error creating chat:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Отправка сообщения в чат с файлами
 * @param {string} message - Текст сообщения
 * @param {string} chatId - ID чата
 * @param chatType
 * @returns {Promise<Object>} Результат отправки
 */
export const sendMessage = async (message, chatId, chatType) => {
    try {

        const response = await fetch(`${API_BASE_URL}/chat/send`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                chat_id: chatId,
                tool_type: chatType,
                message: message,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('✅ Message sent successfully:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error sending message:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Отправка сообщения в чат с файлами
 * @param {string} message - Текст сообщения
 * @param {Array} files - Массив файлов для отправки
 * @param {string} chatId - ID чата
 * @param chatType
 * @returns {Promise<Object>} Результат отправки
 */
export const sendMessageWithFiles = async (message, files, chatId, chatType) => {
    try {
        const formData = new FormData();

        formData.append('message', message);  // важно: message, а не content
        formData.append('chat_id', chatId);
        formData.append('tool_type', chatType);

        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_BASE_URL}/chat/send-with-files`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('✅ Message sent successfully:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error sending message:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение ответа от ИИ
 * @param {string} message - Сообщение пользователя
 * @param {string} chatId - ID чата
 * @param {Object} options - Дополнительные параметры
 * @returns {Promise<Object>} Ответ ИИ
 */
export const getAIResponse = async (message, chatId, options = {}) => {
    try {
        const requestBody = {
            message: message,
            chat_id: chatId,
            tool_type: options.tool_type || 'general',
            files_count: options.files_count || 0
        };

        const response = await fetch(`${API_BASE_URL}/chat/ai-response`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('🤖 AI response received:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error getting AI response:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение истории чатов пользователя
 * @param {number} limit - Количество чатов для получения
 * @returns {Promise<Object>} Список чатов
 */
export const 
    getUserChats = async (limit = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/history?limit=${limit}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const chats = await response.json();

        console.log('📋 Chats history received:', chats);

        return {
            success: true,
            data: chats,
        };

    } catch (error) {
        console.error('❌ Error getting chats history:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение сообщений чата
 * @param {string} chatId - ID чата
 * @param {number} limit - Количество сообщений
 * @returns {Promise<Object>} Сообщения чата
 */
export const getChatMessages = async (chatId, limit = 50) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages?limit=${limit}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const messages = await response.json();

        console.log('💬 Chat messages received:', messages);
        return {
            success: true,
            data: messages
        };

    } catch (error) {
        console.error('❌ Error getting chat messages:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Типы чатов и их отображение
 */
export const CHAT_TYPES = {
    general: 'Общий чат',
    coding: 'Кодинг',
    brainstorm: 'Брейншторм',
    images: 'Создание изображений',
    excuses: 'Придумать отмазку',
    study_tools: 'Учебные инструменты',
    homework_help: 'Помощь с домашкой',
    exam_prep: 'Подготовка к экзаменам',
    essay_writing: 'Написание сочинений',
    psychology: 'Поддержка настроения'
};

/**
 * Получение названия типа чата
 * @param {string} chatType - Тип чата
 * @returns {string} Отображаемое название
 */
export const getChatTypeDisplay = (chatType) => {
    return CHAT_TYPES[chatType] || 'Неизвестный тип';
};

// Экспортируем все функции
export default {
    createChat,
    sendMessage,
    getAIResponse,
    getUserChats,
    getChatMessages,
    getChatTypeDisplay,
    CHAT_TYPES
};