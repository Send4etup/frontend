import api from './api';

export const simpleAuth = async () => {
    try {
        const response = await api.post('/auth/telegram', {});

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

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
};

export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

// Для совместимости со старым кодом
export const checkTelegramAuth = simpleAuth;