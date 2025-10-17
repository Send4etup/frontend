// src/pages/ChatPage/components/ChatSettings/ChatSettings.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { getSettingsForChatType, getDefaultSettings } from './settingsConfig';
import './ChatSettings.css';

/**
 * Компонент модального окна настроек чата
 * @param {boolean} isOpen - Открыто ли модальное окно
 * @param {function} onClose - Callback для закрытия
 * @param {function} onSave - Callback для сохранения настроек
 * @param {string} chatType - Тип чата (coding, image, essay и т.д.)
 * @param {object} currentSettings - Текущие настройки чата
 */
const ChatSettings = ({ isOpen, onClose, onSave, chatType, currentSettings }) => {
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

    // Рендер отдельного элемента настройки
    const renderSettingControl = (setting) => {
        const value = settings[setting.id] ?? setting.defaultValue;

        switch (setting.type) {
            case 'slider':
                return (
                    <div className="setting-slider">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            value={value}
                            onChange={(e) => handleSettingChange(setting.id, parseFloat(e.target.value))}
                            className="slider-input"
                        />
                        <span className="slider-value">{setting.format(value)}</span>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="select-input"
                    >
                        {setting.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'toggle':
                return (
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                );

            default:
                return null;
        }
    };

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
                            <button
                                className=""
                                onClick={handleReset}
                                title="Сбросить к настройкам по умолчанию"
                            >
                                <RotateCcw size={16}/>
                            </button>
                        </div>

                        {/* Контент настроек */}
                        <div className="settings-content">
                            {/* Общие настройки */}
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
                                </div>
                            </div>

                            {/* Специфичные настройки (если есть) */}
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

                        {/* Футер с кнопками */}
                        <div className="settings-footer">
                            <div className="action-buttons">
                                <button
                                    className="cancel-btn"
                                    onClick={handleCancel}
                                >
                                    Отмена
                                </button>
                                <button
                                    className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatSettings;