import './styles.scss';
import { Todo, TodoState, FilterType } from './types';

// Constants
const STORAGE_KEY = 'todos';
const ITEMS_PER_PAGE = 10;

// DOM elements
const todoInput = document.getElementById('newTodo') as HTMLInputElement;
const addButton = document.getElementById('addTodo') as HTMLButtonElement;
const todoList = document.getElementById('todoList') as HTMLUListElement;
const itemsLeft = document.getElementById('itemsLeft') as HTMLSpanElement;
const filterButtons = document.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
const deleteModal = document.getElementById('deleteModal') as HTMLDivElement;
const confirmDeleteBtn = document.getElementById('confirmDelete') as HTMLButtonElement;
const cancelDeleteBtn = document.getElementById('cancelDelete') as HTMLButtonElement;
const prevPageBtn = document.getElementById('prevPage') as HTMLButtonElement;
const nextPageBtn = document.getElementById('nextPage') as HTMLButtonElement;
const pageInfo = document.getElementById('pageInfo') as HTMLSpanElement;

// Application state
const state: TodoState = {
  todos: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  currentFilter: 'all',
  currentPage: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  todoToDelete: null
};

// Utility functions
const saveTodos = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
};

const updateItemsLeft = (): void => {
  const activeCount = state.todos.filter(todo => !todo.completed).length;
  itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
};

const showDeleteModal = (todoId: number): void => {
  state.todoToDelete = todoId;
  deleteModal.setAttribute('aria-hidden', 'false');
  confirmDeleteBtn.focus();
};

const hideDeleteModal = (): void => {
  deleteModal.setAttribute('aria-hidden', 'true');
  state.todoToDelete = null;
};

const createTodoElement = (todo: Todo): HTMLLIElement => {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = todo.id.toString();

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => handleToggleTodo(todo.id));

  const span = document.createElement('span');
  span.className = `todo-text ${todo.completed ? 'completed' : ''}`;
  span.textContent = todo.text;

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => showDeleteModal(todo.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteButton);

  return li;
};

const getFilteredTodos = (): Todo[] => {
  return state.todos.filter(todo => {
    if (state.currentFilter === 'all') return true;
    if (state.currentFilter === 'active') return !todo.completed;
    if (state.currentFilter === 'completed') return todo.completed;
    return true;
  });
};

const updatePagination = (filteredTodos: Todo[]): void => {
  const totalPages = Math.ceil(filteredTodos.length / state.itemsPerPage);
  state.currentPage = Math.min(state.currentPage, Math.max(1, totalPages));

  prevPageBtn.classList.toggle('hidden', state.currentPage === 1);
  nextPageBtn.classList.toggle('hidden', state.currentPage === totalPages || totalPages === 0);

  pageInfo.textContent = totalPages > 0
    ? `Page ${state.currentPage} of ${totalPages}`
    : 'No items to display';
};

const renderTodos = (): void => {
  todoList.innerHTML = '';
  const filteredTodos = getFilteredTodos();
  updatePagination(filteredTodos);

  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

  paginatedTodos.forEach(todo => {
    todoList.appendChild(createTodoElement(todo));
  });

  updateItemsLeft();
};

// Event handlers
const handleAddTodo = (): void => {
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false
  };

  state.todos.push(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
};

const handleToggleTodo = (id: number): void => {
  state.todos = state.todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
};

const handleDeleteTodo = (): void => {
  if (!state.todoToDelete) return;

  state.todos = state.todos.filter(todo => todo.id !== state.todoToDelete);
  saveTodos();
  renderTodos();
  hideDeleteModal();
};

const handleFilterChange = (filter: FilterType): void => {
  state.currentFilter = filter;
  state.currentPage = 1;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTodos();
};

const handlePageChange = (direction: number): void => {
  state.currentPage += direction;
  renderTodos();
};

// Event listeners
addButton.addEventListener('click', handleAddTodo);
todoInput.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleAddTodo();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    handleFilterChange(btn.dataset.filter as FilterType);
  });
});

confirmDeleteBtn.addEventListener('click', handleDeleteTodo);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

prevPageBtn.addEventListener('click', () => handlePageChange(-1));
nextPageBtn.addEventListener('click', () => handlePageChange(1));

deleteModal.addEventListener('click', (e: MouseEvent) => {
  if (e.target === deleteModal) {
    hideDeleteModal();
  }
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && deleteModal.getAttribute('aria-hidden') === 'false') {
    hideDeleteModal();
  }
});

// Initialize
renderTodos(); 