// src/pages/ChatPage/components/MessageFile.jsx
import React from 'react';
import { Image, FileText, Mic, File as FileIcon } from 'lucide-react';
import GeneratedImage from './GeneratedImage'; // ✅ ИМПОРТИРУЕМ НОВЫЙ КОМПОНЕНТ

const MessageFile = ({
                         file,
                         onAnalyze,
                         onImageClick,
                         onRegenerateImage // ✅ НОВЫЙ ПРОП для регенерации
                     }) => {
    // Безопасная проверка
    const fileType = file?.type || file?.file_type || '';
    const fileName = file?.original_name || file?.file_name || 'Файл';
    const fileSize = file?.size || file?.file_size || 0;
    const fileId = file?.file_id || null;

    // ✅ ПРОВЕРКА: Это сгенерированное DALL-E изображение?
    const isGeneratedImage = file?.isGenerated || file?.is_generated || false;
    const revisedPrompt = file?.revised_prompt || file?.revisedPrompt || null;
    const originalPrompt = file?.original_prompt || file?.originalPrompt || null;

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

    const isImage = fileType && fileType.startsWith('image/');

    // ✅ ЕСЛИ ЭТО СГЕНЕРИРОВАННОЕ ИЗОБРАЖЕНИЕ - используем специальный компонент
    if (isImage && isGeneratedImage) {
        let imageUrl;

        if (fileId) {
            imageUrl = `/api/files/${fileId}`;
        } else if (file.url) {
            imageUrl = file.url;
        } else if (file instanceof File) {
            imageUrl = URL.createObjectURL(file);
        } else {
            imageUrl = null;
        }

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
            <GeneratedImage
                imageUrl={imageUrl}
                revisedPrompt={revisedPrompt}
                originalPrompt={originalPrompt}
                fileName={fileName}
                onClick={onImageClick}
                onRegenerate={onRegenerateImage ? () => onRegenerateImage(file) : null}
            />
        );
    }

    // ✅ ОБЫЧНЫЕ ИЗОБРАЖЕНИЯ (загруженные пользователем)
    if (isImage) {
        let imageUrl;

        if (fileId) {
            imageUrl = `/api/files/${fileId}/thumbnail`;
        } else if (file.url) {
            imageUrl = file.url;
        } else if (file instanceof File) {
            imageUrl = URL.createObjectURL(file);
        } else {
            imageUrl = null;
        }

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
                        const fullImageUrl = fileId
                            ? `/api/files/${fileId}`
                            : imageUrl;
                        onImageClick && onImageClick({ ...file, url: fullImageUrl });
                    }}
                    onLoad={(e) => {
                        if (imageUrl && imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(imageUrl);
                        }
                    }}
                    onError={(e) => {
                        console.error('Failed to load image:', imageUrl);
                        if (fileId && e.target.src.includes('/thumbnail')) {
                            console.warn('Thumbnail failed, loading full image');
                            e.target.src = `/api/files/${fileId}`;
                        } else {
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

    // Для других типов файлов
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