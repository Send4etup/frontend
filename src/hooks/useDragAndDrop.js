// hooks/useDragAndDrop.js
import { useState, useCallback } from 'react';

export const useDragAndDrop = (onFilesDropped) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);

        if (dragCounter === 1) {
            setIsDragOver(false);
        }
    }, [dragCounter]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragOver(false);
        setDragCounter(0);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);

            // Фильтруем поддерживаемые типы файлов
            const supportedFiles = files.filter(file => {
                const isImage = file.type.startsWith('image/');
                const isDocument = [
                    "text/plain",          // txt
                    "application/rtf",     // rtf
                    "application/pdf",     // pdf
                    "application/msword",  // doc
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // docx
                    "application/vnd.ms-excel",  // xls
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  // xlsx
                    "text/csv"             // csv
                ].includes(file.type);
                const isAudio = file.type.startsWith('audio/');

                return isImage || isDocument || isAudio;
            });

            if (supportedFiles.length > 0) {
                onFilesDropped(supportedFiles);
            }

            e.dataTransfer.clearData();
        }
    }, [onFilesDropped]);

    const resetDragState = useCallback(() => {
        setIsDragOver(false);
        setDragCounter(0);
    }, []);

    return {
        isDragOver,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
        resetDragState,
    };
};