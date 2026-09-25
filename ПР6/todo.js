// ===== Модель данных =====
let tasks = [];
let currentFilter = "all";
let currentSort = "default";
let nextId = 1;

// ===== DOM-элементы =====
const taskList = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const activeCount = document.getElementById("activeCount");
const filterButtons = document.querySelectorAll(".filters button");
const sortSelect = document.getElementById("sortSelect");

// ===== Сохранение и загрузка =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("nextId", nextId);
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  const savedNextId = localStorage.getItem("nextId");

  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (e) {
      tasks = [];
    }
  }

  if (savedNextId) {
    nextId = Number(savedNextId);
  } else {
    nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  }
}

// ===== Вспомогательные функции =====
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

function priorityLabel(p) {
  const labels = { high: "Высокий", medium: "Средний", low: "Низкий" };
  return labels[p] || p;
}

function priorityClass(p) {
  return "priority-" + p;
}

function isOverdue(task) {
  if (task.completed || !task.dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

// ===== Основные функции =====
function addTask(text, priority, dueDate) {
  if (text.trim() === "") {
    alert("Введите текст задачи!");
    return;
  }

  const task = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    priority: priority || "medium",
    dueDate: dueDate || null
  };

  tasks.push(task);
  taskInput.value = "";
  dueDateInput.value = "";
  saveTasks();
  render();
}

function deleteTask(id) {
  if (confirm("Удалить задачу?")) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
  }
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Редактировать задачу:", task.text);
  if (newText !== null && newText.trim() !== "") {
    task.text = newText.trim();
    saveTasks();
    render();
  }
}

function clearAllTasks() {
  if (tasks.length === 0) return;
  if (confirm("Удалить все задачи?")) {
    tasks = [];
    saveTasks();
    render();
  }
}

// ===== Фильтрация и сортировка =====
function getFilteredTasks() {
  if (currentFilter === "all") return tasks;
  if (currentFilter === "active") return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function getSortedTasks(filteredTasks) {
  const sorted = [...filteredTasks];

  if (currentSort === "priority") {
    const order = { high: 3, medium: 2, low: 1 };
    sorted.sort((a, b) => order[b.priority] - order[a.priority]);
  } else if (currentSort === "dueDate") {
    sorted.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else {
    // По умолчанию: сначала новые
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return sorted;
}

// ===== Рендеринг =====
function render() {
  const filteredTasks = getFilteredTasks();
  const sortedTasks = getSortedTasks(filteredTasks);

  // Статистика
  totalCount.textContent = tasks.length;
  completedCount.textContent = tasks.filter(t => t.completed).length;
  activeCount.textContent = tasks.filter(t => !t.completed).length;

  taskList.innerHTML = "";

  if (sortedTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";
    emptyMessage.innerHTML = `
      <span>${tasks.length === 0 ? "📭" : "🔍"}</span>
      ${tasks.length === 0 ? "Нет задач. Добавьте первую!" : "Нет задач с выбранным фильтром"}
    `;
    taskList.appendChild(emptyMessage);
    return;
  }

  for (let task of sortedTasks) {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");
    if (isOverdue(task)) li.classList.add("overdue");

    // Основная строка
    const mainDiv = document.createElement("div");
    mainDiv.className = "task-main";

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;
    textSpan.addEventListener("click", () => toggleTask(task.id));

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editTask(task.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    mainDiv.appendChild(textSpan);
    mainDiv.appendChild(actionsDiv);
    li.appendChild(mainDiv);

    // Мета-информация
    const metaDiv = document.createElement("div");
    metaDiv.className = "task-meta";

    const prioritySpan = document.createElement("span");
    prioritySpan.className = "priority-badge " + priorityClass(task.priority);
    prioritySpan.textContent = priorityLabel(task.priority);

    const createdSpan = document.createElement("span");
    createdSpan.textContent = "Создано: " + formatDate(task.createdAt);

    metaDiv.appendChild(prioritySpan);
    metaDiv.appendChild(createdSpan);

    if (task.dueDate) {
      const dueSpan = document.createElement("span");
      dueSpan.textContent = "Срок: " + task.dueDate;
      if (isOverdue(task)) {
        dueSpan.style.color = "#dc3545";
        dueSpan.style.fontWeight = "bold";
      }
      metaDiv.appendChild(dueSpan);
    }

    li.appendChild(metaDiv);
    taskList.appendChild(li);
  }
}

// ===== Инициализация =====
function init() {
  const hasSavedTasks = localStorage.getItem("tasks") !== null;
  loadTasks();

  // Если сохранённых задач нет — добавляем примеры
  if (!hasSavedTasks) {
    const exampleTasks = [
      { text: "Изучить JavaScript", priority: "high", dueDate: null },
      { text: "Сделать лабораторную работу", priority: "medium", dueDate: null },
      { text: "Пойти на пару", priority: "low", dueDate: null }
    ];

    for (let ex of exampleTasks) {
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

  render();

  // Добавление задачи
  addTaskBtn.addEventListener("click", () => {
    addTask(taskInput.value, prioritySelect.value, dueDateInput.value);
  });

  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask(taskInput.value, prioritySelect.value, dueDateInput.value);
    }
  });

  // Очистка всех
  clearAllBtn.addEventListener("click", clearAllTasks);

  // Фильтры
  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      filterButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      render();
    });
  });

  // Сортировка
  sortSelect.addEventListener("change", function () {
    currentSort = this.value;
    render();
  });
}

init();
console.log("To-Do приложение загружено!");