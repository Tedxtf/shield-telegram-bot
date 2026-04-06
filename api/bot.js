const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;
const SHIPPING_FEE = 350;
const PAYMENT_PHONE = '+7 921 339-39-04';
const PAYMENT_NAME = 'Чао';
const PAYMENT_BANK = 'Банк Санкт-Петербург';
const OWNER_CONTACT = '@drvapeservice';
const SITE_URL = 'https://shield-store-ru.shieldhub.workers.dev/';

const PRODUCTS = {
  'HJ-5': { name: 'HJ-5 (5ml)', price: 569, desc: 'Формат помады, самый маленький вариант, работает только почти вплотную', bestFor: 'скрытое ношение, внезапная подача в упор, женская сумочка', size: '82×Ø18 мм', weight: '20 г', range: 'только очень близкая дистанция', type: 'spray' },
  'HJ-10': { name: 'HJ-10 (10ml)', price: 579, desc: 'Очень компактный формат, размером примерно с маленький флакон, тоже для сверхближней подачи', bestFor: 'для девушек, скрытое ношение, сумочка', size: '100×Ø18 мм', weight: '23.7 г', range: 'только очень близкая дистанция', type: 'spray' },
  'HJ-15': { name: 'HJ-15 (15ml)', price: 589, desc: 'Компактный 15 мл, но всё ещё не базовый городской вариант, а ближняя дистанция', bestFor: 'скрытое ношение, если нужен чуть больший запас, чем у HJ-5/10', size: '20×20×115 мм', weight: '33 г', range: 'только очень близкая дистанция', type: 'spray' },
  'HJ-15W': { name: 'HJ-15W (15ml)', price: 599, desc: 'Та же компактная категория, что HJ-15, но с окном контроля остатка', bestFor: 'тем, кто хочет видеть остаток жидкости и носить компактный формат', size: '118×Ø19.5 мм', weight: '33 г', range: 'только очень близкая дистанция', type: 'spray' },
  'HJ-20': { name: 'HJ-20 (20ml)', price: 649, desc: 'Первый рабочий компактный формат, базовый входной уровень для города', bestFor: 'первый баллончик, ежедневное ношение, базовая самооборона в городе', size: '90×Ø20 мм', weight: '28 г', range: 'примерно до 1.5 м', type: 'spray' },
  'HJ-20K': { name: 'HJ-20K (20ml)', price: 699, desc: 'Та же рабочая компактная категория, что HJ-20, но с кольцом под ключи', bestFor: 'ключи, сумка, быстрое извлечение, ежедневное ношение', size: '95×Ø20 мм', weight: '35 г', range: 'примерно до 1.5 м', type: 'spray' },
  'HJ-60': { name: 'HJ-60 (60ml)', price: 829, desc: 'Средний формат с большим запасом и более уверенной работой, чем у HJ-20', bestFor: 'тем, кто хочет более серьёзный вариант без перехода в совсем большой размер', size: '115×Ø35 мм', weight: '75 г', range: 'почти до 2 м', type: 'spray' },
  'HJ-110': { name: 'HJ-110 (110ml)', price: 899, desc: 'Большой формат с длинной работой и большим объёмом', bestFor: 'максимальный запас, длительное использование, более мощный формат', size: '150×Ø35 мм', weight: '105 г', range: 'примерно 1.5–2 м', type: 'spray' },
  'HJ-110S': { name: 'HJ-110S (110ml)', price: 999, desc: 'Струйная модель полицейского уровня, бьёт водяной струёй и лучше держится при встречном ветре', bestFor: 'максимальная эффективность, меньше риск задеть себя, требовательные задачи', size: '150×Ø35 мм', weight: '105 г', range: 'струйный формат, примерно 1.5–2 м', type: 'spray' },
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

const PAYMENT_KEYWORDS = [
  'способ оплаты', 'как оплатить', 'как платить', 'как можно оплатить', 'как происходит оплата',
  'куда переводить', 'куда перевести', 'куда отправить деньги', 'куда скинуть деньги', 'куда оплатить',
  'на какой номер переводить', 'на какой номер оплатить', 'номер для оплаты', 'номер для перевода',
  'реквизит', 'реквизиты', 'оплата', 'оплатить', 'платить', 'перевести деньги',
  'перевод по номеру', 'сбп', 'qr', 'кьюар', 'терминал', 'налич', 'наличные',
  'карта', 'картой', 'на карту', 'по карте', 'номер карты', 'банковская карта',
  'при получении', 'курьеру', 'безнал', 'paypal', 'крипт'
];

const dailyOrders = [];
const conversations = new Map();
const PHONE_REGEX = /\+?7[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/;
const CITY_REGEX = /москва|спб|санкт-петербург|казань|новосибирск|екатеринбург|нижний|челябинск|самара|омск|ростов|уфа|красноярск|воронеж|пермь|волгоград/i;
const STREET_REGEX = /улица|ул\.|проспект|пр-т|бульвар|переулок|просп|шоссе|наб\.|набережная/i;
const ADDRESS_LIKE_REGEX = /сдэк|cdek|пвз|постамат|самовывоз|невский|лиговский|проспект|ул\.|улица|дом|квартира|подъезд|этаж/i;
const SPRAY_TYPE_KEYWORDS = [
  'перцовый баллончик', 'перцовый спрей', 'газовый баллончик', 'газовый баллон',
  'струйный баллончик', 'баллончик', 'баллон', 'перцовка', 'перцовый',
  'спрей', 'pepper spray', '胡椒喷雾', '辣椒喷雾'
];
const STUN_TYPE_KEYWORDS = [
  'электрошокер', 'электрошок', 'электрошоковый', 'шокер',
  'шокер-дубинка', 'дубинка-шокер', 'электрошоковая дубинка', 'электродубинка',
  'шокер-фонарик', 'фонарь-шокер', 'фонарик-шокер', 'stun gun', 'stun',
  '电棍', '电击棍'
];

const SYSTEM_PROMPT = `Ты — консультант магазина ЩИТ. Отвечай кратко, по-человечески, без форматирования *.
ПРАВИЛА: максимум 3-4 предложения, без списков и нумерации, сразу к делу, теплый тон.
ТОВАРЫ: баллончики HJ-5 569₽, HJ-10 579₽, HJ-15 589₽, HJ-15W 599₽, HJ-20 649₽, HJ-20K 699₽, HJ-60 829₽, HJ-110 899₽, HJ-110S 999₽. Шокеры: Model-800 1490₽, Model-806/1202/398 1590₽, Model-669/309 1690₽, Model-1108 1999₽, Model-1158/1320 2099₽, Model-1138 2499₽.
ДОСТАВКА: 350₽, бесплатно от 2 шт. ОПЛАТА: только перевод по номеру телефона ${PAYMENT_PHONE} (${PAYMENT_NAME}, ${PAYMENT_BANK}).
ВАЖНО ПО БАЛЛОНЧИКАМ: HJ-5, HJ-10, HJ-15, HJ-15W — это сверхкомпактные варианты только для очень близкой дистанции, их нельзя советовать как основной городской вариант по умолчанию. Базовый рабочий уровень для города начинается с HJ-20 и HJ-20K. HJ-60 — средний формат, HJ-110 — большой формат, HJ-110S — струйный и более устойчивый к встречному ветру.
ЕСЛИ КЛИЕНТ ГОВОРИТ, ЧТО ДОРОГО: не спорь о цене, а предложи написать ${OWNER_CONTACT} для возможной скидки или подбора варианта дешевле.
Сложные вопросы — передай ${OWNER_CONTACT}.`;

function normalizeText(text = '') {
  return text.toLowerCase().replace(/[–—−]/g, '-').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesAny(text, keywords) {
  return keywords.some((key) => text.includes(key));
}

function getState(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
  }
  return conversations.get(chatId);
}

function getProductsByType(type) {
  return Object.entries(PRODUCTS).filter(([, item]) => item.type === type).map(([code, item]) => ({ code, ...item }));
}

function formatProducts(products) {
  return products.map((item) => `• ${item.name} — ${item.price}₽`).join('\n');
}

function calculateTotal(products) {
  return products.reduce((sum, item) => sum + item.price, 0);
}

function getDeliveryFee(productCount = 0) {
  return productCount >= 2 ? 0 : SHIPPING_FEE;
}

function getOrderGrandTotal(order) {
  return calculateTotal(order.products || []) + getDeliveryFee((order.products || []).length);
}

function getCatalog() {
  let text = '📦 НАШИ ТОВАРЫ:\n\n🌶️ ПЕРЦОВЫЕ БАЛЛОНЧИКИ:\n';
  getProductsByType('spray').forEach((item) => { text += `• ${item.name} — ${item.price}₽\n`; });
  text += '\n⚡ ЭЛЕКТРОШОКЕРЫ:\n';
  getProductsByType('stun').forEach((item) => { text += `• ${item.name} — ${item.price}₽\n`; });
  text += `\n🚚 Доставка ${SHIPPING_FEE}₽\n🎁 <b>БЕСПЛАТНАЯ ДОСТАВКА при заказе от 2 шт!</b>\n💡 Совет: возьмите баллончик + шокер — выгодно и универсально`;
  return text;
}

function buildTypeCatalog(type) {
  const title = type === 'spray' ? '🌶️ ПЕРЦОВЫЕ БАЛЛОНЧИКИ:' : '⚡ ЭЛЕКТРОШОКЕРЫ:';
  return `${title}\n${formatProducts(getProductsByType(type))}\n\n🚚 Доставка ${SHIPPING_FEE}₽\n🎁 От 2 шт доставка бесплатно`;
}

function buildSelectionHelp(type) {
  if (type === 'spray') return 'По баллончикам логика такая: HJ-5 / HJ-10 / HJ-15 / HJ-15W — это сверхкомпактные варианты только для очень близкой дистанции, а для нормального городского старта лучше смотреть от HJ-20 / HJ-20K. Дальше идут HJ-60 как средний формат, HJ-110 как большой и HJ-110S как струйный вариант против встречного ветра. Напишите, что вам ближе: компактный городской, средний, большой или струйный, и я сразу подскажу модель.';
  if (type === 'stun') return 'По шокерам чаще берут Model-800 или Model-806. Напишите модель, например Model-800, и я сразу посчитаю итог.';
  return 'Напишите модель товара, и я сразу подскажу по нему.';
}

function buildDeliveryReply(productCount = 0) {
  return getDeliveryFee(productCount) === 0
    ? 'Доставка у вас будет бесплатной, потому что в заказе уже 2 товара или больше.'
    : `Доставка фиксированная — ${SHIPPING_FEE}₽. Если в заказе только 1 товар, к цене товара добавляется ${SHIPPING_FEE}₽.`;
}

function buildPaymentMethodReply() {
  return `Оплата только переводом по номеру телефона ${PAYMENT_PHONE} (${PAYMENT_NAME}, ${PAYMENT_BANK}). После перевода пришлите сюда скриншот, а затем сумму перевода цифрами. Наличными, при получении и на другие реквизиты оплату не принимаем.`;
}

function buildDiscountContactReply() {
  return `Если цена кажется высокой, напишите ${OWNER_CONTACT}. Он посмотрит вашу ситуацию и скажет, можно ли сделать скидку или подобрать вариант дешевле.`;
}

function buildUnsupportedPhotoReply() {
  return `Пока я не умею читать изображения. Откройте сайт ${SITE_URL}, посмотрите точное название модели и просто пришлите его сюда текстом, например HJ-20 или Model-309.`;
}

function buildVoiceFallbackReply() {
  return 'Пока я не умею распознавать голосовые сообщения. Напишите текстом, пожалуйста, и я сразу помогу.';
}

function buildAddressOutsideOrderReply() {
  return 'Адрес и пункт выдачи лучше отправлять уже после выбора товара. Сначала пришлите модель текстом, например HJ-20 или Model-309, и я помогу оформить заказ.';
}

function buildSprayTierReply(tier) {
  if (tier === 'ultracompact') {
    return 'Если нужен совсем маленький баллончик, это HJ-5 / HJ-10 / HJ-15 / HJ-15W. Но это именно сверхкомпактная категория для очень близкой дистанции и неожиданной подачи, а не основной городской вариант по умолчанию.';
  }
  if (tier === 'compact') {
    return 'Для обычного города и ежедневного ношения я бы начинал с HJ-20 или HJ-20K. Это уже рабочий компактный формат: базовый уровень, примерно до 1.5 м, спокойно носится в сумке, а у HJ-20K ещё есть кольцо под ключи.';
  }
  if (tier === 'medium') {
    return 'Если нужен именно средний формат, смотрите HJ-60. Он заметно серьёзнее HJ-20 по запасу и по дистанции, почти до 2 м, но ещё без перехода в совсем большой баллон.';
  }
  if (tier === 'large') {
    return 'Если хотите большой формат, смотрите HJ-110. Это уже крупный баллон с большим запасом и более мощным ощущением в работе, чем компактные модели.';
  }
  if (tier === 'jet') {
    return 'Если нужен струйный вариант, это HJ-110S. Он бьёт не облаком, а более плотной струёй, лучше держится при встречном ветре и меньше риск попасть самому под распыление.';
  }
  return null;
}

function buildComparisonReply(products) {
  if (products.length !== 2) return null;
  const sortedCodes = products.map((product) => product.code).sort().join('|');

  if (sortedCodes === 'HJ-20|HJ-20K') {
    return 'HJ-20 и HJ-20K — это одна рабочая категория: оба на 20 мл и подходят как базовый городской вариант. Главное отличие в том, что HJ-20K идёт с кольцом под ключи, поэтому его удобнее носить вместе с ключами, а HJ-20 чуть проще и дешевле.';
  }

  if (sortedCodes === 'HJ-110|HJ-110S') {
    return 'HJ-110 и HJ-110S одинаковы по объёму, но HJ-110S — струйный вариант. Он лучше работает при встречном ветре и меньше риск задеть себя, а обычный HJ-110 — классический крупный распылитель.';
  }

  const [first, second] = products;
  let reply = `${first.name} и ${second.name}: ${first.price}₽ против ${second.price}₽. `;
  reply += `Первый вариант больше про ${first.bestFor}, второй — про ${second.bestFor}. `;
  reply += 'Если хотите, могу сразу подсказать, какой из них лучше именно под вашу задачу.';
  return reply;
}

function buildPriceReply(type, products = []) {
  if (products.length === 1) {
    const item = products[0];
    return `${item.name} стоит ${item.price}₽. Если брать только один товар, доставка будет ${SHIPPING_FEE}₽, итого ${item.price + SHIPPING_FEE}₽. Если взять 2 товара и больше, доставка бесплатная.`;
  }
  if (products.length > 1) {
    return `По этим моделям вместе выходит ${calculateTotal(products)}₽. Так как товаров уже от 2 штук, доставка будет бесплатной.`;
  }
  if (type === 'spray') return `По баллончикам цены от 569₽ до 999₽. Если брать один товар, доставка фиксированная — ${SHIPPING_FEE}₽, а от 2 товаров бесплатно.`;
  if (type === 'stun') return `По шокерам цены от 1490₽ до 2499₽. Если брать один товар, доставка фиксированная — ${SHIPPING_FEE}₽, а от 2 товаров бесплатно.`;
  return `Доставка фиксированная — ${SHIPPING_FEE}₽ за заказ с одним товаром, а от 2 товаров бесплатно. Напишите модель, и я сразу посчитаю точную сумму.`;
}

function buildProductInfoReply(product, text) {
  const t = normalizeText(text);
  const parts = [];
  if (t.includes('размер') || t.includes('габарит')) parts.push(`Размер ${product.size}.`);
  if (t.includes('вес') && product.weight && product.weight !== '—') parts.push(`Вес ${product.weight}.`);
  if ((t.includes('дальность') || t.includes('дальн')) && product.range) parts.push(`По работе: ${product.range}.`);
  if (t.includes('носить') || t.includes('с собой') || t.includes('карман') || t.includes('сумк') || t.includes('удобно')) {
    parts.push(/150×Ø35|115×Ø35|243|376|182|176/.test(product.size || '')
      ? 'Носить с собой можно, но это уже не самый компактный формат — удобнее сумка, бардачок или большая куртка.'
      : 'Для повседневного ношения формат довольно удобный, особенно в сумке или кармане одежды.');
  }
  if (!parts.length) {
    if (product.desc) parts.push(`${product.desc}.`);
    if (product.bestFor) parts.push(`Главный плюс — ${product.bestFor}.`);
    if (product.feature) parts.push(`Особенность — ${product.feature}.`);
    if (product.size) parts.push(`Размер ${product.size}.`);
    if (product.weight && product.weight !== '—') parts.push(`Вес ${product.weight}.`);
  }
  return `${product.name}: ${parts.join(' ')} Если хотите, могу сразу посчитать итог с доставкой или помочь оформить заказ.`;
}

function buildWhyExpensiveReply(product) {
  const reasons = [product.desc && product.desc.toLowerCase(), product.range && `по характеристике это ${product.range}`, product.bestFor && `он рассчитан на ${product.bestFor}`, product.feature && `его особенность — ${product.feature}`].filter(Boolean);
  return `${product.name} дороже потому, что это более серьёзная модель: ${reasons.slice(0, 2).join(', ')}. Проще говоря, здесь платите не только за объём, а за более удобный или более эффективный формат.`;
}

function isInfoRequest(text) {
  return ['размер', 'габарит', 'вес', 'удобно', 'носить', 'с собой', 'карман', 'сумк', 'дальность', 'дальн', 'мощн', 'отлич', 'для чего', 'что лучше', 'компакт', 'удобен', 'удобно ли', 'как насчет', 'как насчёт', 'что скажете', 'расскажите', 'подойдет', 'подойдёт', 'советуете', 'посоветуйте', 'что за'].some((key) => normalizeText(text).includes(key));
}

function isWhyExpensiveRequest(text) {
  return ['почему', 'дорог', 'стоит дороже', 'такая дорог', 'такой дорог'].some((key) => normalizeText(text).includes(key));
}

function isDeliveryRequest(text) {
  return normalizeText(text).includes('доставка');
}

function isPaymentMethodRequest(text) {
  const t = normalizeText(text);
  return PAYMENT_KEYWORDS.some((key) => t.includes(key));
}

function isGreeting(text) {
  return ['hi', 'hello', 'hey', 'привет', 'здравствуйте', 'здравствуй', 'добрый день', 'добрый вечер', 'доброе утро', 'салют', 'ку'].includes(normalizeText(text).replace(/[^a-zа-яё\s]/gi, '').trim());
}

function isMinimalPrompt(text) {
  return /^[?!.]{1,4}$/.test((text || '').trim());
}

function isEmojiOnly(text) {
  const value = (text || '').trim();
  return !!value && !/[A-Za-zА-Яа-яЁё0-9]/.test(value) && !/[?!.]/.test(value);
}

function buildGreetingReply() {
  return 'Здравствуйте! Подскажу по товарам. Вам нужен перцовый баллончик или электрошокер?';
}

function detectPreferredType(text) {
  const t = normalizeText(text);
  const hasSpray = includesAny(t, SPRAY_TYPE_KEYWORDS);
  const hasStun = includesAny(t, STUN_TYPE_KEYWORDS);
  if (hasSpray && !hasStun) return 'spray';
  if (hasStun && !hasSpray) return 'stun';
  return null;
}

function isCatalogRequest(text) {
  const t = normalizeText(text);
  if (/hj[-\s]?\d|model[-\s]?\d/.test(t)) return false;
  return ['каталог', 'цены', 'прайс', 'какие есть', 'что есть', 'покажи товары', 'ассортимент', 'выбор', 'виды'].some((key) => t.includes(key));
}

function isPriceRequest(text) {
  return ['сколько стоит', 'цена', 'по чем', 'почем', 'стоимость'].some((key) => normalizeText(text).includes(key));
}

function isDiscountRequest(text) {
  return ['скидк', 'дешевле', 'подешевле', 'бонус', 'акци', 'подарок', 'скинь цену', 'торг', 'можно ли дешевле', 'дорого', 'дорогой', 'дороговато', 'слишком дорого', 'высокая цена'].some((key) => normalizeText(text).includes(key));
}

function looksLikeAddressOutsideOrder(text) {
  const normalized = normalizeText(text);
  return ADDRESS_LIKE_REGEX.test(normalized) && (/\d/.test(normalized) || normalized.includes('сдэк') || normalized.includes('пвз'));
}

function parsePaymentAmount(text) {
  const raw = (text || '').trim();
  if (!/^\s*\d[\d\s]{1,10}(?:[.,]\d{1,2})?\s*(₽|р|р\.|руб|руб\.|рублей)?\s*$/i.test(raw)) {
    return null;
  }
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}

function isComparisonRequest(text) {
  return ['чем отличается', 'чем отличаются', 'в чем разница', 'в чём разница', 'разница между', 'сравни', 'сравните', 'что лучше между'].some((key) => normalizeText(text).includes(key));
}

function detectSprayTier(text) {
  const normalized = normalizeText(text);

  if (['струй', 'против ветра', 'встречный ветер', 'антиветер', 'не попасть в себя', 'не попасть себе', 'водяной стру', 'полицейский'].some((key) => normalized.includes(key))) {
    return 'jet';
  }

  if (['среднего размера', 'средний', 'среднее', 'что из среднего', 'hj-60'].some((key) => normalized.includes(key))) {
    return 'medium';
  }

  if (['большой', 'крупный', 'побольше', 'мощнее', 'надолго', 'дольше', 'максимальный', 'большого размера'].some((key) => normalized.includes(key))) {
    return 'large';
  }

  if (['маленький', 'самый маленький', 'совсем маленький', 'ультракомпакт', 'для девушки', 'для женщин', 'скрытого ношения', 'под помаду', 'как духи', 'как помада'].some((key) => normalized.includes(key))) {
    return 'ultracompact';
  }

  if (['для города', 'город', 'каждый день', 'ежеднев', 'с собой', 'не слишком большое', 'не очень большое', 'компактный', 'базовый', 'входной', 'универсальный'].some((key) => normalized.includes(key))) {
    return 'compact';
  }

  return null;
}

function isTypeChoiceMessage(text, preferredType) {
  if (!preferredType) return false;
  const normalized = normalizeText(text).replace(/[^a-zа-яё\s-]/gi, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  const words = normalized.split(' ');
  return words.length <= 4;
}

function isComplexRequest(text) {
  return ['возврат', 'жалоба', 'претензия', 'спор', 'развод', 'полиция', 'юрист', 'адвокат', 'суд', 'проблема с заказом', 'не пришло', 'сломано', 'брак'].some((key) => normalizeText(text).includes(key));
}

function wantsHuman(text) {
  return ['консультант', 'человек', 'оператор'].some((key) => normalizeText(text).includes(key));
}

function hasPurchaseSignal(text) {
  return ['заказать', 'оформить заказ', 'хочу заказать', 'купить', 'куплю', 'купим', 'приобрести', 'беру', 'возьму', 'возьмем', 'возьмём', 'оформляем', 'забираю', 'оформи', 'добавь', 'добавьте', 'нужен', 'нужна', 'нужно', 'хочу'].some((key) => normalizeText(text).includes(key));
}

function wantsModifyOrder(text) {
  return ['измени', 'изменить', 'поменяй', 'поменять', 'замени', 'заменить', 'добавь', 'добавьте', 'еще', 'ещё', 'убери', 'убрать', 'товар', 'передумал', 'теперь хочу', 'только один'].some((key) => normalizeText(text).includes(key));
}

function isYes(text) {
  const t = normalizeText(text);
  return t === 'да' || t.includes('верно') || t.includes('подтверждаю');
}

function extractProducts(text) {
  const normalized = normalizeText(text);
  const found = new Map();
  const stunContext = includesAny(normalized, [...STUN_TYPE_KEYWORDS, 'модель', 'model']);
  for (const [code, data] of Object.entries(PRODUCTS)) {
    const codeLower = code.toLowerCase();
    const compactCode = codeLower.replace('-', '');
    const negatedExact = new RegExp(`не\\s+${escapeRegex(codeLower).replace('-', '[-\\s]?')}(?=\\D|$)`, 'i');
    const negatedCompact = new RegExp(`не\\s+${escapeRegex(compactCode)}(?=\\D|$)`, 'i');
    if (negatedExact.test(normalized) || negatedCompact.test(normalized)) {
      continue;
    }
    const exact = new RegExp(`(^|[^a-z0-9])${escapeRegex(code.toLowerCase()).replace('-', '[-\\s]?')}([^a-z0-9]|$)`, 'i');
    if (exact.test(normalized)) {
      found.set(code, { code, ...data });
      continue;
    }
    if (code.startsWith('HJ-') && normalized.includes(code.toLowerCase().replace('-', ''))) {
      found.set(code, { code, ...data });
      continue;
    }
    if (code.startsWith('Model-')) {
      const number = code.slice(6).toLowerCase();
      const negatedBareNumber = new RegExp(`не\\s+${escapeRegex(number)}(?=\\D|$)`, 'i');
      if (negatedBareNumber.test(normalized)) {
        continue;
      }
      const withContext = new RegExp(`(?:электрошокер|шокер|модель|model)\\s*[-#:]?\\s*${escapeRegex(number)}(?=\\D|$)`, 'i');
      const bare = new RegExp(`(^|[^0-9])${escapeRegex(number)}([^0-9]|$)`, 'i');
      if (withContext.test(normalized) || (stunContext && bare.test(normalized))) found.set(code, { code, ...data });
    }
  }
  return [...found.values()];
}
function validateAddress(address, requireCity = false) {
  const hasCity = CITY_REGEX.test(address);
  const hasStreet = STREET_REGEX.test(address);
  const hasNumber = /\d+/.test(address);
  return { hasCity, hasStreet, hasNumber, isValid: (requireCity ? hasCity : true) && hasStreet && hasNumber };
}

function createEmptyOrder(username, preferredType = null) {
  return { products: [], total: 0, step: 'product_selection', data: {}, hasSpray: preferredType === 'spray', preferredType, tgName: username, paymentConfirmed: false, paymentScreenshot: null, paidAmount: null, intentConfirmed: false, orderNum: null };
}

function setOrderProducts(order, products, mode = 'replace') {
  order.products = mode === 'add' && order.products.length ? [...order.products, ...products.filter((item) => !order.products.some((existing) => existing.code === item.code))] : products;
  order.total = calculateTotal(order.products);
  order.hasSpray = order.products.some((item) => item.type === 'spray');
  if (!order.preferredType && order.products.length === 1) order.preferredType = order.products[0].type;
}

async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: chatId, text, parse_mode: 'HTML' });
  } catch {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: chatId, text: text.replace(/<[^>]+>/g, '') });
  }
}

function getNextOrderPrompt(order) {
  if (!order.intentConfirmed) return { step: 'order_offer', prompt: 'Если хотите, помогу оформить заказ. Напишите «ДА», и я попрошу данные для доставки. Если хотите изменить товары, просто напишите, что добавить или заменить.' };
  if (!order.data.name) return { step: 'name', prompt: 'Как зовут получателя? (ФИО полностью)' };
  if (!order.data.city) return { step: 'city', prompt: 'В каком городе нужна доставка? (Москва, СПб и т.д.)' };
  if (!order.data.address) return { step: 'address', prompt: 'Полный адрес доставки:\n— улица\n— дом, квартира\n— подъезд, этаж (если нужно)\n\nПример: ул. Тверская, д. 15, кв. 78' };
  if (!order.data.phone) return { step: 'phone', prompt: 'Контактный телефон получателя:\nПример: +7 999 123-45-67' };
  return { step: 'confirm', prompt: 'Если всё верно, напишите «ДА» для подтверждения. Если нужно что-то поменять, просто напишите, что именно.' };
}

function buildOrderSummary(order) {
  const deliveryFee = getDeliveryFee((order.products || []).length);
  let text = `Отлично! Ваш выбор:\n${formatProducts(order.products)}\n\nТовары: ${order.total}₽\n`;
  text += deliveryFee === 0 ? 'Доставка: бесплатно\n' : `Доставка: ${deliveryFee}₽\n`;
  text += `Итого: ${getOrderGrandTotal(order)}₽`;
  text += deliveryFee === 0 ? '\n\n✅ У вас от 2 шт — доставка бесплатная!' : `\n\n💡 Если добавите ещё один товар, доставка станет бесплатной — сэкономите ${SHIPPING_FEE}₽!`;
  return text;
}

async function startOrderFromProducts(chatId, state, username, products, mode = 'replace') {
  if (!state.order) state.order = createEmptyOrder(username, products[0]?.type || null);
  state.order.tgName = username;
  setOrderProducts(state.order, products, mode);
  const next = getNextOrderPrompt(state.order);
  state.order.step = next.step;
  await sendMessage(chatId, `${buildOrderSummary(state.order)}\n\n${next.prompt}`);
}

function finalizeOrderData(order) {
  const orderNum = `AP${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${dailyOrders.length + 1}`;
  return { orderNum, deliveryFee: getDeliveryFee((order.products || []).length), grandTotal: getOrderGrandTotal(order) };
}

async function completePaidOrder(chatId, state) {
  const order = state.order;
  const { orderNum, deliveryFee, grandTotal } = finalizeOrderData(order);
  order.orderNum = orderNum;
  dailyOrders.push({ orderNum, date: new Date(), tgName: order.tgName, name: order.data.name, phone: order.data.phone, city: order.data.city, address: order.data.address, products: order.products || [], total: order.total, grandTotal, paymentConfirmed: true, paidAmount: order.paidAmount, paymentScreenshot: order.paymentScreenshot || null });
  let ownerMsg = `НОВЫЙ ОПЛАЧЕННЫЙ ЗАКАЗ ${orderNum} Клиент: @${order.tgName} ФИО: ${order.data.name} Телефон: ${order.data.phone} Город: ${order.data.city} Адрес: ${order.data.address}`;
  ownerMsg += ` Товары: ${order.products.map((item) => `${item.name} ${item.price}₽`).join(', ')} Товары: ${order.total}₽ Доставка: ${deliveryFee === 0 ? 'бесплатно' : `${deliveryFee}₽`} Итого: ${grandTotal}₽`;
  if (order.paidAmount) ownerMsg += ` Оплачено: ${order.paidAmount}₽`;
  if (order.paymentScreenshot) ownerMsg += ` Скриншот: ${order.paymentScreenshot}`;
  await sendMessage(OWNER_CHAT_ID, ownerMsg);
  let reply = `✅ Оплата подтверждена. Заказ ${orderNum} оформлен!\n\n⏰ Заказ отправим в течение 1-2 дней.\n\n`;
  if (order.hasSpray) reply += '⚠️ ВАЖНО: Если будете тестировать перцовый баллончик — делайте это только на открытом воздухе, подальше от людей и животных.\n\n';
  reply += `Спасибо за заказ! Если есть вопросы — ${OWNER_CONTACT} всегда на связи.`;
  await sendMessage(chatId, reply);
  state.order = null;
}

async function handleContextualOrderMessage(chatId, state, username, text) {
  const order = state.order;
  if (!order) return false;
  const products = extractProducts(text);
  const preferredType = detectPreferredType(text) || order.preferredType;
  const asksPrice = isPriceRequest(text);
  const asksCatalog = isCatalogRequest(text);
  const asksDelivery = isDeliveryRequest(text);
  const asksWhyExpensive = isWhyExpensiveRequest(text);
  const asksPaymentMethod = isPaymentMethodRequest(text);
  const asksComparison = isComparisonRequest(text);
  const asksDiscount = isDiscountRequest(text);
  const infoRequest = isInfoRequest(text);
  const purchaseSignal = hasPurchaseSignal(text);
  const wantsModify = wantsModifyOrder(text);
  if (asksDiscount) {
    await sendMessage(chatId, buildDiscountContactReply());
    return true;
  }
  if (asksPaymentMethod) {
    await sendMessage(chatId, buildPaymentMethodReply());
    return true;
  }
  if (order.step !== 'payment_amount' && asksDelivery) {
    await sendMessage(chatId, buildDeliveryReply((order.products || []).length));
    return true;
  }
  if (order.step !== 'payment_amount' && asksWhyExpensive && products.length === 1) {
    await sendMessage(chatId, buildWhyExpensiveReply(products[0]));
    return true;
  }
  if (order.step !== 'payment_amount' && asksWhyExpensive && !products.length) {
    await sendMessage(chatId, buildDiscountContactReply());
    return true;
  }
  if (order.step !== 'payment_amount' && asksComparison && products.length === 2) {
    await sendMessage(chatId, buildComparisonReply(products));
    return true;
  }
  if (order.step !== 'payment_amount' && infoRequest && products.length === 1) {
    await sendMessage(chatId, buildProductInfoReply(products[0], text));
    return true;
  }
  if (order.step !== 'payment_amount' && products.length && (purchaseSignal || wantsModify)) {
    const addMode = order.products.length && (normalizeText(text).includes('еще') || normalizeText(text).includes('ещё'));
    await startOrderFromProducts(chatId, state, username, products, addMode ? 'add' : 'replace');
    return true;
  }
  if (order.step !== 'payment_amount' && !products.length && preferredType && (purchaseSignal || wantsModify)) {
    order.preferredType = preferredType;
    await sendMessage(chatId, buildSelectionHelp(preferredType));
    return true;
  }
  if (order.step !== 'payment_amount' && asksPrice) {
    await sendMessage(chatId, buildPriceReply(preferredType, products));
    return true;
  }
  if (order.step !== 'payment_amount' && asksCatalog) {
    await sendMessage(chatId, preferredType ? buildTypeCatalog(preferredType) : getCatalog());
    return true;
  }
  return false;
}

async function replyWithAi(chatId, state, text) {
  state.messages.push({ role: 'user', content: text });
  if (state.messages.length > 20) state.messages.splice(1, state.messages.length - 20);
  try {
    const res = await axios.post('https://api.deepseek.com/chat/completions', { model: 'deepseek-chat', messages: state.messages, temperature: 0.7, max_tokens: 150 }, { headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' } });
    const reply = (res.data.choices[0].message.content || '').replace(/\*/g, '');
    state.messages.push({ role: 'assistant', content: reply });
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error('AI error:', err.message);
    await sendMessage(chatId, `Технические неполадки. Напишите ${OWNER_CONTACT} — он увидит и ответит в ближайшее время.`);
  }
}

async function handleOwnerCommands(chatId, text) {
  if (text === '/chats' && chatId.toString() === OWNER_CHAT_ID) {
    let list = 'Последние диалоги:\n\n';
    let count = 0;
    for (const [cid, data] of conversations) {
      if (cid.toString() === OWNER_CHAT_ID) continue;
      const userMessages = data.messages.filter((msg) => msg.role === 'user');
      if (!userMessages.length) continue;
      list += `Chat ID: ${cid} (${userMessages.length} сообщ.)\nПоследнее: "${userMessages[userMessages.length - 1].content.substring(0, 30)}..."\n\n`;
      count += 1;
      if (count >= 10) break;
    }
    await sendMessage(chatId, count ? list : 'Пока нет активных диалогов.');
    return true;
  }
  if (text.startsWith('/history') && chatId.toString() === OWNER_CHAT_ID) {
    const targetChatId = text.split(' ')[1];
    if (!targetChatId) {
      await sendMessage(chatId, 'Использование: /history [Chat ID]\nПример: /history 7762143855');
      return true;
    }
    const target = conversations.get(parseInt(targetChatId, 10));
    if (!target) {
      await sendMessage(chatId, `Диалог с Chat ID ${targetChatId} не найден.`);
      return true;
    }
    let history = `История диалога ${targetChatId}:\n\n`;
    target.messages.forEach((msg) => {
      if (msg.role === 'user' || msg.role === 'assistant') history += `${msg.role === 'user' ? 'Клиент' : 'Бот'}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n\n`;
    });
    const parts = history.match(/[\s\S]{1,4000}/g) || [];
    for (const part of parts) await sendMessage(chatId, part);
    return true;
  }
  if (text.startsWith('/reset') && chatId.toString() === OWNER_CHAT_ID) {
    const targetChatId = text.split(' ')[1];
    if (!targetChatId) {
      await sendMessage(chatId, 'Использование: /reset [Chat ID]\nПример: /reset 7762143855');
      return true;
    }
    const target = conversations.get(parseInt(targetChatId, 10));
    if (!target) {
      await sendMessage(chatId, `Диалог с Chat ID ${targetChatId} не найден.`);
      return true;
    }
    target.order = null;
    target.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    await sendMessage(chatId, `Состояние диалога ${targetChatId} сброшено.`);
    return true;
  }
  return false;
}
async function handleOrderStep(chatId, state, text) {
  const order = state.order;
  if (!order) return false;
  if (order.step === 'order_offer') {
    if (isYes(text) || normalizeText(text).includes('оформ')) {
      order.intentConfirmed = true;
      const next = getNextOrderPrompt(order);
      order.step = next.step;
      await sendMessage(chatId, next.prompt);
    } else if (normalizeText(text).includes('нет') || normalizeText(text).includes('не надо')) {
      await sendMessage(chatId, 'Хорошо. Если захотите оформить заказ, просто напишите «оформить заказ».');
    } else {
      return false;
    }
    return true;
  }
  if (order.step === 'awaiting_payment_screenshot') {
    await sendMessage(chatId, 'После оплаты просто пришлите сюда скриншот перевода.');
    return true;
  }
  if (order.step === 'payment_amount') {
    const amount = parsePaymentAmount(text);
    if (!amount) {
      await sendMessage(chatId, 'Пожалуйста, введите сумму цифрами, например: 1349');
      return true;
    }
    const expectedAmount = getOrderGrandTotal(order);
    if (amount !== expectedAmount) {
      await sendMessage(chatId, `Сумма не совпадает. По этому заказу к оплате ${expectedAmount}₽. Проверьте перевод и пришлите точную сумму ещё раз цифрами. Если сумма отличается специально, напишите ${OWNER_CONTACT}.`);
      return true;
    }
    order.paymentConfirmed = true;
    order.paidAmount = amount;
    if (order.data.name && order.data.city && order.data.address && order.data.phone && order.products.length) {
      await completePaidOrder(chatId, state);
    } else {
      const next = getNextOrderPrompt(order);
      order.step = next.step;
      await sendMessage(chatId, `✅ Оплата ${amount}₽ подтверждена!\n\n${next.prompt}`);
    }
    return true;
  }
  if (order.step === 'product_selection') {
    if (order.preferredType === 'spray') {
      const sprayTier = detectSprayTier(text);
      const sprayReply = buildSprayTierReply(sprayTier);
      if (sprayReply) {
        await sendMessage(chatId, sprayReply);
        return true;
      }
    }
    await sendMessage(chatId, buildSelectionHelp(order.preferredType));
    return true;
  }
  if (order.step === 'name') {
    order.data.name = text;
    order.step = 'city';
    await sendMessage(chatId, 'В каком городе нужна доставка? (Москва, СПб и т.д.)');
    return true;
  }
  if (order.step === 'city') {
    order.data.city = text;
    order.step = 'address';
    await sendMessage(chatId, 'Полный адрес доставки:\n— улица\n— дом, квартира\n— подъезд, этаж (если нужно)\n\nПример: ул. Тверская, д. 15, кв. 78');
    return true;
  }
  if (order.step === 'address') {
    const check = validateAddress(text, false);
    if (!check.hasStreet) {
      await sendMessage(chatId, 'Добавьте название улицы. Пример: ул. Тверская, д. 15, кв. 78');
      return true;
    }
    if (!check.hasNumber) {
      await sendMessage(chatId, 'Укажите номер дома и квартиры. Пример: ул. Тверская, д. 15, кв. 78');
      return true;
    }
    order.data.address = text;
    order.step = 'phone';
    await sendMessage(chatId, 'Контактный телефон получателя:\nПример: +7 999 123-45-67');
    return true;
  }
  if (order.step === 'phone') {
    if (!PHONE_REGEX.test(text)) {
      await sendMessage(chatId, 'Проверьте формат. Введите номер как в примере: +7 999 123-45-67');
      return true;
    }
    order.data.phone = text;
    order.step = 'confirm';
    const deliveryFee = getDeliveryFee((order.products || []).length);
    let message = `Проверьте данные заказа:\n\n👤 ${order.data.name}\n🏙️ ${order.data.city}\n📍 ${order.data.address}\n📞 ${order.data.phone}\n\n`;
    message += `Товары:\n${formatProducts(order.products)}\n\nТовары: ${order.total}₽\n`;
    message += deliveryFee === 0 ? 'Доставка: бесплатно\n' : `Доставка: ${deliveryFee}₽\n`;
    message += `Итого к оплате: ${getOrderGrandTotal(order)}₽\n\nЕсли всё верно, напишите «ДА». Если нужно что-то поменять, просто напишите, что именно.`;
    await sendMessage(chatId, message);
    return true;
  }
  if (order.step === 'confirm') {
    if (isYes(text)) {
      await sendMessage(chatId, `Отлично. К оплате ${getOrderGrandTotal(order)}₽.\n\nДля оплаты переведите сумму на:\n💳 ${PAYMENT_PHONE} (${PAYMENT_NAME})\n🏦 ${PAYMENT_BANK}\n\nПосле перевода пришлите сюда скриншот, а затем я попрошу указать сумму перевода цифрами.`);
      order.step = 'awaiting_payment_screenshot';
    } else {
      await sendMessage(chatId, 'Что нужно изменить? Напишите, например: заменить товар, изменить адрес или изменить телефон.');
    }
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

  const state = getState(chatId);
  if (!state.order && isEmojiOnly(text)) return;
  if (!state.order && (isGreeting(text) || isMinimalPrompt(text))) {
    await sendMessage(chatId, buildGreetingReply());
    return;
  }
  if (text === '/start') {
    conversations.set(chatId, { messages: [{ role: 'system', content: SYSTEM_PROMPT }], order: null });
    await sendMessage(chatId, `Здравствуйте! 👋\n\nМеня зовут Антон, я консультант магазина ЩИТ. Помогу подобрать средство самообороны под ваши задачи.\n\nЧем могу быть полезен?\n• 📋 Покажу актуальные цены и наличие\n• 🎯 Подберу под конкретную ситуацию\n• 📝 Помогу оформить заказ\n\n💡 Доставка фиксированная ${SHIPPING_FEE}₽, а от 2 товаров бесплатно\n\nЕсли удобнее поговорить голосом или есть сложные вопросы — пишите моему коллеге ${OWNER_CONTACT}`);
    return;
  }
  if (await handleOwnerCommands(chatId, text)) return;
  if (isComplexRequest(text)) {
    await sendMessage(chatId, `Это контакт владельца ${OWNER_CONTACT} — он увидит сообщение и ответит вам в ближайшее время.`);
    await sendMessage(OWNER_CHAT_ID, `${username}: сложный запрос "${text}" Chat ID: ${chatId}`);
    return;
  }
  if (wantsHuman(text)) {
    await sendMessage(chatId, `Это контакт владельца ${OWNER_CONTACT} — он увидит сообщение и ответит вам в ближайшее время.`);
    await sendMessage(OWNER_CHAT_ID, `${username} запросил оператора Chat ID: ${chatId}`);
    return;
  }
  if (isDiscountRequest(text)) {
    await sendMessage(chatId, buildDiscountContactReply());
    return;
  }

  const products = extractProducts(text);
  const preferredType = detectPreferredType(text);
  const asksPrice = isPriceRequest(text);
  const asksDelivery = isDeliveryRequest(text);
  const asksWhyExpensive = isWhyExpensiveRequest(text);
  const asksPaymentMethod = isPaymentMethodRequest(text);
  const asksComparison = isComparisonRequest(text);
  const infoRequest = isInfoRequest(text);
  const purchaseSignal = hasPurchaseSignal(text);

  if (state.order && await handleContextualOrderMessage(chatId, state, username, text)) return;
  if (asksPaymentMethod) {
    await sendMessage(chatId, buildPaymentMethodReply());
    return;
  }
  if (!state.order && asksDelivery) {
    await sendMessage(chatId, buildDeliveryReply(products.length));
    return;
  }
  if (!state.order && looksLikeAddressOutsideOrder(text)) {
    await sendMessage(chatId, buildAddressOutsideOrderReply());
    return;
  }
  if (!state.order && asksWhyExpensive && products.length === 1) {
    await sendMessage(chatId, buildWhyExpensiveReply(products[0]));
    return;
  }
  if (!state.order && asksWhyExpensive && !products.length) {
    await sendMessage(chatId, buildDiscountContactReply());
    return;
  }
  if (!state.order && asksComparison && products.length === 2) {
    await sendMessage(chatId, buildComparisonReply(products));
    return;
  }
  if (!state.order && infoRequest && products.length === 1) {
    await sendMessage(chatId, buildProductInfoReply(products[0], text));
    return;
  }
  if (!state.order && asksPrice && (products.length || preferredType)) {
    await sendMessage(chatId, buildPriceReply(preferredType, products));
    return;
  }
  if (!state.order && purchaseSignal && products.length) {
    await startOrderFromProducts(chatId, state, username, products);
    return;
  }
  if (!state.order && purchaseSignal && preferredType) {
    state.order = createEmptyOrder(username, preferredType);
    await sendMessage(chatId, buildSelectionHelp(preferredType));
    return;
  }
  if (!state.order && preferredType && !products.length && isTypeChoiceMessage(text, preferredType)) {
    state.order = createEmptyOrder(username, preferredType);
    await sendMessage(chatId, buildSelectionHelp(preferredType));
    return;
  }
  if (!state.order && products.length) {
    await sendMessage(chatId, infoRequest ? buildProductInfoReply(products[0], text) : asksWhyExpensive ? buildWhyExpensiveReply(products[0]) : buildPriceReply(preferredType, products));
    return;
  }
  if (isCatalogRequest(text)) {
    await sendMessage(chatId, preferredType ? buildTypeCatalog(preferredType) : getCatalog());
    return;
  }
  if (state.order && await handleOrderStep(chatId, state, text)) return;
  await replyWithAi(chatId, state, text);
}

async function sendDailySummary() {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  if (moscowTime.getHours() !== 9) return;
  const from = new Date(moscowTime);
  from.setDate(from.getDate() - 1);
  from.setHours(9, 0, 0, 0);
  const to = new Date(moscowTime);
  to.setHours(9, 0, 0, 0);
  const orders = dailyOrders.filter((order) => order.date >= from && order.date < to);
  if (!orders.length) {
    await sendMessage(OWNER_CHAT_ID, 'За вчера (9:00-9:00) заказов не было.');
    return;
  }
  let summary = `ЗАКАЗЫ ЗА ВЧЕРА (${from.toLocaleDateString('ru-RU')} 9:00 — ${to.toLocaleDateString('ru-RU')} 9:00) Всего заказов: ${orders.length} `;
  orders.forEach((order, index) => {
    summary += `ЗАКАЗ ${index + 1}: ${order.orderNum} Клиент: @${order.tgName} ФИО: ${order.name} Тел: ${order.phone} Город: ${order.city} Адрес: ${order.address} Товары: ${order.products.map((item) => item.name).join(', ')} Сумма: ${order.grandTotal || order.total}₽ `;
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

  const state = getState(chatId);
  if (!state.order || (state.order.step !== 'awaiting_payment_screenshot' && state.order.step !== 'payment_amount')) {
    await sendMessage(chatId, buildUnsupportedPhotoReply());
    return;
  }

  try {
    const fileRes = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileRes.data.result.file_path}`;
    state.order.tgName = username;
    state.order.paymentScreenshot = fileUrl;
    state.order.step = 'payment_amount';
    await sendMessage(chatId, '✅ Скриншот получен!\n\nНапишите сумму перевода цифрами, например: 1349.');
    await sendMessage(OWNER_CHAT_ID, `@${username} отправил скриншот оплаты Ссылка: ${fileUrl} Ожидает подтверждения суммы`);
  } catch (err) {
    console.error('Ошибка обработки фото:', err.message);
    await sendMessage(chatId, `Получил фото. Напишите сумму перевода цифрами, или свяжитесь с ${OWNER_CONTACT} — он увидит и ответит в ближайшее время.`);
  }
}

async function handleVoice(msg) {
  const chatId = msg.chat.id;
  await sendMessage(chatId, buildVoiceFallbackReply());
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).json({ status: 'OK', orders: dailyOrders.length });
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message?.photo) await handlePhoto(message);
    if (message?.voice || message?.audio || message?.video_note) await handleVoice(message);
    if (message?.text) await handleMessage(message);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
