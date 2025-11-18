import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Mic, Check, X } from 'lucide-react';

const VoiceRecordingVisualizer = ({ isRecording }) => {
    // Массив палочек - храним только значения высоты
    const [bars, setBars] = useState([]);
    const intervalRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const dataArrayRef = useRef(null);

    const MAX_BARS = 50; // Количество видимых палочек
    const UPDATE_INTERVAL = 100; // Частота добавления новых палочек (мс)

    useEffect(() => {
        if (!isRecording) {
            // Останавливаем визуализацию
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
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

                analyser.fftSize = 128;
                analyser.smoothingTimeConstant = 0.7;

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

        // Получение высоты палочки на основе звука
        function getBarHeight() {
            if (!analyserRef.current || !dataArrayRef.current) {
                return Math.random() * 0.6 + 0.2;
            }

            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            const sum = dataArrayRef.current.reduce((acc, val) => acc + val, 0);
            const average = sum / dataArrayRef.current.length;
            const normalized = average / 255;

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
                const newHeight = Math.random() * 0.6 + 0.4;

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
                    <div
                        key={index}
                        className="voice-bar"
                        style={{
                            transform: `scaleY(${height})`,
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
        // textarea.style.height = 'auto';
        // const newHeight = Math.min(textarea.scrollHeight, 96);
        // textarea.style.height = newHeight + 'px';
        // textarea.style.overflowY = textarea.scrollHeight > 96 ? 'auto' : 'hidden';
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
                                <span>Отпустите файлы для прикрепления</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Кнопка добавления файлов */}
                <motion.button
                    className="attachment-toggle-btn"
                    onClick={onToggleAttachment}
                    disabled={isLoading || isRecording || !attachmentButtonRef}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Прикрепить файл"
                >
                    <Paperclip size={20} />
                </motion.button>

                {/* Показываем визуализатор вместо textarea во время записи */}
                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.div
                            key="visualizer"
                            className="recording-visualizer-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <VoiceRecordingVisualizer isRecording={isRecording} />
                        </motion.div>
                    ) : (
                        <motion.textarea
                            key="textarea"
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            placeholder={getPlaceholder()}
                            className="chat-input"
                            disabled={isLoading || isTranscribing}
                            rows={1}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                resize: 'none',
                                overflowY: 'auto',
                                height: '40px'
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Кнопки справа */}
                <AnimatePresence mode="wait">
                    {streamingMessageId ? (
                        <motion.button
                            key="stop"
                            className="stop-generation-btn"
                            onClick={onStopGeneration}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Остановить генерацию"
                        >
                            <X size={18} />
                        </motion.button>
                    ) : isRecording ? (
                        // Во время записи показываем кнопки отмены и подтверждения
                        <div className="recording-controls">
                            <motion.button
                                key="cancel"
                                className="cancel-recording-btn"
                                onClick={onCancelRecording}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Отменить запись"
                            >
                                <X size={18} />
                            </motion.button>
                            <motion.button
                                key="confirm"
                                className="confirm-recording-btn"
                                onClick={onConfirmRecording}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Отправить запись"
                            >
                                <Check size={18} />
                            </motion.button>
                        </div>
                    ) : hasContent ? (
                        <motion.button
                            key="send"
                            className="send-btn"
                            onClick={onSendMessage}
                            disabled={isLoading}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Отправить"
                        >
                            <Send size={18} />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="voice"
                            className="voice-btn"
                            onClick={onToggleRecording}
                            disabled={isLoading}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Записать голосовое сообщение"
                        >
                            <Mic size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .chat-input-container {
                    padding: 16px 20px 20px;
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

                /* Визуализатор записи голоса */
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
                    overflow: hidden;
                    position: relative;
                }

                .voice-bars-container {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    height: 100%;
                    animation: slideLeft 0.08s linear infinite;
                }

                @keyframes slideLeft {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-7px);
                    }
                }

                .voice-bar {
                    width: 3px;
                    height: 100%;
                    background: #43ff65;
                    border-radius: 5px;
                    transform-origin: center;
                    opacity: 0.85;
                    transition: transform 0.1s ease-out;
                    flex-shrink: 0;
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