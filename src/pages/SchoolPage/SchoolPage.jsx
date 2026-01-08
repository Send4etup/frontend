// src/pages/SchoolPage/SchoolPage.jsx - Версия с поддержкой ОГЭ и ЕГЭ режимов

import React, {useEffect, useState} from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createChat } from "../../services/chatAPI.js";
import './SchoolPage.css';
import { useNotifications, NotificationContainer } from '../../components/Notification/Notification.jsx';
import {getStudyTools, getAgentPrompt, getAgentByAction} from '../../utils/aiAgentsUtils.js';
import ExamModePage from '../ExamModePage/ExamModePage.jsx';
import {useUserProfile} from "../../services/userApi.js";
import {useAuth} from "../../hooks/useAuth.js";

/**
 * Страница инструментов для учебы с поддержкой ОГЭ/ЕГЭ режимов
 * @param {Object} user - Данные пользователя
 */
const SchoolPage = ({ user }) => {
    const token = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('instruments');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [error, setError] = useState(null);
    const { notifications, removeNotification, showError } = useNotifications();

    // Получаем учебные инструменты из JSON конфигурации
    const studyTools = getStudyTools();

    // Список предметов для фильтрации тестов
    const subjects = [
        { id: 'all', name: 'Все' },
        { id: 'математика', name: 'Математика' },
        { id: 'русский язык', name: 'Русский' },
        { id: 'физика', name: 'Физика' },
        { id: 'биология', name: 'Биология' },
        { id: 'химия', name: 'Химия' },
        { id: 'история', name: 'История' }
    ];

    /**
     * Обработчик клика по инструменту обучения
     * Создает новый чат с соответствующим типом и промптом
     */
    const handleToolClick = async (actionType) => {
        try {
            setError(null);

            console.log('🎯 Creating tool chat:', actionType);

            const actionConfig = getAgentByAction(actionType);
            if (!actionConfig) return;

            const agentPrompt = getAgentPrompt(actionType);
            console.log('Agent prompt for', actionType, ':', agentPrompt);

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

            // Показываем уведомление об ошибке
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

    return (
        <>
            <motion.div
                className="home-page"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                transition={{duration: 0.5}}
            >

                <div className="home-container">
                    <motion.div
                        className="page-title"
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        <h1>Инструменты для учебы</h1>
                    </motion.div>

                    {/* Переключатель вкладок с ОГЭ и ЕГЭ */}
                    <motion.div
                        className="tab-switcher"
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                    >
                        <motion.button
                            className={`tab-btn ${activeTab === 'instruments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('instruments')}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Чат-боты
                        </motion.button>
                        <motion.button
                            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Тесты
                        </motion.button>
                        <motion.button
                            className={`tab-btn ${activeTab === 'oge' ? 'active' : ''}`}
                            onClick={() => navigate('/exam-mode')}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Подготовка к {
                            user?.grade >= 7 && user?.grade <= 9
                                ? 'ОГЭ'
                                : user?.grade >= 10 && user?.grade <= 11
                                    ? 'ЕГЭ'
                                    : ' '
                        }
                        </motion.button>
                    </motion.div>

                    {/* Контент вкладки "Чат-боты" */}
                    {activeTab === 'instruments' && (
                        <motion.div
                            className="tools-grid"
                            initial={{opacity: 0, y: 30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3}}
                        >
                            {studyTools.map((tool, index) => {
                                const IconComponent = tool.icon;
                                return (
                                    <motion.div
                                        key={tool.id}
                                        className="tool-card"
                                        onClick={() => handleToolClick(tool.action)}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        whileHover={{scale: 1.02, x: 5}}
                                        whileTap={{scale: 0.98}}
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
                                        <ChevronRight className="tool-arrow"/>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Контент вкладки "Тесты" */}
                    {activeTab === 'tests' && (
                        <motion.div
                            initial={{opacity: 0, y: 30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3}}
                        >
                            {/* Фильтр по предметам */}
                            <div className="subjects-filter">
                                <div className="subjects-scroll">
                                    {subjects.map((subject) => (
                                        <button
                                            key={subject.id}
                                            className={`subject-chip ${selectedSubject === subject.id ? 'active' : ''}`}
                                            onClick={() => setSelectedSubject(subject.id)}
                                        >
                                            {subject.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Список тестов */}
                            <div className="tests-grid">
                                {filteredTests.map((test, index) => (
                                    <motion.div
                                        key={test.id}
                                        className="task-card"
                                        onClick={() => handleTestClick(test.id)}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        whileHover={{scale: 1.02, x: 5}}
                                        whileTap={{scale: 0.98}}
                                    >
                                        <div className="task-header">
                                            <div className="task-info">
                                                <h3 className="task-title">{test.title}</h3>
                                                <div className="task-meta">
                                                <span
                                                    className="task-subject"
                                                    style={{
                                                        backgroundColor: getSubjectColor(test.subject),
                                                        color: '#000',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {test.subject}
                                                </span>
                                                    <span className="task-date">{test.date}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="task-arrow"/>
                                        </div>

                                        <div className="task-progress">
                                            <div className="progress-info">
                                            <span className="progress-text">
                                                {test.completedQuestions}/{test.totalQuestions}
                                            </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${(test.completedQuestions / test.totalQuestions) * 100}%`,
                                                        backgroundColor: '#43ff65'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Контент вкладки "ОГЭ" */}
                    {activeTab === 'oge' && (
                        <ExamModePage examType="ОГЭ" user={user} />
                    )}

                    {/* Контент вкладки "ЕГЭ" */}
                    {activeTab === 'ege' && (
                        <ExamModePage examType="ЕГЭ" user={user} />
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default SchoolPage;