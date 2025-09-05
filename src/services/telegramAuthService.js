import WebApp from "@twa-dev/sdk";

class TelegramService {
    constructor() {
        this.user = null;
        this.initData = null;
    }

    initialize() {
        try {
            WebApp.ready();
            WebApp.expand();

            this.initData = WebApp.initData;
            this.user = WebApp.initDataUnsafe?.user;

            // Настройка темы
            if (WebApp.themeParams) {
                document.documentElement.style.setProperty('--tg-bg-color', WebApp.themeParams.bg_color);
                document.documentElement.style.setProperty('--tg-text-color', WebApp.themeParams.text_color);
            }

            return { user: this.user, initData: this.initData };
        } catch (error) {
            console.error('Telegram initialization failed:', error);
            return null;
        }
    }

    showAlert(message) {
        try {
            WebApp.showAlert(message);
        } catch {
            alert(message);
        }
    }

    close() {
        try {
            WebApp.close();
        } catch (error) {
            console.error('Failed to close app:', error);
        }
    }
}

export default new TelegramService();