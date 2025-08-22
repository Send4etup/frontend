// src/services/userService.js
import api from './api';

export const getUserProfile = async () => {
    try {
        const response = await api.get('/api/users/me');
        return response;
    } catch (error) {
        console.error('Failed to get user profile:', error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.patch('/api/users/me', profileData);
        return response;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
};

export const updateProgress = async (points, taskName = null) => {
    try {
        const response = await api.post('/api/users/progress', {
            points,
            task_name: taskName
        });
        return response;
    } catch (error) {
        console.error('Failed to update progress:', error);
        throw error;
    }
};

export const getFriends = async () => {
    try {
        const response = await api.get('/api/users/friends');
        return response;
    } catch (error) {
        console.error('Failed to get friends:', error);
        throw error;
    }
};

export const getTeachers = async () => {
    try {
        const response = await api.get('/api/users/teachers');
        return response;
    } catch (error) {
        console.error('Failed to get teachers:', error);
        throw error;
    }
};

export const addFriend = async (userId) => {
    try {
        const response = await api.post('/api/users/friends/add', { user_id: userId });
        return response;
    } catch (error) {
        console.error('Failed to add friend:', error);
        throw error;
    }
};

export const removeFriend = async (userId) => {
    try {
        const response = await api.delete(`/api/users/friends/${userId}`);
        return response;
    } catch (error) {
        console.error('Failed to remove friend:', error);
        throw error;
    }
};