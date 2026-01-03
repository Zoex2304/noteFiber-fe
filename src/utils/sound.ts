
export const NOTIFICATION_SOUND_URL = '/sounds/notif.mp3';

export function playNotificationSound(): void {
    try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Autoplay may be blocked - silent fail
        });
    } catch {
        // Audio not supported - silent fail
    }
}
