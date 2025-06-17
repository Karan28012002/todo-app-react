export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';
export type SortOption = 'createdAt' | 'text' | 'priority' | 'category' | 'dueDate';
export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  duration: number; // in minutes
  description: string;
  createdAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminder: boolean;
  reminderTime: string | null;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  tags: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isStarred: boolean;
  isArchived: boolean;
  status: TodoStatus;
  progress: number;
  subTasks: SubTask[];
  dependencies: string[]; // IDs of dependent todos
  comments: Comment[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  estimatedTime: number | null; // in minutes
  actualTime: number | null; // in minutes
  recurrence: {
    type: RecurrenceType;
    interval: number;
    endDate: string | null;
  };
  customFields: CustomField[];
  assignedTo: string | null;
  notificationSettings: NotificationSettings;
}

export interface TodoState {
  todos: Todo[];
  filters: {
    search: string;
    category: Category | null;
    priority: Priority | null;
    showCompleted: boolean;
  };
  sort: {
    field: SortOption;
    direction: 'asc' | 'desc';
  };
}

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'SET_FILTERS'; payload: Partial<TodoState['filters']> }
  | { type: 'SET_SORT'; payload: TodoState['sort'] };

export interface TodoFilters {
  search: string;
  showCompleted: boolean;
  category: Category | '';
  priority: Priority | '';
  dueDate: string | '';
}

export interface TodoSort {
  field: SortOption;
  direction: 'asc' | 'desc';
}

export interface NewTodo {
  title: string;
  description: string;
  priority: Priority;
} 