import api from './api';

export const checkAuth = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        const response = await api.get('/api/users/me');
        return response;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
};

export const checkUser = async (telegramId) => {
    try {
        const response = await api.post('/api/auth/check-user', {
            telegram_id: telegramId
        });

        if (response.exists && response.access_token) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        console.error('Check user failed:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/api/auth/register', userData);

        if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('token');
        await api.post('/api/auth/logout', { token });
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
};