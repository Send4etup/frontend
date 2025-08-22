// src/pages/VideosPage/VideosPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Eye, Clock, ThumbsUp, Filter, Search } from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './VideosPage.css';

const VideosPage = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', name: 'Все' },
        { id: 'math', name: 'Математика' },
        { id: 'russian', name: 'Русский' },
        { id: 'physics', name: 'Физика' },
        { id: 'chemistry', name: 'Химия' },
        { id: 'biology', name: 'Биология' },
        { id: 'lifehacks', name: 'Лайфхаки' }
    ];

    const videos = [
        {
            id: 1,
            title: 'Как решать квадратные уравнения за 5 минут',
            description: 'Простой способ решения квадратных уравнений',
            duration: '8:24',
            views: 15420,
            likes: 892,
            category: 'math',
            thumbnail: '/thumbnails/math1.jpg',
            publishedAt: '2025-08-20',
            instructor: 'Анна Петрова'
        },
        {
            id: 2,
            title: 'Правила русского языка: запятые',
            description: 'Когда ставить запятые - основные правила',
            duration: '12:15',
            views: 8934,
            likes: 567,
            category: 'russian',
            thumbnail: '/thumbnails/russian1.jpg',
            publishedAt: '2025-08-19',
            instructor: 'Михаил Иванов'
        },
        {
            id: 3,
            title: 'Физика: законы Ньютона простыми словами',
            description: 'Понимаем основы механики',
            duration: '15:30',
            views: 12378,
            likes: 743,
            category: 'physics',
            thumbnail: '/thumbnails/physics1.jpg',
            publishedAt: '2025-08-18',
            instructor: 'Елена Сидорова'
        },
        {
            id: 4,
            title: 'Органическая химия: основы',
            description: 'Введение в мир органических соединений',
            duration: '18:45',
            views: 6789,
            likes: 412,
            category: 'chemistry',
            thumbnail: '/thumbnails/chemistry1.jpg',
            publishedAt: '2025-08-17',
            instructor: 'Дмитрий Козлов'
        },
        {
            id: 5,
            title: 'Как быстро запомнить информацию',
            description: '5 техник эффективного запоминания',
            duration: '10:12',
            views: 23456,
            likes: 1234,
            category: 'lifehacks',
            thumbnail: '/thumbnails/lifehack1.jpg',
            publishedAt: '2025-08-16',
            instructor: 'Ольга Новикова'
        },
        {
            id: 6,
            title: 'Биология: строение клетки',
            description: 'Подробный разбор клеточного строения',
            duration: '14:20',
            views: 9876,
            likes: 654,
            category: 'biology',
            thumbnail: '/thumbnails/biology1.jpg',
            publishedAt: '2025-08-15',
            instructor: 'Ольга Новикова'
        },
        {
            id: 7,
            title: 'Тайм-менеджмент для студентов',
            description: 'Как эффективно планировать учебное время',
            duration: '11:30',
            views: 18765,
            likes: 987,
            category: 'lifehacks',
            thumbnail: '/thumbnails/lifehack2.jpg',
            publishedAt: '2025-08-14',
            instructor: 'Анна Петрова'
        },
        {
            id: 8,
            title: 'Математика: производные и интегралы',
            description: 'Основы математического анализа',
            duration: '22:18',
            views: 7432,
            likes: 445,
            category: 'math',
            thumbnail: '/thumbnails/math2.jpg',
            publishedAt: '2025-08-13',
            instructor: 'Анна Петрова'
        }
    ];

    const filteredVideos = videos.filter(video => {
        const matchesFilter = selectedFilter === 'all' || video.category === selectedFilter;
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleVideoClick = (video) => {
        navigate(`/video/${video.id}`);
    };

    const formatViews = (views) => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}М`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}К`;
        }
        return views.toString();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <motion.div
            className="videos-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                {/* Хедер */}
                <motion.div
                    className="page-header"
                    variants={itemAnimation}
                >
                    <button
                        className=""
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="icon" />
                    </button>
                    <h1 className="page-title">Видео</h1>
                    <div className="header-spacer"></div>
                </motion.div>

                {/* Поиск */}
                <motion.div
                    className="search-section"
                    variants={itemAnimation}
                >
                    <div className="search-container">
                        {/*<Search className="search-icon" />*/}
                        <input
                            type="text"
                            placeholder="Поиск видео..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </motion.div>

                {/*/!* Фильтры *!/*/}
                {/*<motion.div*/}
                {/*    className="filters-section"*/}
                {/*    variants={itemAnimation}*/}
                {/*>*/}
                {/*    <div className="filters-header">*/}
                {/*        <Filter className="icon" />*/}
                {/*        <span>Категории</span>*/}
                {/*    </div>*/}
                {/*    <div className="filters-list">*/}
                {/*        {filters.map((filter) => (*/}
                {/*            <button*/}
                {/*                key={filter.id}*/}
                {/*                className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}*/}
                {/*                onClick={() => setSelectedFilter(filter.id)}*/}
                {/*            >*/}
                {/*                {filter.name}*/}
                {/*            </button>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*</motion.div>*/}

                {/* Список видео */}
                <motion.div
                    className="videos-grid"
                    variants={itemAnimation}
                >
                    {filteredVideos.map((video, index) => (
                        <motion.div
                            key={video.id}
                            className="video-card"
                            onClick={() => handleVideoClick(video)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="video-thumbnail">
                                <div className="thumbnail-placeholder">
                                    <Play className="play-icon" />
                                </div>
                                <div className="video-duration">{video.duration}</div>
                            </div>

                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-description">{video.description}</p>
                                <p className="video-instructor">Автор: {video.instructor}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredVideos.length === 0 && (
                    <motion.div
                        className="empty-state"
                        variants={itemAnimation}
                    >
                        <Play className="empty-icon" />
                        <h3>Видео не найдены</h3>
                        <p>Попробуйте изменить поисковый запрос или категорию</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default VideosPage;