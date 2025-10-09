import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, FileText, Mic } from 'lucide-react';

const AttachmentMenu = ({ isOpen, onFileAttach, onClose, triggerRef }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Проверяем, что клик НЕ по кнопке открытия и НЕ внутри модалки
            const isClickOnTrigger = triggerRef?.current?.contains(event.target);
            const isClickInsideMenu = menuRef.current?.contains(event.target);

            if (!isClickOnTrigger && !isClickInsideMenu) {
                onClose();
            }
        };

        if (isOpen) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="attachment-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        ref={menuRef}
                        className="attachment-menu"
                        initial={{ opacity: 0, y: 20 }}
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
                </>
            )}
        </AnimatePresence>
    );
};

export default AttachmentMenu;