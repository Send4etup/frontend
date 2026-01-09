// src/pages/ExamModePage/ExamModePageUI.jsx
/**
 * Презентационный компонент для режима подготовки к экзаменам
 * Не содержит бизнес-логику - только UI
 * Получает все данные и обработчики через props
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AlertCircle, TrendingUp, Clock, X, GraduationCap, Target, Mic, Loader } from 'lucide-react';
import './ExamModePage.css';
import TaskHistoryTab from "../../components/ExamMode/TaskHistoryTab.jsx";
import {useAuth} from "../../hooks/useAuth.js";
import QualityTab from "../../components/ExamMode/QualityTab.jsx";
import StreakCalendar from "../../components/ExamMode/StreakCalendar.jsx";

const ExamModePageUI = ({
                            // Данные
                            examType,
                            educationData,
                            activeTab,
                            showSettings,
                            isLoading,
                            isLoadingStats,
                            isLoadingProgress,
                            isSavingSettings,
                            error,
                            availableSubjects,
                            tempSettings,
                            stats,
                            todayProgress,
                            weekProgress,
                            progressCalendarData,
                            daysUntilExam,
                            todayTasks,

                            // Обработчики событий
                            onTabChange,
                            onOpenSettings,
                            onCloseSettings,
                            onToggleSubject,
                            onTargetScoreChange,
                            onResetSettings,
                            onSaveSettings,
                            onRetry,
                            onTaskClick,
                            onTalkClick,
                            onMotivationClick,
                            onStartTraining,
                            onTaskRetry,

                            // Вспомогательные функции
                            getMaxScore,
                            getDifficultyText,
                            getDifficultyColor
                        }) => {

    const { user } = useAuth();

    // Единственный useEffect - для блокировки скролла при открытом модальном окне
    useEffect(() => {
        if (showSettings) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showSettings]);

    /**
     * Вычисление процента прогресса недели
     * Эта функция чистая и не требует состояния
     */
    const getWeekProgressPercentage = () => {
        if (!weekProgress || weekProgress.length === 0) return 0;
        const completed = weekProgress.filter(d => d.tasks > 0).length;
        return (completed / weekProgress.length) * 100;
    };

    // =====================================================
    // LOADING СОСТОЯНИЕ
    // =====================================================

    if (isLoading) {
        return (
            <div className="school-page">
                <div className="exam-mode">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        gap: '20px'
                    }}>
                        <Loader size={40} className="spin" color="#43ff65" />
                        <p style={{color: '#fff', fontSize: '16px'}}>Загрузка данных...</p>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR СОСТОЯНИЕ
    // =====================================================

    if (error) {
        return (
            <div className="school-page">
                <div className="exam-mode">
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '12px',
                        border: '1px solid #ef4444'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                            <AlertCircle size={20} color="#ef4444" />
                            <h3 style={{color: '#ef4444', margin: 0}}>Ошибка</h3>
                        </div>
                        <p style={{color: '#fff', margin: '0 0 15px 0'}}>{error}</p>
                        <button
                            onClick={onRetry}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#43ff65',
                                color: '#0d0d0d',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================================
    // ОСНОВНОЙ РЕНДЕР
    // =====================================================

    return (
        <div className="school-page">
            <div className="exam-mode">
                {/* Заголовок режима */}
                <motion.div
                    className="exam-header"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    <div className="exam-title-row">
                        <h2 className="exam-title">Подготовка к {examType}</h2>
                        <button
                            className="exam-settings-btn"
                            onClick={onOpenSettings}
                        >
                            <Settings size={20}/>
                        </button>
                    </div>

                    {daysUntilExam !== null && daysUntilExam !== undefined && (
                        <p className="exam-subtitle">
                            До экзамена осталось <span className="days-highlight">{daysUntilExam} дней</span>
                        </p>
                    )}
                </motion.div>

                {/* Навигация по табам */}
                <div className="exam-tabs">
                    <button
                        className={`exam-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => onTabChange('overview')}
                    >
                        Обзор
                    </button>
                    <button
                        className={`exam-tab ${activeTab === 'practice' ? 'active' : ''}`}
                        onClick={() => onTabChange('practice')}
                    >
                        Практика
                    </button>
                    <button
                        className={`exam-tab ${activeTab === 'quality' ? 'active' : ''}`}
                        onClick={() => onTabChange('quality')}
                    >
                        Качество
                    </button>
                </div>

                {/* Контент Обзора */}
                {activeTab === 'overview' && (
                    <motion.div
                        className="overview-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                    >
                        {/* Статистика */}
                        <div className="stats-grid">
                            {isLoadingStats ? (
                                <div style={{textAlign: 'center', padding: '20px'}}>
                                    <Loader size={24} className="spin" color="#43ff65"/>
                                </div>
                            ) : (
                                <>
                                    <div className="stat-card">
                                        <div className="stat-icon">🎯</div>
                                        <div className="stat-value">{stats.points}</div>
                                        <div className="stat-label">Баллов набрано</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-value">{stats.tasksSolved}</div>
                                        <div className="stat-label">Заданий решено</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon">🔥</div>
                                        <div className="stat-value">{stats.streakDays}</div>
                                        <div className="stat-label">Дней подряд</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Задания на сегодня */}
                        <div className="section">
                            <div className="section-header">
                                <h3 className="section-title">Задания на сегодня</h3>
                                {todayProgress && (
                                    <span className="section-badge">
                                        {todayProgress.tasks_completed} из {todayProgress.target_tasks}
                                    </span>
                                )}
                            </div>

                            {todayTasks && todayTasks.length > 0 ? (
                                <div className="tasks-list">
                                    {todayTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            className="task-card"
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={() => onTaskClick && onTaskClick(task)}
                                        >
                                            <div className="task-header">
                                                <span className="task-subject">{task.subject}</span>
                                                <span
                                                    className={`task-difficulty ${task.difficulty}`}
                                                    style={{backgroundColor: getDifficultyColor(task.difficulty)}}
                                                >
                                                    {getDifficultyText(task.difficulty)}
                                                </span>
                                            </div>
                                            <h4 className="task-title">{task.title}</h4>
                                            <div className="task-footer">
                                                <span className="task-time">
                                                    <Clock size={14}/> {task.time}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Задания на сегодня пока не загружены</p>
                                    <button
                                        className="primary-btn"
                                        onClick={() => onTabChange('practice')}
                                    >
                                        Начать практику
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Прогресс недели */}
                        <div className="section">
                            <div className="section-header">
                                <h3 className="section-title">Твоя серия 🔥</h3>
                            </div>

                            {isLoadingProgress ? (
                                <div style={{textAlign: 'center', padding: '20px'}}>
                                    <Loader size={24} className="spin" color="#43ff65"/>
                                </div>
                            ) : (
                                <StreakCalendar
                                    progressData={progressCalendarData}
                                    streakDays={stats.streakDays}
                                    bestStreak={stats.bestStreak}
                                />
                            )}
                        </div>

                        {/* Быстрые действия */}
                        <div className="section">
                            <h3 className="section-title">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button
                                    className="quick-action-btn talk"
                                    onClick={onTalkClick}
                                >
                                    <Mic size={20}/>
                                    <span>Выговориться</span>
                                </button>

                                <button
                                    className="quick-action-btn motivate"
                                    onClick={onMotivationClick}
                                >
                                    <TrendingUp size={20}/>
                                    <span>Мотивация</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Контент Практики */}
                {activeTab === 'practice' && (
                    <motion.div
                        className="practice-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                    >
                        <div className="section">
                            <h3 className="section-title">Мои предметы</h3>
                            <p className="section-subtitle">
                                Выберите предмет для начала тренировки
                            </p>

                            {tempSettings?.subjects && tempSettings.subjects.length > 0 ? (
                                <div className="subjects-practice-grid">
                                    {tempSettings.subjects.map((subjectId) => {
                                        const subject = availableSubjects?.find(s => s.id === subjectId);
                                        if (!subject) return null;

                                        const targetScore = tempSettings.targetScores?.[subjectId];
                                        const maxScore = getMaxScore(subjectId);

                                        return (
                                            <motion.div
                                                key={subjectId}
                                                className="subject-practice-card"
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                whileHover={{scale: 1.02}}
                                                transition={{duration: 0.3}}
                                            >
                                                <div className="subject-practice-header">
                                                    <h4 className="subject-practice-name">{subject.name}</h4>
                                                    <span className="subject-practice-type">{examType}</span>
                                                </div>

                                                <div className="subject-practice-info">
                                                    <div className="subject-practice-stat">
                                                        <span className="stat-label">Целевой балл</span>
                                                        <span className="stat-value">
                                                            {targetScore || '—'} / {maxScore}
                                                        </span>
                                                    </div>

                                                    <div className="subject-practice-stat">
                                                        <span className="stat-label">Прогресс</span>
                                                        <div className="progress-bar-mini">
                                                            <div
                                                                className="progress-fill-mini"
                                                                style={{
                                                                    width: targetScore ? `${(targetScore / maxScore) * 100}%` : '0%'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    className="start-training-btn"
                                                    onClick={() => onStartTraining(subjectId)}
                                                >
                                                    🎯 Начать тренировку
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📚</div>
                                    <h4>Предметы не выбраны</h4>
                                    <p>Сначала выберите предметы для подготовки в настройках</p>
                                    <button
                                        className="primary-btn"
                                        onClick={onOpenSettings}
                                    >
                                        <Settings size={18}/>
                                        Открыть настройки
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Быстрый доступ к сложности */}
                        {tempSettings?.subjects && tempSettings.subjects.length > 0 && (
                            <div className="section">
                                <h3 className="section-title">Выбрать по сложности</h3>
                                <p className="section-subtitle">
                                    Тренируйтесь на заданиях определенного уровня
                                </p>

                                <div className="difficulty-selector-grid">
                                    <motion.button
                                        className="difficulty-selector-card easy"
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                    >
                                        <div className="difficulty-icon">💚</div>
                                        <h4>Легкие</h4>
                                        <p>Базовые задания для закрепления основ</p>
                                    </motion.button>

                                    <motion.button
                                        className="difficulty-selector-card medium"
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                    >
                                        <div className="difficulty-icon">💛</div>
                                        <h4>Средние</h4>
                                        <p>Задания повышенного уровня</p>
                                    </motion.button>

                                    <motion.button
                                        className="difficulty-selector-card hard"
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                    >
                                        <div className="difficulty-icon">❤️</div>
                                        <h4>Сложные</h4>
                                        <p>Задания для высокого балла</p>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        <div className="section">
                            <h3 className="section-title">
                                📝 История заданий
                            </h3>
                            <TaskHistoryTab
                                userId={user.db.user_id}
                                examType={examType}
                                onTaskRetry={onTaskRetry}
                            />
                        </div>

                        {/* Рекомендации */}
                        {tempSettings?.subjects && tempSettings.subjects.length > 0 && (
                            <div className="section">
                                <div className="tips-card">
                                    <h4 className="tips-title">💡 Советы для эффективной подготовки</h4>
                                    <ul className="tips-list">
                                        <li>Решайте минимум 5 заданий ежедневно</li>
                                        <li>Начинайте с легких заданий для разминки</li>
                                        <li>Внимательно читайте объяснения к ошибкам</li>
                                        <li>Повторяйте сложные темы регулярно</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Контент Качества */}
                {activeTab === 'quality' && (
                    <QualityTab
                        userId={user.db.user_id}
                        examType={examType}
                    />
                )}

                {/* Модальное окно настроек */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="exam-settings-modal"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={onCloseSettings}
                        >
                            <motion.div
                                className="exam-settings-content"
                                initial={{y: '100%'}}
                                animate={{y: 0}}
                                exit={{y: '100%'}}
                                transition={{type: 'spring', damping: 25}}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Заголовок */}
                                <div className="settings-header exam-settings-header">
                                    <h2 className="settings-title">
                                        <Settings size={20}/> Настройки
                                    </h2>
                                    <button
                                        className="settings-close-btn"
                                        onClick={onCloseSettings}
                                    >
                                        <X size={18} color="#fff"/>
                                    </button>
                                </div>

                                <div className="space" />

                                {/* Информация о типе экзамена */}
                                <div className="settings-section">
                                    <div className="settings-section-title">
                                        <GraduationCap size={16} color="#43ff65"/>
                                        Тип экзамена
                                    </div>
                                    <div style={{
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(67, 255, 101, 0.1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(67, 255, 101, 0.2)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                color: '#43ff65'
                                            }}>
                                                {examType}
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#888',
                                                backgroundColor: '#2a2a2a',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {educationData && educationData.grade ? `${educationData.grade} класс` : 'Класс не указан'}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#888',
                                            margin: 0,
                                            lineHeight: '1.4'
                                        }}>
                                            Тип экзамена определяется автоматически на основе вашего класса.
                                            {educationData && educationData.grade >= 7 && educationData.grade <= 9 && ' ОГЭ для 7-9 классов.'}
                                            {educationData && educationData.grade >= 10 && educationData.grade <= 11 && ' ЕГЭ для 10-11 классов.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Предметы для сдачи */}
                                <div className="settings-section">
                                    <div className="settings-section-title">
                                        <span style={{fontSize: '16px'}}>🎓</span> Предметы для {examType}
                                    </div>
                                    <p className="settings-section-subtitle">
                                        Выберите предметы, которые планируете сдавать на {examType}
                                    </p>

                                    {availableSubjects && availableSubjects.length > 0 ? (
                                        <div className="subjects-grid">
                                            {availableSubjects.map((subject) => (
                                                <div
                                                    key={subject.id}
                                                    className={`subject-checkbox ${tempSettings.subjects.includes(subject.id) ? 'checked' : ''}`}
                                                    onClick={() => onToggleSubject(subject.id)}
                                                >
                                                    <div className="checkbox-box">
                                                        {tempSettings.subjects.includes(subject.id) && '✓'}
                                                    </div>
                                                    <span className="subject-name">{subject.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            color: '#888',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '8px'
                                        }}>
                                            <Loader size={20} className="spin" style={{marginBottom: '8px'}} />
                                            <p style={{margin: 0, fontSize: '14px'}}>Загрузка предметов для {examType}...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Целевые баллы */}
                                {tempSettings.subjects && tempSettings.subjects.length > 0 && (
                                    <div className="settings-section">
                                        <div className="settings-section-title">
                                            <Target size={16} color="#43ff65"/>
                                            Целевые баллы по {examType}
                                        </div>
                                        <p className="settings-section-subtitle">
                                            Сколько баллов хотите набрать по каждому предмету
                                        </p>

                                        <div className="target-scores">
                                            {tempSettings.subjects.map((subjectId) => {
                                                // Проверяем, что предмет доступен для текущего типа экзамена
                                                const subject = availableSubjects.find(s => s.id === subjectId);

                                                // Если предмет не найден, пропускаем
                                                if (!subject) {
                                                    return null;
                                                }

                                                const maxScore = getMaxScore(subjectId);

                                                return (
                                                    <div key={subjectId} className="target-score-row">
                                                        <label className="target-score-label">
                                                            {subject.name}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="target-score-input"
                                                            placeholder={`до ${maxScore}`}
                                                            value={tempSettings.targetScores[subjectId] || ''}
                                                            max={maxScore}
                                                            min={1}
                                                            onChange={(e) => onTargetScoreChange(subjectId, e.target.value)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Кнопки действий */}
                                <div className="settings-section">
                                    <div className="settings-actions">
                                        <button
                                            className="reset-settings-btn"
                                            onClick={onResetSettings}
                                            disabled={isSavingSettings}
                                        >
                                            Сбросить
                                        </button>

                                        <button
                                            className="save-settings-btn"
                                            onClick={onSaveSettings}
                                            disabled={isSavingSettings || (tempSettings.subjects && tempSettings.subjects.length === 0)}
                                        >
                                            {isSavingSettings ? (
                                                <>
                                                    <Loader size={16} className="spin" />
                                                    Сохранение...
                                                </>
                                            ) : (
                                                'Сохранить'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExamModePageUI;