// src/components/ExamMode/TaskHistoryTab.jsx
/**
 * Компонент истории заданий для раздела "Практика"
 * Показывает все решенные задания с фильтрацией и возможностью повторного решения
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    RefreshCw,
    Loader,
    AlertTriangle
} from 'lucide-react';
import './TaskHistoryTab.css';

import {
    getTaskHistory,
    getIncorrectTasks,
    getIncorrectSummary,
    getDifficultyText,
    getDifficultyColor,
    formatDate,
    formatTime
} from '../../services/qualityHistoryAPI';

const TaskHistoryTab = ({ userId, examType, onTaskRetry }) => {
    // Состояния
    const [historyData, setHistoryData] = useState(null);
    const [incorrectSummary, setIncorrectSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Фильтры
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'correct', 'incorrect'
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const itemsPerPage = 20;

    // Загрузка данных
    useEffect(() => {
        loadHistory();
        loadIncorrectSummary();
    }, [userId, examType, activeFilter, selectedSubject, selectedDifficulty, currentPage]);

    /**
     * Загрузка истории заданий
     */
    const loadHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const filters = {
                examType: examType,
                subjectId: selectedSubject,
                difficulty: selectedDifficulty,
                limit: itemsPerPage,
                offset: currentPage * itemsPerPage
            };

            // Добавляем фильтр по правильности
            if (activeFilter === 'correct') {
                filters.isCorrect = true;
            } else if (activeFilter === 'incorrect') {
                filters.isCorrect = false;
            }

            let result;
            if (activeFilter === 'incorrect' && !selectedSubject && !selectedDifficulty) {
                // Используем специальный endpoint для неправильных
                result = await getIncorrectTasks(userId, filters);
            } else {
                result = await getTaskHistory(userId, filters);
            }

            // Проверяем успешность запроса
            if (!result.success) {
                throw new Error(result.error || 'Ошибка загрузки данных');
            }

            setHistoryData(result.data);
            setHasMore(result.data.has_more);
        } catch (err) {
            console.error('Ошибка загрузки истории:', err);
            setError('Не удалось загрузить историю. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Загрузка сводки по неправильным
     */
    const loadIncorrectSummary = async () => {
        try {
            const result = await getIncorrectSummary(userId, examType);
            if (result.success) {
                setIncorrectSummary(result.data);
            }
        } catch (err) {
            console.error('Ошибка загрузки сводки:', err);
        }
    };

    /**
     * Сброс фильтров
     */
    const resetFilters = () => {
        setActiveFilter('all');
        setSelectedSubject(null);
        setSelectedDifficulty(null);
        setCurrentPage(0);
    };

    /**
     * Обработчик изменения фильтра
     */
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(0);
    };

    /**
     * Обработчик повторного решения
     */
    const handleRetry = (task) => {
        if (onTaskRetry) {
            onTaskRetry(task.task_id, examType);
        }
    };

    /**
     * Загрузить больше
     */
    const loadMore = () => {
        setCurrentPage(prev => prev + 1);
    };

    // =====================================================
    // LOADING СОСТОЯНИЕ
    // =====================================================

    if (isLoading && currentPage === 0) {
        return (
            <div className="task-history-loading">
                <Loader size={40} className="spin" color="#43ff65" />
                <p>Загрузка истории заданий...</p>
            </div>
        );
    }

    // =====================================================
    // ERROR СОСТОЯНИЕ
    // =====================================================

    if (error && currentPage === 0) {
        return (
            <div className="task-history-error">
                <AlertTriangle size={48} color="#ef4444" />
                <h3>Ошибка загрузки</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={loadHistory}>
                    <RefreshCw size={18} />
                    Попробовать снова
                </button>
            </div>
        );
    }

    // =====================================================
    // EMPTY СОСТОЯНИЕ
    // =====================================================

    if (!historyData || historyData.total === 0) {
        return (
            <div className="task-history-empty">
                <div className="empty-icon">📝</div>
                <h3>История пуста</h3>
                <p>
                    {activeFilter === 'incorrect'
                        ? 'У вас нет неправильно решенных заданий. Отличная работа!'
                        : 'Начните решать задания, чтобы увидеть историю'}
                </p>
                {activeFilter !== 'all' && (
                    <button className="reset-filters-btn" onClick={resetFilters}>
                        Сбросить фильтры
                    </button>
                )}
            </div>
        );
    }

    // =====================================================
    // ОСНОВНОЙ РЕНДЕР
    // =====================================================

    return (
        <motion.div
            className="task-history-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Сводка по неправильным (если есть) */}
            {incorrectSummary && incorrectSummary.total_incorrect > 0 && activeFilter === 'all' && (
                <div className="incorrect-summary-banner">
                    <div className="banner-content">
                        <AlertTriangle size={24} color="#f59e0b" />
                        <div className="banner-text">
                            <h4>Найдено {incorrectSummary.total_incorrect} неправильных ответов</h4>
                            <p>Повторите эти задания для лучшего результата</p>
                        </div>
                    </div>
                    <button
                        className="show-incorrect-btn"
                        onClick={() => handleFilterChange('incorrect')}
                    >
                        Показать
                    </button>
                </div>
            )}

            {/* Фильтры */}
            <div className="history-filters">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        <History size={16} />
                        Все ({historyData.total})
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'correct' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('correct')}
                    >
                        <CheckCircle size={16} />
                        Правильные
                    </button>
                    <button
                        className={`filter-tab incorrect ${activeFilter === 'incorrect' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('incorrect')}
                    >
                        <XCircle size={16} />
                        Неправильные
                        {incorrectSummary && incorrectSummary.total_incorrect > 0 && (
                            <span className="filter-badge">{incorrectSummary.total_incorrect}</span>
                        )}
                    </button>
                </div>

                {(selectedSubject || selectedDifficulty) && (
                    <button className="reset-filters-btn-small" onClick={resetFilters}>
                        <RefreshCw size={14} />
                        Сбросить фильтры
                    </button>
                )}
            </div>

            {/* Список заданий */}
            <div className="history-list">
                <AnimatePresence>
                    {historyData.items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`history-item ${item.is_correct ? 'correct' : 'incorrect'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            {/* Иконка статуса */}
                            <div className={`status-icon ${item.is_correct ? 'correct' : 'incorrect'}`}>
                                {item.is_correct ? (
                                    <CheckCircle size={24} />
                                ) : (
                                    <XCircle size={24} />
                                )}
                            </div>

                            {/* Информация о задании */}
                            <div className="history-item-content">
                                <div className="history-item-header">
                                    <div className="item-subject-difficulty">
                                        <span className="item-subject">{item.subject_name}</span>
                                        <span
                                            className="item-difficulty"
                                            style={{
                                                backgroundColor: getDifficultyColor(item.difficulty),
                                                color: '#0d0d0d'
                                            }}
                                        >
                                            {getDifficultyText(item.difficulty)}
                                        </span>
                                    </div>
                                    <span className="item-date">{formatDate(item.attempted_at)}</span>
                                </div>

                                {item.question_text && (
                                    <p className="item-question">
                                        {item.question_text.length > 100
                                            ? `${item.question_text.substring(0, 100)}...`
                                            : item.question_text}
                                    </p>
                                )}

                                <div className="history-item-footer">
                                    <div className="item-details">
                                        {item.time_spent && (
                                            <span className="item-time">
                                                <Clock size={14} />
                                                {formatTime(item.time_spent)}
                                            </span>
                                        )}
                                        {item.points && (
                                            <span className="item-points">
                                                {item.points} {item.points === 1 ? 'балл' : 'баллов'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Кнопка повторного решения (для неправильных) */}
                                    {!item.is_correct && (
                                        <button
                                            className="retry-task-btn"
                                            onClick={() => handleRetry(item)}
                                        >
                                            <RefreshCw size={16} />
                                            Решить заново
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Загрузить больше */}
            {hasMore && (
                <div className="load-more-container">
                    <button className="load-more-btn" onClick={loadMore} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader size={18} className="spin" />
                                Загрузка...
                            </>
                        ) : (
                            <>
                                Загрузить еще
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default TaskHistoryTab;