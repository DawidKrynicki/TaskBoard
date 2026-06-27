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
        
        
        div.id = `task-${task.id}`;
        div.draggable = true;
        div.ondragstart = (e) => {
            e.dataTransfer.setData('taskId', task.id);
            e.dataTransfer.setData('taskTitle', task.title);
            e.dataTransfer.setData('taskDesc', task.description || '');
        };
        
        div.innerHTML = `
            <div>
                <strong style="font-size: 1.1em;">${task.title}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">${task.description || ''}</p>
            </div>
            <div class="task-actions">
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


function allowDrop(ev) {
    ev.preventDefault(); 
}

async function drop(ev, newStatus) {
    ev.preventDefault();
    
    const id = ev.dataTransfer.getData('taskId');
    const title = ev.dataTransfer.getData('taskTitle');
    const desc = ev.dataTransfer.getData('taskDesc');
    
    
    if (id && title) {
        await updateStatus(id, title, desc, newStatus);
    }
}

loadTasks();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker zarejestrowany z sukcesem!'))
      .catch(err => console.error('Błąd rejestracji Service Workera:', err));
}