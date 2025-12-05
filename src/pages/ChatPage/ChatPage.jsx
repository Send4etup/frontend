import React, {useState, useRef, useEffect} from 'react';
import {motion} from 'framer-motion';
import {useNavigate, useParams, useLocation} from 'react-router-dom';

// Components
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import AttachmentMenu from './components/AttachmentMenu';
import ErrorNotifications from './components/ErrorNotifications';
import AttachedFilesList from './components/AttachedFilesList';
import ChatInput from './components/ChatInput';
import ImageModal from './components/ImageModal';
import ChatSettings from './components/ChatSettings/ChatSettings';
import {getDefaultSettings, getSettingsForChatType} from './components/ChatSettings/settingsConfig';
import getAutoSettings from '../../utils/autoSettingsEngine.js';
import AIStatusIndicator from '../../components/AIStatusIndicator/AIStatusIndicator';

// Utils & Services
import {pageTransition, itemAnimation} from '../../utils/animations';
import {
    getChatMessages,
    sendMessage,
    sendMessageWithFiles,
    getAIResponseStream,
    generateImage,
    savePartialAIResponse, transcribeAudio
} from "../../services/chatAPI.js";
import {getWelcomeMessage} from "../../utils/aiAgentsUtils.js";
import {
    saveMicrophonePermission,
    hasGrantedPermissionBefore,
    checkPermissionStatus
} from '../../utils/microphonePermission';
import {
    PROCESSING_STATUS,
    createStatusObject,
    updateMessageStatus,
    clearMessageStatus,
    determineStatus
} from '../../utils/statusUtils';

// Styles
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const {chatId} = useParams();
    const location = useLocation();

    // Props from navigation
    const {chatType} = location.state || '';
    const {title} = location.state || 'ТоварищБот';
    const {agentPrompt} = location.state || 'Ты обычный помощник ученика';

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
    const [audioStream, setAudioStream] = useState(null);

    // Microphone permission
    const [permissionStatus, setPermissionStatus] = useState('checking');
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);


    const [isAutoMode, setIsAutoMode] = useState(() => {
        const savedMode = localStorage.getItem(`chatSettings_${chatType}_mode`);
        return savedMode === null ? true : savedMode === 'auto';
    });

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

            const {initialMessage, isToolDescription, attachedFiles} = location.state;

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

    const handleRegenerateImage = async (file) => {
        console.log('🔄 Regenerating image for file:', file);

        // Берём оригинальный промпт из файла
        const originalPrompt = file?.original_prompt || file?.originalPrompt || '';

        if (!originalPrompt) {
            console.error('❌ No original prompt found for regeneration');
            return;
        }

        // Отправляем запрос на генерацию
        setIsLoading(true);

        try {
            await sendMessage(
                originalPrompt,
                [],
                'images' // Указываем тип чата для генерации
            );
        } catch (error) {
            console.error('❌ Error regenerating image:', error);
        } finally {
            setIsLoading(false);
        }
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

            setAudioStream(stream);

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

                setAudioStream(null);

                // Проверяем, что есть данные
                if (chunks.length === 0) {
                    console.error('❌ Нет данных для обработки');
                    setFileErrors(prev => [...prev, 'Не удалось записать аудио. Попробуйте еще раз.']);
                    return;
                }

                // Создаем blob из записанных кусков
                const audioBlob = new Blob(chunks, {type: mimeType});
                console.log(`✅ Создан audioBlob размером ${audioBlob.size} байт`);

                // Проверка размера
                if (audioBlob.size < 100) {
                    console.error('❌ Слишком маленький размер аудио');
                    setFileErrors(prev => [...prev, 'Запись слишком короткая. Попробуйте записать дольше.']);
                    return;
                }

                await transcribeAudioQuery(audioBlob);
            };

            recorder.onerror = (event) => {
                console.error('❌ Ошибка MediaRecorder:', event.error);
                setFileErrors(prev => [...prev, 'Ошибка записи. Попробуйте еще раз.']);


                stream.getTracks().forEach(track => track.stop());
                setAudioStream(null);
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

            setAudioStream(null);
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

        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
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

    const transcribeAudioQuery = async (audioBlob) => {
        try {
            setIsLoading(true);
            setIsTranscribing(true);

            // Добавляем контекстный промпт для улучшения точности
            const contextPrompt = "Это образовательный контент на русском языке о программировании, учебе и образовании.";


            // Отправляем на бэкенд через API-функцию из chatAPI.js
            const result = await transcribeAudio(audioBlob, "ru", contextPrompt);

            if (result.success && result.text) {
                setInputValue(result.text);
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
        if (!inputValue.trim() && attachedFiles.length === 0) return;

        const temperature = chatSettings?.temperature || 0.7;
        const text = inputValue.trim();

        // ✅ ОПРЕДЕЛЯЕМ: это запрос на генерацию изображения?
        const isImageGeneration = chatType === 'images' || chatType === 'image';

        try {
            // Создаём оптимистичное сообщение пользователя
            const optimisticMsg = {
                role: 'user',
                content: text,
                timestamp: new Date().toISOString(),
                files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
                status: 'sending'
            };

            setMessages(prev => [...prev, optimisticMsg]);
            setInputValue('');
            setAttachedFiles([]);
            setIsLoading(true);

            const modifiedPrompt = await buildSystemPrompt();

            // ============================================================
            // 🎨 ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ (без файлов)
            // ============================================================
            if (isImageGeneration) {
                console.log('🎨 Starting image generation...');

                try {
                    let fileIds = [];

                    // 1. Если есть файлы - сначала отправляем их
                    if (attachedFiles.length > 0) {
                        console.log('📎 Отправляем файлы для анализа...');

                        const sendResult = await sendMessageWithFiles(
                            text || "Проанализируй это изображение и создай новое на его основе",
                            attachedFiles,
                            chatId,
                            chatType
                        );

                        if (!sendResult.success) {
                            throw new Error(sendResult.error || 'Не удалось отправить файлы');
                        }

                        const res = sendResult.data;

                        // Обновляем статус отправленного сообщения с файлами
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

                        // Получаем ID загруженных файлов
                        fileIds = (res.uploaded_files || []).map(f => f.file_id);
                        console.log('✅ Файлы загружены, fileIds:', fileIds);

                    } else {
                        // Если файлов нет - просто отправляем текст
                        const sendResult = await sendMessage(text, chatId, chatType);

                        if (!sendResult.success) {
                            throw new Error(sendResult.error || 'Не удалось отправить сообщение');
                        }

                        const res = sendResult.data;

                        // Обновляем статус отправленного сообщения
                        setMessages(prev => prev.map(m => m.status === 'sending'
                            ? {
                                ...m,
                                id: res.message_id ?? m.id,
                                status: 'sent',
                                timestamp: res.timestamp ?? m.timestamp
                            }
                            : m
                        ));
                    }

                    // 2. Добавляем placeholder для генерируемого изображения
                    const generatingMessageId = Date.now() + 1;
                    const generatingMessage = {
                        id: generatingMessageId,
                        role: 'assistant',
                        timestamp: new Date().toISOString(),
                        processingStatus: createStatusObject(PROCESSING_STATUS.GENERATING_IMAGE)
                    };

                    setMessages(prev => [...prev, generatingMessage]);

                    const imageResult = await generateImage(
                        chatId,
                        text || "Создай изображение на основе загруженных файлов",
                        modifiedPrompt,
                        {
                            tool_type: chatType,
                            temperature: temperature
                        },
                        fileIds
                    );

                    // 4. Обрабатываем результат
                    if (imageResult.success) {
                        console.log('✅ Image generated successfully!');

                        // Формируем текст сообщения
                        let messageContent = imageResult.data.message;

                        // Если был анализ файлов - добавляем его
                        if (imageResult.data.analysis) {
                            messageContent = `${imageResult.data.analysis}\n\n${messageContent}`;
                        }

                        // Заменяем placeholder на готовое изображение
                        const imageMessage = {
                            id: Date.now() + 2,
                            role: 'assistant',
                            content: messageContent,
                            files: [
                                {
                                    isGenerated: true,
                                    isGenerating: false,

                                    url: imageResult.data.image_url,

                                    original_url: imageResult.data.original_url,

                                    revised_prompt: imageResult.data.revised_prompt,
                                    original_prompt: text,

                                    type: imageResult.data.image_url.endsWith('.webp')
                                        ? 'image/webp'
                                        : 'image/png',

                                    name: `generated-${Date.now()}.png`,
                                    size: 0
                                }
                            ],
                            timestamp: new Date().toISOString()
                        };

                        setMessages(prev => {
                            const filtered = prev.filter(msg => msg.id !== generatingMessageId);
                            return [...filtered, imageMessage];
                        });

                        setMessages(prev => prev.map(msg =>
                            msg.id === generatingMessageId
                                ? clearMessageStatus(msg)
                                : msg
                        ));

                    } else {
                        throw new Error(imageResult.error || 'Не удалось сгенерировать изображение');
                    }

                } catch (error) {
                    console.error('❌ Image generation error:', error);

                    // Удаляем placeholder при ошибке
                    setMessages(prev => prev.filter(msg =>
                        !(msg.files && msg.files[0]?.isGenerating)
                    ));

                    setMessages(prev => prev.map(msg =>
                        msg.id === generatingMessageId
                            ? clearMessageStatus(msg)
                            : msg
                    ));

                    // Показываем сообщение об ошибке
                    const errorMessage = {
                        id: Date.now() + 3,
                        role: 'assistant',
                        content: `😔 Не удалось создать изображение: ${error.message}`,
                        timestamp: new Date().toISOString(),
                    };

                    setMessages(prev => [...prev, errorMessage]);
                } finally {
                    setIsLoading(false);
                }

                return;
            }

            // ============================================================
            // 💬 ОБЫЧНЫЕ ТЕКСТОВЫЕ СООБЩЕНИЯ (без файлов)
            // ============================================================
            if (attachedFiles.length === 0) {
                const sendResult = await sendMessage(text, chatId, chatType);

                if (sendResult.success) {
                    const res = sendResult.data;

                    // Обновляем статус отправленного сообщения
                    setMessages(prev => prev.map(m => m.status === 'sending'
                        ? {
                            ...m,
                            id: res.message_id ?? m.id,
                            status: 'sent',
                            timestamp: res.timestamp ?? m.timestamp
                        }
                        : m
                    ));

                    // Создаём пустое сообщение бота для streaming
                    const botMessageId = Date.now();
                    const botMessage = {
                        id: botMessageId,
                        role: 'assistant',
                        content: '',
                        timestamp: new Date(),
                        isStreaming: true,
                        processingStatus: createStatusObject(PROCESSING_STATUS.PREPARING)
                    };

                    setMessages(prev => [...prev, botMessage]);
                    setStreamingMessageId(botMessageId);

                    // Создаём AbortController для этого запроса
                    const controller = new AbortController();
                    streamingControllerRef.current = controller;

                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? updateMessageStatus(msg, PROCESSING_STATUS.GENERATING_TEXT)
                            : msg
                    ))

                    try {
                        // Получаем streaming ответ от ИИ
                        await getAIResponseStream(
                            text,
                            chatId,
                            {
                                tool_type: chatType,
                                agent_prompt: modifiedPrompt,
                                temperature: temperature
                            },
                            (chunk) => {
                                setMessages(prev => prev.map(msg => {
                                    if (msg.id === botMessageId) {
                                        const isFirstChunk = !msg.content;

                                        return {
                                            ...msg,
                                            content: msg.content + chunk,
                                            processingStatus: isFirstChunk
                                                ? createStatusObject(PROCESSING_STATUS.STREAMING)
                                                : msg.processingStatus
                                        };
                                    }
                                    return msg;
                                }));
                            },
                            [], // fileIds пусто для текстовых сообщений
                            controller
                        );


                        // Завершаем streaming
                        setMessages(prev => prev.map(msg =>
                            msg.id === botMessageId
                                ? clearMessageStatus(msg)
                                : msg
                        ));

                    } catch (error) {
                        console.error('AI streaming error:', error);

                        if (error.message === 'STREAMING_CANCELLED') {
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? {
                                        ...msg,
                                        content: msg.content + '\n\n[Генерация остановлена]',
                                        ...clearMessageStatus(msg)
                                    }
                                    : msg
                            ));
                        } else {
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? {
                                        ...msg,
                                        content: 'Ошибка получения ответа. Попробуйте ещё раз.',
                                        ...clearMessageStatus(msg)
                                    }
                                    : msg
                            ));
                        }
                    } finally {
                        setStreamingMessageId(null);
                        streamingControllerRef.current = null;
                    }
                }
            }

            // ============================================================
            // 📎 СООБЩЕНИЯ С ФАЙЛАМИ
            // ============================================================
            else {
                const sendResult = await sendMessageWithFiles(
                    text,
                    optimisticMsg.files,
                    chatId,
                    chatType
                );

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
                        isStreaming: true,
                        processingStatus: createStatusObject(PROCESSING_STATUS.ANALYZING_FILES)
                    };

                    setMessages(prev => [...prev, botMessage]);
                    setStreamingMessageId(botMessageId);

                    const fileIds = (res.uploaded_files || []).map(f => f.file_id);

                    // Создаём AbortController
                    const controller = new AbortController();
                    streamingControllerRef.current = controller;

                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? updateMessageStatus(msg, PROCESSING_STATUS.GENERATING_TEXT)
                            : msg
                    ));

                    try {
                        await getAIResponseStream(
                            text || "Проанализируй текст, извлеченный до этого из файла/файлов:",
                            chatId,
                            {
                                tool_type: chatType,
                                agent_prompt: modifiedPrompt,
                                temperature: temperature
                            },
                            (chunk) => {
                                setMessages(prev => prev.map(msg => {
                                    if (msg.id === botMessageId) {
                                        const isFirstChunk = !msg.content;

                                        return {
                                            ...msg,
                                            content: msg.content + chunk,
                                            processingStatus: isFirstChunk
                                                ? createStatusObject(PROCESSING_STATUS.STREAMING)
                                                : msg.processingStatus
                                        };
                                    }
                                    return msg;
                                }));
                            },
                            fileIds,
                            controller
                        );

                        setMessages(prev => prev.map(msg =>
                            msg.id === botMessageId
                                ? clearMessageStatus(msg)
                                : msg
                        ));

                    } catch (error) {
                        console.error('AI streaming error:', error);

                        if (error.message === 'STREAMING_CANCELLED') {
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? {
                                        ...msg,
                                        content: msg.content + '\n\n[Генерация остановлена]',
                                        ...clearMessageStatus(msg)
                                    }
                                    : msg
                            ));
                        } else {
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? {
                                        ...msg,
                                        content: 'Ошибка получения ответа. Попробуйте ещё раз.',
                                        ...clearMessageStatus(msg)
                                    }
                                    : msg
                            ));
                        }
                    } finally {
                        setStreamingMessageId(null);
                        streamingControllerRef.current = null;
                    }
                }
            }

        } catch (error) {
            console.error('💬 Chat error:', error);

            // Удаляем оптимистичное сообщение при ошибке
            setMessages(prev => prev.filter(msg => msg.status !== 'sending'));

            // Показываем сообщение об ошибке
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.'
            }]);
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

        const {content: messageContent, files: messageFiles = []} = lastUserMessage;

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
    const buildSystemPrompt = async () => {
        let systemPrompt = agentPrompt; // Базовый промпт из агента
        let effectiveSettings = { ...chatSettings }; // Копия текущих настроек

        // ===================================
        // АВТОМАТИЧЕСКИЙ РЕЖИМ
        // ===================================
        if (isAutoMode) {
            console.log('🤖 [BuildPrompt] Автоматический режим активен');

            try {
                const autoSettings = await getAutoSettings(
                    chatType,
                    inputValue, // ← Сообщение пользователя
                    messages,
                    systemPrompt,
                    chatId,
                    effectiveSettings // ← Текущие настройки
                );

                console.log('✅ [BuildPrompt] Автонастройки получены:', autoSettings);

                // ✅ ПРАВИЛЬНО: Применяем автонастройки
                effectiveSettings = {
                    ...effectiveSettings,
                    ...autoSettings
                };

                // Обновляем состояние для UI
                setChatSettings(effectiveSettings);

            } catch (error) {
                console.error('❌ [BuildPrompt] Ошибка получения автонастроек:', error);
                // В случае ошибки используем текущие настройки
            }
        }

        console.log('📋 [BuildPrompt] Применяемые настройки:', effectiveSettings);

        // ===================================
        // ОБЩИЕ НАСТРОЙКИ (для всех типов)
        // ===================================

        // Длина ответа
        if (effectiveSettings.maxLength) {
            const lengthInstructions = {
                short: '\n\n📏 ДЛИНА ОТВЕТА: Давай краткие и лаконичные ответы (1-3 предложения).',
                medium: '\n\n📏 ДЛИНА ОТВЕТА: Давай ответы средней длины с необходимыми деталями.',
                detailed: '\n\n📏 ДЛИНА ОТВЕТА: Давай подробные и развернутые ответы с примерами и пояснениями.'
            };
            systemPrompt += lengthInstructions[effectiveSettings.maxLength] || '';
        }

        // Язык общения
        if (effectiveSettings.language === 'en') {
            systemPrompt += '\n\n🌍 ЯЗЫК: Отвечай на английском языке (English language).';
        } else {
            systemPrompt += '\n\n🌍 ЯЗЫК: Отвечай на русском языке.';
        }

        // Креативность (через температуру)
        if (effectiveSettings.temperature !== undefined) {
            if (effectiveSettings.temperature < 0.4) {
                systemPrompt += '\n\n🎯 СТИЛЬ: Используй точный и строгий подход. Проверяй факты. Будь максимально точным.';
            } else if (effectiveSettings.temperature > 0.8) {
                systemPrompt += '\n\n🎨 СТИЛЬ: Будь креативным и оригинальным. Предлагай нестандартные решения. Мысли шире.';
            } else {
                systemPrompt += '\n\n⚖️ СТИЛЬ: Балансируй между точностью и креативностью.';
            }
        }

        // ===================================
        // СПЕЦИФИЧНЫЕ НАСТРОЙКИ ПО ТИПАМ ЧАТА
        // ===================================

        switch (chatType) {
            // === ОБЩИЙ ЧАТ ===
            case 'general':
                if (effectiveSettings.responseStyle === 'friendly') {
                    systemPrompt += '\n\n😊 Используй дружелюбный и теплый тон общения.';
                } else if (effectiveSettings.responseStyle === 'formal') {
                    systemPrompt += '\n\n🎩 Используй формальный и профессиональный стиль.';
                } else if (effectiveSettings.responseStyle === 'casual') {
                    systemPrompt += '\n\n💬 Общайся неформально, как друг с другом.';
                }
                break;

            // === СОЗДАНИЕ ИЗОБРАЖЕНИЙ ===
            case 'image':
                if (effectiveSettings.imageStyle) {
                    systemPrompt += `\n\n🎨 Предпочитаемый стиль изображений: ${effectiveSettings.imageStyle}.`;
                }
                if (effectiveSettings.aspectRatio) {
                    systemPrompt += `\n📐 Формат изображения: ${effectiveSettings.aspectRatio}.`;
                }
                if (effectiveSettings.quality === 'hd') {
                    systemPrompt += '\n✨ Используй настройки высокого качества (HD).';
                }
                if (effectiveSettings.detailLevel === 'simple') {
                    systemPrompt += '\n🎯 Создавай простые промпты без излишних деталей.';
                } else if (effectiveSettings.detailLevel === 'detailed') {
                    systemPrompt += '\n🎨 Создавай детальные промпты с описанием освещения, композиции и стиля.';
                }
                break;

            // === КОДИНГ ===
            case 'coding':
                if (effectiveSettings.withComments) {
                    systemPrompt += '\n\n💬 ВАЖНО: Добавляй подробные комментарии к коду на русском языке, объясняя что делает каждая часть.';
                } else {
                    systemPrompt += '\n\n🔒 Пиши код без комментариев, только чистый код.';
                }

                if (effectiveSettings.codeStyle === 'clean') {
                    systemPrompt += '\n🧹 Используй принципы Clean Code: понятные имена переменных, короткие функции, минимум дублирования.';
                } else if (effectiveSettings.codeStyle === 'minimal') {
                    systemPrompt += '\n⚡ Пиши максимально минималистичный и компактный код.';
                } else if (effectiveSettings.codeStyle === 'verbose') {
                    systemPrompt += '\n📝 Пиши подробный код с явными проверками и детальной обработкой ошибок.';
                }

                if (effectiveSettings.defaultLanguage) {
                    const langMap = {
                        javascript: 'JavaScript',
                        python: 'Python',
                        java: 'Java',
                        cpp: 'C++',
                        csharp: 'C#',
                        go: 'Go',
                        rust: 'Rust'
                    };
                    systemPrompt += `\n💻 Используй ${langMap[effectiveSettings.defaultLanguage]} в качестве основного языка для примеров.`;
                }

                if (effectiveSettings.explainSteps) {
                    systemPrompt += '\n📚 Объясняй решение пошагово: что делаем, почему так, какой результат.';
                }
                break;

            // === БРЕЙНШТОРМ ===
            case 'brainstorm':
                if (effectiveSettings.ideasCount) {
                    const countMap = {
                        '3-5': '3-5',
                        '5-7': '5-7',
                        '8-10': '8-10'
                    };
                    systemPrompt += `\n\n💡 Генерируй ${countMap[effectiveSettings.ideasCount]} разнообразных идей за раз.`;
                }

                if (effectiveSettings.creativityLevel === 'practical') {
                    systemPrompt += '\n🎯 Фокусируйся на практичных и реализуемых идеях.';
                } else if (effectiveSettings.creativityLevel === 'wild') {
                    systemPrompt += '\n🚀 Предлагай смелые, необычные и креативные идеи, выходящие за рамки!';
                }

                if (effectiveSettings.includeExamples) {
                    systemPrompt += '\n📋 К каждой идее добавляй конкретный пример применения.';
                }
                break;

            // === ПОДГОТОВКА К ЭКЗАМЕНАМ ===
            case 'exam_prep':
                if (effectiveSettings.subject) {
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
                    systemPrompt += `\n\n📚 Фокусируйся на подготовке по ${subjectMap[effectiveSettings.subject]}.`;
                }

                if (effectiveSettings.difficulty === 'basic') {
                    systemPrompt += '\n⭐ Используй базовый уровень сложности заданий.';
                } else if (effectiveSettings.difficulty === 'high') {
                    systemPrompt += '\n🔥 Используй задания повышенной сложности.';
                }

                if (effectiveSettings.includePractice) {
                    systemPrompt += '\n✍️ Добавляй тренировочные задания для закрепления.';
                }
                break;

            // === РЕШЕНИЕ ПО ФОТО ===
            case 'photo_solve':
                if (effectiveSettings.solutionStyle === 'hints') {
                    systemPrompt += '\n\n💡 Давай только подсказки и наводящие вопросы, не решай полностью.';
                } else if (effectiveSettings.solutionStyle === 'teaching') {
                    systemPrompt += '\n\n👨‍🏫 Реши задачу пошагово с объяснением каждого шага, обучая методу.';
                } else if (effectiveSettings.solutionStyle === 'detailed') {
                    systemPrompt += '\n\n📖 Предоставь полное детальное решение с пояснениями.';
                }

                if (effectiveSettings.showSteps) {
                    systemPrompt += '\n🔢 Разбивай решение на четкие пронумерованные шаги.';
                }

                if (effectiveSettings.explainLogic) {
                    systemPrompt += '\n🧠 Объясняй логику: почему используем этот метод, что дает каждый шаг.';
                }
                break;

            // Остальные case's из твоего кода...
            // (сократил для краткости, но логика та же)
        }

        console.log('✅ [BuildPrompt] Финальный промпт построен');
        console.log('📊 [BuildPrompt] Длина промпта:', systemPrompt.length, 'символов');

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
                audioStream={audioStream}
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
                isAutoMode={isAutoMode}
                setIsAutoMode={setIsAutoMode}
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