// src/pages/CoursesPage/CoursesPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Star, User, Play, Filter } from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
// import './CoursesPage.css';

const CoursesPage = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('all');

    const filters = [
        { id: 'all', name: 'Все' },
        { id: 'math', name: 'Математика' },
        { id: 'russian', name: 'Русский' },
        { id: 'physics', name: 'Физика' },
        { id: 'chemistry', name: 'Химия' },
        { id: 'biology', name: 'Биология' }
    ];

    const courses = [
        {
            id: 1,
            title: 'Математика: от базы к профилю',
            subtitle: 'Полная подготовка к экзамену',
            price: '2,999₽',
            students: 45,
            lessons: 24,
            rating: 4.8,
            category: 'math',
            difficulty: 'intermediate',
            instructor: 'Анна Петрова'
        },
        {
            id: 2,
            title: 'Русский язык ЕГЭ 2025',
            subtitle: 'Подготовка к экзамену с нуля',
            price: '1,999₽',
            students: 67,
            lessons: 18,
            rating: 4.9,
            category: 'russian',
            difficulty: 'beginner',
            instructor: 'Михаил Иванов'
        },
        {
            id: 3,
            title: 'Физика: механика и динамика',
            subtitle: 'Основы физики для школьников',
            price: '2,499₽',
            students: 23,
            lessons: 20,
            rating: 4.7,
            category: 'physics',
            difficulty: 'intermediate',
            instructor: 'Елена Сидорова'
        },
        {
            id: 4,
            title: 'Органическая химия',
            subtitle: 'Изучаем органику от простого к сложному',
            price: '2,199₽',
            students: 34,
            lessons: 16,
            rating: 4.6,
            category: 'chemistry',
            difficulty: 'advanced',
            instructor: 'Дмитрий Козлов'
        },
        {
            id: 5,
            title: 'Биология: генетика и эволюция',
            subtitle: 'Углубленное изучение биологии',
            price: '1,799₽',
            students: 56,
            lessons: 14,
            rating: 4.8,
            category: 'biology',
            difficulty: 'intermediate',
            instructor: 'Ольга Новикова'
        }
    ];

    const filteredCourses = selectedFilter === 'all'
        ? courses
        : courses.filter(course => course.category === selectedFilter);

    const handleCourseClick = (course) => {
        navigate(`/course/${course.id}`);
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'beginner': return '#22c55e';
            case 'intermediate': return '#f59e0b';
            case 'advanced': return '#ef4444';
            default: return '#43ff65';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 'beginner': return 'Начальный';
            case 'intermediate': return 'Средний';
            case 'advanced': return 'Продвинутый';
            default: return 'Средний';
        }
    };

    return (
        <motion.div
            className="courses-page"
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
                    <h1 className="page-title">Курсы</h1>
                    <div className="header-spacer"></div>
                </motion.div>

                {/* Фильтры */}
                <motion.div
                    className="filters-section"
                    variants={itemAnimation}
                >
                    <div className="filters-header">
                        <Filter className="icon" />
                        <span>Категории</span>
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

                {/* Список курсов */}
                <motion.div
                    className="courses-list"
                    variants={itemAnimation}
                >
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            className="course-card"
                            onClick={() => handleCourseClick(course)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="course-header">
                                <div className="course-main-info">
                                    <div className="course-icon">
                                        <BookOpen className="icon" />
                                    </div>
                                    <div className="course-info">
                                        <h3 className="course-title">{course.title}</h3>
                                        <p className="course-subtitle">{course.subtitle}</p>
                                        <p className="course-instructor">Преподаватель: {course.instructor}</p>
                                    </div>
                                </div>
                                <div className="course-price">{course.price}</div>
                            </div>

                            <div className="course-meta">
                                <div
                                    className="course-difficulty"
                                    style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
                                >
                                    {getDifficultyText(course.difficulty)}
                                </div>
                            </div>

                            <div className="course-stats">
                                <div className="course-stat">
                                    <User className="icon" />
                                    <span>{course.students} учеников</span>
                                </div>
                                <div className="course-stat">
                                    <Play className="icon" />
                                    <span>{course.lessons} уроков</span>
                                </div>
                                <div className="course-stat">
                                    <Star className="icon" />
                                    <span>{course.rating}</span>
                                </div>
                            </div>

                            <div className="course-action">
                                <button className="course-btn">
                                    Подробнее
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredCourses.length === 0 && (
                    <motion.div
                        className="empty-state"
                        variants={itemAnimation}
                    >
                        <BookOpen className="empty-icon" />
                        <h3>Курсы не найдены</h3>
                        <p>Попробуйте выбрать другую категорию</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default CoursesPage;