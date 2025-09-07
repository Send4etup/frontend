/**
 * Адаптер для работы с новым бэкендом, сохраняя совместимость со старым кодом
 */
import api from './api';

/**
 * Проверка доступности бэкенда
 */
export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/');
        console.log('🏥 Backend health:', response.data);
        return { isOnline: true, data: response.data };
    } catch (error) {
        console.error('💔 Backend health check failed:', error);
        return { isOnline: false, error: error.message };
    }
};

/**
 * Новая авторизация с fallback на старую
 */
export const authenticateUser = async (telegramData = {}) => {
    try {
        // Пробуем новый endpoint
        const response = await api.post('/api/auth/telegram', telegramData);

        if (response.data.token && response.data.user) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('🔐 Auth successful (new backend):', response.data.user);
            return { success: true, user: response.data.user, source: 'backend' };
        }
    } catch (error) {
        console.warn('⚠️ New auth failed, falling back to old method:', error);

        // Fallback: создаем mock пользователя как раньше
        const mockUser = {
            user_id: 'mock_' + Date.now(),
            telegram_id: telegramData.telegram_id || 123456789,
            username: telegramData.username || 'test_user',
            display_name: telegramData.first_name || 'Test User',
            subscription_type: 'free',
            tokens_balance: 5
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        console.log('🔐 Auth fallback (mock user):', mockUser);
        return { success: true, user: mockUser, source: 'fallback' };
    }
};

/**
 * Отправка сообщения с поддержкой файлов
 */
export const sendMessageSafe = async (message, files = [], chatId = null) => {
    try {
        // Если есть файлы, используем новый endpoint
        if (files.length > 0) {
            const formData = new FormData();
            formData.append('message', message);
            if (chatId) formData.append('chat_id', chatId);

            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post('/api/chat/send-with-files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('📎 Message with files sent:', response.data);
            return { success: true, data: response.data, hasFiles: true };
        }

        // Если только текст, используем простой endpoint
        const response = await api.post('/api/chat/send', {
            message,
            chat_id: chatId
        });

        console.log('📝 Text message sent:', response.data);
        return { success: true, data: response.data, hasFiles: false };

    } catch (error) {
        console.error('💬 Send message failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Получение ответа от ИИ
 */
export const getAIResponseSafe = async (message, chatId = null, context = {}) => {
    try {
        const response = await api.post('/api/chat/ai-response', {
            message,
            chat_id: chatId,
            context
        });

        console.log('🤖 AI response received:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('🤖 AI response failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Создание нового чата
 */
export const createChatSafe = async (title, chatType = 'general') => {
    try {
        const response = await api.post('/api/chat/create', {
            title,
            chat_type: chatType
        });

        console.log('💬 Chat created:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('💬 Create chat failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Загрузка файла
 */
export const uploadFileSafe = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('📁 File uploaded:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('📁 File upload failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Получение истории чатов
 */
export const getChatHistorySafe = async (chatId = null, limit = 20) => {
    try {
        const params = { limit };
        if (chatId) params.chat_id = chatId;

        const response = await api.get('/api/chat/history', { params });

        console.log('📚 Chat history received:', response.data);
        return { success: true, data: response.data || [] };

    } catch (error) {
        console.error('📚 Get chat history failed:', error);
        return { success: false, data: [], error: error.message };
    }
};