import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { Todo } from '../../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzSelectModule,
    NzGridModule
  ],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent implements OnInit {
  @Input() todo?: Todo;
  @Output() onSubmit = new EventEmitter<Omit<Todo, 'id'>>();
  @Output() onCancel = new EventEmitter<void>();

  todoForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.todo;
    this.initForm();
  }

  initForm(): void {
    this.todoForm = this.fb.group({
      title: [this.todo?.title || '', [Validators.required, Validators.minLength(3)]],
      completed: [this.todo?.completed || false],
      userId: [this.todo?.userId || 'userId 1', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      this.onSubmit.emit(formValue);
    } else {
      // Mark all fields as touched to show validation errors
      Object.values(this.todoForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.todoForm.get(fieldName);
    return !!(field && field.errors?.[errorType] && (field.dirty || field.touched));
  }
}

