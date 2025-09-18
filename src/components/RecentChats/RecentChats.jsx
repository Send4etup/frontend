// src/components/RecentChats/RecentChats.jsx - Обновленная версия с кнопкой "Посмотреть все"

import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './RecentChats.css';
import { getUserChats } from '../../services/chatAPI.js';
import {getAgentByAction, getAgentPrompt} from '../../utils/aiAgentsUtils.js';

const RecentChats = ({ onChatClick }) => {
    const navigate = useNavigate();
    const [allChats, setAllChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const getChatIcon = (chatType) => {
        const agentConfig = getAgentByAction(chatType);
        if (agentConfig && agentConfig.icon) {
            const IconComponent = agentConfig.icon;
            return {
                icon: IconComponent,
                color: agentConfig.iconColor
            };
        }
        // Fallback если не найдена
        return {
            icon: MessageCircle,
            color: '#43ff65'
        };
    };

    // Загружаем только первые 3 чата для главной страницы
    useEffect(() => {
        loadRecentChats();
    }, []);

    const loadRecentChats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getUserChats(3); // Только 3 последних чата

            if (response.success) {
                setAllChats(response.data);
            } else {
                setError('Не удалось загрузить чаты');
                setAllChats([]);
            }
        } catch (err) {
            console.error('Failed to load recent chats:', err);
            setError('Произошла ошибка при загрузке чатов');
            setAllChats([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} мин назад`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ч назад`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return `${diffInDays} д назад`;
            } else {
                return date.toLocaleDateString('ru-RU');
            }
        }
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'general': '#43ff65',
            'coding': '#22c55e',
            'brainstorm': '#3b82f6',
            'images': '#ec4899',
            'excuses': '#f59e0b',
            'study_tools': '#8b5cf6'
        };
        return typeColors[type] || '#43ff65';
    };

    const getTypeLabel = (type) => {
        const typeLabels = {
            'general': 'Общий',
            'coding': 'Кодинг',
            'brainstorm': 'Брейншторм',
            'images': 'Изображения',
            'excuses': 'Отмазки',
            'study_tools': 'Учеба'
        };
        return typeLabels[type] || 'Чат';
    };

    const handleChatClick = (chatId) => {
        if (onChatClick) {
            onChatClick(chatId);
        } else {
            navigate(`/chat/${chatId}`);
        }
    };

    const handleViewAllChats = () => {
        navigate('/chats-history');
    };

    if (loading) {
        return (
            <div className="recent-chats">
                <div className="recent-chats-header">
                    <h3 className="recent-chats-title">Последние чаты</h3>
                </div>
                <div className="chats-loading">
                    <div className="loading-skeleton" />
                    <div className="loading-skeleton" />
                    <div className="loading-skeleton" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recent-chats">
                <div className="recent-chats-header">
                    <h3 className="recent-chats-title">Последние чаты</h3>
                </div>
                <div className="chats-error">
                    <p>Не удалось загрузить чаты</p>
                    <button onClick={loadRecentChats} className="retry-btn">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (allChats.length === 0) {
        return (
            <div className="recent-chats">
                <div className="recent-chats-header">
                    <h3 className="recent-chats-title">Последние чаты</h3>
                </div>
                <div className="recent-chats-empty">
                    <MessageCircle className="empty-icon" />
                    <p>Пока нет истории чатов</p>
                    <span>Начните общение, задав вопрос выше</span>
                </div>
            </div>
        );
    }

    return (
        <div className="recent-chats">
            <div className="recent-chats-headers">
                <h3 className="recent-chats-title">Последние чаты</h3>
                <div
                    className="view-all-btns"
                    onClick={handleViewAllChats}
                    title="Посмотреть все чаты"
                >
                    <History className="view-all-icon" />
                    <p>Посмотреть все</p>
                    {/*<ChevronRight className="chevron-icon" />*/}
                </div>
            </div>

            <div className="chats-list">
                <AnimatePresence mode="popLayout">
                    {allChats.map((chat, index) => {
                        const { icon: IconComponent, color } = getChatIcon(chat.type);
                        const agentPrompt = getAgentPrompt(chat.type);

                        return (
                            <motion.div
                                key={chat.chat_id}
                                className="chat-item"
                                onClick={() => {
                                    navigate(`/chat/${chat.chat_id}`, {
                                        state: {
                                            chatType: chat.type,
                                            title: chat.title,
                                            agentPrompt: agentPrompt,
                                        }
                                    });
                                }}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                transition={{delay: index * 0.05}}
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                            >
                                {/* ✅ ИКОНКА ИЗ JSON С ЦВЕТОМ */}
                                <div className="chat-icons">
                                    <IconComponent
                                        className="icon"
                                        style={{ color: color }}
                                    />
                                </div>

                                <div className="chat-content">
                                    <div className="card-chat-title-header">
                                        <h4 className="chat-title">{chat.title}</h4>
                                    </div>

                                    <div className="card-last-message">
                                        {chat.last_message && (
                                            <p className="last-message">
                                                {chat.last_message.length > 60
                                                    ? chat.last_message.substring(0, 60) + '...'
                                                    : chat.last_message}
                                            </p>
                                        )}
                                    </div>


                                </div>

                                <div className="chat-arrow">
                                    <ChevronRight className="arrow-icon"/>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RecentChats;