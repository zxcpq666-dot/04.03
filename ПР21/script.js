// ============================================================
// 1. ЭМУЛЯЦИЯ БАЗ ДАННЫХ API ГОСУСЛУГ
// ============================================================

const DEMO_PASSWORDS = ['password', 'password123'];

/* Пользователи */
const userDB = {
  user123: {
    id: 'user123',
    name: 'Иван Иванов',
    phone: '+7 999 999-99-99',
    email: 'ivan@example.com',
    snils: '123-456-789 00',
    passport: '45 12 345678',
    registered: 'г. Москва, ул. Тверская, д. 10, кв. 5'
  }
};

/* Услуги (Задание 1: добавлены doctor и driver) */
const servicesDB = {
  passport: {
    name: 'Загранпаспорт',
    description: 'Оформление заграничного паспорта нового поколения',
    status: 'доступно',
    price: '5000 ₽',
    terms: 'до 30 дней'
  },
  tax: {
    name: 'Налоговая задолженность',
    description: 'Проверка и оплата налоговой задолженности',
    status: 'доступно',
    debt: '0 ₽',
    last_payment: '15.01.2025'
  },
  fines: {
    name: 'Штрафы ГИБДД',
    description: 'Проверка и оплата штрафов за нарушение ПДД',
    status: 'доступно',
    count: 0,
    total: '0 ₽'
  },
  pfr: {
    name: 'Пенсионные накопления',
    description: 'Информация о состоянии индивидуального лицевого счёта',
    status: 'доступно',
    balance: '1 245 678.90 ₽',
    contributions: '2 100 000 ₽'
  },
  // --- Задание 1 ---
  doctor: {
    name: 'Запись к врачу',
    description: 'Запись на приём к врачу через электронную регистратуру',
    status: 'доступно',
    clinics: ['Поликлиника №1', 'Поликлиника №2'],
    free_slots: 15
  },
  driver: {
    name: 'Замена водительского удостоверения',
    description: 'Замена водительского удостоверения по истечении срока действия',
    status: 'доступно',
    price: '2000 ₽',
    terms: 'до 9 дней',
    medical_certificate: 'требуется'
  }
};

/* История обращений (Задание 2: добавлен serviceId для связи с услугой) */
const historyDB = [
  { id: 1, serviceId: 'passport', service: 'Загранпаспорт',            date: '2025-02-10', status: 'завершено' },
  { id: 2, serviceId: 'tax',      service: 'Налоговая задолженность',  date: '2025-01-15', status: 'завершено' },
  { id: 3, serviceId: 'fines',    service: 'Штрафы ГИБДД',             date: '2024-12-20', status: 'в обработке' }
];

/* Уведомления (Задание 6) */
const notificationsDB = [];
let notificationId = 1;

/* Состояние приложения */
let isAuthenticated = false;
let currentUser = null;
let activeService = null;
let authMode = 'password';

// ============================================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И DOM
// ============================================================

const $ = (id) => document.getElementById(id);

function statusClass(status) {
  switch (status) {
    case 'завершено':    return 'done';
    case 'в обработке':  return 'progress';
    default:             return 'new';
  }
}

// ============================================================
// 3. СИМУЛЯЦИЯ API-ЗАПРОСОВ
// ============================================================

function gosuslugiAPI(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    // Имитация задержки сети
    const delay = 300 + Math.random() * 500;

    setTimeout(() => {
      // Защищённые эндпоинты требуют авторизации
      const publicEndpoints = ['auth', 'auth_snils'];
      if (!isAuthenticated && !publicEndpoints.includes(endpoint)) {
        reject({ error: 'unauthorized', message: 'Необходима авторизация через ЕСИА' });
        return;
      }

      switch (endpoint) {
        case 'auth': {
          const user = Object.values(userDB).find(
            (u) => u.id === params.login || u.phone === params.login || u.email === params.login
          );
          if (user && DEMO_PASSWORDS.includes(params.password)) {
            resolve({ success: true, user });
          } else {
            reject({ error: 'invalid_credentials', message: 'Неверный логин или пароль' });
          }
          break;
        }

        // --- Задание 4: вход по СНИЛС ---
        case 'auth_snils': {
          const normalize = (s) => String(s || '').replace(/\D/g, '');
          const snils = normalize(params.snils);
          const user = Object.values(userDB).find((u) => normalize(u.snils) === snils);
          if (user) {
            resolve({ success: true, user });
          } else {
            reject({ error: 'invalid_snils', message: 'Пользователь с таким СНИЛС не найден' });
          }
          break;
        }

        case 'user':
          resolve({ success: true, data: currentUser || userDB.user123 });
          break;

        case 'services':
          resolve({
            success: true,
            data: Object.entries(servicesDB).map(([id, s]) => ({ id, ...s }))
          });
          break;

        case 'service':
          if (params.id && servicesDB[params.id]) {
            resolve({ success: true, data: { id: params.id, ...servicesDB[params.id] } });
          } else {
            reject({ error: 'not_found', message: 'Услуга не найдена' });
          }
          break;

        case 'history':
          resolve({ success: true, data: historyDB.slice() });
          break;

        // --- Задание 3: подача заявления ---
        case 'application': {
          const service = servicesDB[params.serviceId];
          if (!service) {
            reject({ error: 'not_found', message: 'Услуга не найдена' });
            return;
          }
          const application = {
            id: Date.now(),
            serviceId: params.serviceId,
            service: service.name,
            date: new Date().toLocaleDateString('ru-RU'),
            status: 'подано'
          };
          historyDB.unshift(application);
          addNotification(`Заявление «${service.name}» подано. Номер: ${application.id}`);
          resolve({ success: true, data: application });
          break;
        }

        // --- Обновление данных с имитацией смены статуса ---
        case 'refresh': {
          const inProgress = historyDB.find(
            (h) => h.status === 'подано' || h.status === 'в обработке'
          );
          if (inProgress) {
            inProgress.status = inProgress.status === 'подано' ? 'в обработке' : 'завершено';
            addNotification(`Статус заявки «${inProgress.service}» изменён на «${inProgress.status}»`);
          }
          resolve({
            success: true,
            data: Object.entries(servicesDB).map(([id, s]) => ({ id, ...s }))
          });
          break;
        }

        default:
          reject({ error: 'not_found', message: `Эндпоинт ${endpoint} не найден` });
      }
    }, delay);
  });
}

// ============================================================
// 4. УВЕДОМЛЕНИЯ (Задание 6)
// ============================================================

function addNotification(text) {
  notificationsDB.unshift({
    id: notificationId++,
    text,
    date: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  renderNotifications();
}

function renderNotifications() {
  const list = $('notif-list');
  const badge = $('notif-count');
  const unread = notificationsDB.filter((n) => !n.read).length;

  badge.textContent = unread;
  badge.style.display = unread ? 'flex' : 'none';

  if (!notificationsDB.length) {
    list.innerHTML = '<li class="notif-empty">Уведомлений пока нет</li>';
    return;
  }

  list.innerHTML = notificationsDB
    .map(
      (n) => `
        <li class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
          <span class="notif-text">${n.text}</span>
          <span class="notif-time">${n.date}</span>
        </li>`
    )
    .join('');
}

// ============================================================
// 5. ВЫВОД ОТВЕТА API
// ============================================================

function showAPIResponse(data, isError = false) {
  const box = $('api-response');
  const pre = box.querySelector('pre');

  box.classList.toggle('error', isError);
  box.classList.toggle('success', !isError);

  pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

// ============================================================
// 6. АВТОРИЗАЦИЯ
// ============================================================

function showActiveAuthForm() {
  $('auth-form-password').classList.toggle('hidden', authMode !== 'password');
  $('auth-form-snils').classList.toggle('hidden', authMode !== 'snils');

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.authMode === authMode);
  });
}

function updateAuthStatus() {
  const authStatus = $('auth-status');
  const widgetStatus = $('widget-status');

  if (isAuthenticated && currentUser) {
    authStatus.innerHTML =
      `Авторизован как <strong>${currentUser.name}</strong>` +
      `<span class="user-email">${currentUser.email}</span>`;
    authStatus.className = 'auth-status success';

    $('auth-tabs').classList.add('hidden');
    $('auth-form-password').classList.add('hidden');
    $('auth-form-snils').classList.add('hidden');
    $('logout-btn').classList.remove('hidden');

    widgetStatus.textContent = '● Авторизован';
    widgetStatus.classList.add('authorized');
    widgetStatus.classList.remove('unauthorized');
  } else {
    authStatus.textContent = 'Статус: не авторизован';
    authStatus.className = 'auth-status';

    $('auth-tabs').classList.remove('hidden');
    $('logout-btn').classList.add('hidden');
    showActiveAuthForm();

    widgetStatus.textContent = '● Требуется вход';
    widgetStatus.classList.add('unauthorized');
    widgetStatus.classList.remove('authorized');

    activeService = null;
    document.querySelectorAll('.service-item').forEach((el) => el.classList.remove('active'));
    $('service-detail').innerHTML =
      '<p class="hint">Выберите услугу для получения информации</p>';
  }

  renderProfile();
}

// --- Вход по логину/паролю ---
async function login() {
  const loginValue = $('auth-login').value.trim();
  const password = $('auth-password').value.trim();

  if (!loginValue || !password) {
    showAPIResponse('Введите логин и пароль', true);
    return;
  }

  const btn = $('auth-btn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Загрузка...';

  try {
    const response = await gosuslugiAPI('auth', { login: loginValue, password });
    if (response.success) {
      isAuthenticated = true;
      currentUser = response.user;

      updateAuthStatus();
      addNotification(`Выполнен вход через ЕСИА: ${currentUser.name}`);
      showAPIResponse({ message: 'Авторизация успешна', user: currentUser });
    }
  } catch (error) {
    showAPIResponse(error.message || 'Ошибка авторизации', true);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

// --- Задание 4: вход по СНИЛС ---
async function loginBySnils() {
  const snils = $('auth-snils').value.trim();

  if (!snils) {
    showAPIResponse('Введите СНИЛС', true);
    return;
  }

  const btn = $('auth-snils-btn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Проверка...';

  try {
    const response = await gosuslugiAPI('auth_snils', { snils });
    if (response.success) {
      isAuthenticated = true;
      currentUser = response.user;

      updateAuthStatus();
      addNotification(`Выполнен вход по СНИЛС: ${currentUser.name}`);
      showAPIResponse({ message: 'Авторизация по СНИЛС успешна', user: currentUser });
    }
  } catch (error) {
    showAPIResponse(error.message || 'Ошибка авторизации по СНИЛС', true);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function logout() {
  isAuthenticated = false;
  currentUser = null;
  activeService = null;

  updateAuthStatus();
  showAPIResponse('Вы вышли из Госуслуг');
}

// ============================================================
// 7. ЛИЧНЫЙ КАБИНЕТ (Задание 5)
// ============================================================

function renderProfile() {
  const section = $('profile-section');

  if (!isAuthenticated || !currentUser) {
    section.classList.add('hidden');
    section.innerHTML = '';
    return;
  }

  section.classList.remove('hidden');
  const u = currentUser;

  const historyHtml = historyDB.length
    ? historyDB
        .map(
          (h) => `
          <li class="history-item">
            <span class="history-service">${h.service}</span>
            <span class="history-date">${h.date}</span>
            <span class="badge status-${statusClass(h.status)}">${h.status}</span>
          </li>`
        )
        .join('')
    : '<li class="history-empty">Обращений пока нет</li>';

  section.innerHTML = `
    <h3>Личный кабинет</h3>

    <div class="profile-grid">
      <div class="profile-field"><span>ФИО</span><strong>${u.name}</strong></div>
      <div class="profile-field"><span>Телефон</span><strong>${u.phone}</strong></div>
      <div class="profile-field"><span>Email</span><strong>${u.email}</strong></div>
      <div class="profile-field"><span>СНИЛС</span><strong>${u.snils}</strong></div>
      <div class="profile-field"><span>Паспорт</span><strong>${u.passport}</strong></div>
      <div class="profile-field"><span>Адрес регистрации</span><strong>${u.registered}</strong></div>
    </div>

    <h4>История обращений</h4>
    <ul class="history-list">${historyHtml}</ul>
  `;
}

// ============================================================
// 8. ДЕТАЛИ УСЛУГИ + СТАТУС ЗАЯВОК (Задание 2) + ПОДАЧА (Задание 3)
// ============================================================

function showServiceDetail(serviceId) {
  const service = servicesDB[serviceId];
  if (!service) return;

  activeService = serviceId;

  document.querySelectorAll('.service-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.service === serviceId);
  });

  const labels = {
    price: 'Стоимость',
    terms: 'Срок',
    debt: 'Задолженность',
    last_payment: 'Последний платёж',
    count: 'Количество',
    total: 'Итого',
    balance: 'Баланс',
    contributions: 'Взносы',
    clinics: 'Поликлиники',
    free_slots: 'Свободных талонов',
    medical_certificate: 'Медсправка'
  };

  let detailsHtml = '';
  for (const [key, value] of Object.entries(service)) {
    if (['name', 'description', 'status'].includes(key)) continue;
    const label = labels[key] || key;
    const val = Array.isArray(value) ? value.join(', ') : value;
    detailsHtml += `
      <div class="detail-row">
        <span class="detail-label">${label}</span>
        <span class="detail-value">${val}</span>
      </div>`;
  }

  // Задание 2: статус заявок по этой услуге
  const applications = historyDB.filter((h) => h.serviceId === serviceId);
  const appsHtml = applications.length
    ? `
      <div class="detail-applications">
        <div class="detail-label">Ваши заявки</div>
        ${applications
          .map(
            (a) => `
            <div class="detail-row">
              <span class="detail-value">№ ${a.id} от ${a.date}</span>
              <span class="badge status-${statusClass(a.status)}">${a.status}</span>
            </div>`
          )
          .join('')}
      </div>`
    : '';

  $('service-detail').innerHTML = `
    <div class="service-detail-result">
      <h4>${service.name}</h4>
      <p class="service-description">${service.description}</p>
      ${detailsHtml}
      ${appsHtml}
      <button class="btn-apply" type="button" data-apply="${serviceId}">Подать заявление</button>
    </div>`;
}

// --- Задание 3: подача заявления ---
async function submitApplication(serviceId, btn) {
  if (!isAuthenticated) {
    alert('Для подачи заявления необходимо авторизоваться через ЕСИА!');
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Отправка...';

  try {
    const response = await gosuslugiAPI('application', { serviceId });
    if (response.success) {
      showAPIResponse({ message: 'Заявление подано', application: response.data });
    }
  } catch (error) {
    showAPIResponse(error.message || 'Ошибка подачи заявления', true);
  } finally {
    btn.disabled = false;
    btn.textContent = original;

    // перерисовываем детали (появился новый статус) и личный кабинет
    showServiceDetail(serviceId);
    renderProfile();
  }
}

// ============================================================
// 9. ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================

/* --- Уведомления --- */
$('notif-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('notif-dropdown').classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.notif-wrapper')) {
    $('notif-dropdown').classList.remove('open');
  }
});

$('notif-list').addEventListener('click', (e) => {
  const item = e.target.closest('.notif-item');
  if (!item) return;
  const notif = notificationsDB.find((n) => n.id === Number(item.dataset.id));
  if (notif) {
    notif.read = true;
    renderNotifications();
  }
});

$('notif-read-all').addEventListener('click', () => {
  notificationsDB.forEach((n) => (n.read = true));
  renderNotifications();
});

/* --- Вкладки авторизации --- */
document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    authMode = tab.dataset.authMode;
    showActiveAuthForm();
  });
});

/* --- Кнопки входа / выхода --- */
$('auth-btn').addEventListener('click', login);
$('auth-snils-btn').addEventListener('click', loginBySnils);
$('logout-btn').addEventListener('click', logout);

/* --- Enter в полях ввода --- */
[['auth-login', 'auth-btn'], ['auth-password', 'auth-btn'], ['auth-snils', 'auth-snils-btn']]
  .forEach(([inputId, btnId]) => {
    $(inputId).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $(btnId).click();
    });
  });

/* --- Клик по услуге --- */
document.querySelectorAll('.service-item').forEach((el) => {
  el.addEventListener('click', function () {
    if (!isAuthenticated) {
      alert('Для просмотра услуг необходимо авторизоваться через ЕСИА!');
      return;
    }
    showServiceDetail(this.dataset.service);
  });
});

/* --- Подача заявления (делегирование) --- */
$('service-detail').addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-apply');
  if (!btn) return;
  await submitApplication(btn.dataset.apply, btn);
});

/* --- Обновление данных --- */
$('refresh-btn').addEventListener('click', async function () {
  if (!isAuthenticated) {
    alert('Необходимо авторизоваться');
    return;
  }

  this.disabled = true;
  this.textContent = 'Обновление...';

  try {
    const response = await gosuslugiAPI('refresh');
    showAPIResponse({ message: 'Данные обновлены', services: response.data });

    $('widget-status').textContent = '● Синхронизировано';
    setTimeout(() => {
      $('widget-status').textContent = isAuthenticated ? '● Авторизован' : '● Требуется вход';
    }, 2000);

    renderProfile();
    if (activeService) showServiceDetail(activeService);
  } catch (error) {
    showAPIResponse(error.message || 'Ошибка обновления', true);
  } finally {
    this.disabled = false;
    this.textContent = 'Обновить данные';
  }
});

/* --- API-запросы --- */
document.querySelectorAll('.api-btn').forEach((btn) => {
  btn.addEventListener('click', async function () {
    if (!isAuthenticated) {
      alert('Для выполнения запросов необходимо авторизоваться через ЕСИА!');
      return;
    }

    const apiName = this.dataset.api;
    const labels = {
      user: 'Получить данные пользователя',
      services: 'Список услуг',
      history: 'История обращений'
    };

    this.disabled = true;
    this.textContent = 'Загрузка...';

    try {
      const response = await gosuslugiAPI(apiName);
      showAPIResponse(response.data);
    } catch (error) {
      showAPIResponse(error.message || 'Ошибка запроса', true);
    } finally {
      this.disabled = false;
      this.textContent = labels[apiName] || 'API-запрос';
    }
  });
});

// ============================================================
// 10. ЗАДАНИЕ 7: ВСТРАИВАЕМЫЙ ВИДЖЕТ ПОС
// ============================================================
// В реальном проекте этот код выносится в отдельный файл widget.js
// и подключается одной строкой <script src="widget.js"></script>.

(function embeddableWidget() {
  const container = document.getElementById('gosuslugi-widget');
  if (!container) return;

  const orgId = container.dataset.orgId || 'XXXXX';

  container.innerHTML = `
    <div class="pos-widget">
      <div class="pos-widget-header">
        <strong>Платформа обратной связи</strong>
        <span class="pos-org">ID организации: ${orgId}</span>
      </div>
      <textarea id="pos-message" placeholder="Опишите вашу проблему..."></textarea>
      <div class="pos-widget-footer">
        <span class="pos-hint" id="pos-hint">Виджет ПОС · Госуслуги</span>
        <button id="pos-send" type="button">Отправить обращение</button>
      </div>
    </div>`;

  container.querySelector('#pos-send').addEventListener('click', () => {
    const textarea = container.querySelector('#pos-message');
    const hint = container.querySelector('#pos-hint');
    const text = textarea.value.trim();

    if (!text) {
      hint.textContent = 'Введите текст обращения';
      hint.className = 'pos-hint error';
      return;
    }

    hint.textContent = 'Обращение отправлено в ЦУР ✔';
    hint.className = 'pos-hint success';
    textarea.value = '';

    addNotification('Новое обращение отправлено через виджет ПОС в ЦУР');
  });
})();

// ============================================================
// 11. ИНИЦИАЛИЗАЦИЯ
// ============================================================

renderNotifications();
showActiveAuthForm();
updateAuthStatus();