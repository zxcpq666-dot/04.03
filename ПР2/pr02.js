// =============================================
// ДАННЫЕ ДЛЯ РАБОТЫ
// =============================================
const DATA = {
    students: ["Мария", "Иван", "Петр", "Анна", "Елена"],
    numbers: [12, 7, 23, 45, 18, 31, 6, 42, 19, 8],
    names: ["Александр", "Оля", "Екатерина", "Петр"],
    duplicates: [1, 2, 2, 3, 4, 4, 5, 1, 6, 3]
};

// =============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================
function displayOutput(title, content, type = 'info') {
    const output = document.getElementById('output');
    if (!output) return;

    let color = '';
    if (type === 'success') color = 'success-text';
    else if (type === 'error') color = 'error-text';
    else if (type === 'highlight') color = 'highlight';

    output.className = 'output ' + color;
    output.innerHTML = `<strong>${title}</strong>\n\n${content}`;
}

function formatArray(arr) {
    return '[' + arr.join(', ') + ']';
}

// =============================================
// СОЗДАНИЕ ИНТЕРФЕЙСА
// =============================================
function createUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Вывод результатов -->
        <div class="section">
            <h2>Результаты</h2>
            <div class="output" id="output">Нажмите на кнопку задания, чтобы увидеть результат</div>
        </div>

        <!-- Задание 2.1 -->
        <div class="section">
            <h2>Задание 2.1: Создание и использование функций</h2>
            <div class="task">
                <h4>1. Функция сложения двух чисел</h4>
                <button onclick="taskSum()">Сумма 5 и 3</button>
            </div>
            <div class="task">
                <h4>2. Проверка возраста (boolean)</h4>
                <div class="flex">
                    <button onclick="taskIsAdult(20)">Возраст 20</button>
                    <button onclick="taskIsAdult(16)">Возраст 16</button>
                </div>
            </div>
            <div class="task">
                <h4>3. Функция с условной логикой (оценка)</h4>
                <div class="flex">
                    <input type="number" id="scoreInput" value="85" min="0" max="100" style="width:100px;">
                    <button onclick="taskGetGrade()">Получить оценку</button>
                </div>
            </div>
        </div>

        <!-- Задание 2.2 -->
        <div class="section">
            <h2>Задание 2.2: Работа с массивами</h2>
            <div class="task">
                <h4>1. Вывод всех студентов</h4>
                <button onclick="taskShowStudents()">Показать список</button>
            </div>
            <div class="task">
                <h4>2. Добавление и удаление</h4>
                <button onclick="taskAddRemove()">Добавить и удалить</button>
            </div>
            <div class="task">
                <h4>3. Поиск в массиве</h4>
                <div class="flex">
                    <input type="text" id="searchNameInput" value="Петр" placeholder="Имя...">
                    <button onclick="taskSearchStudent()">Найти</button>
                </div>
            </div>
            <div class="task">
                <h4>4. Индекс элемента</h4>
                <div class="flex">
                    <input type="text" id="indexNameInput" value="Анна" placeholder="Имя...">
                    <button onclick="taskIndexOf()">Найти индекс</button>
                </div>
            </div>
        </div>

        <!-- Задание 2.3 -->
        <div class="section">
            <h2>Задание 2.3: Функция для обработки массива</h2>
            <div class="task">
                <h4>Поиск самого длинного имени</h4>
                <button onclick="taskLongestName()">Найти самое длинное имя</button>
            </div>
        </div>

        <!-- Самостоятельные задания -->
        <div class="section">
            <h2>Задания для самостоятельного выполнения</h2>
            <div class="task">
                <h4>1. Калькулятор</h4>
                <div class="flex">
                    <input type="number" id="calcA" value="10" style="width:90px;">
                    <input type="number" id="calcB" value="5" style="width:90px;">
                    <button onclick="taskCalculator()">Вычислить</button>
                </div>
            </div>
            <div class="task">
                <h4>2. Среднее арифметическое</h4>
                <button onclick="taskAverage()">Среднее чисел массива</button>
            </div>
            <div class="task">
                <h4>3. Обратный порядок (без reverse)</h4>
                <button onclick="taskReverse()">Перевернуть массив</button>
            </div>
            <div class="task">
                <h4>4. Уникальные элементы</h4>
                <button onclick="taskUnique()">Удалить дубликаты</button>
            </div>
        </div>
    `;
}

// =============================================
// ЗАДАНИЕ 2.1: ФУНКЦИИ
// =============================================

// 1. Сложение двух чисел
function sum(a, b) {
    return a + b;
}

function taskSum() {
    const result = `Функция сложения:

function sum(a, b) {
    return a + b;
}

sum(5, 3) = ${sum(5, 3)}`;
    displayOutput('Сумма двух чисел', result, 'success');
}

// 2. Проверка возраста
function isAdult(age) {
    return age >= 18;
}

function taskIsAdult(age) {
    const result = `Функция проверки возраста:

function isAdult(age) {
    return age >= 18;
}

isAdult(${age}) = ${isAdult(age)}
Пользователь ${isAdult(age) ? 'совершеннолетний' : 'несовершеннолетний'}`;
    displayOutput('Проверка возраста', result, isAdult(age) ? 'success' : 'error');
}

// 3. Оценка по баллам
function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

function taskGetGrade() {
    const score = parseInt(document.getElementById('scoreInput').value);
    if (isNaN(score)) {
        displayOutput('Ошибка', 'Введите число', 'error');
        return;
    }
    const result = `Функция оценки:

function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

Балл: ${score}
Оценка: ${getGrade(score)}`;
    displayOutput('Оценка', result, 'success');
}

// =============================================
// ЗАДАНИЕ 2.2: РАБОТА С МАССИВАМИ
// =============================================

// 1. Вывод всех студентов
function taskShowStudents() {
    const students = DATA.students;
    let list = '';
    for (let student of students) {
        list += '- ' + student + '\n';
    }
    const result = `Список студентов:

${list}
Всего студентов: ${students.length}`;
    displayOutput('Список студентов', result);
}

// 2. Добавление и удаление
function taskAddRemove() {
    let students = [...DATA.students];
    const before = formatArray(students);

    students.push("Дмитрий");
    const afterAdd = formatArray(students);

    const removed = students.pop();
    const afterRemove = formatArray(students);

    const result = `Добавление и удаление:

Исходный массив:
${before}

После push("Дмитрий"):
${afterAdd}

После pop() — удалён "${removed}":
${afterRemove}`;
    displayOutput('Добавление и удаление', result);
}

// 3. Поиск в массиве
function taskSearchStudent() {
    const students = DATA.students;
    const searchName = document.getElementById('searchNameInput').value.trim();

    let result;
    let type;
    if (students.includes(searchName)) {
        result = `Поиск в массиве:

students.includes("${searchName}") = true

"${searchName}" есть в списке!`;
        type = 'success';
    } else {
        result = `Поиск в массиве:

students.includes("${searchName}") = false

"${searchName}" не найден.`;
        type = 'error';
    }
    displayOutput('Поиск студента', result, type);
}

// 4. Индекс элемента
function taskIndexOf() {
    const students = DATA.students;
    const name = document.getElementById('indexNameInput').value.trim();
    const index = students.indexOf(name);

    let result = `Индекс элемента:

students = ${formatArray(students)}
students.indexOf("${name}") = ${index}

${index === -1 ? `"${name}" не найден в массиве` : `"${name}" находится на позиции ${index}`}`;
    displayOutput('Индекс элемента', result, index === -1 ? 'error' : 'success');
}

// =============================================
// ЗАДАНИЕ 2.3: ФУНКЦИЯ ДЛЯ ОБРАБОТКИ МАССИВА
// =============================================

function findLongestName(names) {
    if (names.length === 0) {
        return null;
    }
    let longest = names[0];
    for (let name of names) {
        if (name.length > longest.length) {
            longest = name;
        }
    }
    return longest;
}

function taskLongestName() {
    const names = DATA.names;
    const longestName = findLongestName(names);

    const result = `Поиск самого длинного имени:

function findLongestName(names) {
    if (names.length === 0) return null;
    let longest = names[0];
    for (let name of names) {
        if (name.length > longest.length) {
            longest = name;
        }
    }
    return longest;
}

Массив: ${formatArray(names)}
Самое длинное имя: "${longestName}"
Длина: ${longestName.length}`;
    displayOutput('Самое длинное имя', result, 'success');
}

// =============================================
// САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ
// =============================================

// --- 1. Калькулятор ---

function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
    if (b === 0) return "На ноль делить нельзя!";
    return a / b;
}

function taskCalculator() {
    const a = parseFloat(document.getElementById('calcA').value);
    const b = parseFloat(document.getElementById('calcB').value);

    if (isNaN(a) || isNaN(b)) {
        displayOutput('Ошибка', 'Введите два числа', 'error');
        return;
    }

    const result = `Калькулятор:

function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b)   { ... }

Числа: ${a} и ${b}

Сложение:  ${a} + ${b} = ${add(a, b)}
Вычитание: ${a} - ${b} = ${subtract(a, b)}
Умножение: ${a} × ${b} = ${multiply(a, b)}
Деление:   ${a} ÷ ${b} = ${divide(a, b)}`;
    displayOutput('Калькулятор', result, 'success');
}

// --- 2. Среднее арифметическое ---

function getAverage(arr) {
    if (arr.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum / arr.length;
}

function taskAverage() {
    const numbers = DATA.numbers;
    const avg = getAverage(numbers);

    const result = `Среднее арифметическое:

function getAverage(arr) {
    if (arr.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum / arr.length;
}

Массив: ${formatArray(numbers)}
Сумма: ${numbers.reduce((s, n) => s + n, 0)}
Среднее: ${avg.toFixed(2)}`;
    displayOutput('Среднее арифметическое', result, 'success');
}

// --- 3. Обратный порядок (без reverse) ---

function reverseArray(arr) {
    let result = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}

function taskReverse() {
    const numbers = DATA.numbers;
    const reversed = reverseArray(numbers);

    const result = `Обратный порядок (без reverse()):

function reverseArray(arr) {
    let result = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}

Исходный:  ${formatArray(numbers)}
Обратный:  ${formatArray(reversed)}`;
    displayOutput('Обратный порядок', result, 'success');
}

// --- 4. Уникальные элементы ---

function getUnique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (!result.includes(arr[i])) {
            result.push(arr[i]);
        }
    }
    return result;
}

function taskUnique() {
    const duplicates = DATA.duplicates;
    const unique = getUnique(duplicates);

    const result = `Уникальные элементы:

function getUnique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (!result.includes(arr[i])) {
            result.push(arr[i]);
        }
    }
    return result;
}

Исходный массив:  ${formatArray(duplicates)}
Уникальные:       ${formatArray(unique)}
Было элементов:   ${duplicates.length}
Стало элементов:  ${unique.length}`;
    displayOutput('Уникальные элементы', result, 'success');
}

// =============================================
// ИНИЦИАЛИЗАЦИЯ
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    createUI();
    console.log('ПР №2 «Функции и работа с массивами» загружена!');
    console.log('Данные:', DATA);
});