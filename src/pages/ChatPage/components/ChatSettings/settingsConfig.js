// src/pages/ChatPage/components/ChatSettings/settingsConfig.js

/**
 * Конфигурация настроек для разных типов чатов
 * Каждый тип чата имеет общие настройки + специфичные
 */

// =====================================================
// ОБЩИЕ НАСТРОЙКИ ДЛЯ ВСЕХ ТИПОВ ЧАТОВ
// =====================================================
export const GENERAL_SETTINGS = [
    {
        id: 'temperature',
        label: 'Креативность',
        description: 'Чем выше значение, тем более креативные ответы',
        type: 'slider',
        min: 0.1,
        max: 1.2,
        step: 0.1,
        defaultValue: 0.7,
        format: (value) => value.toFixed(1)
    },
    {
        id: 'maxLength',
        label: 'Длина ответа',
        description: 'Предпочтительная длина ответов',
        type: 'select',
        defaultValue: 'medium',
        options: [
            { value: 'short', label: 'Краткий' },
            { value: 'medium', label: 'Средний' },
            { value: 'detailed', label: 'Подробный' }
        ]
    },
    {
        id: 'language',
        label: 'Язык общения',
        description: 'Основной язык ответов',
        type: 'select',
        defaultValue: 'ru',
        options: [
            { value: 'ru', label: '🇷🇺 Русский' },
            { value: 'en', label: '🇬🇧 English' }
        ]
    }
];

// =====================================================
// СПЕЦИФИЧНЫЕ НАСТРОЙКИ ДЛЯ КАЖДОГО ТИПА ЧАТА
// =====================================================

export const SPECIFIC_SETTINGS = {
    // ===== ОБЩИЙ ЧАТ =====
    general: [
        {
            id: 'responseStyle',
            label: 'Стиль ответов',
            description: 'Как отвечать на вопросы',
            type: 'select',
            defaultValue: 'friendly',
            options: [
                { value: 'friendly', label: 'Дружелюбный' },
                { value: 'formal', label: 'Формальный' },
                { value: 'casual', label: 'Неформальный' }
            ]
        }
    ],

    // ===== СОЗДАНИЕ ИЗОБРАЖЕНИЙ =====
    image: [
        {
            id: 'imageStyle',
            label: 'Стиль изображения',
            description: 'Предпочитаемый художественный стиль',
            type: 'select',
            defaultValue: 'realistic',
            options: [
                { value: 'realistic', label: 'Реалистичный' },
                { value: 'artistic', label: 'Художественный' },
                { value: 'cartoon', label: 'Мультяшный' },
                { value: 'anime', label: 'Аниме' },
                { value: 'abstract', label: 'Абстрактный' }
            ]
        },
        {
            id: 'aspectRatio',
            label: 'Соотношение сторон',
            description: 'Формат создаваемого изображения',
            type: 'select',
            defaultValue: 'square',
            options: [
                { value: 'square', label: 'Квадрат (1:1)' },
                { value: 'portrait', label: 'Портрет (3:4)' },
                { value: 'landscape', label: 'Ландшафт (16:9)' }
            ]
        },
        {
            id: 'quality',
            label: 'Качество',
            description: 'Качество генерируемого изображения',
            type: 'select',
            defaultValue: 'standard',
            options: [
                { value: 'standard', label: 'Стандартное' },
                { value: 'hd', label: 'HD (высокое)' }
            ]
        },
        {
            id: 'detailLevel',
            label: 'Детализация',
            description: 'Уровень детализации промпта',
            type: 'select',
            defaultValue: 'medium',
            options: [
                { value: 'simple', label: 'Простая' },
                { value: 'medium', label: 'Средняя' },
                { value: 'detailed', label: 'Подробная' }
            ]
        }
    ],

    // ===== КОДИНГ =====
    coding: [
        {
            id: 'withComments',
            label: 'Комментарии в коде',
            description: 'Добавлять подробные комментарии к коду',
            type: 'toggle',
            defaultValue: true
        },
        {
            id: 'codeStyle',
            label: 'Стиль кода',
            description: 'Предпочитаемый стиль написания кода',
            type: 'select',
            defaultValue: 'clean',
            options: [
                { value: 'clean', label: 'Clean Code (чистый)' },
                { value: 'minimal', label: 'Минималистичный' },
                { value: 'verbose', label: 'Подробный' }
            ]
        },
        {
            id: 'defaultLanguage',
            label: 'Язык программирования',
            description: 'Язык по умолчанию для примеров',
            type: 'select',
            defaultValue: 'javascript',
            options: [
                { value: 'javascript', label: 'JavaScript' },
                { value: 'python', label: 'Python' },
                { value: 'java', label: 'Java' },
                { value: 'cpp', label: 'C++' },
                { value: 'csharp', label: 'C#' },
                { value: 'go', label: 'Go' },
                { value: 'rust', label: 'Rust' }
            ]
        },
        {
            id: 'explainSteps',
            label: 'Объяснять шаги',
            description: 'Пошагово объяснять решение',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== БРЕЙНШТОРМ =====
    brainstorm: [
        {
            id: 'ideasCount',
            label: 'Количество идей',
            description: 'Сколько идей генерировать за раз',
            type: 'select',
            defaultValue: '5-7',
            options: [
                { value: '3-5', label: '3-5 идей' },
                { value: '5-7', label: '5-7 идей' },
                { value: '8-10', label: '8-10 идей' }
            ]
        },
        {
            id: 'creativityLevel',
            label: 'Уровень креативности',
            description: 'Насколько смелые идеи предлагать',
            type: 'select',
            defaultValue: 'balanced',
            options: [
                { value: 'practical', label: 'Практичные' },
                { value: 'balanced', label: 'Сбалансированные' },
                { value: 'wild', label: 'Смелые и необычные' }
            ]
        },
        {
            id: 'includeExamples',
            label: 'Примеры к идеям',
            description: 'Добавлять примеры к каждой идее',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== ОТМАЗКИ =====
    excuse: [
        {
            id: 'excuseStyle',
            label: 'Стиль отмазки',
            description: 'Тон и подача оправдания',
            type: 'select',
            defaultValue: 'polite',
            options: [
                { value: 'formal', label: 'Официальный' },
                { value: 'polite', label: 'Вежливый' },
                { value: 'casual', label: 'Неформальный' },
                { value: 'creative', label: 'Креативный' }
            ]
        },
        {
            id: 'variantsCount',
            label: 'Количество вариантов',
            description: 'Сколько вариантов отмазок предложить',
            type: 'select',
            defaultValue: '3',
            options: [
                { value: '2', label: '2 варианта' },
                { value: '3', label: '3 варианта' },
                { value: '4', label: '4 варианта' }
            ]
        }
    ],

    // ===== ОБЪЯСНИТЬ ТЕМУ =====
    explain_topic: [
        {
            id: 'explanationDepth',
            label: 'Глубина объяснения',
            description: 'Насколько детально объяснять',
            type: 'select',
            defaultValue: 'medium',
            options: [
                { value: 'simple', label: 'Простое (основы)' },
                { value: 'medium', label: 'Среднее (стандарт)' },
                { value: 'deep', label: 'Глубокое (детали)' }
            ]
        },
        {
            id: 'useAnalogies',
            label: 'Использовать аналогии',
            description: 'Объяснять через примеры из жизни',
            type: 'toggle',
            defaultValue: true
        },
        {
            id: 'checkUnderstanding',
            label: 'Проверять понимание',
            description: 'Задавать контрольные вопросы',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== ПОДГОТОВКА К ЭКЗАМЕНАМ =====
    exam_prep: [
        {
            id: 'subject',
            label: 'Предмет',
            description: 'Учебный предмет для подготовки',
            type: 'select',
            defaultValue: 'math',
            options: [
                { value: 'math', label: 'Математика' },
                { value: 'physics', label: 'Физика' },
                { value: 'chemistry', label: 'Химия' },
                { value: 'biology', label: 'Биология' },
                { value: 'history', label: 'История' },
                { value: 'literature', label: 'Литература' },
                { value: 'russian', label: 'Русский язык' },
                { value: 'english', label: 'Английский язык' }
            ]
        },
        {
            id: 'difficulty',
            label: 'Уровень сложности',
            description: 'Сложность заданий и вопросов',
            type: 'select',
            defaultValue: 'medium',
            options: [
                { value: 'basic', label: 'Базовый' },
                { value: 'medium', label: 'Средний' },
                { value: 'high', label: 'Высокий' }
            ]
        },
        {
            id: 'includePractice',
            label: 'Тренировочные задания',
            description: 'Добавлять практические задания',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== КОНСПЕКТЫ =====
    make_notes: [
        {
            id: 'format',
            label: 'Формат конспекта',
            description: 'Как структурировать информацию',
            type: 'select',
            defaultValue: 'bullets',
            options: [
                { value: 'bullets', label: 'Маркированный список' },
                { value: 'paragraphs', label: 'Параграфы' },
                { value: 'outline', label: 'План-схема' },
            ]
        },
        {
            id: 'detailLevel',
            label: 'Уровень детализации',
            description: 'Насколько подробный конспект',
            type: 'select',
            defaultValue: 'medium',
            options: [
                { value: 'brief', label: 'Краткий (тезисы)' },
                { value: 'medium', label: 'Средний (основное)' },
                { value: 'detailed', label: 'Подробный (всё)' }
            ]
        },
        {
            id: 'highlightKey',
            label: 'Выделять ключевое',
            description: 'Отмечать важные моменты',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== РЕШЕНИЕ ПО ФОТО =====
    photo_solve: [
        {
            id: 'solutionStyle',
            label: 'Стиль решения',
            description: 'Как показывать решение',
            type: 'select',
            defaultValue: 'teaching',
            options: [
                { value: 'hints', label: 'Только подсказки' },
                { value: 'teaching', label: 'Обучающий (пошагово)' },
                { value: 'detailed', label: 'Детальное решение' }
            ]
        },
        {
            id: 'showSteps',
            label: 'Показывать шаги',
            description: 'Разбивать решение на этапы',
            type: 'toggle',
            defaultValue: true
        },
        {
            id: 'explainLogic',
            label: 'Объяснять логику',
            description: 'Пояснять почему именно так',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== НАПИСАНИЕ РАБОТ =====
    write_work: [
        {
            id: 'workType',
            label: 'Тип работы',
            description: 'Какую работу создаем',
            type: 'select',
            defaultValue: 'essay',
            options: [
                { value: 'essay', label: 'Сочинение' },
                { value: 'report', label: 'Доклад' },
                { value: 'abstract', label: 'Реферат' },
                { value: 'article', label: 'Статья' }
            ]
        },
        {
            id: 'tone',
            label: 'Тон текста',
            description: 'Стиль изложения материала',
            type: 'select',
            defaultValue: 'neutral',
            options: [
                { value: 'formal', label: 'Официальный' },
                { value: 'neutral', label: 'Нейтральный' },
                { value: 'casual', label: 'Разговорный' }
            ]
        },
        {
            id: 'helpLevel',
            label: 'Уровень помощи',
            description: 'Насколько детально помогать',
            type: 'select',
            defaultValue: 'guide',
            options: [
                { value: 'ideas', label: 'Только идеи' },
                { value: 'guide', label: 'Руководство' },
                { value: 'draft', label: 'Черновик' }
            ]
        }
    ],

    // ===== АНАЛИЗ ОШИБОК =====
    analyze_mistake: [
        {
            id: 'analysisDepth',
            label: 'Глубина анализа',
            description: 'Насколько детально разбирать',
            type: 'select',
            defaultValue: 'medium',
            options: [
                { value: 'quick', label: 'Быстрый обзор' },
                { value: 'medium', label: 'Стандартный' },
                { value: 'thorough', label: 'Тщательный' }
            ]
        },
        {
            id: 'provideSimilar',
            label: 'Похожие задания',
            description: 'Предлагать задания для тренировки',
            type: 'toggle',
            defaultValue: true
        },
        {
            id: 'explainConcepts',
            label: 'Объяснять концепции',
            description: 'Разбирать теорию за ошибкой',
            type: 'toggle',
            defaultValue: true
        }
    ],

    // ===== ПОДДЕРЖКА НАСТРОЕНИЯ =====
    mood_support: [
        {
            id: 'supportStyle',
            label: 'Стиль поддержки',
            description: 'Как оказывать поддержку',
            type: 'select',
            defaultValue: 'empathetic',
            options: [
                { value: 'listening', label: 'Слушающий' },
                { value: 'empathetic', label: 'Эмпатичный' },
                { value: 'practical', label: 'Практичный' },
                { value: 'motivating', label: 'Мотивирующий' }
            ]
        },
        {
            id: 'offerTechniques',
            label: 'Предлагать техники',
            description: 'Давать техники релаксации',
            type: 'toggle',
            defaultValue: true
        },
        {
            id: 'askQuestions',
            label: 'Задавать вопросы',
            description: 'Помогать осознать проблему',
            type: 'toggle',
            defaultValue: true
        }
    ]
};

// =====================================================
// ДЕФОЛТНЫЕ ЗНАЧЕНИЯ ДЛЯ БЫСТРОГО ДОСТУПА
// =====================================================

/**
 * Получить настройки по умолчанию для конкретного типа чата
 * @param {string} chatType - Тип чата
 * @returns {object} Объект с настройками по умолчанию
 */
export const getDefaultSettings = (chatType) => {
    const defaults = {};

    // Добавляем общие настройки
    GENERAL_SETTINGS.forEach(setting => {
        defaults[setting.id] = setting.defaultValue;
    });

    // Добавляем специфичные настройки для данного типа
    const specificSettings = SPECIFIC_SETTINGS[chatType];
    if (specificSettings) {
        specificSettings.forEach(setting => {
            defaults[setting.id] = setting.defaultValue;
        });
    }

    return defaults;
};

/**
 * Получить все настройки для конкретного типа чата
 * @param {string} chatType - Тип чата
 * @returns {object} Объект с массивами общих и специфичных настроек
 */
export const getSettingsForChatType = (chatType) => {
    return {
        general: GENERAL_SETTINGS,
        specific: SPECIFIC_SETTINGS[chatType] || []
    };
};