const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

const PRODUCTS = {
  'HJ-5': { name: 'HJ-5 (5ml)', price: 569, desc: 'Форм-фактор помады, сверхкомпактный, для ближней дистанции', bestFor: 'скрытое ношение, неожиданное применение, женская сумочка', size: '82×Ø18 мм', weight: '20 г', range: 'только ближняя дистанция', type: 'spray' },
  'HJ-10': { name: 'HJ-10 (10ml)', price: 579, desc: 'Узкий формат помады, более ёмкий, компактный и незаметный', bestFor: 'ежедневное скрытое ношение, для девушек, сумочка', size: '100×Ø18 мм', weight: '23.7 г', range: 'только ближняя дистанция', type: 'spray' },
  'HJ-15': { name: 'HJ-15 (15ml)', price: 589, desc: 'Тонкий спрей 15 мл, баланс компактности и объёма', bestFor: 'город, карман/сумка, скрытое ношение', size: '20×20×115 мм', weight: '33 г', range: 'только ближняя дистанция', type: 'spray' },
  'HJ-15W': { name: 'HJ-15W (15ml)', price: 599, desc: 'Версия с прозрачным окном, видно остаток жидкости', bestFor: 'тем, кто хочет контролировать остаток и расход', size: '118×Ø19.5 мм', weight: '33 г', range: 'только ближняя дистанция', type: 'spray' },
  'HJ-20': { name: 'HJ-20 (20ml)', price: 649, desc: 'Стандартная базовая модель, практичная и простая', bestFor: 'первый баллончик, повседневная защита в городе', size: '90×Ø20 мм', weight: '28 г', range: 'эффективно 1–2 м', type: 'spray' },
  'HJ-20K': { name: 'HJ-20K (20ml)', price: 699, desc: 'Модель с кольцом для ключей, максимально удобна для ношения', bestFor: 'ключи, сумка, быстрое извлечение, ежедневное ношение', size: '95×Ø20 мм', weight: '35 г', range: 'эффективно 1–2 м', type: 'spray' },
  'HJ-60': { name: 'HJ-60 (60ml)', price: 829, desc: 'Классический увеличенный объём, крышка с предохранителем', bestFor: 'тем, кому нужен больший запас и более уверенный формат', size: '115×Ø35 мм', weight: '75 г', range: 'эффективно до 1.5 м', type: 'spray' },
  'HJ-110': { name: 'HJ-110 (110ml)', price: 899, desc: 'Увеличенная версия HJ-60, хватает надолго', bestFor: 'долгое использование, максимальный запас объёма', size: '150×Ø35 мм', weight: '105 г', range: 'эффективно 1–2 м', type: 'spray' },
  'HJ-110S': { name: 'HJ-110S (110ml)', price: 999, desc: 'Струйная модель, мощная и более устойчива к встречному ветру', bestFor: 'требовательные задачи, максимальная эффективность среди переносных моделей', size: '150×Ø35 мм', weight: '105 г', range: 'струйный формат, 1–2 м', type: 'spray' },
  'Model-806': { name: 'Model-806', price: 1590, desc: 'Пальцевый электрошокер: маленький, скрытый, но с хорошей мощностью', bestFor: 'максимальная компактность, ближняя самооборона', size: '75×57×23 мм', weight: '185 г', feature: 'пальцевый формат', type: 'stun' },
  'Model-1202': { name: 'Model-1202', price: 1590, desc: 'Форм-фактор помады, неожиданное применение, есть фонарик', bestFor: 'для девушек, скрытое ношение, сумочка', size: '130×Ø25 мм', weight: '—', feature: 'маскировка под помаду + фонарик', type: 'stun' },
  'Model-669': { name: 'Model-669', price: 1690, desc: 'Стандартная универсальная модель с фонариком', bestFor: 'базовый выбор на каждый день', size: '138×50 мм, голова 20 мм', weight: '—', feature: 'классический формат + фонарик', type: 'stun' },
  'Model-800': { name: 'Model-800', price: 1490, desc: 'Классическая модель с более ярким светом, чем у 669', bestFor: 'если важна и самооборона, и подсветка', size: '109×55 мм, голова 10 мм', weight: '—', feature: 'улучшенная подсветка', type: 'stun' },
  'Model-309': { name: 'Model-309', price: 1690, desc: 'Изогнутая эргономичная форма, удобнее лежит в руке, есть фонарик', bestFor: 'комфортный хват, ежедневное ношение', size: '129×26 мм', weight: '—', feature: 'эргономичный изогнутый корпус', type: 'stun' },
  'Model-398': { name: 'Model-398', price: 1590, desc: 'Компактная стандартная модель для повседневного ношения', bestFor: 'тем, кто хочет простой и понятный формат', size: '106×41 мм, голова 16 мм', weight: '—', feature: 'компактный классический формат', type: 'stun' },
  'Model-1108': { name: 'Model-1108', price: 1999, desc: 'Фонарный формат, длиннее корпус и более сильная подсветка', bestFor: 'если нужен более серьёзный формат и хороший свет', size: '243 мм, рукоять 35 мм, голова 45 мм', weight: '—', feature: 'формат мини-фонаря', type: 'stun' },
  'Model-1158': { name: 'Model-1158', price: 2099, desc: 'Фонарный формат, короче 1108, удобнее для ношения', bestFor: 'тем, кто хочет баланс между размером и удобством', size: '176 мм, рукоять 35 мм, голова 36 мм', weight: '—', feature: 'средний формат фонаря', type: 'stun' },
  'Model-1320': { name: 'Model-1320', price: 2099, desc: 'Более крупный фонарный формат, ярче свет, декоративные золотые элементы', bestFor: 'тем, кому важны внешний вид и более сильная подсветка', size: '182 мм, рукоять 33 мм, голова 50 мм', weight: '—', feature: 'крупный фонарный формат', type: 'stun' },
  'Model-1138': { name: 'Model-1138', price: 2499, desc: 'Длинный дубинкообразный электрошокер с фонариком, усиленная пластиковая голова', bestFor: 'максимальный размер, жёсткий формат, возможность ударного применения', size: '376 мм, рукоять 31 мм, голова 45 мм', weight: '—', feature: 'дубинкообразный формат', type: 'stun' }
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

const SYSTEM_PROMPT = `Ты — консультант магазина ЩИТ. Отвечай кратко, по-человечески, без форматирования *.

ПРАВИЛА ОТВЕТА (строго):
- Максимум 3-4 предложения
- Без списков и нумерации
- Сразу к делу, без вступлений
- Теплый тон, как друг советует

ТОВАРЫ:
Баллончики: HJ-5 569₽, HJ-10 579₽, HJ-15 589₽, HJ-15W 599₽, HJ-20 649₽, HJ-20K 699₽, HJ-60 829₽, HJ-110 899₽, HJ-110S 999₽
Шокеры: Model-800 1490₽, Model-806/1202/398 1590₽, Model-669/309 1690₽, Model-1108 1999₽, Model-1158/1320 2099₽, Model-1138 2499₽

ДОСТАВКА: 300-400₽, бесплатно от 2 шт.
ОПЛАТА: перевод на +79213393904 (Чао), только так.

ЗАПРЕЩЕНО:
- Длинные объяснения
- Технические характеристики, если не спросили
- Повторять вопрос клиента
- Писать больше 4 предложений

Сложные вопросы — передай @drvapeservice`;


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
  // 排除具体产品型号查询
  if (/hj-\d|model-\d/.test(t)) return false;
  return ['каталог','цены','прайс','сколько стоит','какие есть','что есть','покажи товары','ассортимент','выбор','виды'].some(k => t.includes(k));
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

  // /chats - 查看最近聊天的用户（仅店主）
  if (text === '/chats' && chatId.toString() === OWNER_CHAT_ID) {
    let chatList = 'Последние диалоги:\n\n';
    let count = 0;
    for (const [cid, data] of conversations) {
      if (cid.toString() === OWNER_CHAT_ID) continue;
      const userMsgs = data.messages.filter(m => m.role === 'user');
      if (userMsgs.length > 0) {
        const lastMsg = userMsgs[userMsgs.length - 1].content.substring(0, 30);
        chatList += `Chat ID: ${cid} (${userMsgs.length} сообщ.)\nПоследнее: "${lastMsg}..."\n\n`;
        count++;
      }
      if (count >= 10) break;
    }
    if (count === 0) chatList = 'Пока нет активных диалогов.';
    await sendMessage(chatId, chatList);
    return;
  }

  // /history - 查看指定用户的聊天记录（仅店主）
  if (text.startsWith('/history') && chatId.toString() === OWNER_CHAT_ID) {
    const targetChatId = text.split(' ')[1];
    if (!targetChatId) {
      await sendMessage(chatId, 'Использование: /history [Chat ID]\nПример: /history 7762143855');
      return;
    }
    const targetConv = conversations.get(parseInt(targetChatId));
    if (!targetConv) {
      await sendMessage(chatId, `Диалог с Chat ID ${targetChatId} не найден.`);
      return;
    }
    let history = `История диалога ${targetChatId}:\n\n`;
    targetConv.messages.forEach((m, i) => {
      if (m.role === 'user' || m.role === 'assistant') {
        const role = m.role === 'user' ? 'Клиент' : 'Бот';
        history += `${role}: ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}\n\n`;
      }
    });
    // 如果消息太长，分段发送
    if (history.length > 4000) {
      const parts = history.match(/.{1,4000}/g);
      for (const part of parts) {
        await sendMessage(chatId, part);
      }
    } else {
      await sendMessage(chatId, history);
    }
    return;
  }
  
  // 复杂问题转人工
  if (isComplexRequest(text)) {
    await sendMessage(chatId, 
      'Это контакт владельца @drvapeservice — он увидит сообщение и ответит вам в ближайшее время.'
    );
    await sendMessage(OWNER_CHAT_ID, `${username}: сложный запрос "${text}" Chat ID: ${chatId}`);
    return;
  }
  
  // 转人工
  if (text.toLowerCase().includes('консультант') || text.toLowerCase().includes('человек') || text.toLowerCase().includes('оператор')) {
    await sendMessage(chatId, 'Это контакт владельца @drvapeservice — он увидит сообщение и ответит вам в ближайшее время.');
    await sendMessage(OWNER_CHAT_ID, `${username} запросил оператора Chat ID: ${chatId}`);
    return;
  }
  
  // 折扣
  if (isDiscountRequest(text)) {
    await sendMessage(chatId, 
      'Цены фиксированные. По вопросам опта пишите @drvapeservice — он увидит и ответит в ближайшее время.'
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
    
    // 处理金额确认（用户发送截图后输入金额）
    if (order.step === 'payment_amount') {
      const amount = parseInt(text.replace(/\D/g, ''));
      if (amount > 0) {
        order.total = amount;
        order.step = 'name';
        order.paymentConfirmed = true;
        await sendMessage(chatId, 
          `✅ Оплата ${amount}₽ подтверждена!\n\n` +
          `Давайте оформим доставку. Как вас зовут? (ФИО полностью)`
        );
        
        await sendMessage(OWNER_CHAT_ID, 
          `Платёж от @${username} Сумма: ${amount}₽ Статус: ожидает данные для доставки`
        );
      } else {
        await sendMessage(chatId, 'Пожалуйста, введите сумму цифрами (например: 2139)');
      }
      return;
    }
    
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
      
      // 根据是否有产品信息显示不同内容
      let confirmMsg = 'Проверьте данные заказа:\n\n' +
        `👤 ${order.data.name}\n` +
        `📞 ${order.data.phone}\n` +
        `🏙️ ${order.data.city}\n` +
        `📍 ${order.data.address}\n\n`;
      
      if (order.products && order.products.length > 0) {
        confirmMsg += 'Товары:\n' +
          order.products.map(p => `• ${p.name} — ${p.price}₽`).join('\n') +
          `\n\n💰 Итого: ${order.total}₽\n` +
          (order.products.length >= 2 ? '🚚 Доставка: бесплатно\n\n' : '\n');
      } else if (order.paymentConfirmed) {
        confirmMsg += `💰 Оплачено: ${order.total}₽\n\n`;
      }
      
      confirmMsg += 'Всё верно? Напишите "ДА" для подтверждения.';
      
      await sendMessage(chatId, confirmMsg);
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
          products: order.products || [],
          total: order.total,
          paymentConfirmed: order.paymentConfirmed || false
        });
        
        // 发送给店主
        let ownerMsg = `НОВЫЙ ЗАКАЗ ${orderNum} Клиент: @${order.tgName} ФИО: ${order.data.name} Телефон: ${order.data.phone} Город: ${order.data.city} Адрес: ${order.data.address}`;
        
        if (order.products && order.products.length > 0) {
          ownerMsg += ` Товары: ${order.products.map(p => `${p.name} ${p.price}₽`).join(', ')} Итого: ${order.total}₽`;
        } else {
          ownerMsg += ` Оплачено: ${order.total}₽ (уточнить товары)`;
        }
        
        await sendMessage(OWNER_CHAT_ID, ownerMsg);
        
        // 回复客户
        let reply = `✅ Заказ ${orderNum} оформлен!\n\n`;
        
        if (!order.paymentConfirmed) {
          reply += 'Для оплаты переведите сумму на:\n';
          reply += '💳 +79213393904 (Чао)\n';
          reply += '🏦 Банк Санкт-Петербург\n\n';
          reply += 'После перевода пришлите скриншот сюда.\n';
        }
        
        reply += '⏰ Заказ отправим в течение 1-2 дней.\n\n';
        
        if (order.hasSpray) {
          reply += '⚠️ ВАЖНО: Если будете тестировать перцовый баллончик — делайте это ТОЛЬКО на открытом воздухе, подальше от людей и животных.\n\n';
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
      max_tokens: 150
    }, {
      headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
    });
    
    let reply = res.data.choices[0].message.content.replace(/\*/g, '');
    state.messages.push({ role: 'assistant', content: reply });
    await sendMessage(chatId, reply);
    
    // 不再实时通知普通消息，只通过 /history 查看
  } catch (e) {
    console.error('AI error:', e.message);
    await sendMessage(chatId, 'Технические неполадки. Напишите @drvapeservice — он увидит и ответит в ближайшее время.');
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
    await sendMessage(OWNER_CHAT_ID, 'За вчера (9:00-9:00) заказов не было.');
    return;
  }
  
  let summary = `ЗАКАЗЫ ЗА ВЧЕРА (${yesterday9am.toLocaleDateString('ru-RU')} 9:00 — ${today9am.toLocaleDateString('ru-RU')} 9:00) Всего заказов: ${yesterdayOrders.length} `;
  
  yesterdayOrders.forEach((o, i) => {
    summary += `ЗАКАЗ ${i + 1}: ${o.orderNum} Клиент: @${o.tgName} ФИО: ${o.name} Тел: ${o.phone} Город: ${o.city} Адрес: ${o.address} Товары: ${o.products.map(p => p.name).join(', ')} Сумма: ${o.total}₽ `;
  });
  
  await sendMessage(OWNER_CHAT_ID, summary);
}

// 每小时检查是否需要发送汇总
setInterval(sendDailySummary, 60 * 60 * 1000);

async function handlePhoto(msg) {
  const chatId = msg.chat.id;
  const username = msg.from?.username || msg.from?.first_name || 'unknown';
  const photo = msg.photo?.[msg.photo.length - 1];
  
  if (!photo) return;
  
  console.log(`📸 ${username} отправил фото`);
  
  try {
    // 获取图片文件信息
    const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`);
    const filePath = fileRes.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    
    // 初始化订单状态
    if (!conversations.has(chatId)) {
      conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
    }
    const state = conversations.get(chatId);
    
    // 设置订单状态为等待金额确认
    state.order = { 
      products: [], 
      total: 0, 
      step: 'payment_amount', 
      data: {}, 
      hasSpray: false, 
      tgName: username,
      paymentScreenshot: fileUrl
    };
    
    await sendMessage(chatId, 
      '✅ Скриншот получен!\n\n' +
      'Напишите сумму перевода цифрами (например: 2139), чтобы я подтвердил оплату.'
    );
    
    // 通知店主
    await sendMessage(OWNER_CHAT_ID, 
      `@${username} отправил скриншот оплаты Ссылка: ${fileUrl} Ожидает подтверждения суммы`
    );
    
  } catch (e) {
    console.error('Ошибка обработки фото:', e.message);
    await sendMessage(chatId, 
      'Получил фото. Напишите сумму перевода цифрами, или свяжитесь с @drvapeservice — он увидит и ответит в ближайшее время.'
    );
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'OK', orders: dailyOrders.length });
  }
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message) {
      if (message.photo) {
        await handlePhoto(message);
      } else if (message.text) {
        await handleMessage(message);
      }
    }
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
