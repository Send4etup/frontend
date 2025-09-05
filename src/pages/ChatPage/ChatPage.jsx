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
    const [streamingMessageId, setStreamingMessageId] = useState(null);
    const streamingControllerRef = useRef(null);
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
            content: inputValue || '',
            files: [...attachedFiles],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setAttachedFiles([]);
        setIsLoading(true);

        try {
            await sendMessage(newMessage.content, newMessage.files, chatId);

            const assistantMessageId = Date.now() + 1;
            setStreamingMessageId(assistantMessageId);

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
                chatId,
                files: newMessage.files
            };

            // Для остановки используем AbortController
            const controller = new AbortController();
            streamingControllerRef.current = controller;

            const streamResponse = await getAIResponseStream(newMessage.content, context, {
                signal: controller.signal
            });

            let accumulatedContent = '';

            for await (const chunk of streamResponse.readStream()) {
                if (controller.signal.aborted) break;

                if (chunk.type === 'chunk' && chunk.content) {
                    accumulatedContent += chunk.content;
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: accumulatedContent }
                                : msg
                        )
                    );
                } else if (chunk.type === 'end') {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantMessageId
                                ? { ...msg, isStreaming: false }
                                : msg
                        )
                    );
                    break;
                } else if (chunk.type === 'error') {
                    throw new Error(chunk.message);
                }
            }
        } catch (error) {
            console.error('Ошибка генерации:', error);
        } finally {
            setIsLoading(false);
            setStreamingMessageId(null);
            streamingControllerRef.current = null;
        }
    };

    const handleStopGeneration = () => {
        if (streamingControllerRef.current) {
            streamingControllerRef.current.abort();
        }

        if (streamingMessageId) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === streamingMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                )
            );
            setStreamingMessageId(null);
        }
        setIsLoading(false);
    };

    const handleResendLastUserMessage = async () => {
        // Находим последнее сообщение пользователя
        const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');

        if (!lastUserMessage) return; // если сообщений пользователя ещё нет

        const { content: messageContent, files: messageFiles = [] } = lastUserMessage;

        // Создаём новое сообщение пользователя для UI
        const newMessage = {
            id: Date.now(),
            type: 'user',
            content: messageContent,
            files: [...messageFiles],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setAttachedFiles([]);
        setIsLoading(true);

        try {
            await sendMessage(messageContent, messageFiles, chatId);

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
                files: messageFiles
            };

            const streamResponse = await getAIResponseStream(messageContent, context);
            let accumulatedContent = '';

            for await (const chunk of streamResponse.readStream()) {
                if (chunk.type === 'chunk' && chunk.content) {
                    accumulatedContent += chunk.content;
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    ));
                } else if (chunk.type === 'end') {
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
            console.error('Ошибка при повторной отправке:', error);
            const errorMessage = {
                id: Date.now() + 2,
                type: 'assistant',
                content: 'Не удалось повторно отправить сообщение пользователя. Попробуйте ещё раз.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
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
                                // initial={{ opacity: 0, y: 10 }}
                                // animate={{ opacity: 1, y: 0 }}
                                // exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    duration: 0.1,
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
                                            <div className="streaming-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="message-bottom-actions">
                                    {message.type === 'assistant' && (
                                        <div className="message-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => copyToClipboard(message.content)}
                                                title="Скопировать"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
                                                     xmlns="http://www.w3.org/2000/svg" className="icon">
                                                    <path
                                                        d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z">
                                                    </path>
                                                </svg>
                                            </button>

                                            <button
                                                className="action-btn"
                                                onClick={handleResendLastUserMessage}
                                                title="Повторить запрос"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
                                                     xmlns="http://www.w3.org/2000/svg" className="icon">
                                                    <path
                                                        d="M3.502 16.6663V13.3333C3.502 12.9661 3.79977 12.6683 4.16704 12.6683H7.50004L7.63383 12.682C7.93691 12.7439 8.16508 13.0119 8.16508 13.3333C8.16508 13.6547 7.93691 13.9227 7.63383 13.9847L7.50004 13.9984H5.47465C6.58682 15.2249 8.21842 16.0013 10 16.0013C13.06 16.0012 15.5859 13.711 15.9551 10.7513L15.9854 10.6195C16.0845 10.3266 16.3785 10.1334 16.6973 10.1732C17.0617 10.2186 17.3198 10.551 17.2745 10.9154L17.2247 11.2523C16.6301 14.7051 13.6224 17.3313 10 17.3314C8.01103 17.3314 6.17188 16.5383 4.83208 15.2474V16.6663C4.83208 17.0335 4.53411 17.3311 4.16704 17.3314C3.79977 17.3314 3.502 17.0336 3.502 16.6663ZM4.04497 9.24935C3.99936 9.61353 3.66701 9.87178 3.30278 9.8265C2.93833 9.78105 2.67921 9.44876 2.72465 9.08431L4.04497 9.24935ZM10 2.66829C11.9939 2.66833 13.8372 3.46551 15.1778 4.76204V3.33333C15.1778 2.96616 15.4757 2.66844 15.8428 2.66829C16.2101 2.66829 16.5079 2.96606 16.5079 3.33333V6.66634C16.5079 7.03361 16.2101 7.33138 15.8428 7.33138H12.5098C12.1425 7.33138 11.8448 7.03361 11.8448 6.66634C11.8449 6.29922 12.1426 6.0013 12.5098 6.0013H14.5254C13.4133 4.77488 11.7816 3.99841 10 3.99837C6.93998 3.99837 4.41406 6.28947 4.04497 9.24935L3.38481 9.16634L2.72465 9.08431C3.17574 5.46702 6.26076 2.66829 10 2.66829Z">
                                                    </path>
                                                </svg>
                                            </button>

                                            {/* Можно добавить другие кнопки */}
                                        </div>
                                    )}
                                    <span className="message-time">
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
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

                    <div id="messages-end" ref={messagesEndRef}/>
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
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <p>{error}</p>
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

                    {streamingMessageId ? (
                        <motion.button
                            className="stop-generation-btn"
                            onClick={handleStopGeneration}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            ❌
                        </motion.button>
                    ) : hasContent ? (
                        <motion.button
                            className="send-btn"
                            onClick={handleSendMessage}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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