// src/components/ToolCard/ToolCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import './ToolCard.css';

const ToolCard = ({ icon: Icon, title, subtitle, action, onClick }) => {
    return (
        <motion.div
            className="tool-card"
            onClick={() => onClick(action)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="tool-icon">
                <Icon className="icon" />
            </div>

            <div className="tool-content">
                <h3 className="tool-title">{title}</h3>
                <p className="tool-subtitle">{subtitle}</p>
            </div>

            <ChevronRight className="tool-arrow" />
        </motion.div>
    );
};

export default ToolCard;