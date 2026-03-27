const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

const PRODUCTS = {
  'HJ-5': { name: 'HJ-5 (5ml)', price: 890, type: 'spray' },
  'HJ-10': { name: 'HJ-10 (10ml)', price: 990, type: 'spray' },
  'HJ-15': { name: 'HJ-15 (15ml)', price: 1090, type: 'spray' },
  'HJ-15W': { name: 'HJ-15W (15ml)', price: 1190, type: 'spray' },
  'HJ-20': { name: 'HJ-20 (20ml)', price: 1290, type: 'spray' },
  'HJ-20K': { name: 'HJ-20K (20ml)', price: 1390, type: 'spray' },
  'HJ-60': { name: 'HJ-60 (60ml)', price: 1690, type: 'spray' },
  'HJ-110': { name: 'HJ-110 (110ml)', price: 2190, type: 'spray' },
  'HJ-110S': { name: 'HJ-110S (110ml)', price: 2490, type: 'spray' },
  'Model-806': { name: 'Model-806', price: 2490, type: 'stun' },
  'Model-1202': { name: 'Model-1202', price: 2890, type: 'stun' },
  'Model-669': { name: 'Model-669', price: 3290, type: 'stun' },
  'Model-800': { name: 'Model-800', price: 2690, type: 'stun' },
  'Model-309': { name: 'Model-309', price: 2290, type: 'stun' },
  'Model-398': { name: 'Model-398', price: 2790, type: 'stun' },
  'Model-1108': { name: 'Model-1108', price: 3490, type: 'stun' },
  'Model-1158': { name: 'Model-1158', price: 3890, type: 'stun' },
  'Model-1320': { name: 'Model-1320', price: 4290, type: 'stun' },
  'Model-1138': { name: 'Model-1138', price: 2990, type: 'stun' }
};

const orderStates = new Map();
const dailyOrders = [];

function getCatalog() {
  let cat = '📦 НАШИ ТОВАРЫ:\n\n🌶️ ПЕРЦОВЫЕ БАЛЛОНЧИКИ:\n';
  for (const [k, v] of Object.entries(PRODUCTS)) {
    if (v.type === 'spray') cat += `• ${v.name} — ${v.price}₽\n`;
  }
  cat += '\n⚡ ЭЛЕКТРОШОКЕРЫ:\n';
  for (const [k, v] of Object.entries(PRODUCTS)) {
    if (v.type === 'stun') cat += `• ${v.name} — ${v.price}₽\n`;
  }
  cat += '\n🚚 Доставка 300-400₽\n';
  cat += '🎁 <b>БЕСПЛАТНАЯ ДОСТАВКА при заказе от 2 шт!</b>\n';
  cat += '💡 Совет: возьмите баллончик + шокер — выгодно и универсально';
  return cat;
}

const SYSTEM_PROMPT = `Вы — консультант магазина ЩИТ. Говорите как живой человек, тепло и профессионально. НЕ используйте * в ответах.

ТОВАРЫ:
Перцовые: HJ-5(890₽), HJ-10(990₽), HJ-15(1090₽), HJ-20(1290₽), HJ-60(1690₽), HJ-110(2190₽)
Шокеры: Model-309(2290₽), Model-806(2490₽), Model-1202(2890₽), Model-1320(4290₽)

ДОСТАВКА: 300-400₽, но БЕСПЛАТНО от 2 шт! Активно предлагайте взять 2 товара.

ВАЖНО:
- Цены фиксированы, скидок нет
- Оплата только переводом на Сбер/Тинькофф +79213393904 (Чао)
- После оплаты нужен скриншот
- Наличные не принимаем
- Других способов оплаты нет

ЗАДАЧИ: консультация, подбор, оформление заказа. Всё остальное — к @drvapeservice`;

const conversations = new Map();

async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (e) {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text.replace(/<[^>]+>/g, '')
    });
  }
}

function isCatalogRequest(text) {
  const t = text.toLowerCase();
  return ['каталог','цены','прайс','сколько стоит','какие есть','что есть','покажи товары','ассортимент','выбор','модели','виды','перцовый','шокер','баллончик'].some(k => t.includes(k));
}

function isDiscountRequest(text) {
  const t = text.toLowerCase();
  return ['скидк','дешевле','подешевле','бонус','акци','подарок','скинь цену','торг','можно ли дешевле'].some(k => t.includes(k));
}

function isOrderRequest(text) {
  const t = text.toLowerCase();
  return ['заказать','оформить заказ','хочу заказать','купить','приобрести','беру','оформляем'].some(k => t.includes(k));
}

function isComplexRequest(text) {
  const t = text.toLowerCase();
  return ['возврат','жалоба','претензия','спор','развод','полиция','юрист','адвокат','суд','проблема с заказом','не пришло','сломано','брак'].some(k => t.includes(k));
}

function extractProducts(text) {
  const found = [];
  const t = text.toLowerCase();
  for (const [code, data] of Object.entries(PRODUCTS)) {
    if (t.includes(code.toLowerCase()) || t.includes(data.name.toLowerCase().replace(' ', ''))) {
      found.push({ code, ...data });
    }
  }
  return found;
}

function validateAddress(address) {
  const hasCity = /москва|спб|санкт-петербург|казань|новосибирск|екатеринбург|нижний|челябинск|самара|омск|ростов|уфа|красноярск|воронеж|пермь|волгоград/i.test(address);
  const hasStreet = /улица|ул\.|проспект|пр-т|бульвар|переулок|просп/i.test(address);
  const hasNumber = /\d+/.test(address);
  return { hasCity, hasStreet, hasNumber, isValid: hasCity && hasStreet && hasNumber };
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const username = msg.from?.username || msg.from?.first_name || 'unknown';
  
  if (!text) return;
  console.log(`📩 ${username}: ${text}`);
  
  if (!conversations.has(chatId)) {
    conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
  }
  const state = conversations.get(chatId);
  
  // /start - 专业开场白
  if (text === '/start') {
    await sendMessage(chatId, 
      'Здравствуйте! 👋\n\n' +
      'Меня зовут Антон, я консультант магазина ЩИТ. Помогу подобрать средство самообороны под ваши задачи.\n\n' +
      'Чем могу быть полезен?\n' +
      '• 📋 Покажу актуальные цены и наличие\n' +
      '• 🎯 Подберу под конкретную ситуацию\n' +
      '• 📝 Оформлю заказ быстро и просто\n\n' +
      '💡 Кстати, при заказе от 2 шт доставка бесплатно — экономия 300-400₽\n\n' +
      'Если удобнее поговорить голосом или есть сложные вопросы — пишите моему коллеге @drvapeservice'
    );
    return;
  }
  
  // 复杂问题转人工
  if (isComplexRequest(text)) {
    await sendMessage(chatId, 
      'Этот вопрос требует личного внимания. Переключаю вас на @drvapeservice — он разберётся и поможет решить.'
    );
    await sendMessage(OWNER_CHAT_ID, `🚨 ${username}: сложный запрос\n"${text}"\nChat ID: ${chatId}`);
    return;
  }
  
  // 转人工
  if (text.toLowerCase().includes('консультант') || text.toLowerCase().includes('человек') || text.toLowerCase().includes('оператор')) {
    await sendMessage(chatId, 'Понял вас. Вот контакт моего коллеги @drvapeservice — он на связи и поможет со всеми вопросами.');
    await sendMessage(OWNER_CHAT_ID, `👤 ${username} запросил оператора\nChat ID: ${chatId}`);
    return;
  }
  
  // 折扣
  if (isDiscountRequest(text)) {
    await sendMessage(chatId, 
      'Цены у нас фиксированные, полномочий менять их у меня нет.\n\n' +
      'По вопросам оптовых закупок или специальных условий напишите @drvapeservice — он расскажет про наши оптовые прайсы.'
    );
    return;
  }
  
  // 目录
  if (isCatalogRequest(text)) {
    await sendMessage(chatId, getCatalog());
    return;
  }
  
  // 开始下单
  if (isOrderRequest(text) && !state.order) {
    const products = extractProducts(text);
    if (products.length > 0) {
      const total = products.reduce((s, p) => s + p.price, 0);
      const hasSpray = products.some(p => p.type === 'spray');
      state.order = { products, total, step: 'name', data: {}, hasSpray, tgName: username };
      
      let msg = `Отлично! Ваш выбор:\n` +
        products.map(p => `• ${p.name} — ${p.price}₽`).join('\n') +
        `\n\nИтого: ${total}₽`;
      
      if (products.length === 1) {
        msg += '\n\n💡 Кстати, если добавите ещё один товар (любой), доставка будет бесплатной — сэкономите 300-400₽!';
      } else {
        msg += '\n\n✅ У вас от 2 шт — доставка бесплатно!';
      }
      
      msg += '\n\nДавайте оформим заказ. Как вас зовут? (ФИО полностью)';
      
      await sendMessage(chatId, msg);
      return;
    }
  }
  
  // 订单流程
  if (state.order) {
    const order = state.order;
    
    if (order.step === 'name') {
      order.data.name = text;
      order.step = 'phone';
      await sendMessage(chatId, 'Ваш телефон? Нужен для связи курьера.\nПример: +7 999 123-45-67');
      return;
    }
    
    if (order.step === 'phone') {
      if (!/\+?7[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/.test(text)) {
        await sendMessage(chatId, 'Проверьте формат. Введите номер как в примере: +7 999 123-45-67');
        return;
      }
      order.data.phone = text;
      order.step = 'city';
      await sendMessage(chatId, 'В каком городе нужна доставка? (Москва, СПб и т.д.)');
      return;
    }
    
    if (order.step === 'city') {
      order.data.city = text;
      order.step = 'address';
      await sendMessage(chatId, 
        'Полный адрес доставки:\n' +
        '— улица\n' +
        '— дом, квартира\n' +
        '— подъезд, этаж (если нужно)\n\n' +
        'Пример: ул. Ленина, дом 10, квартира 5'
      );
      return;
    }
    
    if (order.step === 'address') {
      const v = validateAddress(text);
      if (!v.hasCity) {
        await sendMessage(chatId, 'Укажите, пожалуйста, город в адресе. Например: Москва, ул. Ленина, дом 10');
        return;
      }
      if (!v.hasStreet) {
        await sendMessage(chatId, 'Добавьте название улицы. Пример: ул. Ленина, дом 10, кв. 5');
        return;
      }
      if (!v.hasNumber) {
        await sendMessage(chatId, 'Укажите номер дома и квартиры');
        return;
      }
      order.data.address = text;
      order.step = 'confirm';
      
      await sendMessage(chatId, 
        'Проверьте данные заказа:\n\n' +
        `👤 ${order.data.name}\n` +
        `📞 ${order.data.phone}\n` +
        `🏙️ ${order.data.city}\n` +
        `📍 ${order.data.address}\n\n` +
        'Товары:\n' +
        order.products.map(p => `• ${p.name} — ${p.price}₽`).join('\n') +
        `\n\n💰 Итого: ${order.total}₽\n` +
        (order.products.length >= 2 ? '🚚 Доставка: бесплатно\n\n' : '\n') +
        'Всё верно? Напишите "ДА" для подтверждения.'
      );
      return;
    }
    
    if (order.step === 'confirm') {
      if (text.toLowerCase() === 'да' || text.toLowerCase().includes('верно')) {
        const orderNum = `AP${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${dailyOrders.length + 1}`;
        
        // 保存订单
        dailyOrders.push({
          orderNum,
          date: new Date(),
          tgName: order.tgName,
          name: order.data.name,
          phone: order.data.phone,
          city: order.data.city,
          address: order.data.address,
          products: order.products,
          total: order.total
        });
        
        // 发送给店主
        await sendMessage(OWNER_CHAT_ID, 
          `🛒 НОВЫЙ ЗАКАЗ ${orderNum}\n\n` +
          `👤 Клиент: @${order.tgName}\n` +
          `📋 ФИО: ${order.data.name}\n` +
          `📞 Телефон: ${order.data.phone}\n` +
          `🏙️ Город: ${order.data.city}\n` +
          `📍 Адрес: ${order.data.address}\n\n` +
          'Товары:\n' +
          order.products.map(p => `• ${p.name} — ${p.price}₽`).join('\n') +
          `\n\n💰 Итого: ${order.total}₽`
        );
        
        // 回复客户
        let reply = `✅ Заказ ${orderNum} оформлен!\n\n`;
        reply += 'Для оплаты переведите сумму на:\n';
        reply += '💳 +79213393904 (Чао)\n';
        reply += '🏦 Банк Санкт-Петербург\n\n';
        reply += 'После перевода пришлите скриншот сюда.\n';
        reply += '⏰ Заказ отправим в течение 1-2 дней после подтверждения оплаты.\n\n';
        
        if (order.hasSpray) {
          reply += '⚠️ ВАЖНО: Если будете тестировать перцовый баллончик — делайте это ТОЛЬКО на открытом воздухе, подальше от людей и животных. Очень сильное средство!\n\n';
        }
        
        reply += 'Спасибо за заказ! Если есть вопросы — @drvapeservice всегда на связи.';
        
        await sendMessage(chatId, reply);
        state.order = null;
        return;
      } else {
        await sendMessage(chatId, 'Что нужно изменить? Напишите: имя / телефон / город / адрес / товары');
        return;
      }
    }
  }
  
  // AI 对话
  state.messages.push({ role: 'user', content: text });
  if (state.messages.length > 20) state.messages.splice(1, state.messages.length - 20);
  
  try {
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: state.messages,
      temperature: 0.7,
      max_tokens: 600
    }, {
      headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
    });
    
    let reply = res.data.choices[0].message.content.replace(/\*/g, '');
    state.messages.push({ role: 'assistant', content: reply });
    await sendMessage(chatId, reply);
    
    if (chatId != OWNER_CHAT_ID && text.length > 15) {
      await sendMessage(OWNER_CHAT_ID, `🔔 ${username}: ${text.substring(0, 40)}...`);
    }
  } catch (e) {
    console.error('AI error:', e.message);
    await sendMessage(chatId, 'Технические неполадки. Напишите @drvapeservice — он поможет.');
  }
}

// 每天早上9点发送汇总
async function sendDailySummary() {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  if (moscowTime.getHours() !== 9) return;
  
  const yesterday9am = new Date(moscowTime);
  yesterday9am.setDate(yesterday9am.getDate() - 1);
  yesterday9am.setHours(9, 0, 0, 0);
  
  const today9am = new Date(moscowTime);
  today9am.setHours(9, 0, 0, 0);
  
  const yesterdayOrders = dailyOrders.filter(o => o.date >= yesterday9am && o.date < today9am);
  
  if (yesterdayOrders.length === 0) {
    await sendMessage(OWNER_CHAT_ID, '📊 За вчера (9:00-9:00) заказов не было.');
    return;
  }
  
  let summary = `📊 ЗАКАЗЫ ЗА ВЧЕРА (${yesterday9am.toLocaleDateString('ru-RU')} 9:00 — ${today9am.toLocaleDateString('ru-RU')} 9:00)\n\n`;
  summary += `Всего заказов: ${yesterdayOrders.length}\n\n`;
  
  yesterdayOrders.forEach((o, i) => {
    summary += `— ЗАКАЗ ${i + 1} —\n`;
    summary += `Номер: ${o.orderNum}\n`;
    summary += `TG: @${o.tgName}\n`;
    summary += `ФИО: ${o.name}\n`;
    summary += `Тел: ${o.phone}\n`;
    summary += `Город: ${o.city}\n`;
    summary += `Адрес: ${o.address}\n`;
    summary += `Товары: ${o.products.map(p => p.name).join(', ')}\n`;
    summary += `Сумма: ${o.total}₽\n\n`;
  });
  
  await sendMessage(OWNER_CHAT_ID, summary);
}

// 每小时检查是否需要发送汇总
setInterval(sendDailySummary, 60 * 60 * 1000);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'OK', orders: dailyOrders.length });
  }
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message) await handleMessage(message);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
