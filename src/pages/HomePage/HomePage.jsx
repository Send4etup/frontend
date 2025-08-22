import React, { useState, useEffect } from 'react';
import { Camera, Headphones, Image, FileText, Brain, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getChatHistory, sendMessage } from '../../services/educationService';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './HomePage.css';
import RecentChats from "../../components/RecentChats/RecentChats.jsx";

const HomePage = ({ user }) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
            // Создаем новый чат или используем существующий
            const chatId = Date.now(); // Временное решение
            await sendMessage(inputValue);
            setInputValue('');

            // Переходим в чат
            navigate(`/chat/${chatId}`, {
                state: { initialMessage: inputValue }
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

**Расскажи ситуацию - придумаем выход! 😉**`
        }
    ];

    const handleQuickAction = async (action) => {
        const actionData = quickActions.find(qa => qa.action === action);
        if (actionData) {
            const chatId = Date.now();
            navigate(`/chat/${chatId}`, {
                state: {
                    initialMessage: actionData.description,
                    actionType: action,
                    toolTitle: actionData.label,
                    isToolDescription: true
                }
            });
        }
    };

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    return (
        <motion.div
            className="home-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="page-title"
                    variants={itemAnimation}
                >

                    <h1>Чем я могу тебе сегодня помочь?</h1>
                </motion.div>
                <motion.div
                    className="welcome-section"
                    variants={itemAnimation}
                >
                    <p className="quote">
                        Эмоции, обычно, через какое-то время проходят, но то, что они сделали, остается
                    </p>
                    <p className="quote-author">Вельгельм Швебель</p>
                </motion.div>

                {/*<motion.div variants={itemAnimation}>*/}
                {/*    <ProgressBar*/}
                {/*        current={user?.current_points || 34}*/}
                {/*        total={100}*/}
                {/*        percentage={40}*/}
                {/*    />*/}
                {/*</motion.div>*/}

                <motion.div
                    className="input-section"
                    variants={itemAnimation}
                >
                    <div className="input-container">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Что тебя интересует?"
                            className="main-input"
                        />
                        <motion.button
                            className="send-message-btn"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            <Send className="Send_icon"/>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    className="quick-actions"
                    variants={itemAnimation}
                >
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <motion.button
                                key={index}
                                className="quick-action-btn"
                                onClick={() => handleQuickAction(action.action)}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1}}
                            >
                                <Icon className="quick-action-icon"/>
                                <span className="quick-action-label">{action.label}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>

                <motion.div
                    className="chat-history"
                    variants={itemAnimation}
                >
                    {isLoading ? (
                        <LoadingSpinner/>
                    ) : (
                        <RecentChats onChatClick={handleChatClick}/>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HomePage;