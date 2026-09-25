/* ============================================================
   ПР №5. ВАЛИДАЦИЯ ФОРМЫ + САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ
   Весь JavaScript собран в этом одном файле.
   ============================================================ */

/* ===================================================
   1. ПОЛУЧЕНИЕ ССЫЛОК НА ЭЛЕМЕНТЫ
   =================================================== */
const form            = document.getElementById('registrationForm');
const nameInput       = document.getElementById('name');
const emailInput      = document.getElementById('email');
const phoneInput      = document.getElementById('phone');
const birthdateInput  = document.getElementById('birthdate');
const passwordInput   = document.getElementById('password');
const confirmInput    = document.getElementById('confirmPassword');
const agreeCheckbox   = document.getElementById('agree');

const nameError       = document.getElementById('nameError');
const emailError      = document.getElementById('emailError');
const phoneError      = document.getElementById('phoneError');
const birthdateError  = document.getElementById('birthdateError');
const passwordError   = document.getElementById('passwordError');
const confirmError    = document.getElementById('confirmError');
const agreeError      = document.getElementById('agreeError');

const successMessage  = document.getElementById('successMessage');
const submitBtn       = document.querySelector('.btn-submit');

const togglePassword  = document.getElementById('togglePassword');
const toggleConfirm   = document.getElementById('toggleConfirm');

/* ===================================================
   2. ФУНКЦИИ ВАЛИДАЦИИ
   =================================================== */

/* --- Имя --- */
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

/* --- Email --- */
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

/* --- Телефон (необязательное поле) --- */
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

/* ===== ЗАДАНИЕ 4. Дата рождения и возраст (18+) ===== */
function calculateAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function validateBirthdate() {
  const value = birthdateInput.value;

  if (value === '') {
    birthdateError.textContent = 'Дата рождения обязательна';
    birthdateError.style.color = '#f44336';
    birthdateInput.className = 'error';
    return false;
  }

  const birth = new Date(value);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    birthdateError.textContent = 'Некорректная дата';
    birthdateError.style.color = '#f44336';
    birthdateInput.className = 'error';
    return false;
  }
  if (birth > today) {
    birthdateError.textContent = 'Дата рождения не может быть в будущем';
    birthdateError.style.color = '#f44336';
    birthdateInput.className = 'error';
    return false;
  }

  const age = calculateAge(value);
  if (age < 18) {
    birthdateError.textContent = 'Регистрация доступна с 18 лет';
    birthdateError.style.color = '#f44336';
    birthdateInput.className = 'error';
    return false;
  } else {
    birthdateError.textContent = `Возраст: ${age} лет`;
    birthdateError.style.color = '#4caf50';
    birthdateInput.className = 'success';
    return true;
  }
}

/* ===== ЗАДАНИЯ 1 и 2. Пароль: ≥ 8 символов + хотя бы одна цифра ===== */
function validatePassword() {
  const value = passwordInput.value;

  if (value === '') {
    passwordError.textContent = 'Пароль обязателен для заполнения';
    passwordError.style.color = '#f44336';
    passwordInput.className = 'error';
    return false;
  } else if (value.length < 8) {
    passwordError.textContent = 'Пароль должен содержать минимум 8 символов';
    passwordError.style.color = '#f44336';
    passwordInput.className = 'error';
    return false;
  } else if (!/\d/.test(value)) {
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

/* --- Подтверждение пароля --- */
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

/* --- Чекбокс согласия --- */
function validateAgree() {
  if (!agreeCheckbox.checked) {
    agreeError.textContent = 'Необходимо согласие на обработку данных';
    return false;
  } else {
    agreeError.textContent = '';
    return true;
  }
}

/* --- Общая проверка формы --- */
function validateForm() {
  const isValid =
    validateName()      &&
    validateEmail()     &&
    validatePhone()     &&
    validateBirthdate() &&
    validatePassword()  &&
    validateConfirm()   &&
    validateAgree();

  submitBtn.disabled = !isValid;
  return isValid;
}

/* ===================================================
   3. ОБРАБОТЧИКИ СОБЫТИЙ
   =================================================== */
nameInput.addEventListener('input', () => { validateName(); validateForm(); });
emailInput.addEventListener('input', () => { validateEmail(); validateForm(); });
phoneInput.addEventListener('input', () => { validatePhone(); validateForm(); });
birthdateInput.addEventListener('change', () => { validateBirthdate(); validateForm(); });

passwordInput.addEventListener('input', () => {
  validatePassword();
  if (confirmInput.value) validateConfirm();
  validateForm();
});
confirmInput.addEventListener('input', () => { validateConfirm(); validateForm(); });
agreeCheckbox.addEventListener('change', () => { validateAgree(); validateForm(); });

nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
phoneInput.addEventListener('blur', validatePhone);
birthdateInput.addEventListener('blur', validateBirthdate);
passwordInput.addEventListener('blur', validatePassword);
confirmInput.addEventListener('blur', validateConfirm);

/* ===== ЗАДАНИЕ 3. «Глаз» для пароля ===== */
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

/* ===================================================
   4. ОТПРАВКА ФОРМЫ
   =================================================== */
form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (validateForm()) {
    console.log('✅ Форма валидна! Отправка данных...');
    console.log({
      name:      nameInput.value.trim(),
      email:     emailInput.value.trim(),
      phone:     phoneInput.value.trim(),
      birthdate: birthdateInput.value,
      password:  '******'
    });

    successMessage.className = 'success-visible';
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

/* ===================================================
   5. СБРОС ФОРМЫ
   =================================================== */
form.addEventListener('reset', function () {
  setTimeout(() => {
    form.querySelectorAll('input').forEach(input => { input.className = ''; });
    form.querySelectorAll('.error-message').forEach(err => {
      err.textContent = '';
      err.style.color = '';
    });
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

/* ============================================================
   ========== ДЕМОНСТРАЦИЯ САМОСТОЯТЕЛЬНЫХ ЗАДАНИЙ ============
   ============================================================ */

/* --- Задание 1: минимальная длина пароля 8 символов --- */
function demoTask1_passwordLength() {
  console.group('📌 Задание 1. Минимальная длина пароля — 8 символов');
  const tests = ['1234567', '12345678', 'abcdefgh', 'a1b2c3d4'];
  console.log('Проверка длины (≥ 8):');
  tests.forEach(p => {
    const ok = p.length >= 8;
    console.log(`  "${p}" (${p.length} симв.) → ${ok ? '✅ ОК' : '❌ коротко'}`);
  });
  console.groupEnd();
}

/* --- Задание 2: хотя бы одна цифра в пароле --- */
function demoTask2_passwordDigit() {
  console.group('📌 Задание 2. Пароль должен содержать хотя бы одну цифру');
  const tests = ['abcdefgh', 'abcdefg1', '12345678', 'Passw0rd'];
  console.log('Проверка регуляркой /\\d/:');
  tests.forEach(p => {
    const hasDigit = /\d/.test(p);
    console.log(`  "${p}" → ${hasDigit ? '✅ есть цифра' : '❌ нет цифры'}`);
  });
  console.groupEnd();
}

/* --- Задание 3: «глаз» показа/скрытия пароля --- */
function demoTask3_toggleEye() {
  console.group('📌 Задание 3. Кнопка «глаз» для пароля');
  console.log('Кнопка 👁 переключает тип поля между "password" и "text".');
  console.log('Нажмите 👁 у поля пароля — иконка сменится на 🙈 и текст станет виден.');
  console.log('Нажмите ещё раз — пароль снова скрыт.');
  console.log('Текущее состояние поля пароля:');
  console.log(`  passwordInput.type = "${passwordInput.type}"`);
  console.groupEnd();
}

/* --- Задание 4: дата рождения и проверка возраста --- */
function demoTask4_ageCheck() {
  console.group('📌 Задание 4. Проверка возраста (не младше 18 лет)');
  console.log('Функция calculateAge("YYYY-MM-DD") считает точный возраст.');

  const today = new Date();
  const makeDate = (yearsAgo) => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - yearsAgo);
    return d.toISOString().split('T')[0];
  };

  const examples = [
    { label: '16 лет', date: makeDate(16) },
    { label: '17 лет', date: makeDate(17) },
    { label: '18 лет', date: makeDate(18) },
    { label: '40 лет', date: makeDate(40) }
  ];

  examples.forEach(ex => {
    const age = calculateAge(ex.date);
    const ok  = age >= 18;
    console.log(`  ${ex.label} (${ex.date}) → возраст: ${age} → ${ok ? '✅ можно' : '❌ нельзя'}`);
  });

  console.log('Текущее поле «Дата рождения»:', birthdateInput.value || '(пусто)');
  console.log('Текущий возраст:', calculateAge(birthdateInput.value) ?? '—');
  console.groupEnd();
}

/* --- Общая сводка по всем 4 заданиям --- */
function demoAllIndependentTasks() {
  console.clear();
  console.log(
    '%c=== ПР №5. САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ (валидация формы) ===',
    'font-size:15px; font-weight:bold; color:#667eea;'
  );
  console.log('Вывод по всем 4 заданиям:\n');

  demoTask1_passwordLength();
  demoTask2_passwordDigit();
  demoTask3_toggleEye();
  demoTask4_ageCheck();

  console.log('\n%c✅ Все 4 самостоятельных задания продемонстрированы.',
              'color:#28a745; font-weight:bold;');
  console.log('Повторный запуск из консоли:');
  console.log('  demoAllIndependentTasks()   — всё сразу');
  console.log('  demoTask1_passwordLength()  — задание 1');
  console.log('  demoTask2_passwordDigit()   — задание 2');
  console.log('  demoTask3_toggleEye()       — задание 3');
  console.log('  demoTask4_ageCheck()        — задание 4');
}

/* ===================================================
   6. ИНИЦИАЛИЗАЦИЯ
   =================================================== */
submitBtn.disabled = true;
console.log('📝 Форма загружена, валидация активна');

/* Вывод всех самостоятельных заданий в консоль */
demoAllIndependentTasks();