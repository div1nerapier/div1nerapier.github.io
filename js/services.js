
import { CONFIG } from "./config.js";

const KEY = "nova_demo_v3";

const initial = {
    language: CONFIG.defaultLanguage,
    trialUsed: false,
    subscription: null,
    devices: [],
    payments: []
};

let state;

try {
    state = {
        ...initial,
        ...JSON.parse(localStorage.getItem(KEY) || "{}")
    };
} catch {
    state = { ...initial };
}

function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
}

export function getData() {
    return structuredClone(state);
}

export function t(key) {
    const lang = state.language === "en" ? "en" : "ru";
    return CONFIG_TEXT()[lang][key] || key;
}

function CONFIG_TEXT() {
    return TEXT;
}

// Импорт переводов
import { TEXT } from "./config.js";

export function setLanguage(language) {
    state.language = language;
    save();
}

export function getSubscription() {
    const sub = state.subscription;

    if (sub?.active && sub.expiresAt <= Date.now()) {
        sub.active = false;
        save();
    }

    return sub;
}

export function getDaysLeft() {
    const sub = getSubscription();

    if (!sub?.active) return 0;

    return Math.max(
        0,
        Math.ceil((sub.expiresAt - Date.now()) / 86400000)
    );
}

export function activateTrial() {
    if (!CONFIG.trial.enabled) {
        return { success: false, reason: "disabled" };
    }

    if (state.trialUsed) {
        return { success: false, reason: "used" };
    }

    createSubscription("trial", CONFIG.trial.days);

    state.trialUsed = true;
    save();

    return { success: true };
}

function createSubscription(type, days) {
    const now = Date.now();

    state.subscription = {
        active: true,
        type,
        startedAt: now,
        expiresAt: now + days * 86400000,
        url: null
    };
}

export function buyDemoPlan(planId) {
    const plan = CONFIG.plans.find(p => p.id === planId);

    if (!plan) return false;

    const current = getSubscription();
    const now = Date.now();

    // Продлеваем от текущей даты окончания,
    // если подписка ещё действует.
    const start = current?.active
    ? current.expiresAt
    : now;

    state.subscription = {
        active: true,
        type: plan.id,
        startedAt: now,
        expiresAt: start + plan.days * 86400000,
        url: null
    };

    state.payments.unshift({
        id: "DEMO-" + Date.now(),
        plan: plan.name,
        amount: plan.price,
        date: now,
        status: "demo"
    });

    save();

    return true;
}

export function addDevice() {
    if (state.devices.length >= CONFIG.devices.limit) {
        return false;
    }

    state.devices.push({
        id: crypto.randomUUID(),
        name: "Устройство " + (state.devices.length + 1),
        date: Date.now()
    });

    save();
    return true;
}

export function removeDevice(id) {
    state.devices = state.devices.filter(d => d.id !== id);
    save();
}

export function resetDemo() {
    state = structuredClone(initial);
    save();
}
