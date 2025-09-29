import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './ImageModal.css';

const ImageModal = ({ isOpen, image, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup при размонтировании
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Закрытие по клавише Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !image) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="image-modal-overlay"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="image-modal-container"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div className="image-modal-content">
                        <img
                            src={image.url || URL.createObjectURL(image)}
                            alt={image.name}
                            className="image-modal-img"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageModal;