const API_URL = 'http://127.0.0.1:8000/tasks';

async function loadTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    
    
    document.getElementById('todo-list').innerHTML = '';
    document.getElementById('inprogress-list').innerHTML = '';
    document.getElementById('done-list').innerHTML = '';
    
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-card';
        
        
        let buttonsHtml = '';
        if (task.status === 'To Do') {
            buttonsHtml = `<button class="action-btn" onclick="updateStatus(${task.id}, '${task.title}', '${task.description || ''}', 'In Progress')">Rozpocznij</button>`;
        } else if (task.status === 'In Progress') {
            buttonsHtml = `<button class="action-btn" onclick="updateStatus(${task.id}, '${task.title}', '${task.description || ''}', 'Done')">Zakończ</button>`;
        }
        
        div.innerHTML = `
            <div>
                <strong style="font-size: 1.1em;">${task.title}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">${task.description || ''}</p>
            </div>
            <div class="task-actions">
                ${buttonsHtml}
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Usuń</button>
            </div>
        `;
        
        
        if (task.status === 'To Do') document.getElementById('todo-list').appendChild(div);
        else if (task.status === 'In Progress') document.getElementById('inprogress-list').appendChild(div);
        else if (task.status === 'Done') document.getElementById('done-list').appendChild(div);
    });
}

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

async function updateStatus(id, title, desc, newStatus) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, description: desc, status: newStatus })
    });
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
}

loadTasks();


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker zarejestrowany z sukcesem!'))
      .catch(err => console.error('Błąd rejestracji Service Workera:', err));
}