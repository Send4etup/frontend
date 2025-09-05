import api from './api';

export const getUserProfile = async () => {
    try {
        const response = await api.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Failed to get user profile:', error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.patch('/user/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
};
