import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TodoList.css'; // Import the custom CSS file

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

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    tags: [] as string[],
    dueDate: ''
  });
  const [tagInput, setTagInput] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.text.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTodo)
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodo({
        text: '',
        priority: 'medium',
        category: '',
        tags: [],
        dueDate: ''
      });
      setTagInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
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