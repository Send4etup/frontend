// src/services/ideasService.js
import api from './api';

export const getIdeas = async (filter = 'all', limit = 20, offset = 0) => {
    try {
        const response = await api.get('/api/ideas', {
            params: { filter, limit, offset }
        });
        return response || [];
    } catch (error) {
        console.error('Failed to get ideas:', error);
        return [];
    }
};

export const getIdea = async (ideaId) => {
    try {
        const response = await api.get(`/api/ideas/${ideaId}`);
        return response;
    } catch (error) {
        console.error('Failed to get idea:', error);
        throw error;
    }
};

export const createIdea = async (ideaData) => {
    try {
        const response = await api.post('/api/ideas', ideaData);
        return response;
    } catch (error) {
        console.error('Failed to create idea:', error);
        throw error;
    }
};

export const updateIdea = async (ideaId, ideaData) => {
    try {
        const response = await api.patch(`/api/ideas/${ideaId}`, ideaData);
        return response;
    } catch (error) {
        console.error('Failed to update idea:', error);
        throw error;
    }
};

export const deleteIdea = async (ideaId) => {
    try {
        const response = await api.delete(`/api/ideas/${ideaId}`);
        return response;
    } catch (error) {
        console.error('Failed to delete idea:', error);
        throw error;
    }
};

export const likeIdea = async (ideaId) => {
    try {
        const response = await api.post(`/api/ideas/${ideaId}/like`);
        return response;
    } catch (error) {
        console.error('Failed to like idea:', error);
        throw error;
    }
};

export const dislikeIdea = async (ideaId) => {
    try {
        const response = await api.post(`/api/ideas/${ideaId}/dislike`);
        return response;
    } catch (error) {
        console.error('Failed to dislike idea:', error);
        throw error;
    }
};

export const getIdeaComments = async (ideaId) => {
    try {
        const response = await api.get(`/api/ideas/${ideaId}/comments`);
        return response || [];
    } catch (error) {
        console.error('Failed to get comments:', error);
        return [];
    }
};

export const addComment = async (ideaId, comment) => {
    try {
        const response = await api.post(`/api/ideas/${ideaId}/comments`, {
            text: comment
        });
        return response;
    } catch (error) {
        console.error('Failed to add comment:', error);
        throw error;
    }
};