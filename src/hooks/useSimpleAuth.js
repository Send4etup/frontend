import { useState, useEffect } from 'react';
import { simpleAuth, getCurrentUser } from '../services/authService';

export const useSimpleAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Проверяем есть ли пользователь в localStorage
            const savedUser = getCurrentUser();
            if (savedUser) {
                setUser(savedUser);
                setIsLoading(false);
                return;
            }

            // Если нет - делаем простую авторизацию
            const authData = await simpleAuth();
            setUser(authData.user);

        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Ошибка авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const authData = await simpleAuth();
            setUser(authData.user);
        } catch (err) {
            console.error('Refresh error:', err);
        }
    };

    const updateUserPoints = (points) => {
        if (user) {
            const updatedUser = {
                ...user,
                current_points: (user.current_points || 0) + points,
                total_points: (user.total_points || 0) + points
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const trackUserActivity = (activity) => {
        console.log('User activity:', activity);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const showNotification = (message) => {
        alert(message);
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        refreshUserData,
        updateUserPoints,
        trackUserActivity,
        logout,
        showNotification,
        retry: initAuth
    };
};
