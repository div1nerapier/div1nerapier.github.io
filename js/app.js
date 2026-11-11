
import { CONFIG, TEXT } from "./config.js";

import {
loadData,
getData,
getSubscription,
getDaysLeft,
activateTrial,
buyDemoPlan,
addDevice,
removeDevice,
setLanguage
} from "./services.js";

import { renderScreen } from "./screens.js";

import {
initTelegram,
getTelegramUser
} from "./telegram.js";


const app = document.querySelector("#app");
const nav = document.querySelector("#bottomNav");
const toast = document.querySelector("#toast");

const tg = initTelegram();
const user = getTelegramUser();

let currentScreen = "welcome";
let selectedPlan = CONFIG.plans[1].id;

let isLoading = false;


// =========================
// NOTIFICATIONS
// =========================

function notify(message, type = "success") {

    toast.textContent = message;

    toast.classList.remove("show");
    toast.dataset.type = type;

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

    tg?.HapticFeedback?.notificationOccurred(
        type === "error" ? "error" : "success"
    );
}


// =========================
// TRANSLATIONS
// =========================

function t(key) {

    const language = getData().language;

    return TEXT[language]?.[key]
    || TEXT.ru[key]
    || key;
}


// =========================
// NAVIGATION
// =========================

function navigate(screen) {

    currentScreen = screen;

    render();

    if (tg) {
        tg.HapticFeedback?.selectionChanged();
    }
}


function render() {

    if (isLoading) return;

    const sub = getSubscription();

    if (
    currentScreen === "welcome"
    && getData().trialUsed
    ) {
        currentScreen = sub?.active
        ? "dashboard"
        : "pricing";
    }

    app.innerHTML = renderScreen(
        currentScreen,
        selectedPlan
    );

    const navigationScreens = [
        "dashboard",
        "connection",
        "devices",
        "pricing"
    ];

    nav.hidden = !navigationScreens.includes(
        currentScreen
    );

    document.querySelectorAll(".nav-btn").forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.screen === currentScreen
        );

    });

    document.querySelectorAll("[data-i18n]").forEach(el => {

        el.textContent = t(
            el.dataset.i18n
        );

    });

    const brand = document.querySelector("#brandName");

    if (brand) {
        brand.textContent = CONFIG.brand.name;
    }

    const languageButton = document.querySelector(
        "#languageBtn"
    );

    if (languageButton) {
        languageButton.textContent =
        getData().language.toUpperCase();
    }

    if (tg) {

        if (
        ["welcome", "activation", "success"].includes(
            currentScreen
        )
        ) {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }

    }
}


// =========================
// BACK BUTTON
// =========================

function goBack() {

    const backScreens = {
        payment: "pricing",
        connection: "dashboard",
        devices: "dashboard",
        pricing: "dashboard",
        support: "dashboard",
        history: "dashboard",
        success: "connection",
        activation: "welcome"
    };

    navigate(
        backScreens[currentScreen] || "dashboard"
    );
}


// =========================
// HAPP CONNECTION
// =========================

function openHapp() {

    const sub = getSubscription();

    if (!sub?.active) {
        notify(t("inactive"), "error");
        return;
    }

    const link = sub.url;

    if (!link) {
        notify(
            "Персональная ссылка пока не выдана",
            "error"
        );
        return;
    }

    if (tg) {
        tg.openLink(link);
    } else {
        window.open(
            link,
            "_blank",
            "noopener,noreferrer"
        );
    }
}


// =========================
// COPY LINK
// =========================

async function copyLink() {

    const link = getSubscription()?.url;

    if (!link) {
        notify(
            "Ссылка пока не настроена",
            "error"
        );
        return;
    }

    try {

        await navigator.clipboard.writeText(link);

        notify(t("copied"));

    } catch {

        notify("Не удалось скопировать ссылку", "error");

    }
}


// =========================
// ACTION HANDLER
// =========================

document.addEventListener("click", async event => {

    const screenButton = event.target.closest(
        "[data-screen]"
    );

    if (screenButton) {

        navigate(screenButton.dataset.screen);

        return;
    }

    const button = event.target.closest(
        "[data-action]"
    );

    if (!button || button.disabled) return;

    const action = button.dataset.action;

    switch (action) {

        // ---------------------
        // WELCOME
        // ---------------------

        case "activation":

            navigate("activation");

            break;


        // ---------------------
        // TRIAL
        // ---------------------

        case "activate": {

            button.disabled = true;

            const result = await activateTrial();

            button.disabled = false;

            if (result.success) {

                notify("Пробный период активирован");

                navigate("success");

            } else {

                notify(
                    result.reason || t("trialUsed"),
                    "error"
                );

            }

            break;
        }


        // ---------------------
        // CONNECTION
        // ---------------------

        case "connection":

            navigate("connection");

            break;


        case "open-happ":

            openHapp();

            break;


        case "copy-link":

            await copyLink();

            break;


        // ---------------------
        // PLANS
        // ---------------------

        case "select-plan":

            selectedPlan = button.dataset.id;

            render();

            break;


        case "checkout":

            if (!CONFIG.plans.some(
                plan => plan.id === selectedPlan
            )) {
                notify("Выбери тариф", "error");
                break;
            }

            navigate("payment");

            break;


        // ---------------------
        // PAYMENT
        // ---------------------

        case "pay":

            notify(
                "Платёжная система пока не подключена",
                "error"
            );

            break;


        // ---------------------
        // DEVICES
        // ---------------------

        case "add-device": {

            button.disabled = true;

            const success = await addDevice();

            if (success) {
                notify("Устройство добавлено");
            } else {
                notify(
                    "Не удалось добавить устройство",
                    "error"
                );
            }

            render();

            break;
        }


        case "remove-device": {

            button.disabled = true;

            const success = await removeDevice(
                button.dataset.id
            );

            if (success) {
                notify("Устройство удалено");
            } else {
                notify(
                    "Не удалось удалить устройство",
                    "error"
                );
            }

            render();

            break;
        }


        // ---------------------
        // SUPPORT
        // ---------------------

        case "support-link": {

            const username = CONFIG.brand.support;

            if (!username) {
                notify("Поддержка не настроена", "error");
                break;
            }

            const url = "https://t.me/" + username;

            if (tg) {
                tg.openTelegramLink(url);
            } else {
                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );
            }

            break;
        }

    }

});


// =========================
// LANGUAGE
// =========================

document.querySelector(
    "#languageBtn"
)?.addEventListener("click", () => {

    if (CONFIG.language !== "both") return;

    const language =
    getData().language === "ru"
    ? "en"
    : "ru";

    setLanguage(language);

    render();

    notify(
        language === "ru"
        ? "Язык изменён на русский"
        : "Language changed to English"
    );

});


// =========================
// TELEGRAM
// =========================

if (tg) {

    try {

        tg.setHeaderColor("#090D0A");
        tg.setBackgroundColor("#090D0A");

        tg.BackButton.onClick(goBack);

    } catch (error) {

        console.error(
            "Telegram initialization error:",
            error
        );

    }

}


// =========================
// INITIALIZATION
// =========================

async function startApp() {

    if (isLoading) return;

    isLoading = true;

    app.innerHTML = `
        <div class="loading">
            Загрузка NOVA...
        </div>
    `;

    try {

        if (!tg || !tg.initData) {
            throw new Error(
                "Открой приложение через Telegram"
            );
        }

        if (!user) {
            throw new Error(
                "Не удалось получить Telegram-пользователя"
            );
        }

        await loadData();

        isLoading = false;

        render();

        console.log(
            "NOVA initialized:",
            user
        );

    } catch (error) {

        console.error(error);

        isLoading = false;

        app.innerHTML = `
            <section class="screen">
                <div class="hero-orb"></div>

                <h2>Ошибка подключения</h2>

                <p>
                    ${error.message}
                </p>

                <button
                    class="button-primary"
                    id="retryButton"
                >
                    Повторить
                </button>
            </section>
        `;

        document.querySelector(
            "#retryButton"
        )?.addEventListener(
            "click",
            startApp
        );

    }

}

startApp();
