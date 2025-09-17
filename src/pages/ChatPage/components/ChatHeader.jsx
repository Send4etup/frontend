import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { getAgentByAction } from '../../../utils/aiAgentsUtils';

const ChatHeader = ({ title, chatId, chatType, onNavigateBack }) => {
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
        return <Edit3 className="icon" />;
    };

    return (
        <div className="chat-header">
            <motion.button
                className=""
                onClick={onNavigateBack}
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.9}}
            >
                <ArrowLeft className="icon"/>
            </motion.button>

            <h1 className="chat-title">{title} {chatId}</h1>

            <div className="chat-type-icon">
                {getChatIcon()}
            </div>
        </div>
    );
};

export default ChatHeader;