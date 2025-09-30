// src/pages/ChatPage/components/MessageList.jsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageFile from './MessageFile';
import MessageFormatter from './MessageFormatter';
import MessageStatus from './MessageStatus.jsx';
import './MessageStatus.css';

const MessageList = ({
                         messages,
                         messagesEndRef,
                         onAnalyzeFile,
                         onImageClick,
                         onCopyMessage,
                         onResendMessage,
                         formatDateTime
                     }) => {

    /**
     * Форматирование времени для отображения
     */
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className="messages-list">
            <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                    <motion.div
                        key={message.id || index}
                        className={`message ${message.role} ${message.isToolDescription ? 'tool-description' : ''} ${message.isStreaming ? 'streaming' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeOut"
                        }}
                        layout
                    >
                        <div className="message-content">
                            {/* Файлы в сообщении */}
                            {message.files && message.files.length > 0 && (
                                <div className="message-files">
                                    {message.files.map((file, fileIndex) => (
                                        <MessageFile
                                            key={fileIndex}
                                            file={file}
                                            onAnalyze={message.role === 'user' ? onAnalyzeFile : null}
                                            onImageClick={onImageClick}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Текстовое содержимое */}
                            {message.content && (
                                <>
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
                                    ) : message.role === 'assistant' ? (
                                        <MessageFormatter content={message.content}/>
                                    ) : (
                                        <p>{message.content}</p>
                                    )}
                                </>
                            )}

                            {/* Индикатор стриминга */}
                            {message.isStreaming && (
                                <div className="streaming-indicator">
                                    <div className="streaming-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Нижняя часть сообщения: действия и статус */}
                        <div className="message-bottom-actions">
                            {/* Кнопки действий - только для сообщений ассистента */}
                            {!message.isToolDescription && message.role === 'assistant' && (
                                <div className="message-actions">
                                    <motion.button
                                        className="action-btn"
                                        onClick={() => onCopyMessage(message.content)}
                                        title="Скопировать"
                                        whileTap={{scale: 0.9}}
                                        transition={{type: "spring", stiffness: 400, damping: 20}}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </motion.button>

                                    {/*<motion.button*/}
                                    {/*    className="action-btn"*/}
                                    {/*    onClick={onResendMessage}*/}
                                    {/*    title="Повторить запрос"*/}
                                    {/*    whileTap={{scale: 0.9}}*/}
                                    {/*    transition={{type: "spring", stiffness: 400, damping: 20}}*/}
                                    {/*>*/}
                                    {/*    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">*/}
                                    {/*        <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>*/}
                                    {/*        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>*/}
                                    {/*    </svg>*/}
                                    {/*</motion.button>*/}
                                </div>
                            )}

                            {/* Статус и время для сообщений пользователя */}
                            {!message.isToolDescription && message.role === 'user' && (
                                <MessageStatus
                                    status={message.status || 'sent'}
                                    timestamp={message.timestamp}
                                    showTime={true}
                                />
                            )}

                            {/* Только время для сообщений ассистента (без статуса) */}
                            {!message.isToolDescription && message.role === 'assistant' && (
                                <span className="message-time">
                                    {formatMessageTime(message.timestamp)}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div id="messages-end" ref={messagesEndRef}/>
        </div>
    );
};

export default MessageList;