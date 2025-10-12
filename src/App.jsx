// src/App.jsx - ОБНОВЛЕННАЯ ВЕРСИЯ С РЕАЛЬНОЙ АВТОРИЗАЦИЕЙ
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import HomePage from './pages/HomePage/HomePage';
import SchoolPage from './pages/SchoolPage/SchoolPage';
import EducationPage from './pages/EducationPage/EducationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import IdeasPage from './pages/IdeasPage/IdeasPage';
import VideosPage from './pages/VideosPage/VideosPage';
import TestPage from "./pages/TestPage/TestPage.jsx";
import AIChatPage from "./pages/ChatPage/ChatPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Hook для авторизации
import { useAuth } from "./hooks/useAuth.js";

// import { csrfService } from './services/csrfService';

// Styles
import './App.css';
import ChatHistoryPage from "./pages/ChatHistoryPage/ChatHistoryPage.jsx";

// =====================================================
// КОМПОНЕНТЫ ДЛЯ ОТОБРАЖЕНИЯ СОСТОЯНИЙ
// =====================================================

// Компонент загрузки авторизации
const AuthLoader = () => (
    <div className="app-loading">
        <div className="loading-container">
            <LoadingSpinner />
            <p>🔐 Авторизация через Telegram...</p>
            <small>Получаем данные пользователя</small>
        </div>
    </div>
);

// Компонент ошибки авторизации
const AuthError = ({ error, onRetry }) => (
    <div className="app-error">
        <div className="error-container">
            <h2>⚠️ Ошибка авторизации</h2>
            <p>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</p>

            <div className="error-actions">
                <button onClick={onRetry} className="retry-btn">
                    🔄 Попробовать снова
                </button>
                <button onClick={() => window.location.reload()} className="reload-btn">
                    🔃 Перезагрузить страницу
                </button>
            </div>
            <small>Убедитесь, что приложение запущено в Telegram</small>
        </div>
    </div>
);


// Индикатор статуса подключения к серверу
const ConnectionStatus = ({ isOnline, isLoading }) => {
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOnline && !isLoading) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, isLoading]);

    // Показываем ошибку подключения
    if (!isOnline && !isLoading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                color: '#fff',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                zIndex: 9999,
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                ⚠️ Сервер недоступен - работаем в автономном режиме
            </div>
        );
    }

    // Показываем успешное подключение
    // if (isOnline && showSuccess) {
    //     return (
    //         <div style={{
    //             position: 'fixed',
    //             top: 0,
    //             left: 0,
    //             right: 0,
    //             background: 'linear-gradient(90deg, #43ff65, #22c55e)',
    //             color: '#000',
    //             padding: '6px 12px',
    //             fontSize: '13px',
    //             fontWeight: '500',
    //             zIndex: 9999,
    //             textAlign: 'center',
    //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    //         }}>
    //             ✅ Подключено к серверу ТоварищБот
    //         </div>
    //     );
    // }

    return null;
};

// =====================================================
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// =====================================================

function App() {
    // Используем реальную авторизацию
    const {
        user,
        isLoading,
        isAuthenticated,
        error,
        token,
        logout,
        refreshUser,
        getAuthHeaders,
        initializeAuth,
        userDisplayName,
        tokensBalance,
        subscriptionType
    } = useAuth();

    // Локальное состояние для статуса подключения к серверу
    const [serverStatus, setServerStatus] = useState({
        isOnline: false,
        isChecking: false,
        lastChecked: null
    });

    // Проверка подключения к серверу
    const checkServerConnection = async () => {
        setServerStatus(prev => ({ ...prev, isChecking: true }));

        try {
            const response = await fetch('http://127.0.0.1:3213/', {
                method: 'GET',
                timeout: 5000
            });

            // const response = await fetch('https://back.grigpe3j.beget.tech', {
            //     method: 'GET',
            //     timeout: 5000
            // });

            const isOnline = response.ok;
            setServerStatus({
                isOnline,
                isChecking: false,
                lastChecked: new Date().toISOString()
            });

            console.log(`🌐 Сервер ${isOnline ? 'доступен' : 'недоступен'}`);

        } catch (error) {
            console.warn('⚠️ Сервер недоступен:', error.message);
            setServerStatus({
                isOnline: false,
                isChecking: false,
                lastChecked: new Date().toISOString()
            });
        }
    };

    // Проверяем подключение при загрузке и периодически
    useEffect(() => {
        checkServerConnection();

        // Проверяем каждые 30 секунд
        const interval = setInterval(checkServerConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    // Логирование для отладки
    useEffect(() => {
        console.log('🔍 App State:', {
            user: user ? `${userDisplayName} (${subscriptionType})` : null,
            isLoading,
            isAuthenticated,
            error,
            serverOnline: serverStatus.isOnline,
            tokensBalance
        });
    }, [user, isLoading, isAuthenticated, error, serverStatus.isOnline, userDisplayName, subscriptionType, tokensBalance]);

    // Обработчик повтора при ошибке авторизации
    const handleAuthRetry = () => {
        console.log('🔄 Повторная попытка авторизации');
        initializeAuth();
    };

    // Показываем загрузку авторизации
    if (isLoading) {
        return (
            <ErrorBoundary>
                <AuthLoader />
            </ErrorBoundary>
        );
    }

    // Показываем ошибку авторизации
    if (error) {
        return (
            <ErrorBoundary>
                <AuthError
                    error={error}
                    onRetry={handleAuthRetry}
                />
            </ErrorBoundary>
        );
    }

    // Если не авторизован, показываем ошибку
    if (!isAuthenticated || !user) {
        return (
            <ErrorBoundary>
                <AuthError
                    error="Не удалось авторизоваться в системе"
                    onRetry={handleAuthRetry}
                />
            </ErrorBoundary>
        );
    }

    // Расширенный объект пользователя с дополнительными методами
    const userWithMethods = {
        ...user,

        // Статус подключения
        isOnline: serverStatus.isOnline,
        backendStatus: serverStatus,

        // Дополнительные свойства для совместимости
        display_name: userDisplayName,
        is_premium: subscriptionType !== 'free',

        // Методы для работы с пользователем
        updateUser: refreshUser,
        refresh: refreshUser,
        logout: logout,

        // Методы для обновления состояния (заглушки для совместимости)
        updatePoints: (points) => {
            console.log('📈 Обновление баллов:', points);
            // Здесь можно добавить реальную логику обновления
        },

        trackActivity: (activity) => {
            console.log('📊 Отслеживание активности:', activity);
            // Здесь можно добавить аналитику
        },

        showNotification: (message, type = 'info') => {
            console.log(`📢 Уведомление [${type}]:`, message);
            // Здесь можно добавить toast уведомления
        },

        // Методы для работы с API
        getAuthHeaders,

        // Статус подключения
        setOnlineStatus: (status) => {
            setServerStatus(prev => ({ ...prev, isOnline: status }));
        }
    };

    return (
        <ErrorBoundary>
            {/* Индикатор статуса подключения */}
            <ConnectionStatus
                isOnline={serverStatus.isOnline}
                isLoading={serverStatus.isChecking}
            />

            <Router>
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<Layout user={userWithMethods} />}>
                            <Route index element={<Navigate to="/home" replace />} />

                            {/* Все страницы получают авторизованного пользователя */}
                            <Route
                                path="home"
                                element={<HomePage user={userWithMethods} />}
                            />
                            <Route
                                path="school"
                                element={<SchoolPage user={userWithMethods} />}
                            />
                            <Route
                                path="education"
                                element={<EducationPage user={userWithMethods} />}
                            />
                            <Route
                                path="profile"
                                element={<ProfilePage user={userWithMethods} />}
                            />
                            <Route
                                path="ideas"
                                element={<IdeasPage user={userWithMethods} />}
                            />

                            {/* Страницы категорий образования */}
                            <Route
                                path="videos"
                                element={<VideosPage user={userWithMethods} />}
                            />

                            {/* Страницы чатов и тестов */}
                            <Route
                                path="test/:testId"
                                element={<TestPage user={userWithMethods} />}
                            />
                            <Route
                                path="chat/:chatId"
                                element={<AIChatPage user={userWithMethods} />}
                            />
                            <Route
                                path="chats-history"
                                element={<ChatHistoryPage user={user} />}
                            />
                            <Route
                                path="*"
                               element={<NotFoundPage />}
                            />
                        </Route>
                    </Routes>
                </AnimatePresence>
            </Router>
        </ErrorBoundary>
    );
}

export default App;