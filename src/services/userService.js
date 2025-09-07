import api from './api';

/**
 * Получение профиля пользователя - ТОЧНО как в бэкенде
 */
export const getUserProfile = async () => {
    try {
        const response = await api.get('/api/user/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to get user profile:', error);
        throw error;
    }
};

/**
 * ВАЖНО: Бэкенд НЕ имеет endpoint для обновления профиля!
 * Этот функционал нужно будет добавить в бэкенд или убрать из фронтенда
 */
export const updateProfile = async (profileData) => {
    console.warn('Update profile endpoint not implemented in backend yet');
    // try {
    //     const response = await api.patch('/api/user/profile', profileData);
    //     return response.data;
    // } catch (error) {
    //     console.error('Failed to update profile:', error);
    //     throw error;
    // }
    throw new Error('Update profile not implemented in backend');
};

// =====================================================
// СИСТЕМНЫЕ ФУНКЦИИ
// =====================================================

/**
 * Получение информации о системе - ТОЧНО как в бэкенде
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
 * Health check - ТОЧНО как в бэкенде
 */
export const healthCheck = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};