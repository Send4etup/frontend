// src/components/ExamMode/QualityTab.jsx
/**
 * Компонент раздела "Качество" в режиме подготовки к экзаменам
 * Отображает детальную аналитику качества обучения пользователя
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import './QualityTab.css';

import {
    getQualityAnalytics,
    getAccuracyColor,
    getDifficultyText,
    getDifficultyColor,
    formatTime
} from '../../services/qualityHistoryAPI';

const QualityTab = ({ userId, examType }) => {
    // Состояния
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Загрузка данных
    useEffect(() => {
        loadAnalytics();
    }, [userId, examType, selectedSubject]);

    /**
     * Загрузка аналитики качества
     */
    const loadAnalytics = async () => {
        setIsLoading(true);
        setError(null);

        try {

            const result = await getQualityAnalytics(
                userId,
                examType,
                selectedSubject
            );

            if (!result.success) {
                throw new Error(result.error || 'Ошибка загрузки данных');
            }

            setAnalytics(result.data);
        } catch (err) {
            console.error('Ошибка загрузки аналитики:', err);
            setError('Не удалось загрузить данные. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Получить градиент для progress bar в зависимости от точности
     */
    const getProgressGradient = (accuracy) => {
        const color = getAccuracyColor(accuracy);
        return `linear-gradient(90deg, ${color}AA, ${color})`;
    };

    // =====================================================
    // LOADING СОСТОЯНИЕ
    // =====================================================

    if (isLoading) {
        return (
            <div className="quality-tab-loading">
                <Loader size={40} className="spin" color="#43ff65" />
                <p>Анализируем ваши результаты...</p>
            </div>
        );
    }

    // =====================================================
    // ERROR СОСТОЯНИЕ
    // =====================================================

    if (error) {
        return (
            <div className="quality-tab-error">
                <AlertCircle size={48} color="#ef4444" />
                <h3>Ошибка загрузки</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={loadAnalytics}>
                    <RefreshCw size={18} />
                    Попробовать снова
                </button>
            </div>
        );
    }

    // =====================================================
    // EMPTY СОСТОЯНИЕ
    // =====================================================

    if (!analytics || analytics.total_attempts === 0) {
        return (
            <div className="quality-tab-empty">
                <div className="empty-icon">📊</div>
                <h3>Пока нет данных</h3>
                <p>Начните решать задания, чтобы увидеть аналитику вашей подготовки</p>
            </div>
        );
    }

    // =====================================================
    // ОСНОВНОЙ РЕНДЕР
    // =====================================================

    return (
        <motion.div
            className="quality-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Общая статистика */}
            <div className="quality-overview">
                <div className="quality-stat-card primary">
                    <div className="stat-icon">
                        <CheckCircle size={32} color="#43ff65" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.overall_accuracy.toFixed(1)}%</div>
                        <div className="stat-label">Общая точность</div>
                    </div>
                </div>

                <div className="quality-stat-card">
                    <div className="stat-content">
                        <div className="stat-value">{analytics.total_attempts}</div>
                        <div className="stat-label">Всего попыток</div>
                    </div>
                </div>

                <div className="quality-stat-card">
                    <div className="stat-content">
                        <div className="stat-value">{analytics.correct_attempts}</div>
                        <div className="stat-label">Правильных</div>
                    </div>
                </div>
            </div>

            {/* Статистика по сложности */}
            <div className="quality-section">
                <h3 className="section-title">
                    📈 Точность по уровням сложности
                </h3>

                <div className="difficulty-stats">
                    {analytics.difficulties.map((diff, index) => (
                        <motion.div
                            key={diff.difficulty}
                            className="difficulty-stat-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="difficulty-header">
                                <div className="difficulty-info">
                                    <span
                                        className="difficulty-badge"
                                        style={{ backgroundColor: getDifficultyColor(diff.difficulty) }}
                                    >
                                        {getDifficultyText(diff.difficulty)}
                                    </span>
                                    <span className="difficulty-attempts">
                                        {diff.correct_attempts} из {diff.total_attempts}
                                    </span>
                                </div>
                                <span
                                    className="difficulty-accuracy"
                                    style={{ color: getAccuracyColor(diff.accuracy) }}
                                >
                                    {diff.accuracy.toFixed(1)}%
                                </span>
                            </div>

                            <div className="quality-progress-bar">
                                <motion.div
                                    className="quality-progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${diff.accuracy}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    style={{
                                        background: getProgressGradient(diff.accuracy)
                                    }}
                                />
                            </div>

                            {diff.average_time && (
                                <div className="difficulty-time">
                                    ⏱️ Среднее время: {formatTime(diff.average_time)}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Статистика по предметам */}
            {analytics.subjects && analytics.subjects.length > 0 && (
                <div className="quality-section">
                    <h3 className="section-title">
                        📚 Статистика по предметам
                    </h3>

                    <div className="subjects-stats">
                        {analytics.subjects.map((subject, index) => (
                            <motion.div
                                key={subject.subject_id}
                                className="subject-stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="subject-stat-header">
                                    <h4 className="subject-name">{subject.subject_name}</h4>
                                    <span
                                        className="subject-accuracy"
                                        style={{ color: getAccuracyColor(subject.accuracy) }}
                                    >
                                        {subject.accuracy.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="subject-stat-details">
                                    <span className="stat-detail">
                                        ✅ {subject.correct_attempts} / {subject.total_attempts}
                                    </span>
                                    {subject.average_time && (
                                        <span className="stat-detail">
                                            ⏱️ {formatTime(subject.average_time)}
                                        </span>
                                    )}
                                </div>

                                {/* Мини-статистика по сложности */}
                                <div className="subject-difficulty-mini">
                                    {subject.easy_accuracy > 0 && (
                                        <div className="mini-stat easy">
                                            <span className="mini-label">Легкие</span>
                                            <span className="mini-value">{subject.easy_accuracy.toFixed(0)}%</span>
                                        </div>
                                    )}
                                    {subject.medium_accuracy > 0 && (
                                        <div className="mini-stat medium">
                                            <span className="mini-label">Средние</span>
                                            <span className="mini-value">{subject.medium_accuracy.toFixed(0)}%</span>
                                        </div>
                                    )}
                                    {subject.hard_accuracy > 0 && (
                                        <div className="mini-stat hard">
                                            <span className="mini-label">Сложные</span>
                                            <span className="mini-value">{subject.hard_accuracy.toFixed(0)}%</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Слабые места */}
            {analytics.weak_areas && analytics.weak_areas.length > 0 && (
                <div className="quality-section weak-areas-section">
                    <h3 className="section-title">
                        ⚠️ Требуют внимания
                    </h3>
                    <div className="weak-areas-list">
                        {analytics.weak_areas.map((area, index) => (
                            <motion.div
                                key={index}
                                className="weak-area-chip"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                {area}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Рекомендации */}
            {analytics.recommendations && analytics.recommendations.length > 0 && (
                <div className="quality-section recommendations-section">
                    <h3 className="section-title">
                        💡 Рекомендации
                    </h3>
                    <div className="recommendations-list">
                        {analytics.recommendations.map((rec, index) => (
                            <motion.div
                                key={index}
                                className="recommendation-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="recommendation-icon">
                                    {index === 0 && <TrendingUp size={20} color="#43ff65" />}
                                    {index !== 0 && <CheckCircle size={20} color="#3b82f6" />}
                                </div>
                                <p className="recommendation-text">{rec}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default QualityTab;