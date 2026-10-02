/* =====================================================================
   ПРАКТИЧЕСКАЯ РАБОТА 9
   Контроль за событиями, происходящими в окне браузера
   ===================================================================== */

/* =====================================================================
   0. УТИЛИТЫ
   ===================================================================== */
const $ = (id) => document.getElementById(id);

/* =====================================================================
   1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ===================================================================== */
let eventLogPaused  = false;
let resizeCounter   = 0;
let scrollCounter   = 0;
let focusCounter    = 0;
let networkCounter  = 0;
let navCounter      = 0;
let storageCounter  = 0;
let focusStartTime  = Date.now();
let totalFocusTime  = 0;
let isFocused       = true;
let eventBuffer     = [];

/* --- ЗАДАНИЕ 4: счётчики активности --- */
let clickCount     = 0;
let mouseMoveCount = 0;
let keyCount       = 0;
let lastActivity   = Date.now();
let inactivityNotified = false;
const INACTIVITY_LIMIT = 30_000; // 30 секунд

/* --- ЗАДАНИЕ 3: офлайн-очередь --- */
const QUEUE_KEY = 'offline_action_queue';

/* --- ЗАДАНИЕ 6: чат между вкладками --- */
const CHAT_KEY = 'cross_tab_chat';

/* --- ЗАДАНИЕ 5: хлебные крошки --- */
const navTrail = [{ label: 'Начало', hash: '' }];
let trailIndex = 0;

/* =====================================================================
   2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ===================================================================== */

/* Запись в журнал событий */
function addLog(message, type = 'other') {
  if (eventLogPaused) {
    eventBuffer.push({ message, type });
    return;
  }
  const log = $('eventLog');
  if (!log) return;

  const entry = document.createElement('div');
  entry.className = `log-entry event-${type}`;

  const timestamp = new Date().toLocaleTimeString('ru-RU', { hour12: false });
  const tsSpan = document.createElement('span');
  tsSpan.className = 'timestamp';
  tsSpan.textContent = `[${timestamp}]`;

  entry.appendChild(tsSpan);
  entry.appendChild(document.createTextNode(' ' + message));

  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;

  // Ограничиваем количество записей
  while (log.children.length > 500) log.removeChild(log.firstChild);
}

/* Throttle — ограничение частоты вызовов */
function throttle(func, delay) {
  let lastCall = 0;
  let lastArgs = null;
  let timerId  = null;

  return function (...args) {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCall >= delay) {
      clearTimeout(timerId);
      timerId = null;
      lastCall = now;
      func.apply(this, args);
    } else if (!timerId) {
      timerId = setTimeout(() => {
        lastCall = Date.now();
        timerId = null;
        func.apply(this, lastArgs);
      }, delay - (now - lastCall));
    }
  };
}

/* Debounce — отложенное выполнение */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/* Всплывающее уведомление */
function showToast(message, type = 'info') {
  const container = $('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* =====================================================================
   3. СОБЫТИЯ ЗАГРУЗКИ СТРАНИЦЫ
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  addLog('📄 DOM полностью загружен и разобран (DOMContentLoaded)', 'load');
  init();
});

window.addEventListener('load', () => {
  addLog('✅ Страница и все ресурсы загружены (load)', 'load');
  updateAllInfo();
});

/* pageshow — страница показана (в т.ч. из кэша) */
window.addEventListener('pageshow', (event) => {
  const fromCache = event.persisted ? 'из кэша' : 'обычная загрузка';
  addLog(`🔄 Страница показана (${fromCache}) [pageshow]`, 'load');
});

/* pagehide — страница скрыта (перед уходом) */
window.addEventListener('pagehide', () => {
  addLog('👋 Страница скрыта [pagehide]', 'load');
});

/* =====================================================================
   4. СОБЫТИЯ ПЕРЕД ЗАКРЫТИЕМ
   ===================================================================== */

window.addEventListener('beforeunload', (event) => {
  addLog('⚠️ Попытка закрыть или обновить страницу [beforeunload]', 'error');

  // Если есть несохранённые данные — раскомментируйте, чтобы браузер
  // показал системный диалог подтверждения:
  // event.preventDefault();
  // event.returnValue = '';
});

window.addEventListener('unload', () => {
  // DOM уже разрушается — можно писать только в console
  console.log('📴 Страница выгружена [unload]');
});

/* =====================================================================
   5. СОБЫТИЯ ИЗМЕНЕНИЯ РАЗМЕРА + ЗАДАНИЕ 1 (БРЕЙКПОИНТЫ И ТЕМЫ)
   ===================================================================== */

/* ЗАДАНИЕ 1: определение брейкпоинта */
function getBreakpoint(width) {
  if (width < 768)  return { name: 'mobile',  label: '📱 Mobile (< 768px)' };
  if (width < 1024) return { name: 'tablet',  label: '📲 Tablet (768–1023px)' };
  if (width < 1440) return { name: 'desktop', label: '💻 Desktop (1024–1439px)' };
  return { name: 'wide', label: '🖥️ Wide (≥ 1440px)' };
}

function applyBreakpointTheme() {
  const bp = getBreakpoint(window.innerWidth);
  document.body.classList.remove('theme-mobile', 'theme-tablet', 'theme-desktop', 'theme-wide');
  document.body.classList.add(`theme-${bp.name}`);

  const el = $('breakpoint');
  if (el) el.textContent = bp.label;

  return bp;
}

function updateSizeInfo() {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const outerW = window.outerWidth;
  const outerH = window.outerHeight;
  const ratio  = window.devicePixelRatio || 1;
  const orientation = window.screen?.orientation?.type || 'не определено';

  $('innerSize').textContent  = `${innerW}×${innerH} px`;
  $('outerSize').textContent  = `${outerW}×${outerH} px`;
  $('pixelRatio').textContent = `${ratio}x`;
  $('orientation').textContent = orientation;
  $('viewportInfo').textContent = `${innerW}×${innerH}`;

  applyBreakpointTheme();
}

/* Обработчик resize с throttle для оптимизации */
const handleResize = throttle(() => {
  resizeCounter++;
  $('resizeCount').textContent = resizeCounter;
  updateSizeInfo();
  addLog(`📐 Изменение размера окна: ${window.innerWidth}×${window.innerHeight} (событие #${resizeCounter})`, 'resize');
}, 200);

window.addEventListener('resize', handleResize);

/* orientationchange — изменение ориентации экрана */
window.addEventListener('orientationchange', () => {
  const orientation = window.screen?.orientation?.type || 'не определено';
  addLog(`📱 Ориентация изменена: ${orientation} [orientationchange]`, 'resize');
  updateSizeInfo();
});

/* =====================================================================
   6. СОБЫТИЯ ПРОКРУТКИ + ЗАДАНИЕ 2 (КНОПКА "НАВЕРХ")
   ===================================================================== */

function updateScrollInfo() {
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScrollY > 0 ? (scrollY / maxScrollY) * 100 : 0;

  $('scrollX').textContent = Math.round(scrollX);
  $('scrollY').textContent = Math.round(scrollY);
  $('maxScroll').textContent = `${Math.round(maxScrollY)} px`;
  $('scrollPercent').textContent = `${Math.round(percent)}%`;
  $('scrollBadge').textContent   = `${Math.round(percent)}%`;
  $('scrollBar').style.width     = `${percent}%`;
  $('scrollIndicator').style.width = `${percent}%`;
}

/* ЗАДАНИЕ 2: показ кнопки "Наверх" после 300px */
function updateToTopButton() {
  const btn = $('toTopBtn');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 300);
}

/* Обработчик scroll с оптимизацией */
const handleScroll = throttle(() => {
  scrollCounter++;
  $('scrollCount').textContent = scrollCounter;
  updateScrollInfo();
  updateToTopButton();

  // Пишем в лог только каждое 5-е событие, чтобы не засорять журнал
  if (scrollCounter % 5 === 0) {
    addLog(`🖱️ Прокрутка: ${Math.round(window.scrollY)} px (событие #${scrollCounter})`, 'scroll');
  }
}, 100);

window.addEventListener('scroll', handleScroll);

/* Прокрутка внутри отдельного элемента */
document.addEventListener('DOMContentLoaded', () => {
  const sc = $('scrollContent');
  if (!sc) return;

  sc.addEventListener('scroll', throttle((e) => {
    const el = e.target;
    const max = el.scrollHeight - el.clientHeight;
    const percent = max > 0 ? (el.scrollTop / max) * 100 : 0;

    if (Math.round(percent) % 10 === 0) {
      addLog(`📜 Прокрутка в блоке: ${Math.round(percent)}%`, 'scroll');
    }
  }, 200));
});

/* ЗАДАНИЕ 2: плавная прокрутка к выбранному элементу */
function scrollToElement(id) {
  const target = $(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  addLog(`🎯 Плавная прокрутка к элементу #${id}`, 'scroll');
}

/* =====================================================================
   7. СОБЫТИЯ ФОКУСА И ВИДИМОСТИ
   ===================================================================== */

function updateFocusInfo() {
  const dot    = $('focusDot');
  const state  = $('focusState');
  const status = $('focusStatus');

  if (document.hasFocus()) {
    dot.className = 'status-dot focused';
    state.textContent = 'В фокусе';
    state.style.color = '#2ecc71';
    status.textContent = 'активно';
    status.style.color = '#2ecc71';
  } else {
    dot.className = 'status-dot blurred';
    state.textContent = 'Не в фокусе';
    state.style.color = '#95a5a6';
    status.textContent = 'не активно';
    status.style.color = '#95a5a6';
  }

  const visState = document.visibilityState;
  $('visibilityState').textContent = visState === 'visible' ? '👁️ Видима' : '🙈 Скрыта';

  if (document.hasFocus()) {
    const now = Date.now();
    totalFocusTime += (now - focusStartTime);
    focusStartTime = now;
    $('focusTime').textContent = `${Math.round(totalFocusTime / 1000)} c`;
  }
}

/* focus — окно получило фокус */
window.addEventListener('focus', () => {
  focusCounter++;
  $('focusChangeCount').textContent = focusCounter;
  focusStartTime = Date.now();
  isFocused = true;
  addLog(`🔵 Окно получило фокус (событие #${focusCounter}) [focus]`, 'focus');
  updateFocusInfo();
});

/* blur — окно потеряло фокус */
window.addEventListener('blur', () => {
  focusCounter++;
  $('focusChangeCount').textContent = focusCounter;

  if (isFocused) {
    totalFocusTime += (Date.now() - focusStartTime);
  }
  isFocused = false;

  addLog(`⚪ Окно потеряло фокус (событие #${focusCounter}) [blur]`, 'focus');
  updateFocusInfo();
});

/* visibilitychange — изменение видимости вкладки */
document.addEventListener('visibilitychange', () => {
  const state = document.visibilityState;
  addLog(`👁️ Видимость страницы: ${state} [visibilitychange]`, 'focus');
  updateFocusInfo();
});

/* =====================================================================
   8. СОБЫТИЯ СЕТИ + ЗАДАНИЕ 3 (ОФЛАЙН-РЕЖИМ)
   ===================================================================== */

/* --- ЗАДАНИЕ 3: очередь действий для синхронизации --- */
function queueAction(action) {
  if (navigator.onLine) return; // в онлайн-режиме очередь не нужна

  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch (e) { queue = []; }

  queue.push({ ...action, ts: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

  updateQueueCounter();
  updateStorageInfo();
}

function updateQueueCounter() {
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch (e) { queue = []; }
  const el = $('queueCount');
  if (el) el.textContent = queue.length;
}

function flushQueue() {
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch (e) { return; }

  if (!queue.length) return;

  // Здесь в реальном приложении была бы отправка на сервер
  addLog(`🔄 Синхронизация: обработано ${queue.length} действий, накопленных офлайн`, 'network');
  showToast(`Синхронизировано действий: ${queue.length}`, 'success');

  localStorage.removeItem(QUEUE_KEY);
  updateQueueCounter();
  updateStorageInfo();
}

/* --- Обновление информации о сети --- */
function updateNetworkInfo() {
  const isOnline = navigator.onLine;
  const dot    = $('networkDot');
  const state  = $('networkState');
  const status = $('networkStatus');

  if (isOnline) {
    dot.className = 'status-dot online';
    state.textContent = 'Онлайн';
    state.style.color = '#2ecc71';
    status.textContent = 'online';
    status.style.color = '#2ecc71';
  } else {
    dot.className = 'status-dot offline';
    state.textContent = 'Офлайн';
    state.style.color = '#e74c3c';
    status.textContent = 'offline';
    status.style.color = '#e74c3c';
  }

  // Network Information API
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    $('connectionType').textContent = connection.effectiveType || '—';
    $('downlinkSpeed').textContent  = connection.downlink ? `${connection.downlink} Mbps` : '—';
  } else {
    $('connectionType').textContent = 'API не поддерживается';
    $('downlinkSpeed').textContent  = '—';
  }

  updateQueueCounter();
}

/* online — появилось соединение */
window.addEventListener('online', () => {
  networkCounter++;
  $('networkChangeCount').textContent = networkCounter;
  addLog(`🟢 Соединение восстановлено [online] (событие #${networkCounter})`, 'network');
  showToast('Соединение восстановлено', 'success');
  updateNetworkInfo();
  flushQueue();  // ЗАДАНИЕ 3: синхронизируем накопленное
});

/* offline — потеряно соединение */
window.addEventListener('offline', () => {
  networkCounter++;
  $('networkChangeCount').textContent = networkCounter;
  addLog(`🔴 Соединение потеряно [offline] (событие #${networkCounter})`, 'network');
  showToast('⚠️ Нет подключения к интернету. Работаем в офлайн-режиме.', 'danger');
  updateNetworkInfo();
});

/* =====================================================================
   9. СОБЫТИЯ НАВИГАЦИИ И ИСТОРИИ + ЗАДАНИЕ 5 (ХЛЕБНЫЕ КРОШКИ)
   ===================================================================== */

function updateNavigationInfo() {
  $('currentURL').textContent   = window.location.href;
  $('currentHash').textContent  = window.location.hash || '—';
  $('historyLength').textContent = window.history.length;
  $('navChangeCount').textContent = navCounter;
}

/* ЗАДАНИЕ 5: отрисовка хлебных крошек */
function renderBreadcrumbs() {
  const box = $('breadcrumbs');
  if (!box) return;
  box.innerHTML = '';

  navTrail.forEach((crumb, i) => {
    const span = document.createElement('span');
    span.className = 'crumb' + (i === trailIndex ? ' crumb-active' : '');
    span.textContent = crumb.label;
    if (i !== trailIndex) {
      span.title = 'Перейти к этому шагу';
      span.addEventListener('click', () => window.history.go(i - trailIndex));
    }
    box.appendChild(span);

    if (i < navTrail.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '›';
      box.appendChild(sep);
    }
  });
}

/* popstate — переход по истории (назад/вперёд) */
window.addEventListener('popstate', (event) => {
  navCounter++;

  if (event.state && typeof event.state.trailIndex === 'number') {
    trailIndex = event.state.trailIndex;
  } else {
    trailIndex = 0;
  }

  const state = event.state ? JSON.stringify(event.state) : 'нет данных';
  addLog(`↔️ Переход по истории: state=${state} [popstate] (событие #${navCounter})`, 'history');

  updateNavigationInfo();
  renderBreadcrumbs();
});

/* hashchange — изменение хэш-части URL */
window.addEventListener('hashchange', (event) => {
  navCounter++;
  addLog(`#️⃣ Хэш изменён: ${window.location.hash} (было: ${event.oldURL.split('#')[1] || '—'}) [hashchange]`, 'history');
  updateNavigationInfo();
});

/* ЗАДАНИЕ 5: кнопки "Назад"/"Вперёд" и pushState */
function pushStateDemo() {
  const id    = Date.now().toString().slice(-4);
  const hash  = `#section-${id}`;
  const label = `section-${id}`;

  // Обрезаем «будущее» и добавляем новый шаг
  navTrail.splice(trailIndex + 1);
  navTrail.push({ label, hash });
  trailIndex = navTrail.length - 1;

  window.history.pushState(
    { trailIndex, label, ts: Date.now() },
    '',
    hash
  );

  navCounter++;
  $('navChangeCount').textContent = navCounter;

  addLog(`➕ pushState → ${hash} (событие #${navCounter})`, 'history');
  queueAction({ type: 'pushState', hash });

  updateNavigationInfo();
  renderBreadcrumbs();
}

/* =====================================================================
   10. СОБЫТИЯ STORAGE + ЗАДАНИЕ 6 (ЧАТ МЕЖДУ ВКЛАДКАМИ)
   ===================================================================== */

function updateStorageInfo() {
  $('storageCount').textContent  = localStorage.length;
  $('sessionCount').textContent  = sessionStorage.length;
}

/* storage — изменение localStorage из другой вкладки */
window.addEventListener('storage', (event) => {
  storageCounter++;
  $('storageChangeCount').textContent = storageCounter;

  addLog(
    `💾 Storage изменён: ключ="${event.key}", старое="${event.oldValue}", новое="${event.newValue}" ` +
    `[storage] (событие #${storageCounter})`,
    'storage'
  );

  // ЗАДАНИЕ 6: живое обновление интерфейса
  if (event.key === CHAT_KEY) {
    renderChat();
    showToast('📩 Новое сообщение из другой вкладки', 'info');
  }

  updateStorageInfo();
  updateQueueCounter();
});

/* --- Кнопки работы со Storage --- */
function testStorage() {
  const key   = `test_${Date.now()}`;
  const value = `Тестовые данные ${new Date().toLocaleTimeString()}`;

  localStorage.setItem(key, value);
  addLog(`💾 Записано в localStorage: ${key} = "${value}"`, 'storage');
  queueAction({ type: 'storage_write', key });

  updateStorageInfo();
}

function clearStorage() {
  if (confirm('Очистить все данные localStorage?')) {
    localStorage.clear();
    addLog('🗑️ localStorage полностью очищен', 'storage');
    updateStorageInfo();
    updateQueueCounter();
    renderChat();
  }
}

/* --- ЗАДАНИЕ 6: чат между вкладками --- */
function loadChat() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function renderChat() {
  const box = $('chatMessages');
  if (!box) return;

  const msgs = loadChat();
  box.innerHTML = '';

  if (!msgs.length) {
    const empty = document.createElement('div');
    empty.className = 'chat-empty';
    empty.textContent = 'Пока нет сообщений';
    box.appendChild(empty);
    return;
  }

  msgs.forEach((m) => {
    const div = document.createElement('div');
    div.className = 'chat-msg';

    const time = document.createElement('span');
    time.className = 'chat-time';
    time.textContent = new Date(m.ts).toLocaleTimeString('ru-RU', { hour12: false });

    div.appendChild(time);
    div.appendChild(document.createTextNode(m.text)); // безопасно: не используем innerHTML
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function sendChat() {
  const input = $('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const msgs = loadChat();
  msgs.push({ text, ts: Date.now() });
  if (msgs.length > 100) msgs.splice(0, msgs.length - 100);

  localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
  input.value = '';

  renderChat();
  updateStorageInfo();
  queueAction({ type: 'chat_send', text });

  addLog(`💬 Отправлено сообщение в чат: "${text}"`, 'storage');
}

function clearChat() {
  if (!confirm('Очистить историю чата во всех вкладках?')) return;
  localStorage.removeItem(CHAT_KEY);
  renderChat();
  updateStorageInfo();
  addLog('🗑️ Чат между вкладками очищен', 'storage');
}

/* =====================================================================
   11. ОБРАБОТКА ОШИБОК
   ===================================================================== */

window.addEventListener('error', (event) => {
  const message  = event.message  || 'неизвестная ошибка';
  const filename = (event.filename || 'неизвестный файл').split('/').pop();
  const line     = event.lineno   || '?';
  addLog(`❌ Ошибка: ${message} (${filename}:${line}) [error]`, 'error');
  // Не подавляем стандартное поведение
});

window.addEventListener('unhandledrejection', (event) => {
  addLog(`❌ Непойманное исключение в Promise: ${event.reason} [unhandledrejection]`, 'error');
});

/* =====================================================================
   12. УПРАВЛЕНИЕ ЛОГОМ
   ===================================================================== */

function toggleLogPause() {
  eventLogPaused = !eventLogPaused;
  const btn = $('pauseBtn');

  if (eventLogPaused) {
    btn.textContent = '▶ Продолжить';
    addLog('⏸️ Запись в лог приостановлена', 'other');
  } else {
    btn.textContent = 'Пауза';

    // Восстанавливаем буферизованные записи
    const buffered = eventBuffer.slice();
    eventBuffer = [];
    buffered.forEach((entry) => addLog(entry.message, entry.type));

    addLog('▶️ Запись в лог возобновлена', 'other');
  }
}

function clearLog() {
  const log = $('eventLog');
  log.innerHTML = '';
  const entry = document.createElement('div');
  entry.className = 'log-entry event-other';
  const ts = document.createElement('span');
  ts.className = 'timestamp';
  ts.textContent = '[система]';
  entry.appendChild(ts);
  entry.appendChild(document.createTextNode(' Журнал очищен'));
  log.appendChild(entry);

  addLog('🗑️ Журнал событий очищен пользователем', 'other');
}

function exportLog() {
  const log = $('eventLog');
  const entries = log.querySelectorAll('.log-entry');

  let text = '=== Журнал событий окна ===\n';
  text += `Дата экспорта: ${new Date().toLocaleString()}\n`;
  text += `Всего записей: ${entries.length}\n`;
  text += '='.repeat(40) + '\n\n';

  entries.forEach((entry) => { text += entry.textContent + '\n'; });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `event-log-${Date.now()}.txt`;
  a.click();

  URL.revokeObjectURL(url);
  addLog('📥 Лог экспортирован в файл', 'other');
}

/* =====================================================================
   13. ОБНОВЛЕНИЕ ВСЕЙ ИНФОРМАЦИИ
   ===================================================================== */

function updateAllInfo() {
  updateSizeInfo();
  updateScrollInfo();
  updateNetworkInfo();
  updateFocusInfo();
  updateNavigationInfo();
  updateStorageInfo();
  updateQueueCounter();
  updateToTopButton();
  renderBreadcrumbs();
  renderChat();
}

/* =====================================================================
   14. ЗАДАНИЕ 4: ОТСЛЕЖИВАНИЕ АКТИВНОСТИ ПОЛЬЗОВАТЕЛЯ
   ===================================================================== */

function resetInactivity() {
  lastActivity = Date.now();
  inactivityNotified = false;

  const badge = $('activityBadge');
  if (badge) {
    badge.textContent = 'активен';
    badge.style.color = '#2ecc71';
  }
}

/* Таймер проверки бездействия — раз в секунду */
setInterval(() => {
  const idle = Math.floor((Date.now() - lastActivity) / 1000);

  const el = $('idleTime');
  if (el) el.textContent = `${idle} c`;

  if (idle * 1000 >= INACTIVITY_LIMIT && !inactivityNotified) {
    inactivityNotified = true;
    addLog(`😴 Пользователь неактивен ${idle} секунд`, 'other');
    showToast('😴 Вы неактивны уже 30 секунд. Всё в порядке?', 'warn');

    const badge = $('activityBadge');
    if (badge) {
      badge.textContent = 'неактивен';
      badge.style.color = '#f7971e';
    }
  }
}, 1000);

/* Обновление счётчика движений мыши (сам счётчик — в памяти) */
const updateMouseCounter = throttle(() => {
  $('mouseMoveCount').textContent = mouseMoveCount;
}, 300);

/* =====================================================================
   15. ИНИЦИАЛИЗАЦИЯ
   ===================================================================== */

function init() {
  console.log('🚀 Система мониторинга событий окна запущена');

  /* ---- Инициализация истории (для хлебных крошек) ---- */
  window.history.replaceState({ trailIndex: 0, label: 'Начало' }, '', window.location.href);

  /* ---- Подключение обработчиков кнопок ---- */
  $('pauseBtn').addEventListener('click', toggleLogPause);
  $('exportBtn').addEventListener('click', exportLog);
  $('clearLogBtn').addEventListener('click', clearLog);

  $('testStorageBtn').addEventListener('click', testStorage);
  $('clearStorageBtn').addEventListener('click', clearStorage);

  $('pushStateBtn').addEventListener('click', pushStateDemo);
  $('backBtn').addEventListener('click', () => window.history.back());
  $('forwardBtn').addEventListener('click', () => window.history.forward());

  $('toTopBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addLog('⬆️ Плавная прокрутка наверх', 'scroll');
    queueAction({ type: 'scroll_top' });
  });

  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', () => scrollToElement(btn.dataset.scrollTo));
  });

  $('chatSend').addEventListener('click', sendChat);
  $('chatClear').addEventListener('click', clearChat);
  $('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });

  /* ---- Network Information API: изменения соединения ---- */
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    connection.addEventListener('change', () => {
      addLog(
        `📶 Изменение соединения: тип = ${connection.effectiveType}, скорость = ${connection.downlink} Mbps`,
        'network'
      );
      updateNetworkInfo();
    });
  }

  /* ---- ЗАДАНИЕ 4: обработчики активности пользователя ---- */
  document.addEventListener('click', () => {
    clickCount++;
    $('clickCount').textContent = clickCount;
    resetInactivity();
  }, true);

  document.addEventListener('mousemove', () => {
    mouseMoveCount++;
    updateMouseCounter();
    resetInactivity();
  }, { passive: true });

  document.addEventListener('keydown', () => {
    keyCount++;
    $('keyCount').textContent = keyCount;
    resetInactivity();
  });

  document.addEventListener('touchstart', resetInactivity, { passive: true });
  window.addEventListener('scroll', resetInactivity, { passive: true });

  /* ---- Стартовая информация ---- */
  addLog('🟢 Система мониторинга активна. Все события фиксируются.', 'other');
  addLog('💡 Изменяй размер окна, скролль, переключай вкладки — всё записывается!', 'other');

  /* ---- Первичное обновление интерфейса ---- */
  updateAllInfo();

  /* =====================================================================
     16. ДОПОЛНИТЕЛЬНО: МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ
     ===================================================================== */

  if ('PerformanceObserver' in window) {
    // Долгие задачи (Long Tasks API)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            addLog(`🐢 Долгая задача: ${Math.round(entry.duration)} ms (${entry.name})`, 'error');
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      console.log('✅ PerformanceObserver (longtask) активирован');
    } catch (e) {
      console.log('ℹ️ Long Tasks API не поддерживается');
    }

    // Загрузка ресурсов
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.duration > 100) {
            const name = entry.name.split('/').pop() || entry.name;
            addLog(`📦 Ресурс загружен: ${name} (${Math.round(entry.duration)} ms)`, 'load');
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Игнорируем
    }
  }

  console.log('✅ Все обработчики событий установлены');
}