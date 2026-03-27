const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;
const SHIPPING_FEE = 350;

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

const dailyOrders = [];
const conversations = new Map();

const SYSTEM_PROMPT = `Ты — консультант магазина ЩИТ. Отвечай кратко, по-человечески, без форматирования *.

ПРАВИЛА ОТВЕТА (строго):
- Максимум 3-4 предложения
- Без списков и нумерации
- Сразу к делу, без вступлений
- Теплый тон, как друг советует

ТОВАРЫ:
Баллончики: HJ-5 569₽, HJ-10 579₽, HJ-15 589₽, HJ-15W 599₽, HJ-20 649₽, HJ-20K 699₽, HJ-60 829₽, HJ-110 899₽, HJ-110S 999₽
Шокеры: Model-800 1490₽, Model-806/1202/398 1590₽, Model-669/309 1690₽, Model-1108 1999₽, Model-1158/1320 2099₽, Model-1138 2499₽

ДОСТАВКА: 350₽, бесплатно от 2 шт.
ОПЛАТА: перевод на +79213393904 (Чао), только так.

ЗАПРЕЩЕНО:
- Длинные объяснения
- Повторять вопрос клиента
- Писать больше 4 предложений

Сложные вопросы — передай @drvapeservice`;

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCatalog() {
  let cat = '📦 НАШИ ТОВАРЫ:\n\n🌶️ ПЕРЦОВЫЕ БАЛЛОНЧИКИ:\n';
  for (const [, v] of Object.entries(PRODUCTS)) {
    if (v.type === 'spray') cat += `• ${v.name} — ${v.price}₽\n`;
  }
  cat += '\n⚡ ЭЛЕКТРОШОКЕРЫ:\n';
  for (const [, v] of Object.entries(PRODUCTS)) {
    if (v.type === 'stun') cat += `• ${v.name} — ${v.price}₽\n`;
  }
  cat += `\n🚚 Доставка ${SHIPPING_FEE}₽\n`;
  cat += '🎁 <b>БЕСПЛАТНАЯ ДОСТАВКА при заказе от 2 шт!</b>\n';
  cat += '💡 Совет: возьмите баллончик + шокер — выгодно и универсально';
  return cat;
}

function getProductsByType(type) {
  return Object.entries(PRODUCTS)
    .filter(([, v]) => v.type === type)
    .map(([code, data]) => ({ code, ...data }));
}

function formatProducts(products) {
  return products.map(p => `• ${p.name} — ${p.price}₽`).join('\n');
}

function calculateTotal(products) {
  return products.reduce((sum, p) => sum + p.price, 0);
}

function getDeliveryFee(productCount = 0) {
  return productCount >= 2 ? 0 : SHIPPING_FEE;
}

function getOrderGrandTotal(order) {
  return calculateTotal(order.products || []) + getDeliveryFee((order.products || []).length);
}

function buildDeliveryReply(productCount = 0) {
  const fee = getDeliveryFee(productCount);
  if (fee === 0) {
    return 'Доставка у вас будет бесплатной, потому что в заказе уже 2 товара или больше.';
  }
  return `Доставка фиксированная — ${SHIPPING_FEE}₽. Если в заказе только 1 товар, к цене товара добавляется ${SHIPPING_FEE}₽.`;
}

function buildTypeCatalog(type) {
  const items = getProductsByType(type);
  const title = type === 'spray' ? '🌶️ ПЕРЦОВЫЕ БАЛЛОНЧИКИ:' : '⚡ ЭЛЕКТРОШОКЕРЫ:';
  let msg = `${title}\n`;
  items.forEach(item => {
    msg += `• ${item.name} — ${item.price}₽\n`;
  });
  msg += `\n🚚 Доставка ${SHIPPING_FEE}₽`;
  msg += '\n🎁 От 2 шт доставка бесплатно';
  return msg;
}

function buildSelectionHelp(type) {
  if (type === 'spray') {
    return 'По баллончикам могу быстро подсказать: самый компактный HJ-5, популярный скрытый вариант HJ-10, более уверенный HJ-20. Напишите модель, например HJ-10, и я сразу посчитаю итог.';
  }
  if (type === 'stun') {
    return 'По шокерам чаще берут Model-800 или Model-806. Напишите модель, например Model-800, и я сразу посчитаю итог.';
  }
  return 'Напишите модель товара, и я сразу подскажу по нему.';
}

function buildPriceReply(type, productsInMessage = []) {
  if (productsInMessage.length === 1) {
    const p = productsInMessage[0];
    const grandTotal = p.price + SHIPPING_FEE;
    return `${p.name} стоит ${p.price}₽. Если брать только один товар, доставка будет ${SHIPPING_FEE}₽, итого ${grandTotal}₽. Если взять 2 товара и больше, доставка бесплатная.`;
  }

  if (productsInMessage.length > 1) {
    const total = calculateTotal(productsInMessage);
    return `По этим моделям вместе выходит ${total}₽. Так как товаров уже от 2 штук, доставка будет бесплатной.`;
  }

  if (type === 'spray') {
    return `По баллончикам цены от 569₽ до 999₽. Если брать один товар, доставка фиксированная — ${SHIPPING_FEE}₽, а от 2 товаров бесплатно.`;
  }

  if (type === 'stun') {
    return `По шокерам цены от 1490₽ до 2499₽. Если брать один товар, доставка фиксированная — ${SHIPPING_FEE}₽, а от 2 товаров бесплатно.`;
  }

  return `Доставка фиксированная — ${SHIPPING_FEE}₽ за заказ с одним товаром, а от 2 товаров бесплатно. Напишите модель, и я сразу посчитаю точную сумму.`;
}

function isInfoRequest(text) {
  const t = normalizeText(text);
  return [
    'размер', 'габарит', 'вес', 'удобно', 'носить', 'с собой', 'карман', 'сумк',
    'дальность', 'дальн', 'мощн', 'отлич', 'для чего', 'что лучше', 'компакт',
    'удобен', 'удобно ли', 'как насчет', 'как насчёт', 'что скажете', 'расскажите',
    'подойдет', 'подойдёт', 'советуете', 'посоветуйте', 'что за'
  ].some(k => t.includes(k));
}

function isDeliveryRequest(text) {
  return normalizeText(text).includes('доставка');
}

function buildProductInfoReply(product, text) {
  const t = normalizeText(text);
  const parts = [];

  if (t.includes('размер') || t.includes('габарит')) {
    parts.push(`Размер ${product.size}.`);
  }

  if (t.includes('вес') && product.weight && product.weight !== '—') {
    parts.push(`Вес ${product.weight}.`);
  }

  if (t.includes('дальность') || t.includes('дальн')) {
    if (product.range) parts.push(`По работе: ${product.range}.`);
  }

  if (t.includes('носить') || t.includes('с собой') || t.includes('карман') || t.includes('сумк') || t.includes('удобно')) {
    const bulky = /150×Ø35|115×Ø35|243|376|182|176/.test(product.size || '');
    if (bulky) {
      parts.push('Носить с собой можно, но это уже не самый компактный формат — удобнее сумка, бардачок или большая куртка.');
    } else {
      parts.push('Для повседневного ношения формат довольно удобный, особенно в сумке или кармане одежды.');
    }
  }

  if (parts.length === 0) {
    if (product.desc) parts.push(product.desc + '.');
    if (product.bestFor) parts.push(`Главный плюс — ${product.bestFor}.`);
    if (product.size) parts.push(`Размер ${product.size}.`);
    if (product.weight && product.weight !== '—') parts.push(`Вес ${product.weight}.`);
  }

  return `${product.name}: ${parts.join(' ')} Если хотите, могу сразу посчитать итог с доставкой или помочь оформить заказ.`;
}

function detectPreferredType(text) {
  const t = normalizeText(text);
  const sprayWords = ['баллончик', 'баллон', 'перц', 'pepper spray', 'спрей'];
  const stunWords = ['шокер', 'электрошокер', 'электрошок', 'stun'];
  const hasSpray = sprayWords.some(w => t.includes(w));
  const hasStun = stunWords.some(w => t.includes(w));
  if (hasSpray && !hasStun) return 'spray';
  if (hasStun && !hasSpray) return 'stun';
  return null;
}

function isCatalogRequest(text) {
  const t = normalizeText(text);
  if (/hj[-\s]?\d|model[-\s]?\d/.test(t)) return false;
  return ['каталог', 'цены', 'прайс', 'какие есть', 'что есть', 'покажи товары', 'ассортимент', 'выбор', 'виды'].some(k => t.includes(k));
}

function isPriceRequest(text) {
  const t = normalizeText(text);
  return ['сколько стоит', 'цена', 'по чем', 'почем', 'стоимость'].some(k => t.includes(k));
}

function isDiscountRequest(text) {
  const t = normalizeText(text);
  return ['скидк', 'дешевле', 'подешевле', 'бонус', 'акци', 'подарок', 'скинь цену', 'торг', 'можно ли дешевле'].some(k => t.includes(k));
}

function isComplexRequest(text) {
  const t = normalizeText(text);
  return ['возврат', 'жалоба', 'претензия', 'спор', 'развод', 'полиция', 'юрист', 'адвокат', 'суд', 'проблема с заказом', 'не пришло', 'сломано', 'брак'].some(k => t.includes(k));
}

function wantsHuman(text) {
  const t = normalizeText(text);
  return t.includes('консультант') || t.includes('человек') || t.includes('оператор');
}

function hasPurchaseSignal(text) {
  const t = normalizeText(text);
  return ['заказать', 'оформить заказ', 'хочу заказать', 'купить', 'куплю', 'купим', 'приобрести', 'беру', 'возьму', 'возьмем', 'возьмём', 'оформляем', 'забираю', 'оформи', 'добавь', 'добавьте', 'нужен', 'нужна', 'нужно', 'хочу'].some(k => t.includes(k));
}

function wantsModifyOrder(text) {
  const t = normalizeText(text);
  return ['измени', 'изменить', 'поменяй', 'поменять', 'замени', 'заменить', 'добавь', 'добавьте', 'еще', 'ещё', 'убери', 'убрать', 'товар', 'передумал', 'теперь хочу', 'только один'].some(k => t.includes(k));
}

function isYes(text) {
  const t = normalizeText(text);
  return t === 'да' || t.includes('верно') || t.includes('подтверждаю');
}

function extractProducts(text) {
  const normalized = normalizeText(text);
  const found = [];

  for (const [code, data] of Object.entries(PRODUCTS)) {
    const pattern = code.toLowerCase().replace('-', '[-\\s]?');
    const regex = new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, 'i');
    if (regex.test(normalized)) {
      found.push({ code, ...data });
      continue;
    }

    if (code.startsWith('HJ-')) {
      const shortCode = code.toLowerCase().replace('-', '');
      if (normalized.includes(shortCode)) {
        found.push({ code, ...data });
      }
    }
  }

  return found.filter((item, index, arr) => arr.findIndex(x => x.code === item.code) === index);
}

function validateAddress(address) {
  const hasCity = /москва|спб|санкт-петербург|казань|новосибирск|екатеринбург|нижний|челябинск|самара|омск|ростов|уфа|красноярск|воронеж|пермь|волгоград/i.test(address);
  const hasStreet = /улица|ул\.|проспект|пр-т|бульвар|переулок|просп/i.test(address);
  const hasNumber = /\d+/.test(address);
  return { hasCity, hasStreet, hasNumber, isValid: hasCity && hasStreet && hasNumber };
}

function createEmptyOrder(username, preferredType = null) {
  return {
    products: [],
    total: 0,
    step: 'product_selection',
    data: {},
    hasSpray: preferredType === 'spray',
    preferredType,
    tgName: username,
    paymentConfirmed: false,
    intentConfirmed: false
  };
}

function setOrderProducts(order, products, mode = 'replace') {
  if (mode === 'add' && Array.isArray(order.products) && order.products.length > 0) {
    const merged = [...order.products];
    for (const item of products) {
      if (!merged.some(p => p.code === item.code)) merged.push(item);
    }
    order.products = merged;
  } else {
    order.products = products;
  }

  order.total = calculateTotal(order.products);
  order.hasSpray = order.products.some(p => p.type === 'spray');
  if (!order.preferredType && order.products.length === 1) {
    order.preferredType = order.products[0].type;
  }
}

async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    });
  } catch (e) {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text.replace(/<[^>]+>/g, '')
    });
  }
}

function getNextOrderPrompt(order) {
  if (!order.intentConfirmed) {
    return {
      step: 'order_offer',
      prompt: 'Если хотите, помогу оформить заказ. Напишите «ДА», и я попрошу данные для доставки. Если хотите изменить товары, просто напишите, что добавить или заменить.'
    };
  }
  if (!order.data.name) {
    return {
      step: 'name',
      prompt: 'Как зовут получателя? (ФИО полностью)'
    };
  }
  if (!order.data.city) {
    return {
      step: 'city',
      prompt: 'В каком городе нужна доставка? (Москва, СПб и т.д.)'
    };
  }
  if (!order.data.address) {
    return {
      step: 'address',
      prompt:
        'Полный адрес доставки:\n' +
        '— улица\n' +
        '— дом, квартира\n' +
        '— подъезд, этаж (если нужно)\n\n' +
        'Пример: ул. Ленина, дом 10, квартира 5'
    };
  }
  if (!order.data.phone) {
    return {
      step: 'phone',
      prompt: 'Контактный телефон получателя:\nПример: +7 999 123-45-67'
    };
  }
  return {
    step: 'confirm',
    prompt: 'Если всё верно, напишите «ДА» для подтверждения. Если нужно что-то поменять, просто напишите, что именно.'
  };
}

async function startOrderFromProducts(chatId, state, username, products, mode = 'replace') {
  if (!state.order) {
    state.order = createEmptyOrder(username, products[0]?.type || null);
  }

  setOrderProducts(state.order, products, mode);
  const next = getNextOrderPrompt(state.order);
  state.order.step = next.step;

  const deliveryFee = getDeliveryFee(state.order.products.length);
  const grandTotal = getOrderGrandTotal(state.order);

  let msg = `Отлично! Ваш выбор:\n${formatProducts(state.order.products)}\n\nТовары: ${state.order.total}₽\n`;
  msg += deliveryFee === 0 ? 'Доставка: бесплатно\n' : `Доставка: ${deliveryFee}₽\n`;
  msg += `Итого: ${grandTotal}₽`;

  if (deliveryFee > 0) {
    msg += `\n\n💡 Если добавите ещё один товар, доставка станет бесплатной — сэкономите ${SHIPPING_FEE}₽!`;
  } else {
    msg += '\n\n✅ У вас от 2 шт — доставка бесплатная!';
  }

  msg += `\n\n${next.prompt}`;
  await sendMessage(chatId, msg);
}

async function handleContextualOrderMessage(chatId, state, username, text) {
  const order = state.order;
  const products = extractProducts(text);
  const preferredTypeFromText = detectPreferredType(text) || order.preferredType;
  const asksPrice = isPriceRequest(text);
  const asksCatalog = isCatalogRequest(text);
  const asksDelivery = isDeliveryRequest(text);
  const infoRequest = isInfoRequest(text);
  const purchaseSignal = hasPurchaseSignal(text);
  const wantsModify = wantsModifyOrder(text);
  const justPriceForProduct = asksPrice && products.length > 0 && !purchaseSignal && !wantsModify;

  if (!order) return false;

  if (order.step !== 'payment_amount' && asksDelivery) {
    await sendMessage(chatId, buildDeliveryReply((order.products || []).length));
    return true;
  }

  if (order.step !== 'payment_amount' && infoRequest && products.length === 1) {
    await sendMessage(chatId, buildProductInfoReply(products[0], text));
    return true;
  }

  if (order.step !== 'payment_amount' && products.length > 0 && (purchaseSignal || wantsModify)) {
    const addMode = order.products.length > 0 && (normalizeText(text).includes('еще') || normalizeText(text).includes('ещё'));
    await startOrderFromProducts(chatId, state, username, products, addMode ? 'add' : 'replace');
    return true;
  }

  if (order.step !== 'payment_amount' && !products.length && preferredTypeFromText && (purchaseSignal || wantsModify)) {
    order.preferredType = preferredTypeFromText;
    await sendMessage(chatId, buildSelectionHelp(preferredTypeFromText));
    return true;
  }

  if (order.step !== 'payment_amount' && justPriceForProduct) {
    await sendMessage(chatId, buildPriceReply(preferredTypeFromText, products));
    return true;
  }

  if (order.step !== 'payment_amount' && asksPrice) {
    await sendMessage(chatId, buildPriceReply(preferredTypeFromText, products));
    return true;
  }

  if (order.step !== 'payment_amount' && asksCatalog) {
    await sendMessage(chatId, preferredTypeFromText ? buildTypeCatalog(preferredTypeFromText) : getCatalog());
    return true;
  }

  return false;
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

  if (text === '/start') {
    conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
    await sendMessage(chatId,
      'Здравствуйте! 👋\n\n' +
      'Меня зовут Антон, я консультант магазина ЩИТ. Помогу подобрать средство самообороны под ваши задачи.\n\n' +
      'Чем могу быть полезен?\n' +
      '• 📋 Покажу актуальные цены и наличие\n' +
      '• 🎯 Подберу под конкретную ситуацию\n' +
      '• 📝 Помогу оформить заказ\n\n' +
      `💡 Доставка фиксированная ${SHIPPING_FEE}₽, а от 2 товаров бесплатно\n\n` +
      'Если удобнее поговорить голосом или есть сложные вопросы — пишите моему коллеге @drvapeservice'
    );
    return;
  }

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

  if (text.startsWith('/history') && chatId.toString() === OWNER_CHAT_ID) {
    const targetChatId = text.split(' ')[1];
    if (!targetChatId) {
      await sendMessage(chatId, 'Использование: /history [Chat ID]\nПример: /history 7762143855');
      return;
    }
    const targetConv = conversations.get(parseInt(targetChatId, 10));
    if (!targetConv) {
      await sendMessage(chatId, `Диалог с Chat ID ${targetChatId} не найден.`);
      return;
    }
    let history = `История диалога ${targetChatId}:\n\n`;
    targetConv.messages.forEach(m => {
      if (m.role === 'user' || m.role === 'assistant') {
        const role = m.role === 'user' ? 'Клиент' : 'Бот';
        history += `${role}: ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}\n\n`;
      }
    });
    if (history.length > 4000) {
      const parts = history.match(/.{1,4000}/g) || [];
      for (const part of parts) {
        await sendMessage(chatId, part);
      }
    } else {
      await sendMessage(chatId, history);
    }
    return;
  }

  if (text.startsWith('/reset') && chatId.toString() === OWNER_CHAT_ID) {
    const targetChatId = text.split(' ')[1];
    if (!targetChatId) {
      await sendMessage(chatId, 'Использование: /reset [Chat ID]\nПример: /reset 7762143855');
      return;
    }
    const targetConv = conversations.get(parseInt(targetChatId, 10));
    if (!targetConv) {
      await sendMessage(chatId, `Диалог с Chat ID ${targetChatId} не найден.`);
      return;
    }
    targetConv.order = null;
    targetConv.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    await sendMessage(chatId, `Состояние диалога ${targetChatId} сброшено.`);
    return;
  }

  if (isComplexRequest(text)) {
    await sendMessage(chatId, 'Это контакт владельца @drvapeservice — он увидит сообщение и ответит вам в ближайшее время.');
    await sendMessage(OWNER_CHAT_ID, `${username}: сложный запрос "${text}" Chat ID: ${chatId}`);
    return;
  }

  if (wantsHuman(text)) {
    await sendMessage(chatId, 'Это контакт владельца @drvapeservice — он увидит сообщение и ответит вам в ближайшее время.');
    await sendMessage(OWNER_CHAT_ID, `${username} запросил оператора Chat ID: ${chatId}`);
    return;
  }

  if (isDiscountRequest(text)) {
    await sendMessage(chatId, 'Цены фиксированные. По вопросам опта пишите @drvapeservice — он увидит и ответит в ближайшее время.');
    return;
  }

  const productsInMessage = extractProducts(text);
  const preferredTypeFromText = detectPreferredType(text);
  const purchaseSignal = hasPurchaseSignal(text);
  const asksPrice = isPriceRequest(text);
  const asksDelivery = isDeliveryRequest(text);
  const infoRequest = isInfoRequest(text);

  if (state.order) {
    const handledByContext = await handleContextualOrderMessage(chatId, state, username, text);
    if (handledByContext) return;
  }

  if (!state.order && asksDelivery) {
    await sendMessage(chatId, buildDeliveryReply(productsInMessage.length));
    return;
  }

  if (!state.order && infoRequest && productsInMessage.length === 1) {
    await sendMessage(chatId, buildProductInfoReply(productsInMessage[0], text));
    return;
  }

  if (!state.order && asksPrice && (productsInMessage.length > 0 || preferredTypeFromText)) {
    await sendMessage(chatId, buildPriceReply(preferredTypeFromText, productsInMessage));
    return;
  }

  if (!state.order && purchaseSignal && productsInMessage.length > 0) {
    await startOrderFromProducts(chatId, state, username, productsInMessage, 'replace');
    return;
  }

  if (!state.order && purchaseSignal && preferredTypeFromText) {
    state.order = createEmptyOrder(username, preferredTypeFromText);
    state.order.step = 'product_selection';
    await sendMessage(chatId, buildSelectionHelp(preferredTypeFromText));
    return;
  }

  if (!state.order && productsInMessage.length > 0 && !purchaseSignal) {
    if (infoRequest) {
      await sendMessage(chatId, buildProductInfoReply(productsInMessage[0], text));
    } else {
      await sendMessage(chatId, buildPriceReply(preferredTypeFromText, productsInMessage));
    }
    return;
  }

  if (isCatalogRequest(text)) {
    if (preferredTypeFromText) {
      await sendMessage(chatId, buildTypeCatalog(preferredTypeFromText));
    } else {
      await sendMessage(chatId, getCatalog());
    }
    return;
  }

  if (state.order) {
    const order = state.order;

    if (order.step === 'order_offer') {
      if (isYes(text) || normalizeText(text).includes('оформ')) {
        order.intentConfirmed = true;
        const next = getNextOrderPrompt(order);
        order.step = next.step;
        await sendMessage(chatId, next.prompt);
        return;
      }
      if (normalizeText(text).includes('нет') || normalizeText(text).includes('не надо')) {
        await sendMessage(chatId, 'Хорошо. Если захотите оформить заказ, просто напишите «оформить заказ».');
        return;
      }
    }

    if (order.step === 'payment_amount') {
      const amount = parseInt(text.replace(/\D/g, ''), 10);
      if (amount > 0) {
        order.total = amount;
        order.step = 'name';
        order.paymentConfirmed = true;
        await sendMessage(chatId, `✅ Оплата ${amount}₽ подтверждена!\n\nКак зовут получателя? (ФИО полностью)`);
        await sendMessage(OWNER_CHAT_ID, `Платёж от @${username} Сумма: ${amount}₽ Статус: ожидает данные для доставки`);
      } else {
        await sendMessage(chatId, 'Пожалуйста, введите сумму цифрами, например: 2139');
      }
      return;
    }

    if (order.step === 'product_selection') {
      if (asksDelivery) {
        await sendMessage(chatId, buildDeliveryReply((order.products || []).length));
      } else if (asksPrice) {
        await sendMessage(chatId, buildPriceReply(order.preferredType, productsInMessage));
      } else {
        await sendMessage(chatId, buildSelectionHelp(order.preferredType));
      }
      return;
    }

    if (order.step === 'name') {
      order.data.name = text;
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
      order.step = 'phone';
      await sendMessage(chatId, 'Контактный телефон получателя:\nПример: +7 999 123-45-67');
      return;
    }

    if (order.step === 'phone') {
      if (!/\+?7[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/.test(text)) {
        await sendMessage(chatId, 'Проверьте формат. Введите номер как в примере: +7 999 123-45-67');
        return;
      }
      order.data.phone = text;
      order.step = 'confirm';

      const deliveryFee = getDeliveryFee((order.products || []).length);
      const grandTotal = getOrderGrandTotal(order);

      let confirmMsg = 'Проверьте данные заказа:\n\n' +
        `👤 ${order.data.name}\n` +
        `🏙️ ${order.data.city}\n` +
        `📍 ${order.data.address}\n` +
        `📞 ${order.data.phone}\n\n`;

      if (order.products && order.products.length > 0) {
        confirmMsg += 'Товары:\n' +
          formatProducts(order.products) +
          `\n\nТовары: ${order.total}₽\n` +
          (deliveryFee === 0 ? 'Доставка: бесплатно\n' : `Доставка: ${deliveryFee}₽\n`) +
          `Итого к оплате: ${grandTotal}₽\n\n`;
      } else if (order.paymentConfirmed) {
        confirmMsg += `💰 Оплачено: ${order.total}₽\n\n`;
      }

      confirmMsg += 'Если всё верно, напишите «ДА». Если нужно что-то поменять, просто напишите, что именно.';
      await sendMessage(chatId, confirmMsg);
      return;
    }

    if (order.step === 'confirm') {
      if (isYes(text)) {
        const orderNum = `AP${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${dailyOrders.length + 1}`;
        const deliveryFee = getDeliveryFee((order.products || []).length);
        const grandTotal = getOrderGrandTotal(order);

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
          grandTotal,
          paymentConfirmed: order.paymentConfirmed || false
        });

        let ownerMsg = `НОВЫЙ ЗАКАЗ ${orderNum} Клиент: @${order.tgName} ФИО: ${order.data.name} Телефон: ${order.data.phone} Город: ${order.data.city} Адрес: ${order.data.address}`;

        if (order.products && order.products.length > 0) {
          ownerMsg += ` Товары: ${order.products.map(p => `${p.name} ${p.price}₽`).join(', ')} Товары: ${order.total}₽ Доставка: ${deliveryFee === 0 ? 'бесплатно' : deliveryFee + '₽'} Итого: ${grandTotal}₽`;
        } else {
          ownerMsg += ` Оплачено: ${order.total}₽ (уточнить товары)`;
        }

        await sendMessage(OWNER_CHAT_ID, ownerMsg);

        let reply = `✅ Заказ ${orderNum} оформлен!\n\n`;

        if (!order.paymentConfirmed) {
          reply += `К оплате: ${grandTotal}₽\n\n`;
          reply += 'Для оплаты переведите сумму на:\n';
          reply += '💳 +79213393904 (Чао)\n';
          reply += '🏦 Банк Санкт-Петербург\n\n';
          reply += 'После перевода пришлите скриншот сюда.\n';
        }

        reply += '⏰ Заказ отправим в течение 1-2 дней.\n\n';

        if (order.hasSpray) {
          reply += '⚠️ ВАЖНО: Если будете тестировать перцовый баллончик — делайте это только на открытом воздухе, подальше от людей и животных.\n\n';
        }

        reply += 'Спасибо за заказ! Если есть вопросы — @drvapeservice всегда на связи.';
        await sendMessage(chatId, reply);
        state.order = null;
        return;
      }

      await sendMessage(chatId, 'Что нужно изменить? Напишите, например: заменить товар, изменить адрес или изменить телефон.');
      return;
    }
  }

  state.messages.push({ role: 'user', content: text });
  if (state.messages.length > 20) state.messages.splice(1, state.messages.length - 20);

  try {
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: state.messages,
      temperature: 0.7,
      max_tokens: 150
    }, {
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = (res.data.choices[0].message.content || '').replace(/\*/g, '');
    state.messages.push({ role: 'assistant', content: reply });
    await sendMessage(chatId, reply);
  } catch (e) {
    console.error('AI error:', e.message);
    await sendMessage(chatId, 'Технические неполадки. Напишите @drvapeservice — он увидит и ответит в ближайшее время.');
  }
}

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
    summary += `ЗАКАЗ ${i + 1}: ${o.orderNum} Клиент: @${o.tgName} ФИО: ${o.name} Тел: ${o.phone} Город: ${o.city} Адрес: ${o.address} Товары: ${o.products.map(p => p.name).join(', ')} Итого: ${o.grandTotal || o.total}₽ `;
  });

  await sendMessage(OWNER_CHAT_ID, summary);
}

setInterval(sendDailySummary, 60 * 60 * 1000);

async function handlePhoto(msg) {
  const chatId = msg.chat.id;
  const username = msg.from?.username || msg.from?.first_name || 'unknown';
  const photo = msg.photo?.[msg.photo.length - 1];

  if (!photo) return;

  console.log(`📸 ${username} отправил фото`);

  try {
    const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`);
    const filePath = fileRes.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

    if (!conversations.has(chatId)) {
      conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
    }
    const state = conversations.get(chatId);

    state.order = {
      products: [],
      total: 0,
      step: 'payment_amount',
      data: {},
      hasSpray: false,
      tgName: username,
      paymentScreenshot: fileUrl,
      paymentConfirmed: false,
      preferredType: null,
      intentConfirmed: true
    };

    await sendMessage(chatId,
      '✅ Скриншот получен!\n\n' +
      'Напишите сумму перевода цифрами, например: 2139.'
    );

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
