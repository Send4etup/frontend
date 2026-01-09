// src/pages/ExamModePage/OgeExamModePage.jsx
/**
 * Контейнер для режима подготовки к ОГЭ
 * Содержит логику специфичную для ОГЭ и рендерит ExamModePageUI
 */

import React from 'react';
import { useExamLogic } from './useExamLogic';
import ExamModePageUI from './ExamModePageUI';
import OGE_CONFIG from '../../config/ogeConfig';

/**
 * Компонент-контейнер для ОГЭ
 * @param {Object} props
 * @param {Object} props.user - Данные пользователя
 * @param {Function} props.onVoiceMode - Callback для голосового режима
 */
const OgeExamModePage = ({ user, onVoiceMode }) => {
    // Получаем всю логику из хука
    const examLogic = useExamLogic({
        examType: 'ОГЭ',
        user,
        config: OGE_CONFIG
    });

    // ============================================
    // СПЕЦИФИЧНАЯ ЛОГИКА ОГЭ
    // ============================================

    /**
     * Рассчитать средний балл по предметам ОГЭ
     */
    const calculateAverageScore = () => {
        const { tempSettings } = examLogic;

        if (tempSettings.subjects.length === 0) return 0;

        const total = Object.values(tempSettings.targetScores)
            .reduce((sum, score) => sum + (parseInt(score) || 0), 0);

        return (total / tempSettings.subjects.length).toFixed(1);
    };

    /**
     * Проверить достаточно ли предметов выбрано (минимум 4 для ОГЭ)
     */
    const isMinimumSubjectsMet = () => {
        return examLogic.tempSettings.subjects.length >= OGE_CONFIG.features.minSubjects;
    };

    /**
     * Получить рекомендации для ОГЭ
     */
    const getOgeRecommendations = () => {
        const { tempSettings } = examLogic;
        const recommendations = [];

        // Проверяем количество предметов
        if (tempSettings.subjects.length < OGE_CONFIG.features.minSubjects) {
            recommendations.push({
                type: 'warning',
                message: `Выберите минимум ${OGE_CONFIG.features.minSubjects} предмета для ОГЭ`
            });
        }

        // Проверяем обязательные предметы
        const hasRussian = tempSettings.subjects.includes('russian');
        const hasMath = tempSettings.subjects.includes('mathematics');

        if (!hasRussian) {
            recommendations.push({
                type: 'error',
                message: 'Русский язык - обязательный предмет ОГЭ'
            });
        }

        if (!hasMath) {
            recommendations.push({
                type: 'error',
                message: 'Математика - обязательный предмет ОГЭ'
            });
        }

        // Проверяем целевые баллы
        tempSettings.subjects.forEach(subjectId => {
            const targetScore = parseInt(tempSettings.targetScores[subjectId]) || 0;
            const maxScore = examLogic.getMaxScore(subjectId);

            if (targetScore === 0) {
                recommendations.push({
                    type: 'info',
                    message: `Укажите целевой балл для ${examLogic.formatSubjectName(subjectId)}`
                });
            } else if (targetScore < maxScore * 0.5) {
                recommendations.push({
                    type: 'warning',
                    message: `Низкий целевой балл по ${examLogic.formatSubjectName(subjectId)}`
                });
            }
        });

        return recommendations;
    };

    // ============================================
    // РЕНДЕР UI КОМПОНЕНТА
    // ============================================

    return (
        <ExamModePageUI
            {...examLogic}
            onVoiceMode={onVoiceMode}

            // Специфичные данные ОГЭ
            averageScore={calculateAverageScore()}
            isMinimumSubjectsMet={isMinimumSubjectsMet()}
            recommendations={getOgeRecommendations()}

            // Дополнительная информация
            examPeriod={OGE_CONFIG.examPeriod}
            preparationTips={OGE_CONFIG.preparationTips}
            recommendedScores={OGE_CONFIG.recommendedScores}
        />
    );
};

export default OgeExamModePage;