import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNavigation from '../BottomNavigation/BottomNavigation';
// import './Layout.css';

const Layout = ({ user }) => {
    const location = useLocation();

    // Функция для проверки скрытия навигации
    const shouldHideBottomNav = (pathname) => {
        const hiddenPaths = ['/friends', '/teachers', '/ideas'];
        const hiddenPathPrefixes = ['/test/', '/chat/'];

        return hiddenPaths.includes(pathname) ||
            hiddenPathPrefixes.some(prefix => pathname.startsWith(prefix));
    };

    const showBottomNav = !shouldHideBottomNav(location.pathname);

    // Управление padding через JavaScript
    useEffect(() => {
        const body = document.body;

        if (showBottomNav) {
            body.style.paddingBottom = '80px';
        } else {
            body.style.paddingBottom = '0';
        }

        // Cleanup при размонтировании
        return () => {
            body.style.paddingBottom = '0';
        };
    }, [showBottomNav]);

    return (
        <div className="layout">
            <motion.main
                className="layout-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Outlet />
            </motion.main>
            {showBottomNav && <BottomNavigation />}
        </div>
    );
};

export default Layout;