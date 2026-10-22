// ============================================================
// ПРАКТИЧЕСКАЯ РАБОТА 23. Наследование и полиморфизм
// ============================================================

// ============================================================
// 1. БАЗОВЫЙ КЛАСС BOOK
// ============================================================
class Book {
  #id;

  constructor(title, author, year, genre = 'Не указан') {
    this.#id = Date.now() + Math.random();
    this.title = title;
    this.author = author;
    this.year = year;
    this.genre = genre;
    this.isAvailable = true;
    this._rating = 0;
  }

  getId() {
    return this.#id;
  }

  // Восстановление приватного #id из JSON.
  // Статический метод класса Book имеет доступ к #id у любого
  // экземпляра Book (включая наследников).
  static restoreId(book, id) {
    book.#id = id;
  }

  get age() {
    return new Date().getFullYear() - this.year;
  }

  isOld() {
    return this.age > 100;
  }

  set rating(value) {
    if (value < 0 || value > 5) {
      throw new Error('Рейтинг должен быть от 0 до 5');
    }
    this._rating = value;
  }

  get rating() {
    return this._rating || 0;
  }

  toggleAvailability() {
    this.isAvailable = !this.isAvailable;
  }

  getInfo() {
    const status = this.isAvailable ? '✔ Доступна' : '✖ Выдана';
    return `${this.title} — ${this.author} (${this.year}), ${status}`;
  }

  toJSON() {
    return {
      id: this.#id,
      title: this.title,
      author: this.author,
      year: this.year,
      genre: this.genre,
      isAvailable: this.isAvailable,
      rating: this._rating || 0,
      type: 'Book'
    };
  }

  static fromJSON(data) {
    const book = new Book(data.title, data.author, data.year, data.genre);
    Book.restoreId(book, data.id);
    book.isAvailable = data.isAvailable;
    book._rating = data.rating || 0;
    return book;
  }
}

// ============================================================
// 2. EBook — НАСЛЕДНИК BOOK
// ============================================================
class EBook extends Book {
  constructor(title, author, year, fileSize, format = 'PDF') {
    super(title, author, year);
    this.fileSize = fileSize;
    this.format = format;
    this.isDownloaded = false;
  }

  getInfo() {
    const baseInfo = super.getInfo();
    return `${baseInfo} (Электронная, ${this.format}, ${this.fileSize} МБ)`;
  }

  download() {
    if (!this.isAvailable) {
      console.log(`Книга "${this.title}" недоступна для скачивания`);
      return;
    }
    this.isDownloaded = true;
    console.log(`Книга "${this.title}" скачана`);
  }

  toggleAvailability() {
    super.toggleAvailability();
    if (!this.isAvailable) {
      this.isDownloaded = false;
      console.log(`Книга "${this.title}" недоступна для скачивания`);
    }
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      fileSize: this.fileSize,
      format: this.format,
      isDownloaded: this.isDownloaded,
      type: 'EBook'
    };
  }

  static fromJSON(data) {
    const book = new EBook(data.title, data.author, data.year, data.fileSize, data.format);
    Book.restoreId(book, data.id);
    book.isAvailable = data.isAvailable;
    book._rating = data.rating || 0;
    book.isDownloaded = data.isDownloaded || false;
    return book;
  }
}

// ============================================================
// 3. AudioBook — НАСЛЕДНИК BOOK
// ============================================================
class AudioBook extends Book {
  constructor(title, author, year, duration, narrator) {
    super(title, author, year);
    this.duration = duration;   // минуты
    this.narrator = narrator;
    this.currentTime = 0;
  }

  getInfo() {
    const baseInfo = super.getInfo();
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    const timeStr = hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
    return `${baseInfo} (Аудиокнига, ${timeStr}, чтец: ${this.narrator})`;
  }

  listen(minutes) {
    this.currentTime = Math.min(this.currentTime + minutes, this.duration);
    const remaining = this.duration - this.currentTime;
    console.log(`Прослушано ${this.currentTime} мин. Осталось: ${remaining} мин`);

    if (this.currentTime >= this.duration) {
      console.log(`Книга "${this.title}" прослушана полностью!`);
    }
    return this.currentTime;
  }

  // ----- Задание 2: skipTo(time) -----
  skipTo(time) {
    if (time < 0) time = 0;
    if (time > this.duration) time = this.duration;
    this.currentTime = time;
    console.log(`Переход к ${time} минуте`);
    return this.currentTime;
  }

  resetProgress() {
    this.currentTime = 0;
    console.log(`Прогресс по "${this.title}" сброшен`);
  }

  getProgressPercent() {
    if (this.duration === 0) return 0;
    return Math.round((this.currentTime / this.duration) * 100);
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      duration: this.duration,
      narrator: this.narrator,
      currentTime: this.currentTime,
      type: 'AudioBook'
    };
  }

  static fromJSON(data) {
    const book = new AudioBook(
      data.title,
      data.author,
      data.year,
      data.duration,
      data.narrator
    );
    Book.restoreId(book, data.id);
    book.isAvailable = data.isAvailable;
    book._rating = data.rating || 0;
    book.currentTime = data.currentTime || 0;
    return book;
  }
}

// ============================================================
// 4. EducationalBook — Задание 1
// ============================================================
class EducationalBook extends Book {
  constructor(title, author, year, subject, level = 'beginner') {
    super(title, author, year);
    this.subject = subject;
    this.level = level;
  }

  getInfo() {
    const baseInfo = super.getInfo();
    const levelMap = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый'
    };
    return `${baseInfo} (Учебник по ${this.subject}, ${levelMap[this.level] || this.level})`;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      subject: this.subject,
      level: this.level,
      type: 'EducationalBook'
    };
  }

  static fromJSON(data) {
    const book = new EducationalBook(
      data.title,
      data.author,
      data.year,
      data.subject,
      data.level
    );
    Book.restoreId(book, data.id);
    book.isAvailable = data.isAvailable;
    book._rating = data.rating || 0;
    return book;
  }
}

// ============================================================
// 5. LIBRARYMANAGER — РАСШИРЕННЫЙ
// ============================================================
class LibraryManager {
  constructor() {
    this.books = [];
  }

  addBook(title, author, year, genre) {
    if (!title || !author || !year) {
      throw new Error('Название, автор и год обязательны');
    }
    const book = new Book(title, author, year, genre);
    this.books.push(book);
    return book;
  }

  addEBook(title, author, year, fileSize, format) {
    if (!title || !author || !year) {
      throw new Error('Название, автор и год обязательны');
    }
    const book = new EBook(title, author, year, fileSize, format);
    this.books.push(book);
    return book;
  }

  addAudioBook(title, author, year, duration, narrator) {
    if (!title || !author || !year) {
      throw new Error('Название, автор и год обязательны');
    }
    const book = new AudioBook(title, author, year, duration, narrator);
    this.books.push(book);
    return book;
  }

  addEducationalBook(title, author, year, subject, level) {
    if (!title || !author || !year) {
      throw new Error('Название, автор и год обязательны');
    }
    const book = new EducationalBook(title, author, year, subject, level);
    this.books.push(book);
    return book;
  }

  removeBook(id) {
    this.books = this.books.filter(book => book.getId() !== id);
  }

  findBook(id) {
    return this.books.find(book => book.getId() === id);
  }

  findBooksByAuthor(author) {
    return this.books.filter(book =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  toggleBookAvailability(id) {
    const book = this.findBook(id);
    if (book) book.toggleAvailability();
    return book;
  }

  getAllBooks() {
    return this.books;
  }

  getStats() {
    const total = this.books.length;
    const available = this.books.filter(b => b.isAvailable).length;
    return { total, available, unavailable: total - available };
  }

  getBooksByGenre(genre) {
    return this.books.filter(book =>
      book.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  getBooksByYearRange(fromYear, toYear) {
    return this.books.filter(book =>
      book.year >= fromYear && book.year <= toYear
    );
  }

  getAverageRating() {
    if (this.books.length === 0) return 0;
    const sum = this.books.reduce((acc, book) => acc + book.rating, 0);
    return Number((sum / this.books.length).toFixed(2));
  }

  getEBooks() {
    return this.books.filter(book => book instanceof EBook);
  }

  getAudioBooks() {
    return this.books.filter(book => book instanceof AudioBook);
  }

  getEducationalBooks() {
    return this.books.filter(book => book instanceof EducationalBook);
  }

  getBooksGroupedByType() {
    const result = {
      books: [],
      eBooks: [],
      audioBooks: [],
      educationalBooks: []
    };
    this.books.forEach(book => {
      if (book instanceof EBook) {
        result.eBooks.push(book);
      } else if (book instanceof AudioBook) {
        result.audioBooks.push(book);
      } else if (book instanceof EducationalBook) {
        result.educationalBooks.push(book);
      } else {
        result.books.push(book);
      }
    });
    return result;
  }
}

// ============================================================
// 6. Collection — Задание 3
// ============================================================
class Collection {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    if (!(book instanceof Book)) {
      throw new Error('Можно добавлять только экземпляры Book и его наследников');
    }
    this.books.push(book);
  }

  getAllBooks() {
    return this.books;
  }

  getByType(type) {
    switch (type) {
      case 'ebook':
        return this.books.filter(b => b instanceof EBook);
      case 'audiobook':
        return this.books.filter(b => b instanceof AudioBook);
      case 'educational':
        return this.books.filter(b => b instanceof EducationalBook);
      case 'book':
        return this.books.filter(
          b =>
            !(b instanceof EBook) &&
            !(b instanceof AudioBook) &&
            !(b instanceof EducationalBook)
        );
      default:
        return [];
    }
  }
}

// ============================================================
// 7. ТЕСТИРОВАНИЕ
// ============================================================
const library = new LibraryManager();

console.log('=== ДОБАВЛЕНИЕ РАЗНЫХ ТИПОВ КНИГ ===');
const regularBook = library.addBook('Мастер и Маргарита', 'М. Булгаков', 1967, 'Роман');
const ebook       = library.addEBook('1984', 'Джордж Оруэлл', 1949, 2.5, 'EPUB');
const audiobook   = library.addAudioBook('Война и мир', 'Лев Толстой', 1869, 180, 'Алексей Иванов');
// Задание 1
const eduBook     = library.addEducationalBook(
  'Алгоритмы и структуры данных',
  'Н. Вирт',
  1976,
  'Информатика',
  'advanced'
);

console.log('Добавлены книги разных типов');

// ----- Полиморфизм -----
console.log('\n=== ПОЛИМОРФИЗМ: getInfo() у всех свой ===');
library.getAllBooks().forEach(book => {
  console.log(book.getInfo());
});

// ----- instanceof -----
console.log('\n=== ПРОВЕРКА ТИПОВ (instanceof) ===');
library.getAllBooks().forEach(book => {
  if (book instanceof EBook) {
    console.log(`${book.title} — электронная книга`);
  } else if (book instanceof AudioBook) {
    console.log(`${book.title} — аудиокнига`);
  } else if (book instanceof EducationalBook) {
    console.log(`${book.title} — учебник`);
  } else {
    console.log(`${book.title} — обычная книга`);
  }
});

// ----- Специфичные методы -----
console.log('\n=== СПЕЦИФИЧНЫЕ МЕТОДЫ ===');
const myEbook = library.getEBooks()[0];
if (myEbook) {
  myEbook.download();
  console.log(`Скачана: ${myEbook.isDownloaded}`);
}

const myAudio = library.getAudioBooks()[0];
if (myAudio) {
  console.log(`Прогресс до прослушивания: ${myAudio.getProgressPercent()}%`);
  myAudio.listen(45);
  console.log(`Прогресс после: ${myAudio.getProgressPercent()}%`);
  myAudio.listen(150);
}

// ----- Задание 2: skipTo -----
console.log('\n=== ЗАДАНИЕ 2: skipTo() ===');
if (myAudio) {
  myAudio.resetProgress();
  myAudio.skipTo(30);
  console.log(`Текущая позиция: ${myAudio.currentTime} мин (${myAudio.getProgressPercent()}%)`);
  myAudio.skipTo(999); // должно ограничиться длительностью
  console.log(`После skipTo(999): ${myAudio.currentTime} мин`);
}

// ----- Группировка -----
console.log('\n=== ГРУППИРОВКА ПО ТИПУ ===');
const grouped = library.getBooksGroupedByType();
console.log(`Обычных книг: ${grouped.books.length}`);
console.log(`Электронных: ${grouped.eBooks.length}`);
console.log(`Аудиокниг: ${grouped.audioBooks.length}`);
console.log(`Учебников: ${grouped.educationalBooks.length}`);

// ----- Задание 3: Collection -----
console.log('\n=== ЗАДАНИЕ 3: Collection ===');
const collection = new Collection();
library.getAllBooks().forEach(b => collection.addBook(b));

console.log('Все книги в коллекции:', collection.getAllBooks().length);
console.log('Электронные:', collection.getByType('ebook').map(b => b.title));
console.log('Аудиокниги:', collection.getByType('audiobook').map(b => b.title));
console.log('Учебники:', collection.getByType('educational').map(b => b.title));
console.log('Обычные:', collection.getByType('book').map(b => b.title));

// ----- Сериализация / десериализация -----
console.log('\n=== ПРОВЕРКА fromJSON ===');
const jsonEbook = JSON.stringify(ebook);
const restored = EBook.fromJSON(JSON.parse(jsonEbook));
console.log('Исходный ID:', ebook.getId());
console.log('Восстановленный ID:', restored.getId());
console.log('Совпадают:', ebook.getId() === restored.getId());
console.log('getInfo:', restored.getInfo());

// ============================================================
// 8. РЕНДЕРИНГ НА СТРАНИЦЕ
// ============================================================

function renderBooks() {
  const container = document.getElementById('booksContainer');
  const statsEl = document.getElementById('stats');
  if (!container || !statsEl) return;

  const books = library.getAllBooks();
  const stats = library.getStats();

  statsEl.innerHTML = `
    <strong>Статистика:</strong>
    всего книг: ${stats.total} ·
    доступно: <span class="available">${stats.available}</span> ·
    выдано: <span class="unavailable">${stats.unavailable}</span> ·
    средний рейтинг: <strong>${library.getAverageRating()}</strong>
  `;

  const levelMap = {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  };

  container.innerHTML = books
    .map(book => {
      const id = book.getId();
      let typeBadge = '';
      let extraInfo = '';
      let actions = '';

      if (book instanceof EBook) {
        typeBadge = '<span class="badge badge-ebook">Электронная</span>';
        extraInfo = `Формат: ${book.format}, ${book.fileSize} МБ`;
        if (book.isDownloaded) extraInfo += ' · ✔ Скачана';
        actions += `<button data-action="download" data-id="${id}">Скачать</button>`;
      } else if (book instanceof AudioBook) {
        typeBadge = '<span class="badge badge-audio">Аудиокнига</span>';
        const progress = book.getProgressPercent();
        extraInfo = `
          Длительность: ${book.duration} мин · чтец: ${book.narrator} · прогресс: ${progress}%
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        `;
        actions += `<button data-action="listen" data-id="${id}">Слушать 15 мин</button>`;
        actions += `<button data-action="skip" data-id="${id}">Перейти к 30 мин</button>`;
        actions += `<button data-action="reset" data-id="${id}">Сбросить прогресс</button>`;
      } else if (book instanceof EducationalBook) {
        typeBadge = '<span class="badge badge-edu">Учебник</span>';
        extraInfo = `Предмет: ${book.subject} · уровень: ${levelMap[book.level] || book.level}`;
      } else {
        typeBadge = '<span class="badge badge-book">Книга</span>';
      }

      actions += `<button data-action="toggle" data-id="${id}">
        ${book.isAvailable ? 'Выдать' : 'Вернуть'}
      </button>`;

      return `
        <div class="book-card">
          <div class="book-title">${book.title} ${typeBadge}</div>
          <div class="book-meta">${book.author} · ${book.year} · ${book.genre}</div>
          <div class="book-meta">${extraInfo}</div>
          <div class="book-meta">
            Статус:
            <span class="${book.isAvailable ? 'available' : 'unavailable'}">
              ${book.isAvailable ? '✔ Доступна' : '✖ Выдана'}
            </span>
            · Рейтинг: ${book.rating}
          </div>
          <div class="book-actions">${actions}</div>
        </div>
      `;
    })
    .join('');
}

// Делегирование событий
document.getElementById('booksContainer').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id; // строка
  const book = library.getAllBooks().find(b => String(b.getId()) === id);
  if (!book) return;

  switch (action) {
    case 'toggle':
      book.toggleAvailability();
      break;

    case 'download':
      if (book instanceof EBook) book.download();
      break;

    case 'listen':
      if (book instanceof AudioBook) book.listen(15);
      break;

    case 'skip':
      if (book instanceof AudioBook) book.skipTo(30);
      break;

    case 'reset':
      if (book instanceof AudioBook) book.resetProgress();
      break;
  }

  renderBooks();
});

// Первый рендер
renderBooks();