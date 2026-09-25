// ===================================================
// 1. ПОЛУЧЕНИЕ ССЫЛОК НА ЭЛЕМЕНТЫ
// ===================================================
const form            = document.getElementById('registrationForm');
const nameInput       = document.getElementById('name');
const emailInput      = document.getElementById('email');
const phoneInput      = document.getElementById('phone');
const birthdateInput  = document.getElementById('birthdate');   // Задание 4
const passwordInput   = document.getElementById('password');
const confirmInput    = document.getElementById('confirmPassword');
const agreeCheckbox   = document.getElementById('agree');

const nameError       = document.getElementById('nameError');
const emailError      = document.getElementById('emailError');
const phoneError      = document.getElementById('phoneError');
const birthdateError  = document.getElementById('birthdateError'); // Задание 4
const passwordError   = document.getElementById('passwordError');
const confirmError    = document.getElementById('confirmError');
const agreeError      = document.getElementById('agreeError');

const successMessage  = document.getElementById('successMessage');
const submitBtn       = document.querySelector('.btn-submit');

// Кнопки «глаз» (Задание 3)
const togglePassword  = document.getElementById('togglePassword');
const toggleConfirm   = document.getElementById('toggleConfirm');

// ===================================================
// 2. ФУНКЦИИ ВАЛИДАЦИИ
// ===================================================

/** Проверка имени: минимум 2 буквы, только буквы и пробелы */
function validateName() {
  const value = nameInput.value.trim();
  const regex = /^[А-Яа-яA-Za-z\s]{2,}$/;

  if (value === '') {
    nameError.textContent = 'Имя обязательно для заполнения';
    nameInput.className = 'error';
    return false;
  } else if (!regex.test(value)) {
    nameError.textContent = 'Имя должно содержать только буквы (минимум 2)';
    nameInput.className = 'error';
    return false;
  } else {
    nameError.textContent = '';
    nameInput.className = 'success';
    return true;
  }
}

/** Проверка email */
function validateEmail() {
  const value = emailInput.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === '') {
    emailError.textContent = 'Email обязателен для заполнения';
    emailInput.className = 'error';
    return false;
  } else if (!regex.test(value)) {
    emailError.textContent = 'Введите корректный email';
    emailInput.className = 'error';
    return false;
  } else {
    emailError.textContent = '';
    emailInput.className = 'success';
    return true;
  }
}

/** Проверка телефона (необязательное поле) */
function validatePhone() {
  const value = phoneInput.value.trim();

  if (value === '') {
    phoneError.textContent = '';
    phoneInput.className = '';
    return true;
  }

  const regex = /^[\d\s\-()+\u00A0]+$/;
  if (!regex.test(value)) {
    phoneError.textContent = 'Используйте только цифры, пробелы, +, -, ()';
    phoneInput.className = 'error';
    return false;
  } else if (value.replace(/\D/g, '').length < 10) {
    phoneError.textContent = 'Введите минимум 10 цифр';
    phoneInput.className = 'error';
    return false;
  } else {
    phoneError.textContent = '';
    phoneInput.className = 'success';
    return true;
  }
}

// ===================================================
// ЗАДАНИЕ 4. Проверка даты рождения (не младше 18 лет)
// ===================================================
function validateBirthdate() {
  const value = birthdateInput.value; // формат YYYY-MM-DD

  if (value === '') {
    birthdateError.textContent = 'Дата рождения обязательна';
    birthdateInput.className = 'error';
    return false;
  }

  const birth = new Date(value);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    birthdateError.textContent = 'Некорректная дата';
    birthdateInput.className = 'error';
    return false;
  }

  if (birth > today) {
    birthdateError.textContent = 'Дата рождения не может быть в будущем';
    birthdateInput.className = 'error';
    return false;
  }

  // Точный расчёт возраста
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 18) {
    birthdateError.textContent = 'Регистрация доступна с 18 лет';
    birthdateInput.className = 'error';
    return false;
  } else {
    birthdateError.textContent = `Возраст: ${age} лет`; // информационно
    birthdateError.style.color = '#4caf50';
    birthdateInput.className = 'success';
    return true;
  }
}

// ===================================================
// ЗАДАНИЯ 1 и 2. Пароль: минимум 8 символов + хотя бы одна цифра
// ===================================================
function validatePassword() {
  const value = passwordInput.value;

  if (value === '') {
    passwordError.textContent = 'Пароль обязателен для заполнения';
    passwordError.style.color = '#f44336';
    passwordInput.className = 'error';
    return false;
  } else if (value.length < 8) {                       // Задание 1
    passwordError.textContent = 'Пароль должен содержать минимум 8 символов';
    passwordError.style.color = '#f44336';
    passwordInput.className = 'error';
    return false;
  } else if (!/\d/.test(value)) {                      // Задание 2
    passwordError.textContent = 'Пароль должен содержать хотя бы одну цифру';
    passwordError.style.color = '#f44336';
    passwordInput.className = 'error';
    return false;
  } else {
    passwordError.textContent = '';
    passwordInput.className = 'success';
    return true;
  }
}

/** Проверка подтверждения пароля */
function validateConfirm() {
  const password = passwordInput.value;
  const confirm  = confirmInput.value;

  if (confirm === '') {
    confirmError.textContent = 'Подтвердите пароль';
    confirmInput.className = 'error';
    return false;
  } else if (password !== confirm) {
    confirmError.textContent = 'Пароли не совпадают';
    confirmInput.className = 'error';
    return false;
  } else {
    confirmError.textContent = '';
    confirmInput.className = 'success';
    return true;
  }
}

/** Проверка чекбокса согласия */
function validateAgree() {
  if (!agreeCheckbox.checked) {
    agreeError.textContent = 'Необходимо согласие на обработку данных';
    return false;
  } else {
    agreeError.textContent = '';
    return true;
  }
}

// ===================================================
// 3. ОБЩАЯ ПРОВЕРКА ФОРМЫ
// ===================================================
function validateForm() {
  const isNameValid      = validateName();
  const isEmailValid     = validateEmail();
  const isPhoneValid     = validatePhone();
  const isBirthdateValid = validateBirthdate();
  const isPasswordValid  = validatePassword();
  const isConfirmValid   = validateConfirm();
  const isAgreeValid     = validateAgree();

  const isValid =
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isBirthdateValid &&
    isPasswordValid &&
    isConfirmValid &&
    isAgreeValid;

  submitBtn.disabled = !isValid;
  return isValid;
}

// ===================================================
// 4. ОБРАБОТЧИКИ СОБЫТИЙ
// ===================================================
nameInput.addEventListener('input', () => { validateName(); validateForm(); });
emailInput.addEventListener('input', () => { validateEmail(); validateForm(); });
phoneInput.addEventListener('input', () => { validatePhone(); validateForm(); });
birthdateInput.addEventListener('change', () => { validateBirthdate(); validateForm(); });

passwordInput.addEventListener('input', () => {
  validatePassword();
  if (confirmInput.value) validateConfirm(); // перепроверяем подтверждение
  validateForm();
});

confirmInput.addEventListener('input', () => { validateConfirm(); validateForm(); });
agreeCheckbox.addEventListener('change', () => { validateAgree(); validateForm(); });

// blur — проверка после окончания ввода
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
phoneInput.addEventListener('blur', validatePhone);
birthdateInput.addEventListener('blur', validateBirthdate);
passwordInput.addEventListener('blur', validatePassword);
confirmInput.addEventListener('blur', validateConfirm);

// ===================================================
// ЗАДАНИЕ 3. «Глаз» — показать/скрыть пароль
// ===================================================
function setupToggle(button, input) {
  button.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? '🙈' : '👁';
    button.setAttribute('aria-label',
      isPassword ? 'Скрыть пароль' : 'Показать пароль');
  });
}

setupToggle(togglePassword, passwordInput);
setupToggle(toggleConfirm,  confirmInput);

// ===================================================
// 5. ОТПРАВКА ФОРМЫ
// ===================================================
form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (validateForm()) {
    console.log('✅ Форма валидна! Отправка данных...');
    console.log({
      name:      nameInput.value.trim(),
      email:     emailInput.value.trim(),
      phone:     phoneInput.value.trim(),
      birthdate: birthdateInput.value,
      password:  '******' // не логируем реальный пароль
    });

    successMessage.className = 'success-visible';

    // Блокируем форму после успешной отправки
    form.querySelectorAll('input').forEach(input => { input.disabled = true; });
    submitBtn.disabled = true;

    setTimeout(() => {
      successMessage.className = 'success-hidden';
    }, 5000);
  } else {
    const firstError = form.querySelector('.error');
    if (firstError) firstError.focus();
    console.warn('⚠ Форма содержит ошибки');
  }
});

// ===================================================
// 6. СБРОС ФОРМЫ
// ===================================================
form.addEventListener('reset', function () {
  setTimeout(() => {
    form.querySelectorAll('input').forEach(input => { input.className = ''; });
    form.querySelectorAll('.error-message').forEach(err => {
      err.textContent = '';
      err.style.color = ''; // сброс цвета сообщения о возрасте
    });

    // Возвращаем паролям тип password (на случай, если был включён «глаз»)
    passwordInput.type = 'password';
    confirmInput.type  = 'password';
    togglePassword.textContent = '👁';
    toggleConfirm.textContent  = '👁';

    successMessage.className = 'success-hidden';

    form.querySelectorAll('input').forEach(input => { input.disabled = false; });
    submitBtn.disabled = true;

    console.log('🧹 Форма очищена');
  }, 10);
});

// ===================================================
// 7. ИНИЦИАЛИЗАЦИЯ
// ===================================================
submitBtn.disabled = true;
console.log('📝 Форма загружена, валидация активна');