import { useState, useEffect, useCallback, useRef } from 'react';

// Конфигурация API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Кастомный хук для безопасной авторизации через Telegram Mini Apps
 * Передает полный initData для HMAC-SHA256 валидации на сервере
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
     * Получение полного initData от Telegram WebApp для безопасной авторизации
     */
    const getTelegramInitData = useCallback(() => {
        try {
            if (!window.Telegram?.WebApp?.initData) {
                console.error('Telegram WebApp недоступен или initData пустой');
                return null;
            }

            const initData = window.Telegram.WebApp.initData;

            if (!initData || initData.length === 0) {
                console.error('InitData от Telegram пустой');
                return null;
            }

            console.log('Получен initData от Telegram');
            return initData;

        } catch (error) {
            console.error('Ошибка получения данных Telegram:', error);
            return null;
        }
    }, []);

    /**
     * Выполнение авторизации на сервере с полной валидацией initData
     */
    const authenticateUser = useCallback(async (initData) => {
        if (authInProgress.current) {
            console.log('Авторизация уже выполняется...');
            return null;
        }

        authInProgress.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log('Отправка запроса безопасной авторизации');

            const response = await fetch(`${API_BASE_URL}/auth/telegram-secure`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ init_data: initData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const authResult = await response.json();

            console.log('Успешная авторизация:', authResult.user);

            // Сохраняем данные в localStorage
            const authData = {
                token: authResult.access_token,
                user: authResult.user,
                telegram_data: authResult.telegram_data || {},
                timestamp: Date.now()
            };

            localStorage.setItem('backend_token', authResult.access_token);
            localStorage.setItem('telegram_auth', JSON.stringify(authData));

            // Обновляем состояние
            setToken(authResult.access_token);
            setUser({
                telegram: window.Telegram.WebApp.initDataUnsafe,
                db: authResult.user
            });
            setIsAuthenticated(true);

            return authResult;

        } catch (error) {
            console.error('Ошибка авторизации:', error);
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

            // Проверяем возраст сессии (24 часа)
            const sessionAge = Date.now() - authData.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа

            if (sessionAge > maxAge) {
                console.log('Сессия истекла, требуется повторная авторизация');
                localStorage.removeItem('telegram_auth');
                localStorage.removeItem('backend_token');
                return false;
            }

            // Восстанавливаем данные
            setToken(authData.token);
            setUser({
                telegram: window.Telegram?.WebApp?.initDataUnsafe?.user,
                db: authData.user
            });
            setIsAuthenticated(true);

            console.log('Сессия восстановлена:', authData.user);
            return true;

        } catch (error) {
            console.error('Ошибка восстановления сессии:', error);
            localStorage.removeItem('telegram_auth');
            localStorage.removeItem('backend_token');
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
            const initData = getTelegramInitData();

            if (initData) {
                await authenticateUser(initData);
            } else {
                setError('Не удалось получить данные от Telegram');
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [restoreSession, getTelegramInitData, authenticateUser]);

    /**
     * Выход из аккаунта
     */
    const logout = useCallback(() => {
        console.log('Выход из аккаунта');

        // Очищаем localStorage
        localStorage.removeItem('telegram_auth');
        localStorage.removeItem('backend_token');

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
            console.warn('Нет токена для обновления данных пользователя');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const userData = await response.json();
            setUser(prevUser => ({ ...prevUser, db: userData }));

            // Обновляем localStorage
            const savedAuth = JSON.parse(localStorage.getItem('telegram_auth') || '{}');
            savedAuth.user = { ...savedAuth.user, ...userData };
            localStorage.setItem('telegram_auth', JSON.stringify(savedAuth));

        } catch (error) {
            console.error('Ошибка обновления данных пользователя:', error);
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

    const getToken = () => {
        return localStorage.getItem('backend_token');
    }

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

            console.log('Telegram WebApp настроен');
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

        // Получение токена бэкенда
        getToken,

        // Вспомогательные геттеры
        userDisplayName: user?.db?.first_name || user?.telegram?.first_name || user?.db?.username || 'Пользователь',
        isTokenValid: !!token,
        subscriptionType: user?.db?.subscription_type || 'free',
        tokensBalance: user?.db?.tokens_balance || 0,
    };
};