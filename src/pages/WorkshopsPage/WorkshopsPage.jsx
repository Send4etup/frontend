// src/pages/WorkshopsPage/WorkshopsPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Eye, Star, Calendar, Filter } from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
// import './WorkshopsPage.css';

const WorkshopsPage = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('upcoming');

    const filters = [
        { id: 'upcoming', name: 'Предстоящие' },
        { id: 'today', name: 'Сегодня' },
        { id: 'week', name: 'На неделе' },
        { id: 'past', name: 'Прошедшие' }
    ];

    const workshops = [
        {
            id: 1,
            title: 'Эффективная подготовка по русскому',
            instructor: 'Игорь Сочивко',
            description: 'Разбираем сложные темы русского языка',
            date: '2025-08-25',
            time: '18:00',
            duration: 60,
            viewers: 14,
            maxViewers: 30,
            rating: 4.9,
            status: 'upcoming',
            category: 'russian',
            isLive: false
        },
        {
            id: 2,
            title: 'Математика: решение сложных задач',
            instructor: 'Анна Петрова',
            description: 'Практикум по решению задач ЕГЭ',
            date: '2025-08-23',
            time: '19:30',
            duration: 90,
            viewers: 25,
            maxViewers: 40,
            rating: 4.8,
            status: 'today',
            category: 'math',
            isLive: true
        },
        {
            id: 3,
            title: 'Физика: законы механики',
            instructor: 'Елена Сидорова',
            description: 'Углубленное изучение механики',
            date: '2025-08-24',
            time: '17:00',
            duration: 75,
            viewers: 18,
            maxViewers: 35,
            rating: 4.7,
            status: 'upcoming',
            category: 'physics',
            isLive: false
        },
        {
            id: 4,
            title: 'Химия: органические реакции',
            instructor: 'Дмитрий Козлов',
            description: 'Разбор механизмов органических реакций',
            date: '2025-08-20',
            time: '16:00',
            duration: 60,
            viewers: 22,
            maxViewers: 25,
            rating: 4.6,
            status: 'past',
            category: 'chemistry',
            isLive: false
        },
        {
            id: 5,
            title: 'Биология: генетика и наследственность',
            instructor: 'Ольга Новикова',
            description: 'Основы генетики для ЕГЭ',
            date: '2025-08-26',
            time: '20:00',
            duration: 80,
            viewers: 31,
            maxViewers: 50,
            rating: 4.8,
            status: 'week',
            category: 'biology',
            isLive: false
        }
    ];

    const filteredWorkshops = workshops.filter(workshop => {
        if (selectedFilter === 'upcoming') {
            return workshop.status === 'upcoming' || workshop.status === 'week';
        }
        return workshop.status === selectedFilter;
    });

    const handleWorkshopClick = (workshop) => {
        navigate(`/workshop/${workshop.id}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    };

    const getStatusColor = (status, isLive) => {
        if (isLive) return '#ef4444';
        switch(status) {
            case 'today': return '#f59e0b';
            case 'upcoming': return '#22c55e';
            case 'week': return '#3b82f6';
            case 'past': return '#6b7280';
            default: return '#43ff65';
        }
    };

    const getStatusText = (status, isLive) => {
        if (isLive) return 'В ЭФИРЕ';
        switch(status) {
            case 'today': return 'Сегодня';
            case 'upcoming': return 'Скоро';
            case 'week': return 'На неделе';
            case 'past': return 'Завершен';
            default: return 'Запланирован';
        }
    };

    return (
        <motion.div
            className="workshops-page"
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
                    <h1 className="page-title">Воркшопы</h1>
                    <div className="header-spacer"></div>
                </motion.div>

                {/* Фильтры */}
                <motion.div
                    className="filters-section"
                    variants={itemAnimation}
                >
                    <div className="filters-header">
                        <Filter className="icon" />
                        <span>Время проведения</span>
                    </div>
                    <div className="filters-list">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                                onClick={() => setSelectedFilter(filter.id)}
                            >
                                {filter.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Список воркшопов */}
                <motion.div
                    className="workshops-list"
                    variants={itemAnimation}
                >
                    {filteredWorkshops.map((workshop, index) => (
                        <motion.div
                            key={workshop.id}
                            className={`workshop-card ${workshop.isLive ? 'live' : ''}`}
                            onClick={() => handleWorkshopClick(workshop)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="workshop-header">
                                <div className="workshop-avatar">
                                    <Users className="icon" />
                                </div>
                                <div className="workshop-info">
                                    <h3 className="workshop-title">{workshop.title}</h3>
                                    <p className="workshop-instructor">Ведет: {workshop.instructor}</p>
                                    <p className="workshop-description">{workshop.description}</p>
                                </div>
                                <div
                                    className="workshop-status"
                                    style={{ backgroundColor: getStatusColor(workshop.status, workshop.isLive) }}
                                >
                                    {getStatusText(workshop.status, workshop.isLive)}
                                </div>
                            </div>

                            <div className="workshop-schedule">
                                <div className="workshop-date">
                                    <Calendar className="icon" />
                                    <span>{formatDate(workshop.date)}</span>
                                </div>
                                <div className="workshop-time">
                                    <Clock className="icon" />
                                    <span>{workshop.time} ({workshop.duration} мин)</span>
                                </div>
                            </div>

                            <div className="workshop-stats">
                                <div className="workshop-stat">
                                    <Eye className="icon" />
                                    <span>{workshop.viewers}/{workshop.maxViewers} зрителей</span>
                                </div>
                                <div className="workshop-stat">
                                    <Star className="icon" />
                                    <span>{workshop.rating}</span>
                                </div>
                            </div>

                            <div className="workshop-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${(workshop.viewers / workshop.maxViewers) * 100}%`,
                                            backgroundColor: getStatusColor(workshop.status, workshop.isLive)
                                        }}
                                    />
                                </div>
                                <span className="progress-text">
                                    {Math.round((workshop.viewers / workshop.maxViewers) * 100)}% заполнено
                                </span>
                            </div>

                            <div className="workshop-action">
                                <button
                                    className={`workshop-btn ${workshop.isLive ? 'live' : workshop.status === 'past' ? 'past' : 'upcoming'}`}
                                >
                                    {workshop.isLive ? 'Смотреть' : workshop.status === 'past' ? 'Запись' : 'Записаться'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredWorkshops.length === 0 && (
                    <motion.div
                        className="empty-state"
                        variants={itemAnimation}
                    >
                        <Users className="empty-icon" />
                        <h3>Воркшопы не найдены</h3>
                        <p>Попробуйте выбрать другой период</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default WorkshopsPage;