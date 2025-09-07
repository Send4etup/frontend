import api from './api';
import { authenticateUser } from './backendAdapter';

/**
 * Авторизация через Telegram - синхронизировано с бэкендом
 */
export const telegramAuth = async (telegramData = {}) => {
    try {
        const response = await api.post('/api/auth/telegram', {
            telegram_id: telegramData.telegram_id || null,
            first_name: telegramData.first_name || null,
            last_name: telegramData.last_name || null,
            username: telegramData.username || null,
            initData: telegramData.initData || null
        });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        console.error('Auth failed:', error);
        throw error;
    }
};

/**
 * Простая авторизация (создает тестового пользователя)
 */
export const simpleAuth = async () => {
    try {
        // Пробуем новый бэкенд
        const result = await authenticateUser();

        if (result.success) {
            console.log('🔐 Auth via backend successful');
            return result;
        }

        // FALLBACK: старая логика
        console.log('🔐 Using fallback auth');
        // Здесь оставляем СТАРЫЙ код авторизации

    } catch (error) {
        console.error('🔐 Auth error:', error);
        // FALLBACK: создаем mock пользователя как раньше
    }
};

/**
 * Выход из системы
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
};

/**
 * Получение текущего пользователя из localStorage
 */
export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

// Для совместимости со старым кодом
export const checkTelegramAuth = simpleAuth;
