import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
// import './TaskCard.css';

const TaskCard = ({ title, subject, date, progress, total }) => {
    const percentage = Math.round((progress / total) * 100);

    return (
        <motion.div
            className="task-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className="task-header">
                <div className="task-info">
                    <h3 className="task-title">{title}</h3>
                    <span className="task-badge">{subject}</span>
                </div>
                <motion.button
                    className="task-arrow"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <ChevronRight className="arrow-icon" />
                </motion.button>
            </div>

            <p className="task-date">{date}</p>

            <div className="task-progress">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <span className="progress-text">
          {progress}/{total}
        </span>
            </div>
        </motion.div>
    );
};

export default TaskCard;