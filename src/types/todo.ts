export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';
export type SortOption = 'createdAt' | 'text' | 'priority' | 'category' | 'dueDate';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
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
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate: string | null;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  subTasks: SubTask[];
  parentTaskId?: string;
  dependencies: string[];
  assignedTo: string;
  comments: Comment[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  estimatedTime: number | undefined;
  actualTime: number | undefined;
  recurrence: {
    type: RecurrenceType;
    interval: number;
    endDate: string | null;
  } | undefined;
  customFields: Record<string, any>;
  progress: number;
  lastActivityAt: string;
  status: TaskStatus;
  notificationSettings: {
    email: boolean;
    push: boolean;
    reminderTime: string | null;
  };
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