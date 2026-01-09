// src/services/userApi.js
/**
 * API сервис для работы с данными пользователя
 * Содержит все запросы связанные с профилем, настройками и статистикой
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech/api';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Создание заголовков для авторизованных запросов
 */
const getAuthHeaders = (token) => {
    if (!token) {
        throw new Error('Токен авторизации отсутствует');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Обработка ответов API с единой логикой ошибок
 */
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    return response.json();
};

/**
 * API методы для работы с пользователем
 */
export const userApi = {
    /**
     * Получение базового профиля пользователя
     */
    async getProfile(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            throw error;
        }
    },

    /**
     * Получение расширенной информации профиля для страницы профиля
     */
    async getExtendedProfile(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile-extended`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения расширенного профиля:', error);
            throw error;
        }
    },

    /**
     * Обновление настроек профиля
     */
    async updateProfile(token, profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(token),
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            throw error;
        }
    },

    /**
     * Получение статистики использования токенов
     */
    async getTokenUsageStats(token, days = 30) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/token-stats?days=${days}`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения статистики токенов:', error);
            throw error;
        }
    },

    /**
     * Получение истории активности пользователя
     */
    async getActivityHistory(token, limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/activity?limit=${limit}`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения истории активности:', error);
            throw error;
        }
    },

    /**
     * Получение информации о подписке
     */
    async getSubscriptionInfo(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/subscription`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения информации о подписке:', error);
            throw error;
        }
    },

    /**
     * Обновление настроек пользователя
     */
    async updateSettings(token, settings) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(token),
                credentials: 'include',
                body: JSON.stringify(settings)
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка обновления настроек:', error);
            throw error;
        }
    },

    /**
     * Получение настроек пользователя
     */
    async getSettings(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/settings`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения настроек:', error);
            throw error;
        }
    },

    /**
     * Удаление аккаунта пользователя
     */
    async deleteAccount(token, confirmationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/delete`, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
                credentials: 'include',
                body: JSON.stringify(confirmationData)
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка удаления аккаунта:', error);
            throw error;
        }
    },

    /**
     * Получение статистики использования приложения
     */
    async getUsageStats(token, period = '30d') {
        try {
            const response = await fetch(`${API_BASE_URL}/user/usage-stats?period=${period}`, {
                method: 'GET',
                headers: getAuthHeaders(token),
                credentials: 'include'
            });

            return await handleApiResponse(response);
        } catch (error) {
            console.error('Ошибка получения статистики использования:', error);
            throw error;
        }
    }
};

/**
 * Кастомный хук для работы с профилем пользователя
 * Интегрируется с useAuth для получения токена
 */
import { useState, useCallback } from 'react';

export const useUserProfile = (token) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Загрузка расширенного профиля
     */
    const loadExtendedProfile = useCallback(async () => {
        if (!token) {
            setError('Токен авторизации отсутствует');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await userApi.getExtendedProfile(token);
            setProfileData(data);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки расширенного профиля:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    /**
     * Обновление профиля
     */
    const updateProfile = useCallback(async (updates) => {
        if (!token) {
            setError('Токен авторизации отсутствует');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedData = await userApi.updateProfile(token, updates);
            setProfileData(prev => ({ ...prev, ...updatedData }));
            return true;
        } catch (err) {
            setError(err.message);
            console.error('Ошибка обновления профиля:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    /**
     * Загрузка статистики токенов
     */
    const loadTokenStats = useCallback(async (days = 30) => {
        if (!token) return null;

        try {
            return await userApi.getTokenUsageStats(token, days);
        } catch (err) {
            console.error('Ошибка загрузки статистики токенов:', err);
            return null;
        }
    }, [token]);

    /**
     * Загрузка истории активности
     */
    const loadActivityHistory = useCallback(async (limit = 10) => {
        if (!token) return null;

        try {
            return await userApi.getActivityHistory(token, limit);
        } catch (err) {
            console.error('Ошибка загрузки истории активности:', err);
            return null;
        }
    }, [token]);

    return {
        // Состояние
        profileData,
        isLoading,
        error,

        // Методы
        loadExtendedProfile,
        updateProfile,
        loadTokenStats,
        loadActivityHistory,

        // Прямой доступ к API для специфических случаев
        userApi
    };
};