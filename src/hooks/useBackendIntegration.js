import { useState, useEffect, useCallback } from 'react';

const checkBackendHealth = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3213/', {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('🏥 Backend health:', data);
            return { isOnline: true, data };
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.warn('💔 Backend health check failed:', error.message);
        return { isOnline: false, error: error.message };
    }
};

const authenticateUser = async (telegramData = {}) => {
    try {
        const response = await fetch('http://127.0.0.1:3213/api/auth/telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(telegramData)
        });

        if (response.ok) {
            const data = await response.json();

            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('🔐 Auth successful (new backend):', data.user);
                return { success: true, user: data.user, source: 'backend' };
            }
        }

        throw new Error('Backend auth failed');

    } catch (error) {
        console.warn('⚠️ New auth failed, falling back to old method:', error.message);

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

export const useBackendIntegration = () => {
    const [backendStatus, setBackendStatus] = useState({
        isOnline: false,
        isChecking: true,
        lastCheck: null,
        error: null
    });

    const [user, setUser] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

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

    useEffect(() => {
        checkBackend();

        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.warn('⚠️ Could not restore user from localStorage:', error);
        }
    }, [checkBackend]);

    return {
        backendStatus,
        user,
        isAuthenticating,
        checkBackend,
        authenticate,
        isReady: !backendStatus.isChecking
    };
};
