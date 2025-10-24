import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo, FilterType } from '../../services/todo.service';
import { TodoFormComponent } from '../../pages/todos/todo-form/todo-form.component';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzCheckboxModule,
    NzInputModule,
    NzSelectModule,
    NzEmptyModule,
    NzModalModule,
    NzPopconfirmModule,
    NzTagModule,
    NzStatisticModule,
    NzGridModule,
    NzSpaceModule,
    NzToolTipModule,
    NzPaginationModule,
    TodoFormComponent
  ],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  displayedTodos: Todo[] = [];
  currentFilter: FilterType = 'all';
  searchText: string = '';
  stats = { total: 0, completed: 0, pending: 0 };
  
  // Pagination
  pageIndex: number = 1;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  total: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private todoService: TodoService,
    private modal: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTodos();
    this.loadStats();
    
    // Subscribe to filter changes
    this.todoService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filter => {
        this.currentFilter = filter;
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  loadTodos(): void {
    this.todoService.getTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(todos => {
        this.todos = todos;
        this.applyFilters();
      });
  }

  loadStats(): void {
    this.todoService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
        this.cdr.detectChanges();
      });
  }

  applyFilters(): void {
    let filtered = [...this.todos];

    // Apply status filter
    if (this.currentFilter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (this.currentFilter === 'pending') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTodos = filtered;
    this.total = filtered.length;
    this.pageIndex = 1; // Reset to first page when filters change
    this.updateDisplayedTodos();
  }

  updateDisplayedTodos(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedTodos = this.filteredTodos.slice(startIndex, endIndex);
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.updateDisplayedTodos();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Reset to first page when changing page size
    this.updateDisplayedTodos();
  }

  onFilterChange(filter: FilterType): void {
    this.todoService.setFilter(filter);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleComplete(todo: Todo): void {
    if (!todo.id) return;
    
    // Get current state before toggle
    const currentState = todo.completed;
    const newState = !currentState;
    const statusMessage = newState ? 'completed' : 'pending';
    
    this.todoService.toggleTodoComplete(todo.id).subscribe({
      next: () => {
        this.message.success(`Todo marked as ${statusMessage}`);
        // Fetch fresh data from API to ensure sync
        this.todoService.fetchTodosFromApi().subscribe(() => {
          this.loadStats();
        });
      },
      error: (error) => {
        console.error('Error toggling todo:', error);
        this.message.error('Failed to update todo');
        // Refresh to restore correct state
        this.todoService.fetchTodosFromApi().subscribe(() => {
          this.loadStats();
        });
      }
    });
  }

  openAddModal(): void {
    const modal = this.modal.create({
      nzTitle: 'Add New Todo',
      nzContent: TodoFormComponent,
      nzWidth: 600,
      nzFooter: null
    });

    const instance = modal.getContentComponent() as TodoFormComponent;
    if (instance) {
      instance.onSubmit.subscribe((todo: Omit<Todo, 'id'>) => {
        this.addTodo(todo);
        modal.close();
      });
      
      instance.onCancel.subscribe(() => {
        modal.close();
      });
    }
  }

  openEditModal(todo: Todo): void {
    const modal = this.modal.create({
      nzTitle: 'Edit Todo',
      nzContent: TodoFormComponent,
      nzWidth: 600,
      nzFooter: null,
      nzData: { todo }
    });

    const instance = modal.getContentComponent() as TodoFormComponent;
    if (instance) {
      instance.todo = { ...todo };
      
      instance.onSubmit.subscribe((updatedTodo: Omit<Todo, 'id'>) => {
        if (todo.id) {
          this.updateTodo(todo.id, updatedTodo);
          modal.close();
        }
      });
      
      instance.onCancel.subscribe(() => {
        modal.close();
      });
    }
  }

  addTodo(todoData: Omit<Todo, 'id'>): void {
    this.todoService.addTodo(todoData).subscribe({
      next: () => {
        this.message.success('Todo added successfully');
        // Fetch fresh data from API to ensure sync
        this.todoService.fetchTodosFromApi().subscribe(() => {
          this.loadStats();
        });
      },
      error: (error) => {
        console.error('Error adding todo:', error);
        this.message.error('Failed to add todo');
      }
    });
  }

  updateTodo(id: string, updates: Partial<Todo>): void {
    this.todoService.updateTodo(id, updates).subscribe({
      next: () => {
        this.message.success('Todo updated successfully');
        // Fetch fresh data from API to ensure sync
        this.todoService.fetchTodosFromApi().subscribe(() => {
          this.loadStats();
        });
      },
      error: (error) => {
        console.error('Error updating todo:', error);
        this.message.error('Failed to update todo');
      }
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.message.success('Todo deleted successfully');
        // Fetch fresh data from API to ensure sync
        this.todoService.fetchTodosFromApi().subscribe(() => {
          this.loadStats();
        });
      },
      error: (error) => {
        console.error('Error deleting todo:', error);
        this.message.error('Failed to delete todo');
      }
    });
  }

  refreshFromApi(): void {
    this.todoService.fetchTodosFromApi().subscribe({
      next: () => {
        this.message.success('Todos refreshed successfully');
        this.loadStats();
      },
      error: (error) => {
        console.error('Error refreshing todos:', error);
        this.message.error('Failed to refresh todos');
      }
    });
  }

  trackByTodoId(index: number, todo: Todo): string | number {
    return todo.id || index;
  }
}

