/**
 * TASKPULSE - ARTISANAL PASTEL TASK STUDIO
 * Client Script: Dynamic Pastel UI with Spring Boot REST API
 */

const API_BASE = '/api/v1';

// Application State
const state = {
    tasks: [],
    categories: [],
    stats: null,
    viewMode: 'kanban', // 'kanban' | 'table'
    filters: {
        status: '',
        priority: '',
        categoryId: '',
        search: '',
        overdueOnly: false,
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        sortDir: 'desc'
    },
    editingTaskId: null
};

// DOM References
const elements = {
    totalTasksCount: document.getElementById('totalTasksCount'),
    inProgressCount: document.getElementById('inProgressCount'),
    completedCount: document.getElementById('completedCount'),
    overdueCount: document.getElementById('overdueCount'),
    completionRateText: document.getElementById('completionRateText'),
    completionProgressBar: document.getElementById('completionProgressBar'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    priorityFilter: document.getElementById('priorityFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    overdueOnlyFilter: document.getElementById('overdueOnlyFilter'),
    kanbanView: document.getElementById('kanbanView'),
    tableView: document.getElementById('tableView'),
    kanbanBtn: document.getElementById('kanbanBtn'),
    tableBtn: document.getElementById('tableBtn'),
    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskCategorySelect: document.getElementById('taskCategory'),
    categoryModal: document.getElementById('categoryModal'),
    categoryForm: document.getElementById('categoryForm'),
    toastContainer: document.getElementById('toastContainer'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    quickTaskInput: document.getElementById('quickTaskInput'),
    liveGreetingText: document.getElementById('liveGreetingText')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initGreeting();
    initTheme();
    setupEventListeners();
    setupColorSwatches();
    loadAllData();
});

// Dynamic Greeting
function initGreeting() {
    if (!elements.liveGreetingText) return;
    const hour = new Date().getHours();
    let greeting = 'Good day, Maker ✨';
    if (hour >= 5 && hour < 12) greeting = 'Good morning, Maker ☕';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon, Maker 🌤️';
    else if (hour >= 17 && hour < 22) greeting = 'Good evening, Maker 🌙';
    else greeting = 'Night owl mode ✨';
    elements.liveGreetingText.textContent = greeting;
}

// Theme handling
function initTheme() {
    const saved = localStorage.getItem('task_manager_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('task_manager_theme', next);
    showToast(next === 'dark' ? 'Switched to Midnight Plum theme 🌙' : 'Switched to Cream Pastel theme 🌸', 'info');
}

// Color Swatches in Category Modal
function setupColorSwatches() {
    const swatches = document.querySelectorAll('.swatch-btn');
    const colorInput = document.getElementById('categoryColor');
    swatches.forEach(btn => {
        btn.addEventListener('click', () => {
            swatches.forEach(s => s.style.borderColor = 'transparent');
            btn.style.borderColor = '#1f1c18';
            if (colorInput) colorInput.value = btn.dataset.color;
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Quick Composer (Brain Dump)
    if (elements.quickTaskInput) {
        elements.quickTaskInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && elements.quickTaskInput.value.trim()) {
                e.preventDefault();
                await handleQuickAdd(elements.quickTaskInput.value.trim());
                elements.quickTaskInput.value = '';
            }
        });
    }

    // Search input with debounce
    let searchTimeout;
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.filters.search = e.target.value.trim();
                state.filters.page = 0;
                fetchTasks();
            }, 300);
        });
    }

    // Filters
    if (elements.statusFilter) {
        elements.statusFilter.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            state.filters.page = 0;
            fetchTasks();
        });
    }

    if (elements.priorityFilter) {
        elements.priorityFilter.addEventListener('change', (e) => {
            state.filters.priority = e.target.value;
            state.filters.page = 0;
            fetchTasks();
        });
    }

    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', (e) => {
            state.filters.categoryId = e.target.value;
            state.filters.page = 0;
            fetchTasks();
        });
    }

    if (elements.overdueOnlyFilter) {
        elements.overdueOnlyFilter.addEventListener('change', (e) => {
            state.filters.overdueOnly = e.target.checked;
            state.filters.page = 0;
            fetchTasks();
        });
    }

    // View switchers
    if (elements.kanbanBtn) elements.kanbanBtn.addEventListener('click', () => switchView('kanban'));
    if (elements.tableBtn) elements.tableBtn.addEventListener('click', () => switchView('table'));

    // Forms
    if (elements.taskForm) elements.taskForm.addEventListener('submit', handleTaskSubmit);
    if (elements.categoryForm) elements.categoryForm.addEventListener('submit', handleCategorySubmit);

    // Global Hotkeys
    window.addEventListener('keydown', (e) => {
        if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            openCreateTaskModal();
        } else if (e.key === 'Escape') {
            closeAllModals();
        } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });
}

function switchView(mode) {
    state.viewMode = mode;
    if (mode === 'kanban') {
        elements.kanbanView.style.display = 'grid';
        elements.tableView.style.display = 'none';
        elements.kanbanBtn.classList.add('active');
        elements.tableBtn.classList.remove('active');
    } else {
        elements.kanbanView.style.display = 'none';
        elements.tableView.style.display = 'block';
        elements.tableBtn.classList.add('active');
        elements.kanbanBtn.classList.remove('active');
    }
    renderTasks();
}

// Data Fetching
async function loadAllData() {
    await Promise.all([fetchCategories(), fetchStats(), fetchTasks()]);
}

async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        if (!res.ok) throw new Error('Failed to load stats');
        const json = await res.json();
        if (json.success && json.data) {
            state.stats = json.data;
            renderStats();
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Failed to load categories');
        const json = await res.json();
        if (json.success && json.data) {
            state.categories = json.data;
            renderCategorySelects();
        }
    } catch (err) {
        console.error('Categories error:', err);
    }
}

async function fetchTasks() {
    try {
        const params = new URLSearchParams();
        if (state.filters.status) params.append('status', state.filters.status);
        if (state.filters.priority) params.append('priority', state.filters.priority);
        if (state.filters.categoryId) params.append('categoryId', state.filters.categoryId);
        if (state.filters.search) params.append('search', state.filters.search);
        if (state.filters.overdueOnly) params.append('overdueOnly', 'true');
        params.append('page', state.filters.page);
        params.append('size', state.filters.size);
        params.append('sortBy', state.filters.sortBy);
        params.append('sortDir', state.filters.sortDir);

        const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load tasks');
        const json = await res.json();

        if (json.success && json.data) {
            state.tasks = json.data.content || [];
            renderTasks();
        }
    } catch (err) {
        console.error('Fetch tasks error:', err);
        showToast('Could not sync tasks with server', 'error');
    }
}

// Quick Add Handler
async function handleQuickAdd(title) {
    try {
        const payload = {
            title,
            description: null,
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: null,
            categoryId: state.categories.length ? state.categories[0].id : null
        };

        const res = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Error creating task');

        showToast(`🌱 Added "${title}" to your Backlog!`, 'success');
        await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
        console.error('Quick add error:', err);
        showToast(err.message, 'error');
    }
}

// Render Stats
function renderStats() {
    if (!state.stats) return;
    const { totalTasks, inProgressTasks, completedTasks, overdueTasks, completionRate } = state.stats;
    if (elements.totalTasksCount) elements.totalTasksCount.textContent = totalTasks;
    if (elements.inProgressCount) elements.inProgressCount.textContent = inProgressTasks;
    if (elements.completedCount) elements.completedCount.textContent = completedTasks;
    if (elements.overdueCount) elements.overdueCount.textContent = overdueTasks;
    if (elements.completionRateText) elements.completionRateText.textContent = `${completionRate}% Done & Dusted`;
    if (elements.completionProgressBar) elements.completionProgressBar.style.width = `${Math.min(100, completionRate)}%`;
}

// Render Category Dropdowns
function renderCategorySelects() {
    // Filter dropdown
    const filterOptions = state.categories.map(c => 
        `<option value="${c.id}">${escapeHtml(c.name)} (${c.taskCount || 0})</option>`
    ).join('');
    if (elements.categoryFilter) {
        elements.categoryFilter.innerHTML = '<option value="">Category: All</option>' + filterOptions;
    }

    // Modal select
    const modalOptions = state.categories.map(c => 
        `<option value="${c.id}">${escapeHtml(c.name)}</option>`
    ).join('');
    if (elements.taskCategorySelect) {
        elements.taskCategorySelect.innerHTML = '<option value="">Select a Category (Optional)</option>' + modalOptions;
    }
}

// Render Tasks
function renderTasks() {
    if (state.viewMode === 'kanban') {
        renderKanban();
    } else {
        renderTable();
    }
}

function renderKanban() {
    const pendingList = document.getElementById('pendingCardList');
    const progressList = document.getElementById('progressCardList');
    const completedList = document.getElementById('completedCardList');

    const pendingCount = document.getElementById('pendingColCount');
    const progressCount = document.getElementById('progressColCount');
    const completedCount = document.getElementById('completedColCount');

    const pendingTasks = state.tasks.filter(t => t.status === 'PENDING');
    const progressTasks = state.tasks.filter(t => t.status === 'IN_PROGRESS');
    const completedTasks = state.tasks.filter(t => t.status === 'COMPLETED');

    if (pendingCount) pendingCount.textContent = pendingTasks.length;
    if (progressCount) progressCount.textContent = progressTasks.length;
    if (completedCount) completedCount.textContent = completedTasks.length;

    if (pendingList) {
        pendingList.innerHTML = pendingTasks.length 
            ? pendingTasks.map(createTaskTicketHtml).join('') 
            : '<div class="empty-shelf">No tasks here yet... Add one! ✨</div>';
    }
    if (progressList) {
        progressList.innerHTML = progressTasks.length 
            ? progressTasks.map(createTaskTicketHtml).join('') 
            : '<div class="empty-shelf">Nothing in motion right now ☕</div>';
    }
    if (completedList) {
        completedList.innerHTML = completedTasks.length 
            ? completedTasks.map(createTaskTicketHtml).join('') 
            : '<div class="empty-shelf">Complete a task to celebrate here! 🌸</div>';
    }
}

function createTaskTicketHtml(task) {
    const isCompleted = task.status === 'COMPLETED';
    const isOverdue = task.overdue;

    let priorityTag = '<span class="pastel-tag tag-medium">🌱 Medium</span>';
    if (task.priority === 'URGENT') priorityTag = '<span class="pastel-tag tag-urgent">🔥 Urgent</span>';
    else if (task.priority === 'HIGH') priorityTag = '<span class="pastel-tag tag-high">⚡ High</span>';
    else if (task.priority === 'LOW') priorityTag = '<span class="pastel-tag tag-low">🍃 Low</span>';

    const categoryHtml = task.category 
        ? `<span class="pastel-tag tag-category" style="background-color: ${task.category.color ? task.category.color + '26' : 'var(--bg-subtle)'}; border-color: ${task.category.color || 'var(--border-medium)'};">
            ${escapeHtml(task.category.name)}
           </span>`
        : '';

    // Humanized Due Date
    let dueHtml = '';
    if (task.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        let humanLabel = task.dueDate;
        if (task.dueDate === today) humanLabel = 'Due Today ☕';
        dueHtml = `<span class="pastel-tag tag-due ${isOverdue ? 'is-overdue' : ''}">
            ${isOverdue ? '⏳ Overdue: ' : '📅 '}${humanLabel}
        </span>`;
    }

    return `
    <div class="task-ticket ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
        <div class="ticket-header">
            <h4 class="ticket-title" onclick="openEditTaskModal(${task.id})">${escapeHtml(task.title)}</h4>
        </div>
        ${task.description ? `<p class="ticket-body">${escapeHtml(task.description)}</p>` : ''}
        <div class="ticket-tags-row">
            ${priorityTag}
            ${categoryHtml}
            ${dueHtml}
        </div>
        <div class="ticket-footer">
            <div class="ticket-actions-left">
                ${task.status !== 'COMPLETED' ? `
                    <button class="btn-pill-action btn-done" onclick="quickUpdateStatus(${task.id}, 'COMPLETED')">
                        <span>✨ Mark Done</span>
                    </button>
                ` : `
                    <button class="btn-pill-action btn-reopen" onclick="quickUpdateStatus(${task.id}, 'IN_PROGRESS')">
                        <span>↩ Reopen</span>
                    </button>
                `}
                ${task.status === 'PENDING' ? `
                    <button class="btn-pill-action" onclick="quickUpdateStatus(${task.id}, 'IN_PROGRESS')">
                        <span>Start ⚡</span>
                    </button>
                ` : ''}
            </div>
            <div class="ticket-actions-right">
                <button class="btn-icon-soft" title="Edit Task" onclick="openEditTaskModal(${task.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon-soft btn-trash" title="Delete Task" onclick="deleteTask(${task.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
    </div>
    `;
}

function renderTable() {
    const tbody = document.getElementById('taskTableBody');
    if (!tbody) return;

    if (!state.tasks.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-shelf">No matching tasks found.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = state.tasks.map(task => {
        let priorityTag = '<span class="pastel-tag tag-medium">🌱 Medium</span>';
        if (task.priority === 'URGENT') priorityTag = '<span class="pastel-tag tag-urgent">🔥 Urgent</span>';
        else if (task.priority === 'HIGH') priorityTag = '<span class="pastel-tag tag-high">⚡ High</span>';
        else if (task.priority === 'LOW') priorityTag = '<span class="pastel-tag tag-low">🍃 Low</span>';

        return `
        <tr>
            <td style="width: 44px;">
                <input type="checkbox" ${task.status === 'COMPLETED' ? 'checked' : ''} 
                       onchange="quickUpdateStatus(${task.id}, this.checked ? 'COMPLETED' : 'IN_PROGRESS')" 
                       style="cursor: pointer; width: 18px; height: 18px; accent-color: #059669;">
            </td>
            <td>
                <div style="font-weight: 700; cursor: pointer; color: var(--text-main);" onclick="openEditTaskModal(${task.id})">
                    ${escapeHtml(task.title)}
                </div>
                ${task.description ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(task.description).substring(0, 65)}...</div>` : ''}
            </td>
            <td>${priorityTag}</td>
            <td>
                <span class="pastel-tag tag-category">${task.status}</span>
            </td>
            <td>
                ${task.category ? `<span class="pastel-tag tag-category" style="border-left: 3px solid ${task.category.color || '#fed7aa'};">${escapeHtml(task.category.name)}</span>` : '-'}
            </td>
            <td>
                <span style="font-size: 12px; font-weight: 600; ${task.overdue ? 'color: #e11d48;' : ''}">
                    ${task.dueDate || '-'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn-pill-action" onclick="openEditTaskModal(${task.id})">Edit</button>
                <button class="btn-pill-action" style="color: #e11d48;" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Modal Handlers
function openCreateTaskModal() {
    state.editingTaskId = null;
    elements.taskModalTitle.textContent = '✨ Create Task';
    elements.taskForm.reset();
    document.getElementById('taskPriority').value = 'MEDIUM';
    document.getElementById('taskStatus').value = 'PENDING';
    elements.taskModal.classList.add('active');
    document.getElementById('taskTitle').focus();
}

function openEditTaskModal(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    state.editingTaskId = id;
    elements.taskModalTitle.textContent = '📝 Edit Task';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDueDate').value = task.dueDate || '';
    elements.taskCategorySelect.value = task.category ? task.category.id : '';

    elements.taskModal.classList.add('active');
}

function closeTaskModal() {
    elements.taskModal.classList.remove('active');
    state.editingTaskId = null;
}

function openCategoryModal() {
    elements.categoryForm.reset();
    elements.categoryModal.classList.add('active');
    document.getElementById('categoryName').focus();
}

function closeCategoryModal() {
    elements.categoryModal.classList.remove('active');
}

function closeAllModals() {
    closeTaskModal();
    closeCategoryModal();
}

// Form Submissions
async function handleTaskSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value || null;
    const categoryIdVal = elements.taskCategorySelect.value;
    const categoryId = categoryIdVal ? Number(categoryIdVal) : null;

    if (!title) {
        showToast('Please provide a task title 🌸', 'error');
        return;
    }

    const payload = { title, description, priority, status, dueDate, categoryId };

    try {
        let res;
        if (state.editingTaskId) {
            res = await fetch(`${API_BASE}/tasks/${state.editingTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Error saving task');

        showToast(state.editingTaskId ? 'Task updated cleanly ✨' : 'Task added to board 🌸', 'success');
        closeTaskModal();
        await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
        console.error('Save task error:', err);
        showToast(err.message, 'error');
    }
}

async function quickUpdateStatus(taskId, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update status');

        if (newStatus === 'COMPLETED') {
            showToast('🎉 Celebrated and Done! Great work!', 'success');
        } else {
            showToast(`Task moved to ${newStatus} ✨`, 'info');
        }

        await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
        console.error('Status patch error:', err);
        showToast(err.message, 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to remove this task?')) return;

    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete task');

        showToast('Task removed from board 🍃', 'info');
        await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
        console.error('Delete error:', err);
        showToast(err.message, 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('categoryName').value.trim();
    const color = document.getElementById('categoryColor').value;
    const description = document.getElementById('categoryDesc').value.trim();

    if (!name) {
        showToast('Category name is required', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, color, description })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Error creating category');

        showToast(`Pastel tag "${name}" created! 🏷️`, 'success');
        closeCategoryModal();
        await fetchCategories();
    } catch (err) {
        console.error('Category error:', err);
        showToast(err.message, 'error');
    }
}

// Toast System
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-bubble toast-${type}`;
    
    let emoji = '🌸';
    if (type === 'success') emoji = '✨';
    else if (type === 'error') emoji = '⚠️';
    else if (type === 'info') emoji = '💡';

    toast.innerHTML = `<span style="font-size: 16px;">${emoji}</span> <span>${escapeHtml(message)}</span>`;
    if (elements.toastContainer) elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3600);
}

// Utility
function escapeHtml(str) {
    if (!str) return '';
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

// Window bindings
window.openCreateTaskModal = openCreateTaskModal;
window.openEditTaskModal = openEditTaskModal;
window.closeTaskModal = closeTaskModal;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.quickUpdateStatus = quickUpdateStatus;
window.deleteTask = deleteTask;
