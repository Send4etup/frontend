// src/pages/HomePage/HomePage.jsx - Обновленная версия с использованием JSON конфигурации

import React, { useState, useEffect } from 'react';
import { Send, ChevronRight, History, MessageCircle, Paperclip, Mic, MicOff, Image, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { motion } from "framer-motion";
import { createChat, getUserChats } from "../../services/chatAPI.js";
import RecentChats from "../../components/RecentChats/RecentChats.jsx";

// ✅ ИМПОРТИРУЕМ АГЕНТОВ ИЗ JSON
import {getQuickActions, getAgentPrompt, getAgentByAction} from '../../utils/aiAgentsUtils.js';
import {getRandomQuote} from "./quotes.js";

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
    const [dailyQuote, setDailyQuote] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [fileErrors, setFileErrors] = useState([]);
    const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/aac'];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_FILES_PER_MESSAGE = 10;

    // ✅ ПОЛУЧАЕМ БЫСТРЫЕ ДЕЙСТВИЯ ИЗ JSON
    const quickActions = getQuickActions();

    useEffect(() => {
        loadChatHistory();
        setDailyQuote(getRandomQuote());
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

        if (!inputValue.trim()) return;

        try {
            setIsLoading(true);
            const chatResponse = await createChat('ТоварищБот', 'general');

            if (chatResponse.success) {
                const newChatId = chatResponse.data.chat_id;

                navigate(`/chat/${newChatId}`, {
                    state: {
                        initialMessage: inputValue,
                        chatType: 'general',
                        title: 'ТоварищБот'
                    }
                });
            } else {
                console.error('Failed to create chat:', chatResponse.error);
                setError('Не удалось создать чат');
            }
        } catch (error) {
            console.error('Failed to create chat:', error);
            setError('Не удалось создать чат');
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

    // Функция для обработки прикрепления изображений с полной валидацией
    const handleImageAttach = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = SUPPORTED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(',');

        input.onchange = async (event) => {
            const files = Array.from(event.target.files);

            // Проверка на количество файлов
            if (files.length > MAX_FILES_PER_MESSAGE) {
                setFileErrors(prev => [...prev, `Максимум ${MAX_FILES_PER_MESSAGE} файлов за раз`]);
                setTimeout(() => setFileErrors([]), 5000);
                return;
            }

            // Валидация файлов
            const validFiles = [];
            const errors = [];

            files.forEach(file => {
                // Проверка размера
                if (file.size > MAX_FILE_SIZE) {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    errors.push(`"${file.name}" слишком большой (${sizeMB}MB, макс. 50MB)`);
                    return;
                }

                // Проверка на пустой файл
                if (file.size === 0) {
                    errors.push(`"${file.name}" пустой файл`);
                    return;
                }

                // Проверка типа файла
                const fileType = file.type.toLowerCase();
                if (!SUPPORTED_IMAGE_TYPES.includes(fileType)) {
                    errors.push(`"${file.name}" не поддерживается. Только изображения (JPEG, PNG, GIF, WEBP, BMP)`);
                    return;
                }

                validFiles.push(file);
            });

            // Показываем ошибки если есть
            if (errors.length > 0) {
                setFileErrors(prev => [...prev, ...errors]);
                setTimeout(() => setFileErrors([]), 5000);
            }

            // Если нет валидных файлов - выходим
            if (validFiles.length === 0) {
                return;
            }

            // Если есть валидные файлы - создаем чат и переходим
            try {
                setIsLoading(true);

                const chatResponse = await createChat('ТоварищБот', 'general');

                if (chatResponse.success) {
                    const newChatId = chatResponse.data.chat_id;

                    // Переходим в чат с прикрепленными изображениями
                    navigate(`/chat/${newChatId}`, {
                        state: {
                            chatType: 'general',
                            title: 'ТоварищБот',
                            attachedFiles: validFiles,
                            initialMessage: inputValue.trim() || ''
                        }
                    });
                } else {
                    throw new Error('Failed to create chat');
                }
            } catch (error) {
                console.error('Failed to create chat:', error);
                setError('Не удалось создать чат');
                setFileErrors(prev => [...prev, 'Не удалось создать чат. Попробуйте снова']);
                setTimeout(() => setFileErrors([]), 5000);
            } finally {
                setIsLoading(false);
            }
        };

        input.click();
    };

    // Функция начала записи аудио с валидацией
    const startRecording = async () => {
        try {
            // Проверяем поддержку браузера
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setFileErrors(prev => [...prev, 'Ваш браузер не поддерживает запись аудио']);
                setTimeout(() => setFileErrors([]), 5000);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Проверяем поддержку MediaRecorder
            if (!window.MediaRecorder) {
                setFileErrors(prev => [...prev, 'MediaRecorder не поддерживается в вашем браузере']);
                setTimeout(() => setFileErrors([]), 5000);
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            const recorder = new MediaRecorder(stream);
            const chunks = [];
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setFileErrors(prev => [...prev, 'Ошибка при записи аудио']);
                setTimeout(() => setFileErrors([]), 5000);
                setIsRecording(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Ошибка доступа к микрофону:", err);

            let errorMessage = 'Не удалось получить доступ к микрофону';

            if (err.name === 'NotAllowedError') {
                errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'Микрофон не найден. Проверьте подключение микрофона';
            } else if (err.name === 'NotReadableError') {
                errorMessage = 'Микрофон используется другим приложением';
            }

            setFileErrors(prev => [...prev, errorMessage]);
            setTimeout(() => setFileErrors([]), 5000);
        }
    };

    // Функция остановки записи с валидацией
    const stopRecording = async () => {
        if (!mediaRecorder) return;

        return new Promise((resolve) => {
            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const audioBlob = new Blob([event.data], { type: 'audio/webm' });

                    // Валидация аудио файла
                    if (audioBlob.size === 0) {
                        setFileErrors(prev => [...prev, 'Запись пуста. Попробуйте еще раз']);
                        setTimeout(() => setFileErrors([]), 5000);
                        setIsRecording(false);
                        resolve();
                        return;
                    }

                    if (audioBlob.size > MAX_FILE_SIZE) {
                        const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
                        setFileErrors(prev => [...prev, `Запись слишком большая (${sizeMB}MB, макс. 50MB)`]);
                        setTimeout(() => setFileErrors([]), 5000);
                        setIsRecording(false);
                        resolve();
                        return;
                    }

                    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
                        type: 'audio/webm',
                        lastModified: Date.now()
                    });

                    // Сразу создаем чат и переходим с аудио
                    try {
                        setIsLoading(true);

                        const chatResponse = await createChat('ТоварищБот', 'general');

                        if (chatResponse.success) {
                            const newChatId = chatResponse.data.chat_id;

                            navigate(`/chat/${newChatId}`, {
                                state: {
                                    chatType: 'general',
                                    title: 'ТоварищБот',
                                    attachedFiles: [audioFile],
                                    initialMessage: inputValue.trim() || ''
                                }
                            });
                        } else {
                            throw new Error('Failed to create chat');
                        }
                    } catch (error) {
                        console.error('Failed to create chat:', error);
                        setFileErrors(prev => [...prev, 'Не удалось создать чат. Попробуйте снова']);
                        setTimeout(() => setFileErrors([]), 5000);
                    } finally {
                        setIsLoading(false);
                    }
                }
                resolve();
            };

            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        });
    };

    // Переключатель записи
    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    return (
        <div className="home-page">
            <div className="home-container">
                {/* Заголовок с приветствием */}
                <div className="welcome-section">
                    <h1 className="welcome-message">
                        Чем я могу тебе сегодня помочь?
                    </h1>

                    <div className="quatation">
                        <p className="quote">{dailyQuote.text}</p>
                        <p className="quote-author">
                            — {dailyQuote.author}
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
                                    disabled={isLoading}
                                />
                                <div className="input-actions">
                                    {/* Показываем кнопки только если нет текста и файлов */}
                                    {!inputValue.trim() ? (
                                        <>
                                            <button
                                                type="button"
                                                className="input-action-btn"
                                                onClick={handleImageAttach}
                                                disabled={isLoading}
                                                title="Прикрепить изображение"
                                            >
                                                <Image className="icon"/>
                                            </button>
                                            <button
                                                type="button"
                                                className={`input-action-btn ${isRecording ? 'recording' : ''}`}
                                                onClick={toggleRecording}
                                                disabled={isLoading}
                                                title={isRecording ? "Остановить запись" : "Записать голосовое"}
                                            >
                                                {isRecording ? <MicOff className="icon"/> : <Mic className="icon"/>}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="input-action-btn"
                                            disabled={(!inputValue.trim()) || isLoading}
                                        >
                                            <Send size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Уведомления об ошибках */}
                    {fileErrors.length > 0 && (
                        <div className="file-errors-home">
                            {fileErrors.map((error, index) => (
                                <motion.div
                                    key={index}
                                    className="error-notification"
                                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => {
                                        // Удаляем конкретное уведомление при клике
                                        setFileErrors(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {error}
                                </motion.div>
                            ))}
                        </div>
                    )}

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
                                        style={{color: action.iconColor}}
                                    />
                                    <p className="quick-action-label">{action.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Последние чаты */}
                <div style={{marginTop: '35px'}}>
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