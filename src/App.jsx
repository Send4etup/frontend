import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Hooks
import { useTelegramAuth } from './hooks/useTelegramAuth';

// Pages
import HomePage from './pages/HomePage/HomePage';
import SchoolPage from './pages/SchoolPage/SchoolPage';
import EducationPage from './pages/EducationPage/EducationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import TeachersPage from './pages/TeachersPage/TeachersPage';
import IdeasPage from './pages/IdeasPage/IdeasPage';

// Education category pages
import CoursesPage from './pages/CoursesPage/CoursesPage';
import WorkshopsPage from './pages/WorkshopsPage/WorkshopsPage';
import VideosPage from './pages/VideosPage/VideosPage';
import LifehacksPage from './pages/LifehacksPage/LifehacksPage';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Pages
import TestPage from "./pages/TestPage/TestPage.jsx";
import AIChatPage from "./pages/ChatPage/ChatPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

// Styles
import './App.css';

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

// Компонент загрузки с Telegram стилизацией
const TelegramLoader = ({ platformInfo }) => (
    <div className="telegram-loader">
        <LoadingSpinner fullScreen />
        <div className="loader-info">
            <p>Подключение к ТоварищБоту...</p>
            {platformInfo && (
                <small>
                    Платформа: {platformInfo.platform} |
                    Версия: {platformInfo.version}
                </small>
            )}
        </div>
    </div>
);

function App() {
    const {
        user,
        isLoading,
        error,
        isAuthenticated,
        platformInfo,
        refreshUserData,
        updateUserPoints,
        trackUserActivity,
        logout,
        showNotification,
        closeApp
    } = useTelegramAuth();

    // Показываем загрузку во время инициализации
    if (isLoading) {
        return <TelegramLoader platformInfo={platformInfo} />;
    }

    // Показываем ошибку, если что-то пошло не так
    if (error && !user) {
        return (
            <AuthError
                error={error}
                onRetry={() => window.location.reload()}
            />
        );
    }

    // Если пользователь не аутентифицирован
    if (!isAuthenticated || !user) {
        return (
            <div className="auth-required">
                <div className="auth-required-content">
                    <h2>Требуется авторизация</h2>
                    <p>Пожалуйста, запустите приложение через Telegram</p>
                    <button onClick={closeApp} className="close-btn">
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    // Создаем расширенный объект пользователя с методами
    const userWithMethods = {
        ...user,
        // Добавляем методы для работы с пользователем
        updatePoints: updateUserPoints,
        trackActivity: trackUserActivity,
        refresh: refreshUserData,
        showNotification,
        logout
    };

    return (
        <ErrorBoundary>
            <Router>
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<Layout user={userWithMethods} />}>
                            <Route index element={<Navigate to="/home" replace />} />
                            <Route
                                path="home"
                                element={<HomePage user={userWithMethods} />}
                            />
                            <Route path="school" element={<SchoolPage />} />
                            <Route path="education" element={<EducationPage />} />
                            <Route
                                path="profile"
                                element={<ProfilePage user={userWithMethods} />}
                            />
                            <Route path="friends" element={<FriendsPage />} />
                            <Route path="teachers" element={<TeachersPage />} />
                            <Route path="ideas" element={<IdeasPage />} />

                            {/* Страницы категорий образования */}
                            <Route path="courses" element={<CoursesPage />} />
                            <Route path="workshops" element={<WorkshopsPage />} />
                            <Route path="videos" element={<VideosPage />} />
                            <Route path="lifehacks" element={<LifehacksPage />} />

                            {/* Детальные страницы (пока редиректы на категории) */}
                            <Route path="course/:id" element={<Navigate to="/courses" replace />} />
                            <Route path="workshop/:id" element={<Navigate to="/workshops" replace />} />
                            <Route path="video/:id" element={<Navigate to="/videos" replace />} />
                            <Route path="lifehack/:id" element={<Navigate to="/lifehacks" replace />} />
                            <Route path="news" element={<Navigate to="/education" replace />} />

                            {/* Существующие маршруты */}
                            <Route path="test/:testId" element={<TestPage />} />
                            <Route path="chat/:chatId" element={<AIChatPage />} />

                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </AnimatePresence>
            </Router>
        </ErrorBoundary>
    );
}

export default App;