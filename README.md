# Angular To-Do Application

A modern, feature-rich To-Do application built with Angular 20, Ng-Zorro (Ant Design), and integrated with JSONPlaceholder API.

## ✨ Features

- ✅ **Add Task** – Create new to-do items with title, user assignment, and completion status
- ✏️ **Edit Task** – Update task details through an intuitive modal form
- 🗑️ **Delete Task** – Remove tasks with confirmation dialog
- ☑️ **Mark as Completed** – Toggle task completion status with visual feedback
- 📋 **View Tasks** – Display all tasks in a clean, organized list with status indicators
- 🔍 **Filter Tasks** – Filter by status: All, Completed, or Pending
- 🔎 **Search Tasks** – Real-time search through task titles
- 📄 **Pagination** – Navigate through tasks with customizable page size (5, 10, 20, or 50 items per page)
- 💾 **Persist Data** – Automatic local storage with API synchronization
- 📱 **Responsive UI** – Fully responsive design for desktop, tablet, and mobile
- 🔄 **API Integration** – Fetch and sync with JSONPlaceholder API
- 📊 **Statistics Dashboard** – Real-time stats showing total, completed, and pending tasks

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd angular-todos-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:4200
```

## 📁 Project Structure

```
src/app/
├── pages/
│   └── todos/
│       ├── todo-form/
│       │   ├── todo-form.component.ts
│       │   ├── todo-form.component.html
│       │   └── todo-form.component.scss
│       ├── todos.component.ts
│       ├── todos.component.html
│       ├── todos.component.scss
│       └── todos.routes.ts
├── services/
│   └── todo.service.ts
├── header/
│   ├── app-header.component.ts
│   ├── app-header.component.html
│   └── app-header.component.scss
├── app.ts
├── app.html
├── app.routes.ts
└── app.config.ts
```

## 🎯 Key Components

### TodoService (`todo.service.ts`)
- Manages all CRUD operations for todos
- Handles API communication with JSONPlaceholder
- Implements local storage for data persistence
- Provides filtering and statistics functionality

### TodosComponent (`todos.component.ts`)
- Main component displaying the todo list
- Implements filtering, searching, and sorting
- Manages modal dialogs for add/edit operations
- Displays real-time statistics

### TodoFormComponent (`todo-form.component.ts`)
- Reusable form component for creating and editing todos
- Reactive form with validation
- Supports both create and edit modes

## 🔌 API Integration

The application uses a MockAPI endpoint for full CRUD operations:

- **Base URL**: `https://68fb430694ec9606602557d1.mockapi.io/api/v1/to-dos`
- **Endpoints**:
  - `GET /to-dos` - Get all todos
  - `GET /to-dos/:id` - Get todo by ID
  - `POST /to-dos` - Create new todo
  - `PUT /to-dos/:id` - Update existing todo
  - `DELETE /to-dos/:id` - Delete todo
- **Features**:
  - Full CRUD operations with real API responses
  - Automatic data synchronization
  - Local storage backup for offline access
  - Error handling with fallback mechanisms

## 💡 Usage Guide

### Adding a Task
1. Click the "Add Task" button
2. Enter the task title (minimum 3 characters)
3. Select a user (1-10)
4. Optionally mark as completed
5. Click "Create Task"

### Editing a Task
1. Click the edit icon (✏️) on any task
2. Modify the task details
3. Click "Update Task"

### Deleting a Task
1. Click the delete icon (🗑️) on any task
2. Confirm the deletion in the popup dialog

### Filtering Tasks
- Use the dropdown menu to filter by:
  - **All Tasks**: Show everything
  - **Pending**: Show only incomplete tasks
  - **Completed**: Show only finished tasks

### Searching Tasks
- Type in the search box to filter tasks by title
- Search works in real-time across all fields

### Refreshing Data
- Click the "Refresh" button to reload data from the API
- This will merge API data with local changes

### Using Pagination
- Navigate through pages using the numbered buttons
- Change items per page using the page size selector (5, 10, 20, or 50)
- See the current range displayed (e.g., "1-10 of 27 tasks")
- Pagination automatically adjusts when filtering or searching

## 🎨 Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: Full layout with all features
- **Tablet**: Adapted layout with optimized spacing
- **Mobile**: Stacked layout with touch-friendly controls

## 🛠️ Technologies Used

- **Angular 20** - Latest version with standalone components
- **Ng-Zorro (Ant Design)** - UI component library
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced styling
- **LocalStorage API** - Data persistence
- **MockAPI** - Full-featured REST API endpoint

## 📦 Build

To build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

Run unit tests:

```bash
npm test
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is for educational purposes.

---

**Developed with ❤️ using Angular 20 and Ng-Zorro**
