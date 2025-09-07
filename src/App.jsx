import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Существующие импорты (НЕ МЕНЯЕМ)
import { useSimpleAuth } from './hooks/useSimpleAuth';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';
import SimpleLoader from './components/SimpleLoader/SimpleLoader';
import AuthError from './components/AuthError/AuthError';

// Страницы (НЕ МЕНЯЕМ)
import HomePage from './pages/HomePage/HomePage';
import SchoolPage from './pages/SchoolPage/SchoolPage';
import EducationPage from './pages/EducationPage/EducationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import IdeasPage from './pages/IdeasPage/IdeasPage';
import VideosPage from './pages/VideosPage/VideosPage';
import TestPage from './pages/TestPage/TestPage';
import AIChatPage from './pages/AIChatPage/AIChatPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

// НОВЫЕ ИМПОРТЫ (добавляем для интеграции с бэкендом)
import { useBackendIntegration } from './hooks/useBackendIntegration';
import './App.css';

function App() {
    // СУЩЕСТВУЮЩАЯ ЛОГИКА (оставляем как есть)
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

    // НОВАЯ ЛОГИКА (добавляем для бэкенда)
    const {
        backendStatus,
        user: backendUser,
        authenticate: backendAuth,
        isReady: backendReady
    } = useBackendIntegration();

    // СУЩЕСТВУЮЩАЯ ЛОГИКА ЗАГРУЗКИ (не меняем)
    if (isLoading) {
        return <SimpleLoader />;
    }

    // СУЩЕСТВУЮЩАЯ ЛОГИКА ОШИБОК (не меняем)
    if (error && !user) {
        return (
            <AuthError
                error={error}
                onRetry={retry}
            />
        );
    }

    // СУЩЕСТВУЮЩАЯ ЛОГИКА АВТОРИЗАЦИИ (не меняем)
    if (!isAuthenticated || !user) {
        return (
            <div className="auth-required">
                <div className="auth-required-content">
                    <h2>Требуется авторизация</h2>
                    <p>Попробуем авторизоваться автоматически...</p>
                    <button onClick={retry} className="retry-btn">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    // РАСШИРЕННЫЙ ОБЪЕКТ ПОЛЬЗОВАТЕЛЯ (дополняем, не заменяем)
    const userWithMethods = {
        ...user,
        // Существующие методы (оставляем)
        updatePoints: updateUserPoints,
        trackActivity: trackUserActivity,
        refresh: refreshUserData,
        showNotification,
        logout,

        // НОВЫЕ МЕТОДЫ для работы с бэкендом (добавляем)
        backendStatus,
        backendUser,
        isBackendOnline: backendStatus?.isOnline || false,
        authenticateBackend: backendAuth
    };

    return (
        <ErrorBoundary>
            {/* НОВЫЙ КОМПОНЕНТ: Индикатор статуса бэкенда (НЕ БЛОКИРУЕТ работу) */}
            <BackendStatusIndicator status={backendStatus} />

            <Router>
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<Layout user={userWithMethods} />}>
                            <Route index element={<Navigate to="/home" replace />} />

                            {/* Передаем расширенный объект пользователя во ВСЕ компоненты */}
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

// НОВЫЙ КОМПОНЕНТ: Индикатор статуса бэкенда
const BackendStatusIndicator = ({ status }) => {
    // Не показываем ничего если бэкенд проверяется
    if (!status || status.isChecking) {
        return null;
    }

    // Показываем только предупреждения, не блокируем работу
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
    const [showSuccess, setShowSuccess] = React.useState(true);

    React.useEffect(() => {
        if (status.isOnline) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [status.isOnline]);

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

export default App;
