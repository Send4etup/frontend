// src/pages/HomePage/HomePage.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Camera, Headphones, Image, FileText, Brain, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getChatHistory, createToolChat, sendMessage } from '../../services/educationService';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './HomePage.css';
import RecentChats from "../../components/RecentChats/RecentChats.jsx";
import { useBackendIntegration } from '../../hooks/useBackendIntegration';

const HomePage = ({ user: currentUser }) => {  // ИСПРАВЛЕНО: переименовали prop
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ИСПРАВЛЕНО: теперь нет конфликта имен
    const { backendStatus, user: backendUser, authenticate } = useBackendIntegration();

    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        setIsLoading(true);
        try {
            const history = await getChatHistory();
            setChatHistory(history);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        try {
            // Создаем новый чат с обычным сообщением
            const chatId = Date.now();

            // Отправляем сообщение на сервер
            await sendMessage(inputValue, null, chatId);

            setInputValue('');

            // Переходим в чат
            navigate(`/chat/${chatId}`, {
                state: {
                    initialMessage: inputValue,
                    isRegularMessage: true
                }
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const quickActions = [
        {
            icon: Image,
            label: 'Создать изображение',
            action: 'create_image',
            description: `🎨 **Создание изображений с помощью ИИ**
                            
                            Привет! Я помогу тебе создать любое изображение по твоему описанию!
                            
                            🖼️ **Что я умею:**
                            • Генерировать картинки по текстовому описанию
                            • Создавать иллюстрации для проектов и презентаций
                            • Рисовать персонажей, пейзажи, объекты
                            • Делать логотипы и дизайн-элементы
                            
                            ✨ **Стили и форматы:**
                            • Реалистичные фотографии
                            • Мультяшный и аниме стиль
                            • Художественные картины
                            • Схемы и диаграммы
                            • Концепт-арт
                            
                            **Просто опиши, что хочешь увидеть, и я создам это для тебя! 🚀**`
        },
        {
            icon: FileText,
            label: 'Кодинг',
            action: 'coding',
            description: `💻 **Программирование и разработка**

                            Твой личный помощник-программист готов к работе!
                            
                            ⚡ **Языки программирования:**
                            • Python, JavaScript, Java, C++, C#
                            • HTML, CSS, React, Vue.js, Node.js
                            • SQL, PHP, Swift, Kotlin
                            • И многие другие!
                            
                            🛠️ **Что я делаю:**
                            • Пишу код под твои задачи
                            • Объясняю сложные концепции программирования
                            • Помогаю с отладкой и исправлением ошибок
                            • Оптимизирую существующий код
                            • Создаю алгоритмы и структуры данных
                            
                            🎯 **Проекты:**
                            • Веб-сайты и приложения
                            • Игры и анимации
                            • Автоматизация задач
                            • Анализ данных
                            • Мобильные приложения
                            
                            **Расскажи о своем проекте - начнём кодить! 🔥**`
        },
        {
            icon: Brain,
            label: 'Брейншторм',
            action: 'brainstorm',
            description: `🧠 **Мозговой штурм и генерация идей**

                            Давайте вместе придумаем что-то невероятное!
                            
                            💡 **Области для идей:**
                            • Творческие проекты и хобби
                            • Бизнес-идеи и стартапы
                            • Решения учебных задач
                            • Планы на выходные и каникулы
                            • Подарки и сюрпризы
                            
                            🚀 **Методы генерации:**
                            • Ассоциативное мышление
                            • Метод "что если?"
                            • Комбинирование разных концепций
                            • Анализ трендов и возможностей
                            • Креативные техники
                            
                            🎨 **Типы проектов:**
                            • YouTube-канал или блог
                            • Приложение или игра
                            • Научный проект
                            • Творческая работа
                            • Социальная инициатива
                            
                            **Скажи тему - устроим настоящий мозговой штурм! ⚡**`
        },
        {
            icon: Headphones,
            label: 'Придумать отмазку',
            action: 'excuse',
            description: `😅 **Креативные отмазки на все случаи жизни**
                            
                            Иногда всем нужна хорошая отмазка - помогу придумать!
                            
                            🎭 **Ситуации:**
                            • Не сделал домашку
                            • Опоздал на урок/встречу
                            • Забыл про важное дело
                            • Не хочешь идти на мероприятие
                            • Нужно больше времени на проект
                            
                            ✨ **Типы отмазок:**
                            • Правдоподобные и безобидные
                            • Креативные и оригинальные
                            • Технические проблемы
                            • Форс-мажорные обстоятельства
                            • Семейные дела
                            
                            ⚖️ **Важно:**
                            • Отмазки должны быть безвредными
                            • Не вредить отношениям с людьми
                            • Использовать с чувством меры
                            • Лучше честность, но иногда...
                            
                            **Расскажи ситуацию - придумаем выход! 😄**`
        }
    ];

    const handleQuickAction = async (actionType) => {
        try {
            const actionConfig = quickActions.find(action => action.action === actionType);
            if (!actionConfig) return;

            // Используем новый API для создания чатов
            const chat = await createToolChat(actionType, actionConfig.label, actionConfig.description);

            // Переходим к созданному чату
            navigate(`/chat/${chat.chat_id}`, {
                state: {
                    chatType: actionType,
                    toolConfig: actionConfig
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            // Fallback: создаем чат с временным ID
            const chatId = Date.now();
            navigate(`/chat/${chatId}`, {
                state: {
                    chatType: actionType,
                    toolConfig: quickActions.find(action => action.action === actionType)
                }
            });
        }
    };

    // ИСПРАВЛЕНО: используем currentUser вместо user
    const userDisplayName = currentUser?.display_name || currentUser?.username || 'Друг';
    const userEnergy = currentUser?.tokens_balance || 0;
    const maxEnergy = 100; // Можно настроить в зависимости от тарифа

    // Информация о статусе бэкенда (для отладки)
    React.useEffect(() => {
        if (backendStatus && !backendStatus.isChecking) {
            console.log('🏠 HomePage Backend Status:', {
                isOnline: backendStatus.isOnline,
                backendUser: backendUser?.display_name,
                currentUser: currentUser?.display_name
            });
        }
    }, [backendStatus, backendUser, currentUser]);

    return (
        <motion.div
            className="home-page"
            variants={pageTransition}
            initial="initial"
            animate="in"
            exit="out"
        >
            {/* Заголовок с приветствием */}
            <motion.div className="home-header" variants={itemAnimation}>
                <div className="greeting">
                    <h1>Привет, {userDisplayName}! 👋</h1>
                    <p className="quote">
                        "Обучение никогда не истощает ум" — Леонардо да Винчи
                    </p>
                </div>

                {/* Индикатор энергии (токенов) */}
                <div className="energy-indicator">
                    <div className="energy-header">
                        <span className="energy-label">Энергия</span>
                        <span className="energy-value">{userEnergy}/{maxEnergy}</span>
                    </div>
                    <ProgressBar
                        current={userEnergy}
                        max={maxEnergy}
                        color="var(--secondary-accent)"
                        height="8px"
                    />
                    {/* Показываем статус бэкенда для отладки */}
                    {backendStatus && !backendStatus.isOnline && (
                        <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                            Автономный режим
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Поле быстрого ввода */}
            <motion.div className="quick-input" variants={itemAnimation}>
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Спроси что-нибудь у ТоварищБота..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="quick-input-field"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="send-button"
                        disabled={!inputValue.trim()}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Быстрые действия */}
            <motion.div className="quick-actions" variants={itemAnimation}>
                <h2>Быстрые действия</h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.action}
                            className="action-card"
                            onClick={() => handleQuickAction(action.action)}
                            variants={itemAnimation}
                            custom={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <action.icon className="action-icon" size={24} />
                            <span className="action-label">{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* История чатов */}
            <motion.div className="recent-section" variants={itemAnimation}>
                <h2>Последние чаты</h2>
                {isLoading ? (
                    <div className="loading-container">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <RecentChats
                        chats={chatHistory}
                        onChatClick={(chatId) => navigate(`/chat/${chatId}`)}
                    />
                )}
            </motion.div>
        </motion.div>
    );
};

export default HomePage;