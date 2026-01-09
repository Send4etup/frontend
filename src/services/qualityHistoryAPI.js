// src/services/qualityHistoryAPI.js - API для работы с качеством обучения и историей заданий

/**
 * API функции для работы с аналитикой качества и историей заданий ТоварищБота
 */

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

/**
 * Получение заголовков для запросов с авторизацией
 * @returns {Object} Заголовки с токеном авторизации
 */
const getAuthHeaders = async () => {
    const token = localStorage.getItem('backend_token');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

// =====================================================
// QUALITY ANALYTICS - Аналитика качества обучения
// =====================================================

/**
 * Получение аналитики качества обучения пользователя
 * Включает: общую точность, статистику по сложности, статистику по предметам, рекомендации
 * @param {string} userId - ID пользователя
 * @param {string|null} examType - Тип экзамена ('ОГЭ' или 'ЕГЭ', опционально)
 * @param {string|null} subjectId - ID предмета для фильтрации (опционально)
 * @returns {Promise<Object>} Результат { success, data: QualityAnalytics, error }
 *
 * @example
 * const result = await getQualityAnalytics('user123', 'ОГЭ');
 * if (result.success) {
 *   console.log('Общая точность:', result.data.overall_accuracy + '%');
 *   console.log('Всего попыток:', result.data.total_attempts);
 *   console.log('Рекомендации:', result.data.recommendations);
 * }
 */
export const getQualityAnalytics = async (userId, examType = null, subjectId = null) => {
    try {
        let url = `${API_BASE_URL}/exam/quality/analytics?user_id=${userId}`;

        if (examType) {
            url += `&exam_type=${examType}`;
        }

        if (subjectId) {
            url += `&subject_id=${subjectId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Quality analytics retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting quality analytics:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

// =====================================================
// TASK HISTORY - История решенных заданий
// =====================================================

/**
 * Получение истории всех попыток решения заданий
 * Поддерживает фильтрацию и пагинацию
 * @param {string} userId - ID пользователя
 * @param {Object} filters - Фильтры для истории
 * @param {string} filters.examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {string} filters.subjectId - ID предмета
 * @param {string} filters.difficulty - Сложность ('easy', 'medium', 'hard')
 * @param {boolean} filters.isCorrect - Правильность ответа (true/false)
 * @param {string} filters.dateFrom - Дата начала (ISO format)
 * @param {string} filters.dateTo - Дата окончания (ISO format)
 * @param {number} filters.limit - Максимальное количество записей (по умолчанию 20)
 * @param {number} filters.offset - Смещение для пагинации (по умолчанию 0)
 * @returns {Promise<Object>} Результат { success, data: TaskHistoryResponse, error }
 *
 * @example
 * // Получить все задания
 * const result = await getTaskHistory('user123', {});
 *
 * // Получить только неправильные по математике
 * const result = await getTaskHistory('user123', {
 *   subjectId: 'mathematics',
 *   isCorrect: false,
 *   limit: 20
 * });
 *
 * if (result.success) {
 *   console.log('Всего заданий:', result.data.total);
 *   console.log('Задания:', result.data.items);
 *   console.log('Есть еще:', result.data.has_more);
 * }
 */
export const getTaskHistory = async (userId, filters = {}) => {
    try {
        let url = `${API_BASE_URL}/exam/history/tasks?user_id=${userId}`;

        // Добавляем фильтры
        if (filters.examType) url += `&exam_type=${filters.examType}`;
        if (filters.subjectId) url += `&subject_id=${filters.subjectId}`;
        if (filters.difficulty) url += `&difficulty=${filters.difficulty}`;
        if (filters.isCorrect !== undefined) url += `&is_correct=${filters.isCorrect}`;
        if (filters.dateFrom) url += `&date_from=${filters.dateFrom}`;
        if (filters.dateTo) url += `&date_to=${filters.dateTo}`;
        if (filters.limit) url += `&limit=${filters.limit}`;
        if (filters.offset !== undefined) url += `&offset=${filters.offset}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Task history retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting task history:', error);
        return {
            success: false,
            error: error.message,
            data: {
                total: 0,
                items: [],
                has_more: false
            }
        };
    }
};

/**
 * Получение истории ТОЛЬКО неправильно решенных заданий
 * Упрощенный endpoint для быстрого доступа к ошибкам
 * @param {string} userId - ID пользователя
 * @param {Object} filters - Фильтры
 * @param {string} filters.examType - Тип экзамена
 * @param {string} filters.subjectId - ID предмета
 * @param {string} filters.difficulty - Сложность
 * @param {number} filters.limit - Максимальное количество записей (по умолчанию 20)
 * @param {number} filters.offset - Смещение для пагинации (по умолчанию 0)
 * @returns {Promise<Object>} Результат { success, data: TaskHistoryResponse, error }
 *
 * @example
 * const result = await getIncorrectTasks('user123', {
 *   examType: 'ОГЭ',
 *   limit: 10
 * });
 *
 * if (result.success) {
 *   console.log('Неправильных заданий:', result.data.total);
 *   result.data.items.forEach(task => {
 *     console.log('Задание:', task.question_text);
 *     console.log('Ваш ответ:', task.user_answer);
 *     console.log('Правильный ответ:', task.correct_answer);
 *   });
 * }
 */
export const getIncorrectTasks = async (userId, filters = {}) => {
    try {
        let url = `${API_BASE_URL}/exam/history/incorrect?user_id=${userId}`;

        if (filters.examType) url += `&exam_type=${filters.examType}`;
        if (filters.subjectId) url += `&subject_id=${filters.subjectId}`;
        if (filters.difficulty) url += `&difficulty=${filters.difficulty}`;
        if (filters.limit) url += `&limit=${filters.limit}`;
        if (filters.offset !== undefined) url += `&offset=${filters.offset}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Incorrect tasks retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting incorrect tasks:', error);
        return {
            success: false,
            error: error.message,
            data: {
                total: 0,
                items: [],
                has_more: false
            }
        };
    }
};

/**
 * Получение сводки по неправильно решенным заданиям
 * Показывает статистику ошибок по предметам и сложности
 * @param {string} userId - ID пользователя
 * @param {string|null} examType - Тип экзамена (опционально)
 * @returns {Promise<Object>} Результат { success, data: IncorrectTasksSummary, error }
 *
 * @example
 * const result = await getIncorrectSummary('user123', 'ОГЭ');
 * if (result.success) {
 *   console.log('Всего ошибок:', result.data.total_incorrect);
 *   console.log('По предметам:', result.data.by_subject);
 *   console.log('По сложности:', result.data.by_difficulty);
 *   console.log('Типичные ошибки:', result.data.most_common_mistakes);
 * }
 */
export const getIncorrectSummary = async (userId, examType = null) => {
    try {
        let url = `${API_BASE_URL}/exam/history/incorrect/summary?user_id=${userId}`;

        if (examType) {
            url += `&exam_type=${examType}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: await getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Incorrect summary retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting incorrect summary:', error);
        return {
            success: false,
            error: error.message,
            data: {
                total_incorrect: 0,
                by_subject: {},
                by_difficulty: {},
                most_common_mistakes: []
            }
        };
    }
};

/**
 * Получение задания для повторного решения
 * Возвращает задание БЕЗ правильного ответа
 * @param {number} taskId - ID задания
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: Task, error }
 *
 * @example
 * const result = await getTaskForRetry(123, 'user123');
 * if (result.success) {
 *   console.log('Вопрос:', result.data.question_text);
 *   console.log('Предыдущих попыток:', result.data.previous_attempts);
 *   console.log('Последняя была правильной:', result.data.last_attempt_was_correct);
 * }
 */
export const getTaskForRetry = async (taskId, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/task/${taskId}/retry?user_id=${userId}`,
            {
                method: 'GET',
                headers: await getAuthHeaders(),
                credentials: 'include'
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Task for retry retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting task for retry:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

// =====================================================
// UTILITY FUNCTIONS - Вспомогательные функции
// =====================================================

/**
 * Получение цвета для точности (аналитика качества)
 * @param {number} accuracy - Точность в процентах (0-100)
 * @returns {string} HEX цвет
 *
 * @example
 * const color = getAccuracyColor(85); // '#43ff65' (зеленый)
 * const color = getAccuracyColor(45); // '#f59e0b' (желтый)
 */
export const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#43ff65'; // Отлично
    if (accuracy >= 60) return '#3b82f6'; // Хорошо
    if (accuracy >= 40) return '#f59e0b'; // Удовлетворительно
    return '#ef4444'; // Плохо
};

/**
 * Получение текста для уровня сложности на русском
 * @param {string} difficulty - Уровень сложности ('easy', 'medium', 'hard')
 * @returns {string} Текст на русском
 *
 * @example
 * const text = getDifficultyText('easy'); // 'Легкое'
 */
export const getDifficultyText = (difficulty) => {
    const texts = {
        'easy': 'Легкое',
        'medium': 'Среднее',
        'hard': 'Сложное'
    };
    return texts[difficulty] || difficulty;
};

/**
 * Получение цвета для уровня сложности
 * @param {string} difficulty - Уровень сложности
 * @returns {string} HEX цвет
 *
 * @example
 * const color = getDifficultyColor('hard'); // '#ef4444' (красный)
 */
export const getDifficultyColor = (difficulty) => {
    const colors = {
        'easy': '#43ff65',
        'medium': '#f59e0b',
        'hard': '#ef4444'
    };
    return colors[difficulty] || '#888';
};

/**
 * Форматирование времени в читаемый вид
 * @param {number} seconds - Время в секундах
 * @returns {string} Форматированное время
 *
 * @example
 * formatTime(45);    // '45с'
 * formatTime(90);    // '1м 30с'
 * formatTime(125);   // '2м 5с'
 */
export const formatTime = (seconds) => {
    if (!seconds) return '—';

    if (seconds < 60) {
        return `${Math.round(seconds)}с`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (remainingSeconds === 0) {
        return `${minutes}м`;
    }

    return `${minutes}м ${remainingSeconds}с`;
};

/**
 * Форматирование даты в читаемый вид
 * @param {string} dateString - Дата в ISO формате
 * @returns {string} Форматированная дата
 *
 * @example
 * formatDate('2026-01-09T11:48:36');  // 'Сегодня, 11:48'
 * formatDate('2026-01-08T23:11:29');  // 'Вчера, 23:11'
 * formatDate('2026-01-05T15:30:00');  // '5 января, 15:30'
 */
export const formatDate = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const now = new Date();

    // Проверяем, сегодня ли
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Проверяем, вчера ли
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
        return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Иначе полная дата
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Форматирование даты для отображения (короткий формат)
 * @param {string} dateStr - Дата в формате ISO
 * @returns {string} Форматированная дата
 *
 * @example
 * formatDateShort('2026-01-09'); // '9 января 2026'
 */
export const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ========================================
// ЭКСПОРТ ВСЕХ ФУНКЦИЙ
// ========================================

export default {
    // Quality Analytics
    getQualityAnalytics,

    // Task History
    getTaskHistory,
    getIncorrectTasks,
    getIncorrectSummary,
    getTaskForRetry,

    // Utility Functions
    getAccuracyColor,
    getDifficultyText,
    getDifficultyColor,
    formatTime,
    formatDate,
    formatDateShort
};