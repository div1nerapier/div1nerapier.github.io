
import { CONFIG } from "./config.js";
import { getTelegramInitData } from "./telegram.js";

const API = "https://ТВОЙ-BACKEND-ДОМЕН";

const initial = {
    language: CONFIG.defaultLanguage,
    trialUsed: false,
    subscription: null,
    devices: [],
    payments: []
};

let state = { ...initial };

async function request(path, options = {}) {
    const initData = getTelegramInitData();

    if (!initData) {
        throw new Error("Открой NOVA через Telegram");
    }

    const response = await fetch(API + path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail || "Ошибка сервера");
    }

    return result;
}

function updateState(data) {
    const sub = data.subscription;

    state = {
        language: data.language || CONFIG.defaultLanguage,
        trialUsed: data.trialUsed,
        subscription: sub ? {
            active: Boolean(sub.active) &&
            sub.expires_at > Date.now() / 1000,
            type: sub.type,
            startedAt: sub.started_at * 1000,
            expiresAt: sub.expires_at * 1000,
            url: sub.url
        } : null,
        devices: data.devices || [],
        payments: (data.payments || []).map(p => ({
            id: p.id,
            plan: p.plan,
            amount: p.amount,
            date: p.created_at * 1000,
            status: p.status
        }))
    };
}

export async function loadData() {
    const data = await request("/api/me", {
        method: "POST",
        body: JSON.stringify({
            initData: getTelegramInitData()
        })
    });

    updateState(data);

    return getData();
}

export function getData() {
    return structuredClone(state);
}

export function getSubscription() {
    const sub = state.subscription;

    if (sub && sub.expiresAt <= Date.now()) {
        sub.active = false;
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

export async function activateTrial() {
    try {
        await request("/api/trial", {
            method: "POST",
            body: JSON.stringify({
                initData: getTelegramInitData()
            })
        });

        await loadData();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            reason: error.message
        };
    }
}

export async function addDevice() {
    try {
        const name = "Устройство " + (state.devices.length + 1);

        await request(
            "/api/devices?init_data=" +
            encodeURIComponent(getTelegramInitData()) +
            "&name=" + encodeURIComponent(name),
            { method: "POST" }
        );

        await loadData();
        return true;
    } catch {
        return false;
    }
}

export async function removeDevice(id) {
    try {
        await request(
            "/api/devices/" + encodeURIComponent(id) +
            "?init_data=" +
            encodeURIComponent(getTelegramInitData()),
            { method: "DELETE" }
        );

        await loadData();
        return true;
    } catch {
        return false;
    }
}

export function setLanguage(language) {
    state.language = language;
    localStorage.setItem("nova_language", language);
}

export async function buyDemoPlan() {
    return false;
}
