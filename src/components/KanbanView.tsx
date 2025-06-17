import React, { useState } from 'react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTodo } from '../context/TodoContext';
import { Todo, TodoStatus } from '../types/todo';
import { format } from 'date-fns';
import TodoDetails from './TodoDetails';

const KanbanView: React.FC = () => {
  const { state, dispatch } = useTodo();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTodoId, setMenuTodoId] = useState<string | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

    setActiveId(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, todoId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTodoId(todoId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuTodoId(null);
  };

  const handleTodoAction = (action: string) => {
    if (!menuTodoId) return;

    switch (action) {
      case 'star':
        dispatch({ type: 'TOGGLE_STAR', payload: menuTodoId });
        break;
      case 'archive':
        dispatch({ type: 'TOGGLE_ARCHIVE', payload: menuTodoId });
        break;
      case 'delete':
        dispatch({ type: 'DELETE_TODO', payload: menuTodoId });
        break;
    }

    handleMenuClose();
  };

  const getTodosByStatus = (status: TodoStatus) => {
    return state.todos.filter((todo) => todo.status === status);
  };

  const renderTodoCard = (todo: Todo) => {
    const progress = todo.subTasks.length > 0
      ? (todo.subTasks.filter(st => st.completed).length / todo.subTasks.length) * 100
      : todo.completed ? 100 : 0;

    return (
      <Card
        key={todo.id}
        sx={{
          mb: 1,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
          },
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
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {columns.map((column) => (
            <Paper
              key={column.id}
              sx={{
                flex: 1,
                p: 2,
                minHeight: 500,
                backgroundColor: 'background.default',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {column.title} ({getTodosByStatus(column.id).length})
              </Typography>
              <Box>
                {getTodosByStatus(column.id).map((todo) => renderTodoCard(todo))}
              </Box>
            </Paper>
          ))}
        </Box>

        <DragOverlay>
          {activeId ? (
            <Card sx={{ width: 300, opacity: 0.8 }}>
              <CardContent>
                <Typography variant="subtitle1">
                  {state.todos.find((todo) => todo.id === activeId)?.text}
                </Typography>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleTodoAction('star')}>
          <ListItemIcon>
            {state.todos.find((todo) => todo.id === menuTodoId)?.isStarred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {state.todos.find((todo) => todo.id === menuTodoId)?.isStarred
              ? 'Unstar'
              : 'Star'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleTodoAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleTodoAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
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
    </Box>
  );
};

export default KanbanView; 