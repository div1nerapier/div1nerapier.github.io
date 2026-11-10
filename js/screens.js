
import { CONFIG, TEXT } from "./config.js";
import {
getData,
getSubscription,
getDaysLeft
} from "./services.js";

export function renderScreen(name, selectedPlan) {
    const data = getData();
    const lang = data.language;
    const t = key => TEXT[lang][key] || TEXT.ru[key];
    const sub = getSubscription();

    const button = (label, action, extra = "") => `
        <button class="button-primary"
                data-action="${action}" ${extra}>
            ${label}
        </button>`;

    const secondary = (label, screen) => `
        <button class="button-secondary"
                data-screen="${screen}">
            ${label}
        </button>`;

    const welcome = () => `
        <section class="screen hero">
            <span class="eyebrow">${CONFIG.brand.name}</span>
            <div class="hero-orb"></div>
            <h1>${t("welcome")}</h1>
            <p>${t("welcomeText")}</p>
            ${button(t("free"), "activation")}
            <p class="small">${t("noPayment")}</p>
        </section>`;

    const activation = () => `
        <section class="screen">
            <div class="hero-orb"></div>
            <span class="eyebrow">NOVA FREE</span>
            <h1>${t("activation")}</h1>
            <p>${t("activationText")}</p>

            <div class="card stack">
                <span class="big-number">${CONFIG.trial.days} ${lang === "ru" ? "дней" : "days"}</span>
                <p>${t("noPayment")}</p>
            </div>

            ${button(t("activate"), "activate")}
            ${secondary(t("back"), "welcome")}
        </section>`;

    const success = () => `
        <section class="screen hero">
            <div class="hero-orb"></div>
            <span class="status">✓ SUCCESS</span>
            <h1>${t("success")}</h1>
            <p>${t("connectText")}</p>
            ${button(t("continue"), "connection")}
        </section>`;

    const connection = () => {
        const link = sub?.url || CONFIG.happ.link;

        return `
        <section class="screen">
            <span class="eyebrow">HAPP SETUP</span>
            <h1>${t("connectTitle")}</h1>
            <p>${t("connectText")}</p>

            <div class="card stack">
                <div class="step">
                    <span class="step-number">1</span>
                    <div>
                        <h3>${t("step1")}</h3>
                        <p>Открой приложение HAPP на телефоне.</p>
                    </div>
                </div>

                <div class="step">
                    <span class="step-number">2</span>
                    <div>
                        <h3>${t("step2")}</h3>
                        <p>Добавь персональную ссылку подписки.</p>
                    </div>
                </div>

                <div class="step">
                    <span class="step-number">3</span>
                    <div>
                        <h3>${t("step3")}</h3>
                        <p>Следуй инструкциям в HAPP.</p>
                    </div>
                </div>
            </div>

            <span class="eyebrow">${t("subscriptionLink")}</span>
            <div class="link-field">${link || "Ссылка будет выдана после подключения backend"}</div>

            ${button(t("openHapp"), "open-happ", !CONFIG.happ.link ? "disabled" : "")}
            <button class="button-secondary" data-action="copy-link">
                ${t("copy")}
            </button>
        </section>`;
    };

    const dashboard = () => {
        const days = getDaysLeft();
        const percent = sub?.type === "trial"
        ? Math.min(100, days / CONFIG.trial.days * 100)
        : 100;

        return `
        <section class="screen">
            <span class="eyebrow">${CONFIG.brand.name}</span>
            <h2>${t("home")}</h2>

            <div class="card stack">
                <div class="row">
                    <span class="status">${sub?.active ? t("active") : t("inactive")}</span>
                    <span>✦</span>
                </div>

                <div class="big-number">
                    ${days}
                    <span class="small">${t("remaining")}</span>
                </div>

                <div class="progress">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>

                ${button(t("connect"), "connection")}
            </div>

            <div class="row">
                <h3>${t("devices")}</h3>
                <span>${data.devices.length}/${CONFIG.devices.limit}</span>
            </div>

            <div class="card-muted">
                <p>${data.devices.length} ${t("devices").toLowerCase()}</p>
            </div>

            <div class="row">
                <h3>${t("payments")}</h3>
                <button class="text-btn" data-screen="history">Все →</button>
            </div>

            <div class="row">
                ${secondary(t("plans"), "pricing")}
                ${secondary(t("support"), "support")}
            </div>
        </section>`;
    };

    const devices = () => `
        <section class="screen">
            <span class="eyebrow">ACCOUNT</span>
            <h1>${t("devices")}</h1>
            <p>${t("limit")}: ${CONFIG.devices.limit}</p>

            ${data.devices.length
                ? data.devices.map(device => `
                    <div class="card-muted device">
                        <div class="device-icon">▣</div>
                        <div class="device-info">
                            <h3>${device.name}</h3>
                            <p>Demo device</p>
                        </div>
                        <button class="text-btn"
                                data-action="remove-device"
                                data-id="${device.id}">
                            ${t("remove")}
                        </button>
                    </div>
                `).join("")
                : `<div class="card empty">
                    <div class="device-icon">▣</div>
                    <h3>${t("noDevices")}</h3>
                    <p>Добавленные устройства появятся здесь.</p>
                </div>`
            }

            ${button(t("addDevice"), "add-device",
                data.devices.length >= CONFIG.devices.limit ? "disabled" : "")}
        </section>`;

    const pricing = () => `
        <section class="screen">
            <span class="eyebrow">NOVA PLANS</span>
            <h1>${t("plans")}</h1>
            <p>Выбери подходящий срок подписки.</p>

            ${CONFIG.plans.map(plan => `
                <div class="card plan ${selectedPlan === plan.id ? "selected" : ""}"
                     data-action="select-plan"
                     data-id="${plan.id}">
                    <div class="row">
                        <h3>${lang === "ru" ? plan.name : plan.nameEn}</h3>
                        ${plan.popular ? `<span class="badge-popular">POPULAR</span>` : ""}
                    </div>
                    <div class="price">${plan.price} ${CONFIG.payment.currency}</div>
                    <p>${plan.days} дней доступа</p>
                </div>
            `).join("")}

            ${button(t("choosePlan"), "checkout")}
            <p class="small">${t("demo")}</p>
        </section>`;

    const payment = () => {
        const plan = CONFIG.plans.find(p => p.id === selectedPlan);

        return `
        <section class="screen">
            <span class="eyebrow">CHECKOUT</span>
            <h1>${t("checkout")}</h1>

            <div class="card stack">
                <div class="row">
                    <span>${lang === "ru" ? plan.name : plan.nameEn}</span>
                    <strong>${plan.price} ${CONFIG.payment.currency}</strong>
                </div>
                <div class="row">
                    <span>${t("total")}</span>
                    <span class="price">${plan.price} ${CONFIG.payment.currency}</span>
                </div>
            </div>

            <div class="card-muted">
                <span class="status">${t("demo")}</span>
                <p>${t("paidDemo")}</p>
            </div>

            ${button(t("payDemo"), "pay")}
            ${secondary(t("back"), "pricing")}
        </section>`;
    };

    const history = () => `
        <section class="screen">
            <h1>${t("payments")}</h1>

            ${data.payments.length
                ? data.payments.map(payment => `
                    <div class="card-muted stack">
                        <div class="row">
                            <strong>${payment.plan}</strong>
                            <span class="status">DEMO</span>
                        </div>
                        <div class="row">
                            <span>${new Date(payment.date).toLocaleDateString()}</span>
                            <strong>${payment.amount} ${CONFIG.payment.currency}</strong>
                        </div>
                    </div>
                `).join("")
                : `<div class="card empty">${t("noPayments")}</div>`
            }

            ${secondary(t("back"), "dashboard")}
        </section>`;

    const support = () => `
        <section class="screen">
            <span class="eyebrow">HELP CENTER</span>
            <h1>${t("support")}</h1>

            <div class="card stack">
                <h3>Нужна помощь?</h3>
                <p>${t("helpText")}</p>
                ${button("Написать в поддержку", "support-link")}
            </div>

            ${secondary("Инструкция HAPP", "connection")}
        </section>`;

    const screens = {
        welcome,
        activation,
        success,
        connection,
        dashboard,
        devices,
        pricing,
        payment,
        history,
        support
    };

    return (screens[name] || welcome)();
}
