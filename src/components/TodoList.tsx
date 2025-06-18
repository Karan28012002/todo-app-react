import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './TodoList.css';
import { FaStar, FaRegStar, FaArchive, FaRegCalendarAlt, FaSearch } from 'react-icons/fa';

interface SubTask {
  _id?: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

interface Comment {
  _id?: string;
  text: string;
  author?: string;
  createdAt?: string;
}

interface Todo {
  _id: string;
  text: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  dueDate: string;
  actualTime: number;
  isStarred: boolean;
  isArchived: boolean;
  user: string; // Assuming user ID
  dependencies: string[];
  subTasks: SubTask[];
  comments: (Comment | string)[];
  timeEntries: { startTime: string; endTime: string; }[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    text: '',
    priority: 'medium',
    category: '',
    tags: [],
    dueDate: '',
    actualTime: 0,
    isStarred: false,
    isArchived: false,
    dependencies: [],
    subTasks: [],
    comments: [],
    timeEntries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [subTaskInput, setSubTaskInput] = useState<{ [todoId: string]: string }>({});
  const [commentInput, setCommentInput] = useState<{ [todoId: string]: string }>({});
  const [timeEntryInput, setTimeEntryInput] = useState<{ [todoId: string]: { startTime: string; endTime: string } }>({});
  const [dependencyInput, setDependencyInput] = useState<{ [todoId: string]: string }>({});
  const { token } = useAuth();
  const [filter, setFilter] = useState({ status: '', priority: '', category: '', tag: '' });
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showStarred, setShowStarred] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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
    if (!newTodo.text?.trim()) return;
    try {
      setError(null);
      const todoToSend = { ...newTodo, actualTime: Number(newTodo.actualTime) || 0 };
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/api/todos`,
        todoToSend,
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
        dueDate: '',
        actualTime: 0,
        isStarred: false,
        isArchived: false,
        dependencies: [],
        subTasks: [],
        comments: [],
        timeEntries: [],
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
      const updatesToSend = { ...updates, actualTime: Number(updates.actualTime) || 0 };
      const response = await axios.patch<Todo>(
        `${API_BASE_URL}/api/todos/${id}`,
        updatesToSend,
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
    if (tagInput.trim() && !newTodo.tags?.includes(tagInput.trim())) {
      setNewTodo({
        ...newTodo,
        tags: [...(newTodo.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTodo({
      ...newTodo,
      tags: (newTodo.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddSubTask = async (todoId: string) => {
    const text = subTaskInput[todoId]?.trim();
    if (!text) return;
    try {
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/api/todos/${todoId}/subtasks`,
        { text, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(todo => todo._id === todoId ? response.data : todo));
      setSubTaskInput({ ...subTaskInput, [todoId]: '' });
    } catch (error) {
      // handle error
      if (error instanceof Error) setError(error.message);
    }
  };

  const handleToggleSubTask = async (todoId: string, subTaskIdx: number) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;
    const subTasks = [...todo.subTasks];
    subTasks[subTaskIdx].completed = !subTasks[subTaskIdx].completed;
    await handleUpdateTodo(todoId, { subTasks });
  };

  const handleDeleteSubTask = async (todoId: string, subTaskIdx: number) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;
    const subTasks = todo.subTasks.filter((_, idx) => idx !== subTaskIdx);
    await handleUpdateTodo(todoId, { subTasks });
  };

  const handleAddComment = async (todoId: string) => {
    const text = commentInput[todoId]?.trim();
    if (!text) return;
    try {
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/api/todos/${todoId}/comments`,
        { text, author: 'User' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(todo => todo._id === todoId ? response.data : todo));
      setCommentInput({ ...commentInput, [todoId]: '' });
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    }
  };

  const handleDeleteComment = async (todoId: string, commentIdx: number) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;
    const comments = todo.comments.filter((_, idx) => idx !== commentIdx);
    await handleUpdateTodo(todoId, { comments });
  };

  const handleAddTimeEntry = async (todoId: string) => {
    const entry = timeEntryInput[todoId];
    if (!entry || !entry.startTime || !entry.endTime) return;
    // Calculate duration in minutes
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    const duration = Math.max(0, Math.round((end - start) / 60000)); // in minutes
    try {
      const response = await axios.post<Todo>(
        `${API_BASE_URL}/api/todos/${todoId}/time-entries`,
        { ...entry, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(todo => todo._id === todoId ? response.data : todo));
      setTimeEntryInput({ ...timeEntryInput, [todoId]: { startTime: '', endTime: '' } });
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    }
  };

  const handleDeleteTimeEntry = async (todoId: string, entryIdx: number) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;
    const timeEntries = todo.timeEntries.filter((_, idx) => idx !== entryIdx);
    await handleUpdateTodo(todoId, { timeEntries });
  };

  const handleAddDependency = async (todoId: string) => {
    const depId = dependencyInput[todoId]?.trim();
    if (!depId || depId === todoId) return;
    const todo = todos.find(t => t._id === todoId);
    if (!todo || todo.dependencies.includes(depId)) return;
    const dependencies = [...todo.dependencies, depId];
    await handleUpdateTodo(todoId, { dependencies });
    setDependencyInput({ ...dependencyInput, [todoId]: '' });
  };

  const handleRemoveDependency = async (todoId: string, depId: string) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;
    const dependencies = todo.dependencies.filter(id => id !== depId);
    await handleUpdateTodo(todoId, { dependencies });
  };

  const handleToggleStar = async (todo: Todo) => {
    await handleUpdateTodo(todo._id, { isStarred: !todo.isStarred });
  };

  const handleToggleArchive = async (todo: Todo) => {
    await handleUpdateTodo(todo._id, { isArchived: !todo.isArchived });
  };

  const filteredTodos = todos
    .filter(todo =>
      (!filter.status || todo.status === filter.status) &&
      (!filter.priority || todo.priority === filter.priority) &&
      (!filter.category || todo.category === filter.category) &&
      (!filter.tag || todo.tags.includes(filter.tag)) &&
      (!showStarred || todo.isStarred) &&
      (!showArchived || todo.isArchived) &&
      (!search || todo.text.toLowerCase().includes(search.toLowerCase()) || todo.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => {
      if (sort === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return sortDir === 'asc' ? order[a.priority] - order[b.priority] : order[b.priority] - order[a.priority];
      }
      if (sort === 'dueDate') {
        return sortDir === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      // createdAt
      return sortDir === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Find the selected todo
  const selectedTodo = todos.find(todo => todo._id === selectedTodoId);

  if (loading) {
    return <div className="todo-loading">Loading todos...</div>;
  }

  return (
    <div className="todo-master-detail-layout">
      <div className="add-todo-pane">
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
                  value={newTodo.text || ''}
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
                    value={newTodo.priority || 'medium'}
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
                    value={newTodo.category || ''}
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
                  value={newTodo.dueDate || ''}
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
                {(newTodo.tags && newTodo.tags.length > 0) && (
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
      </div>
      <div className="todo-list-pane">
        <div className="todo-filters">
          <input
            type="text"
            className="form-control"
            placeholder="Search todos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <button className={showStarred ? 'active' : ''} onClick={() => setShowStarred(s => !s)} title="Show Starred">
            {FaStar({})}
          </button>
          <button className={showArchived ? 'active' : ''} onClick={() => setShowArchived(s => !s)} title="Show Archived">
            {FaArchive({})}
          </button>
          <select value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="createdAt">Sort: Created</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
          <select value={sortDir} onChange={e => setSortDir(e.target.value as any)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          {/* Tag/category filter chips */}
          {Array.from(new Set(todos.flatMap(t => t.tags))).map(tag => (
            <button
              key={tag}
              className={`chip${filter.tag === tag ? ' selected' : ''}`}
              onClick={() => setFilter(f => ({ ...f, tag: f.tag === tag ? '' : tag }))}
            >
              #{tag}
            </button>
          ))}
          {Array.from(new Set(todos.map(t => t.category))).map(cat => (
            <button
              key={cat}
              className={`chip${filter.category === cat ? ' selected' : ''}`}
              onClick={() => setFilter(f => ({ ...f, category: f.category === cat ? '' : cat }))}
            >
              {FaRegCalendarAlt({})} {cat}
            </button>
          ))}
        </div>
        <div className="todo-list-card">
          <div className="card-header">
            <h3>Todo List</h3>
          </div>
          <ul className="todo-items-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo._id}
                className={`todo-item-summary${selectedTodoId === todo._id ? ' selected' : ''}`}
                onClick={() => setSelectedTodoId(todo._id)}
              >
                <div className="todo-summary-title">{todo.text}</div>
                <span className={`todo-priority ${todo.priority}`}>{todo.priority}</span>
                {todo.dueDate && <span className="todo-due-date">Due: {new Date(todo.dueDate).toLocaleDateString()}</span>}
                <span className={`todo-status ${todo.status}`}>{todo.status}</span>
                <button className="star-btn" onClick={e => { e.stopPropagation(); handleToggleStar(todo); }} title={todo.isStarred ? 'Unstar' : 'Star'}>
                  {todo.isStarred ? FaStar({ color: "#f59e0b" }) : FaRegStar({})}
                </button>
                <button className="archive-btn" onClick={e => { e.stopPropagation(); handleToggleArchive(todo); }} title={todo.isArchived ? 'Unarchive' : 'Archive'}>
                  {FaArchive({ color: todo.isArchived ? '#6366f1' : undefined })}
                </button>
                <button className="delete-btn" onClick={e => { e.stopPropagation(); handleDeleteTodo(todo._id); }}>&times;</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="todo-details-pane">
        {selectedTodo ? (
          <div className="todo-details-card">
            <div className="card-header">
              <h3>{selectedTodo.text}</h3>
              <button className="star-btn" onClick={() => handleToggleStar(selectedTodo)} title={selectedTodo.isStarred ? 'Unstar' : 'Star'}>
                {selectedTodo.isStarred ? FaStar({ color: "#f59e0b" }) : FaRegStar({})}
              </button>
              <button className="archive-btn" onClick={() => handleToggleArchive(selectedTodo)} title={selectedTodo.isArchived ? 'Unarchive' : 'Archive'}>
                {FaArchive({ color: selectedTodo.isArchived ? '#6366f1' : undefined })}
              </button>
            </div>
            <div className="card-body">
              <div className="todo-meta">
                <span className={`todo-priority ${selectedTodo.priority}`}>{selectedTodo.priority}</span>
                {selectedTodo.dueDate && <span className="todo-due-date">Due: {new Date(selectedTodo.dueDate).toLocaleDateString()}</span>}
                <span className={`todo-status ${selectedTodo.status}`}>{selectedTodo.status}</span>
                {selectedTodo.category && <span className="todo-category">{selectedTodo.category}</span>}
                {selectedTodo.tags && selectedTodo.tags.map(tag => <span key={tag} className="todo-tag">{tag}</span>)}
              </div>
              {/* Subtasks */}
              <div className="subsection-header">Subtasks</div>
              <div className="subtasks-section">
                <ul>
                  {selectedTodo.subTasks.map((sub, idx) => (
                    <li key={idx} className={sub.completed ? 'completed' : ''}>
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => handleToggleSubTask(selectedTodo._id, idx)}
                      />
                      {sub.text}
                      <button className="delete-btn" onClick={() => handleDeleteSubTask(selectedTodo._id, idx)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <div className="add-controls">
                  <input
                    type="text"
                    value={subTaskInput[selectedTodo._id] || ''}
                    onChange={e => setSubTaskInput({ ...subTaskInput, [selectedTodo._id]: e.target.value })}
                    placeholder="Add subtask"
                  />
                  <button onClick={() => handleAddSubTask(selectedTodo._id)}>Add</button>
                </div>
              </div>
              {/* Comments */}
              <div className="subsection-header">Comments</div>
              <div className="comments-section">
                <ul>
                  {selectedTodo.comments.map((comment, idx) => (
                    <li key={idx}>
                      <div className="comment-content">
                        <div className="comment-text">
                          {typeof comment === 'string' ? comment : comment.text}
                        </div>
                        {typeof comment !== 'string' && (
                          <div className="comment-meta">
                            {comment.author && <span className="comment-author">By: {comment.author}</span>}
                            {comment.createdAt && (
                              <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteComment(selectedTodo._id, idx)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <div className="add-controls">
                  <input
                    type="text"
                    value={commentInput[selectedTodo._id] || ''}
                    onChange={e => setCommentInput({ ...commentInput, [selectedTodo._id]: e.target.value })}
                    placeholder="Add comment"
                  />
                  <button onClick={() => handleAddComment(selectedTodo._id)}>Add</button>
                </div>
              </div>
              {/* Time Entries */}
              <div className="subsection-header">Time Entries</div>
              <div className="time-entries-section">
                <ul>
                  {selectedTodo.timeEntries.map((entry, idx) => (
                    <li key={idx}>
                      {new Date(entry.startTime).toLocaleString()} - {new Date(entry.endTime).toLocaleString()}
                      <button className="delete-btn" onClick={() => handleDeleteTimeEntry(selectedTodo._id, idx)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <div className="add-controls">
                  <input
                    type="datetime-local"
                    value={timeEntryInput[selectedTodo._id]?.startTime || ''}
                    onChange={e => setTimeEntryInput({
                      ...timeEntryInput,
                      [selectedTodo._id]: {
                        ...timeEntryInput[selectedTodo._id],
                        startTime: e.target.value
                      }
                    })}
                    placeholder="Start Time"
                  />
                  <input
                    type="datetime-local"
                    value={timeEntryInput[selectedTodo._id]?.endTime || ''}
                    onChange={e => setTimeEntryInput({
                      ...timeEntryInput,
                      [selectedTodo._id]: {
                        ...timeEntryInput[selectedTodo._id],
                        endTime: e.target.value
                      }
                    })}
                    placeholder="End Time"
                  />
                  <button onClick={() => handleAddTimeEntry(selectedTodo._id)}>Add</button>
                </div>
              </div>
              {/* Dependencies */}
              <div className="subsection-header">Dependencies</div>
              <div className="dependencies-section">
                <ul>
                  {selectedTodo.dependencies.map(depId => {
                    const depTodo = todos.find(t => t._id === depId);
                    return (
                      <li key={depId}>
                        {depTodo ? depTodo.text : depId}
                        <button className="delete-btn" onClick={() => handleRemoveDependency(selectedTodo._id, depId)}>&times;</button>
                      </li>
                    );
                  })}
                </ul>
                <div className="add-controls">
                  <select
                    value={dependencyInput[selectedTodo._id] || ''}
                    onChange={e => setDependencyInput({ ...dependencyInput, [selectedTodo._id]: e.target.value })}
                  >
                    <option value="">Select todo to add as dependency</option>
                    {todos.filter(t => t._id !== selectedTodo._id && !selectedTodo.dependencies.includes(t._id)).map(t => (
                      <option key={t._id} value={t._id}>{t.text}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAddDependency(selectedTodo._id)}>Add</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="todo-details-placeholder">Select a todo to view details</div>
        )}
      </div>
    </div>
  );
};

export default TodoList; 