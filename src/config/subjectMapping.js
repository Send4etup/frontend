// src/config/subjectMapping.js
/**
 * Единая система идентификации предметов
 * Все subject_id только на английском для совместимости с БД
 */

// ============================================
// СТАНДАРТИЗИРОВАННЫЕ ID ПРЕДМЕТОВ
// ============================================

export const SUBJECT_IDS = {
    // ОГЭ и ЕГЭ
    RUSSIAN: 'russian',
    MATHEMATICS: 'mathematics',
    PHYSICS: 'physics',
    CHEMISTRY: 'chemistry',
    BIOLOGY: 'biology',
    HISTORY: 'history',
    SOCIAL_STUDIES: 'social_studies',
    GEOGRAPHY: 'geography',

    // Только ОГЭ
    INFORMATICS: 'informatics',
    LITERATURE: 'literature',

    // Только ЕГЭ
    MATHEMATICS_PROFILE: 'mathematics_profile',
    MATHEMATICS_BASE: 'mathematics_base',
    ENGLISH: 'english',
    GERMAN: 'german',
    FRENCH: 'french',
    SPANISH: 'spanish',
    CHINESE: 'chinese'
};

// ============================================
// МАППИНГ ID → НАЗВАНИЕ (РУССКИЙ)
// ============================================

export const SUBJECT_NAMES = {
    [SUBJECT_IDS.RUSSIAN]: 'русский язык',
    [SUBJECT_IDS.MATHEMATICS]: 'математика',
    [SUBJECT_IDS.MATHEMATICS_PROFILE]: 'математика (профильная)',
    [SUBJECT_IDS.MATHEMATICS_BASE]: 'математика (базовая)',
    [SUBJECT_IDS.PHYSICS]: 'физика',
    [SUBJECT_IDS.CHEMISTRY]: 'химия',
    [SUBJECT_IDS.BIOLOGY]: 'биология',
    [SUBJECT_IDS.INFORMATICS]: 'информатика',
    [SUBJECT_IDS.HISTORY]: 'история',
    [SUBJECT_IDS.SOCIAL_STUDIES]: 'обществознание',
    [SUBJECT_IDS.GEOGRAPHY]: 'география',
    [SUBJECT_IDS.LITERATURE]: 'литература',
    [SUBJECT_IDS.ENGLISH]: 'английский язык',
    [SUBJECT_IDS.GERMAN]: 'немецкий язык',
    [SUBJECT_IDS.FRENCH]: 'французский язык',
    [SUBJECT_IDS.SPANISH]: 'испанский язык',
    [SUBJECT_IDS.CHINESE]: 'китайский язык'
};


// ============================================
// ОБРАТНЫЙ МАППИНГ: НАЗВАНИЕ → ID
// ============================================

export const SUBJECT_NAME_TO_ID = Object.entries(SUBJECT_NAMES).reduce(
    (acc, [id, name]) => {
        acc[name] = id;
        return acc;
    },
    {}
);

// ============================================
// ТИПЫ ЭКЗАМЕНОВ
// ============================================

export const EXAM_TYPES = {
    OGE: 'ОГЭ',
    EGE: 'ЕГЭ'
};

// ============================================
// МАКСИМАЛЬНЫЕ БАЛЛЫ
// ============================================

export const MAX_SCORES = {
    ОГЭ: {
        [SUBJECT_IDS.RUSSIAN]: 33,
        [SUBJECT_IDS.MATHEMATICS]: 32,
        [SUBJECT_IDS.PHYSICS]: 40,
        [SUBJECT_IDS.CHEMISTRY]: 40,
        [SUBJECT_IDS.BIOLOGY]: 48,
        [SUBJECT_IDS.INFORMATICS]: 19,
        [SUBJECT_IDS.HISTORY]: 37,
        [SUBJECT_IDS.SOCIAL_STUDIES]: 37,
        [SUBJECT_IDS.GEOGRAPHY]: 31,
        [SUBJECT_IDS.LITERATURE]: 45
    },
    ЕГЭ: {
        [SUBJECT_IDS.RUSSIAN]: 50,
        [SUBJECT_IDS.MATHEMATICS_PROFILE]: 32,
        [SUBJECT_IDS.MATHEMATICS_BASE]: 21,
        [SUBJECT_IDS.PHYSICS]: 54,
        [SUBJECT_IDS.CHEMISTRY]: 56,
        [SUBJECT_IDS.BIOLOGY]: 59,
        [SUBJECT_IDS.INFORMATICS]: 29,
        [SUBJECT_IDS.HISTORY]: 42,
        [SUBJECT_IDS.SOCIAL_STUDIES]: 57,
        [SUBJECT_IDS.ENGLISH]: 86,
        [SUBJECT_IDS.GERMAN]: 86,
        [SUBJECT_IDS.FRENCH]: 86,
        [SUBJECT_IDS.SPANISH]: 86,
        [SUBJECT_IDS.CHINESE]: 86
    }
};

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Получить русское название предмета по ID
 * @param {string} subjectId - ID предмета на английском
 * @returns {string} Название на русском
 */
export const getSubjectName = (subjectId) => {
    return SUBJECT_NAMES[subjectId] || subjectId;
};

/**
 * Получить ID предмета по русскому названию
 * @param {string} subjectName - Название на русском
 * @returns {string} ID на английском
 */
export const getSubjectId = (subjectName) => {
    return SUBJECT_NAME_TO_ID[subjectName] || subjectName;
};

/**
 * Получить максимальный балл для предмета
 * @param {string} subjectId - ID предмета
 * @param {string} examType - 'ОГЭ' или 'ЕГЭ'
 * @returns {number} Максимальный балл
 */
export const getMaxScore = (subjectId, examType) => {
    return MAX_SCORES[examType]?.[subjectId] || 100;
};

/**
 * Проверить существует ли предмет для данного экзамена
 * @param {string} subjectId - ID предмета
 * @param {string} examType - 'ОГЭ' или 'ЕГЭ'
 * @returns {boolean}
 */
export const isSubjectAvailable = (subjectId, examType) => {
    return MAX_SCORES[examType]?.hasOwnProperty(subjectId) || false;
};

/**
 * Получить все доступные предметы для экзамена
 * @param {string} examType - 'ОГЭ' или 'ЕГЭ'
 * @returns {Array} Массив объектов {id, name}
 */
export const getAvailableSubjects = (examType) => {
    const subjectIds = Object.keys(MAX_SCORES[examType] || {});
    return subjectIds.map(id => ({
        id,
        name: SUBJECT_NAMES[id],
        maxScore: MAX_SCORES[examType][id]
    }));
};

// ============================================
// ВАЛИДАЦИЯ
// ============================================

/**
 * Проверить корректность subject_id
 * @param {string} subjectId
 * @returns {boolean}
 */
export const isValidSubjectId = (subjectId) => {
    return Object.values(SUBJECT_IDS).includes(subjectId);
};

/**
 * Проверить корректность examType
 * @param {string} examType
 * @returns {boolean}
 */
export const isValidExamType = (examType) => {
    return Object.values(EXAM_TYPES).includes(examType);
};

export default {
    SUBJECT_IDS,
    SUBJECT_NAMES,
    SUBJECT_NAME_TO_ID,
    EXAM_TYPES,
    MAX_SCORES,
    getSubjectName,
    getSubjectId,
    getMaxScore,
    isSubjectAvailable,
    getAvailableSubjects,
    isValidSubjectId,
    isValidExamType
};