// src/pages/SchoolPage/SchoolPage.jsx - Обновленная версия с роутингом к ОГЭ/ЕГЭ

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createChat } from "../../services/chatAPI.js";
import './SchoolPage.css';
import { useNotifications, NotificationContainer } from '../../components/Notification/Notification.jsx';
import { getStudyTools, getAgentPrompt, getAgentByAction } from '../../utils/aiAgentsUtils.js';
import { useUserProfile } from "../../services/userApi.js";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Страница инструментов для учебы с динамическим роутингом к ОГЭ/ЕГЭ
 */
const SchoolPage = ({ user }) => {
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('instruments');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [error, setError] = useState(null);
    const { notifications, removeNotification, showError } = useNotifications();

    // Получаем данные об образовании
    const { loadEducation } = useUserProfile(token);
    const [educationData, setEducationData] = useState({
        user_type: null,
        grade: null
    });

    // Получаем учебные инструменты из JSON конфигурации
    const studyTools = getStudyTools();

    // ============================================
    // ЗАГРУЗКА ОБРАЗОВАТЕЛЬНЫХ ДАННЫХ
    // ============================================

    useEffect(() => {
        const loadEducationData = async () => {
            if (!isAuthenticated || !token) return;

            try {
                console.log('📥 SchoolPage: Loading education data...');
                const data = await loadEducation();

                if (data) {
                    console.log('✅ SchoolPage: Education data loaded:', data);
                    setEducationData({
                        user_type: data.user_type,
                        grade: data.grade
                    });
                }
            } catch (error) {
                console.error('❌ SchoolPage: Error loading education:', error);
            }
        };

        if (isAuthenticated && token) {
            loadEducationData();
        }
    }, [isAuthenticated, token, loadEducation]);

    // ============================================
    // ФУНКЦИИ ОПРЕДЕЛЕНИЯ ТИПА ЭКЗАМЕНА
    // ============================================

    /**
     * Определить тип экзамена по классу
     */
    const getExamType = () => {
        if (!educationData.grade) return null;

        if (educationData.grade >= 7 && educationData.grade <= 9) {
            return 'ОГЭ';
        } else if (educationData.grade >= 10 && educationData.grade <= 11) {
            return 'ЕГЭ';
        }

        return null;
    };

    /**
     * Получить путь для роутинга к экзамену
     */
    const getExamRoute = () => {
        const examType = getExamType();

        if (examType === 'ОГЭ') {
            return '/exam-mode/oge';
        } else if (examType === 'ЕГЭ') {
            return '/exam-mode/ege';
        }

        return null;
    };

    /**
     * Получить текст кнопки экзамена
     */
    const getExamButtonText = () => {
        const examType = getExamType();

        if (examType === 'ОГЭ') {
            return 'Подготовка к ОГЭ';
        } else if (examType === 'ЕГЭ') {
            return 'Подготовка к ЕГЭ';
        }

        return 'Экзамены';
    };

    /**
     * Проверить доступность режима экзамена
     */
    const isExamModeAvailable = () => {
        return getExamRoute() !== null;
    };

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================

    /**
     * Обработчик клика по кнопке экзамена
     */
    const handleExamClick = () => {
        const route = getExamRoute();

        if (route) {
            console.log(`🎯 SchoolPage: Navigating to ${route}`);
            navigate(route);
        } else {
            console.warn('⚠️ SchoolPage: Exam mode not available for this grade');
            showError('Режим экзамена недоступен для вашего класса', {
                duration: 3000
            });
        }
    };

    /**
     * Обработчик клика по инструменту обучения
     */
    const handleToolClick = async (actionType) => {
        try {
            setError(null);
            console.log('🎯 Creating tool chat:', actionType);

            const actionConfig = getAgentByAction(actionType);
            if (!actionConfig) return;

            const agentPrompt = getAgentPrompt(actionType);
            const ChatCreateInfo = await createChat(actionConfig.label, actionType);

            if (!ChatCreateInfo.success) {
                throw new Error(ChatCreateInfo.error || 'Не удалось создать чат');
            }

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: actionType,
                    title: actionConfig.label,
                    agentPrompt: agentPrompt,
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            showError('Не удалось создать чат. Попробуйте ещё раз', {
                duration: 4000,
                showCloseButton: true
            });
        }
    };

    /**
     * Обработчик клика по тесту
     */
    const handleTestClick = (testId) => {
        navigate(`/test/${testId}`);
    };

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================

    /**
     * Получить цвет для предмета
     */
    const getSubjectColor = (subject) => {
        const colors = {
            'математика': '#ef4444',
            'русский язык': '#22c55e',
            'физика': '#3b82f6',
            'биология': '#10b981',
            'химия': '#f59e0b',
            'история': '#8b5cf6'
        };
        return colors[subject] || '#43ff65';
    };

    // Список предметов для фильтрации
    const subjects = [
        { id: 'all', name: 'Все' },
        { id: 'математика', name: 'Математика' },
        { id: 'русский язык', name: 'Русский' },
        { id: 'физика', name: 'Физика' },
        { id: 'биология', name: 'Биология' },
        { id: 'химия', name: 'Химия' },
        { id: 'история', name: 'История' }
    ];

    // Моковые данные тестов
    const testsData = {
        'discriminant_math': {
            id: 'discriminant_math',
            title: 'Дискриминант',
            subject: 'математика',
            date: '08.02.25',
            completedQuestions: 8,
            totalQuestions: 19
        },
        'roots_russian': {
            id: 'roots_russian',
            title: 'Корни дер/дир',
            subject: 'русский язык',
            date: '08.02.25',
            completedQuestions: 13,
            totalQuestions: 19
        }
    };

    const filteredTests = Object.values(testsData).filter(test => {
        if (selectedSubject === 'all') return true;
        return test.subject === selectedSubject;
    });

    // ============================================
    // РЕНДЕР
    // ============================================

    return (
        <>
            <motion.div
                className="home-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
            >
                <div className="home-container">
                    <motion.div
                        className="page-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1>Инструменты для учебы</h1>
                    </motion.div>

                    {/* Переключатель вкладок */}
                    <motion.div
                        className="tab-switcher"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.button
                            className={`tab-btn ${activeTab === 'instruments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('instruments')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Чат-боты
                        </motion.button>

                        <motion.button
                            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Тесты
                        </motion.button>

                        {/* Кнопка экзамена с динамическим текстом и роутингом */}
                        <motion.button
                            className={`tab-btn ${!isExamModeAvailable() ? 'disabled' : ''}`}
                            onClick={handleExamClick}
                            disabled={!isExamModeAvailable()}
                            whileHover={isExamModeAvailable() ? { scale: 1.05 } : {}}
                            whileTap={isExamModeAvailable() ? { scale: 0.95 } : {}}
                            title={!isExamModeAvailable() ? 'Доступно для 7-11 классов' : ''}
                        >
                            {getExamButtonText()}
                        </motion.button>
                    </motion.div>

                    {/* Контент вкладки "Чат-боты" */}
                    {activeTab === 'instruments' && (
                        <motion.div
                            className="tools-grid"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {studyTools.map((tool, index) => {
                                const IconComponent = tool.icon;
                                return (
                                    <motion.div
                                        key={tool.id}
                                        className="tool-card"
                                        onClick={() => handleToolClick(tool.action)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="tool-info">
                                            <div
                                                className="tool-icon-wrapper"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '12px'
                                                }}
                                            >
                                                <IconComponent
                                                    className="tool-icon"
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        color: tool.iconColor
                                                    }}
                                                />
                                            </div>
                                            <div className="tool-text">
                                                <h3 className="tool-title">{tool.label}</h3>
                                                <p className="tool-subtitle">{tool.subtitle}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="tool-arrow" />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Контент вкладки "Тесты" */}
                    {activeTab === 'tests' && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Фильтр по предметам */}
                            <div className="subjects-filter">
                                {subjects.map(subject => (
                                    <button
                                        key={subject.id}
                                        className={`subject-filter-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                                        onClick={() => setSelectedSubject(subject.id)}
                                        style={{
                                            borderColor: selectedSubject === subject.id
                                                ? getSubjectColor(subject.id)
                                                : 'transparent'
                                        }}
                                    >
                                        {subject.name}
                                    </button>
                                ))}
                            </div>

                            {/* Список тестов */}
                            <div className="tests-list">
                                {filteredTests.map((test, index) => (
                                    <motion.div
                                        key={test.id}
                                        className="test-card"
                                        onClick={() => handleTestClick(test.id)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="test-header">
                                            <span
                                                className="test-subject-badge"
                                                style={{
                                                    backgroundColor: getSubjectColor(test.subject) + '20',
                                                    color: getSubjectColor(test.subject)
                                                }}
                                            >
                                                {test.subject}
                                            </span>
                                            <span className="test-date">{test.date}</span>
                                        </div>

                                        <h3 className="test-title">{test.title}</h3>

                                        <div className="test-progress-info">
                                            <div className="test-progress-bar">
                                                <div
                                                    className="test-progress-fill"
                                                    style={{
                                                        width: `${(test.completedQuestions / test.totalQuestions) * 100}%`,
                                                        backgroundColor: getSubjectColor(test.subject)
                                                    }}
                                                />
                                            </div>
                                            <span className="test-progress-text">
                                                {test.completedQuestions}/{test.totalQuestions} вопросов
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {filteredTests.length === 0 && (
                                    <div className="no-tests-message">
                                        Тесты по выбранному предмету не найдены
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Контейнер уведомлений */}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </>
    );
};

export default SchoolPage;