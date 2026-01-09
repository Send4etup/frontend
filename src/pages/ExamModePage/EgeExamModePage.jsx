// src/pages/ExamModePage/EgeExamModePage.jsx
/**
 * Контейнер для режима подготовки к ЕГЭ
 * Содержит логику специфичную для ЕГЭ и рендерит ExamModePageUI
 */

import React from 'react';
import { useExamLogic } from './useExamLogic';
import ExamModePageUI from './ExamModePageUI';
import EGE_CONFIG from '../../config/egeConfig';

/**
 * Компонент-контейнер для ЕГЭ
 * @param {Object} props
 * @param {Object} props.user - Данные пользователя
 * @param {Function} props.onVoiceMode - Callback для голосового режима
 */
const EgeExamModePage = ({ user, onVoiceMode }) => {
    // Получаем всю логику из хука
    const examLogic = useExamLogic({
        examType: 'ЕГЭ',
        user,
        config: EGE_CONFIG
    });

    // ============================================
    // СПЕЦИФИЧНАЯ ЛОГИКА ЕГЭ
    // ============================================

    /**
     * Рассчитать средний балл по предметам ЕГЭ
     */
    const calculateAverageScore = () => {
        const { tempSettings } = examLogic;

        if (tempSettings.subjects.length === 0) return 0;

        const total = Object.values(tempSettings.targetScores)
            .reduce((sum, score) => sum + (parseInt(score) || 0), 0);

        return (total / tempSettings.subjects.length).toFixed(1);
    };

    /**
     * Проверить достаточно ли предметов выбрано (минимум 2 для ЕГЭ)
     */
    const isMinimumSubjectsMet = () => {
        return examLogic.tempSettings.subjects.length >= EGE_CONFIG.features.minSubjects;
    };

    /**
     * Проверить выбраны ли оба типа математики
     */
    const hasBothMathTypes = () => {
        const { subjects } = examLogic.tempSettings;
        return subjects.includes('mathematics_base') && subjects.includes('mathematics_profile');
    };

    /**
     * Получить возможные направления подготовки на основе выбранных предметов
     */
    const getCareerPaths = () => {
        const { subjects } = examLogic.tempSettings;
        const paths = new Set();

        subjects.forEach(subjectId => {
            const subjectPaths = EGE_CONFIG.careerPaths[subjectId];
            if (subjectPaths) {
                subjectPaths.forEach(path => paths.add(path));
            }
        });

        return Array.from(paths);
    };

    /**
     * Проверить проходной балл для топовых вузов
     */
    const checkTopUniversityScore = () => {
        const avgScore = parseFloat(calculateAverageScore());
        const topUnivMin = EGE_CONFIG.recommendedScores.topUniversity.minAverage;

        if (avgScore >= topUnivMin) {
            return {
                status: 'excellent',
                message: 'Достаточно для топовых вузов!'
            };
        } else {
            const diff = topUnivMin - avgScore;
            return {
                status: 'improvement',
                message: `Повысьте средний балл на ${diff.toFixed(1)} для топовых вузов`
            };
        }
    };

    /**
     * Получить рекомендации для ЕГЭ
     */
    const getEgeRecommendations = () => {
        const { tempSettings } = examLogic;
        const recommendations = [];

        // Проверяем количество предметов
        if (tempSettings.subjects.length < EGE_CONFIG.features.minSubjects) {
            recommendations.push({
                type: 'warning',
                message: `Выберите минимум ${EGE_CONFIG.features.minSubjects} предмета для ЕГЭ`
            });
        }

        // Проверяем обязательные предметы
        const hasRussian = tempSettings.subjects.includes('russian');
        const hasMath = tempSettings.subjects.includes('mathematics_base') ||
            tempSettings.subjects.includes('mathematics_profile');

        if (!hasRussian) {
            recommendations.push({
                type: 'error',
                message: 'Русский язык - обязательный предмет ЕГЭ'
            });
        }

        if (!hasMath) {
            recommendations.push({
                type: 'error',
                message: 'Математика - обязательный предмет ЕГЭ (база или профиль)'
            });
        }

        // Предупреждение о выборе обоих типов математики
        if (hasBothMathTypes()) {
            recommendations.push({
                type: 'warning',
                message: 'Нельзя сдавать одновременно базу и профиль по математике'
            });
        }

        // Проверяем целевые баллы
        tempSettings.subjects.forEach(subjectId => {
            const targetScore = parseInt(tempSettings.targetScores[subjectId]) || 0;
            const subject = EGE_CONFIG.subjects[subjectId];

            if (!subject) return;

            if (targetScore === 0) {
                recommendations.push({
                    type: 'info',
                    message: `Укажите целевой балл для ${subject.name}`
                });
            } else if (targetScore < subject.minScore) {
                recommendations.push({
                    type: 'error',
                    message: `Балл по ${subject.name} ниже минимального (${subject.minScore})`
                });
            } else if (targetScore < 60) {
                recommendations.push({
                    type: 'warning',
                    message: `Низкий целевой балл по ${subject.name} для поступления на бюджет`
                });
            }
        });

        // Рекомендации по направлениям
        const careerPaths = getCareerPaths();
        if (careerPaths.length > 0) {
            recommendations.push({
                type: 'success',
                message: `Возможные направления: ${careerPaths.slice(0, 3).join(', ')}`
            });
        }

        return recommendations;
    };

    // ============================================
    // РЕНДЕР UI КОМПОНЕНТА
    // ============================================

    return (
        <ExamModePageUI
            {...examLogic}
            onVoiceMode={onVoiceMode}

            // Специфичные данные ЕГЭ
            averageScore={calculateAverageScore()}
            isMinimumSubjectsMet={isMinimumSubjectsMet()}
            hasBothMathTypes={hasBothMathTypes()}
            careerPaths={getCareerPaths()}
            topUniversityStatus={checkTopUniversityScore()}
            recommendations={getEgeRecommendations()}

            // Дополнительная информация
            examPeriod={EGE_CONFIG.examPeriod}
            preparationTips={EGE_CONFIG.preparationTips}
            recommendedScores={EGE_CONFIG.recommendedScores}
        />
    );
};

export default EgeExamModePage;