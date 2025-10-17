import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Maximize2, Sparkles, RefreshCw } from 'lucide-react';
import './GeneratedImage.css';

/**
 * Компонент для красивого отображения сгенерированных DALL-E изображений
 * Включает: анимации, превью, действия (увеличить, скачать, регенерировать)
 */
const GeneratedImage = ({
                            imageUrl,
                            revisedPrompt,
                            originalPrompt,
                            isGenerating = false,
                            onRegenerate,
                            onClick,
                            fileName = 'generated-image.png'
                        }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    /**
     * Скачивание изображения
     */
    const handleDownload = async (e) => {
        e.stopPropagation();

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка скачивания:', error);
        }
    };

    /**
     * Открытие в полный экран
     */
    const handleFullscreen = (e) => {
        e.stopPropagation();
        onClick && onClick({ url: imageUrl, name: fileName });
    };

    /**
     * Регенерация изображения
     */
    const handleRegenerate = (e) => {
        e.stopPropagation();
        onRegenerate && onRegenerate();
    };

    // Если идёт генерация - показываем скелетон
    if (isGenerating) {
        return (
            <div className="generated-image-container">
                <motion.div
                    className="image-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="skeleton-shimmer" />
                    <div className="generating-indicator">
                        <Sparkles className="sparkle-icon" />
                        <span>Создаём изображение...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Если ошибка загрузки
    if (imageError) {
        return (
            <div className="generated-image-container">
                <div className="image-error">
                    <p>😔 Не удалось загрузить изображение</p>
                    {onRegenerate && (
                        <button onClick={handleRegenerate} className="retry-btn">
                            <RefreshCw size={16} />
                            Попробовать снова
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="generated-image-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Контейнер изображения с действиями */}
            <div className="image-wrapper">
                {/* Само изображение */}
                <motion.img
                    src={imageUrl}
                    alt={revisedPrompt || originalPrompt || 'Generated image'}
                    className={`generated-image ${imageLoaded ? 'loaded' : ''}`}
                    onClick={handleFullscreen}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Оверлей с действиями при наведении */}
                <motion.div
                    className="image-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="overlay-actions">
                        <motion.button
                            className="overlay-btn"
                            onClick={handleFullscreen}
                            title="Открыть в полный экран"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Maximize2 size={20} />
                        </motion.button>

                        <motion.button
                            className="overlay-btn"
                            onClick={handleDownload}
                            title="Скачать изображение"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download size={20} />
                        </motion.button>

                        {onRegenerate && (
                            <motion.button
                                className="overlay-btn regenerate-btn"
                                onClick={handleRegenerate}
                                title="Создать заново"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshCw size={20} />
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Индикатор "Создано ИИ" */}
                <div className="ai-badge">
                    <Sparkles size={12} />
                    <span>Создано ИИ</span>
                </div>
            </div>

            {/* Информация о промпте (если есть revised prompt от DALL-E) */}
            {/*{revisedPrompt && revisedPrompt !== originalPrompt && (*/}
            {/*    <motion.div*/}
            {/*        className="prompt-info"*/}
            {/*        initial={{ opacity: 0, y: 10 }}*/}
            {/*        animate={{ opacity: 1, y: 0 }}*/}
            {/*        transition={{ delay: 0.2, duration: 0.3 }}*/}
            {/*    >*/}
            {/*        <div className="prompt-label">*/}
            {/*            <Sparkles size={14} />*/}
            {/*            <span>Улучшенный промпт:</span>*/}
            {/*        </div>*/}
            {/*        <p className="prompt-text">{revisedPrompt}</p>*/}
            {/*    </motion.div>*/}
            {/*)}*/}
        </motion.div>
    );
};

export default GeneratedImage;