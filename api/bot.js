// Vercel Serverless Function for Telegram Bot
const axios = require('axios');

// 配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

// ========== 产品数据库 ==========
const PRODUCTS = {
    // 胡椒喷雾
    'HJ-5': { name: 'HJ-5 (5ml)', price: 569, desc: 'Дизайн как помада, компактный', bestFor: 'женщины, ежедневное ношение' },
    'HJ-10': { name: 'HJ-10 (10ml)', price: 579, desc: 'Дизайн как духи, элегантный', bestFor: 'женщины, сумочка' },
    'HJ-15': { name: 'HJ-15 (15ml)', price: 589, desc: 'Оптимальный баланс', bestFor: 'город, универсальный' },
    'HJ-15W': { name: 'HJ-15W (15ml)', price: 599, desc: 'Видно остаток жидкости', bestFor: 'контроль расхода' },
    'HJ-20': { name: 'HJ-20 (20ml)', price: 649, desc: 'Стандартный размер', bestFor: 'город, надежная защита' },
    'HJ-20K': { name: 'HJ-20K (20ml)', price: 699, desc: 'С кольцом для ключей', bestFor: 'удобное ношение' },
    'HJ-60': { name: 'HJ-60 (60ml)', price: 829, desc: 'Увеличенный объем', bestFor: 'походы, природа' },
    'HJ-110': { name: 'HJ-110 (110ml)', price: 899, desc: 'Профессиональный', bestFor: 'крупные животные' },
    'HJ-110S': { name: 'HJ-110S (110ml)', price: 999, desc: 'Полицейский, струйный', bestFor: 'встречный ветер' },

    // 电棍
    'Model-806': { name: 'Model-806', price: 1590, desc: 'Универсальная модель', bestFor: 'любые ситуации' },
    'Model-1202': { name: 'Model-1202', price: 1590, desc: 'Усиленный корпус', bestFor: 'активное использование' },
    'Model-669': { name: 'Model-669', price: 1690, desc: 'Увеличенная мощность', bestFor: 'длительная работа' },
    'Model-800': { name: 'Model-800', price: 1490, desc: 'Классический дизайн', bestFor: 'оптимальный выбор' },
    'Model-309': { name: 'Model-309', price: 1690, desc: 'Компактный размер', bestFor: 'портативность' },
    'Model-398': { name: 'Model-398', price: 1590, desc: 'Эргономичный дизайн', bestFor: 'город и природа' },
    'Model-1108': { name: 'Model-1108', price: 1999, desc: 'Мощный разряд', bestFor: 'экстремальные ситуации' },
    'Model-1158': { name: 'Model-1158', price: 2099, desc: 'Профессиональный уровень', bestFor: 'максимальная защита' },
    'Model-1320': { name: 'Model-1320', price: 2099, desc: 'Максимальная мощность', bestFor: 'топовая защита' },
    'Model-1138': { name: 'Model-1138', price: 2499, desc: 'Компактный и мощный', bestFor: 'ежедневное ношение' }
};

// 生成产品目录文本
function getProductCatalog() {
    let catalog = '📦 КАТАЛОГ ТОВАРОВ\\n\\n';
    catalog += '🌶️ <b>ПЕРЦОВЫЕ БАЛЛОНЧИКИ:</b>\\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('HJ')) {
            catalog += `• ${val.name} - ${val.price}₽\\n  └ ${val.desc}\\n`;
        }
    }
    catalog += '\\n⚡ <b>ЭЛЕКТРОШОКЕРЫ:</b>\\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('Model')) {
            catalog += `• ${val.name} - ${val.price}₽\\n  └ ${val.desc}\\n`;
        }
    }
    catalog += '\\n🚚 <b>Доставка:</b> Москва/СПб, CDEK 2-3 дня\\n';
    catalog += '🎁 <b>Бесплатно от 2 шт</b> | 📦 Анонимная упаковка';
    return catalog;
}

// ========== 系统提示词 ==========
const SYSTEM_PROMPT = `Вы - AI-консультант магазина самообороны "ЩИТ". Цель - профессиональным диалогом привести к заказу.

ПРАВИЛА:
1. Всегда отвечайте по-русски, кратко, с эмодзи
2. Никогда не используйте Markdown-оформление: **, *, __, _, #, \`\`\`
3. При запросе каталога - отправляйте полный список с ценами
4. Для подбора спрашивайте: бюджет, цель (город/природа/от собак), опыт
5. Рекомендуйте 2-3 товара с объяснением почему
6. Создавайте легкую срочность: "сегодня осталось X шт"
7. Для оформления заказа собирайте: имя, телефон, адрес, товары

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

// ========== 清理 AI 回复中的 Markdown 星号 ==========
function cleanAiText(text = '') {
    return text
        .replace(/\*\*(.*?)\*\*/gs, '$1')
        .replace(/\*(.*?)\*/gs, '$1')
        .replace(/__(.*?)__/gs, '$1')
        .replace(/_(.*?)_/gs, '$1')
        .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
        .replace(/^[ \t]*#{1,6}[ \t]*/gm, '')
        .replace(/\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
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
        if (fullText.includes(keyLower) ||
            fullText.includes(keyLower.replace('-', '')) ||
            fullText.includes(keyLower.replace('model-', ''))) {
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
        const text = msg.content.toLowerCase();
        if (addressKeywords.some(kw => text.includes(kw))) {
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
        conversations.set(chatId, [{ role: 'system', content: SYSTEM_PROMPT }]);
    }

    const history = conversations.get(chatId);

    // ========== 命令处理 ==========
    if (text === '/start') {
        await sendMessage(chatId,
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
    if (text.toLowerCase().includes('консультант') ||
        text.toLowerCase().includes('человек') ||
        text.toLowerCase().includes('оператор') ||
        text.toLowerCase().includes('/human')) {

        await sendMessage(chatId, '👨‍💼 Переключаю на личного консультанта...');
        await sendMessage(chatId, '👉 @drvapeservice - напишите напрямую владельцу');

        // 通知店主
        await sendMessage(OWNER_CHAT_ID, `🚨 ${username} запросил оператора!\\nChat ID: ${chatId}\\nhttps://t.me/${username.replace('@', '')}`);
        return;
    }

    // ========== AI 对话 ==========
    history.push({ role: 'user', content: text });
    if (history.length > 20) history.splice(1, history.length - 20);

    try {
        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: 'deepseek-chat',
            messages: history,
            temperature: 0.7,
            max_tokens: 800
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const rawAiReply = response.data.choices[0].message.content || '';
        const aiReply = cleanAiText(rawAiReply);

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
                    await sendMessage(chatId,
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
