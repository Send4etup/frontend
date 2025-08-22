// src/pages/NotFoundPage/NotFoundPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './NotFoundPage.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            icon: Home,
            label: 'На главную',
            action: () => navigate('/'),
            color: '#43ff65'
        },
        {
            icon: MessageCircle,
            label: 'Начать чат',
            action: () => navigate('/'),
            color: '#3b82f6'
        },
        {
            icon: Search,
            label: 'Инструменты',
            action: () => navigate('/school'),
            color: '#f59e0b'
        }
    ];

    return (
        <motion.div
            className="not-found-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="not-found-content"
                    variants={itemAnimation}
                >
                    {/* Большая 404 */}
                    <motion.div
                        className="error-code"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        404
                    </motion.div>

                    {/* Заголовок и описание */}
                    <motion.div
                        className="error-message"
                        variants={itemAnimation}
                    >
                        <h1 className="error-title">Страница не найдена</h1>
                        <p className="error-description">
                            Похоже, что эта страница потерялась в цифровом пространстве.
                            Но не переживай — я помогу тебе найти то, что нужно!
                        </p>
                        <p className="error-quote">
                            "Каждый тупик — это возможность найти новый путь"
                        </p>
                        <p className="error-author">ТоварищБот</p>
                    </motion.div>

                    {/* Кнопки быстрых действий */}
                    <motion.div
                        className="error-actions"
                        variants={itemAnimation}
                    >
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.button
                                    key={index}
                                    className="error-action-btn"
                                    onClick={action.action}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    style={{ '--accent-color': action.color }}
                                >
                                    <Icon className="error-action-icon" />
                                    <span className="error-action-label">{action.label}</span>
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    {/* Кнопка назад */}
                    <motion.button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={itemAnimation}
                    >
                        <ArrowLeft className="back-icon" />
                        Вернуться назад
                    </motion.button>
                </motion.div>

                {/* Декоративные элементы */}
                <motion.div
                    className="floating-elements"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="floating-circle circle-1"></div>
                    <div className="floating-circle circle-2"></div>
                    <div className="floating-circle circle-3"></div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default NotFoundPage;