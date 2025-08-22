// src/pages/FriendsPage/FriendsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, User, Plus } from 'lucide-react';
import FriendCard from '../../components/FriendCard/FriendCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getFriends } from '../../services/userService';
import { pageTransition, itemAnimation } from '../../utils/animations';
import './FriendsPage.css';

const FriendsPage = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('classmates');
    const [isLoading, setIsLoading] = useState(false);

    // Моковые данные для демонстрации (замените на реальные данные)
    const mockFriends = [
        {
            id: 1,
            name: 'Иванов Петр',
            status: 'Отличник',
            points: 15420,
            rank: 1,
            avatar: '/avatars/petrov.jpg'
        },
        {
            id: 2,
            name: 'Василиса Гроб',
            status: 'Отличница',
            points: 13220,
            rank: 2,
            avatar: '/avatars/vasilisa.jpg'
        },
        {
            id: 3,
            name: 'Валерия Зуб',
            status: 'Красивая и сасная',
            points: 11220,
            rank: 3,
            avatar: '/avatars/valeria.jpg'
        }
    ];

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        setIsLoading(true);
        try {
            // const data = await getFriends();
            // setFriends(data);
            // Используем моковые данные
            setTimeout(() => {
                setFriends(mockFriends);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Failed to load friends:', error);
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    const handleAddFriend = () => {
        console.log('Add friend');
        // Implement add friend modal
    };

    const handleFriendClick = (friendId) => {
        console.log('Friend clicked:', friendId);
        // Navigate to friend profile or show details
    };

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const classmateFriends = activeFilter === 'classmates'
        ? filteredFriends
        : filteredFriends;

    return (
        <motion.div
            className="friends-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="page-header"
                    variants={itemAnimation}
                >
                    <motion.button
                        onClick={handleBack}
                        className=""
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft className="icon" />
                    </motion.button>
                    <h1 className="page-title">Друзья</h1>
                    <div className="filter-buttons">
                        <motion.button
                            className={`filter-btn ${activeFilter === 'classmates' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('classmates')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Одноклассники
                        </motion.button>
                        <motion.button
                            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Все
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    className="search-bar"
                    variants={itemAnimation}
                >
                    <Search className="search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по классу ..."
                        className="search-input"
                    />
                </motion.div>

                <motion.div
                    className="friends-section"
                    variants={itemAnimation}
                >
                    <h2 className="section-title">11-А класс ({classmateFriends.length} человека)</h2>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="friends-list">
                            {classmateFriends.length > 0 ? (
                                classmateFriends.map((friend, index) => (
                                    <motion.div
                                        key={friend.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <FriendCard
                                            {...friend}
                                            onClick={handleFriendClick}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <User className="empty-icon" />
                                    <p>Друзья не найдены</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                <motion.button
                    className="add-friend-btn"
                    onClick={handleAddFriend}
                    variants={itemAnimation}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="icon" />
                    Добавить друга
                </motion.button>
            </div>
        </motion.div>
    );
};

export default FriendsPage;