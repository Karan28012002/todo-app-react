import axios from 'axios';
import { Todo } from '../types/todo';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const mapStatus = (status: string) => {
  if (status === 'pending') return 'todo';
  if (status === 'completed') return 'done';
  if (status === 'in-progress') return 'in-progress';
  return 'todo'; // fallback
};

export const fetchTodosApi = async (token: string): Promise<Todo[]> => {
  const response = await axios.get<Todo[]>(`${API_BASE_URL}/api/todos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Map _id to id and ensure status is valid
  return response.data.map(todo => ({
    ...todo,
    id: (todo as any).id || (todo as any)._id,
    status: mapStatus((todo as any).status),
    subTasks: Array.isArray((todo as any).subTasks) ? (todo as any).subTasks : [],
    comments: Array.isArray((todo as any).comments) ? (todo as any).comments : [],
    timeEntries: Array.isArray((todo as any).timeEntries) ? (todo as any).timeEntries : [],
    attachments: Array.isArray((todo as any).attachments) ? (todo as any).attachments : [],
    dependencies: Array.isArray((todo as any).dependencies) ? (todo as any).dependencies : [],
    tags: Array.isArray((todo as any).tags) ? (todo as any).tags : [],
  }));
}; 