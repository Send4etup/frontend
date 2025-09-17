import React from 'react';
import { Image, FileText, Mic, File as FileIcon } from 'lucide-react';

const MessageFile = ({ file, onAnalyze, onImageClick }) => {
    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return <Image size={20} />;
        if (fileType.includes('pdf')) return <FileText size={20} />;
        if (fileType.includes('document') || fileType.includes('text')) return <FileText size={20} />;
        if (fileType.includes('audio/')) return <Mic size={20}/>;
        return <FileIcon size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Если это изображение, показываем превью
    if (file.type.startsWith('image/')) {
        return (
            <div className="message-image">
                <img
                    src={file.url || URL.createObjectURL(file)}
                    alt={file.name}
                    onClick={() => onImageClick && onImageClick(file)}
                    onLoad={(e) => {
                        // Освобождаем объект URL после загрузки
                        if (file.url && file.url.startsWith('blob:')) {
                            URL.revokeObjectURL(file.url);
                        }
                    }}
                />
                <div className="image-info">
                    <span>{file.name}</span>
                    <span>{formatFileSize(file.size)}</span>
                </div>
                {onAnalyze && file.file_id && (
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
                {getFileIcon(file.type)}
            </div>
            <div className="file-details">
                <div className="file-name-large">{file.name}</div>
                <div className="file-size-large">{formatFileSize(file.size)}</div>
                <div className="file-type">{file.type || 'Unknown'}</div>
            </div>
            {onAnalyze && file.file_id && (
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