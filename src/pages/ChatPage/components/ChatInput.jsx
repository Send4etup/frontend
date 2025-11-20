import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Mic, Check, X } from 'lucide-react';

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

const ChatInput = ({
                       inputValue,
                       setInputValue,
                       attachedFiles,
                       isDragOver,
                       isLoading,
                       isRecording,
                       isTranscribing,
                       streamingMessageId,
                       onSendMessage,
                       onToggleAttachment,
                       onToggleRecording,
                       onStopGeneration,
                       onDragEnter,
                       onDragLeave,
                       onDragOver,
                       onDrop,
                       attachmentButtonRef,
                       onCancelRecording,
                       onConfirmRecording,
                   }) => {
    const hasContent = inputValue.trim() || attachedFiles.length > 0;
    const textareaRef = useRef(null);

    // Автофокус при начале печати
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape' || e.key === 'Tab') {
                return;
            }

            if (
                document.activeElement !== textareaRef.current &&
                e.key.length === 1 &&
                !isLoading &&
                !isRecording &&
                !isTranscribing
            ) {
                textareaRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isLoading, isRecording]);

    const getPlaceholder = () => {
        if (isRecording) return "Запись...";
        if (isTranscribing) return "Расшифровка...";
        if (attachedFiles.length > 0) return "Добавьте описание к файлам...";
        return "Сообщение";
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    // Автоматическое изменение высоты textarea с учетом скролла
    const handleInput = (e) => {
        const textarea = e.target;
        // Убираем автоматическое изменение высоты - фиксируем размер
    };

    return (
        <motion.div
            className="chat-input-container"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div
                className={`chat-input-wrapper ${isDragOver ? 'drag-over' : ''} ${isRecording ? 'recording' : ''}`}
            >
                <AnimatePresence>
                    {isDragOver && (
                        <motion.div
                            className="drag-drop-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="drag-drop-content">
                                <Paperclip size={32} />
                                <span>Отпустите для загрузки</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isRecording && !streamingMessageId && (
                    <motion.button
                        className="attachment-toggle-btn"
                        onClick={onToggleAttachment}
                        ref={attachmentButtonRef}
                        disabled={isLoading || isTranscribing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Paperclip size={20} />
                    </motion.button>
                )}

                {isRecording ? (
                    <>
                        <div className="recording-visualizer-container">
                            <VoiceRecordingVisualizer isRecording={isRecording} />
                        </div>
                        <div className="recording-controls">
                            <motion.button
                                className="cancel-recording-btn"
                                onClick={onCancelRecording}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <X size={20} />
                            </motion.button>
                            <motion.button
                                className="confirm-recording-btn"
                                onClick={onConfirmRecording}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Check size={20} />
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <>
                        <textarea
                            ref={textareaRef}
                            className="chat-input"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                handleInput(e);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={getPlaceholder()}
                            disabled={isLoading || isTranscribing}
                            rows={1}
                        />

                        {streamingMessageId ? (
                            <motion.button
                                className="stop-generation-btn"
                                onClick={onStopGeneration}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <X size={20} />
                            </motion.button>
                        ) : hasContent ? (
                            <motion.button
                                className="send-btn"
                                onClick={onSendMessage}
                                disabled={isLoading || isTranscribing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Send size={20} />
                            </motion.button>
                        ) : (
                            <motion.button
                                className="voice-btn"
                                onClick={onToggleRecording}
                                disabled={isLoading || isTranscribing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Mic size={20} />
                            </motion.button>
                        )}
                    </>
                )}
            </div>

            <style jsx>{`
                .chat-input-container {
                    padding: 12px 16px;
                    background: #0a0a0a;
                    border-top: 1px solid #1f1f1f;
                }

                .chat-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #1f1f1f;
                    border-radius: 24px;
                    padding: 8px;
                    border: 2px solid #333333;
                    transition: all 0.3s ease;
                    position: relative;
                    height: 56px;
                }

                .chat-input-wrapper:focus-within {
                    border-color: #43ff65;
                }

                .chat-input-wrapper.recording {
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

                .chat-input-wrapper.drag-over {
                    border-color: #43ff65;
                    background: rgba(67, 255, 101, 0.05);
                }

                .drag-drop-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(67, 255, 101, 0.1);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    pointer-events: none;
                }

                .drag-drop-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    color: #43ff65;
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

                /* Кнопки */
                .attachment-toggle-btn,
                .send-btn,
                .voice-btn,
                .stop-generation-btn,
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

                .attachment-toggle-btn:hover:not(:disabled) {
                    background: #2a2a2a;
                }

                .send-btn {
                    background: #43ff65;
                    color: #0d0d0d;
                }

                .send-btn:hover:not(:disabled) {
                    background: #3de558;
                    transform: scale(1.05);
                }

                .voice-btn:hover:not(:disabled) {
                    background: #2a2a2a;
                }

                .stop-generation-btn {
                    color: #ffffff;
                }

                .stop-generation-btn:hover {
                    background: #2a2a2a;
                }

                .recording-controls {
                    display: flex;
                    gap: 8px;
                }

                .cancel-recording-btn {
                    color: #ef4444;
                }

                .cancel-recording-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                .confirm-recording-btn {
                    background: #43ff65;
                    color: #0d0d0d;
                }

                .confirm-recording-btn:hover {
                    background: #3de558;
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .chat-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 15px;
                    outline: none;
                    padding: 8px;
                    font-family: inherit;
                    line-height: 1.5;
                    scrollbar-width: thin;
                    scrollbar-color: #43ff65 transparent;
                }

                /* Стилизация скроллбара для webkit браузеров */
                .chat-input::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-input::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-input::-webkit-scrollbar-thumb {
                    background: #43ff65;
                    border-radius: 3px;
                }

                .chat-input::-webkit-scrollbar-thumb:hover {
                    background: #3de558;
                }

                .chat-input::placeholder {
                    color: #666666;
                    transition: color 0.3s ease;
                }

                .chat-input:disabled {
                    cursor: not-allowed;
                }
            `}</style>
        </motion.div>
    );
};

export default ChatInput;