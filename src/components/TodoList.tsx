import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './TodoList.css';

interface Todo {
  _id: string;
  text: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  dueDate: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    tags: [] as string[],
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
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

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.text.trim()) return;

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
      setNewTodo({
        text: '',
        priority: 'medium',
        category: '',
        tags: [],
        dueDate: ''
      });
      setTagInput('');
    } catch (error) {
      console.error('Error creating todo:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to create todo');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      const response = await axios.patch<Todo>(
        `${API_BASE_URL}/api/todos/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTodos(todos.map(todo => todo._id === id ? response.data : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to update todo');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
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

  const handleAddTag = () => {
    if (tagInput.trim() && !newTodo.tags.includes(tagInput.trim())) {
      setNewTodo({
        ...newTodo,
        tags: [...newTodo.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTodo({
      ...newTodo,
      tags: newTodo.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return <div className="todo-loading">Loading todos...</div>;
  }

  return (
    <div className="todo-list-container">
      {error && (
        <div className="error-alert">
          {error}
          <button className="close-button" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="todo-card">
        <div className="card-header">
          <h3>Add New Todo</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateTodo}>
            <div className="form-group">
              <label htmlFor="text">Todo Text</label>
              <input
                type="text"
                className="form-control"
                id="text"
                value={newTodo.text}
                onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="priority">Priority</label>
                <select
                  className="form-control"
                  id="priority"
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group half-width">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  className="form-control"
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  placeholder="e.g., Work, Personal"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                className="form-control"
                id="dueDate"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  className="add-tag-button"
                  onClick={handleAddTag}
                >
                  Add
                </button>
              </div>
              {newTodo.tags.length > 0 && (
                <div className="tag-list">
                  {newTodo.tags.map((tag) => (
                    <span key={tag} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        className="remove-tag-button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label="Remove tag"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Todo
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="todo-list-card">
        <div className="card-header">
          <h3>Todo List</h3>
        </div>
        <ul className="todo-items-list">
          {todos.map((todo) => (
            <li key={todo._id} className="todo-item">
              <div className="todo-content">
                <div className="todo-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={todo.status === 'completed'}
                    onChange={() => handleUpdateTodo(todo._id, {
                      status: todo.status === 'completed' ? 'pending' : 'completed'
                    })}
                  />
                </div>
                <div className="todo-details">
                  <h6 className={`todo-text ${todo.status === 'completed' ? 'completed' : ''}`}>
                    {todo.text}
                  </h6>
                  <div className="todo-meta">
                    {todo.category && (
                      <span className="todo-category">{todo.category}</span>
                    )}
                    {todo.tags.map((tag) => (
                      <span key={tag} className="todo-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="todo-actions">
                <span className={`todo-priority ${todo.priority}`}>
                  {todo.priority}
                </span>
                {todo.dueDate && (
                  <span className="todo-due-date">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleUpdateTodo(todo._id, { starred: !todo.starred })}
                  className={`action-button star-button ${todo.starred ? 'starred' : ''}`}
                >
                  <i className={`bi bi-star${todo.starred ? '-fill' : ''}`}></i>
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="action-button delete-button"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TodoList;