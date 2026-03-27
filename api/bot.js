// Vercel Serverless Function for Telegram Bot
const axios = require('axios');

// 配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

// ========== 产品数据库 ==========
const PRODUCTS = {
    // 胡椒喷雾
    'HJ-5': {
        name: 'HJ-5 (5ml)',
        price: 569,
        desc: 'Форм-фактор помады, сверхкомпактный, для ближней дистанции',
        bestFor: 'скрытое ношение, неожиданное применение, женская сумочка',
        size: '82×Ø18 мм',
        weight: '20 г',
        range: 'только ближняя дистанция',
        type: 'перцовый баллончик'
    },
    'HJ-10': {
        name: 'HJ-10 (10ml)',
        price: 579,
        desc: 'Узкий формат помады, более ёмкий, компактный и незаметный',
        bestFor: 'ежедневное скрытое ношение, для девушек, сумочка',
        size: '100×Ø18 мм',
        weight: '23.7 г',
        range: 'только ближняя дистанция',
        type: 'перцовый баллончик'
    },
    'HJ-15': {
        name: 'HJ-15 (15ml)',
        price: 589,
        desc: 'Тонкий спрей 15 мл, баланс компактности и объёма',
        bestFor: 'город, карман/сумка, скрытое ношение',
        size: '20×20×115 мм',
        weight: '33 г',
        range: 'только ближняя дистанция',
        type: 'перцовый баллончик'
    },
    'HJ-15W': {
        name: 'HJ-15W (15ml)',
        price: 599,
        desc: 'Версия с прозрачным окном, видно остаток жидкости',
        bestFor: 'тем, кто хочет контролировать остаток и расход',
        size: '118×Ø19.5 мм',
        weight: '33 г',
        range: 'только ближняя дистанция',
        type: 'перцовый баллончик'
    },
    'HJ-20': {
        name: 'HJ-20 (20ml)',
        price: 649,
        desc: 'Стандартная базовая модель, практичная и простая',
        bestFor: 'первый баллончик, повседневная защита в городе',
        size: '90×Ø20 мм',
        weight: '28 г',
        range: 'эффективно 1–2 м',
        type: 'перцовый баллончик'
    },
    'HJ-20K': {
        name: 'HJ-20K (20ml)',
        price: 699,
        desc: 'Модель с кольцом для ключей, максимально удобна для ношения',
        bestFor: 'ключи, сумка, быстрое извлечение, ежедневное ношение',
        size: '95×Ø20 мм',
        weight: '35 г',
        range: 'эффективно 1–2 м',
        type: 'перцовый баллончик'
    },
    'HJ-60': {
        name: 'HJ-60 (60ml)',
        price: 829,
        desc: 'Классический увеличенный объём, крышка с предохранителем',
        bestFor: 'тем, кому нужен больший запас и более уверенный формат',
        size: '115×Ø35 мм',
        weight: '75 г',
        range: 'эффективно до 1.5 м',
        type: 'перцовый баллончик'
    },
    'HJ-110': {
        name: 'HJ-110 (110ml)',
        price: 899,
        desc: 'Увеличенная версия HJ-60, хватает надолго',
        bestFor: 'долгое использование, максимальный запас объёма',
        size: '150×Ø35 мм',
        weight: '105 г',
        range: 'эффективно 1–2 м',
        type: 'перцовый баллончик'
    },
    'HJ-110S': {
        name: 'HJ-110S (110ml)',
        price: 999,
        desc: 'Струйная модель, мощная и более устойчива к встречному ветру',
        bestFor: 'требовательные задачи, максимальная эффективность среди переносных моделей',
        size: '150×Ø35 мм',
        weight: '105 г',
        range: 'струйный формат, 1–2 м',
        type: 'перцовый баллончик'
    },

    // 电棍
    'Model-806': {
        name: 'Model-806',
        price: 1590,
        desc: 'Пальцевый электрошокер: маленький, скрытый, но с хорошей мощностью',
        bestFor: 'максимальная компактность, ближняя самооборона',
        size: '75×57×23 мм',
        weight: '185 г',
        feature: 'пальцевый формат',
        type: 'электрошокер'
    },
    'Model-1202': {
        name: 'Model-1202',
        price: 1590,
        desc: 'Форм-фактор помады, неожиданное применение, есть фонарик',
        bestFor: 'для девушек, скрытое ношение, сумочка',
        size: '130×Ø25 мм',
        weight: '',
        feature: 'маскировка под помаду + фонарик',
        type: 'электрошокер'
    },
    'Model-669': {
        name: 'Model-669',
        price: 1690,
        desc: 'Стандартная универсальная модель с фонариком',
        bestFor: 'базовый выбор на каждый день',
        size: '138×50 мм, голова 20 мм',
        weight: '',
        feature: 'классический формат + фонарик',
        type: 'электрошокер'
    },
    'Model-800': {
        name: 'Model-800',
        price: 1490,
        desc: 'Классическая модель с более ярким светом, чем у 669',
        bestFor: 'если важна и самооборона, и подсветка',
        size: '109×55 мм, голова 10 мм',
        weight: '',
        feature: 'улучшенная подсветка',
        type: 'электрошокер'
    },
    'Model-309': {
        name: 'Model-309',
        price: 1690,
        desc: 'Изогнутая эргономичная форма, удобнее лежит в руке, есть фонарик',
        bestFor: 'комфортный хват, ежедневное ношение',
        size: '129×26 мм',
        weight: '',
        feature: 'эргономичный изогнутый корпус',
        type: 'электрошокер'
    },
    'Model-398': {
        name: 'Model-398',
        price: 1590,
        desc: 'Компактная стандартная модель для повседневного ношения',
        bestFor: 'тем, кто хочет простой и понятный формат',
        size: '106×41 мм, голова 16 мм',
        weight: '',
        feature: 'компактный классический формат',
        type: 'электрошокер'
    },
    'Model-1108': {
        name: 'Model-1108',
        price: 1999,
        desc: 'Фонарный формат, длиннее корпус и более сильная подсветка',
        bestFor: 'если нужен более серьёзный формат и хороший свет',
        size: '243 мм, рукоять 35 мм, голова 45 мм',
        weight: '',
        feature: 'формат мини-фонаря',
        type: 'электрошокер'
    },
    'Model-1158': {
        name: 'Model-1158',
        price: 2099,
        desc: 'Фонарный формат, короче 1108, удобнее для ношения',
        bestFor: 'тем, кто хочет баланс между размером и удобством',
        size: '176 мм, рукоять 35 мм, голова 36 мм',
        weight: '',
        feature: 'средний формат фонаря',
        type: 'электрошокер'
    },
    'Model-1320': {
        name: 'Model-1320',
        price: 2099,
        desc: 'Более крупный фонарный формат, ярче свет, декоративные золотые элементы',
        bestFor: 'тем, кому важны внешний вид и более сильная подсветка',
        size: '182 мм, рукоять 33 мм, голова 50 мм',
        weight: '',
        feature: 'крупный фонарный формат',
        type: 'электрошокер'
    },
    'Model-1138': {
        name: 'Model-1138',
        price: 2499,
        desc: 'Длинный дубинкообразный электрошокер с фонариком, усиленная пластиковая голова',
        bestFor: 'максимальный размер, жёсткий формат, возможность ударного применения',
        size: '376 мм, рукоять 31 мм, голова 45 мм',
        weight: '',
        feature: 'дубинкообразный формат',
        type: 'электрошокер'
    }
};

// 生成产品目录文本
function getProductCatalog() {
    let catalog = '📦 <b>КАТАЛОГ ТОВАРОВ</b>\n\n';

    catalog += '🌶️ <b>ПЕРЦОВЫЕ БАЛЛОНЧИКИ:</b>\n';
    catalog += 'ℹ️ До 15 мл — компактные модели для ближней дистанции и скрытого ношения.\n';
    catalog += 'ℹ️ От 20 мл — более практичные модели с эффективной дистанцией 1–2 м.\n\n';

    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('HJ')) {
            catalog += `• <b>${val.name}</b> - ${val.price}₽\n`;
            catalog += `  └ ${val.desc}\n`;
            catalog += `  └ Для чего: ${val.bestFor}\n`;
            if (val.size || val.weight) {
                catalog += `  └ Размер: ${val.size || '—'}${val.weight ? ` | Вес: ${val.weight}` : ''}\n`;
            }
            if (val.range) {
                catalog += `  └ Дистанция: ${val.range}\n`;
            }
            catalog += '\n';
        }
    }

    catalog += '⚡ <b>ЭЛЕКТРОШОКЕРЫ:</b>\n';
    catalog += 'ℹ️ Все электрошокеры комплектуются европейским зарядным кабелем.\n\n';

    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('Model')) {
            catalog += `• <b>${val.name}</b> - ${val.price}₽\n`;
            catalog += `  └ ${val.desc}\n`;
            catalog += `  └ Для чего: ${val.bestFor}\n`;
            if (val.size || val.weight) {
                catalog += `  └ Размер: ${val.size || '—'}${val.weight ? ` | Вес: ${val.weight}` : ''}\n`;
            }
            if (val.feature) {
                catalog += `  └ Особенность: ${val.feature}\n`;
            }
            catalog += '\n';
        }
    }

    catalog += '🚚 <b>Доставка:</b> Москва/СПб, CDEK 2-3 дня\n';
    catalog += '🎁 <b>Бесплатно от 2 шт</b> | 📦 Анонимная упаковка';
    return catalog;
}

function getProductKnowledgeBase() {
    let kb = 'БАЗА ТОВАРОВ МАГАЗИНА "ЩИТ"\n\n';
    kb += 'ПЕРЦОВЫЕ БАЛЛОНЧИКИ:\n';
    kb += '- До 15 мл: компактные, скрытные модели для ближней дистанции.\n';
    kb += '- От 20 мл: более практичные модели с эффективной дистанцией 1–2 м.\n\n';

    for (const [key, val] of Object.entries(PRODUCTS)) {
        kb += `${key}: ${val.name}. ${val.desc}. Подходит: ${val.bestFor}.`;
        if (val.size) kb += ` Размер: ${val.size}.`;
        if (val.weight) kb += ` Вес: ${val.weight}.`;
        if (val.range) kb += ` Дистанция: ${val.range}.`;
        if (val.feature) kb += ` Особенность: ${val.feature}.`;
        kb += '\n';
    }

    kb += '\nЭЛЕКТРОШОКЕРЫ: все модели комплектуются европейским зарядным кабелем.';
    return kb;
}

// ========== 系统提示词 ==========
const SYSTEM_PROMPT = `Вы - AI-консультант магазина самообороны "ЩИТ". Цель - профессиональным диалогом привести к заказу.

ПРАВИЛА:
1. Всегда отвечайте по-русски, кратко, с эмодзи
2. При запросе каталога - отправляйте полный список с ценами
3. Для подбора спрашивайте: бюджет, цель (город/природа/от собак), опыт
4. Рекомендуйте 2-3 товара с объяснением почему
5. Создавайте легкую срочность: "сегодня осталось X шт"
6. Для оформления заказа собирайте: имя, телефон, адрес, товары

КОМАНДЫ ПОЛЬЗОВАТЕЛЯ:
- "каталог" / "цены" - показать все товары
- "консультант" / "человек" / "оператор" - перевод на @drvapeservice
- "заказ", "оформить", "купить" - начать оформление заказа

Если не знаете ответ - скажите "уточню у коллеги" и предложите перевод на оператора.`;

// 存储对话历史和订单
const conversations = new Map();
const dailyOrderCounter = new Map(); // 每天订单计数器

// ========== 生成订单号 ==========
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateKey = `${year}${month}${day}`;

    // 获取当天订单数
    let count = dailyOrderCounter.get(dateKey) || 0;
    count++;
    dailyOrderCounter.set(dateKey, count);

    return `AP${dateKey}-${count}`;
}

// ========== 发送消息 ==========
async function sendMessage(chatId, text, parseMode = 'HTML') {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: parseMode
        });
    } catch (err) {
        console.error('发送失败:', err.message);
        // 尝试纯文本
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: text.replace(/<[^>]+>/g, '')
            });
        } catch (err2) {
            console.error('纯文本也失败:', err2.message);
        }
    }
}

// ========== 提取订单信息 ==========
function extractOrderInfo(messages, username) {
    const info = {
        products: [],
        name: '',
        phone: '',
        address: '',
        total: 0,
        orderNumber: generateOrderNumber()
    };

    const fullText = messages.map(m => m.content).join(' ').toLowerCase();

    // 识别产品
    for (const [key, val] of Object.entries(PRODUCTS)) {
        const keyLower = key.toLowerCase();
        if (
            fullText.includes(keyLower) ||
            fullText.includes(keyLower.replace('-', '')) ||
            fullText.includes(keyLower.replace('model-', ''))
        ) {
            info.products.push({ code: key, name: val.name, price: val.price });
            info.total += val.price;
        }
    }

    // 识别电话
    const phoneMatch = fullText.match(/(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
    if (phoneMatch) info.phone = phoneMatch[0];

    // 识别地址
    const addressKeywords = ['москва', 'спб', 'санкт-петербург', 'адрес', 'доставка', 'улица', 'дом', 'квартира'];
    for (const msg of messages) {
        const msgText = msg.content.toLowerCase();
        if (addressKeywords.some(kw => msgText.includes(kw))) {
            info.address = msg.content;
            break;
        }
    }

    // 识别名字
    const namePatterns = [
        /меня зовут\s+([а-яa-z\s]+)/i,
        /имя[:\s]+([а-яa-z\s]+)/i,
        /я\s+([а-яa-z]+)/i
    ];
    for (const pattern of namePatterns) {
        const match = fullText.match(pattern);
        if (match) {
            info.name = match[1].trim();
            break;
        }
    }

    return info;
}

// ========== 发送订单给店主 ==========
async function sendOrderToOwner(orderInfo, username, chatId) {
    let message = `🛒 <b>НОВЫЙ ЗАКАЗ ${orderInfo.orderNumber}</b>\\n\\n`;
    message += `<b>Клиент:</b> ${username}\\n`;
    message += `<b>Chat ID:</b> <code>${chatId}</code>\\n`;
    if (orderInfo.name) message += `<b>Имя:</b> ${orderInfo.name}\\n`;
    if (orderInfo.phone) message += `<b>Телефон:</b> ${orderInfo.phone}\\n`;
    if (orderInfo.address) message += `<b>Адрес:</b> ${orderInfo.address}\\n`;

    message += '\\n<b>Товары:</b>\\n';
    if (orderInfo.products.length > 0) {
        orderInfo.products.forEach(p => {
            message += `• ${p.name} - ${p.price}₽\\n`;
        });
        message += `\\n<b>ИТОГО: ${orderInfo.total}₽</b>`;
    } else {
        message += '<i>(товары не распознаны, см. переписку)</i>';
    }

    message += '\\n\\n<a href="https://t.me/' + username.replace('@', '') + '">💬 Открыть чат с клиентом</a>';

    await sendMessage(OWNER_CHAT_ID, message);
}

// ========== 处理消息 ==========
async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const username = msg.from?.username || msg.from?.first_name || 'unknown';

    if (!text) return;

    console.log(`📩 ${username}: ${text}`);

    // 初始化对话历史
    if (!conversations.has(chatId)) {
        conversations.set(chatId, [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\n${getProductKnowledgeBase()}` }
        ]);
    }

    const history = conversations.get(chatId);

    // ========== 命令处理 ==========
    if (text === '/start') {
        await sendMessage(
            chatId,
            '👋 Добро пожаловать в ЩИТ!\n\n' +
                'Я ваш AI-консультант по средствам самообороны 🤖\n\n' +
                '💡 Чем могу помочь:\n' +
                '• 📦 Каталог товаров и цены\n' +
                '• 🎯 Подбор под ваши задачи\n' +
                '• ❓ Ответы на вопросы\n\n' +
                '👨‍💼 Нужен человек? Напишите "консультант" или обратитесь к @drvapeservice\n\n' +
                'Что вас интересует?'
        );
        return;
    }

    if (text.toLowerCase() === '/catalog' || text.toLowerCase().includes('каталог') || text.toLowerCase().includes('цены')) {
        await sendMessage(chatId, getProductCatalog());
        return;
    }

    // 转人工服务
    if (
        text.toLowerCase().includes('консультант') ||
        text.toLowerCase().includes('человек') ||
        text.toLowerCase().includes('оператор') ||
        text.toLowerCase().includes('/human')
    ) {
        await sendMessage(chatId, '👨‍💼 Переключаю на личного консультанта...');
        await sendMessage(chatId, '👉 @drvapeservice - напишите напрямую владельцу');

        // 通知店主
        await sendMessage(
            OWNER_CHAT_ID,
            `🚨 ${username} запросил оператора!\\nChat ID: ${chatId}\\nhttps://t.me/${username.replace('@', '')}`
        );
        return;
    }

    // ========== AI 对话 ==========
    history.push({ role: 'user', content: text });
    if (history.length > 20) history.splice(1, history.length - 20);

    try {
        const response = await axios.post(
            'https://api.deepseek.com/chat/completions',
            {
                model: 'deepseek-chat',
                messages: history,
                temperature: 0.7,
                max_tokens: 800
            },
            {
                headers: {
                    Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiReply = response.data.choices[0].message.content;
        history.push({ role: 'assistant', content: aiReply });

        await sendMessage(chatId, aiReply);

        // ========== 检测订单确认 ==========
        const orderKeywords = ['оформить заказ', 'подтвердить заказ', 'заказать', 'оформляем', 'оформляй'];
        const isOrderConfirm = orderKeywords.some(kw => text.toLowerCase().includes(kw));

        if (isOrderConfirm) {
            // 延迟2秒后提取并发送订单
            setTimeout(async () => {
                const orderInfo = extractOrderInfo(history, username);
                if (orderInfo.products.length > 0 || orderInfo.phone) {
                    await sendOrderToOwner(orderInfo, username, chatId);
                    await sendMessage(
                        chatId,
                        `✅ <b>Заказ ${orderInfo.orderNumber} принят!</b>\\n\\n` +
                            `Мы свяжемся с вами для подтверждения.\\n` +
                            `Если есть вопросы - пишите @drvapeservice`
                    );
                }
            }, 2000);
        }

        // 通知店主（长消息或关键词）
        if (chatId != OWNER_CHAT_ID && (text.length > 20 || isOrderConfirm)) {
            await sendMessage(OWNER_CHAT_ID, `🔔 ${username}: ${text.substring(0, 40)}...`);
        }
    } catch (err) {
        console.error('AI 错误:', err.message);
        await sendMessage(chatId, 'Извините, система временно недоступна. Напишите @drvapeservice');
    }
}

// ========== Vercel Handler ==========
module.exports = async (req, res) => {
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'OK',
            message: 'Bot is running',
            products: Object.keys(PRODUCTS).length
        });
    }

    if (req.method === 'POST') {
        try {
            const update = req.body;

            if (update && update.message) {
                await handleMessage(update.message);
            }

            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('Webhook 错误:', err.message);
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
