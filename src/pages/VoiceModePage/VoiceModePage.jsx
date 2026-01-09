// VoiceModePage.jsx - Голосовой режим общения с ИИ

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Settings,
    Mic,
    Keyboard,
    X,
    ChevronDown,
    Check,
    Zap,
    Gauge,
    Volume2,
    Music
} from 'lucide-react';
import './VoiceModePage.css';
import {useNavigate} from "react-router-dom";

/**
 * Голосовой режим для общения с ИИ
 * Позволяет разговаривать с ботом голосом как с живым человеком
 */
const VoiceModePage = ({}) => {
    // Состояния
    const [activeTab, setActiveTab] = useState('conversation');
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showStyleModal, setShowStyleModal] = useState(false);

    const navigate = useNavigate();

    const onClose = () => {
        navigate("/exam-mode");
    }

    // Настройки
    const [settings, setSettings] = useState({
        speechSpeed: 'normal', // slow, normal, fast
        voiceBot: 'neuro', // nastya, sergey, neuro, alex
        communicationStyle: 'default', // default, mentor, classmate, coach, psychologist, custom
        backgroundMusic: 'lofi', // lofi, chillpop, nature, silence
        musicVolume: 39
    });

    // История сообщений (заглушки)
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'user',
            text: 'Что тебя сегодня беспокоит?'
        },
        {
            id: 2,
            type: 'ai',
            text: 'Меня бросила девушка Анна, что делать? Меня бросила девушка Анна,'
        }
    ]);

    /**
     * Обработчик клика по кнопке микрофона
     */
    const handleMicClick = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            setIsSpeaking(true);
            // TODO: Начать запись голоса через getUserMedia
            console.log('🎤 Начинаем запись...');

            // Эмуляция ответа ИИ через 3 секунды
            setTimeout(() => {
                setIsRecording(false);
                setIsSpeaking(false);
                console.log('✅ Запись остановлена');
            }, 3000);
        }
    };

    /**
     * Обработчик изменения настройки
     */
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        console.log(`Настройка ${key} изменена на:`, value);
    };

    /**
     * Сброс настроек к значениям по умолчанию
     */
    const handleResetSettings = () => {
        setSettings({
            speechSpeed: 'normal',
            voiceBot: 'neuro',
            communicationStyle: 'default',
            backgroundMusic: 'lofi',
            musicVolume: 39
        });
        console.log('⚙️ Настройки сброшены');
    };

    /**
     * Получить название стиля общения
     */
    const getCommunicationStyleName = (style) => {
        const styles = {
            default: 'По умолчанию',
            mentor: 'Наставник',
            classmate: 'Одноклассник',
            coach: 'Коуч',
            psychologist: 'Психолог',
            custom: 'Кастомный'
        };
        return styles[style] || 'По умолчанию';
    };

    // Варианты стилей общения
    const communicationStyles = [
        {
            id: 'default',
            name: 'По умолчанию',
            description: 'спокойный, дружелюбный, без лишнего'
        },
        {
            id: 'mentor',
            name: 'Наставник',
            description: 'четкий, объясняет пошагово'
        },
        {
            id: 'classmate',
            name: 'Одноклассник',
            description: 'легкий, шутливый, говорит просто'
        },
        {
            id: 'coach',
            name: 'Коуч',
            description: 'вдохновляющий, помогает ставить цели и действовать'
        },
        {
            id: 'psychologist',
            name: 'Психолог',
            description: 'спокойный, поддерживающий, помогает сосредоточиться'
        },
        {
            id: 'custom',
            name: 'Кастомный',
            description: 'Настрой режим под себя'
        }
    ];

    return (
        <div className="voice-mode-page">
            {/* Заголовок */}
            <div className="voice-header">
                <button className="voice-back-btn" onClick={onClose}>
                    <ArrowLeft size={20} color="#fff" />
                </button>
                <div className="voice-title-wrapper">
                    <h1 className="voice-title">Голосовой режим</h1>
                    <p className="voice-subtitle">Общайся со мной как с живым человеком</p>
                </div>
                <button
                    className="voice-settings-btn"
                    onClick={() => setShowSettings(true)}
                >
                    <Settings size={20} color="#fff" />
                </button>
            </div>

            {/* Анимированный аватар */}
            <div className="voice-avatar-container">
                <motion.div
                    className={`voice-avatar ${isSpeaking ? 'speaking' : ''}`}
                    animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    <div className="avatar-circle">
                        <span className="avatar-face">😊</span>
                    </div>
                    <div className="avatar-ring"></div>
                    <div className="avatar-ring avatar-ring-2"></div>
                </motion.div>
            </div>

            {/* Вкладки */}
            <div className="voice-tabs">
                <button
                    className={`voice-tab ${activeTab === 'conversation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('conversation')}
                >
                    Разговор
                </button>
                <button
                    className={`voice-tab ${activeTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveTab('data')}
                >
                    Данные
                </button>
                <button
                    className={`voice-tab ${activeTab === 'sessions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    Другие сессии
                </button>
            </div>

            {/* Контент */}
            <div className="voice-content">
                {activeTab === 'conversation' && messages.length > 0 ? (
                    messages.map((message) => (
                        <motion.div
                            key={message.id}
                            className={`voice-message ${message.type}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="message-text">{message.text}</p>
                        </motion.div>
                    ))
                ) : activeTab === 'conversation' ? (
                    <div className="voice-empty-state">
                        <p>Начни разговор, нажав на кнопку микрофона</p>
                    </div>
                ) : (
                    <div className="voice-empty-state">
                        <p>Раздел "{activeTab === 'data' ? 'Данные' : 'Другие сессии'}"</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            Заглушка - функционал в разработке
                        </p>
                    </div>
                )}
            </div>

            {/* Панель управления */}
            <div className="voice-controls">
                <button className="voice-control-btn">
                    <Keyboard size={22} color="rgba(255, 255, 255, 0.7)" />
                </button>

                <button
                    className={`voice-mic-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleMicClick}
                >
                    <Mic size={28} color={isRecording ? '#fff' : '#0d0d0d'} />
                </button>

                <button className="voice-control-btn" onClick={onClose}>
                    <X size={22} color="rgba(255, 255, 255, 0.7)" />
                </button>
            </div>

            {/* Модальное окно настроек */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="voice-settings-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            className="voice-settings-content"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Заголовок настроек */}
                            <div className="settings-header">
                                <h2 className="settings-title">
                                    <Settings size={20} /> Настройки
                                </h2>
                                <button
                                    className="settings-close-btn"
                                    onClick={() => setShowSettings(false)}
                                >
                                    <X size={18} color="#fff" />
                                </button>
                            </div>

                            {/* Скорость речи */}
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <Gauge size={16} color="#43ff65" />
                                    Скорость речи
                                </div>
                                <p className="settings-section-subtitle">
                                    Выберите комфортную скорость ответов
                                </p>
                                <div className="settings-options">
                                    <button
                                        className={`settings-option-btn ${settings.speechSpeed === 'slow' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('speechSpeed', 'slow')}
                                    >
                                        Медленно
                                    </button>
                                    <button
                                        className={`settings-option-btn ${settings.speechSpeed === 'normal' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('speechSpeed', 'normal')}
                                    >
                                        Нормально
                                    </button>
                                    <button
                                        className={`settings-option-btn ${settings.speechSpeed === 'fast' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('speechSpeed', 'fast')}
                                    >
                                        Быстро
                                    </button>
                                </div>
                            </div>

                            {/* Голос бота */}
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <Volume2 size={16} color="#43ff65" />
                                    Голос бота
                                </div>
                                <p className="settings-section-subtitle">
                                    Выберите приятный голос для общения
                                </p>
                                <div className="voice-avatars">
                                    {['nastya', 'sergey', 'neuro', 'alex'].map((voice) => (
                                        <div
                                            key={voice}
                                            className={`voice-avatar-option ${settings.voiceBot === voice ? 'active' : ''}`}
                                            onClick={() => handleSettingChange('voiceBot', voice)}
                                        >
                                            <div className="voice-avatar-img">
                                                {voice === 'neuro' && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '24px'
                                                    }}>
                                                        🎵
                                                    </div>
                                                )}
                                            </div>
                                            <span className="voice-avatar-name">
                                                {voice === 'nastya' ? 'Настя' :
                                                    voice === 'sergey' ? 'Сергей' :
                                                        voice === 'neuro' ? 'Нейро' : 'Alex'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Стиль общения */}
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <Zap size={16} color="#43ff65" />
                                    Стиль общения
                                </div>
                                <p className="settings-section-subtitle">
                                    Выберите поведение бота в беседе
                                </p>
                                <div
                                    className="communication-style-dropdown"
                                    onClick={() => setShowStyleModal(true)}
                                >
                                    <span className="style-current">
                                        {getCommunicationStyleName(settings.communicationStyle)}
                                    </span>
                                    <ChevronDown size={18} color="rgba(255, 255, 255, 0.6)" />
                                </div>
                            </div>

                            {/* Фоновая музыка */}
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <Music size={16} color="#43ff65" />
                                    Фоновая музыка
                                </div>
                                <p className="settings-section-subtitle">
                                    Расслабляющая музыка во время разговоров
                                </p>
                                <div className="settings-options">
                                    <button
                                        className={`settings-option-btn ${settings.backgroundMusic === 'lofi' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('backgroundMusic', 'lofi')}
                                    >
                                        Lo-Fi
                                    </button>
                                    <button
                                        className={`settings-option-btn ${settings.backgroundMusic === 'chillpop' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('backgroundMusic', 'chillpop')}
                                    >
                                        Chill-Pop
                                    </button>
                                    <button
                                        className={`settings-option-btn ${settings.backgroundMusic === 'nature' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('backgroundMusic', 'nature')}
                                    >
                                        Nature
                                    </button>
                                    <button
                                        className={`settings-option-btn ${settings.backgroundMusic === 'silence' ? 'active' : ''}`}
                                        onClick={() => handleSettingChange('backgroundMusic', 'silence')}
                                    >
                                        Silence
                                    </button>
                                </div>

                                {/* Слайдер громкости */}
                                {settings.backgroundMusic !== 'silence' && (
                                    <div className="volume-control">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={settings.musicVolume}
                                            onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                                            className="volume-slider"
                                        />
                                        <div className="volume-value">{settings.musicVolume}%</div>
                                    </div>
                                )}
                            </div>

                            {/* Кнопка сброса настроек */}
                            <button
                                className="reset-settings-btn"
                                onClick={handleResetSettings}
                            >
                                Сбросить настройки
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Модальное окно выбора стиля общения */}
            <AnimatePresence>
                {showStyleModal && (
                    <motion.div
                        className="style-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowStyleModal(false)}
                    >
                        <motion.div
                            className="style-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {communicationStyles.map((style) => (
                                <div
                                    key={style.id}
                                    className={`style-option ${settings.communicationStyle === style.id ? 'active' : ''}`}
                                    onClick={() => {
                                        handleSettingChange('communicationStyle', style.id);
                                        setShowStyleModal(false);
                                    }}
                                >
                                    <div className="style-option-title">
                                        {settings.communicationStyle === style.id && (
                                            <Check size={18} color="#43ff65" />
                                        )}
                                        {style.name}
                                    </div>
                                    <div className="style-option-description">
                                        {style.description}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceModePage;