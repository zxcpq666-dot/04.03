// ============================================================
// 1. БАЗОВЫЕ КЛАССЫ (МОДЕЛИ ДАННЫХ)
// ============================================================

class Book {
  #id;
  constructor(title, author, year, genre = 'Не указан') {
    this.#id = String(Date.now() + Math.random()); // Храним ID как строку
    this.title = title;
    this.author = author;
    this.year = year;
    this.genre = genre;
    this.isAvailable = true;
    this._rating = 0;
  }
  getId() { return this.#id; }
  static restoreId(book, id) { book.#id = id; } // Для импорта

  get rating() { return this._rating; }
  set rating(val) {
    if (val >= 0 && val <= 5) this._rating = val;
  }

  toggleAvailability() { this.isAvailable = !this.isAvailable; }
  getInfo() { return `${this.title} — ${this.author} (${this.year})`; }

  toJSON() {
    return { id: this.#id, title: this.title, author: this.author, year: this.year, genre: this.genre, isAvailable: this.isAvailable, rating: this.rating, type: 'Book' };
  }
  static fromJSON(data) {
    const b = new Book(data.title, data.author, data.year, data.genre);
    Book.restoreId(b, data.id); b.isAvailable = data.isAvailable; b._rating = data.rating;
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
    Book.restoreId(b, data.id); b.isAvailable = data.isAvailable; b._rating = data.rating; b.isDownloaded = data.isDownloaded;
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
  getProgressPercent() {
    return this.duration === 0 ? 0 : Math.round((this.currentTime / this.duration) * 100);
  }
  toJSON() {
    return { ...super.toJSON(), duration: this.duration, narrator: this.narrator, currentTime: this.currentTime, type: 'AudioBook' };
  }
  static fromJSON(data) {
    const b = new AudioBook(data.title, data.author, data.year, data.duration, data.narrator);
    Book.restoreId(b, data.id); b.isAvailable = data.isAvailable; b._rating = data.rating; b.currentTime = data.currentTime;
    return b;
  }
}

// ============================================================
// 2. МЕНЕДЖЕР (БИЗНЕС-ЛОГИКА)
// ============================================================

class LibraryManager {
  constructor() { this.books = []; }

  addBook(title, author, year) { const b = new Book(title, author, year); this.books.push(b); return b; }
  addEBook(title, author, year, fileSize, format) { const b = new EBook(title, author, year, fileSize, format); this.books.push(b); return b; }
  addAudioBook(title, author, year, duration, narrator) { const b = new AudioBook(title, author, year, duration, narrator); this.books.push(b); return b; }

  removeBook(id) { this.books = this.books.filter(b => b.getId() !== id); }
  findBook(id) { return this.books.find(b => b.getId() === id); }
  getAllBooks() { return this.books; }
  
  toggleBookAvailability(id) {
    const b = this.findBook(id);
    if (b) b.toggleAvailability();
  }

  getStats() {
    const total = this.books.length;
    const available = this.books.filter(b => b.isAvailable).length;
    return { total, available, unavailable: total - available };
  }
}

// ============================================================
// 3. РЕНДЕРЕР (ПРЕДСТАВЛЕНИЕ / ОТОБРАЖЕНИЕ)
// ============================================================

class BookRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentFilter = 'all';
    this.onToggle = null;
    this.onRate = null;
    this.onDelete = null;
    this.onEdit = null; // Для Задания 1
  }

  setCallbacks(onToggle, onRate, onDelete, onEdit) {
    this.onToggle = onToggle;
    this.onRate = onRate;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
  }

  setFilter(filter) { this.currentFilter = filter; }

  render(books) {
    this.container.innerHTML = '';
    
    if (!books || books.length === 0) {
      this.container.innerHTML = '<div class="empty-state">Книг не найдено 📭</div>';
      return;
    }

    books.forEach(book => {
      const card = this.createBookCard(book);
      this.container.appendChild(card);
    });
  }

  createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.getId();

    // Классы для стилей
    card.classList.add(book.isAvailable ? 'available' : 'unavailable');
    if (book instanceof EBook) card.classList.add('ebook');
    if (book instanceof AudioBook) card.classList.add('audiobook');

    // Бейджи
    let typeBadge = '<span class="badge badge-book">Книга</span>';
    if (book instanceof EBook) typeBadge = '<span class="badge badge-ebook">Электронная</span>';
    if (book instanceof AudioBook) typeBadge = '<span class="badge badge-audiobook">Аудиокнига</span>';

    // Рейтинг (звездочки)
    const rating = Math.round(book.rating);
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    // Доп. инфо
    let extraInfo = '';
    if (book instanceof EBook) {
      extraInfo = `💾 Размер: ${book.fileSize} МБ | Формат: ${book.format}`;
    } else if (book instanceof AudioBook) {
      extraInfo = `🎧 ${book.duration} мин | Чтец: ${book.narrator}`;
    }

    card.innerHTML = `
      <div class="book-title">${book.title}</div>
      <div class="book-meta">
        ${book.author} (${book.year}) ${typeBadge}
        <br>
        <span style="color: ${book.isAvailable ? '#28a745' : '#dc3545'}; font-weight: 600;">
          ${book.isAvailable ? '● Доступна' : '● Выдана'}
        </span>
        <br>
        ${stars} (${book.rating})
        ${extraInfo ? `<br><small>${extraInfo}</small>` : ''}
      </div>
      <div class="book-actions">
        <button class="toggle-btn btn-primary">
          ${book.isAvailable ? 'Выдать' : 'Вернуть'}
        </button>
        <!-- Задание 1: Кнопка редактирования -->
        <button class="edit-btn btn-outline">Редактировать</button>
        <button class="rate-btn btn-outline">Оценить</button>
        <button class="delete-btn btn-danger">Удалить</button>
      </div>
    `;

    const id = book.getId();

    // Обработчики
    card.querySelector('.toggle-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onToggle) this.onToggle(id);
    });

    card.querySelector('.rate-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const val = prompt('Введите рейтинг (от 0 до 5):', book.rating);
      if (val !== null) {
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 5) {
          if (this.onRate) this.onRate(id, num);
        } else {
          alert('Ошибка: введите число от 0 до 5');
        }
      }
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Удалить книгу "${book.title}"?`)) {
        if (this.onDelete) this.onDelete(id);
      }
    });

    // Задание 1: Обработчик редактирования
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onEdit) this.onEdit(id);
    });

    return card;
  }
}

// ============================================================
// 4. ИНИЦИАЛИЗАЦИЯ И СВЯЗЫВАНИЕ (APP LOGIC)
// ============================================================

const library = new LibraryManager();
const renderer = new BookRenderer('booksContainer');

renderer.setCallbacks(
  // Выдать/Вернуть
  (id) => {
    library.toggleBookAvailability(id);
    updateUI();
  },
  // Оценить
  (id, rating) => {
    const b = library.findBook(id);
    if (b) { b.rating = rating; updateUI(); }
  },
  // Удалить
  (id) => {
    library.removeBook(id);
    updateUI();
  },
  // Задание 1: Редактировать
  (id) => {
    const b = library.findBook(id);
    if (b) {
      const newTitle = prompt('Введите новое название:', b.title);
      if (newTitle !== null && newTitle.trim() !== '') {
        b.title = newTitle.trim();
      }
      const newAuthor = prompt('Введите нового автора:', b.author);
      if (newAuthor !== null && newAuthor.trim() !== '') {
        b.author = newAuthor.trim();
      }
      updateUI(); // Перерисовываем интерфейс
    }
  }
);

// ============================================================
// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА (ФИЛЬТРАЦИЯ, ПОИСК, СОРТИРОВКА)
// ============================================================

function updateUI() {
  let books = library.getAllBooks();

  // 1. Задание 2: Поиск
  const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
  if (searchQuery) {
    books = books.filter(b => 
      b.title.toLowerCase().includes(searchQuery) || 
      b.author.toLowerCase().includes(searchQuery)
    );
  }

  // 2. Фильтрация (кнопки)
  const filter = renderer.currentFilter;
  if (filter === 'available') books = books.filter(b => b.isAvailable);
  else if (filter === 'unavailable') books = books.filter(b => !b.isAvailable);
  else if (filter === 'ebook') books = books.filter(b => b instanceof EBook);
  else if (filter === 'audiobook') books = books.filter(b => b instanceof AudioBook);

  // 3. Задание 3: Сортировка
  const sortValue = document.getElementById('sortSelect').value;
  if (sortValue === 'year_desc') {
    books.sort((a, b) => b.year - a.year);
  } else if (sortValue === 'year_asc') {
    books.sort((a, b) => a.year - b.year);
  } else if (sortValue === 'title_asc') {
    books.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === 'rating_desc') {
    books.sort((a, b) => b.rating - a.rating);
  }

  // 4. Отрисовка
  renderer.render(books);

  // 5. Статистика
  updateStats();
}

function updateStats() {
  const stats = library.getStats();
  document.getElementById('totalBooks').textContent = stats.total;
  document.getElementById('availableBooks').textContent = stats.available;
  document.getElementById('unavailableBooks').textContent = stats.unavailable;
}

// ============================================================
// 6. ОБРАБОТЧИКИ СОБЫТИЙ (ФОРМА, ФИЛЬТРЫ, ЭКСПОРТ)
// ============================================================

// --- Динамические поля формы ---
const typeSelect = document.getElementById('type');
const extraFields = document.getElementById('extraFields');

typeSelect.addEventListener('change', () => {
  const type = typeSelect.value;
  let html = '';
  
  if (type === 'ebook') {
    html = `
      <div class="form-group">
        <label for="fileSize">Размер (МБ)</label>
        <input type="number" id="fileSize" step="0.1" value="1.0" min="0.1">
      </div>
      <div class="form-group">
        <label for="format">Формат</label>
        <select id="format">
          <option value="PDF">PDF</option>
          <option value="EPUB">EPUB</option>
          <option value="MOBI">MOBI</option>
        </select>
      </div>
    `;
  } else if (type === 'audiobook') {
    html = `
      <div class="form-group">
        <label for="duration">Длительность (минуты)</label>
        <input type="number" id="duration" value="60" min="1">
      </div>
      <div class="form-group">
        <label for="narrator">Чтец</label>
        <input type="text" id="narrator" placeholder="Имя чтеца" value="Неизвестный чтец">
      </div>
    `;
  }
  extraFields.innerHTML = html;
});

// --- Отправка формы ---
document.getElementById('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const year = parseInt(document.getElementById('year').value);
  const type = typeSelect.value;

  if (!title || !author || !year) {
    alert('Заполните все обязательные поля!');
    return;
  }

  try {
    if (type === 'ebook') {
      const fileSize = parseFloat(document.getElementById('fileSize').value) || 1;
      const format = document.getElementById('format').value;
      library.addEBook(title, author, year, fileSize, format);
    } else if (type === 'audiobook') {
      const duration = parseInt(document.getElementById('duration').value) || 60;
      const narrator = document.getElementById('narrator').value.trim() || 'Неизвестный чтец';
      library.addAudioBook(title, author, year, duration, narrator);
    } else {
      library.addBook(title, author, year);
    }

    e.target.reset();
    extraFields.innerHTML = '';
    updateUI();
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// --- Фильтры ---
document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderer.setFilter(btn.dataset.filter);
    updateUI();
  });
});

// --- Задание 2 и 3: Слушатели поиска и сортировки ---
document.getElementById('searchInput').addEventListener('input', updateUI);
document.getElementById('sortSelect').addEventListener('change', updateUI);

// --- Очистка всех книг ---
document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm('Удалить все книги безвозвратно?')) {
    library.books = [];
    updateUI();
  }
});

// --- Экспорт ---
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = library.getAllBooks().map(b => b.toJSON());
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `library_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// --- Импорт ---
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
  if (e.target.files.length === 0) return;
  
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const dataArray = JSON.parse(event.target.result);
      if (!Array.isArray(dataArray)) throw new Error('Неверный формат файла');
      
      const importedBooks = dataArray.map(item => {
        if (item.type === 'EBook') return EBook.fromJSON(item);
        if (item.type === 'AudioBook') return AudioBook.fromJSON(item);
        return Book.fromJSON(item);
      });
      
      importedBooks.forEach(book => library.books.push(book));
      
      updateUI();
      alert(`Успешно импортировано книг: ${importedBooks.length}`);
    } catch (error) {
      alert('Ошибка импорта: ' + error.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Сброс инпута
});

// ============================================================
// 7. ЗАПУСК
// ============================================================
updateUI();
console.log('Приложение "Библиотека книг" запущено!');