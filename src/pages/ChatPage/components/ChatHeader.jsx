// src/pages/ChatPage/components/ChatHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import { getAgentByAction } from '../../../utils/aiAgentsUtils';

/**
 * Компонент шапки чата с кнопкой настроек
 * @param {string} title - Название чата
 * @param {string} chatId - ID чата
 * @param {string} chatType - Тип чата (coding, image, essay и т.д.)
 * @param {function} onNavigateBack - Callback для возврата назад
 * @param {function} onOpenSettings - Callback для открытия настроек
 * @param {string} agentPrompt - Промпт для ИИ-агента
 */
const ChatHeader = ({ title, chatId, chatType, onNavigateBack, onOpenSettings, agentPrompt }) => {

    // Получение иконки агента по типу чата
    const getChatIcon = () => {
        const agentConfig = getAgentByAction(chatType);
        if (agentConfig && agentConfig.icon) {
            const IconComponent = agentConfig.icon;
            return (
                <IconComponent
                    className="icon"
                    style={{ color: agentConfig.iconColor }}
                />
            );
        }
        // Fallback иконка если не найдена
        return <Settings className="icon" />;
    };

    return (
        <div className="chat-header">
            {/* Кнопка назад */}
            <motion.button
                className=""
                onClick={onNavigateBack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <ArrowLeft className="icon" />
            </motion.button>

            {/* Заголовок чата */}
            <h1 className="chat-title">{title}</h1>

            {/* Кнопка настроек с анимацией поворота */}
            <motion.button
                className="settings-btn"
                onClick={onOpenSettings}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Настройки чата"
            >
                <motion.div
                    whileHover={{
                        rotate: 180,
                        transition: {
                            duration: 1.2,
                            ease: [0.68, -0.55, 0.265, 1.55] // cubic-bezier для плавной анимации
                        }
                    }}
                >
                    <Settings className="icon" />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default ChatHeader;