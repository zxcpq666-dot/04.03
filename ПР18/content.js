browser.runtime.onMessage.addListener((req) => {
    if (req.cmd === "hello") alert('Привет, мир! (Задание 1) 😊');
    
    if (req.cmd === "blue") document.body.style.setProperty('background-color', '#2196F3', 'important');
    if (req.cmd === "reset") {
        document.body.style.setProperty('background-color', '', 'important');
        document.body.style.setProperty('color', '', 'important');
    }
    
    if (req.cmd === "font+") {
        const size = parseInt(window.getComputedStyle(document.body).fontSize) || 16;
        document.body.style.setProperty('font-size', (size + 2) + 'px', 'important');
    }
    if (req.cmd === "font-") {
        const size = parseInt(window.getComputedStyle(document.body).fontSize) || 16;
        document.body.style.setProperty('font-size', Math.max(8, size - 2) + 'px', 'important');
    }
    
    if (req.cmd === "dark") {
        if (document.body.dataset.dark === 'true') {
            document.body.style.setProperty('background-color', '', 'important');
            document.body.style.setProperty('color', '', 'important');
            document.body.dataset.dark = 'false';
        } else {
            document.body.style.setProperty('background-color', '#1a1a1a', 'important');
            document.body.style.setProperty('color', '#fff', 'important');
            document.body.dataset.dark = 'true';
        }
    }
    
    if (req.cmd === "note") {
        const text = prompt("Введите заметку:");
        if (text) {
            const key = `note_${location.href}`;
            browser.storage.local.set({ [key]: text }).then(() => showNote(text));
        }
    }
});

function showNote(text) {
    const old = document.getElementById('ext-note');
    if (old) old.remove();
    const div = document.createElement('div');
    div.id = 'ext-note';
    div.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:999999;background:#fff3cd;color:#856404;padding:15px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);max-width:250px;font-family:sans-serif;";
    div.innerHTML = `<b>📌 Заметка:</b><br>${text}<br><br><button onclick="this.parentElement.remove()" style="background:#dc3545;color:#fff;border:none;padding:5px;border-radius:4px;cursor:pointer;">Удалить</button>`;
    document.body.appendChild(div);
}

// Восстановление заметки при загрузке (Задание 7)
const key = `note_${location.href}`;
browser.storage.local.get(key).then(res => { if (res[key]) showNote(res[key]); });