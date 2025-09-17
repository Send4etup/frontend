import React from 'react';
import { Image, FileText, Mic, X, File as FileIcon } from 'lucide-react';

const AttachedFile = ({ file, onRemove }) => {
    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return <Image size={16} />;
        if (fileType.includes('pdf')) return <FileText size={16} />;
        if (fileType.includes('document') || fileType.includes('text')) return <FileText size={16} />;
        if (fileType.includes('audio/')) return <Mic size={16} />
        return <FileIcon size={16} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="attached-file">
            <div className="file-icon">
                {getFileIcon(file.type)}
            </div>
            <div className="file-info">
                <div className="file-name" title={file.name}>
                    {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                </div>
                <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
            <button className="remove-file-btn" onClick={() => onRemove(file)}>
                <X size={14} />
            </button>
        </div>
    );
};

export default AttachedFile;