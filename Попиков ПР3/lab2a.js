// =====================================================
// ИСХОДНЫЕ ДАННЫЕ
// =====================================================
const INITIAL_DATA = {
  numbers: [12, 7, 23, 45, 18, 31, 6, 42, 19, 8],
  fruits: ["яблоко", "банан", "апельсин", "груша", "киви", "манго", "ананас"],
  students: [
    { id: 1, name: "Алексей",   age: 20, group: "ИС-201", grade: 85 },
    { id: 2, name: "Мария",     age: 19, group: "ИС-202", grade: 92 },
    { id: 3, name: "Иван",      age: 21, group: "ИС-201", grade: 78 },
    { id: 4, name: "Екатерина", age: 20, group: "ИС-203", grade: 95 },
    { id: 5, name: "Дмитрий",   age: 22, group: "ИС-201", grade: 67 },
    { id: 6, name: "Анна",      age: 19, group: "ИС-202", grade: 88 }
  ],
  matrix: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
};

// =====================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (глубокие копии исходных данных)
// =====================================================
let numbers  = [...INITIAL_DATA.numbers];
let fruits   = [...INITIAL_DATA.fruits];
let students = INITIAL_DATA.students.map(s => ({ ...s }));
let matrix   = INITIAL_DATA.matrix.map(row => [...row]);

// =====================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================
function displayData(title, data) {
  const output = document.getElementById('output');
  let text = `▶ ${title}\n\n`;

  if (typeof data === 'string') {
    text += data;
  } else if (Array.isArray(data)) {
    if (data.length === 0) {
      text += 'Массив пуст []';
    } else if (typeof data[0] === 'object' && data[0] !== null) {
      text += JSON.stringify(data, null, 2);
    } else {
      text += `[${data.join(', ')}]`;
    }
  } else {
    text += JSON.stringify(data, null, 2);
  }
  output.textContent = text;
}

function updateDataDisplay() {
  document.getElementById('numbersDisplay').textContent  = numbers.join(', ');
  document.getElementById('fruitsDisplay').textContent   = fruits.join(', ');
  document.getElementById('studentsDisplay').textContent = `Всего: ${students.length} студентов`;
  document.getElementById('studentsCount').textContent   = students.length;
  document.getElementById('studentsList').textContent    = students.map(s => s.name).join(', ');
}

function resetData() {
  numbers  = [...INITIAL_DATA.numbers];
  fruits   = [...INITIAL_DATA.fruits];
  students = INITIAL_DATA.students.map(s => ({ ...s }));
  matrix   = INITIAL_DATA.matrix.map(row => [...row]);
  updateDataDisplay();
  document.getElementById('output').textContent = 'Данные сброшены к исходному состоянию';
}

// =====================================================
// СОЗДАНИЕ ИНТЕРФЕЙСА
// =====================================================
function createUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Текущие данные -->
    <div class="section">
      <h2>Текущие данные</h2>
      <div class="data-display">
        <p><strong>Числа:</strong> <span id="numbersDisplay"></span></p>
        <p><strong>Фрукты:</strong> <span id="fruitsDisplay"></span></p>
        <p><strong>Студенты:</strong> <span id="studentsDisplay"></span>
           <span class="badge" id="studentsCount">0</span></p>
        <p><strong>Имена студентов:</strong> <span id="studentsList"></span></p>
      </div>
      <div style="margin-top:10px;">
        <button class="danger" onclick="resetData()">⟳ Сбросить данные</button>
      </div>
    </div>

    <!-- Вывод результатов -->
    <div class="section">
      <h2>Результаты операций</h2>
      <div class="output" id="output">Нажмите на кнопку задания для вывода результата</div>
    </div>

    <!-- Задание 1 -->
    <div class="section">
      <h2>Задание 1: Базовые операции с массивами</h2>

      <div class="task">
        <h4>1.1 Добавление и удаление элементов</h4>
        <div class="flex">
          <input type="text" id="newNumberInput" placeholder="Число..." style="width:100px;">
          <button onclick="addNumber()">Добавить в конец</button>
          <button onclick="addNumberFront()">Добавить в начало</button>
          <button class="danger" onclick="removeLastNumber()">Удалить последний</button>
          <button class="danger" onclick="removeFirstNumber()">Удалить первый</button>
        </div>
      </div>

      <div class="task">
        <h4>1.2 Удаление и вставка по индексу</h4>
        <div class="flex">
          <input type="number" id="removeIndexInput" placeholder="Индекс..." style="width:100px;" min="0">
          <button class="danger" onclick="removeAtIndex()">Удалить по индексу</button>
          <button onclick="insertAtIndex()">Вставить на позицию</button>
        </div>
      </div>
    </div>

    <!-- Задание 2 -->
    <div class="section">
      <h2>Задание 2: Функциональные методы (map, filter, reduce)</h2>

      <div class="task">
        <h4>2.1 Преобразование (map)</h4>
        <button onclick="doubleNumbers()">Удвоить числа</button>
        <button onclick="fruitsToUpper()">Фрукты заглавными</button>
      </div>

      <div class="task">
        <h4>2.2 Фильтрация (filter)</h4>
        <button onclick="filterEven()">Только четные</button>
        <button onclick="filterGreaterThan20()">Числа &gt; 20</button>
        <button onclick="filterStudentsByGrade()">Студенты с оценкой &gt;= 80</button>
      </div>

      <div class="task">
        <h4>2.3 Поиск (find)</h4>
        <div class="flex">
          <input type="number" id="findNumberInput" placeholder="Число..." style="width:100px;">
          <button onclick="findNumber()">Найти число</button>
          <input type="text" id="findStudentInput" placeholder="Имя студента..." style="width:150px;">
          <button onclick="findStudent()">Найти студента</button>
        </div>
      </div>

      <div class="task">
        <h4>2.4 Агрегация (reduce)</h4>
        <button onclick="sumNumbers()">Сумма всех чисел</button>
        <button onclick="avgStudentsAge()">Средний возраст студентов</button>
        <button onclick="maxNumber()">Максимальное число</button>
      </div>
    </div>

    <!-- Задание 3 -->
    <div class="section">
      <h2>Задание 3: Проверка и сортировка</h2>

      <div class="task">
        <h4>3.1 Проверка (some, every, includes)</h4>
        <button onclick="checkEvenExists()">Есть ли четные?</button>
        <button onclick="checkAllEven()">Все ли четные?</button>
        <div class="flex">
          <input type="text" id="includesInput" placeholder="Элемент..." style="width:150px;">
          <button onclick="checkIncludes()">Содержит ли массив?</button>
        </div>
      </div>

      <div class="task">
        <h4>3.2 Сортировка (sort)</h4>
        <button onclick="sortNumbersAsc()">Сортировать по возрастанию</button>
        <button onclick="sortNumbersDesc()">Сортировать по убыванию</button>
        <button onclick="sortStudentsByGrade()">Сортировать студентов по оценке</button>
        <button onclick="reverseArray()">Развернуть массив</button>
      </div>
    </div>

    <!-- Задание 4 -->
    <div class="section">
      <h2>Задание 4: Матрицы и сложные операции</h2>

      <div class="task">
        <h4>4.1 Операции с матрицей</h4>
        <button onclick="sumMatrix()">Сумма всех элементов матрицы</button>
        <button onclick="transposeMatrix()">Транспонировать матрицу</button>
        <button onclick="flattenMatrix()">Развернуть в плоский массив</button>
      </div>

      <div class="task">
        <h4>4.2 Группировка и статистика</h4>
        <button onclick="groupStudentsByGroup()">Группировка студентов по группе</button>
        <button onclick="statsByGroup()">Статистика по группам</button>
      </div>
    </div>

    <!-- Задание 5 -->
    <div class="section">
      <h2>Задание 5: Комбинированные задачи</h2>
      <div class="task">
        <h4>5.1 Сложные запросы</h4>
        <button onclick="getTopStudents()">Top-3 студентов по оценке</button>
        <button onclick="getUniqueAges()">Уникальные возрасты</button>
        <button onclick="averageGradeByGroup()">Средняя оценка по группам</button>
      </div>
    </div>

    <!-- Самостоятельные задания -->
    <div class="section">
      <h2>Задания для самостоятельного выполнения</h2>

      <div class="task">
        <h4>Работа с числами</h4>
        <button onclick="getPrimes()">Простые числа</button>
        <button onclick="getSquares()">Квадраты чисел</button>
        <button onclick="getProduct()">Произведение всех чисел</button>
      </div>

      <div class="task">
        <h4>Работа со строками</h4>
        <button onclick="getLongestWord()">Самое длинное слово</button>
        <button onclick="getShortestWord()">Самое короткое слово</button>
        <button onclick="countWordsByLength()">Слова по длине</button>
      </div>

      <div class="task">
        <h4>Работа с объектами</h4>
        <div class="flex">
          <input type="text" id="groupFindInput" placeholder="ИС-201" style="width:120px;">
          <button onclick="findByGroup()">Найти по группе</button>
        </div>
        <div class="flex" style="margin-top:8px;">
          <input type="number" id="updateIdInput" placeholder="id" style="width:70px;">
          <input type="number" id="updateGradeInput" placeholder="оценка" style="width:90px;">
          <button class="success" onclick="updateStudent()">Обновить оценку</button>
        </div>
        <div class="flex" style="margin-top:8px;">
          <input type="number" id="deleteIdInput" placeholder="id" style="width:70px;">
          <button class="danger" onclick="deleteStudent()">Удалить студента</button>
        </div>
      </div>

      <div class="task">
        <h4>Комбинированные задачи</h4>
        <button onclick="getTopStudentInGroup()">Лучший в каждой группе</button>
        <button onclick="getAgeDistribution()">Распределение по возрасту</button>
        <div class="flex" style="margin-top:8px;">
          <input type="number" id="thresholdInput" placeholder="Порог" style="width:90px;" value="80">
          <button onclick="getPassingStudents()">Студенты выше порога</button>
        </div>
      </div>
    </div>
  `;

  updateDataDisplay();
}

// =====================================================
// ЗАДАНИЕ 1: БАЗОВЫЕ ОПЕРАЦИИ
// =====================================================
function addNumber() {
  const input = document.getElementById('newNumberInput');
  const value = parseInt(input.value);
  if (isNaN(value)) { displayData('Ошибка', 'Пожалуйста, введите число'); return; }
  numbers.push(value);
  input.value = '';
  updateDataDisplay();
  displayData('Добавление элемента (push)',
    `Добавлено число ${value} в конец массива\n\nТекущий массив: [${numbers.join(', ')}]`);
}

function addNumberFront() {
  const input = document.getElementById('newNumberInput');
  const value = parseInt(input.value);
  if (isNaN(value)) { displayData('Ошибка', 'Пожалуйста, введите число'); return; }
  numbers.unshift(value);
  input.value = '';
  updateDataDisplay();
  displayData('Добавление элемента (unshift)',
    `Добавлено число ${value} в начало массива\n\nТекущий массив: [${numbers.join(', ')}]`);
}

function removeLastNumber() {
  if (numbers.length === 0) { displayData('Ошибка', 'Массив пуст!'); return; }
  const removed = numbers.pop();
  updateDataDisplay();
  displayData('Удаление элемента (pop)',
    `Удален последний элемент: ${removed}\n\nТекущий массив: [${numbers.join(', ')}]`);
}

function removeFirstNumber() {
  if (numbers.length === 0) { displayData('Ошибка', 'Массив пуст!'); return; }
  const removed = numbers.shift();
  updateDataDisplay();
  displayData('Удаление элемента (shift)',
    `Удален первый элемент: ${removed}\n\nТекущий массив: [${numbers.join(', ')}]`);
}

function removeAtIndex() {
  const input = document.getElementById('removeIndexInput');
  const index = parseInt(input.value);
  if (isNaN(index) || index < 0 || index >= numbers.length) {
    displayData('Ошибка', `Некорректный индекс. Доступны от 0 до ${numbers.length - 1}`);
    return;
  }
  const removed = numbers.splice(index, 1)[0];
  input.value = '';
  updateDataDisplay();
  displayData('Удаление по индексу (splice)',
    `Удален элемент по индексу ${index}: ${removed}\n\nТекущий массив: [${numbers.join(', ')}]`);
}

function insertAtIndex() {
  const indexInput = document.getElementById('removeIndexInput');
  const valueInput = document.getElementById('newNumberInput');
  const index = parseInt(indexInput.value);
  const value = parseInt(valueInput.value);

  if (isNaN(index) || index < 0 || index > numbers.length) {
    displayData('Ошибка', `Некорректный индекс. Доступны от 0 до ${numbers.length}`);
    return;
  }
  if (isNaN(value)) { displayData('Ошибка', 'Пожалуйста, введите число'); return; }

  numbers.splice(index, 0, value);
  indexInput.value = '';
  valueInput.value = '';
  updateDataDisplay();
  displayData('Вставка элемента (splice)',
    `Вставлено число ${value} по индексу ${index}\n\nТекущий массив: [${numbers.join(', ')}]`);
}

// =====================================================
// ЗАДАНИЕ 2: ФУНКЦИОНАЛЬНЫЕ МЕТОДЫ
// =====================================================
function doubleNumbers() {
  const doubled = numbers.map(n => n * 2);
  displayData('Удвоение чисел (map)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Результат:       [${doubled.join(', ')}]\n\n` +
    `✔ Исходный массив не изменён`);
}

function fruitsToUpper() {
  const upper = fruits.map(f => f.toUpperCase());
  displayData('Фрукты заглавными (map)',
    `Исходный массив: [${fruits.join(', ')}]\n\n` +
    `Результат:       [${upper.join(', ')}]`);
}

function filterEven() {
  const evens = numbers.filter(n => n % 2 === 0);
  displayData('Только чётные числа (filter)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Чётные:          [${evens.join(', ')}]\n` +
    `Количество:      ${evens.length}`);
}

function filterGreaterThan20() {
  const filtered = numbers.filter(n => n > 20);
  displayData('Фильтрация: числа > 20 (filter)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Числа > 20:      [${filtered.join(', ')}]\n` +
    `Количество:      ${filtered.length}`);
}

function filterStudentsByGrade() {
  const top = students.filter(s => s.grade >= 80);
  displayData('Студенты с оценкой >= 80 (filter)',
    `Всего студентов: ${students.length}\n` +
    `Прошли фильтр:   ${top.length}\n\n` +
    top.map(s => `• ${s.name} — ${s.grade} (гр. ${s.group})`).join('\n'));
}

function findNumber() {
  const input = document.getElementById('findNumberInput');
  const value = parseInt(input.value);
  if (isNaN(value)) { displayData('Ошибка', 'Введите число'); return; }

  const index = numbers.indexOf(value);
  if (index !== -1) {
    displayData('Поиск числа (indexOf)',
      `Число ${value} найдено!\n` +
      `Индекс: ${index}\n\n` +
      `Массив: [${numbers.join(', ')}]`);
  } else {
    displayData('Поиск числа (indexOf)',
      `Число ${value} НЕ найдено\n\n` +
      `Массив: [${numbers.join(', ')}]`);
  }
}

function findStudent() {
  const input = document.getElementById('findStudentInput');
  const name = input.value.trim();
  if (!name) { displayData('Ошибка', 'Введите имя студента'); return; }

  const student = students.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (student) {
    displayData('Поиск студента (find)',
      `Студент найден:\n${JSON.stringify(student, null, 2)}`);
  } else {
    displayData('Поиск студента (find)',
      `Студент "${name}" не найден\n\n` +
      `Доступные имена: ${students.map(s => s.name).join(', ')}`);
  }
}

function sumNumbers() {
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  displayData('Сумма чисел (reduce)',
    `Массив:            [${numbers.join(', ')}]\n\n` +
    `Сумма:             ${sum}\n` +
    `Количество:        ${numbers.length}\n` +
    `Среднее значение:  ${(sum / numbers.length).toFixed(2)}`);
}

function avgStudentsAge() {
  const avg = students.reduce((sum, s) => sum + s.age, 0) / students.length;
  displayData('Средний возраст студентов (reduce)',
    `Возрасты: ${students.map(s => `${s.name}(${s.age})`).join(', ')}\n\n` +
    `Средний возраст: ${avg.toFixed(1)} лет\n` +
    `Всего студентов: ${students.length}`);
}

function maxNumber() {
  if (numbers.length === 0) { displayData('Ошибка', 'Массив пуст!'); return; }
  const max = numbers.reduce((m, n) => n > m ? n : m, numbers[0]);
  const index = numbers.indexOf(max);
  displayData('Максимальное число (reduce)',
    `Массив: [${numbers.join(', ')}]\n\n` +
    `Максимум: ${max}\n` +
    `Индекс:   ${index}`);
}

// =====================================================
// ЗАДАНИЕ 3: ПРОВЕРКА И СОРТИРОВКА
// =====================================================
function checkEvenExists() {
  const hasEven = numbers.some(n => n % 2 === 0);
  displayData('Проверка на наличие чётных (some)',
    `Массив: [${numbers.join(', ')}]\n\n` +
    `${hasEven ? '✔ Есть' : '✘ Нет'} чётных чисел в массиве`);
}

function checkAllEven() {
  const allEven = numbers.every(n => n % 2 === 0);
  displayData('Проверка, все ли числа чётные (every)',
    `Массив: [${numbers.join(', ')}]\n\n` +
    `${allEven ? '✔ Все' : '✘ Не все'} числа являются чётными`);
}

function checkIncludes() {
  const input = document.getElementById('includesInput');
  const value = input.value.trim();
  if (!value) { displayData('Ошибка', 'Введите элемент для поиска'); return; }

  const numValue = parseInt(value);
  let found = false, where = '';

  if (!isNaN(numValue) && numbers.includes(numValue)) {
    found = true;
    where = `в массиве чисел (индекс ${numbers.indexOf(numValue)})`;
  }
  if (!found && fruits.includes(value)) {
    found = true;
    where = `в массиве фруктов (индекс ${fruits.indexOf(value)})`;
  }

  displayData('Проверка наличия элемента (includes)',
    `Ищем: "${value}"\n\n` +
    `${found ? '✔ Элемент найден' : '✘ Элемент не найден'}${found ? ' ' + where : ''}\n\n` +
    `Числа:  [${numbers.join(', ')}]\n` +
    `Фрукты: [${fruits.join(', ')}]`);
}

function sortNumbersAsc() {
  const sorted = [...numbers].sort((a, b) => a - b);
  displayData('Сортировка по возрастанию (sort)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Отсортировано:   [${sorted.join(', ')}]\n\n` +
    `✔ Исходный массив не изменён`);
}

function sortNumbersDesc() {
  const sorted = [...numbers].sort((a, b) => b - a);
  displayData('Сортировка по убыванию (sort)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Отсортировано:   [${sorted.join(', ')}]\n\n` +
    `✔ Исходный массив не изменён`);
}

function sortStudentsByGrade() {
  const sorted = [...students].sort((a, b) => b.grade - a.grade);
  displayData('Сортировка студентов по оценке (sort)',
    `Студенты в порядке убывания оценки:\n\n` +
    sorted.map((s, i) => `${i + 1}. ${s.name} — ${s.grade} б. (гр. ${s.group})`).join('\n'));
}

function reverseArray() {
  const reversed = [...numbers].reverse();
  displayData('Разворот массива (reverse)',
    `Исходный массив:   [${numbers.join(', ')}]\n\n` +
    `Развёрнутый:       [${reversed.join(', ')}]\n\n` +
    `✔ Исходный массив не изменён`);
}

// =====================================================
// ЗАДАНИЕ 4: МАТРИЦЫ И СЛОЖНЫЕ ОПЕРАЦИИ
// =====================================================
function matrixToString(m) {
  return m.map(row => `[${row.join(', ')}]`).join('\n');
}

function sumMatrix() {
  let sum = 0;
  for (const row of matrix) for (const num of row) sum += num;
  displayData('Сумма всех элементов матрицы',
    `Матрица:\n${matrixToString(matrix)}\n\n` +
    `Сумма всех элементов: ${sum}\n` +
    `Количество элементов: ${matrix.length * matrix[0].length}`);
}

function transposeMatrix() {
  const rows = matrix.length, cols = matrix[0].length;
  const transposed = [];
  for (let j = 0; j < cols; j++) {
    transposed[j] = [];
    for (let i = 0; i < rows; i++) transposed[j][i] = matrix[i][j];
  }
  displayData('Транспонирование матрицы',
    `Исходная:\n${matrixToString(matrix)}\n\n` +
    `Транспонированная:\n${matrixToString(transposed)}`);
}

function flattenMatrix() {
  const flat = matrix.flat();
  displayData('Развёртывание в плоский массив (flat)',
    `Матрица:\n${matrixToString(matrix)}\n\n` +
    `Плоский массив:\n[${flat.join(', ')}]\n\n` +
    `Длина: ${flat.length}`);
}

function groupStudentsByGroup() {
  const groups = students.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s.name);
    return acc;
  }, {});
  displayData('Группировка студентов по группам',
    Object.entries(groups)
      .map(([g, names]) => `${g}: ${names.length} чел. — ${names.join(', ')}`)
      .join('\n'));
}

function statsByGroup() {
  const stats = students.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = { count: 0, sum: 0, grades: [] };
    acc[s.group].count++;
    acc[s.group].sum += s.grade;
    acc[s.group].grades.push(s.grade);
    return acc;
  }, {});

  let result = '';
  for (const [group, d] of Object.entries(stats)) {
    const avg = (d.sum / d.count).toFixed(1);
    const min = Math.min(...d.grades);
    const max = Math.max(...d.grades);
    result += `${group}:\n`;
    result += `  Студентов:      ${d.count}\n`;
    result += `  Средняя оценка: ${avg}\n`;
    result += `  Min: ${min}, Max: ${max}\n\n`;
  }
  displayData('Статистика по группам', result.trimEnd());
}

// =====================================================
// ЗАДАНИЕ 5: КОМБИНИРОВАННЫЕ ЗАДАЧИ
// =====================================================
function getTopStudents() {
  const top = [...students].sort((a, b) => b.grade - a.grade).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  displayData('Топ-3 студента по оценке',
    'Лучшие студенты:\n\n' +
    top.map((s, i) => `${medals[i]} ${s.name} — ${s.grade} б. (гр. ${s.group})`).join('\n'));
}

function getUniqueAges() {
  const ages = [...new Set(students.map(s => s.age))].sort((a, b) => a - b);
  displayData('Уникальные возрасты',
    `Все студенты:\n${students.map(s => `${s.name} (${s.age})`).join('\n')}\n\n` +
    `Уникальные возрасты: ${ages.join(', ')}\n` +
    `Всего различных: ${ages.length}`);
}

function averageGradeByGroup() {
  const groups = students.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s.grade);
    return acc;
  }, {});

  let result = '';
  for (const [group, grades] of Object.entries(groups)) {
    const avg = grades.reduce((s, g) => s + g, 0) / grades.length;
    result += `${group}: ${avg.toFixed(1)} б. (${grades.length} студ.)\n`;
    result += `  Оценки: ${grades.join(', ')}\n\n`;
  }
  displayData('Средняя оценка по группам', result.trimEnd());
}

// =====================================================
// САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ
// =====================================================

// --- Работа с числами ---
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function getPrimes() {
  const primes = numbers.filter(isPrime);
  displayData('Простые числа (filter)',
    `Исходный массив: [${numbers.join(', ')}]\n\n` +
    `Простые числа:   [${primes.join(', ')}]\n` +
    `Количество:      ${primes.length}`);
}

function getSquares() {
  const squares = numbers.map(n => n * n);
  displayData('Квадраты чисел (map)',
    `Исходный:  [${numbers.join(', ')}]\n` +
    `Квадраты:  [${squares.join(', ')}]`);
}

function getProduct() {
  const product = numbers.reduce((p, n) => p * n, 1);
  displayData('Произведение всех чисел (reduce)',
    `Массив: [${numbers.join(', ')}]\n\n` +
    `Произведение: ${product}`);
}

// --- Работа со строками ---
function getLongestWord() {
  if (fruits.length === 0) { displayData('Ошибка', 'Массив пуст'); return; }
  const longest = fruits.reduce((a, b) => b.length > a.length ? b : a);
  displayData('Самое длинное слово',
    `Массив: [${fruits.join(', ')}]\n\n` +
    `Самое длинное: "${longest}" (${longest.length} символов)`);
}

function getShortestWord() {
  if (fruits.length === 0) { displayData('Ошибка', 'Массив пуст'); return; }
  const shortest = fruits.reduce((a, b) => b.length < a.length ? b : a);
  displayData('Самое короткое слово',
    `Массив: [${fruits.join(', ')}]\n\n` +
    `Самое короткое: "${shortest}" (${shortest.length} символов)`);
}

function countWordsByLength() {
  const grouped = fruits.reduce((acc, word) => {
    const len = word.length;
    (acc[len] ||= []).push(word);
    return acc;
  }, {});

  const result = Object.keys(grouped)
    .sort((a, b) => a - b)
    .map(len => `${len} символов: ${grouped[len].join(', ')}`)
    .join('\n');

  displayData('Группировка слов по длине', result);
}

// --- Работа с объектами ---
function findByGroup() {
  const input = document.getElementById('groupFindInput');
  const group = input.value.trim();
  if (!group) { displayData('Ошибка', 'Введите название группы'); return; }

  const found = students.filter(s => s.group.toLowerCase() === group.toLowerCase());
  if (found.length === 0) {
    displayData('Поиск по группе',
      `Студентов в группе "${group}" не найдено\n\n` +
      `Доступные группы: ${[...new Set(students.map(s => s.group))].join(', ')}`);
    return;
  }
  displayData(`Студенты группы ${group}`,
    found.map(s => `• ${s.name} (${s.age} лет, оценка: ${s.grade})`).join('\n'));
}

function updateStudent() {
  const id = parseInt(document.getElementById('updateIdInput').value);
  const grade = parseInt(document.getElementById('updateGradeInput').value);
  if (isNaN(id) || isNaN(grade)) { displayData('Ошибка', 'Введите id и оценку'); return; }

  const student = students.find(s => s.id === id);
  if (!student) { displayData('Ошибка', `Студент с id=${id} не найден`); return; }

  const oldGrade = student.grade;
  student.grade = grade;
  updateDataDisplay();
  displayData('Обновление данных студента',
    `Студент: ${student.name}\n` +
    `Старая оценка: ${oldGrade}\n` +
    `Новая оценка:  ${grade}`);
}

function deleteStudent() {
  const id = parseInt(document.getElementById('deleteIdInput').value);
  if (isNaN(id)) { displayData('Ошибка', 'Введите id'); return; }

  const index = students.findIndex(s => s.id === id);
  if (index === -1) { displayData('Ошибка', `Студент с id=${id} не найден`); return; }

  const [removed] = students.splice(index, 1);
  updateDataDisplay();
  displayData('Удаление студента (splice)',
    `Удалён: ${removed.name} (id=${id})\n\n` +
    `Осталось студентов: ${students.length}`);
}

// --- Комбинированные ---
function getTopStudentInGroup() {
  const groups = students.reduce((acc, s) => {
    if (!acc[s.group] || s.grade > acc[s.group].grade) acc[s.group] = s;
    return acc;
  }, {});

  displayData('Лучший студент в каждой группе',
    Object.entries(groups)
      .map(([g, s]) => `${g}: ${s.name} — ${s.grade} б.`)
      .join('\n'));
}

function getAgeDistribution() {
  const dist = students.reduce((acc, s) => {
    acc[s.age] = (acc[s.age] || 0) + 1;
    return acc;
  }, {});

  displayData('Распределение студентов по возрасту',
    Object.entries(dist)
      .sort((a, b) => a[0] - b[0])
      .map(([age, count]) => `${age} лет: ${count} чел. ${'█'.repeat(count)}`)
      .join('\n'));
}

function getPassingStudents() {
  const threshold = parseInt(document.getElementById('thresholdInput').value);
  if (isNaN(threshold)) { displayData('Ошибка', 'Введите порог'); return; }

  const passed = students.filter(s => s.grade > threshold);
  displayData(`Студенты с оценкой выше ${threshold}`,
    passed.length === 0
      ? 'Нет таких студентов'
      : passed.map(s => `• ${s.name} — ${s.grade} б. (гр. ${s.group})`).join('\n') +
        `\n\nВсего: ${passed.length} из ${students.length}`);
}

// =====================================================
// ИНИЦИАЛИЗАЦИЯ
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  createUI();
  console.log('Лабораторная работа 2а загружена!');
  console.log('Доступные данные:', { numbers, fruits, students, matrix });
});