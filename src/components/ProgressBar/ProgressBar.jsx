import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
// import './ProgressBar.css';

const ProgressBar = ({ current = 34, percentage = 40 }) => {
    return (
        <motion.div
            className="progress-bar-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="progress-info">
                <motion.span
                    className="progress-current"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    {current} <Flame className="flame-icon" />
                </motion.span>
            </div>

            <div className="progress-track">
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.3
                    }}
                />
            </div>

            <motion.span
                className="progress-percentage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {percentage}%
            </motion.span>
        </motion.div>
    );
};

export default ProgressBar;