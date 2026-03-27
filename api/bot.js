const axios = require('axios');

// ========== 配置 ==========
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

// ========== 真实商品库 ==========
const PRODUCTS = {
    // 胡椒喷雾
    'HJ-5': { name: 'HJ-5 (5ml)', price: 890, desc: 'Дизайн как помада, компактный', bestFor: 'женщины, ежедневное ношение' },
    'HJ-10': { name: 'HJ-10 (10ml)', price: 990, desc: 'Дизайн как духи, элегантный', bestFor: 'женщины, сумочка' },
    'HJ-15': { name: 'HJ-15 (15ml)', price: 1090, desc: 'Оптимальный баланс', bestFor: 'город, универсальный' },
    'HJ-15W': { name: 'HJ-15W (15ml)', price: 1190, desc: 'Видно остаток жидкости', bestFor: 'контроль расхода' },
    'HJ-20': { name: 'HJ-20 (20ml)', price: 1290, desc: 'Стандартный размер', bestFor: 'город, надежная защита' },
    'HJ-20K': { name: 'HJ-20K (20ml)', price: 1390, desc: 'С кольцом для ключей', bestFor: 'удобное ношение' },
    'HJ-60': { name: 'HJ-60 (60ml)', price: 1690, desc: 'Увеличенный объем', bestFor: 'походы, природа' },
    'HJ-110': { name: 'HJ-110 (110ml)', price: 2190, desc: 'Профессиональный', bestFor: 'крупные животные' },
    'HJ-110S': { name: 'HJ-110S (110ml)', price: 2490, desc: 'Полицейский, струйный', bestFor: 'встречный ветер' },
    // 电棍
    'Model-806': { name: 'Model-806', price: 2490, desc: 'Универсальная модель', bestFor: 'любые ситуации' },
    'Model-1202': { name: 'Model-1202', price: 2890, desc: 'Усиленный корпус', bestFor: 'активное использование' },
    'Model-669': { name: 'Model-669', price: 3290, desc: 'Увеличенная мощность', bestFor: 'длительная работа' },
    'Model-800': { name: 'Model-800', price: 2690, desc: 'Классический дизайн', bestFor: 'оптимальный выбор' },
    'Model-309': { name: 'Model-309', price: 2290, desc: 'Компактный размер', bestFor: 'портативность' },
    'Model-398': { name: 'Model-398', price: 2790, desc: 'Эргономичный дизайн', bestFor: 'город и природа' },
    'Model-1108': { name: 'Model-1108', price: 3490, desc: 'Мощный разряд', bestFor: 'экстремальные ситуации' },
    'Model-1158': { name: 'Model-1158', price: 3890, desc: 'Профессиональный уровень', bestFor: 'максимальная защита' },
    'Model-1320': { name: 'Model-1320', price: 4290, desc: 'Максимальная мощность', bestFor: 'топовая защита' },
    'Model-1138': { name: 'Model-1138', price: 2990, desc: 'Компактный и мощный', bestFor: 'ежедневное ношение' }
};

// 生成产品目录文本
function getProductCatalog() {
    let catalog = '📦 НАШИ ТОВАРЫ:\n\n';
    catalog += '🌶️ <b>ПЕРЦОВЫЕ БАЛЛОНЧИКИ:</b>\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('HJ')) {
            catalog += `• ${val.name} — ${val.price}₽\n`;
        }
    }
    catalog += '\n⚡ <b>ЭЛЕКТРОШОКЕРЫ:</b>\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('Model')) {
            catalog += `• ${val.name} — ${val.price}₽\n`;
        }
    }
    catalog += '\n🚚 <b>Доставка:</b> Москва/СПб, CDEK 2-3 дня\n';
    catalog += '🎁 <b>Бесплатно от 2 шт</b> | 📦 Анонимная упаковка\n\n';
    catalog += '💡 Для подбора напишите ваш бюджет и цель использования';
    return catalog;
}

// 生成商品库文本给 AI
function getProductKnowledge() {
    let knowledge = 'ТОЧНЫЙ КАТАЛОГ ТОВАРОВ (запрещено придумывать другие цены и модели):\n\n';
    knowledge += 'ПЕРЦОВЫЕ БАЛЛОНЧИКИ:\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('HJ')) {
            knowledge += `- ${val.name}: ${val.price}₽ — ${val.desc} (${val.bestFor})\n`;
        }
    }
    knowledge += '\nЭЛЕКТРОШОКЕРЫ:\n';
    for (const [key, val] of Object.entries(PRODUCTS)) {
        if (key.startsWith('Model')) {
            knowledge += `- ${val.name}: ${val.price}₽ — ${val.desc} (${val.bestFor})\n`;
        }
    }
    return knowledge;
}

// ========== 系统提示词（包含商品库） ==========
const SYSTEM_PROMPT = `Вы - AI-консультант магазина самообороны "ЩИТ". 

ВАЖНО: Используйте ТОЛЬКО товары из списка ниже. Запрещено придумывать цены, модели или характеристики!

${getProductKnowledge()}

ПРАВИЛА ОТВЕТОВ:
1. Всегда используйте точные цены из списка выше
2. При запросе каталога - отправляйте полный список
3. Для подбора спрашивайте: бюджет, цель (город/природа/от собак)
4. Рекомендуйте 2-3 конкретные модели из списка с точными ценами
5. Создавайте легкую срочность
6. Отвечайте по-русски, кратко, с эмодзи
7. Если товара нет в списке - не предлагайте!

КОМАНДЫ:
- "каталог", "цены", "прайс" - показать товары
- "консультант", "человек", "оператор" - перевод на @drvapeservice`;

// 存储对话历史
const conversations = new Map();

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

// ========== 检查是否为目录请求 ==========
function isCatalogRequest(text) {
    const lowerText = text.toLowerCase();
    const catalogKeywords = [
        '/catalog',
        'каталог',
        'цены',
        'прайс',
        'прайслист',
        'сколько стоит',
        'какие перцовые баллончики',
        'какие баллончики есть',
        'что есть из перцовых',
        'какие есть шокеры',
        'что есть в наличии',
        'покажи товары',
        'покажите товары',
        'что у вас есть',
        'ассортимент',
        'выбор',
        'модели',
        'виды',
        'перцовый баллончик',
        'электрошокер',
        'шокер'
    ];
    
    return catalogKeywords.some(keyword => lowerText.includes(keyword));
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
    
    // 检查是否为目录请求（包含更多自然问法）
    if (isCatalogRequest(text)) {
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
        await sendMessage(OWNER_CHAT_ID, `🚨 ${username} запросил оператора!\nChat ID: ${chatId}`);
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
        
        const aiReply = response.data.choices[0].message.content;
        history.push({ role: 'assistant', content: aiReply });
        
        await sendMessage(chatId, aiReply);
        
        // 通知店主（长消息）
        if (chatId != OWNER_CHAT_ID && text.length > 15) {
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
            products: Object.keys(PRODUCTS).length,
            webhook: 'Set: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>/api/bot'
        });
    }
    
    if (req.method === 'POST') {
        const { message } = req.body;
        if (message) {
            await handleMessage(message);
        }
        return res.status(200).json({ ok: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
