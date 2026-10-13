/* =========================================================
   ПРАКТИЧЕСКАЯ РАБОТА. Set, Map и Array.
   Приложение «Система тегов для блога»
   ========================================================= */

/* ---------- ШАГ 1. ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ СТРУКТУР ---------- */

// Set — теги текущей (редактируемой) статьи. Уникальность гарантирована.
let currentArticleTags = new Set();

// Map — глобальная статистика: тег (в нижнем регистре) -> число статей
const tagStats = new Map();

// Массив всех тегов, когда-либо использованных (без дубликатов)
const allTagsEver = [];

// Счётчик сохранённых статей
let articleCount = 0;

// Задание 2: индекс «тег -> Set(номеров статей)»
const tagToArticles = new Map();

// Задание 4: кэш вычислений для объектов статей
const articleCache = new WeakMap();

// Задание 4: «помеченные» статьи (WeakSet)
const processedArticles = new WeakSet();


/* ---------- ВСПОМОГАТЕЛЬНОЕ: экранирование HTML ---------- */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}


/* ---------- ШАГ 2. ДОБАВЛЕНИЕ ТЕГА (Set) ---------- */
function addTagToCurrentArticle() {
  const input = document.getElementById('tagInput');
  const rawTag = input.value.trim();

  if (rawTag === '') return;               // пустую строку игнорируем

  const tag = rawTag.toLowerCase();        // «JavaScript» == «javascript»

  if (currentArticleTags.has(tag)) {
    console.log(`Тег "${tag}" уже добавлен к этой статье`);
  }

  currentArticleTags.add(tag);             // дубликат автоматически игнорируется

  input.value = '';
  input.focus();

  renderCurrentTags();
}


/* ---------- ШАГ 3. УДАЛЕНИЕ ТЕГА (Set) ---------- */
function removeTagFromCurrentArticle(tag) {
  currentArticleTags.delete(tag);          // true, если элемент был и удалён
  renderCurrentTags();
}


/* ---------- ШАГ 4. ОТОБРАЖЕНИЕ ТЕКУЩИХ ТЕГОВ (Set -> Array) ---------- */
function renderCurrentTags() {
  const container = document.getElementById('currentTags');

  if (currentArticleTags.size === 0) {
    container.innerHTML = '<p class="empty">Теги не добавлены</p>';
    return;
  }

  // Конвертация Set -> Array (у Set нет map/join)
  const tagsArray = [...currentArticleTags];        // или Array.from(...)

  const tagsHtml = tagsArray.map(tag => `
    <span class="tag">
      ${escapeHtml(tag)}
      <button class="remove-tag" data-tag="${escapeHtml(tag)}"
              title="Удалить тег" aria-label="Удалить тег">&times;</button>
    </span>`).join('');

  container.innerHTML =
    tagsHtml +
    `<p class="counter">Всего тегов: <strong>${currentArticleTags.size}</strong></p>`;
}


/* ---------- ШАГ 5. СОХРАНЕНИЕ СТАТЬИ (Set -> Map) ---------- */
function saveArticle() {
  if (currentArticleTags.size === 0) {
    alert('Добавьте хотя бы один тег перед сохранением!');
    return;
  }

  // 1. Счётчик статей
  articleCount++;
  document.getElementById('articleCounter').textContent = articleCount;

  // 2. Объект статьи — пригодится для заданий 2 и 4
  const articleObject = {
    id: articleCount,
    tags: new Set(currentArticleTags)   // копия тегов на момент сохранения
  };

  addArticleToTagIndex(articleObject.id, currentArticleTags); // Задание 2
  getTagCount(articleObject);                                 // Задание 4

  // 3. Обновляем статистику (Map)
  currentArticleTags.forEach(tag => {
    if (tagStats.has(tag)) {
      tagStats.set(tag, tagStats.get(tag) + 1);
    } else {
      tagStats.set(tag, 1);
    }

    // Пополняем список всех тегов (в методичке тут опечатка: без «!»)
    if (!allTagsEver.includes(tag)) {
      allTagsEver.push(tag);
    }
  });

  // 4. Очищаем теги текущей статьи
  currentArticleTags.clear();

  // 5. Обновляем отображение
  renderCurrentTags();
  if (document.getElementById('statsOutput').innerHTML !== '') showStats();

  console.log('Статистика после сохранения:');
  console.log('tagStats Map:', tagStats);
  console.log('allTagsEver:', allTagsEver);
  console.log('tagToArticles:', tagToArticles);
}


/* ---------- ОТМЕНА СТАТЬИ ---------- */
function cancelArticle() {
  currentArticleTags.clear();
  renderCurrentTags();
}


/* ---------- ШАГ 6. СТАТИСТИКА (перебор Map) ---------- */
function showStats() {
  const output = document.getElementById('statsOutput');

  if (tagStats.size === 0) {
    output.innerHTML = '<p class="empty">Нет данных. Сохраните хотя бы одну статью.</p>';
    return;
  }

  // Map -> массив пар [ключ, значение] и сортировка по убыванию
  const sortedStats = [...tagStats.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  let html = '<h3>Статистика использования тегов</h3>';
  html += '<table><thead><tr><th>Тег</th><th>Статей</th></tr></thead><tbody>';
  sortedStats.forEach(([tag, count]) => {
    html += `<tr><td>${escapeHtml(tag)}</td><td>${count}</td></tr>`;
  });
  html += '</tbody></table>';
  html += `<p class="counter">Всего уникальных тегов: <strong>${tagStats.size}</strong></p>`;

  output.innerHTML = html;
}


/* ---------- ШАГ 7. ВСЕ УНИКАЛЬНЫЕ ТЕГИ ---------- */
function showAllTags() {
  const output = document.getElementById('allTagsOutput');

  if (allTagsEver.length === 0) {
    output.innerHTML = '<p class="empty">Теги ещё не создавались.</p>';
    return;
  }

  const sorted = [...allTagsEver].sort();   // копия, исходный не мутируем

  output.innerHTML = `
    <h3>Все теги (${sorted.length})</h3>
    <div class="all-tags">
      ${sorted.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
    </div>
    <p class="counter">Строкой: ${escapeHtml(sorted.join(', '))}</p>`;
}


/* ---------- ЗАДАНИЕ 2. ИНДЕКС «ТЕГ -> СТАТЬИ» ---------- */
function addArticleToTagIndex(articleId, tags) {
  tags.forEach(tag => {
    if (!tagToArticles.has(tag)) {
      tagToArticles.set(tag, new Set());
    }
    tagToArticles.get(tag).add(articleId);   // Set гарантирует уникальность id
  });
}

function showTagIndex() {
  const out = document.getElementById('indexOutput');
  if (tagToArticles.size === 0) {
    out.textContent = 'Индекс пуст — сохраните хотя бы одну статью.';
    return;
  }
  const lines = [...tagToArticles.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .map(([tag, ids]) =>
      `${tag.padEnd(12)} -> Set(${[...ids].sort((x, y) => x - y).join(', ')})  [статей: ${ids.size}]`);
  out.textContent = lines.join('\n');
}


/* ---------- ЗАДАНИЕ 3. ПЕРЕСЕЧЕНИЕ ТЕГОВ ---------- */
function commonTags(setA, setB) {
  // ES2024+: return setA.intersection(setB);
  return new Set([...setA].filter(tag => setB.has(tag)));
}

function showIntersection() {
  const setA = new Set(['javascript', 'react', 'css', 'node']);
  const setB = new Set(['react', 'vue', 'css', 'typescript']);
  const common = commonTags(setA, setB);

  document.getElementById('intersectionOutput').textContent =
    `Статья A: {${[...setA].join(', ')}}\n` +
    `Статья B: {${[...setB].join(', ')}}\n` +
    `Общие теги (${common.size}): {${[...common].join(', ')}}`;
}


/* ---------- ЗАДАНИЕ 4. WeakMap / WeakSet ---------- */
function getTagCount(articleObject) {
  if (articleCache.has(articleObject)) return articleCache.get(articleObject);
  const count = articleObject.tags.size;
  articleCache.set(articleObject, count);
  return count;
}

function markAsProcessed(articleObject) { processedArticles.add(articleObject); }
function isProcessed(articleObject)     { return processedArticles.has(articleObject); }

function showWeakMapDemo() {
  const article1 = { id: 1, tags: new Set(['js', 'react']) };
  const article2 = { id: 2, tags: new Set(['js']) };

  const log = [];
  log.push(`article1 — первый вызов getTagCount(): ${getTagCount(article1)} (вычислено и закэшировано)`);
  log.push(`article1 — повторный вызов:              ${getTagCount(article1)} (взято из кэша)`);

  article1.tags.add('css');
  log.push(`article1.tags.size теперь = ${article1.tags.size}, а кэш всё ещё возвращает ${getTagCount(article1)}`);
  log.push('→ Вывод: кэш нужно инвалидировать при изменении объекта.');

  log.push(`article2 — getTagCount(): ${getTagCount(article2)}`);

  markAsProcessed(article1);
  log.push(`article1 помечена как обработанная: ${isProcessed(article1)}`);
  log.push(`article2 помечена как обработанная: ${isProcessed(article2)}`);

  log.push('');
  log.push(`articleCache instanceof WeakMap: ${articleCache instanceof WeakMap}`);
  log.push('Особенности WeakMap/WeakSet: ключи только объекты,');
  log.push('нет size, нет итераторов (forEach/keys/values),');
  log.push('записи удаляются сборщиком мусора автоматически.');

  document.getElementById('weakMapOutput').textContent = log.join('\n');
}


/* ---------- ПРИВЯЗКА ОБРАБОТЧИКОВ ---------- */
document.getElementById('currentTags').addEventListener('click', (event) => {
  const btn = event.target.closest('.remove-tag');
  if (!btn) return;
  removeTagFromCurrentArticle(btn.dataset.tag);
});

document.getElementById('addTagBtn').addEventListener('click', addTagToCurrentArticle);

document.getElementById('tagInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTagToCurrentArticle();
});

document.getElementById('saveArticleBtn').addEventListener('click', saveArticle);
document.getElementById('cancelArticleBtn').addEventListener('click', cancelArticle);
document.getElementById('showStatsBtn').addEventListener('click', showStats);
document.getElementById('showAllTagsBtn').addEventListener('click', showAllTags);

document.getElementById('showIndexBtn').addEventListener('click', showTagIndex);
document.getElementById('showIntersectionBtn').addEventListener('click', showIntersection);
document.getElementById('showWeakMapBtn').addEventListener('click', showWeakMapDemo);

// Первичный рендер
renderCurrentTags();
