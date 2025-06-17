import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './TodoList.css';

interface Todo {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Todo[]>(`${API_BASE_URL}/api/todos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to fetch todos');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      setError(null);
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/api/todos`,
        newTodo,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTodos([...todos, response.data]);
      setNewTodo({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating todo:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to create todo');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'completed') => {
    try {
      setError(null);
      const response = await axios.patch<Todo>(
        `${API_BASE_URL}/api/todos/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTodos(todos.map(todo => todo._id === id ? response.data : todo));
    } catch (error) {
      console.error('Error updating todo status:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to update todo status');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to delete todo');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  if (loading) {
    return <div className="todo-loading">Loading todos...</div>;
  }

  return (
    <div className="todo-container">
      <h2>Todo List</h2>
      {error && <div className="todo-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="New todo title"
          className="todo-input"
        />
        <textarea
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          placeholder="Description (optional)"
          className="todo-textarea"
        />
        <select
          value={newTodo.priority}
          onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
          className="todo-select"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit" className="todo-button">Add Todo</button>
      </form>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo._id} className={`todo-item ${todo.status}`}>
            <div className="todo-content">
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
              <div className="todo-meta">
                <span className={`priority ${todo.priority}`}>{todo.priority}</span>
                {todo.dueDate && <span className="due-date">Due: {new Date(todo.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="todo-actions">
              <button
                onClick={() => handleStatusChange(todo._id, todo.status === 'completed' ? 'pending' : 'completed')}
                className={`status-button ${todo.status}`}
              >
                {todo.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
              </button>
              <button
                onClick={() => handleDelete(todo._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList; 