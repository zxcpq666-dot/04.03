// =======================================================
// 1. ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM
// =======================================================
const cardElement = document.getElementById('card');
const cardNumberInput = document.getElementById('card-number');
const cardHolderInput = document.getElementById('card-holder');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');
const cardNumberDisplay = document.getElementById('card-number-display');
const cardHolderDisplay = document.getElementById('card-holder-display');
const cardExpiryDisplay = document.getElementById('card-expiry-display');
const cardCvvDisplay = document.getElementById('card-cvv-display'); // Для 3D обратной стороны
const brandIcon = document.getElementById('brand-icon');
const brandName = document.getElementById('brand-name');
const currencySelect = document.getElementById('currency-select');
const cardCurrencyDisplay = document.getElementById('card-currency-display');

const numberError = document.getElementById('number-error');
const holderError = document.getElementById('holder-error');
const expiryError = document.getElementById('expiry-error');
const cvvError = document.getElementById('cvv-error');

const submitBtn = document.getElementById('submit-btn');
const successMessage = document.getElementById('success-message');
const themeToggle = document.getElementById('theme-toggle');

// =======================================================
// 2. ФУНКЦИИ ФОРМАТИРОВАНИЯ
// =======================================================
function formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    const groups = [];
    for (let i = 0; i < cleaned.length; i += 4) {
        groups.push(cleaned.slice(i, i + 4));
    }
    return groups.join(' ').trim().slice(0, 19);
}

function formatCardExpiry(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    let month = cleaned.slice(0, 2);
    if (month.length === 2 && parseInt(month) > 12) month = '12';
    if (cleaned.length >= 2) return month + '/' + cleaned.slice(2, 4);
    return month;
}

// =======================================================
// 3. ОПРЕДЕЛЕНИЕ ТИПА КАРТЫ
// =======================================================
function getCardType(number) {
    const clean = number.replace(/\s/g, '');
    if (!clean) return 'unknown';
    
    const first = clean[0];
    const firstTwo = clean.slice(0, 2);
    const firstFour = clean.slice(0, 4);

    if (firstTwo === '34' || firstTwo === '37') return 'amex';
    if (first === '4') return 'visa';
    if (firstTwo >= '51' && firstTwo <= '55') return 'mastercard';
    if (firstTwo >= '22' && firstTwo <= '27') return 'mastercard';
    if (first === '2') return 'mir';
    if (firstFour === '6011' || firstTwo === '65') return 'discover';
    if (firstTwo === '35') return 'jcb';
    
    // ЗАДАНИЕ 1: UnionPay
    if (firstTwo === '62') return 'unionpay';
    
    return 'unknown';
}

function getCardInfo(type) {
    const info = {
        visa: { icon: '💳', name: 'Visa' },
        mastercard: { icon: '💳', name: 'MasterCard' },
        mir: { icon: '💳', name: 'МИР' },
        amex: { icon: '💳', name: 'American Express' },
        discover: { icon: '💳', name: 'Discover' },
        jcb: { icon: '💳', name: 'JCB' },
        unionpay: { icon: '💳', name: 'UnionPay' }, // ЗАДАНИЕ 1
        unknown: { icon: '💳', name: 'Банковская карта' }
    };
    return info[type] || info.unknown;
}

// =======================================================
// 4. ВАЛИДАЦИЯ
// =======================================================
function validateLuhn(number) {
    const digits = number.replace(/\s/g, '').split('').map(Number);
    if (digits.length < 13) return false;
    
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

function validateCardNumber(value) {
    const clean = value.replace(/\s/g, '');
    if (clean.length === 0) return { valid: false, message: 'Введите номер карты' };
    if (clean.length < 13) return { valid: false, message: 'Номер слишком короткий' };
    if (clean.length > 16) return { valid: false, message: 'Номер слишком длинный' };
    if (!validateLuhn(clean)) return { valid: false, message: 'Неверный номер карты' };
    return { valid: true, message: '' };
}

function validateCardHolder(value) {
    const trimmed = value.trim();
    if (trimmed.length === 0) return { valid: false, message: 'Введите имя владельца' };
    if (trimmed.length < 3) return { valid: false, message: 'Имя слишком короткое' };
    if (!/^[A-Za-z\s-]+$/.test(trimmed)) {
        return { valid: false, message: 'Только латинские буквы' };
    }
    return { valid: true, message: '' };
}

function validateCardExpiry(value) {
    const clean = value.replace('/', '');
    if (clean.length === 0) return { valid: false, message: 'Введите срок' };
    if (clean.length < 4) return { valid: false, message: 'Введите полную дату' };
    
    const month = parseInt(clean.slice(0, 2));
    const year = parseInt(clean.slice(2, 4));
    if (month < 1 || month > 12) return { valid: false, message: 'Неверный месяц' };
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { valid: false, message: 'Карта просрочена' };
    }
    return { valid: true, message: '' };
}

function validateCVV(value, cardType) {
    const clean = value.replace(/\D/g, '');
    const maxLength = cardType === 'amex' ? 4 : 3;
    const minLength = cardType === 'amex' ? 4 : 3;
    
    if (clean.length === 0) return { valid: false, message: 'Введите CVV' };
    if (clean.length < minLength) return { valid: false, message: `Введите ${minLength} цифры` };
    if (clean.length > maxLength) return { valid: false, message: `Не более ${maxLength} цифр` };
    return { valid: true, message: '' };
}

// =======================================================
// 5. ОБНОВЛЕНИЕ КАРТОЧКИ И LOCALSTORAGE (ЗАДАНИЕ 5)
// =======================================================
function updateCard() {
    const number = cardNumberInput.value;
    const cardType = getCardType(number);
    const info = getCardInfo(cardType);
    
    cardElement.className = 'card';
    if (cardType !== 'unknown') cardElement.classList.add(cardType);
    
    brandIcon.textContent = info.icon;
    brandName.textContent = info.name;
    
    const displayNumber = number || '•••• •••• •••• ••••';
    cardNumberDisplay.textContent = displayNumber;
    
    const holder = cardHolderInput.value.trim().toUpperCase() || 'ИМЯ ФАМИЛИЯ';
    cardHolderDisplay.textContent = holder;
    
    const expiry = cardExpiryInput.value || 'ММ/YY';
    cardExpiryDisplay.textContent = expiry;
    
    // Отображение валюты
    cardCurrencyDisplay.textContent = currencySelect.value;
    
    // Синхронизация CVV на обратной стороне
    cardCvvDisplay.textContent = cardCvvInput.value || '•••';
    
    // Ограничение длины CVV
    const cvvMaxLength = cardType === 'amex' ? 4 : 3;
    cardCvvInput.maxLength = cvvMaxLength;
    cardCvvInput.placeholder = '•'.repeat(cvvMaxLength);

    // ЗАДАНИЕ 5: Сохранение в localStorage (кроме CVV в целях безопасности)
    const cardData = {
        number: cardNumberInput.value,
        holder: cardHolderInput.value,
        expiry: cardExpiryInput.value,
        currency: currencySelect.value
    };
    localStorage.setItem('cardData', JSON.stringify(cardData));
}

// ЗАДАНИЕ 5: Загрузка данных при старте
function loadCardData() {
    const saved = localStorage.getItem('cardData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            cardNumberInput.value = data.number || '';
            cardHolderInput.value = data.holder || '';
            cardExpiryInput.value = data.expiry || '';
            if (data.currency) currencySelect.value = data.currency;
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
    updateCard();
}

// =======================================================
// 6. ОБРАБОТЧИКИ СОБЫТИЙ
// =======================================================
cardNumberInput.addEventListener('input', function() {
    const formatted = formatCardNumber(this.value);
    this.value = formatted;
    
    // ЗАДАНИЕ 3: Автоматический переход на поле Владелец
    if (formatted.length === 19) {
        cardHolderInput.focus();
    }
    
    const result = validateCardNumber(formatted);
    numberError.textContent = result.message;
    this.classList.toggle('error', !result.valid && formatted.length > 0);
    updateCard();
});

cardHolderInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase().replace(/[^A-Z\s-]/g, '');
    const result = validateCardHolder(this.value);
    holderError.textContent = result.message;
    this.classList.toggle('error', !result.valid && this.value.length > 0);
    updateCard();
});

cardExpiryInput.addEventListener('input', function() {
    const formatted = formatCardExpiry(this.value);
    this.value = formatted;
    const result = validateCardExpiry(formatted);
    expiryError.textContent = result.message;
    this.classList.toggle('error', !result.valid && formatted.length > 0);
    updateCard();
});

cardCvvInput.addEventListener('input', function() {
    const cardType = getCardType(cardNumberInput.value);
    const formatted = this.value.replace(/\D/g, '');
    this.value = formatted;
    
    const result = validateCVV(formatted, cardType);
    cvvError.textContent = result.message;
    this.classList.toggle('error', !result.valid && formatted.length > 0);
    updateCard();
});

// ЗАДАНИЕ 7: 3D-анимация при фокусе на CVV
cardCvvInput.addEventListener('focus', function() {
    cardElement.classList.add('flip');
});
cardCvvInput.addEventListener('blur', function() {
    cardElement.classList.remove('flip');
});

// ЗАДАНИЕ 6: Смена валюты
currencySelect.addEventListener('change', updateCard);

// ЗАДАНИЕ 4: Темная тема
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    this.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// Отправка формы
document.getElementById('card-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const number = cardNumberInput.value;
    const holder = cardHolderInput.value;
    const expiry = cardExpiryInput.value;
    const cvv = cardCvvInput.value;
    const cardType = getCardType(number);
    
    const isNumberValid = validateCardNumber(number).valid;
    const isHolderValid = validateCardHolder(holder).valid;
    const isExpiryValid = validateCardExpiry(expiry).valid;
    const isCvvValid = validateCVV(cvv, cardType).valid;
    
    if (isNumberValid && isHolderValid && isExpiryValid && isCvvValid) {
        submitBtn.disabled = true;
        successMessage.classList.add('show');
        
        setTimeout(() => {
            this.reset();
            successMessage.classList.remove('show');
            submitBtn.disabled = false;
            localStorage.removeItem('cardData'); // Очищаем после оплаты
            updateCard();
        }, 3000);
    } else {
        if (!isNumberValid) cardNumberInput.focus();
        else if (!isHolderValid) cardHolderInput.focus();
        else if (!isExpiryValid) cardExpiryInput.focus();
        else if (!isCvvValid) cardCvvInput.focus();
    }
});

// =======================================================
// 7. ИНИЦИАЛИЗАЦИЯ
// =======================================================
loadCardData();