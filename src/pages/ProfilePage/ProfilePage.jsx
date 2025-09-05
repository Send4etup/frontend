import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, ChevronRight, Gift,
    Trophy, Zap, Edit3, X, Camera
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SubscriptionCard from '../../components/SubscriptionCard/SubscriptionCard';
import { getUserProfile, updateProfile } from '../../services/userService';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './ProfilePage.css';

const ProfilePage = ({ user }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(true);
    const [tariffLoading, setTariffLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: user?.name || 'None',
        class: '11-А класс',
        school: 'Стартуем',
        phone: '+7 (983) 231 23 21',
        email: 'Example@mail.com',
        city: 'Москва',
        schoolNumber: '1499',
        classNumber: '11Б',
        avatar: '/avatars/profile.jpg'
    });

    const subscriptions = [
        {
            id: 1,
            title: 'Халява',
            price: 0,
            saves: 0,
            tokens: '5 запросов',
            isPopular: false,
            isCurrent: false
        },
        {
            id: 2,
            title: 'На челе',
            price: 100,
            saves: 80,
            tokens: '38 тыс. токенов',
            isPopular: false,
            isCurrent: true
        },
        {
            id: 3,
            title: 'Кайф и точка',
            price: 350,
            saves: 300,
            tokens: '190 тыс. токенов',
            isPopular: true,
            badge: 'save 20%',
            isCurrent: false
        },
        {
            id: 4,
            title: 'Мега хорош',
            price: 699,
            saves: 620,
            tokens: '390 тыс. токенов',
            isPopular: false,
            badge: 'save 20%',
            isCurrent: false
        }
    ];

    useEffect(() => {
        loadProfile();
        loadMenuData();
        loadTariffData();
    }, []);

    const loadProfile = async () => {
        setProfileLoading(true);
        try {
            const data = await getUserProfile();
            if (data) {
                setProfileData(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            // Симуляция загрузки
            setTimeout(() => {
                setProfileLoading(false);
            }, 800);
        }
    };

    const loadMenuData = async () => {
        setMenuLoading(true);
        try {
            // Симуляция загрузки данных меню
            await new Promise(resolve => setTimeout(resolve, 1200));
        } catch (error) {
            console.error('Failed to load menu data:', error);
        } finally {
            setMenuLoading(false);
        }
    };

    const loadTariffData = async () => {
        setTariffLoading(true);
        try {
            // Симуляция загрузки тарифных данных
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Failed to load tariff data:', error);
        } finally {
            setTariffLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile(profileData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
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

    const currentTariff = subscriptions.find(sub => sub.isCurrent);

    if (isEditing) {
        return (
            <motion.div
                className="profile-edit-page"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="container">
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
                                {profileData.avatar ? (
                                    <img
                                        src={profileData.avatar}
                                        alt={profileData.name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <User
                                    className="avatar-icon"
                                    style={{ display: profileData.avatar ? 'none' : 'block' }}
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
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Фамилия</label>
                            <input
                                type="text"
                                placeholder="Иванович"
                                className="form-input"
                            />
                        </div>

                        {/*<div className="form-group">*/}
                        {/*    <label>Номер телефона</label>*/}
                        {/*    <input*/}
                        {/*        type="tel"*/}
                        {/*        value={profileData.phone}*/}
                        {/*        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}*/}
                        {/*        className="form-input"*/}
                        {/*    />*/}
                        {/*</div>*/}

                        {/*<div className="form-group">*/}
                        {/*    <label>Ввести код с смс</label>*/}
                        {/*    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            placeholder="Загрузить"*/}
                        {/*            className="form-input"*/}
                        {/*            style={{ flex: 1 }}*/}
                        {/*        />*/}
                        {/*        <motion.button*/}
                        {/*            type="button"*/}
                        {/*            className="upload-btn"*/}
                        {/*            whileHover={{ scale: 1.1 }}*/}
                        {/*            whileTap={{ scale: 0.9 }}*/}
                        {/*        >*/}
                        {/*            📁*/}
                        {/*        </motion.button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="form-group">*/}
                        {/*    <label>Почта</label>*/}
                        {/*    <input*/}
                        {/*        type="email"*/}
                        {/*        value={profileData.email}*/}
                        {/*        onChange={(e) => setProfileData({...profileData, email: e.target.value})}*/}
                        {/*        className="form-input"*/}
                        {/*    />*/}
                        {/*</div>*/}

                        {/*<div className="form-group">*/}
                        {/*    <label>Ввести код с почты</label>*/}
                        {/*    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            placeholder="Загрузить"*/}
                        {/*            className="form-input"*/}
                        {/*            style={{ flex: 1 }}*/}
                        {/*        />*/}
                        {/*        <motion.button*/}
                        {/*            type="button"*/}
                        {/*            className="upload-btn"*/}
                        {/*            whileHover={{ scale: 1.1 }}*/}
                        {/*            whileTap={{ scale: 0.9 }}*/}
                        {/*        >*/}
                        {/*            📁*/}
                        {/*        </motion.button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="form-group">*/}
                        {/*    <label>Город</label>*/}
                        {/*    <input*/}
                        {/*        type="text"*/}
                        {/*        value={profileData.city}*/}
                        {/*        onChange={(e) => setProfileData({...profileData, city: e.target.value})}*/}
                        {/*        className="form-input"*/}
                        {/*    />*/}
                        {/*</div>*/}

                        {/*<div className="form-row">*/}
                        {/*    <div className="form-group">*/}
                        {/*        <label>Школа</label>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            value={profileData.schoolNumber}*/}
                        {/*            onChange={(e) => setProfileData({...profileData, schoolNumber: e.target.value})}*/}
                        {/*            className="form-input"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*    <div className="form-group">*/}
                        {/*        <label>Класс</label>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            value={profileData.classNumber}*/}
                        {/*            onChange={(e) => setProfileData({...profileData, classNumber: e.target.value})}*/}
                        {/*            className="form-input"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="form-group">*/}
                        {/*    <label>Справка об обучении</label>*/}
                        {/*    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            placeholder="Загрузить"*/}
                        {/*            className="form-input"*/}
                        {/*            style={{ flex: 1 }}*/}
                        {/*        />*/}
                        {/*        <motion.button*/}
                        {/*            type="button"*/}
                        {/*            className="upload-btn"*/}
                        {/*            whileHover={{ scale: 1.1 }}*/}
                        {/*            whileTap={{ scale: 0.9 }}*/}
                        {/*        >*/}
                        {/*            📁*/}
                        {/*        </motion.button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

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

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <motion.div
            className="profile-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="page-title"
                    variants={itemAnimation}
                >
                    <h1>
                        Профиль
                    </h1>
                </motion.div>

                <motion.div
                    className="profile-card"
                    variants={itemAnimation}
                >
                    <div className="profile-header">
                        <div className="avatar">
                            {profileData.avatar ? (
                                <img
                                    src={profileData.avatar}
                                    alt={profileData.name}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <User
                                className="avatar-icon"
                                style={{ display: profileData.avatar ? 'none' : 'block' }}
                            />
                        </div>
                        <div className="profile-info">
                            <h1>{profileData.name}</h1>
                            {/*<p className="profile-details">{profileData.class} • {profileData.school}</p>*/}
                            {/*<p className="profile-details">*/}
                            {/*    <Trophy className="badge-icon"/> Отличник • <Zap className="badge-icon"/> Серия дней: 156*/}
                            {/*</p>*/}
                        </div>
                    </div>

                    <motion.button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-white"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Редактировать профиль
                    </motion.button>
                </motion.div>

                <motion.div
                    className="profile-menu"
                    variants={itemAnimation}
                >
                    {/*<motion.button*/}
                    {/*    onClick={() => handleNavigation('/friends')}*/}
                    {/*    className="menu-item dop"*/}
                    {/*    whileHover={{x: 5}}*/}
                    {/*    whileTap={{scale: 0.98}}*/}
                    {/*>*/}
                    {/*    <div className="menu-left">*/}
                    {/*        <h4 className="menu-label">Друзья</h4>*/}
                    {/*        <p className="menu-value">У тебя 13 друзей</p>*/}
                    {/*    </div>*/}
                    {/*    <div className="menu-right">*/}
                    {/*        <ChevronRight className="menu-arrow"/>*/}
                    {/*    </div>*/}
                    {/*</motion.button>*/}

                    {/*<motion.button*/}
                    {/*    onClick={() => handleNavigation('/teachers')}*/}
                    {/*    className="menu-item dop"*/}
                    {/*    whileHover={{x: 5}}*/}
                    {/*    whileTap={{scale: 0.98}}*/}
                    {/*>*/}
                    {/*    <div className="menu-left">*/}
                    {/*        <h4 className="menu-label">Учителя</h4>*/}
                    {/*        <p className="menu-value">У тебя 4 учителя</p>*/}
                    {/*    </div>*/}
                    {/*    <div className="menu-right">*/}
                    {/*        <ChevronRight className="menu-arrow"/>*/}
                    {/*    </div>*/}
                    {/*</motion.button>*/}

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
                </motion.div>

                {tariffLoading ? (
                    <motion.div
                        className="tariff-card"
                        variants={itemAnimation}
                    >
                        <div className="loading-block">
                            <LoadingSpinner />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="tariff-card"
                        variants={itemAnimation}
                        onClick={handleTariffManage}
                    >
                        <motion.div className="tariff-content"

                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                        >
                            <div>
                                <p className="tariff-title">Ваш тариф: {currentTariff?.title || 'На челе'}</p>
                                <p className="tariff-manage">управлять ›</p>
                            </div>
                            <div className="tariff-emoji">😎</div>
                        </motion.div>
                    </motion.div>
                )}

                {/*<motion.button*/}
                {/*    className="promo-button"*/}
                {/*    variants={itemAnimation}*/}
                {/*    whileHover={{ scale: 1.02 }}*/}
                {/*    whileTap={{ scale: 0.98 }}*/}
                {/*>*/}
                {/*    <Gift className="promo-icon" />*/}
                {/*    <span>Ввести промокод</span>*/}
                {/*</motion.button>*/}

                {/* Tariff Modal */}
                <AnimatePresence>
                    {showTariffModal && (
                        <motion.div
                            className="tariff-modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseTariffModal}
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
                                    <h2 className="modal-title">Выберите подписку</h2>
                                    <motion.button
                                        onClick={handleCloseTariffModal}
                                        className="modal-close-btn"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="icon" />
                                    </motion.button>
                                </div>

                                <div className="tariff-options">
                                    {subscriptions.map((sub, index) => (
                                        <motion.div
                                            key={sub.id}
                                            className={`tariff-option ${sub.isCurrent ? 'current' : ''} ${sub.isPopular ? 'popular' : ''}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSubscriptionClick(sub.id)}
                                        >
                                            <div className="tariff-option-left">
                                                <div className={`radio-button ${sub.isCurrent ? 'selected' : ''}`}>
                                                    {sub.isCurrent && <div className="radio-dot" />}
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
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
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