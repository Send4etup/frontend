// src/hooks/useBackendIntegration.js - НОВЫЙ ФАЙЛ
import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, authenticateUser } from '../services/backendAdapter';

export const useBackendIntegration = () => {
    const [backendStatus, setBackendStatus] = useState({
        isOnline: false,
        isChecking: true,
        lastCheck: null,
        error: null
    });

    const [user, setUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Проверка состояния бэкенда
    const checkBackend = useCallback(async () => {
        setBackendStatus(prev => ({ ...prev, isChecking: true }));

        const result = await checkBackendHealth();

        setBackendStatus({
            isOnline: result.isOnline,
            isChecking: false,
            lastCheck: new Date(),
            error: result.error || null
        });

        return result.isOnline;
    }, []);

    // Авторизация пользователя
    const authenticate = useCallback(async (telegramData = {}) => {
        setIsAuthenticating(true);

        try {
            const result = await authenticateUser(telegramData);

            if (result.success) {
                setUser(result.user);
                console.log(`🔐 Authenticated via ${result.source}:`, result.user);
            }

            return result;
        } catch (error) {
            console.error('🔐 Authentication error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsAuthenticating(false);
        }
    }, []);

    // Проверка при загрузке
    useEffect(() => {
        checkBackend();

        // Попытка восстановить пользователя из localStorage
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.warn('⚠️ Could not restore user from localStorage:', error);
        }
    }, [checkBackend]);

    // Периодическая проверка бэкенда
    useEffect(() => {
        const interval = setInterval(() => {
            if (backendStatus.isOnline) {
                checkBackend();
            }
        }, 30000); // Каждые 30 секунд

        return () => clearInterval(interval);
    }, [checkBackend, backendStatus.isOnline]);

    return {
        backendStatus,
        user,
        isAuthenticating,
        checkBackend,
        authenticate,
        isReady: !backendStatus.isChecking && (backendStatus.isOnline || user) // Готов если бэкенд онлайн ИЛИ есть пользователь
    };
};
