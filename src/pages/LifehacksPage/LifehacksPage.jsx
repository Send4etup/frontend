// src/pages/LifehacksPage/LifehacksPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Clock, Star, BookOpen, Filter, Search } from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
// import './LifehacksPage.css';

const LifehacksPage = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', name: 'Все' },
        { id: 'study', name: 'Учеба' },
        { id: 'memory', name: 'Память' },
        { id: 'time', name: 'Время' },
        { id: 'motivation', name: 'Мотивация' },
        { id: 'exam', name: 'Экзамены' }
    ];

    const lifehacks = [
        {
            id: 1,
            title: 'Техника Помодоро для учебы',
            description: 'Как работать блоками по 25 минут для максимальной эффективности',
            category: 'time',
            readTime: 3,
            rating: 4.8,
            tips: [
                'Работай 25 минут без перерыва',
                'Делай перерыв 5 минут',
                'После 4 циклов - большой перерыв 30 минут',
                'Отключи все уведомления'
            ],
            difficulty: 'easy'
        },
        {
            id: 2,
            title: 'Мнемотехники для запоминания',
            description: 'Эффективные способы запомнить большие объемы информации',
            category: 'memory',
            readTime: 5,
            rating: 4.9,
            tips: [
                'Создавай яркие ассоциации',
                'Используй метод дворца памяти',
                'Повторяй через интервалы: 1 день, 3 дня, неделя',
                'Рисуй mind maps для сложных тем'
            ],
            difficulty: 'medium'
        },
        {
            id: 3,
            title: 'Как побороть прокрастинацию',
            description: 'Простые техники, чтобы начать делать то, что не хочется',
            category: 'motivation',
            readTime: 4,
            rating: 4.7,
            tips: [
                'Правило 2 минут: если можешь сделать за 2 минуты - делай сразу',
                'Начни с самого простого действия',
                'Разбей большую задачу на маленькие',
                'Награждай себя за выполненные задачи'
            ],
            difficulty: 'easy'
        },
        {
            id: 4,
            title: 'Эффективное конспектирование',
            description: 'Как вести конспекты, чтобы легко готовиться к экзаменам',
            category: 'study',
            readTime: 6,
            rating: 4.6,
            tips: [
                'Используй метод Корнелла',
                'Выделяй ключевые слова цветом',
                'Оставляй место для дополнений',
                'Делай краткие выводы после каждой темы'
            ],
            difficulty: 'medium'
        },
        {
            id: 5,
            title: 'Подготовка к экзамену за неделю',
            description: 'Стратегия интенсивной подготовки к экзамену',
            category: 'exam',
            readTime: 8,
            rating: 4.8,
            tips: [
                'День 1-2: Изучи программу и раздели темы',
                'День 3-5: Изучай по 3-4 темы в день',
                'День 6: Решай тесты и задачи',
                'День 7: Повторяй самые сложные моменты'
            ],
            difficulty: 'hard'
        },
        {
            id: 6,
            title: 'Как читать учебники быстрее',
            description: 'Техники скорочтения для учебной литературы',
            category: 'study',
            readTime: 5,
            rating: 4.5,
            tips: [
                'Сначала прочитай заголовки и выводы',
                'Не проговаривай текст в голове',
                'Читай группами слов, а не по одному',
                'Делай заметки ключевых моментов'
            ],
            difficulty: 'medium'
        },
        {
            id: 7,
            title: 'Мотивация на долгосрочное обучение',
            description: 'Как сохранить мотивацию к учебе на месяцы и годы',
            category: 'motivation',
            readTime: 7,
            rating: 4.9,
            tips: [
                'Ставь конкретные и измеримые цели',
                'Веди дневник прогресса',
                'Найди единомышленников',
                'Празднуй маленькие победы'
            ],
            difficulty: 'medium'
        },
        {
            id: 8,
            title: 'Техника активного повторения',
            description: 'Как повторять материал, чтобы он остался в долгосрочной памяти',
            category: 'memory',
            readTime: 4,
            rating: 4.7,
            tips: [
                'Повторяй без подглядывания в учебник',
                'Объясняй материал вслух',
                'Используй флеш-карточки',
                'Решай задачи разного типа'
            ],
            difficulty: 'easy'
        }
    ];

    const filteredLifehacks = lifehacks.filter(lifehack => {
        const matchesFilter = selectedFilter === 'all' || lifehack.category === selectedFilter;
        const matchesSearch = lifehack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lifehack.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleLifehackClick = (lifehack) => {
        navigate(`/lifehack/${lifehack.id}`, { state: { lifehack } });
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'easy': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'hard': return '#ef4444';
            default: return '#43ff65';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 'easy': return 'Легко';
            case 'medium': return 'Средне';
            case 'hard': return 'Сложно';
            default: return 'Средне';
        }
    };

    return (
        <motion.div
            className="lifehacks-page"
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
                    <h1 className="page-title">Лайфхаки</h1>
                    <div className="header-spacer"></div>
                </motion.div>

                {/* Поиск */}
                <motion.div
                    className="search-section"
                    variants={itemAnimation}
                >
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Поиск лайфхаков..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
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

                {/* Список лайфхаков */}
                <motion.div
                    className="lifehacks-list"
                    variants={itemAnimation}
                >
                    {filteredLifehacks.map((lifehack, index) => (
                        <motion.div
                            key={lifehack.id}
                            className="lifehack-card"
                            onClick={() => handleLifehackClick(lifehack)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="lifehack-header">
                                <div className="lifehack-icon">
                                    <Lightbulb className="icon" />
                                </div>
                                <div className="lifehack-info">
                                    <h3 className="lifehack-title">{lifehack.title}</h3>
                                    <p className="lifehack-description">{lifehack.description}</p>
                                </div>
                                <div
                                    className="lifehack-difficulty"
                                    style={{ backgroundColor: getDifficultyColor(lifehack.difficulty) }}
                                >
                                    {getDifficultyText(lifehack.difficulty)}
                                </div>
                            </div>

                            <div className="lifehack-stats">
                                <div className="lifehack-stat">
                                    <Clock className="icon" />
                                    <span>{lifehack.readTime} мин чтения</span>
                                </div>
                                <div className="lifehack-stat">
                                    <Star className="icon" />
                                    <span>{lifehack.rating}</span>
                                </div>
                                <div className="lifehack-stat">
                                    <BookOpen className="icon" />
                                    <span>{lifehack.tips.length} советов</span>
                                </div>
                            </div>

                            <div className="lifehack-preview">
                                <h4>Основные советы:</h4>
                                <ul>
                                    {lifehack.tips.slice(0, 2).map((tip, tipIndex) => (
                                        <li key={tipIndex}>{tip}</li>
                                    ))}
                                    {lifehack.tips.length > 2 && (
                                        <li className="more-tips">
                                            и еще {lifehack.tips.length - 2} совет(ов)...
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="lifehack-action">
                                <button className="lifehack-btn">
                                    Читать полностью
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredLifehacks.length === 0 && (
                    <motion.div
                        className="empty-state"
                        variants={itemAnimation}
                    >
                        <Lightbulb className="empty-icon" />
                        <h3>Лайфхаки не найдены</h3>
                        <p>Попробуйте изменить поисковый запрос или категорию</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default LifehacksPage;