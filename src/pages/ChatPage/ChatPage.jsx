// src/pages/ChatPage/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Edit3,
    Send,
    Paperclip,
    Mic,
    MicOff,
    Image,
    FileText
} from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachmentMenu, setAttachmentMenu] = useState(false);
    const [chatTitle, setChatTitle] = useState('ТоварищБот');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Инициализация чата с данными из состояния навигации
        if (location.state) {
            const { initialMessage, toolTitle, isToolDescription } = location.state;

            if (toolTitle) {
                setChatTitle(toolTitle);
            }

            if (initialMessage) {
                if (isToolDescription) {
                    // Если это описание инструмента, показываем его как сообщение от бота
                    const botMessage = {
                        id: 1,
                        type: 'assistant',
                        content: initialMessage,
                        timestamp: new Date(),
                        isToolDescription: true
                    };
                    setMessages([botMessage]);
                } else {
                    // Если это обычное сообщение, добавляем как сообщение пользователя
                    const userMessage = {
                        id: 1,
                        type: 'user',
                        content: initialMessage,
                        timestamp: new Date()
                    };
                    setMessages([userMessage]);

                    // Симулируем ответ бота
                    setTimeout(() => {
                        const aiResponse = {
                            id: 2,
                            type: 'assistant',
                            content: 'Отлично! Давайте начнём работу. Расскажите подробнее, с чем именно вам нужна помощь?',
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, aiResponse]);
                    }, 1000);
                }
            }
        }
    }, [location.state]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const newMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsLoading(true);

        // Симуляция ответа ИИ
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'assistant',
                content: 'Это ответ от ИИ-помощника. Здесь будет интеграция с вашим API.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const handleFileAttach = () => {
        fileInputRef.current?.click();
        setAttachmentMenu(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file);
            // Здесь будет логика обработки файла

            // Добавляем сообщение с файлом
            const fileMessage = {
                id: Date.now(),
                type: 'user',
                content: `📎 Файл: ${file.name}`,
                timestamp: new Date(),
                file: file
            };
            setMessages(prev => [...prev, fileMessage]);
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Здесь будет логика записи голоса
        if (!isRecording) {
            console.log('Начало записи голоса');
        } else {
            console.log('Остановка записи голоса');
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <motion.div
            className="chat-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Хедер чата */}
            <motion.div
                className="chat-header"
                variants={itemAnimation}
            >
                <motion.button
                    className=""
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowLeft className="icon" />
                </motion.button>

                <h1 className="chat-title">{chatTitle}</h1>

                {/*<motion.button*/}
                {/*    className="edit-btn"*/}
                {/*    whileHover={{ scale: 1.1 }}*/}
                {/*    whileTap={{ scale: 0.9 }}*/}
                {/*>*/}
                {/*    <Edit3 className="icon" />*/}
                {/*</motion.button>*/}
            </motion.div>

            {/* Область сообщений */}
            <motion.div
                className="messages-container"
                variants={itemAnimation}
            >
                <div className="messages-list">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                className={`message ${message.type} ${message.isToolDescription ? 'tool-description' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="message-content">
                                    {message.isToolDescription ? (
                                        <div
                                            className="tool-description-content"
                                            dangerouslySetInnerHTML={{
                                                __html: message.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                    .replace(/\n/g, '<br>')
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <p>{message.content}</p>
                                            {message.hasCodeBlock && (
                                                <div className="code-block">
                                                    <div className="code-header">
                                                        <span>Код</span>
                                                        <button
                                                            className="code-copy-btn"
                                                            onClick={() => copyToClipboard(message.codeContent)}
                                                        >
                                                            Копировать
                                                        </button>
                                                    </div>
                                                    <pre><code>{message.codeContent}</code></pre>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <span className="message-time">
                                    {formatTime(message.timestamp)}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            className="message assistant typing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </motion.div>

            {/* Меню вложений */}
            <AnimatePresence>
                {attachmentMenu && (
                    <motion.div
                        className="attachment-menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <motion.button
                            className="attachment-btn"
                            onClick={handleFileAttach}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image className="icon" />
                            <span>Изображение</span>
                        </motion.button>
                        <motion.button
                            className="attachment-btn"
                            onClick={handleFileAttach}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileText className="icon" />
                            <span>Документ</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Инпут для сообщений */}
            <motion.div
                className="chat-input-container"
                variants={itemAnimation}
            >
                <div className="chat-input-wrapper">
                    <motion.button
                        className="attachment-toggle-btn"
                        onClick={() => setAttachmentMenu(!attachmentMenu)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Paperclip className="icon" />
                    </motion.button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Сообщение"
                        className="chat-input"
                        disabled={isLoading}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />

                    {inputValue.trim() ? (
                        <motion.button
                            className="send-btn"
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Send className="icon" />
                        </motion.button>
                    ) : (
                        <motion.button
                            className={`voice-btn ${isRecording ? 'recording' : ''}`}
                            onClick={toggleRecording}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isRecording ? <MicOff className="icon" /> : <Mic className="icon" />}
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatPage;