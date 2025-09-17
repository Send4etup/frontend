import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Send, Mic, MicOff, X } from 'lucide-react';

const ChatInput = ({
                       inputValue,
                       setInputValue,
                       attachedFiles,
                       isDragOver,
                       isLoading,
                       isRecording,
                       streamingMessageId,
                       onSendMessage,
                       onToggleAttachment,
                       onToggleRecording,
                       onStopGeneration,
                       onDragEnter,
                       onDragLeave,
                       onDragOver,
                       onDrop
                   }) => {
    const hasContent = inputValue.trim() || attachedFiles.length > 0;

    return (
        <motion.div
            className="chat-input-container"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className={`chat-input-wrapper ${isDragOver ? 'drag-over' : ''}`}>
                {isDragOver && (
                    <div className="drag-drop-overlay">
                        Отпустите файлы для прикрепления
                    </div>
                )}
                <motion.button
                    className="attachment-toggle-btn"
                    onClick={onToggleAttachment}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Paperclip className="icon" />
                </motion.button>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                    placeholder={attachedFiles.length > 0 ? "Добавьте описание к файлам..." : "Сообщение"}
                    className="chat-input"
                    disabled={isLoading}
                />

                {streamingMessageId ? (
                    <motion.button
                        className="stop-generation-btn"
                        onClick={onStopGeneration}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X size={14} />
                    </motion.button>
                ) : hasContent ? (
                    <motion.button
                        className="send-btn"
                        onClick={onSendMessage}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Send className="icon" />
                    </motion.button>
                ) : (
                    <motion.button
                        className={`voice-btn ${isRecording ? 'recording' : ''}`}
                        onClick={onToggleRecording}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isRecording ? <MicOff className="icon" /> : <Mic className="icon" />}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default ChatInput;