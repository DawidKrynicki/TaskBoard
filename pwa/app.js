const API_URL = 'http://127.0.0.1:8000/tasks';

// Pobieranie zadań z backendu
async function loadTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-card';
        div.innerHTML = `
            <div>
                <strong style="font-size: 1.1em;">${task.title}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">${task.description || ''}</p>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Usuń</button>
        `;
        list.appendChild(div);
    });
}

// Tworzenie nowego zadania
async function addTask() {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    
    if (!title) return alert('Tytuł jest wymagany!');

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, description: desc, status: 'To Do' })
    });
    
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    loadTasks();
}

// Usuwanie zadania
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
}

// Uruchom pobieranie od razu po wejściu na stronę
loadTasks();