// src/services/examAPI.js - API для работы с экзаменационной системой

import { getMaxScore as getSubjectMaxScore } from '../config/subjectMapping';
import {useAuth} from "../hooks/useAuth.js";

/**
 * API функции для работы с экзаменами (ОГЭ/ЕГЭ) ТоварищБота
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech/api';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213/api';

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
// EXAM SETTINGS - Управление настройками экзаменов
// =====================================================

/**
 * Создание настроек экзамена
 * @param {string} examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {Array<Object>} subjects - Список предметов [{subject_id: string, target_score?: number}]
 * @param {string|null} examDate - Дата экзамена в формате 'YYYY-MM-DD' (опционально)
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат создания { success, data, error }
 *
 * @example
 * const result = await createExamSettings('ЕГЭ', [
 *   { subject_id: 'математика', target_score: 85 },
 *   { subject_id: 'русский язык', target_score: 90 }
 * ], '2025-06-01', 'user123');
 */
export const createExamSettings = async (examType, subjects, examDate = null, userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/exam/settings?user_id=${userId}`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
                exam_type: examType,
                exam_date: examDate,
                subjects: subjects
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Exam settings created successfully:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error creating exam settings:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение всех настроек экзаменов пользователя
 * @param {string} userId - ID пользователя
 * @param {string|null} examType - Фильтр по типу экзамена ('ОГЭ' или 'ЕГЭ', опционально)
 * @returns {Promise<Object>} Результат { success, data: Array<ExamSettings>, error }
 *
 * @example
 * const result = await getExamSettings('user123', 'ЕГЭ');
 * if (result.success) {
 *   console.log('Настройки:', result.data);
 * }
 */
export const getExamSettings = async (userId, examType = null) => {
    try {
        let url = `${API_BASE_URL}/exam/settings?user_id=${userId}`;
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

        console.log('✅ Exam settings retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting exam settings:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

/**
 * Получение конкретных настроек экзамена по ID
 * @param {number} settingsId - ID настроек экзамена
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data, error }
 */
export const getExamSettingsById = async (settingsId, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/settings/${settingsId}?user_id=${userId}`,
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

        console.log('✅ Exam settings by ID retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting exam settings by ID:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Обновление настроек экзамена (даты и предметов)
 * @param {number} settingsId - ID настроек экзамена
 * @param {string|null} examDate - Новая дата экзамена в формате 'YYYY-MM-DD' (опционально)
 * @param {Array<Object>|null} subjects - Обновленный список предметов [{subject_id: string, target_score?: number}] (опционально)
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data, error }
 */
export const updateExamSettings = async (settingsId, examDate, subjects, userId) => {
    try {
        // Формируем тело запроса
        const requestBody = {};

        // Добавляем дату, если она передана
        if (examDate !== null && examDate !== undefined) {
            requestBody.exam_date = examDate;
        }

        // Добавляем предметы, если они переданы
        if (subjects !== null && subjects !== undefined) {
            requestBody.subjects = subjects;
        }

        console.log('📤 Updating exam settings:', {
            settingsId,
            requestBody
        });

        const response = await fetch(
            `${API_BASE_URL}/exam/settings/${settingsId}?user_id=${userId}`,
            {
                method: 'PATCH',
                headers: await getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Exam settings updated:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error updating exam settings:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Удаление настроек экзамена
 * @param {number} settingsId - ID настроек экзамена
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, error }
 */
export const deleteExamSettings = async (settingsId, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/settings/${settingsId}?user_id=${userId}`,
            {
                method: 'DELETE',
                headers: await getAuthHeaders(),
                credentials: 'include'
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        console.log('✅ Exam settings deleted successfully');
        return {
            success: true
        };

    } catch (error) {
        console.error('❌ Error deleting exam settings:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// SUBJECTS - Управление предметами
// =====================================================

/**
 * Добавление предметов к существующим настройкам экзамена
 * @param {number} settingsId - ID настроек экзамена
 * @param {Array<Object>} subjects - Список предметов [{subject_id: string, target_score?: number}]
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: Array<Subject>, error }
 *
 * @example
 * const result = await addSubjects(1, [
 *   { subject_id: 'физика', target_score: 80 },
 *   { subject_id: 'химия', target_score: 75 }
 * ], 'user123');
 */
export const addSubjects = async (settingsId, subjects, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/settings/${settingsId}/subjects?user_id=${userId}`,
            {
                method: 'POST',
                headers: await getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(subjects)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Subjects added successfully:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error adding subjects:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Обновление предмета (целевой балл или текущий балл)
 * @param {number} subjectId - ID предмета
 * @param {Object} updateData - Данные для обновления {target_score?: number, current_score?: number}
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data, error }
 *
 * @example
 * const result = await updateSubject(5, { target_score: 95 }, 'user123');
 */
export const updateSubject = async (subjectId, updateData, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/subjects/${subjectId}?user_id=${userId}`,
            {
                method: 'PATCH',
                headers: await getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(updateData)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Subject updated:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error updating subject:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение списка всех доступных предметов для ОГЭ и ЕГЭ
 * @returns {Promise<Object>} Результат { success, data: {oge_subjects, ege_subjects}, error }
 *
 * @example
 * const result = await getAvailableSubjects();
 * console.log('ОГЭ предметы:', result.data.oge_subjects);
 * console.log('ЕГЭ предметы:', result.data.ege_subjects);
 */
export const getAvailableSubjects = async () => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/subjects/available`,
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

        console.log('✅ Available subjects retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting available subjects:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// TASKS - Получение заданий
// =====================================================

/**
 * Получение случайного задания
 * @param {string} subjectId - ID предмета (математика, русский язык и т.д.)
 * @param {string} examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {string|null} difficulty - Сложность: 'easy', 'medium', 'hard' (опционально)
 * @param {boolean} excludeSolved - Исключить уже решенные задания (по умолчанию true)
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: Task, error }
 *
 * @example
 * const result = await getRandomTask('математика', 'ЕГЭ', 'medium', true, 'user123');
 * if (result.success) {
 *   console.log('Задание:', result.data.question_text);
 * }
 */
export const getRandomTask = async (
    subjectId,
    examType,
    difficulty = null,
    excludeSolved = true,
    userId
) => {

    try {
        let url = `${API_BASE_URL}/exam/task?subject_id=${subjectId}&exam_type=${examType}&exclude_solved=${excludeSolved}&user_id=${userId}`;

        if (difficulty) {
            url += `&difficulty=${difficulty}`;
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

        console.log('✅ Random task retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting random task:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение пакета заданий (до 20 штук за раз)
 * @param {string} subjectId - ID предмета
 * @param {string} examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {number} count - Количество заданий (от 1 до 20)
 * @param {string|null} difficulty - Сложность (опционально)
 * @param {boolean} excludeSolved - Исключить уже решенные
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: {tasks, total_available, has_more}, error }
 *
 * @example
 * const result = await getBulkTasks('физика', 'ЕГЭ', 10, 'hard', true, 'user123');
 * console.log('Получено заданий:', result.data.tasks.length);
 * console.log('Всего доступно:', result.data.total_available);
 */
export const getBulkTasks = async (
    subjectId,
    examType,
    count = 5,
    difficulty = null,
    excludeSolved = true,
    userId
) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/tasks/bulk?user_id=${userId}`,
            {
                method: 'POST',
                headers: await getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    subject_id: subjectId,
                    exam_type: examType,
                    count: count,
                    difficulty: difficulty,
                    exclude_solved: excludeSolved
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Bulk tasks retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting bulk tasks:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// ATTEMPTS - Отправка ответов
// =====================================================

/**
 * Отправка ответа на задание
 * Система автоматически проверит ответ и обновит статистику
 * @param {number} taskId - ID задания
 * @param {string} userAnswer - Ответ пользователя
 * @param {number|null} timeSpent - Время на задание в секундах (опционально)
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: {is_correct, points_earned, task}, error }
 *
 * @example
 * const result = await submitAnswer(42, '35', 120, 'user123');
 * if (result.success) {
 *   if (result.data.is_correct) {
 *     console.log('Правильно! +' + result.data.points_earned + ' баллов');
 *   } else {
 *     console.log('Неправильно. Правильный ответ:', result.data.task.correct_answer);
 *   }
 * }
 */
export const submitAnswer = async (taskId, userAnswer, timeSpent = null, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/answer?user_id=${userId}`,
            {
                method: 'POST',
                headers: await getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    task_id: taskId,
                    user_answer: userAnswer,
                    time_spent: timeSpent
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Answer submitted:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error submitting answer:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// STATISTICS - Статистика пользователя
// =====================================================

/**
 * Получение общей статистики пользователя
 * Включает: решенные задания, точность, серия дней, статистика по предметам
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: ExamStats, error }
 *
 * @example
 * const result = await getUserStats('user123');
 * if (result.success) {
 *   console.log('Решено заданий:', result.data.tasks_solved);
 *   console.log('Точность:', result.data.accuracy_percentage + '%');
 *   console.log('Серия дней:', result.data.streak_days);
 * }
 */
export const getUserStats = async (userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/stats?user_id=${userId}`,
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

        console.log('✅ User stats retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting user stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение статистики по конкретному предмету
 * Включает: попытки, точность, среднее время, точность по сложности
 * @param {string} subjectId - ID предмета
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: SubjectStats, error }
 *
 * @example
 * const result = await getSubjectStats('математика', 'user123');
 * if (result.success) {
 *   console.log('Точность:', result.data.accuracy + '%');
 *   console.log('Легкие задания:', result.data.easy_accuracy + '%');
 * }
 */
export const getSubjectStats = async (subjectId, userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/stats/subject/${subjectId}?user_id=${userId}`,
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

        console.log('✅ Subject stats retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting subject stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// PROGRESS - Прогресс и календарь
// =====================================================

/**
 * Получение прогресса за сегодня
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object>} Результат { success, data: DailyProgress, error }
 *
 * @example
 * const result = await getTodayProgress('user123');
 * if (result.success) {
 *   console.log('Выполнено заданий:', result.data.tasks_completed);
 *   console.log('Прогресс:', result.data.completion_percentage + '%');
 * }
 */
export const getTodayProgress = async (userId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/progress/today?user_id=${userId}`,
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

        console.log('✅ Today progress retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting today progress:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Получение календаря прогресса за период
 * @param {string} userId - ID пользователя
 * @param {number} days - Количество дней назад (от 1 до 90, по умолчанию 7)
 * @returns {Promise<Object>} Результат { success, data: ProgressCalendar, error }
 *
 * @example
 * const result = await getProgressCalendar('user123', 30);
 * if (result.success) {
 *   console.log('Выполнено дней:', result.data.completed_days);
 *   console.log('Процент выполнения:', result.data.completion_rate + '%');
 *   result.data.days.forEach(day => {
 *     console.log(day.date, ':', day.tasks_completed, 'заданий');
 *   });
 * }
 */
export const getProgressCalendar = async (userId, days = 7) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/exam/progress/calendar?user_id=${userId}&days=${days}`,
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

        console.log('✅ Progress calendar retrieved:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error getting progress calendar:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// =====================================================
// UTILITY FUNCTIONS - Вспомогательные функции
// =====================================================

/**
 * Получение текста сложности задания на русском
 * @param {string} difficulty - Уровень сложности ('easy', 'medium', 'hard')
 * @returns {string} Текст на русском
 */
export const getDifficultyText = (difficulty) => {
    const texts = {
        easy: 'Легко',
        medium: 'Средне',
        hard: 'Сложно'
    };
    return texts[difficulty] || difficulty;
};

/**
 * Получение цвета для уровня сложности
 * @param {string} difficulty - Уровень сложности
 * @returns {string} CSS цвет
 */
export const getDifficultyColor = (difficulty) => {
    const colors = {
        easy: '#43ff65',
        medium: '#22c55e',
        hard: '#f59e0b'
    };
    return colors[difficulty] || '#578BF6';
};

/**
 * Получение максимального балла для предмета
 * @param {string} subjectId - ID предмета
 * @param {string} examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @returns {number} Максимальный балл
 */
export const getMaxScore = (subjectId, examType) => {
    return getSubjectMaxScore(subjectId, examType);
};

/**
 * Форматирование даты для отображения
 * @param {string} dateStr - Дата в формате ISO
 * @returns {string} Форматированная дата
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Вычисление количества дней до экзамена
 * @param {string} examDate - Дата экзамена в формате 'YYYY-MM-DD'
 * @returns {number} Количество дней
 */
export const getDaysUntilExam = (examDate) => {
    if (!examDate) return 0;
    const exam = new Date(examDate);
    const today = new Date();
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// ========================================
// ЭКСПОРТ ВСЕХ ФУНКЦИЙ
// ========================================

export default {
    // Settings
    createExamSettings,
    getExamSettings,
    getExamSettingsById,
    updateExamSettings,
    deleteExamSettings,

    // Subjects
    addSubjects,
    updateSubject,
    getAvailableSubjects,

    // Tasks
    getRandomTask,
    getBulkTasks,

    // Attempts
    submitAnswer,

    // Statistics
    getUserStats,
    getSubjectStats,

    // Progress
    getTodayProgress,
    getProgressCalendar,

    // Utility
    getDifficultyText,
    getDifficultyColor,
    getMaxScore,
    formatDate,
    getDaysUntilExam
};