import React from 'react';
import { Image, FileText, Mic, File as FileIcon } from 'lucide-react';

const MessageFile = ({ file, onAnalyze, onImageClick }) => {
    // ✅ БЕЗОПАСНАЯ ПРОВЕРКА: добавляем fallback для всех полей
    const fileType = file?.type || file?.file_type || '';
    const fileName = file?.name || file?.file_name || 'Файл';
    const fileSize = file?.size || file?.file_size || 0;
    const fileId = file?.file_id || null;

    const getFileIcon = (type) => {
        if (!type) return <FileIcon size={20} />;

        if (type.startsWith('image/')) return <Image size={20} />;
        if (type.includes('pdf')) return <FileText size={20} />;
        if (type.includes('document') || type.includes('text')) return <FileText size={20} />;
        if (type.includes('audio/')) return <Mic size={20}/>;
        return <FileIcon size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ✅ ПРОВЕРКА: Является ли файл изображением
    const isImage = fileType && fileType.startsWith('image/');

    // Если это изображение
    if (isImage) {
        // Определяем URL для отображения
        let imageUrl;

        if (fileId) {
            // Если файл из БД - используем thumbnail endpoint
            imageUrl = `/api/files/${fileId}/thumbnail`;
        } else if (file.url) {
            // Если есть готовый URL
            imageUrl = file.url;
        } else if (file instanceof File) {
            // Если это новый загруженный файл (File object)
            imageUrl = URL.createObjectURL(file);
        } else {
            // Fallback: если ничего не подошло
            console.error('Cannot determine image URL for file:', file);
            imageUrl = null;
        }

        // Если URL не удалось определить - показываем placeholder
        if (!imageUrl) {
            return (
                <div className="message-file">
                    <div className="file-icon-large">
                        <Image size={20} />
                    </div>
                    <div className="file-details">
                        <div className="file-name-large">{fileName}</div>
                        <div className="file-size-large">{formatFileSize(fileSize)}</div>
                        <div className="file-type">Изображение (ошибка загрузки)</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="message-image">
                <img
                    src={imageUrl}
                    alt={fileName}
                    onClick={() => {
                        // При клике открываем полное изображение
                        const fullImageUrl = fileId
                            ? `/api/files/${fileId}`
                            : imageUrl;
                        onImageClick && onImageClick({ ...file, url: fullImageUrl });
                    }}
                    onLoad={(e) => {
                        // Освобождаем объект URL после загрузки (только для blob)
                        if (imageUrl && imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(imageUrl);
                        }
                    }}
                    onError={(e) => {
                        console.error('Failed to load image:', imageUrl);
                        // Fallback: если превью не загрузилось, пробуем полное изображение
                        if (fileId && e.target.src.includes('/thumbnail')) {
                            console.warn('Thumbnail failed, loading full image');
                            e.target.src = `/api/files/${fileId}`;
                        } else {
                            // Показываем placeholder при полной ошибке
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="message-file">
                                    <div class="file-icon-large">📷</div>
                                    <div class="file-details">
                                        <div class="file-name-large">${fileName}</div>
                                        <div class="file-size-large">${formatFileSize(fileSize)}</div>
                                    </div>
                                </div>
                            `;
                        }
                    }}
                />
                {onAnalyze && fileId && (
                    <button
                        className="analyze-file-btn"
                        onClick={() => onAnalyze(file)}
                        title="Анализировать изображение"
                    >
                        🔍
                    </button>
                )}
            </div>
        );
    }

    // Для других типов файлов показываем иконку и информацию
    return (
        <div className="message-file">
            <div className="file-icon-large">
                {getFileIcon(fileType)}
            </div>
            <div className="file-details">
                <div className="file-name-large">{fileName}</div>
                <div className="file-size-large">{formatFileSize(fileSize)}</div>
                <div className="file-type">{fileType || 'Unknown'}</div>
            </div>
            {onAnalyze && fileId && (
                <button
                    className="analyze-file-btn"
                    onClick={() => onAnalyze(file)}
                    title="Анализировать файл"
                >
                    🔍
                </button>
            )}
        </div>
    );
};

export default MessageFile;