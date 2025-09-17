// src/pages/ChatHistoryPage/ChatHistoryPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Trash2, Edit3, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatHistoryPage.css';
import { getUserChats, deleteChatById, updateChatTitle } from '../../services/chatAPI.js';
import {getAgentByAction} from "../../utils/aiAgentsUtils.js";

// =====================================================
// КОМПОНЕНТ КАРТОЧКИ ЧАТА
// =====================================================

const ChatItem = ({ chat, onEdit, onDelete, onNavigateToChat, isEditing, onCancelEdit }) => {
    const [editTitle, setEditTitle] = useState(chat.title);
    const [isDeleting, setIsDeleting] = useState(false);
    const editInputRef = useRef(null);


    const getChatIcon = (chatType) => {
        const agentConfig = getAgentByAction(chatType);
        if (agentConfig && agentConfig.icon) {
            const IconComponent = agentConfig.icon;
            return {
                icon: IconComponent,
                color: agentConfig.iconColor
            };
        }
        // Fallback если не найдена
        return {
            icon: MessageCircle,
            color: '#43ff65'
        };
    };
    const { icon: IconComponent, color } = getChatIcon(chat.type);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editTitle.trim() && editTitle !== chat.title) {
            onEdit(chat.chat_id, editTitle.trim());
        } else {
            onCancelEdit();
        }
    };

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(chat.chat_id);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} мин назад`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ч назад`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 30) {
                return `${diffInDays} д назад`;
            } else {
                return date.toLocaleDateString('ru-RU');
            }
        }
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'general': '#43ff65',
            'coding': '#22c55e',
            'brainstorm': '#3b82f6',
            'images': '#ec4899',
            'excuses': '#f59e0b',
            'study_tools': '#8b5cf6'
        };
        return typeColors[type] || '#43ff65';
    };

    const getTypeLabel = (type) => {
        const typeLabels = {
            'general': 'Общий',
            'coding': 'Кодинг',
            'brainstorm': 'Брейншторм',
            'images': 'Изображения',
            'excuses': 'Отмазки',
            'study_tools': 'Учеба'
        };
        return typeLabels[type] || 'Чат';
    };

    return (
        <motion.div
            className={`chat-item ${isDeleting ? 'deleting' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
            whileHover={{ scale: isEditing ? 1 : 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className="chat-main-content"
                onClick={() => !isEditing && !isDeleting && onNavigateToChat(chat.chat_id)}
            >
                <div className="chat-icons">
                    <IconComponent
                        className="icon"
                        style={{color: color}}
                    />
                </div>

                <div className="chat-content">
                    <div className="chat-title-header">
                        {isEditing ? (
                            <form onSubmit={handleEditSubmit} className="edit-form">
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => editTitle === chat.title && onCancelEdit()}
                                    onKeyDown={(e) => e.key === 'Escape' && onCancelEdit()}
                                    className="edit-input"
                                    maxLength={50}
                                />
                            </form>
                        ) : (
                            <h4 className="chat-title">{chat.title}</h4>
                        )}
                    </div>

                    {chat.last_message && (
                        <p className="last-message">
                            {chat.last_message.length > 80
                                ? chat.last_message.substring(0, 80) + '...'
                                : chat.last_message}
                        </p>
                    )}

                    <div className="chat-meta">
                        <span className="history-chat-time">
                            {formatTime(chat.updated_at || chat.created_at)}
                        </span>

                        <span className="history-chat-stats">
                            {chat.messages_count} сообщений • {chat.tokens_used || 0} токенов
                        </span>
                    </div>
                </div>
            </div>

            {!isEditing && (
                <div className="chat-actions">
                    <button
                        className="action-btn edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(chat.chat_id, chat.title);
                        }}
                        disabled={isDeleting}
                        title="Изменить название"
                    >
                        <Edit3 className="action-icon" />
                    </button>

                    <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        title="Удалить чат"
                    >
                        <Trash2 className="action-icon" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};

// =====================================================
// МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ
// =====================================================

const DeleteConfirmModal = ({ isOpen, chatTitle, onConfirm, onCancel, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
            >
                <motion.div
                    className="delete-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-icon">
                        <AlertCircle className="warning-icon" />
                    </div>

                    <h3 className="modal-title">Удалить чат?</h3>

                    <p className="modal-description">
                        Чат <strong>"{chatTitle}"</strong> будет удален навсегда.
                        Все сообщения и файлы будут потеряны.
                    </p>

                    <div className="modal-actions">
                        <button
                            className="modal-btn cancel-btn"
                            onClick={onCancel}
                            disabled={isDeleting}
                        >
                            Отмена
                        </button>
                        <button
                            className="modal-btn delete-btn"
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Удаляется...' : 'Удалить'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// =====================================================
// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
// =====================================================

const ChatHistoryPage = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [editingChatId, setEditingChatId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, chat: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(0);
    const CHATS_PER_PAGE = 20;

    // Ref для Intersection Observer
    const loadMoreRef = useRef(null);

    // Загрузка первых чатов
    useEffect(() => {
        loadInitialChats();
    }, []);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMoreChats();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading]);

    const loadInitialChats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getUserChats(CHATS_PER_PAGE);

            if (response.success) {
                setChats(response.data);
                setHasMore(response.data.length === CHATS_PER_PAGE);
                setCurrentPage(1);
            } else {
                setError('Не удалось загрузить чаты');
            }
        } catch (err) {
            setError('Произошла ошибка при загрузке чатов');
            console.error('Error loading chats:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreChats = useCallback(async () => {
        if (!hasMore || loadingMore) return;

        try {
            setLoadingMore(true);

            const response = await getUserChats(CHATS_PER_PAGE, currentPage * CHATS_PER_PAGE);

            if (response.success) {
                const newChats = response.data;
                setChats(prev => [...prev, ...newChats]);
                setHasMore(newChats.length === CHATS_PER_PAGE);
                setCurrentPage(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error loading more chats:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [currentPage, hasMore, loadingMore]);

    const handleNavigateToChat = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const handleEditChat = (chatId, currentTitle) => {
        setEditingChatId(chatId);
    };

    const handleSaveEdit = async (chatId, newTitle) => {
        try {
            const response = await updateChatTitle(chatId, newTitle);

            if (response.success) {
                setChats(prev => prev.map(chat =>
                    chat.chat_id === chatId
                        ? { ...chat, title: newTitle }
                        : chat
                ));
                setEditingChatId(null);
            } else {
                alert('Не удалось изменить название чата');
            }
        } catch (err) {
            console.error('Error updating chat title:', err);
            alert('Произошла ошибка при изменении названия');
        }
    };

    const handleCancelEdit = () => {
        setEditingChatId(null);
    };

    const handleDeleteChat = (chat) => {
        setDeleteModal({ isOpen: true, chat });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.chat) return;

        try {
            setIsDeleting(true);

            const response = await deleteChatById(deleteModal.chat.chat_id);

            if (response.success) {
                setChats(prev => prev.filter(chat => chat.chat_id !== deleteModal.chat.chat_id));
                setDeleteModal({ isOpen: false, chat: null });
            } else {
                alert('Не удалось удалить чат');
            }
        } catch (err) {
            console.error('Error deleting chat:', err);
            alert('Произошла ошибка при удалении чата');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setDeleteModal({ isOpen: false, chat: null });
        }
    };

    if (loading) {
        return (
            <div className="chat-history-page">
                <div className="history-page-header">
                    <button className="history-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft className="icon" />
                    </button>
                    <h1 className="page-title">История чатов</h1>
                </div>

                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Загружаем ваши чаты...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chat-history-page">
                <div className="page-header">
                    <button className="" onClick={() => navigate(-1)}>
                        <ArrowLeft className="icon" />
                    </button>
                    <h1 className="page-title">История чатов</h1>
                </div>

                <div className="error-container">
                    <AlertCircle className="error-icon" />
                    <h3>Произошла ошибка</h3>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={loadInitialChats}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-history-page">
            <div className="history-page-header">
                <>
                    <button className="" onClick={() => navigate(-1)}>
                        <ArrowLeft className="icon"/>
                    </button>
                </>
                <h1 className="history-page-title">
                    <h3>История чатов</h3>
                    <span className="chats-count">({chats.length})</span>
                </h1>
            </div>

            <div className="chats-container">
                {chats.length === 0 ? (
                    <div className="empty-state">
                        <MessageCircle className="empty-icon" />
                        <h3>Нет сохраненных чатов</h3>
                        <p>Ваши беседы с ИИ-помощником будут отображаться здесь</p>
                        <button
                            className="create-chat-btn"
                            onClick={() => navigate('/')}
                        >
                            Начать первый чат
                        </button>
                    </div>
                ) : (
                    <div className="chats-list">
                        <AnimatePresence mode="popLayout">
                            {chats.map((chat) => (
                                <ChatItem
                                    key={chat.chat_id}
                                    chat={chat}
                                    onEdit={handleEditChat}
                                    onDelete={handleDeleteChat}
                                    onNavigateToChat={handleNavigateToChat}
                                    isEditing={editingChatId === chat.chat_id}
                                    onCancelEdit={handleCancelEdit}
                                    onSaveEdit={handleSaveEdit}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Индикатор загрузки дополнительных чатов */}
                        {loadingMore && (
                            <div className="loading-more">
                                <div className="loading-spinner small" />
                                <span>Загружаем больше чатов...</span>
                            </div>
                        )}

                        {/* Элемент для Intersection Observer */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="load-trigger" />
                        )}

                        {/* Сообщение об окончании списка */}
                        {!hasMore && chats.length > 0 && (
                            <div className="end-message">
                                <span>Все чаты загружены</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно подтверждения удаления */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                chatTitle={deleteModal.chat?.title}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default ChatHistoryPage;