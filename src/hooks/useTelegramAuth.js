// src/hooks/useTelegramAuth.js
import { useState, useEffect, useCallback } from 'react';
import telegramAuthService from '../services/telegramAuthService';

export const useTelegramAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [platformInfo, setPlatformInfo] = useState(null);

    /**
     * Инициализация аутентификации
     */
    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🚀 Initializing Telegram authentication...');

            // Шаг 1: Инициализируем Telegram Web App
            const isInitialized = telegramAuthService.initialize();
            if (!isInitialized) {
                throw new Error('Failed to initialize Telegram Web App');
            }

            // Шаг 2: Получаем информацию о платформе
            const platform = telegramAuthService.getPlatformInfo();
            setPlatformInfo(platform);
            console.log('📱 Platform info:', platform);

            // Шаг 3: Настраиваем UI под Telegram
            telegramAuthService.setupTelegramUI();

            // Шаг 4: Проверяем валидность данных
            const isValidData = telegramAuthService.validateTelegramData();
            if (!isValidData) {
                console.warn('⚠️ Invalid Telegram data, using local user');

                // Создаем локального пользователя для разработки
                const localUser = telegramAuthService.createLocalUser();
                setUser(localUser);
                setIsAuthenticated(true);

                return localUser;
            }

            // Шаг 5: Аутентификация через сервер
            console.log('🔐 Authenticating user...');
            const authResult = await telegramAuthService.authenticateUser();

            if (authResult.success) {
                console.log('✅ Authentication successful:', authResult.user);

                // Если пользователь новый, показываем приветствие
                if (authResult.user.is_new_user) {
                    telegramAuthService.showNotification(
                        `Добро пожаловать, ${authResult.user.first_name}! 🎉`,
                        'info'
                    );

                    // Отправляем событие регистрации
                    telegramAuthService.sendTelegramEvent('user_registered', {
                        user_id: authResult.user.id,
                        platform: platform.platform
                    });
                }

                setUser(authResult.user);
                setIsAuthenticated(true);

                return authResult.user;
            } else {
                throw new Error(authResult.message || 'Authentication failed');
            }

        } catch (error) {
            console.error('❌ Authentication error:', error);
            setError(error.message);

            // В случае ошибки пытаемся создать локального пользователя
            try {
                const fallbackUser = telegramAuthService.createLocalUser();
                setUser(fallbackUser);
                setIsAuthenticated(true);

                telegramAuthService.showNotification(
                    'Не удалось подключиться к серверу. Работаем в оффлайн режиме.',
                    'error'
                );

                return fallbackUser;
            } catch (fallbackError) {
                console.error('❌ Fallback user creation failed:', fallbackError);
                setError('Failed to initialize user');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Обновление данных пользователя
     */
    const refreshUserData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const updatedUser = await telegramAuthService.getUserData(user.id);
            setUser(updatedUser);

            console.log('🔄 User data refreshed:', updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('❌ Failed to refresh user data:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    /**
     * Обновление очков пользователя
     */
    const updateUserPoints = useCallback((pointsToAdd) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            current_points: (user.current_points || 0) + pointsToAdd,
            total_points: (user.total_points || 0) + pointsToAdd
        };

        // Проверяем повышение уровня (каждые 100 очков = новый уровень)
        const newLevel = Math.floor(updatedUser.total_points / 100) + 1;
        if (newLevel > user.level) {
            updatedUser.level = newLevel;

            // Показываем уведомление о повышении уровня
            telegramAuthService.showNotification(
                `🎉 Поздравляем! Вы достигли ${newLevel} уровня!`,
                'info'
            );

            // Отправляем событие
            telegramAuthService.sendTelegramEvent('level_up', {
                user_id: user.id,
                new_level: newLevel,
                points: updatedUser.total_points
            });
        }

        setUser(updatedUser);

        // Отправляем событие получения очков
        telegramAuthService.sendTelegramEvent('points_earned', {
            user_id: user.id,
            points_added: pointsToAdd,
            total_points: updatedUser.total_points
        });

        return updatedUser;
    }, [user]);

    /**
     * Отправка события активности
     */
    const trackUserActivity = useCallback((activityType, activityData = {}) => {
        if (!user) return;

        telegramAuthService.sendTelegramEvent(activityType, {
            user_id: user.id,
            ...activityData
        });
    }, [user]);

    /**
     * Выход из системы
     */
    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        setError(null);

        // Отправляем событие выхода
        if (user) {
            telegramAuthService.sendTelegramEvent('user_logout', {
                user_id: user.id
            });
        }

        // Закрываем приложение
        telegramAuthService.closeApp();
    }, [user]);

    /**
     * Инициализация при монтировании компонента
     */
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /**
     * Отслеживание изменения темы Telegram
     */
    useEffect(() => {
        const handleThemeChanged = () => {
            console.log('🎨 Telegram theme changed');
            telegramAuthService.setupTelegramUI();
        };

        // Слушаем изменения темы (если доступно)
        try {
            if (window.Telegram?.WebApp?.onEvent) {
                window.Telegram.WebApp.onEvent('themeChanged', handleThemeChanged);

                return () => {
                    window.Telegram.WebApp.offEvent('themeChanged', handleThemeChanged);
                };
            }
        } catch (error) {
            console.warn('Theme change listener not available:', error);
        }
    }, []);

    return {
        // Состояние
        user,
        isLoading,
        error,
        isAuthenticated,
        platformInfo,

        // Методы
        refreshUserData,
        updateUserPoints,
        trackUserActivity,
        logout,

        // Утилиты
        showNotification: telegramAuthService.showNotification.bind(telegramAuthService),
        closeApp: telegramAuthService.closeApp.bind(telegramAuthService)
    };
};