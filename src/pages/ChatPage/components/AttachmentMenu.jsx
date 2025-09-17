import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, FileText, Mic } from 'lucide-react';

const AttachmentMenu = ({ isOpen, onFileAttach, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="attachment-menu"
                    initial={{opacity: 0, y: 20}}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <motion.button
                        className="attachment-btn"
                        onClick={() => onFileAttach('image')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Image className="icon" />
                        <span>Изображения</span>
                    </motion.button>
                    <motion.button
                        className="attachment-btn"
                        onClick={() => onFileAttach('document')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FileText className="icon" />
                        <span>Документы</span>
                    </motion.button>
                    <motion.button
                        className="attachment-btn"
                        onClick={() => onFileAttach('audio')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Mic className="icon" />
                        <span>Аудио</span>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttachmentMenu;