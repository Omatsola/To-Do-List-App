// DOM Elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');


// App State
let tasks = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
});

// Add New Task
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value,
    completed: false
  };

  tasks.unshift(newTask);
  saveAndRender();

  // Reset Form
  taskInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
});

// Task List Actions (Toggle & Delete via Event Delegation)
taskList.addEventListener('click', (e) => {
  const target = e.target;
  const taskItem = target.closest('.task-item');
  if (!taskItem) return;

  const taskId = taskItem.dataset.id;

  // Toggle Completion
  if (target.classList.contains('task-checkbox')) {
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: target.checked };
      }
      return task;
    });
    saveAndRender();
  }

  // Delete Task
  if (target.classList.contains('delete-btn')) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveAndRender();
  }
});

// Filter Tasks
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Clear Completed Tasks
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveAndRender();
});

// Save to LocalStorage and Render UI
function saveAndRender() {
  localStorage.setItem('todos', JSON.stringify(tasks));
  renderTasks();
}

// Render Tasks based on Current Filter
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';

    li.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''}
        >
        <div class="task-details">
          <span class="task-text">${escapeHTML(task.text)}</span>
          <div class="task-meta">
            <span class="badge ${task.priority}">${task.priority}</span>
            ${formattedDate ? `<span class="due-date">Due: ${formattedDate}</span>` : ''}
          </div>
        </div>
      </div>
      <button class="delete-btn" title="Delete Task">&times;</button>
    `;

    taskList.appendChild(li);
  });

  // Update Footer Count
  const activeCount = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
}

// Security Helper to prevent HTML Injection
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}