import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Mic, MicOff, X } from 'lucide-react';

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
                       attachmentButtonRef
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

    // ✅ Автоматическое изменение высоты textarea с учетом скролла
    const handleInput = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 96);
        textarea.style.height = newHeight + 'px';

        // Если текст превышает максимальную высоту - включаем скролл
        textarea.style.overflowY = textarea.scrollHeight > 96 ? 'auto' : 'hidden';
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

                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder={getPlaceholder()}
                    className={`chat-input ${isRecording ? 'recording' : ''}`}
                    disabled={isLoading || isRecording}
                    rows={1}
                    style={{
                        resize: 'none',
                        overflowY: 'hidden', // Изначально скрыт, включается динамически
                        minHeight: '40px',
                        maxHeight: '96px'
                    }}
                />

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
                            className={`voice-btn ${isRecording ? 'recording' : ''}`}
                            onClick={onToggleRecording}
                            disabled={isLoading}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: isRecording ? 1 : 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={isRecording ? "Остановить запись" : "Записать голосовое сообщение"}
                        >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
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
                    // align-items: center;
                    gap: 8px;
                    background: #1f1f1f;
                    border-radius: 24px;
                    padding: 8px;
                    border: 2px solid #333333;
                    transition: all 0.3s ease;
                    position: relative;
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

                .attachment-toggle-btn,
                .send-btn,
                .voice-btn,
                .stop-generation-btn {
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

                .voice-btn.recording {
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

                .voice-btn:hover:not(.recording):not(:disabled) {
                    background: #2a2a2a;
                }

                .stop-generation-btn {
                    // background: #ef4444;
                    color: #ffffff;
                }

                .stop-generation-btn:hover {
                    background: #2a2a2a;
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

                /* ✅ Стилизация скроллбара для webkit браузеров (Chrome, Safari) */
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

                .chat-input.recording::placeholder {
                    color: #43ff65;
                    animation: placeholderBlink 1.5s ease-in-out infinite;
                }

                @keyframes placeholderBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                .chat-input:disabled {
                    cursor: not-allowed;
                }
            `}</style>
        </motion.div>
    );
};

export default ChatInput;