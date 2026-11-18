/**
 * TASK MANAGER - MODERN CLIENT APPLICATION
 * Clean vanilla JS ES6+ interacting with Spring Boot REST API
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

// DOM Elements
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
    themeToggleBtn: document.getElementById('themeToggleBtn')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    loadAllData();
});

// Theme handling
function initTheme() {
    const saved = localStorage.getItem('task_manager_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('task_manager_theme', next);
}

// Event Listeners
function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Search input debounce
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.filters.search = e.target.value.trim();
            state.filters.page = 0;
            fetchTasks();
        }, 300);
    });

    // Filters
    elements.statusFilter.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        state.filters.page = 0;
        fetchTasks();
    });

    elements.priorityFilter.addEventListener('change', (e) => {
        state.filters.priority = e.target.value;
        state.filters.page = 0;
        fetchTasks();
    });

    elements.categoryFilter.addEventListener('change', (e) => {
        state.filters.categoryId = e.target.value;
        state.filters.page = 0;
        fetchTasks();
    });

    if (elements.overdueOnlyFilter) {
        elements.overdueOnlyFilter.addEventListener('change', (e) => {
            state.filters.overdueOnly = e.target.checked;
            state.filters.page = 0;
            fetchTasks();
        });
    }

    // View switcher
    elements.kanbanBtn.addEventListener('click', () => switchView('kanban'));
    elements.tableBtn.addEventListener('click', () => switchView('table'));

    // Forms
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);

    // Global Keyboard shortcuts
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
        if (!res.ok) throw new Error('Failed to load statistics');
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
        if (!res.ok) throw new Error('Failed to retrieve tasks');
        const json = await res.json();

        if (json.success && json.data) {
            state.tasks = json.data.content || [];
            renderTasks();
        }
    } catch (err) {
        console.error('Fetch tasks error:', err);
        showToast('Error fetching tasks from server', 'error');
    }
}

// Rendering Functions
function renderStats() {
    if (!state.stats) return;
    const { totalTasks, inProgressTasks, completedTasks, overdueTasks, completionRate } = state.stats;
    elements.totalTasksCount.textContent = totalTasks;
    elements.inProgressCount.textContent = inProgressTasks;
    elements.completedCount.textContent = completedTasks;
    elements.overdueCount.textContent = overdueTasks;
    elements.completionRateText.textContent = `${completionRate}% Completion`;
    elements.completionProgressBar.style.width = `${Math.min(100, completionRate)}%`;
}

function renderCategorySelects() {
    // Filter dropdown
    const filterOptions = state.categories.map(c => 
        `<option value="${c.id}">${escapeHtml(c.name)} (${c.taskCount || 0})</option>`
    ).join('');
    elements.categoryFilter.innerHTML = '<option value="">All Categories</option>' + filterOptions;

    // Modal select
    const modalOptions = state.categories.map(c => 
        `<option value="${c.id}">${escapeHtml(c.name)}</option>`
    ).join('');
    elements.taskCategorySelect.innerHTML = '<option value="">Select Category (Optional)</option>' + modalOptions;
}

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

    pendingCount.textContent = pendingTasks.length;
    progressCount.textContent = progressTasks.length;
    completedCount.textContent = completedTasks.length;

    pendingList.innerHTML = pendingTasks.length ? pendingTasks.map(createTaskCardHtml).join('') : getEmptyColumnHtml('No pending tasks');
    progressList.innerHTML = progressTasks.length ? progressTasks.map(createTaskCardHtml).join('') : getEmptyColumnHtml('No active tasks');
    completedList.innerHTML = completedTasks.length ? completedTasks.map(createTaskCardHtml).join('') : getEmptyColumnHtml('No completed tasks');
}

function getEmptyColumnHtml(msg) {
    return `<div class="empty-state" style="padding: 24px 10px; font-size: 12px;">${msg}</div>`;
}

function createTaskCardHtml(task) {
    const isCompleted = task.status === 'COMPLETED';
    const isOverdue = task.overdue;

    let priorityBadgeClass = 'badge-priority-medium';
    if (task.priority === 'URGENT') priorityBadgeClass = 'badge-priority-urgent';
    else if (task.priority === 'HIGH') priorityBadgeClass = 'badge-priority-high';
    else if (task.priority === 'LOW') priorityBadgeClass = 'badge-priority-low';

    const categoryHtml = task.category 
        ? `<span class="badge badge-category" style="border-left: 3px solid ${task.category.color || '#3b82f6'};">${escapeHtml(task.category.name)}</span>`
        : '';

    const dueHtml = task.dueDate 
        ? `<span class="badge badge-due ${isOverdue ? 'is-overdue' : ''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${isOverdue ? 'Overdue: ' : ''}${task.dueDate}
           </span>`
        : '';

    return `
    <div class="task-card ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
        <div class="task-card-header">
            <h4 class="task-title" onclick="openEditTaskModal(${task.id})">${escapeHtml(task.title)}</h4>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-card-meta">
            <span class="badge ${priorityBadgeClass}">${task.priority}</span>
            ${categoryHtml}
            ${dueHtml}
        </div>
        <div class="task-card-footer">
            <div class="task-status-actions">
                ${task.status !== 'COMPLETED' ? `
                    <button class="btn-ghost-sm" onclick="quickUpdateStatus(${task.id}, 'COMPLETED')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Done
                    </button>
                ` : `
                    <button class="btn-ghost-sm" onclick="quickUpdateStatus(${task.id}, 'IN_PROGRESS')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                        Reopen
                    </button>
                `}
                ${task.status === 'PENDING' ? `
                    <button class="btn-ghost-sm" onclick="quickUpdateStatus(${task.id}, 'IN_PROGRESS')">
                        Start
                    </button>
                ` : ''}
            </div>
            <div class="task-card-actions">
                <button class="btn-ghost-sm" title="Edit" onclick="openEditTaskModal(${task.id})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-ghost-sm btn-danger" title="Delete" onclick="deleteTask(${task.id})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
    </div>
    `;
}

function renderTable() {
    const tbody = document.getElementById('taskTableBody');
    if (!state.tasks.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No matching tasks found.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = state.tasks.map(task => {
        let priorityBadgeClass = 'badge-priority-medium';
        if (task.priority === 'URGENT') priorityBadgeClass = 'badge-priority-urgent';
        else if (task.priority === 'HIGH') priorityBadgeClass = 'badge-priority-high';
        else if (task.priority === 'LOW') priorityBadgeClass = 'badge-priority-low';

        return `
        <tr>
            <td style="width: 40px;">
                <input type="checkbox" ${task.status === 'COMPLETED' ? 'checked' : ''} 
                       onchange="quickUpdateStatus(${task.id}, this.checked ? 'COMPLETED' : 'IN_PROGRESS')" 
                       style="cursor: pointer; accent-color: #10b981;">
            </td>
            <td>
                <div style="font-weight: 600; cursor: pointer;" onclick="openEditTaskModal(${task.id})">
                    ${escapeHtml(task.title)}
                </div>
                ${task.description ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(task.description).substring(0, 70)}...</div>` : ''}
            </td>
            <td>
                <span class="badge ${priorityBadgeClass}">${task.priority}</span>
            </td>
            <td>
                <span class="badge" style="background: rgba(255,255,255,0.06);">${task.status}</span>
            </td>
            <td>
                ${task.category ? `<span class="badge badge-category" style="border-left: 3px solid ${task.category.color || '#3b82f6'};">${escapeHtml(task.category.name)}</span>` : '-'}
            </td>
            <td>
                <span style="font-size: 12px; ${task.overdue ? 'color: #f87171; font-weight: 600;' : ''}">
                    ${task.dueDate || '-'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn-ghost-sm" onclick="openEditTaskModal(${task.id})">Edit</button>
                <button class="btn-ghost-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Modal Handlers
function openCreateTaskModal() {
    state.editingTaskId = null;
    elements.taskModalTitle.textContent = 'Create New Task';
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
    elements.taskModalTitle.textContent = 'Edit Task';
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
        showToast('Please enter a task title', 'error');
        return;
    }

    const payload = {
        title,
        description,
        priority,
        status,
        dueDate,
        categoryId
    };

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
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Error saving task');
        }

        showToast(state.editingTaskId ? 'Task updated successfully' : 'Task created successfully', 'success');
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
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to update status');
        }
        showToast(`Task status updated to ${newStatus}`, 'success');
        await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
        console.error('Status patch error:', err);
        showToast(err.message, 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to delete task');
        }
        showToast('Task deleted successfully', 'info');
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
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Error creating category');
        }

        showToast(`Category "${name}" created!`, 'success');
        closeCategoryModal();
        await fetchCategories();
    } catch (err) {
        console.error('Category error:', err);
        showToast(err.message, 'error');
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
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

// Export functions to window for onclick handlers
window.openCreateTaskModal = openCreateTaskModal;
window.openEditTaskModal = openEditTaskModal;
window.closeTaskModal = closeTaskModal;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.quickUpdateStatus = quickUpdateStatus;
window.deleteTask = deleteTask;
