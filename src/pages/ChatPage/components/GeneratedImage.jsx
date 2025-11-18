import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Maximize2, Sparkles, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';
import './GeneratedImage.css';
import { downloadOriginalImage, openOriginalImage } from '../../../services/chatAPI'; // Путь к твоему API файлу

/**
 * 🆕 ОБНОВЛЕННЫЙ КОМПОНЕНТ: Поддержка сжатых и оригинальных изображений
 *
 * Компонент для красивого отображения сгенерированных DALL-E изображений
 * Включает: анимации, превью, действия (увеличить, скачать оригинал/сжатый, регенерировать)
 *
 * ✅ НОВЫЕ ВОЗМОЖНОСТИ:
 * - Показывает сжатую WebP версию (быстрая загрузка)
 * - Кнопка "Скачать сжатое" (WebP, маленький размер)
 * - Кнопка "Скачать оригинал" (PNG, полное качество)
 * - Кнопка "Открыть оригинал" (просмотр в полном размере)
 * - Информация о сжатии (экономия места)
 * - Tooltip с подсказками
 */
const GeneratedImage = ({
                            imageUrl,              // URL сжатого изображения (WebP)
                            imageId,               // ID изображения для получения оригинала
                            originalUrl,           // URL оригинала (PNG)
                            revisedPrompt,         // Улучшенный промпт от DALL-E
                            originalPrompt,        // Оригинальный промпт пользователя
                            compressionRatio,      // Процент сжатия (например, 90)
                            originalSizeMb,        // Размер оригинала в MB
                            compressedSizeMb,      // Размер сжатого в MB
                            isGenerating = false,  // Идет ли генерация
                            onRegenerate,          // Callback для регенерации
                            onClick,               // Callback при клике на изображение
                            fileName = 'generated-image'
                        }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showCompressionInfo, setShowCompressionInfo] = useState(false);
    const [downloadingOriginal, setDownloadingOriginal] = useState(false);

    /**
     * 🆕 Скачивание СЖАТОГО изображения (WebP)
     */
    const handleDownloadCompressed = async (e) => {
        e.stopPropagation();

        try {
            console.log('⬇️ Скачивание сжатого изображения...');

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${fileName}_compressed.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Сжатое изображение скачано');
        } catch (error) {
            console.error('❌ Ошибка скачивания сжатого:', error);
            alert('Не удалось скачать изображение');
        }
    };

    /**
     * 🆕 Скачивание ОРИГИНАЛА (PNG, полное качество)
     */
    const handleDownloadOriginal = async (e) => {
        e.stopPropagation();

        if (!imageId) {
            console.error('❌ Нет imageId для скачивания оригинала');
            alert('Оригинал недоступен');
            return;
        }

        try {
            setDownloadingOriginal(true);
            console.log('⬇️ Скачивание оригинала...');

            // Используем функцию из API
            const success = await downloadOriginalImage(
                imageId,
                `${fileName}_original.png`
            );

            if (success) {
                console.log('✅ Оригинал скачан');
            } else {
                alert('Не удалось скачать оригинал');
            }
        } catch (error) {
            console.error('❌ Ошибка скачивания оригинала:', error);
            alert('Ошибка при скачивании оригинала');
        } finally {
            setDownloadingOriginal(false);
        }
    };

    /**
     * 🆕 Открытие ОРИГИНАЛА в новой вкладке (полный размер)
     */
    const handleViewOriginal = (e) => {
        e.stopPropagation();

        if (!imageId) {
            console.error('❌ Нет imageId для просмотра оригинала');
            alert('Оригинал недоступен');
            return;
        }

        console.log('🔍 Открытие оригинала в новой вкладке...');
        openOriginalImage(imageId);
    };

    /**
     * Открытие в полный экран (модальное окно)
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
                {/* Само изображение (сжатая WebP версия) */}
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
                        {/* 🆕 Просмотр оригинала в новой вкладке */}
                        {imageId && (
                            <motion.button
                                className="overlay-btn"
                                onClick={handleViewOriginal}
                                title="Открыть оригинал в полном размере (PNG)"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Maximize2 size={20} />
                            </motion.button>
                        )}

                        {/* Скачать сжатое (WebP) */}
                        <motion.button
                            className="overlay-btn"
                            onClick={handleDownloadCompressed}
                            title="Скачать сжатое изображение (WebP, быстро)"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download size={20} />
                        </motion.button>

                        {/* 🆕 Скачать оригинал (PNG) */}
                        {imageId && (
                            <motion.button
                                className="overlay-btn original-btn"
                                onClick={handleDownloadOriginal}
                                title="Скачать оригинал (PNG, полное качество)"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={downloadingOriginal}
                            >
                                {downloadingOriginal ? (
                                    <RefreshCw size={20} className="spin" />
                                ) : (
                                    <ImageIcon size={20} />
                                )}
                            </motion.button>
                        )}

                        {/* Регенерация */}
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

                {/* 🆕 Бейдж сжатия (если есть информация) */}
                {compressionRatio && compressionRatio >= 80 && (
                    <div className="compression-badge">
                        <span>-{compressionRatio}% 🗜️</span>
                    </div>
                )}
            </div>

            {/* 🆕 РАЗДЕЛ СКАЧИВАНИЯ С ДВУМЯ КНОПКАМИ */}
            <motion.div
                className="download-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <div className="download-buttons">
                    {/* Кнопка: Скачать сжатое (WebP) */}
                    <motion.button
                        className="download-button compressed-btn"
                        onClick={handleDownloadCompressed}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Быстрое скачивание (маленький размер)"
                    >
                        <Download size={18} />
                        <div className="btn-content">
                            <span className="btn-title">Скачать (быстро)</span>
                            {compressedSizeMb && (
                                <span className="btn-subtitle">{compressedSizeMb} MB · WebP</span>
                            )}
                        </div>
                    </motion.button>

                    {/* Кнопка: Скачать оригинал (PNG) */}
                    {imageId && (
                        <motion.button
                            className="download-button original-btn"
                            onClick={handleDownloadOriginal}
                            disabled={downloadingOriginal}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title="Полное качество (большой размер)"
                        >
                            {downloadingOriginal ? (
                                <>
                                    <RefreshCw size={18} className="spin" />
                                    <span>Загрузка...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={18} />
                                    <div className="btn-content">
                                        <span className="btn-title">Оригинал (100%)</span>
                                        {originalSizeMb && (
                                            <span className="btn-subtitle">{originalSizeMb} MB · PNG</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* 🆕 Информация о сжатии (кликабельная) */}
                {compressionRatio && (
                    <div
                        className="compression-info"
                        onClick={() => setShowCompressionInfo(!showCompressionInfo)}
                        style={{ cursor: 'pointer' }}
                    >
                        <Info size={14} />
                        <span>
                            Экономия {compressionRatio}% ·
                            Вы видите оптимизированную версию
                        </span>
                    </div>
                )}

                {/* 🆕 Детальная информация о сжатии (выдвижная) */}
                {showCompressionInfo && compressionRatio && (
                    <motion.div
                        className="compression-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="detail-row">
                            <span className="detail-label">Оригинал (PNG):</span>
                            <span className="detail-value">{originalSizeMb || '?'} MB</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Сжатый (WebP):</span>
                            <span className="detail-value highlight">{compressedSizeMb || '?'} MB</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Экономия:</span>
                            <span className="detail-value highlight">{compressionRatio}%</span>
                        </div>
                        <div className="detail-note">
                            💡 Сжатая версия загружается в 10 раз быстрее,
                            но оригинал всегда доступен в полном качестве!
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Информация о промпте (если есть revised prompt от DALL-E) */}
            {revisedPrompt && revisedPrompt !== originalPrompt && (
                <motion.div
                    className="prompt-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    <div className="prompt-label">
                        <Sparkles size={14} />
                        <span>Улучшенный промпт:</span>
                    </div>
                    <p className="prompt-text">{revisedPrompt}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default GeneratedImage;