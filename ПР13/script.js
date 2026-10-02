/* =====================================================================
   ПРАКТИЧЕСКАЯ РАБОТА 11 (ПР13)
   Методы перебора массивов. Использование встроенных структур данных
   Приложение: «Инвентаризация склада»
   ===================================================================== */

/* =====================================================================
   1. ИСХОДНЫЕ ДАННЫЕ
   ===================================================================== */

const warehouse = [
  { id: 1, name: "Ноутбук",     price: 1000, quantity: 4,  category: "tech" },
  { id: 2, name: "Мышь",        price: 50,   quantity: 15, category: "tech" },
  { id: 3, name: "Клавиатура",  price: 80,   quantity: 10, category: "tech" },
  { id: 4, name: "Стол",        price: 300,  quantity: 2,  category: "furniture" },
  { id: 5, name: "Стул",        price: 150,  quantity: 8,  category: "furniture" },
  { id: 6, name: "Лампа",       price: 40,   quantity: 20, category: "lighting" },
  { id: 7, name: "Монитор",     price: 700,  quantity: 5,  category: "tech" },
];

/* =====================================================================
   2. УТИЛИТЫ
   ===================================================================== */

const $ = (id) => document.getElementById(id);

/* Безопасное экранирование HTML (защита от XSS) */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Обёртка для тега категории */
function categoryTag(cat) {
  return `<span class="tag tag-${cat}">${escapeHtml(cat)}</span>`;
}

/* Форматирование цены */
function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

/* =====================================================================
   3. ШАГ 1: ОТОБРАЖЕНИЕ ВСЕГО СКЛАДА (forEach)
   ===================================================================== */

function displayAllItems(items) {
  const output = $('output');

  if (items.length === 0) {
    output.innerHTML = '<div class="error-msg">Список товаров пуст.</div>';
    return;
  }

  // forEach используется для побочного эффекта — накопления HTML-строк
  let html = `
    <h3>Все товары (${items.length})</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Название</th><th>Цена</th>
          <th>Кол-во</th><th>Стоимость</th><th>Категория</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach((item) => {
    const total = item.price * item.quantity;
    html += `
      <tr>
        <td>${item.id}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${formatPrice(item.price)}</td>
        <td>${item.quantity} шт.</td>
        <td>${formatPrice(total)}</td>
        <td>${categoryTag(item.category)}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  output.innerHTML = html;
}

/* =====================================================================
   4. ШАГ 2: ПОИСК ТОВАРА (find)
   ===================================================================== */

function findProductByName(searchName) {
  const query = searchName.trim().toLowerCase();
  const output = $('output');

  if (!query) {
    output.innerHTML = '<div class="error-msg">Введите название товара.</div>';
    return;
  }

  // find возвращает ПЕРВЫЙ подходящий объект или undefined
  const found = warehouse.find(
    (item) => item.name.toLowerCase() === query
  );

  if (found) {
    output.innerHTML = `
      <h3>✅ Товар найден</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Название</div>
          <div class="stat-value" style="font-size:1.1em;">${escapeHtml(found.name)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Цена</div>
          <div class="stat-value">${formatPrice(found.price)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">В наличии</div>
          <div class="stat-value">${found.quantity} шт.</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Категория</div>
          <div class="stat-value" style="font-size:1em;">${categoryTag(found.category)}</div>
        </div>
      </div>
    `;
  } else {
    output.innerHTML = `
      <div class="error-msg">
        ❌ Товар «${escapeHtml(searchName)}» не найден!
      </div>
    `;
  }
}

/* =====================================================================
   5. ШАГ 3: ПРЕМИУМ-ТОВАРЫ (filter)
   ===================================================================== */

function getPremiumItems() {
  // filter ВСЕГДА возвращает массив (даже пустой)
  const premium = warehouse.filter((item) => item.price > 500);

  if (premium.length === 0) {
    $('output').innerHTML = '<div class="error-msg">Премиум-товаров нет.</div>';
    return;
  }

  // Переиспользуем функцию из шага 1
  displayAllItems(premium);

  // Добавляем счётчик
  const badge = document.createElement('span');
  badge.className = 'badge-info';
  badge.textContent = `Найдено ${premium.length} премиум-товар(ов)`;
  $('output').appendChild(badge);
}

/* =====================================================================
   6. ШАГ 4: ПРАЙС-ЛИСТ (map)
   ===================================================================== */

function generatePriceList() {
  // map создаёт НОВЫЙ массив той же длины, преобразуя каждый элемент
  const priceList = warehouse.map((item) => ({
    name: item.name,
    price: item.price,
    line: `${item.name} — ${item.price} ₽`,
  }));

  const output = $('output');
  output.innerHTML = `<h3>🏷️ Прайс-лист (${priceList.length} позиций)</h3>`;

  const ul = document.createElement('ul');
  ul.className = 'price-list';

  // forEach — для побочного эффекта (создание DOM-элементов)
  priceList.forEach((entry) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${escapeHtml(entry.name)}
      <span class="price">${formatPrice(entry.price)}</span>
    `;
    ul.appendChild(li);
  });

  output.appendChild(ul);
}

/* =====================================================================
   7. ШАГ 5: ОБЩАЯ СТОИМОСТЬ СКЛАДА (reduce)
   ===================================================================== */

function calculateTotalValue() {
  // reduce сводит весь массив к ОДНОМУ значению
  const total = warehouse.reduce((accumulator, item) => {
    return accumulator + (item.price * item.quantity);
  }, 0); // ← начальное значение ОБЯЗАТЕЛЬНО

  // Дополнительная статистика (тоже через reduce)
  const totalItems = warehouse.reduce((acc, it) => acc + it.quantity, 0);
  const avgPrice   = warehouse.reduce((acc, it) => acc + it.price, 0) / warehouse.length;

  $('output').innerHTML = `
    <h3>💰 Общая стоимость склада</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Итоговая сумма</div>
        <div class="stat-value">${formatPrice(total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Всего единиц</div>
        <div class="stat-value">${totalItems} шт.</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Позиций в каталоге</div>
        <div class="stat-value">${warehouse.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Средняя цена</div>
        <div class="stat-value">${formatPrice(Math.round(avgPrice))}</div>
      </div>
    </div>
  `;
}

/* =====================================================================
   8. ЗАДАНИЕ 1: КОМБИНИРОВАНИЕ МЕТОДОВ (цепочка)
   ===================================================================== */

function getExpensiveTechNames() {
  // Одна цепочка: filter → filter → map
  return warehouse
    .filter((item) => item.category === 'tech')
    .filter((item) => item.price > 500)
    .map((item) => item.name);
  // Ожидаемый результат: ["Ноутбук", "Монитор"]
}

/* =====================================================================
   9. ЗАДАНИЕ 2: ПОДСЧЁТ ТОВАРОВ ПО КАТЕГОРИЯМ (reduce)
   ===================================================================== */

function countByCategory() {
  return warehouse.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {}); // ← начальное значение — пустой объект
  // Ожидаемый результат: { tech: 4, furniture: 2, lighting: 1 }
}

/* =====================================================================
   10. ЗАДАНИЕ 3: findIndex, some, every
   ===================================================================== */

function hasExpensiveItems() {
  // some — есть ли ХОТЯ БЫ ОДИН товар дороже 2000
  return warehouse.some((item) => item.price > 2000);
}

function allItemsCheap() {
  // every — ВСЕ ли товары дешевле 2000
  return warehouse.every((item) => item.price < 2000);
}

function findChairIndex() {
  // findIndex — индекс первого товара «Стул»
  return warehouse.findIndex((item) => item.name === 'Стул');
}

/* =====================================================================
   11. ВЫВОД РЕЗУЛЬТАТОВ ЗАДАНИЙ 1–3
   ===================================================================== */

function renderTasks() {
  const techNames  = getExpensiveTechNames();
  const byCategory = countByCategory();
  const hasExpensive = hasExpensiveItems();
  const allCheap     = allItemsCheap();
  const chairIdx     = findChairIndex();

  const output = $('output');

  /* ---- Формируем HTML для карточек категорий ---- */
  let categoryCards = '';
  Object.entries(byCategory).forEach(([cat, count]) => {
    categoryCards += `
      <div class="stat-card">
        <div class="stat-label">${categoryTag(cat)}</div>
        <div class="stat-value">${count}</div>
      </div>
    `;
  });

  output.innerHTML = `
    <h3>🎓 Результаты заданий 1–3</h3>

    <!-- Задание 1 -->
    <div class="task-block">
      <h4>Задание 1. getExpensiveTechNames() — цепочка filter→filter→map</h4>
      <div class="code">${escapeHtml(JSON.stringify(techNames))}</div>
      <div style="margin-top:6px;color:#8a9bb8;font-size:0.88em;">
        Найдено: <b style="color:#4fc3f7;">${techNames.length}</b> дорогих tech-товара
      </div>
    </div>

    <!-- Задание 2 -->
    <div class="task-block">
      <h4>Задание 2. countByCategory() — reduce → объект</h4>
      <div class="code">${escapeHtml(JSON.stringify(byCategory))}</div>
      <div class="stats-grid" style="margin-top:10px;">
        ${categoryCards}
      </div>
    </div>

    <!-- Задание 3 -->
    <div class="task-block">
      <h4>Задание 3. findIndex / some / every</h4>
      <div class="code">
        • Есть товары дороже 2000 ₽ (some): 
          <span class="${hasExpensive ? 'check-false' : 'check-true'}">
            ${hasExpensive}
          </span><br>
        • Все товары дешевле 2000 ₽ (every): 
          <span class="${allCheap ? 'check-true' : 'check-false'}">
            ${allCheap}
          </span><br>
        • Индекс товара «Стул» (findIndex): 
          <b style="color:#4fc3f7;">${chairIdx}</b>
          ${chairIdx !== -1 ? `→ ${escapeHtml(warehouse[chairIdx].name)}` : ''}
      </div>
    </div>
  `;
}

/* =====================================================================
   12. ИНИЦИАЛИЗАЦИЯ
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* --- Кнопки основного интерфейса --- */
  $('showAllBtn').addEventListener('click', () => displayAllItems(warehouse));
  $('premiumBtn').addEventListener('click', getPremiumItems);
  $('priceListBtn').addEventListener('click', generatePriceList);
  $('totalBtn').addEventListener('click', calculateTotalValue);
  $('tasksBtn').addEventListener('click', renderTasks);

  /* --- Поиск --- */
  $('findBtn').addEventListener('click', () => {
    findProductByName($('searchInput').value);
  });
  $('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') findProductByName($('searchInput').value);
  });

  /* --- Автозапуск: показываем весь склад --- */
  displayAllItems(warehouse);

  console.log('✅ Приложение «Инвентаризация склада» готово');
});