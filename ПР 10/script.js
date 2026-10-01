// ==============================================================
// 1. НАВИГАЦИЯ ПО ДЕРЕВУ DOM
// ==============================================================

function showFamilyInfo() {
  const parent = document.getElementById('parent');
  const child1 = document.getElementById('child1');
  const grandparent = document.getElementById('grandparent');
  const info = document.getElementById('familyInfo');

  let html = '';
  html += `<strong>Родитель:</strong> ${parent.tagName} (id="${parent.id}")<br>`;
  html += `<strong>Дети родителя:</strong> ${parent.children.length} элементов<br>`;
  html += `<strong>Первый ребёнок:</strong> ${parent.firstElementChild ? parent.firstElementChild.textContent.trim() : 'Нет'}<br>`;
  html += `<strong>Последний ребёнок:</strong> ${parent.lastElementChild ? parent.lastElementChild.textContent.trim() : 'Нет'}<br>`;
  html += `<strong>Следующий сосед child1:</strong> ${child1.nextElementSibling ? child1.nextElementSibling.textContent.trim() : 'Нет'}<br>`;
  html += `<strong>Предыдущий сосед child1:</strong> ${child1.previousElementSibling ? child1.previousElementSibling.textContent.trim() : 'Нет'}<br>`;
  html += `<strong>Родитель grandparent:</strong> ${grandparent.parentElement ? grandparent.parentElement.tagName : 'Нет'}`;

  info.innerHTML = html;
  info.style.color = '#eee';
}

function highlightChildren() {
  const parent = document.getElementById('parent');
  const children = parent.children;

  // Снимаем подсветку со всех
  document.querySelectorAll('.child').forEach(el => {
    el.style.background = 'transparent';
    el.style.color = '#eee';
    el.style.padding = '';
    el.style.borderRadius = '';
  });

  // Подсвечиваем детей
  for (let child of children) {
    if (child.classList.contains('child')) {
      child.style.background = '#e94560';
      child.style.color = 'white';
      child.style.padding = '5px 10px';
      child.style.borderRadius = '6px';
    }
  }

  const info = document.getElementById('familyInfo');
  info.innerHTML = `Подсвечено ${children.length} дочерних элементов`;
  info.style.color = '#2ecc71';
}

function showSiblings() {
  const child2 = document.getElementById('child2');
  const prev = child2.previousElementSibling;
  const next = child2.nextElementSibling;
  const info = document.getElementById('familyInfo');

  let html = `<strong>Для элемента "${child2.textContent.trim()}":</strong><br>`;
  html += `⬅ Предыдущий сосед: ${prev ? prev.textContent.trim() : 'Нет'}<br>`;
  html += `➡ Следующий сосед: ${next ? next.textContent.trim() : 'Нет'}`;

  info.innerHTML = html;
  info.style.color = '#f39c12';
}

// ==============================================================
// 2. СТАТИСТИКА ДОКУМЕНТА
// ==============================================================

function updateStatistics() {
  const checkbox = document.getElementById('showHiddenCheckbox');
  const showHidden = checkbox ? checkbox.checked : false;

  let allElements = document.querySelectorAll('*');
  if (!showHidden) {
    allElements = Array.from(allElements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  document.getElementById('totalElements').textContent = allElements.length;
  document.getElementById('totalDivs').textContent = document.getElementsByTagName('div').length;
  document.getElementById('totalButtons').textContent = document.querySelectorAll('button').length;
  document.getElementById('totalLinks').textContent = document.querySelectorAll('a').length;
}

function toggleHiddenElements() {
  updateStatistics();
}

// ==============================================================
// 3. ПОИСК ЭЛЕМЕНТОВ
// ==============================================================

function findById() {
  const el = document.getElementById('uniqueParagraph');
  const result = document.getElementById('searchResult');

  if (el) {
    result.innerHTML = `Найден элемент: <strong>${el.tagName}</strong> c id="uniqueParagraph"<br>Текст: "${el.textContent.trim()}"`;
    result.style.color = '#2ecc71';
    highlightElement(el);
  }
}

function findByClass() {
  const elements = document.getElementsByClassName('highlight-demo');
  const result = document.getElementById('searchResult');

  if (elements.length > 0) {
    let html = `Найдено элементов с классом "highlight-demo": <strong>${elements.length}</strong><br>`;
    Array.from(elements).forEach((el, i) => {
      html += `${i + 1}. "${el.textContent.trim()}"<br>`;
    });
    result.innerHTML = html;
    result.style.color = '#2ecc71';
    Array.from(elements).forEach(el => highlightElement(el));
  }
}

function findByTag() {
  const elements = document.getElementsByTagName('span');
  const result = document.getElementById('searchResult');

  if (elements.length > 0) {
    let html = `Найдено тегов &lt;span&gt;: <strong>${elements.length}</strong><br>`;
    Array.from(elements).forEach((el, i) => {
      html += `${i + 1}. "${el.textContent.trim()}"<br>`;
    });
    result.innerHTML = html;
    result.style.color = '#2ecc71';
    Array.from(elements).forEach(el => highlightElement(el));
  }
}

function findByQuery() {
  const el = document.querySelector('.test-container span.highlight-demo');
  const result = document.getElementById('searchResult');

  if (el) {
    result.innerHTML = `querySelector нашёл: <strong>${el.tagName}</strong> с классом "highlight-demo" внутри .test-container<br>Текст: "${el.textContent.trim()}"`;
    result.style.color = '#2ecc71';
    highlightElement(el);
  }
}

function findByQueryAll() {
  const elements = document.querySelectorAll('.demo-box p, .demo-box div[data-role]');
  const result = document.getElementById('searchResult');

  if (elements.length > 0) {
    let html = `querySelectorAll нашёл <strong>${elements.length}</strong> элементов:<br>`;
    elements.forEach((el, i) => {
      html += `${i + 1}. ${el.tagName}${el.id ? '#' + el.id : ''} — "${el.textContent.trim().substring(0, 30)}"<br>`;
    });
    result.innerHTML = html;
    result.style.color = '#2ecc71';
    elements.forEach(el => highlightElement(el));
  }
}

// Вспомогательная функция подсветки
function highlightElement(el) {
  const originalBg = el.style.background;
  const originalColor = el.style.color;
  const originalPadding = el.style.padding;
  const originalRadius = el.style.borderRadius;

  el.style.background = '#e94560';
  el.style.color = 'white';
  el.style.padding = '2px 8px';
  el.style.borderRadius = '4px';
  el.style.transition = 'all 0.3s';

  setTimeout(() => {
    el.style.background = originalBg || '';
    el.style.color = originalColor || '';
    el.style.padding = originalPadding || '';
    el.style.borderRadius = originalRadius || '';
  }, 1500);
}

// ==============================================================
// 4. РАБОТА С АТРИБУТАМИ
// ==============================================================

function showAttributes() {
  const img = document.getElementById('demoImage');
  const info = document.getElementById('attributeInfo');
  const attrs = img.attributes;

  let html = `<strong>Атрибуты изображения (${attrs.length}):</strong><br>`;
  for (let attr of attrs) {
    html += `<strong>${attr.name}</strong> = "${attr.value}"<br>`;
  }

  if (img.dataset) {
    html += `<br><strong>Data-атрибуты:</strong><br>`;
    for (let key in img.dataset) {
      html += `data-${key} = "${img.dataset[key]}"<br>`;
    }
  }

  info.innerHTML = html;
  info.style.color = '#eee';
}

function changeImage() {
  const img = document.getElementById('demoImage');
  const colors = ['e94560', '2ecc71', 'f39c12', '3498db', '9b59b6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  img.setAttribute('src', `https://via.placeholder.com/150/2a2a5e/${randomColor}?text=DOM`);
  img.setAttribute('data-color', randomColor);
  document.getElementById('attributeInfo').innerHTML = `Картинка заменена. data-color="${randomColor}"`;
  document.getElementById('attributeInfo').style.color = '#2ecc71';
}

function toggleAltText() {
  const img = document.getElementById('demoImage');
  const currentAlt = img.getAttribute('alt');
  const newAlt = currentAlt === 'Демо-изображение' ? 'Новая подпись' : 'Демо-изображение';
  img.setAttribute('alt', newAlt);
  document.getElementById('imageCaption').textContent = `alt = "${newAlt}"`;
  document.getElementById('attributeInfo').innerHTML = `Атрибут alt изменён на "<strong>${newAlt}</strong>"`;
  document.getElementById('attributeInfo').style.color = '#f39c12';
}

function addDataAttribute() {
  const img = document.getElementById('demoImage');
  const currentId = img.dataset.id || 0;
  img.dataset.id = parseInt(currentId) + 1;
  img.dataset.modified = new Date().toLocaleString();

  const info = document.getElementById('attributeInfo');
  info.innerHTML = `Добавлены data-атрибуты:<br>data-id="${img.dataset.id}"<br>data-modified="${img.dataset.modified}"`;
  info.style.color = '#2ecc71';
}

// ==============================================================
// 5. СОЗДАНИЕ И УДАЛЕНИЕ ЭЛЕМЕНТОВ (ДИНАМИЧЕСКИЙ СПИСОК)
// ==============================================================

function addListItem() {
  const input = document.getElementById('newItemInput');
  const list = document.getElementById('dynamicList');
  const text = input.value.trim();

  if (!text) { alert('Пожалуйста, введите текст!'); return; }

  const li = document.createElement('li');
  li.textContent = text;
  li.classList.add('appear'); // анимация (сам. задание 5)

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '×';
  removeBtn.onclick = function () { removeItem(this); };

  li.appendChild(removeBtn);
  list.appendChild(li);

  input.value = '';
  input.focus();
  updateItemCount();
  saveList(); // сам. задание 3
}

function addListItemStart() {
  const input = document.getElementById('newItemInput');
  const list = document.getElementById('dynamicList');
  const text = input.value.trim();

  if (!text) { alert('Пожалуйста, введите текст!'); return; }

  const li = document.createElement('li');
  li.textContent = text;
  li.classList.add('appear');

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '×';
  removeBtn.onclick = function () { removeItem(this); };

  li.appendChild(removeBtn);
  list.insertBefore(li, list.firstChild);

  input.value = '';
  input.focus();
  updateItemCount();
  saveList();
}

function removeItem(btn) {
  const li = btn.parentElement;
  li.remove();
  updateItemCount();
  saveList();
}

function clearAllItems() {
  const list = document.getElementById('dynamicList');
  if (confirm('Удалить все элементы?')) {
    list.innerHTML = '';
    updateItemCount();
    saveList();
  }
}

function duplicateFirstItem() {
  const list = document.getElementById('dynamicList');
  const firstItem = list.firstElementChild;

  if (!firstItem) { alert('Список пуст!'); return; }

  const clone = firstItem.cloneNode(true);
  clone.classList.add('appear');

  const cloneBtn = clone.querySelector('.remove-btn');
  cloneBtn.onclick = function () { removeItem(this); };

  list.appendChild(clone);
  updateItemCount();
  saveList();
}

function countItems() {
  const list = document.getElementById('dynamicList');
  const count = list.children.length;
  alert(`В списке ${count} элементов`);
}

function updateItemCount() {
  const list = document.getElementById('dynamicList');
  const count = list.children.length;
  document.getElementById('itemCount').textContent = `Всего элементов: ${count}`;
}

// ==============================================================
// 6. РАБОТА С КЛАССАМИ И СТИЛЯМИ
// ==============================================================

function toggleHighlight() {
  const box = document.getElementById('targetBox');
  box.classList.toggle('highlight');
  const status = document.getElementById('styleStatus');

  if (box.classList.contains('highlight')) {
    status.textContent = 'Highlight включён';
    status.style.color = '#2ecc71';
  } else {
    status.textContent = 'Highlight выключен';
    status.style.color = '#aaa';
  }
}

function toggleBorder() {
  const box = document.getElementById('targetBox');
  const status = document.getElementById('styleStatus');

  if (box.style.border && box.style.border !== '') {
    box.style.border = '';
    status.textContent = 'Рамка убрана';
  } else {
    box.style.border = '3px solid #e94560';
    status.textContent = 'Рамка добавлена';
  }
  status.style.color = '#f39c12';
}

function changeSize() {
  const box = document.getElementById('targetBox');
  const status = document.getElementById('styleStatus');
  const currentWidth = parseInt(box.style.width) || 120;
  const newSize = currentWidth + 20;

  if (newSize > 300) {
    box.style.width = '120px';
    box.style.height = '120px';
    status.textContent = 'Размер сброшен до 120px';
  } else {
    box.style.width = newSize + 'px';
    box.style.height = newSize + 'px';
    status.textContent = `Размер: ${newSize}px`;
  }
  status.style.color = '#2ecc71';
}

function randomColor() {
  const box = document.getElementById('targetBox');
  const colors = ['#e94560', '#2ecc71', '#f39c12', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#e74c3c'];
  const random = colors[Math.floor(Math.random() * colors.length)];
  box.style.background = random;
  const status = document.getElementById('styleStatus');
  status.textContent = `Цвет: ${random}`;
  status.style.color = '#2ecc71';
}

function resetStyle() {
  const box = document.getElementById('targetBox');
  box.style.background = '#2a2a5e';
  box.style.width = '120px';
  box.style.height = '120px';
  box.style.border = '';
  box.classList.remove('highlight');

  const status = document.getElementById('styleStatus');
  status.textContent = 'Стили сброшены';
  status.style.color = '#aaa';
}

// ==============================================================
// 7. РАБОТА С СОДЕРЖИМЫМ (innerHTML vs textContent)
// ==============================================================

function showInnerHTML() {
  const demo = document.getElementById('contentDemo');
  const output = document.getElementById('contentOutput');
  const escaped = demo.innerHTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  output.innerHTML = `<strong>innerHTML:</strong><br><code style="color:#f39c12;">${escaped}</code>`;
  output.style.color = '#eee';
}

function showTextContent() {
  const demo = document.getElementById('contentDemo');
  const output = document.getElementById('contentOutput');
  output.innerHTML = `<strong>textContent:</strong><br><code style="color:#2ecc71;">${demo.textContent}</code>`;
  output.style.color = '#eee';
}

function appendHTML() {
  const demo = document.getElementById('contentDemo');
  demo.innerHTML += '<p style="color:#f39c12;background:#2a2a5e;padding:8px;border-radius:6px;">Это добавленный <strong>HTML</strong> через innerHTML</p>';
  const output = document.getElementById('contentOutput');
  output.innerHTML = 'HTML добавлен! (использован innerHTML)';
  output.style.color = '#2ecc71';
}

function safeInsert() {
  const demo = document.getElementById('contentDemo');
  const p = document.createElement('p');
  p.style.cssText = 'color:#2ecc71;background:#1a3a2e;padding:8px;border-radius:6px;';
  p.textContent = 'Это безопасно добавленный текст через createElement';
  demo.appendChild(p);

  const output = document.getElementById('contentOutput');
  output.innerHTML = 'Текст добавлен безопасно (createElement + textContent)';
  output.style.color = '#2ecc71';
}

// ==============================================================
// 8. ПЕРЕМЕЩЕНИЕ И КЛОНИРОВАНИЕ
// ==============================================================

function moveToTarget() {
  const source = document.getElementById('sourceItem');
  const target = document.getElementById('targetDropZone');

  if (!source) { alert('Исходный элемент не найден!'); return; }

  // Удаляем placeholder, если он есть
  const placeholder = target.querySelector('p');
  if (placeholder) placeholder.remove();

  target.appendChild(source);
  const output = document.getElementById('contentOutput');
  output.innerHTML = '➡ Элемент перемещён в цель!';
  output.style.color = '#f39c12';
}

function moveBack() {
  const source = document.getElementById('sourceContainer');
  const target = document.getElementById('targetDropZone');
  const item = target.querySelector('#sourceItem');

  if (item) {
    source.appendChild(item);
    const output = document.getElementById('contentOutput');
    output.innerHTML = '⬅ Элемент возвращён обратно!';
    output.style.color = '#f39c12';
  } else {
    alert('Нет элемента для возврата!');
  }
}

function cloneSource() {
  const source = document.getElementById('sourceItem');
  const target = document.getElementById('targetDropZone');

  if (!source) { alert('Исходный элемент не найден!'); return; }

  const clone = source.cloneNode(true);
  clone.id = 'cloned_' + Date.now();
  clone.textContent = 'Клон ' + clone.id;
  clone.style.background = '#2ecc71';
  clone.style.color = '#1a1a2e';
  clone.classList.add('appear');

  target.appendChild(clone);
  const output = document.getElementById('contentOutput');
  output.innerHTML = `Клон создан и добавлен в цель! (ID: ${clone.id})`;
  output.style.color = '#2ecc71';
}

function clearTarget() {
  const target = document.getElementById('targetDropZone');
  const items = target.querySelectorAll('div');

  if (items.length === 0) { alert('Цель уже пуста!'); return; }

  if (confirm('Удалить все элементы в цели?')) {
    items.forEach(item => item.remove());
    const output = document.getElementById('contentOutput');
    output.innerHTML = 'Цель очищена!';
    output.style.color = '#e74c3c';
  }
}

// ==============================================================
// 9. ВИЗУАЛИЗАЦИЯ DOM-ДЕРЕВА
// ==============================================================

function traverseDOM() {
  const output = document.getElementById('domTreeDisplay');
  const root = document.querySelector('.container');
  let html = '<strong>Обход DOM-дерева (первые 3 уровня):</strong><br>';

  function traverse(node, level = 0) {
    if (level > 2) return;
    const indent = '&nbsp;'.repeat(level * 4);
    html += `${indent}${'│ '.repeat(level)}<span class="node">&lt;${node.tagName ? node.tagName.toLowerCase() : '#text'}&gt;</span>`;
    if (node.id) html += ` <span class="attr">id="${node.id}"</span>`;
    if (node.className && typeof node.className === 'string' && node.className.trim()) {
      html += ` <span class="attr">class="${node.className.trim()}"</span>`;
    }
    html += '<br>';
    for (let child of node.children) {
      traverse(child, level + 1);
    }
  }

  traverse(root);
  output.innerHTML = html;
  output.style.color = '#eee';
}

function showFullTree() {
  const output = document.getElementById('domTreeDisplay');
  output.innerHTML = '<strong>Полное дерево DOM:</strong><br>';
  output.innerHTML += getDOMTree(document.documentElement);
  output.style.color = '#eee';
}

function getDOMTree(node, level = 0) {
  let html = '';
  const indent = '&nbsp;'.repeat(level * 2);
  const tag = node.tagName ? node.tagName.toLowerCase() : '#text';
  const content = node.textContent ? node.textContent.trim().substring(0, 30) : '';

  html += `${indent}├─ <span class="node">&lt;${tag}</span>`;
  if (node.id) html += ` <span class="attr">id="${node.id}"</span>`;
  if (node.className && typeof node.className === 'string' && node.className.trim()) {
    html += ` <span class="attr">class="${node.className.trim()}"</span>`;
  }
  html += `<span class="node">&gt;</span>`;
  if (content && !node.children.length) {
    html += ` <span class="text">"${content}"</span>`;
  }
  html += '<br>';

  for (let child of node.children) {
    html += getDOMTree(child, level + 1);
  }
  return html;
}

function showElementTree() {
  const output = document.getElementById('domTreeDisplay');
  output.innerHTML = '<strong>Дерево элементов (только теги):</strong><br>';
  output.innerHTML += getElementTree(document.querySelector('.container'), 0);
  output.style.color = '#eee';
}

function getElementTree(node, level = 0) {
  let html = '';
  const indent = '&nbsp;'.repeat(level * 3);
  const tag = node.tagName ? node.tagName.toLowerCase() : '';
  html += `${indent}└─ <span class="node">${tag}</span>`;
  if (node.id) html += ` <span class="attr">#${node.id}</span>`;
  if (node.children.length) {
    html += ` <span class="text">(${node.children.length} детей)</span>`;
  }
  html += '<br>';
  for (let child of node.children) {
    html += getElementTree(child, level + 1);
  }
  return html;
}

// ==============================================================
// 10. ГАЛЕРЕЯ (ПРАКТИЧЕСКОЕ ЗАДАНИЕ)
// ==============================================================

let selectedGalleryItem = null;

function addGalleryItem() {
  const input = document.getElementById('galleryInput');
  const gallery = document.getElementById('gallery');
  const text = input.value.trim();

  if (!text) { alert('Введите название элемента!'); return; }

  const item = document.createElement('div');
  item.className = 'gallery-item appear';
  item.dataset.id = Date.now();
  item.textContent = text;
  item.onclick = function () { selectGalleryItem(this); };

  gallery.appendChild(item);
  input.value = '';
  input.focus();
  updateGalleryStatus();
}

function selectGalleryItem(element) {
  if (selectedGalleryItem) {
    selectedGalleryItem.classList.remove('selected');
  }
  selectedGalleryItem = element;
  element.classList.add('selected');
  updateGalleryStatus();
}

function removeSelectedGalleryItem() {
  if (!selectedGalleryItem) { alert('Сначала выберите элемент!'); return; }

  if (confirm(`Удалить "${selectedGalleryItem.textContent}"?`)) {
    selectedGalleryItem.remove();
    selectedGalleryItem = null;
    updateGalleryStatus();
  }
}

function clearGallery() {
  const gallery = document.getElementById('gallery');
  if (gallery.children.length === 0) { alert('Галерея уже пуста!'); return; }

  if (confirm('Удалить все элементы галереи?')) {
    gallery.innerHTML = '';
    selectedGalleryItem = null;
    updateGalleryStatus();
  }
}

function updateGalleryStatus() {
  const status = document.getElementById('selectedGalleryItem');
  if (selectedGalleryItem) {
    status.textContent = `"${selectedGalleryItem.textContent}" (id: ${selectedGalleryItem.dataset.id})`;
    status.style.color = '#2ecc71';
  } else {
    status.textContent = 'ничего';
    status.style.color = '#aaa';
  }
}

// ==============================================================
// 11. САМОСТОЯТЕЛЬНОЕ ЗАДАНИЕ 1: СОРТИРОВКА СПИСКА
// ==============================================================

function sortList() {
  const list = document.getElementById('dynamicList');
  const items = Array.from(list.children);

  items.sort((a, b) => {
    const textA = a.childNodes[0].textContent.trim().toLowerCase();
    const textB = b.childNodes[0].textContent.trim().toLowerCase();
    return textA.localeCompare(textB, 'ru');
  });

  list.innerHTML = '';
  items.forEach(li => list.appendChild(li));
  updateItemCount();
  saveList();
}

// ==============================================================
// 12. САМОСТОЯТЕЛЬНОЕ ЗАДАНИЕ 2: ПОИСК ПО ТЕКСТУ
// ==============================================================

function highlightByText() {
  // Сначала снимаем старую подсветку
  clearTextHighlight();

  const input = document.getElementById('pageSearchInput');
  const query = input.value.trim().toLowerCase();
  const result = document.getElementById('pageSearchResult');

  if (!query) {
    result.textContent = 'Введите текст для поиска!';
    result.style.color = '#e74c3c';
    return;
  }

  // Ищем все элементы, чей текст содержит запрос (без вложенных дублей)
  const all = document.querySelectorAll('.container *');
  let count = 0;

  all.forEach(el => {
    // Пропускаем контейнеры, у которых есть дочерние элементы с текстом (чтобы не дублировать)
    if (el.children.length > 0) return;

    const text = el.textContent.trim().toLowerCase();
    if (text && text.includes(query)) {
      el.classList.add('search-hit');
      count++;
    }
  });

  result.innerHTML = `Найдено и подсвечено элементов: <strong>${count}</strong>`;
  result.style.color = count > 0 ? '#2ecc71' : '#e74c3c';
}

function clearTextHighlight() {
  document.querySelectorAll('.search-hit').forEach(el => {
    el.classList.remove('search-hit');
  });
  const result = document.getElementById('pageSearchResult');
  if (result) {
    result.textContent = 'Подсветка снята.';
    result.style.color = '#aaa';
  }
}

// ==============================================================
// 13. САМОСТОЯТЕЛЬНОЕ ЗАДАНИЕ 3: СОХРАНЕНИЕ В localStorage
// ==============================================================

const STORAGE_KEY = 'dynamicListState';

function saveList(manual = false) {
  const list = document.getElementById('dynamicList');
  const items = Array.from(list.children).map(li => {
    // Первый текстовый узел — это сам текст (без кнопки)
    const textNode = Array.from(li.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    return textNode ? textNode.textContent.trim() : '';
  }).filter(t => t);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    const status = document.getElementById('storageStatus');
    status.textContent = `Сохранено: ${items.length} элемент(ов) — ${new Date().toLocaleTimeString()}`;
    status.style.color = '#2ecc71';
    if (manual) alert(`Сохранено ${items.length} элементов`);
  } catch (e) {
    console.warn('localStorage недоступен:', e);
  }
}

function restoreList(manual = false) {
  let items = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Не удалось прочитать localStorage:', e);
  }

  const list = document.getElementById('dynamicList');
  list.innerHTML = '';

  items.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = function () { removeItem(this); };

    li.appendChild(removeBtn);
    list.appendChild(li);
  });

  updateItemCount();

  const status = document.getElementById('storageStatus');
  status.textContent = `Загружено: ${items.length} элемент(ов)`;
  status.style.color = '#2ecc71';

  if (manual) alert(`Загружено ${items.length} элементов`);
}

function clearStorage() {
  if (confirm('Очистить сохранённый список?')) {
    localStorage.removeItem(STORAGE_KEY);
    const status = document.getElementById('storageStatus');
    status.textContent = 'Хранилище очищено';
    status.style.color = '#f39c12';
  }
}

// ==============================================================
// 14. САМОСТОЯТЕЛЬНОЕ ЗАДАНИЕ 4: РЕКУРСИВНОЕ КЛОНИРОВАНИЕ
// ==============================================================

/**
 * Рекурсивно клонирует DOM-элемент со всеми вложенными узлами и атрибутами.
 * Аналог cloneNode(true), но реализованный вручную — для демонстрации понимания.
 */
function deepClone(element) {
  if (element.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(element.textContent);
  }

  if (element.nodeType === Node.COMMENT_NODE) {
    return document.createComment(element.textContent);
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  // Создаём элемент с тем же тегом
  const clone = document.createElement(element.tagName.toLowerCase());

  // Копируем все атрибуты
  for (let attr of element.attributes) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Рекурсивно клонируем всех детей
  for (let child of element.childNodes) {
    const childClone = deepClone(child);
    if (childClone) clone.appendChild(childClone);
  }

  return clone;
}

function deepCloneDemo() {
  const source = document.getElementById('sourceItem');
  const target = document.getElementById('targetDropZone');

  if (!source) { alert('Исходный элемент не найден!'); return; }

  const clone = deepClone(source);
  clone.id = 'deepClone_' + Date.now();
  clone.textContent = 'Рекурсивный клон ' + clone.id;
  clone.style.background = '#9b59b6';
  clone.style.color = 'white';
  clone.classList.add('appear');

  target.appendChild(clone);

  const output = document.getElementById('contentOutput');
  output.innerHTML = `Рекурсивный клон создан через deepClone()! (ID: ${clone.id})`;
  output.style.color = '#9b59b6';
}

// ==============================================================
// 15. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ==============================================================

document.addEventListener('DOMContentLoaded', function () {
  // Обработчики для существующих элементов галереи
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.onclick = function () { selectGalleryItem(this); };
  });

  // Восстанавливаем список из localStorage
  restoreList();

  // Enter в поле динамического списка
  const newItemInput = document.getElementById('newItemInput');
  if (newItemInput) {
    newItemInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addListItem();
    });
  }

  // Enter в поле поиска по тексту
  const pageSearchInput = document.getElementById('pageSearchInput');
  if (pageSearchInput) {
    pageSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') highlightByText();
    });
  }

  // Enter в поле галереи
  const galleryInput = document.getElementById('galleryInput');
  if (galleryInput) {
    galleryInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addGalleryItem();
    });
  }

  // Первичный подсчёт статистики
  updateStatistics();
  updateItemCount();
  updateGalleryStatus();

  console.log('✅ DOM-манипуляции загружены!');
  console.log('📊 Количество элементов на странице:', document.querySelectorAll('*').length);
});