import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { TodoItem } from '../models/todo-item.model';
import {
  Firestore, // Импортируем Firestore
  collection, // Для работы с коллекциями
  collectionData, // Для получения данных коллекции в реальном времени
  doc, // Для ссылки на документ
  addDoc, // Для добавления документа
  updateDoc, // Для обновления документа
  deleteDoc, // Для удаления документа
  orderBy, // Для сортировки запросов
  query, // Для создания запросов
  CollectionReference, // Тип для ссылки на коллекцию
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private firestore: Firestore = inject(Firestore); // Инжектируем Firestore
  private readonly collectionPath = 'todos'; // Путь к коллекции в Firestore
  private todosCollection: CollectionReference<TodoItem>; // Ссылка на коллекцию

  private tasksSignal: WritableSignal<TodoItem[]> = signal<TodoItem[]>([]);
  public readonly tasks = this.tasksSignal.asReadonly();

  constructor() {
    // Получаем ссылку на коллекцию 'todos' и создаем запрос с сортировкой по createdAt
    this.todosCollection = collection(this.firestore, this.collectionPath) as CollectionReference<TodoItem>;
    this.loadTasks();
  }

  private loadTasks(): void {
    // Создаем запрос для получения задач, отсортированных по createdAt по убыванию
    const q = query(this.todosCollection, orderBy('createdAt', 'desc'));

    // Подписываемся на изменения в коллекции в реальном времени
    collectionData(q, { idField: 'id' }).subscribe({
      next: (tasks: TodoItem[]) => {
        this.tasksSignal.set(tasks);
        console.log(`Firestore: Загружено ${tasks.length} задач.`);
      },
      error: (error) => console.error('Firestore: Ошибка при загрузке задач:', error)
    });
  }

  async addTask(text: string): Promise<void> { // <--- Добавили async и Promise<void>
    if (text.trim() === '') return; // Можно добавить console.warn или вернуть Promise.resolve()

    // Генерируем новую ссылку с уникальным ключом в Firebase
    const newTaskData: Omit<TodoItem, 'id'> = { // Firestore сам сгенерирует id
      text: text.trim(),
      completed: false,
      createdAt: Date.now() // Используем временную метку
    };

    try {
      // Добавляем документ в коллекцию
      const docRef = await addDoc(this.todosCollection, newTaskData);
      console.log('Firestore: Задача успешно добавлена, ID документа:', docRef.id);
    } catch (error) {
      console.error('Firestore: Ошибка при добавлении задачи:', error);
    }
  }

  async toggleTaskCompletion(idToToggle: string): Promise<void> {
    if (!idToToggle) {
      console.warn('Firestore: Попытка переключить состояние задачи с пустым ID.');
      return;
    }
    // Получаем ссылку на документ по ID
    const taskDocRef = doc(this.firestore, this.collectionPath, idToToggle);
    const currentTask = this.tasksSignal().find(t => t.id === idToToggle);

    if (!currentTask) {
      console.warn(`Firestore: Задача с ID ${idToToggle} не найдена в локальном списке для обновления.`);
      // Можно попробовать обновить напрямую, но лучше иметь локальное состояние актуальным
      // return;
    }

    try {
      // Обновляем поле completed в документе
      await updateDoc(taskDocRef, { completed: !currentTask?.completed }); // Используем currentTask?.completed или false по умолчанию
      console.log(`Firestore: Состояние задачи ${idToToggle} обновлено.`);
    } catch (error) {
      console.error(`Firestore: Ошибка при обновлении состояния задачи ${idToToggle}:`, error);
    }
  }

  async deleteTask(idToDelete: string): Promise<void> {
    if (!idToDelete) {
      console.warn('Firestore: Попытка удалить задачу с пустым ID.');
      return;
    }
    // Получаем ссылку на документ по ID
    const taskDocRef = doc(this.firestore, this.collectionPath, idToDelete);
    try {
      // Удаляем документ
      await deleteDoc(taskDocRef);
      console.log(`Firestore: Задача ${idToDelete} удалена.`);
    } catch (error) {
      console.error(`Firestore: Ошибка при удалении задачи ${idToDelete}:`, error);
    }
  }
}