
import { CONFIG, TEXT } from "./config.js";

import {
getData,
getSubscription,
activateTrial,
buyDemoPlan,
addDevice,
removeDevice,
setLanguage
} from "./services.js";

import { renderScreen } from "./screens.js";

const app = document.querySelector("#app");
const nav = document.querySelector("#bottomNav");
const toast = document.querySelector("#toast");

const tg = window.Telegram?.WebApp;

let currentScreen = "welcome";
let selectedPlan = CONFIG.plans[1].id;

function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

    tg?.HapticFeedback?.notificationOccurred("success");
}

function t(key) {
    const language = getData().language;
    return TEXT[language][key] || TEXT.ru[key];
}

function navigate(screen) {
    currentScreen = screen;
    render();
}

function render() {
    const sub = getSubscription();

    // После первого знакомства показываем кабинет.
    if (currentScreen === "welcome" && getData().trialUsed) {
        currentScreen = sub?.active ? "dashboard" : "pricing";
    }

    app.innerHTML = renderScreen(
        currentScreen,
        selectedPlan
    );

    nav.hidden = ![
        "dashboard",
        "connection",
        "devices",
        "pricing"
    ].includes(currentScreen);

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.dataset.screen === currentScreen
        );
    });

    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });

    document.querySelector("#brandName").textContent =
    CONFIG.brand.name;

    if (tg) {
        if (["welcome", "activation", "success"].includes(currentScreen)) {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }
}

function openHapp() {
    if (!getSubscription()?.active) {
        notify(t("inactive"));
        return;
    }

    if (!CONFIG.happ.link) {
        notify("Сначала настрой ссылку HAPP в config.js");
        return;
    }

    if (tg) {
        tg.openLink(CONFIG.happ.link);
    } else {
        window.open(CONFIG.happ.link, "_blank", "noopener,noreferrer");
    }
}

async function copyLink() {
    const link = CONFIG.happ.link;

    if (!link) {
        notify("Ссылка пока не настроена");
        return;
    }

    try {
        await navigator.clipboard.writeText(link);
        notify(t("copied"));
    } catch {
        notify("Не удалось скопировать ссылку");
    }
}

document.addEventListener("click", event => {
    const screenButton = event.target.closest("[data-screen]");

    if (screenButton) {
        navigate(screenButton.dataset.screen);
        return;
    }

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    switch (action) {

        case "activation":
            navigate("activation");
            break;

        case "activate": {
            const result = activateTrial();

            if (result.success) {
                navigate("success");
            } else {
                notify(t("trialUsed"));
            }
            break;
        }

        case "connection":
            navigate("connection");
            break;

        case "open-happ":
            openHapp();
            break;

        case "copy-link":
            copyLink();
            break;

        case "select-plan":
            selectedPlan = button.dataset.id;
            render();
            break;

        case "checkout":
            navigate("payment");
            break;

        case "pay":
            if (buyDemoPlan(selectedPlan)) {
                notify("Демо-оплата успешна");
                navigate("dashboard");
            }
            break;

        case "add-device":
            if (addDevice()) {
                notify("Устройство добавлено");
            } else {
                notify("Достигнут лимит устройств");
            }
            render();
            break;

        case "remove-device":
            removeDevice(button.dataset.id);
            notify("Устройство удалено");
            render();
            break;

        case "support-link": {
            const username = CONFIG.brand.support;

            if (username) {
                const url = "https://t.me/" + username;

                if (tg) tg.openTelegramLink(url);
                else window.open(url, "_blank", "noopener,noreferrer");
            } else {
                notify("Поддержка не настроена");
            }
            break;
        }
    }
});

document.querySelector("#languageBtn").addEventListener("click", () => {
    if (CONFIG.language !== "both") return;

    const language = getData().language === "ru" ? "en" : "ru";

    setLanguage(language);

    document.querySelector("#languageBtn").textContent =
    language.toUpperCase();

    render();
});

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#090D0A");
        tg.setBackgroundColor("#090D0A");

        tg.BackButton.onClick(() => {
            navigate("dashboard");
        });
    } catch {}
}

document.querySelector("#languageBtn").textContent =
getData().language.toUpperCase();

render();
