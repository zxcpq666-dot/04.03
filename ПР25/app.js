// ============================================================
// 1. БАЗОВЫЕ КЛАССЫ (МОДЕЛИ ДАННЫХ)
// ============================================================

class Book {
  #id;
  constructor(title, author, year, genre = 'Не указан') {
    // Используем crypto.randomUUID для надежного ID, либо fallback
    this.#id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); 
    this.title = title;
    this.author = author;
    this.year = year;
    this.genre = genre;
    this.isAvailable = true;
    this._rating = 0;
    this.isFavorite = false; // Задание 4
  }

  getId() { return this.#id; }
  // Правильное восстановление приватного поля
  static restoreId(book, id) { book.#id = id; }

  get rating() { return this._rating; }
  set rating(val) {
    if (val >= 0 && val <= 5) this._rating = val;
  }

  toggleAvailability() { this.isAvailable = !this.isAvailable; }
  toggleFavorite() { this.isFavorite = !this.isFavorite; }

  toJSON() {
    return { 
      id: this.#id, title: this.title, author: this.author, year: this.year, 
      genre: this.genre, isAvailable: this.isAvailable, rating: this._rating, 
      isFavorite: this.isFavorite, type: 'Book' 
    };
  }

  static fromJSON(data) {
    const b = new Book(data.title, data.author, data.year, data.genre);
    Book.restoreId(b, data.id); 
    b.isAvailable = data.isAvailable; 
    b._rating = data.rating || 0;
    b.isFavorite = data.isFavorite || false;
    return b;
  }
}

class EBook extends Book {
  constructor(title, author, year, fileSize, format) {
    super(title, author, year);
    this.fileSize = fileSize;
    this.format = format;
    this.isDownloaded = false;
  }
  toJSON() {
    return { ...super.toJSON(), fileSize: this.fileSize, format: this.format, isDownloaded: this.isDownloaded, type: 'EBook' };
  }
  static fromJSON(data) {
    const b = new EBook(data.title, data.author, data.year, data.fileSize, data.format);
    Book.restoreId(b, data.id); 
    b.isAvailable = data.isAvailable; b._rating = data.rating || 0; 
    b.isDownloaded = data.isDownloaded; b.isFavorite = data.isFavorite || false;
    return b;
  }
}

class AudioBook extends Book {
  constructor(title, author, year, duration, narrator) {
    super(title, author, year);
    this.duration = duration;
    this.narrator = narrator;
    this.currentTime = 0;
  }
  toJSON() {
    return { ...super.toJSON(), duration: this.duration, narrator: this.narrator, currentTime: this.currentTime, type: 'AudioBook' };
  }
  static fromJSON(data) {
    const b = new AudioBook(data.title, data.author, data.year, data.duration, data.narrator);
    Book.restoreId(b, data.id); 
    b.isAvailable = data.isAvailable; b._rating = data.rating || 0; 
    b.currentTime = data.currentTime || 0; b.isFavorite = data.isFavorite || false;
    return b;
  }
}

// ============================================================
// 2. МЕНЕДЖЕР (С ЛОГИКОЙ LOCALSTORAGE И UNDO)
// ============================================================

class LibraryManager {
  constructor() {
    this.books = [];
    this.history = [];
    this.historyIndex = -1;
    this.loadFromStorage(); // Загружаем при старте
  }

  // --- ЗАДАНИЕ 1: СОХРАНЕНИЕ + ИНДИКАТОР ---
  #saveToStorage(saveHistory = true) {
    try {
      // Задание 2: Сохраняем историю перед изменением
      if (saveHistory) {
        const snapshot = this.books.map(b => b.toJSON());
        // Обрезаем историю, если мы были в середине (после Undo)
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snapshot);
        this.historyIndex = this.history.length - 1;
      }

      // Сохраняем в LocalStorage
      const data = this.books.map(book => book.toJSON());
      localStorage.setItem('libraryData', JSON.stringify(data));
      
      // Индикатор
      const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem('libraryLastSaved', now);
      this.updateSaveIndicator(now);

      console.log(`Сохранено ${this.books.length} книг`);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }

  updateSaveIndicator(time) {
    const el = document.getElementById('saveIndicator');
    if (el) el.textContent = `✔ Сохранено в ${time}`;
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem('libraryData');
      const lastSaved = localStorage.getItem('libraryLastSaved');
      
      if (lastSaved) this.updateSaveIndicator(lastSaved);

      if (!raw) {
        console.log('Данных в LocalStorage нет');
        return;
      }

      const dataArray = JSON.parse(raw);
      this.books = dataArray.map(item => {
        if (item.type === 'EBook') return EBook.fromJSON(item);
        if (item.type === 'AudioBook') return AudioBook.fromJSON(item);
        return Book.fromJSON(item);
      });

      // Инициализация истории текущим состоянием
      if (this.history.length === 0) {
        this.history = [this.books.map(b => b.toJSON())];
        this.historyIndex = 0;
      }

      console.log(`Загружено ${this.books.length} книг из LocalStorage`);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      this.books = [];
    }
  }

  // --- ОСНОВНЫЕ МЕТОДЫ С АВТОСОХРАНЕНИЕМ ---
  addBook(title, author, year) { 
    const b = new Book(title, author, year); this.books.push(b); this.#saveToStorage(); return b; 
  }
  addEBook(title, author, year, fileSize, format) { 
    const b = new EBook(title, author, year, fileSize, format); this.books.push(b); this.#saveToStorage(); return b; 
  }
  addAudioBook(title, author, year, duration, narrator) { 
    const b = new AudioBook(title, author, year, duration, narrator); this.books.push(b); this.#saveToStorage(); return b; 
  }

  removeBook(id) { 
    this.books = this.books.filter(b => b.getId() !== id); 
    this.#saveToStorage(); 
  }
  
  findBook(id) { return this.books.find(b => b.getId() === id); }
  getAllBooks() { return this.books; }

  toggleBookAvailability(id) {
    const b = this.findBook(id);
    if (b) { b.toggleAvailability(); this.#saveToStorage(); }
  }

  toggleBookFavorite(id) {
    const b = this.findBook(id);
    if (b) { b.toggleFavorite(); this.#saveToStorage(); }
  }

  setRating(id, rating) {
    const b = this.findBook(id);
    if (b) { b.rating = rating; this.#saveToStorage(); }
  }

  clearAll() {
    this.books = [];
    this.#saveToStorage();
  }

  saveData() { this.#saveToStorage(); }

  // --- ЗАДАНИЕ 2: UNDO ---
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const snapshot = this.history[this.historyIndex];
      
      this.books = snapshot.map(item => {
        if (item.type === 'EBook') return EBook.fromJSON(item);
        if (item.type === 'AudioBook') return AudioBook.fromJSON(item);
        return Book.fromJSON(item);
      });
      
      this.#saveToStorage(false); // Не перезаписываем историю, просто обновляем LocalStorage
      updateUI();
    }
  }

  getStats() {
    const total = this.books.length;
    const available = this.books.filter(b => b.isAvailable).length;
    return { total, available, unavailable: total - available };
  }
}

// ============================================================
// 3. РЕНДЕРЕР
// ============================================================

class BookRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = 'all';
    this.onToggle = null;
    this.onRate = null;
    this.onDelete = null;
    this.onEdit = null;
    this.onFavorite = null; // Задание 4
  }

  setCallbacks(onToggle, onRate, onDelete, onEdit, onFavorite) {
    this.onToggle = onToggle;
    this.onRate = onRate;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
    this.onFavorite = onFavorite;
  }

  setFilter(filter) { this.currentFilter = filter; }

  render(books) {
    this.container.innerHTML = '';
    if (!books || books.length === 0) {
      this.container.innerHTML = '<div class="empty-state">Книг не найдено 📭</div>';
      return;
    }
    books.forEach(book => this.container.appendChild(this.createBookCard(book)));
  }

  createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.getId();

    card.classList.add(book.isAvailable ? 'available' : 'unavailable');
    if (book instanceof EBook) card.classList.add('ebook');
    if (book instanceof AudioBook) card.classList.add('audiobook');

    let typeBadge = '<span class="badge badge-book">Книга</span>';
    if (book instanceof EBook) typeBadge = '<span class="badge badge-ebook">Электронная</span>';
    if (book instanceof AudioBook) typeBadge = '<span class="badge badge-audiobook">Аудиокнига</span>';

    const stars = '★'.repeat(Math.round(book.rating)) + '☆'.repeat(5 - Math.round(book.rating));
    
    // Кнопка избранного
    const favIcon = book.isFavorite ? '⭐' : '☆';

    let extraInfo = '';
    if (book instanceof EBook) extraInfo = `💾 ${book.fileSize} МБ | ${book.format}`;
    else if (book instanceof AudioBook) extraInfo = `🎧 ${book.duration} мин | ${book.narrator}`;

    card.innerHTML = `
      <div class="book-title">
        <span>${book.title}</span>
        <button class="fav-btn ${book.isFavorite ? 'active' : ''}" title="В избранное">${favIcon}</button>
      </div>
      <div class="book-meta">
        ${book.author} (${book.year}) ${typeBadge}<br>
        <span style="color: ${book.isAvailable ? '#28a745' : '#dc3545'}; font-weight: 600;">
          ${book.isAvailable ? '● Доступна' : '● Выдана'}
        </span><br>
        ${stars} (${book.rating})
        ${extraInfo ? `<br><small>${extraInfo}</small>` : ''}
      </div>
      <div class="book-actions">
        <button class="toggle-btn btn-primary">${book.isAvailable ? 'Выдать' : 'Вернуть'}</button>
        <button class="edit-btn btn-outline">Редактировать</button>
        <button class="rate-btn btn-outline">Оценить</button>
        <button class="delete-btn btn-danger">Удалить</button>
      </div>
    `;

    const id = book.getId();

    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onFavorite) this.onFavorite(id);
    });
    card.querySelector('.toggle-btn').addEventListener('click', (e) => {
      e.stopPropagation(); if (this.onToggle) this.onToggle(id);
    });
    card.querySelector('.rate-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const val = prompt('Введите рейтинг (0-5):', book.rating);
      if (val !== null && !isNaN(parseFloat(val))) {
        const num = parseFloat(val);
        if (num >= 0 && num <= 5) { if (this.onRate) this.onRate(id, num); }
        else alert('Ошибка: от 0 до 5');
      }
    });
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Удалить "${book.title}"?`)) { if (this.onDelete) this.onDelete(id); }
    });
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation(); if (this.onEdit) this.onEdit(id);
    });

    return card;
  }
}

// ============================================================
// 4. ИНИЦИАЛИЗАЦИЯ
// ============================================================

const library = new LibraryManager();
const renderer = new BookRenderer('booksContainer');

renderer.setCallbacks(
  (id) => { library.toggleBookAvailability(id); updateUI(); },
  (id, rating) => { library.setRating(id, rating); updateUI(); },
  (id) => { library.removeBook(id); updateUI(); },
  (id) => {
    const b = library.findBook(id);
    if (b) {
      const t = prompt('Новое название:', b.title);
      if (t && t.trim()) b.title = t.trim();
      const a = prompt('Новый автор:', b.author);
      if (a && a.trim()) b.author = a.trim();
      library.saveData(); // Сохраняем изменения
      updateUI();
    }
  },
  (id) => { library.toggleBookFavorite(id); updateUI(); } // Задание 4
);

// ============================================================
// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ============================================================

function updateUI() {
  let books = library.getAllBooks();

  // Поиск
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  if (q) books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));

  // Фильтрация
  const filter = renderer.currentFilter;
  if (filter === 'available') books = books.filter(b => b.isAvailable);
  else if (filter === 'unavailable') books = books.filter(b => !b.isAvailable);
  else if (filter === 'ebook') books = books.filter(b => b instanceof EBook);
  else if (filter === 'audiobook') books = books.filter(b => b instanceof AudioBook);
  else if (filter === 'favorites') books = books.filter(b => b.isFavorite); // Задание 4

  // Сортировка
  const sortVal = document.getElementById('sortSelect').value;
  if (sortVal === 'year_desc') books.sort((a, b) => b.year - a.year);
  else if (sortVal === 'year_asc') books.sort((a, b) => a.year - b.year);
  else if (sortVal === 'title_asc') books.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortVal === 'rating_desc') books.sort((a, b) => b.rating - a.rating);

  renderer.render(books);
  
  // Статистика
  const stats = library.getStats();
  document.getElementById('totalBooks').textContent = stats.total;
  document.getElementById('availableBooks').textContent = stats.available;
  document.getElementById('unavailableBooks').textContent = stats.unavailable;

  // Задание 2: Кнопка Undo
  document.getElementById('undoBtn').disabled = (library.historyIndex <= 0);
}

// ============================================================
// 6. ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================

const typeSelect = document.getElementById('type');
const extraFields = document.getElementById('extraFields');

typeSelect.addEventListener('change', () => {
  const type = typeSelect.value;
  let html = '';
  if (type === 'ebook') {
    html = `<div class="form-group"><label>Размер (МБ)</label><input type="number" id="fileSize" step="0.1" value="1.0" min="0.1"></div>
            <div class="form-group"><label>Формат</label><select id="format"><option>PDF</option><option>EPUB</option><option>MOBI</option></select></div>`;
  } else if (type === 'audiobook') {
    html = `<div class="form-group"><label>Длительность (мин)</label><input type="number" id="duration" value="60" min="1"></div>
            <div class="form-group"><label>Чтец</label><input type="text" id="narrator" value="Неизвестный чтец"></div>`;
  }
  extraFields.innerHTML = html;
});

document.getElementById('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const year = parseInt(document.getElementById('year').value);
  const type = typeSelect.value;

  if (!title || !author || !year) { alert('Заполните поля!'); return; }

  if (type === 'ebook') {
    library.addEBook(title, author, year, parseFloat(document.getElementById('fileSize').value) || 1, document.getElementById('format').value);
  } else if (type === 'audiobook') {
    library.addAudioBook(title, author, year, parseInt(document.getElementById('duration').value) || 60, document.getElementById('narrator').value);
  } else {
    library.addBook(title, author, year);
  }

  e.target.reset();
  extraFields.innerHTML = '';
  updateUI();
});

document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderer.setFilter(btn.dataset.filter);
    updateUI();
  });
});

document.getElementById('searchInput').addEventListener('input', updateUI);
document.getElementById('sortSelect').addEventListener('change', updateUI);

document.getElementById('undoBtn').addEventListener('click', () => library.undo());

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm('Удалить все книги?')) { library.clearAll(); updateUI(); }
});

// Экспорт
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = library.getAllBooks().map(b => b.toJSON());
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `library_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// Импорт
document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
  if (!e.target.files.length) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const dataArray = JSON.parse(event.target.result);
      if (!Array.isArray(dataArray)) throw new Error('Неверный формат');
      
      const imported = dataArray.map(item => {
        if (item.type === 'EBook') return EBook.fromJSON(item);
        if (item.type === 'AudioBook') return AudioBook.fromJSON(item);
        return Book.fromJSON(item);
      });
      
      imported.forEach(b => library.books.push(b));
      library.saveData(); // Сохраняем после импорта
      updateUI();
      alert(`Импортировано ${imported.length} книг`);
    } catch (error) {
      alert('Ошибка импорта: ' + error.message);
    }
  };
  reader.readAsText(e.target.files[0]);
  e.target.value = '';
});

// ============================================================
// 7. ЗАДАНИЕ 3: СИНХРОНИЗАЦИЯ МЕЖДУ ВКЛАДКАМИ
// ============================================================
window.addEventListener('storage', (e) => {
  if (e.key === 'libraryData') {
    console.log('🔄 Данные изменены в другой вкладке. Синхронизация...');
    library.loadFromStorage();
    updateUI();
  }
});

// ============================================================
// 8. ЗАПУСК
// ============================================================
updateUI();
console.log('Приложение "Библиотека книг" запущено!');