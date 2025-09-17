import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ErrorNotifications = ({ fileErrors, onRemoveError }) => {
    return (
        <AnimatePresence>
            {fileErrors.length > 0 && (
                <motion.div
                    className="file-errors-container"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {fileErrors.map((error, index) => (
                        <motion.div
                            key={index}
                            className="file-error-notification"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <p>{error}</p>
                            <button
                                onClick={() => onRemoveError(index)}
                                className="error-close-btn"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ErrorNotifications;