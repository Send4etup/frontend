// src/components/IdeaCard/IdeaCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, ThumbsUp, ThumbsDown, MessageCircle,
    Clock, Tag, ChevronDown, ChevronUp
} from 'lucide-react';
// import './IdeaCard.css';

const IdeaCard = ({
                      id,
                      author,
                      authorAvatar,
                      date,
                      title,
                      description,
                      tags = [],
                      likes = 0,
                      dislikes = 0,
                      comments = 0,
                      status,
                      onLike,
                      onDislike,
                      onComment,
                      userVote = null // 'like', 'dislike', or null
                  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localLikes, setLocalLikes] = useState(likes);
    const [localDislikes, setLocalDislikes] = useState(dislikes);
    const [currentVote, setCurrentVote] = useState(userVote);

    const getStatusBadge = () => {
        const statusConfig = {
            new: { label: 'Новая', className: 'status-new' },
            considering: { label: 'На рассмотрении', className: 'status-considering' },
            planned: { label: 'Запланировано', className: 'status-planned' },
            completed: { label: 'Выполнено', className: 'status-completed' },
            rejected: { label: 'Отклонено', className: 'status-rejected' }
        };

        const config = statusConfig[status] || statusConfig.new;

        return (
            <motion.span
                className={`status-badge ${config.className}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
            >
                {config.label}
            </motion.span>
        );
    };

    const handleLike = () => {
        if (currentVote === 'like') {
            // Отмена лайка
            setLocalLikes(prev => prev - 1);
            setCurrentVote(null);
        } else if (currentVote === 'dislike') {
            // Переключение с дизлайка на лайк
            setLocalLikes(prev => prev + 1);
            setLocalDislikes(prev => prev - 1);
            setCurrentVote('like');
        } else {
            // Новый лайк
            setLocalLikes(prev => prev + 1);
            setCurrentVote('like');
        }
        onLike && onLike(id);
    };

    const handleDislike = () => {
        if (currentVote === 'dislike') {
            // Отмена дизлайка
            setLocalDislikes(prev => prev - 1);
            setCurrentVote(null);
        } else if (currentVote === 'like') {
            // Переключение с лайка на дизлайк
            setLocalDislikes(prev => prev + 1);
            setLocalLikes(prev => prev - 1);
            setCurrentVote('dislike');
        } else {
            // Новый дизлайк
            setLocalDislikes(prev => prev + 1);
            setCurrentVote('dislike');
        }
        onDislike && onDislike(id);
    };

    return (
        <motion.div
            className="idea-card"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className="idea-header">
                <div className="author-section">
                    <div className="author-avatar">
                        {authorAvatar ? (
                            <img src={authorAvatar} alt={author} />
                        ) : (
                            <User className="avatar-icon" />
                        )}
                    </div>
                    <div className="author-info">
                        <span className="author-name">{author}</span>
                        <span className="idea-date">
              <Clock className="date-icon" />
                            {date}
            </span>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <div className="idea-content">
                <h3 className="idea-title">{title}</h3>
                <motion.p
                    className={`idea-description ${isExpanded ? 'expanded' : ''}`}
                    layout
                >
                    {description}
                </motion.p>

                {description.length > 150 && (
                    <motion.button
                        className="expand-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isExpanded ? (
                            <>Свернуть <ChevronUp className="expand-icon" /></>
                        ) : (
                            <>Читать далее <ChevronDown className="expand-icon" /></>
                        )}
                    </motion.button>
                )}
            </div>

            {tags.length > 0 && (
                <div className="idea-tags">
                    {tags.map((tag, index) => (
                        <motion.span
                            key={index}
                            className="tag"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            <Tag className="tag-icon" />
                            {tag}
                        </motion.span>
                    ))}
                </div>
            )}

            <div className="idea-actions">
                <motion.button
                    className={`action-btn like-btn ${currentVote === 'like' ? 'active' : ''}`}
                    onClick={handleLike}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ThumbsUp className="action-icon" />
                    <span className="action-count">{localLikes}</span>
                </motion.button>

                <motion.button
                    className={`action-btn dislike-btn ${currentVote === 'dislike' ? 'active' : ''}`}
                    onClick={handleDislike}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ThumbsDown className="action-icon" />
                    <span className="action-count">{localDislikes}</span>
                </motion.button>

                {/*<motion.button*/}
                {/*    className="action-btn comment-btn"*/}
                {/*    onClick={() => onComment && onComment(id)}*/}
                {/*    whileHover={{ scale: 1.1 }}*/}
                {/*    whileTap={{ scale: 0.9 }}*/}
                {/*>*/}
                {/*    <MessageCircle className="action-icon" />*/}
                {/*    <span className="action-count">{comments} комментариев</span>*/}
                {/*</motion.button>*/}
            </div>
        </motion.div>
    );
};

export default IdeaCard;