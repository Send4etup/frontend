// utils/fileUtils.js

export const SUPPORTED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_FILES_COUNT = 10;

export const validateFile = (file) => {
    const errors = [];

    // Проверка типа файла
    const allSupportedTypes = [...SUPPORTED_FILE_TYPES.images, ...SUPPORTED_FILE_TYPES.documents];
    if (!allSupportedTypes.includes(file.type)) {
        errors.push(`Тип файла "${file.type}" не поддерживается`);
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
        errors.push(`Файл превышает максимальный размер ${formatFileSize(MAX_FILE_SIZE)}`);
    }

    // Проверка имени файла
    if (!file.name || file.name.trim() === '') {
        errors.push('Недопустимое имя файла');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateFiles = (files) => {
    if (files.length > MAX_FILES_COUNT) {
        return {
            isValid: false,
            errors: [`Можно прикрепить максимум ${MAX_FILES_COUNT} файлов`]
        };
    }

    const allErrors = [];
    const validFiles = [];

    files.forEach((file, index) => {
        const validation = validateFile(file);
        if (validation.isValid) {
            validFiles.push(file);
        } else {
            allErrors.push(`Файл ${index + 1} (${file.name}): ${validation.errors.join(', ')}`);
        }
    });

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        validFiles
    };
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('document') || fileType.includes('word')) return 'file-text';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'file-spreadsheet';
    if (fileType.includes('text')) return 'file-text';
    return 'file';
};

export const createFilePreview = (file) => {
    return new Promise((resolve, reject) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } else {
            resolve(null); // Для неизображений возвращаем null
        }
    });
};

export const generateFileId = (file) => {
    return `${file.name}-${file.size}-${file.lastModified || Date.now()}`;
};

export const isImageFile = (file) => {
    return SUPPORTED_FILE_TYPES.images.includes(file.type);
};

export const isDocumentFile = (file) => {
    return SUPPORTED_FILE_TYPES.documents.includes(file.type);
};

export const getFileTypeCategory = (file) => {
    if (isImageFile(file)) return 'image';
    if (isDocumentFile(file)) return 'document';
    return 'unknown';
};

export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Вычисляем новые размеры
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Рисуем изображение на canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Конвертируем в blob
            canvas.toBlob(
                (blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                },
                file.type,
                quality
            );
        };

        img.src = URL.createObjectURL(file);
    });
};

// Функция для группировки файлов по типу
export const groupFilesByType = (files) => {
    return files.reduce((groups, file) => {
        const category = getFileTypeCategory(file);
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(file);
        return groups;
    }, {});
};