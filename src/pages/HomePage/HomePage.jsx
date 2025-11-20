// src/pages/HomePage/HomePage.jsx - Финальная версия с дизайном из ChatInput

import React, {useState, useEffect, useRef} from 'react';
import {Send, Mic, MicOff, Image, X, Check} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { motion, AnimatePresence } from "framer-motion";
import { createChat, getUserChats, transcribeAudio } from "../../services/chatAPI.js";
import RecentChats from "../../components/RecentChats/RecentChats.jsx";
import { getQuickActions, getAgentPrompt, getAgentByAction } from '../../utils/aiAgentsUtils.js';
import { getRandomQuote } from "./quotes.js";


const VoiceRecordingVisualizer = ({ isRecording }) => {
    const [bars, setBars] = useState([]);
    const intervalRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);

    const MAX_BARS = 80; // ✅ Уменьшено для более плавной работы
    const UPDATE_INTERVAL = 80; // ✅ Увеличена частота обновления (было 100)

    useEffect(() => {
        if (!isRecording) {
            // Останавливаем визуализацию
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            setBars([]);
            return;
        }

        // Инициализация Web Audio API
        async function initAudio() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);

                // ✅ УЛУЧШЕНО: Больше деталей и быстрее реакция
                analyser.fftSize = 128; // ✅ Было 128, стало 512 - больше деталей
                analyser.smoothingTimeConstant = 0.6; // ✅ Было 0.7, стало 0.3 - быстрее реакция

                source.connect(analyser);

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
                sourceRef.current = source;
                dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

                startVisualization();
            } catch (error) {
                console.error('Ошибка доступа к микрофону:', error);
                startVisualizationFallback();
            }
        }

        // ✅ УЛУЧШЕННЫЙ алгоритм расчета высоты палочки
        function getBarHeight() {
            if (!analyserRef.current || !dataArrayRef.current) {
                return Math.random() * 0.6 + 0.2;
            }

            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // ✅ Используем средние частоты (более чувствительные к голосу)
            const midFreqStart = Math.floor(dataArrayRef.current.length * 0.2);
            const midFreqEnd = Math.floor(dataArrayRef.current.length * 0.6);

            // ✅ Берем пиковые значения вместо среднего
            let maxValue = 0;
            for (let i = midFreqStart; i < midFreqEnd; i++) {
                if (dataArrayRef.current[i] > maxValue) {
                    maxValue = dataArrayRef.current[i];
                }
            }

            // ✅ Нормализация с усилением
            let normalized = (maxValue / 255) * 1.5; // Усиление в 1.5 раза
            normalized = Math.min(normalized, 1); // Ограничиваем максимум

            // ✅ Минимальная высота для визуальной активности
            return Math.max(normalized, 0.15);
        }

        // Запуск визуализации с реальными данными
        function startVisualization() {
            intervalRef.current = setInterval(() => {
                const newHeight = getBarHeight();

                setBars(prevBars => {
                    const newBars = [...prevBars, newHeight];
                    // Ограничиваем количество палочек
                    if (newBars.length > MAX_BARS) {
                        return newBars.slice(-MAX_BARS);
                    }
                    return newBars;
                });
            }, UPDATE_INTERVAL);
        }

        // Фолбэк с рандомными значениями
        function startVisualizationFallback() {
            intervalRef.current = setInterval(() => {
                const newHeight = Math.random() * 0.7 + 0.3;

                setBars(prevBars => {
                    const newBars = [...prevBars, newHeight];
                    if (newBars.length > MAX_BARS) {
                        return newBars.slice(-MAX_BARS);
                    }
                    return newBars;
                });
            }, UPDATE_INTERVAL);
        }

        initAudio();

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (sourceRef.current && sourceRef.current.mediaStream) {
                sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [isRecording]);

    return (
        <div className="voice-visualizer">
            <div className="voice-bars-container">
                {bars.map((height, index) => (
                    // ✅ ДОБАВЛЕНО: Плавная анимация появления с Framer Motion
                    <motion.div
                        key={`bar-${index}-${Date.now()}`}
                        className="voice-bar"
                        initial={{
                            scaleX: 0.5,
                            scaleY: height
                        }}
                        animate={{
                            scaleX: 0.5,
                            scaleY: height
                        }}
                        // exit={{
                        //     opacity: 0,
                        //     scaleX: 0
                        // }}
                        transition={{
                            scaleX: { duration: 0.2, ease: "easeOut" },
                            scaleY: { duration: 0.2, ease: "easeOut" }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

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
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isTranscribed, setIsTranscribed] = useState(false);

    const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const MAX_FILES_PER_MESSAGE = 10;

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

        if (e && e.preventDefault) {
            e.preventDefault();
        }

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

            const actionConfig = getAgentByAction(actionType);
            if (!actionConfig) return;

            const agentPrompt = getAgentPrompt(actionType);
            console.log('Agent prompt for', actionType, ':', agentPrompt);

            const ChatCreateInfo = await createChat(actionConfig.label, actionType);

            navigate(`/chat/${ChatCreateInfo.chat_id}`, {
                state: {
                    chatType: actionType,
                    title: actionConfig.label,
                    agentPrompt: agentPrompt
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            setError('Не удалось создать чат');
        }
    };

    const handleImageAttach = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = SUPPORTED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(',');

        input.onchange = async (event) => {
            const files = Array.from(event.target.files);

            if (files.length > MAX_FILES_PER_MESSAGE) {
                setFileErrors(prev => [...prev, `Максимум ${MAX_FILES_PER_MESSAGE} файлов за раз`]);
                setTimeout(() => setFileErrors([]), 5000);
                return;
            }

            const validFiles = [];
            const errors = [];

            files.forEach(file => {
                if (file.size > MAX_FILE_SIZE) {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    errors.push(`"${file.name}" слишком большой (${sizeMB}MB, макс. 50MB)`);
                    return;
                }

                if (file.size === 0) {
                    errors.push(`"${file.name}" пустой файл`);
                    return;
                }

                const fileType = file.type.toLowerCase();
                if (!SUPPORTED_IMAGE_TYPES.includes(fileType)) {
                    errors.push(`"${file.name}" не поддерживается. Только изображения (JPEG, PNG, GIF, WEBP, BMP)`);
                    return;
                }

                validFiles.push(file);
            });

            if (errors.length > 0) {
                setFileErrors(prev => [...prev, ...errors]);
                setTimeout(() => setFileErrors([]), 5000);
            }

            if (validFiles.length === 0) {
                return;
            }

            try {
                setIsLoading(true);

                const chatResponse = await createChat('ТоварищБот', 'general');

                if (chatResponse.success) {
                    const newChatId = chatResponse.data.chat_id;

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

    const handleTranscribeAudio = async (audioBlob) => {
        try {
            setIsTranscribing(true);
            console.log('🎤 Начинаем транскрибацию через chatAPI...');

            const result = await transcribeAudio(audioBlob);

            if (result.success && result.text) {
                setInputValue(result.text);
                setIsTranscribed(true);

                console.log('✅ Текст распознан и вставлен:', result.text);
            } else {
                throw new Error(result.error || 'Не удалось распознать речь');
            }

        } catch (error) {
            console.error('❌ Ошибка транскрибации:', error);
            const errorMessage = error.message || 'Не удалось распознать речь. Попробуйте еще раз';
            setFileErrors(prev => [...prev, errorMessage]);
            setTimeout(() => setFileErrors([]), 5000);
        } finally {
            setIsTranscribing(false);
        }
    };

    useEffect(() => {
        if (isTranscribed) {
            handleQuickSubmit();
            setIsTranscribed(false);
        }
    }, [isTranscribed]);

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setFileErrors(prev => [...prev, 'Ваш браузер не поддерживает запись аудио']);
                setTimeout(() => setFileErrors([]), 5000);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            if (!window.MediaRecorder) {
                setFileErrors(prev => [...prev, 'MediaRecorder не поддерживается в вашем браузере']);
                setTimeout(() => setFileErrors([]), 5000);
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            };

            const recorder = new MediaRecorder(stream, options);
            const chunks = [];
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                console.log('🎤 Запись остановлена');

                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(chunks, { type: 'audio/webm' });

                if (audioBlob.size === 0) {
                    setFileErrors(prev => [...prev, 'Запись пустая. Попробуйте еще раз']);
                    setTimeout(() => setFileErrors([]), 5000);
                    return;
                }

                if (audioBlob.size > MAX_FILE_SIZE) {
                    const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
                    setFileErrors(prev => [...prev, `Запись слишком большая (${sizeMB}MB, макс. 50MB)`]);
                    setTimeout(() => setFileErrors([]), 5000);
                    return;
                }

                await handleTranscribeAudio(audioBlob);
            };

            recorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setFileErrors(prev => [...prev, 'Ошибка при записи аудио']);
                setTimeout(() => setFileErrors([]), 5000);
                setIsRecording(false);
            };

            recorder.start();
            setIsRecording(true);
            console.log('🎤 Запись началась');

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

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            console.log('🛑 Остановка записи...');
        }
    };

    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const hasContent = inputValue.trim();

    const getPlaceholder = () => {
        if (isRecording) return "Запись...";
        if (isTranscribing) return "Расшифровка...";
        return "Что тебя интересует?";
    };

    const cancelRecording = () => {
        console.log('❌ Отмена записи голоса');

        // Останавливаем MediaRecorder без обработки
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            // Удаляем обработчик onstop, чтобы не запускать расшифровку
            mediaRecorder.onstop = null;

            // Останавливаем запись
            mediaRecorder.stop();

            // Останавливаем все треки микрофона
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('🔇 Трек микрофона остановлен');
                });
            }
        }

        // Сбрасываем состояния
        setIsRecording(false);
        setMediaRecorder(null);

    };

    const confirmRecording = () => {
        // Останавливаем запись (при этом сработает onstop обработчик с расшифровкой)
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="home-page">
            <div className="home-container">
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
                    <div className="input-section">
                        <form onSubmit={handleQuickSubmit}>
                            <div className={`home-input-container ${isRecording ? 'recording' : ''}`}>

                                {/* Показываем визуализатор во время записи */}
                                <AnimatePresence mode="wait">
                                    {isRecording ? (
                                        <motion.div
                                            key="visualizer"
                                            className="recording-visualizer-container"
                                            initial={{opacity: 0, scale: 0.95}}
                                            animate={{opacity: 1, scale: 1}}
                                            exit={{opacity: 0, scale: 0.95}}
                                            transition={{duration: 0.2}}
                                        >
                                            <VoiceRecordingVisualizer isRecording={isRecording}/>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder={getPlaceholder()}
                                                className={`home-input ${isRecording ? 'recording' : ''}`}
                                                disabled={isLoading || isRecording || isTranscribing}
                                            />
                                        </>
                                    )}
                                </AnimatePresence>

                                <div className="input-actions">
                                    <AnimatePresence mode="wait">
                                        {isRecording ? (
                                            <div className="recording-controls">
                                                <motion.button
                                                    key="cancel"
                                                    className="cancel-recording-btn"
                                                    onClick={cancelRecording}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    // whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Отменить запись"
                                                >
                                                    <X size={18} />
                                                </motion.button>
                                                <motion.button
                                                    key="confirm"
                                                    className="confirm-recording-btn"
                                                    onClick={confirmRecording}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    // whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Отправить запись"
                                                >
                                                    <Check size={18} />
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <>
                                                {hasContent ? (
                                                    <motion.button
                                                        key="send"
                                                        type="submit"
                                                        className="home-send-btn"
                                                        disabled={isLoading || isTranscribing}
                                                        initial={{scale: 0, opacity: 0}}
                                                        animate={{scale: 1, opacity: 1}}
                                                        exit={{scale: 0, opacity: 0}}
                                                        whileHover={{scale: 1.1}}
                                                        whileTap={{scale: 0.9}}
                                                        title="Отправить"
                                                    >
                                                        <Send size={18}/>
                                                    </motion.button>
                                                ) : (
                                                    <>
                                                        <motion.button
                                                            type="button"
                                                            className="home-attachment-btn"
                                                            onClick={handleImageAttach}
                                                            disabled={isLoading || isRecording || isTranscribing}
                                                            whileHover={{scale: 1.1}}
                                                            whileTap={{scale: 0.9}}
                                                            title="Прикрепить изображение"
                                                        >
                                                            <Image size={20}/>
                                                        </motion.button>

                                                        <motion.button
                                                            key="voice"
                                                            type="button"
                                                            className={`home-voice-btn ${isRecording ? 'recording' : ''}`}
                                                            onClick={toggleRecording}
                                                            disabled={isLoading || isTranscribing}
                                                            animate={{scale: 1, opacity: 1}}
                                                            exit={{scale: 0, opacity: 0}}
                                                            whileHover={{scale: isRecording ? 1 : 1.1}}
                                                            whileTap={{scale: 0.9}}
                                                            title={isRecording ? "Остановить запись" : "Записать голосовое"}
                                                        >
                                                            {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
                                                        </motion.button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </AnimatePresence>

                                </div>
                            </div>
                        </form>

                    </div>

                    <AnimatePresence>
                        {fileErrors.length > 0 && (
                            <div className="file-errors-home">
                                {fileErrors.map((error, index) => (
                                    <motion.div
                                        key={index}
                                        className="error-notification"
                                        initial={{opacity: 0, x: 100, scale: 0.8}}
                                        animate={{opacity: 1, x: 0, scale: 1}}
                                        exit={{opacity: 0, x: 100, scale: 0.8}}
                                        transition={{duration: 0.3}}
                                        onClick={() => {
                                            setFileErrors(prev => prev.filter((_, i) => i !== index));
                                        }}
                                        style={{cursor: 'pointer'}}
                                    >
                                        {error}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

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

            <style>{`
                .home-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: 24px;
                    padding: 8px;
                    border: 2px solid #7e7e7e;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .home-input-wrapper:focus-within {
                    border-color: #43ff65;
                }

                .home-input-wrapper.recording {
                    border: 2px solid #43ff65 !important;
                    box-shadow: 0 0 0 4px rgba(67, 255, 101, 0.15);
                    animation: recordingPulse 2s ease-in-out infinite;
                }

                @keyframes recordingPulse {
                    0%, 100% {
                        box-shadow: 0 0 0 4px rgba(67, 255, 101, 0.15);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(67, 255, 101, 0.25);
                    }
                }

                .home-attachment-btn,
                .home-send-btn,
                .home-voice-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: none;
                    color: #9e9e9e;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .home-attachment-btn:hover:not(:disabled) {
                    background: #2a2a2a;
                }

                .home-send-btn {
                    background: #43ff65;
                    color: #0d0d0d;
                }

                .home-send-btn:hover:not(:disabled) {
                    background: #3de558;
                    transform: scale(1.05);
                }

                .home-voice-btn.recording {
                    background: #43ff65 !important;
                    color: #0d0d0d !important;
                    animation: microphonePulse 1.5s ease-in-out infinite;
                }

                @keyframes microphonePulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }

                .home-voice-btn:hover:not(.recording):not(:disabled) {
                    background: #2a2a2a;
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .home-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 15px;
                    outline: none;
                    padding: 8px;
                    font-family: inherit;
                    line-height: 1.5;
                }

                .home-input::placeholder {
                    color: #666666;
                    transition: color 0.3s ease;
                }

                .home-input.recording::placeholder {
                    color: #43ff65;
                    animation: placeholderBlink 1.5s ease-in-out infinite;
                }

                @keyframes placeholderBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                .home-input:disabled {
                    cursor: not-allowed;
                }

                .transcribing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 15px;
                    margin-top: 12px;
                    background: rgba(67, 255, 101, 0.1);
                    border: 1px solid rgba(67, 255, 101, 0.2);
                    border-radius: 8px;
                    font-size: 14px;
                    color: #43ff65;
                    animation: fadeIn 0.3s ease-in-out;
                }

                .transcribing-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(67, 255, 101, 0.3);
                    border-top: 2px solid #43ff65;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .file-errors-home {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                }

                .error-notification {
                    padding: 12px 16px;
                    background-color: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-left: 3px solid #ef4444;
                    border-radius: 8px;
                    color: #ff6b6b;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .error-notification:hover {
                    background-color: rgba(239, 68, 68, 0.15);
                    transform: translateX(-5px);
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

                @media (max-width: 768px) {
                    .file-errors-home {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }

                    .error-notification {
                        font-size: 13px;
                        padding: 10px 14px;
                    }

                    .transcribing-indicator {
                        font-size: 13px;
                        padding: 8px 12px;
                    }
                }
                
                /* ✅ УЛУЧШЕННЫЙ визуализатор записи голоса */
                .recording-visualizer-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    height: 40px;
                    overflow: hidden;
                }

                .voice-visualizer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    height: 40px;
                    width: 100%;
                    position: relative;
                    overflow: hidden; /* ✅ Важно для обрезки */
                }

                .voice-bars-container {
                    display: flex;
                    align-items: center;
                    gap: 1px; /* ✅ УМЕНЬШЕНО: было 3px, стало 2px */
                    height: 100%;
                    /* ✅ УБРАНО: animation slideLeft - больше не нужна */
                }

                .voice-bar {
                    width: 6px; /* ✅ УМЕНЬШЕНО: было 3px, стало 2px - тоньше палочки */
                    height: 100%;
                    background: #3de558;
                    border-radius: 3px;
                    transform-origin: center;
                    flex-shrink: 0;
                    /* ✅ Плавная анимация высоты теперь через Framer Motion */
                }
                
                .cancel-recording-btn,
                .confirm-recording-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                
                .cancel-recording-btn {
                    color: #ef4444;
                }

                .cancel-recording-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                
                .recording-controls {
                    display: flex;
                    gap: 8px;
                }
            `}</style>
        </div>
    );
};

export default HomePage;