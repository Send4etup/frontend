import { useState, useEffect, useCallback, useRef } from 'react';

// Конфигурация API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Кастомный хук для авторизации через Telegram Mini Apps
 * Поддерживает как полную авторизацию через Telegram, так и тестовый режим
 */
export const useAuth = () => {
    // Состояния авторизации
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    // Ref для предотвращения повторных запросов
    const authInProgress = useRef(false);

    /**
     * Получение данных пользователя из Telegram WebApp
     */
    const getTelegramUserData = useCallback(() => {
        try {

            const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            return {
                telegram_id: telegramUser.id,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                photo_url: telegramUser.photo_url,
            };

        } catch (error) {
            console.error('❌ Ошибка получения данных Telegram:', error);
            return null;
        }
    }, []);

    /**
     * Выполнение авторизации на сервере
     */
    const authenticateUser = useCallback(async (userData) => {
        if (authInProgress.current) {
            console.log('🔄 Авторизация уже выполняется...');
            return null;
        }

        authInProgress.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log('🚀 Отправка запроса авторизации:', userData);

            const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const authResult = await response.json();
            console.log('✅ Успешная авторизация:', authResult);

            // Сохраняем данные в localStorage
            const authData = {
                token: authResult.token,
                user: authResult.user,
                timestamp: Date.now()
            };

            localStorage.setItem('telegram_auth', JSON.stringify(authData));

            // Обновляем состояние
            setToken(authResult.token);
            setUser({
                telegram: window.Telegram.WebApp.initDataUnsafe.user,
                db: authResult.user
            });
            setIsAuthenticated(true);

            return authResult;

        } catch (error) {
            console.error('❌ Ошибка авторизации:', error);
            setError(error.message);
            setIsAuthenticated(false);
            return null;
        } finally {
            setIsLoading(false);
            authInProgress.current = false;
        }
    }, []);

    /**
     * Восстановление сессии из localStorage
     */
    const restoreSession = useCallback(() => {
        try {
            const savedAuth = localStorage.getItem('telegram_auth');
            if (!savedAuth) {
                return false;
            }

            const authData = JSON.parse(savedAuth);

            // Проверяем валидность сессии (24 часа)
            const sessionAge = Date.now() - authData.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа

            if (sessionAge > maxAge) {
                console.log('⏰ Сессия истекла, требуется повторная авторизация');
                localStorage.removeItem('telegram_auth');
                return false;
            }

            // Восстанавливаем данные
            setToken(authData.token);
            setUser({
                telegram: window.Telegram.WebApp.initDataUnsafe.user,
                db: authData.user
            });
            setIsAuthenticated(true);

            console.log('✅ Сессия восстановлена:', authData.user);
            return true;

        } catch (error) {
            console.error('❌ Ошибка восстановления сессии:', error);
            localStorage.removeItem('telegram_auth');
            return false;
        }
    }, []);

    /**
     * Инициализация авторизации
     */
    const initializeAuth = useCallback(async () => {
        setIsLoading(true);

        // Сначала пытаемся восстановить сессию
        const sessionRestored = restoreSession();

        if (!sessionRestored) {
            // Если сессия не восстановлена, выполняем авторизацию
            const userData = getTelegramUserData();

            if (userData) {
                await authenticateUser(userData);
            } else {
                setError('Не удалось получить данные пользователя');
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [restoreSession, getTelegramUserData, authenticateUser]);

    /**
     * Выход из аккаунта
     */
    const logout = useCallback(() => {
        console.log('👋 Выход из аккаунта');

        // Очищаем localStorage
        localStorage.removeItem('telegram_auth');

        // Сбрасываем состояние
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(null);

        // Уведомляем Telegram WebApp о выходе
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
    }, []);

    /**
     * Обновление данных пользователя
     */
    const refreshUser = useCallback(async () => {
        if (!token) {
            console.warn('⚠️ Нет токена для обновления данных пользователя');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const userData = await response.json();
            setUser(prevUser => ({ ...prevUser, ...userData }));

            // Обновляем localStorage
            const savedAuth = JSON.parse(localStorage.getItem('telegram_auth') || '{}');
            savedAuth.user = { ...savedAuth.user, ...userData };
            localStorage.setItem('telegram_auth', JSON.stringify(savedAuth));

        } catch (error) {
            console.error('❌ Ошибка обновления данных пользователя:', error);
        }
    }, [token]);

    /**
     * Получение заголовков авторизации для API запросов
     */
    const getAuthHeaders = useCallback(() => {
        if (!token) {
            return {};
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }, [token]);

    // Инициализация при монтировании компонента
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Настройка Telegram WebApp
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            // Расширяем WebApp на весь экран
            window.Telegram.WebApp.expand();

            // Включаем закрывающую подтверждение
            window.Telegram.WebApp.enableClosingConfirmation();

            // Показываем главную кнопку если нужно
            if (window.Telegram.WebApp.MainButton) {
                window.Telegram.WebApp.MainButton.hide();
            }

            console.log('📱 Telegram WebApp настроен');
        }
    }, []);

    // Публичный API хука
    return {
        // Состояние
        user,
        isLoading,
        isAuthenticated,
        error,
        token,

        // Методы
        logout,
        refreshUser,
        getAuthHeaders,
        initializeAuth,


        // Вспомогательные геттеры
        userDisplayName: user?.display_name || user?.first_name || user?.username || 'Пользователь',
        isTokenValid: !!token,
        subscriptionType: user?.subscription_type || 'free',
        tokensBalance: user?.tokens_balance || 0,
    };
};