import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, Priority, Category, TaskStatus, SubTask, Comment, Attachment, TimeEntry } from '../types/todo';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    priority: Priority | 'all';
    category: Category | 'all';
    status: TaskStatus | 'all';
    tags: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    assignedTo: string;
    dueDate: string | null;
    showCompleted: boolean;
  };
  sort: {
    field: keyof Todo;
    direction: 'asc' | 'desc';
  };
  view: 'list' | 'kanban' | 'calendar';
}

type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'> }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'TOGGLE_STAR'; payload: string }
  | { type: 'TOGGLE_ARCHIVE'; payload: string }
  | { type: 'ADD_SUBTASK'; payload: { todoId: string; subtask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_SUBTASK'; payload: { todoId: string; subtaskId: string; updates: Partial<SubTask> } }
  | { type: 'DELETE_SUBTASK'; payload: { todoId: string; subtaskId: string } }
  | { type: 'ADD_COMMENT'; payload: { todoId: string; comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_COMMENT'; payload: { todoId: string; commentId: string; updates: Partial<Comment> } }
  | { type: 'DELETE_COMMENT'; payload: { todoId: string; commentId: string } }
  | { type: 'ADD_ATTACHMENT'; payload: { todoId: string; attachment: Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'DELETE_ATTACHMENT'; payload: { todoId: string; attachmentId: string } }
  | { type: 'ADD_TIME_ENTRY'; payload: { todoId: string; timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { todoId: string; timeEntryId: string; updates: Partial<TimeEntry> } }
  | { type: 'DELETE_TIME_ENTRY'; payload: { todoId: string; timeEntryId: string } }
  | { type: 'SET_FILTERS'; payload: Partial<TodoState['filters']> }
  | { type: 'SET_SORT'; payload: TodoState['sort'] }
  | { type: 'SET_VIEW'; payload: TodoState['view'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REORDER_TODOS'; payload: { oldIndex: number; newIndex: number } };

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    priority: 'all',
    category: 'all',
    status: 'all',
    tags: [],
    dateRange: {
      start: null,
      end: null,
    },
    assignedTo: 'all',
    dueDate: null,
    showCompleted: true,
  },
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  view: 'list',
};

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
} | undefined>(undefined);

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    
    case 'ADD_TODO':
      const newTodo: Todo = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
      return { ...state, todos: [...state.todos, newTodo] };
    
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? {
                ...action.payload,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? {
                ...todo,
                completed: !todo.completed,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'TOGGLE_STAR':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? {
                ...todo,
                isStarred: !todo.isStarred,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'TOGGLE_ARCHIVE':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? {
                ...todo,
                isArchived: !todo.isArchived,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'ADD_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                subTasks: [
                  ...todo.subTasks,
                  {
                    ...action.payload.subtask,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'UPDATE_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                subTasks: todo.subTasks.map(subtask =>
                  subtask.id === action.payload.subtaskId
                    ? {
                        ...subtask,
                        ...action.payload.updates,
                        updatedAt: new Date().toISOString(),
                      }
                    : subtask
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'DELETE_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                subTasks: todo.subTasks.filter(
                  subtask => subtask.id !== action.payload.subtaskId
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'ADD_COMMENT':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                comments: [
                  ...todo.comments,
                  {
                    ...action.payload.comment,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'UPDATE_COMMENT':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                comments: todo.comments.map(comment =>
                  comment.id === action.payload.commentId
                    ? {
                        ...comment,
                        ...action.payload.updates,
                        updatedAt: new Date().toISOString(),
                      }
                    : comment
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'DELETE_COMMENT':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                comments: todo.comments.filter(
                  comment => comment.id !== action.payload.commentId
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'ADD_ATTACHMENT':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                attachments: [
                  ...todo.attachments,
                  {
                    ...action.payload.attachment,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'DELETE_ATTACHMENT':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                attachments: todo.attachments.filter(
                  attachment => attachment.id !== action.payload.attachmentId
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'ADD_TIME_ENTRY':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                timeEntries: [
                  ...todo.timeEntries,
                  {
                    ...action.payload.timeEntry,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                timeEntries: todo.timeEntries.map(timeEntry =>
                  timeEntry.id === action.payload.timeEntryId
                    ? {
                        ...timeEntry,
                        ...action.payload.updates,
                        updatedAt: new Date().toISOString(),
                      }
                    : timeEntry
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                timeEntries: todo.timeEntries.filter(
                  timeEntry => timeEntry.id !== action.payload.timeEntryId
                ),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              }
            : todo
        ),
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    
    case 'SET_VIEW':
      return {
        ...state,
        view: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'REORDER_TODOS': {
      const { oldIndex, newIndex } = action.payload;
      const newTodos = [...state.todos];
      const [movedTodo] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, movedTodo);
      return {
        ...state,
        todos: newTodos,
      };
    }
    
    default:
      return state;
  }
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        dispatch({ type: 'SET_TODOS', payload: parsedTodos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load todos' });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
  }, [state.todos]);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}; 