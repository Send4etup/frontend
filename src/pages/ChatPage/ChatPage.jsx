import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Components
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import AttachmentMenu from './components/AttachmentMenu';
import ErrorNotifications from './components/ErrorNotifications';
import AttachedFilesList from './components/AttachedFilesList';
import ChatInput from './components/ChatInput';
import ImageModal from './components/ImageModal';

// Utils & Services
import { pageTransition, itemAnimation } from '../../utils/animations';
import { getChatMessages, sendMessage, sendMessageWithFiles } from "../../services/chatAPI.js";
import { getWelcomeMessage } from "../../utils/aiAgentsUtils.js";

// Styles
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const location = useLocation();

    // Props from navigation
    const { chatType } = location.state || '';
    const { title } = location.state || 'ТоварищБот';
    const { toolConfig } = location.state || 'Помощник';
    const { agentPrompt } = location.state || 'Ты обычный помощник ученика';

    // State
    const [chat, setChat] = useState({});
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachmentMenu, setAttachmentMenu] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const [fileErrors, setFileErrors] = useState([]);
    const [modalImage, setModalImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [streamingMessageId, setStreamingMessageId] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordTime, setRecordTime] = useState(0);

    // Refs
    const messagesEndRef = useRef(null);
    const streamingControllerRef = useRef(null);
    const recordIntervalRef = useRef(null);

    // Эффекты для инициализации
    useEffect(() => {
        if (location.state) {
            const { initialMessage, isToolDescription, isRegularMessage, attachedFiles } = location.state;

            // Если есть файлы, не обрабатываем initialMessage здесь
            if (attachedFiles && attachedFiles.length > 0) {
                return; // Файлы обработаются в другом useEffect
            }

            if (initialMessage) {
                if (isToolDescription) {
                    const botMessage = {
                        id: 1,
                        role: 'assistant',
                        content: initialMessage,
                        timestamp: new Date(),
                        isToolDescription: true
                    };
                    setMessages([botMessage]);
                } else {
                    setInputValue(initialMessage);
                    setTimeout(() => handleSendMessage(), 0);
                }
            } else {
                loadMessages();
            }
        } else {
            loadMessages();
        }
    }, []);

    // Эффект для обработки прикрепленных файлов из навигации
    useEffect(() => {
        if (location.state?.attachedFiles && location.state.attachedFiles.length > 0) {
            setAttachedFiles(location.state.attachedFiles);

            // Если есть initialMessage, устанавливаем его
            if (location.state.initialMessage) {
                setInputValue(location.state.initialMessage);
            }

            // Очищаем state чтобы при перезагрузке не дублировались файлы
            window.history.replaceState({
                ...location.state,
                attachedFiles: null,
                initialMessage: null
            }, '');
        }
    }, [location.state]);

    // Скролл до конца сообщений
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(scrollToBottom, 300);
            return () => clearTimeout(timer);
        }
    }, [messages.length]);

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

    // Автоматическая отправка после остановки записи
    useEffect(() => {
        // Если есть аудио файлы и input пустой, отправляем автоматически
        if (attachedFiles.length > 0 &&
            attachedFiles.some(file => file.type.startsWith('audio/')) &&
            !inputValue.trim() &&
            !isRecording) {

            // Небольшая задержка для визуального эффекта
            const timer = setTimeout(() => {
                handleSendMessage();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [attachedFiles, isRecording]);

    // Функции загрузки сообщений
    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const response = await getChatMessages(chatId);
            const dbMessages = response.data;

            if (!response.success) {
                console.error("Ошибка API:", response.error);
                setMessages([getWelcomeMessageForChat()]);
                return;
            }

            if (dbMessages.length === 0) {
                const welcomeMsg = getWelcomeMessageForChat();
                setMessages([welcomeMsg]);
            } else {
                setMessages(dbMessages);
            }
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getWelcomeMessageForChat = () => {
        return getWelcomeMessage(chatType);
    };

    // Функции для работы с файлами
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
        setAttachmentMenu(false);
    };

    const handleRemoveFile = (fileToRemove) => {
        setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    // Функции для работы с аудио
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
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

    const toggleRecording = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    // Функции для отправки сообщений
    const handleSendMessage = async () => {
        if (!inputValue.trim() && attachedFiles.length === 0) return;

        const text = inputValue.trim();

        try {
            const optimisticMsg = {
                role: 'user',
                content: text,
                timestamp: new Date().toISOString(),
                files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
                status: 'sending'
            };

            setMessages(prev => [...prev, optimisticMsg]);
            setInputValue('');
            setIsLoading(true);

            try {
                if (attachedFiles.length === 0) {
                    const sendResult = await sendMessage(text, chatId, chatType);

                    if (sendResult.success){
                        const res = sendResult.data;

                        setMessages(prev => prev.map(m => m.id === res.message_id
                            ? { ...m, id: res.message_id ?? m.id, status: 'sent', timestamp: res.timestamp ?? m.timestamp }
                            : m
                        ));
                    }
                } else {
                    const sendResult = await sendMessageWithFiles(text, optimisticMsg.files, chatId, chatType)
                }

            } catch (error) {
                console.error('💬 Chat error:', error);
                setMessages(prev => [...prev, {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.' }]);

            } finally {
                setIsLoading(false);
            }

            setAttachedFiles([]);

        } catch (error) {
            console.error('💬 Chat error:', error);

            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Функции для работы с интерфейсом
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
        const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
        if (!lastUserMessage) return;

        const { content: messageContent, files: messageFiles = [] } = lastUserMessage;

        const newMessage = {
            id: Date.now(),
            role: 'user',
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
            // Добавить логику стриминга ответа
        } catch (error) {
            console.error('Ошибка при повторной отправке:', error);
            const errorMessage = {
                id: Date.now() + 2,
                role: 'assistant',
                content: 'Не удалось повторно отправить сообщение пользователя. Попробуйте ещё раз.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeFile = async (file) => {
        try {
            if (!file.file_id) {
                setFileErrors(prev => [...prev, 'Файл не содержит ID для анализа']);
                return;
            }

            setIsLoading(true);

            const analysisMessage = {
                id: Date.now(),
                role: 'user',
                content: `🔍 Анализирую файл: ${file.name}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, analysisMessage]);

            // Здесь должен быть вызов анализа файла
            // const analysis = await analyzeFile(file.file_id, 'Подробно проанализируй этот файл');

        } catch (error) {
            console.error('File analysis error:', error);
            setFileErrors(prev => [...prev, `Ошибка анализа файла ${file.name}`]);
        } finally {
            setIsLoading(false);
        }
    };

    // Drag & Drop функции
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

            if (supportedFiles.length !== files.length) {
                const unsupportedCount = files.length - supportedFiles.length;
                setFileErrors(prev => [...prev, `${unsupportedCount} файл(ов) не поддерживается`]);
                setTimeout(() => setFileErrors([]), 5000);
            }

            e.dataTransfer.clearData();
        }
    };

    // Модальные окна
    const handleImageClick = (image) => {
        setModalImage(image);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    // Утилиты
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return '';
        }
    };

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
            <motion.div variants={itemAnimation}>
                <ChatHeader
                    title={title}
                    chatId={chatId}
                    chatType={chatType}
                    agentPrompt={agentPrompt}
                    onNavigateBack={() => navigate(-1)}
                />
            </motion.div>

            {/* Область сообщений */}
            <motion.div
                className="messages-container"
                variants={itemAnimation}
            >
                <MessageList
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    onAnalyzeFile={handleAnalyzeFile}
                    onImageClick={handleImageClick}
                    onCopyMessage={copyToClipboard}
                    onResendMessage={handleResendLastUserMessage}
                    formatDateTime={formatDateTime}
                />
            </motion.div>

            {/* Меню вложений */}
            <AttachmentMenu
                isOpen={attachmentMenu}
                onFileAttach={handleFileAttach}
                onClose={() => setAttachmentMenu(false)}
            />

            {/* Уведомления об ошибках */}
            <ErrorNotifications
                fileErrors={fileErrors}
                onRemoveError={(index) => setFileErrors(prev => prev.filter((_, i) => i !== index))}
            />

            {/* Прикрепленные файлы */}
            <AttachedFilesList
                attachedFiles={attachedFiles}
                onRemoveFile={handleRemoveFile}
            />

            {/* Инпут для сообщений */}
            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                attachedFiles={attachedFiles}
                isDragOver={isDragOver}
                isLoading={isLoading}
                isRecording={isRecording}
                streamingMessageId={streamingMessageId}
                onSendMessage={handleSendMessage}
                onToggleAttachment={() => setAttachmentMenu(!attachmentMenu)}
                onToggleRecording={toggleRecording}
                onStopGeneration={handleStopGeneration}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />
        </motion.div>
    );
};

export default ChatPage;