import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
        fullScreen = false,
        size = 'md', // sm, md, lg
        text = '',
        color = 'text-gray-500'
    }) => {
    const sizeMap = {
        sm: 20,
        md: 32,
        lg: 48
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-50'
        : 'flex flex-col items-center justify-center';

    return (
        <div className={containerClasses}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="mb-2"
            >
                <Loader2 size={sizeMap[size]} className={`${color}`} />
            </motion.div>
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-700 dark:text-gray-300"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
