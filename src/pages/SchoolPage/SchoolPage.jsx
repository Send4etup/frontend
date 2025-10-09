// src/pages/SchoolPage/SchoolPage.jsx - Обновленная версия с использованием JSON конфигурации

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createChat } from "../../services/chatAPI.js";
import './SchoolPage.css';
import { useNotifications, NotificationContainer } from '../../components/Notification/Notification.jsx';

// ✅ ИМПОРТИРУЕМ АГЕНТОВ ИЗ JSON
import {getStudyTools, getAgentPrompt, getAgentByAction} from '../../utils/aiAgentsUtils.js';

const SchoolPage = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('instruments');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [error, setError] = useState(null);
    const { notifications, removeNotification, showError } = useNotifications();

    // ✅ ПОЛУЧАЕМ УЧЕБНЫЕ ИНСТРУМЕНТЫ ИЗ JSON
    const studyTools = getStudyTools();

    const subjects = [
        { id: 'all', name: 'Все' },
        { id: 'математика', name: 'Математика' },
        { id: 'русский язык', name: 'Русский' },
        { id: 'физика', name: 'Физика' },
        { id: 'биология', name: 'Биология' },
        { id: 'химия', name: 'Химия' },
        { id: 'история', name: 'История' }
    ];

    // const handleToolClick = async (tool) => {
    //     try {
    //         setError(null); // Добавить если есть состояние error
    //
    //         console.log('🎯 Creating tool chat:', tool.action);
    //
    //         // ✅ ПОЛУЧАЕМ ПРОМПТ ИЗ JSON КОНФИГУРАЦИИ
    //         const agentPrompt = getAgentPrompt(tool.action);
    //         console.log('Agent prompt for', tool.action, ':', agentPrompt);
    //
    //         // ✅ СОЗДАЕМ ЧАТ ЧЕРЕЗ API (как в HomePage)
    //         const ChatCreateInfo = await createChat(tool.label, tool.action);
    //
    //         navigate(`/chat/${ChatCreateInfo.chat_id}`, {
    //             state: {
    //                 chatType: tool.action,
    //                 toolConfig: tool,
    //                 title: tool.label,
    //                 agentPrompt: agentPrompt, // ✅ Передаем промпт в чат
    //                 initialMessage: `Начинаем работу: ${tool.label}`
    //             }
    //         });
    //
    //     } catch (error) {
    //         console.error('Failed to create tool chat:', error);
    //         setError('Не удалось создать чат'); // Добавить если есть состояние error
    //         // Fallback навигация
    //         navigate(`/chat/demo_${tool.id}`);
    //     }
    // };

    const handleToolClick = async (actionType) => {
        try {
            setError(null); // Добавить если есть состояние error

            console.log('🎯 Creating tool chat:', actionType);

            // ✅ НАХОДИМ КОНФИГУРАЦИЮ ДЕЙСТВИЯ В JSON
            const actionConfig = getAgentByAction(actionType);
            if (!actionConfig) return;

            // ✅ ПОЛУЧАЕМ ПРОМПТ ИЗ JSON КОНФИГУРАЦИИ
            const agentPrompt = getAgentPrompt(actionType);
            console.log('Agent prompt for', actionType, ':', agentPrompt);

            // ✅ СОЗДАЕМ ЧАТ ЧЕРЕЗ API (как в HomePage)
            const ChatCreateInfo = await createChat(actionConfig.label, actionType);

            // ✅ ПРОВЕРЯЕМ УСПЕШНОСТЬ СОЗДАНИЯ ЧАТА
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

            // ✅ ПОКАЗЫВАЕМ УВЕДОМЛЕНИЕ ОБ ОШИБКЕ
            showError('Не удалось создать чат. Попробуйте ещё раз', {
                duration: 4000,
                showCloseButton: true
            });
        }
    };

    const handleTestClick = (testId) => {
        navigate(`/test/${testId}`);
    };

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
            {/* ✅ КОНТЕЙНЕР ДЛЯ УВЕДОМЛЕНИЙ */}
            {/*<NotificationContainer*/}
            {/*    notifications={notifications}*/}
            {/*    onRemove={removeNotification}*/}
            {/*/>*/}
            <motion.div
                className="school-page"
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

                    {/* Переключатель вкладок */}
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
                            Инструменты
                        </motion.button>
                        <motion.button
                            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Тесты
                        </motion.button>
                    </motion.div>

                    {/* Контент вкладок */}
                    {activeTab === 'instruments' ? (
                        /* ✅ ИНСТРУМЕНТЫ ИЗ JSON */
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
                    ) : (
                        /* Тесты */
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
                </div>
            </motion.div>
        </>
    );
};

export default SchoolPage;