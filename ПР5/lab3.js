// ===== Находим элементы =====
let displayText = document.getElementById("displayText");
let changeTextBtn = document.getElementById("changeTextBtn");
let toggleHighlightBtn = document.getElementById("toggleHighlightBtn");
let resetBtn = document.getElementById("resetBtn");
let userInput = document.getElementById("userInput");
let submitTextBtn = document.getElementById("submitTextBtn");
let addItemBtn = document.getElementById("addItemBtn");
let removeItemBtn = document.getElementById("removeItemBtn");
let itemList = document.getElementById("itemList");

// ===== Обработчики событий =====

// 1. Изменение текста
changeTextBtn.addEventListener("click", function () {
    displayText.textContent = "Текст был изменен! 🎉";
    displayText.style.color = "#007bff";
});

// 2. Подсветка (toggle — переключение)
toggleHighlightBtn.addEventListener("click", function () {
    displayText.classList.toggle("highlight");
});

// 3. Сброс
resetBtn.addEventListener("click", function () {
    displayText.textContent = "Нажмите на кнопку или введите текст";
    displayText.style.color = "#333";
    displayText.classList.remove("highlight");
    userInput.value = "";
});

// 4. Ввод текста из поля
submitTextBtn.addEventListener("click", function () {
    let inputText = userInput.value.trim();
    if (inputText === "") {
        displayText.textContent = "Пожалуйста, введите текст!";
        displayText.style.color = "red";
    } else {
        displayText.textContent = "Вы ввели: " + inputText;
        displayText.style.color = "#28a745";
    }
});

// 5. Обработка нажатия Enter в поле ввода
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        submitTextBtn.click(); // имитируем нажатие кнопки
    }
});

// 6. Добавление элемента в список
addItemBtn.addEventListener("click", function () {
    let count = itemList.children.length + 1;
    let newItem = document.createElement("li");
    newItem.textContent = "Новый элемент " + count;

    // Удаление нового элемента по клику
    newItem.addEventListener("click", function () {
        this.remove();
    });

    itemList.appendChild(newItem);
});

// 7. Удаление последнего элемента
removeItemBtn.addEventListener("click", function () {
    if (itemList.children.length > 0) {
        let lastItem = itemList.lastElementChild;
        lastItem.remove();
    } else {
        alert("Список уже пуст!");
    }
});

// ===== Дополнительно: реагируем на наведение =====
displayText.addEventListener("mouseover", function () {
    this.style.backgroundColor = "#e9ecef";
});
displayText.addEventListener("mouseout", function () {
    this.style.backgroundColor = "#fafafa";
});

console.log("Страница загружена! ✅");