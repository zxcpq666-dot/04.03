// ============================================================
// Конструктор резюме — объединённый JS-код
// ============================================================

// ---------- ДАННЫЕ ----------
let skills = [];
let experienceList = [];
let currentResume = null;

// ---------- УТИЛИТЫ ----------
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ---------- НАВЫКИ ----------
function addSkill() {
  const input = document.getElementById('skillInput');
  const skillName = input.value.trim();

  if (!skillName) return;

  // Проверка на дубликат
  if (skills.includes(skillName)) {
    alert('Такой навык уже добавлен');
    return;
  }

  // Иммутабельное добавление
  skills = [...skills, skillName];
  input.value = '';
  renderSkills();
}

function renderSkills() {
  const list = document.getElementById('skillsList');
  list.innerHTML = skills.map((skill, index) => `
    <li>${escapeHtml(skill)}
      <button type="button" onclick="removeSkill(${index})">×</button>
    </li>
  `).join('');
}

function removeSkill(index) {
  skills = skills.filter((_, i) => i !== index);
  renderSkills();
}

// ---------- ЗАДАНИЕ 1: ОПЫТ РАБОТЫ ----------
function addExperience() {
  const company = val('expCompany');
  const position = val('expPosition');
  const years = Number(val('expYears')) || 0;

  if (!company || !position) return;

  // Сокращённый синтаксис свойств
  const job = { company, position, years };

  // Иммутабельное добавление в массив
  experienceList = [...experienceList, job];

  document.getElementById('expCompany').value = '';
  document.getElementById('expPosition').value = '';
  document.getElementById('expYears').value = '';
  renderExperience();
}

function renderExperience() {
  const list = document.getElementById('experienceList');
  list.innerHTML = experienceList.map((job, index) => `
    <li>${escapeHtml(job.position)} в ${escapeHtml(job.company)} (${job.years} лет)
      <button type="button" onclick="removeExperience(${index})">×</button>
    </li>
  `).join('');
}

function removeExperience(index) {
  experienceList = experienceList.filter((_, i) => i !== index);
  renderExperience();
}

// ---------- СБОРКА РЕЗЮМЕ ----------
function buildResume() {
  const personalInfo = {
    firstName: val('firstName'),
    lastName: val('lastName'),
    age: Number(val('age')) || 0
  };

  const address = {
    city: val('city'),
    street: val('street'),
    building: val('building'),
    zip: val('zip')
  };

  const email = val('email');
  const phone = val('phone');
  const contacts = { email, phone }; // сокращённый синтаксис

  // Композиция через spread, копируем вложенные объекты и массивы
  const fullResume = {
    ...personalInfo,
    address: { ...address },
    skills: [...skills],
    experience: experienceList.map(job => ({ ...job })),
    contacts: { ...contacts }
  };

  return fullResume;
}

// ---------- ЗАДАНИЕ 3: ОТОБРАЖЕНИЕ С ЗНАЧЕНИЯМИ ПО УМОЛЧАНИЮ ----------
function displayResume(resume) {
  const {
    firstName = 'Неизвестный',
    lastName = 'Пользователь',
    age = 'не указан',
    address: {
      city = 'Город не указан',
      street = '',
      building = '',
      zip = ''
    } = {},
    skills = [],
    experience = [],
    contacts: {
      email = 'не указан',
      phone = 'не указан'
    } = {}
  } = resume || {};

  const fullName = `${firstName} ${lastName}`;
  const addressString = [city, street, building, zip].filter(Boolean).join(', ');
  const skillsString = skills.length > 0 ? skills.join(', ') : 'не указаны';

  let html = `
    <h2>Резюме: ${escapeHtml(fullName)}</h2>
    <p><strong>Возраст:</strong> ${escapeHtml(age || 'не указан')}</p>
    <p><strong>Адрес:</strong> ${escapeHtml(addressString || 'не указан')}</p>
    <p><strong>Навыки:</strong> ${escapeHtml(skillsString)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email || 'не указан')}</p>
    <p><strong>Телефон:</strong> ${escapeHtml(phone || 'не указан')}</p>
  `;

  if (experience.length > 0) {
    html += '<h3>Опыт работы:</h3><ul>';
    experience.forEach(job => {
      html += `<li>${escapeHtml(job.position)} в ${escapeHtml(job.company)} (${escapeHtml(job.years)} лет)</li>`;
    });
    html += '</ul>';
  }

  document.getElementById('output').innerHTML = html;
}

function buildAndDisplay() {
  currentResume = buildResume();
  displayResume(currentResume);
  console.log('Объект резюме:', currentResume);
}

function showResume() {
  if (!currentResume) currentResume = buildResume();
  displayResume(currentResume);
}

// ---------- ЗАДАНИЕ 2: ИММУТАБЕЛЬНОЕ ОБНОВЛЕНИЕ ----------
function updateResumeField(resume, fieldPath, newValue) {
  const parts = fieldPath.split('.');

  function update(obj, keys) {
    if (keys.length === 1) {
      return { ...obj, [keys[0]]: newValue };
    }
    const [key, ...rest] = keys;
    return {
      ...obj,
      [key]: update(obj[key] || {}, rest)
    };
  }

  return update(resume, parts);
}

// Пример использования:
// const updated = updateResumeField(currentResume, 'address.city', 'Санкт-Петербург');

// ---------- ЗАДАНИЕ 4: LOCALSTORAGE ----------
function saveResume() {
  const resume = currentResume || buildResume();
  currentResume = resume;
  localStorage.setItem('savedResume', JSON.stringify(resume));
  alert('Резюме сохранено');
}

function loadResume() {
  const saved = localStorage.getItem('savedResume');
  if (!saved) {
    alert('Сохранённое резюме не найдено');
    return;
  }

  try {
    const resume = JSON.parse(saved);
    currentResume = resume;
    displayResume(resume);
    fillFormFromResume(resume);
  } catch (e) {
    console.error(e);
    alert('Ошибка загрузки резюме');
  }
}

function fillFormFromResume(resume) {
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? '';
  };

  setVal('firstName', resume.firstName);
  setVal('lastName', resume.lastName);
  setVal('age', resume.age);

  const addr = resume.address || {};
  setVal('city', addr.city);
  setVal('street', addr.street);
  setVal('building', addr.building);
  setVal('zip', addr.zip);

  const contacts = resume.contacts || {};
  setVal('email', contacts.email);
  setVal('phone', contacts.phone);

  skills = Array.isArray(resume.skills) ? [...resume.skills] : [];
  experienceList = Array.isArray(resume.experience)
    ? resume.experience.map(job => ({ ...job }))
    : [];

  renderSkills();
  renderExperience();
}

// ---------- ОЧИСТКА ----------
function clearForm() {
  document.querySelectorAll('input').forEach(input => input.value = '');
  skills = [];
  experienceList = [];
  currentResume = null;
  renderSkills();
  renderExperience();
  document.getElementById('output').innerHTML = '';
}

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
renderSkills();
renderExperience();