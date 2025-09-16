// src/pages/HomePage/HomePage.jsx - ПОЛНАЯ ВЕРСИЯ С ЗАГРУЗКОЙ ДОПОЛНИТЕЛЬНЫХ ЧАТОВ
import React, { useState, useEffect } from 'react';
import { Camera, Headphones, Image, FileText, Brain, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import {createChat, getUserChats} from "../../services/chatAPI.js";

// =====================================================
// ВСТРОЕННЫЕ КОМПОНЕНТЫ (вместо импортов)
// =====================================================

// Простой ProgressBar компонент
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

// Простой LoadingSpinner компонент
const SimpleLoadingSpinner = ({ size = 'medium' }) => {
    const sizeMap = {
        small: '16px',
        medium: '24px',
        large: '32px'
    };

    return (
        <div
            className="loading-spinner"
            style={{
                width: sizeMap[size],
                height: sizeMap[size],
                border: '2px solid #2a2a2a',
                borderTop: '2px solid #43ff65',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
    );
};

// Простой RecentChats компонент
const SimpleRecentChats = ({ chats, onChatClick }) => {
    const navigate = useNavigate();

    if (!chats || chats.length === 0) {
        return (
            <div className="empty-chats">
                <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>
                    Пока нет чатов. Создайте первый!
                </p>
            </div>
        );
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return (
        <div className="recent-chats">
            {chats.map((chat) => (
                <div
                    key={chat.chat_id}
                    className="chat-item"
                    onClick={() => {
                        navigate(`/chat/${chat.chat_id}`, {
                            state: {
                                chatType: chat.type,
                                title: chat.title,
                            }
                        });
                    }}
                    // onClick={() => onChatClick(chat.chat_id)}
                    style={{
                        padding: '16px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#222';
                        e.currentTarget.style.borderColor = '#43ff65';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'left',
                            }}>
                                {chat.title}
                            </h4>
                            <p style={{
                                margin: 0,
                                color: '#888',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                textAlign: 'left',
                            }}>
                                {chat.last_message}
                            </p>
                        </div>
                        <span style={{
                            color: '#666',
                            fontSize: '12px',
                            marginLeft: '12px'
                        }}>
                            {formatDate(chat.updated_at)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// =====================================================
// МОКОВЫЕ ДАННЫЕ
// =====================================================

// const MOCK_CHAT_HISTORY = [
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Сделать конспект',
//         lastMessage: 'Решаем квадратные уравнения',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'make_notes'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Сделать конспект',
//         lastMessage: 'Создайте картинку кота в космосе',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'image'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Сделать конспект',
//         lastMessage: 'Как сделать цикл for?',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'coding'
//     }
// ];
//
// const ADDITIONAL_MOCK_CHATS = [
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Анализ стихотворения',
//         lastMessage: 'Разбираем "Евгений Онегин" Пушкина',
//         updated_at: '2022-09-07 11:00:35',
//         type: 'literature'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Помощь с физикой',
//         lastMessage: 'Законы Ньютона и их применение',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'physics'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Подготовка к ЕГЭ',
//         lastMessage: 'Решаем задачи по химии',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'exam'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Дизайн презентации',
//         lastMessage: 'Создаем крутые слайды для доклада',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'design'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Изучение английского',
//         lastMessage: 'Неправильные глаголы и времена',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'language'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Изучение английского',
//         lastMessage: 'Неправильные глаголы и времена',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'language'
//     },
//     {
//         chat_id: 'c0226f0a-e2ea-4588-99ee-6c6132f95510',
//         title: 'Изучение английского',
//         lastMessage: 'Неправильные глаголы и времена',
//         updated_at: '2025-09-07 11:00:35',
//         type: 'language'
//     }
// ];

const DAILY_QUOTES = [
    "Образование — самое мощное оружие, которое можно использовать, чтобы изменить мир",
    "Учиться никогда не поздно, а рано — никогда не вредно",
    "Знание — сила, но практика — мастерство",
    "Каждый день — новая возможность узнать что-то интересное",
    "Лучшее время для обучения — прямо сейчас!"
];

// =====================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// =====================================================

const HomePage = ({ user: currentUser }) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [allChatsLoaded, setAllChatsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [dailyQuote] = useState(() => {
        const today = new Date().getDate();
        return DAILY_QUOTES[today % DAILY_QUOTES.length];
    });

    // Быстрые действия для главной страницы
    const quickActions = [
        {
            id: 1,
            action: 'image',
            label: 'Создать изображение',
            icon: Image,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            description: 'Генерация изображений с помощью ИИ'
        },
        {
            id: 2,
            action: 'coding',
            label: 'Кодинг',
            icon: FileText,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            description: 'Помощь в программировании'
        },
        {
            id: 3,
            action: 'brainstorm',
            label: 'Брейншторм',
            icon: Brain,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            description: 'Генерация идей и креативное мышление'
        },
        {
            id: 4,
            action: 'excuse',
            label: 'Придумать отмазку',
            icon: Headphones,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            description: 'Креативные оправдания и отговорки'
        }
    ];

    // Имитация загрузки истории чатов
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Ждём данные из getUserChats
            const dbChatHistory = await getUserChats();

            // Передаём уже готовый массив/объект в setChatHistory
            if (dbChatHistory.success) {
                setChatHistory(dbChatHistory.data);

                console.log('Chat history loaded:', dbChatHistory);
            } else {
                console.error('Failed to load chat history:', error);
                setError('Не удалось загрузить историю чатов');
                setChatHistory([]); // сброс в пустой массив
            }

        } catch (error) {
            console.error('Failed to load chat history:', error);
            setError('Не удалось загрузить историю чатов');
            setChatHistory([]); // сброс в пустой массив
        } finally {
            setIsLoading(false);
        }
    };

    // Загрузка дополнительных чатов
    const loadMoreChats = async () => {
        if (allChatsLoaded || isLoadingMore) return;

        setIsLoadingMore(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setChatHistory(prev => [...prev, ...ADDITIONAL_MOCK_CHATS]);
            setAllChatsLoaded(true);
            console.log('Additional mock chats loaded');
        } catch (error) {
            console.error('Failed to load more chats:', error);
            setError('Не удалось загрузить дополнительные чаты');
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Обработка отправки быстрого сообщения
    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!inputValue.trim() || isLoading) return;

        setIsLoading(true);

        try {
            setError(null);
            console.log('Mock: sending quick message:', inputValue);

            const ChatCreateInfo = createChat('Обычный чат', 'general');

            const messageToSend = inputValue.trim();

            setInputValue('');

            // navigate(`/chat/${chat_id}`, {
            //     state: {
            //         initialMessage: messageToSend,
            //     }
            // });

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: 'general',
                    title: 'Общий чат',
                    initialMessage: messageToSend,
                }
            });


        } catch (error) {
            console.error('Failed to send quick message:', error);
            setError('Не удалось отправить сообщение');
        } finally {
            setIsLoading(false);
        }
    };

    // Обработка нажатия на быстрое действие
    const handleQuickAction = async (actionType) => {
        try {
            setError(null);

            const actionConfig = quickActions.find(action => action.action === actionType);
            if (!actionConfig) return;

            const titles = {
                'image': 'Создать изображение',
                'coding': 'Написать код',
                'brainstorm': 'Обдумать тему',
                'excuse': 'Придумать отмазку',
            }

            const title = titles[actionType] ?? 'Обычный чат';


            const ChatCreateInfo = createChat(title, actionType);


            console.log('Mock: creating tool chat:', actionType);

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: actionType,
                    title: actionConfig.label
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            setError('Не удалось создать чат');
        }
    };

    // Рендер кнопки загрузки дополнительных чатов
    const renderLoadMoreButton = () => {
        if (allChatsLoaded) {
            return
        }

        return (
            <button
                onClick={loadMoreChats}
                disabled={isLoadingMore}
                style={{
                    background: 'none',
                    border: '1px solid #333',
                    color: '#43ff65',
                    fontSize: '14px',
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                onMouseEnter={(e) => {
                    if (!isLoadingMore) {
                        e.target.style.borderColor = '#43ff65';
                        e.target.style.backgroundColor = 'rgba(67, 255, 101, 0.05)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoadingMore) {
                        e.target.style.borderColor = '#333';
                        e.target.style.backgroundColor = 'transparent';
                    }
                }}
            >
                {isLoadingMore ? (
                    <>
                        <SimpleLoadingSpinner size="small" />
                        <span>Загрузка...</span>
                    </>
                ) : (
                    <>
                        <span>Показать ещё 5 чатов</span>
                    </>
                )}
            </button>
        );
    };

    // Пользовательские данные с fallback
    // const userDisplayName = currentUser?.display_name || currentUser?.username || 'Друг';
    // const userEnergy = currentUser?.tokens_balance || 85;
    // const maxEnergy = 100;

    return (
        <div className="home-page">
            <div className="container">
                {/* Заголовок с приветствием */}
                <div className="welcome-section">
                    <h1 className="welcome-message">
                        Чем я могу тебе сегодня помочь?
                    </h1>
                    <div className="quatation">
                        <p className="quote">
                            {dailyQuote}
                        </p>
                        <p className="quote-author">
                            — Привет, {currentUser.telegram.username}!

                            {currentUser.telegram.hash}
                        </p>
                    </div>
                </div>

                {/* Прогрессбар энергии */}
                {/*<div className="progress-bar">*/}
                {/*    <div style={{*/}
                {/*        display: 'flex',*/}
                {/*        justifyContent: 'space-between',*/}
                {/*        alignItems: 'center',*/}
                {/*        marginBottom: '8px',*/}
                {/*        fontSize: '14px',*/}
                {/*        color: '#888'*/}
                {/*    }}>*/}
                {/*        <span>Энергия</span>*/}
                {/*        <span>{userEnergy}/{maxEnergy}</span>*/}
                {/*    </div>*/}
                {/*    <div style={{*/}
                {/*        width: '100%',*/}
                {/*        height: '6px',*/}
                {/*        backgroundColor: '#2a2a2a',*/}
                {/*        borderRadius: '3px',*/}
                {/*        overflow: 'hidden'*/}
                {/*    }}>*/}
                {/*        <SimpleProgressBar current={userEnergy} max={maxEnergy} />*/}
                {/*    </div>*/}
                {/*</div>*/}

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

                {/* Быстрые действия */}
                <div className="quick-actions">
                    {quickActions.map((action) => {
                        const IconComponent = action.icon;
                        return (
                            <button
                                key={action.id}
                                className="quick-action-btn"
                                onClick={() => handleQuickAction(action.action)}
                            >
                                <IconComponent className="quick-action-icon" />
                                <p className="quick-action-label">{action.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Последние чаты */}
                <div style={{ marginTop: '25px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#fff',
                            margin: 0
                        }}>
                            Последние чаты
                        </h2>
                    </div>

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
                            <SimpleLoadingSpinner size="small" />
                            <span style={{ marginLeft: '10px' }}>Загрузка истории чатов...</span>
                        </div>
                    ) : (
                        <>
                            <SimpleRecentChats
                                chats={chatHistory}
                                onChatClick={(chatId) => navigate(`/chat/${chatId}`)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* CSS анимации */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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