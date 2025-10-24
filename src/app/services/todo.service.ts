import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface Todo {
  id?: string;
  userId: string;
  title: string;
  completed: boolean;
  createDate?: number;
}

export type FilterType = 'all' | 'completed' | 'pending';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly apiUrl = 'https://68fb430694ec9606602557d1.mockapi.io/api/v1/to-dos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();
  
  private filterSubject = new BehaviorSubject<FilterType>('all');
  public filter$ = this.filterSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadTodos();
  }

  private loadTodos(): void {
    // Load from API on initialization
    this.fetchTodosFromApi().subscribe();
  }

  fetchTodosFromApi(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl).pipe(
      tap(todos => {
        // Sort by createDate descending (newest first)
        const sortedTodos = todos.sort((a, b) => {
          const dateA = a.createDate || 0;
          const dateB = b.createDate || 0;
          return dateB - dateA;
        });
        this.todosSubject.next(sortedTodos);
        this.saveToLocalStorage(sortedTodos);
      }),
      catchError(error => {
        console.error('Error fetching todos:', error);
        // Load from localStorage as fallback
        const localTodos = this.getLocalTodos();
        if (localTodos.length > 0) {
          this.todosSubject.next(localTodos);
        }
        return of([]);
      })
    );
  }

  getTodos(): Observable<Todo[]> {
    return this.todos$;
  }

  getFilteredTodos(): Observable<Todo[]> {
    return this.todos$.pipe(
      map(todos => {
        const filter = this.filterSubject.value;
        switch (filter) {
          case 'completed':
            return todos.filter(todo => todo.completed);
          case 'pending':
            return todos.filter(todo => !todo.completed);
          default:
            return todos;
        }
      })
    );
  }

  getTodoById(id: string): Observable<Todo | undefined> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching todo:', error);
        // Fallback to local search
        return this.todos$.pipe(
          map(todos => todos.find(todo => todo.id === id))
        );
      })
    );
  }

  addTodo(todo: Omit<Todo, 'id'>): Observable<Todo> {
    // Add createDate if not provided
    const todoWithDate = {
      ...todo,
      createDate: Math.floor(Date.now() / 1000) // Unix timestamp in seconds
    };
    
    return this.http.post<Todo>(this.apiUrl, todoWithDate).pipe(
      tap((newTodo) => {
        const currentTodos = this.todosSubject.value;
        // Sort by createDate descending (newest first)
        const updatedTodos = [newTodo, ...currentTodos].sort((a, b) => {
          const dateA = a.createDate || 0;
          const dateB = b.createDate || 0;
          return dateB - dateA;
        });
        this.todosSubject.next(updatedTodos);
        this.saveToLocalStorage(updatedTodos);
      }),
      catchError(error => {
        console.error('Error adding todo:', error);
        throw error;
      })
    );
  }

  updateTodo(id: string, updates: Partial<Todo>): Observable<Todo> {
    const currentTodos = this.todosSubject.value;
    const todoIndex = currentTodos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    const updatedTodo = { ...currentTodos[todoIndex], ...updates };

    return this.http.put<Todo>(`${this.apiUrl}/${id}`, updatedTodo).pipe(
      tap((responseTodo) => {
        const updatedTodos = [...currentTodos];
        updatedTodos[todoIndex] = responseTodo;
        // Sort by createDate descending (newest first)
        const sortedTodos = updatedTodos.sort((a, b) => {
          const dateA = a.createDate || 0;
          const dateB = b.createDate || 0;
          return dateB - dateA;
        });
        this.todosSubject.next(sortedTodos);
        this.saveToLocalStorage(sortedTodos);
      }),
      catchError(error => {
        console.error('Error updating todo:', error);
        throw error;
      })
    );
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentTodos = this.todosSubject.value;
        const updatedTodos = currentTodos.filter(todo => todo.id !== id);
        // Sort by createDate descending (newest first) - maintain sort order
        const sortedTodos = updatedTodos.sort((a, b) => {
          const dateA = a.createDate || 0;
          const dateB = b.createDate || 0;
          return dateB - dateA;
        });
        this.todosSubject.next(sortedTodos);
        this.saveToLocalStorage(sortedTodos);
      }),
      catchError(error => {
        console.error('Error deleting todo:', error);
        throw error;
      })
    );
  }

  toggleTodoComplete(id: string): Observable<Todo> {
    const currentTodos = this.todosSubject.value;
    const todo = currentTodos.find(t => t.id === id);
    
    if (!todo) {
      throw new Error('Todo not found');
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  setFilter(filter: FilterType): void {
    this.filterSubject.next(filter);
  }

  getFilter(): FilterType {
    return this.filterSubject.value;
  }

  private saveToLocalStorage(todos: Todo[]): void {
    if (!this.isBrowser) {
      return; // Skip localStorage operations on the server
    }
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private getLocalTodos(): Todo[] {
    if (!this.isBrowser) {
      return []; // Return empty array on the server
    }
    try {
      const todos = localStorage.getItem('todos');
      return todos ? JSON.parse(todos) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  // Get statistics
  getStats(): Observable<{ total: number; completed: number; pending: number }> {
    return this.todos$.pipe(
      map(todos => ({
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        pending: todos.filter(t => !t.completed).length
      }))
    );
  }
}

