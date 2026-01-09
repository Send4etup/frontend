import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, ChevronRight, Gift,
    Trophy, Zap, Edit3, X, Camera
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../services/userApi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SubscriptionCard from '../../components/SubscriptionCard/SubscriptionCard';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useAuth();
    const {
        profileData,
        isLoading: profileLoading,
        error: profileError,
        loadExtendedProfile,
        updateProfile,
        loadEducation,
        updateEducation
    } = useUserProfile(token);

    const [showEducationModal, setShowEducationModal] = useState(false);
    const [selectedUserType, setSelectedUserType] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [educationLoading, setEducationLoading] = useState(false);
    const [educationData, setEducationData] = useState({
        user_type: null,
        grade: null
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [tokenStats, setTokenStats] = useState(null);
    const [activityHistory, setActivityHistory] = useState([]);

    // Загрузка данных профиля при монтировании
    useEffect(() => {
        if (isAuthenticated && token) {
            loadProfileData();
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            loadEducationData();
        }
    }, [isAuthenticated, token]);

    const loadEducationData = async () => {
        try {
            // Используем метод из хука useUserProfile
            const data = await loadEducation();

            if (data) {
                setEducationData({
                    user_type: data.user_type,
                    grade: data.grade
                });
                setSelectedUserType(data.user_type);
                setSelectedGrade(data.grade);
            }
        } catch (error) {
            console.error('Ошибка загрузки образовательной информации:', error);
        }
    };

    const loadProfileData = async () => {
        try {
            // Загружаем основные данные профиля
            await loadExtendedProfile();

            // Здесь можно добавить загрузку дополнительной статистики
            // const stats = await loadTokenStats(30);
            // setTokenStats(stats);

            // const activity = await loadActivityHistory(5);
            // setActivityHistory(activity);
        } catch (err) {
            console.error('Ошибка загрузки данных профиля:', err);
        }
    };

    const subscriptions = [
        {
            id: 1,
            title: 'Халява',
            price: 0,
            saves: 0,
            tokens: '5 запросов',
            isPopular: false,
            isCurrent: user?.db?.subscription_type === 'free'
        },
        {
            id: 2,
            title: 'На челе',
            price: 100,
            saves: 80,
            tokens: '38 тыс. токенов',
            isPopular: false,
            isCurrent: user?.db?.subscription_type === 'basic'
        },
        {
            id: 3,
            title: 'Кайф и точка',
            price: 350,
            saves: 300,
            tokens: '190 тыс. токенов',
            isPopular: true,
            badge: 'save 20%',
            isCurrent: user?.db?.subscription_type === 'premium'
        },
        {
            id: 4,
            title: 'Мега хорош',
            price: 699,
            saves: 620,
            tokens: '390 тыс. токенов',
            isPopular: false,
            badge: 'save 20%',
            isCurrent: user?.db?.subscription_type === 'mega'
        }
    ];

    const handleEducationClick = () => {
        // Загружаем текущие значения в локальное состояние модала
        setSelectedUserType(educationData.user_type);
        setSelectedGrade(educationData.grade);
        setShowEducationModal(true);
    };

    const handleCloseEducationModal = () => {
        setShowEducationModal(false);
        // Сбрасываем выбор к сохраненным значениям
        setSelectedUserType(educationData.user_type);
        setSelectedGrade(educationData.grade);
    };

    const handleUserTypeSelect = (type) => {
        setSelectedUserType(type);
        // Сбрасываем класс/курс при смене типа
        setSelectedGrade(null);
    };

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
    };

    const handleSaveEducation = async () => {
        try {
            if (!selectedUserType || !selectedGrade) {
                alert('Пожалуйста, выбери тип и класс/курс');
                return;
            }

            setEducationLoading(true);

            const result = await updateEducation({
                user_type: selectedUserType,
                grade: selectedGrade
            });

            if (result) {
                setEducationData({
                    user_type: selectedUserType,
                    grade: selectedGrade
                });

                setShowEducationModal(false);

                console.log('✅ Образовательная информация обновлена:', result);
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert(error.message || 'Не удалось сохранить данные');
        } finally {
            setEducationLoading(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleSubscriptionClick = (subscriptionId) => {
        console.log('Subscription clicked:', subscriptionId);
        // Implement subscription logic
    };

    const handleTariffManage = () => {
        setShowTariffModal(true);
    };

    const handleCloseTariffModal = () => {
        setShowTariffModal(false);
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile(profileData?.user_info);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const getGradeOptions = () => {
        if (selectedUserType === 'schooler') {
            return Array.from({ length: 11 }, (_, i) => i + 1);
        } else if (selectedUserType === 'student') {
            return Array.from({ length: 6 }, (_, i) => i + 1);
        }
        return [];
    };

    const getEducationLabel = () => {
        if (!educationData.user_type || !educationData.grade) {
            return 'Не указано';
        }

        const typeLabel = educationData.user_type === 'schooler' ? 'Школьник' : 'Студент';
        const gradeLabel = educationData.user_type === 'schooler'
            ? `${educationData.grade} класс`
            : `${educationData.grade} курс`;

        return `${typeLabel}, ${gradeLabel}`;
    };

    // Проверяем авторизацию
    if (!isAuthenticated) {
        return (
            <motion.div
                className="s"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="home-container">
                    <div className="auth-required">
                        <p>Необходимо авторизоваться для просмотра профиля</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Показываем загрузку
    if (profileLoading || !user) {
        return <LoadingSpinner fullScreen />;
    }

    // Показываем ошибку
    if (profileError) {
        return (
            <motion.div
                className="school-page"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="home-container">
                    <div className="error-message">
                        <p>Ошибка загрузки профиля: {profileError}</p>
                        <button onClick={loadProfileData}>Попробовать снова</button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Режим редактирования (упрощенный)
    if (isEditing) {
        return (
            <motion.div
                className="home-page"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="home-container">
                    <div className="edit-header">
                        <h1 className="page-title">Редактировать профиль</h1>
                        <motion.button
                            onClick={() => setIsEditing(false)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className=""
                        >
                            <X className="icon" />
                        </motion.button>
                    </div>

                    <motion.div
                        className="avatar-section"
                        variants={itemAnimation}
                    >
                        <div className="avatar-wrapper">
                            <div className="avatar">
                                {user?.telegram?.photo_url ? (
                                    <img
                                        src={user.telegram.photo_url}
                                        alt={user.telegram.first_name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <User
                                    className="avatar-icon"
                                    style={{ display: user?.telegram?.photo_url ? 'none' : 'block' }}
                                />
                            </div>
                            <motion.button
                                className="avatar-edit-btn"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Camera className="icon" />
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="edit-form"
                        variants={itemAnimation}
                    >
                        <div className="form-group">
                            <label>Имя</label>
                            <input
                                type="text"
                                value={profileData?.user_info?.first_name || user?.telegram?.first_name || ''}
                                onChange={(e) => {
                                    // Обновляем локальное состояние
                                    // setProfileData можно добавить если нужно
                                }}
                                className="form-input"
                                placeholder="Введите имя"
                            />
                        </div>

                        <div className="form-group">
                            <label>Фамилия</label>
                            <input
                                type="text"
                                value={profileData?.user_info?.last_name || user?.telegram?.last_name || ''}
                                className="form-input"
                                placeholder="Введите фамилию"
                            />
                        </div>

                        <div className="form-actions">
                            <motion.button
                                onClick={handleSaveProfile}
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Сохранить
                            </motion.button>

                            <motion.button
                                onClick={() => setIsEditing(false)}
                                className="btn btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Отменить
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="home-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="home-container">
                <motion.div
                    className="page-title"
                    variants={itemAnimation}
                >
                    <h1>Профиль</h1>
                </motion.div>

                <motion.div
                    className="profile-card"
                    variants={itemAnimation}
                >
                    <div className="profile-header">
                        <div className="avatar">
                            {user?.telegram?.photo_url ? (
                                <img
                                    src={user.telegram.photo_url}
                                    alt={user.telegram.first_name}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <User
                                className="avatar-icon"
                                style={{display: user?.telegram?.photo_url ? 'none' : 'block'}}
                            />
                        </div>
                        <div className="profile-info">
                            <h1>
                                {profileData?.user_info?.first_name || user?.telegram?.first_name || user?.telegram?.username || 'Пользователь'}
                            </h1>
                            <p className="profile-details">
                                @{user?.telegram?.username || 'username'}
                            </p>
                            {profileData?.user_info?.is_premium && (
                                <p className="profile-details">
                                    <Trophy className="badge-icon"/> Telegram Premium
                                </p>
                            )}
                        </div>
                    </div>

                    {/*<motion.button*/}
                    {/*    onClick={() => setIsEditing(true)}*/}
                    {/*    className="btn btn-white"*/}
                    {/*    whileHover={{ scale: 1.05 }}*/}
                    {/*    whileTap={{ scale: 0.95 }}*/}
                    {/*>*/}
                    {/*    Редактировать профиль*/}
                    {/*</motion.button>*/}
                </motion.div>

                <motion.div
                    className="profile-menu"
                    variants={itemAnimation}
                >
                    <motion.button
                        onClick={() => handleNavigation('/ideas')}
                        className="menu-item"
                        whileHover={{x: 5}}
                        whileTap={{scale: 0.98}}
                    >
                        <div className="menu-left with-icon">
                            <svg width="16" height="19" viewBox="0 0 16 19" fill="none" className="menu-icon"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10.422 17.4466L6.00529 18.5306C5.69062 18.6078 5.36423 18.4352 5.2799 18.1469C5.19562 17.8588 5.38406 17.5597 5.69869 17.4825L10.1154 16.3985C10.4301 16.3213 10.7565 16.4939 10.8408 16.7821C10.9252 17.0703 10.7366 17.3693 10.422 17.4466ZM8.37703 5.01366C8.33747 5.50684 8.03292 5.78481 7.56009 5.77777C7.08933 5.77082 6.74672 5.47528 6.75801 5.02525C6.76898 4.58737 7.0687 4.29974 7.57856 4.30484C8.08809 4.30987 8.34065 4.58566 8.37703 5.01366ZM14.0393 3.35155C12.2823 0.693372 8.80228 -0.598145 5.56926 0.267089C2.73994 1.02433 0.89517 2.73557 0.224389 5.36733C-0.439549 7.97218 0.386858 10.2127 2.47837 12.089C2.96887 12.5291 3.41986 13.0621 3.69637 13.6309C3.97359 14.201 4.06247 14.3793 4.7377 14.2296C5.67548 14.0217 6.6007 13.7664 7.53829 13.5578C8.01895 13.4508 8.20158 13.205 8.19839 12.7612C8.18554 10.9698 8.18986 9.17834 8.19698 7.38694C8.19853 6.98144 8.0594 6.64756 7.58311 6.63742C7.10095 6.62716 6.95334 6.94988 6.95737 7.36328C6.96853 8.5247 6.96075 9.6862 6.96065 10.8477C6.96061 12.7161 6.96065 12.7161 4.95501 12.9845C4.19254 12.1843 3.49823 11.4649 2.81503 10.7367C0.362998 8.12328 0.811404 4.25993 3.87173 2.259C6.07036 0.821412 8.4322 0.741419 10.787 1.95522C12.9734 3.08233 14.1629 5.40439 13.8476 7.65066C13.637 9.15124 12.8548 10.3491 11.6945 11.3788C10.9943 12.0002 10.3562 12.6692 10.1265 13.5678C10.0191 13.9881 9.76186 14.1965 9.31739 14.2969C9.40045 14.2262 4.52667 15.4771 4.52667 15.4771C4.21833 15.5527 4.03369 15.8457 4.11633 16.1281L4.12903 16.1718C4.21167 16.4542 4.5315 16.6234 4.83984 16.5477C4.83984 16.5477 10.432 15.1712 10.5053 15.1522C11.0232 15.0212 11.3051 14.6835 11.3169 14.2015C11.3345 13.4819 11.6759 12.9218 12.2313 12.4437C12.5287 12.1877 12.8248 11.9295 13.1046 11.6577C15.4144 9.41368 15.7956 6.00882 14.0393 3.35155Z"
                                    fill="white"/>
                            </svg>
                            <div>
                                <h4 className="menu-label">Предложить идею</h4>
                                <p className="menu-value">Оставив идею и помоги за кучки</p>
                            </div>
                        </div>
                        <div className="menu-right">
                            <ChevronRight className="menu-arrow"/>
                        </div>
                    </motion.button>

                    <AnimatePresence>
                        {showEducationModal && (
                            <motion.div
                                className="tariff-modal-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCloseEducationModal}
                            >
                                <motion.div
                                    className="tariff-modal"
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="tariff-modal-header">
                                        <h2 className="modal-title">Твоё образование</h2>
                                        <motion.button
                                            onClick={handleCloseEducationModal}
                                            className="modal-close-btn"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="icon" />
                                        </motion.button>
                                    </div>

                                    {/* Выбор типа пользователя */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            marginBottom: '12px',
                                            color: '#ffffff'
                                        }}>
                                            Ты...
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '12px'
                                        }}>
                                            <motion.div
                                                className={`tariff-option ${selectedUserType === 'schooler' ? 'current' : ''}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUserTypeSelect('schooler')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '16px'
                                                }}>
                                                    <span style={{ fontSize: '32px' }}>🎓</span>
                                                    <span style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#ffffff'
                                                    }}>
                                    Школьник
                                </span>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className={`tariff-option ${selectedUserType === 'student' ? 'current' : ''}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUserTypeSelect('student')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '16px'
                                                }}>
                                                    <span style={{ fontSize: '32px' }}>🎯</span>
                                                    <span style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#ffffff'
                                                    }}>
                                    Студент
                                </span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Выбор класса/курса */}
                                    {selectedUserType && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ marginBottom: '24px' }}
                                        >
                                            <h3 style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                marginBottom: '12px',
                                                color: '#ffffff'
                                            }}>
                                                {selectedUserType === 'schooler' ? 'В каком классе?' : 'На каком курсе?'}
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                                                gap: '8px'
                                            }}>
                                                {getGradeOptions().map((grade) => (
                                                    <motion.div
                                                        key={grade}
                                                        className={`tariff-option ${selectedGrade === grade ? 'current' : ''}`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleGradeSelect(grade)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            padding: '12px',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#ffffff'
                                    }}>
                                        {grade}
                                    </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Кнопка сохранения */}
                                    <motion.button
                                        className="btn btn-primary modal-btn"
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        onClick={handleSaveEducation}
                                        disabled={!selectedUserType || !selectedGrade || educationLoading}  // ТУТ
                                        style={{
                                            opacity: (!selectedUserType || !selectedGrade || educationLoading) ? 0.5 : 1,  // И ТУТ
                                            cursor: (!selectedUserType || !selectedGrade || educationLoading) ? 'not-allowed' : 'pointer'  // И ТУТ
                                        }}
                                    >
                                        {educationLoading ? 'Сохраняем...' : 'Сохранить'} // И ТУТ
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.button
                    onClick={handleEducationClick}
                    className="menu-item"
                    whileHover={{x: 5}}
                    whileTap={{scale: 0.98}}
                >
                    <div className="menu-left">
                        <h4 className="menu-label">Образование</h4>
                        <p className="menu-value">{getEducationLabel()}</p>
                    </div>
                    <div className="menu-right">
                        <ChevronRight className="menu-arrow"/>
                    </div>
                </motion.button>

                <motion.div
                    className="tariff-card"
                    variants={itemAnimation}
                    onClick={handleTariffManage}
                >
                    <motion.div
                        className="tariff-content"
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                    >
                        <div>
                            <p className="tariff-title">
                                Ваш тариф: {profileData?.subscription?.type || user?.db?.subscription_type || 'free'}
                            </p>
                            <p className="tariff-subtitle">
                                Токенов: {profileData?.subscription?.tokens_balance || user?.db?.tokens_balance || 0}
                            </p>
                            <p className="tariff-manage">управлять ›</p>
                        </div>
                        <div className="tariff-emoji">😎</div>
                    </motion.div>
                </motion.div>

                {/* Tariff Modal */}
                <AnimatePresence>
                    {showTariffModal && (
                        <motion.div
                            className="tariff-modal-backdrop"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={handleCloseTariffModal}
                        >
                            <motion.div
                                className="tariff-modal"
                                initial={{opacity: 0, y: 50, scale: 0.9}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: 50, scale: 0.9}}
                                transition={{type: "spring", damping: 25, stiffness: 300}}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="tariff-modal-header">
                                    <h2 className="modal-title">Выберите подписку</h2>
                                    <motion.button
                                        onClick={handleCloseTariffModal}
                                        className="modal-close-btn"
                                        whileHover={{scale: 1.1}}
                                        whileTap={{scale: 0.9}}
                                    >
                                        <X className="icon"/>
                                    </motion.button>
                                </div>

                                <div className="tariff-options">
                                    {subscriptions.map((sub, index) => (
                                        <motion.div
                                            key={sub.id}
                                            className={`tariff-option ${sub.isCurrent ? 'current' : ''} ${sub.isPopular ? 'popular' : ''}`}
                                            initial={{opacity: 0, x: -20}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: index * 0.1}}
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={() => handleSubscriptionClick(sub.id)}
                                        >
                                            <div className="tariff-option-left">
                                                <div className={`radio-button ${sub.isCurrent ? 'selected' : ''}`}>
                                                    {sub.isCurrent && <div className="radio-dot"/>}
                                                </div>
                                                <div className="tariff-option-info">
                                                    <div className="tariff-option-header">
                                                        <h3 className="tariff-option-title">{sub.title}</h3>
                                                        {sub.badge && (
                                                            <span className="tariff-option-badge">{sub.badge}</span>
                                                        )}
                                                    </div>
                                                    <p className="tariff-option-price">{sub.price}₽</p>
                                                    <div className="tariff-option-details">
                                                        <p className="tariff-option-saves">
                                                            {sub.saves > 0 ? `${sub.saves} запросов` : sub.tokens}
                                                        </p>
                                                        {sub.saves > 0 && (
                                                            <p className="tariff-option-tokens">{sub.tokens}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <motion.button
                                        className="btn btn-primary modal-btn"
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        onClick={handleCloseTariffModal}
                                    >
                                        Подписаться
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ProfilePage;