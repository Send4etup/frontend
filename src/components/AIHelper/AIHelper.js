// src/components/AIHelper/AIHelper.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Camera, Mic, Image as ImageIcon,
    Code, Clock, Sparkles
} from 'lucide-react';
import './AIHelper.css';

const AIHelper = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [energy] = useState(34);

    const handleInputSubmit = () => {
        if (inputValue.trim()) {
            navigate('/chat/general', {
                state: {
                    initialMessage: inputValue,
                    title: 'ТоварищБот'
                }
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        }
    };

    const aiActions = [
        {
            icon: ImageIcon,
            label: 'Создать изображение',
            action: () => navigate('/chat/image')
        },
        {
            icon: Code,
            label: 'Кодинг',
            action: () => navigate('/chat/coding')
        },
        {
            icon: Clock,
            label: 'Брейншторм',
            action: () => navigate('/chat/brainstorm')
        },
        {
            icon: Sparkles,
            label: 'Придумать отмазку',
            action: () => navigate('/chat/excuse')
        }
    ];

    return (
        <motion.div
            className="ai-helper-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className="helper-title">Чем я могу тебе сегодня помочь?</h2>
            <div className="helper-quote-container">
                <p className="helper-quote">
                    Эмоции, обычно, через какое-то время проходят, но то, что они сделали, остается
                </p>
                <p className="helper-author">Вильгельм Швебель</p>
            </div>

            {/* Energy Bar */}
            <div className="energy-bar">
                <div className="energy-indicator">
                    <Zap className="energy-icon" />
                    <span className="energy-text">{energy}</span>
                </div>
                <div className="energy-progress">
                    <div
                        className="energy-fill"
                        style={{ width: `${energy}%` }}
                    />
                </div>
                <span className="energy-percentage">{energy}%</span>
            </div>

            {/* Input Field */}
            <div className="ai-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Что тебя интересует?"
                    className="ai-input-field"
                />
                <div className="input-actions">
                    <motion.button
                        className="input-action"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Camera className="icon" />
                    </motion.button>
                    <motion.button
                        className="input-action"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Mic className="icon" />
                    </motion.button>
                </div>
            </div>

            {/* AI Actions */}
            <div className="ai-actions">
                {aiActions.map((action, index) => (
                    <motion.button
                        key={index}
                        className="ai-action"
                        onClick={action.action}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <action.icon className="action-icon" />
                        <span>{action.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default AIHelper;