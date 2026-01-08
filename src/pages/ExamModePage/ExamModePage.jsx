// ExamModePage.jsx - Компонент режима подготовки к ОГЭ/ЕГЭ с интеграцией API

import React, {useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AlertCircle, TrendingUp, Clock, X, GraduationCap, Target, Mic, Loader } from 'lucide-react';
import './ExamModePage.css';
import {useNavigate} from "react-router-dom";

// Импорт API функций
import {
    createExamSettings,
    getExamSettings,
    updateExamSettings,
    deleteExamSettings,
    addSubjects,
    updateSubject,
    getAvailableSubjects,
    getRandomTask,
    getUserStats,
    getTodayProgress,
    getProgressCalendar,
    getDaysUntilExam,
    getMaxScore,
    getDifficultyText,
    getDifficultyColor
} from '../../services/examAPI';

/**
 * Компонент режима подготовки к экзаменам (ОГЭ/ЕГЭ)
 * @param {Object} props - Свойства компонента
 * @param {string} props.examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {Object} props.user - Данные пользователя
 * @param {Function} props.onVoiceMode - Callback для открытия голосового режима
 */
const ExamModePage = ({ examType: initialExamType = 'ОГЭ', user, onVoiceMode }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    // Loading и ошибки
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [error, setError] = useState(null);

    // Данные из API
    const [examSettings, setExamSettings] = useState(null);
    const [currentSettingsId, setCurrentSettingsId] = useState(null);
    const [stats, setStats] = useState({
        points: 0,
        tasksSolved: 0,
        streakDays: 0
    });
    const [todayProgress, setTodayProgress] = useState(null);
    const [weekProgress, setWeekProgress] = useState([]);
    const [daysUntilExam, setDaysUntilExam] = useState(null);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Временные настройки (до сохранения)
    const [tempSettings, setTempSettings] = useState({
        examType: initialExamType,
        subjects: [],
        targetScores: {},
        examDate: null
    });

    // Моковые данные заданий (пока не реализована интеграция)
    const [todayTasks, setTodayTasks] = useState([]);

    // =====================================================
    // ИНИЦИАЛИЗАЦИЯ - Загрузка данных при монтировании
    // =====================================================

    useEffect(() => {
        if (user?.user_id) {
            loadInitialData();
        }
    }, [user]);

    /**
     * Загрузка всех начальных данных
     */
    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Параллельная загрузка данных
            await Promise.all([
                loadExamSettings(),
                loadAvailableSubjects(),
                loadUserStats(),
                loadProgressData()
            ]);
        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Загрузка настроек экзамена пользователя
     */
    const loadExamSettings = async () => {
        try {
            const result = await getExamSettings(user.user_id, initialExamType);

            if (result.success && result.data && result.data.length > 0) {
                // Берем первые настройки для данного типа экзамена
                const settings = result.data[0];
                setCurrentSettingsId(settings.id);

                // Преобразуем в формат для компонента
                const subjects = settings.subjects.map(s => s.subject_id);
                const targetScores = {};
                settings.subjects.forEach(s => {
                    targetScores[s.subject_id] = s.target_score || '';
                });

                setExamSettings(settings);
                setTempSettings({
                    examType: settings.exam_type,
                    subjects: subjects,
                    targetScores: targetScores,
                    examDate: settings.exam_date
                });

                // Вычисляем дни до экзамена
                if (settings.exam_date) {
                    const days = getDaysUntilExam(settings.exam_date);
                    setDaysUntilExam(days);
                }
            } else {
                // Настройки не найдены - используем дефолтные
                setTempSettings({
                    examType: initialExamType,
                    subjects: [],
                    targetScores: {},
                    examDate: null
                });
            }
        } catch (err) {
            console.error('Error loading exam settings:', err);
        }
    };

    /**
     * Загрузка списка доступных предметов
     */
    const loadAvailableSubjects = async () => {
        try {
            const result = await getAvailableSubjects();

            if (result.success) {
                // Преобразуем в формат для UI
                const subjects = (tempSettings.examType === 'ОГЭ'
                        ? result.data.oge_subjects
                        : result.data.ege_subjects
                ).map(id => ({
                    id: id,
                    name: formatSubjectName(id)
                }));

                setAvailableSubjects(subjects);
            }
        } catch (err) {
            console.error('Error loading available subjects:', err);
        }
    };

    /**
     * Загрузка статистики пользователя
     */
    const loadUserStats = async () => {
        setIsLoadingStats(true);
        try {
            const result = await getUserStats(user.user_id);

            if (result.success) {
                setStats({
                    points: result.data.total_points || 0,
                    tasksSolved: result.data.tasks_solved || 0,
                    streakDays: result.data.streak_days || 0
                });
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setIsLoadingStats(false);
        }
    };

    /**
     * Загрузка данных прогресса
     */
    const loadProgressData = async () => {
        setIsLoadingProgress(true);
        try {
            // Загружаем прогресс за сегодня
            const todayResult = await getTodayProgress(user.user_id);
            if (todayResult.success) {
                setTodayProgress(todayResult.data);
            }

            // Загружаем календарь прогресса за неделю
            const calendarResult = await getProgressCalendar(user.user_id, 7);
            if (calendarResult.success) {
                // Преобразуем в формат для UI
                const weekData = calendarResult.data.days.map((day, index) => {
                    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
                    const date = new Date(day.date);
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();

                    return {
                        day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
                        number: date.getDate(),
                        completed: day.is_completed,
                        isToday: isToday,
                        tasks_completed: day.tasks_completed
                    };
                });

                setWeekProgress(weekData);
            }
        } catch (err) {
            console.error('Error loading progress:', err);
        } finally {
            setIsLoadingProgress(false);
        }
    };

    // =====================================================
    // ОБРАБОТЧИКИ НАСТРОЕК
    // =====================================================

    /**
     * Переключение выбора предмета
     */
    const toggleSubject = (subjectId) => {
        setTempSettings(prev => {
            const isSelected = prev.subjects.includes(subjectId);

            if (isSelected) {
                // Убираем предмет
                const newSubjects = prev.subjects.filter(s => s !== subjectId);
                const newTargetScores = { ...prev.targetScores };
                delete newTargetScores[subjectId];

                return {
                    ...prev,
                    subjects: newSubjects,
                    targetScores: newTargetScores
                };
            } else {
                // Добавляем предмет
                return {
                    ...prev,
                    subjects: [...prev.subjects, subjectId],
                    targetScores: {
                        ...prev.targetScores,
                        [subjectId]: ''
                    }
                };
            }
        });
    };

    /**
     * Изменение целевого балла
     */
    const handleTargetScoreChange = (subjectId, value) => {
        const numericValue = value.replace(/[^0-9]/g, '');

        if (numericValue === '') {
            setTempSettings(prev => ({
                ...prev,
                targetScores: {
                    ...prev.targetScores,
                    [subjectId]: ''
                }
            }));
            return;
        }

        const numberValue = parseInt(numericValue, 10);
        const maxScore = getMaxScore(subjectId, tempSettings.examType);

        if (numberValue >= 1 && numberValue <= maxScore) {
            setTempSettings(prev => ({
                ...prev,
                targetScores: {
                    ...prev.targetScores,
                    [subjectId]: numericValue
                }
            }));
        } else if (numberValue > maxScore) {
            setTempSettings(prev => ({
                ...prev,
                targetScores: {
                    ...prev.targetScores,
                    [subjectId]: maxScore.toString()
                }
            }));
        }
    };

    /**
     * Изменение типа экзамена
     */
    const handleExamTypeChange = (type) => {
        setTempSettings(prev => ({
            ...prev,
            examType: type
        }));

        // Перезагружаем доступные предметы
        loadAvailableSubjects();
    };

    /**
     * Сброс настроек
     */
    const handleResetSettings = () => {
        setTempSettings({
            examType: initialExamType,
            subjects: [],
            targetScores: {},
            examDate: null
        });
        console.log('⚙️ Настройки сброшены');
    };

    /**
     * Сохранение настроек
     */
    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        setError(null);

        try {
            // Проверка: выбран хотя бы один предмет
            if (tempSettings.subjects.length === 0) {
                alert('Выберите хотя бы один предмет для сдачи');
                setIsSavingSettings(false);
                return;
            }

            // Формируем массив предметов для API
            const subjects = tempSettings.subjects.map(subjectId => ({
                subject_id: subjectId,
                target_score: tempSettings.targetScores[subjectId]
                    ? parseInt(tempSettings.targetScores[subjectId])
                    : null
            }));

            if (currentSettingsId) {
                // Обновляем существующие настройки
                // Если изменилась дата экзамена
                if (tempSettings.examDate !== examSettings?.exam_date) {
                    await updateExamSettings(
                        currentSettingsId,
                        tempSettings.examDate,
                        user.user_id
                    );
                }

                // Добавляем новые предметы (если есть)
                const newSubjects = subjects.filter(s =>
                    !examSettings.subjects.some(es => es.subject_id === s.subject_id)
                );

                if (newSubjects.length > 0) {
                    await addSubjects(currentSettingsId, newSubjects, user.user_id);
                }

                // Обновляем целевые баллы существующих предметов
                for (const subject of subjects) {
                    const existingSubject = examSettings.subjects.find(
                        s => s.subject_id === subject.subject_id
                    );

                    if (existingSubject && existingSubject.target_score !== subject.target_score) {
                        await updateSubject(
                            existingSubject.id,
                            { target_score: subject.target_score },
                            user.user_id
                        );
                    }
                }
            } else {
                // Создаем новые настройки
                const result = await createExamSettings(
                    tempSettings.examType,
                    subjects,
                    tempSettings.examDate,
                    user.user_id
                );

                if (result.success) {
                    setCurrentSettingsId(result.data.id);
                    console.log('✅ Настройки созданы:', result.data);
                }
            }

            // Перезагружаем настройки
            await loadExamSettings();

            // Закрываем модальное окно
            setShowSettings(false);

            console.log('✅ Настройки сохранены успешно');
        } catch (err) {
            console.error('❌ Error saving settings:', err);
            setError('Не удалось сохранить настройки. Попробуйте еще раз.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    // =====================================================
    // ОБРАБОТЧИКИ ДЕЙСТВИЙ
    // =====================================================

    /**
     * Обработчик клика по заданию
     */
    const handleTaskClick = async (task) => {
        console.log('Task clicked:', task);
        // TODO: Открыть страницу с заданием
        // navigate(`/exam/task/${task.id}`);
    };

    /**
     * Обработчик клика по кнопке "Выговориться"
     */
    const handleTalkClick = () => {
        navigate("/voice-mode");
    };

    /**
     * Обработчик клика по кнопке "Мотивация"
     */
    const handleMotivationClick = () => {
        console.log('Motivation clicked');
        // TODO: Открыть мотивационный контент
    };

    // =====================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =====================================================

    /**
     * Форматирование названия предмета для отображения
     */
    const formatSubjectName = (subjectId) => {
        const names = {
            'математика': 'Математика',
            'математика (базовая)': 'Математика (базовая)',
            'математика (профильная)': 'Математика (профильная)',
            'русский язык': 'Русский язык',
            'информатика': 'Информатика',
            'физика': 'Физика',
            'история': 'История',
            'обществознание': 'Обществознание',
            'биология': 'Биология',
            'химия': 'Химия',
            'литература': 'Литература',
            'география': 'География',
            'английский язык': 'Английский язык',
            'немецкий язык': 'Немецкий язык'
        };
        return names[subjectId] || subjectId;
    };

    /**
     * Вычисление процента прогресса недели
     */
    const getWeekProgressPercentage = () => {
        if (weekProgress.length === 0) return 0;
        const completed = weekProgress.filter(d => d.completed).length;
        return (completed / weekProgress.length) * 100;
    };

    // =====================================================
    // ЭФФЕКТЫ
    // =====================================================

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

    // =====================================================
    // RENDERING
    // =====================================================

    // Показываем loader при загрузке
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

    // Показываем ошибку если есть
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
                            onClick={loadInitialData}
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
                        <h2 className="exam-title">Режим {tempSettings.examType}</h2>
                        <button
                            className="exam-settings-btn"
                            onClick={() => setShowSettings(true)}
                        >
                            <Settings size={20}/>
                        </button>
                    </div>

                    {daysUntilExam !== null && (
                        <p className="exam-subtitle">
                            До экзамена осталось <span className="days-highlight">{daysUntilExam} дней</span>
                        </p>
                    )}
                </motion.div>

                {/* Навигация по табам */}
                <div className="exam-tabs">
                    <button
                        className={`exam-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Обзор
                    </button>
                    <button
                        className={`exam-tab ${activeTab === 'practice' ? 'active' : ''}`}
                        onClick={() => setActiveTab('practice')}
                    >
                        Практика
                    </button>
                    <button
                        className={`exam-tab ${activeTab === 'quality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quality')}
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
                                    <Loader size={24} className="spin" color="#43ff65" />
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

                            {todayTasks.length > 0 ? (
                                <div className="tasks-list">
                                    {todayTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            className="task-card"
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={() => handleTaskClick(task)}
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
                                        onClick={() => setActiveTab('practice')}
                                    >
                                        Начать практику
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Прогресс недели */}
                        <div className="section">
                            <div className="section-header">
                                <h3 className="section-title">Прогресс недели</h3>
                                <span className="section-badge">
                                    {Math.round(getWeekProgressPercentage())}%
                                </span>
                            </div>

                            {isLoadingProgress ? (
                                <div style={{textAlign: 'center', padding: '20px'}}>
                                    <Loader size={24} className="spin" color="#43ff65" />
                                </div>
                            ) : weekProgress.length > 0 ? (
                                <div className="week-calendar">
                                    {weekProgress.map((day, index) => (
                                        <div
                                            key={index}
                                            className={`calendar-day ${day.completed ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
                                        >
                                            <div className="day-name">{day.day}</div>
                                            <div className="day-number">{day.number}</div>
                                            {day.completed && (
                                                <div className="day-checkmark">✓</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{color: '#999', textAlign: 'center'}}>
                                    Начните решать задания, чтобы отслеживать прогресс
                                </p>
                            )}
                        </div>

                        {/* Быстрые действия */}
                        <div className="section">
                            <h3 className="section-title">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button
                                    className="quick-action-btn talk"
                                    onClick={handleTalkClick}
                                >
                                    <Mic size={20}/>
                                    <span>Выговориться</span>
                                </button>

                                <button
                                    className="quick-action-btn motivate"
                                    onClick={handleMotivationClick}
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
                        <div className="empty-state">
                            <h3>Раздел "Практика" в разработке</h3>
                            <p>Здесь будут отображаться задания для тренировки</p>
                        </div>
                    </motion.div>
                )}

                {/* Контент Качества */}
                {activeTab === 'quality' && (
                    <motion.div
                        className="quality-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                    >
                        <div className="section">
                            <h3 className="section-title">Точность по сложности</h3>

                            <div className="quality-metrics">
                                <div className="quality-metric">
                                    <div className="quality-metric-header">
                                        <span className="quality-metric-name">Легкие задания</span>
                                        <span className="quality-metric-percent">85%</span>
                                    </div>
                                    <div className="quality-bar-bg">
                                        <motion.div
                                            className="quality-bar-fill success"
                                            initial={{width: 0}}
                                            animate={{width: '85%'}}
                                            transition={{duration: 0.8}}
                                        />
                                    </div>
                                    <span className="quality-metric-detail">17 из 20 правильно</span>
                                </div>

                                <div className="quality-metric">
                                    <div className="quality-metric-header">
                                        <span className="quality-metric-name">Средние задания</span>
                                        <span className="quality-metric-percent">68%</span>
                                    </div>
                                    <div className="quality-bar-bg">
                                        <motion.div
                                            className="quality-bar-fill warning"
                                            initial={{width: 0}}
                                            animate={{width: '68%'}}
                                            transition={{duration: 0.8, delay: 0.2}}
                                        />
                                    </div>
                                    <span className="quality-metric-detail">34 из 50 правильно</span>
                                </div>

                                <div className="quality-metric">
                                    <div className="quality-metric-header">
                                        <span className="quality-metric-name">Сложные задания</span>
                                        <span className="quality-metric-percent">45%</span>
                                    </div>
                                    <div className="quality-bar-bg">
                                        <motion.div
                                            className="quality-bar-fill error"
                                            initial={{width: 0}}
                                            animate={{width: '45%'}}
                                            transition={{duration: 0.8, delay: 0.4}}
                                        />
                                    </div>
                                    <span className="quality-metric-detail">9 из 20 правильно</span>
                                </div>
                            </div>

                            <div className="quality-recommendation">
                                <h4 className="recommendation-title">💡 Рекомендация</h4>
                                <p className="recommendation-text">
                                    Больше времени уделяйте сложным заданиям. Практика повысит вашу точность!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Модальное окно настроек */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="exam-settings-modal"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setShowSettings(false)}
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
                                        onClick={() => setShowSettings(false)}
                                    >
                                        <X size={18} color="#fff"/>
                                    </button>
                                </div>

                                <div className="space" />

                                {/* Выбор типа экзамена */}
                                <div className="settings-section">
                                    <div className="settings-section-title">
                                        <GraduationCap size={16} color="#43ff65"/>
                                        Тип экзамена
                                    </div>
                                    <div className="exam-type-options">
                                        <button
                                            className={`exam-type-btn ${tempSettings.examType === 'ОГЭ' ? 'active' : ''}`}
                                            onClick={() => handleExamTypeChange('ОГЭ')}
                                        >
                                            ОГЭ
                                        </button>
                                        <button
                                            className={`exam-type-btn ${tempSettings.examType === 'ЕГЭ' ? 'active' : ''}`}
                                            onClick={() => handleExamTypeChange('ЕГЭ')}
                                        >
                                            ЕГЭ
                                        </button>
                                    </div>
                                </div>

                                {/* Предметы для сдачи */}
                                <div className="settings-section">
                                    <div className="settings-section-title">
                                        <span style={{fontSize: '16px'}}>🎓</span> Предметы для сдачи
                                    </div>
                                    <p className="settings-section-subtitle">
                                        Выберите предметы, которые планируете сдавать
                                    </p>

                                    <div className="subjects-grid">
                                        {availableSubjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                className={`subject-checkbox ${tempSettings.subjects.includes(subject.id) ? 'checked' : ''}`}
                                                onClick={() => toggleSubject(subject.id)}
                                            >
                                                <div className="checkbox-box">
                                                    {tempSettings.subjects.includes(subject.id) && '✓'}
                                                </div>
                                                <span className="subject-name">{subject.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Целевые баллы */}
                                {tempSettings.subjects.length > 0 && (
                                    <div className="settings-section">
                                        <div className="settings-section-title">
                                            <Target size={16} color="#43ff65"/>
                                            Выберите цель по баллам
                                        </div>
                                        <p className="settings-section-subtitle">
                                            Сколько баллов хотите набрать по каждому предмету
                                        </p>

                                        <div className="target-scores">
                                            {tempSettings.subjects.map((subjectId) => {
                                                const subject = availableSubjects.find(s => s.id === subjectId);
                                                const maxScore = getMaxScore(subjectId, tempSettings.examType);

                                                return (
                                                    <div key={subjectId} className="target-score-row">
                                                        <label className="target-score-label">
                                                            {subject?.name}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="target-score-input"
                                                            placeholder={`до ${maxScore}`}
                                                            value={tempSettings.targetScores[subjectId] || ''}
                                                            max={maxScore}
                                                            min={1}
                                                            onChange={(e) => handleTargetScoreChange(subjectId, e.target.value)}
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
                                            onClick={handleResetSettings}
                                            disabled={isSavingSettings}
                                        >
                                            Сбросить
                                        </button>

                                        <button
                                            className="save-settings-btn"
                                            onClick={handleSaveSettings}
                                            disabled={isSavingSettings || tempSettings.subjects.length === 0}
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

export default ExamModePage;