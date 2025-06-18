export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';
export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  updatedAt: string;
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
  description: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
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
  description?: string;
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
  dependencies: string[];
  comments: Comment[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  estimatedTime: number | null;
  actualTime: number | null;
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
  filter: {
    status: TodoStatus | 'all';
    priority: Priority | 'all';
    category: Category | 'all';
    search: string;
    showArchived: boolean;
    showStarred: boolean;
    dueDate: string | null;
  };
  sort: SortOption;
  view: 'list' | 'kanban';
  loading: boolean;
  error: string | null;
}

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'SET_FILTERS'; payload: Partial<TodoState['filter']> }
  | { type: 'SET_SORT'; payload: TodoState['sort'] };

export interface TodoFilters {
  search: string;
  showCompleted: boolean;
  category: Category | '';
  priority: Priority | '';
  dueDate: string | '';
  showArchived: boolean;
  showStarred: boolean;
}

export interface SortOption {
  field: keyof Todo;
  label: string;
  direction: 'asc' | 'desc';
}

export interface NewTodo {
  title: string;
  description: string;
  priority: Priority;
} 