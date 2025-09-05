// components/Notification/Notification.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react';
import './Notification.css';

const Notification = ({
                          type = 'info',
                          message,
                          duration = 5000,
                          onClose,
                          position = 'top-right',
                          showCloseButton = true
                      }) => {
    const [isVisible, setIsVisible] = useState(true);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const positionClasses = {
        'top-right': 'notification-top-right',
        'top-left': 'notification-top-left',
        'bottom-right': 'notification-bottom-right',
        'bottom-left': 'notification-bottom-left',
        'top-center': 'notification-top-center',
        'bottom-center': 'notification-bottom-center'
    };

    if (!isVisible) return null;

    return (
        <motion.div
            className={`notification notification-${type} ${positionClasses[position]}`}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{ '--notification-color': colors[type] }}
        >
            <div className="notification-icon">
                {icons[type]}
            </div>
            <div className="notification-content">
                <div className="notification-message">
                    {message}
                </div>
            </div>
            {showCloseButton && (
                <button
                    className="notification-close"
                    onClick={handleClose}
                >
                    <X size={16} />
                </button>
            )}
        </motion.div>
    );
};

// Контейнер для уведомлений
export const NotificationContainer = ({ notifications = [], onRemove }) => {
    return (
        <div className="notifications-container">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        {...notification}
                        onClose={() => onRemove(notification.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Хук для управления уведомлениями
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now().toString();
        const newNotification = { id, ...notification };
        setNotifications(prev => [...prev, newNotification]);
        return id;
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const showSuccess = (message, options = {}) => {
        return addNotification({ type: 'success', message, ...options });
    };

    const showError = (message, options = {}) => {
        return addNotification({ type: 'error', message, ...options });
    };

    const showWarning = (message, options = {}) => {
        return addNotification({ type: 'warning', message, ...options });
    };

    const showInfo = (message, options = {}) => {
        return addNotification({ type: 'info', message, ...options });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};

export default Notification;