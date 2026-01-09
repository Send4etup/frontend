// src/pages/ExamModePage/useExamLogic.js
/**
 * Хук с бизнес-логикой для режима подготовки к экзаменам
 * Используется как в OgeExamModePage, так и в EgeExamModePage
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../services/userApi';

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
import {getSubjectId} from "../../config/subjectMapping.js";
import {getTaskForRetry} from "../../services/qualityHistoryAPI.js";

/**
 * Форматирование имени предмета для отображения
 */
const formatSubjectName = (subjectId) => {
    const subjectNames = {
        'russian': 'Русский язык',
        'mathematics': 'Математика',
        'mathematics_base': 'Математика (база)',
        'mathematics_profile': 'Математика (профиль)',
        'physics': 'Физика',
        'chemistry': 'Химия',
        'biology': 'Биология',
        'informatics': 'Информатика',
        'history': 'История',
        'social_studies': 'Обществознание',
        'geography': 'География',
        'literature': 'Литература',
        'english': 'Английский язык',
        'foreign_language': 'Иностранный язык'
    };
    return subjectNames[subjectId] || subjectId;
};

/**
 * Основной хук с логикой экзамена
 * @param {Object} params - Параметры
 * @param {string} params.examType - Тип экзамена ('ОГЭ' или 'ЕГЭ')
 * @param {Object} params.user - Данные пользователя
 * @param {Object} params.config - Конфигурация экзамена (OGE_CONFIG или EGE_CONFIG)
 */
export const useExamLogic = ({ examType, user, config }) => {
    const { token, isAuthenticated } = useAuth();
    const { loadEducation } = useUserProfile(token);
    const navigate = useNavigate();

    // ============================================
    // СОСТОЯНИЯ
    // ============================================

    // Данные об образовании
    const [educationData, setEducationData] = useState({
        user_type: null,
        grade: null
    });

    // UI состояния
    const [activeTab, setActiveTab] = useState('overview');
    const [showSettings, setShowSettings] = useState(false);

    // Loading состояния
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [error, setError] = useState(null);

    // Данные экзамена
    const [examSettings, setExamSettings] = useState(null);
    const [currentSettingsId, setCurrentSettingsId] = useState(null);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Временные настройки (до сохранения)
    const [tempSettings, setTempSettings] = useState({
        examType: examType,
        subjects: [],
        targetScores: {},
        examDate: null
    });

    // Статистика и прогресс
    const [stats, setStats] = useState({
        points: 0,
        tasksSolved: 0,
        streakDays: 0,
        bestStreak: 0
    });
    const [todayProgress, setTodayProgress] = useState(null);
    const [weekProgress, setWeekProgress] = useState([]);
    const [progressCalendarData, setProgressCalendarData] = useState([]);
    const [daysUntilExam, setDaysUntilExam] = useState(null);

    // Задания
    const [todayTasks, setTodayTasks] = useState([]);

    // ============================================
    // ЭФФЕКТЫ - ИНИЦИАЛИЗАЦИЯ
    // ============================================

    /**
     * Загрузка начальных данных при монтировании
     */
    useEffect(() => {
        if (user?.user_id) {
            loadInitialData();
        }
    }, [user]);

    /**
     * Загрузка образовательных данных
     */
    useEffect(() => {
        const loadEducationData = async () => {
            if (!isAuthenticated || !token) {
                console.warn('⚠️ ExamMode: No auth or token');
                return;
            }

            try {
                console.log(`📥 ${examType}: Loading education data...`);
                const data = await loadEducation();

                if (data && data.grade) {
                    setEducationData({
                        user_type: data.user_type,
                        grade: data.grade
                    });
                }
            } catch (error) {
                console.error(`❌ ${examType}: Error loading education data:`, error);
            }
        };

        if (isAuthenticated && token) {
            loadEducationData();
        }
    }, [isAuthenticated, token, loadEducation, examType]);

    /**
     * Очистка несовместимых предметов при изменении доступных предметов
     */
    useEffect(() => {
        if (availableSubjects.length > 0) {
            const availableSubjectIds = availableSubjects.map(s => s.id);

            const validSubjects = tempSettings.subjects.filter(subjectId =>
                availableSubjectIds.includes(subjectId)
            );

            if (validSubjects.length !== tempSettings.subjects.length) {
                console.log(`🔄 ${examType}: Removing incompatible subjects`);
                console.log(`Before: ${tempSettings.subjects.length}, After: ${validSubjects.length}`);

                const validTargetScores = {};
                validSubjects.forEach(subjectId => {
                    if (tempSettings.targetScores[subjectId]) {
                        validTargetScores[subjectId] = tempSettings.targetScores[subjectId];
                    }
                });

                setTempSettings(prev => ({
                    ...prev,
                    subjects: validSubjects,
                    targetScores: validTargetScores
                }));
            }
        }
    }, [availableSubjects, examType]);

    // ============================================
    // ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ
    // ============================================

    /**
     * Загрузка всех начальных данных
     */
    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await Promise.all([
                loadExamSettings(),
                loadAvailableSubjects(),
                loadUserStats(),
                loadProgressData()
            ]);

        } catch (err) {
            console.error(`❌ ${examType}: Error loading initial data:`, err);
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
            const result = await getExamSettings(user.user_id, examType);

            if (result.success && result.data && result.data.length > 0) {
                const settings = result.data[0];
                setCurrentSettingsId(settings.id);

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

                if (settings.exam_date) {
                    const days = getDaysUntilExam(settings.exam_date);
                    setDaysUntilExam(days);
                }
            } else {
                setTempSettings({
                    examType: examType,
                    subjects: [],
                    targetScores: {},
                    examDate: null
                });
            }
        } catch (err) {
            console.error(`❌ ${examType}: Error loading exam settings:`, err);
        }
    };

    /**
     * Загрузка списка доступных предметов
     */
    const loadAvailableSubjects = async () => {
        try {
            console.log(`📚 ${examType}: Loading subjects...`);
            const result = await getAvailableSubjects();

            if (result.success) {
                const subjects = (examType === 'ОГЭ'
                        ? result.data.oge_subjects
                        : result.data.ege_subjects
                ).map(id => ({
                    id: id,
                    name: formatSubjectName(id)
                }));

                console.log(`✅ ${examType}: Loaded ${subjects.length} subjects`);
                setAvailableSubjects(subjects);
            }
        } catch (err) {
            console.error(`❌ ${examType}: Error loading subjects:`, err);
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
                    streakDays: result.data.streak_days || 0,
                    bestStreak: result.data.best_streak || 0
                });
            }
        } catch (err) {
            console.error(`❌ ${examType}: Error loading stats:`, err);
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
            // Сегодняшний прогресс
            const todayResult = await getTodayProgress(user.user_id);
            if (todayResult.success) {
                setTodayProgress(todayResult.data);
            }

            const calendarResult = await getProgressCalendar(user.user_id, 7);

            if (calendarResult.success && calendarResult.data?.days) {
                setProgressCalendarData(calendarResult.data.days);

                const weekData = calendarResult.data.days.map((day) => {
                    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    const date = new Date(day.date);
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();

                    return {
                        day: dayNames[date.getDay()],
                        tasks: day.tasks_completed || 0,
                        isToday: isToday
                    };
                });

                setWeekProgress(weekData);
            }
        } catch (err) {
            console.error(`❌ ${examType}: Error loading progress:`, err);
        } finally {
            setIsLoadingProgress(false);
        }
    };

    // ============================================
    // ОБРАБОТЧИКИ ДЕЙСТВИЙ
    // ============================================

    /**
     * Переключение активной вкладки
     */
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    /**
     * Открытие модального окна настроек
     */
    const handleOpenSettings = () => {
        setShowSettings(true);
    };

    /**
     * Закрытие модального окна настроек
     */
    const handleCloseSettings = () => {
        setShowSettings(false);
    };

    /**
     * Переключение выбора предмета
     */
    const handleToggleSubject = (subjectId) => {
        setTempSettings(prev => {
            const isSelected = prev.subjects.includes(subjectId);

            if (isSelected) {
                // Убираем предмет и его целевой балл
                const newTargetScores = { ...prev.targetScores };
                delete newTargetScores[subjectId];

                return {
                    ...prev,
                    subjects: prev.subjects.filter(id => id !== subjectId),
                    targetScores: newTargetScores
                };
            } else {
                // Добавляем предмет
                return {
                    ...prev,
                    subjects: [...prev.subjects, subjectId]
                };
            }
        });
    };

    /**
     * Изменение целевого балла
     */
    const handleTargetScoreChange = (subjectId, value) => {
        const maxScore = getMaxScore(subjectId, examType);
        const numValue = parseInt(value) || 0;

        if (numValue <= maxScore) {
            setTempSettings(prev => ({
                ...prev,
                targetScores: {
                    ...prev.targetScores,
                    [subjectId]: value
                }
            }));
        }
    };

    /**
     * Сброс настроек
     */
    const handleResetSettings = () => {
        setTempSettings({
            examType: examType,
            subjects: [],
            targetScores: {},
            examDate: null
        });
    };

    /**
     * Сохранение настроек
     */
    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        setError(null);

        try {
            // Формируем данные для сохранения
            const subjectsData = tempSettings.subjects.map(subjectId => ({
                subject_id: subjectId,
                target_score: parseInt(tempSettings.targetScores[subjectId]) || null
            }));

            console.log(subjectsData);

            if (currentSettingsId) {
                const result = await updateExamSettings(
                    currentSettingsId,
                    tempSettings.examDate,
                    subjectsData,
                    user.user_id
                );

                if (result.success) {
                    console.log(`✅ ${examType}: Settings updated successfully`);
                    setExamSettings(result.data);
                    setShowSettings(false);

                    // Обновляем информацию о днях до экзамена
                    if (tempSettings.examDate) {
                        const days = getDaysUntilExam(tempSettings.examDate);
                        setDaysUntilExam(days);
                    }
                } else {
                    throw new Error(result.error || 'Не удалось обновить настройки');
                }
            } else {
                // Создаем новые настройки
                const result = await createExamSettings(
                    examType,
                    subjectsData,
                    tempSettings.examDate,
                    user.user_id
                );

                if (result.success) {
                    console.log(`✅ ${examType}: Settings created`);
                    setCurrentSettingsId(result.data.id);
                    setExamSettings(result.data);
                    setShowSettings(false);
                }
            }

            // Перезагружаем данные
            await loadInitialData();
        } catch (err) {
            console.error(`❌ ${examType}: Error saving settings:`, err);
            setError('Не удалось сохранить настройки. Попробуйте ещё раз.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleStartTraining = (subjectId) => {
        console.log('Starting training:', subjectId);

        navigate(`/exam/practice/${getSubjectId(subjectId)}/${examType}`);
        // Пример: /exam/practice/mathematics/ОГЭ
    };

    /**
     * Обработчик повторного решения задания
     */
    const handleTaskRetry = async (taskId) => {
        try {
            // Получаем задание для повторного решения
            const response = await getTaskForRetry(taskId, user.user_id);

            if (!response.success) {
                throw new Error(response.error || 'Не удалось загрузить задание');
            }

            // Перенаправляем на страницу решения задания
            navigate(`/exam/task/${taskId}`, {
                state: {
                    task: response.data,
                    retry: true
                }
            });
        } catch (error) {
            console.error('Ошибка при получении задания:', error);
            setError('Не удалось загрузить задание');
        }
    };

    // ============================================
    // ВОЗВРАЩАЕМОЕ ЗНАЧЕНИЕ
    // ============================================

    return {
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
        examSettings,
        availableSubjects,
        tempSettings,
        stats,
        todayProgress,
        weekProgress,
        progressCalendarData,
        daysUntilExam,
        todayTasks,
        config,

        // Обработчики
        onTaskRetry: handleTaskRetry,
        onTabChange: handleTabChange,
        onOpenSettings: handleOpenSettings,
        onCloseSettings: handleCloseSettings,
        onToggleSubject: handleToggleSubject,
        onTargetScoreChange: handleTargetScoreChange,
        onResetSettings: handleResetSettings,
        onSaveSettings: handleSaveSettings,
        onBack: () => navigate('/school'),
        onStartTraining: handleStartTraining,

        // Вспомогательные функции
        getMaxScore: (subjectId) => getMaxScore(subjectId, examType),
        getDifficultyText,
        getDifficultyColor,
        formatSubjectName
    };
};

export default useExamLogic;