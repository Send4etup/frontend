// src/components/RecentChats/RecentChats.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock } from 'lucide-react';
import './RecentChats.css';

const RecentChats = ({ onChatClick }) => {
    const [visibleCount, setVisibleCount] = useState(3);

    // Расширенные моковые данные для демонстрации
    const allChats = [
        {
            id: 1,
            title: 'Что такое квадратный корень',
            lastMessage: 'Арифметический квадратный корень из неотрицательного числа a — это неотрицательное число, квадрат которого равен a.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
            subject: 'математика'
        },
        {
            id: 2,
            title: 'Помощь с сочинением',
            lastMessage: 'Давайте разберем структуру сочинения по литературе...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
            subject: 'русский язык'
        },
        {
            id: 3,
            title: 'Разбор задачи по физике',
            lastMessage: 'Для решения этой задачи нужно использовать закон сохранения энергии...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 день назад
            subject: 'физика'
        },
        {
            id: 4,
            title: 'Создание изображения кота',
            lastMessage: 'Создам для тебя милого котика в мультяшном стиле...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 дня назад
            subject: 'творчество'
        },
        {
            id: 5,
            title: 'Программирование на Python',
            lastMessage: 'Разберем основы циклов и условных операторов...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 дня назад
            subject: 'программирование'
        },
        {
            id: 6,
            title: 'Подготовка к экзамену по химии',
            lastMessage: 'Повторим основные химические реакции и их типы...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 дня назад
            subject: 'химия'
        },
        {
            id: 7,
            title: 'Мозговой штурм для проекта',
            lastMessage: 'Придумаем креативные идеи для твоего YouTube канала...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 дней назад
            subject: 'творчество'
        },
        {
            id: 8,
            title: 'Разбор ошибок в домашке',
            lastMessage: 'Найдем и исправим ошибки в твоем решении...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 дней назад
            subject: 'математика'
        },
        {
            id: 9,
            title: 'Написание эссе по истории',
            lastMessage: 'Структурируем твои мысли по теме Великой Отечественной войны...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 дней назад
            subject: 'история'
        },
        {
            id: 10,
            title: 'Поддержка перед экзаменом',
            lastMessage: 'Ты отлично справишься! Вот несколько техник для снятия стресса...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 дней назад
            subject: 'поддержка'
        }
    ];

    const formatTime = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} мин назад`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ч назад`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} д назад`;
        }
    };

    const getSubjectColor = (subject) => {
        switch(subject) {
            case 'математика': return '#ef4444';
            case 'русский язык': return '#22c55e';
            case 'физика': return '#3b82f6';
            case 'биология': return '#10b981';
            case 'химия': return '#f59e0b';
            case 'история': return '#8b5cf6';
            case 'программирование': return '#06b6d4';
            case 'творчество': return '#ec4899';
            case 'поддержка': return '#f97316';
            default: return '#43ff65';
        }
    };

    const handleChatClick = (chatId) => {
        if (onChatClick) {
            onChatClick(chatId);
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 5, allChats.length));
    };

    const visibleChats = allChats.slice(0, visibleCount);
    const hasMoreChats = visibleCount < allChats.length;

    if (allChats.length === 0) {
        return (
            <div className="recent-chats-empty">
                <MessageCircle className="empty-icon" />
                <p>Пока нет истории чатов</p>
                <span>Начните общение, задав вопрос выше</span>
            </div>
        );
    }

    return (
        <div className="recent-chats">
            <h3 className="recent-chats-title">Последние чаты</h3>
            <div className="chats-list">
                {visibleChats.map((chat, index) => (
                    <motion.div
                        key={chat.id}
                        className="chat-item"
                        onClick={() => handleChatClick(chat.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="chat-icon">
                            <MessageCircle className="icon" />
                        </div>

                        <div className="chat-content">
                            <div className="chat-title-header">
                                <h4 className="chat-title">{chat.title}</h4>
                                <div className="chat-meta">
                                    <span
                                        className="chat-subject"
                                        style={{ backgroundColor: getSubjectColor(chat.subject) }}
                                    >
                                        {chat.subject}
                                    </span>
                                    <div className="chat-time">
                                        <Clock className="time-icon" />
                                        <span>{formatTime(chat.timestamp)}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="chat-preview">{chat.lastMessage}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {hasMoreChats && (
                <motion.button
                    className="view-all-btn"
                    onClick={handleShowMore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Посмотреть все ({allChats.length - visibleCount} ещё)
                </motion.button>
            )}
        </div>
    );
};

export default RecentChats;