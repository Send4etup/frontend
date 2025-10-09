// src/pages/EducationPage/EducationPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Play, Users, Lightbulb,
    Edit, Clock, Star, Eye, User
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { pageTransition, itemAnimation } from '../../utils/animations';
import NewsModal from '../../components/NewsModal/NewsModal';
import './EducationPage.css';

const EducationPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Моковые данные для новостей
    const newsItems = [
        {
            id: 1,
            title: 'Обновление v2.5',
            text: 'Добавлены новые курсы, улучшен интерфейс',
            date: '7 мая сегодня',
            type: 'update'
        },
        {
            id: 2,
            title: 'Воркшоп по ЕГЭ',
            text: '15 марта в 14:00 Подготовка к экзамену',
            date: 'Завтра',
            type: 'course'
        },
        {
            id: 3,
            title: 'Физика ЕГЭ',
            text: 'По окончанию курса Класс автор',
            date: '15.02.25',
            type: 'exam'
        }
    ];

    // Категории
    const categories = [
        // {
        //     id: 1,
        //     title: 'Курсы',
        //     subtitle: '15 курсов',
        //     icon: BookOpen,
        //     route: '/courses'
        // },
        // {
        //     id: 2,
        //     title: 'Воркшопы',
        //     subtitle: '8 предстоящих',
        //     icon: Users,
        //     route: '/workshops'
        // },
        {
            id: 3,
            title: 'Видео',
            subtitle: '124 ролика',
            icon: Play,
            route: '/videos'
        },
        // {
        //     id: 4,
        //     title: 'Лайфхаки',
        //     subtitle: '54 совета',
        //     icon: Lightbulb,
        //     route: '/lifehacks'
        // }
    ];

    // Популярные курсы
    const popularCourses = [
        {
            id: 1,
            title: 'Математика: от базы к профилю',
            subtitle: 'Полная подготовка к экзамену',
            price: '2,999₽',
            students: 45,
            lessons: 24,
            rating: 4.8,
            icon: 'math',
            type: 'primary'
        }
    ];

    // Ближайшие воркшопы
    const upcomingWorkshops = [
        {
            id: 1,
            title: 'Эффективная подготовка по русскому',
            instructor: 'Игорь Сочивко Евгения',
            time: '18.06',
            avatar: '/avatars/instructor1.jpg',
            viewers: 14,
            duration: 60,
            rating: 4.9,
            type: 'register'
        },
        {
            id: 2,
            title: 'Как читать книги правильно',
            instructor: 'Разборы по примерам Станиславского',
            time: '18.06',
            avatar: '/avatars/instructor2.jpg',
            viewers: 8,
            duration: 45,
            rating: 4.7,
            type: 'register'
        }
    ];

    const handleCategoryClick = (category) => {
        console.log('Category clicked:', category);
        if (category.route) {
            navigate(category.route);
        }
    };

    const handleCourseClick = (course) => {
        console.log('Course clicked:', course);
        navigate(`/course/${course.id}`);
    };

    const handleWorkshopClick = (workshop) => {
        console.log('Workshop clicked:', workshop);
        navigate(`/workshop/${workshop.id}`);
    };

    const handleAllNewsClick = () => {
        navigate('/news');
    };

    const handleAllCoursesClick = () => {
        navigate('/courses');
    };

    const handleAllWorkshopsClick = () => {
        navigate('/workshops');
    };

    const [selectedNews, setSelectedNews] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleNewsClick = (newsItem) => {
        setSelectedNews(newsItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNews(null);
    };

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
                    className="page-title"
                    variants={itemAnimation}
                >
                    <h1>Образование</h1>
                </motion.div>

                {/* Новости и обновления */}
                <motion.div
                    className="news-section"
                    variants={itemAnimation}
                >
                    <div className="section-header">
                        <h2 className="section-courses-title">
                            <Edit className="icon" />
                            Новости и обновления
                        </h2>
                        {/*<button*/}
                        {/*    className="section-link"*/}
                        {/*    onClick={handleAllNewsClick}*/}
                        {/*>*/}
                        {/*    Все новости →*/}
                        {/*</button>*/}
                    </div>

                    <div className="news-grid">
                        {newsItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={`news-card ${item.type}`}
                                onClick={() => handleNewsClick(item)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <h3 className="news-card-title">{item.title}</h3>
                                <p className="news-card-text">{item.text}</p>
                                <p className="news-card-date">{item.date}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Категории */}
                <motion.div
                    className="categories-section"
                    variants={itemAnimation}
                >
                    <div className="section-header">
                        <h2 className="section-courses-title">Категории</h2>
                    </div>

                    <div className="categories-grid">
                        {categories.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <motion.button
                                    key={category.id}
                                    className="category-card"
                                    onClick={() => handleCategoryClick(category)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <IconComponent className="category-icon" />
                                    <h3 className="category-title">{category.title}</h3>
                                    <p className="category-subtitle">{category.subtitle}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <NewsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    news={selectedNews}
                />

                {/* Популярные курсы */}
                {/*<motion.div*/}
                {/*    className="courses-section"*/}
                {/*    variants={itemAnimation}*/}
                {/*>*/}
                {/*    <div className="section-header">*/}
                {/*        <h2 className="section-courses-title">📚 Популярные курсы</h2>*/}
                {/*        <button*/}
                {/*            className="section-link"*/}
                {/*            onClick={handleAllCoursesClick}*/}
                {/*        >*/}
                {/*            Все курсы →*/}
                {/*        </button>*/}
                {/*    </div>*/}

                {/*    {popularCourses.map((course, index) => (*/}
                {/*        <motion.div*/}
                {/*            key={course.id}*/}
                {/*            className="course-card"*/}
                {/*            onClick={() => handleCourseClick(course)}*/}
                {/*            initial={{ opacity: 0, y: 20 }}*/}
                {/*            animate={{ opacity: 1, y: 0 }}*/}
                {/*            transition={{ delay: index * 0.1 }}*/}
                {/*            whileHover={{ scale: 1.02 }}*/}
                {/*            whileTap={{ scale: 0.98 }}*/}
                {/*        >*/}
                {/*            <div className="course-header">*/}
                {/*                <div style={{ display: 'flex', alignItems: 'center' }}>*/}
                {/*                    <div className={`course-icon ${course.icon}`}>*/}
                {/*                        <BookOpen className="icon" />*/}
                {/*                    </div>*/}
                {/*                    <div className="course-info">*/}
                {/*                        <h3 className="course-title">{course.title}</h3>*/}
                {/*                        <p className="course-subtitle">{course.subtitle}</p>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*                <div className="course-price">{course.price}</div>*/}
                {/*            </div>*/}

                {/*            <div className="course-stats">*/}
                {/*                <div className="course-stat">*/}
                {/*                    <User className="icon" />*/}
                {/*                    <span>{course.students} учеников</span>*/}
                {/*                </div>*/}
                {/*                <div className="course-stat">*/}
                {/*                    <Play className="icon" />*/}
                {/*                    <span>{course.lessons} уроков</span>*/}
                {/*                </div>*/}
                {/*                <div className="course-stat">*/}
                {/*                    <Star className="icon" />*/}
                {/*                    <span>{course.rating}</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            <div className="course-action">*/}
                {/*                <button className={`course-btn ${course.type}`}>*/}
                {/*                    Открыть*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        </motion.div>*/}
                {/*    ))}*/}
                {/*</motion.div>*/}

                {/*/!* Ближайшие воркшопы *!/*/}
                {/*<motion.div*/}
                {/*    className="workshops-section"*/}
                {/*    variants={itemAnimation}*/}
                {/*>*/}
                {/*    <div className="section-header">*/}
                {/*        <h2 className="section-courses-title">🔧 Ближайшие воркшопы</h2>*/}
                {/*        <button*/}
                {/*            className="section-link"*/}
                {/*            onClick={handleAllWorkshopsClick}*/}
                {/*        >*/}
                {/*            Все воркшопы →*/}
                {/*        </button>*/}
                {/*    </div>*/}

                {/*    {upcomingWorkshops.map((workshop, index) => (*/}
                {/*        <motion.div*/}
                {/*            key={workshop.id}*/}
                {/*            className="workshop-card"*/}
                {/*            onClick={() => handleWorkshopClick(workshop)}*/}
                {/*            initial={{ opacity: 0, y: 20 }}*/}
                {/*            animate={{ opacity: 1, y: 0 }}*/}
                {/*            transition={{ delay: index * 0.1 }}*/}
                {/*            whileHover={{ scale: 1.02 }}*/}
                {/*            whileTap={{ scale: 0.98 }}*/}
                {/*        >*/}
                {/*            <div className="workshop-header">*/}
                {/*                <img*/}
                {/*                    // src={workshop.avatar}*/}
                {/*                    alt={workshop.instructor}*/}
                {/*                    className="workshop-avatar"*/}
                {/*                    // onError={(e) => {*/}
                {/*                    //     e.target.src = '/default-avatar.png';*/}
                {/*                    // }}*/}
                {/*                />*/}
                {/*                <div className="workshop-info">*/}
                {/*                    <h3 className="workshop-title">{workshop.title}</h3>*/}
                {/*                    <p className="workshop-instructor">{workshop.instructor}</p>*/}
                {/*                    <p className="workshop-time">{workshop.time}</p>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            <div className="workshop-stats">*/}
                {/*                <div className="workshop-stat">*/}
                {/*                    <Eye className="icon" />*/}
                {/*                    <span>{workshop.viewers} зрителей</span>*/}
                {/*                </div>*/}
                {/*                <div className="workshop-stat">*/}
                {/*                    <Clock className="icon" />*/}
                {/*                    <span>{workshop.duration} мин</span>*/}
                {/*                </div>*/}
                {/*                <div className="workshop-stat">*/}
                {/*                    <Star className="icon" />*/}
                {/*                    <span>{workshop.rating}</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            <div className="workshop-action">*/}
                {/*                <button className="workshop-btn">*/}
                {/*                    Записаться*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        </motion.div>*/}
                {/*    ))}*/}
                {/*</motion.div>*/}

                {isLoading && <LoadingSpinner />}
            </div>

        </motion.div>
    );
};

export default EducationPage;