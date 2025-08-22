import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './NewsModal.css';

const modalVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const NewsModal = ({ isOpen, onClose, news }) => {
    // Esc + запрет скролла фона
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !news) return null;

    const node = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="news-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                >
                    <motion.div
                        className="news-modal-content"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="news-header">
                            <h2 className="news-modal-title">{news.title}</h2>
                            <button className="news-modal-x" onClick={onClose} aria-label="Закрыть">
                                <X size={20}/>
                            </button>
                        </div>
                        <p className="news-modal-date">{news.date}</p>
                        <p className="news-modal-text">{news.text}</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(node, document.body);
};

export default NewsModal;
