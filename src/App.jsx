import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Services
import { simpleAuth, getCurrentUser } from './services/authService';

// Pages
import HomePage from './pages/HomePage/HomePage';
import SchoolPage from './pages/SchoolPage/SchoolPage';
import EducationPage from './pages/EducationPage/EducationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import IdeasPage from './pages/IdeasPage/IdeasPage';

// Education category pages
// import CoursesPage from './pages/CoursesPage/CoursesPage';
// import WorkshopsPage from './pages/WorkshopsPage/WorkshopsPage';
import VideosPage from './pages/VideosPage/VideosPage';
// import LifehacksPage from './pages/LifehacksPage/LifehacksPage';

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

// Компонент загрузки
const SimpleLoader = () => (
    <div className="simple-loader">
        <LoadingSpinner fullScreen />
        <div className="loader-info">
            <p>Подключение к ТоварищБоту...</p>
        </div>
    </div>
);

// Хук для простой авторизации
const useSimpleAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Проверяем есть ли пользователь в localStorage
            const savedUser = getCurrentUser();
            if (savedUser) {
                setUser(savedUser);
                setIsLoading(false);
                return;
            }

            // Если нет - делаем простую авторизацию
            const authData = await simpleAuth();
            setUser(authData.user);

        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Ошибка авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const authData = await simpleAuth();
            setUser(authData.user);
        } catch (err) {
            console.error('Refresh error:', err);
        }
    };

    const updateUserPoints = (points) => {
        if (user) {
            const updatedUser = {
                ...user,
                current_points: (user.current_points || 0) + points,
                total_points: (user.total_points || 0) + points
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const trackUserActivity = (activity) => {
        console.log('User activity:', activity);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const showNotification = (message) => {
        // Простое уведомление через alert
        // В будущем можно заменить на toast или другую систему уведомлений
        alert(message);
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        refreshUserData,
        updateUserPoints,
        trackUserActivity,
        logout,
        showNotification,
        retry: initAuth
    };
};

function App() {
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

    // Если пользователь не аутентифицирован (не должно происходить с простой авторизацией)
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
                            <Route path="ideas" element={<IdeasPage />} />

                            {/* Страницы категорий образования */}
                            {/*<Route path="courses" element={<CoursesPage />} />*/}
                            {/*<Route path="workshops" element={<WorkshopsPage />} />*/}
                            <Route path="videos" element={<VideosPage />} />
                            {/*<Route path="lifehacks" element={<LifehacksPage />} />*/}

                            {/* Страницы чатов и тестов */}
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