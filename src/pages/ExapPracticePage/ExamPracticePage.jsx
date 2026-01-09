// src/pages/ExamPracticePage/ExamPracticePage.jsx
/**
 * Страница для прохождения заданий ОГЭ/ЕГЭ
 * Полная интеграция с API и компонентом ExamTask
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Award } from 'lucide-react';
import ExamTask from '../../components/ExamTask/ExamTask';
import {
    getRandomTask,
    submitAnswer,
    getUserStats
} from '../../services/examAPI';
import { useAuth } from '../../hooks/useAuth';
import './ExamPracticePage.css';

const ExamPracticePage = ( user ) => {
    const navigate = useNavigate();
    const { subjectId, examType } = useParams(); // Например: /exam/practice/mathematics/ОГЭ

    // Состояния
    const [currentTask, setCurrentTask] = useState(null);
    const [taskResult, setTaskResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Статистика сессии
    const [sessionStats, setSessionStats] = useState({
        tasksCompleted: 0,
        correctAnswers: 0,
        totalPoints: 0,
        earnedPoints: 0
    });

    /**
     * Загрузка случайного задания при монтировании
     */
    useEffect(() => {
        loadNextTask();
    }, [subjectId, examType]);

    /**
     * Загрузка следующего задания
     */
    const loadNextTask = async () => {
        setIsLoading(true);
        setError(null);
        setShowResult(false);
        setTaskResult(null);

        try {
            const result = await getRandomTask(
                subjectId,
                examType,
                null, // difficulty - можно передать для фильтрации
                true, // exclude_solved
                user.user_id
            );

            if (result.success && result.data) {
                setCurrentTask(result.data);
            } else {
                setError('Не удалось загрузить задание. Попробуйте позже.');
            }
        } catch (err) {
            console.error('Error loading task:', err);
            setError('Произошла ошибка при загрузке задания.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Обработка отправки ответа
     */
    const handleSubmitAnswer = async (answerData) => {
        try {
            console.log(answerData, user.user_id)

            const result = await submitAnswer(
                answerData.task_id,
                answerData.user_answer,
                answerData.time_spent,
            );

            if (result.success && result.data) {
                // Сохраняем результат
                setTaskResult(result.data);
                setShowResult(true);

                // Обновляем статистику сессии
                setSessionStats(prev => ({
                    tasksCompleted: prev.tasksCompleted + 1,
                    correctAnswers: prev.correctAnswers + (result.data.is_correct ? 1 : 0),
                    totalPoints: prev.totalPoints + currentTask.points,
                    earnedPoints: prev.earnedPoints + result.data.points_earned
                }));
            } else {
                setError('Не удалось проверить ответ. Попробуйте позже.');
            }
        } catch (err) {
            console.error('Error submitting answer:', err);
            setError('Произошла ошибка при отправке ответа.');
        }
    };

    /**
     * Переход к следующему заданию
     */
    const handleNextTask = () => {
        loadNextTask();
    };

    /**
     * Возврат назад
     */
    const handleBack = () => {
        navigate(-1);
    };

    /**
     * Форматирование названия предмета
     */
    const getSubjectName = (subjectId) => {
        const names = {
            'russian': 'Русский язык',
            'mathematics': 'Математика',
            'mathematics_profile': 'Математика (профиль)',
            'physics': 'Физика',
            'chemistry': 'Химия',
            'biology': 'Биология',
            'informatics': 'Информатика',
            'history': 'История',
            'social_studies': 'Обществознание',
            'geography': 'География',
            'literature': 'Литература',
            'english': 'Английский язык'
        };
        return names[subjectId] || subjectId;
    };

    /**
     * Вычисление процента правильных ответов
     */
    const getAccuracyPercentage = () => {
        if (sessionStats.tasksCompleted === 0) return 0;
        return Math.round((sessionStats.correctAnswers / sessionStats.tasksCompleted) * 100);
    };

    return (
        <div className="exam-practice-page">
            {/* Шапка */}
            <motion.div
                className="practice-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button className="back-button" onClick={handleBack}>
                    <ArrowLeft size={20} />
                    Назад
                </button>

                <div className="practice-title">
                    <h2>{getSubjectName(subjectId)}</h2>
                    <span className="exam-badge">{examType}</span>
                </div>

                <div className="practice-spacer" />
            </motion.div>

            {/* Статистика сессии */}
            <motion.div
                className="session-stats"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="stat-card">
                    <TrendingUp size={20} />
                    <div className="stat-content">
                        <span className="stat-label">Решено</span>
                        <span className="stat-value">{sessionStats.tasksCompleted}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <Target size={20} />
                    <div className="stat-content">
                        <span className="stat-label">Точность</span>
                        <span className="stat-value">{getAccuracyPercentage()}%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <Award size={20} />
                    <div className="stat-content">
                        <span className="stat-label">Баллы</span>
                        <span className="stat-value">
                            {sessionStats.earnedPoints}/{sessionStats.totalPoints}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Основной контент */}
            <div className="practice-content">
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner" />
                        <p>Загрузка задания...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button className="retry-button" onClick={loadNextTask}>
                            Попробовать снова
                        </button>
                    </div>
                )}

                {!isLoading && !error && currentTask && (
                    <ExamTask
                        task={currentTask}
                        onSubmit={handleSubmitAnswer}
                        onNext={handleNextTask}
                        showResult={showResult}
                        result={taskResult}
                    />
                )}
            </div>

            {/* Мотивационное сообщение */}
            {sessionStats.tasksCompleted > 0 && sessionStats.tasksCompleted % 5 === 0 && (
                <motion.div
                    className="motivation-banner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p>
                        🎉 Отличная работа! Ты решил{sessionStats.tasksCompleted === 1 ? 'о' : 'и'} уже {sessionStats.tasksCompleted} {
                        sessionStats.tasksCompleted === 1 ? 'задание' :
                            sessionStats.tasksCompleted < 5 ? 'задания' : 'заданий'
                    }!
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ExamPracticePage;