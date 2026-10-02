/* =====================================================================
   ПРАКТИЧЕСКАЯ РАБОТА 10 (ПР12)
   Массивы и строки. Использование встроенных структур данных
   Генератор хештегов
   ===================================================================== */

/* =====================================================================
   1. КОНСТАНТЫ
   ===================================================================== */

/* Список стоп-слов — задан жёстко по условию */
const STOP_WORDS = ["в", "и", "на", "по", "с", "из", "от", "для", "не", "как"];

/* Максимальная длина хештега вместе с '#' */
const MAX_HASHTAG_LENGTH = 20;

/* Ключ для сохранения истории в localStorage */
const HISTORY_KEY = 'hashtag_history';

/* =====================================================================
   2. УТИЛИТЫ
   ===================================================================== */

const $ = (id) => document.getElementById(id);

/* =====================================================================
   3. ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ХЕШТЕГА
   ===================================================================== */

/**
 * Генерирует хештег из входной фразы.
 * Возвращает объект с промежуточными результатами для визуализации.
 *
 * @param {string} rawInput — сырая строка из поля ввода
 * @returns {{
 *   hashtag: string|null,
 *   error: string|null,
 *   warning: string|null,
 *   steps: { cleaned: string, words: string[], filtered: string[], capitalized: string[] }
 * }}
 */
function generateHashtag(rawInput) {
  /* ---------- ШАГ 1: очистка + нижний регистр ---------- */
  // trim() убирает пробелы по краям, toLowerCase() — приводит к нижнему регистру
  const cleanedString = rawInput.trim().toLowerCase();

  /* ---------- ШАГ 2: разбивка на слова ---------- */
  // split(' ') создаёт массив; filter(word => word.length > 0)
  // убирает пустые строки от двойных пробелов
  const wordsArray = cleanedString
    .split(' ')
    .filter((word) => word.length > 0);

  /* ---------- ШАГ 3: фильтрация стоп-слов ---------- */
  const meaningfulWords = wordsArray.filter(
    (word) => !STOP_WORDS.includes(word)
  );

  /* ---------- ПРОВЕРКА: пустой результат ---------- */
  if (meaningfulWords.length === 0) {
    return {
      hashtag: null,
      error: 'Невозможно создать хештег. Слишком короткая фраза',
      warning: null,
      steps: {
        cleaned: cleanedString,
        words: wordsArray,
        filtered: meaningfulWords,
        capitalized: [],
      },
    };
  }

  /* ---------- ШАГ 4: капитализация ---------- */
  // charAt(0) берёт первый символ, toUpperCase() делает его заглавным,
  // slice(1) берёт всё слово, начиная со второго символа
  const capitalizedWords = meaningfulWords.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  /* ---------- ШАГ 5: сборка + валидация длины ---------- */
  const hashtag = '#' + capitalizedWords.join('');

  const warning = hashtag.length > MAX_HASHTAG_LENGTH
    ? 'Хештег слишком длинный!'
    : null;

  return {
    hashtag,
    error: null,
    warning,
    steps: {
      cleaned: cleanedString,
      words: wordsArray,
      filtered: meaningfulWords,
      capitalized: capitalizedWords,
    },
  };
}

/* =====================================================================
   4. ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА
   ===================================================================== */

function renderResult(result) {
  const output = $('output');
  output.classList.remove('success', 'warning', 'error', 'idle');
  output.innerHTML = '';

  // Индикатор копирования возвращаем на место
  const indicator = document.createElement('span');
  indicator.className = 'copy-indicator';
  indicator.id = 'copyIndicator';
  indicator.textContent = '✓ скопировано';

  /* --- Ошибка --- */
  if (result.error) {
    output.classList.add('error');
    output.textContent = '❌ ' + result.error;
    return;
  }

  /* --- Успех --- */
  const textSpan = document.createElement('span');
  textSpan.className = 'hashtag-text';
  textSpan.textContent = result.hashtag;

  // Клик по хештегу → копирование в буфер обмена
  textSpan.style.cursor = 'pointer';
  textSpan.title = 'Нажмите, чтобы скопировать';
  textSpan.addEventListener('click', () => copyToClipboard(result.hashtag));

  output.appendChild(textSpan);

  /* --- Предупреждение о длине --- */
  if (result.warning) {
    output.classList.add('warning');
    const badge = document.createElement('span');
    badge.className = 'warn-badge';
    badge.textContent = '⚠ ' + result.warning;
    output.appendChild(badge);
  } else {
    output.classList.add('success');
  }

  output.appendChild(indicator);
}

/* =====================================================================
   5. ОТОБРАЖЕНИЕ ПРОМЕЖУТОЧНЫХ ШАГОВ
   ===================================================================== */

function renderSteps(steps) {
  const fmt = (arr) =>
    arr.length === 0
      ? '<span class="empty">[пусто]</span>'
      : JSON.stringify(arr);

  $('step1').innerHTML = steps.cleaned
    ? `"${escapeHtml(steps.cleaned)}"`
    : '<span class="empty">[пусто]</span>';

  $('step2').innerHTML = fmt(steps.words);
  $('step3').innerHTML = fmt(steps.filtered);
  $('step4').innerHTML = fmt(steps.capitalized);

  $('step5').innerHTML = steps.capitalized.length
    ? `"#${escapeHtml(steps.capitalized.join(''))}"`
    : '<span class="empty">[пусто]</span>';
}

/* Экранирование HTML — защита от XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =====================================================================
   6. ИСТОРИЯ ХЕШТЕГОВ (localStorage)
   ===================================================================== */

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function addToHistory(hashtag) {
  if (!hashtag) return;

  const history = loadHistory();

  // Не дублируем последний
  if (history[history.length - 1] === hashtag) return;

  // Убираем дубликат из середины
  const filtered = history.filter((h) => h !== hashtag);
  filtered.push(hashtag);

  // Ограничиваем 15 записями
  const trimmed = filtered.slice(-15);

  saveHistory(trimmed);
  renderHistory();
}

function renderHistory() {
  const box = $('historyList');
  const history = loadHistory();
  box.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'history-empty';
    empty.textContent = 'История пуста';
    box.appendChild(empty);
    return;
  }

  // Отрисовываем в обратном порядке — новые сверху
  [...history].reverse().forEach((tag) => {
    const chip = document.createElement('span');
    chip.className = 'history-chip';
    chip.textContent = tag;
    chip.title = 'Нажмите, чтобы скопировать';
    chip.addEventListener('click', () => copyToClipboard(tag));
    box.appendChild(chip);
  });
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

/* =====================================================================
   7. КОПИРОВАНИЕ В БУФЕР ОБМЕНА
   ===================================================================== */

function copyToClipboard(text) {
  const indicator = $('copyIndicator');

  const showIndicator = () => {
    if (!indicator) return;
    indicator.classList.add('show');
    setTimeout(() => indicator.classList.remove('show'), 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(showIndicator)
      .catch(() => fallbackCopy(text, showIndicator));
  } else {
    fallbackCopy(text, showIndicator);
  }
}

/* Резервный способ через textarea */
function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* ignore */ }
  document.body.removeChild(ta);
  callback && callback();
}

/* =====================================================================
   8. ГЛАВНЫЙ ОБРАБОТЧИК
   ===================================================================== */

function handleGenerate() {
  const rawInput = $('inputPhrase').value;
  const result = generateHashtag(rawInput);

  renderResult(result);
  renderSteps(result.steps);

  if (result.hashtag) {
    addToHistory(result.hashtag);
  }
}

/* =====================================================================
   9. ИНИЦИАЛИЗАЦИЯ
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* --- Кнопка "Сгенерировать" --- */
  $('generateBtn').addEventListener('click', handleGenerate);

  /* --- Enter в поле ввода --- */
  $('inputPhrase').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGenerate();
  });

  /* --- Кнопки с примерами --- */
  document.querySelectorAll('.example-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $('inputPhrase').value = btn.dataset.example;
      handleGenerate();
    });
  });

  /* --- Кнопка очистки истории --- */
  $('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Очистить всю историю хештегов?')) clearHistory();
  });

  /* --- Список стоп-слов --- */
  const swBox = $('stopWordsList');
  STOP_WORDS.forEach((w) => {
    const span = document.createElement('span');
    span.className = 'stopword';
    span.textContent = w;
    swBox.appendChild(span);
  });

  /* --- Отрисовка истории --- */
  renderHistory();

  /* --- Автозапуск первого примера --- */
  $('inputPhrase').value = 'Лучшие практики JavaScript';
  handleGenerate();

  console.log('✅ Генератор хештегов готов к работе');
});