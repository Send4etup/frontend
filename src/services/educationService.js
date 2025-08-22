import api from './api';

export const getChatHistory = async (limit = 10, offset = 0) => {
    try {
        const response = await api.get('/api/users/chat-history', {
            params: { limit, offset }
        });
        return response || [];
    } catch (error) {
        console.error('Failed to get chat history:', error);
        return [];
    }
};

export const sendMessage = async (message, toolType = null) => {
    try {
        const response = await api.post('/api/chat/send', {
            message,
            tool_type: toolType
        });
        return response;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

export const getTasks = async (status = 'active') => {
    try {
        const response = await api.get('/api/education/tasks', {
            params: { status }
        });
        return response || [];
    } catch (error) {
        console.error('Failed to get tasks:', error);
        return [];
    }
};

export const getTask = async (taskId) => {
    try {
        const response = await api.get(`/api/education/tasks/${taskId}`);
        return response;
    } catch (error) {
        console.error('Failed to get task:', error);
        throw error;
    }
};

export const updateTaskProgress = async (taskId, progress) => {
    try {
        const response = await api.patch(`/api/education/tasks/${taskId}/progress`, {
            progress
        });
        return response;
    } catch (error) {
        console.error('Failed to update task progress:', error);
        throw error;
    }
};

export const completeTask = async (taskId) => {
    try {
        const response = await api.post(`/api/education/tasks/${taskId}/complete`);
        return response;
    } catch (error) {
        console.error('Failed to complete task:', error);
        throw error;
    }
};

export const useTool = async (toolType, data) => {
    try {
        const response = await api.post('/api/education/tools/use', {
            tool_type: toolType,
            data
        });
        return response;
    } catch (error) {
        console.error('Failed to use tool:', error);
        throw error;
    }
};