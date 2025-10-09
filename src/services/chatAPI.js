// src/services/chatAPI.js

// import { csrfService } from './csrfService';

/**
 * API функции для работы с чатами ТоварищБота
 */

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech/api';

/**
 * Получение заголовков для запросов с авторизацией
 */
const getAuthHeaders = async () => {
    const token = localStorage.getItem('backend_token');

    // if (!csrfService.hasToken()) {
    //     await csrfService.getCsrfToken();
    // }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // 'X-CSRF-Token': csrfService.getToken()  // Добавляем CSRF токен
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
            headers: await getAuthHeaders(),
            credentials: 'include',
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
            headers: await getAuthHeaders(),
            credentials: 'include',
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
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('backend_token')}`,
                // 'X-CSRF-Token': csrfService.hasToken() ? csrfService.getToken() : await csrfService.getCsrfToken()
            },
            credentials: 'include',
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
 * Получение streaming ответа от ИИ с поддержкой отмены
 * @param {string} message - Сообщение пользователя
 * @param {string} chatId - ID чата
 * @param {Object} options - Дополнительные параметры
 * @param {Function} onChunk - Callback для каждого чанка текста
 * @param {Array} fileIds - ID файлов
 * @param {AbortController} abortController - Контроллер для отмены запроса
 * @returns {Promise<string>} Полный ответ ИИ
 */
export const getAIResponseStream = async (
    message,
    chatId,
    options = {},
    onChunk,
    fileIds = [],
    abortController = null // ✅ ДОБАВЛЕНО: поддержка AbortController
) => {
    try {
        const requestBody = {
            message: message,
            chat_id: chatId,
            context: {
                tool_type: options.tool_type || 'general'
            },
            file_ids: fileIds
        };

        // ✅ КРИТИЧНО: Добавляем signal для возможности отмены
        const fetchOptions = {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(requestBody)
        };

        // Добавляем signal если передан abortController
        if (abortController) {
            fetchOptions.signal = abortController.signal;
        }

        const response = await fetch(
            `${API_BASE_URL}/chat/ai-response`,
            fetchOptions
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Читаем streaming ответ
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            // ✅ Проверяем отмену на каждой итерации
            if (abortController?.signal.aborted) {
                console.log('⛔ Streaming прерван пользователем');
                reader.cancel();
                break;
            }

            const { done, value } = await reader.read();

            if (done) {
                console.log('✅ Streaming завершен');
                break;
            }

            // Декодируем чанк
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;

            // Отправляем чанк в callback
            if (onChunk && typeof onChunk === 'function') {
                onChunk(chunk);
            }
        }

        return fullResponse;

    } catch (error) {
        // ✅ Обрабатываем AbortError отдельно
        if (error.name === 'AbortError') {
            console.log('⛔ Запрос отменен');
            throw new Error('STREAMING_CANCELLED');
        }

        console.error('❌ Streaming error:', error);
        throw error;
    }
};

/**
 * Сохранение частичного ответа ИИ при прерывании
 * @param {string} chatId - ID чата
 * @param {string} content - Частичный контент
 * @returns {Promise<Object>} Результат сохранения
 */
export const savePartialAIResponse = async (chatId, content) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/save-partial-response`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                chat_id: chatId,
                content: content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Ошибка сохранения');
        }

        const result = await response.json();
        console.log('✅ Partial response saved:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error saving partial response:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение истории чатов пользователя с поддержкой пагинации
 * @param {number} limit - Количество чатов для получения
 * @param {number} offset - Смещение для пагинации (необязательно)
 * @returns {Promise<Object>} Список чатов
 */
export const getUserChats = async (limit = 10, offset = 0) => {
    try {
        let url = `${API_BASE_URL}/chat/history?limit=${limit}`;
        if (offset > 0) {
            url += `&offset=${offset}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include',
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
            headers: await getAuthHeaders(),
            credentials: 'include',
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
 * НОВАЯ ФУНКЦИЯ: Обновление названия чата
 * @param {string} chatId - ID чата
 * @param {string} newTitle - Новое название чата
 * @returns {Promise<Object>} Результат обновления
 */
export const updateChatTitle = async (chatId, newTitle) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}/title`, {
            method: 'PUT',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                title: newTitle.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('✅ Chat title updated successfully:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error updating chat title:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * НОВАЯ ФУНКЦИЯ: Удаление чата
 * @param {string} chatId - ID чата для удаления
 * @returns {Promise<Object>} Результат удаления
 */
export const deleteChatById = async (chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders(),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('✅ Chat deleted successfully:', result);
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Error deleting chat:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение информации о конкретном чате
 * @param {string} chatId - ID чата
 * @returns {Promise<Object>} Информация о чате
 */
export const getChatInfo = async (chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const chatInfo = await response.json();

        console.log('ℹ️ Chat info received:', chatInfo);
        return {
            success: true,
            data: chatInfo
        };

    } catch (error) {
        console.error('❌ Error getting chat info:', error);
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
    getAIResponseStream,
    getUserChats,
    getChatMessages,
    getChatTypeDisplay,
    CHAT_TYPES
};