// Constants
const STORAGE_KEY = 'todos';
const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';
const FILTER_COMPLETED = 'completed';
const ITEMS_PER_PAGE = 10;

// DOM elements
const todoInput = document.getElementById('newTodo');
const addButton = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const itemsLeft = document.getElementById('itemsLeft');
const filterButtons = document.querySelectorAll('.filter-btn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Application state
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = FILTER_ALL;
let todoToDelete = null;
let currentPage = 1;

// Functions
const saveTodos = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const updateItemsLeft = () => {
  const activeCount = todos.filter(todo => !todo.completed).length;
  itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
};

const showDeleteModal = (todoId) => {
  todoToDelete = todoId;
  deleteModal.setAttribute('aria-hidden', 'false');
  confirmDeleteBtn.focus();
};

const hideDeleteModal = () => {
  deleteModal.setAttribute('aria-hidden', 'true');
  todoToDelete = null;
};

const createTodoElement = (todo) => {
  const li = document.createElement('li');
  li.className = 'todo-item-row';

  // Task text
  const textDiv = document.createElement('div');
  textDiv.className = 'todo-text';
  textDiv.textContent = todo.text;
  textDiv.title = 'Click to toggle status';
  textDiv.addEventListener('click', () => handleToggleTodo(todo.id));

  // Status badge
  const statusSpan = document.createElement('span');
  statusSpan.className = 'status-badge ' + (todo.completed ? 'completed' : 'pending');
  statusSpan.textContent = todo.completed ? 'Completed' : 'Pending';

  // Delete icon
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-icon-btn';
  deleteBtn.title = 'Delete';
  deleteBtn.setAttribute('aria-label', 'Delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showDeleteModal(todo.id);
  });
  deleteBtn.innerHTML = `
    <svg class="delete-icon" viewBox="0 0 24 24">
      <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  li.appendChild(textDiv);
  li.appendChild(statusSpan);
  li.appendChild(deleteBtn);

  return li;
};

const getFilteredTodos = () => {
  return todos.filter(todo => {
    if (currentFilter === FILTER_ALL) return true;
    if (currentFilter === FILTER_ACTIVE) return !todo.completed;
    if (currentFilter === FILTER_COMPLETED) return todo.completed;
    return true;
  });
};

const updatePagination = (filteredTodos) => {
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  currentPage = Math.min(currentPage, Math.max(1, totalPages));

  // Show/hide pagination buttons based on current page and total pages
  prevPageBtn.classList.toggle('hidden', currentPage === 1);
  nextPageBtn.classList.toggle('hidden', currentPage === totalPages || totalPages === 0);

  // Update page info
  pageInfo.textContent = totalPages > 0
    ? `Page ${currentPage} of ${totalPages}`
    : 'No items to display';
};

const renderTodos = () => {
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';
  const filteredTodos = getFilteredTodos();
  updatePagination(filteredTodos);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

  paginatedTodos.forEach(todo => {
    todoList.appendChild(createTodoElement(todo));
  });

  updateItemsLeft();
};

const handleAddTodo = () => {
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now(),
    text,
    completed: false
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
};

const handleToggleTodo = (id) => {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
};

const handleDeleteTodo = () => {
  if (!todoToDelete) return;

  todos = todos.filter(todo => todo.id !== todoToDelete);
  saveTodos();
  renderTodos();
  hideDeleteModal();
};

const handleFilterChange = (filter) => {
  currentFilter = filter;
  currentPage = 1;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTodos();
};

const handlePageChange = (direction) => {
  currentPage += direction;
  renderTodos();
};

// Event handlers
addButton.addEventListener('click', handleAddTodo);
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleAddTodo();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    handleFilterChange(btn.dataset.filter);
  });
});

confirmDeleteBtn.addEventListener('click', handleDeleteTodo);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

prevPageBtn.addEventListener('click', () => handlePageChange(-1));
nextPageBtn.addEventListener('click', () => handlePageChange(1));

// Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    hideDeleteModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && deleteModal.getAttribute('aria-hidden') === 'false') {
    hideDeleteModal();
  }
});

// Initialize
renderTodos(); 