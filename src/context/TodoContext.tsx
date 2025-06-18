import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Todo, Priority, Category, TodoStatus, SubTask, Comment, Attachment, TimeEntry } from '../types/todo';

interface TodoState {
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
  sort: {
    field: keyof Todo;
    direction: 'asc' | 'desc';
  };
  view: 'list' | 'kanban';
  loading: boolean;
  error: string | null;
}

type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'> }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'TOGGLE_STAR'; payload: string }
  | { type: 'TOGGLE_ARCHIVE'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<TodoState['filter']> }
  | { type: 'SET_SORT'; payload: TodoState['sort'] }
  | { type: 'SET_VIEW'; payload: TodoState['view'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_SUBTASK'; payload: { todoId: string; subtask: Omit<SubTask, 'id' | 'createdAt'> } }
  | { type: 'UPDATE_SUBTASK'; payload: { todoId: string; subtaskId: string; updates: Partial<SubTask> } }
  | { type: 'DELETE_SUBTASK'; payload: { todoId: string; subtaskId: string } }
  | { type: 'ADD_COMMENT'; payload: { todoId: string; comment: Omit<Comment, 'id' | 'createdAt'> } }
  | { type: 'DELETE_COMMENT'; payload: { todoId: string; commentId: string } }
  | { type: 'ADD_ATTACHMENT'; payload: { todoId: string; attachment: Omit<Attachment, 'id' | 'createdAt'> } }
  | { type: 'DELETE_ATTACHMENT'; payload: { todoId: string; attachmentId: string } }
  | { type: 'ADD_TIME_ENTRY'; payload: { todoId: string; timeEntry: Omit<TimeEntry, 'id' | 'createdAt'> } }
  | { type: 'DELETE_TIME_ENTRY'; payload: { todoId: string; timeEntryId: string } };

const initialState: TodoState = {
  todos: [],
  filter: {
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    showArchived: false,
    showStarred: false,
    dueDate: null,
  },
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  view: 'kanban',
  loading: false,
  error: null,
};

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
} | undefined>(undefined);

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
      };
    
    case 'ADD_TODO':
      const newTodo: Todo = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
      };

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? {
                ...todo,
                ...action.payload.updates,
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
                    completedAt: null,
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
                    author: action.payload.comment.author || 'Current User',
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
                    duration: action.payload.timeEntry.duration ?? 0,
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

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
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

    default:
      return state;
  }
};

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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