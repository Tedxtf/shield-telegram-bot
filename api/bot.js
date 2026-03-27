const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

const SYSTEM_PROMPT = `Вы - AI-консультант магазина самообороны "ЩИТ". Ваша цель - профессиональным диалогом привести к заказу.

Продукты:
Перцовые баллончики: HJ-5(890₽), HJ-10(990₽), HJ-15(1090₽), HJ-20(1290₽), HJ-60(1690₽), HJ-110(2190₽)
Электрошокеры: Model-309(2290₽), Model-806(2490₽), Model-1202(2890₽), Model-1320(4290₽)
Доставка: Москва/СПб, CDEK 2-3 дня, бесплатно от 2 шт, анонимная упаковка

Принципы продаж:
1. Сначала узнайте потребности клиента (для чего/бюджет)
2. Рекомендуйте 2-3 товара, не больше
3. Подчеркивайте преимущества и выгоду
4. Создавайте срочность
5. Активно предлагайте оформить заказ
6. Отвечайте по-русски, кратко, с эмодзи

Если не уверены - скажите "уточню", сложные вопросы - "сейчас подключу коллегу~"`;

const conversations = new Map();

// Vercel Handler
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Bot is running',
      webhook: 'Set webhook to: https://your-domain.vercel.app/api/bot'
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

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from?.username || msg.from?.first_name || '未知用户';
  
  if (!text) return;
  
  console.log(`📩 ${username}: ${text}`);
  
  if (text === '/start') {
    await sendMessage(chatId, 
      '👋 Добро пожаловать в ЩИТ!\n\n' +
      'Я ваш консультант по средствам самообороны 🤖\n\n' +
      'Расскажите мне:\n' +
      '• Какой продукт вам нужен?\n' +
      '• Для каких целей? (город/природа/от собак)\n' +
      '• Какой бюджет?'
    );
    return;
  }
  
  if (text === '/catalog') {
    await sendMessage(chatId,
      '📦 Каталог товаров:\n\n' +
      '🌶️ Перцовые баллончики: HJ-5(890₽), HJ-10(990₽), HJ-15(1090₽), HJ-20(1290₽), HJ-60(1690₽), HJ-110(2190₽)\n\n' +
      '⚡ Электрошокеры: Model-309(2290₽), Model-806(2490₽), Model-1202(2890₽), Model-1320(4290₽)\n\n' +
      '🚚 Бесплатная доставка от 2 шт | Анонимная упаковка'
    );
    return;
  }
  
  if (text === '/human') {
    await sendMessage(chatId, '👨‍💼 Переключаю на оператора, подождите...');
    await sendMessage(OWNER_CHAT_ID, `🚨 ${username} просит оператора! Chat ID: ${chatId}`);
    return;
  }
  
  // AI 对话
  if (!conversations.has(chatId)) {
    conversations.set(chatId, [{ role: 'system', content: SYSTEM_PROMPT }]);
  }
  
  const history = conversations.get(chatId);
  history.push({ role: 'user', content: text });
  
  if (history.length > 15) history.splice(1, history.length - 15);
  
  const reply = await callDeepSeek(history);
  history.push({ role: 'assistant', content: reply });
  
  await sendMessage(chatId, reply);
  
  if (chatId != OWNER_CHAT_ID && text.length > 10) {
    await sendMessage(OWNER_CHAT_ID, `🔔 ${username}: ${text.substring(0, 30)}...`);
  }
}

async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    console.error('发送失败:', err.message);
  }
}

async function callDeepSeek(messages) {
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 600
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('DeepSeek 错误:', err.message);
    return 'Извините, система занята. Попробуйте позже.';
  }
}
