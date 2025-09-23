// src/pages/HomePage/HomePage.jsx - Обновленная версия с использованием JSON конфигурации

import React, { useState, useEffect } from 'react';
import { Send, ChevronRight, History, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { createChat, getUserChats } from "../../services/chatAPI.js";
import RecentChats from "../../components/RecentChats/RecentChats.jsx";

// ✅ ИМПОРТИРУЕМ АГЕНТОВ ИЗ JSON
import {getQuickActions, getAgentPrompt, getAgentByAction} from '../../utils/aiAgentsUtils.js';

// Встроенные компоненты остаются те же...
const SimpleProgressBar = ({ current, max, color = "#43ff65" }) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
        <div className="progress-bar">
            <div
                className="progress-fill"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    height: '6px',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                }}
            />
        </div>
    );
};

const DAILY_QUOTES = [
    "Образование — самое мощное оружие, которое можно использовать, чтобы изменить мир",
    "Учиться никогда не поздно, а рано — никогда не вредно",
    "Знание — сила, но практика — мастерство",
    "Каждый день — новая возможность узнать что-то интересное",
    "Лучшее время для обучения — прямо сейчас!"
];

const HomePage = ({ user: currentUser }) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dailyQuote] = useState(() => {
        const today = new Date().getDate();
        return DAILY_QUOTES[today % DAILY_QUOTES.length];
    });

    // ✅ ПОЛУЧАЕМ БЫСТРЫЕ ДЕЙСТВИЯ ИЗ JSON
    const quickActions = getQuickActions();

    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const dbChatHistory = await getUserChats(3);

            if (dbChatHistory.success) {
                setChatHistory(dbChatHistory.data);
                console.log('Chat history loaded:', dbChatHistory);
            } else {
                console.error('Failed to load chat history:', error);
                setError('Не удалось загрузить историю чатов');
                setChatHistory([]);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            setError('Не удалось загрузить историю чатов');
            setChatHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!inputValue.trim() || isLoading) return;

        setIsLoading(true);

        try {
            setError(null);
            console.log('Mock: sending quick message:', inputValue);

            const ChatCreateInfo = await createChat('Обычный чат', 'general');
            const messageToSend = inputValue.trim();
            setInputValue('');

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: 'general',
                    title: 'Общий чат',
                    initialMessage: messageToSend,
                    agentPrompt: 'Обычный чат с учеником',
                }
            });

        } catch (error) {
            console.error('Failed to send quick message:', error);
            setError('Не удалось отправить сообщение');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (actionType) => {
        try {
            setError(null);

            // ✅ НАХОДИМ КОНФИГУРАЦИЮ ДЕЙСТВИЯ В JSON
            const actionConfig = getAgentByAction(actionType);
            if (!actionConfig) return;

            // ✅ ПОЛУЧАЕМ ПРОМПТ ИЗ КОНФИГУРАЦИИ
            const agentPrompt = getAgentPrompt(actionType);
            console.log('Agent prompt for', actionType, ':', agentPrompt);

            const ChatCreateInfo = await createChat(actionConfig.label, actionType);

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: actionType,
                    title: actionConfig.label,
                    agentPrompt: agentPrompt // ✅ Передаем промпт в чат
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            setError('Не удалось создать чат');
        }
    };

    const telegramsave = window.Telegram.WebApp.initData;

    return (
        <div className="home-page">
            <div className="container">
                {/* Заголовок с приветствием */}
                <div className="welcome-section">
                    <h1 className="welcome-message">
                        Чем я могу тебе сегодня помочь?
                    </h1>

                    <div className="quatation">
                        <p className="quote">{dailyQuote}</p>
                        <p className="quote-author">
                            — Привет, {currentUser?.telegram?.username || 'друг'}!
                        </p>
                    </div>
                </div>

                <div className="panel">
                    {/* Поле ввода */}
                    <div className="input-section">
                        <form onSubmit={handleQuickSubmit}>
                            <div className="input-container">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Что тебя интересует?"
                                    className="main-input"
                                />
                                <div className="input-actions">
                                    <button
                                        type="submit"
                                        className="send-button"
                                        disabled={!inputValue.trim() || isLoading}
                                        style={{
                                            background: '#43ff65',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            color: '#000'
                                        }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* ✅ БЫСТРЫЕ ДЕЙСТВИЯ ИЗ JSON */}
                    <div className="quick-actions">
                        {quickActions.map((action) => {
                            const IconComponent = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    className="quick-action-btn"
                                    onClick={() => handleQuickAction(action.action)}
                                >
                                    <IconComponent
                                        className="quick-action-icon"
                                        style={{ color: action.iconColor }}
                                    />
                                    <p className="quick-action-label">{action.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Последние чаты */}
                <div style={{ marginTop: '35px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#4d1a1a',
                            borderRadius: '8px',
                            color: '#ff6b6b',
                            fontSize: '14px',
                            marginBottom: '15px'
                        }}>
                            {error}
                            <button
                                onClick={loadChatHistory}
                                style={{
                                    marginLeft: '10px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#43ff65',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Попробовать снова
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            color: '#666'
                        }}>
                            <div className="loading-spinner" />
                            <span style={{ marginLeft: '10px' }}>Загрузка истории чатов...</span>
                        </div>
                    ) : (
                        <RecentChats
                            chats={chatHistory}
                            onChatClick={(chatId) => navigate(`/chat/${chatId}`)}
                        />
                    )}
                </div>
            </div>

            {/* CSS анимации */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #2a2a2a;
                    border-top: 2px solid #43ff65;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .progress-bar {
                    background-color: #2a2a2a;
                    height: 6px;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 24px auto;
                    max-width: 280px;
                }
            `}</style>
        </div>
    );
};

export default HomePage;