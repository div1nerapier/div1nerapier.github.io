const tg = window.Telegram?.WebApp;

export function initTelegram() {
    if (!tg) return null;

    tg.ready();
    tg.expand();

    return tg;
}

export function getTelegramUser() {
    return tg?.initDataUnsafe?.user || null;
}

export function getTelegramInitData() {
    return tg?.initData || "";
}