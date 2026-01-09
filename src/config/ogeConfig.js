// src/config/ogeConfig.js
import {SUBJECT_IDS, SUBJECT_NAMES} from "./subjectMapping.js";

/**
 * Конфигурация для режима подготовки к ОГЭ
 * Содержит все специфичные данные и настройки для ОГЭ
 */

export const OGE_CONFIG = {
    // Основные параметры
    examType: 'ОГЭ',
    examName: 'Основной государственный экзамен',
    targetGrades: [7, 8, 9], // Классы для которых доступен ОГЭ

    // Предметы ОГЭ с максимальными баллами
    subjects: [
        {
            id: SUBJECT_IDS.RUSSIAN,
            name: SUBJECT_NAMES[SUBJECT_IDS.RUSSIAN],
            icon: '📝',
            color: '#ef4444'
        },
        {
            id: SUBJECT_IDS.MATHEMATICS,
            name: SUBJECT_NAMES[SUBJECT_IDS.MATHEMATICS],
            icon: '🔢',
            color: '#3b82f6'
        },
        {
            id: SUBJECT_IDS.PHYSICS,
            name: SUBJECT_NAMES[SUBJECT_IDS.PHYSICS],
            icon: '⚡',
            color: '#8b5cf6'
        },
        {
            id: SUBJECT_IDS.CHEMISTRY,
            name: SUBJECT_NAMES[SUBJECT_IDS.CHEMISTRY],
            icon: '🧪',
            color: '#10b981'
        },
        {
            id: SUBJECT_IDS.BIOLOGY,
            name: SUBJECT_NAMES[SUBJECT_IDS.BIOLOGY],
            icon: '🌿',
            color: '#22c55e'
        },
        {
            id: SUBJECT_IDS.INFORMATICS,
            name: SUBJECT_NAMES[SUBJECT_IDS.INFORMATICS],
            icon: '💻',
            color: '#06b6d4'
        },
        {
            id: SUBJECT_IDS.HISTORY,
            name: SUBJECT_NAMES[SUBJECT_IDS.HISTORY],
            icon: '🏛️',
            color: '#f59e0b'
        },
        {
            id: SUBJECT_IDS.SOCIAL_STUDIES,
            name: SUBJECT_NAMES[SUBJECT_IDS.SOCIAL_STUDIES],
            icon: '👥',
            color: '#ec4899'
        },
        {
            id: SUBJECT_IDS.GEOGRAPHY,
            name: SUBJECT_NAMES[SUBJECT_IDS.GEOGRAPHY],
            icon: '🌍',
            color: '#14b8a6'
        },
        {
            id: SUBJECT_IDS.LITERATURE,
            name: SUBJECT_NAMES[SUBJECT_IDS.LITERATURE],
            icon: '📚',
            color: '#a855f7'
        }
    ],

    // Система оценивания
    grading: {
        excellent: { min: 80, label: 'Отлично', color: '#43ff65' },
        good: { min: 60, label: 'Хорошо', color: '#3b82f6' },
        satisfactory: { min: 40, label: 'Удовлетворительно', color: '#f59e0b' },
        unsatisfactory: { min: 0, label: 'Неудовлетворительно', color: '#ef4444' }
    },

    // Рекомендуемые цели
    recommendedScores: {
        forCollege: {
            label: 'Для поступления в колледж',
            minTotal: 12, // Минимальная сумма баллов
            description: 'Базовый уровень для поступления'
        },
        forLyceum: {
            label: 'Для поступления в лицей',
            minTotal: 18,
            description: 'Повышенный уровень'
        },
        forTopSchool: {
            label: 'Для поступления в профильный класс',
            minTotal: 25,
            description: 'Высокий уровень'
        }
    },

    // Сроки экзаменов
    examPeriod: {
        start: '2026-05-20', // Примерная дата начала
        end: '2026-06-15',   // Примерная дата окончания
        description: 'Основной период сдачи ОГЭ'
    },

    // Особенности ОГЭ
    features: {
        minSubjects: 4, // Минимальное количество экзаменов
        maxSubjects: 4, // Максимальное количество экзаменов (2 обязательных + 2 по выбору)
        hasOralPart: ['russian', 'foreign_language'], // Предметы с устной частью
        allowsCalculator: ['physics', 'chemistry', 'geography'], // Где разрешен калькулятор
        duration: {
            'russian': 235,       // минуты
            'mathematics': 235,
            'physics': 180,
            'chemistry': 140,
            'biology': 150,
            'informatics': 150,
            'history': 180,
            'social_studies': 180,
            'geography': 150,
            'literature': 235,
            'foreign_language': 135
        }
    },

    // Советы для подготовки
    preparationTips: [
        '📚 Начни подготовку минимум за 6 месяцев до экзамена',
        '🎯 Сосредоточься на обязательных предметах: Русский и Математика',
        '📝 Решай пробные варианты каждую неделю',
        '⏰ Распредели время между всеми предметами равномерно',
        '👥 Занимайся с репетитором по сложным темам',
        '🔄 Повторяй пройденный материал регулярно'
    ],

    // API endpoints специфичные для ОГЭ
    apiEndpoints: {
        getSubjects: '/api/exam/oge/subjects',
        getTasks: '/api/exam/oge/tasks',
        getStats: '/api/exam/oge/stats'
    }
};

/**
 * Получить конфигурацию предмета по ID
 */
export const getOgeSubject = (subjectId) => {
    return OGE_CONFIG.subjects[subjectId] || null;
};

/**
 * Получить все доступные предметы ОГЭ
 */
export const getOgeSubjects = () => {
    return Object.entries(OGE_CONFIG.subjects).map(([id, data]) => ({
        id,
        ...data
    }));
};

/**
 * Проверить доступность ОГЭ для класса
 */
export const isOgeAvailableForGrade = (grade) => {
    return OGE_CONFIG.targetGrades.includes(grade);
};

export default OGE_CONFIG;