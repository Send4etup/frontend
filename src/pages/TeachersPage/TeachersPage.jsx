// src/pages/TeachersPage/TeachersPage.jsx
import React, { useState } from "react";
import { ArrowLeft, Search, User, MapPin, Smartphone } from 'lucide-react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './TeachersPage.css';

const TeachersPage = ({ onBack }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleBack = () => {
        navigate('/profile');
    };

    const teachers = [
        {
            id: 1,
            name: 'Петрова Мария Ивановна',
            role: 'Математика • Классный руководитель',
            schedule: {
                'Понедельник': '2-й урок (9:00)',
                'Среда': '1-й урок (8:20)',
                'Суббота': '5-й урок (14:20)'
            },
            cabinet: '305',
            telegram: '@petrimsdw',
            avatar: '/avatars/teacher1.jpg'
        },
        {
            id: 2,
            name: 'Сидоров Алексей Николаевич',
            role: 'Физика',
            schedule: null,
            cabinet: '305',
            telegram: '@petrimsdw',
            avatar: '/avatars/teacher2.jpg'
        }
    ];

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            className="teachers-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
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
                    <h1 className="page-title">Мои учителя</h1>
                </motion.div>

                <motion.div
                    className="search-bar"
                    variants={itemAnimation}
                >
                    <Search className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск"
                        className="search-input"
                    />
                </motion.div>

                <motion.div
                    className="teachers-list"
                    variants={itemAnimation}
                >
                    {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher, index) => (
                            <motion.div
                                key={teacher.id}
                                className="teacher-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="teacher-header">
                                    <div className="teacher-avatar">
                                        {teacher.avatar ? (
                                            <img
                                                src={teacher.avatar}
                                                alt={teacher.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <User
                                            className="teacher-avatar-icon"
                                            style={{ display: teacher.avatar ? 'none' : 'block' }}
                                        />
                                    </div>
                                    <div className="teacher-info">
                                        <h3 className="teacher-name">{teacher.name}</h3>
                                        <p className="teacher-role">{teacher.role}</p>
                                    </div>
                                </div>

                                {teacher.schedule && (
                                    <div className="teacher-schedule">
                                        {Object.entries(teacher.schedule).map(([day, time]) => (
                                            <div key={day} className="schedule-item">
                                                <span className="schedule-day">{day}</span>
                                                <span className="schedule-time">{time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="teacher-contacts">
                                    <div className="contact-item">
                                        <MapPin className="contact-icon" />
                                        <span className="contact-text">Кабинет: {teacher.cabinet}</span>
                                    </div>
                                    <div className="contact-item">
                                        <Smartphone className="contact-icon" />
                                        <span className="contact-text">Telegram: {teacher.telegram}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <User className="empty-icon" />
                            <p>Учителя не найдены</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TeachersPage;