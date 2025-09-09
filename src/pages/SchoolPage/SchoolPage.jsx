// src/pages/SchoolPage/SchoolPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Brain, FileText, Camera,
    PenTool, CheckSquare, HelpCircle, ChevronRight
} from 'lucide-react';
import ToolCard from '../../components/ToolCard/ToolCard';
import { testsData } from '../../data/testData';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './SchoolPage.css';

const SchoolPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('instruments');
    const [selectedSubject, setSelectedSubject] = useState('all');

    const tools = [
        {
            id: 1,
            icon: BookOpen,
            title: 'Объяснить тему',
            subtitle: 'Разобраться в сложной теме',
            action: 'explain_topic',
            type: 'explain',
            description: `🎓 **Объяснение сложных тем простыми словами**

Привет! Я помогу тебе разобраться в любой учебной теме. Вот что я умею:

📚 **Что я делаю:**
• Объясняю сложные концепции простым языком
• Привожу примеры из жизни для лучшего понимания  
• Разбираю тему по шагам, от простого к сложному
• Отвечаю на дополнительные вопросы по теме

🔥 **Мои сильные стороны:**
• Работаю с любыми предметами (математика, физика, химия, биология, история и т.д.)
• Адаптирую объяснение под твой уровень знаний
• Использую схемы, таблицы и визуализацию когда нужно
• Помогаю запомнить материал с помощью мнемотехник

**Просто напиши мне тему, которую нужно разобрать, и я объясню её так, что всё станет понятно! 🚀**`
        },
        {
            id: 2,
            icon: Brain,
            title: 'Подготовиться к кр/экзамену',
            subtitle: 'Выбирай тему и пошли решать',
            action: 'exam_prep',
            type: 'exam',
            description: `🎯 **Подготовка к контрольным и экзаменам**

Готовлюсь помочь тебе успешно сдать любую контрольную или экзамен!

📋 **Что я делаю:**
• Составляю индивидуальный план подготовки
• Объясняю все темы, которые будут на экзамене
• Даю практические задания для отработки
• Провожу контрольные тесты и проверяю знания

💪 **Методы подготовки:**
• Разбор типовых заданий и их решений
• Создание шпаргалок и конспектов для повторения
• Работа с билетами и вопросами прошлых лет
• Техники запоминания и снятия стресса перед экзаменом

🏆 **Результат:**
• Уверенность в своих знаниях
• Готовность к любым вопросам
• Высокие оценки

**Скажи, к какому экзамену готовишься, и мы составим план победы! 💯**`
        },
        {
            id: 3,
            icon: FileText,
            title: 'Сделать конспект',
            subtitle: 'Присылай файл, текст. Сократим',
            action: 'make_notes',
            type: 'notes',
            description: `📝 **Создание идеальных конспектов**

Превращаю любой материал в удобный и понятный конспект!

📄 **С чем работаю:**
• Учебники и параграфы
• Лекции и презентации  
• Статьи и научные тексты
• Видеоуроки (по ссылке или описанию)

✨ **Что получишь:**
• Структурированный конспект с главными мыслями
• Выделение ключевых терминов и определений
• Схемы и таблицы для наглядности
• Краткие выводы по каждому разделу

🎨 **Форматы конспектов:**
• Классический текстовый
• В виде интеллект-карт
• Таблицы и схемы
• Вопросы-ответы для самопроверки

**Присылай материал любым способом - текстом, файлом или ссылкой, и я сделаю из него отличный конспект! 📚**`
        },
        {
            id: 4,
            icon: Camera,
            title: 'Разбор задания по фото',
            subtitle: 'Присылай фото/текст/файл. Решим',
            action: 'photo_solve',
            type: 'photo',
            description: `📷 **Решение заданий по фото**

Просто сфотографируй задание - и я его решу с подробным объяснением!

📸 **Что могу решить:**
• Математические примеры и уравнения
• Задачи по физике, химии, биологии
• Упражнения по русскому и литературе
• Задания по истории и обществознанию
• Геометрические построения

🔍 **Как работаю:**
• Анализирую фото и понимаю, что нужно решить
• Показываю пошаговое решение
• Объясняю каждый этап и формулы
• Даю советы, как решать похожие задания

💡 **Дополнительно:**
• Проверяю правильность уже решённых заданий
• Помогаю найти ошибки в решении
• Предлагаю альтернативные способы решения

**Сфотографируй задание или пришли его текстом - решим вместе! 🚀**`
        },
        {
            id: 5,
            icon: PenTool,
            title: 'Написать работу',
            subtitle: 'Напишем сочинение, эссе и тп',
            action: 'write_work',
            type: 'write',
            description: `✍️ **Написание письменных работ**

Помогаю создавать качественные тексты любого типа и сложности!

📝 **Что пишу:**
• Сочинения по литературе
• Эссе по обществознанию и истории
• Рефераты и доклады
• Изложения и сочинения ЕГЭ
• Творческие работы

🎯 **Мой подход:**
• Анализирую тему и требования
• Составляю чёткий план работы
• Подбираю аргументы и примеры
• Пишу текст с правильной структурой
• Проверяю стиль и грамотность

🏆 **Особенности работ:**
• Уникальный контент без плагиата
• Соответствие всем требованиям
• Логичная структура и связность
• Богатая лексика и разнообразие конструкций

**Расскажи тему и требования - создам отличную работу, которая точно получит высокую оценку! ⭐**`
        },
        {
            id: 6,
            icon: CheckSquare,
            title: 'Разобрать ошибку',
            subtitle: 'Поясним. Порешаем подобные задания',
            action: 'analyze_mistake',
            type: 'mistake',
            description: `🔍 **Разбор ошибок и работа над ними**

Превращаю ошибки в возможности для обучения!

❌ **Что анализирую:**
• Ошибки в решении задач
• Неправильные ответы в тестах
• Грамматические и стилистические ошибки
• Ошибки в логике рассуждений

💡 **Как помогаю:**
• Нахожу точную причину ошибки
• Объясняю правильное решение пошагово
• Показываю, как избежать таких ошибок в будущем
• Даю похожие задания для закрепления

🎯 **Методы работы:**
• Сравнение твоего и правильного решения
• Разбор каждого шага решения
• Объяснение теории, которая поможет не ошибаться
• Тренировка на аналогичных заданиях

📈 **Результат:**
• Понимание своих слабых мест
• Устранение пробелов в знаниях
• Уверенность в решении подобных задач

**Покажи свою ошибку - разберём её и научимся делать правильно! 🎓**`
        },
        {
            id: 7,
            icon: HelpCircle,
            title: 'Поддержка настроения',
            subtitle: 'Помогу тебе с личной жизнь, справиться со сложностью',
            action: 'mood_support',
            type: 'support',
            description: `💝 **Поддержка и помощь в личных вопросах**

Здесь для тебя не только как учебный помощник, но и как друг!

🤗 **В чём помогаю:**
• Справиться со стрессом перед экзаменами
• Найти мотивацию для учёбы
• Разобраться в отношениях с друзьями/семьёй
• Преодолеть неуверенность в себе
• Найти своё призвание и цели

💪 **Мои методы:**
• Выслушиваю без осуждения
• Даю практические советы
• Помогаю найти сильные стороны
• Мотивирую и поддерживаю
• Предлагаю техники релаксации

🌟 **Темы для разговора:**
• Проблемы в школе или вузе
• Отношения с родителями и друзьями
• Выбор профессии и будущего
• Самооценка и уверенность
• Как справляться с трудностями

**Не стесняйся делиться - я здесь, чтобы поддержать тебя! Вместе мы справимся с любыми сложностями 🌈**`
        }
    ];

    const subjects = [
        { id: 'all', name: 'Все' },
        { id: 'математика', name: 'Математика' },
        { id: 'русский язык', name: 'Русский' },
        { id: 'физика', name: 'Физика' },
        { id: 'биология', name: 'Биология' },
        { id: 'химия', name: 'Химия' },
        { id: 'история', name: 'История' }
    ];

    const handleToolClick = async (tool) => {
        try {
            console.log('🎯 Mock: creating tool chat:', tool.action);

            // Имитация создания чата (вместо API)
            const mockChatId = `${tool.action}_${Date.now()}`;

            navigate(`/chat/${mockChatId}`, {
                state: {
                    chatType: tool.action,
                    toolConfig: tool,
                    initialMessage: `Начинаем работу: ${tool.title}`
                }
            });

        } catch (error) {
            console.error('Failed to create tool chat:', error);
            // Fallback навигация
            navigate(`/chat/demo_${tool.id}`);
        }
    };


    const handleTestClick = (testId) => {
        navigate(`/test/${testId}`);
    };

    const getSubjectColor = (subject) => {
        switch(subject) {
            case 'математика': return '#ef4444';
            case 'русский язык': return '#22c55e';
            case 'физика': return '#3b82f6';
            case 'биология': return '#10b981';
            case 'химия': return '#f59e0b';
            case 'история': return '#8b5cf6';
            default: return '#43ff65';
        }
    };

    const filteredTests = Object.values(testsData).filter(test => {
        if (selectedSubject === 'all') return true;
        return test.subject === selectedSubject;
    });

    return (
        <motion.div
            className="school-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="page-title"
                    variants={itemAnimation}
                >

                    <h1>Инструменты для учебы</h1>
                </motion.div>

                <motion.div
                    className="tab-switcher"
                    variants={itemAnimation}
                >
                    <motion.button
                        className={`tab-btn ${activeTab === 'instruments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('instruments')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Инструменты
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tests')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Тесты
                    </motion.button>
                </motion.div>

                <motion.div
                    className="tab-content"
                    variants={itemAnimation}
                >
                    {activeTab === 'instruments' ? (
                        <motion.div
                            className="tools-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {tools.map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ToolCard
                                        {...tool}
                                        onClick={() => handleToolClick(tool.action)}
                                        data-type={tool.type}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Фильтр по предметам */}
                            <motion.div
                                className="subjects-filter"
                                variants={itemAnimation}
                            >
                                <div className="subjects-scroll">
                                    {subjects.map((subject, index) => (
                                        <motion.button
                                            key={subject.id}
                                            className={`subject-chip ${selectedSubject === subject.id ? 'active' : ''}`}
                                            onClick={() => setSelectedSubject(subject.id)}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {subject.name}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Список тестов */}
                            <motion.div
                                className="tests-grid"
                                variants={itemAnimation}
                            >
                                {filteredTests.length > 0 ? (
                                    filteredTests.map((test, index) => (
                                        <motion.div
                                            key={test.id}
                                            className={`task-card ${test.completedQuestions === test.totalQuestions ? 'success' : test.completedQuestions > 0 ? 'progress' : ''}`}
                                            onClick={() => handleTestClick(test.id)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="task-header">
                                                <h3 className="task-title">{test.title}</h3>
                                                <ChevronRight className="tool-arrow" />
                                            </div>

                                            <div className="task-meta">
                                                <span
                                                    className="task-subject"
                                                    style={{ backgroundColor: getSubjectColor(test.subject) }}
                                                >
                                                    {test.subject}
                                                </span>
                                                <span className="task-date">
                                                    {new Date().toLocaleDateString('ru-RU', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="task-progress">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{
                                                            width: `${(test.completedQuestions / test.totalQuestions) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="progress-text">
                                                    {test.completedQuestions}/{test.totalQuestions}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        className="empty-state"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <p>Нет тестов по выбранному предмету</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SchoolPage;