// src/pages/IdeasPage/IdeasPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './IdeasPage.css';

const IdeasPage = () => {
    const navigate = useNavigate();
    const [ideas, setIdeas] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Моковые данные идей
    const mockIdeas = [
        {
            id: 1,
            title: 'Добавить расписание звонков в приложение',
            description: 'Было бы удобно видеть расписание звонков прямо в приложении, особенно для новеньких. Можно добавить уведомления...',
            author: {
                name: 'Иванов Петр',
                avatar: '/avatars/petrov.jpg'
            },
            date: '2 дня назад',
            status: 'new',
            likes: 23,
            dislikes: 3,
            comments: 12,
            tags: ['Полезное', 'Расписание'],
            isLiked: false,
            isDisliked: false
        },
        {
            id: 2,
            title: 'Добавить расписание звонков в приложение',
            description: 'Было бы удобно видеть расписание звонков прямо в приложении, особенно для новеньких. Можно добавить уведомления...',
            author: {
                name: 'Иванов Петр',
                avatar: '/avatars/petrov.jpg'
            },
            date: '2 дня назад',
            status: 'reviewing',
            likes: 23,
            dislikes: 3,
            comments: 12,
            tags: ['Полезное', 'Автоматизация'],
            isLiked: true,
            isDisliked: false
        },
        {
            id: 3,
            title: 'Добавить расписание звонков в приложение',
            description: 'Было бы удобно видеть расписание звонков прямо в приложении, особенно для новеньких. Можно добавить уведомления...',
            author: {
                name: 'Иванов Петр',
                avatar: '/avatars/petrov.jpg'
            },
            date: '2 дня назад',
            status: 'completed',
            likes: 23,
            dislikes: 3,
            comments: 12,
            tags: ['Полезное', 'Расписание'],
            isLiked: false,
            isDisliked: false
        }
    ];

    useEffect(() => {
        loadIdeas();
    }, [activeTab]);

    const loadIdeas = async () => {
        setIsLoading(true);
        try {
            // Симуляция загрузки
            setTimeout(() => {
                setIdeas(mockIdeas);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Failed to load ideas:', error);
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    const handleCreateIdea = () => {
        setShowForm(true);
    };

    const handleLike = (ideaId) => {
        setIdeas(prev => prev.map(idea => {
            if (idea.id === ideaId) {
                const wasLiked = idea.isLiked;
                const wasDisliked = idea.isDisliked;

                return {
                    ...idea,
                    isLiked: !wasLiked,
                    isDisliked: false,
                    likes: wasLiked ? idea.likes - 1 : idea.likes + 1,
                    dislikes: wasDisliked ? idea.dislikes - 1 : idea.dislikes
                };
            }
            return idea;
        }));
    };

    const handleDislike = (ideaId) => {
        setIdeas(prev => prev.map(idea => {
            if (idea.id === ideaId) {
                const wasLiked = idea.isLiked;
                const wasDisliked = idea.isDisliked;

                return {
                    ...idea,
                    isLiked: false,
                    isDisliked: !wasDisliked,
                    likes: wasLiked ? idea.likes - 1 : idea.likes,
                    dislikes: wasDisliked ? idea.dislikes - 1 : idea.dislikes + 1
                };
            }
            return idea;
        }));
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'new': return 'Новая';
            case 'reviewing': return 'На рассмотрении';
            case 'completed': return 'Завершённое';
            default: return status;
        }
    };

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'new') return matchesSearch && idea.status === 'new';
        if (activeTab === 'popular') return matchesSearch && idea.likes > 20;
        if (activeTab === 'my') return matchesSearch && idea.author.name === 'Иванов Петр';

        return matchesSearch;
    });

    return (
        <motion.div
            className="school-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="home-container">
                <motion.div
                    className="page-header"
                    variants={itemAnimation}
                >
                    <motion.button
                        onClick={handleBack}
                        className=""
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft className="icon" />
                    </motion.button>
                    <h1 className="page-title">Идеи и предложения</h1>
                </motion.div>

                <motion.div
                    className="tabs"
                    variants={itemAnimation}
                >
                    {[
                        { key: 'all', label: 'Все' },
                        { key: 'new', label: 'Новые' },
                        { key: 'popular', label: 'Популярные' },
                        { key: 'my', label: 'Мои' }
                    ].map((tab) => (
                        <motion.button
                            key={tab.key}
                            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div
                    className="search-bar"
                    variants={itemAnimation}
                >
                    <Search className="idea-search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск идей"
                        className="search-input"
                    />
                </motion.div>

                <motion.div
                    className="ideas-list"
                    variants={itemAnimation}
                >
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            {filteredIdeas.length > 0 ? (
                                filteredIdeas.map((idea, index) => (
                                    <motion.div
                                        key={idea.id}
                                        className="idea-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="idea-header">
                                            <div className="idea-left">
                                                <div className="idea-avatar">
                                                    {idea.author.avatar ? (
                                                        <img
                                                            src={idea.author.avatar}
                                                            alt={idea.author.name}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <User className="idea-avatar-icon"
                                                          style={{display: idea.author.avatar ? 'none' : 'block'}}/>
                                                </div>
                                                <div className="idea-user-info">
                                                    <h3 className="idea-user-name">{idea.author.name}</h3>
                                                    <p className="idea-date">{idea.date}</p>
                                                </div>
                                            </div>
                                            <span className={`idea-status ${idea.status}`}>
                                                {getStatusText(idea.status)}
                                            </span>
                                        </div>

                                        <h2 className="idea-title">{idea.title}</h2>
                                        <p className="idea-description">{idea.description}</p>

                                        <div className="idea-tags">
                                            {idea.tags.map((tag, tagIndex) => (
                                                <span key={tagIndex} className="idea-tag">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="idea-actions">
                                            <motion.button
                                                className={`idea-action ${idea.isLiked ? 'active' : ''}`}
                                                onClick={() => handleLike(idea.id)}
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                            >
                                                <ThumbsUp className="icon" />
                                                <span>{idea.likes}</span>
                                            </motion.button>

                                            <motion.button
                                                className={`idea-action dislike ${idea.isDisliked ? 'active' : ''}`}
                                                onClick={() => handleDislike(idea.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ThumbsDown className="icon" />
                                                <span>{idea.dislikes}</span>
                                            </motion.button>

                                            {/*<button className="idea-action">*/}
                                            {/*    <MessageCircle className="icon" />*/}
                                            {/*    <span>{idea.comments} комментариев</span>*/}
                                            {/*</button>*/}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>Идеи не найдены</p>
                                    <p className="empty-subtitle">Будьте первым, кто предложит идею!</p>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                <motion.button
                    className="btn btn-white create-idea-btn"
                    onClick={handleCreateIdea}
                    variants={itemAnimation}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="icon" />
                    Предложить идею
                </motion.button>
            </div>
        </motion.div>
    );
};

export default IdeasPage;