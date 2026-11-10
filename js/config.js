
export const CONFIG = {
    brand: {
        name: "NOVA",
        support: "nova_support",
        color: "#B6F5C5"
    },

    language: "both",
    defaultLanguage: "ru",

    trial: {
        enabled: true,
        days: 7
    },

    happ: {
        name: "HAPP",

        // Ссылка, которую предоставит VPN-провайдер.
        // Пока оставляем пустой.
        link: ""
    },

    devices: {
        limit: 3
    },

    payment: {
        mode: "demo",
        currency: "₽"
    },

    backend: {
        mode: "later"
    },

    plans: [
        {
            id: "month",
            name: "1 месяц",
            nameEn: "1 month",
            price: 199,
            days: 30
        },
        {
            id: "quarter",
            name: "3 месяца",
            nameEn: "3 months",
            price: 499,
            days: 90,
            popular: true
        },
        {
            id: "year",
            name: "1 год",
            nameEn: "1 year",
            price: 1499,
            days: 365
        }
    ]
};

export const TEXT = {
    ru: {
        welcome: "Интернет без лишних границ",
        welcomeText: "Мы поможем получить доступ и настроить подключение. Это проще, чем кажется.",
        free: "Попробовать бесплатно",
        noPayment: "7 дней бесплатно. Сейчас платить не нужно.",
        activation: "Получим тебе бесплатный доступ?",
        activationText: "Нажми кнопку, и мы подготовим твою подписку.",
        activate: "Активировать 7 дней",
        success: "Отлично! Твоя подписка готова",
        continue: "Продолжить",
        home: "Главная",
        connect: "Подключение",
        devices: "Устройства",
        plans: "Тарифы",
        support: "Поддержка",
        active: "Подписка активна",
        inactive: "Подписка не активна",
        remaining: "Осталось дней",
        openHapp: "Открыть HAPP",
        copy: "Скопировать ссылку",
        copied: "Ссылка скопирована",
        choosePlan: "Выбрать тариф",
        payDemo: "Имитировать оплату",
        demo: "Демонстрационный режим",
        payments: "История платежей",
        addDevice: "Добавить устройство",
        remove: "Удалить",
        noDevices: "Пока устройств нет",
        noPayments: "Платежей пока нет",
        back: "Назад",
        helpText: "Если что-то не получается, наша поддержка поможет тебе.",
        trialUsed: "Пробный период уже использован.",
        connectTitle: "Добавим подписку в HAPP",
        connectText: "HAPP — отдельное приложение, через которое работает подключение.",
        step1: "Открой HAPP",
        step2: "Добавь свою ссылку подписки",
        step3: "Следуй подсказкам HAPP",
        subscriptionLink: "ТВОЯ ССЫЛКА",
        checkout: "Проверка заказа",
        total: "Итого",
        paidDemo: "Демо-оплата завершена. Деньги не списывались.",
        welcomeDevice: "Устройства",
        limit: "Лимит устройств",
        history: "История платежей",
        activated: "Бесплатный доступ активирован!"
    },

    en: {
        welcome: "Internet without unnecessary limits",
        welcomeText: "We'll help you get access and set up your connection. It's easier than it looks.",
        free: "Try for free",
        noPayment: "7 days free. No payment required now.",
        activation: "Ready to get free access?",
        activationText: "Tap the button and we'll prepare your subscription.",
        activate: "Activate 7 days",
        success: "Great! Your subscription is ready",
        continue: "Continue",
        home: "Home",
        connect: "Connect",
        devices: "Devices",
        plans: "Plans",
        support: "Support",
        active: "Subscription active",
        inactive: "Subscription inactive",
        remaining: "Days remaining",
        openHapp: "Open HAPP",
        copy: "Copy subscription link",
        copied: "Link copied",
        choosePlan: "Choose a plan",
        payDemo: "Simulate payment",
        demo: "Demo mode",
        payments: "Payment history",
        addDevice: "Add device",
        remove: "Remove",
        noDevices: "No devices yet",
        noPayments: "No payments yet",
        back: "Back",
        helpText: "If something goes wrong, our support team can help.",
        trialUsed: "Your trial has already been used.",
        connectTitle: "Let's add your subscription to HAPP",
        connectText: "HAPP is a separate app used to connect.",
        step1: "Open HAPP",
        step2: "Add your subscription link",
        step3: "Follow HAPP instructions",
        subscriptionLink: "YOUR LINK",
        checkout: "Review your order",
        total: "Total",
        paidDemo: "Demo payment completed. No money was charged.",
        welcomeDevice: "Devices",
        limit: "Device limit",
        history: "Payment history",
        activated: "Your free access is active!"
    }
};
