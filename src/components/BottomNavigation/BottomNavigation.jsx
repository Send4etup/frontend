import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BottomNavigation.css';
import HomeIcon from './Icons/Home';
import CubeIcon from './Icons/Cube';
import HumanIcon from './Icons/Human';
import SchoolIcon from './Icons/School';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', path: '/home', label: 'home', icon: HomeIcon },
        { id: 'school', path: '/school', label: 'school', icon: SchoolIcon },
        { id: 'education', path: '/education', label: 'education', icon: CubeIcon },
        { id: 'profile', path: '/profile', label: 'profile', icon: HumanIcon }
    ];

    const handleTabClick = (path) => {
        navigate(path);
    };

    return (
        <motion.div
            className="bottom-navigation"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="navbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path;
                    const colorIcon = isActive ? "#7cfc56" : "#efffef";

                    return (
                        <motion.button
                            key={tab.id}
                            className={`nav-tab ${isActive ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.path)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                animate={{
                                    scale: isActive ? 0.9 : 0.8,
                                    color: isActive ? '#7cfc56' : '#efffef'
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <Icon className="nav-icon" color={colorIcon} />
                            </motion.div>
                            {/*<motion.span className="nav-label"*/}
                            {/*      animate={{*/}
                            {/*          color: isActive ? '#10b981' : '#efffef'*/}
                            {/*      }}*/}
                            {/*>{tab.label}</motion.span>*/}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default BottomNavigation;
