// src/services/chatAPI.js - ПОЛНАЯ ВЕРСИЯ с транскрибацией

/**
 * API функции для работы с чатами ТоварищБота
 */

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Получение заголовков для запросов с авторизацией
 */
const getAuthHeaders = async () => {
    const token = localStorage.getItem('backend_token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
 * Отправка текстового сообщения в чат
 * @param {string} message - Текст сообщения
 * @param {string} chatId - ID чата
 * @param {string} chatType - Тип чата
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
 * @param {string} chatType - Тип чата
 * @returns {Promise<Object>} Результат отправки
 */
export const sendMessageWithFiles = async (message, files, chatId, chatType) => {
    try {
        const formData = new FormData();

        formData.append('message', message);
        formData.append('chat_id', chatId);
        formData.append('tool_type', chatType);

        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_BASE_URL}/chat/send-with-files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('backend_token')}`,
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
    abortController = null
) => {
    try {
        const requestBody = {
            message: message,
            chat_id: chatId,
            context: {
                tool_type: options.tool_type || 'general',
                agent_prompt: options.agent_prompt,
                temperature: options.temperature || 0.7,
            },
            file_ids: fileIds
        };

        const fetchOptions = {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(requestBody)
        };

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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
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

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;

            if (onChunk && typeof onChunk === 'function') {
                onChunk(chunk);
            }
        }

        return fullResponse;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⛔ Запрос отменен');
            throw new Error('STREAMING_CANCELLED');
        }

        console.error('❌ Streaming error:', error);
        throw error;
    }
};

/**
 * Генерация изображения через DALL-E с поддержкой анализа файлов
 * 🆕 ОБНОВЛЕНО: Теперь возвращает compressed_url и original_url для сохраненных изображений
 *
 * @param {string} chatId - ID чата
 * @param {string} prompt - Текстовый промпт для генерации
 * @param {string} agentPrompt - Системный промпт агента
 * @param {Object} context - Дополнительный контекст (temperature, tool_type)
 * @param {Array} fileIds - Массив ID файлов для анализа (опционально)
 * @returns {Promise<Object>} Результат генерации с URL изображения
 */
export const generateImage = async (chatId, prompt, agentPrompt, context = {}, fileIds = []) => {
    try {
        console.log('🎨 Запрос на генерацию изображения...');

        // Если есть файлы - логируем
        if (fileIds && fileIds.length > 0) {
            console.log('📎 С файлами для анализа:', fileIds);
        }

        const requestBody = {
            chat_id: chatId,
            message: prompt,
            agent_prompt: agentPrompt,
            context: {
                tool_type: context.tool_type || 'images',
                temperature: context.temperature || 0.7
            }
        };

        // ✅ Добавляем file_ids если есть
        if (fileIds && fileIds.length > 0) {
            requestBody.file_ids = fileIds;
        }

        const response = await fetch(`${API_BASE_URL}/chat/generate-image`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.image_url) {
            console.log('✅ Изображение сгенерировано:', result.image_url);

            return {
                success: true,
                data: {
                    image_url: result.image_url,
                    image_id: result.attachment_id || null,
                    original_url: result.attachment_id
                        ? `${API_BASE_URL}/images/${result.attachment_id}/original`
                        : null,
                    revised_prompt: result.revised_prompt || null,
                    message: result.message || 'Изображение создано',
                    analysis: result.analysis || null
                }
            };
        } else {
            throw new Error(result.error || 'Не удалось получить URL изображения');
        }

    } catch (error) {
        console.error('❌ Ошибка генерации изображения:', error);
        return {
            success: false,
            error: error.message || 'Не удалось сгенерировать изображение'
        };
    }
};

/**
 * 🆕 НОВАЯ ФУНКЦИЯ: Скачивание оригинала изображения
 *
 * @param {string} imageId - ID изображения
 * @param {string} fileName - Имя файла для сохранения (опционально)
 * @returns {Promise<boolean>} - Успешно ли скачано
 */
export const downloadOriginalImage = async (imageId, fileName = 'generated-image.png') => {
    try {
        console.log('⬇️ Скачивание оригинала:', imageId);

        const response = await fetch(`${API_BASE_URL}/images/${imageId}/original`, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Получаем blob
        const blob = await response.blob();

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `generated_${imageId}.png`;
        document.body.appendChild(a);
        a.click();

        // Очистка
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Оригинал скачан');
        return true;

    } catch (error) {
        console.error('❌ Ошибка скачивания оригинала:', error);
        return false;
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
 * Обновление названия чата
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
 * Удаление чата
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

// ========================================
// 🎤 ФУНКЦИИ ТРАНСКРИБАЦИИ АУДИО
// ========================================

/**
 * Транскрибация аудио в текст через Whisper API
 * @param {Blob} audioBlob - Аудио файл (Blob)
 * @param {string} language - Язык аудио (по умолчанию 'ru')
 * @param {string} prompt - Контекстный промпт для улучшения точности (опционально)
 * @returns {Promise<Object>} Результат транскрибации { success, text, error }
 */
export const transcribeAudio = async (audioBlob, language = 'ru', prompt = null) => {
    try {
        console.log('🎤 Начинаем транскрибацию аудио...');

        // Валидация входных данных
        if (!audioBlob || !(audioBlob instanceof Blob)) {
            throw new Error('Некорректный аудио файл');
        }

        if (audioBlob.size === 0) {
            throw new Error('Аудио файл пустой');
        }

        // Проверка размера (макс. 25MB для Whisper API)
        const MAX_SIZE = 25 * 1024 * 1024; // 25MB
        if (audioBlob.size > MAX_SIZE) {
            const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
            throw new Error(`Аудио файл слишком большой (${sizeMB}MB, макс. 25MB)`);
        }

        // Создаем FormData для отправки
        const formData = new FormData();

        // Добавляем аудио файл с правильным именем и расширением
        const audioFile = new File([audioBlob], 'recording.webm', {
            type: audioBlob.type || 'audio/webm',
            lastModified: Date.now()
        });

        formData.append('audio', audioFile);
        formData.append('language', language);

        // Добавляем контекстный промпт
        if (prompt) {
            formData.append('prompt', prompt);
        } else {
            // Дефолтный образовательный контекст
            const defaultPrompt = "Это образовательный контент на русском языке о программировании, учебе и образовании. Распознавай термины: математика, физика, химия, программирование, Python, JavaScript, функция, переменная, уравнение, формула, теорема.";
            formData.append('prompt', defaultPrompt);
        }

        // Отправляем запрос на бэкенд
        const response = await fetch(`${API_BASE_URL}/transcribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
                // Не добавляем Content-Type - браузер сам установит с boundary для FormData
            },
            credentials: 'include',
            body: formData
        });

        // Обработка ошибок HTTP
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || errorData.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        // Парсим ответ
        const data = await response.json();

        // Проверяем успешность транскрибации
        if (data.success === false) {
            throw new Error(data.error || data.message || 'Не удалось распознать речь');
        }

        // Проверяем наличие текста
        if (!data.text || !data.text.trim()) {
            console.warn('⚠️ Транскрибация вернула пустой текст');
            return {
                success: false,
                text: '',
                error: 'Не удалось распознать речь. Возможно, аудио слишком тихое или содержит только шум.'
            };
        }

        // Успешная транскрибация
        console.log('✅ Транскрибация успешна:', data.text.substring(0, 100) + '...');

        return {
            success: true,
            text: data.text.trim(),
            error: null
        };

    } catch (error) {
        console.error('❌ Ошибка транскрибации:', error);

        // Формируем понятное сообщение об ошибке для пользователя
        let userMessage = 'Не удалось распознать речь. Попробуйте еще раз.';

        const errorStr = error.message.toLowerCase();

        if (errorStr.includes('rate limit')) {
            userMessage = 'Превышен лимит запросов. Попробуйте позже.';
        } else if (errorStr.includes('network') || errorStr.includes('fetch')) {
            userMessage = 'Ошибка соединения с сервером. Проверьте интернет-соединение.';
        } else if (errorStr.includes('too large') || errorStr.includes('слишком большой')) {
            userMessage = error.message;
        } else if (errorStr.includes('invalid') || errorStr.includes('format')) {
            userMessage = 'Неподдерживаемый формат аудио. Используйте: WEBM, MP3, WAV, M4A, OGG.';
        } else if (errorStr.includes('timeout')) {
            userMessage = 'Время ожидания истекло. Попробуйте записать более короткое сообщение.';
        } else if (errorStr.includes('empty') || errorStr.includes('пустой')) {
            userMessage = 'Аудио файл пустой. Проверьте запись.';
        } else if (error.message) {
            userMessage = error.message;
        }

        return {
            success: false,
            text: '',
            error: userMessage
        };
    }
};

/**
 * Транскрибация аудио файла из input[type="file"]
 * Удобная обёртка для работы с File объектами
 * @param {File} audioFile - Аудио файл из input
 * @param {string} language - Язык аудио (по умолчанию 'ru')
 * @param {string} prompt - Контекстный промпт для улучшения точности (опционально)
 * @returns {Promise<Object>} Результат транскрибации { success, text, error }
 */
export const transcribeAudioFile = async (audioFile, language = 'ru', prompt = null) => {
    try {
        // Валидация файла
        if (!audioFile || !(audioFile instanceof File)) {
            throw new Error('Некорректный файл');
        }

        // Проверяем тип файла
        const supportedTypes = [
            'audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg',
            'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/flac'
        ];

        if (!supportedTypes.some(type => audioFile.type.includes(type.split('/')[1]))) {
            throw new Error('Неподдерживаемый формат аудио. Используйте: WEBM, MP3, WAV, M4A, OGG, FLAC.');
        }

        // Конвертируем File в Blob и вызываем основную функцию
        const audioBlob = new Blob([audioFile], { type: audioFile.type });
        return await transcribeAudio(audioBlob, language, prompt);

    } catch (error) {
        console.error('❌ Ошибка транскрибации файла:', error);
        return {
            success: false,
            text: '',
            error: error.message || 'Не удалось обработать аудио файл'
        };
    }
};

/**
 * 🧠 Получение AI-анализа для автоматического подбора настроек
 *
 * @param {string} message - Сообщение пользователя для анализа
 * @param {string} chatType - Тип чата (coding, brainstorm, exam_prep, etc.)
 * @param {Object} currentSettings - Текущие настройки чата
 * @param {string} systemPrompt - Системный промпт для контекста
 * @param {string} chatID - ID чата
 * @returns {Promise<Object|null>} Рекомендованные настройки от ИИ или null при ошибке
 */
export const getAIAnalysis = async (
    message,
    chatType,
    currentSettings,
    systemPrompt,
    chatID
) => {
    try {
        console.log('🧠 [AI Analysis] Запрос анализа настроек...', {
            chatType,
            messageLength: message.length,
            currentSettings
        });

        const requestBody = {
            message: message,
            chat_id: chatID,
            current_settings: currentSettings, // ← ВАЖНО!
            context: {
                tool_type: chatType,
                agent_prompt: systemPrompt,
            }
        };

        console.log('📤 [AI Analysis] Request body:', requestBody);

        const response = await fetch(`${API_BASE_URL}/chat/generate-chat-settings`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('⚠️ [AI Analysis] Ошибка запроса:', {
                status: response.status,
                error: errorData
            });
            return null;
        }

        const data = await response.json();

        console.log('📝 [AI Analysis] Полный ответ:', data);

        const settings = data.settings || data;

        if (settings && Object.keys(settings).length > 0) {
            console.log('✅ [AI Analysis] Настройки успешно получены:', settings);
            return settings;
        } else {
            console.log('ℹ️ [AI Analysis] Изменений не требуется (пустой объект)');
            return null;
        }

    } catch (error) {
        console.error('❌ [AI Analysis] Ошибка:', error);
        return null;
    }
};


// ========================================
// 📚 ТИПЫ ЧАТОВ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

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

// ========================================
// 📤 ЭКСПОРТ ВСЕХ ФУНКЦИЙ
// ========================================

export default {
    createChat,
    sendMessage,
    sendMessageWithFiles,
    getAIResponseStream,
    savePartialAIResponse,
    getUserChats,
    getAIAnalysis,
    getChatMessages,
    updateChatTitle,
    deleteChatById,
    getChatInfo,
    transcribeAudio,
    transcribeAudioFile,
    getChatTypeDisplay,
    generateImage,
    CHAT_TYPES
};