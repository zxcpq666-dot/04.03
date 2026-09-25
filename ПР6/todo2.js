// ===== Модель данных =====
let tasks = [];
let nextId = 1;

// ===== Задание 1. Дата создания =====
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function demoTask1_createdAt() {
  console.group("📌 Задание 1. Дата создания задачи");
  tasks.forEach(t => {
    console.log(`  id=${t.id} | "${t.text}" | createdAt = ${t.createdAt}`);
    console.log(`     → в читаемом виде: ${formatDate(t.createdAt)}`);
  });
  console.groupEnd();
}

// ===== Задание 2. localStorage =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("nextId", nextId);
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  const savedNextId = localStorage.getItem("nextId");

  if (savedTasks) {
    try { tasks = JSON.parse(savedTasks); } catch (e) { tasks = []; }
  }
  if (savedNextId) {
    nextId = Number(savedNextId);
  } else {
    nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  }
}

function demoTask2_localStorage() {
  console.group("📌 Задание 2. Сохранение в localStorage");
  console.log("tasks  =", localStorage.getItem("tasks"));
  console.log("nextId =", localStorage.getItem("nextId"));
  console.log("Текущий массив tasks:");
  console.table(tasks);
  console.groupEnd();
}

// ===== Задание 3. Приоритеты =====
function priorityLabel(p) {
  const labels = { high: "Высокий", medium: "Средний", low: "Низкий" };
  return labels[p] || p;
}

function demoTask3_priorities() {
  console.group("📌 Задание 3. Приоритеты и сортировка по приоритету");

  console.log("Задачи с приоритетами:");
  tasks.forEach(t => {
    console.log(`  "${t.text}" → ${priorityLabel(t.priority)} (${t.priority})`);
  });

  const order = { high: 3, medium: 2, low: 1 };
  const sorted = [...tasks].sort((a, b) => order[b.priority] - order[a.priority]);

  console.log("Отсортировано по приоритету (высокий → низкий):");
  console.table(sorted.map(t => ({
    id: t.id,
    задача: t.text,
    приоритет: priorityLabel(t.priority)
  })));

  console.groupEnd();
}

// ===== Задание 4. Сроки и просроченные =====
function isOverdue(task) {
  if (task.completed || !task.dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

function demoTask4_dueDates() {
  console.group("📌 Задание 4. Срок выполнения и просроченные задачи");
  console.log("Текущая дата:", new Date().toISOString().split("T")[0]);

  tasks.forEach(t => {
    const status = !t.dueDate
      ? "без срока"
      : t.completed
        ? "выполнена"
        : isOverdue(t)
          ? "⚠ ПРОСРОЧЕНА"
          : "в срок";
    console.log(`  "${t.text}" | срок: ${t.dueDate || "—"} | ${status}`);
  });

  const overdue = tasks.filter(isOverdue);
  console.log(`Всего просроченных: ${overdue.length}`);
  if (overdue.length) {
    console.table(overdue.map(t => ({
      id: t.id, задача: t.text, срок: t.dueDate
    })));
  }
  console.groupEnd();
}

// ===== Общая демонстрация =====
function demoAllIndependentTasks() {
  console.clear();
  console.log("%c=== САМОСТОЯТЕЛЬНЫЕ ЗАДАНИЯ (ПР №4) ===",
              "font-size:16px; font-weight:bold; color:#667eea;");
  console.log("Вывод по каждому заданию:\n");

  demoTask1_createdAt();
  demoTask2_localStorage();
  demoTask3_priorities();
  demoTask4_dueDates();

  console.log("\n%c✅ Все 4 задания продемонстрированы.",
              "color:#28a745; font-weight:bold;");
  console.log("Повторный запуск: demoAllIndependentTasks()");
}

// ===== Инициализация =====
function init() {
  const hasSaved = localStorage.getItem("tasks") !== null;
  loadTasks();

  if (!hasSaved) {
    const examples = [
      { text: "Изучить JavaScript", priority: "high",   dueDate: null },
      { text: "Сделать лабораторную", priority: "medium", dueDate: null },
      { text: "Пойти на пару",        priority: "low",    dueDate: null }
    ];
    for (let ex of examples) {
      tasks.push({
        id: nextId++,
        text: ex.text,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: ex.priority,
        dueDate: ex.dueDate
      });
    }
    saveTasks();
  }

  // Вывод заданий в консоль
  demoAllIndependentTasks();
}

init();