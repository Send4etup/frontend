/**
 * Утилиты для работы с разрешениями микрофона
 */

export const saveMicrophonePermission = (granted) => {
    try {
        localStorage.setItem('mic_permission_granted', granted ? 'true' : 'false');
        localStorage.setItem('mic_last_check', new Date().toISOString());
    } catch (error) {
        console.warn('Не удалось сохранить статус разрешения:', error);
    }
};

export const hasGrantedPermissionBefore = () => {
    try {
        return localStorage.getItem('mic_permission_granted') === 'true';
    } catch {
        return false;
    }
};

export const checkPermissionStatus = async () => {
    if (!navigator.permissions) {
        return 'unsupported';
    }

    try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        return result.state; // 'granted', 'denied', 'prompt'
    } catch {
        return 'unsupported';
    }
};