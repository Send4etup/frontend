// src/services/telegramAuthService.js
import WebApp from "@twa-dev/sdk";

const API_BASE_URL = 'http://localhost:8000/api';

class TelegramAuthService {
    constructor() {
        this.initData = null;
        this.user = null;
    }

    /**
     * Инициализация Telegram Web App
     */
    initialize() {
        try {
            // Инициализируем Telegram Web App
            WebApp.ready();

            // Получаем данные пользователя
            this.initData = WebApp.initData;
            this.user = WebApp.initDataUnsafe?.user;

            console.log('Telegram Web App initialized:', {
                initData: this.initData,
                user: this.user
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize Telegram Web App:', error);
            return false;
        }
    }

    /**
     * Проверка аутентификации пользователя
     */
    async authenticateUser() {
        if (!this.user) {
            throw new Error('No Telegram user data available');
        }

        try {
            // Отправляем данные на сервер для проверки/создания пользователя
            const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: this.initData,
                    user: this.user
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const authResult = await response.json();

            console.log('Authentication result:', authResult);

            return authResult;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    /**
     * Создание нового пользователя (fallback для локальной разработки)
     */
    createLocalUser() {
        if (!this.user) {
            // Создаем тестового пользователя для разработки
            return {
                id: Date.now(),
                telegram_id: null,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                photo_url: null,
                language_code: 'ru',
                current_points: 0,
                total_points: 0,
                level: 1,
                subscription_type: 'free',
                is_new_user: true,
                created_at: new Date().toISOString()
            };
        }

        // Создаем пользователя из Telegram данных
        return {
            id: this.user.id,
            telegram_id: this.user.id,
            first_name: this.user.first_name,
            last_name: this.user.last_name,
            username: this.user.username,
            photo_url: this.user.photo_url,
            language_code: this.user.language_code,
            current_points: 0,
            total_points: 0,
            level: 1,
            subscription_type: 'free',
            is_new_user: true,
            created_at: new Date().toISOString()
        };
    }

    /**
     * Получение полных данных пользователя
     */
    async getUserData(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get user data: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user data:', error);
            throw error;
        }
    }

    /**
     * Проверка валидности Telegram данных (базовая проверка)
     */
    validateTelegramData() {
        if (!this.initData || !this.user) {
            return false;
        }

        // Базовые проверки
        if (!this.user.id || !this.user.first_name) {
            return false;
        }

        // Здесь можно добавить проверку подписи (hash)
        // В production обязательно проверяйте подпись на сервере!

        return true;
    }

    /**
     * Получение информации об устройстве/платформе
     */
    getPlatformInfo() {
        return {
            platform: WebApp.platform,
            version: WebApp.version,
            colorScheme: WebApp.colorScheme,
            themeParams: WebApp.themeParams,
            isExpanded: WebApp.isExpanded,
            viewportHeight: WebApp.viewportHeight,
            viewportStableHeight: WebApp.viewportStableHeight
        };
    }

    /**
     * Настройка интерфейса Telegram
     */
    setupTelegramUI() {
        try {
            // Расширяем приложение на весь экран
            WebApp.expand();

            // Включаем закрытие по свайпу вниз
            WebApp.enableClosingConfirmation();

            // Настраиваем цвета под тему
            if (WebApp.themeParams) {
                document.documentElement.style.setProperty('--tg-bg-color', WebApp.themeParams.bg_color || '#000000');
                document.documentElement.style.setProperty('--tg-text-color', WebApp.themeParams.text_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-hint-color', WebApp.themeParams.hint_color || '#999999');
                document.documentElement.style.setProperty('--tg-button-color', WebApp.themeParams.button_color || '#43ff65');
                document.documentElement.style.setProperty('--tg-button-text-color', WebApp.themeParams.button_text_color || '#000000');
            }

            console.log('Telegram UI configured');
        } catch (error) {
            console.error('Error setting up Telegram UI:', error);
        }
    }

    /**
     * Отправка данных о событии в Telegram
     */
    sendTelegramEvent(eventType, eventData = {}) {
        try {
            // Отправляем событие в Telegram для аналитики
            WebApp.sendData(JSON.stringify({
                event: eventType,
                data: eventData,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error sending Telegram event:', error);
        }
    }

    /**
     * Показать уведомление пользователю
     */
    showNotification(message, type = 'info') {
        try {
            if (type === 'error') {
                WebApp.showAlert(message);
            } else {
                WebApp.showPopup({
                    title: 'Уведомление',
                    message: message,
                    buttons: [{type: 'ok'}]
                });
            }
        } catch (error) {
            console.error('Error showing notification:', error);
            // Fallback на обычный alert
            alert(message);
        }
    }

    /**
     * Закрыть приложение
     */
    closeApp() {
        try {
            WebApp.close();
        } catch (error) {
            console.error('Error closing app:', error);
        }
    }
}

// Создаем singleton instance
const telegramAuthService = new TelegramAuthService();

export default telegramAuthService;