import React from 'react';
import { motion } from 'framer-motion';
import './AIStatusIndicator.css';

/**
 * Компонент индикатора статуса обработки сообщения ИИ-агентом
 * Показывает анимированные точки и текущий этап обработки
 *
 * @param {string} status - Тип текущего статуса обработки
 * @param {string} customText - Кастомный текст (опционально)
 */
const AIStatusIndicator = ({ status = 'generating_text', customText = null }) => {

    // Маппинг статусов к отображаемым текстам
    const STATUS_TEXTS = {
        preparing: 'Получаю запрос...',
        analyzing_files: 'Анализирую файлы...',
        transcribing: 'Транскрибирую аудио...',
        generating_image: 'Генерирую изображение...',
        generating_text: 'Генерирую ответ...',
        streaming: 'Пишу ответ...',
        thinking: 'Думаю...',
        processing: 'Обрабатываю...'
    };

    // Получаем текст для отображения
    const displayText = customText || STATUS_TEXTS[status] || STATUS_TEXTS.generating_text;

    // Анимация появления контейнера
    const containerVariants = {
        hidden: {
            opacity: 0,
            y: 10,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: 'easeOut'
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        }
    };

    // Анимация для точек (волна)
    const dotVariants = {
        initial: {
            scale: 0.8,
            opacity: 0.4
        },
        animate: {
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4],
            transition: {
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    // Задержки для создания волнового эффекта
    const dotDelays = [0, 0.2, 0.4];

    return (
        <motion.div
            className="ai-status-indicator"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Контейнер с точками */}
            <div className="ai-status-dots">
                {dotDelays.map((delay, index) => (
                    <motion.div
                        key={index}
                        className="ai-status-dot"
                        variants={dotVariants}
                        initial="initial"
                        animate="animate"
                        style={{
                            animationDelay: `${delay}s`
                        }}
                        transition={{
                            delay: delay
                        }}
                    />
                ))}
            </div>

            {/* Текст статуса */}
            <motion.span
                className="ai-status-text"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {displayText}
            </motion.span>
        </motion.div>
    );
};

export default AIStatusIndicator;