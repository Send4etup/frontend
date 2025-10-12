// src/services/csrfService.js
class CSRFService {
    constructor() {
        this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3213';
        // this.apiBaseUrl = import.meta.env.VITE_API_URL || 'https://back.grigpe3j.beget.tech';
    }

    async getCsrfToken() {
        const response = await fetch(`${this.apiBaseUrl}/api/security/csrf-token`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            this.token = data.csrf_token;
            return this.token;
        }
        throw new Error('Не удалось получить CSRF токен');
    }

    getToken() {
        return this.token;
    }

    hasToken() {
        return !!this.token;
    }
}

export const csrfService = new CSRFService();