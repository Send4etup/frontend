// src/components/ExamTask/ExamTask.jsx
/**
 * Компонент для отображения и прохождения задания ОГЭ/ЕГЭ
 * Поддерживает все типы заданий: single_choice, multiple_choice, number, text
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, HelpCircle, Award } from 'lucide-react';
import './ExamTask.css';

const ExamTask = ({
                      task,
                      onSubmit,
                      onNext,
                      showResult = false,
                      result = null
                  }) => {
    // Состояние ответа пользователя
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Таймер времени на задание
    useEffect(() => {
        if (!isSubmitted) {
            const interval = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isSubmitted]);

    // Сброс при смене задания
    useEffect(() => {
        setUserAnswer('');
        setSelectedOptions([]);
        setTimeSpent(0);
        setIsSubmitted(false);
    }, [task?.id]);

    /**
     * Обработка выбора варианта ответа для single_choice
     */
    const handleSingleChoiceSelect = (option) => {
        setUserAnswer(option);
    };

    /**
     * Обработка выбора вариантов для multiple_choice
     */
    const handleMultipleChoiceToggle = (option) => {
        setSelectedOptions(prev => {
            if (prev.includes(option)) {
                return prev.filter(opt => opt !== option);
            } else {
                return [...prev, option];
            }
        });
    };

    /**
     * Обработка отправки ответа
     */
    const handleSubmit = () => {
        let finalAnswer = '';

        // Формируем ответ в зависимости от типа
        if (task.answer_type === 'single_choice') {
            finalAnswer = userAnswer;
        } else if (task.answer_type === 'multiple_choice') {
            finalAnswer = selectedOptions.sort().join(',');
        } else {
            finalAnswer = userAnswer;
        }

        // Отправляем ответ
        if (onSubmit) {
            onSubmit({
                task_id: task.id,
                user_answer: finalAnswer,
                time_spent: timeSpent
            });
        }

        setIsSubmitted(true);
    };

    /**
     * Проверка заполненности ответа
     */
    const isAnswerComplete = () => {
        if (task.answer_type === 'single_choice') {
            return userAnswer !== '';
        } else if (task.answer_type === 'multiple_choice') {
            return selectedOptions.length > 0;
        } else {
            return userAnswer.trim() !== '';
        }
    };

    /**
     * Форматирование времени
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Получение цвета для сложности
     */
    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: '#43ff65',
            medium: '#f59e0b',
            hard: '#ef4444'
        };
        return colors[difficulty] || '#578BF6';
    };

    /**
     * Получение текста сложности
     */
    const getDifficultyText = (difficulty) => {
        const texts = {
            easy: 'Легко',
            medium: 'Средне',
            hard: 'Сложно'
        };
        return texts[difficulty] || difficulty;
    };

    if (!task) {
        return (
            <div className="exam-task-empty">
                <HelpCircle size={48} color="#888" />
                <p>Задание не загружено</p>
            </div>
        );
    }

    return (
        <motion.div
            className="exam-task-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Заголовок задания */}
            <div className="exam-task-header">
                <div className="task-info">
                    <span className="task-number">Задание #{task.task_number}</span>
                    <span
                        className="task-difficulty"
                        style={{
                            backgroundColor: getDifficultyColor(task.difficulty) + '20',
                            color: getDifficultyColor(task.difficulty)
                        }}
                    >
                        {getDifficultyText(task.difficulty)}
                    </span>
                    <span className="task-points">
                        <Award size={16} />
                        {task.points} {task.points === 1 ? 'балл' : 'балла'}
                    </span>
                </div>

                <div className="task-timer">
                    <Clock size={16} />
                    <span>{formatTime(timeSpent)}</span>
                    {task.estimated_time && (
                        <span className="estimated-time">
                            / ~{task.estimated_time} мин
                        </span>
                    )}
                </div>
            </div>

            {/* Текст вопроса */}
            <div className="exam-task-question">
                <p>{task.question_text}</p>
            </div>

            {/* Варианты ответов */}
            <div className="exam-task-answers">
                {/* Single Choice */}
                {task.answer_type === 'single_choice' && task.answer_options && (
                    <div className="answer-options-grid">
                        {task.answer_options.map((option, index) => (
                            <motion.button
                                key={index}
                                className={`answer-option ${userAnswer === option ? 'selected' : ''} ${
                                    showResult && result ? (
                                        option === result.task.correct_answer ? 'correct' :
                                            option === userAnswer ? 'incorrect' : ''
                                    ) : ''
                                }`}
                                onClick={() => !isSubmitted && handleSingleChoiceSelect(option)}
                                disabled={isSubmitted}
                                whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                                whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                            >
                                <div className="option-marker">{option}</div>
                                <div className="option-text">{option}</div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Multiple Choice */}
                {task.answer_type === 'multiple_choice' && task.answer_options && (
                    <div className="answer-options-grid">
                        {task.answer_options.map((option, index) => (
                            <motion.button
                                key={index}
                                className={`answer-option checkbox ${
                                    selectedOptions.includes(option) ? 'selected' : ''
                                } ${
                                    showResult && result ? (
                                        result.task.correct_answer.split(',').includes(option) ? 'correct' :
                                            selectedOptions.includes(option) ? 'incorrect' : ''
                                    ) : ''
                                }`}
                                onClick={() => !isSubmitted && handleMultipleChoiceToggle(option)}
                                disabled={isSubmitted}
                                whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                                whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                            >
                                <div className="checkbox-marker">
                                    {selectedOptions.includes(option) && '✓'}
                                </div>
                                <div className="option-text">{option}</div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Number Input */}
                {task.answer_type === 'number' && (
                    <div className="answer-input-container">
                        <input
                            type="number"
                            className="answer-input number"
                            placeholder="Введите число"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isSubmitted}
                        />
                    </div>
                )}

                {/* Text Input */}
                {task.answer_type === 'text' && (
                    <div className="answer-input-container">
                        <textarea
                            className="answer-input text"
                            placeholder="Введите ваш ответ"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isSubmitted}
                            rows={4}
                        />
                    </div>
                )}
            </div>

            {/* Результат */}
            <AnimatePresence>
                {showResult && result && (
                    <motion.div
                        className={`exam-task-result ${result.is_correct ? 'correct' : 'incorrect'}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="result-header">
                            {result.is_correct ? (
                                <>
                                    <CheckCircle size={24} color="#43ff65" />
                                    <h3>Правильно! 🎉</h3>
                                </>
                            ) : (
                                <>
                                    <XCircle size={24} color="#ef4444" />
                                    <h3>Неправильно</h3>
                                </>
                            )}
                        </div>

                        <div className="result-details">
                            <p className="result-score">
                                Баллов: <strong>{result.points_earned}/{task.points}</strong>
                            </p>

                            {!result.is_correct && (
                                <p className="correct-answer">
                                    Правильный ответ: <strong>{result.task.correct_answer}</strong>
                                </p>
                            )}

                            {result.task.explanation && (
                                <div className="explanation">
                                    <h4>📝 Разбор:</h4>
                                    <p>{result.task.explanation}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Кнопки действий */}
            <div className="exam-task-actions">
                {!isSubmitted ? (
                    <motion.button
                        className="submit-answer-btn"
                        onClick={handleSubmit}
                        disabled={!isAnswerComplete()}
                        whileHover={isAnswerComplete() ? { scale: 1.02 } : {}}
                        whileTap={isAnswerComplete() ? { scale: 0.98 } : {}}
                    >
                        Проверить ответ
                    </motion.button>
                ) : (
                    <motion.button
                        className="next-task-btn"
                        onClick={onNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Следующее задание →
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default ExamTask;