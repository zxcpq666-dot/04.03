// =============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================
function addLog(message, type = 'info') {
  const log = document.getElementById('eventLog');
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '#00ff41',
    warning: '#ffd700',
    error: '#ff4444',
    click: '#4fc3f7'
  };
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  entry.style.color = colors[type] || colors.info;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// =============================================
// 1. СЧЕТЧИК КЛИКОВ
// =============================================
let counter = 0;
const counterDisplay = document.getElementById('clickCounter');
const incrementBtn = document.getElementById('incrementBtn');
const resetCounterBtn = document.getElementById('resetCounter');

incrementBtn.addEventListener('click', function () {
  counter++;
  counterDisplay.textContent = counter;
  addLog(`Клик! Счетчик = ${counter}`, 'click');
});

resetCounterBtn.addEventListener('click', function () {
  counter = 0;
  counterDisplay.textContent = counter;
  addLog('Счетчик сброшен', 'warning');
});

counterDisplay.addEventListener('click', function () {
  counter++;
  counterDisplay.textContent = counter;
  addLog(`Клик по числу! Счетчик = ${counter}`, 'click');
});

// =============================================
// 2. СМЕНА ЦВЕТА
// =============================================
const colorBox = document.getElementById('colorBox');
const colorBtn = document.getElementById('colorBtn');
const resetColorBtn = document.getElementById('resetColorBtn');

const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
let colorIndex = 0;

colorBtn.addEventListener('click', function () {
  colorIndex = (colorIndex + 1) % colors.length;
  colorBox.style.background = colors[colorIndex];
  addLog(`Цвет изменен на ${colors[colorIndex]}`, 'info');
});

resetColorBtn.addEventListener('click', function () {
  colorBox.style.background = '#3498db';
  colorIndex = 0;
  addLog('Цвет сброшен', 'warning');
});

colorBox.addEventListener('dblclick', function () {
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  this.style.background = randomColor;
  addLog(`Случайный цвет: ${randomColor}`, 'info');
});

// =============================================
// 3. КООРДИНАТЫ МЫШИ
// =============================================
const mouseCoords = document.getElementById('mouseCoords');
const clickArea = document.getElementById('clickArea');
const clickTypeMessage = document.getElementById('clickTypeMessage');

mouseCoords.addEventListener('mousemove', function (event) {
  const x = event.offsetX;
  const y = event.offsetY;
  this.textContent = `X: ${x}px, Y: ${y}px (относительно этого блока)`;
});

clickArea.addEventListener('click', function (event) {
  clickTypeMessage.textContent = `Одиночный клик (кнопка: ${event.button === 0 ? 'левая' : 'правая'})`;
  addLog('Левый клик по квадрату', 'click');
});

clickArea.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  clickTypeMessage.textContent = 'Правый клик (контекстное меню заблокировано)';
  addLog('Правый клик по квадрату', 'warning');
});

clickArea.addEventListener('dblclick', function () {
  clickTypeMessage.textContent = 'Двойной клик!';
  addLog('Двойной клик по квадрату', 'click');
});

clickArea.addEventListener('mouseenter', function () {
  this.style.background = '#2ecc71';
  addLog('Мышь вошла в зону', 'info');
});

clickArea.addEventListener('mouseleave', function () {
  this.style.background = '#4CAF50';
  addLog('Мышь покинула зону', 'info');
});

// =============================================
// 4. СОБЫТИЯ КЛАВИАТУРЫ
// =============================================
const keyDisplay = document.getElementById('keyDisplay');
const lastKeySpan = document.getElementById('lastKey');
const keyCaptureCheckbox = document.getElementById('keyCaptureCheckbox');

function handleKeyDown(event) {
  if (event.target.tagName === 'INPUT' && !keyCaptureCheckbox.checked) {
    return;
  }

  const key = event.key;
  const code = event.code;
  const shift = event.shiftKey ? 'Shift+' : '';
  const ctrl = event.ctrlKey ? 'Ctrl+' : '';
  const alt = event.altKey ? 'Alt+' : '';

  let displayKey = key;
  if (key === ' ') displayKey = '␣ (пробел)';
  if (key === 'Escape') displayKey = '⎋ (Esc)';
  if (key === 'Enter') displayKey = '⏎ (Enter)';
  if (key === 'Tab') displayKey = '⇥ (Tab)';
  if (key === 'Backspace') displayKey = '⌫ (Backspace)';
  if (key === 'Delete') displayKey = '⌦ (Delete)';
  if (key === 'ArrowUp') displayKey = '↑';
  if (key === 'ArrowDown') displayKey = '↓';
  if (key === 'ArrowLeft') displayKey = '←';
  if (key === 'ArrowRight') displayKey = '→';

  const modifiers = (shift || ctrl || alt) ? `${shift}${ctrl}${alt}` : '';
  const fullDisplay = modifiers ? `${modifiers}${displayKey}` : displayKey;

  keyDisplay.textContent = fullDisplay;
  lastKeySpan.textContent = fullDisplay;

  if (key === 'F12') {
    event.preventDefault();
    addLog('Клавиша F12 заблокирована', 'warning');
    return;
  }

  addLog(`Нажата клавиша: ${fullDisplay} (код: ${code})`, 'info');
}

document.addEventListener('keydown', handleKeyDown);

document.addEventListener('keyup', function (event) {
  if (event.target.tagName === 'INPUT' && !keyCaptureCheckbox.checked) return;
  addLog(`Отпущена клавиша: ${event.key}`, 'info');
});

keyCaptureCheckbox.addEventListener('change', function () {
  if (this.checked) {
    addLog('Включен захват клавиш во всех полях ввода', 'warning');
  } else {
    addLog('Отключен захват клавиш во всех полях ввода', 'info');
  }
});

// =============================================
// 5. СПИСОК ЗАДАЧ (ДЕЛЕГИРОВАНИЕ)
// =============================================
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const clearTasksBtn = document.getElementById('clearTasksBtn');
const taskFilter = document.getElementById('taskFilter');

function addTask(text) {
  if (!text.trim()) {
    addLog('Попытка добавить пустую задачу', 'error');
    return;
  }

  const li = document.createElement('li');
  li.textContent = text;

  const deleteBtn = document.createElement('span');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
  li.appendChild(deleteBtn);

  taskList.appendChild(li);
  addLog(`Добавлена задача: "${text}"`, 'info');
  taskInput.value = '';
  taskInput.focus();
  applyTaskFilter();
}

addTaskBtn.addEventListener('click', function () {
  addTask(taskInput.value);
});

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask(this.value);
    event.preventDefault();
  }
});

taskList.addEventListener('click', function (event) {
  const target = event.target;

  if (target.classList.contains('delete-btn')) {
    const li = target.parentElement;
    const taskText = li.firstChild.textContent.trim();
    li.remove();
    addLog(`Удалена задача: "${taskText}"`, 'error');
    return;
  }

  if (target.tagName === 'LI') {
    target.classList.toggle('done');
    const status = target.classList.contains('done') ? 'выполнена' : 'отмечена как невыполненная';
    const taskText = target.firstChild.textContent.trim();
    addLog(`Задача "${taskText}" ${status}`, 'info');
  }
});

clearTasksBtn.addEventListener('click', function () {
  const tasks = taskList.querySelectorAll('li');
  if (tasks.length === 0) {
    addLog('Список задач уже пуст', 'warning');
    return;
  }
  taskList.innerHTML = '';
  addLog(`Все задачи удалены (${tasks.length} шт.)`, 'error');
});

// =============================================
// 6. ДЕЛЕГИРОВАНИЕ НА ДИНАМИЧЕСКИХ ЭЛЕМЕНТАХ
// =============================================
const delegationList = document.getElementById('delegationList');
const addDelegationBtn = document.getElementById('addDelegationItem');

delegationList.addEventListener('click', function (event) {
  if (event.target.tagName !== 'LI') return;

  this.querySelectorAll('li').forEach(li => {
    li.style.background = '#ecf0f1';
    li.style.color = 'black';
    li.style.border = 'none';
  });

  event.target.style.background = '#667eea';
  event.target.style.color = 'white';
  event.target.style.border = '2px solid #4a5fc1';

  addLog(`Выбран элемент: "${event.target.textContent}"`, 'click');
});

addDelegationBtn.addEventListener('click', function () {
  const li = document.createElement('li');
  li.style.cssText = 'background:#ecf0f1;padding:8px 15px;margin-bottom:5px;border-radius:6px;cursor:pointer;';
  const count = delegationList.querySelectorAll('li').length + 1;
  li.textContent = `Элемент ${count}`;
  delegationList.appendChild(li);
  addLog(`Добавлен новый элемент: "${li.textContent}"`, 'info');
});

// =============================================
// 7. TOGGLE
// =============================================
const toggleSwitch = document.getElementById('toggleSwitch');
const toggleStatus = document.getElementById('toggleStatus');
let isActive = false;

toggleSwitch.addEventListener('click', function () {
  isActive = !isActive;
  this.classList.toggle('active', isActive);
  toggleStatus.textContent = isActive ? 'Включено' : 'Выключено';
  toggleStatus.style.color = isActive ? '#2ecc71' : '#e74c3c';
  addLog(`Переключатель ${isActive ? 'включен' : 'выключен'}`, 'click');
});

// =============================================
// 8. ОЧИСТКА ЛОГА
// =============================================
const clearLogBtn = document.getElementById('clearLogBtn');
clearLogBtn.addEventListener('click', function () {
  const log = document.getElementById('eventLog');
  log.innerHTML = '<p style="color:#00ff41;">Лог очищен...</p>';
  addLog('Лог событий очищен пользователем', 'warning');
});

// =============================================
// 9. СОБЫТИЕ ЗАГРУЗКИ СТРАНИЦЫ
// =============================================
document.addEventListener('DOMContentLoaded', function () {
  addLog('Страница полностью загружена и готова к работе', 'info');
  addLog('Подсказка: попробуй кликать, наводить мышь, нажимать клавиши', 'info');
});

// =============================================
// 10. КАСТОМНОЕ КОНТЕКСТНОЕ МЕНЮ (самостоятельное задание 1)
// =============================================
const customMenu = document.getElementById('customMenu');

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  customMenu.style.display = 'block';

  const menuWidth = customMenu.offsetWidth || 180;
  const menuHeight = customMenu.offsetHeight || 200;

  let x = event.clientX;
  let y = event.clientY;

  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 5;
  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 5;

  customMenu.style.left = x + 'px';
  customMenu.style.top = y + 'px';

  addLog(`Открыто кастомное меню на (${event.clientX}, ${event.clientY})`, 'warning');
});

document.addEventListener('click', function (event) {
  if (!customMenu.contains(event.target)) {
    customMenu.style.display = 'none';
  }
});

customMenu.addEventListener('click', function (event) {
  const action = event.target.dataset.action;
  if (!action) return;

  switch (action) {
    case 'copy':
      addLog('Меню: Копировать', 'info');
      break;
    case 'paste':
      addLog('Меню: Вставить', 'info');
      break;
    case 'reload':
      addLog('Меню: Обновить страницу', 'warning');
      location.reload();
      break;
    case 'top':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addLog('Меню: Наверх', 'info');
      break;
    case 'log':
      addLog('Меню: Пользовательское действие', 'click');
      break;
  }
  customMenu.style.display = 'none';
});

// =============================================
// 11. DRAG & DROP (самостоятельное задание 2)
// =============================================
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

colorBox.style.position = 'absolute';
colorBox.style.cursor = 'grab';

// Помещаем colorBox в относительно позиционированный контейнер
const colorBoxParent = colorBox.parentElement;
colorBoxParent.style.position = 'relative';

colorBox.addEventListener('mousedown', function (event) {
  if (event.button !== 0) return;
  isDragging = true;
  dragOffsetX = event.clientX - colorBox.getBoundingClientRect().left;
  dragOffsetY = event.clientY - colorBox.getBoundingClientRect().top;
  colorBox.style.cursor = 'grabbing';
  colorBox.style.zIndex = 1000;
  addLog('Начато перетаскивание colorBox', 'info');
  event.preventDefault();
});

document.addEventListener('mousemove', function (event) {
  if (!isDragging) return;
  const parentRect = colorBoxParent.getBoundingClientRect();
  const newLeft = event.clientX - parentRect.left - dragOffsetX;
  const newTop = event.clientY - parentRect.top - dragOffsetY;
  colorBox.style.left = newLeft + 'px';
  colorBox.style.top = newTop + 'px';
});

document.addEventListener('mouseup', function () {
  if (!isDragging) return;
  isDragging = false;
  colorBox.style.cursor = 'grab';
  addLog('Перетаскивание завершено', 'info');
});

// =============================================
// 12. ФИЛЬТР СПИСКА ЗАДАЧ (самостоятельное задание 3)
// =============================================
function applyTaskFilter() {
  const query = taskFilter.value.toLowerCase().trim();
  taskList.querySelectorAll('li').forEach(li => {
    const text = li.firstChild.textContent.toLowerCase();
    li.style.display = text.includes(query) ? '' : 'none';
  });
}

taskFilter.addEventListener('input', function () {
  applyTaskFilter();
  const visible = [...taskList.querySelectorAll('li')].filter(li => li.style.display !== 'none').length;
  addLog(`Фильтр "${this.value}": найдено ${visible} задач`, 'info');
});

// =============================================
// 13. ТАЙМЕР АКТИВНОСТИ (самостоятельное задание 4)
// =============================================
const activityTimer = document.getElementById('activityTimer');
let lastActivity = Date.now();

function updateActivityTimer() {
  const diff = Math.floor((Date.now() - lastActivity) / 1000);
  if (diff < 3) {
    activityTimer.textContent = 'Только что';
  } else if (diff < 60) {
    activityTimer.textContent = `${diff} сек. назад`;
  } else {
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    activityTimer.textContent = `${min} мин. ${sec} сек. назад`;
  }
}

function resetActivity() {
  lastActivity = Date.now();
  activityTimer.textContent = 'Только что';
}

document.addEventListener('mousemove', resetActivity);
document.addEventListener('keydown', resetActivity);
document.addEventListener('click', resetActivity);

setInterval(updateActivityTimer, 1000);

// =============================================
// ЗАЩИТА ОТ СЛУЧАЙНОГО ВЫХОДА
// =============================================
window.addEventListener('beforeunload', function (event) {
  event.preventDefault();
  event.returnValue = '';
});