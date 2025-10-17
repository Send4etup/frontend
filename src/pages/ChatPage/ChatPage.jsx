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
import ChatSettings from './components/ChatSettings/ChatSettings';
import { getDefaultSettings } from './components/ChatSettings/settingsConfig';


// Utils & Services
import { pageTransition, itemAnimation } from '../../utils/animations';
import {
    getChatMessages,
    sendMessage,
    sendMessageWithFiles,
    getAIResponseStream,
    savePartialAIResponse
} from "../../services/chatAPI.js";
import { getWelcomeMessage } from "../../utils/aiAgentsUtils.js";
import {
    saveMicrophonePermission,
    hasGrantedPermissionBefore,
    checkPermissionStatus
} from '../../utils/microphonePermission';

// Styles
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const location = useLocation();

    // Props from navigation
    const { chatType } = location.state || '';
    const { title } = location.state || 'ТоварищБот';
    const { agentPrompt } = location.state || 'Ты обычный помощник ученика';

    // State
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
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
    const attachmentButtonRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [chatSettings, setChatSettings] = useState(null);
    const [shouldSendMessage, setShouldSendMessage] = useState(false);

    // Microphone permission
    const [permissionStatus, setPermissionStatus] = useState('checking');
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const streamingControllerRef = useRef(null);

    // Эффекты для инициализации
    useEffect(() => {
        const initializeChat = async () => {
            if (!location.state) {
                // Нет state - просто загружаем сообщения
                loadMessages();
                return;
            }

            const { initialMessage, isToolDescription, attachedFiles } = location.state;

            // 1. Обработка описания инструмента (приоритет)
            if (isToolDescription) {
                const botMessage = {
                    id: 1,
                    role: 'assistant',
                    content: isToolDescription,
                    timestamp: new Date(),
                    isToolDescription: true
                };
                setMessages([botMessage]);

                // Очищаем state
                window.history.replaceState(
                    {
                        ...location.state,
                        attachedFiles: null,
                        initialMessage: null,
                        isToolDescription: null
                    },
                    ''
                );

                return;
            }

            // 2. Обработка файлов (если есть)
            if (attachedFiles && attachedFiles.length > 0) {
                setAttachedFiles(attachedFiles);
                setShouldSendMessage(true);
            }

            // 3. Обработка начального сообщения
            if (initialMessage) {
                setInputValue(initialMessage);
                setShouldSendMessage(true);
            }

            // 4. Если нет ни файлов, ни сообщения - загружаем историю
            if (!initialMessage && (!attachedFiles || attachedFiles.length === 0)) {
                loadMessages();
                return;
            }

            // 5. Очищаем state после обработки
            window.history.replaceState(
                {
                    ...location.state,
                    attachedFiles: null,
                    initialMessage: null,
                    isToolDescription: null
                },
                ''
            );
        };

        initializeChat();
    }, []);

    useEffect(() => {
        // Ждем пока inputValue обновится И флаг будет true
        if (shouldSendMessage && (inputValue || attachedFiles)) {
            // Небольшая задержка для уверенности (опционально)
            setTimeout(() => {
                handleSendMessage();
                // alert(32323)
                setShouldSendMessage(false); // ✅ Сбрасываем флаг
                setAttachedFiles([])
            }, 100);
        }
    }, [shouldSendMessage, inputValue]);

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

    useEffect(() => {
        // Загружаем настройки из localStorage
        const loadChatSettings = () => {
            try {
                const savedSettings = localStorage.getItem('chatSettings');
                if (savedSettings) {
                    const allSettings = JSON.parse(savedSettings);
                    const currentChatSettings = allSettings[chatId];

                    if (currentChatSettings) {
                        setChatSettings(currentChatSettings);
                    } else {
                        // Если настроек нет, используем дефолтные
                        const defaults = getDefaultSettings(chatType);
                        setChatSettings(defaults);
                    }
                } else {
                    // Если в localStorage ничего нет, используем дефолтные
                    const defaults = getDefaultSettings(chatType);
                    setChatSettings(defaults);
                }
            } catch (error) {
                console.error('Ошибка загрузки настроек:', error);
                const defaults = getDefaultSettings(chatType);
                setChatSettings(defaults);
            }
        };

        loadChatSettings();
    }, [chatId, chatType]);

    useEffect(() => {
        initializePermissions();
    }, []);

    const initializePermissions = async () => {
        // Проверяем, давал ли пользователь разрешение раньше
        const grantedBefore = hasGrantedPermissionBefore();

        if (grantedBefore) {
            setPermissionStatus('granted');
            setShowPermissionHelp(false);
        } else {
            // Проверяем актуальный статус
            const status = await checkPermissionStatus();
            setPermissionStatus(status === 'granted' ? 'granted' : 'prompt');
        }
    };

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

            // Запрашиваем доступ к микрофону
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,      // Подавление эха
                    noiseSuppression: true,      // Шумоподавление
                    autoGainControl: true,       // Автоматическая регулировка громкости
                    sampleRate: 48000,           // Качество записи
                }
            });

            saveMicrophonePermission(true);
            setPermissionStatus('granted');
            setShowPermissionHelp(false);

            // Проверяем поддержку формата
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
                console.warn('⚠️ opus не поддерживается, используем audio/webm');
            }

            const options = {
                mimeType: mimeType,
                audioBitsPerSecond: 164000  // Оптимально для речи
            };

            const recorder = new MediaRecorder(stream, options);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                    console.log(`📦 Получен chunk размером ${e.data.size} байт`);
                }
            };

            recorder.onstop = async () => {
                console.log('🛑 Запись остановлена, обработка...');

                // Останавливаем все треки (освобождаем микрофон)
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('🔇 Трек остановлен');
                });

                // Проверяем, что есть данные
                if (chunks.length === 0) {
                    console.error('❌ Нет данных для обработки');
                    setFileErrors(prev => [...prev, 'Не удалось записать аудио. Попробуйте еще раз.']);
                    return;
                }

                // Создаем blob из записанных кусков
                const audioBlob = new Blob(chunks, { type: mimeType });
                console.log(`✅ Создан audioBlob размером ${audioBlob.size} байт`);

                // Проверка размера
                if (audioBlob.size < 100) {
                    console.error('❌ Слишком маленький размер аудио');
                    setFileErrors(prev => [...prev, 'Запись слишком короткая. Попробуйте записать дольше.']);
                    return;
                }

                await transcribeAudio(audioBlob);
            };

            recorder.onerror = (event) => {
                console.error('❌ Ошибка MediaRecorder:', event.error);
                setFileErrors(prev => [...prev, 'Ошибка записи. Попробуйте еще раз.']);
            };

            setMediaRecorder(recorder);
            recorder.start(1000); // Собираем данные каждую секунду (более стабильно)
            setIsRecording(true);

            console.log('🎤 Запись началась');

            setTimeout(() => {
                if (recorder.state === 'recording') {
                    console.log('⏰ Автоматическая остановка записи через 60 сек');
                    recorder.stop();
                    setIsRecording(false);
                }
            }, 180000);

        } catch (error) {
            console.error('❌ Ошибка доступа к микрофону:', error);

            saveMicrophonePermission(false);

            // Определяем тип ошибки и показываем понятное сообщение
            let errorMessage = '';

            if (error.name === 'NotAllowedError') {
                errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках.';
                setPermissionStatus('denied');
                setShowPermissionHelp(true); // Показываем инструкцию
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Микрофон не найден. Проверьте подключение устройства.';
                setPermissionStatus('denied');
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Микрофон занят другим приложением. Закройте другие приложения.';
                setPermissionStatus('denied');
            } else {
                errorMessage = 'Не удалось получить доступ к микрофону. Попробуйте перезагрузить страницу.';
                setPermissionStatus('denied');
            }

            setFileErrors(prev => [...prev, errorMessage]);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        console.log('❌ Отмена записи голоса');

        // Останавливаем MediaRecorder без обработки
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            // Удаляем обработчик onstop, чтобы не запускать расшифровку
            mediaRecorder.onstop = null;

            // Останавливаем запись
            mediaRecorder.stop();

            // Останавливаем все треки микрофона
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('🔇 Трек микрофона остановлен');
                });
            }
        }

        // Сбрасываем состояния
        setIsRecording(false);
        setMediaRecorder(null);

    };

    const confirmRecording = () => {
        // Останавливаем запись (при этом сработает onstop обработчик с расшифровкой)
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            if (permissionStatus === 'denied') {
                setShowPermissionHelp(true);
                return;
            }

            await startRecording();
        }
    };

    const retryPermission = async () => {
        setShowPermissionHelp(false);
        await startRecording();
    };

    const transcribeAudio = async (audioBlob) => {
        try {
            setIsLoading(true);
            setIsTranscribing(true);


            // Создаем FormData для отправки
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', 'ru');  // Указываем язык явно

            // Добавляем контекстный промпт для улучшения точности
            const contextPrompt = "Это образовательный контент на русском языке о программировании, учебе и образовании.";
            formData.append('prompt', contextPrompt);

            // Отправляем на бэкенд
            const response = await fetch('http://localhost:3213/api/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Ошибка транскрибации: ${response.status}`);
            }

            const data = await response.json();

            if (data.text) {
                // ✅ Вставляем транскрибированный текст в поле ввода
                setInputValue(data.text);
                console.log('✅ Текст распознан:', data.text);
            } else {
                throw new Error('Текст не распознан');
            }

        } catch (error) {
            console.error('Ошибка транскрибации:', error);
            setFileErrors(prev => [...prev, `Не удалось распознать речь. Попробуйте еще раз.`]);
        } finally {
            setIsLoading(false);
            setIsTranscribing(false);
        }
    };

    // Функции для отправки сообщений
    const handleSendMessage = async () => {
        if (!inputValue.trim() && attachedFiles.length === 0) alert("bee");

        const modifiedPrompt = buildSystemPrompt();
        const temperature = chatSettings?.temperature || 0.7;


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
            setAttachedFiles([]);

            try {
                if (attachedFiles.length === 0) {
                    const sendResult = await sendMessage(text, chatId, chatType);

                    if (sendResult.success) {
                        const res = sendResult.data;

                        // Обновляем статус отправленного сообщения
                        setMessages(prev => prev.map(m => m.status === 'sending'
                            ? { ...m, id: res.message_id ?? m.id, status: 'sent', timestamp: res.timestamp ?? m.timestamp }
                            : m
                        ));

                        // Создаем пустое сообщение бота для streaming
                        const botMessageId = Date.now();
                        const botMessage = {
                            id: botMessageId,
                            role: 'assistant',
                            content: '',
                            timestamp: new Date(),
                            isStreaming: true
                        };

                        setMessages(prev => [...prev, botMessage]);
                        setStreamingMessageId(botMessageId);

                        // ✅ СОЗДАЕМ AbortController ДЛЯ ЭТОГО ЗАПРОСА
                        const controller = new AbortController();
                        streamingControllerRef.current = controller;

                        // Получаем streaming ответ от ИИ
                        try {
                            await getAIResponseStream(
                                text,
                                chatId,
                                {
                                    tool_type: chatType,
                                    agent_prompt: modifiedPrompt,  // ✅ ДОБАВИЛИ
                                    temperature: temperature        // ✅ ДОБАВИЛИ
                                },
                                (chunk) => {
                                    // Обновляем сообщение с каждым чанком
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === botMessageId
                                            ? { ...msg, content: msg.content + chunk }
                                            : msg
                                    ));
                                },
                                [], // fileIds пусто для текстовых сообщений
                                controller // ✅ ПЕРЕДАЕМ CONTROLLER
                            );

                            // Завершаем streaming
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? { ...msg, isStreaming: false }
                                    : msg
                            ));
                            setStreamingMessageId(null);
                            streamingControllerRef.current = null;

                        } catch (error) {
                            console.error('AI streaming error:', error);

                            // ✅ СПЕЦИАЛЬНАЯ ОБРАБОТКА ОТМЕНЫ
                            if (error.message === 'STREAMING_CANCELLED') {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMessageId
                                        ? { ...msg, content: msg.content + '\n\n[Генерация остановлена]', isStreaming: false }
                                        : msg
                                ));
                            } else {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMessageId
                                        ? { ...msg, content: 'Ошибка получения ответа. Попробуйте ещё раз.', isStreaming: false }
                                        : msg
                                ));
                            }

                            setStreamingMessageId(null);
                            streamingControllerRef.current = null;
                        }
                    }
                } else {
                    // АНАЛОГИЧНО ДЛЯ СООБЩЕНИЙ С ФАЙЛАМИ
                    const sendResult = await sendMessageWithFiles(text, optimisticMsg.files, chatId, chatType);

                    if (sendResult.success) {
                        const res = sendResult.data;

                        setMessages(prev => prev.map(m => m.status === 'sending'
                            ? {
                                ...m,
                                id: res.message_id ?? m.id,
                                status: 'sent',
                                timestamp: res.timestamp ?? m.timestamp,
                                files: res.uploaded_files || m.files
                            }
                            : m
                        ));

                        const botMessageId = Date.now();
                        const botMessage = {
                            id: botMessageId,
                            role: 'assistant',
                            content: '',
                            timestamp: new Date(),
                            isStreaming: true
                        };

                        setMessages(prev => [...prev, botMessage]);
                        setStreamingMessageId(botMessageId);

                        const fileIds = (res.uploaded_files || []).map(f => f.file_id);

                        // ✅ СОЗДАЕМ AbortController
                        const controller = new AbortController();
                        streamingControllerRef.current = controller;

                        try {
                            await getAIResponseStream(
                                text || "Проанализируй текст, извлеченный до этого из файла/файлов:",
                                chatId,
                                {
                                    tool_type: chatType,
                                    agent_prompt: modifiedPrompt,  // ✅ ДОБАВИЛИ
                                    temperature: temperature        // ✅ ДОБАВИЛИ
                                },
                                (chunk) => {
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === botMessageId
                                            ? { ...msg, content: msg.content + chunk }
                                            : msg
                                    ));
                                },
                                fileIds,
                                controller // ✅ ПЕРЕДАЕМ CONTROLLER
                            );

                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? { ...msg, isStreaming: false }
                                    : msg
                            ));
                            setStreamingMessageId(null);
                            streamingControllerRef.current = null;

                        } catch (error) {
                            console.error('AI streaming error:', error);

                            if (error.message === 'STREAMING_CANCELLED') {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMessageId
                                        ? { ...msg, content: msg.content + '\n\n[Генерация остановлена]', isStreaming: false }
                                        : msg
                                ));
                            } else {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMessageId
                                        ? { ...msg, content: 'Ошибка получения ответа. Попробуйте ещё раз.', isStreaming: false }
                                        : msg
                                ));
                            }

                            setStreamingMessageId(null);
                            streamingControllerRef.current = null;
                        }
                    }
                }

            } catch (error) {
                console.error('💬 Chat error:', error);
                setMessages(prev => [...prev, {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.'
                }]);
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

    const handleStopGeneration = async () => {
        console.log('🛑 Попытка остановить генерацию...');

        // Отменяем fetch-запрос
        if (streamingControllerRef.current) {
            streamingControllerRef.current.abort();
            console.log('✅ AbortController.abort() вызван');
        }

        // Получаем текущее накопленное содержимое сообщения
        let accumulatedContent = '';
        if (streamingMessageId) {
            const streamingMessage = messages.find(msg => msg.id === streamingMessageId);
            if (streamingMessage) {
                accumulatedContent = streamingMessage.content;
            }
        }

        // ✅ СОХРАНЯЕМ ЧАСТИЧНЫЙ ОТВЕТ В БД
        if (accumulatedContent.trim()) {
            console.log(`💾 Сохраняем частичный ответ (${accumulatedContent.length} символов)...`);

            try {
                const saveResult = await savePartialAIResponse(chatId, accumulatedContent);

                if (saveResult.success) {
                    console.log('✅ Частичный ответ сохранен в БД:', saveResult.data);

                    // Обновляем сообщение с ID из базы данных
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === streamingMessageId
                                ? {
                                    ...msg,
                                    id: saveResult.data.message_id, // ID из БД
                                    content: accumulatedContent + '\n\n[Генерация остановлена]',
                                    isStreaming: false
                                }
                                : msg
                        )
                    );
                } else {
                    console.error('❌ Не удалось сохранить частичный ответ:', saveResult.error);
                    // Всё равно обновляем UI
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === streamingMessageId
                                ? {
                                    ...msg,
                                    content: accumulatedContent + '\n\n[Генерация остановлена]',
                                    isStreaming: false
                                }
                                : msg
                        )
                    );
                }
            } catch (error) {
                console.error('❌ Ошибка при сохранении частичного ответа:', error);
                // Обновляем UI даже при ошибке
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === streamingMessageId
                            ? {
                                ...msg,
                                content: accumulatedContent + '\n\n[Генерация остановлена]',
                                isStreaming: false
                            }
                            : msg
                    )
                );
            }
        } else {
            // Если контент пустой, просто убираем сообщение
            setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
        }

        setStreamingMessageId(null);
        streamingControllerRef.current = null;
        setIsLoading(false);

        console.log('✅ Генерация остановлена и сохранена');
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
            setTimeout(() => {
                handleSendMessage();
            }, 500);

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
    const copyToClipboard = (ai_response) => {
        navigator.clipboard.writeText(ai_response);
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

    /**
     * Открытие модального окна настроек
     */
    const handleOpenSettings = () => {
        setShowSettings(true);
    };

    /**
     * Закрытие модального окна настроек
     */
    const handleCloseSettings = () => {
        setShowSettings(false);
    };

    /**
     * Сохранение настроек
     */
    const handleSaveSettings = (newSettings) => {
        try {
            // Обновляем состояние
            setChatSettings(newSettings);

            // Сохраняем в localStorage
            const savedSettings = localStorage.getItem('chatSettings');
            const allSettings = savedSettings ? JSON.parse(savedSettings) : {};

            allSettings[chatId] = newSettings;

            localStorage.setItem('chatSettings', JSON.stringify(allSettings));

            console.log('Настройки сохранены:', newSettings);
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            alert('Не удалось сохранить настройки');
        }
    };

    /**
     * Построение системного промпта с учетом пользовательских настроек
     * Применяет общие и специфичные настройки к базовому промпту агента
     */
    const buildSystemPrompt = () => {
        let systemPrompt = agentPrompt; // Базовый промпт из агента

        if (!chatSettings) return systemPrompt;

        // ===================================
        // ОБЩИЕ НАСТРОЙКИ (для всех типов)
        // ===================================

        // Длина ответа
        if (chatSettings.maxLength) {
            const lengthInstructions = {
                short: '\nДавай краткие и лаконичные ответы (1-3 предложения).',
                medium: '\nДавай ответы средней длины с необходимыми деталями.',
                detailed: '\nДавай подробные и развернутые ответы с примерами и пояснениями.'
            };
            systemPrompt += lengthInstructions[chatSettings.maxLength] || '';
        }

        // Язык общения
        if (chatSettings.language === 'en') {
            systemPrompt += '\nОтвечай на английском языке (English language).';
        }

        // ===================================
        // СПЕЦИФИЧНЫЕ НАСТРОЙКИ ПО ТИПАМ
        // ===================================

        switch (chatType) {
            // === ОБЩИЙ ЧАТ ===
            case 'general':
                if (chatSettings.responseStyle === 'friendly') {
                    systemPrompt += '\nИспользуй дружелюбный и теплый тон общения.';
                } else if (chatSettings.responseStyle === 'formal') {
                    systemPrompt += '\nИспользуй формальный и профессиональный стиль.';
                } else if (chatSettings.responseStyle === 'casual') {
                    systemPrompt += '\nОбщайся неформально, как друг с другом.';
                }
                break;

            // === СОЗДАНИЕ ИЗОБРАЖЕНИЙ ===
            case 'image':
                if (chatSettings.imageStyle) {
                    systemPrompt += `\nПредпочитаемый стиль изображений: ${chatSettings.imageStyle}.`;
                }
                if (chatSettings.aspectRatio) {
                    systemPrompt += `\nФормат изображения: ${chatSettings.aspectRatio}.`;
                }
                if (chatSettings.quality === 'hd') {
                    systemPrompt += '\nИспользуй настройки высокого качества (HD).';
                }
                if (chatSettings.detailLevel === 'simple') {
                    systemPrompt += '\nСоздавай простые промпты без излишних деталей.';
                } else if (chatSettings.detailLevel === 'detailed') {
                    systemPrompt += '\nСоздавай детальные промпты с описанием освещения, композиции и стиля.';
                }
                break;

            // === КОДИНГ ===
            case 'coding':
                if (chatSettings.withComments) {
                    systemPrompt += '\nВАЖНО: Добавляй подробные комментарии к коду на русском языке, объясняя что делает каждая часть.';
                } else {
                    systemPrompt += '\nПиши код без комментариев, только чистый код.';
                }

                if (chatSettings.codeStyle === 'clean') {
                    systemPrompt += '\nИспользуй принципы Clean Code: понятные имена переменных, короткие функции, минимум дублирования, читаемый код.';
                } else if (chatSettings.codeStyle === 'minimal') {
                    systemPrompt += '\nПиши максимально минималистичный и компактный код без лишних абстракций.';
                } else if (chatSettings.codeStyle === 'verbose') {
                    systemPrompt += '\nПиши подробный код с явными проверками, детальной обработкой ошибок и максимальной ясностью.';
                }

                if (chatSettings.defaultLanguage) {
                    const langMap = {
                        javascript: 'JavaScript',
                        python: 'Python',
                        java: 'Java',
                        cpp: 'C++',
                        csharp: 'C#',
                        go: 'Go',
                        rust: 'Rust'
                    };
                    systemPrompt += `\nИспользуй ${langMap[chatSettings.defaultLanguage]} в качестве основного языка для примеров, если не указано иное.`;
                }

                if (chatSettings.explainSteps) {
                    systemPrompt += '\nОбъясняй решение пошагово: что делаем, почему так, какой результат.';
                }
                break;

            // === БРЕЙНШТОРМ ===
            case 'brainstorm':
                if (chatSettings.ideasCount) {
                    const countMap = {
                        '3-5': '3-5',
                        '5-7': '5-7',
                        '8-10': '8-10'
                    };
                    systemPrompt += `\nГенерируй ${countMap[chatSettings.ideasCount]} разнообразных идей за раз.`;
                }

                if (chatSettings.creativityLevel === 'practical') {
                    systemPrompt += '\nФокусируйся на практичных и реализуемых идеях.';
                } else if (chatSettings.creativityLevel === 'wild') {
                    systemPrompt += '\nПредлагай смелые, необычные и креативные идеи, выходящие за рамки стандартного мышления.';
                }

                if (chatSettings.includeExamples) {
                    systemPrompt += '\nК каждой идее добавляй конкретный пример применения.';
                }
                break;

            // === ОТМАЗКИ ===
            case 'excuse':
                { const styleMap = {
                    formal: 'официальный и уважительный',
                    polite: 'вежливый и дипломатичный',
                    casual: 'неформальный и дружеский',
                    creative: 'креативный и оригинальный'
                };
                if (chatSettings.excuseStyle) {
                    systemPrompt += `\nИспользуй ${styleMap[chatSettings.excuseStyle]} стиль в формулировках.`;
                }

                if (chatSettings.variantsCount) {
                    systemPrompt += `\nПредлагай ${chatSettings.variantsCount} варианта отмазок разного тона.`;
                }
                break; }

            // === ОБЪЯСНЕНИЕ ТЕМ ===
            case 'explain_topic':
                if (chatSettings.explanationDepth === 'simple') {
                    systemPrompt += '\nОбъясняй максимально просто, как для начинающего. Только основы без углубления.';
                } else if (chatSettings.explanationDepth === 'deep') {
                    systemPrompt += '\nДавай глубокое объяснение с деталями, нюансами и дополнительными аспектами темы.';
                }

                if (chatSettings.useAnalogies) {
                    systemPrompt += '\nИспользуй аналогии и примеры из повседневной жизни для лучшего понимания.';
                }

                if (chatSettings.checkUnderstanding) {
                    systemPrompt += '\nЗадавай проверочные вопросы, чтобы убедиться в понимании материала.';
                }
                break;

            // === ПОДГОТОВКА К ЭКЗАМЕНАМ ===
            case 'exam_prep':
                if (chatSettings.subject) {
                    const subjectMap = {
                        math: 'математике',
                        physics: 'физике',
                        chemistry: 'химии',
                        biology: 'биологии',
                        history: 'истории',
                        literature: 'литературе',
                        russian: 'русскому языку',
                        english: 'английскому языку'
                    };
                    systemPrompt += `\nФокусируйся на подготовке по ${subjectMap[chatSettings.subject]}.`;
                }

                if (chatSettings.difficulty === 'basic') {
                    systemPrompt += '\nИспользуй базовый уровень сложности заданий.';
                } else if (chatSettings.difficulty === 'high') {
                    systemPrompt += '\nИспользуй задания повышенной сложности.';
                }

                if (chatSettings.includePractice) {
                    systemPrompt += '\nДобавляй тренировочные задания для закрепления материала.';
                }
                break;

            // === КОНСПЕКТЫ ===
            case 'make_notes':
                { const formatMap = {
                    bullets: 'маркированных списках',
                    paragraphs: 'связных параграфах',
                    outline: 'виде плана-схемы с подпунктами',
                    table: 'табличном формате'
                };
                if (chatSettings.format) {
                    systemPrompt += `\nСтруктурируй информацию в ${formatMap[chatSettings.format]}.`;
                }

                if (chatSettings.detailLevel === 'brief') {
                    systemPrompt += '\nДелай краткий конспект: только ключевые тезисы.';
                } else if (chatSettings.detailLevel === 'detailed') {
                    systemPrompt += '\nДелай подробный конспект со всеми важными деталями и пояснениями.';
                }

                if (chatSettings.highlightKey) {
                    systemPrompt += '\nВыделяй ключевые понятия и важные моменты (жирным текстом или эмодзи ⭐).';
                }
                break; }

            // === РЕШЕНИЕ ПО ФОТО ===
            case 'photo_solve':
                if (chatSettings.solutionStyle === 'hints') {
                    systemPrompt += '\nДавай только подсказки и наводящие вопросы, не решай полностью.';
                } else if (chatSettings.solutionStyle === 'teaching') {
                    systemPrompt += '\nРеши задачу пошагово с объяснением каждого шага, обучая методу решения.';
                } else if (chatSettings.solutionStyle === 'detailed') {
                    systemPrompt += '\nПредоставь полное детальное решение с пояснениями и проверкой.';
                }

                if (chatSettings.showSteps) {
                    systemPrompt += '\nРазбивай решение на четкие пронумерованные шаги.';
                }

                if (chatSettings.explainLogic) {
                    systemPrompt += '\nОбъясняй логику: почему используем именно этот метод, что дает каждый шаг.';
                }
                break;

            // === НАПИСАНИЕ РАБОТ ===
            case 'write_work':
                { if (chatSettings.workType) {
                    systemPrompt += `\nПомогай создавать ${chatSettings.workType === 'essay' ? 'сочинение' :
                        chatSettings.workType === 'report' ? 'доклад' :
                            chatSettings.workType === 'abstract' ? 'реферат' : 'статью'}.`;
                }

                const toneMapWork = {
                    formal: 'официальным академическим',
                    neutral: 'нейтральным информативным',
                    casual: 'разговорным легким'
                };
                if (chatSettings.tone) {
                    systemPrompt += `\nИспользуй ${toneMapWork[chatSettings.tone]} стиль изложения.`;
                }

                if (chatSettings.helpLevel === 'ideas') {
                    systemPrompt += '\nТолько предлагай идеи и тезисы, не пиши текст за ученика.';
                } else if (chatSettings.helpLevel === 'draft') {
                    systemPrompt += '\nПомогай создавать черновики с конкретными формулировками.';
                }
                break; }

            // === АНАЛИЗ ОШИБОК ===
            case 'analyze_mistake':
                if (chatSettings.analysisDepth === 'quick') {
                    systemPrompt += '\nДелай быстрый обзор ошибки: в чем проблема и как исправить.';
                } else if (chatSettings.analysisDepth === 'thorough') {
                    systemPrompt += '\nПроводи тщательный анализ: причина ошибки, правильный подход, типичные заблуждения.';
                }

                if (chatSettings.provideSimilar) {
                    systemPrompt += '\nПредлагай 2-3 похожих задания для тренировки и закрепления.';
                }

                if (chatSettings.explainConcepts) {
                    systemPrompt += '\nОбъясняй теоретические концепции, лежащие в основе задания.';
                }
                break;

            // === ПОДДЕРЖКА НАСТРОЕНИЯ ===
            case 'mood_support':
                { const supportMap = {
                    listening: 'слушающий и понимающий',
                    empathetic: 'эмпатичный и сочувствующий',
                    practical: 'практичный с конкретными советами',
                    motivating: 'мотивирующий и вдохновляющий'
                };
                if (chatSettings.supportStyle) {
                    systemPrompt += `\nИспользуй ${supportMap[chatSettings.supportStyle]} подход в общении.`;
                }

                if (chatSettings.offerTechniques) {
                    systemPrompt += '\nПредлагай техники релаксации, дыхательные упражнения и методы снятия стресса.';
                }

                if (chatSettings.askQuestions) {
                    systemPrompt += '\nЗадавай открытые вопросы, помогающие человеку осознать и проработать ситуацию.';
                }
                break; }
        }

        return systemPrompt;
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
                    onOpenSettings={handleOpenSettings}
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
                triggerRef={attachmentButtonRef}
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
                isTranscribing={isTranscribing}
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
                attachmentButtonRef={attachmentButtonRef}
                onStopRecording={toggleRecording}
                onCancelRecording={cancelRecording}
                onConfirmRecording={confirmRecording}
            />

            <ChatSettings
                isOpen={showSettings}
                onClose={handleCloseSettings}
                onSave={handleSaveSettings}
                chatType={chatType}
                currentSettings={chatSettings}
            />

            {showPermissionHelp && permissionStatus === 'denied' && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#2a2a2a',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid #ef4444',
                    zIndex: 1000,
                    maxWidth: '400px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}>
                    <h3 style={{
                        color: '#ef4444',
                        marginBottom: '16px',
                        fontSize: '20px'
                    }}>
                        ⚠️ Микрофон заблокирован
                    </h3>

                    <p style={{
                        color: '#fff',
                        marginBottom: '16px',
                        lineHeight: '1.5'
                    }}>
                        Чтобы записывать голос, разреши доступ к микрофону:
                    </p>

                    <ol style={{
                        color: '#fff',
                        textAlign: 'left',
                        margin: '16px 0',
                        paddingLeft: '20px',
                        lineHeight: '1.8'
                    }}>
                        <li>Нажми на иконку 🔒 в адресной строке</li>
                        <li>Найди "Микрофон"</li>
                        <li>Выбери "Разрешить"</li>
                        <li>Обнови страницу</li>
                    </ol>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '20px'
                    }}>
                        <button
                            onClick={retryPermission}
                            style={{
                                flex: 1,
                                background: '#578BF6',
                                color: '#fff',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Попробовать снова
                        </button>

                        <button
                            onClick={() => setShowPermissionHelp(false)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                color: '#fff',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                border: '1px solid #fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {showPermissionHelp && (
                <div
                    onClick={() => setShowPermissionHelp(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 999
                    }}
                />
            )}

        </motion.div>
    );
};

export default ChatPage;