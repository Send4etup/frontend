// src/App.jsx - ПОЛНОСТЬЮ ПЕРЕПИСАННАЯ ВЕРСИЯ
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Hooks
import { useSimpleAuth } from './hooks/useSimpleAuth';
import { useBackendIntegration } from './hooks/useBackendIntegration';

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

// Styles
import './App.css';

// =====================================================
// КОМПОНЕНТЫ ДЛЯ ОТОБРАЖЕНИЯ СОСТОЯНИЙ
// =====================================================

// Компонент для отображения ошибки аутентификации
const AuthError = ({ error, onRetry }) => (
    <div className="auth-error">
        <div className="auth-error-content">
            <h2>Ошибка загрузки</h2>
            <p>{error}</p>
            <button onClick={onRetry} className="retry-btn">
                Попробовать снова
            </button>
        </div>
    </div>
);

// Компонент загрузки
const SimpleLoader = () => (
    <div className="simple-loader">
        <LoadingSpinner fullScreen />
        <div className="loader-info">
            <p>Подключение к ТоварищБоту...</p>
        </div>
    </div>
);

// Компонент для отображения требования авторизации
const AuthRequired = ({ onRetry }) => (
    <div className="auth-required">
        <div className="auth-required-content">
            <h2>Требуется авторизация</h2>
            <p>Попробуем авторизоваться автоматически...</p>
            <button onClick={onRetry} className="retry-btn">
                Попробовать снова
            </button>
        </div>
    </div>
);

// Индикатор статуса бэкенда
const BackendStatusIndicator = ({ status }) => {
    const [showSuccess, setShowSuccess] = React.useState(true);

    // Скрываем успешное подключение через 3 секунды
    React.useEffect(() => {
        if (status?.isOnline) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [status?.isOnline]);

    // Не показываем ничего во время проверки
    if (!status || status.isChecking) {
        return null;
    }

    // Показываем предупреждение если бэкенд недоступен
    if (!status.isOnline) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                color: '#000',
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

    // Показываем успешное подключение только первые 3 секунды
    if (status.isOnline && showSuccess) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(90deg, #43ff65, #22c55e)',
                color: '#000',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                zIndex: 9999,
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                animation: 'slideDown 0.3s ease-out'
            }}>
                ✅ Подключено к серверу ТоварищБот
            </div>
        );
    }

    return null;
};

// =====================================================
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// =====================================================

function App() {
    // Используем существующую авторизацию
    const {
        user,
        isLoading,
        error,
        isAuthenticated,
        refreshUserData,
        updateUserPoints,
        trackUserActivity,
        logout,
        showNotification,
        retry
    } = useSimpleAuth();

    // Добавляем интеграцию с бэкендом
    const {
        backendStatus,
        user: backendUser,
        authenticate: backendAuth,
        isAuthenticating,
        checkBackend
    } = useBackendIntegration();

    // Логирование для отладки
    React.useEffect(() => {
        console.log('🔍 App State:', {
            user: user ? `${user.display_name || user.username} (${user.subscription_type})` : null,
            isLoading,
            isAuthenticated,
            backendOnline: backendStatus?.isOnline,
            backendUser: backendUser ? `${backendUser.display_name}` : null
        });
    }, [user, isLoading, isAuthenticated, backendStatus, backendUser]);

    // Показываем загрузку во время инициализации
    if (isLoading) {
        return <SimpleLoader />;
    }

    // Показываем ошибку, если что-то пошло не так
    if (error && !user) {
        return (
            <AuthError
                error={error}
                onRetry={retry}
            />
        );
    }

    // Если пользователь не аутентифицирован
    if (!isAuthenticated || !user) {
        return <AuthRequired onRetry={retry} />;
    }

    // Создаем расширенный объект пользователя с методами
    const userWithMethods = {
        ...user,
        // Существующие методы (оставляем как есть)
        updatePoints: updateUserPoints,
        trackActivity: trackUserActivity,
        refresh: refreshUserData,
        showNotification,
        logout,

        // Новые свойства для работы с бэкендом
        backendStatus,
        backendUser,
        isBackendOnline: backendStatus?.isOnline || false,
        authenticateBackend: backendAuth,
        checkBackend,
        isBackendAuthenticating: isAuthenticating,

        // Объединенная информация о токенах (приоритет у бэкенда)
        tokens_balance: backendUser?.tokens_balance || user.tokens_balance || 0,
        subscription_type: backendUser?.subscription_type || user.subscription_type || 'free'
    };

    return (
        <ErrorBoundary>
            {/* Индикатор статуса бэкенда */}
            <BackendStatusIndicator status={backendStatus} />

            <Router>
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<Layout user={userWithMethods} />}>
                            <Route index element={<Navigate to="/home" replace />} />

                            {/* Передаем расширенный объект пользователя во все компоненты */}
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

                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </AnimatePresence>
            </Router>
        </ErrorBoundary>
    );
}

export default App;