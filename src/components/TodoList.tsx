import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Box,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';

const TodoList: React.FC = () => {
  const { state, dispatch } = useTodo();
  const theme = useTheme();

  const handleToggle = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  const handleStar = (id: string) => {
    dispatch({ type: 'TOGGLE_STAR', payload: id });
  };

  const handleArchive = (id: string) => {
    dispatch({ type: 'TOGGLE_ARCHIVE', payload: id });
  };

  return (
    <List>
      {state.todos.map(todo => (
        <ListItem
          key={todo.id}
          sx={{
            mb: 1,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <Checkbox
            edge="start"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id)}
          />
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed
                      ? theme.palette.text.secondary
                      : theme.palette.text.primary,
                  }}
                >
                  {todo.text}
                </Typography>
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
                <Chip size="small" label={todo.category} color="primary" />
                {todo.tags.map(tag => (
                  <Chip
                    key={tag}
                    size="small"
                    label={tag}
                    variant="outlined"
                  />
                ))}
              </Box>
            }
            secondary={
              todo.dueDate && (
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </Typography>
              )
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title={todo.isStarred ? 'Unstar' : 'Star'}>
              <IconButton
                edge="end"
                onClick={() => handleStar(todo.id)}
                sx={{ mr: 1 }}
              >
                {todo.isStarred ? (
                  <StarIcon sx={{ color: theme.palette.warning.main }} />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={todo.isArchived ? 'Unarchive' : 'Archive'}>
              <IconButton
                edge="end"
                onClick={() => handleArchive(todo.id)}
                sx={{ mr: 1 }}
              >
                {todo.isArchived ? <RestoreIcon /> : <ArchiveIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton edge="end" onClick={() => handleDelete(todo.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default TodoList; 