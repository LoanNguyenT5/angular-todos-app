import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: 'todos',
    loadChildren: () =>
      import('./pages/todos/todos.routes')
        .then(m => m.TODOS_ROUTES)
  }
];
