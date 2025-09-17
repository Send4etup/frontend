import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageFile from './MessageFile';
import MessageFormatter from './MessageFormatter';

const MessageList = ({
                         messages,
                         messagesEndRef,
                         onAnalyzeFile,
                         onImageClick,
                         onCopyMessage,
                         onResendMessage,
                         formatDateTime
                     }) => {
    return (
        <div className="messages-list">
            <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        className={`message ${message.role} ${message.isToolDescription ? 'tool-description' : ''} ${message.isStreaming ? 'streaming' : ''}`}
                        transition={{
                            duration: 0.1,
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

                        <div className="message-bottom-actions">
                            {/* Скрываем кнопки и время для welcome message */}
                            {!message.isToolDescription && message.role === 'assistant' && (
                                <div className="message-actions">
                                    <motion.button
                                        className="action-btn"
                                        onClick={() => onCopyMessage(message.content)}
                                        title="Скопировать"
                                        whileTap={{scale: 0.9}}
                                        transition={{type: "spring", stiffness: 400, damping: 20}}
                                    >
                                        {/* SVG иконка копирования */}
                                    </motion.button>

                                    <motion.button
                                        className="action-btn"
                                        onClick={onResendMessage}
                                        title="Повторить запрос"
                                        whileTap={{scale: 0.9}}
                                        transition={{type: "spring", stiffness: 400, damping: 20}}
                                    >
                                        {/* SVG иконка перезапуска */}
                                    </motion.button>
                                </div>
                            )}

                            {/* Скрываем время для welcome message */}
                            {!message.isToolDescription && (
                                <span className="message-time">
                                    {formatDateTime(message.timestamp)}
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