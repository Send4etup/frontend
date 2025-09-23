// src/pages/ChatPage/components/MessageStatus.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Компонент отображения статуса сообщения как в мессенджерах
 * Интегрируется в существующую архитектуру ТоварищБота
 */
const MessageStatus = ({ status, timestamp, showTime = true }) => {

    /**
     * Получение иконки и стилей для статуса сообщения
     * @param {string} status - Статус сообщения
     * @returns {Object|null} Объект с иконкой, цветом и описанием
     */
    const getStatusIcon = (status) => {
        switch (status) {
            case 'sending':
                return {
                    icon: (
                        <motion.svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="status-icon-sending"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="#666666"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                fill="none"
                            />
                        </motion.svg>
                    ),
                    color: '#666666',
                    text: 'Отправляется...'
                };

            case 'sent':
                return {
                    icon: (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="status-icon-sent">
                            <path
                                d="M9 12l2 2 4-4"
                                stroke="#666666"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    ),
                    color: '#666666',
                    text: 'Отправлено'
                };

            case 'delivered':
                return {
                    icon: (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="status-icon-delivered">
                            <path
                                d="M6 12l2 2 4-4"
                                stroke="#43ff65"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M10 12l2 2 4-4"
                                stroke="#43ff65"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    ),
                    color: '#43ff65',
                    text: 'Доставлено'
                };

            case 'read':
                return {
                    icon: (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="status-icon-read">
                            <path
                                d="M6 12l2 2 4-4"
                                stroke="#578BF6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M10 12l2 2 4-4"
                                stroke="#578BF6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    ),
                    color: '#578BF6',
                    text: 'Прочитано'
                };

            case 'failed':
                return {
                    icon: (
                        <motion.svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="status-icon-failed"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="2" fill="none"/>
                            <path
                                d="M15 9l-6 6M9 9l6 6"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </motion.svg>
                    ),
                    color: '#ef4444',
                    text: 'Не отправлено'
                };

            default:
                return null;
        }
    };

    /**
     * Форматирование времени сообщения
     * @param {string|Date} timestamp - Временная метка
     * @returns {string} Отформатированное время
     */
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const statusData = getStatusIcon(status);

    // Если статус неизвестен, не рендерим компонент
    if (!statusData) return null;

    return (
        <motion.div
            className={`message-status status-${status}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <div className="status-icon" title={statusData.text}>
                {statusData.icon}
            </div>
            {showTime && timestamp && (
                <span
                    className="message-timestamp"
                    style={{ color: statusData.color }}
                >
                    {formatTime(timestamp)}
                </span>
            )}
        </motion.div>
    );
};

export default MessageStatus;