// src/config/egeConfig.js
import {SUBJECT_IDS, SUBJECT_NAMES} from "./subjectMapping.js";

/**
 * Конфигурация для режима подготовки к ЕГЭ
 * Содержит все специфичные данные и настройки для ЕГЭ
 */

export const EGE_CONFIG = {
    // Основные параметры
    examType: 'ЕГЭ',
    examName: 'Единый государственный экзамен',
    targetGrades: [10, 11], // Классы для которых доступен ЕГЭ

    // Предметы ЕГЭ с максимальными баллами
    subjects: [
        {
            id: SUBJECT_IDS.RUSSIAN,
            name: SUBJECT_NAMES[SUBJECT_IDS.RUSSIAN],
            icon: '📝',
            color: '#ef4444',
            required: true
        },
        {
            id: SUBJECT_IDS.MATHEMATICS_PROFILE,
            name: SUBJECT_NAMES[SUBJECT_IDS.MATHEMATICS_PROFILE],
            icon: '🔢',
            color: '#3b82f6',
            category: 'math'
        },
        {
            id: SUBJECT_IDS.MATHEMATICS_BASE,
            name: SUBJECT_NAMES[SUBJECT_IDS.MATHEMATICS_BASE],
            icon: '🔢',
            color: '#60a5fa',
            category: 'math'
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
            id: SUBJECT_IDS.ENGLISH,
            name: SUBJECT_NAMES[SUBJECT_IDS.ENGLISH],
            icon: '🇬🇧',
            color: '#6366f1'
        },
        {
            id: SUBJECT_IDS.GERMAN,
            name: SUBJECT_NAMES[SUBJECT_IDS.GERMAN],
            icon: '🇩🇪',
            color: '#f97316'
        },
        {
            id: SUBJECT_IDS.FRENCH,
            name: SUBJECT_NAMES[SUBJECT_IDS.FRENCH],
            icon: '🇫🇷',
            color: '#0ea5e9'
        },
        {
            id: SUBJECT_IDS.SPANISH,
            name: SUBJECT_NAMES[SUBJECT_IDS.SPANISH],
            icon: '🇪🇸',
            color: '#eab308'
        },
        {
            id: SUBJECT_IDS.CHINESE,
            name: SUBJECT_NAMES[SUBJECT_IDS.CHINESE],
            icon: '🇨🇳',
            color: '#dc2626'
        }
    ],

    // Система оценивания (перевод первичных баллов в тестовые)
    grading: {
        excellent: { min: 80, label: 'Отлично', color: '#43ff65' },
        good: { min: 60, label: 'Хорошо', color: '#3b82f6' },
        satisfactory: { min: 40, label: 'Удовлетворительно', color: '#f59e0b' },
        unsatisfactory: { min: 0, label: 'Неудовлетворительно', color: '#ef4444' }
    },

    // Рекомендуемые баллы для поступления
    recommendedScores: {
        budget: {
            label: 'Бюджет (средний вуз)',
            minAverage: 65,
            description: 'Средний проходной балл на бюджет'
        },
        topUniversity: {
            label: 'Топовый вуз',
            minAverage: 85,
            description: 'МГУ, МФТИ, ВШЭ и др.'
        },
        scholarship: {
            label: 'С повышенной стипендией',
            minAverage: 90,
            description: 'Для получения повышенной стипендии'
        }
    },

    // Сроки экзаменов
    examPeriod: {
        start: '2026-05-25', // Примерная дата начала
        end: '2026-07-01',   // Примерная дата окончания
        description: 'Основной период сдачи ЕГЭ'
    },

    // Особенности ЕГЭ
    features: {
        minSubjects: 2, // Минимум: Русский + Математика
        maxSubjects: null, // Без ограничений
        hasOralPart: ['english', 'german', 'french', 'spanish', 'chinese'], // Устная часть
        allowsCalculator: ['physics', 'chemistry', 'geography'], // Где разрешен калькулятор
        duration: {
            'russian': 210,                // минуты
            'mathematics_base': 180,
            'mathematics_profile': 235,
            'physics': 235,
            'chemistry': 210,
            'biology': 210,
            'informatics': 235,
            'history': 210,
            'social_studies': 210,
            'geography': 180,
            'literature': 235,
            'english': 190,
            'german': 190,
            'french': 190,
            'spanish': 190,
            'chinese': 190
        }
    },

    // Направления подготовки по предметам
    careerPaths: {
        'physics': ['Инженерия', 'Физика', 'Ядерная энергетика', 'Авиация'],
        'informatics': ['IT', 'Программирование', 'Data Science', 'Кибербезопасность'],
        'chemistry': ['Медицина', 'Фармацевтика', 'Химия', 'Биотехнологии'],
        'biology': ['Медицина', 'Биология', 'Ветеринария', 'Экология'],
        'history': ['История', 'Международные отношения', 'Юриспруденция'],
        'social_studies': ['Экономика', 'Менеджмент', 'Психология', 'Социология'],
        'literature': ['Филология', 'Журналистика', 'Реклама', 'PR'],
        'english': ['Лингвистика', 'Перевод', 'Международные отношения']
    },

    // Советы для подготовки
    preparationTips: [
        '📚 Начни подготовку минимум за год до экзамена',
        '🎯 Определись с вузом и направлением заранее',
        '📊 Изучи проходные баллы в выбранные вузы',
        '📝 Решай тренировочные варианты каждую неделю',
        '⏰ Составь график подготовки по всем предметам',
        '👨‍🏫 Найди опытного репетитора по профильным предметам',
        '🔄 Повторяй теорию и практику системно',
        '🎤 Готовься к устной части по иностранному языку отдельно'
    ],

    // API endpoints специфичные для ЕГЭ
    apiEndpoints: {
        getSubjects: '/api/exam/ege/subjects',
        getTasks: '/api/exam/ege/tasks',
        getStats: '/api/exam/ege/stats'
    }
};

/**
 * Получить конфигурацию предмета по ID
 */
export const getEgeSubject = (subjectId) => {
    return EGE_CONFIG.subjects[subjectId] || null;
};

/**
 * Получить все доступные предметы ЕГЭ
 */
export const getEgeSubjects = () => {
    return Object.entries(EGE_CONFIG.subjects).map(([id, data]) => ({
        id,
        ...data
    }));
};

/**
 * Проверить доступность ЕГЭ для класса
 */
export const isEgeAvailableForGrade = (grade) => {
    return EGE_CONFIG.targetGrades.includes(grade);
};

/**
 * Получить рекомендуемые направления по предметам
 */
export const getCareerPathsForSubjects = (subjectIds) => {
    const paths = new Set();

    subjectIds.forEach(subjectId => {
        const subjectPaths = EGE_CONFIG.careerPaths[subjectId];
        if (subjectPaths) {
            subjectPaths.forEach(path => paths.add(path));
        }
    });

    return Array.from(paths);
};

export default EGE_CONFIG;