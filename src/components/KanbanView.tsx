import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTodo } from '../context/TodoContext';
import { Todo, TodoStatus, Priority, Category } from '../types/todo';
import { format } from 'date-fns';
import TodoDetails from './TodoDetails';
import FilterDialog from './FilterDialog';
import SortDialog from './SortDialog';
import { fetchTodosApi } from '../api/todos';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function DroppableColumn({ id, children, ...props }: { id: string; children: React.ReactNode; [key: string]: any }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} {...props}>
      {children}
    </div>
  );
}

const KanbanView: React.FC = () => {
  const { state, dispatch } = useTodo();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTodoId, setMenuTodoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    text: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'work' as Category,
    status: 'todo' as TodoStatus,
  });
  const { token } = useAuth();
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns: { id: TodoStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  useEffect(() => {
    fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const todos = await fetchTodosApi(token);
      dispatch({ type: 'SET_TODOS', payload: todos });
    } catch (err) {
      setError('Failed to fetch todos');
      showSnackbar('Failed to fetch todos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const todoId = event.active.id as string;
    const todo = state.todos.find(t => t.id === todoId);
    setActiveId(todoId);
    setDraggedTodo(todo || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedTodo(null);
    if (!over || !active) return;
    const todoId = active.id as string;
    const newStatus = over.id as TodoStatus;
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo || todo.status === newStatus) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/todos/${todoId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({
        type: 'UPDATE_TODO',
        payload: {
          id: todoId,
          updates: {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
          },
        },
      });
      showSnackbar('Todo status updated successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to update todo status', 'error');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const todoId = active.id as string;
      const newStatus = over.id as TodoStatus;
      dispatch({
        type: 'UPDATE_TODO',
        payload: {
          id: todoId,
          updates: {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
          },
        },
      });
    }
  };

  const handleCreateTodo = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/todos`,
        {
          ...newTodo,
          tags: [],
          dueDate: null,
          isStarred: false,
          isArchived: false,
          subTasks: [],
          dependencies: [],
          comments: [],
          attachments: [],
          timeEntries: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({ type: 'ADD_TODO', payload: response.data as Todo });
      setCreateDialogOpen(false);
      setNewTodo({
        text: '',
        description: '',
        priority: 'medium',
        category: 'work',
        status: 'todo',
      });
      showSnackbar('Todo created successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to create todo', 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, todoId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTodoId(todoId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuTodoId(null);
  };

  const handleTodoAction = async (action: string) => {
    if (!menuTodoId) return;

    try {
      switch (action) {
        case 'star':
          await axios.patch(
            `${API_BASE_URL}/api/todos/${menuTodoId}`,
            { isStarred: !state.todos.find(t => t.id === menuTodoId)?.isStarred },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dispatch({ type: 'TOGGLE_STAR', payload: menuTodoId });
          break;
        case 'archive':
          await axios.patch(
            `${API_BASE_URL}/api/todos/${menuTodoId}`,
            { isArchived: !state.todos.find(t => t.id === menuTodoId)?.isArchived },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dispatch({ type: 'TOGGLE_ARCHIVE', payload: menuTodoId });
          break;
        case 'delete':
          await axios.delete(
            `${API_BASE_URL}/api/todos/${menuTodoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dispatch({ type: 'DELETE_TODO', payload: menuTodoId });
          break;
      }
      showSnackbar('Action completed successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to perform action', 'error');
    }

    handleMenuClose();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getFilteredTodos = (status: TodoStatus) => {
    return state.todos
      .filter(todo => 
        todo.status === status &&
        (searchQuery === '' || todo.text.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (state.filter.priority === 'all' || todo.priority === state.filter.priority) &&
        (state.filter.category === 'all' || todo.category === state.filter.category) &&
        (!state.filter.showArchived || todo.isArchived) &&
        (!state.filter.showStarred || todo.isStarred)
      )
      .sort((a, b) => {
        const field = state.sort.field;
        const direction = state.sort.direction;
        const aValue = a[field];
        const bValue = b[field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return direction === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
  };

  const renderTodoCard = (todo: Todo) => {
    const progress = todo.subTasks.length > 0
      ? (todo.subTasks.filter(st => st.completed).length / todo.subTasks.length) * 100
      : todo.completed ? 100 : 0;

    // Handler for status change
    const handleStatusChange = (event: SelectChangeEvent<TodoStatus>) => {
      const newStatus = event.target.value as TodoStatus;
      if (newStatus === todo.status) return;
      const updateStatus = async () => {
        try {
          await axios.patch(
            `${API_BASE_URL}/api/todos/${todo.id}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dispatch({
            type: 'UPDATE_TODO',
            payload: {
              id: todo.id,
              updates: {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
              },
            },
          });
          showSnackbar('Todo status updated successfully', 'success');
        } catch (err) {
          showSnackbar('Failed to update todo status', 'error');
        }
      };
      updateStatus();
    };

    return (
      <Card
        key={todo.id}
        sx={{
          mb: 1,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
          },
          opacity: activeId === todo.id ? 0.5 : 1,
        }}
        onClick={() => setSelectedTodo(todo)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {todo.text}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, todo.id);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {todo.priority && (
              <Chip
                size="small"
                label={todo.priority}
                color={
                  todo.priority === 'high'
                    ? 'error'
                    : todo.priority === 'medium'
                    ? 'warning'
                    : 'success'
                }
              />
            )}
            {todo.category && (
              <Chip size="small" label={todo.category} variant="outlined" />
            )}
          </Stack>

          {todo.subTasks.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 4, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Stack direction="row" spacing={1}>
              {todo.dueDate && (
                <Tooltip title={`Due: ${format(new Date(todo.dueDate), 'PPP')}`}>
                  <ScheduleIcon fontSize="small" color="action" />
                </Tooltip>
              )}
              {todo.timeEntries.length > 0 && (
                <Tooltip title={`${todo.timeEntries.length} time entries`}>
                  <AccessTimeIcon fontSize="small" color="action" />
                </Tooltip>
              )}
              {todo.comments.length > 0 && (
                <Tooltip title={`${todo.comments.length} comments`}>
                  <CommentIcon fontSize="small" color="action" />
                </Tooltip>
              )}
              {todo.attachments.length > 0 && (
                <Tooltip title={`${todo.attachments.length} attachments`}>
                  <AttachFileIcon fontSize="small" color="action" />
                </Tooltip>
              )}
            </Stack>
            {todo.isStarred ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" color="action" />
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Select
              size="small"
              value={todo.status}
              onChange={handleStatusChange}
              fullWidth
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDialogOpen(true)}
        >
          Filter
        </Button>
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={() => setSortDialogOpen(true)}
        >
          Sort
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {columns.map((column) => (
            <DroppableColumn id={column.id} key={column.id} style={{ height: '100%' }}>
              <Paper
                id={column.id}
                sx={{
                  width: 300,
                  p: 2,
                  backgroundColor: 'background.default',
                  minHeight: 400,
                  border: draggedTodo && draggedTodo.status !== column.id ? '2px dashed #aaa' : undefined,
                  transition: 'border 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{column.title}</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewTodo(prev => ({ ...prev, status: column.id }));
                      setCreateDialogOpen(true);
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <SortableContext
                  items={getFilteredTodos(column.id).map(todo => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {getFilteredTodos(column.id).map((todo) => (
                    <div key={todo.id} id={todo.id}>
                      <div
                        style={{
                          opacity: activeId === todo.id ? 0.5 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        {renderTodoCard(todo)}
                      </div>
                    </div>
                  ))}
                </SortableContext>
              </Paper>
            </DroppableColumn>
          ))}
        </Box>
        <DragOverlay>
          {draggedTodo ? renderTodoCard(draggedTodo) : null}
        </DragOverlay>
      </DndContext>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleTodoAction('star')}>
          <ListItemIcon>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Star/Unstar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleTodoAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive/Unarchive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleTodoAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {selectedTodo && (
        <TodoDetails
          todo={selectedTodo}
          open={Boolean(selectedTodo)}
          onClose={() => setSelectedTodo(null)}
        />
      )}

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={state.filter}
        onFilterChange={(filters) => {
          dispatch({ type: 'SET_FILTER', payload: filters });
          setFilterDialogOpen(false);
        }}
      />

      <SortDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        sort={state.sort}
        onSortChange={(sort) => {
          dispatch({ type: 'SET_SORT', payload: sort });
          setSortDialogOpen(false);
        }}
      />

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Todo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={newTodo.text}
              onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={newTodo.description}
              onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTodo.priority}
                label="Priority"
                onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as Priority }))}
              >
                <MuiMenuItem value="high">High</MuiMenuItem>
                <MuiMenuItem value="medium">Medium</MuiMenuItem>
                <MuiMenuItem value="low">Low</MuiMenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTodo.category}
                label="Category"
                onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value as Category }))}
              >
                <MuiMenuItem value="work">Work</MuiMenuItem>
                <MuiMenuItem value="personal">Personal</MuiMenuItem>
                <MuiMenuItem value="shopping">Shopping</MuiMenuItem>
                <MuiMenuItem value="health">Health</MuiMenuItem>
                <MuiMenuItem value="other">Other</MuiMenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTodo}
            variant="contained"
            disabled={!newTodo.text.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanView; 