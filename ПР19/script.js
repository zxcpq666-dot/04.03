// ============================================
// 1. ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM
// ============================================
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const langBtn = document.getElementById('lang-btn');

// ============================================
// 2. ЛОГИКА БОТА (ЗАДАНИЯ 1, 2, 4, 7)
// ============================================
let currentLang = 'ru';
let messageCount = 0; // ЗАДАНИЕ 3: Счетчик сообщений

const botResponses = {
    ru: {
        'привет': ['Привет! Как у тебя дела? 😊', 'Здравствуй! Рад тебя видеть! 😊'],
        'как дела': ['У меня всё отлично! А у тебя? 😊', 'Прекрасно! Спасибо, что спросил! 😊'],
        
        // ЗАДАНИЕ 4: Обработка нескольких слов
        'как тебя зовут': ['Меня зовут Бот-помощник! 😊', 'Я твой виртуальный друг! Называй меня просто Бот! 😊'],
        // ЗАДАНИЕ 1: Новая команда (имя)
        'имя': ['Меня зовут Бот! А тебя? 😊', 'Я безымянный бот! Можешь придумать мне имя! 😊'],
        // ЗАДАНИЕ 1: Новая команда (возраст)
        'возраст': ['Я создан недавно, так что мне пара дней! 😊', 'Мой возраст — тайна, покрытая мраком! 😄'],
        
        // ЗАДАНИЕ 2: День рождения
        'день рождения': ['С днём рождения! 🎉🎂', 'Поздравляю! Желаю счастья и здоровья! 🥳'],
        
        'пока': ['Пока! Рад был пообщаться! 😊', 'До встречи! Приходи ещё! 😊'],
        'помощь': ['Я умею: здороваться, считать (например, 2+2), сохранять историю и отвечать на вопросы.']
    },
    en: {
        'hello': ['Hello! How are you? 😊', 'Hi there! 😊'],
        'how are you': ['I am fine! And you? 😊', 'Great! Thanks for asking! 😊'],
        'what is your name': ['My name is Bot! 😊', 'I am your virtual friend! 😊'],
        'name': ['My name is Bot! 😊'],
        'age': ['I am very young! 😊'],
        'birthday': ['Happy birthday! 🎉🎂', 'Congratulations! 🥳'],
        'bye': ['Goodbye! 😊', 'See you later! 😊'],
        'help': ['I can greet, calculate (e.g., 2+2), save history, and answer questions.']
    }
};

const defaultResponses = {
    ru: ['Интересно... Расскажи ещё! 😊', 'Я не совсем понял. Попробуй сказать по-другому! 🤔', 'Хм... Давай поговорим о чём-то другом? 😊'],
    en: ['Interesting... tell me more! 😊', 'I don\'t quite understand. Try again! 🤔', 'Hmm... let\'s talk about something else? 😊']
};

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // ЗАДАНИЕ 5: Режим "Калькулятор"
    // Проверяем, содержит ли сообщение только цифры, пробелы и мат. операторы
    const mathRegex = /^[\d\s+\-*/().]+$/;
    if (mathRegex.test(msg) && /[+\-*/]/.test(msg)) {
        try {
            // Используем Function для безопасного вычисления (в рамках этого regex)
            const result = new Function('return (' + msg + ')')();
            if (result !== undefined && !isNaN(result)) {
                return currentLang === 'ru' ? `Результат: ${result}` : `Result: ${result}`;
            }
        } catch (e) {
            return currentLang === 'ru' ? 'Не могу вычислить это выражение. Попробуй что-то проще!' : 'Cannot calculate this. Try something simpler!';
        }
    }

    // Обычный поиск по ключевым словам
    const responses = botResponses[currentLang];
    for (const [keyword, responseArray] of Object.entries(responses)) {
        if (msg.includes(keyword)) {
            return getRandomItem(responseArray);
        }
    }

    // Если ничего не подошло
    return getRandomItem(defaultResponses[currentLang]);
}

// ============================================
// 3. РАБОТА С ИНТЕРФЕЙСОМ И ИСТОРИЕЙ
// ============================================
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ЗАДАНИЕ 6: Сохранение и загрузка истории
function saveToLocalStorage(text, sender, time) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ text, sender, time });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    if (history.length > 0) {
        // Если история есть, загружаем её
        history.forEach(msg => {
            renderMessage(msg.text, msg.sender, msg.time);
        });
        // Восстанавливаем счетчик сообщений (приблизительно)
        messageCount = history.filter(m => m.sender === 'user').length;
    } else {
        // Если истории нет, показываем приветствие
        renderMessage('Привет! Я простой чат-бот. Напиши что-нибудь, и я отвечу!', 'bot', 'Только что');
    }
}

// Отрисовка сообщения в DOM (без сохранения)
function renderMessage(text, sender, time) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = time;

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Универсальная функция добавления (сохраняет в историю)
function addMessage(text, sender) {
    const time = getCurrentTime();
    renderMessage(text, sender, time);
    saveToLocalStorage(text, sender, time); // ЗАДАНИЕ 6
}

function showTyping(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================
// 4. ОТПРАВКА СООБЩЕНИЙ
// ============================================
function sendMessage() {
    const text = messageInput.value.trim();
    if (text === '') return;

    // Добавляем сообщение пользователя
    addMessage(text, 'user');
    messageInput.value = '';
    messageInput.focus();

    // Блокируем интерфейс
    messageInput.disabled = true;
    sendButton.disabled = true;
    showTyping(true);

    // Имитация задержки
    const delay = 500 + Math.random() * 1000;

    setTimeout(() => {
        // ЗАДАНИЕ 3: Увеличиваем счетчик и добавляем его к ответу
        messageCount++; 
        const baseResponse = getBotResponse(text);
        const finalResponse = `${baseResponse} (Сообщение #${messageCount})`;

        showTyping(false);
        addMessage(finalResponse, 'bot');

        // Разблокируем интерфейс
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }, delay);
}

// ============================================
// 5. ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// ЗАДАНИЕ 7: Переключение языка
langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
    
    // Меняем плейсхолдер
    messageInput.placeholder = currentLang === 'ru' ? 'Введите сообщение...' : 'Type a message...';
    
    // Сообщение от бота о смене языка
    const switchMsg = currentLang === 'ru' ? 'Язык переключен на русский 🇷🇺' : 'Language switched to English 🇬🇧';
    addMessage(switchMsg, 'bot');
});

// ============================================
// 6. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================
loadHistory(); // ЗАДАНИЕ 6
messageInput.focus();