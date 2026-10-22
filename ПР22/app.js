// ============================================================
// ПРАКТИЧЕСКАЯ РАБОТА 22. Основы классов в JavaScript
// ============================================================

// ============================================================
// 1. КЛАСС BOOK — МОДЕЛЬ ДАННЫХ
// ============================================================
class Book {
  // Приватное поле — уникальный идентификатор
  #id;

  constructor(title, author, year, genre = 'Не указан') {
    this.#id = Date.now() + Math.random(); // уникальный ID
    this.title = title;                    // Название
    this.author = author;                  // Автор
    this.year = year;                      // Год издания
    this.genre = genre;                    // Жанр (по умолчанию 'Не указан')
    this.isAvailable = true;               // Доступна ли книга
    this._rating = 0;                      // Внутреннее хранилище рейтинга
  }

  // Геттер для ID (только чтение — сеттера нет)
  getId() {
    return this.#id;
  }

  // Вычисляемое свойство: возраст книги в годах
  get age() {
    return new Date().getFullYear() - this.year;
  }

  // ----- Задание 1: isOld() -----
  // Возвращает true, если книга старше 100 лет
  isOld() {
    return this.age > 100;
  }

  // Сеттер рейтинга с валидацией
  set rating(value) {
    if (value < 0 || value > 5) {
      throw new Error('Рейтинг должен быть от 0 до 5');
    }
    this._rating = value;
  }

  // Геттер рейтинга
  get rating() {
    return this._rating || 0;
  }

  // Инвертирует статус доступности
  toggleAvailability() {
    this.isAvailable = !this.isAvailable;
  }

  // Строковое описание книги
  getInfo() {
    const status = this.isAvailable ? '✔ Доступна' : '✖ Выдана';
    return `${this.title} — ${this.author} (${this.year}), ${status}`;
  }

  // Используется JSON.stringify()
  toJSON() {
    return {
      id: this.#id,
      title: this.title,
      author: this.author,
      year: this.year,
      genre: this.genre,
      isAvailable: this.isAvailable,
      rating: this._rating || 0
    };
  }
}

// ============================================================
// 2. КЛАСС LIBRARYMANAGER — БИЗНЕС-ЛОГИКА
// ============================================================
class LibraryManager {
  constructor() {
    this.books = [];
  }

  // Добавление книги
  addBook(title, author, year, genre) {
    if (!title || !author || !year) {
      throw new Error('Название, автор и год обязательны');
    }
    const book = new Book(title, author, year, genre);
    this.books.push(book);
    return book;
  }

  // Удаление книги по ID
  removeBook(id) {
    this.books = this.books.filter(book => book.getId() !== id);
  }

  // Поиск книги по ID
  findBook(id) {
    return this.books.find(book => book.getId() === id);
  }

  // Поиск книг по автору (без учёта регистра)
  findBooksByAuthor(author) {
    return this.books.filter(book =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  // Переключение доступности книги
  toggleBookAvailability(id) {
    const book = this.findBook(id);
    if (book) book.toggleAvailability();
    return book;
  }

  // Все книги
  getAllBooks() {
    return this.books;
  }

  // Статистика
  getStats() {
    const total = this.books.length;
    const available = this.books.filter(b => b.isAvailable).length;
    return { total, available, unavailable: total - available };
  }

  // Книги по жанру (без учёта регистра)
  getBooksByGenre(genre) {
    return this.books.filter(book =>
      book.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  // ----- Задание 2: книги в диапазоне лет -----
  getBooksByYearRange(fromYear, toYear) {
    return this.books.filter(book =>
      book.year >= fromYear && book.year <= toYear
    );
  }

  // ----- Задание 3: средний рейтинг -----
  getAverageRating() {
    if (this.books.length === 0) return 0;
    const sum = this.books.reduce((acc, book) => acc + book.rating, 0);
    return Number((sum / this.books.length).toFixed(2));
  }
}

// ============================================================
// 3. ТЕСТИРОВАНИЕ БАЗОВОЙ ЛОГИКИ
// ============================================================

const library = new LibraryManager();

console.log('=== ДОБАВЛЕНИЕ КНИГ ===');
const book1 = library.addBook('Война и мир', 'Лев Толстой', 1869, 'Роман');
const book2 = library.addBook('Преступление и наказание', 'Фёдор Достоевский', 1866, 'Роман');
const book3 = library.addBook('1984', 'Джордж Оруэлл', 1949, 'Антиутопия');
console.log(`Добавлено книг: ${library.getAllBooks().length}`);

console.log('\n=== СПИСОК КНИГ ===');
library.getAllBooks().forEach(book => console.log(book.getInfo()));

console.log('\n=== ВОЗРАСТ КНИГ ===');
console.log(`"${book1.title}" — ${book1.age} лет`);
console.log(`"${book2.title}" — ${book2.age} лет`);

console.log('\n=== РЕЙТИНГ ===');
book1.rating = 4.5;
console.log(`Рейтинг "${book1.title}": ${book1.rating}`);
try {
  book1.rating = 10; // выбросит ошибку
} catch (error) {
  console.log('Ошибка при установке рейтинга:', error.message);
}

console.log('\n=== ПОИСК ПО АВТОРУ ===');
library.findBooksByAuthor('толстой').forEach(book => {
  console.log(`Найдено: ${book.getInfo()}`);
});

console.log('\n=== ПЕРЕКЛЮЧЕНИЕ СТАТУСА ===');
const firstBookId = library.getAllBooks()[0].getId();
library.toggleBookAvailability(firstBookId);
console.log(`Статус книги после выдачи: ${library.findBook(firstBookId).getInfo()}`);

console.log('\n=== СТАТИСТИКА ===');
let stats = library.getStats();
console.log(`Всего: ${stats.total}, Доступно: ${stats.available}, Выдано: ${stats.unavailable}`);

// ============================================================
// 4. САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ
// ============================================================

// ------------------------------------------------------------
// Задание 1. Метод isOld()
// ------------------------------------------------------------
console.log('\n=== ЗАДАНИЕ 1: isOld() ===');
library.getAllBooks().forEach(book => {
  console.log(`"${book.title}" (${book.year}) — старше 100 лет? ${book.isOld()}`);
});

// ------------------------------------------------------------
// Задание 2. getBooksByYearRange(fromYear, toYear)
// ------------------------------------------------------------
console.log('\n=== ЗАДАНИЕ 2: книги, изданные в 1800–1900 гг. ===');
library.getBooksByYearRange(1800, 1900).forEach(book => {
  console.log(`  ${book.year}: ${book.title}`);
});

// ------------------------------------------------------------
// Задание 3. getAverageRating()
// ------------------------------------------------------------
console.log('\n=== ЗАДАНИЕ 3: средний рейтинг ===');
console.log('Средний рейтинг:', library.getAverageRating());

// ------------------------------------------------------------
// Задание 4. 5 книг разных жанров + сортировка по году
// ------------------------------------------------------------
console.log('\n=== ЗАДАНИЕ 4: 5 книг разных жанров ===');

const extraBooks = [
  // [название, автор, год, жанр, рейтинг]
  ['Мастер и Маргарита',                 'Михаил Булгаков',       1967, 'Мистика',   5.0],
  ['Гарри Поттер и философский камень',  'Джоан Роулинг',         1997, 'Фэнтези',   4.8],
  ['Дюна',                               'Фрэнк Герберт',         1965, 'Фантастика',4.7],
  ['Убить пересмешника',                 'Харпер Ли',             1960, 'Драма',     4.9],
  ['Три товарища',                       'Эрих Мария Ремарк',     1936, 'Роман',     4.6]
];

extraBooks.forEach(([title, author, year, genre, rating]) => {
  const b = library.addBook(title, author, year, genre);
  b.rating = rating;
});

console.log('\nВсе книги, отсортированные по году (от новых к старым):');
const sortedBooks = [...library.getAllBooks()].sort((a, b) => b.year - a.year);
sortedBooks.forEach(book => {
  console.log(`  ${book.year}: ${book.title} — ${book.genre} (★ ${book.rating})`);
});

console.log('\n=== ИТОГОВАЯ СТАТИСТИКА ===');
stats = library.getStats();
console.log(`Всего: ${stats.total}, Доступно: ${stats.available}, Выдано: ${stats.unavailable}`);
console.log('Средний рейтинг по всем книгам:', library.getAverageRating());

// ============================================================
// 5. РЕНДЕРИНГ НА СТРАНИЦЕ
// ============================================================

function renderBooks() {
  const container = document.getElementById('booksContainer');
  const statsEl = document.getElementById('stats');
  if (!container || !statsEl) return;

  // Сортировка: новые книги сверху
  const sorted = [...library.getAllBooks()].sort((a, b) => b.year - a.year);

  container.innerHTML = sorted.map(book => `
    <div class="book-card">
      <div class="book-title">
        ${book.title}
        ${book.isOld() ? '<span class="badge badge-old">старше 100 лет</span>' : ''}
      </div>
      <div class="book-meta">${book.author} · ${book.year} · <span class="book-genre">${book.genre}</span></div>
      <div class="book-meta">
        <span class="${book.isAvailable ? 'available' : 'unavailable'}">
          ${book.isAvailable ? '✔ Доступна' : '✖ Выдана'}
        </span>
        <span class="badge badge-num">★ ${book.rating}</span>
      </div>
      <button data-toggle="${book.getId()}">
        ${book.isAvailable ? 'Выдать' : 'Вернуть'}
      </button>
    </div>
  `).join('');

  statsEl.innerHTML = `
    <strong>Статистика:</strong>
    всего книг: ${stats.total} ·
    доступно: <span class="available">${stats.available}</span> ·
    выдано: <span class="unavailable">${stats.unavailable}</span> ·
    средний рейтинг: <strong>${library.getAverageRating()}</strong>
  `;
}

// Один раз вешаем обработчик на контейнер (делегирование)
document.getElementById('booksContainer').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle]');
  if (!btn) return;

  const id = btn.dataset.toggle; // строка
  // Ищем книгу по строковому представлению ID (устойчиво к float)
  const book = library.getAllBooks().find(b => String(b.getId()) === id);
  if (book) {
    book.toggleAvailability();
    renderBooks();
  }
});

// Первый рендер
renderBooks();