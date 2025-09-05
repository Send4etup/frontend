import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { useNotifications, NotificationContainer } from '../../components/Notification/Notification';
// import { validateFiles, formatFileSize, MAX_FILE_SIZE } from '../../utils/fileUtils';
import {
    ArrowLeft,
    Edit3,
    Send,
    Paperclip,
    Mic,
    MicOff,
    Image,
    FileText,
    Copy,
    Check,
    X,
    File as FileIcon,
    AlertCircle
} from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { pageTransition, itemAnimation } from '../../utils/animations';
import {sendMessage, getAIResponse, getChatHistory, getAIResponseStream} from '../../services/educationService';
import './ChatPage.css';

// Компонент модального окна для просмотра изображений
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
                    <button
                        className="image-modal-close"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>

                    <div className="image-modal-content">
                        <img
                            src={image.url || URL.createObjectURL(image)}
                            alt={image.name}
                            className="image-modal-img"
                        />
                        <div className="image-modal-info">
                            <span className="image-modal-name">{image.name}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Компонент для отображения прикрепленных файлов
const AttachedFile = ({ file, onRemove }) => {
    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return <Image size={16} />;
        if (fileType.includes('pdf')) return <FileText size={16} />;
        if (fileType.includes('document') || fileType.includes('text')) return <FileText size={16} />;
        if (fileType.includes('audio/')) return <Mic size={16} />
        return <FileIcon size={16} />;
    };
    console.log(file);
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

// Компонент для отображения файлов в сообщении
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

// Компонент для форматирования сообщений GPT (без изменений)
const MessageFormatter = ({ content }) => {
    const [copiedBlocks, setCopiedBlocks] = useState(new Set());

    const copyToClipboard = async (text, blockId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedBlocks(prev => new Set([...prev, blockId]));
            setTimeout(() => {
                setCopiedBlocks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(blockId);
                    return newSet;
                });
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatMessage = (text) => {
        const parts = [];
        let currentIndex = 0;
        let blockId = 0;

        const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
        const mathBlockRegex = /\\\[([\s\S]*?)\\\]/g;

        const matches = [];

        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            matches.push({
                type: 'code-block',
                start: match.index,
                end: match.index + match[0].length,
                language: match[1] || 'text',
                code: match[2].trim(),
                full: match[0]
            });
        }

        while ((match = mathBlockRegex.exec(text)) !== null) {
            matches.push({
                type: 'math-block',
                start: match.index,
                end: match.index + match[0].length,
                formula: match[1].trim(),
                full: match[0]
            });
        }

        matches.sort((a, b) => a.start - b.start);

        for (const match of matches) {
            if (currentIndex < match.start) {
                const textBefore = text.slice(currentIndex, match.start);
                parts.push(
                    <div key={`text-${currentIndex}`} className="message-text">
                        {formatInlineElements(textBefore)}
                    </div>
                );
            }

            if (match.type === 'code-block') {
                const currentBlockId = blockId++;
                parts.push(
                    <div key={`code-${currentBlockId}`} className="code-block-container">
                        <div className="code-block-header">
                            <span className="code-language">{match.language || 'text'}</span>
                            <button
                                onClick={() => copyToClipboard(match.code, currentBlockId)}
                                className="copy-button"
                            >
                                {copiedBlocks.has(currentBlockId) ? (
                                    <>
                                        <Check size={14} />
                                        <span>Скопировано</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        <span>Копировать</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="code-block">
                            <code className={`language-${match.language}`}>
                                {match.code}
                            </code>
                        </pre>
                    </div>
                );
            } else if (match.type === 'math-block') {
                parts.push(
                    <div key={`math-${blockId++}`} className="math-block">
                        <BlockMath math={match.formula} />
                    </div>
                );
            }

            currentIndex = match.end;
        }

        if (currentIndex < text.length) {
            const remainingText = text.slice(currentIndex);
            parts.push(
                <div key={`text-${currentIndex}`} className="message-text">
                    {formatInlineElements(remainingText)}
                </div>
            );
        }

        return parts.length > 0 ? parts : [
            <div key="default" className="message-text">
                {formatInlineElements(text)}
            </div>
        ];
    };

    const formatInlineElements = (text) => {
        const mathParts = text.split(/(\\\([^)]+\\\))/g);

        return mathParts.map((mathPart, mathIndex) => {
            if (mathPart.startsWith('\\(') && mathPart.endsWith('\\)')) {
                const formula = mathPart.slice(2, -2);
                return (
                    <InlineMath key={`math-${mathIndex}`} math={formula} />
                );
            }

            const latexParts = mathPart.split(/(\\\w+(?:\{[^}]+\})?|\\\w+)/g);

            return latexParts.map((latexPart, latexIndex) => {
                if (latexPart.match(/^\\\w+(?:\{[^}]+\})?$/) || latexPart.match(/^\\\w+$/)) {
                    try {
                        return (
                            <InlineMath
                                key={`${mathIndex}-latex-${latexIndex}`}
                                math={latexPart}
                            />
                        );
                    } catch (error) {
                        return (
                            <span key={`${mathIndex}-latex-${latexIndex}`} className="latex-fallback">
                                {latexPart}
                            </span>
                        );
                    }
                }

                const codeParts = latexPart.split(/(`[^`]+`)/g);

                return codeParts.map((codePart, codeIndex) => {
                    if (codePart.startsWith('`') && codePart.endsWith('`')) {
                        const code = codePart.slice(1, -1);
                        return (
                            <code key={`${mathIndex}-${latexIndex}-code-${codeIndex}`} className="inline-code">
                                {code}
                            </code>
                        );
                    }

                    return formatBoldText(codePart, `${mathIndex}-${latexIndex}-${codeIndex}`);
                });
            });
        });
    };

    const formatBoldText = (text, baseIndex) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                return <strong key={`${baseIndex}-bold-${index}`}>{boldText}</strong>;
            }

            return formatItalicText(part, `${baseIndex}-${index}`);
        });
    };

    const formatItalicText = (text, baseIndex) => {
        const parts = text.split(/(\*[^*]+\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                const italicText = part.slice(1, -1);
                return <em key={`${baseIndex}-italic-${index}`}>{italicText}</em>;
            }

            return formatHeaders(part, `${baseIndex}-${index}`);
        });
    };

    const formatHeaders = (text, baseIndex) => {
        const lines = text.split('\n');

        return lines.map((line, lineIndex) => {
            if (line.startsWith('#### ')) {
                return (
                    <h4 key={`${baseIndex}-h4-${lineIndex}`} className="message-header">
                        {line.slice(5)}
                    </h4>
                );
            } else if (line.startsWith('### ')) {
                return (
                    <h3 key={`${baseIndex}-h3-${lineIndex}`} className="message-header">
                        {line.slice(4)}
                    </h3>
                );
            } else if (line.startsWith('## ')) {
                return (
                    <h2 key={`${baseIndex}-h2-${lineIndex}`} className="message-header">
                        {line.slice(3)}
                    </h2>
                );
            } else if (line.startsWith('# ')) {
                return (
                    <h1 key={`${baseIndex}-h1-${lineIndex}`} className="message-header">
                        {line.slice(2)}
                    </h1>
                );
            }

            return formatLists(line, `${baseIndex}-line-${lineIndex}`);
        });
    };

    const formatLists = (text, baseIndex) => {
        if (text.match(/^-\s/)) {
            return (
                <div key={baseIndex} className="list-item">
                    <span className="list-marker">•</span>
                    <span className="list-content">{text.slice(2)}</span>
                </div>
            );
        }

        return (
            <React.Fragment key={baseIndex}>
                {text}
                <br />
            </React.Fragment>
        );
    };

    return (
        <div className="formatted-message">
            {formatMessage(content)}
        </div>
    );
};

const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachmentMenu, setAttachmentMenu] = useState(false);
    const [chatTitle, setChatTitle] = useState('ТоварищБот');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const [fileErrors, setFileErrors] = useState([]);
    const [modalImage, setModalImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordTime, setRecordTime] = useState(0); // время записи в секундах
    const recordIntervalRef = useRef(null);

    // const { notifications, showError, showSuccess, showWarning, removeNotification } = useNotifications();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = []; // локальный массив для накопления данных
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data); // записываем сразу в локальный массив
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                setAttachedFiles((prev) => [...prev, audioFile]);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Ошибка доступа к микрофону:", err);
            setFileErrors(prev => [...prev, "Не удалось получить доступ к микрофону"]);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                });
            }
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(scrollToBottom, 300);
            return () => clearTimeout(timer);
        }
    }, [messages.length]);

    // Обработчики модального окна
    const handleImageClick = (image) => {
        setModalImage(image);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    // Обработка paste событий для вставки файлов из буфера обмена
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const files = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                        files.push(file);
                    }
                }
            }

            if (files.length > 0) {
                setAttachedFiles(prev => [...prev, ...files]);
                e.preventDefault();
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    useEffect(() => {
        if (location.state) {
            const { initialMessage, toolTitle, isToolDescription, isRegularMessage } = location.state;

            if (toolTitle) {
                setChatTitle(toolTitle);
            }

            if (initialMessage) {
                if (isToolDescription) {
                    const botMessage = {
                        id: 1,
                        type: 'assistant',
                        content: initialMessage,
                        timestamp: new Date(),
                        isToolDescription: true
                    };
                    setMessages([botMessage]);
                } else if (isRegularMessage) {
                    handleInitialMessage(initialMessage);
                } else {
                    const userMessage = {
                        id: 1,
                        type: 'user',
                        content: initialMessage,
                        timestamp: new Date()
                    };
                    setMessages([userMessage]);

                    setTimeout(() => {
                        const aiResponse = {
                            id: 2,
                            type: 'assistant',
                            content: 'Отлично! Давайте начнём работу. Расскажите подробнее, с чем именно вам нужна помощь?',
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, aiResponse]);
                    }, 1000);
                }
            }
        }
    }, [location.state]);

    const handleInitialMessage = async (message) => {
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages([userMessage]);
        setIsLoading(true);

        try {
            const response = await getAIResponse(message, {
                chatHistory: [],
                chatId: chatId
            });

            const aiResponse = {
                id: Date.now() + 1,
                type: 'assistant',
                content: response.message || 'Получил ваше сообщение! Обрабатываю запрос...',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Failed to get AI response:', error);

            const errorResponse = {
                id: Date.now() + 1,
                type: 'assistant',
                content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileAttach = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;

        if (type === 'image') {
            input.accept = 'image/*';
        } else if (type === 'document') {
            input.accept = '.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv';
        } else if (type === 'audio') {
            input.accept = '.wav,.mp3,.ogg,.webm';
        }

        input.onchange = (event) => {
            const files = Array.from(event.target.files);

            const validFiles = files.filter(file => {
                const isValid = file.size <= 50 * 1024 * 1024; // 50MB
                if (!isValid) {
                    setFileErrors(prev => [...prev, `Файл "${file.name}" слишком большой`]);
                }
                return isValid;
            });

            if (validFiles.length > 0) {
                setAttachedFiles(prev => [...prev, ...validFiles]);
            }

            if (validFiles.length !== files.length) {
                setTimeout(() => setFileErrors([]), 5000);
            }
        };

        input.click();
    };


    const handleSendMessage = async () => {
        if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;

        const newMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue || (attachedFiles.length > 0 ? '' : ''),
            files: [...attachedFiles],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        const currentMessage = inputValue;
        const currentFiles = [...attachedFiles];

        // Очищаем поля ввода
        setInputValue('');
        setAttachedFiles([]);
        setIsLoading(true);

        try {
            // Отправляем сообщение на сервер с файлами
            await sendMessage(currentMessage, currentFiles, chatId);

            // Создаем пустое сообщение ассистента для потокового обновления
            const assistantMessageId = Date.now() + 1;
            const initialAssistantMessage = {
                id: assistantMessageId,
                type: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };

            setMessages(prev => [...prev, initialAssistantMessage]);

            const context = {
                chatHistory: messages,
                chatId: chatId,
                toolType: location.state?.actionType,
                files: currentFiles
            };

            // Получаем потоковый ответ
            const streamResponse = await getAIResponseStream(currentMessage, context);
            let accumulatedContent = '';

            for await (const chunk of streamResponse.readStream()) {
                if (chunk.type === 'chunk' && chunk.content) {
                    accumulatedContent += chunk.content;

                    // Обновляем сообщение в реальном времени
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    ));
                } else if (chunk.type === 'end') {
                    // Завершаем streaming
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, isStreaming: false }
                            : msg
                    ));
                    break;
                } else if (chunk.type === 'error') {
                    throw new Error(chunk.message);
                }
            }

        } catch (error) {
            console.error('Failed to send message or get streaming response:', error);

            // В случае ошибки показываем fallback
            const errorMessageId = Date.now() + 2;
            const errorResponse = {
                id: errorMessageId,
                type: 'assistant',
                content: 'Временно использую заглушку. Ваше сообщение получено, но ответ от ИИ недоступен.',
                timestamp: new Date()
            };

            setMessages(prev => {
                // Убираем возможное streaming сообщение и добавляем ошибку
                const filteredMessages = prev.filter(msg => !msg.isStreaming);
                return [...filteredMessages, errorResponse];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Простая валидация без использования утилит (для демонстрации)
            const validFiles = files.filter(file => {
                const isValid = file.size <= 50 * 1024 * 1024; // 50MB
                if (!isValid) {
                    setFileErrors(prev => [...prev, `Файл "${file.name}" слишком большой`]);
                }
                return isValid;
            });

            // Добавляем файлы к уже прикрепленным
            setAttachedFiles(prev => [...prev, ...validFiles]);

            // Очищаем ошибки через 5 секунд
            if (validFiles.length !== files.length) {
                setTimeout(() => setFileErrors([]), 5000);
            }

            // Закрываем меню вложений после выбора файла
            setAttachmentMenu(false);
        }
        // Очищаем input для повторного выбора файлов
        event.target.value = '';
    };

    const handleRemoveFile = (fileToRemove) => {
        setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleAnalyzeFile = async (file) => {
        try {
            if (!file.file_id) {
                setFileErrors(prev => [...prev, 'Файл не содержит ID для анализа']);
                return;
            }

            setIsLoading(true);

            // Показываем сообщение о начале анализа
            const analysisMessage = {
                id: Date.now(),
                type: 'user',
                content: `🔍 Анализирую файл: ${file.name}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, analysisMessage]);

            // Вызываем анализ файла (импортируем из educationService)
            const { analyzeFile } = await import('../../services/educationService');
            const analysis = await analyzeFile(file.file_id, 'Подробно проанализируй этот файл');

            // Добавляем результат анализа
            const resultMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: analysis.analysis,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, resultMessage]);

        } catch (error) {
            console.error('File analysis error:', error);
            setFileErrors(prev => [...prev, `Ошибка анализа файла ${file.name}`]);

            // Добавляем сообщение об ошибке
            const errorMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: `Извините, не удалось проанализировать файл "${file.name}". Попробуйте позже.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Drag & Drop functionality
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);

        if (dragCounter === 1) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
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
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'application/rtf'
                ].includes(file.type);

                return isImage || isDocument;
            });

            if (supportedFiles.length > 0) {
                setAttachedFiles(prev => [...prev, ...supportedFiles]);
            }

            // Показываем предупреждение если некоторые файлы не поддерживаются
            if (supportedFiles.length !== files.length) {
                const unsupportedCount = files.length - supportedFiles.length;
                setFileErrors(prev => [...prev, `${unsupportedCount} файл(ов) не поддерживается`]);
                setTimeout(() => setFileErrors([]), 5000);
            }

            e.dataTransfer.clearData();
        }
    };

    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
            console.log('Начало записи голоса');
        } else {
            console.log('Остановка записи голоса');
            stopRecording();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    // Проверяем, есть ли контент для отправки
    const hasContent = inputValue.trim() || attachedFiles.length > 0;

    return (
        <motion.div
            className="chat-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Модальное окно для просмотра изображений */}
            <ImageModal
                isOpen={isModalOpen}
                image={modalImage}
                onClose={closeModal}
            />

            {/* Хедер чата */}
            <motion.div
                className="chat-header"
                variants={itemAnimation}
            >
                <motion.button
                    className=""
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ArrowLeft className="icon" />
                </motion.button>

                <h1 className="chat-title">{chatTitle}</h1>
            </motion.div>

            {/* Область сообщений */}
            <motion.div
                className="messages-container"
                variants={itemAnimation}
            >
                <div className="messages-list">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                className={`message ${message.type} ${message.isToolDescription ? 'tool-description' : ''} ${message.isStreaming ? 'streaming' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index > messages.length - 2 ? 0.1 : 0
                                }}
                                layout
                            >
                                <div className="message-content">
                                    {/* Файлы в сообщении */}
                                    {message.files && message.files.length > 0 && (
                                        <div className="message-files">
                                            {message.files.map((file, fileIndex) => (
                                                <MessageFile
                                                    key={fileIndex}
                                                    file={file}
                                                    onAnalyze={message.type === 'user' ? handleAnalyzeFile : null}
                                                    onImageClick={handleImageClick}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Текстовое содержимое */}
                                    {message.content && (
                                        <>
                                            {message.isToolDescription ? (
                                                <div
                                                    className="tool-description-content"
                                                    dangerouslySetInnerHTML={{
                                                        __html: message.content
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                            .replace(/\n/g, '<br>')
                                                    }}
                                                />
                                            ) : message.type === 'assistant' ? (
                                                <MessageFormatter content={message.content} />
                                            ) : (
                                                <p>{message.content}</p>
                                            )}
                                        </>
                                    )}

                                    {message.isStreaming && (
                                        <div className="streaming-indicator">
                                            <span>генерирую ответ  </span>
                                            <div className="streaming-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="message-time">
                                    {formatTime(message.timestamp)}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/*{isLoading && (*/}
                    {/*    <motion.div*/}
                    {/*        className="message assistant typing"*/}
                    {/*        initial={{ opacity: 0, y: 10 }}*/}
                    {/*        animate={{ opacity: 1, y: 0 }}*/}
                    {/*        exit={{ opacity: 0, y: -10 }}*/}
                    {/*        layout*/}
                    {/*    >*/}
                    {/*        <div className="typing-indicator">*/}
                    {/*            <span></span>*/}
                    {/*            <span></span>*/}
                    {/*            <span></span>*/}
                    {/*        </div>*/}
                    {/*    </motion.div>*/}
                    {/*)}*/}

                    <div id="messages-end" ref={messagesEndRef} />
                </div>
            </motion.div>

            {/* Меню вложений */}
            <AnimatePresence>
                {attachmentMenu && (
                    <motion.div
                        className="attachment-menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <motion.button
                            className="attachment-btn"
                            onClick={() => handleFileAttach('image')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image className="icon" />
                            <span>Изображения</span>
                        </motion.button>
                        <motion.button
                            className="attachment-btn"
                            onClick={() => handleFileAttach('document')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileText className="icon" />
                            <span>Документы</span>
                        </motion.button>
                        <motion.button
                            className="attachment-btn"
                            onClick={() => handleFileAttach('audio')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Mic className="icon" />
                            <span>Аудио</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Уведомления об ошибках */}
            <AnimatePresence>
                {fileErrors.length > 0 && (
                    <motion.div
                        className="file-errors-container"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {fileErrors.map((error, index) => (
                            <motion.div
                                key={index}
                                className="file-error-notification"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                                <button
                                    onClick={() => setFileErrors(prev => prev.filter((_, i) => i !== index))}
                                    className="error-close-btn"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Прикрепленные файлы */}
            <AnimatePresence>
                {attachedFiles.length > 0 && (
                    <motion.div
                        className="attached-files-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="attached-files-list">
                            {attachedFiles.map((file, index) => (
                                <AttachedFile
                                    key={`${file.name}-${index}`}
                                    file={file}
                                    onRemove={handleRemoveFile}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Инпут для сообщений */}
            <motion.div
                className="chat-input-container"
                variants={itemAnimation}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className={`chat-input-wrapper ${isDragOver ? 'drag-over' : ''}`}>
                    {isDragOver && (
                        <div className="drag-drop-overlay">
                            Отпустите файлы для прикрепления
                        </div>
                    )}
                    <motion.button
                        className="attachment-toggle-btn"
                        onClick={() => setAttachmentMenu(!attachmentMenu)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Paperclip className="icon" />
                    </motion.button>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={attachedFiles.length > 0 ? "Добавьте описание к файлам..." : "Сообщение"}
                        className="chat-input"
                        disabled={isLoading}
                    />

                    {hasContent ? (
                        <motion.button
                            className="send-btn"
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Send className="icon" />
                        </motion.button>
                    ) : (
                        <motion.button
                            className={`voice-btn ${isRecording ? 'recording' : ''}`}
                            onClick={toggleRecording}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isRecording ? <MicOff className="icon" /> : <Mic className="icon" />}
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatPage;