// src/pages/TestPage/TestPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    X, Clock, Volume2, MessageCircle, RotateCcw
} from 'lucide-react';
import { getTestById } from '../../data/testData';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './TestPage.css';

const TestPage = () => {
    const navigate = useNavigate();
    const { testId } = useParams();
    const [testData, setTestData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const test = getTestById(testId);
        if (test) {
            setTestData(test);
            setTimeLeft(test.timeLimit);

            // Найти первый неотвеченный вопрос
            const firstUnanswered = test.questions.findIndex(q => !q.answered);
            if (firstUnanswered !== -1) {
                setCurrentQuestionIndex(firstUnanswered);
            }
        } else {
            navigate('/school');
        }
    }, [testId, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && testData) {
            handleFinishTest();
        }
    }, [timeLeft, testData]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = testData?.questions[currentQuestionIndex];

    const handleAnswerSelect = (optionId) => {
        if (isAnswered) return;
        setSelectedAnswer(optionId);
    };

    const handleTextAnswer = (value) => {
        setUserAnswer(value);
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestion) return;

        let isCorrect = false;

        if (currentQuestion.type === 'multiple_choice') {
            const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
            isCorrect = selectedOption?.isCorrect || false;
        } else if (currentQuestion.type === 'text_input') {
            isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
        }

        if (isCorrect) {
            setScore(score + 1);
        }

        setIsAnswered(true);
        setShowExplanation(true);

        // Обновляем данные вопроса
        const updatedQuestions = [...testData.questions];
        updatedQuestions[currentQuestionIndex] = {
            ...currentQuestion,
            answered: true,
            selectedAnswer: selectedAnswer,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        };

        setTestData({
            ...testData,
            questions: updatedQuestions,
            completedQuestions: updatedQuestions.filter(q => q.answered).length
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setUserAnswer('');
            setShowExplanation(false);
            setIsAnswered(false);
        } else {
            handleFinishTest();
        }
    };

    const handleFinishTest = () => {
        setShowResults(true);
    };

    const handleRetakeTest = () => {
        // Сброс состояния теста
        const resetQuestions = testData.questions.map(q => ({
            ...q,
            answered: false,
            selectedAnswer: null,
            userAnswer: '',
            isCorrect: null
        }));

        setTestData({
            ...testData,
            questions: resetQuestions,
            completedQuestions: 0
        });

        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserAnswer('');
        setShowExplanation(false);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
        setTimeLeft(testData.timeLimit);
    };

    const handleClose = () => {
        navigate('/school');
    };

    const handleSkipQuestion = () => {
        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setUserAnswer('');
            setShowExplanation(false);
            setIsAnswered(false);
        }
    };

    if (!testData) {
        return null;
    }

    if (showResults) {
        const percentage = Math.round((score / testData.questions.length) * 100);

        return (
            <motion.div
                className="test-page results-page"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="container">
                    <div className="results-header">
                        <motion.button
                            onClick={handleClose}
                            className="close-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="icon" />
                        </motion.button>
                        <h1 className="results-title">Тест завершен!</h1>
                    </div>

                    <motion.div
                        className="results-card"
                        variants={itemAnimation}
                    >
                        <div className="results-score">
                            <h2 className="score-text">{score}/{testData.questions.length}</h2>
                            <p className="percentage-text">{percentage}%</p>
                        </div>

                        <div className="results-info">
                            <h3 className="test-title">{testData.title}</h3>
                            <p className="test-subject">{testData.subject}</p>
                        </div>

                        <div className="results-actions">
                            <motion.button
                                onClick={handleRetakeTest}
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RotateCcw className="icon" />
                                Изучить тему еще раз
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="test-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="test-header"
                    variants={itemAnimation}
                >
                    <motion.button
                        onClick={handleClose}
                        className="close-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X className="icon" />
                    </motion.button>

                    <div className="test-info">
                        <h1 className="test-title">{testData.title}</h1>
                        <span className="test-subject">{testData.subject}</span>
                    </div>

                    <div className="timer">
                        <Clock className="timer-icon" />
                        <span className="timer-text">{formatTime(timeLeft)}</span>
                    </div>
                </motion.div>

                <motion.div
                    className="progress-section"
                    variants={itemAnimation}
                >
                    <div className="progress-text">
                        {currentQuestionIndex + 1}/{testData.questions.length}
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }}
                        />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion?.id}
                        className="question-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="question-header">
                            <span className="question-number">{currentQuestionIndex + 1}</span>
                            <h2 className="question-text">{currentQuestion?.question}</h2>
                            {currentQuestion?.hasVoice && (
                                <motion.button
                                    className="voice-btn"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Volume2 className="icon" />
                                </motion.button>
                            )}
                        </div>

                        {currentQuestion?.hasImage && (
                            <div className="question-image">
                                <img
                                    src={currentQuestion.imageUrl}
                                    alt="Question illustration"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div className="answers-section">
                            {currentQuestion?.type === 'multiple_choice' && (
                                <div className="multiple-choice">
                                    {currentQuestion.options.map((option, index) => (
                                        <motion.button
                                            key={option.id}
                                            className={`answer-option ${
                                                selectedAnswer === option.id ? 'selected' : ''
                                            } ${
                                                isAnswered && option.isCorrect ? 'correct' : ''
                                            } ${
                                                isAnswered && selectedAnswer === option.id && !option.isCorrect ? 'incorrect' : ''
                                            }`}
                                            onClick={() => handleAnswerSelect(option.id)}
                                            disabled={isAnswered}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        >
                                            <span className="option-number">{index + 1}</span>
                                            <span className="option-text">{option.text}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion?.type === 'text_input' && (
                                <div className="text-input-section">
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => handleTextAnswer(e.target.value)}
                                        placeholder="Введите ваш ответ..."
                                        className="text-answer-input"
                                        disabled={isAnswered}
                                    />

                                    {currentQuestion.options && (
                                        <div className="suggested-answers">
                                            {currentQuestion.options.map((suggestion, index) => (
                                                <motion.button
                                                    key={index}
                                                    className={`suggestion-btn ${
                                                        isAnswered && suggestion.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? 'correct' : ''
                                                    }`}
                                                    onClick={() => !isAnswered && setUserAnswer(suggestion)}
                                                    disabled={isAnswered}
                                                    whileHover={!isAnswered ? { scale: 1.05 } : {}}
                                                    whileTap={!isAnswered ? { scale: 0.95 } : {}}
                                                >
                                                    {suggestion}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {showExplanation && (
                            <motion.div
                                className="explanation-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="explanation-header">
                                    <MessageCircle className="icon" />
                                    <span>Объяснение</span>
                                </div>
                                <p className="explanation-text">{currentQuestion?.explanation}</p>
                            </motion.div>
                        )}

                        <div className="question-actions">
                            {!isAnswered ? (
                                <>
                                    <motion.button
                                        onClick={handleSubmitAnswer}
                                        className="btn btn-primary"
                                        disabled={
                                            (currentQuestion?.type === 'multiple_choice' && !selectedAnswer) ||
                                            (currentQuestion?.type === 'text_input' && !userAnswer.trim())
                                        }
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Ответить
                                    </motion.button>

                                    <motion.button
                                        onClick={handleSkipQuestion}
                                        className="btn btn-secondary"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Я не знаю
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    onClick={handleNextQuestion}
                                    className="btn btn-primary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {currentQuestionIndex < testData.questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default TestPage;