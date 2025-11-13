// src/pages/ChatPage/components/ChatSettings/ChatSettings.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    RotateCcw,
    ChevronDown,
    Sparkles,
    Wand2,
    Zap,
    CheckCircle2, SettingsIcon,
} from 'lucide-react';
import { getSettingsForChatType, getDefaultSettings } from './settingsConfig';
import './ChatSettings.css';

/**
 * Компонент модального окна настроек чата
 * @param {boolean} isOpen - Открыто ли модальное окно
 * @param {function} onClose - Callback для закрытия
 * @param {function} onSave - Callback для сохранения настроек
 * @param {string} chatType - Тип чата (coding, image, essay и т.д.)
 * @param {object} currentSettings - Текущие настройки чата
 * @param {boolean} isAutoMode - мод настроек
 * @param setIsAutoMode
 */
const ChatSettings = ({ isOpen, onClose, onSave, chatType, currentSettings, isAutoMode, setIsAutoMode }) => {
    // Локальное состояние для редактирования настроек
    const [settings, setSettings] = useState(currentSettings || {});
    const [hasChanges, setHasChanges] = useState(false);

    // Получаем конфигурацию настроек для данного типа чата
    const { general, specific } = getSettingsForChatType(chatType);

    // Синхронизация с текущими настройками
    useEffect(() => {
        if (currentSettings) {
            setSettings(currentSettings);
        }
    }, [currentSettings]);

    // Проверка наличия изменений
    useEffect(() => {
        const changed = JSON.stringify(settings) !== JSON.stringify(currentSettings);
        setHasChanges(changed);
    }, [settings, currentSettings]);

    useEffect(() => {
        localStorage.setItem(`chatSettings_${chatType}_mode`, isAutoMode ? 'auto' : 'manual');
    }, [isAutoMode, chatType]);

    // Обработчик изменения настройки
    const handleSettingChange = (settingId, value) => {
        setSettings(prev => ({
            ...prev,
            [settingId]: value
        }));
    };

    // Сброс к дефолтным значениям
    const handleReset = () => {
        const defaults = getDefaultSettings(chatType);
        setSettings(defaults);
    };

    // Сохранение настроек
    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    // Закрытие без сохранения
    const handleCancel = () => {
        setSettings(currentSettings); // Восстанавливаем оригинальные настройки
        onClose();
    };

    const handleModeChange = (mode) => {
        setIsAutoMode(mode === 'auto');
    };

    // Рендер отдельного элемента настройки
    const renderSettingControl = (setting) => {
        const value = settings[setting.id] ?? setting.defaultValue;

        switch (setting.type) {
            case "slider":
                return (
                    <div className="setting-slider">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            value={value}
                            onChange={(e) =>
                                handleSettingChange(setting.id, parseFloat(e.target.value))
                            }
                            className="slider-input"
                        />
                        <span className="slider-value">{setting.format(value)}</span>
                    </div>
                );

            case 'select':
                return (
                    <CustomSelect
                        setting={setting}
                        value={value}
                        onChange={(val) => handleSettingChange(setting.id, val)}
                    />
                );

            case "toggle":
                return (
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                                handleSettingChange(setting.id, e.target.checked)
                            }
                        />
                        <span className="toggle-slider"></span>
                    </label>
                );

            default:
                return null;
        }
    };

    function CustomSelect({ setting, value, onChange }) {
        const [open, setOpen] = useState(false);

        return (
            <div className="relative w-full border-white">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-zinc-900 rounded-2xl border border-zinc-700 hover:border-green-500 transition"
                >
                    <span>
                      {setting.options.find((opt) => opt.value === value)?.label ??
                          "Выбери вариант"}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                            open ? "rotate-180" : ""
                        }`}
                    />
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.ul
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-lg z-50"
                        >
                            {setting.options.map((opt, index) => (
                                <li
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value)
                                        setOpen(false)
                                    }}
                                    className={`relative flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800 transition`}
                                >
                                    <span>{opt.label}</span>

                                    <span className="relative flex items-center justify-center w-3 h-3 rounded-full border border-white">
                                      {value === opt.value && (
                                          <span className="w-2 h-2 bg-green-400 rounded-full" />
                                      )}
                                    </span>

                                    {/* белая линия снизу */}
                                    {index !== setting.options.length - 1 && (
                                        <span className="absolute bottom-0 left-[15%] w-[70%] h-px bg-white/30" />
                                    )}
                                </li>
                            ))}

                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const AutoModeWidget = () => (
        <motion.div
            className="auto-mode-widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="auto-mode-icon-container">
                <Sparkles className="auto-mode-icon" />
            </div>

            <h3 className="auto-mode-title">ИИ всё настроит сам</h3>

            <p className="auto-mode-description">
                Искусственный интеллект автоматически подберет оптимальные параметры
                для работы в зависимости от контекста и твоих запросов
            </p>

            <div className="auto-mode-features">
                <div className="auto-mode-feature">
                    <Zap className="feature-icon" />
                    <span>Автоматическая оптимизация температуры</span>
                </div>
                <div className="auto-mode-feature">
                    <Wand2 className="feature-icon" />
                    <span>Динамическая длина ответов</span>
                </div>
                <div className="auto-mode-feature">
                    <CheckCircle2 className="feature-icon" />
                    <span>Адаптивный стиль общения</span>
                </div>
            </div>
        </motion.div>
    );

    // Анимации для модального окна
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="settings-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={handleCancel}
                >
                    <motion.div
                        className="settings-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Шапка модального окна */}
                        <div className="settings-header">

                            <h2 className="settings-title">Настройки</h2>
                            <motion.button
                                className="close-settings-btn"
                                onClick={handleCancel}
                                title="Закрыть настройки"
                                whileHover={{
                                    scale: 1.2,
                                    transition: {
                                        duration: 1.2,
                                        ease: [0.68, -0.55, 0.265, 1.55] // cubic-bezier для плавной анимации
                                    }
                                }}
                            >
                                <X size={16}/>
                            </motion.button>
                        </div>

                        <div className="mode-selector-container">
                            <div className="mode-selector">
                                <motion.button
                                    className={`mode-option ${isAutoMode ? 'active' : ''}`}
                                    onClick={() => handleModeChange('auto')}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <Sparkles className="mode-icon"/>
                                    <span>Авто</span>
                                </motion.button>

                                <motion.button
                                    className={`mode-option ${!isAutoMode ? 'active' : ''}`}
                                    onClick={() => handleModeChange('manual')}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <SettingsIcon className="mode-icon"/>
                                    <span>Ручной</span>
                                </motion.button>
                            </div>
                        </div>

                        <div className="settings-content">
                            <AnimatePresence mode="wait">
                                {isAutoMode ? (
                                    <AutoModeWidget key="auto-widget" />
                                ) : (
                                    <motion.div
                                        key="manual-settings"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Все настройки как были */}
                                        <div className="settings-section">
                                            <h3 className="section-title">Общие настройки</h3>
                                            <div className="settings-list">
                                                {general.map(setting => (
                                                    <div key={setting.id} className="setting-item">
                                                        <div className="setting-info">
                                                            <label className="setting-label">
                                                                {setting.label}
                                                            </label>
                                                            <span className="setting-description">
                                                    {setting.description}
                                                </span>
                                                        </div>
                                                        <div className="setting-control">
                                                            {renderSettingControl(setting)}
                                                        </div>
                                                    </div>
                                                ))}

                                                {specific.length > 0 && (
                                                    <div className="settings-section">
                                                        <h3 className="section-title">
                                                            Настройки для данного режима
                                                        </h3>
                                                        <div className="settings-list">
                                                            {specific.map(setting => (
                                                                <div key={setting.id} className="setting-item">
                                                                    <div className="setting-info">
                                                                        <label className="setting-label">
                                                                            {setting.label}
                                                                        </label>
                                                                        <span className="setting-description">
                                                        {setting.description}
                                                    </span>
                                                                    </div>
                                                                    <div className="setting-control">
                                                                        {renderSettingControl(setting)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="reset-btn" onClick={handleReset}>
                                            <RotateCcw size={16} />
                                            <p>Сбросить настройки</p>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Футер с кнопками */}
                        {!isAutoMode && (
                            <div className="settings-footer">
                                <div className="action-buttons">
                                    <button
                                        className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
                                        onClick={handleSave}
                                        disabled={!hasChanges}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatSettings;