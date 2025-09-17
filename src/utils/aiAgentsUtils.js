// src/utils/aiAgentsUtils.js
import aiAgentsConfig from '../data/aiAgents.json';
import {
    Camera, Code2, Lightbulb, MessageSquare, BookOpen,
    Target, FileText, PenTool, CheckSquare, Heart
} from 'lucide-react';

// Маппинг строковых названий иконок на компоненты
const ICON_COMPONENTS = {
    Camera,
    Code2,
    Lightbulb,
    MessageSquare,
    BookOpen,
    Target,
    FileText,
    PenTool,
    CheckSquare,
    Heart
};

/**
 * Получить все быстрые действия с главной страницы
 * @returns {Array} Массив быстрых действий с иконками-компонентами
 */
export const getQuickActions = () => {
    return aiAgentsConfig.quickActions.map(action => ({
        ...action,
        icon: ICON_COMPONENTS[action.icon] || Camera
    }));
};

/**
 * Получить все учебные инструменты
 * @returns {Array} Массив учебных инструментов с иконками-компонентами
 */
export const getStudyTools = () => {
    return aiAgentsConfig.studyTools.map(tool => ({
        ...tool,
        icon: ICON_COMPONENTS[tool.icon] || BookOpen
    }));
};

/**
 * Получить агента по типу действия
 * @param {string} actionType - Тип действия (например, 'coding', 'explain_topic')
 * @returns {Object|null} Объект агента или null
 */
export const getAgentByAction = (actionType) => {
    // Ищем в быстрых действиях
    const quickAction = aiAgentsConfig.quickActions.find(
        action => action.action === actionType
    );

    if (quickAction) {
        return {
            ...quickAction,
            icon: ICON_COMPONENTS[quickAction.icon] || Camera
        };
    }

    // Ищем в учебных инструментах
    const studyTool = aiAgentsConfig.studyTools.find(
        tool => tool.action === actionType
    );

    if (studyTool) {
        return {
            ...studyTool,
            icon: ICON_COMPONENTS[studyTool.icon] || BookOpen
        };
    }

    return null;
};

/**
 * Получить промпт для агента по типу действия
 * @param {string} actionType - Тип действия
 * @returns {string} Промпт для ИИ
 */
export const getAgentPrompt = (actionType) => {
    const agent = getAgentByAction(actionType);
    return agent?.prompt || "Ты универсальный помощник. Отвечай полезно и дружелюбно.";
};

/**
 * Получить приветственное сообщение для типа чата
 * @param {string} chatType - Тип чата
 * @returns {Object} Объект приветственного сообщения
 */
export const getWelcomeMessage = (chatType) => {
    const agent = getAgentByAction(chatType);

    // Fallback на general если агент не найден
    const welcomeText = agent?.welcomeMessage ||
        aiAgentsConfig.general?.welcomeMessage ||
        "Привет! Я ваш ИИ-помощник ТоварищБот.\n\nЗадавайте любые вопросы - я готов помочь!";

    return {
        id: 1,
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date(),
        isToolDescription: true
    };
};

/**
 * Получить данные типа чата (title, description, welcomeMessage)
 * @param {string} chatType - Тип чата
 * @returns {Object} Данные типа чата
 */
export const getChatTypeData = (chatType) => {
    const agent = getAgentByAction(chatType);

    if (agent) {
        return {
            title: agent.label,
            description: agent.description,
            welcomeMessage: agent.welcomeMessage
        };
    }

    // Fallback на general
    return aiAgentsConfig.general || {
        title: "ТоварищБот",
        description: "Универсальный помощник",
        welcomeMessage: "Привет! Я ваш ИИ-помощник ТоварищБот.\n\nЗадавайте любые вопросы - я готов помочь!"
    };
};

/**
 * Получить все агенты по категории
 * @param {string} category - Категория ('creative', 'technical', 'education', 'support', 'fun')
 * @returns {Array} Массив агентов в категории
 */
export const getAgentsByCategory = (category) => {
    const quickActions = getQuickActions().filter(action => action.category === category);
    const studyTools = getStudyTools().filter(tool => tool.category === category);

    return [...quickActions, ...studyTools];
};

/**
 * Получить информацию о категории
 * @param {string} categoryId - ID категории
 * @returns {Object|null} Информация о категории
 */
export const getCategoryInfo = (categoryId) => {
    return aiAgentsConfig.categories[categoryId] || null;
};

/**
 * Получить все доступные категории
 * @returns {Object} Объект с категориями
 */
export const getAllCategories = () => {
    return aiAgentsConfig.categories;
};

/**
 * Получить все типы действий
 * @returns {Array} Массив всех доступных типов действий
 */
export const getAllActionTypes = () => {
    const quickActionTypes = aiAgentsConfig.quickActions.map(action => action.action);
    const studyToolTypes = aiAgentsConfig.studyTools.map(tool => tool.action);

    return [...quickActionTypes, ...studyToolTypes];
};

/**
 * Проверить, существует ли агент с таким типом действия
 * @param {string} actionType - Тип действия
 * @returns {boolean} true если агент существует
 */
export const isValidActionType = (actionType) => {
    return getAllActionTypes().includes(actionType);
};

/**
 * Получить название агента по типу действия
 * @param {string} actionType - Тип действия
 * @returns {string} Название агента
 */
export const getAgentLabel = (actionType) => {
    const agent = getAgentByAction(actionType);
    return agent?.label || 'Неизвестный агент';
};

/**
 * Получить цвет иконки агента
 * @param {string} actionType - Тип действия
 * @returns {string} Цвет в hex формате
 */
export const getAgentIconColor = (actionType) => {
    const agent = getAgentByAction(actionType);
    return agent?.iconColor || '#43ff65';
};

/**
 * Экспорт конфигурации для использования в других местах
 */
export const AI_AGENTS_CONFIG = aiAgentsConfig;

/**
 * Дефолтный экспорт всех утилит
 */
export default {
    getQuickActions,
    getStudyTools,
    getAgentByAction,
    getAgentPrompt,
    getWelcomeMessage,
    getChatTypeData,
    getAgentsByCategory,
    getCategoryInfo,
    getAllCategories,
    getAllActionTypes,
    isValidActionType,
    getAgentLabel,
    getAgentIconColor,
    AI_AGENTS_CONFIG
};