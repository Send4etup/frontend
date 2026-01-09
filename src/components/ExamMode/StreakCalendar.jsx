// src/components/ExamMode/StreakCalendar.jsx
/**
 * Компонент календаря серии дней с огоньками
 * ОБНОВЛЕННАЯ ВЕРСИЯ - работает с существующим API /progress/calendar
 *
 * API возвращает только прошлые дни, поэтому будущие дни генерируем на фронте
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import './StreakCalendar.css';

const StreakCalendar = ({ progressData, streakDays, bestStreak }) => {
    /**
     * Генерация календарных дней с учетом API данных
     * API возвращает только прошлые дни, будущие генерируем сами
     */
    const generateCalendarDays = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const monthNames = [
            'янв', 'фев', 'мар', 'апр', 'май', 'июн',
            'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
        ];

        // Создаем мапу из API данных для быстрого поиска
        const progressMap = new Map();
        if (progressData && Array.isArray(progressData)) {
            progressData.forEach(item => {
                // item.date может быть строкой "2026-01-09" или Date объектом
                const dateStr = typeof item.date === 'string'
                    ? item.date
                    : item.date.toISOString().split('T')[0];
                progressMap.set(dateStr, item);
            });
        }

        // Генерируем 7 дней: 3 назад, сегодня, 3 вперед
        for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dateString = date.toISOString().split('T')[0];

            // Ищем прогресс для этой даты в данных от API
            const progress = progressMap.get(dateString);

            const isPast = i < 0;
            const isToday = i === 0;
            const isFuture = i > 0;

            days.push({
                date: date,
                dateString: dateString,
                dayName: dayNames[date.getDay()],
                dayNumber: date.getDate(),
                monthName: monthNames[date.getMonth()],
                isToday: isToday,
                isPast: isPast,
                isFuture: isFuture,
                // Для прошлых дней и сегодня используем данные от API
                isCompleted: isPast || isToday ? (progress?.is_completed || false) : false,
                tasksCompleted: isPast || isToday ? (progress?.tasks_completed || 0) : 0
            });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="streak-calendar-container">
            {/* Заголовок с информацией о серии */}
            <div className="streak-header">
                <div className="streak-info">
                    <div className="streak-current">
                        <Flame size={24} color="#ff6b35" />
                        <div>
                            <div className="streak-value">{streakDays || 0}</div>
                            <div className="streak-label">дней подряд</div>
                        </div>
                    </div>

                    {bestStreak > 0 && (
                        <div className="streak-best">
                            <div className="best-icon">🏆</div>
                            <div>
                                <div className="best-value">{bestStreak}</div>
                                <div className="best-label">лучшая серия</div>
                            </div>
                        </div>
                    )}
                </div>

                {streakDays >= 3 && (
                    <motion.div
                        className="streak-motivation"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {streakDays >= 7
                            ? '🔥 Невероятно! Продолжай в том же духе!'
                            : '🔥 Отличная серия! Не останавливайся!'
                        }
                    </motion.div>
                )}
            </div>

            {/* Календарь дней */}
            <div className="streak-calendar">
                {calendarDays.map((day, index) => (
                    <motion.div
                        key={day.dateString}
                        className={`calendar-day ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''} ${day.isFuture ? 'future' : ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: day.isToday ? 1.1 : 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Название дня недели */}
                        <div className="day-name">{day.dayName}</div>

                        {/* Основной контейнер дня */}
                        <div className={`day-circle ${day.isCompleted ? 'completed' : ''}`}>
                            {/* Огонек для выполненных дней */}
                            {day.isCompleted && (
                                <motion.div
                                    className="day-flame"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [-45, -40, -45]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Flame size={20} color="#ff6b35" fill="#ff6b35" />
                                </motion.div>
                            )}

                            {/* Число месяца */}
                            {!day.isCompleted && (
                                <div className="day-number">{day.dayNumber}</div>
                            )}
                        </div>

                        {/* Дополнительная информация для сегодняшнего дня */}
                        {day.isToday && (
                            <motion.div
                                className="today-label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Сегодня
                            </motion.div>
                        )}

                        {/* Показываем количество заданий для прошлых дней и сегодня */}
                        {(day.isPast || day.isToday) && day.tasksCompleted > 0 && (
                            <div className="tasks-count">
                                {day.tasksCompleted}/5
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Подсказка */}
            <div className="streak-hint">
                Выполни 5 заданий сегодня, чтобы продолжить серию!
            </div>
        </div>
    );
};

export default StreakCalendar;