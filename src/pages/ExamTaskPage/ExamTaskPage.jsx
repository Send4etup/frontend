// src/pages/ExamTaskPage/ExamTaskPage.jsx
/**
 * Страница для решения одного задания из истории (retry)
 * Поддерживает прохождение по всем заданиям с ошибками подряд
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import ExamTask from '../../components/ExamTask/ExamTask';
import { useAuth } from '../../hooks/useAuth';
import { submitAnswer } from '../../services/examAPI';
import { getTaskForRetry } from '../../services/qualityHistoryAPI';
import './ExamTaskPage.css';

const ExamTaskPage = () => {
    const { taskId } = useParams();
    const { getUserId } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    // Данные о серии заданий с ошибками
    const [errorTaskIds, setErrorTaskIds] = useState(location.state?.errorTaskIds || []);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(
        location.state?.currentIndex ||
        (location.state?.errorTaskIds ? location.state.errorTaskIds.indexOf(parseInt(taskId)) : 0)
    );

    // Состояния
    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(!location.state?.task);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Получение user_id при монтировании
     */
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const id = await getUserId();
                setUserId(id);
                console.log('User ID получен:', id);
            } catch (err) {
                console.error('Ошибка получения user_id:', err);
                setError('Не удалось получить данные пользователя');
            }
        };

        fetchUserId();
    }, [getUserId]);

    /**
     * Загрузка задания если не пришло через state
     */
    useEffect(() => {
        if (!task && taskId && userId) {
            loadTask();
        }
    }, [taskId, userId]);

    /**
     * Загрузка задания из API
     */
    const loadTask = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getTaskForRetry(parseInt(taskId), userId);

            if (!response.success) {
                throw new Error(response.error || 'Не удалось загрузить задание');
            }

            console.log("gettaskforretry response:", response.data);

            const taskData = { ...response.data };

            // Парсинг answer_options если это строка
            if (taskData.answer_options) {
                if (typeof taskData.answer_options === 'string') {
                    try {
                        taskData.answer_options = JSON.parse(taskData.answer_options);
                        console.log("answer_options распарсены:", taskData.answer_options);
                    } catch (parseError) {
                        console.error('Ошибка парсинга answer_options:', parseError);
                        taskData.answer_options = [];
                    }
                }
                else if (!Array.isArray(taskData.answer_options)) {
                    console.warn('Неожиданный формат answer_options:', typeof taskData.answer_options);
                    taskData.answer_options = [];
                }
            }

            setTask(taskData);
        } catch (err) {
            console.error('Ошибка загрузки задания:', err);
            setError(err.message || 'Не удалось загрузить задание');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Отправка ответа
     */
    const handleSubmit = async (answerData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await submitAnswer(
                answerData.task_id,
                answerData.user_answer,
                answerData.time_spent,
                userId
            );

            if (!response.success) {
                throw new Error(response.error || 'Ошибка отправки ответа');
            }

            // Показываем результат
            setResult(response.data);
            setShowResult(true);
        } catch (err) {
            console.error('Ошибка отправки ответа:', err);
            setError(err.message || 'Не удалось отправить ответ');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Возврат назад к истории
     */
    const handleGoBack = () => {
        navigate(-1);
    };

    /**
     * Повторить задание заново
     */
    const handleRetry = () => {
        setResult(null);
        setShowResult(false);
        setTask(null);
        loadTask();
    };

    /**
     * Переход к следующему заданию с ошибкой
     * Если заданий с ошибками больше нет - возвращаемся к истории
     */
    const handleNext = () => {
        const nextIndex = currentTaskIndex + 1;

        // Проверяем есть ли еще задания с ошибками
        if (nextIndex < errorTaskIds.length) {
            const nextTaskId = errorTaskIds[nextIndex];

            // Переходим к следующему заданию
            navigate(`/exam/task/${nextTaskId}`, {
                state: {
                    errorTaskIds: errorTaskIds,
                    currentIndex: nextIndex,
                    retry: true
                },
                replace: true // Заменяем текущую запись в истории
            });

            // Сбрасываем состояния для загрузки нового задания
            setTask(null);
            setResult(null);
            setShowResult(false);
            setCurrentTaskIndex(nextIndex);
        } else {
            // Заданий с ошибками больше нет - возвращаемся к истории
            handleGoBack();
        }
    };

    /**
     * Проверка есть ли еще задания после текущего
     */
    const hasMoreTasks = () => {
        return currentTaskIndex < errorTaskIds.length - 1;
    };

    // =====================================================
    // LOADING СОСТОЯНИЕ
    // =====================================================

    if (isLoading) {
        return (
            <div className="exam-task-page">
                <div className="exam-task-page-loading">
                    <Loader size={40} className="spin" color="#43ff65" />
                    <p>Загрузка задания...</p>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR СОСТОЯНИЕ
    // =====================================================

    if (error) {
        return (
            <div className="exam-task-page">
                <div className="exam-task-page-error">
                    <AlertCircle size={48} color="#ef4444" />
                    <h3>Ошибка</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button className="retry-btn" onClick={loadTask}>
                            Попробовать снова
                        </button>
                        <button className="back-btn" onClick={handleGoBack}>
                            Вернуться назад
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================================
    // EMPTY СОСТОЯНИЕ
    // =====================================================

    if (!task) {
        return (
            <div className="exam-task-page">
                <div className="exam-task-page-error">
                    <AlertCircle size={48} color="#888" />
                    <h3>Задание не найдено</h3>
                    <p>Не удалось найти задание</p>
                    <button className="back-btn" onClick={handleGoBack}>
                        Вернуться назад
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // ОСНОВНОЙ РЕНДЕР
    // =====================================================

    return (
        <div className="exam-task-page">
            <motion.div
                className="exam-task-page-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Хедер с кнопкой назад и прогрессом */}
                <div className="exam-task-page-header">
                    <button className="back-button" onClick={handleGoBack}>
                        <ArrowLeft size={20} />
                        Назад к истории
                    </button>

                    {/* Показываем прогресс если есть серия заданий */}
                    {errorTaskIds.length > 1 && (
                        <div className="progress-indicator">
                            <span className="progress-text">
                                Задание {currentTaskIndex + 1} из {errorTaskIds.length}
                            </span>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${((currentTaskIndex + 1) / errorTaskIds.length) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {location.state?.retry && (
                        <div className="retry-badge">
                            <span>🔄 Повторное решение</span>
                        </div>
                    )}
                </div>

                {/* Задание */}
                <div className="exam-task-page-content">
                    <ExamTask
                        task={task}
                        onSubmit={handleSubmit}
                        showResult={showResult}
                        result={result}
                    />
                </div>

                {/* Дополнительные действия после результата */}
                {showResult && result && (
                    <motion.div
                        className="exam-task-page-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        {/* Кнопка "Решить еще раз" только для неправильных ответов */}
                        {!result.is_correct && (
                            <button className="retry-task-btn" onClick={handleRetry}>
                                🔄 Решить еще раз
                            </button>
                        )}

                        {/* Показываем разные кнопки в зависимости от наличия следующих заданий */}
                        {hasMoreTasks() ? (
                            <button
                                className="next-task-btn primary"
                                onClick={handleNext}
                            >
                                {result.is_correct ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Следующее задание
                                    </>
                                ) : (
                                    <>
                                        Пропустить →
                                    </>
                                )}
                            </button>
                        ) : (
                            <button className="back-to-history-btn" onClick={handleGoBack}>
                                {result.is_correct ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Все задания решены!
                                    </>
                                ) : (
                                    'Вернуться к истории'
                                )}
                            </button>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Оверлей для блокировки при отправке */}
            {isSubmitting && (
                <div className="submitting-overlay">
                    <Loader size={40} className="spin" color="#43ff65" />
                    <p>Проверяем ответ...</p>
                </div>
            )}
        </div>
    );
};

export default ExamTaskPage;