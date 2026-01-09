// src/pages/ExamTaskPage/ExamTaskPage.jsx
/**
 * Страница для решения одного задания из истории (retry)
 * Простая обертка для ExamTask компонента
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import ExamTask from '../../components/ExamTask/ExamTask';
import { useAuth } from '../../hooks/useAuth';
import { submitAnswer } from '../../services/examAPI';
import { getTaskForRetry } from '../../services/qualityHistoryAPI';
import './ExamTaskPage.css';

const ExamTaskPage = () => {
    const { taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Состояния
    const [task, setTask] = useState(location.state?.task || null);
    const [isLoading, setIsLoading] = useState(!location.state?.task);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Загрузка задания если не пришло через state
     */
    useEffect(() => {
        if (!task && taskId && user) {
            loadTask();
        }
    }, [taskId, user]);

    /**
     * Загрузка задания из API
     */
    const loadTask = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getTaskForRetry(parseInt(taskId), user.user_id);

            if (!response.success) {
                throw new Error(response.error || 'Не удалось загрузить задание');
            }

            setTask(response.data);
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
                answerData.time_spent
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
                {/* Хедер с кнопкой назад */}
                <div className="exam-task-page-header">
                    <button className="back-button" onClick={handleGoBack}>
                        <ArrowLeft size={20} />
                        Назад к истории
                    </button>

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
                        onNext={handleGoBack}
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
                        {!result.is_correct && (
                            <button className="retry-task-btn" onClick={handleRetry}>
                                🔄 Решить еще раз
                            </button>
                        )}
                        <button className="back-to-history-btn" onClick={handleGoBack}>
                            Вернуться к истории
                        </button>
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